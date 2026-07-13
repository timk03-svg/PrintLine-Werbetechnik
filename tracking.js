/**
 * PrintLine Werbetechnik — Evaluation Framework
 * ================================================
 * Diese Datei stellt nur Event-Helfer (gtag-Aufrufe) bereit und lädt SELBST kein
 * Google Analytics. Das GA4-Skript wird zentral und erst nach Erteilung der
 * Statistik-Einwilligung in cookie-banner.js geladen (Mess-ID dort konfiguriert).
 * Ohne Einwilligung ist kein gtag verfügbar; die Aufrufe hier laufen dann ins Leere.
 *
 * KPIs für dieses Dashboard:
 *   • Organic Traffic (Sessions aus Google/Bing)
 *   • Telefon-Klicks (click_phone)
 *   • E-Mail-Klicks (click_email)
 *   • Kontaktformular-Absendungen (form_submit)
 *   • Scroll-Tiefe (scroll_25 / scroll_50 / scroll_75 / scroll_90)
 *   • Seiten pro Session
 *   • Sitzungsdauer
 */

(function () {
  'use strict';

  // ── Telefon-Klick-Tracking ──────────────────────────────────────
  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click_phone', {
          event_category: 'Kontakt',
          event_label: el.getAttribute('href'),
          value: 1
        });
      }
    });
  });

  // ── E-Mail-Klick-Tracking ───────────────────────────────────────
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click_email', {
          event_category: 'Kontakt',
          event_label: el.getAttribute('href'),
          value: 1
        });
      }
    });
  });

  // ── Formular-Absendung ──────────────────────────────────────────
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function () {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'Konversion',
          event_label: window.location.pathname,
          value: 1
        });
      }
    });
  });

  // ── Konfigurator-Klick-Tracking ─────────────────────────────────
  document.querySelectorAll('a[href*="konfigurator.werbung-kroner.de"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click_konfigurator', {
          event_category: 'Konversion',
          event_label: window.location.pathname,
          value: 1
        });
      }
    });
  });

  // ── Scroll-Tiefe ────────────────────────────────────────────────
  var scrollMilestones = { 25: false, 50: false, 75: false, 90: false };
  window.addEventListener('scroll', function () {
    var el     = document.documentElement;
    var total  = el.scrollHeight - el.clientHeight;
    if (total <= 0) return;
    var pct = Math.round((el.scrollTop || document.body.scrollTop) / total * 100);
    Object.keys(scrollMilestones).forEach(function (milestone) {
      if (!scrollMilestones[milestone] && pct >= parseInt(milestone)) {
        scrollMilestones[milestone] = true;
        if (typeof gtag !== 'undefined') {
          gtag('event', 'scroll_depth', {
            event_category: 'Engagement',
            event_label: milestone + '%',
            value: parseInt(milestone)
          });
        }
      }
    });
  }, { passive: true });

  // ── Outbound-Link-Tracking ──────────────────────────────────────
  document.querySelectorAll('a[href^="http"]').forEach(function (el) {
    if (el.hostname !== window.location.hostname) {
      el.addEventListener('click', function () {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'click_outbound', {
            event_category: 'Outbound',
            event_label: el.href
          });
        }
      });
    }
  });

})();
