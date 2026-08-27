# Website Improvement Report — mlechko-magazin.com

**Date:** 2026-08-25
**Scope:** `index.html` (1939 lines, single-page, all CSS and JS inline), plus `cookie-policy.html`, `vercel.json`, `sitemap.xml`, and the `images/` and `Enhanced images/` asset folders.
**Status:** Analysis only. No files have been changed.

This report is written to be executed. Every finding names the file and line responsible, classifies how binding the recommendation is, and states an objectively checkable condition for "done".

---

## How to read this report

### Per-item schema

Every item in sections A and D carries the same fifteen fields:

> Location · Device · Problem · Observed behaviour · Code cause · File/line · Why it hurts · Business impact · Recommended change · Recommendation type · Acceptance criteria · Expected result · Priority · Complexity · Verification method

### Business impact

`Visit intent` · `Trust` · `Usability` · `SEO` · `Performance` · `Accessibility` · `Visual polish`

The business here is a physical shop. The website's job is a short journey: **looks credible → they have what I want → I trust them → I know where they are → I go or I call.** Items are judged against that, not against a design checklist.

### Recommendation type

This label decides how binding an item is. **Do not treat every recommendation as mandatory.**

| Type | Meaning |
|---|---|
| **Verified defect** | Reproduced in the code. Fix it. |
| **Confirmed content correction** | The correct value has been confirmed. Apply it. |
| **Recommended improvement** | Sound practice, low controversy. Apply unless there is a reason not to. |
| **Experiment / hypothesis** | Plausible but unproven. Needs a go-ahead and a success metric before building. |
| **Requires business confirmation** | Blocked on a fact only the owner knows. Do not guess. |

### Priority

`P0` correctness, trust, legal, accessibility · `P1` performance and conversion · `P2` mobile visual UX, content and trust · `P3` polish

---

## M. Guardrails

Hard constraints on implementation. These exist to prevent scope creep, and they outrank any recommendation in this report.

1. **The site stays single-page.** No routing, no new pages, no navigation restructure.
2. **No framework migration.** No build step. No animation library. No CSS framework.
3. **No redesign from scratch.** Preserve the existing visual identity: the palette at `index.html:142-155`, the Playfair Display / Inter pairing, the wave dividers, the card and shadow language.
4. **Preserve reduced-motion support** (`index.html:940-944`). Extend it where it is currently missing; never remove it.
5. **Preserve vertical page scrolling** when modifying the carousel. `touch-action: pan-y` (`index.html:738`) stays.
6. **Invent nothing.** No ratings, review counts, opening hours, differentiators, product claims, or statistics that have not been confirmed by the owner. Anything unverifiable is written as a question, never as an assertion.
7. **No feature requiring ongoing owner maintenance** unless explicitly justified and accepted. This is what gates the "open now" indicator.
8. **Smallest maintainable change.** Do not refactor adjacent code opportunistically.
9. **Bulgarian copy contains no em dashes.** Use commas, periods, or restructure the sentence.

---

## A. Requested changes

---

### A1 — Hero subheading copy

| Field | Detail |
|---|---|
| **Location** | Hero section, three rotating slides |
| **Device** | Both |
| **Problem** | All three subheadings contain em dashes. Each one either restates its own heading or states a bare fact with no reason for the customer to act. None of them expands the heading. |
| **Observed behaviour** | Slide 3's subheading repeats both halves of its heading verbatim: the heading says "Над 30 вида продукти. Всеки ден пресни." and the subheading says "Над 30 продукта от проверени производители — доставени всяка сутрин." The line is dead space. Slide 2's subheading is an address. Slide 1's subheading lists the three product categories that the category cards further down already show. |
| **Code cause** | The three `.hero-panel` divs hold their copy as hardcoded inline HTML. There is no data array to edit. Panels are toggled by adding and removing `.active` in `gotoHero()`, on a 6-second `setInterval`. |
| **File/line** | `index.html:1164-1190` (markup), `index.html:1754-1766` (rotation logic) |
| **Why it hurts** | The hero is the only content guaranteed to be seen. Three chances to give a reason to visit are spent on repetition and an address. The em dashes are also inconsistent with the rest of the site's punctuation. |
| **Business impact** | Visit intent |
| **Recommended change** | Replace all three subheadings per section B. Slide 3's heading also changes from "Над 30" to "Над 100" (see D6). |
| **Recommendation type** | **Recommended improvement** (copy), plus **Confirmed content correction** for the 30 → 100 change |
| **Acceptance criteria** | Done when all three subheadings are replaced, no em dash appears in any hero string, no subheading repeats a noun phrase from its own heading, and the "над 30" in slide 3's heading reads "над 100". |
| **Expected result** | Each slide states a distinct reason to visit rather than restating itself. |
| **Priority** | P1 (conversion) |
| **Complexity** | Small |
| **Verification method** | Read the three panels in the browser at 375px and 1440px; confirm the subheading is not clipped at either width. Grep the file for `—` to confirm no em dashes remain in hero copy. |

---

### A2 — Scroll-reveal sequencing

| Field | Detail |
|---|---|
| **Location** | Whole page. Most visible in About, Our Products, the three product subcategory sections, FAQ, and Find Us. |
| **Device** | Both, with different symptoms on each |
| **Problem** | Content groups animate together instead of unfolding in reading order, and in several places an image animates before the text that visually precedes it. |
| **Observed behaviour** | Entire sections appear at once rather than element by element. In the product subcategory sections on mobile, the image reveals before the heading above it. Timing feels inconsistent between sections. |
| **Code cause** | **Two uncorrelated staggers are stacked on top of each other.** One comes from scroll geometry — each element is observed individually and reveals when it personally crosses the trigger line. The other comes from static CSS `transition-delay` classes. Neither knows about the other, and their sum is what reads as inconsistent. Specific defects listed below. |
| **File/line** | `index.html:193-206` (CSS `.reveal` and `.reveal-delay-1..7`), `index.html:1651-1668` (the IntersectionObserver) |
| **Why it hurts** | Motion that fires in the wrong order draws attention to itself instead of guiding the eye. It is the most visible symptom on the page but the least consequential to a customer, which is why it is P2 and not higher. |
| **Business impact** | Visual polish |
| **Recommended change** | Replace the observer callback with group-and-batch indexing. Details below. **Do not re-assign the delay classes** — see "Rejected approach". |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when, scrolling at a normal pace on both mobile and desktop: (a) no two elements within one section start their reveal in the same frame unless they are visually side by side; (b) in every product subcategory section, on both mobile and desktop, the eyebrow and heading start before the image; (c) an element scrolled into view in isolation reveals with no perceptible delay; (d) no element waits longer than ~500ms from its trigger to the end of its transition; (e) `prefers-reduced-motion: reduce` still results in no motion. |
| **Expected result** | Content unfolds in visual reading order, one element at a time, at a consistent pace across every section. |
| **Priority** | P2 |
| **Complexity** | Moderate |
| **Verification method** | Real browser, not Puppeteer — `index.html:1661` force-reveals every element when `navigator.webdriver` is true, so screenshots cannot verify sequencing. Test at 375px and 1440px, scrolling slowly and at normal speed. Then re-test with reduced motion enabled at OS level. |

#### Verified defects

**Delay collisions** — two sequential elements carrying the same delay class, so they fire in the same frame:

| Section | Colliding elements | Lines |
|---|---|---|
| FAQ | `h2` and the first `<details>` both `reveal-delay-1`; the `p` and the second `<details>` both `reveal-delay-2` | `1475`, `1479`, `1476`, `1483` |
| Our Products | Header runs 0 / .1 / .2 and the card grid restarts at 0 / .1 / .2 | `1306-1308`, `1311`, `1323`, `1335` |
| About | Second paragraph and first bullet both `reveal-delay-3` — **desktop only**, since `.about-text-desktop` is hidden below 768px | `1272`, `1275`, `601-603` |

**About on mobile is a full parallel double-stagger** — larger than the collision above. `.about-collage { order: 2 }` puts the three images below the text, but the collage runs 0 / .1 / .2 *simultaneously* with the text block's 0 / .1 / .2. Two independent sequences race each other.
`index.html:1009`, `1256`, `1260`, `1263`

**Image before text** — `.feature-image` carries bare `.reveal` with no delay (0s) while the text eyebrow carries `reveal-delay-1` (0.1s). On mobile, `.feature-image { order: 2 }` moves the image below the text, so the image reveals first. **This is also true on desktop for the Eggs section**, where `.feature-inner.flipped .feature-image { order: 2 }` moves the image to the right column, so the reveal starts from the right.
`index.html:1360-1364`, `1026`, `702`

**Find Us collision is mobile-only** — on desktop the two columns sit side by side, so a shared delay reads as intentional parallelism. On mobile the grid collapses to one column and the map, at `reveal-delay-3`, fires *before* the phone (`delay-4`) and email (`delay-5`) blocks that sit visually above it.
`index.html:1557`, `1524`, `773`, `1056`

**`align-items: center` is the dominant desktop cause** — not the threshold. On `.about-inner`, `.feature-inner` and `.visit-inner`, centring two columns of different heights gives them different top edges *by construction*. The taller image column crosses any horizontal trigger line first, regardless of `threshold` or `rootMargin`. No amount of observer tuning fixes this; only sorting on rendered position does.
`index.html:593`, `700`, `773`

**Threshold effect is real but second-order** — at `threshold: 0.08` a ~17px eyebrow triggers after ~1.4px is visible, while a ~423px feature image needs ~34px. That is 40ms of scroll at a fast flick and ~300ms at a slow drag. Worth fixing, but it is not the main cause.
`index.html:1659`

**Testimonials has no `.reveal` at all** — see D8, which asks whether it should.

#### Recommended approach: group and batch-index at intersection time

Roughly fifteen lines in the observer callback. **Zero HTML edits.**

The observer already delivers everything that crossed the trigger line in one scroll tick as a single `entries` array. That array *is* "the group that entered together". So:

1. **Group the intersecting entries by nearest section container first.** This matters: two elements from adjacent sections can cross in the same callback, and they must not be staggered as one sequence.
2. **Within each group, sort by `entry.boundingClientRect.top`** (already supplied by the observer, so no forced reflow), falling back to `left` for ties.
3. **Assign an inline `style.transitionDelay`** from the within-group index, then add `.visible`.

Why this is the right mechanism:

- **Inline style beats the `.reveal-delay-N` classes on specificity**, so all ~50 existing classes are silently overridden and become deletable dead weight. The change is reversible by deleting one function.
- **Sorting on rendered `y` automatically respects every `order:` flip** — `index.html:1026`, `702`, `1009`, `1056` — so every mobile-specific override that would otherwise be needed simply disappears.
- **It fixes `align-items: center`**, because it sorts on actual rendered position rather than DOM order.
- **An element entering alone gets index 0 and therefore no delay.** Static delay classes cannot distinguish "entered as part of a group" from "entered alone"; this can.
- The `navigator.webdriver` escape hatch at `index.html:1661` gets *better* — elements become visible with no delay assigned at all.

Also change the observer options to `{ threshold: 0, rootMargin: '0px 0px -12% 0px' }` so short and tall elements share one consistent trigger line.

**Motion budget** — cap the duration, not only the delay:

- Transition duration 350–500ms
- Total stagger within a group capped at ~420ms
- **Cumulative wait for any single element ≤ ~500ms** from trigger to animation end
- Subtle translate distance (the current 30px is at the upper limit; 16–20px reads better at this speed)
- One easing curve across the whole page

A 420ms delay plus a 700ms transition would still feel sluggish, which is why the duration needs a ceiling too.

Note: the `will-change` reset at `index.html:1656` hardcodes 1600ms. Under the new system the delay is known at assignment time, so tie the timeout to it rather than to a constant.

#### Rejected approach

**Re-assigning the delay classes.** It looks like the obvious fix and it is the wrong one:

- Touches ~50 class attributes across `index.html:1208-1621`
- Requires a duplicated delay scale inside `@media (max-width: 768px)`, which invites specificity fights in a file that already has them
- Requires extending the scale to `.reveal-delay-8..11` (mobile About alone needs 10 steps)
- `.reveal-delay-9` = 900ms delay + 700ms duration = 1600ms, colliding exactly with the hardcoded `will-change` reset at `index.html:1656`; anything beyond that drops `will-change` mid-animation
- Leaves the "used-up delay" problem: an element that scrolls into view alone still sits blank for 900ms for no reason
- **And it still does not fix `align-items: center`**

**Observing section containers instead of elements.** Also rejected: a 900px-tall `.about-inner` triggers as soon as its top sliver crosses the line, firing the whole sequence while most of the section is still below the fold.

#### Trade-off to accept

Under a slow drag, entries arrive one per callback and every element gets index 0, so the stagger dissolves into pure scroll-position timing. This is arguably correct — at that speed the scroll position *is* the stagger — and can be mitigated by chaining callbacks that arrive within a short window. Tune if it reads badly.

---

### A3 — New in-store showcase section

Fully specified in **section C**. Summary of the audit position:

| Field | Detail |
|---|---|
| **Location** | New section, to be inserted after `#olives-feature` and before `#testimonials` |
| **Device** | Both |
| **Problem** | The site describes the product range in words but never shows it. A visitor cannot tell what is actually in the shop before travelling there. |
| **Code cause** | No such section exists. |
| **File/line** | Insertion point: after `index.html:1438`, before `index.html:1443` |
| **Why it hurts** | The single largest unanswered question for a first-time visitor to a physical shop is "is this worth the trip?" Nothing on the page answers it visually. |
| **Business impact** | Visit intent |
| **Recommendation type** | **Recommended improvement**, currently **blocked** — the photographs do not exist yet. Section C includes a shot list. |
| **Acceptance criteria** | Done when the section renders at 320–1440px with no cropped display cases, every image retains its natural aspect ratio, the section ends with a directions CTA, and the D7 divider fix is in place (the new section lands exactly on that transition). |
| **Priority** | P2 |
| **Complexity** | Moderate |
| **Verification method** | Visual check at every width in section K; confirm no image has a fixed `aspect-ratio` or `object-fit: cover` applied. |

---

### A4 — Mobile product subcategory cards

| Field | Detail |
|---|---|
| **Location** | Our Products section, category cards |
| **Device** | Mobile |
| **Problem** | The text block overwhelms the card. The card feels cramped and compressed, and the internal hierarchy collapses. |
| **Observed behaviour** | On a 375px screen the overlaid content occupies roughly 85–90% of the card, leaving almost no visible image. |
| **Code cause** | **The defect is card height, not font size.** `.category-card` has `aspect-ratio: 1` inside a two-column grid. At 375px with 24px section padding and a 14px gap, each card is ~156px wide, and `aspect-ratio: 1` therefore makes it **~156px tall**. The overlaid `.category-content` needs roughly 140px: 28px of vertical padding, a ~24px tag, a ~23px heading, a paragraph that wraps to two lines at ~42px, and a ~22px CTA. The gradient begins at 60% of the card, so the text extends well past where the image is still legible. |
| **File/line** | `index.html:649-651` (base), `index.html:1014-1022` (mobile overrides), `index.html:1016` (`aspect-ratio: 1`), `index.html:1017` (the third card's `grid-column: 1 / -1` special case) |
| **Why it hurts** | Category cards are the entry point to the whole product story. If they look compressed, the shop looks compressed. Shrinking the type further — the obvious fix — would make it worse, pushing labels toward the 8px unreadability already present in the stats bar (D5). |
| **Business impact** | Usability, Visual polish |
| **Recommended change** | Switch the mobile grid to a **single column** with `aspect-ratio: 3/2`. At 375px that gives a ~327×218px card, so the same ~140px text block occupies ~64% instead of ~90%, and the image finally has room. Raise `.category-content` padding to ~20px, increase the card gap to ~16px, and keep the content overlaid — the gradient and tag treatment are working and should be preserved. This change also removes the need for the `grid-column: 1 / -1` special case on the third card, deleting an inconsistency. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when, at 320px, 375px and 430px: the overlaid text block occupies no more than ~65% of card height; no text is clipped; the category paragraph wraps to at most two lines; and no card uses a different aspect ratio or column span from its siblings. |
| **Expected result** | Cards read as deliberately composed rather than compressed, with the product photography actually visible. |
| **Priority** | P2 |
| **Complexity** | Small — roughly eight lines inside the existing `@media (max-width: 768px)` block |
| **Verification method** | Visual check at 320 / 375 / 430px. Measure the content block against card height in devtools. |

**Alternative if a single column is judged too tall:** keep two columns but move the text *out* of the overlay into a solid block beneath the image (card = 4/3 image + text block). This removes the compression problem entirely rather than mitigating it, but it is a larger visual change and departs further from the current design language. The single-column option is recommended because it preserves the existing treatment.

---

### A5a — Mobile reviews carousel: disable drag and swipe

| Field | Detail |
|---|---|
| **Location** | Testimonials carousel |
| **Device** | Mobile |
| **Problem** | Reviews can be browsed by swiping. They should be navigable only by the left and right arrows. |
| **Observed behaviour** | A horizontal flick advances the carousel. |
| **Code cause** | This is **flick detection, not drag** — the cards never follow the finger. A `touchstart` listener records the X position and clears the autoplay timer; a `touchend` listener compares positions and advances if the delta exceeds 50px. |
| **File/line** | `index.html:1857-1858` |
| **Why it hurts** | Not a defect in itself; this is a deliberate product decision. The cards should feel static and controlled. |
| **Business impact** | Usability |
| **Recommended change** | Remove both listeners. Three things must be preserved: **(a)** `touch-action: pan-y` at `index.html:738` stays, so the page still scrolls vertically over the carousel; **(b)** autoplay pause currently rides on `touchstart`, so it needs re-homing onto the arrow handlers and a `visibilitychange` listener; **(c)** `user-select: none` at `index.html:738` can stay. |
| **Recommendation type** | **Recommended improvement** (a product decision, not a bug) |
| **Acceptance criteria** | Done when, on a real touch device: a horizontal flick over the carousel does nothing; a vertical swipe over the carousel scrolls the page normally; both arrows still advance; and the carousel still loops seamlessly. |
| **Expected result** | Reviews advance only via the arrows. |
| **Priority** | P1 (bundled with A5b, same code region) |
| **Complexity** | Small |
| **Verification method** | Real iPhone and real Android. Emulated touch does not reproduce momentum scrolling. |

**Accessibility note:** WCAG 2.2 success criterion 2.5.7 (Dragging Movements) requires a single-pointer alternative wherever dragging is offered. The arrows already provide it, so removing swipe does not create a conformance problem. It removes one.

---

### A5b — Mobile reviews carousel: infinite loop reset

| Field | Detail |
|---|---|
| **Location** | Testimonials carousel |
| **Device** | Mobile only |
| **Problem** | Moving from the last review back to the first shows a visible reset instead of a continuous loop. |
| **Observed behaviour** | A dark strip flashes at the edge of the carousel during the transition, then a neighbouring card pops into place. |
| **Code cause** | **A clone-count bug, not index arithmetic.** `buildCarousel()` clones exactly `visCount` cards at each end. On mobile `visCount` is 1, but the mobile layout centres the active card at 78% of viewport width and applies a `cOffset`, which makes **half-slivers of both neighbours visible**. With only one clone there is no card beyond the trailing clone. Traced at 390px: the normal peek is 19px wide, and at the wrap index the track leaves a **43px blank strip** — more than twice the peek it replaces — against the charcoal background, for the full 0.5s transition. The `transitionend` snap then pops the correct neighbour in. The active card's content is identical before and after the snap; only the *neighbour* is wrong. Desktop is seamless precisely because `cOffset` is 0 there, which makes clone-count-equals-`visCount` exactly sufficient. There is no latent desktop defect. |
| **File/line** | `index.html:1810-1813` (cloning), `index.html:1804-1808` (mobile width and offset), `index.html:1815` (start index), `index.html:1830-1835` (wrap handler) |
| **Why it hurts** | A visible glitch on the social-proof section undercuts exactly the credibility that section exists to build. |
| **Business impact** | Usability, Trust |
| **Recommended change** | Introduce a single `cloneCount = visCount + 1`, uniform at every breakpoint. **Critically, the wrap conditions must be rewritten in terms of the clone count, not `visCount`.** The value appears in four places: `slice(-K)` and `slice(0, K)` at `index.html:1810-1811`, the start index at `index.html:1815`, and **both branches of the wrap handler at `index.html:1832-1833`**. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when 20 consecutive forward advances and 20 consecutive backward advances, on a real mobile device, show no blank strip, no visible snap, no skipped card, and no interruption to the transition; and the same holds on desktop at 2-card and 3-card breakpoints. |
| **Expected result** | The carousel reads as a continuous conveyor in both directions. |
| **Priority** | P1 |
| **Complexity** | Small — roughly six lines |
| **Verification method** | Real device, counted loops in both directions. Also verify at 767px and 1023px, the two breakpoint edges. |

> **Correction — do not skip this.** Cloning `visCount + 1` while leaving the wrap conditions unchanged **looks like it works and is not fixed.** With `K = 2` and the conditions still reading `visCount`, the *forward* wrap survives by coincidence (it fires one index early, on a card whose rendered content happens to be identical), but the *backward* condition `cIdx < visCount` only fires at track index 0, which is the first item in the track. Nothing exists to its left, so the 43px blank strip reappears on the left edge. Both branches must be rewritten.

#### Additional carousel defects found in the same region

**The `isAnimating` deadlock — P0.** `goC()` sets `isAnimating = true` and relies *exclusively* on `transitionend` to clear it. There is no `transitioncancel` handler and no watchdog. If the transition never completes, the carousel is **permanently frozen** — arrows, swipe and autoplay all no-op at the guard. Realistic triggers: the tab is backgrounded mid-transition (rendering is suspended and `transitionend` delivery is not guaranteed), or `cGap` computes as 0 because the section was measured at zero width. This is the most likely cause of any "the carousel just stopped working" report.
*Fix:* a timeout guard in `goC()` that clears `isAnimating` after slightly longer than the transition, plus a `visibilitychange` handler that clears and restarts autoplay.
`index.html:1823-1828`, `1830-1835`

**Autoplay interval stacking — P0.** `startCauto()` assigns a new interval without clearing the previous one. Callers at `index.html:1855` (`mouseleave`) and `index.html:1858` (`touchend`) do not clear first. On a touch device, one tap produces `touchstart` → `touchend` → synthesized `mouseenter` → later `mouseleave`, and any divergence between clear and start counts **orphans an interval whose id is no longer stored in `cAuto`, making it unclearable for the life of the page.**
*Symptom correction:* this does **not** cause double-advances — the `isAnimating` guard at `index.html:1823` swallows a second call in the same tick. It causes **erratic pacing** (advance, 2s gap, advance, 3s gap) and autoplay that keeps running while the pointer hovers the carousel.
*Fix:* one line — `clearInterval(cAuto)` at the top of `startCauto()`.
`index.html:1851`

**`transitionend` guard — P3, preventive.** A bubbling `transitionend` from a descendant **cannot** fire today; nothing inside `.testimonial-card` declares a transition. But `.category-card`, `.feature-image img` and `.carousel-arrow` all have hover transitions, so the first time anyone adds a hover effect to a testimonial card, the wrap logic starts firing on the wrong event. Add `if (e.target !== track || e.propertyName !== 'transform') return;` as a one-line footgun preventer.
`index.html:1830`

**Position reset on resize — P3.** Any width change rebuilds the carousel and resets to the first card. An orientation change mid-read jumps the reader back to review 1. Consider carrying the logical index across rebuilds. The `innerWidth === prevW` guard at `index.html:1863` correctly ignores the iOS address-bar resize, which is good and should be kept.
`index.html:1862-1866`

**Two sources for one measurement — P3.** Card width is computed from `window.innerWidth` while the centring offset is computed from `viewport.offsetWidth`. These are equal today (overlay scrollbars, plus `overflow-x: hidden` on `body`), so this is not currently a bug, but one number should have one source.
`index.html:1804`, `1808`

---

## B. Hero copy recommendations

No em dashes appear in any recommended string.

---

### Slide 1

**Current heading:** „Специализиран магазин. Истински вкус."
**Current subheading:** „Пресни млечни продукти, яйца и маслини — всяка сутрин от производителя."

**What is weak:**
- Contains an em dash.
- The tagline directly above already reads "Специализиран Магазин · Пловдив", so "специализиран" appears twice within three lines of each other.
- The subheading only names the three categories, which the category cards further down already display with images.
- Nothing tells the visitor *why* a specialist shop is better for them than the supermarket they would otherwise use.

**Recommended subheading:**
> „Тесен, внимателно подбран асортимент вместо безкрайни рафтове с еднакви продукти."

**Reasoning:** The heading claims specialisation; the subheading now explains what specialisation buys the customer, and positions against the obvious alternative rather than describing the shop in isolation. It adds information the heading does not contain.

---

### Slide 2

**Current heading:** „Пловдивски дом на качеството."
**Current subheading:** „На Пещерско шосе 26 — отворени всяка сутрин с прясна доставка."

**What is weak:**
- Contains an em dash.
- An address is a fact, not a reason. This is the location slide and it gives no help actually getting there and no reason to bother.
- "отворени всяка сутрин" is vague, and sits uncomfortably beside opening hours that show the shop closed on Sundays.

**Recommended subheading:**
> „Пещерско шосе 26, кв. Младежки хълм. Отбийте се на път за вкъщи, шест дни в седмицата."

**Reasoning:** Adds the neighbourhood, which is what people actually navigate by. Frames the visit as low-effort rather than as a special trip. Replaces the vague "всяка сутрин" with the honest six-day availability, which also resolves part of the D6 contradiction.

**Optional, separate recommendation:** the heading „Пловдивски дом на качеството" is the weakest of the three — grandiose and non-specific. Only the subheadings were in scope, so this is noted rather than rewritten. If it is opened up, the slide would be stronger anchored on the neighbourhood than on the abstraction.

---

### Slide 3

**Current heading:** „Над 30 вида продукти. Всеки ден пресни."
**Current subheading:** „Над 30 продукта от проверени производители — доставени всяка сутрин."

**What is weak:**
- Contains an em dash.
- **It repeats both halves of its own heading verbatim.** "Над 30" appears twice; the freshness claim appears twice. The line does no work at all.
- The heading number is also wrong — see D6.

**Recommended heading:** „Над 100 вида продукти. Всеки ден пресни."
**Recommended subheading:**
> „Стоката пристига до 06:00 директно от фермата, без склад и без престой по рафтовете."

**Reasoning:** The heading makes a freshness claim; the subheading now supplies the mechanism that makes it credible — a specific delivery time and the explicit absence of a warehouse. Specifics are what make freshness claims believable. This is also consistent with the existing FAQ answer at `index.html:1493`, which already states the 06:00 delivery.

---

### Duplicate-message rule

The differentiators are deliberately repeated across hero, About, categories and showcase. **Repeat the idea, not the sentence.** Each placement does a different job:

| Placement | Job | Example register |
|---|---|---|
| Hero | State the scale | „Над 100 подбрани продукта за всекидневната ви трапеза." |
| About | State the sourcing principle | „Подбираме млечни продукти от производители, на които имаме доверие." |
| Categories | Orient within the range | Short, factual, per-category |
| Showcase | Invite inspection | „Разгледайте богатия избор, който ви очаква на място." |

Verify at the end of implementation that no sentence appears twice — see section N.

---

## C. New store showcase / catalogue section

### Purpose

**Not a gallery.** This section exists to answer the single unanswered question a first-time visitor has about a physical shop: *is this place worth the trip?* It then hands off to directions. Framed as decoration it adds page length; framed as proof it adds visits.

### Recommended location

**After `#olives-feature`, before `#testimonials`.** Insertion point: after `index.html:1438`, before `index.html:1443`.

- **Section before:** the three product subcategory sections, which describe the range in words.
- **Section after:** Testimonials.

The logic: features *describe* → showcase *proves* → testimonials add *social* proof → Find Us *closes*. Placing it earlier would preempt the feature sections; placing it after Testimonials would separate it from the product story.

**Prerequisite:** fix D7 first. The olives section's wave divider is currently the wrong colour, and that transition is exactly where the new section lands.

### Heading options

1. „Вижте какво ви очаква на щанда"
2. „Разгледайте витрините ни отблизо"
3. „Магазинът, преди да влезете"
4. „Днес на щанда"
5. „Обиколете магазина оттук"

### Subheading options

1. „Реални снимки от хладилните витрини, за да знаете какво ще намерите, преди да тръгнете."
2. „Обиколете витрините, без да ставате от стола."
3. „Снимки от магазина, правени при нормално работно време."
4. „Целият избор, подреден така, както ще го видите на място."
5. „Погледнете отблизо и преценете сами дали си струва отбиването."

### Recommended final copy

**Eyebrow:** „Магазинът отвътре"
**Heading:** „Вижте какво ви очаква на щанда"
**Subheading:** „Реални снимки от хладилните витрини, за да знаете какво ще намерите, преди да тръгнете."

**Reasoning:** The heading is about the customer's future visit, not about the shop being photogenic. The subheading does the conversion work — it removes the risk of a wasted trip — and the word „реални" quietly signals authenticity, which is the whole point of using real photography rather than stock.

**Supporting copy:** not needed. The photographs are the content; prose would dilute them.

**CTA:** yes, and it should be directions, per section E's hierarchy.
> „Вижте как да стигнете до нас" → `#visit`

### Desktop layout

- **CSS multi-column masonry**: `columns: 3`, `column-gap: 20px`, each item `break-inside: avoid`.
- Section width: `max-width: 1200px`, matching every other section on the page.
- Each photo sits in a padded card (white or cream ground, ~10px padding, the existing 10px border radius and the existing layered shadow treatment), so the display cases keep visual margin and the section reads as a catalogue rather than a background collage.

### Mobile layout

- **Single column**, full width within the existing 24px section padding.
- Not a slider. The requirement is that customers can *inspect* the products; a vertical stack is the most inspectable form and requires no interaction to see everything.
- Images visible at once: 1 on mobile, 2 at tablet, 3 on desktop.

### Image treatment — the critical constraint

**No aggressive cropping.** Concretely, this means:

- **No fixed `aspect-ratio` on the image containers.** This is the rule that actually prevents cropping; masonry works precisely because it does not impose one.
- **No `object-fit: cover`.** Use `height: auto` and let each photo declare its own proportions.
- Every image keeps its natural aspect ratio, portrait and landscape mixed freely.
- The padded card provides margin around each display case so nothing reads as cut off.
- Optional but recommended: a lightbox for close inspection, since the stated goal is that customers can properly examine the products. Roughly 40 lines of vanilla JS, no library. If it is skipped, the section still works.

### Spacing

- Section padding matching the existing rhythm: `120px 80px` desktop, `80px 24px` mobile, consistent with `.section-feature` and `.section-visit`.
- Column gap 20px desktop, 16px mobile.
- `.section-header` margin-bottom already handles the gap under the heading; reuse it rather than inventing a new value.

### Animation

Reuse `.reveal` and the new batch system from A2. Because the batch system sorts on rendered position, a masonry layout will reveal in visual top-to-bottom order automatically, with no per-item delay classes needed.

### Codebase integration

Reuse, do not duplicate:

| Need | Existing thing to reuse | Line |
|---|---|---|
| Eyebrow, heading, subheading block | `.section-header` and `.eyebrow` | `211-241` |
| Entrance animation | `.reveal` plus the new observer | `193-206` |
| Section transition | `.wave-divider` | `221-233` |
| CTA button | `.btn-primary` | `476-487` |
| Card radius and shadow | the `.category-card` / `.feature-image` treatment | `649-657`, `704` |
| Background alternation | `--color-warm-white` for photo contrast, then the wave into charcoal | `142-155` |

One new CSS block for the masonry container and its items. No new abstractions, no new colour values, no new type scale.

### Shot list

**Required:**

| # | Shot | Purpose |
|---|---|---|
| 1 | **Exterior / storefront** | Recognition on arrival |
| 2 | **Wide interior** | Sense of the space |
| 3–7 | **3 to 5 display-case shots**: full dairy run · cheese and kashkaval · yoghurt and milk · olives and delicatessen | The actual catalogue |

**Optional, requires owner's agreement:** 1 staff or service shot. People trust shops with visible people, but nobody should be photographed without consent.

**The storefront shot is functional, not decorative.** It must answer *"what do I look for when I arrive?"* — so it needs the facade, the sign and logo, the entrance, and enough surrounding street and building context to be recognisable on approach. A tight, beautiful crop of the sign fails this job.

**Technical spec:**
- Shoot in landscape for the exterior and wide interior; portrait suits tall refrigerated cases. Mixed orientation is fine and is exactly what masonry handles well.
- Minimum 2000px on the long edge before export, so the 3-column desktop layout has enough resolution.
- Export per section I: AVIF with WebP fallback, sized to the rendered dimensions, with explicit `width` and `height` attributes.
- Target under ~200KB per image after conversion.

**Photo authenticity rules — hard constraints:**

- Real photography of the actual shop. **No AI-generated products or interiors.**
- No excessive HDR.
- Do not alter or retouch product labels.
- **Do not make the refrigerators look fuller than they actually are.** A customer who arrives to a thinner selection than the photos showed is worse off than one who saw an honest photo.
- Keep colour believable, particularly whites and dairy packaging, which go unnatural quickly under aggressive white-balance correction.
- Shoot under normal operating conditions and normal lighting.

For a local shop, authenticity beats polish. The photographs are evidence, and evidence that looks staged stops being evidence.

---

## D. Additional issues discovered

---

### D0 — Analytics loads before consent, and the cookie policy does not disclose it

| Field | Detail |
|---|---|
| **Location** | `<head>`, sitewide |
| **Device** | Both |
| **Problem** | Microsoft Clarity — session recording and heatmaps — executes unconditionally on every page load, before any consent is requested. There is no consent banner anywhere on the site. `cookie-policy.html` does not mention Clarity or Microsoft at all. |
| **Observed behaviour** | The Clarity script tag is injected synchronously from `<head>` on first paint. Searching `cookie-policy.html` for "clarity", "microsoft", "consent" or "съгласие" returns zero matches. |
| **Code cause** | The Clarity bootstrap is inlined directly in `<head>` with no gate. `vercel.json` explicitly allowlists `https://www.clarity.ms` and `https://*.clarity.ms` in the CSP, so this is deliberate, not accidental. |
| **File/line** | `index.html:1070-1076`; `vercel.json` CSP `script-src` and `connect-src`; `cookie-policy.html` (whole file) |
| **Why it hurts** | Session recording captures user interaction data and is not strictly necessary for the site to function, so under GDPR and the Bulgarian ePrivacy implementation it requires prior consent. Separately and independently of the legal question: the site publishes a cookie policy that is **inaccurate about the only tracker it actually runs**. A visitor who reads it is misinformed. |
| **Business impact** | Trust, legal |
| **Recommended change** | Two parts, both required. **(a)** Gate the Clarity bootstrap behind a consent mechanism so it does not execute until consent is given, and add a consent banner with a genuine reject option. **(b)** Update `cookie-policy.html` to name Microsoft Clarity, its purpose, its data categories, and its retention. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when: a first-time visitor's network log shows **no request to any `clarity.ms` host** before consent is given; consent is persisted across reloads; rejecting keeps it absent; and `cookie-policy.html` names Clarity and Microsoft explicitly with purpose and retention. |
| **Expected result** | Tracking is lawful and the published policy is accurate. |
| **Priority** | **P0** |
| **Complexity** | Moderate |
| **Verification method** | Devtools network tab in a fresh incognito window, filtered to `clarity`. Repeat after accepting, after rejecting, and after a reload of each. |

> **This gates section J.** No CTA event tracking should be added until consent is working, or the same problem is simply extended to more events.

---

### D1 — Asset weight

| Field | Detail |
|---|---|
| **Location** | Sitewide |
| **Device** | Both, far worse on mobile |
| **Problem** | The homepage references roughly 21MB of assets. |
| **Observed behaviour** | *To be measured — see section I. No transferred-byte figure is asserted here.* |
| **Code cause** | On-disk sizes, measured: `Hero video.mp4` **9.2MB**, autoplaying, referenced **twice** — hero and footer, the latter at `opacity: 0.08`. Six category and feature PNGs total **~11.7MB**, of which `Category-Млечни Продукти.png` is a **2.5MB, 1086×1448 PNG rendered at ~156px wide on mobile**. `Mlechko-Logo.png` is 406KB for a 170px logo. `Viber Icon.png` is 130KB for a 40px icon. The Google Maps iframe has no `loading="lazy"`. `og:image` points at a **3MB PNG**. |
| **File/line** | `index.html:1160-1162` (hero video), `index.html:1576-1578` (footer video), `index.html:1313`, `1325`, `1337`, `1361`, `1388`, `1415` (PNGs), `index.html:1559-1565` (map), `index.html:10` (og:image) |
| **Why it hurts** | The audience is local and predominantly mobile, often on mobile data. Every other improvement in this report is invisible to a visitor who leaves during loading. Photographic content stored as PNG is the single largest avoidable cost. |
| **Business impact** | Performance |
| **Recommended change** | Full strategy in section I. Headline items: convert all photographic PNGs to AVIF with WebP fallback at rendered dimensions; rebuild the hero video delivery; **remove the footer video entirely**; lazy-load the map; replace the `og:image` with a ~200KB JPEG. |
| **Recommendation type** | **Verified defect** (the asset sizes), with the mobile-video decision as **Experiment** |
| **Acceptance criteria** | Done when the measured figures in section I meet: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, on a throttled mobile profile, median of 3 runs, with before and after recorded under identical conditions. |
| **Expected result** | The page becomes usable on mobile data. |
| **Priority** | **P1** |
| **Complexity** | Moderate |
| **Verification method** | Lighthouse, already installed. See section I for the exact method. |

> **Framing note.** Do not describe this as a "25MB page" by summing file sizes. The two `<video>` elements share one URL, so the second is very likely served from cache rather than transferred again. It still costs a second decode pipeline, additional memory and CPU, battery, and network priority during load — and the footer video, at 8% opacity behind an overlay, earns none of it. That is reason enough to remove it, without overstating the transfer cost.

---

### D2 — Every anchor link lands underneath the fixed navigation

| Field | Detail |
|---|---|
| **Location** | All in-page navigation: header nav, category cards, footer nav, hero buttons, About CTA |
| **Device** | Both |
| **Problem** | Clicking any in-page link scrolls the target section's heading underneath the fixed header, where it is hidden. |
| **Observed behaviour** | After clicking "За Нас", the section's eyebrow and part of its heading sit behind the navigation bar. |
| **Code cause** | `smoothScrollTo()` computes the destination as `el.getBoundingClientRect().top + window.scrollY` with **no offset for the fixed header**, which is 80px on desktop and 64px on mobile. |
| **File/line** | `index.html:1679-1694`, specifically line `1681`; header heights at `index.html:253` and `979` |
| **Why it hurts** | This fires on every single navigation the site offers. The first thing a visitor sees after every click is a partially obscured heading. It is a two-line fix that affects every journey through the page. |
| **Business impact** | Usability |
| **Recommended change** | Subtract the current header height from the computed destination. Read it from the element rather than hardcoding, so the desktop and mobile heights both work. Add a small breathing gap beyond the header height. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when every nav link, every category card link, every footer link and both hero buttons land with the target section's eyebrow and heading fully visible, verified at both the 80px and 64px header heights. |
| **Expected result** | Sections land in a readable position. |
| **Priority** | **P0** |
| **Complexity** | Small |
| **Verification method** | Click every in-page link at 1440px and at 375px; confirm the heading is fully visible in each case. |

---

### D3 — CSS smooth scrolling fights the JavaScript scroll animation

| Field | Detail |
|---|---|
| **Location** | Sitewide |
| **Device** | Both |
| **Problem** | Anchor scrolling feels sluggish and imprecise. |
| **Observed behaviour** | In-page navigation drifts toward its target rather than arriving cleanly. |
| **Code cause** | `html { scroll-behavior: smooth }` is set globally, while `smoothScrollTo()` runs its own `requestAnimationFrame` loop calling `window.scrollTo(0, y)`. Per spec, CSS smooth scrolling applies to programmatic scrolls that do not specify a behaviour — so **each frame of the JS animation becomes its own smooth animation**, and they compound. |
| **File/line** | `index.html:176` (CSS), `index.html:1689-1693` (the rAF loop) |
| **Why it hurts** | Compounds D2: not only does navigation land in the wrong place, it takes a mushy path getting there. |
| **Business impact** | Usability |
| **Recommended change** | Either remove `scroll-behavior: smooth` and keep the JS animation, or keep the CSS and delete the JS loop. Keeping the JS is preferable because it already handles the mobile-versus-desktop duration difference and will need the D2 header offset anyway. If the CSS declaration is kept for non-JS fallback, pass an explicit instant behaviour in the loop. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when an anchor click produces exactly one scroll animation of the intended duration, with no drift after it completes, on both desktop and mobile. |
| **Expected result** | Anchor navigation feels direct. |
| **Priority** | **P0** (bundled with D2, same code path) |
| **Complexity** | Small |
| **Verification method** | Click a far-away anchor and watch for a secondary drift after the animation ends. |

---

### D4 — Mobile map ignores its mobile height

| Field | Detail |
|---|---|
| **Location** | Find Us section |
| **Device** | Mobile |
| **Problem** | The map is 450px tall on mobile, not the intended 280px. |
| **Observed behaviour** | The map dominates the mobile Find Us section, pushing the contact details far up the scroll. |
| **Code cause** | The iframe carries an inline `style` attribute duplicating the stylesheet rule, including `height:450px`. Inline styles beat the `@media (max-width: 768px)` rule that sets 280px, so the mobile override never applies. |
| **File/line** | `index.html:1564` (inline style), `index.html:1057` (the overridden rule), `index.html:800-803` (the duplicated base rule) |
| **Why it hurts** | Wasted mobile viewport on a section whose actual job is delivering the address, hours and phone number. |
| **Business impact** | Usability |
| **Recommended change** | Delete the inline `style` attribute entirely. The stylesheet at `index.html:800-803` already declares every property it contains, so the rules take over cleanly and the mobile override starts working. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when the map measures 280px tall at 375px width and 450px at 1440px. |
| **Expected result** | Contact details sit higher in the mobile scroll. |
| **Priority** | P2 |
| **Complexity** | Small — deleting one attribute |
| **Verification method** | Measure the iframe in devtools at both widths. |

---

### D5 — Stats bar is unreadable on mobile

| Field | Detail |
|---|---|
| **Location** | Stats bar, directly beneath the hero |
| **Device** | Mobile |
| **Problem** | The stat labels are 8.2px. |
| **Observed behaviour** | Three statistics compressed across a 375px screen, with labels too small to read comfortably. |
| **Code cause** | The mobile block sets `.stat-label { font-size: 0.51rem }`, which is 8.16px at the 16px root. `.stat-number` also drops to a flat `1.1rem`, discarding the desktop `clamp()` and removing the visual impact the numbers are there to provide. Both exist to force three items across one row. |
| **File/line** | `index.html:1003` (label), `index.html:1001` (number), `index.html:996-1003` (block) |
| **Why it hurts** | This is the first content below the hero. It is the shop's opening claim about itself, rendered at a size most people cannot read. It is also the clearest example of the anti-pattern of shrinking type until the layout fits. |
| **Business impact** | Usability, Trust |
| **Recommended change** | **Do not simply enlarge the type — reduce what has to fit.** See D6: one of the three statistics is factually wrong and must be removed regardless. With two statistics the row can breathe at a readable size; alternatively stack them. Restore the number to a `clamp()` so it retains impact. Minimum label size 11px. |
| **Recommendation type** | **Verified defect**, with the replacement stat **Requires business confirmation** |
| **Acceptance criteria** | Done when no text in the stats bar renders below 11px at any width from 320px up, and the stat numbers remain visually dominant over their labels. |
| **Expected result** | The shop's opening claim is legible. |
| **Priority** | P2 |
| **Complexity** | Small |
| **Verification method** | Computed font-size in devtools at 320px and 375px. |

---

### D6 — Factual contradictions on the page

| Field | Detail |
|---|---|
| **Location** | Stats bar, hero slide 3, category card, dairy feature section, FAQ, meta description |
| **Device** | Both |
| **Problem** | Two separate self-contradictions. **(a)** The product count is given as "100+" in one place and "над 30" in five others. **(b)** The stats bar claims the shop is open 365 days a year, while three other places state it is closed on Sundays. |
| **Observed behaviour** | A visitor reading the page top to bottom is told the shop has 100+ products and then, four sections later, that it has over 30. They are told it never closes and then that it closes on Sundays. |
| **Code cause** | Copy duplicated across markup, schema and meta tags with no single source. |
| **File/line** | **Count:** `index.html:1215-1216` ("100+"), and "над 30" at `index.html:1184`, `1185`, `1318`, `1365`, `1370`, `1489`, plus meta description at `index.html:7` and `20`. **Open days:** `index.html:1228` ("365 Дни Отворени Всеки Ден") contradicting `index.html:1142`, `1533` and the `openingHoursSpecification` at `index.html:1886-1889`, which correctly omits Sunday. |
| **Why it hurts** | This is the most damaging class of finding in the report. Everything else is a matter of polish; this makes the shop look careless about its own facts. A customer who notices one contradiction begins doubting the delivery claims too. The 365 claim is worse than the count discrepancy, because a customer could act on it and arrive to a closed shop on a Sunday. |
| **Business impact** | Trust |
| **Recommended change** | **(a)** "100+" is confirmed correct. Replace every "над 30" with "над 100", including in the schema and both meta descriptions. **(b)** **Remove the 365-days statistic entirely.** Do not restyle it, do not soften it. A provably false vanity statistic is worse than no statistic. Its replacement needs owner input — see the open questions. |
| **Recommendation type** | **Confirmed content correction** (the count), **Verified defect** (the 365 claim), **Requires business confirmation** (the replacement stat) |
| **Acceptance criteria** | Done when a full-file search for "над 30" and for "365" returns zero occurrences in markup, schema and meta; and the stats bar makes no claim that contradicts the opening hours stated elsewhere on the page. |
| **Expected result** | The page agrees with itself. |
| **Priority** | **P0** |
| **Complexity** | Small |
| **Verification method** | Grep the file. Then re-validate the JSON-LD via the Rich Results Test, per section N. |

---

### D7 — Olives section wave divider is the wrong colour

| Field | Detail |
|---|---|
| **Location** | Transition between the olives feature section and Testimonials |
| **Device** | Both |
| **Problem** | The wave divider is invisible, so this one section transition is a hard edge while every other is a curve. |
| **Observed behaviour** | Cream section meets charcoal section with a straight horizontal line, unlike every other transition on the page. |
| **Code cause** | Wave dividers work by being filled with the colour of the **next** section. This one is filled `#FAF7F2`, which is its own section's cream background, so it renders invisibly against it. The next section is charcoal `#1A1A2E`. Every other divider on the page does this correctly: the About divider fills mist for the mist section that follows, the categories divider fills cream for the cream section, the testimonials divider fills white for the white FAQ. |
| **File/line** | `index.html:1435` (the wrong fill), compare `index.html:1296`, `1350`, `1464` (correct ones), `index.html:732` (the charcoal target) |
| **Why it hurts** | Breaks the visual rhythm at exactly one point. Small, but it is the kind of inconsistency that reads as unfinished. |
| **Business impact** | Visual polish |
| **Recommended change** | Change the fill to `#1A1A2E`. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when the olives-to-testimonials transition shows the same wave curve as every other section transition. |
| **Expected result** | Consistent section transitions throughout. |
| **Priority** | P3 |
| **Complexity** | Small — one hex value |
| **Verification method** | Visual comparison against the other three dividers. |

> **Do this before the showcase section (A3/C)**, which lands exactly on this transition.

---

### D8 — Testimonials are inconsistent with the page's entrance-animation language

| Field | Detail |
|---|---|
| **Location** | Testimonials section |
| **Device** | Both |
| **Problem** | Every other section on the page has entrance animation. This one has none. |
| **Observed behaviour** | The testimonials header and carousel are simply present when scrolled to, while surrounding sections animate in. |
| **Code cause** | No `.reveal` classes anywhere in the section markup. |
| **File/line** | `index.html:1443-1467` |
| **Why it hurts** | Possibly it does not. This is raised as an inconsistency, not asserted as a defect. |
| **Business impact** | Visual polish |
| **Recommended change** | **Open question rather than a prescription.** Do not add `.reveal` merely because every other section has it. A carousel that is already present when reached may well read as calmer and more confident than one that animates in, and the section's job is credibility, not motion. Decide deliberately: either add reveal to the header only and leave the carousel static, or leave the section as it is and accept the inconsistency as intentional. |
| **Recommendation type** | **Recommended improvement (open question)** |
| **Acceptance criteria** | Done when a deliberate decision has been made and recorded, either way. |
| **Expected result** | Consistency by intent rather than by oversight. |
| **Priority** | P3 |
| **Complexity** | Small |
| **Verification method** | Side-by-side comparison of both options in a real browser. |

---

### D9 — Autoplay interval stacking

Covered in full under **A5b → Additional carousel defects**. Summary: `startCauto()` at `index.html:1851` assigns a new interval without clearing the previous one, and mixing touch with synthesized mouse events orphans intervals that then become unclearable for the life of the page. Corrected symptom: **erratic pacing and autoplay running during hover, not double-advances.** One-line fix. **P0.** Business impact: Usability.

---

### D10 — Mobile hero has no indicator and no control

| Field | Detail |
|---|---|
| **Location** | Hero |
| **Device** | Mobile |
| **Problem** | Three slides rotate every six seconds with no indication that other slides exist and no way to control them. |
| **Observed behaviour** | Content changes on its own. Nothing shows that there are three slides or which is showing. |
| **Code cause** | `.hero-dots { display: none }` in the mobile block. |
| **File/line** | `index.html:991`, rotation at `index.html:1764` |
| **Why it hurts** | A mobile visitor cannot revisit a slide they were still reading, and cannot tell they missed anything. It is also half of the WCAG 2.2.2 failure in section H. |
| **Business impact** | Usability, Accessibility |
| **Recommended change** | Show the dots on mobile, with the hit area enlarged toward 44px while keeping the visual dot small. Combine with a pause control, per section H. See also the single-message hero hypothesis in section E, which would make this moot. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when a mobile visitor can see how many slides exist, which is current, and can stop the rotation. |
| **Expected result** | The hero is controllable. |
| **Priority** | **P0** (as part of the H 2.2.2 fix) |
| **Complexity** | Small |
| **Verification method** | Real mobile device. |

---

### D11 — Mobile menu can be unreachable on short screens

| Field | Detail |
|---|---|
| **Location** | Mobile navigation overlay |
| **Device** | Mobile, short viewports and landscape |
| **Problem** | Menu content can be clipped with no way to scroll to it. |
| **Observed behaviour** | On a short viewport, the lower part of the menu is cut off and cannot be reached. |
| **Code cause** | `.mobile-nav-body { flex: 1; overflow-y: hidden }`. The body contains five links, a slogan, a socials row, an address block and three hours rows. When their combined height exceeds the available flex space, `overflow-y: hidden` makes the remainder unreachable rather than scrollable. |
| **File/line** | `index.html:342`, content at `index.html:1119-1145` |
| **Why it hurts** | The address and opening hours live in that lower block. On the devices where this triggers, the menu hides exactly the information a local customer opened it for. |
| **Business impact** | Usability, Visit intent |
| **Recommended change** | Change `overflow-y` to `auto`. Optionally add `-webkit-overflow-scrolling: touch`. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when every item in the mobile menu is reachable at 320×568 and in landscape on a real phone, including the address and all three hours rows. |
| **Expected result** | The menu is always fully usable. |
| **Priority** | **P0** |
| **Complexity** | Small — one property |
| **Verification method** | Real device in portrait and landscape, plus 320×568 emulation. |

---

### D12 — Images have no intrinsic dimensions

| Field | Detail |
|---|---|
| **Location** | Sitewide |
| **Device** | Both |
| **Problem** | Almost no `<img>` declares `width` and `height`, so the browser cannot reserve space before the image loads. |
| **Observed behaviour** | *To be measured as CLS in section I.* |
| **Code cause** | Only the logos carry a `width` attribute. Category, feature and collage images carry none. |
| **File/line** | `index.html:1257`, `1261`, `1264`, `1313`, `1325`, `1337`, `1361`, `1388`, `1415` |
| **Why it hurts** | Layout shift during load, worst on slow mobile connections where it is most disruptive. Directly affects the CLS target in section I. |
| **Business impact** | Performance |
| **Recommended change** | Add `width` and `height` matching each image's intrinsic pixel dimensions. Note that several containers use `aspect-ratio`, which already reserves space in modern browsers, so the gain is largest where no aspect ratio is set. Do this as part of the D1 image pipeline work rather than separately. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when CLS ≤ 0.1 on the throttled mobile profile, median of 3 runs. |
| **Expected result** | No visible reflow during load. |
| **Priority** | P1 (bundled with D1) |
| **Complexity** | Small |
| **Verification method** | Lighthouse CLS, plus visual check on a throttled connection. |

---

### D13 — Public business email is a personal Gmail address

| Field | Detail |
|---|---|
| **Location** | Find Us section, footer |
| **Device** | Both |
| **Problem** | The published contact address is a personal Gmail account while the business owns its own domain. |
| **Observed behaviour** | `lazarinrusinov@gmail.com` appears as the business contact in two places. |
| **Code cause** | Hardcoded in both locations and in the JSON-LD. |
| **File/line** | `index.html:1552`, `index.html:1618`, `index.html:1878` |
| **Why it hurts** | A domain-matched address signals an established business; a personal Gmail signals a side project. The domain is already owned and already paid for, so the gap is purely presentational. |
| **Business impact** | Trust |
| **Recommended change** | Move to an address on the existing domain, forwarding to the same inbox so nothing changes operationally. Update all three locations together. |
| **Recommendation type** | **Recommended improvement** — requires the owner to create the mailbox or forwarder first |
| **Acceptance criteria** | Done when all three occurrences use the domain address and a test message to it arrives. |
| **Expected result** | Contact details match the business. |
| **Priority** | P2 |
| **Complexity** | Small on the site; depends on mail setup |
| **Verification method** | Send a test email. |

---

### D14 — Testimonials are unverifiable

Expanded in **section F**. Summary: eight five-star reviews are hardcoded in a JavaScript array with names and neighbourhoods but no source, no date and no attribution, while the Google Business Profile URL is **already present in the page's own schema**. Reviews written into the site by the business read as marketing copy; the same reviews attributed to Google read as third-party evidence.
`index.html:1771-1780` (the array), `index.html:1895` (the profile URL already available)
**Recommendation type: Requires business confirmation.** Business impact: Trust. Priority: P1.

---

### D15 — Three `<h1>` elements in the document

| Field | Detail |
|---|---|
| **Location** | Hero |
| **Device** | Both |
| **Problem** | Each of the three hero panels contains its own `<h1>`. |
| **Code cause** | Every panel is a complete content block, so each was given a heading. Two are `aria-hidden="true"` at any moment, which mitigates the accessibility side but not the document structure. |
| **File/line** | `index.html:1166`, `1175`, `1184` |
| **Why it hurts** | Ambiguous document structure for search engines. Minor, and partially mitigated already. |
| **Business impact** | SEO |
| **Recommended change** | Keep `<h1>` on the first panel; render the other two as `<p>` styled identically via the existing `.hero-panel h1` rule extended to a shared class. Alternatively resolve it by adopting the single-message hero in section E, which removes the question. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when the document contains exactly one `<h1>` and the three slides remain visually identical. |
| **Expected result** | Unambiguous heading structure with no visual change. |
| **Priority** | P3 |
| **Complexity** | Small |
| **Verification method** | Devtools accessibility tree; confirm one `<h1>`. Visual diff of all three slides. |

---

### D16 — Feature sections begin at `<h3>` with no `<h2>`

| Field | Detail |
|---|---|
| **Location** | The three product subcategory sections |
| **Device** | Both |
| **Problem** | Each is a top-level `<section>` whose highest heading is `<h3>`, so the outline skips a level. |
| **Code cause** | The sections were designed as continuations of the categories section, which supplies the `<h2>`, but they are siblings of it, not children. |
| **File/line** | `index.html:1365`, `1392`, `1419`; parent sections at `index.html:1358`, `1385`, `1412` |
| **Why it hurts** | Screen-reader users navigating by heading encounter a gap. Search engines see an inconsistent hierarchy. Each section does carry an `aria-label`, which softens it. |
| **Business impact** | SEO, Accessibility |
| **Recommended change** | Promote each to `<h2>` and keep the existing `.feature-text h3` styling by extending the selector, so nothing changes visually. |
| **Recommendation type** | **Verified defect** |
| **Acceptance criteria** | Done when the heading outline descends without skipping levels and the three sections are visually unchanged. |
| **Expected result** | Clean document outline. |
| **Priority** | P3 |
| **Complexity** | Small |
| **Verification method** | Accessibility tree heading list; visual diff. |

---

### D17 — Dead assets in the deployment

| Field | Detail |
|---|---|
| **Location** | Repository root, `images/`, `Enhanced images/` |
| **Device** | N/A |
| **Problem** | Several large files are deployed but never referenced by any page. |
| **Observed behaviour** | Present in the deployment, absent from the markup. |
| **Code cause** | `Category-Яйца.png` (1.7MB) is superseded by `Category-Eggs.png`; `featured-Dairy Products.png` (1.5MB) is superseded by `All Dairy Products.png`; `Dairy-Logo-Photoroom.png` (449KB) is unused. `AUDIT_REPORT.md` and `FIXES_PLAN.md` are also deployed. `HomePage Header.png` (3MB) is referenced only as the `og:image` — it is not dead, but see D1. |
| **File/line** | Verified by cross-referencing the asset listing against every `src` in `index.html` |
| **Why it hurts** | **This is deployment and repository hygiene, not visitor transfer weight.** Browsers never request these files, so they cost visitors nothing. They cost deploy time, repository size, and clarity about which asset is canonical — the two near-duplicate egg images are an active trap. |
| **Business impact** | Hygiene |
| **Recommended change** | Delete the three unused images. Add `AUDIT_REPORT.md`, `FIXES_PLAN.md` and this report to `.vercelignore`. |
| **Recommendation type** | **Recommended improvement** |
| **Acceptance criteria** | Done when every file in `images/` and `Enhanced images/` is referenced by at least one page, and no markdown file is deployed. |
| **Expected result** | The asset folder is unambiguous. |
| **Priority** | P3 |
| **Complexity** | Small |
| **Verification method** | Cross-reference every filename against a grep of all `src` and `content` attributes before deleting anything. |

---

### D18 — `will-change` applied to every reveal element from page load

| Field | Detail |
|---|---|
| **Location** | Sitewide |
| **Device** | Both, worse on mobile |
| **Problem** | Roughly 60 elements are promoted to their own compositor layer at page load, before any of them animates. |
| **Code cause** | `.reveal { will-change: opacity, transform }` applies to every reveal element immediately. The observer does reset it to `auto` 1600ms after each element becomes visible, which is good practice, but every element still starts promoted. |
| **File/line** | `index.html:196` (declaration), `index.html:1656` (the reset) |
| **Why it hurts** | Memory and compositing cost on low-end mobile devices, for elements that may never scroll into view. |
| **Business impact** | Performance |
| **Recommended change** | Move `will-change` off the base `.reveal` rule and apply it at intersection time, immediately before adding `.visible`. The A2 rework already touches exactly this code path, so fold it in there rather than as a separate change. |
| **Recommendation type** | **Recommended improvement** |
| **Acceptance criteria** | Done when no `.reveal` element has `will-change` set before it has intersected. |
| **Expected result** | Fewer compositor layers on load. |
| **Priority** | P3 (bundle with A2) |
| **Complexity** | Small |
| **Verification method** | Devtools Layers panel on load. |

---

### D19 — No conversion hierarchy

| Field | Detail |
|---|---|
| **Location** | Sitewide |
| **Device** | Both, acute on mobile |
| **Problem** | The page has no single primary action, and the one action most likely to produce a visit is the hardest to take. |
| **Observed behaviour** | The hero offers two visually equal buttons. The header's only CTA is a phone link that is **hidden entirely on mobile**. Address and opening hours appear roughly seven sections down. |
| **Code cause** | `.nav-cta { display: none }` in the mobile block, leaving the mobile header with only a hamburger. `.btn-primary` and `.btn-secondary` carry near-equal visual weight in the hero. "Намерете Ни" and "Нашите Продукти" compete on every slide. |
| **File/line** | `index.html:983` (hidden mobile CTA), `index.html:1168-1171` (equal hero buttons), `index.html:476-496` (button weights), `index.html:1509` (Find Us position) |
| **Why it hurts** | A mobile visitor who has decided to come has no fast path to directions or a phone call. This is the highest-value action on the site and it currently requires opening a menu or scrolling most of the page. |
| **Business impact** | Visit intent |
| **Recommended change** | Establish the hierarchy in section E and apply it consistently. |
| **Recommendation type** | **Recommended improvement** |
| **Acceptance criteria** | Done when directions and phone are reachable from any scroll position on mobile in one tap, and the hero has one visually dominant action rather than two equal ones. |
| **Expected result** | High-intent visitors convert without hunting. |
| **Priority** | **P1** |
| **Complexity** | Moderate |
| **Verification method** | Real mobile device: from three random scroll positions, count taps to directions and to a phone call. |

---

## E. Conversion and customer journey

### The journey being optimised

> Looks credible → they have what I want → I trust them → I know where they are → **I go, or I call.**

Every section is judged by whether it moves a visitor along that line.

### Current state

| Question | Answer today |
|---|---|
| What is the single primary CTA? | There isn't one. |
| Is it consistent down the page? | No. The hero pairs "Нашите Продукти" with "Намерете Ни" at equal weight; the header offers a phone link on desktop and nothing on mobile; About ends with a text link to Find Us; the category cards end with "Разгледай". |
| Is directions more valuable than a generic browse CTA? | Yes, for a physical shop with no e-commerce. Browsing is a means; visiting is the outcome. |
| Are phone and Viber obvious on mobile? | No. The header CTA is hidden at `index.html:983`. Viber exists only as a floating button. Phone requires opening the hamburger or scrolling to Find Us. |
| What is the next action after viewing products? | Undefined. The three feature sections end with a trust strip and no CTA at all. |
| How far before location and hours? | Roughly seven sections. |
| Do CTA labels say what happens? | Partly. "Намерете Ни" is good. "Свържете се" does not reveal that it dials a phone number. "Разгледай" leads to a section further down the same page, which is not obvious. |

### Recommended hierarchy

**1. Упътване → 2. Обади се / Viber → 3. Разгледай продуктите → 4. Google отзиви**

Not every section equally weighted. Concretely:

- The hero's primary button becomes directions-oriented; the products button drops to secondary weight.
- The three feature sections gain a closing action, currently absent.
- "Свържете се" becomes explicit about dialling.
- The showcase section closes with directions, per section C.

**Recommendation type: Recommended improvement.** Priority P1.

---

### Mobile sticky action bar

**Recommendation type: Experiment / hypothesis. Do not build without a go-ahead.**

**Hypothesis:** for a physical shop, a persistent one-tap path to directions and phone converts materially better than requiring a menu or a long scroll.

**Specification if approved:**

- Two or three actions: `Упътване · Обади се · Viber`
- Appears after the hero has scrolled past; not over the hero itself
- Height budget ~56px, plus safe area
- **`padding-bottom: env(safe-area-inset-bottom)`** so it clears the iPhone home indicator
- **Matching `padding-bottom` on `body`** so the bar never covers page content, particularly the footer legal links
- Respects `prefers-reduced-motion` on entry

**Explicit decision required — do not skip this.** If the sticky bar ships with a Viber action, the standalone Viber floating button at `index.html:1640-1645` **must be removed on mobile**. Two competing Viber entry points on one screen is worse than either alone. Desktop may keep the floating button, since the sticky bar is mobile-only.

**Success metric:** section J event tracking on directions and call taps, compared before and after. Without that instrumentation the experiment cannot be evaluated and should not run.

**Acceptance criteria:** Done when the bar is visible from any scroll position past the hero, clears the home indicator on a real iPhone, never overlaps footer content, exactly one Viber entry point exists on mobile, and the section J events fire.

---

### "Отворено сега" indicator

**Recommendation type: Experiment, gated.**

A live open/closed indicator near the directions CTA — „Отворено сега · до 20:00" or „Затворено · Отваряме утре в 08:30" — is genuinely useful for a physical shop and directly serves visit intent.

**Do not build it unless all of these hold:**

- Timezone handling is correct for Europe/Sofia including DST
- Sunday closure is handled
- Public holidays and exceptional closures can be maintained
- Someone will actually maintain them

An indicator that says "Отворено сега" when the shop is closed is worse than no indicator, and it fails guardrail 7 on unmaintainable features. If hours are not reliably maintained, do not implement.

---

### Differentiation

**Recommendation type: Requires business confirmation.**

The audit can improve how the site says things. It cannot decide what is true. The core question:

> Why should someone visit Млечко rather than the nearer grocery shop?

Candidates that appear in or are implied by the current copy, each of which **must be confirmed before use**:

| Candidate | Currently implied at |
|---|---|
| 100+ product varieties | `index.html:1215` |
| Delivery before 06:00, daily | `index.html:1368`, `1493` |
| Direct from producers, no intermediaries | `index.html:1271`, `1369` |
| Selected small Bulgarian producers | `index.html:1395`, `1397` |
| Cheeses not available elsewhere | `index.html:1774` (a review, not a claim) |
| Olives sold by weight, multiple varieties | `index.html:1420`, `1423` |
| Personal service and help choosing | `index.html:1774` (a review, not a claim) |
| Trading since 2010 | `index.html:1271`, `1497` |

Note that two of the strongest differentiators currently appear only inside customer reviews, never as the shop's own claim. If they are true, they should be stated directly.

Once confirmed, apply the **duplicate-message rule** from section B: repeat the idea across hero, About, categories and showcase, never the sentence.

---

### Practical visit information

**Recommendation type: Requires business confirmation.**

High-intent questions the FAQ does not currently answer:

- Can I pay by card?
- Is there parking nearby?
- Is the entrance step-free?
- Can I reserve or order by phone?
- Are products sold by weight?
- What time do fresh deliveries actually arrive?

These are more useful to someone deciding whether to visit than any additional description of quality. Fold the confirmed answers into the existing `<details>` list at `index.html:1478-1503` and the FAQPage schema at `index.html:1900-1937`. No new section — the page is already long, per section N.

---

### Single-message hero

**Recommendation type: Experiment. Not for automatic implementation.**

Three rotating messages may mean none is read. A visitor who arrives mid-rotation sees slide 2 or 3 with no context, and a visitor who reads slide 1 may leave before slides 2 and 3 appear. The rotation also creates the WCAG 2.2.2 failure in section H and the D15 multiple-`<h1>` problem.

**Hypothesis:** one optimised message, a static video background, and one clear primary action outperforms three rotating messages.

This changes the site's concept, so it is recorded for evaluation rather than recommended. **Section B still rewrites all three slides**, so the current design is improved regardless of whether this experiment ever runs.

---

## F. Trust and social proof

### The problem

Eight five-star reviews are hardcoded in a JavaScript array at `index.html:1771-1780`, with names and neighbourhoods but no source, no date and no attribution. Reviews the business wrote into its own site read as marketing copy, whatever their origin. The same reviews attributed to Google read as third-party evidence.

The Google Business Profile URL is **already in the page's own schema** at `index.html:1895`, so the attribution path exists and is unused.

### Recommended treatment

A Google-attributed block:

- Google wordmark or clear attribution
- Aggregate rating and review count
- Individual excerpts with reviewer display name and rating
- „Вижте всички отзиви в Google" linking to the profile

### Hard constraints

**Only verifiable numbers may be published.** Do not invent an aggregate rating or a review count. If the real figures are not supplied, publish the attribution link without numbers — a link to a real profile is still stronger than eight unattributed quotes.

**On schema:** add `Review` or `AggregateRating` markup **only** if the reviews genuinely come from Google and the figures are accurate.

**Do not expect star snippets in search results.** Self-serving review rich results are restricted for `LocalBusiness` and `Organization` — a business marking up reviews about itself is generally not eligible. Add this markup for correctness and human trust, not because it will produce stars in Google. Any recommendation that promises SERP stars here is wrong.

**Recommendation type: Requires business confirmation.** Priority P1. Business impact: Trust.

**Acceptance criteria:** Done when every published rating or count matches the live Google Business Profile, the link resolves to the correct profile, and no review text has been altered from its source.

### Related trust items

- **D13** — personal Gmail as the business contact address.
- **D0** — a cookie policy that does not disclose the tracker actually running. Trust is not only about reviews.

---

## G. Local SEO and Google Business Profile alignment

For a business whose entire conversion is a physical visit, an accurate, claimed Google Business Profile matters more than conventional on-page SEO work.

### NAP consistency

**Name, Address, Phone** must match exactly across every surface. Inconsistent NAP data is the most common local-SEO problem for small businesses.

Site values, extracted for side-by-side comparison:

| Field | On-site value | Line |
|---|---|---|
| Name | Млечко | `1874` |
| Address | бул. Пещерско шосе 26, гк. Младежки хълм, 4002 Пловдив | `1521`, `1610`, `1881-1884` |
| Phone | 0878 232 365 / +359878232365 | `1543`, `1877` |
| Hours | Пон–Пет 09:30–20:00 · Съб 08:30–14:30 · Нед closed | `1531-1533`, `1886-1889` |
| URL | https://www.mlechko-magazin.com | `1876` |
| Schema category | `GroceryStore` | `1873` |
| Coordinates | 42.1406741, 24.7308872 | `1890-1894` |
| Maps URL | https://maps.app.goo.gl/TggEzeMfNA7kNr5u5 | `1895` |
| Email | lazarinrusinov@gmail.com | `1878` |
| Logo / image | Enhanced images/HomePage Header.png | `1896` |

**Compare each against:** the Google Business Profile, Facebook, Instagram, and any Bulgarian business directories the shop appears in. The profile itself cannot be audited from the codebase.

**Note the address inconsistency already on-site:** `index.html:1481` writes "кв. Младежки хълм" while `index.html:1521` writes "гк. Младежки хълм". Pick one and use it everywhere, including the GBP.

**`GroceryStore` requires confirmation.** For a specialist dairy shop, a more specific category may serve better both in schema and in the GBP category selection. This is a business decision about how the shop wants to be found.

### Technical SEO checklist

To **verify, not assume**. Current state where already confirmed:

| Item | Status |
|---|---|
| `<title>` | Present, `index.html:24` — check length in SERP preview |
| Meta description | Present, `index.html:7` — contains "над 30", must change per D6 |
| Canonical | Present and correct, `index.html:23` |
| `lang="bg"` | ✓ `index.html:2` |
| Favicons and manifest | ✓ complete set |
| Open Graph | Present — **image is a 3MB PNG**, see D1 |
| Twitter card | Present — same image issue |
| `robots.txt` | ✓ valid, sitemap declared |
| `sitemap.xml` | ✓ 4 URLs, `lastmod` 2026-08-19 — update after changes |
| Search Console | ✓ verified via `googled9de6d8037889127.html` |
| LocalBusiness schema | Present — validate after D6 changes |
| FAQPage schema | Present — must stay in sync with visible FAQ |
| Heading structure | See D15, D16 |
| Semantic landmarks | ✓ `header`, `nav`, `main`, `footer`, `aside` all present |
| Descriptive anchors | Mostly good; "Разгледай" is vague |
| Image alt text | Present throughout; review for descriptiveness during the D1 image work |

**Priority:** P2, except the D6-driven meta description change which is P0.

---

## H. Accessibility audit (WCAG 2.2)

Tooling is already installed: `axe-core ^4.12.1` and `puppeteer ^25.2.1`. Run an automated pass first, then the manual checks below, since the most serious finding here is one no automated tool reports.

### Leading finding: 2.2.2 Pause, Stop, Hide (Level A) — failed twice

Two components move automatically for more than five seconds with **no mechanism to pause, stop or hide them**:

| Component | Interval | Control | Line |
|---|---|---|---|
| Hero slideshow | 6s | Dots only, and **hidden entirely on mobile** | `1764`, `991` |
| Testimonials carousel | 5s | Arrows advance but cannot pause | `1851` |

This is a Level A failure, the most serious accessibility finding in this report, and it also affects anyone who simply reads slowly.

**The two are treated differently:**

- **The carousel may keep autoplay** provided it gains: an explicit pause control, pause on hover *and* on keyboard focus, pause on `visibilitychange`, and no autoplay at all under `prefers-reduced-motion`.
- **The hero's automatic rotation is questioned outright.** Adding a pause button to a hero is awkward; the cleaner resolution may be the single-message hero in section E. At minimum, restore the dots on mobile (D10), enlarge the hit area, and stop rotation on interaction.

**Priority: P0.** Business impact: Accessibility, Usability.
**Acceptance criteria:** Done when a user can stop all automatic movement on the page by a visible control, and `prefers-reduced-motion: reduce` results in no automatic movement at all.

### Focus is not returned to the hamburger

`closeNav()` restores neither focus nor context. Only the Escape key path calls `navOpen.focus()` afterwards. Closing via the X button or by tapping a link leaves focus detached, so a keyboard user is dropped at the top of the document.
`index.html:1725-1734`, compare `index.html:1736`
**Fix:** move the focus restoration into `closeNav()` itself. **Priority: P1.** Complexity: Small.

### 2.4.11 Focus Not Obscured (Minimum) — AA, new in WCAG 2.2

The fixed 80px header can completely hide a focused element when a keyboard user tabs to something that sits just below the header line. The same root cause as D2.
**Fix:** `scroll-margin-top` equal to the header height on focusable elements and section targets. This also improves D2. **Priority: P1.**

### Carousel as an accessible component

Beyond the loop fix in A5b, the rebuilt carousel needs:

- `aria-roledescription="carousel"` on the container and appropriate labelling on the region
- A live region announcing the current slide, or `aria-live="polite"` on the viewport, so screen-reader users know the content changed
- Arrow buttons keyboard-reachable with meaningful labels — **already correct**, they are real `<button>` elements with `aria-label`, `index.html:1454`, `1457`
- Cloned slides hidden from assistive technology — **already correct**, clones receive `aria-hidden="true"`, `index.html:1810-1811`
- No focus moving unexpectedly into cloned cards — currently safe, as cards contain no focusable content, but this must hold if a "read full review" link is ever added
- Autoplay pausing on interaction, on focus, and on tab visibility change
- Full usability without swiping — **satisfied by A5a**, and WCAG 2.5.7 Dragging Movements is satisfied by the existing arrows

### Accuracy note on target size

Hero dots are exactly 24×24 CSS pixels (`index.html:530`). This **meets** WCAG 2.2 success criterion 2.5.8 Target Size (Minimum), which requires 24×24 at Level AA. It does **not** meet 2.5.5 Target Size (Enhanced) at AAA, which requires 44×44, nor common mobile guidance.

The correct claim is: *below the recommended 44px mobile target, not a WCAG AA violation.* An earlier draft of this analysis wrongly called it a violation. Enlarging the hit area is still worth doing when the dots are restored on mobile per D10.

### Already correct — do not regress these

| Item | Line |
|---|---|
| Skip link | `1080`, `157-170` |
| `:focus-visible` styles, including contrast-adjusted variants on dark sections | `933-938` |
| Mobile menu focus trap | `1735-1745` |
| Escape closes the menu and restores focus | `1736` |
| `aria-expanded` maintained on the hamburger | `1721`, `1729` |
| Decorative SVGs marked `aria-hidden` | throughout |
| `prefers-reduced-motion` block | `940-944` |
| Semantic landmarks | throughout |
| `<details>` used for the FAQ rather than custom JS | `1479-1502` |

### Remaining manual checks

Keyboard-only traversal of the whole page; contrast verification on the gold-on-charcoal text at `index.html:748` and the `rgba(255,255,255,0.52)` testimonials subtitle at `index.html:736`, both of which are the most likely contrast failures; alt-text quality review; heading order per D15 and D16.

**Priority:** P0 for the 2.2.2 failures, P1 for focus management and focus-obscured, P2 for the remainder.
**Verification method:** `axe-core` automated pass, then manual keyboard traversal on desktop and a real screen reader pass on mobile (VoiceOver).

---

## I. Performance — measurement first

### Framing

**Do not describe this as a "25MB page" by summing file sizes.** That number would be wrong in a way that undermines the rest of the report.

What can be stated factually: **the homepage references 24.93 MiB of assets on disk**, across 20 files, measured by resolving every `src` and `href` in the markup against the filesystem. What must be measured, not asserted: what a real visitor actually transfers.

Specifically, the two `<video>` elements share a single URL, so the second is very likely served from cache rather than transferred again. The real costs of the duplicate are a second decode pipeline, additional memory and CPU, battery drain, and competition for network priority during load. Those are sufficient reasons to remove the footer video — it renders at `opacity: 0.08` behind an overlay — without inflating the transfer figure.

Similarly, D17's unused assets are **deployment weight, not visitor weight.** Browsers never request them.

### Targets

Google's "good" Core Web Vitals thresholds:

| Metric | Target |
|---|---|
| **LCP** | ≤ 2.5s |
| **INP** | ≤ 200ms |
| **CLS** | ≤ 0.1 |

Also record, before and after:

- Total transferred bytes
- Total request count
- Video transfer
- Image transfer

### Method

**Three runs before, three runs after, report the median.** A single Lighthouse run is too noisy to justify a decision.

Hold constant across all six runs:

- Same viewport and device emulation profile
- Same throttling profile (mobile, throttled)
- Same browser and same version
- Same server — the local `node serve.mjs` on port 3000, or production, but not a mix
- Cold cache each run

Tooling is already installed as devDependencies: `lighthouse ^13.4.0` and `puppeteer ^25.2.1`.

### Before / after table

**Measured 2026-08-25.** Byte figures are real: every asset the markup references was fetched over HTTP from the local server and summed. The "after" column resolves each `srcset` to the candidate a 390px mobile browser would pick, and counts the mobile video variant, so before and after are compared on the same basis.

**Method actually used.** Lighthouse and Puppeteer both fail here — Chrome will not launch under the sandbox, and outside it Node 26 hangs on Puppeteer's module import before executing a line. Instead, headless Chrome was driven directly over the DevTools Protocol using Node's built-in `WebSocket`, with **Lighthouse's own mobile throttling preset applied** (`Network.emulateNetworkConditions` at 1.6 Mbps / 150 ms RTT, plus `Emulation.setCPUThrottlingRate` 4×), 390×844 at DPR 2, cache disabled. The "before" column is the real pre-change page: `index.html` at git HEAD, restored and served alongside the untouched original assets, measured under identical conditions. **3 runs each, median reported.**

| Metric | Before | After | Target | Pass |
|---|---|---|---|---|
| **LCP** | 7340 ms | **1996 ms** | ≤ 2500 ms | ✅ |
| **CLS** | 0.010 | **0.017** | ≤ 0.100 | ✅ |
| Transferred in 22 s | 1.54 MB *(page still loading)* | **0.57 MB** *(complete)* | — | — |
| Total mobile payload | 25.50 MB | 1.48 MB | — | −94.2% |
| Initial paint payload | 25.50 MB | 0.44 MB | — | −98.3% |
| Video bytes | 8.77 MB | 0.98 MB (deferred) | — | −88.8% |
| Image bytes | 16.57 MB | 0.24 MB | — | −98.6% |

Two things worth reading off that table. First, **the before column shows the original page had not finished loading after 22 seconds** on a slow-4G profile — it transferred 1.54 MB of its 25.50 MB in that window. Second, the video contributes **0 bytes** to initial paint: `preload="none"` plus a JS-initiated play after the `load` event means it arrives only once the page is usable, and never under `prefers-reduced-motion`.

**Confirmed against the live site.** The local server sends no compression; production serves the HTML at **29.7 KB on the wire** against 138 KB raw. Measured on `https://www.mlechko-magazin.com/` under the same throttling, 3 runs, median:

| Metric | Production (median of 3) | Target | Pass |
|---|---|---|---|
| **LCP** | **2224 ms** | ≤ 2500 ms | ✅ |
| **CLS** | **0.017** | ≤ 0.100 | ✅ |

Production LCP is higher than the 1996 ms localhost figure because real DNS, TLS and CDN round-trips are now in the path on top of the emulated 150 ms RTT. It still clears the threshold.

**INP was not measured.** It requires real interaction sampling that this harness does not do. No long-running JS was added — the heaviest new work is an array sort inside an IntersectionObserver callback — but that is reasoning, not a measurement. Capture it from field data or PageSpeed Insights on the deployed URL.

**AVIF was resolved, not skipped.** `avifenc` is absent, but ffmpeg has `libsvtav1` and an AVIF muxer, so all nine content images ship as AVIF with a WebP fallback via `<picture>`: 844 KB of WebP → **236 KB of AVIF**, a further 72%. `picture { display: contents }` keeps the wrapper from generating a box, so `height: 100%` on the inner `<img>` still resolves against the card. The video poster stays WebP — the `poster` attribute has no fallback mechanism, so an AVIF poster would simply fail to render on Safari 15.

### Image strategy

Beyond "convert to WebP":

1. **AVIF with WebP fallback** via `<picture>`, with the original format as the final fallback.
2. **Correctly sized sources.** `Category-Млечни Продукти.png` is 1086×1448 and renders at ~156px wide on mobile. Generate sources at the sizes actually used.
3. **`srcset` and `sizes`** so mobile does not download desktop-resolution files.
4. **Explicit `width` and `height`** on every image — this is D12.
5. **`loading="lazy"`** on everything below the fold, including the **Google Maps iframe** at `index.html:1559`, which currently loads eagerly and pulls a substantial payload on every visit.
6. **`decoding="async"`** on non-critical images.
7. **Do not lazy-load the LCP element.** The hero poster is the likely LCP candidate and must stay eager; if anything, it warrants `fetchpriority="high"`. Lazy-loading it would make LCP worse while appearing to be an optimisation.
8. **Replace the `og:image`** at `index.html:10` with a JPEG around 200KB. A 3MB social preview image slows every share.
9. **The logo and the Viber icon** — 406KB for a 170px logo and 130KB for a 40px icon — should be a small WebP or an inline SVG.

### Hero video delivery strategy

Not "compress the video". Specify the whole delivery:

**Desktop**
- Optimised short loop, conservative bitrate
- Poster frame, already present at `index.html:1160`
- `muted`, `playsinline`, `loop` — already present
- Deliberate `preload` value rather than the browser default

**Mobile** — *Experiment / hypothesis*
- Evaluate whether the video is worth loading at all on mobile data, versus a high-quality static poster
- If kept, serve a lighter, smaller-dimension variant
- Decide with measured data from the table above, not by preference

**Reduced motion**
- **Do not autoplay the hero video when `prefers-reduced-motion: reduce` is set.** Show the poster instead. The site already respects this preference for its reveal system at `index.html:940-944`; the same thinking should extend to the largest moving element on the page.

**Footer video**
- **Remove entirely.** At `opacity: 0.08` behind a gradient overlay it is imperceptible, and it costs a second decode pipeline for no visual benefit. `index.html:1576-1578`

**Priority:** P1. **Complexity:** Moderate. **Business impact:** Performance.

---

## J. Analytics and measurement

### Current state

Microsoft Clarity is installed at `index.html:1070-1076` and provides heatmaps and session recordings. There is **no custom event tracking** — no calls to `clarity('event', ...)` anywhere in the file. So the site can show how people move, but cannot answer the only question that matters:

> Does the website actually send people to the shop?

### Gated on D0

**Do not add event tracking until consent is working.** Adding more tracking to an ungated tracker extends the problem in section D0 rather than solving it.

### Events to instrument

Once consent is in place, track the section E actions:

| Event | Element | Line |
|---|---|---|
| Directions tapped | Map link / new directions CTA | `1559`, new |
| Call tapped | `tel:` links | `1099`, `1147`, `1543`, `1614` |
| Viber tapped | Viber deep links | `1130`, `1588`, `1641` |
| Google reviews tapped | New attribution link (section F) | new |
| Hero CTA tapped | Both hero buttons, tracked separately | `1169-1170` |
| Category CTA tapped | The three category cards | `1312`, `1324`, `1336` |
| Sticky bar tapped | If the experiment runs | new |

This also supplies the success metric the sticky-bar experiment in section E requires. Without it, that experiment cannot be evaluated and should not be run.

**Privacy note:** whichever analytics approach is chosen, the consent requirement from D0 applies to it equally. If a second tool such as GA4 is added, it must be behind the same gate and disclosed in the same cookie policy.

**Priority:** P1, immediately after D0. **Complexity:** Small. **Business impact:** Visit intent (via measurement).

---

## K. QA matrix

### Widths

320 · 360 · 375 · 390 · 430 · 768 · 1024 · 1440+

Also test **short-height phones** and **landscape orientation** — D11 only manifests when vertical space is constrained, and would be missed by width-only testing.

### Browsers

iOS Safari · Chrome Android · desktop Safari · desktop Chrome

### Real-device testing is required for P0 and P1 sign-off

At minimum **one real iPhone and one real Android**. Emulation cannot reproduce:

- iOS viewport behaviour and address-bar collapse, which directly affects the hero's `calc(100vh - 272px)` at `index.html:987`
- Touch interaction and momentum scrolling
- Safe-area insets, which the sticky-bar experiment depends on
- Mobile video autoplay policies
- Font rendering

**Exercise specifically:** mobile menu (D11), sticky CTA if built, hero video, carousel loop in both directions (A5b), map, and phone and Viber links.

### CTA destination validation

Small, and high value. Verify **on real devices** that each of these opens the correct target:

| Link | Expected | Line |
|---|---|---|
| `tel:0878232365` | Dialler, correct number | `1099`, `1147`, `1543`, `1614` |
| `viber://chat?number=%2B359878232365` | Viber, correct contact | `1130`, `1588`, `1641` |
| Google Maps directions | Correct shop location | `1559`, new CTA |
| Google reviews link | Correct business profile | new, section F |
| `mailto:` | Correct address, per D13 | `1552`, `1618` |
| Social links | **Currently none exist** — see note | `1129`, `1587` |

**Note:** there are `TODO` comments at `index.html:1129` and `index.html:1587` reserving space for Facebook and Instagram links that were never added. Either add the real profile URLs or remove the comments; a permanent TODO in shipped markup is a small signal of an unfinished site.

A redesigned CTA that opens the wrong URL is worse than the current design. Test every one.

---

## L. Priority order

Ordered by business impact against implementation effort. Rationale for the ordering: correctness and trust first because they undermine everything else; performance and conversion next because they determine whether improvements are seen and acted on; visual polish last because it does not create the business result.

### P0 — Correctness, trust, legal, accessibility

| # | Item | Why here |
|---|---|---|
| 1 | **D0** — consent gate and accurate cookie policy | Legal exposure and a published policy that misstates what the site does. Nothing else is worth doing while this stands. |
| 2 | **D6** — factual contradictions | A customer could act on the 365-days claim and arrive to a closed shop. Contradictions make every other claim doubtful. Small effort, large trust return. |
| 3 | **H 2.2.2** — autoplay with no pause, both hero and carousel; includes **D10** | Level A accessibility failure, affecting anyone who reads slowly, not only assistive-technology users. |
| 4 | **A5b deadlock** — the `isAnimating` freeze | The carousel can stop working entirely and never recover. |
| 5 | **D9** — interval stacking | Same code region as #4; unclearable timers for the page's life. One line. |
| 6 | **D2 + D3** — anchor offset and scroll conflict | Fires on every navigation the site offers. Two small fixes, felt constantly. |
| 7 | **D11** — mobile menu overflow | Hides the address and hours from exactly the local customers who opened the menu for them. One property. |

### P1 — Performance

| # | Item | Why here |
|---|---|---|
| 8 | **D1 + D12 + I** — image pipeline, hero video strategy, remove the footer video, lazy-load the map, add dimensions | A visitor who leaves during loading sees none of the rest of this report. Largely mechanical work with a measurable outcome. |

### P1 — Conversion

| # | Item | Why here |
|---|---|---|
| 9 | **B** — hero copy, including the 30 → 100 heading fix | The only content guaranteed to be seen. Copy-only, no risk. |
| 10 | **D19 + E** — CTA hierarchy and mobile directions/call access | The highest-intent actions are currently the hardest to take on mobile. |
| 11 | **F** — Google-attributed reviews | Converts eight unattributed quotes into third-party evidence. Blocked on the owner supplying real figures. |
| 12 | **A5b loop fix** — clone count and wrap conditions | A visible glitch on the section whose job is credibility. |
| 13 | **J** — CTA event tracking | Without it, items 9–12 cannot be evaluated. Sequenced after D0. |
| 14 | **H focus management** — return focus on menu close, `scroll-margin-top` | Small, and pairs naturally with the D2 work. |

### P2 — Mobile visual UX

| # | Item | Why here |
|---|---|---|
| 15 | **A4** — mobile category cards | The most visible mobile composition problem. Eight lines. |
| 16 | **D5** — stats bar legibility, resolved by D6's removal of the false stat | Depends on the D6 decision, so it follows it. |
| 17 | **A2** — reveal sequencing | The most visible symptom overall, and the least consequential to a customer. Deliberately below broken navigation, trust and conversion. |
| 18 | **D4** — mobile map height | One attribute deletion. |

### P2 — Content and trust

| # | Item | Why here |
|---|---|---|
| 19 | **A3 + C** — showcase section | Highest-value *addition* on the list, but blocked on photography, and it needs D7 done first. |
| 20 | **E** — practical visit information in the FAQ | Blocked on owner answers. High intent, low effort once supplied. |
| 21 | **G** — NAP consistency and GBP alignment | Requires access to the Google Business Profile. |

### P3 — Polish

| # | Item |
|---|---|
| 22 | **D7** — wave divider colour (do before #19) |
| 23 | **D15, D16** — heading structure |
| 24 | **D8** — testimonials animation decision |
| 25 | **D13** — business email, once a mailbox exists |
| 26 | **D17, D18** — dead assets, `will-change` |
| 27 | Carousel `transitionend` guard, resize position, measurement source |

### Deferred — experiments requiring a decision

Not scheduled. Each needs a go-ahead and, where noted, a success metric.

| Item | Blocker |
|---|---|
| Mobile sticky action bar | Go-ahead, plus J instrumentation for measurement |
| Single-message hero | Concept decision |
| Mobile video vs static poster | Measured data from section I |
| "Отворено сега" indicator | Commitment to maintaining hours and holidays |
| Showcase lightbox | Optional; the section works without it |

---

## N. Post-implementation passes

Three checks after the work, not during.

### 1. Content-density pass

The page is single-page and already long. This report adds a showcase section, expands the FAQ, adds a reviews block and possibly a sticky bar. Length grows silently.

Ask of every section, including the existing ones:

> Does this section add information that materially moves the customer closer to visiting the store?

If not: shorten it, merge it, or remove it. Evaluate specifically:

- **About** — two paragraphs plus three bullets plus a CTA, much of which restates the categories section
- **Stats bar** — after D6 removes one stat, does the row still earn its place?
- **The three feature sections** — each has a three-item reason list *and* a three-item trust strip, which overlap substantially in content

Adding is easy; this pass is the counterweight.

### 2. Duplicate-message check

Because section E deliberately repeats differentiators across hero, About, categories and showcase, verify the **idea** repeats and the **sentence** does not. Read the four placements in sequence. If any sentence appears twice, or two sentences share their main clause, rewrite one.

### 3. JSON-LD regression validation

Re-run the Rich Results Test whenever any of these change:

- Opening hours
- Business name
- Reviews or ratings
- Schema category
- URLs
- Logo or image

**D6 already proves the visible page and the schema can drift apart** — the stats bar claimed 365 days while `openingHoursSpecification` correctly omitted Sunday. That drift went unnoticed. Validate both surfaces together, every time.

---

## Open questions

Implementation is blocked on these. Each corresponds to a **Requires business confirmation** or **Experiment** item above.

1. **What replaces the "365 дни" statistic?** It must be removed (D6). A verifiable alternative is needed — years trading, number of producers supplied from, delivery time, or nothing at all if two statistics read better than three.
2. **Which differentiators are actually true?** See the table in section E. Two of the strongest — cheeses unavailable elsewhere, and personal help choosing — currently appear only inside customer reviews, never as the shop's own claim.
3. **What are the real Google review figures?** Rating and count. Without them, section F ships the attribution link only, with no numbers.
4. **Practical visit answers:** card payment, parking, step-free entrance, phone reservation, sale by weight, delivery arrival time.
5. **Is `GroceryStore` the right schema and GBP category** for a specialist dairy shop?
6. **Will a business email address be created** on the existing domain (D13)?
7. **Are there Facebook or Instagram profiles?** Two `TODO` comments have been reserving space for them since an earlier revision (`index.html:1129`, `1587`).
8. **Sticky mobile action bar** — build it or not? If yes, the standalone Viber floating button is removed on mobile.
9. **Single-message hero** — evaluate, or keep the three-slide rotation?
10. **"Отворено сега" indicator** — will opening hours and holiday exceptions be maintained? If not, it should not be built.
11. **Showcase photography** — when will the shot list in section C be shot? This blocks the highest-value addition in the report.
12. **Staff photograph** — acceptable to the people who would appear in it?

---

## Corrections carried forward

Three conclusions in an earlier draft of this analysis were wrong and were corrected during verification. They are recorded here so they are not reintroduced during implementation.

| Earlier claim | Correction |
|---|---|
| Cloning `visCount + 1` cards fixes the carousel loop. | **Insufficient.** The wrap conditions at `index.html:1832-1833` hardcode `visCount` and must be rewritten in terms of the clone count. Left unchanged, the forward wrap survives by coincidence while **the backward wrap stays broken**, reproducing the same blank strip on the left edge. |
| Interval stacking causes double-advances. | It causes **erratic pacing** and autoplay running during hover. The `isAnimating` guard at `index.html:1823` swallows a second call in the same tick. |
| The reveal fix is to re-assign the delay classes. | **Wrong approach.** Batch-index at intersection time instead — group entries by section, sort by rendered position, assign inline delays. Re-assigning classes touches ~50 attributes, requires `.reveal-delay-8..11`, collides with the 1600ms `will-change` reset, and still fails to fix `align-items: center`. |
| Hero dots at 24×24 violate WCAG target size. | They **meet** 2.5.8 Target Size (Minimum) at AA, which requires 24×24. They fall below the 44px mobile guideline, which is a different and weaker claim. |

---

*Report ends. No site files were modified in producing it.*
