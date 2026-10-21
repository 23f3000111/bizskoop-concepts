// Clicks through the shared interactive pieces on one built page and fails if any of them misbehaves:
// consultation form (errors, then the WhatsApp hand-off), chat (greeting, chip, typed question, fallback),
// review / authority / industry pop-ups, FAQ accordion and the FAQ page search.
// usage: node tools/interact.js [a|b]
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright'));

const ROOT = path.join(__dirname, '..');
const DIR = { a: 'site-a-clear-path', b: 'site-b-gateway' }[process.argv[2] || 'a'];
const url = (f) => pathToFileURL(path.join(ROOT, DIR, f)).href;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const fails = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const check = async (name, fn) => { try { await fn(); console.log('ok   ' + name); } catch (e) { fails.push(name); console.log('FAIL ' + name + ': ' + e.message.split('\n')[0]); } };
  const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

  await page.goto(url('index.html'), { waitUntil: 'load' });
  await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  // marquees never stop moving, which Playwright reads as an unstable target; a visitor's hover pauses them
  await page.addStyleTag({ content: '.marquee__track { animation: none !important; }' });
  await page.waitForTimeout(800);

  await check('consult: empty form shows three errors', async () => {
    await page.locator('[data-header] [data-open="consult"]').last().click();
    await page.waitForSelector('#consult-modal.is-open');
    await page.click('#consult-modal button[type="submit"]');
    const n = await page.locator('#consult-modal .field__error:not(:empty)').count();
    expect(n === 3, `expected 3 errors, got ${n}`);
  });
  await check('consult: valid form opens WhatsApp with the details', async () => {
    await page.fill('#c-name', 'Aisha Rahman');
    await page.fill('#c-email', 'aisha@example.com');
    await page.fill('#c-phone', '12 345 6789');
    await page.click('#consult-modal button[type="submit"]');
    await page.waitForSelector('[data-consult-done]:not([hidden])');
    const opened = await page.evaluate(() => window.__opened[0] || '');
    expect(opened.startsWith('https://wa.me/601124244993?text='), 'WhatsApp link opened: ' + opened.slice(0, 40));
    expect(decodeURIComponent(opened).includes('Aisha Rahman'), 'message carries the name');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    expect(await page.locator('#consult-modal').isHidden(), 'Escape closes the form');
  });
  await check('chat: opens with a greeting and chips', async () => {
    await page.click('[data-chat-launcher]');
    await page.waitForSelector('[data-chat].is-open');
    expect(await page.locator('.bz-msg--bot').count() >= 1, 'greeting');
    expect(await page.locator('.bz-chip').count() === 6, 'six starter chips');
  });
  await check('chat: a chip gets its answer', async () => {
    await page.locator('.bz-chip', { hasText: 'Employment Pass' }).click();
    await page.waitForFunction(() => document.querySelectorAll('.bz-msg--bot:not(.bz-msg--typing)').length >= 2, null, { timeout: 4000 });
    const last = await page.locator('.bz-msg--bot').last().innerText();
    expect(/ESD/.test(last), 'EP answer mentions ESD');
  });
  await check('chat: typed HTML is shown as text and falls back to WhatsApp', async () => {
    await page.fill('#bz-chat-q', '<b>zzqx</b>');
    await page.press('#bz-chat-q', 'Enter');
    await page.waitForFunction(() => document.querySelectorAll('.bz-msg--bot:not(.bz-msg--typing)').length >= 3, null, { timeout: 4000 });
    const me = await page.locator('.bz-msg--me').last().innerHTML();
    expect(me.includes('&lt;b&gt;'), 'visitor text escaped');
    expect(await page.locator('.bz-msg--bot').last().locator('.bz-msg__link--wa').count() === 1, 'WhatsApp hand-off shown');
    await page.click('[data-chat-launcher]');
  });
  await check('pop-ups: review, authority and industry', async () => {
    for (const sel of ['[data-review="pak-venture"]', '[data-authority="ssm"]', '[data-industry="tech"]']) {
      const el = page.locator(sel).first();
      if (!(await el.count())) continue;
      await el.scrollIntoViewIfNeeded();
      await el.click();
      await page.waitForSelector('#info-modal.is-open');
      expect((await page.locator('#info-title').innerText()).length > 2, 'title for ' + sel);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(350);
    }
  });
  await check('consultation opened from a pop-up replaces the pop-up', async () => {
    await page.goto(url('services.html'), { waitUntil: 'load' });
    await page.addStyleTag({ content: '.marquee__track { animation: none !important; }' });
    await page.evaluate(() => { window.open = () => null; });
    const el = page.locator('[data-industry="tech"]').first();
    await el.scrollIntoViewIfNeeded();
    await el.click();
    await page.waitForSelector('#info-modal.is-open');
    await page.locator('#info-modal [data-open="consult"]').click();
    await page.waitForSelector('#consult-modal.is-open');
    await page.waitForTimeout(400);
    expect(await page.locator('#info-modal').isHidden(), 'the pop-up closed');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    expect(!(await page.locator('.bz-modal.is-open').count()), 'nothing left open');
    await page.goto(url('index.html'), { waitUntil: 'load' });
  });
  await check('FAQ accordion opens and closes', async () => {
    const btn = page.locator('[data-accordion] [data-acc-btn]').nth(1);
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    expect(await btn.getAttribute('aria-expanded') === 'true', 'opened');
    await btn.click();
    expect(await btn.getAttribute('aria-expanded') === 'false', 'closed');
  });
  await check('FAQ page search narrows the list and shows the empty state', async () => {
    await page.goto(url('faq.html'), { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.fill('[data-faq-search]', 'employment pass');
    const visible = await page.locator('[data-faq-id]:visible').count();
    expect(visible > 0 && visible < 20, `filtered to ${visible}`);
    await page.fill('[data-faq-search]', 'zzqxv');
    expect(await page.locator('[data-faq-empty]').isVisible(), 'empty state');
  });
  if (errors.length) { fails.push('errors'); console.log('FAIL console/page errors:\n  ' + [...new Set(errors)].join('\n  ')); }
  await browser.close();
  console.log(fails.length ? `\n${fails.length} failed` : '\nall interactions work');
  process.exit(fails.length ? 1 : 0);
})();
