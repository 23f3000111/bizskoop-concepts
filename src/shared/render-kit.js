// Small HTML helpers shared by both concepts' render.js files (build time, Node).
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const byId = (list, id) => list.find((x) => x.id === id);
const svcHref = (s) => `${s.slug}.html`;

const ALT = {
  'hero-team': 'A team of colleagues meeting around a table in a bright office',
  'team-meeting': 'Colleagues discussing documents and a laptop at a meeting table',
  'team-standing': 'A business team talking together in a modern office',
  'team-suits': 'A team of young Malaysian professionals in suits around a laptop',
  'team-classic': 'Three colleagues in suits reviewing papers at a table',
  'consult-desk': 'A consultant and a client talking across a desk in a bright office',
  'consult-laptop': 'Two colleagues looking at a laptop together',
  'consult-pair': 'Colleagues working together at a laptop',
  'p-asian-suit': 'A businessman in a blue suit',
  'p-hijab-glasses': 'A professional woman in a hijab and glasses at her laptop',
  'p-hijab-laptop': 'A smiling woman in a hijab working on a laptop',
  'p-hijab-standing': 'A woman in a hijab holding a laptop',
  'p-hijab-office': 'A woman in a hijab reading in an office',
  'p-hijab-pink': 'A woman in a pink hijab seated in an office',
  'p-indian-woman-sofa': 'A businesswoman in a beige blazer in an office lounge',
  'p-indian-woman-navy': 'A businesswoman in a navy blazer with her arms crossed',
  'p-indian-woman-desk': 'A businesswoman at her desk with a laptop',
  'p-indian-man-desk': 'A businessman in a suit at his office desk',
  'p-pakistani-suit': 'A businessman in a dark suit',
  'p-pakistani-shirt': 'A professional man in a blue shirt',
  'p-bearded-suit': 'A businessman in a grey suit with his arms crossed',
  'p-caucasian-woman': 'A businesswoman in a navy blazer in an office',
  'p-caucasian-phone': 'A businesswoman checking her phone in an office',
  'p-caucasian-glasses': 'A businesswoman holding a laptop',
  'p-asian-woman-glasses': 'A smiling professional woman with glasses in an office',
  'p-asian-woman-seated': 'A professional woman seated in a modern office',
  'p-asian-woman-blazer': 'A smiling businesswoman in a black blazer',
  'p-chinese-man-window': 'A smiling professional man by an office window',
  'p-chinese-man-desk': 'A professional man seated at a desk',
  'kl-towers-aerial': 'The Petronas Twin Towers and the Kuala Lumpur skyline from above',
  'kl-towers-sky': 'The Petronas Twin Towers under a blue sky',
  'kl-skyline': 'The Kuala Lumpur skyline with the Petronas Twin Towers',
  'kl-skyline-wide': 'A wide view of the Kuala Lumpur skyline',
  'kl-founder': 'A founder working on a laptop with the KL Tower outside the window',
  'kl-towers-blue': 'The Kuala Lumpur skyline on a clear day',
  'docs-signing': 'Signing company documents with a pen',
  'docs-team-signing': 'Colleagues signing documents at a meeting table',
  'docs-handover': 'Two professionals reviewing a document together',
  'passport-stamps': 'An open passport with visa stamps',
  'passport-airport': 'A traveller holding a passport and boarding pass at an airport',
  'passport-tickets': 'Passports and boarding passes in hand',
  'accounts-laptop': 'Accounts on a laptop with a calculator and notes',
  'handshake-office': 'Two businessmen shaking hands in an office',
  'handshake-docs': 'A handshake over signed documents',
  'handshake-clipboard': 'A handshake across a desk with a clipboard',
  'interview-blazer': 'An interview in a modern office',
  'interview-cafe': 'Two professionals talking at a table',
  'airport-couple': 'A couple walking through an airport terminal',
  'airport-mother': 'A mother and her daughter waiting at an airport',
  'plan-board': 'A team planning at a board in a bright office',
  'plan-team': 'A team meeting in a bright office',
  'support-call': 'A consultant on a phone call at her desk',
  'support-call-asian': 'A consultant on a phone call at her desk',
  'sme-owner': 'A restaurant owner standing in his restaurant',
  'sme-barista': 'A café owner preparing coffee',
  'sme-tablet': 'A business owner with a tablet in his office',
  'sme-warehouse': 'A business owner in a warehouse',
};

// <img> for a library photo; pos is the preferred object-position that faces.js keeps faces inside.
function img(name, { alt = ALT[name], cls = '', pos = '', eager = false } = {}) {
  if (alt == null) throw new Error('No alt text for photo ' + name);
  return `<img class="${cls}" src="assets/img/photos/${name}.webp" alt="${esc(alt)}"${pos ? ` data-pos="${pos}"` : ''}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

function hue(name) {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}
function initials(name) {
  const words = String(name || '').split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (!words.length) return '?';
  return words.length === 1 ? words[0].slice(0, 2).toUpperCase() : (words[0][0] + words[1][0]).toUpperCase();
}
const avatar = (name, cls = '') => `<span class="avatar ${cls}" style="--h:${hue(name)}" aria-hidden="true">${esc(initials(name))}</span>`;
const stars = () => `<span class="stars" aria-label="5 out of 5 stars">${icon('star-fill', 'ic ic--star').repeat(5)}</span>`;

// Short version of a review for cards: whole sentences when they fit, otherwise whole words and an ellipsis.
function excerpt(text, max = 190) {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > max) break;
    out += s;
  }
  if (out.trim().length >= max * 0.7) return out.trim();
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…';
}

const waText = encodeURIComponent('Hi Bizskoop, I’m interested in your consultation services.');
const waHref = `https://wa.me/601124244993?text=${waText}`;

module.exports = { esc, icon, byId, svcHref, img, hue, initials, avatar, stars, excerpt, waHref };
