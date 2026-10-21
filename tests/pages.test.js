// Generator and sync checks: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const pages = require('../tools/pages.js');
const sync = require('../tools/sync.js');

test('render fills partials, meta, nav state, scripts and directives', () => {
  const html = pages.render({
    layout: '<title>{{title}}</title>{{> nav}}<main>{{content}}</main>{{scripts}}',
    partials: { nav: '<a data-nav="home">H</a><a data-nav="faq">F</a>' },
    page: { meta: { title: 'A & B', nav: 'faq', scripts: ['x'] }, body: '<p>{{@hello world}}</p>' },
    file: 'faq.html',
    fns: { hello: (ctx, w) => `hi ${w} ${ctx.site}` },
    data: {},
    site: 'site-a',
  });
  assert.equal(html, '<title>A &amp; B</title><a data-nav="home">H</a><a data-nav="faq" aria-current="page">F</a>'
    + '<main><p>hi world site-a</p></main><script defer src="assets/js/x.js"></script>');
});

test('render resolves item fields in meta and body, escaped', () => {
  const html = pages.render({
    layout: '<title>{{title}}</title>{{content}}',
    partials: {},
    page: { meta: { title: '{{item.name}} | Bizskoop' }, body: '<h1>{{item.name}}</h1>' },
    file: 'service.html',
    fns: {},
    data: {},
    item: { name: 'Accounting & Tax' },
    site: 'site-b',
  });
  assert.equal(html, '<title>Accounting &amp; Tax | Bizskoop</title><h1>Accounting &amp; Tax</h1>');
});

test('render throws on an unknown partial or directive', () => {
  const base = { layout: '{{content}}', partials: {}, file: 'x.html', fns: {}, data: {}, site: 'site-a' };
  assert.throws(() => pages.render({ ...base, page: { meta: {}, body: '{{> missing}}' } }), /Unknown partial: missing/);
  assert.throws(() => pages.render({ ...base, page: { meta: {}, body: '{{@nope}}' } }), /Unknown directive: nope/);
});

test('outputs gives one file per service for "each" pages and one file otherwise', () => {
  const data = { services: [{ slug: 'company-secretarial' }, { slug: 'accounting-tax' }] };
  const each = pages.outputs({ meta: { each: 'services', file: '{slug}.html' } }, 'service.html', data);
  assert.deepEqual(each.map((o) => o.name), ['company-secretarial.html', 'accounting-tax.html']);
  assert.equal(each[1].item, data.services[1]);
  assert.deepEqual(pages.outputs({ meta: {} }, 'about.html', data), [{ name: 'about.html', item: null }]);
});

test('shared scripts and styles are in sync in both sites', () => {
  const shared = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p); else shared.push(p);
    }
  };
  walk(path.join(ROOT, 'shared', 'js'));
  walk(path.join(ROOT, 'shared', 'css'));
  assert.ok(shared.length >= 4, 'shared files exist');
  for (const site of Object.values(pages.SITES)) {
    for (const from of shared) {
      const to = sync.target(site, from);
      assert.ok(fs.existsSync(to), `${path.relative(ROOT, to)} exists`);
      assert.ok(fs.readFileSync(to).equals(fs.readFileSync(from)), `${path.relative(ROOT, to)} matches shared`);
    }
  }
});

// ---------------- built pages ----------------
const data = require('../shared/js/data.js');
const SITE_DIRS = Object.values(pages.SITES);
const builtPages = (dir) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.html'));
const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');

test('both sites have every page, including one per service', () => {
  for (const dir of SITE_DIRS) {
    const files = builtPages(dir);
    for (const f of ['index.html', 'services.html', 'about.html', 'faq.html', 'contact.html', ...data.services.map((s) => s.slug + '.html')]) {
      assert.ok(files.includes(f), `${dir}/${f}`);
    }
  }
});

test('every built page has one h1, noindex and no module scripts', () => {
  for (const dir of SITE_DIRS) {
    for (const f of builtPages(dir)) {
      const html = fs.readFileSync(path.join(ROOT, dir, f), 'utf8');
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${dir}/${f} has one h1`);
      assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), `${dir}/${f} noindex`);
      assert.ok(!/type="module"/.test(html), `${dir}/${f} no ES modules`);
      assert.ok(!/\{\{|\}\}/.test(html), `${dir}/${f} no template leftovers`);
    }
  }
});

test('every local link and asset in the built pages resolves', () => {
  for (const dir of SITE_DIRS) {
    for (const f of builtPages(dir)) {
      const html = fs.readFileSync(path.join(ROOT, dir, f), 'utf8');
      for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(ref)) continue;
        const file = ref.split(/[?#]/)[0];
        assert.ok(fs.existsSync(path.join(ROOT, dir, file)), `${dir}/${f} -> ${ref}`);
      }
    }
  }
});

test('no em or en dashes in any visible copy', () => {
  for (const dir of SITE_DIRS) {
    for (const f of builtPages(dir)) {
      const text = visibleText(fs.readFileSync(path.join(ROOT, dir, f), 'utf8'));
      const m = text.match(/.{0,30}[–—].{0,30}/);
      assert.ok(!m, `${dir}/${f}: ${m && m[0]}`);
    }
  }
});

test('our own scripts never fetch local files', () => {
  for (const dir of SITE_DIRS) {
    const js = path.join(ROOT, dir, 'assets', 'js');
    for (const f of fs.readdirSync(js).filter((n) => n.endsWith('.js'))) {
      assert.ok(!/\bfetch\(|^\s*import\s|^\s*export\s/m.test(fs.readFileSync(path.join(js, f), 'utf8')), `${dir}/assets/js/${f}`);
    }
  }
});

test('the chooser links to both concepts and every file it uses exists', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(html.includes('href="site-a-clear-path/index.html"') && html.includes('href="site-b-gateway/index.html"'), 'links to both concepts');
  assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), 'noindex');
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#)/.test(ref)) continue;
    assert.ok(fs.existsSync(path.join(ROOT, ref.split(/[?#]/)[0])), `chooser -> ${ref}`);
  }
});
