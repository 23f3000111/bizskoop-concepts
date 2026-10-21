# Bizskoop two concepts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two complete, clickable concept websites for Bizskoop ("Clear Path" after Agevia, "Gateway" after GrowFast) plus a chooser page, then publish them on GitHub Pages.

**Architecture:** One content file (`shared/js/data.js`, UMD so Node and the browser both read it) feeds a small static generator (`tools/pages.js`) that turns each site's layout, partials, pages and render functions into plain HTML files, including one page per service. Browser behaviour lives in a shared helper file (`core.js`, pure and unit-tested), a shared UI file (`ui.js`: modals, chatbot, forms, motion setup) and one script per concept for its signature scenes. Each concept folder is self-contained (its own copies of shared files, fonts, images) and opens from `file://`.

**Tech Stack:** HTML, CSS, vanilla JS (ES2020, classic scripts), GSAP 3 + ScrollTrigger + SplitText, Lenis; Node 20 (`node --test`, Playwright 1.64 with system Chrome) for build, tests and checks; Python 3.14 (Pillow, OpenCV YuNet) for images and fonts.

**Spec:** `docs/superpowers/specs/2026-10-21-bizskoop-two-sites-design.md`

## Global Constraints

- Folders: `site-a-clear-path/`, `site-b-gateway/`, root `index.html` chooser; generated pages are never edited by hand (edit `src/`, run `node tools/pages.js`).
- Colours: navy `#091932`, logo blue `#4A7CBF`, white, ice `#F4F7FB`, mist `#E6EEF8`, sky `#D3E2F4`. No dark sections, panels, menus or footer.
- Logo: `Logo.png` as is (copied to `assets/img/logo.png` in each site); never redrawn.
- Type: A = Geist + Geist Mono (all sans-serif); B = Newsreader headings + Plus Jakarta Sans text (user direction: one site sans-serif); self-hosted woff2 (latin, latin-ext).
- Visible copy: no U+2014 or U+2013; no invented facts; reviews show initials, never stock faces.
- Works from `file://`: no `type="module"`, no `fetch(` of local files; only the map iframe and outbound links use the internet.
- Every page: `<meta name="robots" content="noindex, nofollow">`, exactly one `<h1>`, footer note "Concept design for Bizskoop Sdn. Bhd. Not the live website."
- Viewports: tuned for 1280 to 1920 px wide; pinned or full-height sections fit 1366 x 630.
- Reduced motion: no Lenis, no pinning, no marquee or tilt; all content visible.
- WhatsApp and phone: `601124244993` / `+60 11-2424 4993`; e-mail `hello@bizskoop.com`; hours Monday to Friday 9:00 to 18:00.

## Review Focus

- A 1366 x 630 window: A's stacked service cards and process arc, B's hero and globe must fit without overlap. Checker screenshots at 1366 x 630 for every home page (Task 9).
- Reduced motion: every `[data-reveal]` element ends visible and nothing is pinned. Checker run with `reducedMotion: 'reduce'` asserts no revealed element below opacity 1 (Task 9).
- Chat input: empty or whitespace input is ignored; HTML typed by the visitor is shown as text, never parsed. `core.test.js` pins `BZ.esc` and the fallback keeps the raw question only inside the encoded WhatsApp link (Task 3).
- Pop-up blockers: when `window.open` returns null for WhatsApp, the form shows the link and an e-mail fallback instead of failing silently. `core.test.js` pins `consultMessage`; the UI path is checked by hand in Task 9.
- Faces in crops: every people photo has a focus point from face detection and no frame cuts a face. `data.test.js` asserts every people image has a focus entry (Task 4).

---

### Task 1: Scaffold, generator and sync

**Files:**
- Create: `.gitignore`, `.gitattributes`, `.nojekyll`, `tools/pages.js`, `tools/sync.js`, `tests/pages.test.js`, `src/shared/partials/icons.html`, `src/site-a/layout.html`, `src/site-b/layout.html`
- Copy: `shared/js/vendor/{gsap,ScrollTrigger,SplitText,lenis}.min.js` from `../Pak Nil/shared/js/vendor/`

**Interfaces:**
- Produces: `pages.build(siteKey) -> string[]` (written paths), `pages.renderFile(siteKey, file) -> {name, html}[]`; SITES `{ 'site-a': 'site-a-clear-path', 'site-b': 'site-b-gateway' }`.
- Page files start with `<!--{"title","description","bodyClass","nav","scripts":[...],"each":"services","file":"{slug}.html"}-->`.
- Template syntax: `{{> partial}}` (site partials, then `src/shared/partials`), `{{key}}` (escaped meta), `{{@fn arg ...}}` calls `require('src/<site>/render.js')[fn](ctx, ...args)` with `ctx = { data, item, site, meta }`; `"each": "services"` renders once per service with `ctx.item`.
- `sync.sync() -> string[]` copies `shared/js/*.js`, `shared/js/vendor/*`, `shared/css/*.css` into `<site>/assets/js|css/`.

- [ ] Step 1: Write `tests/pages.test.js` with `renders partials, meta and directives` (a fixture layout with `{{> x}}`, `{{title}}`, `{{@hello}}` gives the expected string) and `each page renders one file per service`.
- [ ] Step 2: Run `node --test tests/` and see both fail (module missing).
- [ ] Step 3: Implement `tools/pages.js` (adapted from Pak Nil's generator) and `tools/sync.js`.
- [ ] Step 4: Run `node --test tests/` and see them pass.
- [ ] Step 5: `git init`, commit "chore: scaffold generator and sync".

### Task 2: Content file

**Files:**
- Create: `shared/js/data.js`, `tests/data.test.js`

**Interfaces:**
- Produces `window.BZ_DATA` / `module.exports` with: `company` {name, legal, phone, phoneHref, whatsapp, email, hours, address[], mapEmbed, mapLink, reviewsUrl, rating, reviewCount, socials[{id,label,url}], credentials[]}; `stats[]` {id, value, prefix, suffix, label}; `services[]` {id, slug, name, short, icon, image, lead, body[], items[], includes[{title,text}], who[], steps[{title,text}], authorities[ids], faqs[{q,a}], reviews[ids]}; `reviews[]` {id, name, service, text, outcome?}; `authorities[]` {id, short, name, logo, handles, services[ids]}; `faqs[]` {id, cat, q, a}; `faqCats[]`; `industries[]` {id, name, icon, text, services[ids]}; `process[]`; `why[]`; `countries[]` {code, name}; `journeys[]`; `compare[]` {topic, alone, with}; `questions[]` (each matching a chat intent); `chat` {greeting, chips[], intents[{id, keys[], answer, chips[], link?}], fallback}.

- [ ] Step 1: Write `tests/data.test.js`: 7 services with unique ids/slugs and at least 5 items each; every cross-reference (service.authorities, service.reviews, industry.services, authority.services, journey.service, intent.link) resolves; at least 20 reviews and 20 authorities; 10+ FAQs across `faqCats`; no string anywhere contains U+2014 or U+2013; `company.whatsapp === '601124244993'`.
- [ ] Step 2: Run and see it fail.
- [ ] Step 3: Write `data.js` from the captured bizskoop.com text (service pages, About FAQ answers, home figures) and the scraped Google reviews.
- [ ] Step 4: Run and see it pass. Commit "content: Bizskoop data".

### Task 3: Pure helpers

**Files:**
- Create: `shared/js/core.js`, `tests/core.test.js`

**Interfaces:**
- `BZ.esc(s) -> string`; `BZ.waLink(text) -> 'https://wa.me/601124244993?text=…'`; `BZ.mailLink(subject, body)`; `BZ.consultMessage({name,email,phone,code,service,message}) -> string`; `BZ.validateConsult(fields) -> {ok, errors}`; `BZ.normalize(s)`; `BZ.searchFaq(query, faqs) -> faqs[]`; `BZ.chatReply(query, chat) -> {id, answer, chips, link, fallback, wa}`; `BZ.initials(name)`; `BZ.hue(name) -> 0..359`; `BZ.byId(list, id)`.

- [ ] Step 1: Tests: `esc('<b>')` is `&lt;b&gt;`; `waLink('Hi there')` ends `?text=Hi%20there`; `consultMessage` contains name, e-mail, phone with code and the service; `validateConsult` rejects empty name, `a@b`, and a 5-digit phone; `searchFaq('employment pass')[0].id` is the EP FAQ; `chatReply('how long to register a company').id === 'incorporation-time'`; `chatReply('   ')` returns null; `chatReply('qwerty zxcv').fallback === true` and its `wa` contains the encoded question; `initials('Pak Venture') === 'PV'`; `hue` is stable.
- [ ] Step 2: Run, fail. Step 3: Implement (token scoring: whole-key phrase match 3 points, word match 1 point, best intent above 2 wins). Step 4: Run, pass. Commit.

### Task 4: Assets

**Files:**
- Create: `tools/assets.py`, `tools/faces.py`, `tools/fonts.py`, `site-*/assets/img/**`, `site-*/assets/fonts/**`, `site-*/assets/css/fonts.css`, `shared/js/focus.js`, `site-*/CREDITS.md`
- Inputs (git-ignored): `source-assets/website/` (bizskoop.com logos and media), `source-assets/stock/` (Unsplash and Pexels originals), `source-assets/flags/`, `source-assets/icons/`

**Interfaces:**
- Produces image paths used by data and pages: `img/logo.png`, `img/logos/<authority-id>.webp`, `img/people/<name>.webp`, `img/flags/<code>.svg`; `window.BZ_FOCUS = { '<image name>': 'x% y%' }`.

- [ ] Step 1: Extend `tests/data.test.js`: every image path in data exists in both sites; every `img/people/*` has a `BZ_FOCUS` entry.
- [ ] Step 2: Download sources; write `assets.py` (resize to WebP, logos trimmed and padded to one height, favicon) and `faces.py` (YuNet face boxes to focus points); run `fonts.py`.
- [ ] Step 3: Run tests, pass. Commit.

### Task 5: Shared UI and components

**Files:**
- Create: `shared/js/ui.js`, `shared/css/components.css`, `src/shared/partials/{dialogs,chat}.html`

**Interfaces:**
- `BZUI.init({ site })` wires: `[data-open="consult"]` (optional `data-service`), `[data-review="id"]`, `[data-authority="id"]`, `[data-industry="id"]`, `[data-ask="question"]` (opens chat and asks), `[data-accordion]`, `[data-tabs]`, `[data-faq-search]`, `[data-count]`, `[data-reveal]`, `[data-split]`, `[data-tilt]`, `[data-magnetic]`, header `is-scrolled`, Services menu, Lenis + ScrollTrigger (exposes `BZUI.lenis`), reduced motion (`BZUI.reduced`).
- Components read tokens: `--c-ink, --c-accent, --c-surface, --c-line, --radius, --shadow-1, --shadow-2, --font`.

- [ ] Step 1: Build both sites with a stub home page; open in the checker; consult form, chat (ask, chips, fallback), each pop-up and accordion work with no console errors.
- [ ] Step 2: Commit.

### Task 6: Concept A, Clear Path

**Files:**
- Create: `src/site-a/{layout.html, render.js, partials/{header,footer}.html, pages/{index,services,service,about,faq,contact}.html}`, `site-a-clear-path/assets/css/a.css`, `site-a-clear-path/assets/js/a.js`

**Interfaces:**
- Consumes Tasks 1 to 5. `a.js` adds: stacked service cards (sticky, earlier cards scale to 0.94), question chip marquees, pinned process arc (scrub, fits 630 px), compare toggle, hero ticker.

- [ ] Step 1: Write pages and styles per the spec's Concept A list.
- [ ] Step 2: `node tools/sync.js && node tools/pages.js && node --test tests/` pass; checker clean at four sizes. Commit.

### Task 7: Concept B, Gateway

**Files:**
- Create: `src/site-b/…` (same set), `site-b-gateway/assets/css/b.css`, `site-b-gateway/assets/js/{b.js, globe.js, globe-dots.js}`, `tools/globe.py`

**Interfaces:**
- `globe.py` rasterises Natural Earth 110 m land into `window.BZ_GLOBE_DOTS = [[lat, lng], …]` (about 4,000 dots).
- `BZGlobe.mount(canvas, { dots, pins:[{lat,lng,label}], hub:{lat:3.16, lng:101.69} })` draws an orthographic dotted globe, pins and arcs into the hub; pauses off screen; static frame under reduced motion.
- `b.js` adds: hero zoom and parallax, statement fill on scroll, process accordion image swap, services tabs, review carousel, header glass to solid.

- [ ] Step 1: Write pages, styles, globe. Step 2: sync, build, tests, checker clean. Commit.

### Task 8: Chooser, README, credits, rulings

**Files:**
- Create: `index.html`, `assets/{favicon.png, logo.png, preview-a.webp, preview-b.webp}`, `README.md`, `docs/superpowers/rulings/2026-10-21-bizskoop-two-sites.md`
- Modify: `tests/pages.test.js` (chooser links resolve)

- [ ] Step 1: Previews from checker screenshots; chooser on-brand and light. Step 2: README (open locally, the two concepts, what is real, what to confirm, folder map). Step 3: tests pass. Commit.

### Task 9: Verification

**Files:**
- Create: `tools/check.js`

**Interfaces:**
- `node tools/check.js [--sizes 1280x800,1366x630,1440x900,1920x1080] [--reduced] [--shots DIR]` opens every page of both sites from `file://`; fails on console or page errors, failed local requests, broken images, horizontal overflow, revealed elements left hidden.

- [ ] Step 1: Run full checker, normal and reduced; fix failures. Step 2: Review screenshots at 1366 x 630 and 1920 x 1080 (faces, overlaps, empty gaps). Step 3: Commit "fix: …" per issue.

### Task 10: Publish

- [ ] Step 1: `gh repo create 23f3000111/bizskoop-concepts --public --source . --push`, then push with the gh credential helper if plain push 403s.
- [ ] Step 2: Enable Pages from `main` root (`gh api repos/23f3000111/bizskoop-concepts/pages -X POST -f source[branch]=main -f source[path]=/`); wait for the build; load the chooser and one page per concept live.
- [ ] Step 3: Add the live links to README; commit and push.
