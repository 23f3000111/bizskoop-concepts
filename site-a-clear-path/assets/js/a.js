/* Concept A, "Clear Path": hero entrance and mosaic parallax, stacked service cards, the pinned process arc,
   and the comparison toggle. Runs after ui.js (window.BZUI). */
(function () {
  'use strict';
  const UI = window.BZUI;
  const { $, $$ } = UI;
  const motion = UI.hasGsap && !UI.reduced;
  const headerH = () => ($('[data-header]') || { offsetHeight: 76 }).offsetHeight;

  function hero() {
    const root = $('.hero');
    if (!root || !motion) return;
    const mark = $('.mark', root);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from($('.label', root), { autoAlpha: 0, y: 14, duration: 0.8 })
      .from($$('.hero__line', root), { autoAlpha: 0, y: 34, duration: 1.1, stagger: 0.12 }, '<0.05')
      .fromTo(mark, { backgroundSize: '0% 100%', color: '#091932' }, { backgroundSize: '100% 100%', color: '#ffffff', duration: 0.9, ease: 'power3.inOut' }, '-=0.55')
      .from([$('.hero__lead', root), $('.btns', root), $('.hero__proof', root)], { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.08 }, '-=0.75')
      .from($$('.tile', root), { autoAlpha: 0, y: 70, scale: 0.94, duration: 1.3, stagger: 0.07 }, 0.1)
      .from($('.ticker', root), { autoAlpha: 0, duration: 1 }, '-=0.6');

    const cols = $$('.mosaic__col', root);
    const speeds = [-7, 5, -11];
    cols.forEach((c, i) => gsap.to(c, { yPercent: speeds[i], ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } }));
    const vis = $('.hero__visual', root);
    if (UI.fine && vis) {
      vis.addEventListener('pointermove', (e) => {
        const r = vis.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cols.forEach((c) => {
          const d = parseFloat(c.dataset.depth) || 1;
          gsap.to(c, { x: x * 16 * d, y: y * 18 * d, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
        });
      });
      vis.addEventListener('pointerleave', () => cols.forEach((c) => gsap.to(c, { x: 0, y: 0, duration: 1.1, ease: 'power3.out' })));
    }
  }

  // Each sticky service card shrinks a little as the next one slides over it.
  function stack() {
    if (!motion) return;
    $$('[data-stack]').forEach((stackEl) => {
      const cards = $$('.stack__card', stackEl);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.94, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: () => `top ${headerH() + 18 + (i + 1) * 12}px`, scrub: true, invalidateOnRefresh: true },
        });
      });
    });
  }

  // Pinned arc: four steps light up as the visitor scrolls.
  function arc() {
    const root = $('[data-arc]');
    if (!root) return;
    const section = root.closest('section');
    const steps = $$('.arc__step', root);
    const panels = $$('.arc__panel', root);
    const fill = $('.arc__fill', root);
    let current = -1;
    const set = (p) => {
      const n = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      fill.style.strokeDashoffset = String(1 - Math.min(1, (p * steps.length) / (steps.length - 1)));
      if (n === current) return;
      current = n;
      steps.forEach((s, i) => { s.classList.toggle('is-active', i === n); s.classList.toggle('is-done', i < n); });
      panels.forEach((x, i) => x.classList.toggle('is-active', i === n));
    };
    if (!motion) {
      section.classList.add('is-static');
      return;
    }
    set(0);
    ScrollTrigger.create({
      trigger: section,
      start: () => `top top+=${headerH()}`,
      end: () => `+=${Math.round(window.innerHeight * 1.5)}`,
      pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => set(self.progress),
    });
  }

  function compare() {
    $$('[data-compare]').forEach((c) => {
      const btns = $$('[data-side]', c);
      btns.forEach((b) => b.addEventListener('click', () => {
        c.dataset.show = b.dataset.side;
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      }));
    });
  }

  hero();
  stack();
  arc();
  compare();
  if (motion) window.addEventListener('load', () => ScrollTrigger.refresh());
})();
