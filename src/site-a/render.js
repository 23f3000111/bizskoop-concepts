// Concept A ("Clear Path") build-time directives: {{@name args}} in src/site-a pages and partials.
const { esc, icon, byId, svcHref, img, avatar, stars, excerpt, waHref } = require('../shared/render-kit.js');

const dot = '<span class="dot" aria-hidden="true"></span>';
const arrowTile = `<span class="btn__tile">${icon('arrow-right')}</span>`;
const svcOf = (data, item) => item || data.services[0];

function socials({ data }, variant = 'footer') {
  return `<ul class="socials socials--${variant}">${data.company.socials.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="Bizskoop on ${s.label}">${icon(s.id)}</a></li>`).join('')}</ul>`;
}

function servicesMenu({ data }) {
  return data.services.map((s) => `<a class="mega__item" href="${svcHref(s)}"><span class="mega__icon">${icon(s.icon)}</span><span class="mega__copy"><strong>${esc(s.name)}</strong><small>${esc(s.tag)}</small></span></a>`).join('');
}

function footerServices({ data }) {
  return data.services.map((s) => `<li><a href="${svcHref(s)}">${esc(s.name)}</a></li>`).join('');
}

/* ---------------- home ---------------- */
function ticker() {
  const items = [
    ['1,000+', 'businesses incorporated'], ['5.0', 'Google rating from 90+ reviews'], ['40+', 'government authorities navigated'],
    ['4 days', 'to one client’s ESD approval'], ['2 working days', 'typical incorporation once documents are complete'],
    ['500+', 'companies served'], ['2,000+', 'individuals assisted'], ['25+', 'industries covered'],
  ];
  return `<div class="ticker marquee" data-marquee style="--marquee-time:70s"><div class="marquee__track"><ul class="marquee__group ticker__group">${items.map(([n, t]) => `<li><strong>${n}</strong>${esc(t)}</li>`).join('')}</ul></div></div>`;
}

function questionWall({ data }) {
  const rows = [[], [], []];
  data.questions.forEach((q, i) => rows[i % 3].push(q));
  return `<div class="qwall">${rows.map((row, r) => `<div class="qwall__row marquee${r % 2 ? ' marquee--reverse' : ''}" data-marquee style="--marquee-time:${58 + r * 8}s"><div class="marquee__track"><ul class="marquee__group">${row.map((q) => `<li><button type="button" class="qchip" data-ask="${esc(q)}">${icon('help')}${esc(q)}</button></li>`).join('')}</ul></div></div>`).join('')}</div>`;
}

function values({ data }) {
  return `<div class="values" data-reveal-group>${data.why.slice(0, 4).map((w) => `<a class="value" href="about.html#why"><span class="value__icon">${icon(w.icon)}</span><h3 class="value__title">${esc(w.title)}</h3><p class="value__text">${esc(w.text)}</p><span class="value__more">Why clients choose us${icon('arrow-right')}</span></a>`).join('')}</div>`;
}

function outcomes({ data }) {
  const ids = ['pak-venture', 'ahsan-riaz', 'atiqur-rahman', 'global-crave'];
  return `<div class="outcomes" data-reveal-group>${ids.map((id) => {
    const r = byId(data.reviews, id);
    return `<button type="button" class="outcome" data-review="${r.id}" data-tilt="4">
      <span class="outcome__top">${icon('google', 'ic ic--google')}${stars()}</span>
      <span class="outcome__big">${esc(r.outcome)}</span>
      <span class="outcome__who">${avatar(r.name)}<span><strong>${esc(r.name)}</strong><small>${esc(r.service)}</small></span></span>
      <span class="outcome__read">Read the review${icon('arrow-up-right')}</span>
    </button>`;
  }).join('')}</div>`;
}

function authorityGrid({ data }) {
  return `<ul class="logos" data-reveal-group>${data.authorities.map((a) => `<li><button type="button" class="logo-tile" data-authority="${a.id}" aria-label="${esc(a.short)}, ${esc(a.name)}"><img src="assets/img/logos/${a.logo}.webp" alt="" loading="lazy" decoding="async"><span class="logo-tile__name">${esc(a.short)}</span></button></li>`).join('')}
    <li class="logos__note"><strong>40+</strong><span>authorities navigated for our clients</span></li>
    <li><button type="button" class="logos__ask" data-ask="Which licences does my shop need?">${icon('help')}<span>Which ones apply to my business?</span></button></li></ul>`;
}

function serviceStack({ data }) {
  return `<div class="stack" data-stack>${data.services.map((s, i) => `
    <article class="stack__card" style="--i:${i}">
      <div class="stack__body">
        <span class="stack__icon">${icon(s.icon)}</span>
        <p class="stack__tag">${esc(s.tag)}</p>
        <h3 class="stack__title"><a class="stretch" href="${svcHref(s)}">${esc(s.name)}</a></h3>
        <p class="stack__text">${esc(s.summary)}</p>
        <ul class="stack__list">${s.items.slice(0, 6).map((it) => `<li>${icon('check')}<span>${esc(it)}</span></li>`).join('')}</ul>
        <div class="stack__actions"><span class="btn btn--primary">View service${arrowTile}</span><button type="button" class="btn btn--ghost lift" data-open="consult" data-service="${s.id}">Ask about this</button></div>
      </div>
      <div class="stack__media">${img(s.image, { cls: 'duo', pos: '50% 40%' })}</div>
    </article>`).join('')}
  </div>`;
}

function industries({ data }) {
  return `<ul class="industries" data-reveal-group>${data.industries.map((i) => `<li><button type="button" class="industry" data-industry="${i.id}"><span class="industry__icon">${icon(i.icon)}</span><span class="industry__name">${esc(i.name)}</span>${icon('arrow-up-right', 'ic industry__go')}</button></li>`).join('')}</ul>`;
}

function processArc({ data }) {
  const angles = [162, 114, 66, 18];
  const node = (deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: ((500 + 440 * Math.cos(r)) / 10).toFixed(2), y: (((500 - 440 * Math.sin(r)) / 520) * 100).toFixed(2) };
  };
  return `<div class="arc" data-arc>
    <div class="arc__stage">
      <svg class="arc__svg" viewBox="0 0 1000 520" aria-hidden="true" preserveAspectRatio="xMidYMax meet"><path class="arc__track" d="M 81.54 364.03 A 440 440 0 0 1 918.46 364.03"/><path class="arc__fill" d="M 81.54 364.03 A 440 440 0 0 1 918.46 364.03" pathLength="1"/></svg>
      <ol class="arc__steps">${data.process.map((p, i) => { const n = node(angles[i]); return `<li class="arc__step${i === 0 ? ' is-active' : ''}" style="left:${n.x}%;top:${n.y}%" data-step="${i}"><span class="arc__node">${i + 1}</span><span class="arc__name">${esc(p.title)}</span></li>`; }).join('')}</ol>
      <div class="arc__center">${data.process.map((p, i) => `<div class="arc__panel${i === 0 ? ' is-active' : ''}" data-panel="${i}"><p class="arc__kicker">Step ${i + 1} of 4</p><h3 class="arc__title">${esc(p.title)}</h3><p class="arc__text">${esc(p.text)}</p></div>`).join('')}</div>
    </div>
  </div>`;
}

function numbers({ data }) {
  const s = (id) => byId(data.stats, id);
  const cards = [
    [s('years'), ['25+ industries covered', 'MIDA and MDEC experts']],
    [s('incorporated'), ['500+ companies served', 'Sdn Bhd and LLP setups']],
    [s('individuals'), ['1,500+ successful cases', 'Passes for families too']],
    [s('authorities'), ['98% client satisfaction', 'ESD Authorised Consultant']],
  ];
  return `<div class="stats" data-reveal-group>${cards.map(([st, sub]) => `<a class="stat" href="about.html#numbers" data-tilt="3"><p class="stat__num"><span data-count="${st.value}">${st.value.toLocaleString('en-US')}</span><span class="stat__suf">${st.suffix}</span></p><p class="stat__label">${esc(st.label)}</p><ul class="stat__sub">${sub.map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul></a>`).join('')}</div>`;
}

function compare({ data }) {
  return `<div class="compare" data-compare data-show="with">
    <div class="compare__toggle" role="group" aria-label="Show the comparison for">
      <button type="button" aria-pressed="false" data-side="alone">On your own</button>
      <button type="button" aria-pressed="true" data-side="with">With Bizskoop</button>
    </div>
    <div class="compare__table" role="table" aria-label="On your own compared with Bizskoop">
      <div class="compare__head" role="row"><span role="columnheader">Topic</span><span role="columnheader" class="compare__alone">On your own</span><span role="columnheader" class="compare__with">With Bizskoop</span></div>
      ${data.compare.map((c) => `<div class="compare__row" role="row"><span class="compare__topic" role="rowheader">${esc(c.topic)}</span><span class="compare__alone" role="cell">${icon('x')}${esc(c.alone)}</span><span class="compare__with" role="cell">${icon('check')}${esc(c.with)}</span></div>`).join('')}
    </div>
  </div>`;
}

function reviewCard(r) {
  return `<button type="button" class="review" data-review="${r.id}">
    <span class="review__top">${stars()}${icon('google', 'ic ic--google')}</span>
    <span class="review__text">“${esc(excerpt(r.text, 210))}”</span>
    <span class="review__who">${avatar(r.name)}<span><strong>${esc(r.name)}</strong><small>${esc(r.service)}</small></span></span>
  </button>`;
}

function flags({ data }) {
  return `<ul class="flags" aria-label="Where our clients come from">${data.countries.map((c) => `<li class="flag" data-name="${esc(c.name)}"><img src="assets/img/flags/${c.code}.svg" alt="${esc(c.name)}" loading="lazy" decoding="async"></li>`).join('')}</ul>`;
}

function trustedGrid({ data }) {
  const full = data.reviews.filter((r) => r.text);
  const tags = data.reviews.filter((r) => !r.text).slice(0, 12);
  const score = `<a class="review review--score" href="${data.company.reviewsUrl}" target="_blank" rel="noopener">
      <span class="review__score">5.0</span>${stars()}<span class="review__note">Average rating from 90+ reviews on Google</span>
      <span class="btn btn--ghost btn--sm">Read all on Google${icon('external')}</span></a>`;
  const mentions = `<div class="review review--tags"><p class="review__kicker">Approvals our clients mention</p><ul>${tags.map((r) => `<li><button type="button" class="tag" data-review="${r.id}">${esc(r.service)}</button></li>`).join('')}</ul></div>`;
  const cards = full.map(reviewCard);
  cards.splice(4, 0, score);
  cards.push(mentions);
  return `<div class="reviews" data-reveal-group>${cards.join('')}</div>`;
}

function trustStrip() {
  const items = [['award', 'MIDA Expert'], ['award', 'MDEC Expert'], ['shield', 'ESD Authorised Consultant'], ['lock', 'Confidential, non-binding consultations']];
  return `<ul class="truststrip">${items.map(([i, t]) => `<li>${icon(i)}<span>${esc(t)}</span></li>`).join('')}</ul>`;
}

function faqItems(list, prefix, openFirst = true) {
  return list.map((f, i) => {
    const id = `${prefix}-${f.id || i}`;
    const open = openFirst && i === 0;
    return `<div class="faq__item${open ? ' is-open' : ''}" data-acc-item${f.id && prefix === 'faqp' ? ` data-faq-id="${f.id}"` : ''}>
      <h3 class="faq__q"><button type="button" data-acc-btn aria-expanded="${open}" aria-controls="${id}" id="${id}-b">${esc(f.q)}<span class="faq__sign">${icon('plus')}</span></button></h3>
      <div class="acc__panel" id="${id}" role="region" aria-labelledby="${id}-b"><div><p>${esc(f.a)}</p></div></div>
    </div>`;
  }).join('');
}

function faqList({ data }, ...ids) {
  const list = ids.length ? ids.map((id) => byId(data.faqs, id)) : data.faqs;
  return `<div class="faq" data-accordion="single">${faqItems(list, 'faq')}</div>`;
}

function faqFull({ data }) {
  return `<div class="faqpage" data-faq>
    <div class="faqpage__tools">
      <label class="search">${icon('search')}<span class="sr-only">Search the questions</span><input type="search" data-faq-search placeholder="Search, for example Employment Pass" autocomplete="off"></label>
      <div class="cats" role="group" aria-label="Filter by topic"><button type="button" class="cat" aria-pressed="true" data-faq-cat="all">All topics</button>${data.faqCats.map((c) => `<button type="button" class="cat" aria-pressed="false" data-faq-cat="${c.id}">${esc(c.name)}</button>`).join('')}</div>
    </div>
    <div class="faq faq--page" data-accordion>${faqItems(data.faqs, 'faqp', false)}</div>
    <div class="faqpage__empty" data-faq-empty hidden>
      <p><strong>No question matches that yet.</strong> Our assistant and consultants can still help.</p>
      <button type="button" class="btn btn--primary" data-faq-ask data-ask="I have a question">Ask the assistant${arrowTile}</button>
    </div>
  </div>`;
}

/* ---------------- shared page parts ---------------- */
function crumbs(ctx, ...words) {
  const label = ctx.item ? ctx.item.name : words.join(' ');
  const mid = ctx.item ? '<li><a href="services.html">Services</a></li>' : '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li>${mid}<li aria-current="page">${esc(label)}</li></ol></nav>`;
}

function closingCta({ data }, photo = 'kl-towers-aerial') {
  return `<section class="section section--tight">
    <div class="wrap">
      <div class="closing" data-reveal>
        <div class="closing__copy">
          <p class="label">${dot}Ready when you are</p>
          <h2 class="h2">Ready to start or expand your business in Malaysia?</h2>
          <p class="lead">Speak to our advisory team today. No commitments and no obligations, just clear guidance for your situation.</p>
          <div class="btns">
            <button type="button" class="btn btn--primary" data-open="consult" data-magnetic>Book a free consultation${arrowTile}</button>
            <a class="btn btn--ghost lift" href="${waHref}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp us</a>
          </div>
          <p class="closing__fine">${icon('lock')}Confidential and non-binding consultation</p>
        </div>
        <div class="closing__media frame" data-tilt="3">${img(photo, { pos: '50% 50%' })}</div>
      </div>
    </div>
  </section>`;
}

/* ---------------- service pages ---------------- */
function svcHero({ data, item }) {
  const s = svcOf(data, item);
  const logos = s.authorities.slice(0, 4).map((id) => byId(data.authorities, id));
  return `<div class="svc-hero__grid">
    <div class="svc-hero__copy">
      <p class="label">${dot}${esc(s.tag)}</p>
      <h1 class="h1 h1--page" data-split>${esc(s.title)}</h1>
      <p class="lead">${esc(s.lead)}</p>
      <div class="btns">
        <button type="button" class="btn btn--primary" data-open="consult" data-service="${s.id}" data-magnetic>Book a free consultation${arrowTile}</button>
        <button type="button" class="btn btn--ghost lift" data-ask="${esc(`Tell me about ${s.name}`)}">${icon('chat')}Ask the assistant</button>
      </div>
      <div class="svc-hero__auth"><span>Authorities involved</span><ul>${logos.map((a) => `<li><button type="button" class="mini-logo" data-authority="${a.id}" aria-label="${esc(a.short)}"><img src="assets/img/logos/${a.logo}.webp" alt=""></button></li>`).join('')}</ul></div>
    </div>
    <div class="svc-hero__media frame frame--tall" data-tilt="3">${img(s.image, { eager: true, pos: '50% 40%' })}</div>
  </div>`;
}

function svcOverview({ data, item }) {
  const s = svcOf(data, item);
  return `<div class="overview">
    <div class="overview__text">${s.about.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <aside class="overview__why"><span class="overview__icon">${icon('shield')}</span><h3>Why it matters</h3><p>${esc(s.why)}</p><button type="button" class="link-btn" data-open="consult" data-service="${s.id}">Talk to a consultant${icon('arrow-right')}</button></aside>
  </div>`;
}

function svcIncludes({ data, item }) {
  const s = svcOf(data, item);
  const cols = { 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5, 11: 4, 12: 4 }[s.items.length] || 3;
  return `<ul class="includes" style="--cols:${cols}" data-reveal-group>${s.items.map((it) => `<li><button type="button" class="include" data-ask="${esc(it)}">${icon('circle-check')}<span>${esc(it)}</span>${icon('chat', 'ic include__ask')}</button></li>`).join('')}</ul>`;
}

function svcStages({ data, item }) {
  const s = svcOf(data, item);
  return `<ol class="stages" data-reveal-group>${s.stages.map((st, i) => `<li class="stage"><span class="stage__num">Stage ${i + 1}</span><h3 class="stage__title">${esc(st.title)}</h3><p class="stage__text">${esc(st.text)}</p><ul>${st.points.map((p) => `<li>${icon('check')}${esc(p)}</li>`).join('')}</ul></li>`).join('')}</ol>`;
}

function svcExtras({ data, item }) {
  const s = svcOf(data, item);
  let out = '';
  if (s.requirements) {
    out += `<section class="section section--ice"><div class="wrap">
      <div class="head head--split"><div><p class="label">${dot}Requirements</p><h2 class="h2">What you need to register a company</h2></div><p class="lead">A quick checklist of the minimum requirements in Malaysia. We check each one with you before anything is filed.</p></div>
      <ul class="reqs" data-reveal-group>${s.requirements.map((r) => `<li class="req" data-tilt="3"><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></li>`).join('')}</ul>
    </div></section>`;
  }
  if (s.licences) {
    out += `<section class="section section--ice"><div class="wrap">
      <div class="head head--split"><div><p class="label">${dot}Licences we handle</p><h2 class="h2">Industry and activity licences, with typical timelines</h2></div><p class="lead">Some sectors are regulated by their own ministry or agency. We prepare the documents, deal with the authority and follow up until the approval is in your hands.</p></div>
      <ul class="licences" data-reveal-group>${s.licences.map((l) => `<li class="licence" data-tilt="3"><span class="licence__auth">${esc(l.authority)}</span><h3>${esc(l.name)}</h3><p>${esc(l.text)}</p><p class="licence__time">${icon('clock')}<span>Typical time</span><strong>${esc(l.time)}</strong></p></li>`).join('')}</ul>
    </div></section>`;
  }
  if (s.docs) {
    out += `<section class="section"><div class="wrap docs">
      <div class="docs__intro"><p class="label">${dot}Premise licence</p><h2 class="h2">What we need from you</h2><p class="lead">For a business premise licence from DBKL or your local council, these are the documents we collect. We handle the council for you.</p><button type="button" class="btn btn--primary" data-open="consult" data-service="${s.id}">Start my premise licence${arrowTile}</button></div>
      <ul class="docs__list" data-reveal-group>${s.docs.map((d) => `<li>${icon('file-check')}<span>${esc(d)}</span></li>`).join('')}</ul>
    </div></section>`;
  }
  return out;
}

function svcWho({ data, item }) {
  const s = svcOf(data, item);
  const icons = ['users', 'rocket', 'briefcase', 'globe'];
  return `<ul class="who" data-reveal-group>${s.who.map((w, i) => `<li class="who__item"><span class="who__icon">${icon(icons[i % 4])}</span><span>${esc(w)}</span></li>`).join('')}</ul>`;
}

function svcAuthorities({ data, item }) {
  const s = svcOf(data, item);
  return `<div class="authrow"><p class="authrow__label">Authorities involved<small>Tap a logo to see what we handle with each one</small></p><ul class="authrow__list">${s.authorities.map((id) => {
    const a = byId(data.authorities, id);
    return `<li><button type="button" class="authchip" data-authority="${a.id}" aria-label="${esc(a.short)}, ${esc(a.name)}"><img src="assets/img/logos/${a.logo}.webp" alt="" loading="lazy"><span>${esc(a.short)}</span></button></li>`;
  }).join('')}</ul></div>`;
}

function svcReviews({ data, item }) {
  const s = svcOf(data, item);
  const list = s.reviews.map((id) => byId(data.reviews, id));
  const own = list.filter((r) => r.text);
  const cards = [...own, ...data.reviews.filter((r) => r.text && !own.includes(r))].slice(0, 3);
  const tags = list.filter((r) => !r.text);
  return `<div class="svc-reviews">
    <div class="reviews reviews--svc" data-reveal-group>${cards.map(reviewCard).join('')}</div>
    ${tags.length ? `<div class="svc-reviews__tags"><p>Also helped with this service</p><ul>${tags.map((r) => `<li><button type="button" class="tag" data-review="${r.id}">${avatar(r.name, 'avatar--xs')}${esc(r.name)}<small>${esc(r.service)}</small></button></li>`).join('')}</ul></div>` : ''}
  </div>`;
}

function svcFaqs({ data, item }) {
  const s = svcOf(data, item);
  return `<div class="faq" data-accordion="single">${faqItems(s.faqs, `faq-${s.id}`)}</div>`;
}

function svcOthers({ data, item }) {
  const s = svcOf(data, item);
  return `<ul class="others" data-reveal-group>${data.services.filter((o) => o.id !== s.id).map((o) => `<li><a class="other" href="${svcHref(o)}"><span class="other__icon">${icon(o.icon)}</span><span class="other__name">${esc(o.name)}</span><span class="other__tag">${esc(o.tag)}</span>${icon('arrow-up-right', 'ic other__go')}</a></li>`).join('')}</ul>`;
}

/* ---------------- about, contact ---------------- */
function aboutNumbers({ data }) {
  const cards = [['companies', 'Companies served'], ['individuals', 'Individuals assisted'], ['industries', 'Industries covered'], ['cases', 'Successful cases']];
  return `<div class="stats stats--four" data-reveal-group>${cards.map(([id, label]) => { const st = byId(data.stats, id); return `<div class="stat stat--plain"><p class="stat__num"><span data-count="${st.value}">${st.value.toLocaleString('en-US')}</span><span class="stat__suf">${st.suffix}</span></p><p class="stat__label">${esc(label)}</p></div>`; }).join('')}</div>`;
}

function workProcess() {
  const steps = [
    ['Understand your requirements', 'We review your business goals, industry and regulatory needs to decide the correct structure and approvals.'],
    ['Plan and prepare the documents', 'Our team prepares and checks every form, submission and supporting document against the compliance standards.'],
    ['Submission and follow-up', 'We submit to the relevant authorities and manage follow-ups, clarifications and approvals on your behalf.'],
    ['Approval and ongoing support', 'Once approved, we guide you on renewals, compliance and next steps to keep your business running smoothly.'],
  ];
  return `<ol class="stages stages--four" data-reveal-group>${steps.map(([t, x], i) => `<li class="stage"><span class="stage__num">Step ${i + 1}</span><h3 class="stage__title">${esc(t)}</h3><p class="stage__text">${esc(x)}</p></li>`).join('')}</ol>`;
}

function whyGrid({ data }) {
  return `<ul class="why" data-reveal-group>${data.why.map((w) => `<li><button type="button" class="why__card" data-ask="${esc(w.title)}" data-tilt="3"><span class="value__icon">${icon(w.icon)}</span><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p><span class="value__more">Ask about this${icon('arrow-right')}</span></button></li>`).join('')}</ul>`;
}

function reviewFeature({ data }) {
  const lead = byId(data.reviews, 'faizan-ali');
  const rest = data.reviews.filter((r) => r.text && r.id !== lead.id);
  return `<div class="feature">
    <figure class="feature__main" data-reveal>
      <div class="feature__top">${icon('google', 'ic ic--google')}${stars()}<span>${esc(lead.when)} on Google</span></div>
      <blockquote>“${esc(lead.text)}”</blockquote>
      <figcaption>${avatar(lead.name, 'avatar--lg')}<span><strong>${esc(lead.name)}</strong><small>${esc(lead.service)}</small></span></figcaption>
    </figure>
    <div class="feature__list" data-accordion="single">${rest.map((r, i) => `<div class="feature__item" data-acc-item>
        <h3><button type="button" data-acc-btn aria-expanded="false" aria-controls="fr-${r.id}" id="fr-${r.id}-b">${avatar(r.name)}<span class="feature__name"><strong>${esc(r.name)}</strong><small>${esc(r.service)}</small></span><span class="feature__snip">“${esc(excerpt(r.text, 70))}”</span><span class="faq__sign">${icon('plus')}</span></button></h3>
        <div class="acc__panel" id="fr-${r.id}" role="region" aria-labelledby="fr-${r.id}-b"><div><p>${esc(r.text)}</p></div></div>
      </div>`).join('')}</div>
  </div>`;
}

function contactCards({ data }) {
  const c = data.company;
  const cards = [
    ['whatsapp', 'WhatsApp', 'The fastest way to reach a consultant.', c.phone, waHref, true],
    ['phone', 'Call us', c.hours, c.phone, c.phoneHref, false],
    ['mail', 'E-mail', 'For documents and detailed questions.', c.email, `mailto:${c.email}`, false],
    ['pin', 'Visit the office', c.addressShort, 'Get directions', c.mapLink, true],
  ];
  return `<ul class="channels" data-reveal-group>${cards.map(([i, t, sub, val, href, ext]) => `<li><a class="channel" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''} data-tilt="3"><span class="channel__icon">${icon(i)}</span><h3>${esc(t)}</h3><p>${esc(sub)}</p><strong>${esc(val)}</strong></a></li>`).join('')}</ul>`;
}

function mapEmbed({ data }) {
  return `<div class="map frame"><iframe src="${data.company.mapEmbed}" title="Map of the Bizskoop office in Kuala Lumpur" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
}

/* ---------------- small inline helpers ---------------- */
const photo = (ctx, name, pos = '50%_40%') => img(name, { pos: pos.replace('_', ' ') });
const heroPhoto = (ctx, name, pos = '50%_40%') => img(name, { pos: pos.replace('_', ' '), eager: true });
const askIcon = () => icon('chat');
const iconOf = (ctx, name) => icon(name);
const arrowIcon = () => icon('arrow-right');
const proofAvatars = ({ data }) => `<span class="proof__avatars">${['pak-venture', 'atiqur-rahman', 'faizan-ali', 'kanij-fatima'].map((id) => avatar(byId(data.reviews, id).name)).join('')}</span>`;

module.exports = {
  photo, heroPhoto, askIcon, arrowIcon, iconOf, proofAvatars,
  socials, servicesMenu, footerServices, ticker, questionWall, values, outcomes, authorityGrid, serviceStack, industries,
  processArc, numbers, compare, flags, trustedGrid, trustStrip, faqList, faqFull, crumbs, closingCta,
  svcHero, svcOverview, svcIncludes, svcStages, svcExtras, svcWho, svcAuthorities, svcReviews, svcFaqs, svcOthers,
  aboutNumbers, workProcess, whyGrid, reviewFeature, contactCards, mapEmbed,
};
