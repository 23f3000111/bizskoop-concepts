/* Bizskoop concept sites: pure helpers (no DOM). window.BZ in the browser, module.exports in Node. */
(function (root) {
  const WA = '601124244993';
  const EMAIL = 'hello@bizskoop.com';

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const mailLink = (subject, body) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  function consultMessage({ name, email, code, phone, service, message }) {
    const lines = [
      'Hi Bizskoop, I would like a free consultation.',
      '',
      `Name: ${String(name || '').trim()}`,
      `Email: ${String(email || '').trim()}`,
      `Phone: ${[code, phone].filter(Boolean).join(' ').trim()}`,
      `Service: ${String(service || 'Not sure, I need advice').trim()}`,
    ];
    if (message && String(message).trim()) lines.push(`Message: ${String(message).trim()}`);
    return lines.join('\n');
  }

  function validateConsult({ name, email, phone }) {
    const errors = {};
    if (String(name || '').trim().length < 2) errors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim())) errors.email = 'Please enter a valid e-mail address.';
    if (String(phone || '').replace(/\D/g, '').length < 7) errors.phone = 'Please enter a phone number we can reach you on.';
    return { ok: Object.keys(errors).length === 0, errors };
  }

  const normalize = (s) => String(s == null ? '' : s).toLowerCase()
    .replace(/[’'`]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9%]+/g, ' ').trim();

  const STOP = new Set(['a', 'an', 'the', 'do', 'does', 'you', 'i', 'is', 'are', 'what', 'how', 'can', 'my', 'me', 'to', 'of', 'in', 'for', 'and', 'or', 'with', 'it', 'we', 'our', 'your', 'be', 'on', 'any']);
  const count = (hay, word) => (hay.match(new RegExp(`(^| )${word}( |$)`, 'g')) || []).length;

  // FAQ search: question words weigh 3, answer words 1, the whole phrase in the question adds 5.
  function searchFaq(query, faqs) {
    const q = normalize(query);
    if (!q) return faqs.slice();
    const words = q.split(' ').filter((w) => !STOP.has(w));
    if (!words.length) return faqs.slice();
    return faqs
      .map((f, i) => {
        const fq = normalize(f.q);
        const fa = normalize(f.a);
        let score = words.reduce((s, w) => s + 3 * count(fq, w) + count(fa, w), 0);
        if ((' ' + fq + ' ').includes(' ' + q + ' ')) score += 5;
        return { f, i, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((x) => x.f);
  }

  // Chat: every key phrase found in the question scores its word count; the best intent wins, ties go to list order.
  function chatReply(query, chat) {
    const q = normalize(query);
    if (!q) return null;
    const padded = ` ${q} `;
    let best = null;
    let bestScore = 0;
    for (const intent of chat.intents) {
      const keys = [...new Set(intent.keys.map(normalize))].filter(Boolean);
      const score = keys.reduce((s, k) => (padded.includes(` ${k} `) ? s + k.split(' ').length : s), 0);
      if (score > bestScore) { best = intent; bestScore = score; }
    }
    if (!best) {
      return { id: 'fallback', answer: chat.fallback, chips: ['human', 'consult'], fallback: true, wa: waLink(`Hi Bizskoop, I have a question: ${String(query).trim()}`) };
    }
    return { id: best.id, answer: best.answer, chips: best.chips || [], link: best.link || null, service: best.service || null, action: best.action || null, fallback: false };
  }

  function initials(name) {
    const words = String(name || '').split(/\s+/).filter((w) => /[a-z]/i.test(w));
    if (!words.length) return '?';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function hue(name) {
    let h = 0;
    for (const ch of String(name || '')) h = (h * 31 + ch.codePointAt(0)) % 360;
    return h;
  }

  const byId = (list, id) => (list || []).find((x) => x.id === id);

  const BZ = { esc, waLink, mailLink, consultMessage, validateConsult, normalize, searchFaq, chatReply, initials, hue, byId };
  root.BZ = BZ;
  if (typeof module !== 'undefined' && module.exports) module.exports = BZ;
})(typeof window !== 'undefined' ? window : globalThis);
