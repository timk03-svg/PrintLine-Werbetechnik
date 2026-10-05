#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════
   PrintLine Werbetechnik — Lokaler Server (läuft über den Mac)
   • Liefert die statische Website aus (mit Security-Headern)
   • /api/chat  → KI-Assistent (Claude API + FAQ-Fallback)
     Wissen/Prompt/FAQ wie die produktive Chat-API (printline-chat-api/api/chat.js)
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

/* ── Wissensbasis, Systemprompt, Seitenliste, FAQ-Engine ─────
   1:1 aus der produktiven Chat-API (~/printline-chat-api/api/chat.js) übernommen.
   Änderungen am Firmenwissen bitte in BEIDEN Dateien pflegen. */
const WISSEN = `
UNTERNEHMEN: PrintLine Werbetechnik (werbung-kroner.de), Werbetechnik-Betrieb aus Stendal. Inhaberin und persönliche Ansprechpartnerin: Brit Kroner – sie begleitet Projekte von der ersten Idee bis zur Montage.
STANDORT / ADRESSE: Magdeburger Straße 5A, 39576 Stendal, Sachsen-Anhalt.
ÖFFNUNGSZEITEN: Montag bis Freitag 10:00–18:00 Uhr; Samstag und Sonntag geschlossen.
BERATUNG VOR ORT: Persönliche Beratungsgespräche bei uns finden ausschließlich nach vorheriger Terminvereinbarung statt (telefonisch, per E-Mail oder über das Kontaktformular). Auf Wunsch kommen wir für Beratung, Aufmaß und Montage auch zu Ihnen (z. B. nach Magdeburg, rund 65 km bzw. etwa 50 Minuten von Stendal). Die Erstberatung ist kostenlos.
KONTAKT: Telefon +49 152 03016900, E-Mail print2002@gmx.de, Kontaktformular auf der Website. Rückmeldung auf Anfragen in der Regel innerhalb eines Werktages (Antwort in 24 Stunden).
ERFAHRUNG: fast 40 Jahre. Gegründet 1986 als Werbeabteilung eines familiengeführten Malerbetriebs, seit 2002 eigenständiges Unternehmen. Zahlreiche abgeschlossene Projekte (keine konkrete Projektzahl nennen).
KUNDEN: Betriebe, Einrichtungen, Organisationen (B2B) sowie Vereine und Privatpersonen (B2C); Industrie, Handwerk, Bau, Logistik, Handel, öffentlicher Bereich.
EINZUGSGEBIET: Sitz in Stendal; tätig in der gesamten Altmark und darüber hinaus (u. a. Tangermünde, Osterburg, Havelberg, Gardelegen, Salzwedel, Magdeburg). Ungefähre Fahrstrecke und Fahrzeit ab Stendal: Tangermünde rund 10 km/15 Minuten, Osterburg rund 25 km/25 Minuten, Gardelegen rund 35 km/40 Minuten, Havelberg rund 45 km/50 Minuten, Magdeburg rund 65 km/50 Minuten, Salzwedel rund 65 km/gut eine Stunde. Aufträge nehmen wir auch überregional und deutschlandweit an: Druck, Beschriftungen, Schilder, Banner, Fahnen u. v. m. fertigen und versenden wir auf Anfrage bundesweit; Montage übernehmen wir bundesweit nach Absprache.
ARBEITSWEISE: Alles aus einer Hand – Beratung, Gestaltung, Produktion und Montage; auf Wunsch Aufmaß vor Ort. Kostenlose Erstberatung sowie kostenlose, unverbindliche Angebote.

LEISTUNGEN:
1. Beschriftungen (beschriftungen.html) – Fahrzeug- und Flottenbeschriftung: PKW, Firmenwagen, Nutzfahrzeuge und Transporter, LKW, Anhänger und Auflieger, Baumaschinen und Stapler. Dazu Magnetschilder fürs Fahrzeug, Contour-Cut-Logos und Autoaufkleber, Heck- und Dachbeschriftung, Ordnungsnummern und Kennzeichnung am Fahrzeug. Außerdem Boote und Jetski (einschließlich amtlicher Kennzeichen), Klein- und Leichtflugzeuge, Beschriftungen für Messe- und Eventveranstaltungen sowie Maschinen-, Industrie- und Hallenbeschriftungen (auch großflächig); Flottenbeschriftung auch für Landwirtschaftsbetriebe vom Transporter bis zur Maschine. Techniken: Teilverklebung (Logo, Schriftzug, Kontaktdaten), Flächenbeschriftung mit großflächigen Motiven und Werbebotschaften (keine komplette Vollverklebung), Digitaldruck für fotorealistische Motive und Verläufe (laminiert für UV- und Wetterschutz), Folienplott aus Farbfolie geschnitten. Für Boote und Flugzeuge verwenden wir Folien, die UV-Strahlung, Wasser und Fahrtwind dauerhaft standhalten. Für Fuhrparks legen wir ein einheitliches, wiederholbares Layout an, damit später hinzukommende Fahrzeuge identisch beklebt werden. Bei fachgerechter Anbringung und hochwertigen Folien lässt sich die Beschriftung in der Regel rückstandsfrei entfernen (wichtig für Leasing- und Mietfahrzeuge); die Entfernung übernehmen wir auf Wunsch. Pflege: bei fachgerechter Anbringung jahrelang beständig; Handwäsche statt Hochdruck auf die Kanten schont die Folie. Für nur zeitweise Beschriftung (Mietfahrzeuge, Privatwagen im Firmeneinsatz) eignen sich Magnetschilder. Für die Beschriftung brauchen wir am besten das Logo als Vektordatei oder PDF und die gewünschten Angaben; Fahrzeugmodell und Baujahr helfen bei der Flächenplanung; ohne Druckdaten übernehmen wir die Gestaltung.
   WICHTIG: Eine Vollfolierung (komplette Flächenverklebung) von Fahrzeugen bieten wir NICHT an. Teilfolierungen sind nach Absprache möglich; Schwerpunkt ist die Beschriftung mit Logo, Schriftzug und Kontaktdaten.
2. Digitaldruck (druck.html) – Großformatdruck; Plattendruck auf Alu-Dibond (Aluverbund), Forex (PVC-Hartschaum) und Hartschaum; Poster- und Papierdruck im Großformat; Plakate; PVC-Banner und Werbeplanen; UV-Direktdruck auf feste Materialien wie Holz, Acryl und Metall. Aufkleber und Etiketten in individuellen Formen, auf Wunsch mit Konturschnitt; Bodenaufkleber und Floor-Graphics; Fensterfolien; Maschinen- und Gerätebeschriftungen; Klebefolien-Buchstaben und Schriftzüge. Print und Geschäftsausstattung: Visitenkarten, Briefpapier, Flyer, Stempel, Broschüren, Blöcke, Einladungen und Gutscheine. Für draußen nutzen wir UV-beständige, wetterfeste Materialien; welcher Aufbau sinnvoll ist, hängt von Standort, Sonneneinstrahlung und gewünschter Standzeit ab und wird vor dem Angebot geklärt. Auflagen vom Einzelstück bis zur Serie.
3. Schilder (schilder.html) – Firmenschilder, Türschilder, Eingangs-, Namens- und Klingelschilder, Praxis- und Kanzleischilder, Immobilien- und Verkaufsschilder, Werbeschilder und Werbetafeln, Acrylglas- und Plexiglasschilder (auch mit Abstandshaltern), wechselbare Namens- und Türschildsysteme, Wegweiser und Orientierungsschilder, Bauschilder, Parkplatz- und Verbotsschilder, Türaufkleber und Öffnungszeitenschilder, Übersichts- und Etagenschilder. Materialien: meist Alu-Dibond in 2, 3 und 4 mm, für innen auch Forex 3 mm, außerdem Acrylglas (auch in Stärken über 4 mm, auf Wunsch mit Abstandshaltern); beschriftet per Digitaldruck oder geplotteter Folie. Einzelstück bis Serie; Montage auf Wunsch.
   SICHERHEITS- UND PFLICHTKENNZEICHNUNG (ebenfalls schilder.html): Flucht- und Rettungspläne nach ASR A2.3 (Technische Regel für Arbeitsstätten, auf Grundlage der Arbeitsstättenverordnung) auf Grundlage Ihres Grundrisses – mit Flucht- und Rettungswegen, Standort „Sie befinden sich hier", Sammelstellen, Feuerlöschern und Erste-Hilfe-Einrichtungen; üblich A3 auf 3 mm Alu-Dibond, auch als Digitaldruckaufkleber oder größer für Hallen und Treppenhäuser. Aktuell sein muss die Kennzeichnung u. a. bei Umbau, Nutzungsänderung oder einer Begehung durch die Berufsgenossenschaft. Sicherheitszeichen nach DIN EN ISO 7010 (europaweit einheitliche Piktogramme): Rettungszeichen E, grün (Notausgang, Erste Hilfe, Sammelstelle, Notruftelefon), Brandschutzzeichen F, rot (Feuerlöscher, Löschschlauch, Brandmelder), Verbotszeichen P (z. B. Rauchen verboten, Zutritt für Unbefugte verboten), Gebotszeichen M (Schutzbrille, Gehörschutz, Sicherheitsschuhe, weitere PSA), Warnzeichen W (elektrische Spannung, Flurförderzeuge, Rutschgefahr). Rohrleitungskennzeichnung nach DIN 2403: Stoff im Klartext, Pfeil für die Fließrichtung, Farbe der Stoffgruppe (Wasser grün, Wasserdampf rot, Luft grau, brennbare Gase gelb, Säuren orange, Laugen violett, Sauerstoff blau), bei Gefahrstoffen GHS-Symbole; als Band, selbstklebende Folie oder Steckschild (für schwer zugängliche Leitungen) passend zum Rohrdurchmesser. Außerdem Boden- und Treppenmarkierungen, Stufenkanten und Verkehrswege, Raum- und Türnummern, Ordnungs- und Regalkennzeichnung, Betriebsanweisungen und Maschinenkennzeichnung nach Vorgabe des Kunden, Sammelstellen- und Parkplatzbeschilderung. NICHT dazu gehört die brandschutzrechtliche Prüfung und Abnahme – die Inhalte stimmen wir mit den Unterlagen des Kunden ab (Brandschutzkonzept, Grundriss, Fachkraft für Arbeitssicherheit).
4. Fassaden (fassaden.html) – Fassadenbeschriftung und individuelle Wandbeschriftungen – traditionell mit hochwertiger Dispersionsfarbe direkt auf die Wand aufgetragen (ohne Folien, ohne aufgesetzte Elemente; Formulierung immer so, nicht „malen“ oder „gemalt“), nach Corporate Design, mit Lösungen für unterschiedliche Untergründe und architektonische Anforderungen, auf den meisten mineralischen Fassaden; den Untergrund sehen wir uns vor dem Angebot an. Haltbarkeit: sehr beständig, altert mit der Fassade und löst sich nicht wie Folie an den Rändern; die Standzeit hängt von Untergrund, Wetterseite und Sonneneinstrahlung ab (keine Jahreszahl nennen). Ob eine Genehmigung nötig ist, hängt von Größe, Ort und Gebäude ab (z. B. Denkmalschutz, Gestaltungssatzungen) – das klärt der Kunde früh mit seiner Kommune. Bau- und Außenwerbung: Bautafeln und Baustellenschilder, Bauzaunbanner und Gerüstplanen, Werbeturm und Werbeträger-Aufbau, Toranlagen- und Rolltor-Beschriftung.
5. Werbeartikel (werbeartikel.html) – mit Logo: Kugelschreiber und Schreibwaren, Tassen und Trinkflaschen, Schlüsselanhänger, USB-Sticks und Feuerzeuge, Buttons, Anstecker und Lanyards (Schlüsselbänder), Zollstöcke und Warnwesten, Sitzwürfel aus Schaumstoff und gebogene Messetheken, Promotionsarmbänder mit Kunststoff-Steckschnalle, Einkaufswagenchips und Flaschenöffner, RFID-/NFC-Schutzkarten und Notizblöcke, Stempel, Pokale, Klemmbretter und 3-Monatskalender, Regenschirme, Jutebeutel und bedruckte Süßwaren. Mindestmengen hängen vom Artikel ab (Textilien ab Einzelstück, bei Streuartikeln wie Kugelschreibern gelten Staffelmengen des Herstellers); bei zugekauften Artikeln kommt die Lieferzeit des Herstellers dazu.
6. Folientechnik (folientechnik.html) – Folien für Glas, Fenster, Schaufenster und Möbel: Werbefolien, Sichtschutz-, Milchglas- und Spiegelfolien, Sicherheits- und Splitterschutzfolien, Sonnenschutzfolien, Schaufensterbeschriftung, Dekor- und Designfolien, Magnetfolien, Folienplott zur Selbstanbringung (mit Übertragungstape vorbereitet; bei großen Flächen, Schaufenstern und Glastüren empfehlen wir die Montage durch uns, weil Blasen und Versatz dort schnell sichtbar werden), Anti-Graffiti-Folien, Adhäsionsfolien, Tafel- und Whiteboardfolien. Wir gestalten, drucken und montieren. Milchglasfolie ist von beiden Seiten blickdicht und lässt Licht durch (üblich für Besprechungsräume, Praxen und Bäder); Spiegelfolie schützt nur zur helleren Seite (tagsüber von außen), nachts kehrt sich die Wirkung um. Magnetfolie haftet ohne Kleber auf ebenen Stahlflächen und lässt sich rückstandsfrei abnehmen. Splitterschutzfolie hält bei Glasbruch die Scherben zusammen (Glastüren, Schaufenster, Innenverglasungen), ohne das Erscheinungsbild zu verändern.
7. Textildruck (textildruck-flex-und-flock.html) – Flexdruck, Flockdruck und Sublimationsdruck auf Arbeits- und Berufskleidung, Warnschutz- und Sicherheitskleidung, T-Shirts, Poloshirts, Hoodies und Sweatshirts, Schürzen, Caps, Taschen und Trikots; Klein- und Großauflagen ab dem Einzelstück. Flex: glatt, elastisch, kräftige Farben (Schriftzüge, Nummern, Logos); Flock: samtig, hochwertig, trägt etwas auf; Sublimation: vollflächige Motive im Gewebe, nur auf geeigneten Textilien. Logo am besten als Vektordatei; sonst zeichnen wir es nach.
   WICHTIG: Stickerei und Siebdruck bieten wir NICHT an.
8. Fahnen & Displays (fahnen.html) – Hissfahnen, Event- und Messefahnen, Beachflags und Werbefahnen, Auslegerfahnen und Dropflags; Roll-Ups (für Innenräume), Faltdisplays und Pop-Up-Messewände, Spannrahmen und Textilbilder. Bedruckt im Digitaldruck (auch Fotos und Farbverläufe); auf Wunsch mit passenden Masten, Gestellen und Bodenplatten. Fahnen sind aus witterungsbeständigen Materialien für den Außeneinsatz; an sehr windigen Plätzen verschleißt der Saum schneller.
9. Aufsteller & Pylonen (aufsteller-pylonen.html) – Aufsteller und Kundenstopper (für draußen mit befüllbarem Fuß für Wasser oder Sand; bei Klapprahmen und Spannrahmen tauscht man das Motiv selbst und bestellt später nur den neuen Druck), Event- und Messeaufsteller, Theken- und Tischaufsteller, Werbe- und Info-Pylonen, Spannrahmen für Wandmontage, Messetheken und Promotion-Theken, Werbeturm und Werbeträger-Aufbau, Stelenbeschriftung; auch beidseitig bedruckt.
10. Werbebanner, Planen & Gerüstplanen (planen-banner.html) – Werbe- und Promotionsbanner, Event- und Messebanner, Zipperbanner (Textilbanner mit Keder im Aluminiumrahmen, Motiv wechselbar), PVC-Banner und Werbeplanen, Fassadenbanner, Gerüstplanen, Bauzaunbanner und Bauzaunblenden; aus PVC oder Mesh (luftdurchlässig bei Wind); Größe nach Maß, sehr große Flächen mehrteilig. Konfektionierung nach Absprache: Umsäumen, Ösen, Hohlsaum für Rohre oder Klettband.
11. Plakatwerbung (plakatwerbung.html) – Laternenplakate für Ihre Veranstaltung, komplett: Verteilung nach Einwohnerzahl, Route, Sondernutzungsanträge bzw. Buchung beim Werbevermarkter, Gestaltung, Druck (Doppel-A1 oder Hohlkammerplatten), Anbringung nach den Auflagen, Abbau. Keine weiteren Details (Fristen, Höhen, Befestigung, Anlässe) nennen – andere Anlässe (z. B. Wahlwerbung) nicht zusagen, sondern persönlich klären.
12. Webentwicklung (webdesign.html) – Unternehmenswebsites für Handwerk, Gewerbe, Dienstleister und Händler, Landingpages für Anfragen und Aktionen, SEO-Optimierung, Pflege und Aktualisierung (laufende Betreuung auf Wunsch), Beratung zu Domain, Hosting, Datenschutz (DSGVO) und Performance; responsive für Smartphone, Tablet und Desktop, individuell statt Standard-Template. Referenz: die eigene Website werbung-kroner.de (inklusive dieses KI-Assistenten).
   WICHTIG: Onlineshops, Apps/Web-Apps, Newsletter-Systeme, Login-Bereiche und Online-Terminbuchung bieten wir NICHT an.
13. Gestaltung & Montage – Gestaltung und Grafik für Ihre Werbemittel (Entwurf, Layout, Umsetzung nach Corporate Design, Logo nachzeichnen), Aufmaß vor Ort, Montage vor Ort, Demontage bzw. Austausch alter Beschriftungen. Ob wir ein komplett neues Logo entwickeln, ist nicht beschrieben – weder zusagen noch absagen, sondern persönlich klären.
MESSE: Für Messeauftritte liefern wir Roll-Ups, Faltdisplays und Pop-Up-Messewände, Messefahnen, Messetheken, Aufsteller, Banner, Beschriftungen und Werbeartikel. Einen kompletten Messestandbau beschreiben wir nicht als eigene Leistung – nicht zusagen, sondern persönlich klären.

NICHT IM ANGEBOT (klar und freundlich sagen und die Alternative nennen – nie so tun, als ob):
- Stickerei → Alternative: Flex-, Flock- und Sublimationsdruck.
- Siebdruck → Alternative: Digitaldruck bzw. Flex/Flock/Sublimation bei Textilien.
- Gravur / Gravurschilder → Alternative: Schilder im Digitaldruck oder mit Folie (Alu-Dibond, Acrylglas).
- Leinwanddruck, Alu-Dibond-Wandbilder, Fototapete, Hinterglasdruck. (Wandbeschriftungen mit Dispersionsfarbe nach Punkt 4 bieten wir dagegen an.)
- Leuchtreklame, Leuchtkästen, Neon- und LED-Werbung, beleuchtete Schilder oder Pylonen → Alternative: Schilder, Pylonen, Fassadenbeschriftung.
- 3D-Buchstaben / Profil- oder Acryl-Einzelbuchstaben → Alternative: Schriftzug als Schild, an Schaufenster oder Tür aus Folie, an der Fassade traditionell mit hochwertiger Dispersionsfarbe direkt auf die Wand aufgetragen (an Fassaden nie Folie anbieten).
- Vollfolierung von Fahrzeugen → Alternative: Teilbeschriftung / Teilfolierung nach Absprache.
- Fassadenbeschriftung mit Folie → wir arbeiten an Fassaden mit Farbe.
- Copyshop / Kopierservice.
- Onlineshops, Apps, Newsletter-Systeme, Login-Bereiche, Online-Terminbuchung → Alternative: Unternehmenswebsite, Landingpage.
- Fahrradständer.

ONLINE-KONFIGURATOR (Verweis: konfigurator.html, leitet weiter zu konfigurator.werbung-kroner.de): Dort stellen Kunden ihre Anfrage in wenigen Minuten selbst zusammen – für Fahrzeugbeschriftung, Schilder, Schaufenster, Banner, Arbeitskleidung oder Sonstiges. Webentwicklung und Plakatwerbung fragt man nicht im Konfigurator an, sondern über das Kontaktformular, telefonisch oder per E-Mail. Den Entwurf bekommt der Kunde vor der Produktion zur Freigabe. Keine Details zu einzelnen Eingabefeldern, Uploads oder einer Vorschau nennen. Unverbindlich; wir melden uns mit einem kostenlosen Angebot. Plakatwerbung läuft nicht über den Konfigurator, sondern per Anfrage.

PREISE: projektabhängig (Material, Format, Aufwand), keine pauschalen Festpreise. Keine Preise oder Preisspannen nennen – für ein konkretes, kostenloses Angebot kontaktiert man PrintLine direkt oder nutzt den Konfigurator.
DRUCKDATEN/GESTALTUNG: fertige Druckdaten am besten als PDF oder Vektordatei (Schriften eingebettet oder in Pfade umgewandelt); wir prüfen Dateien vor dem Druck – oder PrintLine übernimmt die komplette Gestaltung.
ABLAUF: Anfrage → kostenloses, unverbindliches Angebot → Gestaltung & Freigabe (maßstäbliche Druckvorschau bzw. Entwurf vor der Produktion) → Produktion → Lieferung, Abholung in Stendal oder Montage vor Ort.
TERMINE: Der Fertigungstermin wird verbindlich mit dem Kunden abgestimmt. Keine Dauer und keine Eil-Zusagen nennen.
AUFLAGEN: vom Einzelstück bis zur größeren Serie.
ZAHLUNG: Zu Zahlungsarten, Konditionen und Rabatten nichts sagen oder zusagen – auf Telefon/E-Mail verweisen.
QUALITÄT/REKLAMATION: hochwertige, UV- und witterungsbeständige Materialien, damit Farben und Konturen über Jahre erhalten bleiben. Bei Reklamationen gelten die gesetzlichen Regelungen bzw. unsere AGB.
REFERENZEN (nur diese namentlich nennen): ausführlich beschrieben im Portfolio: Zeitfracht (Flottenbeschriftung von LKW-Aufliegern und Zugmaschinen, zeitfracht.html) und CPC Germania (großflächige Beschriftung von Maschinenköpfen, cpc-germania.html). Auf den Leistungsseiten gezeigt: Altmark Umzüge, Elektro Liesecke, Thai Küche, PC Notdienst Pürner (Fahrzeugbeschriftung), Bootsbeschriftung Jetski, TotalEnergies (Tankbeschriftung, Folien), Flugplatz Stendal/Borstel (Folien), DRK Tagespflege und DRK Seniorenberatung (Tür- und Schaufensterfolie), Hanse Hotel Stendal (Fassadenwerbung), Informationstafel Landkreis Stendal (Großformatdruck), Freiwillige Feuerwehr (Werbeschild), Max Car Autohandel und wirkaufendeinauto.de (Fahnen), Altmark-Cafeteria (Kundenstopper), Deutsches Rotes Kreuz (Pylon/Stele), Autohaus Schröter (Werbeplane). Historische Arbeiten zeigt das Projektarchiv 1986–2001.

SEITEN FÜR VERWEISE (NUR diese Dateinamen verwenden – niemals erfinden):
- Beschriftungen → beschriftungen.html
- Digitaldruck → druck.html
- Schilder und Sicherheitskennzeichnung → schilder.html
- Fassaden → fassaden.html
- Werbeartikel → werbeartikel.html
- Folientechnik → folientechnik.html
- Textildruck (Flex/Flock) → textildruck-flex-und-flock.html
- Fahnen & Displays → fahnen.html
- Aufsteller & Pylonen → aufsteller-pylonen.html
- Werbebanner, Planen & Gerüstplanen → planen-banner.html
- Plakatwerbung → plakatwerbung.html
- Webentwicklung → webdesign.html
- Alle Leistungen (Übersicht) → leistungen.html
- Online-Konfigurator → konfigurator.html
- Referenzen / Portfolio → portfolio.html
- Referenz Zeitfracht → zeitfracht.html
- Referenz CPC Germania → cpc-germania.html
- Projektarchiv 1986–2001 → Archiv.html
- Über uns → ueber-uns.html
- Kontakt / Angebot anfragen → kontakt.html
- Regionen: Magdeburg → werbetechnik-magdeburg.html, Fahrzeugbeschriftung Magdeburg → fahrzeugbeschriftung-magdeburg.html, Banner drucken Magdeburg → banner-drucken-magdeburg.html, Tangermünde → werbetechnik-tangermuende.html, Osterburg → werbetechnik-osterburg.html, Havelberg → werbetechnik-havelberg.html, Gardelegen → werbetechnik-gardelegen.html, Salzwedel → werbetechnik-salzwedel.html
`;

const SYSTEM_PROMPT =
`Du bist der freundliche KI-Assistent auf der Website von PrintLine Werbetechnik in Stendal.
Beantworte Fragen von Website-Besuchern kurz, hilfreich und professionell auf Deutsch (Sie-Form).
Nutze ausschließlich die folgenden Fakten. Wenn etwas nicht abgedeckt ist, sage das ehrlich und
verweise auf den direkten Kontakt (Telefon +49 152 03016900 oder E-Mail print2002@gmx.de).
Halte Antworten knapp (2–5 Sätze). Bei Preis-, Termin- oder Auftragsfragen lade aktiv zum kostenlosen
unverbindlichen Angebot ein. Erfinde keine Fakten, Leistungen, Preise, Fristen oder Referenzen.
Nenne keine Preise und keine Preisspannen. Verwende das Wort „Express" nicht.
Fragt jemand nach einer Leistung aus der Liste NICHT IM ANGEBOT, sage klar und freundlich, dass wir sie nicht
anbieten, und nenne die dort genannte Alternative. Steht eine Leistung weder bei den Leistungen noch bei
NICHT IM ANGEBOT, sage nicht zu, sondern biete an, das persönlich zu klären.
Antworte direkt mit der eigentlichen Antwort – ohne sichtbare Vorüberlegungen, Zwischenschritte oder Meta-Kommentar.

Wenn die Frage eine konkrete Leistung, Referenz oder Region betrifft, biete am Ende kurz an, die passende Seite
zu öffnen, und hänge GENAU EINEN Verweis-Marker im Format [[seite:DATEINAME.html|Kurzer Linktext]] an –
ausschließlich mit einem Dateinamen aus der Liste SEITEN FÜR VERWEISE. Erfinde niemals Dateinamen.
Höchstens ein Marker pro Antwort; bei allgemeinen Fragen (Kontakt, Öffnungszeiten, Smalltalk) keinen Marker.

FAKTEN:
${WISSEN}`;

/* ── Erlaubte Seiten-Dateinamen (Absicherung gegen erfundene Links) ── */
const ERLAUBTE_SEITEN = new Set([
  'beschriftungen.html','druck.html','schilder.html','fassaden.html','werbeartikel.html',
  'folientechnik.html','textildruck-flex-und-flock.html','fahnen.html','aufsteller-pylonen.html',
  'planen-banner.html','plakatwerbung.html','webdesign.html','leistungen.html','portfolio.html','kontakt.html',
  'konfigurator.html','ueber-uns.html','Archiv.html','zeitfracht.html','cpc-germania.html',
  'werbetechnik-magdeburg.html','fahrzeugbeschriftung-magdeburg.html','banner-drucken-magdeburg.html','werbetechnik-tangermuende.html',
  'werbetechnik-osterburg.html','werbetechnik-havelberg.html','werbetechnik-gardelegen.html','werbetechnik-salzwedel.html',
]);

// Entfernt Marker, die auf nicht existierende Seiten zeigen (Halluzinationsschutz).
function bereinigeMarker(text) {
  return String(text || '').replace(/\[\[seite:([^|\]]+)\|([^\]]+)\]\]/g, function (full, datei) {
    return ERLAUBTE_SEITEN.has(String(datei).trim()) ? full : '';
  });
}

/* ── FAQ-Fallback (ohne API-Key oder bei API-Fehler) ────────────
   Stichwort-Regeln:  'wort'  = ganzes Wort, ab 5 Zeichen auch Wortanfang/-ende („firmenschild" → „schild")
                      '=wort' = nur als ganzes Wort („=offen" trifft nicht „offene")
                      'zwei worte' = Wortfolge
   allg: allgemeine Floskeln („macht ihr") zählen nur 1 Punkt.  combo: [[Wörter], 'wortanfang'] – beides in der Frage.
   neg:  nicht angeboten bzw. nur persönlich zu klären – gewinnt bei Gleichstand gegen positive Themen. */
const TEL = '**+49 152 03016900**', MAIL = '**print2002@gmx.de**';
const FAQ = [
  // ── Nicht im Angebot / persönlich klären ──
  { neg: true, keys: ['stickerei','sticken','bestickt','besticken','gestickt','aufsticken','einsticken','stickrei','stikerei','stickerrei','stick logo','stick logos'],
    a: 'Stickerei bieten wir **nicht** an. Textilien veredeln wir mit **Flex-, Flock- und Sublimationsdruck** – für Arbeitskleidung, Vereinsshirts, Trikots und mehr.\n\n[[seite:textildruck-flex-und-flock.html|Zum Textildruck]]' },
  { neg: true, keys: ['siebdruck','siebdrucker','=sieb'],
    a: 'Siebdruck bieten wir **nicht** an – wir drucken digital. Textilien veredeln wir mit **Flex-, Flock- und Sublimationsdruck**.\n\n[[seite:textildruck-flex-und-flock.html|Zum Textildruck]]' },
  { neg: true, keys: ['gravur','gravuren','gravieren','graviert','gravierte','graviertes','lasergravur','gravurschild','gravurschilder','eingraviert'],
    a: 'Gravurschilder bieten wir **nicht** an. Unsere Schilder fertigen wir im **Digitaldruck oder mit Folie** – zum Beispiel aus Alu-Dibond oder Acrylglas, auf Wunsch mit Abstandshaltern.\n\n[[seite:schilder.html|Zur Schilder-Seite]]' },
  { neg: true, keys: ['=leinwand','leinwanddruck','leinwandbild','leinwandbilder','leinwanddrucke','wandbild','wandbilder','fototapete','fototapeten','wandtapete','hinterglas','hinterglasdruck','urlaubsfoto','familienfoto','wanddeko','wanddekoration','alubild','acrylbild','fotoleinwand','foto als wandbild'],
    a: 'Leinwanddruck, Alu-Dibond-Wandbilder, Fototapeten und Hinterglasdruck bieten wir **nicht** an. Im Digitaldruck bedrucken wir Folie, Platten wie Alu-Dibond und Forex sowie Papier im Großformat – für Werbung, Schilder und Messen.\n\n[[seite:druck.html|Zum Digitaldruck]]' },
  { neg: true, keys: ['leuchtreklame','leuchtkasten','leuchtkästen','leuchtschrift','leuchtschild','leuchtschilder','leuchtbuchstaben','leuchtwerbung','lichtwerbung','lichtreklame','lichtwerbeanlage','neonschrift','neonreklame','neonschild','neon schild','neon werbung','neon schriftzug','led schild','led schilder','led werbung','led schrift','led schriftzug','led leuchte','led beleuchtung','beleuchtet','beleuchtete','beleuchtetes','beleuchteten','hinterleuchtet','mit licht','mit beleuchtung','mit led','leuchtende buchstaben','leuchtende schrift','leuchtendes schild','von innen beleuchtet'],
    a: 'Leuchtreklame, Leuchtkästen sowie Neon- und LED-Werbung – auch beleuchtete Schilder oder Pylonen – bieten wir **nicht** an. Gern beraten wir Sie zu **Firmenschildern, Pylonen oder einer Fassadenbeschriftung**.\n\n[[seite:schilder.html|Zur Schilder-Seite]]' },
  { neg: true, keys: ['3d buchstaben','3d schrift','3d logo','3d schriftzug','3d einzelbuchstaben','profilbuchstaben','acrylbuchstaben','edelstahlbuchstaben','metallbuchstaben','buchstaben aus edelstahl','buchstaben aus metall','buchstaben aus acryl','einzelbuchstaben','buchstaben fuer die fassade','buchstaben an der fassade'],
    a: '3D- und Einzelbuchstaben (z. B. aus Acryl oder Metall) bieten wir **nicht** an. Ihren Schriftzug setzen wir als **Schild** um, an Schaufenster oder Tür aus **Folie** – und an der Fassade **traditionell mit hochwertiger Dispersionsfarbe** direkt auf die Wand aufgetragen.\n\n[[seite:schilder.html|Zur Schilder-Seite]]' },
  { neg: true, keys: ['vollfolierung','vollfolieren','vollfoliert','komplettfolierung','komplett folieren','komplett foliert','vollverklebung','car wrapping','carwrapping','carwrap','car wrap','wrapping','wrappen','umfolieren','umfolierung','mattschwarz','farbwechselfolierung','ganz folieren','auto komplett'],
    combo: [['komplett','komplette','kompletten','ganz','ganze','ganzen','voll','gesamte','rundum'], 'folier', ['schaufenster','fenster','glas','scheibe','scheiben','heckscheibe','tuer','glastuer','moebel','wand','buero']],
    a: 'Eine **Vollfolierung** (komplette Flächenverklebung von Fahrzeugen) bieten wir **nicht** an. **Teilfolierungen** sind nach Absprache möglich – unser Schwerpunkt ist die hochwertige **Fahrzeugbeschriftung** mit Logo, Schriftzug und Kontaktdaten.\n\n[[seite:beschriftungen.html|Zur Beschriftungen-Seite]]' },
  { neg: true, keys: ['fassadenfolie','fassade folie','fassade mit folie','fassade bekleben','fassade folieren','fassadenfolierung','hauswand folie','hauswand bekleben','folie auf der fassade','folie an der fassade','folie fuer die fassade'],
    a: 'Fassaden bekleben wir **nicht** mit Folie. Unsere Fassadenbeschriftungen werden **traditionell mit hochwertiger Dispersionsfarbe** direkt auf die Wand aufgetragen – dauerhaft und wetterbeständig.\n\n[[seite:fassaden.html|Zur Fassaden-Seite]]' },
  { neg: true, keys: ['copyshop','copy shop','kopieren','kopierer','kopierservice','fotokopie','fotokopien','kopien machen','kopien drucken','seiten kopieren'],
    a: 'Einen Copyshop bzw. Kopierservice bieten wir **nicht** an. Drucksachen wie **Visitenkarten, Flyer, Briefpapier und Broschüren** fertigen wir gern für Sie.\n\n[[seite:druck.html|Zum Digitaldruck]]' },
  { neg: true, negFaktor: 1, keys: ['onlineshop','online shop','webshop','shopsystem','e commerce','ecommerce','app entwickeln','app programmieren','app bauen','eine app','web app','webapp','newsletter','newslettersystem','login bereich','loginbereich','mitgliederbereich','kundenlogin','terminbuchung','online terminbuchung','online buchung'],
    a: 'Onlineshops, Apps, Newsletter-Systeme, Login-Bereiche und Online-Terminbuchung bieten wir **nicht** an. Wir erstellen **Unternehmenswebsites und Landingpages** – mit SEO, Pflege und Beratung zu Domain, Hosting und DSGVO.\n\n[[seite:webdesign.html|Zur Webentwicklung]]' },
  { neg: true, keys: ['fahrradständer','fahrradstaender','fahrradparker','radständer'],
    a: 'Fahrradständer bieten wir **nicht** an. Gern helfen wir Ihnen mit Schildern, Beschriftungen oder Sicherheitskennzeichnung für Ihr Gelände.\n\n[[seite:leistungen.html|Alle Leistungen ansehen]]' },
  { neg: true, keys: ['=abnahme','brandschutzrechtliche','brandschutzrechtlich','brandschutzprüfung','pruefung und abnahme','brandschutzgutachten','sachverständiger'],
    a: 'Die **brandschutzrechtliche Prüfung und Abnahme** übernehmen wir **nicht**. Wir gestalten, fertigen und montieren Flucht- und Rettungspläne nach ASR A2.3 und die Sicherheitskennzeichnung – die Inhalte stimmen wir mit Ihren Unterlagen ab (Brandschutzkonzept, Grundriss, Fachkraft für Arbeitssicherheit).\n\n[[seite:schilder.html|Zur Sicherheitskennzeichnung]]' },
  { neg: true, keys: ['wahlplakat','wahlplakate','wahlwerbung','wahlkampf','=partei','=kandidat','=kandidatin','bürgermeisterwahl','kommunalwahl','landtagswahl','bundestagswahl','europawahl','=wahl'],
    a: 'Unsere Plakatwerbung an Laternen ist für **Veranstaltungen** gedacht. Für andere Anlässe fragen Sie einfach an: ' + TEL + ' oder ' + MAIL + '.' },
  { neg: true, keys: ['messestand','messestände','messebau','messestandbau','=standbau','messe stand','messeauftritt','messeausstattung'],
    a: 'Für Ihren Messeauftritt liefern wir **Roll-Ups, Faltdisplays und Pop-Up-Messewände, Messefahnen, Messetheken, Banner, Beschriftungen und Werbeartikel**. Fragen Sie einfach an: ' + TEL + ' oder ' + MAIL + '.' },
  { neg: true, keys: ['neues logo','logo neu','logoentwicklung','logodesign','logo entwerfen','logo erstellen','logo entwickeln','logo gestalten','logo designen','logo design'],
    a: 'Wir gestalten Ihre Werbemittel, setzen Ihr Corporate Design um und zeichnen vorhandene Logos sauber nach. Für alles Weitere fragen Sie einfach an: ' + TEL + ' oder ' + MAIL + '.' },
  { neg: true, keys: ['prägung','praegung','goldprägung','heißfolie','heissfolie','goldfolie','heißprägung','spotlack','relieflack','lackveredelung'],
    a: 'Visitenkarten, Briefpapier und Flyer drucken wir im Digitaldruck. Für alles Weitere fragen Sie einfach an: ' + TEL + ' oder ' + MAIL + '.\n\n[[seite:druck.html|Zum Digitaldruck]]' },

  // ── Allgemein ──
  { keys: ['preis','preise','kosten','kostet','teuer','günstig','angebot','budget','was kostet','kostenvoranschlag','rabatt','rabatte','vereinsrabatt','mengenrabatt','nachlass','skonto','sonderpreis','vergünstigung','prozente','staffelpreis','staffelpreise','rabatt fuer','rabatte fuer','gibt es rabatt'],
    a: 'Unsere Preise hängen vom Projekt ab – von Material, Format und Aufwand. Gern erstellen wir Ihnen ein **kostenloses, unverbindliches Angebot**. Schreiben Sie uns über das Kontaktformular, nutzen Sie den Online-Konfigurator oder rufen Sie an: ' + TEL + '.\n\n[[seite:kontakt.html|Angebot anfragen]]' },
  { keys: ['erstberatung','beratung kostenlos','kostet die beratung','beratung kosten','kostenlose beratung'],
    a: 'Die **Erstberatung ist kostenlos**, ebenso Ihr Angebot. Persönliche Gespräche bei uns in Stendal gibt es nach Terminvereinbarung – auf Wunsch kommen wir für Beratung und Aufmaß auch zu Ihnen. Sie erreichen uns unter ' + TEL + ' oder ' + MAIL + '.\n\n[[seite:kontakt.html|Beratung anfragen]]' },
  { keys: ['kontakt','telefon','telefonnummer','anrufen','anruf','handynummer','email','e mail','=mail','erreichen','erreiche','erreichbar','melden','schreiben'],
    a: 'Sie erreichen uns telefonisch unter ' + TEL + ' oder per E-Mail an ' + MAIL + '. Wir melden uns in der Regel innerhalb eines Werktages.' },
  { keys: ['auftrag erteilen','angebot annehmen','angebot bekommen','angebot erhalten','beauftragen','auftrag geben','=bestellen','=bestellung','wie bestelle'],
    a: 'Schön, dass Sie uns beauftragen möchten! Geben Sie uns einfach per E-Mail an ' + MAIL + ' oder telefonisch unter ' + TEL + ' Bescheid – danach stimmen wir Gestaltung, Freigabe und Termin mit Ihnen ab.' },
  { keys: ['standort','adresse','anschrift','anfahrt','stendal','=sitz','wo seid','wo sind','wo finde','=parken','überregional','deutschlandweit','bundesweit','außerhalb','liefergebiet','einzugsgebiet','andere stadt','weit weg','=region','genaue adresse','eure adresse','mit hausnummer','welche hausnummer','eure hausnummer','magdeburger strasse','arbeitet ihr auch','kommt ihr','=hamburg','=berlin','=hannover','=leipzig','=deutschland'],
    a: 'Sie finden uns in der **Magdeburger Straße 5A, 39576 Stendal** (Sachsen-Anhalt). Wir arbeiten in der gesamten Altmark und darüber hinaus – Druck, Beschriftungen, Schilder, Banner, Fahnen und vieles mehr fertigen und versenden wir auf Anfrage **bundesweit**, die Montage übernehmen wir bundesweit nach Absprache. Für Beratung, Aufmaß und Montage kommen wir auf Wunsch zu Ihnen; bei uns vor Ort beraten wir nach Terminvereinbarung.' },
  { keys: ['=magdeburg','tangermünde','tangermuende','osterburg','havelberg','gardelegen','salzwedel','altmark'],
    a: 'Ja, dort sind wir im Einsatz – von Stendal aus in der gesamten Altmark und bis Magdeburg. Für Beratung, Aufmaß und Montage kommen wir persönlich zu Ihnen. Erzählen Sie uns von Ihrem Vorhaben, dann erstellen wir Ihnen ein kostenloses Angebot.\n\n[[seite:kontakt.html|Angebot anfragen]]' },
  { keys: ['öffnungszeit','öffnungszeiten','geöffnet','=offen','wann offen','heute offen','heute auf','sprechzeit','sprechzeiten','geschäftszeiten','wochenende','samstag','samstags','sonntag','sonntags','feiertag','feiertags','=am sa'],
    a: 'Unsere Öffnungszeiten sind **Montag bis Freitag 10:00–18:00 Uhr**. Persönliche Beratung vor Ort bitte nach vorheriger Terminvereinbarung – unter ' + TEL + ' oder ' + MAIL + '.' },
  { keys: ['=termin','vorbeikommen','vorbei kommen','besuchen','=besuch','beratungstermin','beratungsgespräch','persönlich','spontan'],
    a: 'Persönliche Beratungsgespräche bei uns finden **nach vorheriger Terminvereinbarung** statt – so nehmen wir uns gezielt Zeit für Sie. Vereinbaren Sie Ihren Termin unter ' + TEL + ', per E-Mail an ' + MAIL + ' oder über das Kontaktformular; auf Wunsch kommen wir auch zu Ihnen.\n\n[[seite:kontakt.html|Termin anfragen]]' },
  { keys: ['dauer','wie lange dauert','lieferzeit','wann fertig','=schnell','wie schnell','schnell fertig','schnellstmöglich','express','eilig','eilt','dringend','zeitnah','bis wann','liefertermin','fertigungstermin','=morgen','übermorgen','heute noch','bis freitag','bis montag','bis morgen','naechste woche','kurzfristig','eilauftrag','rechtzeitig'],
    a: 'Auf Ihre Anfrage melden wir uns in der Regel innerhalb eines Werktages und stimmen den Fertigungstermin verbindlich mit Ihnen ab: ' + TEL + ' oder ' + MAIL + '.' },
  { keys: ['erfahrung','seit wann','wie lange gibt','gibt es euch','=jahre','geschichte','über euch','über uns','wer seid','eure firma','=team','gegründet','inhaber','inhaberin','ansprechpartner','ansprechpartnerin','wem gehört','=chef','=chefin'],
    a: 'PrintLine Werbetechnik gibt es seit fast **40 Jahren** – 1986 gestartet als Werbeabteilung eines familiengeführten Malerbetriebs, seit 2002 eigenständig in Stendal. Inhaberin und Ihre persönliche Ansprechpartnerin ist **Brit Kroner**.\n\n[[seite:ueber-uns.html|Über uns]]' },
  { keys: ['leistung','leistungen','überblick','übersicht','sortiment','im angebot','alles im angebot','habt ihr alles','=gründe','gründung','existenzgründung','geschäftseröffnung','was braucht man'],
    allg: ['macht ihr','könnt ihr','koennt ihr','machen sie','können sie','was macht','bietet ihr','was bietet','was bieten','services','angebot an'],
    a: 'Wir bieten **Beschriftungen, Digitaldruck, Schilder und Sicherheitskennzeichnung, Fassaden, Werbeartikel, Folientechnik, Textildruck, Fahnen & Displays, Aufsteller & Pylonen, Werbebanner & Planen, Plakatwerbung** sowie **Webentwicklung** – alles aus einer Hand, von der Gestaltung bis zur Montage. Welcher Bereich interessiert Sie?\n\n[[seite:leistungen.html|Alle Leistungen ansehen]]' },
  { keys: ['konfigurator','im konfigurator','über den konfigurator','ueber den konfigurator','konfigurator anfragen','selbst gestalten','online gestalten','online anfrage','zusammenstellen','vorschau','visualisieren','wie sieht es aus'],
    a: 'Im **Online-Konfigurator** stellen Sie Ihre Anfrage in wenigen Minuten selbst zusammen – für Fahrzeugbeschriftung, Schilder, Schaufenster, Banner, Arbeitskleidung oder Sonstiges. Den Entwurf bekommen Sie vor der Produktion zur Freigabe. **Plakatwerbung** und **Webentwicklung** fragen Sie direkt über das Kontaktformular oder telefonisch an.\n\n[[seite:konfigurator.html|Zum Konfigurator]]' },
  { keys: ['referenz','referenzen','portfolio','beispiele','beispiel','projekte','galerie','=kunden','für wen','gearbeitet','zusammengearbeitet'],
    a: 'Ausführlich beschrieben sind im Portfolio die Flottenbeschriftung für **Zeitfracht** und die Maschinenkopf-Beschriftung für **CPC Germania**. Weitere Arbeiten zeigen wir auf den Leistungsseiten – z. B. für TotalEnergies, das DRK oder das Hanse Hotel Stendal –, historische Projekte im Archiv 1986–2001.\n\n[[seite:portfolio.html|Zum Portfolio]]' },
  { keys: ['archiv','=früher','alte projekte'],
    a: 'In unserem Projektarchiv zeigen wir Arbeiten aus den Jahren 1986 bis 2001 – aus der Zeit als Werbeabteilung des Malerbetriebs.\n\n[[seite:Archiv.html|Zum Projektarchiv]]' },
  { keys: ['bewertung','bewertungen','rezension','rezensionen','=sterne','kundenmeinungen'],
    a: 'Bewertungen unserer Kunden finden Sie bei Google – der Link „Alle Bewertungen auf Google ansehen" steht auf unserer Startseite. Über eine Bewertung nach Ihrem Projekt freuen wir uns sehr.' },

  // ── Leistungen ──
  { keys: ['fahrzeug','fahrzeuge','fahrzeugbeschriftung','=auto','=autos','=pkw','=lkw','transporter','firmenwagen','flotte','fuhrpark','anhänger','auflieger','=bus','=taxi','stapler','bagger','=beschriftung','=beschriften','=bekleben','teilfolierung','magnetschild','magnetschilder','autoaufkleber','autofolie','ordnungsnummer','ordnungsnummern','autowerbung','kfz'],
    a: 'Wir beschriften Fahrzeuge aller Art – vom einzelnen PKW über Transporter und LKW bis zu Anhängern, Aufliegern, Baumaschinen und kompletten Flotten, dazu Magnetschilder und Autoaufkleber. Eine Vollfolierung bieten wir nicht an, **Teilfolierungen** sind nach Absprache möglich. Ihre Anfrage stellen Sie am schnellsten im Online-Konfigurator.\n\n[[seite:beschriftungen.html|Zur Beschriftungen-Seite]]' },
  { keys: ['leasing','leasingfahrzeug','leasingauto','mietfahrzeug','mietwagen','rückstandsfrei','rückstände','beschriftung entfernen','folie entfernen','=entfernen','=ablösen','vertragsende'],
    a: 'Bei fachgerechter Anbringung und hochwertigen Folien lässt sich eine Beschriftung in der Regel **rückstandsfrei entfernen** – wichtig etwa für Leasing- und Mietfahrzeuge. Die Entfernung übernehmen wir auf Wunsch; für nur zeitweise Beschriftung eignen sich Magnetschilder.\n\n[[seite:beschriftungen.html|Zur Beschriftungen-Seite]]' },
  { keys: ['pflege','waschen','waschanlage','in die waschanlage','in der waschanlage','hochdruck','hochdruckreiniger','reinigen','reinigung'],
    a: 'Bei fachgerechter Anbringung ist eine Fahrzeugbeschriftung **jahrelang beständig**. Handwäsche statt Hochdruck auf die Kanten schont die Folie und verlängert die Lebensdauer.\n\n[[seite:beschriftungen.html|Zur Beschriftungen-Seite]]' },
  { keys: ['boot','boote','bootsbeschriftung','jetski','flugzeug','flugzeuge','leichtflugzeug','bootsnummer','bootskennzeichen'],
    a: 'Ja – wir beschriften **Boote und Jetski** (einschließlich der amtlichen Kennzeichen) sowie **Klein- und Leichtflugzeuge**, mit Folien, die UV-Strahlung, Wasser und Fahrtwind dauerhaft standhalten.\n\n[[seite:beschriftungen.html|Zur Beschriftungen-Seite]]' },
  { keys: ['maschine','maschinen','maschinenbeschriftung','industrie','industriebeschriftung','industrieanlage','industrieanlagen','=anlage','=anlagen','=tank','hallenbeschriftung','=halle','=hallen','landwirtschaft'],
    a: 'Ja, wir beschriften auch **Maschinen, Industrieanlagen und Hallen** – auch großflächig, zum Beispiel Maschinenköpfe. Die begleitende Kennzeichnung nach DIN EN ISO 7010 übernehmen wir ebenfalls.\n\n[[seite:cpc-germania.html|Referenz CPC Germania]]' },
  { keys: ['schild','schilder','praxisschild','firmenschild','türschild','klingelschild','namensschild','bauschild','werbeschild','werbetafel','hinweisschild','parkplatzschild','wegweiser','alu dibond','dibond','forex','türbeschriftung','türbeschriftungen','=praxis','=kanzlei','=tafel'],
    a: 'Wir fertigen Firmen-, Tür-, Praxis-, Bau- und Werbeschilder, Wegweiser, Parkplatz- und Hinweisschilder – meist aus Alu-Dibond oder Forex, auch aus **Acrylglas**, bedruckt oder mit Folie beschriftet. Auf Wunsch montieren wir vor Ort.\n\n[[seite:schilder.html|Zur Schilder-Seite]]' },
  { keys: ['acryl','acrylglas','plexiglas','plexi','abstandshalter','glasschild'],
    a: 'Ja, **Acrylglas- und Plexiglasschilder** fertigen wir – auch in Stärken über 4 mm und auf Wunsch mit Abstandshaltern für die Wandmontage.\n\n[[seite:schilder.html|Zur Schilder-Seite]]' },
  { keys: ['flucht','fluchtplan','fluchtpläne','rettungsplan','rettungspläne','fluchtweg','fluchtwege','rettungsweg','sicherheitskennzeichnung','pflichtkennzeichnung','iso 7010','7010','asr a2 3','=asr','arbeitsstätten','notausgang','brandschutz','brandschutzzeichen','feuerlöscher','verbotszeichen','gebotszeichen','warnzeichen','betriebsanweisung','maschinenkennzeichnung','=psa','rauchverbot','rohrleitung','rohrleitungen','rohrleitungskennzeichnung','din 2403','2403','fließrichtung','bodenmarkierung','bodenmarkierungen','treppenmarkierung','stufenkante','raumnummer','raumnummern','türnummer','türnummern','berufsgenossenschaft'],
    a: '**Flucht- und Rettungspläne nach ASR A2.3** und **Sicherheitskennzeichnung nach DIN EN ISO 7010** gehören zu unserem Angebot – zum Beispiel als A3-Plan auf 3 mm Alu-Dibond oder als Digitaldruckaufkleber, auf Wunsch mit Montage. Dazu Rohrleitungskennzeichnung nach DIN 2403, Boden- und Treppenmarkierungen, Raumnummern, Betriebsanweisungen und Maschinenkennzeichnung. Die brandschutzrechtliche Prüfung und Abnahme selbst gehört nicht dazu.\n\n[[seite:schilder.html|Zur Sicherheitskennzeichnung]]' },
  { keys: ['digitaldruck','=druck','=drucken','großformat','grossformat','poster','plattendruck','uv druck','uv direktdruck','direktdruck','=holz','=metall','aufkleber','sticker','etiketten','etikett','bodenaufkleber','klebebuchstaben','schriftzug','versandaufkleber','versandetiketten'],
    a: 'Im Digitaldruck fertigen wir Großformatdrucke auf Folie, Alu-Dibond, Forex und Papier, **UV-Direktdruck** auf feste Materialien wie Holz, Acryl und Metall sowie Aufkleber und Etiketten in jeder Form, Bodenaufkleber und Klebeschriftzüge – für drinnen und draußen, vom Einzelstück bis zur Serie.\n\n[[seite:druck.html|Zum Digitaldruck]]' },
  { keys: ['visitenkarte','visitenkarten','flyer','flyers','briefpapier','stempel','broschüre','broschüren','prospekt','prospekte','blöcke','=block','einladung','einladungen','gutschein','gutscheine','geschäftsausstattung','drucksachen'],
    a: '**Visitenkarten, Flyer, Briefpapier, Stempel, Broschüren, Blöcke, Einladungen und Gutscheine** gehören zu unserem Druckangebot – gern gestalten wir sie auch für Sie.\n\n[[seite:druck.html|Zum Digitaldruck]]' },
  { keys: ['folie','folien','folientechnik','fenster','fensterfolie','=glas','glastür','milchglas','milchglasfolie','sichtschutz','sichtschutzfolie','spiegelfolie','sonnenschutz','sonnenschutzfolie','hitzeschutz','splitterschutz','sicherheitsfolie','dekorfolie','magnetfolie','folienplott','=plott','whiteboard','tafelfolie','anti graffiti','graffiti','schaufenster','schaufensterbeschriftung','glasbeschriftung','glastürbeschriftung','eingangstür','selbst anbringen','selbst aufkleben','selbst kleben','selber kleben','selber anbringen','selbstanbringung','möbel','möbelfolie'],
    a: 'In der Folientechnik bieten wir Sichtschutz-, Milchglas- und Spiegelfolien, Sonnenschutz-, Splitterschutz- und Dekorfolien, Schaufensterbeschriftung, Magnetfolien, Anti-Graffiti- und Whiteboardfolien – für Glas, Fenster und Möbel. **Folienplott** liefern wir auch zur Selbstanbringung; bei großen Flächen, Schaufenstern und Glastüren empfehlen wir unsere Montage.\n\n[[seite:folientechnik.html|Zur Folientechnik]]' },
  { keys: ['textil','textilien','textildruck','shirt','shirts','t shirt','t shirts','tshirt','tshirts','=polo','poloshirt','hoodie','hoodies','pullover','trikot','trikots','workwear','arbeitskleidung','berufskleidung','bekleidung','kleidung','warnweste','warnschutz','schürze','schürzen','=cap','=caps','mütze','mützen','=flock','flockdruck','=flex','flexdruck','sublimation','sublimationsdruck','vereinsshirt','vereinsshirts','=jacke','=jacken','arbeitsjacke','arbeitsjacken','caps bedrucken','shirts bedrucken'],
    a: 'Im Textildruck veredeln wir Arbeitskleidung, Warnschutz, T-Shirts, Poloshirts, Hoodies, Trikots, Schürzen, Caps und Taschen mit **Flex-, Flock- und Sublimationsdruck** – ab dem Einzelstück. Stickerei und Siebdruck bieten wir nicht an.\n\n[[seite:textildruck-flex-und-flock.html|Zum Textildruck]]' },
  { keys: ['fahne','fahnen','flagge','flaggen','hissfahne','beachflag','beachflags','auslegerfahne','dropflag','werbefahne','=mast','roll up','roll ups','rollup','rollups','faltdisplay','messewand','pop up','popup','spannrahmen','textilbild','display'],
    a: 'Wir fertigen Hissfahnen, Beachflags, Auslegerfahnen und Dropflags – witterungsbeständig und auf Wunsch mit passenden Masten, Gestellen und Bodenplatten – sowie **Roll-Ups (für Innenräume), Faltdisplays und Pop-Up-Messewände**, alles im Digitaldruck.\n\n[[seite:fahnen.html|Zu Fahnen & Displays]]' },
  { keys: ['aufsteller','kundenstopper','a aufsteller','gehwegaufsteller','tischaufsteller','thekenaufsteller','=pylon','pylone','pylonen','=stele','stelen','messetheke','promotion theke','werbeturm'],
    a: 'Aufsteller und Kundenstopper (für draußen mit befüllbarem Fuß), Theken- und Tischaufsteller, Werbe- und Info-Pylonen, Stelen, Messetheken und Werbetürme – auf Wunsch beidseitig bedruckt. Bei Klapp- und Spannrahmen tauschen Sie das Motiv später selbst.\n\n[[seite:aufsteller-pylonen.html|Zu Aufsteller & Pylonen]]' },
  { keys: ['banner','werbebanner','=plane','=planen','werbeplane','=pvc','=mesh','gerüstplane','gerüstplanen','gerüst','bauzaun','bauzaunbanner','zipperbanner','fassadenbanner','ösen','hohlsaum','banner drucken','banner druck','hohlkammer banner','spannband'],
    a: 'Wir drucken **Werbebanner, Planen und Gerüstplanen** nach Maß – auch Bauzaunbanner, Fassadenbanner und Zipperbanner, aus PVC oder winddurchlässigem Mesh, konfektioniert mit Saum, Ösen, Hohlsaum oder Klettband.\n\n[[seite:planen-banner.html|Zu Banner & Planen]]' },
  { keys: ['plakat','plakate','plakatwerbung','laterne','laternen','laternenplakat','laternenplakate','plakatieren','plakatierung','sondernutzung','veranstaltungsplakat','hohlkammer','hohlkammerplatte','plakate drucken','plakat drucken','wie viele plakate','anzahl plakate','plakate aufhängen','plakatkampagne','plakate fuer','genehmigung'],
    a: 'Plakate drucken wir in jeder Größe im Digitaldruck. Für Veranstaltungen übernehmen wir außerdem die **komplette Plakatwerbung an Laternen**: Verteilung nach Einwohnerzahl, Route, Sondernutzungsanträge (bzw. Buchung beim Werbevermarkter), Gestaltung, Druck, Anbringung nach den Auflagen und Abbau. Plakatwerbung fragen Sie direkt über das Kontaktformular oder telefonisch an.\n\n[[seite:plakatwerbung.html|Zur Plakatwerbung]]' },
  { keys: ['fassade','fassaden','fassadenbeschriftung','fassadenwerbung','=wand','hauswand','giebel','gebäude','wandbeschriftung','wandbeschriftungen','rolltor','toranlage','bautafel','bemalen','bemalt','aufmalen','=malen','wandmalerei','werbeanlage','genehmigung'],
    a: 'Unsere Fassadenbeschriftungen werden **traditionell mit hochwertiger Dispersionsfarbe** direkt auf die Wand aufgetragen – ohne Folien, dauerhaft und wetterbeständig. Ob eine Genehmigung nötig ist, hängt von Größe, Ort und Gebäude ab – das klären Sie am besten früh mit Ihrer Kommune. Dazu kommen Bau- und Außenwerbung wie Bautafeln, Bauzaunbanner und Rolltor-Beschriftung.\n\n[[seite:fassaden.html|Zur Fassaden-Seite]]' },
  { keys: ['werbeartikel','werbemittel','give away','giveaway','giveaways','kugelschreiber','=kuli','tasse','tassen','becher','trinkflasche','schlüsselanhänger','schlüsselband','lanyard','usb stick','usb sticks','usbstick','feuerzeug','zollstock','pokal','pokale','armband','armbänder','regenschirm','jutebeutel','kalender','süßwaren','=button','buttons','merchandise','streuartikel','leinwandtasche','leinwandtaschen','stofftasche','stoffbeutel'],
    a: 'Wir bedrucken **Werbeartikel** mit Ihrem Logo: Kugelschreiber, Tassen und Trinkflaschen, Schlüsselanhänger und Lanyards, USB-Sticks, Zollstöcke, Pokale, Promotionsarmbänder, Regenschirme, Jutebeutel, Kalender und mehr. Nennen Sie uns Wunschartikel und Stückzahl für ein Angebot.\n\n[[seite:werbeartikel.html|Zu den Werbeartikeln]]' },
  { keys: ['=web','website','websites','webseite','webseiten','homepage','internetseite','internet','webdesign','webentwicklung','landingpage','=seo','seo optimierung','suchmaschinenoptimierung','suchmaschine','bei google gefunden','google ranking','=google','hosting','domain','dsgvo'],
    a: 'Wir erstellen **Unternehmenswebsites und Landingpages** – responsiv, SEO-optimiert und auf Ihre Marke abgestimmt, auf Wunsch mit Pflege und Beratung zu Domain, Hosting und DSGVO. Onlineshops und Apps bieten wir nicht an.\n\n[[seite:webdesign.html|Zur Webentwicklung]]' },
  { keys: ['gestaltung','gestalten','=design','entwurf','druckdaten','=datei','dateien','vektor','=pdf','=logo','grafik','layout','auflösung'],
    a: 'Sie können fertige Druckdaten liefern – am besten als **PDF oder Vektordatei**, Schriften eingebettet oder in Pfade umgewandelt – oder wir übernehmen die Gestaltung komplett, vom Entwurf über Ihre Freigabe bis zum fertigen Produkt. Liegt Ihr Logo nur als Bild vor, zeichnen wir es nach.' },
  { keys: ['montage','montieren','anbringen','anbringung','aufkleben','vor ort','verkleben','installation','aufmaß','aufmass'],
    a: 'Auf Wunsch übernehmen wir die fachgerechte **Montage vor Ort** – von der Beschriftung bis zum Schild, bei Bedarf mit Aufmaß vorab. Termin und Ablauf stimmen wir mit Ihnen ab.' },
  { keys: ['lieferung','versand','liefern','abholen','abholung','zusenden','verschicken'],
    a: 'Je nach Auftrag liefern bzw. versenden wir, montieren vor Ort, oder Sie holen bei uns in Stendal ab. Die Details klären wir kurz mit Ihnen.' },
  { keys: ['zahlung','bezahlen','zahlen','zahlungsart','zahlungsarten','anzahlung','vorkasse','paypal','überweisung','rechnung','bar'],
    a: 'Fragen Sie dazu einfach an: ' + TEL + ' oder ' + MAIL + '.' },
  { keys: ['garantie','reklamation','mangel','beschwerde','umtausch','gewährleistung','haltbarkeit','wie lange hält','hält die','=halten','wetterfest','uv beständig'],
    a: 'Wir verwenden hochwertige, UV- und witterungsbeständige Materialien, damit Farben und Konturen über Jahre erhalten bleiben. Welcher Aufbau für draußen sinnvoll ist, hängt von Standort, Sonneneinstrahlung und gewünschter Standzeit ab – das klären wir vor dem Angebot. Bei Reklamationen melden Sie sich bitte direkt bei uns.' },
  { keys: ['auflage','stückzahl','=menge','mindestbestellung','mindestmenge','wie viele stück','ab wie viel','ab wie vielen','mindestens bestellen','einzelstück','=einzeln'],
    a: 'Wir fertigen vom **Einzelstück bis zur größeren Serie**. Bei manchen Werbeartikeln gelten Staffelmengen des Herstellers – nennen Sie uns Ihre Stückzahl, dann erstellen wir Ihnen ein passendes Angebot.' },
  { keys: ['=privat','privatperson','privatkunde','auch für','vereine','=verein'],
    a: 'Wir arbeiten für Betriebe und Organisationen ebenso wie für Vereine und Privatpersonen. Erzählen Sie uns gern von Ihrem Vorhaben.' },
  { keys: ['=hallo','=hi','=hey','guten tag','guten morgen','=moin','=servus'],
    a: 'Hallo und willkommen bei PrintLine Werbetechnik! 👋 Ich helfe Ihnen gern weiter – fragen Sie mich z. B. zu unseren Leistungen, zur Fahrzeugbeschriftung oder fordern Sie ein kostenloses Angebot an.' },
  { keys: ['=danke','vielen dank','=super','=prima','=perfekt','dankeschön'],
    a: 'Sehr gern! Wenn Sie ein konkretes Anliegen haben, erreichen Sie uns unter ' + TEL + ' oder ' + MAIL + '. Wir freuen uns auf Ihr Projekt.' },
];

// Text vereinheitlichen: Kleinbuchstaben, Umlaut-/ß-Varianten, Satzzeichen weg.
function faqNorm(s) {
  return String(s || '').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
function faqKey(k) { return k.charAt(0) === '=' ? { w: faqNorm(k.slice(1)), exakt: true } : { w: faqNorm(k), exakt: false }; }
function faqUniq(list) { const s = {}; return list.filter(function (k) { const id = k.w + (k.exakt ? '=' : ''); if (s[id]) return false; s[id] = 1; return true; }); }
const FAQ_KEYS = FAQ.map(function (item) { return faqUniq(item.keys.map(faqKey)); });
const FAQ_ALLG = FAQ.map(function (item) { return (item.allg || []).map(faqKey); });
const PREIS_IDX = FAQ.findIndex(function (item) { return item.keys.indexOf('preis') >= 0; });

// Passt ein Stichwort? Wortfolgen als Ganzes, Einzelwörter als ganzes Wort oder (ab 5 Zeichen) als Wortanfang/-ende.
function faqTrifft(key, text, tokens) {
  const k = key.w;
  if (!k) return false;
  if (k.indexOf(' ') >= 0) return (' ' + text + ' ').indexOf(' ' + k + ' ') >= 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === k) return true;
    if (!key.exakt && k.length >= 5 && t.length > k.length && (t.indexOf(k) === 0 || t.slice(-k.length) === k)) return true;
  }
  return false;
}

// Punkte eines Themas: jedes Wort der Frage zählt nur einmal (bestes Stichwort), damit sich Synonyme
// desselben Worts nicht aufsummieren; eine getroffene Wortfolge ersetzt die Einzelwörter darin.
function faqWertung(idx, text, tokens) {
  const item = FAQ[idx];
  const proWort = tokens.map(function () { return 0; });
  const inFolge = tokens.map(function () { return false; });
  let folgen = 0, treffer = 0;
  function pruefe(k, gewicht) {
    if (!k.w) return;
    if (k.w.indexOf(' ') >= 0) {
      const teile = k.w.split(' ');
      for (let i = 0; i + teile.length <= tokens.length; i++) {
        let ok = true;
        for (let j = 0; j < teile.length; j++) if (tokens[i + j] !== teile[j]) { ok = false; break; }
        if (ok) { folgen += gewicht(k); treffer++; for (let j = 0; j < teile.length; j++) inFolge[i + j] = true; return; }
      }
      return;
    }
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t === k.w || (!k.exakt && k.w.length >= 5 && t.length > k.w.length && (t.indexOf(k.w) === 0 || t.slice(-k.w.length) === k.w))) {
        if (gewicht(k) > proWort[i]) { if (!proWort[i]) treffer++; proWort[i] = gewicht(k); }
      }
    }
  }
  FAQ_KEYS[idx].forEach(function (k) { pruefe(k, function (x) { return x.w.length; }); });
  FAQ_ALLG[idx].forEach(function (k) { pruefe(k, function () { return 1; }); });
  let punkte = folgen;
  proWort.forEach(function (p, i) { if (!inFolge[i]) punkte += p; });
  if (item.combo) {
    const a = item.combo[0].map(faqNorm), b = faqNorm(item.combo[1]);
    const hatA = tokens.some(function (t) { return a.indexOf(t) >= 0; });
    const hatB = tokens.some(function (t) { return t.indexOf(b) === 0; });
    const ohne = (item.combo[2] || []).every(function (x) { return tokens.indexOf(x) < 0; });   // nicht bei Glas, Fenster, Möbel …
    if (hatA && hatB && ohne) { punkte += 20; treffer++; }
  }
  return { punkte: punkte, treffer: treffer };
}

function faqAntwort(frage) {
  const text = faqNorm(frage);
  const tokens = text ? text.split(' ') : [];
  let best = null, bestW = { punkte: 0, treffer: 0 }, bestNeg = null, bestNegW = { punkte: 0, treffer: 0 };
  FAQ.forEach(function (item, idx) {
    const w = faqWertung(idx, text, tokens);
    if (!w.punkte) return;
    const besser = function (a, b) { return a.punkte > b.punkte || (a.punkte === b.punkte && a.treffer > b.treffer); };
    if (item.neg) { if (besser(w, bestNegW)) { bestNeg = item; bestNegW = w; } }
    else if (besser(w, bestW)) { best = item; bestW = w; }
  });
  // Nicht-Angebotenes (bzw. „persönlich klären") gewinnt, wenn es mindestens so stark ist wie das beste positive Thema.
  if (bestNeg && bestNegW.punkte * (bestNeg.negFaktor || 2) >= bestW.punkte) return bestNeg.a;
  if (best) {
    // Preisfrage zu einer konkreten Leistung („Was kostet ein Firmenschild?") → Angebotshinweis ergänzen
    const fragtPreis = FAQ_KEYS[PREIS_IDX].some(function (k) { return faqTrifft(k, text, tokens); });
    if (fragtPreis && best !== FAQ[PREIS_IDX]) {
      const hinweis = 'Die Kosten hängen von Material, Format und Aufwand ab – gern erstellen wir Ihnen ein **kostenloses, unverbindliches Angebot**.';
      const i = best.a.indexOf('\n\n[[seite:');
      return i >= 0 ? best.a.slice(0, i) + ' ' + hinweis + best.a.slice(i) : best.a + ' ' + hinweis;
    }
    return best.a;
  }
  return 'Das beantworte ich Ihnen gern persönlich. Rufen Sie uns an unter ' + TEL + ' oder schreiben Sie an ' + MAIL + ' – wir melden uns innerhalb eines Werktages. Sie können mich auch zu unseren Leistungen wie Beschriftungen, Digitaldruck, Schildern, Folientechnik oder Plakatwerbung fragen.\n\n[[seite:leistungen.html|Alle Leistungen ansehen]]';
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

/* ── Anthropic-Aufruf (mit Prompt-Caching, wie chat.js) ───── */
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
      // Systemprompt zwischenspeichern (Prompt-Caching) – spart bei Folgefragen den Großteil der Eingabekosten.
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
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
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://formspree.io https://printline-chat-api.vercel.app https://konfigurator.werbung-kroner.de",
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
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal -- direkt darunter durch startsWith(ROOT + path.sep)-Containment-Check abgesichert (FP)
  const safe = path.normalize(path.join(ROOT, urlPath));
  // Pfad-Traversal: nur Pfade GENAU unter ROOT erlauben (Trailing-Separator gegen Geschwister-Ordner-Bypass)
  if (safe !== ROOT && !safe.startsWith(ROOT + path.sep)) { res.statusCode = 403; return res.end('Forbidden'); }
  // Internen Datenordner (Logs) nicht ausliefern
  const dataDir = path.join(ROOT, 'data');
  if (safe === dataDir || safe.startsWith(dataDir + path.sep)) { res.statusCode = 403; return res.end('Forbidden'); }

  fs.stat(safe, (err, stat) => {
    let file = safe;
    if (err || stat.isDirectory()) {
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal -- `safe` ist bereits ROOT-validiert, 'index.html' ist konstant (FP)
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
// nosemgrep: problem-based-packs.insecure-transport.js-node.using-http-server.using-http-server -- lokaler Backend-/Proxy-Server; TLS terminiert der Host, öffentliche Seite läuft über GitHub Pages/HTTPS (FP)
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
