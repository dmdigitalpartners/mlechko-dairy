# Mlechko Dairy

The website for **Млечко (Mlechko)**, a specialty grocery shop in Plovdiv, Bulgaria (бул. Пещерско шосе 26, кв. Младежки хълм) carrying over 100 kinds of fresh dairy products, eggs, and olives, delivered weekly straight from producers. It's a single-page marketing site — story, product categories, an in-store photo tour, reviews, FAQ, and directions — built as static HTML/CSS/JS, with a heavy focus on performance, accessibility and local SEO. Built and maintained for the client by D&M Digital Partners.

> Note: the site's own content, metadata and structured data consistently name the business **Млечко / Mlechko** (canonical domain `mlechko-magazin.com`) — there is no "Bokki" branding anywhere in the current codebase.

## What it offers

- **Single-page layout** (`index.html`, one navigable page) with sections for About, Product categories, a "Нашият магазин" store gallery, customer testimonials, FAQ, and a "Намерете ни" contact/visit section with an embedded Google Map.
- **Three product categories** featured with dedicated imagery: dairy products, eggs, and olives & delicatessen.
- **Bilingual-ready groundwork**: the page is in Bulgarian (`lang="bg"`), the market it serves.
- **Legal pages**: `privacy-policy.html`, `terms.html`, `cookie-policy.html`, plus a branded `404.html`.
- **SEO/schema** — canonical URL, Open Graph/Twitter meta, JSON-LD structured data (GroceryStore + FAQ), `sitemap.xml`, `robots.txt`, Google Search Console verification file.
- **Performance work** — self-hosted subsetted fonts (Inter, Playfair Display, per-language `unicode-range` splits), responsive AVIF/WebP images at multiple breakpoints, a `.js`-gated reveal-animation system that fails open (renders complete content if JS never runs), and a hero video with mobile/desktop variants (`media/hero-768.mp4`, `media/hero-1280.mp4`).
- **Accessibility & privacy** — ARIA landmarks, keyboard-accessible mobile nav, a documented accessibility audit pass, and Microsoft Clarity analytics scoped through CSP.

## How it works

- **Stack:** plain HTML with all CSS and JS inline in `index.html` (no framework, no Tailwind, no build step). This is a deliberate choice recorded in the project's own audit docs — it's a single ~2,600-line page.
- **Content:** all copy, product-category text, testimonials and FAQ answers live directly inside `index.html`. There's no CMS or data file — edit the relevant `<section>` in place.
- **Contact/business info** (address, phone `+359 87 823 2365`, map query) is hardcoded in the header, hero, and "Намерете ни" section of `index.html`; keep all three in sync if it ever changes.
- **Fonts** are self-hosted `.woff2` files in `fonts/`, split by Unicode range (Latin, Cyrillic, Greek, etc.) to avoid loading glyphs the page doesn't use — don't replace this with a Google Fonts `<link>` without re-checking the performance audit's rationale.
- **Images** ship as paired AVIF/WebP files at multiple widths (e.g. `store-milk-400`/`-800`) for responsive `<picture>`/`srcset` delivery; originals live in `Enhanced images/` and `Store Images/`.
- **Historical audit/planning docs** at the repo root (`AUDIT_REPORT.md`, `FIXES_PLAN.md`, `WEBSITE_IMPROVEMENT_REPORT.md`, `SEO-AUDIT.md`) are dated work logs from prior review passes (June–August 2026) — useful as a record of what was found and fixed, not living specs.

## Project structure

```text
index.html              The entire site (markup, inline CSS, inline JS)
privacy-policy.html      Legal pages
terms.html
cookie-policy.html
404.html                Branded not-found page
fonts/                   Self-hosted Inter & Playfair Display (.woff2, per Unicode range)
images/                  Responsive AVIF/WebP product & store photography
media/                   Hero video (mobile + desktop variants)
Enhanced images/         Source category/feature imagery
Store Images/            Source in-store photography
serve.mjs               Local static server
screenshot.mjs           Puppeteer screenshot helper for design review
seo-check.mjs           SEO validation script
measure-bytes.sh        Asset size measurement helper
vercel.json             Security & caching headers
AUDIT_REPORT.md, FIXES_PLAN.md, WEBSITE_IMPROVEMENT_REPORT.md, SEO-AUDIT.md
                         Dated review/audit reports from past work passes
```

## Getting started

```bash
npm install     # installs axe-core, Lighthouse, Puppeteer (dev/audit tooling only)
node serve.mjs   # serves the project root at http://localhost:3000
```

There is no build step — `index.html` is served as-is. `package.json` has no `start`/`build` script beyond the default placeholder `test`; run `node serve.mjs` directly. No environment variables are required — the site has no server-side code or secrets.

## Deployment

Hosted on Vercel (`vercel.json` defines headers only — no custom build/output config, so Vercel serves the static files directly). Security headers (CSP, HSTS, X-Frame-Options, etc.) are set globally, static assets get long-lived caching (fonts: 1 year immutable; images/media: 1 day with stale-while-revalidate; favicons: 1 week), and the Vercel preview subdomain (`mlechko-dairy.vercel.app`) is marked `noindex`. Git history (`git log`) shows recent work merged into `main` via pull requests; the production domain is `mlechko-magazin.com` (per the canonical URL and Open Graph tags in `index.html`).

## Maintenance notes

- Everything lives in one HTML file — when editing, search for the relevant `id="..."` section (`about`, `categories`, `dairy-feature`, `eggs-feature`, `olives-feature`, `store`, `testimonials`, `faq`, `visit`) rather than assuming a component boundary.
- The `.gitignore` excludes several working files that shouldn't reappear in commits (`dairy.zip`, various `*copy.md` research files, `site-improvements.md`) — this repo's history includes prior cleanup of those.
- The audit/report `.md` files at the root document what was already fixed; check them before re-diagnosing a "new" performance or accessibility issue, it may already be resolved.
- Font subsetting and responsive image variants are load-bearing for the documented Lighthouse scores — if adding new imagery or text, follow the existing AVIF/WebP + multi-width pattern rather than dropping in a single large file.

---
Built and maintained by D&M Digital Partners.
