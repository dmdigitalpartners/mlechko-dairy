/**
 * Repeatable SEO/technical validation for the Млечко site.
 *
 *   node seo-check.mjs                      # against http://localhost:3100
 *   node seo-check.mjs https://www.mlechko-magazin.com
 *
 * Checks only things that are objectively verifiable from the rendered page:
 * metadata presence, a single <h1>, alt coverage, JSON-LD validity, internal
 * link health and accidental noindex. It deliberately makes no ranking claims.
 */
import puppeteer from 'puppeteer';

const BASE = (process.argv[2] || 'http://localhost:3100').replace(/\/$/, '');
const PAGES = ['/', '/privacy-policy.html', '/cookie-policy.html', '/terms.html'];

let failures = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

for (const path of PAGES) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', m => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', e => consoleErrors.push(String(e)));

  const res = await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log(`\n=== ${path}  [HTTP ${res.status()}]`);

  // Lazy-loaded images below the fold never decode unless they enter the
  // viewport, which would make a naturalWidth check report them as broken.
  // Scroll the whole page, then let the network settle.
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, window.innerHeight);
        y += window.innerHeight;
        if (y < document.body.scrollHeight) setTimeout(step, 60);
        else { window.scrollTo(0, 0); resolve(); }
      };
      step();
    });
  });
  await new Promise(r => setTimeout(r, 1500));

  const d = await page.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    robots: document.querySelector('meta[name="robots"]')?.content ?? null,
    h1s: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
    lang: document.documentElement.lang,
    imgs: [...document.images].map(i => ({ src: i.currentSrc || i.src, alt: i.getAttribute('alt'), w: i.naturalWidth })),
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
    internal: [...document.querySelectorAll('a[href]')]
      .map(a => a.getAttribute('href'))
      .filter(h => h && !/^(#|tel:|mailto:|viber:|https?:)/.test(h)),
  }));

  check(res.status() === 200, 'HTTP 200', `got ${res.status()}`);
  check(!!d.title, 'has <title>', d.title);
  check(!!d.desc, 'has meta description');
  check(!!d.canonical, 'has canonical', d.canonical ?? '');
  check(d.lang === 'bg', 'lang="bg"', d.lang);
  check(d.h1s.length === 1, 'exactly one <h1>', `${d.h1s.length}: ${JSON.stringify(d.h1s)}`);
  check(!/noindex/i.test(d.robots ?? ''), 'no accidental noindex', d.robots ?? 'none');

  const noAlt = d.imgs.filter(i => i.alt === null);
  check(noAlt.length === 0, 'every <img> has an alt attribute', noAlt.map(i => i.src).join(', '));

  const broken = [];
  for (const i of d.imgs) {
    if (!i.src) { broken.push('(empty src)'); continue; }
    const r = await fetch(i.src, { method: 'HEAD' }).catch(() => null);
    if (!r || !r.ok) broken.push(`${i.src} -> ${r ? r.status : 'unreachable'}`);
  }
  check(broken.length === 0, 'every image resolves', broken.join(', '));

  for (const [i, raw] of d.ld.entries()) {
    let ok = true, types = '';
    try {
      const o = JSON.parse(raw);
      types = (o['@graph'] ? o['@graph'].map(n => n['@type']) : [o['@type']]).join(', ');
    } catch (e) { ok = false; types = e.message; }
    check(ok, `JSON-LD block ${i + 1} parses`, types);
  }

  for (const href of [...new Set(d.internal)]) {
    const url = new URL(href, BASE + path).href;
    const r = await fetch(url, { method: 'HEAD' }).catch(() => null);
    check(!!r && r.ok, `internal link ${href}`, r ? `HTTP ${r.status}` : 'unreachable');
  }

  check(consoleErrors.length === 0, 'no console errors', consoleErrors.slice(0, 3).join(' | '));
  await page.close();
}

// Site-level resources
console.log('\n=== site resources');
for (const p of ['/robots.txt', '/sitemap.xml']) {
  const r = await fetch(BASE + p).catch(() => null);
  check(!!r && r.ok, p, r ? `HTTP ${r.status}` : 'unreachable');
}
const sm = await (await fetch(BASE + '/sitemap.xml')).text();
for (const loc of [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])) {
  const r = await fetch(loc, { method: 'HEAD' }).catch(() => null);
  check(!!r && r.ok, `sitemap URL ${loc}`, r ? `HTTP ${r.status}` : 'unreachable');
}

await browser.close();
console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
