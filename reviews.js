/**
 * PrintLine Werbetechnik – Bewertungen
 * ====================================
 * Die Bewertungssektion auf der Startseite ist standardmäßig AUSGEBLENDET.
 * Sie erscheint automatisch, sobald hier unten mindestens eine echte Bewertung
 * eingetragen ist. Dann wird auch das Bewertungs-Schema (AggregateRating/Review)
 * für Google ergänzt – das ist nur mit echten, sichtbaren Bewertungen zulässig.
 *
 * NEUE BEWERTUNG EINTRAGEN: einfach ein Objekt in die Liste PL_REVIEWS einfügen:
 *   { name: "Max M.", ort: "Stendal", rating: 5, text: "Schnell, freundlich, top Ergebnis.", date: "2026-07" }
 * (rating = 1–5, text = Bewertungstext, ort/date optional)
 */
window.PL_REVIEWS = [
  // Noch keine Bewertungen – Liste leer lassen oder hier echte Bewertungen eintragen:
  // { name: "Beispiel Kunde", ort: "Stendal", rating: 5, text: "…", date: "2026-07" },
];

window.PL_GOOGLE_REVIEW_URL = "https://share.google/znhlfRnPWObpDEKwx";

(function () {
  "use strict";
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function stars(n) {
    var full = Math.round(n), s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }
  function init() {
    var sec = document.getElementById("bewertungen");
    if (!sec) return;
    var reviews = (window.PL_REVIEWS || []).filter(function (r) { return r && r.text && r.rating; });
    if (!reviews.length) return; // bleibt versteckt, solange keine Bewertung da ist

    var sum = reviews.reduce(function (a, r) { return a + Number(r.rating); }, 0);
    var avg = Math.round((sum / reviews.length) * 10) / 10;

    var head = document.getElementById("pl-reviews-head");
    if (head) {
      head.innerHTML =
        '<p style="font-size:1.1rem;margin:0 0 .4rem"><span style="color:#f5a623;letter-spacing:2px">' +
        stars(avg) + '</span> <strong>' + avg.toFixed(1) + "</strong> / 5 · " +
        reviews.length + " Bewertung" + (reviews.length === 1 ? "" : "en") + "</p>";
    }

    var list = document.getElementById("pl-reviews-list");
    if (list) {
      list.innerHTML = reviews.map(function (r) {
        var meta = [r.ort, r.date].filter(Boolean).map(esc).join(" · ");
        return '<figure class="card"><figcaption class="card__body">' +
          '<span style="color:#f5a623;letter-spacing:1px">' + stars(r.rating) + "</span>" +
          '<p style="margin:.5rem 0">' + esc(r.text) + "</p>" +
          "<strong>" + esc(r.name || "Kunde") + "</strong>" +
          (meta ? '<span class="meta">' + meta + "</span>" : "") +
          "</figcaption></figure>";
      }).join("");
    }

    var link = document.getElementById("pl-reviews-link");
    if (link) {
      if (window.PL_GOOGLE_REVIEW_URL) link.href = window.PL_GOOGLE_REVIEW_URL;
      else link.style.display = "none";
    }

    sec.hidden = false;

    try {
      var ld = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://www.werbung-kroner.de/#business",
        "name": "PrintLine Werbetechnik",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": avg.toFixed(1),
          "reviewCount": reviews.length,
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": reviews.map(function (r) {
          return {
            "@type": "Review",
            "author": { "@type": "Person", "name": r.name || "Kunde" },
            "reviewRating": { "@type": "Rating", "ratingValue": String(r.rating), "bestRating": "5", "worstRating": "1" },
            "reviewBody": r.text
          };
        })
      };
      var sc = document.createElement("script");
      sc.type = "application/ld+json";
      sc.text = JSON.stringify(ld);
      document.head.appendChild(sc);
    } catch (e) {}
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
