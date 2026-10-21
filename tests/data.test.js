// Content integrity checks for shared/js/data.js: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');

const data = require('../shared/js/data.js');

const ids = (list) => list.map((x) => x.id);
const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
};

test('company contact details are the real ones', () => {
  assert.equal(data.company.whatsapp, '601124244993');
  assert.equal(data.company.phone, '+60 11-2424 4993');
  assert.equal(data.company.email, 'hello@bizskoop.com');
  assert.deepEqual(ids(data.company.socials), ['facebook', 'linkedin', 'instagram', 'tiktok']);
  assert.match(data.company.mapEmbed, /^https:\/\/www\.google\.com\/maps\/embed\?pb=/);
});

test('seven services with unique ids and slugs and full content', () => {
  assert.equal(data.services.length, 7);
  assert.equal(new Set(ids(data.services)).size, 7);
  assert.equal(new Set(data.services.map((s) => s.slug)).size, 7);
  for (const s of data.services) {
    for (const k of ['name', 'nav', 'icon', 'image', 'title', 'lead', 'summary']) assert.ok(s[k], `${s.id}.${k}`);
    assert.ok(s.items.length >= 5, `${s.id} has at least 5 items`);
    assert.ok(s.about.length >= 1, `${s.id} has an overview`);
    assert.equal(s.stages.length, 3, `${s.id} has three stages`);
    assert.ok(s.faqs.length >= 2, `${s.id} has FAQs`);
    assert.ok(s.who.length >= 3, `${s.id} says who it is for`);
  }
});

test('every cross-reference resolves', () => {
  const svc = new Set(ids(data.services));
  const auth = new Set(ids(data.authorities));
  const rev = new Set(ids(data.reviews));
  for (const s of data.services) {
    s.authorities.forEach((a) => assert.ok(auth.has(a), `${s.id} -> authority ${a}`));
    s.reviews.forEach((r) => assert.ok(rev.has(r), `${s.id} -> review ${r}`));
  }
  data.authorities.forEach((a) => a.services.forEach((s) => assert.ok(svc.has(s), `${a.id} -> service ${s}`)));
  data.industries.forEach((i) => i.services.forEach((s) => assert.ok(svc.has(s), `${i.id} -> service ${s}`)));
  data.journeys.forEach((j) => assert.ok(svc.has(j.service), `journey ${j.id} -> ${j.service}`));
  data.reviews.filter((r) => r.serviceId).forEach((r) => assert.ok(svc.has(r.serviceId), `review ${r.id} -> ${r.serviceId}`));
  data.chat.intents.filter((i) => i.service).forEach((i) => assert.ok(svc.has(i.service), `intent ${i.id} -> ${i.service}`));
  const intents = new Set(ids(data.chat.intents));
  data.chat.chips.forEach((c) => assert.ok(intents.has(c.intent), `chip ${c.label} -> ${c.intent}`));
  data.chat.intents.forEach((i) => (i.chips || []).forEach((c) => assert.ok(intents.has(c), `intent ${i.id} chip -> ${c}`)));
});

test('reviews, authorities, FAQs and the rest are filled in', () => {
  const full = data.reviews.filter((r) => r.text);
  assert.ok(full.length >= 7, 'at least 7 full review texts');
  assert.ok(data.reviews.length >= 20, 'at least 20 reviewers');
  data.reviews.forEach((r) => assert.ok(r.name && r.service, `review ${r.id}`));
  assert.ok(data.authorities.length >= 20, 'at least 20 authorities');
  data.authorities.forEach((a) => assert.ok(a.short && a.name && a.logo && a.about && a.services.length, `authority ${a.id}`));
  assert.ok(data.faqs.length >= 15, 'at least 15 FAQs');
  const cats = new Set(ids(data.faqCats));
  data.faqs.forEach((f) => assert.ok(f.q && f.a && cats.has(f.cat), `faq ${f.id}`));
  assert.equal(data.industries.length, 10);
  assert.equal(data.process.length, 4);
  assert.equal(data.why.length, 6);
  assert.equal(data.journeys.length, 4);
  assert.ok(data.countries.length >= 12);
  assert.ok(data.compare.length >= 6);
  assert.ok(data.questions.length >= 18);
});

test('no em or en dashes anywhere in the copy', () => {
  for (const s of strings(data)) assert.ok(!/[–—]/.test(s), `dash in: ${s.slice(0, 60)}`);
});

const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const SITES = ['site-a-clear-path', 'site-b-gateway'];

test('every image the content uses exists in both sites', () => {
  const photos = [...data.services.map((s) => s.image), ...data.journeys.map((j) => j.image), ...data.process.map((p) => p.image)];
  for (const site of SITES) {
    const img = (...p) => path.join(ROOT, site, 'assets', 'img', ...p);
    photos.forEach((p) => assert.ok(fs.existsSync(img('photos', p + '.webp')), `${site} photo ${p}`));
    data.authorities.forEach((a) => assert.ok(fs.existsSync(img('logos', a.logo + '.webp')), `${site} logo ${a.logo}`));
    data.countries.forEach((c) => assert.ok(fs.existsSync(img('flags', c.code + '.svg')), `${site} flag ${c.code}`));
    ['logo.png', 'favicon.png'].forEach((f) => assert.ok(fs.existsSync(img(f)), `${site} ${f}`));
  }
});

test('every photo each site ships has its face boxes for face-safe crops', () => {
  const faces = require('../shared/js/faces.js');
  for (const site of SITES) {
    const dir = path.join(ROOT, site, 'assets', 'img', 'photos');
    const names = fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5));
    assert.ok(names.length >= 15, `${site} has its photos`);
    names.forEach((n) => assert.ok(Array.isArray(faces[n]), `${site}: faces entry for ${n}`));
  }
});

test('chat chips have labels and the consultation form knows every service', () => {
  data.chat.intents.forEach((i) => assert.ok(i.label, `label for ${i.id}`));
  assert.equal(data.consultOptions.at(-1), 'Not sure, I need advice');
  data.services.forEach((s) => assert.ok(data.consultOptions[data.consultFor[s.id]], `consult option for ${s.id}`));
});
