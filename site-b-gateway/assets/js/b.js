/* Concept B, "Gateway": hero entrance and parallax, the about statement that fills in as you scroll,
   the process accordion's photo, the globe and the review carousel. Runs after ui.js (window.BZUI). */
(function () {
  'use strict';
  const UI = window.BZUI;
  const { $, $$ } = UI;
  const motion = UI.hasGsap && !UI.reduced;

  function hero() {
    const root = $('[data-hero]');
    if (!root || !motion) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from($('.hero-b__img', root), { scale: 1.14, duration: 2.4, ease: 'power3.out' })
      .from('.site-header__bar', { autoAlpha: 0, y: -18, duration: 0.9 }, 0.15)
      .from($$('.hero-b__stats li', root), { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.08 }, 0.3)
      .from($$('.hero-b__title span', root), { autoAlpha: 0, y: 44, duration: 1.15, stagger: 0.12 }, 0.4)
      .from($$('.hero-b__side > *', root), { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.75);
    gsap.to($('.hero-b__media', root), { yPercent: 6, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Words of the about statement go from pale to navy as the visitor reads down.
  function statement() {
    const el = $('[data-statement]');
    if (!el || !motion || !window.SplitText) return;
    const split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.to(split.words, { color: '#091932', stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true } });
  }

  function system() {
    $$('[data-system]').forEach((acc) => {
      const imgs = $$('[data-step-img]', acc.parentElement);
      acc.addEventListener('bz:accordion', (e) => {
        if (!e.detail.open) return;
        imgs.forEach((im, i) => im.classList.toggle('is-active', i === e.detail.index));
      });
    });
  }

  function globe() {
    const c = $('[data-globe]');
    if (!c || !window.BZGlobe || !window.BZ_GLOBE_DOTS) return;
    const at = {
      pk: [33.69, 73.06], in: [28.61, 77.21], bd: [23.81, 90.41], cn: [39.9, 116.4], sg: [1.35, 103.82], id: [-6.21, 106.85],
      ae: [25.2, 55.27], sa: [24.71, 46.68], eg: [30.04, 31.24], kz: [51.17, 71.45], gb: [51.51, -0.13], us: [40.71, -74.01], au: [-33.87, 151.21],
    };
    const pins = window.BZ_DATA.countries.filter((x) => at[x.code]).map((x) => ({ lat: at[x.code][0], lng: at[x.code][1], name: x.name }));
    window.BZGlobe.mount(c, { dots: window.BZ_GLOBE_DOTS, pins, hub: { lat: 3.139, lng: 101.687, name: 'Kuala Lumpur' }, reduced: UI.reduced });
  }

  function carousels() {
    $$('[data-carousel]').forEach((car) => {
      const slides = $$('[data-slide]', car);
      const label = $('[data-count-label]', car);
      let i = 0;
      let timer = 0;
      const show = (n) => {
        i = (n + slides.length) % slides.length;
        slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
        label.textContent = `${i + 1} / ${slides.length}`;
      };
      const restart = () => { clearInterval(timer); if (!UI.reduced) timer = setInterval(() => show(i + 1), 8000); };
      $('[data-prev]', car).addEventListener('click', () => { show(i - 1); restart(); });
      $('[data-next]', car).addEventListener('click', () => { show(i + 1); restart(); });
      car.addEventListener('mouseenter', () => clearInterval(timer));
      car.addEventListener('mouseleave', restart);
      restart();
    });
  }

  hero();
  statement();
  system();
  globe();
  carousels();
  if (motion) window.addEventListener('load', () => ScrollTrigger.refresh());
})();
