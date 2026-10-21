// Copies the shared scripts and styles into each self-contained concept folder.
// Edit shared/js/* or shared/css/*, then run from the project root: node tools/sync.js
//   shared/js/<file>  ->  <site>/assets/js/<file>
//   shared/css/<file> ->  <site>/assets/css/<file>
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SHARED = path.join(ROOT, 'shared');
const SITE_DIRS = ['site-a-clear-path', 'site-b-gateway'];

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

// Where a shared file lands inside one site folder.
function target(siteDir, from) {
  const rel = path.relative(SHARED, from).split(path.sep);
  return path.join(ROOT, siteDir, 'assets', ...rel);
}

function sync() {
  const done = [];
  for (const from of [...files(path.join(SHARED, 'js')), ...files(path.join(SHARED, 'css'))]) {
    for (const site of SITE_DIRS) {
      const to = target(site, from);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      done.push(path.relative(ROOT, to));
    }
  }
  return done;
}

module.exports = { SITE_DIRS, target, sync };
if (require.main === module) console.log(sync().join('\n'));
