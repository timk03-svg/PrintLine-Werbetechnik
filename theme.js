/* ══════════════════════════════════════════════════════════════
   PrintLine Werbetechnik — theme.js
   Theme-Umschaltung (Hell/Dunkel) · Scroll-Reveal · Sticky-Nav
   Mobile-Menü · Archiv-Filter · Motion-One-Effekte
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. THEME (Hell/Dunkel) ──────────────────────────────── */
  const root = document.documentElement;
  const stored = localStorage.getItem('pl-theme');
  // Standard: HELL. Gespeicherte Wahl (Hell/Dunkel) bleibt erhalten.
  const initial = stored || 'light';
  root.setAttribute('data-theme', initial);

  var themeAnimTimer;
  function setTheme(mode) {
    // Sanfter Übergang: kurzzeitig Transitions auf alle Elemente legen
    root.classList.add('theme-anim');
    root.setAttribute('data-theme', mode);
    localStorage.setItem('pl-theme', mode);
    clearTimeout(themeAnimTimer);
    themeAnimTimer = setTimeout(function () { root.classList.remove('theme-anim'); }, 350);
  }
  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  /* ── 2. DOM bereit ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    // Theme-Toggle-Buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    // Sticky-Nav: Hintergrund ab Scroll
    const nav = document.querySelector('.nav');
    if (nav) {
      const onScroll = function () {
        nav.classList.toggle('scrolled', window.scrollY > 24);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Mobile-Menü
    const burger = document.querySelector('.nav__burger');
    const menu = document.querySelector('.mobile-menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        const open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          burger.setAttribute('aria-label', 'Menü öffnen');
          document.body.style.overflow = '';
        });
      });
    }

    /* ── 3. SCROLL-REVEAL (IntersectionObserver) ───────────── */
    const reveals = document.querySelectorAll('[data-reveal]');
    if (reveals.length) {
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(function (el) { io.observe(el); });
        // Failsafe: nach dem Laden alles sichtbar machen, was noch nicht „in" ist
        window.addEventListener('load', function () {
          setTimeout(function () {
            document.querySelectorAll('[data-reveal]:not(.in)').forEach(function (el) {
              var r = el.getBoundingClientRect();
              if (r.top < window.innerHeight) el.classList.add('in');
            });
          }, 600);
        });
      } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
      }
    }

    /* ── 4. ZÄHLER-ANIMATION (Stats) ───────────────────────── */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length && 'IntersectionObserver' in window) {
      const cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseInt(el.getAttribute('data-count'), 10) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          const dur = 1400; const start = performance.now();
          (function step(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          })(start);
          cio.unobserve(el);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }

    /* ── 5. ARCHIV-FILTER ──────────────────────────────────── */
    const chips = document.querySelectorAll('[data-filter]');
    const items = document.querySelectorAll('[data-cat]');
    if (chips.length && items.length) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.classList.contains('active') ? 'true' : 'false'); });
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
          const f = chip.getAttribute('data-filter');
          items.forEach(function (it) {
            const show = f === 'alle' || it.getAttribute('data-cat') === f;
            it.style.display = show ? '' : 'none';
          });
        });
      });
    }

    /* ── 5b. ARCHIV-LIGHTBOX (Smooth-Zoom) ─────────────────── */
    var archivBilder = Array.prototype.slice.call(document.querySelectorAll('.acard__media, .grid-cards .card__media, .portfolio-grid figure.pcard')).filter(function (c) { return !c.closest('a') && c.querySelector('img'); });
    if (archivBilder.length) {
      var lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', 'Bildansicht');
      lb.innerHTML = '<button class="lightbox__close" aria-label="Schließen">&times;</button><img alt="">';
      document.body.appendChild(lb);
      var lbImg = lb.querySelector('img');
      lb.setAttribute('aria-modal', 'true');
      var lbCloseBtn = lb.querySelector('.lightbox__close');
      var lbOpener = null;
      function lbOpen(src, alt, opener) {
        lbImg.src = src; lbImg.alt = alt || '';
        lb.classList.remove('zoomed');
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        lbOpener = opener || null;
        // Fokus erst nach dem Sichtbarwerden setzen (Lightbox ist visibility:hidden bis .open greift)
        if (lbCloseBtn) requestAnimationFrame(function () { lbCloseBtn.focus(); });
      }
      function lbClose() {
        lb.classList.remove('open', 'zoomed');
        document.body.style.overflow = '';
        if (lbOpener && typeof lbOpener.focus === 'function') { lbOpener.focus(); lbOpener = null; } // Fokus zurückgeben
      }
      archivBilder.forEach(function (media) {
        media.style.cursor = 'zoom-in';
        media.setAttribute('tabindex', '0');          // per Tab erreichbar
        media.setAttribute('role', 'button');
        if (!media.getAttribute('aria-label')) media.setAttribute('aria-label', 'Bild vergrößern');
        function openFromMedia() {
          var img = media.querySelector('img');
          if (img) lbOpen(img.currentSrc || img.src, img.alt, media);
        }
        media.addEventListener('click', openFromMedia);
        media.addEventListener('keydown', function (e) {   // Enter/Leertaste öffnet
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); openFromMedia(); }
        });
      });
      // Klick aufs Bild = näher heranzoomen (smooth), Klick auf Hintergrund = schließen
      lbImg.addEventListener('click', function (e) { e.stopPropagation(); lb.classList.toggle('zoomed'); });
      lb.addEventListener('click', lbClose);
      lb.querySelector('.lightbox__close').addEventListener('click', function (e) { e.stopPropagation(); lbClose(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) lbClose(); });
    }

    /* ── 6. SMOOTH-SCROLL für Anker ────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const t = document.querySelector(id);
        if (t) { ev.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });

    /* ── 6b. STICKY MOBILE CTA (auf jeder Seite) ───────────── */
    if (!document.querySelector('.sticky-cta')) {
      var kontaktHref = document.getElementById('kontakt') ? '#kontakt' : 'index.html#kontakt';
      var bar = document.createElement('div');
      bar.className = 'sticky-cta';
      bar.innerHTML =
        '<a class="s-call" href="tel:+4915203016900">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>' +
          'Anrufen</a>' +
        '<a class="s-quote" href="' + kontaktHref + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          'Angebot anfordern</a>';
      document.body.appendChild(bar);
    }

    /* ── 6c. FAQ-Akkordeon ─────────────────────────────────── */
    function faqSet(item, open) {
      var q = item.querySelector('.faq-q'), panel = item.querySelector('.faq-a');
      item.classList.toggle('open', open);
      if (q) q.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) {
        panel.style.maxHeight = open ? (panel.scrollHeight + 'px') : '';   // echte Höhe → nichts wird abgeschnitten
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');        // eingeklappt nicht vorlesen
      }
    }
    document.querySelectorAll('.faq-q').forEach(function (q, i) {
      var fitem = q.closest('.faq-item');
      var fpanel = fitem.querySelector('.faq-a');
      if (fpanel) {
        if (!fpanel.id) fpanel.id = 'faq-panel-' + i;
        if (!q.id) q.id = 'faq-q-' + i;
        q.setAttribute('aria-controls', fpanel.id);
        fpanel.setAttribute('role', 'region');
        fpanel.setAttribute('aria-labelledby', q.id);
      }
      faqSet(fitem, fitem.classList.contains('open'));   // Startzustand inkl. korrekter Höhe
      q.addEventListener('click', function () {
        var item = q.closest('.faq-item');
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (o) { faqSet(o, false); });
        if (!wasOpen) faqSet(item, true);
      });
    });
    window.addEventListener('resize', function () {
      var op = document.querySelector('.faq-item.open .faq-a');
      if (op) op.style.maxHeight = op.scrollHeight + 'px';
    });

    /* ── 7. MOTION ONE: Hero-Mikrointeraktionen ────────────── */
    var reduceMo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var heroEls = document.querySelectorAll('[data-hero-stagger] > *');
    // Endzustand fest sichtbar machen (falls per CSS .reveal-on vorab versteckt)
    var lockHero = function () { heroEls.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; }); };
    if (window.Motion && window.Motion.animate && !reduceMo) {
      const M = window.Motion;
      // Hero sanft einfahren. Startzustand (unsichtbar) kommt aus CSS (.reveal-on) → kein Aufblitzen beim Reload.
      if (heroEls.length) {
        var heroAnim = M.animate(heroEls,
          { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
          { delay: M.stagger ? M.stagger(0.09, { start: 0.15 }) : 0.15, duration: 0.8, easing: [0.16, 1, 0.3, 1] }
        );
        if (heroAnim && heroAnim.finished && heroAnim.finished.then) { heroAnim.finished.then(lockHero).catch(lockHero); }
      }
      // Schwebende Karten sanft pendeln
      document.querySelectorAll('[data-float]').forEach(function (el, i) {
        if (M.animate) {
          M.animate(el,
            { transform: ['translateY(0px)', 'translateY(-12px)', 'translateY(0px)'] },
            { duration: 5 + i, repeat: Infinity, easing: 'ease-in-out' }
          );
        }
      });
    } else {
      // Kein Motion / reduce-motion → Hero sofort sichtbar (kein Stecken bleiben, falls vorab versteckt)
      lockHero();
    }
  });
})();

/* ── Service Worker registrieren (Offline-Cache/PWA) ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js').catch(function () {});
  });
}
