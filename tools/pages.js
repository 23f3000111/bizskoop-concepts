// Static page generator for both concepts:
//   src/<site>/layout.html + src/shared/partials + src/<site>/partials + src/<site>/pages/*.html
//   + src/<site>/render.js directives + shared/js/data.js  ->  <site folder>/*.html
// Edit the files in src/ (never the generated pages), then run from the project root: node tools/pages.js
//
// Page files start with a JSON comment:
//   <!--{"title": "...", "description": "...", "bodyClass": "...", "nav": "services", "scripts": ["a"],
//        "each": "services", "file": "{slug}.html"}-->
// Template syntax: {{> partial}}  {{content}}  {{scripts}}  {{metaKey}}  {{item.field}}  {{@directive arg ...}}
// "each": "services" renders the page once per service, with that service as `item`.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SITES = { 'site-a': 'site-a-clear-path', 'site-b': 'site-b-gateway' };
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

function parsePage(raw) {
  const m = raw.match(/^\s*<!--(\{[\s\S]*?\})-->\s*/);
  return { meta: m ? JSON.parse(m[1]) : {}, body: m ? raw.slice(m[0].length) : raw };
}

function render({ layout, partials, page, file, fns, data, item = null, site }) {
  const base = file.replace(/\.html$/, '');
  const meta = Object.assign({ page: base, nav: base }, page.meta);
  let html = layout.replace('{{content}}', () => page.body);
  for (let depth = 0; depth < 6 && /\{\{>\s*[\w-]+\s*\}\}/.test(html); depth++) {
    html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, p) => {
      if (!(p in partials)) throw new Error('Unknown partial: ' + p);
      return partials[p];
    });
  }
  const scripts = (meta.scripts || []).map((s) => `<script defer src="assets/js/${s}.js?v=2"></script>`).join('\n');
  html = html.replace('{{scripts}}', () => scripts);
  html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => esc(meta[k]));
  html = html.replace(/\{\{item\.([\w.]+)\}\}/g, (_, k) => esc(pick(item, k)));
  html = html.replace(/\{\{@([\w-]+)((?:\s+[^\s}]+)*)\s*\}\}/g, (_, name, args) => {
    if (typeof fns[name] !== 'function') throw new Error('Unknown directive: ' + name);
    return fns[name]({ data, item, site, meta }, ...args.trim().split(/\s+/).filter(Boolean));
  });
  return html.replace(new RegExp(`data-nav="${meta.nav}"`, 'g'), `data-nav="${meta.nav}" aria-current="page"`);
}

function outputs(page, file, data) {
  if (!page.meta.each) return [{ name: file, item: null }];
  const list = data[page.meta.each];
  if (!Array.isArray(list)) throw new Error(`"each": "${page.meta.each}" is not a list in data`);
  return list.map((item) => ({ name: page.meta.file.replace(/\{(\w+)\}/g, (_, k) => item[k]), item }));
}

function readPartials(dir, into) {
  if (!fs.existsSync(dir)) return into;
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) into[f.slice(0, -5)] = fs.readFileSync(path.join(dir, f), 'utf8');
  return into;
}

function load(key) {
  const base = path.join(ROOT, 'src', key);
  const partials = readPartials(path.join(base, 'partials'), readPartials(path.join(ROOT, 'src', 'shared', 'partials'), {}));
  const fnsFile = path.join(base, 'render.js');
  const dataFile = path.join(ROOT, 'shared', 'js', 'data.js');
  delete require.cache[fnsFile];
  delete require.cache[dataFile];
  return {
    base,
    partials,
    layout: fs.readFileSync(path.join(base, 'layout.html'), 'utf8'),
    fns: fs.existsSync(fnsFile) ? require(fnsFile) : {},
    data: fs.existsSync(dataFile) ? require(dataFile) : {},
  };
}

// Returns [{ name, html }] for one page file (several for "each" pages).
function renderFile(key, file, loaded = load(key)) {
  const page = parsePage(fs.readFileSync(path.join(loaded.base, 'pages', file), 'utf8'));
  return outputs(page, file, loaded.data).map(({ name, item }) => ({
    name,
    html: render({ ...loaded, page, file, item, site: key }),
  }));
}

function build(key) {
  const loaded = load(key);
  const out = [];
  for (const f of fs.readdirSync(path.join(loaded.base, 'pages')).filter((n) => n.endsWith('.html'))) {
    for (const { name, html } of renderFile(key, f, loaded)) {
      const dest = path.join(ROOT, SITES[key], name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, html);
      out.push(path.relative(ROOT, dest));
    }
  }
  return out;
}

module.exports = { SITES, esc, parsePage, render, outputs, renderFile, build };
if (require.main === module) {
  for (const k of Object.keys(SITES)) if (fs.existsSync(path.join(ROOT, 'src', k, 'layout.html'))) console.log(build(k).join('\n'));
}
