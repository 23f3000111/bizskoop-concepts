# Bizskoop: two website concepts

Two alternative websites for Bizskoop Sdn. Bhd. (bizskoop.com, Kuala Lumpur), so the client can pick a direction. Both use the same real content: services, Google reviews, regulators and contact details from bizskoop.com and Bizskoop's Google listing. They differ in look, type, layout and motion.

Tuned for desktop and laptop screens (1280 to 1920 px wide), including a short 1366 × 630 laptop window. Phones do not break, but were not polished.

## Live

Links are added here once the sites are published on GitHub Pages.

## Open it locally

- Double-click `index.html` in this folder. It is a chooser page that links to both concepts.
- Or open a concept directly: `site-a-clear-path/index.html` or `site-b-gateway/index.html`.
- Everything is local, including fonts, so the sites work offline and straight from disk. Only the Google map and the outbound links (WhatsApp, e-mail, Google reviews, social media) need the internet. There is no build step.
- For the smoothest result in a meeting, serve the folder instead: `python -m http.server 8811`, then open <http://127.0.0.1:8811/>.

## The two concepts

| | Concept A: Clear Path | Concept B: Gateway |
|---|---|---|
| Modelled on | agevia.framer.website | growfast.framer.website |
| Feel | Editorial and structured, like a well-run consultancy | Calm, premium and photo-led |
| Type | Geist and Geist Mono, all sans-serif | Newsreader (serif headings) and Plus Jakarta Sans (text) |
| Hero | "We handle the approvals. You build the business." with a highlight that draws in, beside a wall of portraits (a Malay woman in a hijab, Pakistani, Chinese Malaysian, Indian and Caucasian professionals, a Malaysian team) and a ticker of real figures | A full-height rounded photo with real figures and "Register your company. Secure your passes. Grow in Malaysia." under a floating glass header |
| Signature | A moving wall of questions clients ask, each answered by the assistant on a tap; service cards that stack as you scroll, turning from blue duotone to full colour on hover; a pinned four-step process arc; a side-by-side comparison | A turning dotted globe with arcs from clients' home countries into Kuala Lumpur; journey cards; service tabs; a statement that fills in as you read; a bento grid; a review carousel on every service page |
| Both | Google reviews with a flags row and review grid ("Trusted by 500+ companies and 2,000+ people from around the world"), 26 regulator logos that open a pop-up each, the "Ask Bizskoop" FAQ assistant, a free-consultation form that writes a WhatsApp message, FAQ search, industries, the Google map, social links | |
| Folder | `site-a-clear-path/` | `site-b-gateway/` |

Each concept has 12 pages: Home, Services, seven service pages (`company-secretarial.html`, `business-licensing.html`, `corporate-advisory.html`, `immigration-employment-pass.html`, `global-mobility-eor.html`, `accounting-tax.html`, `buy-sell-business.html`), About, FAQ and Contact.

## Things to try in a meeting

- Hover any card: it lifts, its shadow deepens and its colours change. Regulator logos go from grey to colour; A's service photos go from blue to full colour.
- Click a question on A's question wall, or any "Ask the assistant" button: the chat opens and answers. Type your own question; anything it cannot answer goes to WhatsApp with the question already written.
- Click "Book a free consultation", submit it empty to see the checks, then fill it in: WhatsApp opens with the details. Nothing is stored on the site.
- Click a review, a regulator logo or an industry for its pop-up.
- In B, drag the globe.

## What is real

- Services, sub-services, process, figures (1,000+ businesses incorporated, 98% satisfaction, 15+ years, 40+ authorities, 500+ companies, 2,000+ individuals, 25+ industries, 1,500+ cases), credentials (MIDA Expert, MDEC Expert, ESD Authorised Consultant), FAQ answers, licence timelines, the premise-licence document list and the company requirements, all from bizskoop.com.
- Google rating 5.0 and 90+ reviews (93 on the listing in October 2026). Seven full review texts: five read on Bizskoop's Google listing (Pak Venture, Ahsan Riaz, Faizan Ali, Kanij Fatima, Haikal HR) and two quoted on bizskoop.com (Atiqur Rahman, Global Crave). Nineteen more reviewers appear by name and service only, as on bizskoop.com.
- Regulator logos as published on bizskoop.com. Address, phone, WhatsApp, e-mail, hours, social accounts and the Google map embed.

## To confirm with Bizskoop

- **Service pages written from their summaries.** On bizskoop.com, the Corporate Advisory, Immigration, Global Mobility, Accounting and Buy & Sell pages are unfinished copies of the secretarial page. Their content here is expanded from the home page cards, FAQ answers, review tags and blog topics, with no invented figures or timelines.
- **Flags.** The 14 countries in the "Trusted by" row reflect the reviewers and Bizskoop's market; no country count is claimed. The globe's pins use the same list.
- **Inconsistencies on their site:** "15+ years" (home) against "12+ experiences" (About); hours 9:00 to 18:00 (top bar) against 9am to 5pm (contact strip); e-mail hello@bizskoop.com shown but bizskoop@gmail.com in some links; a second WhatsApp number (+60 14-744 2660) in one link. The concepts use 15+ years, 9:00 to 18:00, hello@bizskoop.com and +60 11-2424 4993.
- **Photos** are free stock images (see each concept's `CREDITS.md`); none shows Bizskoop staff or clients. Swap in team photos when available.
- The "Example case file" tracker in A and the chat assistant are proposals, not existing Bizskoop features.

Every judgement call is logged in `docs/superpowers/rulings/2026-10-21-bizskoop-two-sites.md`.

## Folder map

```
index.html                 chooser page: start here
assets/                    chooser previews, logo and favicon
site-a-clear-path/         Concept A, ready to open
site-b-gateway/            Concept B, ready to open
shared/js/                 data.js (all content), core.js (helpers), ui.js (chat, forms, pop-ups, motion), faces.js
shared/css/                components.css (chat, modals, forms)
src/site-a/, src/site-b/   page sources: layout, partials, pages, render.js
src/shared/                icon sprite, dialogs and chat markup, render helpers
tools/                     pages.js (build pages), sync.js (copy shared files), assets.py, faces.py, fonts.py, globe.py, check.js, interact.js
tests/                     node tests for content, helpers and built pages
docs/superpowers/          design spec, plan and decisions log
```

## Editing

- Content lives in `shared/js/data.js`. Page layouts live in `src/`. After editing, run from this folder: `node tools/sync.js && node tools/pages.js`. Never edit the generated `*.html` inside the concept folders by hand.
- Checks: `node --test tests/` (content, helpers, every page and link), `node tools/check.js` (opens every page at 1366 × 630, 1440 × 900 and 1920 × 1080 and fails on errors, missing files, broken images, sideways scrolling or hidden content; add `--reduced` for reduced motion), `node tools/interact.js a` and `node tools/interact.js b` (clicks the form, chat, pop-ups and FAQ search).
