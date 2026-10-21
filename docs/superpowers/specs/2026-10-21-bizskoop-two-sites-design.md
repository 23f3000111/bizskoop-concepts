# Bizskoop: two website concepts (design)

Date: 2026-10-21. Approved by the user in chat the same day (direction plus four answers: full site, desktop and laptop, real figures in the "Trusted by" headline, publish to GitHub Pages).

## Intent

Bizskoop Sdn. Bhd. (bizskoop.com, Kuala Lumpur) helps foreign founders, investors, expats and Malaysian SMEs with company incorporation, licensing, Employment Passes, Employer of Record, accounting and tax. The user is pitching a new website. They want two alternative, clickable concept sites the client can choose between, both professional, international and modern, built from Bizskoop's real content.

Success: in a meeting on a laptop, both concepts feel like finished, premium sites; every button and card does something; the client recognises their own services, reviews and regulators; and the two concepts are clearly different directions.

## Goals

- Two complete concepts, each with Home, Services, a page per service (7, one template), About, FAQ and Contact.
- The user's rules of engagement: official logo; white, dark blue and light blue from the logo; professional, international, modern; hover animations (lift, colour change, pop); depth everywhere (layered drop shadows on cards, image frames and elements); clean sans-serif type with proper kerning; clean spacing.
- The user's must-haves: Google reviews, photos of Malaysian, Caucasian, Pakistani and Indian people, the services, real clickable buttons, an FAQ-based chatbot, FAQs, government authority logos, social links, the Google map, clean and neat UI.
- The "Trusted by Expats in 50+ Countries" block from tryconsulting.framer.website (pill label, big headline, a row of round flags, a grid of review cards) in both concepts, headlined with Bizskoop's real figures: "Trusted by 500+ companies and 2,000+ people from around the world".

## Non-goals

- Phone polish. Tuned for 1280 to 1920 px wide desktops and laptops, including a 1366 x 630 viewport (the user's laptop). Phones must not break, nothing more.
- A backend. Forms build a WhatsApp message (or an e-mail) that the visitor sends themselves. The chatbot is scripted, not AI.
- Other languages. English only.
- Blog or news pages.

## Anti-goals (a failure even if it works)

- Dark theme: no dark sections, panels, menus or footer. Navy is for text, buttons and small accents.
- A redrawn or retyped logo.
- Invented facts: no made-up reviews, reviewers, team names, prices, country counts or client logos. Stock faces never sit next to a real reviewer's name (reviews use initials, as Google does).
- Decorative cards that do nothing; faces cut by crops; stickers over hero images; spinning decorations; big empty gaps; em or en dashes in visible copy.
- A template look with placeholder content (the current site's FAQ page is lorem ipsum, and its "trusted by" logos are placeholder names; neither is reused).

## Constraints

- Static HTML, CSS and JS; no build step to open; works from `file://` (no ES modules, no fetch of local files). Only the Google map, the WhatsApp/e-mail/social links and the Google reviews link need the internet.
- Folder pattern of the user's earlier pitches: root `index.html` chooser, `site-a-clear-path/`, `site-b-gateway/`, `shared/js/` (content and helpers, copied into each site by `tools/sync.js`), `src/site-a|site-b/` (layout, partials, pages turned into HTML by `tools/pages.js`), `tools/`, `tests/`, `source-assets/` (raw downloads, git-ignored), `docs/superpowers/`.
- Motion: GSAP + ScrollTrigger + SplitText + Lenis, vendored. Reduced motion shows every piece of content with no pinning, marquees or tilt.
- Pinned or full-height sections fit a 630 px tall viewport.
- Every page is `noindex` and the footer says it is a concept, not the live website.

## Brand

- Logo: `Logo.png` (1536 x 243, navy wordmark with the blue dot). Used as is on light backgrounds.
- Colours from the logo: navy `#091932`, logo blue `#4A7CBF`, white, plus tints of the blue (ice `#F4F7FB`, mist `#E6EEF8`, sky `#D3E2F4`). One deeper hover blue derived from the logo blue.
- Depth: layered navy-tinted shadows (a tight contact shadow plus a soft wide one), deeper on hover; white card faces with hairline borders; photo frames with a white mat and shadow.

## Real content (from bizskoop.com, October 2026)

- Positioning: "Malaysia's Premier Business Services Platform"; "Your trusted partner for company setup, business licensing and immigration support in Malaysia".
- Credentials: MIDA Expert, MDEC Expert, ESD Authorised Consultant. 5.0 on Google from 88+ reviews.
- Figures: 1,000+ businesses incorporated, 98% client satisfaction, 15+ years in Malaysia, 40+ government authorities navigated, 500+ companies served, 2,000+ individuals assisted, 25+ industries, 1,500+ successful cases, incorporation typically in 2 working days after complete documents.
- Seven services: Company Secretarial, Business Licensing, Corporate Advisory, Immigration & Employment Pass, Global Mobility & EOR, Accounting & Tax, Buy & Sell Business, with their sub-services, from the service pages and the FAQ.
- Process: Discovery, Strategy, Execution, Ongoing Support. Why choose: one-stop advisory, fastest processing times, end-to-end accountability, proactive communication, long-term growth, transparent and affordable.
- Ten FAQ answers (the About page has the real ones), ten industries.
- Reviews: the Google reviews on their site and listing (Pak Venture, Global Crave, Ahsan Riaz, Atiqur Rahman and more), each with its service tag.
- 28 regulator logos already on their site: SSM, LHDN, MIDA, MITI, MDEC, MATRADE, Immigration, ESD, KWSP/EPF, PERKESO/SOCSO, HRD Corp, BNM, SC, KPDN, DBKL, CIDB, Customs, Bomba, DOE, DOSH, HDC, IRDA, MOTAC, MyFutureJobs, SIRIM, Xpats Gateway and others.
- Contact: 13-05, Menara Centara, G-01, Jalan Tuanku Abdul Rahman, Chow Kit, 50100 Kuala Lumpur; +60 11-2424 4993 (phone and WhatsApp); hello@bizskoop.com; Monday to Friday 9:00 to 18:00; Facebook, LinkedIn, Instagram and TikTok @bizskoopofficial; the user's Google Maps embed; Google reviews link maps.app.goo.gl/ai9FfwHGYCDCHwsL9.

## Shared features (both concepts)

- Header with a slim utility bar (phone, e-mail, hours, social icons), main nav with a Services menu listing all seven, and a "Book a free consultation" button.
- Free consultation pop-up (name, e-mail, phone with country code, service, message): validates, then opens WhatsApp with the message written, with an e-mail fallback.
- "Ask Bizskoop" chatbot: launcher bottom right; greeting with tap-to-ask chips; keyword matching over an answer bank built from the FAQ and service pages; follow-up chips and links to the right service page; typing indicator; conversation kept for the browser session; anything it cannot answer goes to WhatsApp with the visitor's question pre-filled.
- Trusted block: label, real-figures headline, round flags of countries Bizskoop's clients commonly come from (hover names the country; the set is marked to confirm), 3 x 3 Google review cards (stars, quote, initials avatar, name, service tag, "Google review"), "Read all reviews on Google".
- Authority logos: every logo opens a pop-up saying what Bizskoop handles with that authority and links to the matching service.
- Pop-ups for review cards (full review), industries (which services apply) and authorities. Every card is a link or opens one of these.
- Google map on Contact; social links in the header, footer and Contact.
- People photos from free stock libraries (Unsplash, Pexels): Malay, Chinese and Indian Malaysian, Pakistani, Indian and Caucasian professionals; crops placed from face detection so no face is cut.

## Concept A, "Clear Path" (modelled on agevia.framer.website)

Editorial and structured, like a well-run consultancy. Hairline grid lines; small Geist Mono labels with a square bullet; key words in highlight boxes (logo blue with white text, or sky with navy text); numbered lists. Type: Geist (headings and text) and Geist Mono (labels, numbers in lists).

Home, top to bottom:
1. Light hero: label, headline with a highlight box ("We handle the approvals. You build the business."), short line, two buttons, Google rating with initials stack, credentials; on the right a framed photo pair of a diverse team. Below, a scrolling ticker of real figures in mono.
2. "Every question about doing business in Malaysia" with three rows of scrolling question chips; clicking a chip opens the chatbot and answers it.
3. Four value columns divided by hairlines (from "Why choose us").
4. About strip: "We're Bizskoop..." with highlighted figures, three small value cards, "More about us".
5. Approvals delivered: outcome cards from real reviews (ESD approved in 4 days, MD Status secured, EP and DP renewed, company set up within a week), then a grid of regulator logos.
6. Services: cards that stick and stack as you scroll, each with icon tile, description, a blue duotone photo that turns full colour on hover, and a numbered sub-service list in mono; each links to its service page.
7. Industries: ten chips with icons, each opening a pop-up.
8. Process: "From first call to approval in four moves", a pinned arc whose four steps light up as you scroll.
9. Numbers: raised stat cards with sub-figures.
10. "Side by side, the choice is easy": On your own versus With Bizskoop, with a toggle.
11. Trusted block.
12. FAQ preview with "Ask the assistant" and "All FAQs".
13. Closing call to action on a light-blue panel with a photo.
14. Light footer.

Inner pages share the language: Services (all seven with full lists and the stacked cards), Service template (hero, overview, what is included, who it is for, steps, regulators involved, related FAQs and reviews, other services), About (story, figures, process, credentials, featured review with an accordion list), FAQ (search plus categories), Contact (office card, form, map, socials).

## Concept B, "Gateway" (modelled on growfast.framer.website)

Calm, premium corporate. Big rounded photos (24 to 28 px radius), soft ice panels, pill tabs and buttons with an arrow circle, bento grids. Type: Newsreader (serif, headings) with Plus Jakarta Sans (text and interface). User direction on 21 October, mid-build: "use sans serif font for one site", so Concept A stays all sans-serif and Concept B carries the serif.

Home, top to bottom:
1. Rounded full-height photo hero with figures along the top (1,000+ businesses incorporated, 15+ years, 5.0 Google rating), a three-part headline ("Register your company. Secure your passes. Grow in Malaysia."), a short line and a consultation button; a glass pill header floats over it and turns solid on scroll.
2. Regulator logo strip (grey to colour on hover, clickable).
3. About statement that fills in word by word as you scroll, with an inline photo pill, and four counters.
4. "Where are you in your Malaysia journey?": four path cards (starting a company, running a Malaysian business, hiring foreign talent, moving to Malaysia), each with checklist and button.
5. "The system behind every approval": accordion of the four process steps beside a photo that changes per step.
6. Services panel with seven pill tabs: photo, description, numbered points, button to the service page.
7. Signature: a slowly turning dotted globe (canvas, no library) with pins in clients' home regions and arcs flowing into Kuala Lumpur, leading into the Trusted block.
8. "Why choose Bizskoop" bento of photos and figures.
9. Review carousel with large quotes.
10. FAQ beside a portrait, with an "Ask the assistant" card.
11. Closing call to action and a light footer with a big closing line.

Inner pages follow the same language and content set as A.

## Left to the builder

Exact copy wording within the real facts; the photo choices; the flag set (marked to confirm); icon set (free licence); section spacing; which reviews go where; test and checker details. Every judgement call goes in `docs/superpowers/rulings/2026-10-21-bizskoop-two-sites.md`, and the README lists what is real and what Bizskoop should confirm.
