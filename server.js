#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════
   PrintLine Werbetechnik — Lokaler Server (läuft über den Mac)
   • Liefert die statische Website aus (mit Security-Headern)
   • /api/chat  → KI-Assistent (Claude API + FAQ-Fallback)
   • Anonymes Frage-Logging (für die Wochen-Analyse), Rate-Limit
   • Zero-Dependency: nur Node-Bordmittel (http, fs, fetch)
   Start:  node server.js     →  http://localhost:3000
   ══════════════════════════════════════════════════════════════ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Modell — Standard: Claude Opus 4.8 (höchste Qualität).
const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-opus-4-8').trim();

/* ── API-Key laden (env oder ~/.anthropic_key) ─────────────── */
function ladeApiKey() {
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()) {
    return process.env.ANTHROPIC_API_KEY.trim();
  }
  try {
    const p = path.join(os.homedir(), '.anthropic_key');
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  } catch (_) {}
  return null;
}

/* ── Wissensbasis über PrintLine ───────────────────────────── */
const WISSEN = `
UNTERNEHMEN: PrintLine Werbetechnik (werbung-kroner.de)
STANDORT / ADRESSE: Magdeburger Straße 5A, 39576 Stendal, Sachsen-Anhalt
ÖFFNUNGSZEITEN: Montag bis Freitag 10:00–18:00 Uhr; Samstag und Sonntag geschlossen.
ERFAHRUNG: fast 40 Jahre. Gegründet 1986 als Werbeabteilung eines familiengeführten Malerbetriebs, seit 2002 eigenständiges Unternehmen. Zahlreiche abgeschlossene Projekte (keine konkrete Projektzahl nennen).
KONTAKT: Telefon +49 152 03016900, E-Mail print2002@gmx.de
KUNDEN: Betriebe, Einrichtungen, Organisationen (B2B) sowie Vereine und Privatpersonen (B2C); Industrie, Handwerk, Bau, Logistik, Handel, öffentlicher Bereich.
EINZUGSGEBIET: Sitz in Stendal (keine Filialen); tätig in der gesamten Altmark und darüber hinaus (u. a. Tangermünde, Osterburg, Havelberg, Gardelegen, Salzwedel, Magdeburg). Aufträge nehmen wir auch überregional und deutschlandweit an: Druck, Beschriftungen, Schilder, Banner, Fahnen u. v. m. fertigen und versenden wir auf Anfrage bundesweit; Montage übernehmen wir bundesweit nach Absprache.
ARBEITSWEISE: Alles aus einer Hand – von der Konzeption über die Produktion bis zur Montage. Rückmeldung auf Anfragen innerhalb eines Werktages. Kostenlose, unverbindliche Angebote.

LEISTUNGEN:
1. Beschriftungen – Fahrzeuge aller Art, Wasserfahrzeuge wie Boote und Jetski (inkl. amtlicher Kennzeichen), Klein- und Leichtflugzeuge, Fenster, Schaufenster, Türbeschilderung und Wegweiser sowie Beschriftungen für Messe- und Eventveranstaltungen.
2. Digitaldruck – Großformat-Digitaldruck auf Folie, Dibond, Forex und Papier (Fahrzeuge, Messen, Werbeflächen). Außerdem Drucksachen wie Visitenkarten, Briefpapier und Flyer.
3. Schilder – Praxisschilder, Firmenschilder, Bauschilder; robust und individuell gestaltet.
4. Fassaden – Fassadenbeschriftung direkt mit hochwertiger Dispersionsfarbe auf die Wand (ohne Folien, ohne aufgesetzte Elemente) sowie Außenbeschriftungen.
5. Werbeartikel – Kugelschreiber, Tassen, Textilien u. v. m. mit Logo bedruckt und veredelt.
6. Folientechnik – hochwertige Folien für Glasflächen, Fenster und Möbel: Sichtschutz- und Schutzfolien (Milchglas-, Spiegel-, Splitterschutz-, Sonnenschutzfolie), Dekorfolien, Magnetfolien sowie Folienplott zur Selbstanbringung. WICHTIG: Eine Vollfolierung (komplette Flächenverklebung) von Fahrzeugen bieten wir NICHT an; Teilfolierungen sind nach Absprache möglich.
7. Textildruck – Flex-, Flock- und Sublimationsdruck für Trikots, Workwear und T-Shirts. Stickerei bieten wir NICHT an.
8. Fahnen – witterungsbeständige Fahnen für innen und außen, individuell bedruckt.
9. Aufsteller & Pylonen – auffällige Aufsteller und Pylonen für innen und außen.
10. Werbebanner & Planen – großformatige Banner und Planen, auch Gerüstplanen.
11. Webentwicklung / Webdesign – moderne, mobilfreundliche Websites.

PREISE: Preise sind projektabhängig (Material, Format, Aufwand). Es gibt keine pauschalen Festpreise – für ein konkretes, kostenloses Angebot kontaktiert man PrintLine direkt.
DRUCKDATEN/GESTALTUNG: Kunden können fertige Druckdaten liefern (idealerweise PDF oder Vektordatei) – oder PrintLine übernimmt die komplette Gestaltung.
ABLAUF: Anfrage → kostenloses, unverbindliches Angebot → Gestaltung & Freigabe → Produktion → Lieferung oder Montage vor Ort.
MONTAGE/LIEFERUNG: Auf Wunsch Montage vor Ort; alternativ Lieferung oder Abholung in Stendal.
AUFLAGEN: vom Einzelstück bis zur größeren Serie.
ZAHLUNG: Abrechnung per Rechnung; Konditionen werden im Angebot genannt.
QUALITÄT/REKLAMATION: hochwertige, witterungsbeständige Materialien; Reklamationen werden fair und unkompliziert geklärt.

LEISTUNGSSEITEN (NUR diese Dateinamen für Verweise verwenden – niemals erfinden):
- Beschriftungen → beschriftungen.html
- Digitaldruck → druck.html
- Schilder → schilder.html
- Fassaden → fassaden.html
- Werbeartikel → werbeartikel.html
- Folientechnik → folientechnik.html
- Textildruck (Flex/Flock) → textildruck-flex-und-flock.html
- Fahnen → fahnen.html
- Aufsteller & Pylonen → aufsteller-pylonen.html
- Werbebanner & Planen → planen-banner.html
- Webentwicklung → webdesign.html
- Alle Leistungen (Übersicht) → leistungen.html
- Fahrzeug-Konfigurator (Beschriftung selbst gestalten, Live-Vorschau, unverbindlich anfragen) → konfigurator.html
- Referenzen / Portfolio → portfolio.html
- Kontakt → kontakt.html
`;

const SYSTEM_PROMPT =
`Du bist der freundliche KI-Assistent auf der Website von PrintLine Werbetechnik in Stendal.
Beantworte Fragen von Website-Besuchern kurz, hilfreich und professionell auf Deutsch (Sie-Form).
Nutze ausschließlich die folgenden Fakten. Wenn etwas nicht abgedeckt ist, sage das ehrlich und
verweise auf den direkten Kontakt (Telefon +49 152 03016900 oder E-Mail print2002@gmx.de).
Halte Antworten knapp (2–5 Sätze). Bei Preis-, Termin- oder Auftragsfragen lade aktiv zum kostenlosen
unverbindlichen Angebot ein. Erfinde keine Fakten, Preise oder Referenzen.
Antworte direkt mit der eigentlichen Antwort – ohne sichtbare Vorüberlegungen, Zwischenschritte oder Meta-Kommentar.

Wenn die Frage eine konkrete Leistung betrifft, biete am Ende kurz an, die passende Detailseite zu öffnen,
und hänge GENAU EINEN Verweis-Marker im Format [[seite:DATEINAME.html|Kurzer Linktext]] an – ausschließlich
mit einem Dateinamen aus der Liste LEISTUNGSSEITEN. Erfinde niemals Dateinamen. Höchstens ein Marker pro
Antwort; bei allgemeinen Fragen (Kontakt, Öffnungszeiten, Smalltalk) keinen Marker.

FAKTEN:
${WISSEN}`;

/* ── Erlaubte Seiten-Dateinamen (Absicherung gegen erfundene Links) ── */
const ERLAUBTE_SEITEN = new Set([
  'beschriftungen.html','druck.html','schilder.html','fassaden.html','werbeartikel.html',
  'folientechnik.html','textildruck-flex-und-flock.html','fahnen.html','aufsteller-pylonen.html',
  'planen-banner.html','webdesign.html','leistungen.html','portfolio.html','kontakt.html',
  'konfigurator.html',
]);

// Entfernt Marker, die auf nicht existierende Seiten zeigen (Halluzinationsschutz).
function bereinigeMarker(text) {
  return String(text || '').replace(/\[\[seite:([^|\]]+)\|([^\]]+)\]\]/g, function (full, datei) {
    return ERLAUBTE_SEITEN.has(String(datei).trim()) ? full : '';
  });
}

/* ── FAQ-Fallback (ohne API-Key) ───────────────────────────── */
const FAQ = [
  { keys: ['preis','kosten','kostet','teuer','günstig','angebot','budget','was kostet'],
    a: 'Unsere Preise hängen vom Projekt ab – also von Material, Format und Aufwand. Gern erstellen wir Ihnen ein **kostenloses, unverbindliches Angebot**. Schreiben Sie uns über das Kontaktformular oder rufen Sie an: **+49 152 03016900**.\n\n[[seite:kontakt.html|Angebot anfragen]]' },
  { keys: ['kontakt','telefon','anruf','nummer','email','e-mail','mail','erreich','melde','schreib','adresse mail'],
    a: 'Sie erreichen uns telefonisch unter **+49 152 03016900** oder per E-Mail an **print2002@gmx.de**. Wir melden uns in der Regel innerhalb eines Werktages.' },
  { keys: ['wo','standort','adresse','stendal','anfahrt','sitz','region','parken','überregional','ueberregional','deutschlandweit','bundesweit','außerhalb','ausserhalb','liefergebiet','einzugsgebiet','andere stadt','weit weg'],
    a: 'PrintLine Werbetechnik finden Sie in der **Magdeburger Straße 5A, 39576 Stendal** (Sachsen-Anhalt). Wir arbeiten in der gesamten Altmark und darüber hinaus – Aufträge nehmen wir auch **überregional und deutschlandweit** an: Druck, Beschriftungen, Schilder, Banner, Fahnen und vieles mehr fertigen und versenden wir auf Anfrage bundesweit, die Montage übernehmen wir bundesweit nach Absprache. Fragen Sie einfach an, auch wenn Ihr Ort weiter weg ist.' },
  { keys: ['fahrzeug','auto','pkw','lkw','flotte','fuhrpark','beschriftung'],
    a: 'Wir beschriften Fahrzeuge aller Art – von einzelnen PKW bis zu kompletten Flotten, CI-konform und langlebig. Hinweis: Eine Vollfolierung bieten wir nicht an, Teilfolierungen sind nach Absprache möglich – unser Schwerpunkt ist die hochwertige Beschriftung.\n\n[[seite:beschriftungen.html|Zur Beschriftungen-Seite]]' },
  { keys: ['konfigurator','selbst gestalten','online gestalten','gestalten','entwurf','vorschau','design erstellen','beklebung gestalten','wie sieht es aus','visualisieren'],
    a: 'Mit unserem **Fahrzeug-Konfigurator** gestalten Sie Ihre Beschriftung Schritt für Schritt – Fahrzeug, Flächen, Folie, Farbe, Schrift und Logo, mit Live-Vorschau. Am Ende senden Sie uns Ihre Konfiguration unverbindlich zu, und wir melden uns mit einem kostenlosen Angebot.\n\n[[seite:konfigurator.html|Zum Fahrzeug-Konfigurator]]' },
  { keys: ['vollfolierung','folieren','folierung','auto folier','fahrzeug folier','komplett folier','wrappen','car wrap','bekleben','vollverklebung'],
    a: 'Eine **Vollfolierung** (komplette Flächenverklebung von Fahrzeugen) bieten wir **nicht** an – **Teilfolierungen** sind nach Absprache möglich, unser Schwerpunkt ist die hochwertige **Fahrzeugbeschriftung**. Für Glas- und Fensterfolien sprechen Sie uns gern an.\n\n[[seite:folientechnik.html|Zur Folientechnik-Seite]]' },
  { keys: ['textil','shirt','t-shirt','trikot','workwear','bekleidung','flock','flex','stick'],
    a: 'Im Textildruck veredeln wir Trikots, Workwear und T-Shirts mit **Flex-, Flock- und Sublimationsdruck** – ideal für Teams, Vereine und Betriebe. Stickerei bieten wir nicht an. Gern erstellen wir Ihnen ein Angebot.\n\n[[seite:textildruck-flex-und-flock.html|Zur Textildruck-Seite]]' },
  { keys: ['schild','schilder','praxisschild','firmenschild','bauschild','pylon','stele','wegweiser'],
    a: 'Wir fertigen Praxis-, Firmen- und Bauschilder sowie Pylonen und Stelen – robust, witterungsbeständig und individuell gestaltet. Sagen Sie uns einfach, was Sie brauchen.\n\n[[seite:schilder.html|Zur Schilder-Seite]]' },
  { keys: ['digitaldruck','druck','dibond','forex','messe','poster','aufkleber','sticker'],
    a: 'Unser Großformat-Digitaldruck läuft auf Folie, Dibond, Forex und Papier – für Aufkleber, Messeauftritte und Werbeflächen. Wir beraten Sie gern.\n\n[[seite:druck.html|Zur Digitaldruck-Seite]]' },
  { keys: ['banner','plane','planen','gerüstplane','bauzaun'],
    a: 'Wir drucken großformatige **Werbebanner und Planen** – auch Bauzaunbanner und Gerüstplanen, wetterfest und passgenau konfektioniert.\n\n[[seite:planen-banner.html|Zur Banner & Planen-Seite]]' },
  { keys: ['fahne','fahnen','hissfahne','beachflag','auslegerfahne','wimpel'],
    a: 'Wir fertigen witterungsbeständige **Fahnen** für innen und außen – Hissfahnen, Beachflags und Auslegerfahnen inklusive passender Masten und Gestelle.\n\n[[seite:fahnen.html|Zur Fahnen-Seite]]' },
  { keys: ['aufsteller','kundenstopper','spannrahmen','roll-up','rollup','messeaufsteller'],
    a: 'Aufsteller, Kundenstopper, Pylonen und Spannrahmen – mobil, standfest und individuell bedruckt für Shops, Messen und Firmenhöfe.\n\n[[seite:aufsteller-pylonen.html|Zur Aufsteller & Pylonen-Seite]]' },
  { keys: ['web','website','webseite','homepage','internet','webdesign','webentwicklung'],
    a: 'Ja, wir entwickeln auch moderne, mobilfreundliche Websites. Erzählen Sie uns von Ihrem Vorhaben – wir melden uns mit einem Vorschlag.\n\n[[seite:webdesign.html|Zur Webentwicklung-Seite]]' },
  { keys: ['werbeartikel','tasse','kugelschreiber','give','merch','logo','schlüsselband','sporttasche'],
    a: 'Wir bedrucken Werbeartikel wie Kugelschreiber, Tassen, Schlüsselbänder und Textilien mit Ihrem Logo. Sagen Sie uns Stückzahl und Wunschartikel für ein Angebot.\n\n[[seite:werbeartikel.html|Zur Werbeartikel-Seite]]' },
  { keys: ['fassade','wand','aussen','außen','gebäude','schaufenster'],
    a: 'Für Fassaden bieten wir Fassadenbeschriftung direkt mit Dispersionsfarbe auf die Wand sowie Außen- und Schaufensterbeschriftungen – Ihr Gebäude wird zur Werbefläche. Gern beraten wir Sie.\n\n[[seite:fassaden.html|Zur Fassaden-Seite]]' },
  { keys: ['dauer','wie lange','lieferzeit','termin','schnell','wann fertig','express','eilig','dringend'],
    a: 'Die Dauer hängt vom Projekt ab. Auf Ihre Anfrage melden wir uns innerhalb eines Werktages und stimmen einen realistischen Zeitplan mit Ihnen ab – auch eilige Aufträge besprechen wir gern.' },
  { keys: ['erfahrung','seit wann','wie lange gibt','jahre','geschichte','über euch','wer seid'],
    a: 'PrintLine Werbetechnik gibt es seit fast **40 Jahren** – gestartet als Werbeabteilung eines Malerbetriebs, seit 2002 eigenständig. Unzählige Projekte haben wir bereits umgesetzt.' },
  { keys: ['leistung','leistungen','was macht','was bietet','services','könnt ihr','machen sie','überblick','übersicht'],
    a: 'Wir bieten u. a. **Beschriftungen, Digitaldruck, Schilder, Fassaden, Werbeartikel, Folientechnik, Textildruck, Fahnen, Aufsteller & Pylonen, Werbebanner/Planen** sowie **Webentwicklung** – alles aus einer Hand. Auch Visitenkarten, Flyer, Boots- und Flugzeugbeschriftung, Magnetfolien und Folienplott zur Selbstanbringung gehören dazu. Welcher Bereich interessiert Sie?\n\n[[seite:leistungen.html|Alle Leistungen ansehen]]' },
  { keys: ['referenz','referenzen','portfolio','beispiele','projekte','arbeiten gezeigt','galerie'],
    a: 'Eine Auswahl unserer Projekte sehen Sie in unserem Portfolio – von Fahrzeugbeschriftung über Schilder bis Textildruck.\n\n[[seite:portfolio.html|Zum Portfolio]]' },
  { keys: ['gestalt','design','entwurf','druckdaten','datei','vektor','logo erstell','grafik'],
    a: 'Sie können fertige Druckdaten liefern – idealerweise als PDF oder Vektordatei – oder wir übernehmen die Gestaltung für Sie. Sagen Sie uns einfach, was Sie sich vorstellen.' },
  { keys: ['montage','anbringen','aufkleben','vor ort','verkleb','installation'],
    a: 'Auf Wunsch übernehmen wir auch die fachgerechte Montage vor Ort – von der Beschriftung bis zum Schild. Gern stimmen wir Termin und Ablauf mit Ihnen ab.' },
  { keys: ['lieferung','versand','liefern','abholen','abholung','zusenden'],
    a: 'Je nach Auftrag liefern wir, montieren vor Ort oder Sie holen bei uns in Stendal ab. Die Details klären wir kurz mit Ihnen – melden Sie sich einfach.' },
  { keys: ['zahlung','bezahlen','rechnung','zahlungsart','anzahlung','vorkasse'],
    a: 'Die Abrechnung erfolgt per Rechnung; die genauen Konditionen nennen wir Ihnen transparent im Angebot.' },
  { keys: ['garantie','reklamation','mangel','beschwerde','umtausch','gewährleistung'],
    a: 'Wir arbeiten mit hochwertigen, witterungsbeständigen Materialien. Sollte einmal etwas nicht passen, klären wir Reklamationen fair und unkompliziert – sprechen Sie uns einfach an.' },
  { keys: ['auflage','stückzahl','stueckzahl','menge','mindestbestellung','wie viele','einzelstück'],
    a: 'Wir fertigen vom Einzelstück bis zur größeren Auflage. Nennen Sie uns Ihre gewünschte Stückzahl, dann erstellen wir Ihnen ein passendes Angebot.' },
  { keys: ['verein','privat','privatperson','privatkunde','auch für'],
    a: 'Ja – wir arbeiten für Betriebe und Organisationen ebenso wie für Vereine und Privatpersonen. Erzählen Sie uns gern von Ihrem Vorhaben.' },
  { keys: ['öffnungszeit','offnungszeit','wann geöffnet','wann offen','erreichbar wann','sprechzeit','geöffnet'],
    a: 'Unsere Öffnungszeiten sind **Montag bis Freitag 10:00–18:00 Uhr** (Wochenende geschlossen). Sie erreichen uns unter **+49 152 03016900** oder **print2002@gmx.de**.' },
  { keys: ['hallo','hi','hey','guten tag','moin','servus'],
    a: 'Hallo und willkommen bei PrintLine Werbetechnik! 👋 Ich helfe Ihnen gern weiter – fragen Sie mich z. B. zu unseren Leistungen, zur Fahrzeugbeschriftung oder fordern Sie ein kostenloses Angebot an.' },
  { keys: ['danke','vielen dank','super','top','prima'],
    a: 'Sehr gern! Wenn Sie ein konkretes Anliegen haben, erreichen Sie uns unter **+49 152 03016900** oder **print2002@gmx.de**. Wir freuen uns auf Ihr Projekt.' },
];

function faqAntwort(frage) {
  const f = (frage || '').toLowerCase();
  let best = null, bestScore = 0;
  for (const item of FAQ) {
    let score = 0;
    for (const k of item.keys) { if (f.includes(k)) score += k.length; }
    if (score > bestScore) { bestScore = score; best = item; }
  }
  if (best && bestScore > 0) return best.a;
  return 'Das beantworte ich Ihnen gern persönlich. Rufen Sie uns an unter **+49 152 03016900** oder schreiben Sie an **print2002@gmx.de** – wir melden uns innerhalb eines Werktages. Sie können mich auch zu unseren Leistungen wie Beschriftungen, Digitaldruck, Schildern oder Folientechnik fragen.\n\n[[seite:leistungen.html|Alle Leistungen ansehen]]';
}

/* ── Anonymes Frage-Logging (für Wochen-Analyse, DSGVO-schonend) ── */
// Speichert NUR die Frage + Zeitstempel + Quelle. Keine IP, keine Session-ID, keine Personendaten.
function logFrage(frage, source) {
  try {
    const dir = path.join(ROOT, 'data');
    fs.mkdirSync(dir, { recursive: true });
    const q = String(frage || '').replace(/\s+/g, ' ').trim().slice(0, 500);
    if (!q) return;
    const logFile = path.join(dir, 'chat-log.jsonl');
    // Größenbasierte Rotation: bei > 2 MB nach chat-log.1.jsonl rotieren (überschreibt alte .1)
    try {
      const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
      if (fs.existsSync(logFile) && fs.statSync(logFile).size > MAX_BYTES) {
        fs.renameSync(logFile, path.join(dir, 'chat-log.1.jsonl'));
      }
    } catch (_) {}
    const line = JSON.stringify({ t: new Date().toISOString(), q: q, source: source }) + '\n';
    fs.appendFile(logFile, line, function () {});
  } catch (_) {}
}

/* ── Einfaches Rate-Limit pro IP (Schutz vor Missbrauch) ───── */
const RL = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const WIN = 60000, MAX = 25; // max. 25 Anfragen / Minute / IP
  let e = RL.get(ip);
  if (!e || now > e.reset) { e = { count: 0, reset: now + WIN }; RL.set(ip, e); }
  e.count++;
  if (RL.size > 5000) RL.clear(); // simpler Speicher-Schutz
  return e.count > MAX;
}

/* ── Anthropic-Aufruf ──────────────────────────────────────── */
async function fragClaude(messages, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content || '').slice(0, 2000),
      })),
    }),
  });
  if (!res.ok) throw new Error('Anthropic ' + res.status + ': ' + (await res.text()).slice(0, 300));
  const data = await res.json();
  return (data.content && data.content[0] && data.content[0].text) || '';
}

/* ── /api/chat ─────────────────────────────────────────────── */
async function handleChat(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (rateLimited(ip)) {
    res.statusCode = 429;
    return res.end(JSON.stringify({ reply: 'Einen Moment bitte – Sie haben recht viele Anfragen gesendet. Versuchen Sie es gleich noch einmal oder rufen Sie uns direkt an: **+49 152 03016900**.', source: 'rate-limit' }));
  }

  let body = '', bytes = 0;
  req.on('data', c => { bytes += c.length; body += c; if (bytes > 1e5) req.destroy(); }); // 100 KB Byte-Cap
  req.on('end', async () => {
    let payload = {};
    try { payload = JSON.parse(body || '{}'); } catch (_) {}
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const letzte = messages.length ? String(messages[messages.length - 1].content || '') : '';
    if (!letzte.trim()) {
      return res.end(JSON.stringify({ reply: 'Wie kann ich Ihnen helfen? Fragen Sie mich gern zu unseren Leistungen oder fordern Sie ein kostenloses Angebot an.', source: 'leer' }));
    }
    const apiKey = ladeApiKey();

    try {
      if (apiKey) {
        const text = bereinigeMarker(await fragClaude(messages, apiKey));
        logFrage(letzte, 'claude');
        res.end(JSON.stringify({ reply: text, source: 'claude' }));
      } else {
        logFrage(letzte, 'faq');
        res.end(JSON.stringify({ reply: faqAntwort(letzte), source: 'faq' }));
      }
    } catch (err) {
      // Bei API-Fehler nicht abstürzen → FAQ als Sicherheitsnetz.
      // Fehlerdetails NUR serverseitig loggen, niemals an den Browser senden
      // (sonst leakt der Upstream-Fehlertext nach außen).
      console.error('[chat] Upstream-Fehler:', String((err && err.message) || err));
      logFrage(letzte, 'faq-fallback');
      res.end(JSON.stringify({ reply: faqAntwort(letzte), source: 'faq-fallback' }));
    }
  });
}

/* ── Security-Header (für alle Antworten) ──────────────────── */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://formspree.io",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' mailto: https://formspree.io",
  "object-src 'none'",
].join('; ');

function setSecurity(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  res.setHeader('Content-Security-Policy', CSP);
}

/* ── Statische Dateien ─────────────────────────────────────── */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.gif': 'image/gif', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  // Pfad-Traversal verhindern
  const safe = path.normalize(path.join(ROOT, urlPath));
  // Pfad-Traversal: nur Pfade GENAU unter ROOT erlauben (Trailing-Separator gegen Geschwister-Ordner-Bypass)
  if (safe !== ROOT && !safe.startsWith(ROOT + path.sep)) { res.statusCode = 403; return res.end('Forbidden'); }
  // Internen Datenordner (Logs) nicht ausliefern
  const dataDir = path.join(ROOT, 'data');
  if (safe === dataDir || safe.startsWith(dataDir + path.sep)) { res.statusCode = 403; return res.end('Forbidden'); }

  fs.stat(safe, (err, stat) => {
    let file = safe;
    if (err || stat.isDirectory()) {
      if (!err && stat.isDirectory()) file = path.join(safe, 'index.html');
      else if (fs.existsSync(safe + '.html')) file = safe + '.html';
      else { res.statusCode = 404; res.setHeader('content-type', 'text/html; charset=utf-8'); return res.end('<h1>404 – Seite nicht gefunden</h1><p><a href="/">Zur Startseite</a></p>'); }
    }
    fs.readFile(file, (e, data) => {
      if (e) { res.statusCode = 404; return res.end('Not found'); }
      res.setHeader('content-type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
      res.setHeader('cache-control', 'no-cache');
      res.end(data);
    });
  });
}

/* ── Server ────────────────────────────────────────────────── */
const server = http.createServer((req, res) => {
  setSecurity(res);
  if (req.method === 'POST' && req.url === '/api/chat') return handleChat(req, res);
  if (req.method === 'GET' && req.url === '/api/health') {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ ok: true, ai: ladeApiKey() ? 'claude' : 'faq' }));
  }
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);
  res.statusCode = 405; res.end('Method not allowed');
});

server.listen(PORT, () => {
  const modus = ladeApiKey() ? 'Claude API (voll)' : 'FAQ-Fallback (kein API-Key)';
  console.log('\n  ✅ PrintLine läuft:  http://localhost:' + PORT);
  console.log('  🤖 KI-Assistent:     ' + modus);
  console.log('  🔒 Security-Header:  aktiv · Rate-Limit · anonymes Frage-Log (data/chat-log.jsonl)');
  console.log('  ⏹  Beenden mit:      Ctrl + C\n');
});
