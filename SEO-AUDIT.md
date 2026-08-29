# SEO Audit — mlechko-magazin.com

**Date:** 2026-08-29
**Branch:** `seo/deep-audit`
**Scope:** technical SEO, local SEO, structured data, entity consistency, image and Core Web Vitals verification.
**Not in scope:** visual redesign. No layout, colour, font or section changes were made.

---

## Executive summary

The site was already in good SEO health before this pass. Canonicalisation, `robots.txt`, the sitemap, Search Console verification, self-hosted fonts, responsive AVIF/WebP images and the staging-domain `noindex` were all correct and were left alone. Production scored **99 mobile / 97 desktop** in Lighthouse with **LCP 1.5s mobile / 0.5s desktop** and **CLS 0** before any change.

This pass therefore closed gaps rather than fixing a broken site. Three findings were material:

1. **`images/Mlechko-Logo.png` returned HTTP 404 in production.** It is listed in `.vercelignore`, so it was never deployed — yet all three indexed legal pages and the 404 page referenced it. The logo has been broken on those pages. Fixed by pointing them at `images/logo-340.webp`, which is deployed, already used by the homepage, and **26x smaller** (16 KB vs 415 KB).
2. **The navigation read "ЧЗБ".** The correct Bulgarian abbreviation for *Често Задавани Въпроси* is **ЧЗВ**. This typo was visible to every visitor and was also the sole cause of the only failing Lighthouse audit on production (`label-content-name-mismatch`, WCAG 2.5.3 Label in Name).
3. **The address was written two ways** — `кв. Младежки хълм` in three places and `гк. Младежки хълм` in two. Inconsistent NAP data is the most common local-SEO defect for a physical business. Normalised to `кв.`, the standard Bulgarian abbreviation for *квартал* and the form already used in the structured data.

The business entity graph was also completed with verifiable data only.

**Search Console context (now available):** the last-7-days export contains **13 impressions and 1 click**, with 73% of attributed impressions on the brand term alone and the site ranking **4.38 for its own name**. This is the profile of a site Google has only just started to understand. It confirms the entity-strengthening work in this pass was the right priority, and it is far too small a sample to justify rewriting titles or copy — so none were rewritten. Full analysis below.

---

## Search Console — last 7 days

Export: `mlechko-magazin.com-Performance-on-Search-2026-08-29.zip`, Web search, Last 7 days.

| Metric | Value |
|---|---:|
| Clicks | **1** |
| Impressions | **13** |
| CTR | **7.69%** |
| Average position | **5.31** |

### Read this section with the sample size in mind

The window contains **13 impressions and 1 click**, and only **3 of 7 days carry any data at all** (23–26 August; 27–29 August are absent to Google's normal 2–3 day processing lag). Four queries are named; they account for 11 impressions, so **2 impressions are withheld** under Google's rare-query anonymisation.

At this volume almost nothing is statistically separable from noise. A 0% CTR on 8 impressions is exactly what you would expect from a query that converts at 10%, so it is **not** evidence of a CTR problem. This data is reported because it was asked for, and because it does say something useful about *discovery* — but it cannot carry a content or title strategy, and it was not used to justify one.

### Queries

| Query | Impressions | Clicks | CTR | Position | Intent |
|---|---:|---:|---:|---:|---|
| млечко | 8 | 0 | 0% | 4.38 | Branded |
| магазини в пловдив | 1 | 0 | 0% | 2.0 | Local category |
| млечен магазин | 1 | 0 | 0% | 4.0 | Category |
| производител на яйца | 1 | 0 | 0% | 21.0 | Product — **mismatched** |
| *(anonymised)* | 2 | 1 | — | — | unknown |

### What this actually tells us

**1. Google barely knows the site yet.** Thirteen impressions in a week is the profile of a site that has only recently been indexed or recently changed domain. This is the single most important context for everything else here.

**2. Discovery is almost entirely branded.** The brand term is 8 of 11 attributed impressions — **73%**. Non-branded discovery amounts to three impressions. There is no meaningful product or category visibility to optimise yet.

**3. The site ranks 4.38 for its own name.** A business should rank first for its own brand. This is the clearest signal in the export, and it is an *entity-strength* problem rather than a copy problem — which is precisely what this pass addressed: stable `@id`, `logo`, `legalName`, ЕИК, `areaServed` and a `WebSite` node tying the site to the business. Note also that for a physical shop, brand searches often resolve inside the Maps panel — the searcher calls or gets directions without ever clicking the website — so some of that 0% is structural, not fixable on-site.

**4. `производител на яйца` ("egg producer") at position 21 is Google mis-modelling the business.** Млечко *sells* eggs; it does not produce them. This is a symptom of thin entity understanding, not an opportunity — it should not be optimised for.

**5. Mobile is 85% of impressions** (11 vs 2), and ranks far better than desktop (4.27 vs 11.0). Consistent with local-store intent and it validates the mobile-first work already in the codebase.

**6. Only the homepage has any impressions.** The three legal pages registered none. Nothing here argues for breaking the single-page architecture.

**7. Search appearance is empty** — no rich results are being attributed. Expected: Google restricted FAQ rich results to authoritative government and health sites in 2023, so the `FAQPage` markup is valid but will not produce a visible enhancement for a retail shop. It is kept because it is accurate, not because it will earn stars.

**8. All traffic is from Bulgaria.** No geographic dilution.

### What was deliberately *not* concluded

No title or meta description was rewritten. With one click and four named queries over three days, any copy change would be a guess dressed as evidence, and the current title may already be performing. The correct move on a site this new is to strengthen entity signals and technical correctness — done — and re-measure once impressions accumulate.

I also could not inspect the real Plovdiv SERP: the web search available here is US-localised, so competitor and SERP-feature research for Bulgarian queries could not be performed to a standard worth acting on.

---

## Technical SEO

### Canonicalisation — verified correct, unchanged

| Host | Result |
|---|---|
| `http://mlechko-magazin.com` | 308 → `https://mlechko-magazin.com/` |
| `https://mlechko-magazin.com` | 308 → `https://www.mlechko-magazin.com/` |
| `http://www.mlechko-magazin.com` | 308 → `https://www.mlechko-magazin.com/` |
| `https://www.mlechko-magazin.com` | **200** |
| `https://mlechko-dairy.vercel.app` | 200 + `X-Robots-Tag: noindex` |

The Vercel staging `noindex` in `vercel.json` is deliberate and correct — it stops the preview host competing with the canonical domain. **It was preserved.** A nonexistent path returns a genuine HTTP 404, not a soft 404.

One inconsistency was fixed: `<link rel="canonical">` and `og:url` omitted the trailing slash while `sitemap.xml` included it. Both now use `https://www.mlechko-magazin.com/`, the form the server actually serves.

### robots.txt — unchanged

Valid, allows crawling, declares the correct canonical sitemap URL. No change needed.

### sitemap.xml — `lastmod` corrected

All four URLs return 200. `lastmod` read `2026-08-19`, predating the 27–28 August rework. Dates were corrected **from git history per file** rather than being stamped with today's date for everything — Google ignores `lastmod` it judges inaccurate.

---

## Local SEO

| Field | Value | Source |
|---|---|---|
| Public brand | Млечко | Site, webmanifest |
| Legal entity | ЛАЗАРИН ГРУП ЕООД | `terms.html`, `privacy-policy.html` |
| ЕИК | 208788896 | `terms.html` |
| Address | бул. Пещерско шосе 26, кв. Младежки хълм, 4002 Пловдив | Site |
| Phone | 0878 232 365 / +359878232365 | Site |
| Hours | Mon–Fri 09:30–20:00 · Sat 08:30–14:30 · Sun closed | Site |
| Coordinates | 42.1406741, 24.7308872 | Confirmed against the Google Maps place link |
| Trading since | 2010 | Site FAQ |

The `hasMap` short link was resolved and confirmed to point at a real Google Maps place (`/g/11ntnj9y9m`) at exactly the coordinates in the schema.

**NAP consistency fixed** — see finding 3 above.

**`tel:` links converted to E.164.** All four (nav, mobile menu, contact, footer) were `tel:0878232365`, which fails to dial from outside Bulgaria and did not match the `telephone` value in the structured data. Now `tel:+359878232365`. The displayed text is unchanged.

**Google Business Profile alignment: not verified.** No access was available. The site side is internally consistent; the GBP side could not be compared.

---

## Structured data

### Before

A single `GroceryStore` node and a `FAQPage` node. The business node had no stable identifier, no logo, no legal identity and no service area.

### After

One `@graph` containing a `GroceryStore` and a `WebSite` node, plus the unchanged `FAQPage`.

Added, all verifiable:

- `@id` `…/#business` — a stable entity anchor other nodes reference
- `legalName` ЛАЗАРИН ГРУП ЕООД and `identifier` ЕИК 208788896 — from the published legal pages
- `logo`, and `image` widened to an array of four real store photographs
- `areaServed` — Пловдив
- `foundingDate` 2010 — supported by the visible FAQ
- A `WebSite` node whose `publisher` references `#business`, strengthening the site-name signal

Deliberately **omitted**:

- `sameAs` — no social profiles were supplied. Two `TODO` comments have reserved space for these since an earlier revision.
- `aggregateRating` / `Review` — no genuine Google figures were supplied. Fabricating these violates Google's structured-data policy and risks a manual action. The eight testimonials hardcoded on the page have no verifiable source and were **not** marked up.
- `priceRange` — no price band is published.
- `paymentAccepted` — unconfirmed.
- `currenciesAccepted` — deliberately dropped after initially being added. Bulgaria's euro adoption status could not be verified from here, so asserting a currency would have been a guess.
- `Product` / `Offer` markup — there are no individual product URLs, no published prices and no online purchasing. Google's Product documentation does not apply to this page, and forcing merchant markup to satisfy a validator would be a policy violation.

### Validation performed

- Both JSON-LD blocks parse as valid JSON.
- **Every property was checked against the live schema.org vocabulary** (1.5 MB `schemaorg-current-https.jsonld`), resolving each type's full ancestor chain. All 15 `GroceryStore`, 4 `WebSite` and 1 `FAQPage` properties are valid for their type.
- **Every factual claim was cross-checked against visible page text** — name, street, locality, postcode, phone, email, both opening-hours ranges, founding year, legal name and ЕИК. All 11 supported.

Valid structured data does not guarantee a rich result. No rich result is promised here.

---

## Images

- Legal pages and the 404 page were loading a **415 KB PNG that 404s in production**. Now a deployed 16 KB WebP with explicit `width`/`height` to prevent layout shift.
- Every `<img>` on all four indexable pages has an `alt` attribute; every image resolves over HTTP.
- Alt text is descriptive and specific (for example *"Витрина с бяло саламурено сирене, извара и кисело мляко в тави"*), not keyword-stuffed. No changes needed.
- `.vercelignore` already excluded the ~33 MB of unreferenced source assets (`Hero video.mp4`, `Enhanced images/`, `Store Images/`). No change required.

---

## Core Web Vitals

**Production, before this pass** — the numbers that matter, since the site is served compressed by Vercel:

| | Performance | LCP | CLS | TBT | A11y | SEO |
|---|---:|---:|---:|---:|---:|---:|
| Mobile | 99 | 1.5s | 0 | 0ms | 100 | 100 |
| Desktop | 97 | 0.5s | 0 | 0ms | 100 | 100 |

All well inside Google's thresholds (LCP ≤ 2.5s, CLS < 0.1). **No performance work was warranted.**

**Local before → after** (like-for-like, `serve.mjs` on port 3100):

| | Perf | LCP | CLS | Failing a11y/SEO/BP audits |
|---|---:|---:|---:|---:|
| Desktop before | 99 | 0.9s | 0 | **1** (`label-content-name-mismatch`) |
| Desktop after | 99 | 0.9s | 0 | **0** |
| Mobile before | 82 | 4.0s | 0 | 0 |
| Mobile after | 82 | 4.0s | 0 | 0 |

The local mobile score of 82 / LCP 4.0s is an **artifact of the dev server, not a real defect**: `serve.mjs` sends no compression, so the 152 KB HTML and the 1.57 MB hero video arrive uncompressed over Lighthouse's throttled connection. The same page on Vercel scores 99 with LCP 1.5s. This was verified, not assumed.

---

## Changes implemented

| File | Change | Why |
|---|---|---|
| `index.html` | `ЧЗБ` → `ЧЗВ`, `aria-label` now contains the visible label | Content typo; clears WCAG 2.5.3 failure |
| `index.html` | `гк.` → `кв. Младежки хълм` (2 places) | NAP consistency |
| `index.html` | 4 x `tel:` → E.164 | International dialling; matches schema |
| `index.html` | canonical + `og:url` trailing slash | Matches sitemap and served URL |
| `index.html` | `GroceryStore` + `WebSite` entity graph | Entity understanding, site-name signal |
| `privacy-policy.html`, `cookie-policy.html`, `terms.html`, `404.html` | Logo → deployed WebP with dimensions | **Fixes a live 404**; −399 KB per page |
| `sitemap.xml` | Accurate per-file `lastmod` | Google ignores inaccurate `lastmod` |
| `serve.mjs` | `PORT` env override; AVIF/XML/TXT/webmanifest MIME types | Dev-only. Port 3000 was occupied by an unrelated project; the missing AVIF type corrupted local measurement |
| `seo-check.mjs` | New repeatable validation script | Regression safety |
| `package-lock.json` | `bokki-dairy` → `mlechko-dairy` | `npm install` corrected a stale name |

`seo-check.mjs` verifies, on all four pages: HTTP 200, title, meta description, canonical, `lang="bg"`, exactly one `<h1>`, no accidental `noindex`, alt coverage, every image resolving, JSON-LD parsing, internal link health, console errors, plus `robots.txt` and every sitemap URL. Run it with `node seo-check.mjs [origin]`.

**Result: ALL CHECKS PASSED** locally.

---

## Deliberately not done

| Idea | Why not |
|---|---|
| Rewrite title / meta description | Search Console shows 13 impressions and 1 click over 3 days. A 0% CTR on 8 impressions is statistically indistinguishable from a healthy CTR. Changing copy on that basis is guessing, and the current title may already perform. |
| Category landing pages (сирене, кашкавал, мляко, яйца, маслини) | Zero product-category impressions in the export. Only the homepage registers at all. Would create thin doorway pages — explicitly out of bounds. |
| `sameAs` social profiles | None supplied. |
| `AggregateRating` / `Review` markup | No genuine figures. Fabrication is a policy violation. |
| `Product` / `Offer` markup | No product URLs, prices or online purchasing. |
| Remove or restructure the hero video | Production LCP is 1.5s on mobile. Nothing to fix. |
| "Fix" the three-panel hero `<h1>` structure | Deliberate: panel 1 uses `<h1>`, panels 2–3 use styled `<p>`. Verified still exactly one `<h1>`. |
| Remove staging `noindex` | Intentional and correct. |
| `GroceryStore` → a more specific type | Owner decision, open since the previous report. |
| Change "Разгледай →" anchor text | Already inside anchors with descriptive `aria-label`s. |
| Optimise for `производител на яйца` (pos 21) | Млечко sells eggs, it does not produce them. Chasing this would make the entity *less* accurate. |

---

## Next measurement window

### Baseline to beat (23–29 Aug 2026, 3 days of data)

| Metric | Value |
|---|---:|
| Clicks | 1 |
| Impressions | 13 |
| CTR | 7.69% |
| Average position | 5.31 |
| Branded share of impressions | 73% |
| Mobile share of impressions | 85% |
| Pages with impressions | 1 (homepage) |

### Watchlist — the five queries to track

| Query | Now | What would count as progress |
|---|---|---|
| `млечко` | pos 4.38, 8 impr | Position 1–2. This is the brand term; anything less means the entity is still unclear to Google. |
| `млечко пловдив` | not appearing | Appearing at all. Brand + city is the highest-intent query this business has. |
| `млечен магазин` | pos 4.0, 1 impr | Impression growth. Position is already fine; the term simply has little volume attached to the site yet. |
| `магазини в пловдив` | pos 2.0, 1 impr | Impression growth at a stable position. |
| `производител на яйца` | pos 21, 1 impr | **Disappearing.** This is Google mis-modelling the shop as a producer; losing it is a sign the entity got clearer, not worse. |

### After 7 days

Total and non-branded impressions, clicks, CTR, average position, and whether any *new* non-branded query appears. With volume this low, treat impression count — not CTR — as the signal. Expect noise.

### After 28 days

Only at this point is there enough data to judge anything. Assess: sustained position on the brand term; whether non-branded share has risen above ~27%; query diversification, particularly product terms (сирене, кашкавал, прясно мляко, яйца, маслини) and local modifiers (Пловдив, Пещерско шосе); whether the shop starts appearing for city-qualified category searches; mobile vs desktop split; and whether the legal pages register impressions now their logo resolves.

Also re-run the Rich Results Test to confirm the completed `GroceryStore` entity is picked up, and re-run `node seo-check.mjs https://www.mlechko-magazin.com` after deployment.

**If non-branded impressions are still in single digits after 28 days**, the constraint is not on-page SEO — it is that the business has almost no external presence. The highest-leverage action then is the Google Business Profile and real citations, not further changes to this site.

No ranking outcome is guaranteed.
