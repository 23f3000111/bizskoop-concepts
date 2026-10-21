// Deletes library photos a concept never uses (not in its built pages and not in data.js), so each site ships only its own.
// Run from the project root after tools/pages.js: node tools/prune.js   (tools/assets.py photos brings them all back)
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SITES = ['site-a-clear-path', 'site-b-gateway'];
const dataJs = fs.readFileSync(path.join(ROOT, 'shared', 'js', 'data.js'), 'utf8');

for (const site of SITES) {
  const dir = path.join(ROOT, site);
  const html = fs.readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const photos = path.join(dir, 'assets', 'img', 'photos');
  const removed = [];
  for (const f of fs.readdirSync(photos)) {
    const name = f.replace(/\.webp$/, '');
    if (html.includes(`photos/${f}`) || dataJs.includes(`'${name}'`)) continue;
    fs.unlinkSync(path.join(photos, f));
    removed.push(name);
  }
  console.log(`${site}: removed ${removed.length}${removed.length ? ` (${removed.join(', ')})` : ''}`);
}
