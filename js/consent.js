/*
 * First-party consent manager: no dependencies, no third-party CMP.
 *
 * Microsoft Clarity is NOT loaded until the visitor explicitly accepts.
 * The decision is then passed to Clarity through its documented consentv2 API:
 * https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
 *
 * What this script stores (localStorage only; it sets no cookies itself):
 *   mlechko-consent     "accepted" | "declined"   (same key the earlier gate read)
 *   mlechko-consent-at  ISO-8601 time of the choice
 *   mlechko-consent-v   version of this notice ("1"). Bumping it re-asks everyone.
 * A choice older than 180 days is treated as absent, and the banner shows again.
 *
 * Only after "accepted" does Clarity load. Clarity then sets its own cookies:
 * _clck and _clsk first-party; CLID, ANONCHK, MR, MUID and SM third-party. See
 * https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies
 * ad_Storage is always passed as "denied": nothing is shared with Microsoft Ads.
 *
 * Revoking erases Clarity's cookies (clarity('consent', false), Microsoft's documented
 * method) and reloads the page, so no cookieless session keeps running either.
 *
 * Open the banner from anywhere with:  <button data-consent-open>…</button>
 * Read the state from other scripts:   window.SiteConsent.hasAnalytics()
 */
(function () {
  'use strict';

  var CFG = {
    prefix: 'mlechko',            // key 'mlechko-consent' is the one the earlier implementation used
    claritySrc: 'https://www.clarity.ms/tag/y7gch7ijp7',
    version: '1',
    maxAgeDays: 180,
    desktopSide: 'left',          // the Viber button sits bottom-right
    linkNewTab: false,
    aliases: ['MlechkoConsent'],  // trackCta() in index.html reads window.MlechkoConsent.hasAnalytics()
    // A "cookie settings" button is appended to the PARENT of each element matched here (the legal footer links).
    footerSlots: ['.footer-legal a[href="/cookie-policy.html"]', '.legal-footer a[href="/cookie-policy.html"]'],
    settingsStyle: 'margin:0',
    matchAnchorStyle: true,        // look exactly like the neighbouring legal links
    theme: { bg: '#2C3E50', fg: '#FAF7F2', muted: 'rgba(250,247,242,0.82)', btnBg: '#FAF7F2', btnFg: '#2C3E50', focus: '#C8A96E' },
    text: {
      bg: {
        title: 'Бисквитки за анализ',
        body: 'Само ако приемете, използваме Microsoft Clarity, за да видим как се използва сайтът (кликвания, скролване, записи на сесии без въведени данни). Можете да промените избора си от „Настройки за бисквитки“ в края на страницата.',
        link: 'Политика за бисквитки',
        linkHref: '/cookie-policy.html',
        accept: 'Приемам',
        decline: 'Отказвам',
        settings: 'Настройки за бисквитки',
        region: 'Съгласие за бисквитки',
        current: { accepted: 'Текущ избор: приети.', declined: 'Текущ избор: отказани.' }
      }
    }
  };

  var KEY = CFG.prefix + '-consent';
  var KEY_AT = KEY + '-at';
  var KEY_V = KEY + '-v';

  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage blocked: choice lasts for this page only */ } }

  // Returns "accepted", "declined" or null (no valid choice → ask).
  function readChoice() {
    var v = get(KEY);
    if (v !== 'accepted' && v !== 'declined') return null;
    var at = get(KEY_AT);
    if (!at) {
      // Value without a timestamp (an earlier implementation): keep it and start the clock now.
      set(KEY_AT, new Date().toISOString());
      set(KEY_V, CFG.version);
      return v;
    }
    if (get(KEY_V) !== CFG.version) return null;
    var age = Date.now() - Date.parse(at);
    if (!(age >= 0) || age > CFG.maxAgeDays * 864e5) return null;
    return v;
  }

  var clarityLoaded = false;
  function loadClarity() {
    if (clarityLoaded) return;
    clarityLoaded = true;
    var w = window;
    w.clarity = w.clarity || function () { (w.clarity.q = w.clarity.q || []).push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = CFG.claritySrc;
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(s, first);
    // Queued until the tag initialises, so the signal is in place before any cookie is set.
    w.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  }

  function revokeClarity() {
    if (!clarityLoaded || typeof window.clarity !== 'function') return false;
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
    window.clarity('consent', false); // erases Clarity cookies
    return true;
  }

  // ---- UI ---------------------------------------------------------------------------

  var banner, titleEl, bodyEl, bodyText, linkEl, currentEl, acceptBtn, declineBtn;

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'bg').slice(0, 2).toLowerCase();
    return CFG.text[l] ? l : 'bg';
  }

  function injectStyle() {
    if (document.getElementById('site-consent-style')) return;
    var t = CFG.theme;
    var css =
      '#site-consent{position:fixed;z-index:2147483000;' + CFG.desktopSide + ':1rem;bottom:1rem;max-width:24rem;box-sizing:border-box;' +
      'padding:1rem 1rem .9rem;border-radius:12px;background:' + t.bg + ';color:' + t.fg + ';' +
      'box-shadow:0 10px 30px rgba(0,0,0,.28),0 2px 6px rgba(0,0,0,.18);font-family:inherit;font-size:.875rem;line-height:1.55}' +
      '#site-consent[hidden]{display:none}' +
      '#site-consent .sc-title{margin:0 0 .4rem;font-weight:600;font-size:.95rem}' +
      '#site-consent .sc-body{margin:0 0 .5rem;color:' + t.muted + '}' +
      '#site-consent .sc-link{color:' + t.fg + ';text-decoration:underline;text-underline-offset:2px}' +
      '#site-consent .sc-current{margin:0 0 .6rem;font-size:.8rem;color:' + t.muted + '}' +
      '#site-consent .sc-current:empty{display:none}' +
      '#site-consent .sc-actions{display:flex;gap:.6rem;margin-top:.6rem}' +
      '#site-consent .sc-btn{flex:1 1 0;min-height:44px;padding:.55rem 1rem;border-radius:8px;border:1px solid ' + t.btnBg + ';' +
      'background:' + t.btnBg + ';color:' + t.btnFg + ';font:inherit;font-weight:600;cursor:pointer}' +
      '#site-consent .sc-btn:hover{filter:brightness(.94)}' +
      '#site-consent .sc-btn:focus-visible,#site-consent .sc-link:focus-visible,.sc-settings:focus-visible{outline:3px solid ' + t.focus + ';outline-offset:2px}' +
      '.sc-settings{background:none;border:0;padding:0;margin:0 0 0 .75rem;font:inherit;color:inherit;text-decoration:underline;text-underline-offset:2px;cursor:pointer}' +
      '@media (max-width:640px){#site-consent{left:0;right:0;bottom:0;max-width:none;border-radius:14px 14px 0 0;font-size:.8rem;line-height:1.45;' +
      'padding:.8rem .9rem calc(.8rem + env(safe-area-inset-bottom))}#site-consent .sc-title{font-size:.88rem;margin-bottom:.25rem}' +
      '#site-consent .sc-btn{min-height:44px;padding:.45rem .8rem}}' +
      '@media (prefers-reduced-motion:no-preference){#site-consent{animation:sc-in .25s ease-out}' +
      '@keyframes sc-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}}';
    var st = document.createElement('style');
    st.id = 'site-consent-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function build() {
    if (banner) return;
    injectStyle();
    banner = document.createElement('section');
    banner.id = 'site-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'site-consent-title');
    banner.hidden = true;
    titleEl = document.createElement('p'); titleEl.className = 'sc-title'; titleEl.id = 'site-consent-title';
    bodyEl = document.createElement('p'); bodyEl.className = 'sc-body';
    linkEl = document.createElement('a'); linkEl.className = 'sc-link';
    if (CFG.linkNewTab) { linkEl.target = '_blank'; linkEl.rel = 'noopener'; }
    currentEl = document.createElement('p'); currentEl.className = 'sc-current';
    var actions = document.createElement('div'); actions.className = 'sc-actions';
    declineBtn = document.createElement('button'); declineBtn.type = 'button'; declineBtn.className = 'sc-btn';
    acceptBtn = document.createElement('button'); acceptBtn.type = 'button'; acceptBtn.className = 'sc-btn';
    // Equal weight on purpose: refusing must be as easy as accepting.
    declineBtn.addEventListener('click', function () { decide('declined'); });
    acceptBtn.addEventListener('click', function () { decide('accepted'); });
    actions.appendChild(declineBtn); actions.appendChild(acceptBtn);
    bodyText = document.createTextNode('');
    bodyEl.appendChild(bodyText); bodyEl.appendChild(document.createTextNode(' ')); bodyEl.appendChild(linkEl);
    banner.appendChild(titleEl); banner.appendChild(bodyEl);
    banner.appendChild(currentEl); banner.appendChild(actions);
    // First in the DOM so keyboard and screen-reader users reach it first; not modal and never steals focus on load.
    document.body.insertBefore(banner, document.body.firstChild);
    render();
  }

  function render() {
    var t = CFG.text[lang()];
    if (banner) {
      banner.setAttribute('aria-label', t.region);
      titleEl.textContent = t.title;
      bodyText.nodeValue = t.body;
      linkEl.textContent = t.link;
      linkEl.href = t.linkHref;
      acceptBtn.textContent = t.accept;
      declineBtn.textContent = t.decline;
      var c = readChoice();
      currentEl.textContent = c ? t.current[c] : '';
    }
    var btns = document.querySelectorAll('.sc-settings');
    for (var i = 0; i < btns.length; i++) btns[i].textContent = t.settings;
  }

  function show(focus) {
    build();
    render();
    banner.hidden = false;
    if (focus) acceptBtn.focus();
  }

  function hide() { if (banner) banner.hidden = true; }

  function decide(choice) {
    var prev = readChoice();
    set(KEY, choice);
    set(KEY_AT, new Date().toISOString());
    set(KEY_V, CFG.version);
    hide();
    if (choice === 'accepted') {
      loadClarity();
    } else if (prev === 'accepted' && revokeClarity()) {
      // Clarity would otherwise continue this page view in cookieless mode; a reload stops it completely.
      window.setTimeout(function () { window.location.reload(); }, 150);
    }
    try { document.dispatchEvent(new CustomEvent('site-consent', { detail: { analytics: choice === 'accepted' } })); } catch (e) {}
  }

  function addSettingsButtons() {
    CFG.footerSlots.forEach(function (sel) {
      var anchors = document.querySelectorAll(sel);
      for (var i = 0; i < anchors.length; i++) {
        var slot = anchors[i].parentNode;
        if (!slot || slot.querySelector('.sc-settings')) continue;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sc-settings';
        b.setAttribute('data-consent-open', '');
        if (CFG.settingsStyle) b.setAttribute('style', CFG.settingsStyle);
        if (CFG.matchAnchorStyle && window.getComputedStyle) {
          var cs = window.getComputedStyle(anchors[i]);
          ['color', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'textDecorationLine', 'textUnderlineOffset'].forEach(function (k) { b.style[k] = cs[k]; });
        }
        slot.appendChild(b);
      }
    });
    render();
  }

  // Any element with data-consent-open reopens the banner.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-consent-open]') : null;
    if (el) { e.preventDefault(); show(true); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && banner && !banner.hidden && readChoice()) hide();
  });

  window.SiteConsent = {
    hasAnalytics: function () { return readChoice() === 'accepted'; },
    open: function () { show(true); }
  };
  CFG.aliases.forEach(function (n) { window[n] = window.SiteConsent; });

  // Load Clarity immediately for returning visitors who already accepted.
  if (readChoice() === 'accepted') loadClarity();

  function init() {
    addSettingsButtons();
    if (readChoice() === null) show(false);
    // The site's language toggle rewrites <html lang>; keep the banner in step.
    if (window.MutationObserver) {
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
