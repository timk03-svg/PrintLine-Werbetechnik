(function () {
  'use strict';

  var STORAGE_KEY = 'printline_cookie_consent';
  var EXPIRY_DAYS = 180;

  /* ══ GA4 hier eintragen ══════════════════════════════════════
     Deine Google-Mess-ID (Format G-XXXXXXXXXX) einsetzen.
     Solange leer, wird KEIN Tracking geladen.
     Analytics startet erst, wenn der Besucher „Statistik" akzeptiert. */
  var GA4_ID = 'G-6XRV54KWK1';   // GA4-Mess-ID von PrintLine Werbetechnik

  /* ── Consent lesen ──────────────────────────────────────────── */
  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.expires && Date.now() > data.expires) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch (e) { return null; }
  }

  /* ── Consent speichern ──────────────────────────────────────── */
  function saveConsent(statistik, marketing) {
    var expires = Date.now() + EXPIRY_DAYS * 86400000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ statistik: statistik, marketing: marketing, expires: expires }));
  }

  /* ── Tracking laden (nur nach Einwilligung) ─────────────────── */
  var ga4Geladen = false;
  function loadTracking(statistik, marketing) {
    // Sofortiger Opt-out: GA4 deaktivieren, falls bereits geladen → Widerruf wirkt im selben Pageload
    if (GA4_ID) window['ga-disable-' + GA4_ID] = !statistik;
    // Google Analytics 4 — lädt nur bei Statistik-Einwilligung UND gesetzter ID
    if (statistik && GA4_ID && !ga4Geladen) {
      ga4Geladen = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      // IP-Anonymisierung an für DSGVO-Konformität
      window.gtag('config', GA4_ID, { anonymize_ip: true });
    }
    // Google Ads / Conversion → hier bei marketing === true ergänzen
  }

  /* ── Banner entfernen ───────────────────────────────────────── */
  function removeBanner() {
    var b = document.getElementById('plcb');
    if (b) b.remove();
    var old = document.getElementById('cookie-banner');
    if (old) old.remove();
  }

  /* ── Banner erstellen (theme-aware, nutzt Design-Tokens) ────── */
  function createBanner() {
    removeBanner();

    if (!document.getElementById('plcb-style')) {
      var style = document.createElement('style');
      style.id = 'plcb-style';
      style.textContent = [
        '#plcb{',
          'position:fixed;bottom:1.25rem;left:50%;transform:translateX(-50%);',
          'width:calc(100% - 2.5rem);max-width:900px;',
          'background:var(--glass-strong,rgba(255,255,255,.9));',
          'backdrop-filter:saturate(160%) blur(20px);-webkit-backdrop-filter:saturate(160%) blur(20px);',
          'border:1px solid var(--glass-border,rgba(0,0,0,.1));border-radius:var(--r-l,22px);',
          'box-shadow:var(--sh-l,0 24px 60px rgba(16,32,50,.18));',
          'z-index:99999;font-family:"Inter",-apple-system,sans-serif;color:var(--text,#16202e);',
          'padding:1.1rem 1.4rem;',
          'animation:plcb-up .4s cubic-bezier(.16,1,.3,1);',
        '}',
        '@keyframes plcb-up{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}',
        '#plcb-row{display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;}',
        '#plcb-txt{display:flex;align-items:flex-start;gap:.65rem;flex:1;min-width:200px;}',
        '#plcb-ico{font-size:1.4rem;margin-top:2px;flex-shrink:0;}',
        '#plcb-hed{font-family:"Sora",sans-serif;font-weight:700;font-size:.95rem;color:var(--text,#16202e);margin:0 0 .15rem;}',
        '#plcb-sub{font-size:.82rem;color:var(--text-soft,#475569);margin:0;line-height:1.5;}',
        '#plcb-sub a{color:var(--accent-ink,#0D9488);text-decoration:underline;}',
        '#plcb-ctrl{display:flex;align-items:center;gap:.85rem;flex-wrap:wrap;}',
        '#plcb-checks{display:flex;gap:.75rem;}',
        '.plcb-lbl{display:flex;align-items:center;gap:.3rem;font-size:.82rem;color:var(--text-soft,#475569);cursor:pointer;white-space:nowrap;}',
        '.plcb-lbl input{accent-color:var(--tuerkis-tief,#0D9488);cursor:pointer;width:15px;height:15px;}',
        '#plcb-btns{display:flex;gap:.45rem;flex-wrap:wrap;}',
        '#plcb-btns button{',
          'border:none;border-radius:var(--r-pill,999px);padding:.5rem 1rem;',
          'font-family:"Sora",sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;',
          'transition:transform .15s,opacity .15s;white-space:nowrap;line-height:1.4;',
        '}',
        '#plcb-btns button:hover{transform:translateY(-2px);}',
        /* "Ablehnen" gleich prominent wie "Alle akzeptieren" (DSGVO: kein Nudging); fixe Farbe → in Hell- und Dunkelmodus sichtbar */
        '#plcb-no{background:#0D9488;border:none!important;color:#fff;}',
        '#plcb-sv{background:transparent;border:1.5px solid var(--border,rgba(16,32,50,.28))!important;color:var(--text-soft,#475569);}',
        '#plcb-ok{background:linear-gradient(100deg,#40E0D0,#C084FC);color:#062e2a;box-shadow:0 8px 24px rgba(64,224,208,.32);}',
        '@media(max-width:600px){',
          '#plcb{padding:.9rem 1rem;border-radius:16px;bottom:.75rem;}',
          '#plcb-row{gap:.75rem;}',
          '#plcb-btns{width:100%;}#plcb-btns button{flex:1;}',
        '}',
      ].join('');
      document.head.appendChild(style);
    }

    var b = document.createElement('div');
    b.id = 'plcb';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie-Einstellungen');
    b.innerHTML =
      '<div id="plcb-row">' +
        '<div id="plcb-txt">' +
          '<span id="plcb-ico" aria-hidden="true">🍪</span>' +
          '<div>' +
            '<p id="plcb-hed">Cookies &amp; Datenschutz</p>' +
            '<p id="plcb-sub">Wir nutzen Cookies für Statistik und Marketing. ' +
            '<a href="datenschutz.html">Mehr erfahren</a></p>' +
          '</div>' +
        '</div>' +
        '<div id="plcb-ctrl">' +
          '<div id="plcb-checks">' +
            '<label class="plcb-lbl"><input type="checkbox" id="plcb-stat"> Statistik</label>' +
            '<label class="plcb-lbl"><input type="checkbox" id="plcb-mkt"> Marketing</label>' +
          '</div>' +
          '<div id="plcb-btns">' +
            '<button id="plcb-no" type="button">Ablehnen</button>' +
            '<button id="plcb-sv" type="button">Auswahl speichern</button>' +
            '<button id="plcb-ok" type="button">Alle akzeptieren</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(b);

    document.getElementById('plcb-no').onclick = function () { saveConsent(false, false); loadTracking(false, false); removeBanner(); };
    document.getElementById('plcb-sv').onclick = function () {
      var s = document.getElementById('plcb-stat').checked;
      var m = document.getElementById('plcb-mkt').checked;
      saveConsent(s, m); loadTracking(s, m); removeBanner();
    };
    document.getElementById('plcb-ok').onclick = function () { saveConsent(true, true); loadTracking(true, true); removeBanner(); };
  }

  /* ── Globale Funktion + [data-cookie]-Delegation ────────────── */
  window.showCookieSettings = createBanner;

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-cookie]') : null;
    if (!el && e.target.hasAttribute && e.target.hasAttribute('data-cookie')) el = e.target;
    if (el) { e.preventDefault(); createBanner(); }
  });

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    var old = document.getElementById('cookie-banner');
    if (old) old.remove();
    var consent = getConsent();
    if (!consent) setTimeout(createBanner, 800);
    else loadTracking(consent.statistik, consent.marketing);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
