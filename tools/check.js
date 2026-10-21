// Opens every built page of both concepts from file:// and fails on what a visitor would notice:
// console or page errors, missing local files, broken images, sideways scrolling, revealed content left hidden.
// usage: node tools/check.js [--sites a,b] [--pages index,about] [--sizes 1366x630,1440x900] [--reduced]
//                            [--shots DIR] [--scroll]   (--scroll saves viewport shots while scrolling down)
//                            [--base https://23f3000111.github.io/bizskoop-concepts]   (checks the published copy instead)
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright'));

const ROOT = path.join(__dirname, '..');
const DIRS = { a: 'site-a-clear-path', b: 'site-b-gateway' };
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i < 0 ? def : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const sites = String(arg('sites', 'a,b')).split(',');
const only = arg('pages', null);
const sizes = String(arg('sizes', '1366x630,1440x900,1920x1080')).split(',').map((s) => s.split('x').map(Number));
const reduced = !!arg('reduced', false);
const shots = arg('shots', null);
const scrollShots = !!arg('scroll', false);
const base = arg('base', null);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  let failures = 0;
  for (const key of sites) {
    const dir = path.join(ROOT, DIRS[key]);
    if (!fs.existsSync(dir)) continue;
    const pages = fs.readdirSync(dir).filter((f) => f.endsWith('.html')).filter((f) => !only || String(only).split(',').includes(f.replace('.html', '')));
    for (const [w, h] of sizes) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
      for (const file of pages) {
        const page = await ctx.newPage();
        const problems = [];
        page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
        page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
        page.on('requestfailed', (r) => { if (r.url().startsWith('file:') || (base && r.url().startsWith(base))) problems.push('missing: ' + r.url().replace(pathToFileURL(ROOT).href, '')); });
        page.on('response', (r) => { if (base && r.url().startsWith(base) && r.status() >= 400) problems.push(`missing (${r.status()}): ${r.url().slice(base.length)}`); });
        await page.goto(base ? `${base}/${DIRS[key]}/${file}` : pathToFileURL(path.join(dir, file)).href, { waitUntil: 'load' });
        await page.waitForTimeout(900);
        const name = `${key}-${file.replace('.html', '')}-${w}x${h}`;
        // scroll through like a visitor so reveals, counters and pinned scenes run
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        let n = 0;
        for (let y = 0; y < total + h; y += Math.round(h * 0.8)) {
          await page.mouse.wheel(0, Math.round(h * 0.8));
          await page.waitForTimeout(scrollShots ? 700 : 160);
          if (shots && scrollShots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, `${name}-s${String(n++).padStart(2, '0')}.png`) }); }
        }
        await page.waitForTimeout(600);
        const report = await page.evaluate(() => {
          const out = [];
          const sw = document.documentElement.scrollWidth;
          if (sw > window.innerWidth + 1) out.push(`overflow: page is ${sw}px wide in a ${window.innerWidth}px window`);
          document.querySelectorAll('img').forEach((img) => { if (img.complete && img.naturalWidth === 0 && !img.closest('[hidden]')) out.push('broken image: ' + img.getAttribute('src')); });
          document.querySelectorAll('[data-reveal], [data-reveal-group] > *').forEach((el) => {
            const cs = getComputedStyle(el);
            if (parseFloat(cs.opacity) < 0.99 && el.getClientRects().length) out.push('still hidden: ' + (el.className || el.tagName));
          });
          const h1 = document.querySelectorAll('h1').length;
          if (h1 !== 1) out.push(`h1 count: ${h1}`);
          return out;
        });
        problems.push(...report);
        if (shots && !scrollShots) {
          fs.mkdirSync(shots, { recursive: true });
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(shots, name + '.png') });
        }
        const unique = [...new Set(problems)];
        if (unique.length) { failures += unique.length; console.log(`FAIL ${name}\n  ${unique.slice(0, 12).join('\n  ')}`); }
        else console.log(`ok   ${name}`);
        await page.close();
      }
      await ctx.close();
    }
  }
  await browser.close();
  console.log(failures ? `\n${failures} problem(s)` : '\nall clean');
  process.exit(failures ? 1 : 0);
})();
