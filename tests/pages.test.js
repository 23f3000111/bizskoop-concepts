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
