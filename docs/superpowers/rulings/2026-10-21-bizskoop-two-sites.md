# Decisions log: the two Bizskoop website concepts

Every decision taken on the client's behalf while building both concepts, in the order it was made. Each line says what was decided, why, and what it costs if it turns out wrong.

## User decisions (21 October 2026)

- Two concepts: A "Clear Path" modelled on agevia.framer.website, B "Gateway" modelled on growfast.framer.website; both carry the "Trusted by" block of tryconsulting.framer.website.
- Full site per concept (Home, Services, seven service pages, About, FAQ, Contact); desktop and laptop first; the "Trusted by" headline uses the real 500+ companies and 2,000+ people; publish on GitHub Pages.
- Mid-build: "use sans serif font for one site". Concept A stays all sans-serif (Geist); Concept B takes serif headings (Newsreader) with Plus Jakarta Sans text.

## Rulings

- Setup: Ruling: build on `main` of the new repo, no worktree, the repo was created for this plan, has nothing to protect, and the user's pitches publish from `main`, cost if wrong: none (history can be rebased before publish).
- Setup: Ruling: final review is a self-review, the session rules and the user's standing preference say no subagents unless asked, cost if wrong: weaker review; the user judges the built sites anyway.
- Task 1: Ruling: layouts and icon partial move to Tasks 5 to 7, where their markup is designed, Task 1 only needs the generator and sync to be testable, cost if wrong: none.
- Task 2: Ruling: review count shown as "5.0 from 90+ Google reviews", the listing shows 93 today and bizskoop.com says 88+; 90+ stays true as it grows, cost if wrong: one string.
- Task 2: Ruling: seven full review texts (five read logged out on Google Maps, two quoted on bizskoop.com); the other 19 reviewers appear by name and service only, Google shows only five reviews logged out and Search raised a CAPTCHA, which was not bypassed, cost if wrong: paste more texts into data.js.
- Task 2: Ruling: Corporate Advisory, Immigration, Global Mobility, Accounting and Buy & Sell pages on bizskoop.com are unfinished copies of the secretarial template, so their content is expanded from the home cards, FAQ answers, review tags and blog topics, with no invented figures or timelines, cost if wrong: copy edits; flagged in README.
- Task 2: Ruling: authority pop-ups describe what each authority does and which Bizskoop service deals with it, not claims of special status (except the ESD Authorised Consultant credential Bizskoop states itself), cost if wrong: copy edits.
- Task 2: Ruling: the "KPD" logo on bizskoop.com is the bare national coat of arms, not an agency mark, and its use is restricted; left out, cost if wrong: one logo.
- Task 2: Ruling: the ESD logo on bizskoop.com is MYXpats by TalentCorp (ESD became the MYXpats Centre), so it is labelled "ESD" with "MYXpats Centre (formerly ESD)" in the pop-up, cost if wrong: one label.
- Task 2: Ruling: contact uses +60 11-2424 4993 for calls and WhatsApp (bizskoop.com's main CTA), hello@bizskoop.com and Monday to Friday 9:00 to 18:00 (the site-wide top bar); the alternates (+60 14-744 2660 in one link, bizskoop@gmail.com, 9am to 5pm) are noted in README, cost if wrong: data fields.
- Task 2: Ruling: "15+ years in Malaysia" (home page) is used; the About page says "12+ experiences", flagged in README, cost if wrong: one number.
- Task 2: Ruling: the flag row lists 14 countries consistent with the reviewers and Bizskoop's market, marked "to confirm" in README; no country count is claimed, cost if wrong: edit the list.
- Task 3: Ruling: chat scoring weighs each matched key phrase by its word count, ties go to list order, and a generic 'timing' intent sits last; EP timing answers honestly that it depends (no invented processing times), cost if wrong: key tuning in data.js.
- Task 4: Ruling: all people and place photos are Unsplash free-licence images (57, credited per file in each site's CREDITS.md); no stock face is ever paired with a real reviewer, cost if wrong: swap files in tools/assets.py PHOTOS.
- Task 4: Ruling: Malay men in business dress are scarce on free libraries, so Malaysian men are represented by a team of young Malaysian-looking professionals and Chinese and Indian Malaysian portraits; Malay women by hijab portraits, cost if wrong: swap one or two photos.
- Task 4: Ruling: both concepts share one photo library; unused files are pruned per site before publishing, cost if wrong: none.
- Task 4: Ruling: favicon is the logo's own B and dot on a white rounded tile (no redraw), cost if wrong: one image.
- Task 4: Ruling: face boxes come from OpenCV YuNet (score >= 0.75) and drive object-position at runtime, as on Kilauan, cost if wrong: hand-tune a box in faces.js.
- Task 6: User direction (21 Oct, mid-build): "use sans serif font for one site". Ruling: read as one concept all sans-serif and the other with a serif, Concept A keeps Geist and Geist Mono; Concept B gets Newsreader for headings with Plus Jakarta Sans for text, cost if wrong: one font token in b.css.
- Task 5: Ruling: Task 5 verified on Concept A's pages rather than a stub page (tools/interact.js clicks the form, chat, pop-ups, accordion and FAQ search; all pass), the stub would have been thrown away, cost if wrong: none.
- Task 5: Ruling: chat history stores only the visitor's text and intent ids; replies are rebuilt from data.js, and visitor text is always rendered with textContent, closes a self-XSS path through sessionStorage, cost if wrong: none.
- Task 5: Ruling: the chat teaser waits until the visitor scrolls past the first screen, then 4 s, once per session, the user rejects stickers over hero images, cost if wrong: one timer.
- Task 6: Ruling: A's hero is a three-column photo wall of a Malay woman in a hijab, a Pakistani man, a Chinese Malaysian man, an Indian woman, a Caucasian woman and a Malaysian team (the user's list), with the "approvals" highlight as the one orchestrated load moment; the approval tracker card moved to the About strip so nothing sits on the hero photos, cost if wrong: swap tiles.
- Task 6: Ruling: service photos in A's stacked cards are blue duotone and turn full colour on hover (the user asked for colour changes on hover), cost if wrong: one CSS rule.
- Task 6: Ruling: numbered markers only where the content is a sequence (process steps, stages); service lists use check marks, cost if wrong: none.
- Task 6: Ruling: the tracker card is labelled "Example case file", as bizskoop.com labels its own mock overview "Example", it illustrates the service, not a client record, cost if wrong: copy edit.
- Task 7: Ruling: B reuses A's markup for generic parts (FAQ items, stages, includes, licences, contact cards, review cards) restyled by b.css, and has its own home sections, header, footer and service hero, the visitor sees two different designs, the build keeps one source of truth, cost if wrong: none visible.
- Task 7: Ruling: B pages end with the footer's big call to action instead of a separate closing band, avoids two calls to action back to back (the user dislikes empty, repetitive space), cost if wrong: one section per page.
- Task 7: Ruling: the globe gently swings around Kuala Lumpur instead of spinning fully, so the hub and most arcs stay in view; arcs are capped inside the canvas; it pauses off screen and draws one still frame under reduced motion, cost if wrong: constants in globe.js.
- Task 7: Ruling: pins sit on each country's capital or main business city (Islamabad, New Delhi, Dhaka, Beijing, Singapore, Jakarta, Dubai, Riyadh, Cairo, Astana, London, New York, Sydney), illustrative of where clients come from, not client addresses, cost if wrong: coordinates in b.js.
- Task 7: Ruling: no stock face sits next to a reviewer's name in B's carousel or review grid; quotes carry initials only, cost if wrong: none.
