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

---

## Search Console — last 7 days

**Status: not analysed. Data unavailable.**

The task specified a Search Console property URL but the placeholder was never replaced, and this environment has no Search Console connector. No query, CTR, position or impression data was available.

Everything in this report is therefore derived from source code, production HTTP behaviour, Lighthouse, and the schema.org vocabulary — never from guessed search data. **No title or meta description was rewritten**, because there is no evidence base to justify changing copy that may already be performing.

To unblock the query-driven half of the brief, export from the property and re-run:

| Export | Range | Purpose |
|---|---|---|
| Performance → Queries | Last 7 days | Primary analysis window |
| Performance → Pages | Last 7 days | Homepage vs legal-page split |
| Performance → Queries | Previous 7 days | Trend vs noise |
| Performance → Queries | Last 28 days | Context |

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
| Rewrite title / meta description | No Search Console data. The current title may already perform; changing it blind risks regression. |
| Category landing pages (сирене, кашкавал, мляко, яйца, маслини) | No evidence of demand. Would create thin doorway pages — explicitly out of bounds. |
| `sameAs` social profiles | None supplied. |
| `AggregateRating` / `Review` markup | No genuine figures. Fabrication is a policy violation. |
| `Product` / `Offer` markup | No product URLs, prices or online purchasing. |
| Remove or restructure the hero video | Production LCP is 1.5s on mobile. Nothing to fix. |
| "Fix" the three-panel hero `<h1>` structure | Deliberate: panel 1 uses `<h1>`, panels 2–3 use styled `<p>`. Verified still exactly one `<h1>`. |
| Remove staging `noindex` | Intentional and correct. |
| `GroceryStore` → a more specific type | Owner decision, open since the previous report. |
| Change "Разгледай →" anchor text | Already inside anchors with descriptive `aria-label`s. |

---

## Next measurement window

**After 7 days** — compare against the same window this pass could not read: total and non-branded impressions, clicks, CTR, average position, movement in the 4–10 and 11–20 position bands, local vs product queries, homepage vs legal pages, mobile vs desktop.

**After 28 days** — sustained ranking changes, query diversification, non-branded growth, local visibility, CTR movement, newly ranking queries, and indexing changes. Confirm in Search Console that the legal pages are indexed now their logo resolves, and re-run the Rich Results Test to confirm the completed `GroceryStore` entity is picked up.

No ranking outcome is guaranteed.
