// Pure helpers in shared/js/core.js: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');

const BZ = require('../shared/js/core.js');
const data = require('../shared/js/data.js');

test('esc escapes HTML so visitor text is never parsed', () => {
  assert.equal(BZ.esc('<b>"x" & y</b>'), '&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;');
  assert.equal(BZ.esc(null), '');
});

test('waLink and mailLink encode their text', () => {
  assert.equal(BZ.waLink('Hi there'), 'https://wa.me/601124244993?text=Hi%20there');
  assert.equal(BZ.mailLink('Subject x', 'Line 1\nLine 2'), 'mailto:hello@bizskoop.com?subject=Subject%20x&body=Line%201%0ALine%202');
});

test('consultMessage carries every field the visitor filled in', () => {
  const msg = BZ.consultMessage({ name: 'Aisha Rahman', email: 'aisha@example.com', code: '+60', phone: '12 345 6789', service: 'Company Incorporation (Sdn. Bhd. / LLP)', message: 'Need an EP too' });
  assert.match(msg, /^Hi Bizskoop, I would like a free consultation\./);
  for (const part of ['Name: Aisha Rahman', 'Email: aisha@example.com', 'Phone: +60 12 345 6789', 'Service: Company Incorporation (Sdn. Bhd. / LLP)', 'Message: Need an EP too']) {
    assert.ok(msg.includes(part), part);
  }
  assert.ok(!BZ.consultMessage({ name: 'A B', email: 'a@b.co', code: '+60', phone: '123456789' }).includes('Message:'), 'empty message left out');
});

test('validateConsult rejects a missing name, a bad e-mail and a short phone', () => {
  const bad = BZ.validateConsult({ name: ' ', email: 'a@b', phone: '12345' });
  assert.equal(bad.ok, false);
  assert.deepEqual(Object.keys(bad.errors).sort(), ['email', 'name', 'phone']);
  assert.equal(BZ.validateConsult({ name: 'Aisha', email: 'aisha@example.com', phone: '012-345 6789' }).ok, true);
});

test('normalize lowercases and strips punctuation', () => {
  assert.equal(BZ.normalize('What’s the EP?  Paid-up capital & 100%!'), 'whats the ep paid up capital and 100%');
});

test('searchFaq ranks the best match first and returns all for an empty query', () => {
  assert.equal(BZ.searchFaq('employment pass', data.faqs)[0].id, 'ep');
  assert.equal(BZ.searchFaq('how long to register', data.faqs)[0].id, 'incorporation-time');
  assert.equal(BZ.searchFaq('', data.faqs).length, data.faqs.length);
  assert.equal(BZ.searchFaq('zzqx', data.faqs).length, 0);
});

test('chatReply picks the specific intent for real questions', () => {
  const pick = (q) => BZ.chatReply(q, data.chat).id;
  assert.equal(pick('how long to register a company'), 'incorporation-time');
  assert.equal(pick('Can a foreigner own a company in Malaysia?'), 'foreigner');
  assert.equal(pick('Do I need a WRT licence?'), 'wrt');
  assert.equal(pick('How long does a MOTAC licence take?'), 'motac');
  assert.equal(pick('Do I need JTKSM approval?'), 'ep-before');
  assert.equal(pick('Can you renew my Employment Pass?'), 'renewal');
  assert.equal(pick('Can you help with MD Status?'), 'md-status');
  assert.equal(pick('Is the consultation free?'), 'fees');
  assert.equal(pick('How much does incorporation cost?'), 'cost');
  assert.equal(pick('Where is your office?'), 'contact');
});

test('chatReply ignores blank input and falls back to WhatsApp with the question', () => {
  assert.equal(BZ.chatReply('   ', data.chat), null);
  const r = BZ.chatReply('qwerty zxcv <script>', data.chat);
  assert.equal(r.fallback, true);
  assert.equal(r.answer, data.chat.fallback);
  assert.ok(r.wa.startsWith('https://wa.me/601124244993?text='));
  assert.ok(r.wa.includes(encodeURIComponent('qwerty zxcv <script>')));
});

test('every question on the wall gets a real answer', () => {
  for (const q of data.questions) {
    const r = BZ.chatReply(q, data.chat);
    assert.ok(r && !r.fallback, `"${q}" is answered`);
  }
});

test('initials, hue and byId', () => {
  assert.equal(BZ.initials('Pak Venture'), 'PV');
  assert.equal(BZ.initials('kanij fatima'), 'KF');
  assert.equal(BZ.initials('GR Travel & Tours'), 'GT');
  assert.equal(BZ.initials('Alkhalifa'), 'AL');
  const h = BZ.hue('Pak Venture');
  assert.equal(h, BZ.hue('Pak Venture'));
  assert.ok(h >= 0 && h < 360);
  assert.equal(BZ.byId(data.services, 'accounting-tax').name, 'Accounting & Tax');
  assert.equal(BZ.byId(data.services, 'nope'), undefined);
});
