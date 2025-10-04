// Cookie Banner Script
// Cookie Banner Script

function showCookieSettings() {
  // Entferne evtl. vorhandenes Banner
  var old = document.getElementById('cookie-banner');
  if (old) old.remove();
  createCookieBanner(true);
}


function createCookieBanner(forceShow) {
  // Immer anzeigen, egal ob schon zugestimmt wurde

  // Banner HTML
  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-modal">
      <h3>Cookie-Einstellungen</h3>
      <p>Wir verwenden Cookies, um unsere Website zu verbessern und Werbung gezielt zu steuern. Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten.</p>
      <form id="cookie-form">
        <label><input type="checkbox" checked disabled> Notwendig (immer aktiv)</label><br>
        <label><input type="checkbox" id="cookie-statistik"> Statistik (z. B. Google Analytics)</label><br>
        <label><input type="checkbox" id="cookie-marketing"> Marketing (z. B. Google Ads)</label>
      </form>
      <div class="cookie-buttons">
        <button id="accept-all">Alle akzeptieren</button>
        <button id="reject-all">Alle ablehnen</button>
        <button id="save-cookies">Auswahl speichern</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  // CSS
  var style = document.createElement('style');
  style.innerHTML = `
    #cookie-banner {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(30, 41, 55, 0.7);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: brightness(0.85); /* Gesamter Banner 15% dunkler */
    }
    .cookie-modal {
      background: linear-gradient(90deg, #40E0D0 0%, #C084FC 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      padding: 32px 24px 24px 24px;
      max-width: 350px;
      width: 90vw;
      text-align: center;
      font-family: inherit;
      color: #1F2937;
      filter: brightness(0.9) saturate(0.9); /* Farben 10% dunkler und entsättigt */
    }
    .cookie-modal h3 { margin-top: 0; }
    .cookie-buttons { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
    .cookie-buttons button {
      background: #40E0D0;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    .cookie-buttons button:hover { background: #C084FC; color: #1F2937; }
  `;
  document.head.appendChild(style);

  // Button-Logik
  function setConsent(statistik, marketing) {
    // Kein localStorage mehr, Banner wird immer angezeigt
    document.getElementById('cookie-banner').remove();
    if (statistik) loadTracking('statistik');
    if (marketing) loadTracking('marketing');
  }
  function loadTracking(type) {
    // Beispiel: Google Analytics nur laden, wenn Statistik erlaubt
    if (type === 'statistik') {
      var s = document.createElement('script');
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
      s.async = true;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    }
    // Beispiel: Marketing-Skript
    if (type === 'marketing') {
      // Hier weiteres Marketing-Tracking einbinden
    }
  }
  document.getElementById('accept-all').onclick = function(e) {
    e.preventDefault();
    setConsent(true, true);
  };
  document.getElementById('reject-all').onclick = function(e) {
    e.preventDefault();
    setConsent(false, false);
  };
  document.getElementById('save-cookies').onclick = function(e) {
    e.preventDefault();
    var statistik = document.getElementById('cookie-statistik').checked;
    var marketing = document.getElementById('cookie-marketing').checked;
    setConsent(statistik, marketing);
  };

  // Consent wird nicht mehr gespeichert, Tracking nur nach Klick geladen
}

// Banner nur auf index.html anzeigen und nur einmal pro Besuch (Session)
if (
  window.location.pathname.endsWith('index.html') ||
  window.location.pathname === '/' ||
  window.location.pathname === '/index.html'
) {
  if (!window.sessionStorage.getItem('cookieBannerShown')) {
    var oldBanner = document.getElementById('cookie-banner');
    if (oldBanner) oldBanner.remove();
    createCookieBanner();
    window.sessionStorage.setItem('cookieBannerShown', '1');
  }
}
if (!window.showCookieSettings) {
  window.showCookieSettings = function() {
    window._forceShowCookieBanner = true;
    showCookieSettings();
    setTimeout(function() { window._forceShowCookieBanner = false; }, 1000);
  };
}
