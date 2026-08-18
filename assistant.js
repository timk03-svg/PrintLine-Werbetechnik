/* ══════════════════════════════════════════════════════════════
   PrintLine Werbetechnik — KI-Assistent Widget
   Schwebender Button + Chat-Panel · ruft /api/chat auf
   • Schlägt passende Leistungsseiten vor (klickbare Links)
   • Minimiert (statt schließen) bei Scroll/Klick außerhalb
   • Merkt Verlauf + Entwurf für die Session (sessionStorage)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const SVG = {
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V5M9 3h6"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 9l7 7 7-7"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  };

  const SUGGESTS = [
    'Welche Leistungen bietet ihr?',
    'Arbeitet ihr auch außerhalb von Stendal?',
    'Was kostet eine Fahrzeugbeschriftung?',
    'Macht ihr auch Textildruck?',
    'Wann habt ihr geöffnet?',
  ];

  const GREETING = 'Hallo! 👋 Ich bin der KI-Assistent von PrintLine Werbetechnik. Fragen Sie mich gern zu unseren Leistungen, zur Fahrzeugbeschriftung, zum Druck oder fordern Sie ein kostenloses Angebot an.';

  /* ── Session-Status (bleibt während des Website-Besuchs, Reset beim Verlassen) ── */
  const SS_KEY = 'pl-ai-v1';
  const history = [];
  let draft = '';
  let busy = false;

  function loadState() {
    try { return JSON.parse(sessionStorage.getItem(SS_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveState() {
    try { sessionStorage.setItem(SS_KEY, JSON.stringify({ history: history.slice(-30), draft: draft })); } catch (e) {}
  }

  /* ── Widget aufbauen ─────────────────────────────────────── */
  function build() {
    const st = loadState();
    if (Array.isArray(st.history)) st.history.forEach(function (m) { if (m && m.role && m.content) history.push(m); });
    draft = typeof st.draft === 'string' ? st.draft : '';

    const fab = document.createElement('button');
    fab.className = 'ai-fab';
    fab.setAttribute('aria-label', 'KI-Assistent öffnen');
    fab.innerHTML = '<span class="ai-fab__pulse"></span>' + SVG.bot;

    const panel = document.createElement('div');
    panel.className = 'ai-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'KI-Assistent Chat');
    panel.innerHTML =
      '<div class="ai-head">' +
        '<div class="ai-head__avatar">' + SVG.bot + '</div>' +
        '<div><h3>PrintLine Werbetechnik Assistent</h3><small>Online · antwortet sofort</small></div>' +
        '<button class="ai-head__close" aria-label="Minimieren">' + SVG.close + '</button>' +
      '</div>' +
      '<div class="ai-body" id="aiBody"></div>' +
      '<div class="ai-suggests" id="aiSuggests"></div>' +
      '<form class="ai-input" id="aiForm">' +
        '<input id="aiInput" type="text" placeholder="Ihre Frage…" autocomplete="off" aria-label="Nachricht" />' +
        '<button type="submit" aria-label="Senden">' + SVG.send + '</button>' +
      '</form>' +
      '<div class="ai-disclaimer">KI-Assistent · Angaben ohne Gewähr · für Verbindliches bitte direkt kontaktieren</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const body = panel.querySelector('#aiBody');
    const suggestBox = panel.querySelector('#aiSuggests');
    const form = panel.querySelector('#aiForm');
    const input = panel.querySelector('#aiInput');

    // Mobil: Panelhöhe an den sichtbaren Bereich koppeln, damit die
    // Bildschirmtastatur das Eingabefeld nicht verdeckt. visualViewport
    // schrumpft bei geöffneter Tastatur, 100vh/dvh dagegen nicht.
    function syncViewportHeight() {
      const vv = window.visualViewport;
      // iOS meldet vv.height beim Tastatur-Öffnen transient 0 → verwerfen,
      // sonst kollabiert das Panel (max-height:0) und verschwindet. > 120 lässt
      // echte, tastatur-verkleinerte Höhen durch, fängt nur den 0-/near-0-Fall ab.
      const h = (vv && vv.height > 120) ? vv.height : (window.innerHeight || 640);
      panel.style.setProperty('--ai-vh', Math.round(h) + 'px');
      if (panel.classList.contains('open')) body.scrollTop = body.scrollHeight;
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncViewportHeight);
      window.visualViewport.addEventListener('scroll', syncViewportHeight);
    }
    window.addEventListener('resize', syncViewportHeight);
    syncViewportHeight();

    let openAt = 0;
    let openScrollY = 0;

    function renderHistory() {
      body.innerHTML = '';
      if (history.length) {
        history.forEach(function (m) { addMsg(m.role === 'user' ? 'user' : 'bot', m.content, true); });
      } else {
        addMsg('bot', GREETING, true);
        renderSuggests();
      }
    }

    function open() {
      if (panel.classList.contains('open')) return;
      panel.classList.add('open');
      fab.classList.add('hidden');
      syncViewportHeight();
      if (!body.childElementCount) renderHistory();
      input.value = draft;
      openAt = Date.now();
      openScrollY = window.scrollY || window.pageYOffset || 0;
      setTimeout(function () { input.focus({ preventScroll: true }); }, 450);
    }
    // Minimieren: Panel ausblenden, Zustand bleibt erhalten (kein Reset)
    function minimize() {
      if (!panel.classList.contains('open')) return;
      panel.classList.remove('open');
      fab.classList.remove('hidden');
    }

    fab.addEventListener('click', open);
    panel.querySelector('.ai-head__close').addEventListener('click', minimize);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') minimize(); });

    // Bei Seiten-Scroll minimieren (nicht beim Scrollen im Chat selbst)
    window.addEventListener('scroll', function () {
      if (!panel.classList.contains('open')) return;
      if (Date.now() - openAt < 350) return;
      var y = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(y - openScrollY) > 24) minimize();
    }, { passive: true });

    // Bei Klick außerhalb des Panels (und nicht auf den Button) minimieren
    document.addEventListener('pointerdown', function (e) {
      if (!panel.classList.contains('open')) return;
      if (Date.now() - openAt < 350) return;
      if (panel.contains(e.target) || fab.contains(e.target)) return;
      minimize();
    }, true);

    function renderSuggests() {
      suggestBox.innerHTML = '';
      SUGGESTS.forEach(function (s) {
        const b = document.createElement('button');
        b.className = 'ai-suggest'; b.type = 'button'; b.textContent = s;
        b.addEventListener('click', function () { send(s); });
        suggestBox.appendChild(b);
      });
    }

    function addMsg(role, text, skipScroll) {
      const el = document.createElement('div');
      el.className = 'ai-msg ' + role;
      el.innerHTML = format(text);
      body.appendChild(el);
      if (!skipScroll) body.scrollTop = body.scrollHeight;
      return el;
    }

    function showTyping() {
      const t = document.createElement('div');
      t.className = 'ai-typing'; t.id = 'aiTyping';
      t.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(t); body.scrollTop = body.scrollHeight;
    }
    function hideTyping() { const t = body.querySelector('#aiTyping'); if (t) t.remove(); }

    async function send(text) {
      if (busy) return;
      text = (text || input.value).trim();
      if (!text) return;
      input.value = ''; draft = ''; saveState();
      suggestBox.innerHTML = '';
      if (!body.childElementCount) renderHistory();
      addMsg('user', text);
      history.push({ role: 'user', content: text });
      saveState();
      busy = true; showTyping();

      try {
        const res = await fetch('https://printline-chat-api.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json();
        hideTyping();
        const reply = (data && data.reply) || fallbackReply();
        addMsg('bot', reply);
        history.push({ role: 'assistant', content: reply });
        saveState();
      } catch (err) {
        hideTyping();
        addMsg('bot', fallbackReply());
      } finally {
        busy = false; input.focus({ preventScroll: true });
      }
    }

    // Entwurf laufend merken (bleibt für die Session erhalten)
    input.addEventListener('input', function () { draft = input.value; saveState(); });

    form.addEventListener('submit', function (e) { e.preventDefault(); send(); });

    window.PrintLineAI = { open: open, close: minimize, ask: send };
  }

  function fallbackReply() {
    return 'Entschuldigung, ich bin gerade nicht erreichbar. Sie erreichen uns direkt unter **+49 152 03016900** oder **print2002@gmx.de** – wir melden uns innerhalb eines Werktages.';
  }

  /* Minimales Markdown: **fett**, Seiten-Links, Telefon/E-Mail, Zeilen → <p> */
  function format(text) {
    let t = String(text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Leistungsseiten-Verweis als klickbarer Button
    t = t.replace(/\[\[seite:([a-z0-9.\-]+\.html)\|([^\]]+)\]\]/gi, function (m, file, label) {
      return '<a class="ai-pagelink" href="' + file + '">' + label.trim() + ' <span aria-hidden="true">→</span></a>';
    });
    t = t.replace(/(\+49[\d\s]{6,})/g, function (m) { return '<a href="tel:' + m.replace(/\s/g, '') + '">' + m.trim() + '</a>'; });
    t = t.replace(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi, '<a href="mailto:$1">$1</a>');
    return t.split(/\n{2,}/).map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
