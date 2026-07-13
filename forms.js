/* ══════════════════════════════════════════════════════════════
   PrintLine Werbetechnik — Formular-Versand
   Sendet Formspree-Formulare per fetch (ohne Seitenwechsel) und
   zeigt eine Inline-Erfolgs-/Fehlermeldung. Gilt für jedes Formular
   mit action="...formspree.io...".
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function enhance(form) {
    var status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      // PrintLine: Lead zusätzlich an n8n → Pipedrive (fire-and-forget, unabhängig von Formspree)
      try {
        var lead = new FormData(form);
        lead.append('source', 'Website-Formular');
        lead.append('page', location.pathname);
        fetch('https://printlinewerbetechnik.app.n8n.cloud/webhook/printline-lead',
              { method: 'POST', mode: 'no-cors', body: lead }).catch(function () {});
      } catch (e2) {}

      var btn = form.querySelector('[type="submit"]');
      var orig = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
      status.className = 'form-status sending';
      status.textContent = 'Wird gesendet …';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            status.className = 'form-status ok';
            status.textContent = '✓ Vielen Dank! Ihre Nachricht ist bei uns – wir melden uns innerhalb eines Werktages.';
          } else {
            return res.json().then(function (d) {
              var msg = d && d.errors && d.errors.map(function (x) { return x.message; }).join(', ');
              throw new Error(msg || 'Senden fehlgeschlagen');
            });
          }
        })
        .catch(function () {
          status.className = 'form-status err';
          status.innerHTML = '⚠ Senden hat nicht geklappt. Bitte rufen Sie uns an: ' +
            '<a href="tel:+4915203016900">+49 152 03016900</a> oder schreiben Sie an ' +
            '<a href="mailto:print2002@gmx.de">print2002@gmx.de</a>.';
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = orig; }
        });
    });
  }

  function init() {
    var forms = document.querySelectorAll('form[action*="formspree.io"]');
    for (var i = 0; i < forms.length; i++) enhance(forms[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
