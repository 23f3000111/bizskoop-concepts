/* Bizskoop concept sites: shared browser behaviour.
   Modals (consultation form, review / authority / industry pop-ups), the "Ask Bizskoop" chat, accordions, tabs,
   FAQ search, face-safe photo crops, marquees and the motion helpers (Lenis + GSAP when present).
   Load after data.js, core.js and faces.js. Exposes window.BZUI for the concept scripts. */
(function () {
  'use strict';
  const D = window.BZ_DATA;
  const BZ = window.BZ;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const svc = (id) => BZ.byId(D.services, id);
  const svcHref = (id) => (svc(id) ? `${svc(id).slug}.html` : 'services.html');
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  const UI = { reduced, fine, hasGsap, lenis: null, icon, svcHref, $, $$ };
  window.BZUI = UI;

  /* ---------------- motion: smooth scroll, reveals, split headings, counters, tilt, magnetic ---------------- */
  function motion() {
    document.documentElement.classList.toggle('is-reduced', reduced);
    if (!hasGsap) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (!reduced && window.Lenis) {
      const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
      UI.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      if (UI.lenis) UI.lenis.scrollTo(target, { offset: -96 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
  }

  function reveals() {
    if (!hasGsap || reduced) return;
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, { autoAlpha: 0, y: 26, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-reveal-group]').forEach((g) => {
      const stagger = g.children.length > 8 ? { amount: 0.6 } : 0.07; // long grids finish within 1.4 s
      gsap.from(g.children, { autoAlpha: 0, y: 26, duration: 0.8, ease: 'power3.out', stagger, scrollTrigger: { trigger: g, start: 'top 88%', once: true } });
    });
    if (!window.SplitText) return;
    $$('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 1.05, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }),
      });
    });
  }

  function counters() {
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (!hasGsap || reduced) { el.textContent = fmt(end); return; }
      const o = { v: 0 };
      gsap.to(o, {
        v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true, onEnter: () => { el.textContent = fmt(0); } },
      });
    });
  }

  function tilt() {
    if (reduced || !fine) return;
    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 5;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  function magnetic() {
    if (reduced || !fine) return;
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tx', `${((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1)}px`);
        el.style.setProperty('--ty', `${((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1)}px`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });
  }

  /* ---------------- header and menus ---------------- */
  function header() {
    const h = $('[data-header]');
    if (!h) return;
    const on = () => h.classList.toggle('is-scrolled', window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    $$('[data-dropdown]').forEach((dd) => {
      const btn = $('button', dd);
      const set = (open) => { btn.setAttribute('aria-expanded', String(open)); dd.classList.toggle('is-open', open); };
      btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
      dd.addEventListener('mouseleave', () => set(false));
      dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) set(false); });
    });
    $$('[data-menu-toggle]').forEach((b) => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      h.classList.toggle('menu-open', open);
    }));
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      $$('[data-dropdown].is-open').forEach((dd) => { dd.classList.remove('is-open'); $('button', dd).setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------------- modals ---------------- */
  let lastFocus = null;
  function openModal(m) {
    lastFocus = document.activeElement;
    m.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('is-open')));
    document.documentElement.classList.add('modal-open');
    if (UI.lenis) UI.lenis.stop();
    const first = $('[autofocus]', m) || $('.bz-modal__close', m);
    if (first) first.focus({ preventScroll: true });
  }
  function closeModal(m) {
    m.classList.remove('is-open');
    setTimeout(() => { m.hidden = true; }, reduced ? 0 : 300);
    document.documentElement.classList.remove('modal-open');
    if (UI.lenis) UI.lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function trapFocus(e, m) {
    const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', m).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function modals() {
    document.addEventListener('click', (e) => {
      const c = e.target.closest('[data-close]');
      if (c) { const m = c.closest('.bz-modal'); if (m) closeModal(m); }
    });
    document.addEventListener('keydown', (e) => {
      const m = $('.bz-modal.is-open');
      if (!m) return;
      if (e.key === 'Escape') closeModal(m);
      if (e.key === 'Tab') trapFocus(e, m);
    });
    UI.openModal = openModal;
    UI.closeModal = closeModal;
  }

  /* ---------------- free consultation form -> WhatsApp ---------------- */
  function consult() {
    const m = $('#consult-modal');
    if (!m) return;
    const form = $('form', m);
    const done = $('[data-consult-done]', m);
    const sel = form.elements.service;
    sel.innerHTML = D.consultOptions.map((o) => `<option>${BZ.esc(o)}</option>`).join('');
    const clear = () => {
      $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
      $$('[data-error]', form).forEach((e) => { e.textContent = ''; });
    };
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-open="consult"]');
      if (!t) return;
      e.preventDefault();
      const chatOpen = $('[data-chat].is-open');
      if (chatOpen && UI.chat) UI.chat.close(false);
      const popup = $('#info-modal.is-open');
      if (popup) closeModal(popup); // the form replaces a review, authority or industry pop-up
      form.reset();
      clear();
      form.hidden = false;
      done.hidden = true;
      const pick = D.consultFor[t.dataset.service];
      sel.value = D.consultOptions[pick == null ? D.consultOptions.length - 1 : pick];
      openModal(m);
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = Object.fromEntries(new FormData(form));
      const v = BZ.validateConsult(fields);
      clear();
      if (!v.ok) {
        Object.entries(v.errors).forEach(([k, msg]) => {
          form.elements[k].setAttribute('aria-invalid', 'true');
          $(`[data-error="${k}"]`, form).textContent = msg;
        });
        form.elements[Object.keys(v.errors)[0]].focus();
        return;
      }
      const msg = BZ.consultMessage(fields);
      $('[data-wa]', done).href = BZ.waLink(msg);
      $('[data-mail]', done).href = BZ.mailLink('Free consultation request', msg);
      $('[data-consult-name]', done).textContent = String(fields.name).trim().split(/\s+/)[0];
      form.hidden = true;
      done.hidden = false;
      window.open(BZ.waLink(msg), '_blank', 'noopener');
      $('[data-wa]', done).focus({ preventScroll: true });
    });
  }

  /* ---------------- pop-ups for reviews, authorities and industries ---------------- */
  const stars = () => `<span class="stars" aria-label="5 out of 5 stars">${icon('star-fill', 'ic ic--star').repeat(5)}</span>`;
  const avatar = (name) => `<span class="avatar" style="--h:${BZ.hue(name)}" aria-hidden="true">${BZ.esc(BZ.initials(name))}</span>`;
  const serviceLinks = (ids) => `<div class="info__links">${ids.map((id) => `<a class="info__link" href="${svcHref(id)}"><span>${BZ.esc(svc(id).name)}</span>${icon('arrow-up-right')}</a>`).join('')}</div>`;

  function reviewHtml(r) {
    const text = r.text
      ? `<blockquote class="info__quote">${r.headline ? `<strong>${BZ.esc(r.headline)}</strong> ` : ''}${BZ.esc(r.text)}</blockquote>`
      : `<p class="info__quote info__quote--empty">${BZ.esc(r.name)} reviewed Bizskoop for ${BZ.esc(r.service.toLowerCase())}. Read the full review on Bizskoop’s Google listing.</p>`;
    return `<div class="info info--review">
      <div class="info__who">${avatar(r.name)}<div><h2 class="info__title" id="info-title">${BZ.esc(r.name)}</h2><p class="info__sub">${BZ.esc(r.service)}</p></div>${icon('google', 'ic ic--google')}</div>
      <div class="info__rating">${stars()}<span>Google review${r.when ? `, ${BZ.esc(r.when)}` : ''}</span></div>
      ${text}
      <div class="info__actions"><a class="btn btn--primary" href="${D.company.reviewsUrl}" target="_blank" rel="noopener">Read on Google ${icon('external')}</a><a class="btn btn--ghost" href="${svcHref(r.serviceId)}">See ${BZ.esc(svc(r.serviceId).name)}</a></div>
    </div>`;
  }
  function authorityHtml(a) {
    return `<div class="info info--authority">
      <div class="info__logo"><img src="assets/img/logos/${a.logo}.webp" alt="${BZ.esc(a.short)} logo"></div>
      <h2 class="info__title" id="info-title">${BZ.esc(a.name)}</h2>
      <p class="info__sub">${BZ.esc(a.en)}</p>
      <p class="info__text">${BZ.esc(a.about)}</p>
      <div class="info__box"><h3>What Bizskoop handles</h3><p>${BZ.esc(a.handles)}</p></div>
      ${serviceLinks(a.services)}
    </div>`;
  }
  function industryHtml(i) {
    return `<div class="info info--industry">
      <span class="info__icon">${icon(i.icon)}</span>
      <h2 class="info__title" id="info-title">${BZ.esc(i.name)}</h2>
      <p class="info__text">${BZ.esc(i.text)}</p>
      ${serviceLinks(i.services)}
      <div class="info__actions"><button type="button" class="btn btn--primary" data-open="consult">Book a free consultation</button></div>
    </div>`;
  }
  function info() {
    const m = $('#info-modal');
    if (!m) return;
    const body = $('[data-info-body]', m);
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-review], [data-authority], [data-industry]');
      if (!t) return;
      e.preventDefault();
      if (t.dataset.review) body.innerHTML = reviewHtml(BZ.byId(D.reviews, t.dataset.review));
      else if (t.dataset.authority) body.innerHTML = authorityHtml(BZ.byId(D.authorities, t.dataset.authority));
      else body.innerHTML = industryHtml(BZ.byId(D.industries, t.dataset.industry));
      if (m.hidden) openModal(m);
    });
    UI.reviewHtml = reviewHtml;
  }

  /* ---------------- "Ask Bizskoop" chat ---------------- */
  function chat() {
    const root = $('[data-chat]');
    if (!root) return;
    const C = D.chat;
    const KEY = 'bz-chat-v1';
    const launcher = $('[data-chat-launcher]', root);
    const panel = $('[data-chat-panel]', root);
    const log = $('[data-chat-log]', root);
    const chipsEl = $('[data-chat-chips]', root);
    const form = $('[data-chat-form]', root);
    const input = form.elements.q;
    const teaser = $('[data-chat-teaser]', root);
    let history = store.get(KEY) || [];
    let busy = false;
    const label = (id) => (BZ.byId(C.intents, id) || {}).label || id;

    const bubble = (cls, html) => {
      const d = document.createElement('div');
      d.className = `bz-msg ${cls}`;
      d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    };
    const renderMe = (text) => { bubble('bz-msg--me', '').textContent = text; };
    const setChips = (ids, labels) => {
      chipsEl.innerHTML = ids.map((id, i) => `<button type="button" class="bz-chip" data-intent="${id}">${BZ.esc(labels ? labels[i] : label(id))}</button>`).join('');
    };
    function renderBot(r) {
      const actions = [];
      if (r.service) actions.push(`<a class="bz-msg__link" href="${svcHref(r.service)}">${BZ.esc(svc(r.service).name)}${icon('arrow-up-right')}</a>`);
      if (r.link) actions.push(`<a class="bz-msg__link" href="${BZ.esc(r.link.href)}"${/^https?:/.test(r.link.href) ? ' target="_blank" rel="noopener"' : ''}>${BZ.esc(r.link.label)}${icon('arrow-up-right')}</a>`);
      if (r.action === 'consult') actions.push(`<button type="button" class="bz-msg__link" data-open="consult">Open the consultation form${icon('arrow-up-right')}</button>`);
      if (r.action === 'whatsapp' || r.fallback) {
        const wa = r.wa || BZ.waLink('Hi Bizskoop, I would like to speak to a consultant.');
        actions.push(`<a class="bz-msg__link bz-msg__link--wa" href="${BZ.esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp')}Message a consultant</a>`);
      }
      bubble('bz-msg--bot', `<p>${BZ.esc(r.answer)}</p>${actions.length ? `<div class="bz-msg__actions">${actions.join('')}</div>` : ''}`);
      setChips(r.chips || []);
    }
    function greet() {
      bubble('bz-msg--bot', `<p>${BZ.esc(C.greeting)}</p>`);
      setChips(C.chips.map((c) => c.intent), C.chips.map((c) => c.label));
    }
    // Replies are always rebuilt from data.js (history keeps only the visitor's text and the intent id).
    const reply = (q, intentId) => {
      const it = intentId && BZ.byId(C.intents, intentId);
      if (!it) return BZ.chatReply(q, C);
      return { id: it.id, answer: it.answer, chips: it.chips || [], link: it.link || null, service: it.service || null, action: it.action || null, fallback: false };
    };
    function restore() {
      log.innerHTML = '';
      greet();
      history.forEach((h) => {
        if (typeof h.me === 'string') renderMe(h.me);
        else if (typeof h.q === 'string') { const r = reply(h.q, h.bot); if (r) renderBot(r); }
      });
    }
    function ask(text, intentId) {
      const q = String(text || '').trim();
      if (!q || busy) return;
      const r = reply(q, intentId);
      renderMe(q);
      history.push({ me: q });
      busy = true;
      chipsEl.innerHTML = '';
      const typing = bubble('bz-msg--bot bz-msg--typing', '<span></span><span></span><span></span>');
      typing.setAttribute('aria-label', 'Typing');
      setTimeout(() => {
        typing.remove();
        renderBot(r);
        history.push({ bot: r.id, q });
        store.set(KEY, history.slice(-40));
        busy = false;
      }, reduced ? 0 : 600 + Math.min(900, r.answer.length * 3));
    }
    function open(focus = true) {
      if (teaser) teaser.hidden = true;
      store.set('bz-chat-seen', true);
      if (!panel.hidden) return;
      panel.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-open')));
      launcher.setAttribute('aria-expanded', 'true');
      if (!log.children.length) restore();
      if (focus) input.focus({ preventScroll: true });
    }
    function close(refocus = true) {
      root.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      setTimeout(() => { panel.hidden = true; }, reduced ? 0 : 260);
      if (refocus) launcher.focus({ preventScroll: true });
    }
    launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
    $$('[data-chat-close]', root).forEach((b) => b.addEventListener('click', () => (b.closest('[data-chat-teaser]') ? (teaser.hidden = true, store.set('bz-chat-seen', true)) : close())));
    form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); input.value = ''; });
    chipsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-intent]'); if (b) ask(b.textContent, b.dataset.intent); });
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-ask]');
      if (!t) return;
      e.preventDefault();
      open(false);
      ask(t.dataset.ask);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden && !$('.bz-modal.is-open')) close(); });
    // The teaser waits until the visitor has scrolled past the first screen, so it never sits on the hero.
    if (teaser && !store.get('bz-chat-seen')) {
      const arm = () => {
        if (window.scrollY < window.innerHeight * 0.9) return;
        window.removeEventListener('scroll', arm);
        setTimeout(() => { if (panel.hidden && !store.get('bz-chat-seen')) teaser.hidden = false; }, 4000);
      };
      window.addEventListener('scroll', arm, { passive: true });
    }
    UI.chat = { open, close, ask };
  }

  /* ---------------- accordions, tabs, FAQ search ---------------- */
  function accordions() {
    $$('[data-accordion]').forEach((acc) => {
      const single = acc.dataset.accordion === 'single';
      $$('[data-acc-btn]', acc).forEach((btn) => btn.addEventListener('click', () => {
        const item = btn.closest('[data-acc-item]');
        const open = btn.getAttribute('aria-expanded') !== 'true';
        if (single && open) {
          $$('[data-acc-item].is-open', acc).forEach((o) => {
            if (o === item) return;
            o.classList.remove('is-open');
            $('[data-acc-btn]', o).setAttribute('aria-expanded', 'false');
          });
        }
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        acc.dispatchEvent(new CustomEvent('bz:accordion', { detail: { item, open, index: $$('[data-acc-item]', acc).indexOf(item) } }));
      }));
    });
  }

  function tabs() {
    $$('[data-tabs]').forEach((t) => {
      const btns = $$('[role="tab"]', t);
      const panels = $$('[role="tabpanel"]', t);
      const select = (i, focus) => {
        btns.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
        panels.forEach((p, j) => { p.hidden = i !== j; });
        if (focus) btns[i].focus();
        t.dispatchEvent(new CustomEvent('bz:tab', { detail: { index: i } }));
      };
      btns.forEach((b, i) => {
        b.addEventListener('click', () => select(i));
        b.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          select((i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length, true);
        });
      });
    });
  }

  function faqSearch() {
    const box = $('[data-faq]');
    if (!box) return;
    const input = $('[data-faq-search]', box);
    const items = $$('[data-faq-id]', box);
    const cats = $$('[data-faq-cat]', box);
    const empty = $('[data-faq-empty]', box);
    let cat = 'all';
    const apply = () => {
      const q = input.value;
      const ranked = BZ.searchFaq(q, D.faqs).map((f) => f.id);
      let shown = 0;
      items.forEach((el) => {
        const id = el.dataset.faqId;
        const on = ranked.includes(id) && (cat === 'all' || BZ.byId(D.faqs, id).cat === cat);
        el.hidden = !on;
        el.style.order = q.trim() ? String(ranked.indexOf(id)) : '';
        if (on) shown++;
      });
      empty.hidden = shown > 0;
      $$('[data-faq-ask]', box).forEach((b) => { b.dataset.ask = q.trim() || 'I have a question'; });
    };
    input.addEventListener('input', apply);
    cats.forEach((b) => b.addEventListener('click', () => {
      cat = b.dataset.faqCat;
      cats.forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      apply();
    }));
  }

  /* ---------------- face-safe crops: keep every face inside its frame ---------------- */
  function faces() {
    const F = window.BZ_FACES || {};
    const stem = (src) => (src.split('/').pop() || '').replace(/\.\w+(\?.*)?$/, '');
    const axis = (over, size, a0, a1, prefPct) => {
      if (over <= 0.5) return 50;
      const frame = size - over;
      let off = (prefPct / 100) * over;
      const lo = Math.max(0, a1 * size - frame);
      const hi = Math.min(over, a0 * size);
      off = lo <= hi ? Math.min(Math.max(off, lo), hi) : Math.min(Math.max(((a0 + a1) / 2) * size - frame / 2, 0), over);
      return (off / over) * 100;
    };
    const fit = (img) => {
      const boxes = F[stem(img.currentSrc || img.src)];
      if (!boxes || !boxes.length || !img.naturalWidth) return;
      const fw = img.clientWidth;
      const fh = img.clientHeight;
      if (!fw || !fh) return;
      const s = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      let x0 = 1; let y0 = 1; let x1 = 0; let y1 = 0;
      boxes.forEach(([x, y, w, h]) => {
        x0 = Math.min(x0, x - w * 0.3); x1 = Math.max(x1, x + w * 1.3);
        y0 = Math.min(y0, y - h * 0.5); y1 = Math.max(y1, y + h * 1.3);
      });
      const pref = (img.dataset.pos || '50% 40%').split(/\s+/).map(parseFloat);
      img.style.objectPosition = `${axis(dw - fw, dw, Math.max(0, x0), Math.min(1, x1), pref[0]).toFixed(1)}% ${axis(dh - fh, dh, Math.max(0, y0), Math.min(1, y1), pref[1]).toFixed(1)}%`;
    };
    const all = () => $$('img').forEach((img) => {
      if (img.complete) fit(img); else img.addEventListener('load', () => fit(img), { once: true });
    });
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(all, 120); });
    window.addEventListener('load', all);
    all();
    UI.fitFaces = all;
  }

  /* ---------------- marquees ---------------- */
  function marquees() {
    $$('[data-marquee]').forEach((m) => {
      const group = $('.marquee__group', m);
      if (!group) return;
      if (reduced) { m.classList.add('is-static'); return; }
      // The copy keeps the loop seamless. It stays clickable (half the visible items are copies at any moment)
      // but is hidden from screen readers and skipped by the Tab key, so nothing is announced or focused twice.
      const copy = group.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('a, button').forEach((el) => { el.tabIndex = -1; });
      group.parentNode.appendChild(copy);
      m.classList.add('is-running');
    });
  }

  function misc() {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  function init() {
    motion();
    header();
    modals();
    consult();
    info();
    chat();
    accordions();
    tabs();
    faqSearch();
    faces();
    marquees();
    tilt();
    magnetic();
    counters();
    reveals();
    misc();
    document.documentElement.classList.add('is-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
