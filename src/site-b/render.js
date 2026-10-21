// Concept B ("Gateway") build-time directives. Generic parts (FAQ items, stages, contact cards, review cards...)
// reuse Concept A's markup and are restyled by b.css; the home page sections below are B's own.
const { esc, icon, byId, svcHref, img, avatar, stars, excerpt, waHref } = require('../shared/render-kit.js');
const A = require('../site-a/render.js');

const tile = (id = 'arrow-up-right') => `<span class="btn__tile">${icon(id)}</span>`;
const spark = (text) => `<p class="kicker"><span class="dot" aria-hidden="true"></span>${esc(text)}</p>`;

function heroB({ data }) {
  const s = (id) => byId(data.stats, id);
  const stat = (v, l) => `<li><strong>${v}</strong><span>${esc(l)}</span></li>`;
  return `<div class="hero-b__frame" data-hero>
    <div class="hero-b__media">${img('hero-team', { eager: true, pos: '58% 40%', cls: 'hero-b__img' })}</div>
    <div class="hero-b__shade" aria-hidden="true"></div>
    <div class="hero-b__content">
      <div class="hero-b__main">
        <ul class="hero-b__stats">${stat('1,000+', s('incorporated').label)}${stat('15+', s('years').label)}${stat('5.0', 'Google rating, 90+ reviews')}</ul>
        <h1 class="hero-b__title"><span>Register your company.</span> <span>Secure your passes.</span> <span>Grow in Malaysia.</span></h1>
      </div>
      <div class="hero-b__side">
        <p>Company registration, licences, Employment Passes, accounting and tax for founders, investors and SMEs, handled by one Kuala Lumpur team.</p>
        <div class="btns">
          <button type="button" class="btn btn--light btn--pill" data-open="consult" data-magnetic>Book a free consultation${tile()}</button>
          <a class="btn btn--glass btn--pill" href="services.html">Our services</a>
        </div>
      </div>
    </div>
  </div>`;
}

function logoMarquee({ data }) {
  return `<div class="logostrip">
    <p class="logostrip__label">Working with Malaysia’s<br>key authorities</p>
    <div class="logostrip__run marquee" data-marquee style="--marquee-time:60s"><div class="marquee__track"><ul class="marquee__group">${data.authorities.map((a) => `<li><button type="button" class="logostrip__item" data-authority="${a.id}" aria-label="${esc(a.short)}, ${esc(a.name)}"><img src="assets/img/logos/${a.logo}.webp" alt="" loading="lazy" decoding="async"></button></li>`).join('')}</ul></div></div>
  </div>`;
}

function statement() {
  return `<p class="statement" data-statement>We make Malaysia <span class="statement__pill" aria-hidden="true">${img('kl-towers-sky', { pos: '50% 35%' })}</span> simple for founders, investors and expats from around the world, from the first registration to every renewal that follows.</p>`;
}

function countersRow({ data }) {
  const ids = ['incorporated', 'satisfaction', 'authorities', 'individuals'];
  return `<ul class="counters" data-reveal-group>${ids.map((id) => { const s = byId(data.stats, id); return `<li class="counter"><p class="counter__num"><span data-count="${s.value}">${s.value.toLocaleString('en-US')}</span>${s.suffix}</p><p class="counter__label">${esc(s.label)}</p></li>`; }).join('')}</ul>`;
}

function journeys({ data }) {
  return `<ul class="journeys" data-reveal-group>${data.journeys.map((j) => {
    const s = byId(data.services, j.service);
    return `<li><a class="jcard" href="${svcHref(s)}">
      <span class="jcard__media">${img(j.image, { pos: '50% 35%' })}</span>
      <span class="jcard__body">
        <span class="jcard__sub">${esc(j.sub)}</span>
        <span class="jcard__title">${esc(j.title)}</span>
        <span class="jcard__points">${j.points.map((p) => `<span>${icon('circle-check')}${esc(p)}</span>`).join('')}</span>
        <span class="jcard__cta">${esc(j.cta)}<span class="jcard__arrow">${icon('arrow-up-right')}</span></span>
      </span>
    </a></li>`;
  }).join('')}</ul>`;
}

function servicesTabs({ data }) {
  const tabs = data.services.map((s, i) => `<button type="button" role="tab" id="tab-${s.id}" aria-controls="panel-${s.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(s.nav)}</button>`).join('');
  const panels = data.services.map((s, i) => `<div class="tabpanel" role="tabpanel" id="panel-${s.id}" aria-labelledby="tab-${s.id}"${i === 0 ? '' : ' hidden'}>
      <div class="tabpanel__media">${img(s.image, { pos: '50% 40%' })}</div>
      <div class="tabpanel__body">
        <p class="tabpanel__tag">${esc(s.tag)}</p>
        <h3 class="tabpanel__title">${esc(s.title)}</h3>
        <p class="tabpanel__text">${esc(s.summary)}</p>
        <ul class="tabpanel__list">${s.items.slice(0, 5).map((it) => `<li>${icon('check')}${esc(it)}</li>`).join('')}</ul>
        <div class="btns"><a class="btn btn--primary btn--pill" href="${svcHref(s)}">Explore ${esc(s.name)}${tile()}</a><button type="button" class="btn btn--ghost btn--pill lift" data-open="consult" data-service="${s.id}">Ask about this</button></div>
      </div>
    </div>`).join('');
  return `<div class="tabs" data-tabs><div class="tabs__list" role="tablist" aria-label="Services">${tabs}</div>${panels}</div>`;
}

function processAccordion({ data }) {
  return `<div class="system">
    <div class="system__acc" data-accordion="single" data-system>${data.process.map((p, i) => `<div class="sys__item${i === 0 ? ' is-open' : ''}" data-acc-item>
        <h3 class="sys__q"><button type="button" data-acc-btn aria-expanded="${i === 0}" aria-controls="sys-${p.id}" id="sys-${p.id}-b"><span class="sys__num">${i + 1}</span>${esc(p.title)}<span class="sys__sign">${icon('plus')}</span></button></h3>
        <div class="acc__panel" id="sys-${p.id}" role="region" aria-labelledby="sys-${p.id}-b"><div><p>${esc(p.text)}</p><button type="button" class="link-btn" data-open="consult">Book a consultation${icon('arrow-right')}</button></div></div>
      </div>`).join('')}</div>
    <div class="system__media">${data.process.map((p, i) => `<figure class="system__img${i === 0 ? ' is-active' : ''}" data-step-img="${i}">${img(p.image, { pos: '50% 40%' })}</figure>`).join('')}</div>
  </div>`;
}

function globeSection({ data }) {
  return `<div class="gateway">
    <div class="gateway__copy">
      <p class="pill-label"><span class="dot" aria-hidden="true"></span>Google reviews</p>
      <h2 class="h2" data-split>Trusted by 500+ companies and 2,000+ people from around the world</h2>
      <p class="lead">Founders, investors and professionals arrive from across Asia, the Middle East and beyond. Every journey ends at one address in Kuala Lumpur.</p>
      ${A.flags({ data })}
      <a class="rating" href="${data.company.reviewsUrl}" target="_blank" rel="noopener">${icon('google', 'ic ic--google')}<span class="rating__score">5.0</span>${stars()}<span class="rating__note">from 90+ Google reviews</span>${icon('external')}</a>
    </div>
    <div class="gateway__globe"><canvas class="globe" data-globe aria-label="A globe with arcs from clients’ home countries into Kuala Lumpur" role="img"></canvas><p class="gateway__hint">${icon('globe')}Drag to turn the globe</p></div>
  </div>`;
}

function bento({ data }) {
  const w = (id) => byId(data.why, id);
  const card = (x, cls = '') => `<button type="button" class="bento__card ${cls}" data-ask="${esc(x.title)}"><span class="bento__icon">${icon(x.icon)}</span><span class="bento__title">${esc(x.title)}</span><span class="bento__text">${esc(x.text)}</span></button>`;
  return `<div class="bento" data-reveal-group>
    <a class="bento__photo bento__photo--tall" href="about.html">${img('team-standing', { pos: '50% 35%' })}<span class="bento__caption"><strong>Strategic partnership</strong><small>One dedicated account manager, from incorporation to every renewal</small></span></a>
    <a class="bento__stat" href="about.html#numbers"><span class="bento__num"><span data-count="1000">1,000</span>+</span><span class="bento__label">Businesses incorporated</span><span class="bento__text">From foreign founders opening their first Sdn Bhd to SMEs adding a new licence.</span></a>
    ${card(w('fast'))}
    <a class="bento__photo" href="contact.html">${img('p-bearded-suit', { pos: '50% 25%' })}</a>
    ${card(w('accountable'))}
    <a class="bento__stat bento__stat--soft" href="about.html#numbers"><span class="bento__num"><span data-count="98">98</span>%</span><span class="bento__label">Client satisfaction</span><span class="bento__text">Rated 5.0 on Google from 90+ reviews.</span></a>
    ${card(w('transparent'), 'bento__card--wide')}
    <a class="bento__photo" href="services.html">${img('consult-pair', { pos: '50% 35%' })}</a>
  </div>`;
}

function faqSplit({ data }) {
  return `<div class="faqsplit">
    ${A.faqList({ data }, 'foreigners', 'incorporation-time', 'ep', 'pbt', 'accounting', 'fees')}
    <div class="faqsplit__aside">
      <figure class="faqsplit__photo">${img('p-indian-woman-navy', { pos: '50% 25%' })}</figure>
      <div class="faqsplit__card">
        <span class="faqsplit__icon">${icon('chat')}</span>
        <p><strong>Still have questions?</strong>Our assistant answers instantly, any time.</p>
        <button type="button" class="btn btn--primary btn--pill btn--sm" data-ask="I have a question">Ask now${tile('arrow-right')}</button>
      </div>
    </div>
  </div>`;
}

function servicesGrid({ data }) {
  return `<ul class="sgrid" data-reveal-group>${data.services.map((s, i) => `<li class="${i === 0 ? 'sgrid__wide' : ''}"><a class="scard" href="${svcHref(s)}">
      <span class="scard__media">${img(s.image, { pos: '50% 40%' })}<span class="scard__icon">${icon(s.icon)}</span></span>
      <span class="scard__body"><span class="scard__tag">${esc(s.tag)}</span><span class="scard__title">${esc(s.name)}</span><span class="scard__text">${esc(s.summary)}</span>
      <span class="scard__chips">${s.items.slice(0, 3).map((it) => `<span>${esc(it)}</span>`).join('')}</span>
      <span class="scard__more">Explore the service<span class="jcard__arrow">${icon('arrow-up-right')}</span></span></span>
    </a></li>`).join('')}</ul>`;
}

function svcHeroB({ data, item }) {
  const s = item || data.services[0];
  const logos = s.authorities.slice(0, 4).map((id) => byId(data.authorities, id));
  return `<div class="svc-hero__grid">
    <div class="svc-hero__copy">
      ${spark(s.tag)}
      <h1 class="h1 h1--page" data-split>${esc(s.title)}</h1>
      <p class="lead">${esc(s.lead)}</p>
      <div class="btns">
        <button type="button" class="btn btn--primary btn--pill" data-open="consult" data-service="${s.id}" data-magnetic>Book a free consultation${tile()}</button>
        <button type="button" class="btn btn--ghost btn--pill lift" data-ask="${esc(`Tell me about ${s.name}`)}">${icon('chat')}Ask the assistant</button>
      </div>
      <ul class="glance">
        <li>${icon('user-check')}<span><strong>One account manager</strong>from first call to approval</span></li>
        <li>${icon('shield')}<span><strong>${s.authorities.length} authorit${s.authorities.length === 1 ? 'y' : 'ies'}</strong>handled for you</span></li>
        <li>${icon('receipt')}<span><strong>Free consultation</strong>fees agreed upfront</span></li>
      </ul>
    </div>
    <div class="svc-hero__media">
      <figure class="frame frame--tall" data-tilt="2">${img(s.image, { eager: true, pos: '50% 40%' })}</figure>
      <div class="svc-hero__logos">${logos.map((a) => `<button type="button" class="mini-logo" data-authority="${a.id}" aria-label="${esc(a.short)}"><img src="assets/img/logos/${a.logo}.webp" alt=""></button>`).join('')}</div>
    </div>
  </div>`;
}

function svcCarousel({ data, item }) {
  const s = item || data.services[0];
  const own = s.reviews.map((id) => byId(data.reviews, id)).filter((r) => r.text);
  const list = [...own, ...data.reviews.filter((r) => r.text && !own.includes(r))].slice(0, 4);
  return `<div class="carousel" data-carousel>
    <div class="carousel__track">${list.map((r, i) => `<figure class="slide${i === 0 ? ' is-active' : ''}" data-slide>
        <div class="slide__mark">${icon('quote')}</div>
        <blockquote class="slide__quote">${esc(excerpt(r.text, 330))}</blockquote>
        <figcaption class="slide__who">${avatar(r.name, 'avatar--lg')}<span><strong>${esc(r.name)}</strong><small>${esc(r.service)}</small></span><span class="slide__src">${icon('google', 'ic ic--google')}${stars()}</span></figcaption>
        <button type="button" class="slide__more link-btn" data-review="${r.id}">Read the full review${icon('arrow-right')}</button>
      </figure>`).join('')}</div>
    <div class="carousel__nav"><button type="button" class="carousel__btn" data-prev aria-label="Previous review">${icon('chevron-left')}</button><span class="carousel__count" data-count-label>1 / ${list.length}</span><button type="button" class="carousel__btn" data-next aria-label="Next review">${icon('chevron-right')}</button></div>
  </div>`;
}

function aboutMosaic() {
  return `<div class="about-b">
    <figure class="about-b__a frame">${img('team-meeting', { pos: '50% 40%' })}</figure>
    <figure class="about-b__b frame">${img('p-asian-woman-glasses', { pos: '50% 30%' })}</figure>
    <figure class="about-b__c frame">${img('p-pakistani-shirt', { pos: '50% 25%' })}</figure>
  </div>`;
}

module.exports = {
  ...A,
  heroB, logoMarquee, statement, countersRow, journeys, servicesTabs, processAccordion, globeSection, bento, faqSplit,
  servicesGrid, svcHeroB, svcCarousel, aboutMosaic,
};
