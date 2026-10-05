/* PrintLine – Leistungssuche (Autocomplete auf der Startseite)
   Intelligente Suche: versteht Tippfehler, Einzahl/Mehrzahl, Schreibvarianten (ä/ae, ß/ss, Bindestrich,
   Leerzeichen), mehrere Wörter in beliebiger Reihenfolge, zusammengesetzte Wörter und Umgangssprache.
   Die besten Treffer stehen oben. Leistungen, die PrintLine bewusst NICHT anbietet, werden ehrlich
   benannt – mit passender Alternative.
   Design: macOS-Menü, folgt dem Hell/Dunkel-Schalter der Website ([data-theme]). */
(function () {
  "use strict";

  // ── Synonyme je Leistung (Umgangssprache, Fachbegriffe, Varianten) ──────────────────────────
  var SYN = {
    // Schilder
    "Firmenschild / Eingangsschild": ["firmenschild","eingangsschild","logoschild","schild firma","firmentafel","unternehmensschild","geschäftsschild","ladenschild","eingangstafel","schild am eingang","schild hauswand","außenschild","sign","signs"],
    "Türschild / Namensschild / Klingelschild": ["türschild","namensschild","klingelschild","büroschild","namenschild","briefkastenschild","zimmerschild","bürotürschild","schild tür"],
    "Werbeschild / Werbetafel": ["werbeschild","werbetafel","reklameschild","reklame","reklametafel","werbefläche","schild werbung"],
    "Acrylglas-/Plexiglas-Schild (mit Abstandshaltern)": ["acrylglas","plexiglas","acrylschild","acryl","plexi","glasschild","plexiglasschild","acrylglasschild","abstandshalter","edelstahlhalter","schild mit abstand","glasoptik"],
    "Parkplatz- & Verbotsschild (amtlich & nicht amtlich)": ["parkplatzschild","verbotsschild","parkverbot","halteverbot","parkschild","privatparkplatz","abschleppen","parken verboten","einfahrt freihalten"],
    "Türaufkleber / Öffnungszeitenschild": ["öffnungszeiten aufkleber","türaufkleber","öffnungszeitenschild","geschäftszeiten schild","sprechzeiten","tür beschriften","tür bekleben"],
    "Namensschilder / Türschildsysteme (wechselbar)": ["wechselschild","türschildsystem","wechselbar","einschubschild","namensschild wechselbar","büroschilder system"],
    "Bauschilder": ["bauschild","bautafel","baustellenschild","bauherrenschild","bauvorhaben"],
    "Werbe- & Informationstafeln": ["infotafel","informationstafel","hinweistafel","schautafel","lehrtafel","infoschild","informationsschild","hinweisschild"],
    "Übersichtstafeln / Etagenschilder": ["übersichtstafel","etagenschild","etagenplan","stockwerk","firmenübersicht","mieterschild","mietertafel"],
    "Praxisschilder / Kanzleischilder": ["praxisschild","arztschild","kanzleischild","praxis","arztpraxis","anwalt","notar","physiotherapie","zahnarzt","steuerberater","kanzlei","arzt"],
    "Immobilien-/Verkaufsschilder": ["immobilienschild","maklerschild","verkaufsschild","zu verkaufen","zu vermieten","makler","immobilie","vermietung","grundstück"],
    "Parkplatzschilder": ["parkplatz","stellplatz","reserviert","parkplatznummer","kundenparkplatz","besucherparkplatz"],
    "Wegeleitsysteme / Orientierung": ["wegweiser","leitsystem","orientierung","wegeleitung","beschilderung wege","richtungsschild","pfeilschild","ausschilderung"],
    // Fahrzeug
    "Fahrzeugbeschriftung (Teilbeschriftung)": ["auto beschriften","autowerbung","autobeschriftung","kfz beschriftung","fahrzeugwerbung","wagen bekleben","auto bekleben","fahrzeug bekleben","werbung am auto","autoschrift","autofolie","teilfolierung","teilbeschriftung","firmenauto beschriften","beschriftung auto","auto logo","pkw","pkw beschriftung"],
    "Magnetschilder fürs Fahrzeug": ["magnetschild","magnetfolie auto","magnetbeschriftung","magnet auto","magnetschild auto","abnehmbare werbung","autotür magnet","magnetwerbung"],
    "Nutzfahrzeug- & Transporterbeschriftung": ["transporter beschriften","lkw beschriften","firmenwagen","lieferwagen","sprinter beschriften","nutzfahrzeug","transporter","kastenwagen","lieferfahrzeug","handwerkerauto","caddy","transit","vito","crafter","ducato"],
    "Anhänger- & Aufliegerbeschriftung": ["anhänger beschriften","auflieger","hänger bekleben","anhänger","trailer","sattelauflieger","kofferaufbau"],
    "Baumaschinen- & Staplerbeschriftung": ["bagger beschriften","stapler","baumaschine","gabelstapler","radlader","kran","hubsteiger","bagger"],
    "Contour-Cut-Logos / Autoaufkleber": ["autoaufkleber","aufkleber auto","logo aufkleber","sticker auto","konturschnitt","kontur","contour cut","logo ausgeschnitten","konturgeschnitten"],
    "Heckbeschriftung / Dachbeschriftung": ["heckscheibe","heckfolie","heck beschriften","dachwerbung","heckscheibenwerbung","heckklappe","dach beschriften"],
    "Konturschnitt-Kennzeichnung / Ordnungsnummern am Fahrzeug": ["ordnungsnummer","fahrzeugnummer","kennzeichnung fahrzeug","flottennummer","wagennummer","fahrzeugkennung","kennnummer"],
    "Bootsnummern": ["bootsnummer","bootskennzeichen","kennzeichen boot","bootsname","boot beschriften","sportboot"],
    "Firmen- & Vertreterwagen": ["vertreterwagen","dienstwagen","außendienst","firmenwagen beschriften","geschäftswagen","dienstfahrzeug"],
    "Lieferdienste / Pflegedienste": ["lieferdienst","pflegedienst","pizzadienst","kurierdienst","sozialstation","ambulanter dienst","essen auf rädern"],
    "Fahrschulwagen": ["fahrschule","fahrschulauto","fahrlehrer","fahrschulbeschriftung"],
    "Transporter / LKW / LKW-Auflieger": ["lkw","lastwagen","laster","sattelzug","zugmaschine","flotte","fuhrpark","spedition","flottenbeschriftung"],
    "Pickup & Pritschenwagen": ["pickup","pick up","pritsche","pritschenwagen","kipper"],
    "Linien- & Reisebusse / Taxen": ["bus","reisebus","linienbus","taxi","taxen","busbeschriftung","taxibeschriftung","busunternehmen"],
    "Straßenbahnen / Züge": ["straßenbahn","tram","zug","bahn","waggon","triebwagen"],
    "Bau- & Landmaschinen": ["landmaschine","traktor","trecker","mähdrescher","landwirtschaft","agrar"],
    "Anhänger & Verkaufsfahrzeuge": ["verkaufswagen","foodtruck","food truck","imbisswagen","verkaufsanhänger","imbiss","marktstand","eiswagen","kaffeemobil"],
    "Boote / Jetski / Leichtflugzeuge": ["boot","jetski","flugzeug","leichtflugzeug","segelflugzeug","motorboot","yacht","schiff","ultraleicht"],
    // Folien
    "Schaufensterbeschriftung": ["schaufenster bekleben","fensterbeschriftung","schaufensterwerbung","fenster folie","schaufenster folie","fensterwerbung","ladenfenster","fensterschrift","glasbeschriftung","scheibenbeschriftung","fenster beschriften","schaufensterdeko","werbefolie","werbefolien","window"],
    "Glasdekorfolie / Milchglasfolie": ["milchglasfolie","milchglas","glasfolie","dekorfolie","glasdekor","satiniert","sandstrahloptik","streifenfolie","glastür folie","bürotür glas","designfolie","dekorfolien"],
    "Sichtschutzfolie": ["blickschutz","sichtschutz","sichtschutzfolie","blickdicht","einsehbar","durchsicht","privatsphäre","spiegelfolie","spionfolie","büro","schauen","reinschauen","einblick","reinsehen","gucken","blicke"],
    "Sonnenschutz- / Hitzeschutzfolie": ["sonnenschutz","hitzeschutz","tönungsfolie","sonnenschutzfolie","verdunkelung","hitze","uv schutz","wärmeschutz","blendschutz","sonne fenster","büro","wintergarten"],
    "Splitter- / Sicherheitsfolie": ["sicherheitsfolie","splitterschutz","einbruchschutzfolie","splitterschutzfolie","glasbruch","einbruchschutz"],
    "Magnetfolie": ["magnetfolie","magnetschild","magnet","magnettafel","magnetisch"],
    "Folienplott zur Selbstanbringung": ["plott","folienplot","plotten","klebebuchstaben","folienbuchstaben zum aufkleben","selbst kleben","selbst anbringen","plotterfolie","schriftzug zum aufkleben","vinyl"],
    "Bodenaufkleber / Floor-Graphics": ["bodenaufkleber","floor graphics","bodenfolie","fußbodenaufkleber","boden sticker","bodenwerbung","abstandsmarkierung","fußboden"],
    "Anti-Graffiti-Folie": ["graffitischutz","antigraffiti","graffiti schutz","graffiti","schmiererei","vandalismus"],
    "Tafel- / Whiteboardfolie": ["whiteboardfolie","tafelfolie","beschreibbare folie","whiteboard","kreidetafel","abwischbar"],
    "Adhäsionsfolie (statische Haftfolie)": ["adhäsionsfolie","haftfolie","statische folie","ohne kleber","rückstandslos","wiederablösbar"],
    // Druck
    "Großformatdruck auf Folie": ["großformatdruck","grossformat","foliendruck","xxl druck","großformat","digitaldruck","großdruck","plotterdruck","print","printing","digitalprint"],
    "Plattendruck (Dibond, Forex, Hartschaum)": ["dibond","alu dibond","forex","hartschaum","plattendruck","verbundplatte","aludibond","alu verbund","aluschild","pvc platte"],
    "Posterdruck / Papierdruck (Großformat)": ["poster","plakatdruck","papierdruck","posterdruck","plakat drucken","a0","a1","a2","fotodruck"],
    "PVC-Banner / Werbeplanen": ["banner","werbebanner","plane","werbeplane","plakatplane","planen","spannband","pvc banner","transparent","mesh","meshbanner","zaunbanner","zipperbanner","zipper","fassadenbanner","ösen","hohlsaum","saum","konfektionierung","promotionbanner","werbe banner"],
    "Aufkleber & Etiketten (Konturschnitt)": ["aufkleber","sticker","etiketten","klebeschild","label","klebeetikett","produktaufkleber","logoaufkleber","sticker drucken"],
    "Klebefolien-Buchstaben / Schriftzüge": ["schriftzug","klebebuchstaben","folienbuchstaben","einzelbuchstaben folie","folienschrift","buchstaben folie","wandschrift","wandtattoo","schrift aufkleben"],
    "Maschinen- & Gerätebeschriftung": ["maschinenbeschriftung","gerätebeschriftung","industriebeschriftung","maschine","maschinen","gerät","geräte","maschinen beschriften","industrie"],
    "UV-Direktdruck auf feste Materialien (Holz, Acryl, Metall)": ["uv druck","uvdruck","direktdruck","druck auf holz","druck auf metall","druck auf acryl","holz bedrucken","metall bedrucken","acryl bedrucken","holzschild","metallschild"],
    // Textil
    "T-Shirt-Druck (Flex/Flock)": ["tshirt","t shirt","t-shirt bedrucken","shirt bedrucken","textildruck","flexdruck","flockdruck","shirt druck","flex","flock","shirts","poloshirt","polo","textil bedrucken","kleidung bedrucken","vereinsshirt","kleinauflage","großauflage"],
    "Hoodie- / Sweatshirt-Druck": ["hoodie","pullover bedrucken","sweatshirt","pulli bedrucken","pulli","pullover","kapuzenpulli","sweater","kapuzenpullover"],
    "Schürzen": ["schürze","kochschürze","schürzen bedrucken","latzschürze","grillschürze","gastro schürze"],
    "Arbeits- & Berufskleidung veredeln": ["arbeitskleidung","berufskleidung","workwear","firmenkleidung bedrucken","arbeitsbekleidung","arbeitshose","latzhose","arbeitsjacke","firmenkleidung","dienstkleidung","handwerkerkleidung","jacke"],
    "Warnschutz- / Sicherheitskleidung mit Logo": ["warnweste","warnschutz","sicherheitskleidung","warnkleidung","warnschutzkleidung","warnjacke","weste"],
    "Sublimationsdruck (Polyester / Trikots)": ["sublimation","trikot bedrucken","trikotdruck","polyester druck","sportbekleidung","trikot","trikots","fußballtrikot","vereinstrikot","sportshirt","teamwear","mannschaft"],
    "Caps & Mützen bedrucken": ["cap","mütze","basecap","kappe bedrucken","mützen","kappe","baseballcap","schirmmütze","beanie"],
    "Taschen & Beutel bedrucken": ["tasche bedrucken","beutel","jutebeutel","stoffbeutel","baumwolltasche","tasche","taschen","turnbeutel","einkaufstasche"],
    "Handtücher / Textilien bedrucken": ["handtuch","handtücher bedrucken","badetuch","duschtuch","saunatuch","accessoires","textilien"],
    // Werbeartikel
    "Kugelschreiber mit Logo": ["kugelschreiber","kuli","stifte bedruckt","werbestifte","werbekugelschreiber","stift","stifte","kulis","schreibgerät","schreibwaren","pen","pens"],
    "Tassen & Becher bedrucken": ["tasse bedrucken","kaffeebecher","becher","tassen","tasse","kaffeetasse","fototasse","mug","cup"],
    "Feuerzeuge / Schlüsselanhänger": ["feuerzeug","schlüsselanhänger","anhänger schlüssel","feuerzeuge"],
    "USB-Sticks / Powerbanks": ["usb stick","powerbank","usb","speicherstick","usbstick","akku"],
    "Notizblöcke / Schreibunterlagen": ["notizblock","schreibunterlage","schreibtischunterlage","notizzettel","merkzettel"],
    "Trinkflaschen / Thermosbecher": ["trinkflasche","thermobecher","thermosbecher","flasche bedruckt","flasche","thermoflasche","isolierflasche"],
    "Buttons / Anstecker": ["button","anstecker","ansteckbutton","pin","buttons","ansteckpin"],
    "Lanyards / Schlüsselbänder": ["lanyard","schlüsselband","umhängeband","ausweisband","keyband"],
    "Stofftaschen / Jutebeutel": ["stofftasche","jutebeutel","baumwolltasche","jutetasche","stoffbeutel"],
    "Regenschirme mit Logo": ["regenschirm","schirm bedruckt","schirm","werbeschirm"],
    "Süßwaren / Streuartikel bedruckt": ["süßwaren","bonbon","streuartikel","werbebonbon","gummibärchen","schokolade","süßigkeiten"],
    "Monatskalender & Scheckkartenkalender": ["kalender","scheckkartenkalender","monatskalender","taschenkalender","wandkalender","jahreskalender","3 monatskalender","dreimonatskalender"],
    "Einkaufswagenchips": ["einkaufswagenchip","chip","einkaufschip","wagenchip","einkaufswagenlöser"],
    "Lineale / Zollstöcke": ["lineal","zollstock","gliedermaßstab","meterstab"],
    "RFID- / NFC-Schutzkarten": ["rfid","nfc","schutzkarte","kartenschutz"],
    "Flaschenöffner": ["flaschenöffner","kapselheber","öffner"],
    "Promotionsarmbänder": ["armband","armbänder","eventarmband","festivalarmband","einlassband","kontrollarmband","steckschnalle"],
    "Pokale": ["pokal","trophäe","siegerpokal","sportpokal"],
    // Außenwerbung
    "Fassadenbeschriftung (Dispersionsfarbe auf Wand)": ["fassade","fassadenbeschriftung","wandbeschriftung","hauswand werbung","giebelwerbung","wandmalerei","wand bemalen","fassadenwerbung","hauswand","giebel","wandschriftzug","gemalt","malerei"],
    "Bauzaunbanner / Bauzaunblende": ["bauzaunbanner","bauzaunblende","bauzaun werbung","bauzaun","zaunblende","zaunbanner","sichtschutz bauzaun"],
    "Bautafel / Baustellenschild": ["bautafel","baustellenschild","bauschild","baustellentafel","baustelle schild"],
    "Gerüstbanner / Gerüstplanen": ["gerüstbanner","gerüstplane","baustellenplane","gerüstwerbung","gerüst","gerüstverkleidung"],
    "Werbeturm / Werbeträger-Aufbau": ["werbeturm","werbeträger","werbepylon aufbau","werbesäule","werbemast","werbeanlage"],
    "Pylonen / Stelenbeschriftung": ["pylon","pylone","stele","stelenschild","preisstele","werbestele","infostele","werbepylon","infopylon","info pylon","werbepylone"],
    "Toranlagen- & Rolltor-Beschriftung": ["rolltor","tor beschriften","toranlage","garagentor","hallentor","rolltor werbung","tor"],
    // Event / Fahnen / Displays
    "Fahnen & Flaggen (Hiss- / Auslegerfahne)": ["fahne","flagge","hissfahne","mastfahne","auslegerfahne","fahnenmast","fahnen","flaggen","firmenfahne","vereinsfahne","bannerfahne","messefahne","eventfahne"],
    "Beachflags / Werbeflaggen / Dropflags": ["beachflag","beachflagge","strandfahne","werbefahne","dropflag","segelfahne","beach flag","werbeflagge"],
    "Werbeplanen / Banner (Event)": ["eventbanner","stadtfest banner","veranstaltungsbanner","banner event","festbanner","vereinsbanner","sportplatz banner","bandenwerbung","messebanner","promotionsbanner","eventplane"],
    "Roll-Up-Displays": ["rollup","roll up","display","messedisplay","aufrollbar","roll-up","rollupdisplay","bannerdisplay","messeaufsteller"],
    "Faltdisplays / Pop-Up-Messewände (Kedersystem)": ["popup wand","messewand","faltdisplay","messestand wand","keder","pop up","popup","messestand","messerückwand","fotowand","pressewand"],
    "Kundenstopper / A-Aufsteller": ["kundenstopper","aufsteller","a aufsteller","gehwegaufsteller","werbeaufsteller","klapprahmen","plakatständer","gehwegschild","werbeständer"],
    "Thekenaufsteller / Tischaufsteller": ["thekenaufsteller","tischaufsteller","tischdisplay","tischschild","acrylaufsteller"],
    "Messetheke / Promotion-Theke": ["messetheke","promotiontheke","promotion theke","counter","theke","infotheke","promotiontisch","gebogene theke","gebogen"],
    "Spannrahmen / Textilbild": ["spannrahmen","textilbild","stoffbild","keder textil","textilrahmen"],
    "Sitzsäcke / Sitzwürfel": ["sitzsack","sitzwürfel","sitzmöbel","hocker","schaumstoff","schaumstoffwürfel"],
    // Sicherheit
    "Flucht- & Rettungspläne": ["fluchtplan","rettungsplan","fluchtwegplan","evakuierungsplan","fluchtwegeplan","feuerwehrplan","asr a2 3","notfallplan"],
    "Rettungsweg- / Notausgangsschilder": ["notausgang","rettungszeichen","notausgangsschild","fluchtwegschild","rettungswegschild","notausgangszeichen","erste hilfe","sammelstelle","fluchtweg","notruftelefon","rettungszeichen grün"],
    "Brandschutz- & Feuerwehrschilder": ["brandschutzschild","feuerwehrschild","brandschutzzeichen","feuerlöscher schild","feuerlöscher","brandschutz","feuerwehrzufahrt","löschwasser","feuerwehr","löschschlauch","brandmelder"],
    "Verbotsschilder (Rauchverbot u. a.)": ["verbotsschild","rauchverbot","verbotszeichen","rauchen verboten","zutritt verboten","kein zutritt","fotografieren verboten","unbefugte","zutritt für unbefugte"],
    "Gebots- & PSA-Kennzeichnung": ["gebotsschild","psa","gebotszeichen","schutzausrüstung","helmpflicht","schutzbrille","gehörschutz","sicherheitsschuhe"],
    "Warn- & Gefahrenschilder (GHS / Gefahrstoff)": ["warnschild","gefahrenschild","ghs","gefahrstoff","warnzeichen","achtung schild","hochspannung","rutschgefahr","gefahr","elektrische spannung","flurförderzeuge","spannung"],
    "Ordnungs- / Hausnummern & Türnummerierung": ["hausnummer","türnummer","zimmernummer","nummerierung","türnummerierung","hausnummernschild","raumnummer","regalkennzeichnung","regal","ordnungskennzeichnung"],
    "Alu-Dibond-Sicherheitsschilder": ["sicherheitsschild","dibond schild","sicherheitskennzeichnung","iso 7010","arbeitsschutz schild","betriebskennzeichnung"],
    "Boden- & Treppenmarkierungen": ["bodenmarkierung","treppenmarkierung","stufenkante","stufenkantenmarkierung","stufenmarkierung","verkehrsweg","verkehrswege","hallenmarkierung","fahrwegmarkierung","markierung boden"],
    "Betriebsanweisungen & Maschinenkennzeichnung": ["betriebsanweisung","maschinenkennzeichnung","maschinenschild","anlagenkennzeichnung"],
    "Leit- & Orientierungssystem / Wegweiser": ["wegweiser","leitsystem","orientierungssystem","beschilderung wege","wegeleitsystem","wegeleitung"],
    // Print
    "Visitenkarten": ["visitenkarte","visiten","businesskarte","geschäftskarte","kontaktkarte","business card","business cards"],
    "Briefpapier & Geschäftsausstattung": ["briefpapier","briefbogen","geschäftsausstattung","briefkopf","geschäftspapier","firmenpapier"],
    "Stempel": ["stempel","firmenstempel","holzstempel","selbstfärber","adressstempel"],
    "Flyer & Handzettel": ["flyer","handzettel","faltblatt","werbezettel","flugblatt","faltflyer","infoblatt"],
    "Broschüren & Prospekte": ["broschüre","prospekt","katalog","heft","magazin","imagebroschüre"],
    "Blöcke & Notizblöcke": ["block","notizblock","schreibblock","abreißblock"],
    "Einladungen / Karten / Gutscheine": ["einladung","gutschein","grußkarte","einladungskarte","postkarte","karte","gutscheinkarte","weihnachtskarte","danksagung","hochzeit","geburtstag","taufe","jubiläum"],
    "Aufkleber / Etiketten (klein)": ["aufkleber klein","etikett","sticker klein","adressetikett","kleine aufkleber"],
    "Quittungsblöcke": ["quittung","quittungsblock","durchschreibeblock","lieferschein","rechnungsblock"],
    "Angebots- & Präsentationsmappen": ["mappe","präsentationsmappe","angebotsmappe","firmenmappe","sammelmappe"],
    "Briefumschläge": ["briefumschlag","umschlag","kuvert","couvert","umschläge"],
    "Faltschachteln": ["faltschachtel","schachtel","produktverpackung"],
    "Schreibtischunterlagen": ["schreibtischunterlage","tischunterlage","schreibunterlage"],
    "Haftnotizen": ["haftnotiz","post it","postit","klebezettel","sticky notes"],
    "Versandtaschen": ["versandtasche","versandbeutel","luftpolstertasche"],
    "Notizbücher": ["notizbuch","kladde"],
    "Klemmbretter": ["klemmbrett","klemmmappe","schreibbrett"],
    "Thekendisplay": ["thekendisplay","flyerständer","prospekthalter","verkaufsdisplay"],
    "Transport- & Versandverpackungen": ["versandverpackung","transportverpackung","karton","versandkarton","paket","verpackung"],
    // Plakatwerbung
    "Plakatwerbung / Plakatkampagne": ["plakat","plakate","plakatwerbung","plakatkampagne","plakatierung","plakatieren","plakataktion","plakatservice","komplettservice plakat"],
    "Standort- & Routenplanung für Plakate": ["routenplanung","standortplanung","verteilung","plakatverteilung","einwohner","einwohnerzahl","standorte plakate","route plakate"],
    "Plakatgestaltung & Druck": ["plakat gestalten","plakatgestaltung","plakatdesign","plakat drucken","plakat entwerfen","druckdaten plakat","plakat erstellen"],
    "Laternenplakate": ["laterne","laternenmast","laternenplakat","mastplakat","straßenlaterne","lampenmast","laternenwerbung"],
    "Veranstaltungsplakate (Allwetter, Doppel-A1)": ["veranstaltungsplakat","event plakat","allwetterplakat","a1 plakat","doppel a1","eventwerbung","konzertplakat","wetterfest","beidseitig"],
    "Plakate auf Hohlkammerplatten": ["hohlkammer","hohlkammerplatte","hohlkammerplakat","kunststoffplatte","wetterfestes plakat"],
    "Genehmigung / Sondernutzung für Plakate": ["genehmigung","sondernutzung","sondernutzungserlaubnis","sondernutzungsantrag","plakatgenehmigung","antrag","ordnungsamt","gemeinde","werbevermarkter","vermarkter","auflagen"],
    "Anbringung & Abbau von Plakaten": ["plakate aufhängen","anbringung","plakat abbau","plakate abhängen","aufhängen","abhängen","entsorgung","kabelbinder"],
    // Montage & Service
    "Schildermontage / Werbeturm-Montage": ["schildermontage","montage schild","werbeturm montage","schild anbringen","schild montieren","schild aufhängen"],
    "Folien- & Fahrzeugmontage": ["folienmontage","fahrzeugmontage","folierung montage","folie anbringen","folie verkleben"],
    "Montage bundesweit (nach Absprache)": ["montage","bundesweit","aufbau vor ort","anbringung","montageservice","montieren","installation","vor ort","deutschlandweit"],
    "Beratung & Gestaltung / Grafik": ["grafik","gestaltung","design","layout","beratung","entwurf","logo design","logo erstellen","corporate design","grafikdesign","logo gestalten","druckdaten","vektorisieren","gestalten","neues logo","logo entwerfen","logoentwicklung","logo neu"],
    "Aufmaß & Vor-Ort-Termin": ["aufmaß","vor ort termin","vermessung","ausmessen","besichtigung","termin"],
    "Demontage & Erneuerung / Austausch": ["demontage","abbau","erneuerung","austausch","entfernen","folie entfernen","beschriftung entfernen","ablösen","erneuern"],
    // Webentwicklung
    "Unternehmenswebsite / Homepage": ["webseite","homepage","internetseite","internetauftritt","webdesign","webentwicklung","website erstellen","firmenwebsite","unternehmenswebsite","web","internet","website","webauftritt","onlinepräsenz","handwerker","handwerk","gewerbe","selbstständige","dienstleister","händler"],
    "Landingpages": ["landing page","landingpage","aktionsseite","kampagnenseite","zielseite","onepager"],
    "SEO-Optimierung (bei Google gefunden werden)": ["seo","suchmaschinenoptimierung","google ranking","google","google optimierung","sichtbarkeit","ranking","suchmaschine"],
    "Pflege & Aktualisierung der Website": ["wartung","pflege","aktualisierung","betreuung","website pflege","inhalte ändern","update"],
    "Beratung zu Domain, Hosting & DSGVO": ["domain","hosting","webhosting","server","dsgvo","datenschutz website","webspace","performance"],
    "Responsive Design (Smartphone, Tablet, Desktop)": ["responsive","mobil","handy","smartphone","tablet","mobile website"],
    // Kontakt & Unternehmen
    "Kontakt & Anfrage": ["kontakt","anfrage","angebot anfordern","telefon","anrufen","email","e mail","mail","nachricht","kontaktformular","rückruf","ansprechpartner","kostenvoranschlag","angebot","preis","preise","kosten","telefonnummer","handynummer","whatsapp","erreichen","erreichbar","erreichbarkeit"],
    "Öffnungszeiten & Anfahrt": ["öffnungszeiten","geöffnet","anfahrt","adresse","standort","stendal","magdeburger straße","wegbeschreibung","geschäftszeiten","besuch","wann offen","wo seid ihr","wo finde ich euch"],
    "Über uns": ["über uns","team","firma","unternehmen","geschichte","kroner","wer seid ihr","seit 1986","printline"],
    "Referenzen / Portfolio": ["referenzen","referenz","portfolio","beispiele","arbeiten","projekte","kunden","bilder","fotos","galerie"],
    "Projektarchiv (1986–2001)": ["archiv","alte projekte","historie","früher","damals"],
    "Online-Konfigurator": ["konfigurator","online anfrage","konfigurieren","zusammenstellen","anfrage online"],
    "Alle Leistungen im Überblick": ["leistungen","alle leistungen","übersicht","sortiment","was macht ihr","services","angebote","leistungsübersicht"]
  };

  // ── Kategorien mit Standard-Zielseite; Ausnahmen als {t, page} ───────────────────────────────
  var GROUPS = [
    { page: "schilder.html", short: "Schilder", items: [
      "Firmenschild / Eingangsschild","Türschild / Namensschild / Klingelschild","Werbeschild / Werbetafel",
      "Acrylglas-/Plexiglas-Schild (mit Abstandshaltern)","Parkplatz- & Verbotsschild (amtlich & nicht amtlich)",
      "Türaufkleber / Öffnungszeitenschild",
      "Namensschilder / Türschildsysteme (wechselbar)","Bauschilder","Werbe- & Informationstafeln",
      "Übersichtstafeln / Etagenschilder","Praxisschilder / Kanzleischilder","Immobilien-/Verkaufsschilder",
      "Parkplatzschilder","Wegeleitsysteme / Orientierung" ] },
    { page: "beschriftungen.html", short: "Fahrzeug", items: [
      "Fahrzeugbeschriftung (Teilbeschriftung)","Magnetschilder fürs Fahrzeug","Nutzfahrzeug- & Transporterbeschriftung",
      "Anhänger- & Aufliegerbeschriftung","Baumaschinen- & Staplerbeschriftung","Contour-Cut-Logos / Autoaufkleber",
      "Heckbeschriftung / Dachbeschriftung","Konturschnitt-Kennzeichnung / Ordnungsnummern am Fahrzeug","Bootsnummern",
      "Firmen- & Vertreterwagen","Lieferdienste / Pflegedienste","Fahrschulwagen","Transporter / LKW / LKW-Auflieger",
      "Pickup & Pritschenwagen","Linien- & Reisebusse / Taxen","Straßenbahnen / Züge","Bau- & Landmaschinen",
      "Anhänger & Verkaufsfahrzeuge","Boote / Jetski / Leichtflugzeuge" ] },
    { page: "folientechnik.html", short: "Folien", items: [
      "Schaufensterbeschriftung","Glasdekorfolie / Milchglasfolie","Sichtschutzfolie","Sonnenschutz- / Hitzeschutzfolie",
      "Splitter- / Sicherheitsfolie","Magnetfolie","Folienplott zur Selbstanbringung",
      { t: "Bodenaufkleber / Floor-Graphics", page: "druck.html" },
      "Anti-Graffiti-Folie","Tafel- / Whiteboardfolie","Adhäsionsfolie (statische Haftfolie)" ] },
    { page: "druck.html", short: "Druck", items: [
      "Großformatdruck auf Folie","Plattendruck (Dibond, Forex, Hartschaum)","Posterdruck / Papierdruck (Großformat)",
      { t: "PVC-Banner / Werbeplanen", page: "planen-banner.html" },
      "Aufkleber & Etiketten (Konturschnitt)","Klebefolien-Buchstaben / Schriftzüge",
      "UV-Direktdruck auf feste Materialien (Holz, Acryl, Metall)","Maschinen- & Gerätebeschriftung" ] },
    { page: "textildruck-flex-und-flock.html", short: "Textil", items: [
      "T-Shirt-Druck (Flex/Flock)","Hoodie- / Sweatshirt-Druck","Schürzen","Arbeits- & Berufskleidung veredeln",
      "Warnschutz- / Sicherheitskleidung mit Logo","Sublimationsdruck (Polyester / Trikots)","Caps & Mützen bedrucken",
      "Taschen & Beutel bedrucken","Handtücher / Textilien bedrucken" ] },
    { page: "werbeartikel.html", short: "Werbeartikel", items: [
      "Kugelschreiber mit Logo","Tassen & Becher bedrucken","Feuerzeuge / Schlüsselanhänger","USB-Sticks / Powerbanks",
      "Notizblöcke / Schreibunterlagen","Trinkflaschen / Thermosbecher","Buttons / Anstecker","Lanyards / Schlüsselbänder",
      "Stofftaschen / Jutebeutel","Regenschirme mit Logo","Süßwaren / Streuartikel bedruckt",
      "Monatskalender & Scheckkartenkalender","Einkaufswagenchips","Lineale / Zollstöcke","RFID- / NFC-Schutzkarten","Flaschenöffner",
      "Promotionsarmbänder","Pokale" ] },
    { page: "fassaden.html", short: "Außenwerbung", items: [
      "Fassadenbeschriftung (Dispersionsfarbe auf Wand)",
      { t: "Bauzaunbanner / Bauzaunblende", page: "planen-banner.html" },
      { t: "Bautafel / Baustellenschild", page: "schilder.html" },
      { t: "Gerüstbanner / Gerüstplanen", page: "planen-banner.html" },
      { t: "Werbeturm / Werbeträger-Aufbau", page: "aufsteller-pylonen.html" },
      { t: "Pylonen / Stelenbeschriftung", page: "aufsteller-pylonen.html" },
      { t: "Toranlagen- & Rolltor-Beschriftung", page: "beschriftungen.html" } ] },
    { page: "fahnen.html", short: "Event", items: [
      "Fahnen & Flaggen (Hiss- / Auslegerfahne)","Beachflags / Werbeflaggen / Dropflags",
      { t: "Werbeplanen / Banner (Event)", page: "planen-banner.html" },
      "Roll-Up-Displays","Faltdisplays / Pop-Up-Messewände (Kedersystem)",
      { t: "Kundenstopper / A-Aufsteller", page: "aufsteller-pylonen.html" },
      { t: "Thekenaufsteller / Tischaufsteller", page: "aufsteller-pylonen.html" },
      { t: "Messetheke / Promotion-Theke", page: "aufsteller-pylonen.html" },
      "Spannrahmen / Textilbild",
      { t: "Sitzsäcke / Sitzwürfel", page: "werbeartikel.html" } ] },
    { page: "schilder.html", short: "Sicherheit", items: [
      "Flucht- & Rettungspläne","Rettungsweg- / Notausgangsschilder","Brandschutz- & Feuerwehrschilder",
      "Verbotsschilder (Rauchverbot u. a.)","Gebots- & PSA-Kennzeichnung","Warn- & Gefahrenschilder (GHS / Gefahrstoff)",
      "Ordnungs- / Hausnummern & Türnummerierung","Alu-Dibond-Sicherheitsschilder","Leit- & Orientierungssystem / Wegweiser",
      "Boden- & Treppenmarkierungen","Betriebsanweisungen & Maschinenkennzeichnung" ] },
    { page: "druck.html", short: "Print", items: [
      "Visitenkarten","Briefpapier & Geschäftsausstattung","Stempel","Flyer & Handzettel","Broschüren & Prospekte",
      "Blöcke & Notizblöcke","Einladungen / Karten / Gutscheine","Aufkleber / Etiketten (klein)","Quittungsblöcke",
      "Angebots- & Präsentationsmappen","Briefumschläge","Faltschachteln","Schreibtischunterlagen","Haftnotizen",
      "Versandtaschen","Notizbücher","Klemmbretter","Thekendisplay","Transport- & Versandverpackungen" ] },
    { page: "plakatwerbung.html", short: "Plakat", items: [
      "Plakatwerbung / Plakatkampagne","Standort- & Routenplanung für Plakate","Plakatgestaltung & Druck",
      "Laternenplakate","Veranstaltungsplakate (Allwetter, Doppel-A1)","Plakate auf Hohlkammerplatten",
      "Genehmigung / Sondernutzung für Plakate","Anbringung & Abbau von Plakaten" ] },
    { page: "leistungen.html", short: "Montage", items: [
      "Schildermontage / Werbeturm-Montage","Folien- & Fahrzeugmontage","Montage bundesweit (nach Absprache)",
      "Beratung & Gestaltung / Grafik","Aufmaß & Vor-Ort-Termin","Demontage & Erneuerung / Austausch" ] },
    { page: "webdesign.html", short: "Web", items: [
      "Unternehmenswebsite / Homepage","Landingpages","SEO-Optimierung (bei Google gefunden werden)",
      "Pflege & Aktualisierung der Website","Beratung zu Domain, Hosting & DSGVO",
      "Responsive Design (Smartphone, Tablet, Desktop)" ] },
    { page: "kontakt.html", short: "Seiten", items: [
      "Kontakt & Anfrage","Öffnungszeiten & Anfahrt",
      { t: "Über uns", page: "ueber-uns.html" },
      { t: "Referenzen / Portfolio", page: "portfolio.html" },
      { t: "Projektarchiv (1986–2001)", page: "Archiv.html" },
      { t: "Online-Konfigurator", page: "https://konfigurator.werbung-kroner.de" },
      { t: "Alle Leistungen im Überblick", page: "leistungen.html" } ] }
  ];

  // Anzeigenamen der Kategorien
  var CAT_LABEL = {
    "Schilder": "Schilder & Beschilderung",
    "Fahrzeug": "Fahrzeug & Folierung",
    "Folien": "Fenster- & Glasfolien",
    "Druck": "Digital- & Großformatdruck",
    "Textil": "Textil & Bekleidung",
    "Werbeartikel": "Werbeartikel & Give-aways",
    "Außenwerbung": "Außen- & Bauwerbung",
    "Event": "Fahnen, Messe & Event",
    "Sicherheit": "Sicherheits- & Pflichtkennzeichnung",
    "Print": "Print & Papeterie",
    "Montage": "Montage & Service",
    "Plakat": "Plakatwerbung",
    "Web": "Webentwicklung",
    "Seiten": "Kontakt & Unternehmen"
  };

  // Wörter, die für eine ganze Kategorie stehen (schwächer gewichtet als Leistungs-Synonyme)
  var CAT_SYN = {
    "Schilder": ["schild","schilder","tafel","beschilderung","schildchen"],
    "Fahrzeug": ["auto","autos","car","vehicle","pkw","kfz","fahrzeug","fahrzeuge","wagen","firmenwagen","transporter","lkw","bus","anhänger","flotte","fuhrpark","van","sprinter","kastenwagen","beschriftung","bekleben"],
    "Folien": ["folie","folien","fenster","scheibe","scheiben","glas","glastür","schaufenster","fensterscheibe","bekleben"],
    "Druck": ["druck","drucken","digitaldruck","drucksache","bedrucken","print","printing"],
    "Textil": ["textil","textilien","kleidung","bekleidung","shirt","shirts","verein","team","bedrucken","veredeln","veredelung","klamotten"],
    "Werbeartikel": ["werbeartikel","giveaway","give away","werbegeschenk","streuartikel","merchandise","kundengeschenk","werbemittel","geschenk","logo"],
    "Außenwerbung": ["außenwerbung","baustelle","bau","fassade","draußen"],
    "Event": ["messe","flag","flags","event","veranstaltung","fest","stadtfest","promotion","ausstellung","markt"],
    "Sicherheit": ["sicherheit","arbeitsschutz","asr","din","iso","kennzeichnung","brandschutz","betrieb","vorschrift","pflicht","unfallverhütung"],
    "Print": ["drucksachen","papier","büro","geschäftspapier","druckerei"],
    "Montage": ["montage","service","anbringen","aufbauen","installieren","montieren"],
    "Plakat": ["plakat","plakate","laterne","kampagne","veranstaltung","aushang"],
    "Web": ["website","webseite","homepage","internet","web","online","seite"],
    "Seiten": []
  };

  // Leistungen, die PrintLine bewusst NICHT anbietet → ehrlicher Hinweis + passende Alternative.
  // Einzelwörter ab 5 Zeichen gelten auch als Wortanfang („bestick" → bestickt, besticken …),
  // kurze Wörter (led, neon, app …) nur exakt; mehrteilige Begriffe müssen komplett vorkommen.
  var NEG = [
    { terms: ["stickerei","sticken","bestick","gestickt","aufstick","einstick","stickmaschine","stickerein"],
      msg: "Stickerei bieten wir nicht an – wir veredeln Textilien mit Flex-, Flock- und Sublimationsdruck.",
      alt: "T-Shirt-Druck (Flex/Flock)" },
    { terms: ["siebdruck","sieb","siebdrucker"],
      msg: "Siebdruck bieten wir nicht an – Textilien bedrucken wir mit Flex, Flock und Sublimation, alles andere im Digitaldruck.",
      alt: "T-Shirt-Druck (Flex/Flock)" },
    { terms: ["leucht","lichtreklame","lichtwerbung","lichtwerbeanlage","beleucht","hinterleucht","neon","neonschrift","neonreklame","led","leds"],
      msg: "Leuchtreklame, Neon- und LED-Werbeanlagen bieten wir nicht an – gern beraten wir Sie zu Schildern, Pylonen oder Fassadenbeschriftung.",
      alt: "Firmenschild / Eingangsschild" },
    { terms: ["gravur","gravier","graviert","eingravier","lasergravur"],
      msg: "Gravurschilder bieten wir nicht an – wir fertigen Schilder im Digitaldruck oder mit Folie, z. B. aus Alu-Dibond oder Acrylglas.",
      alt: "Firmenschild / Eingangsschild" },
    { terms: ["leinwand","wandbild","fototapete","tapete","tapeten","hinterglas"],
      msg: "Leinwand-, Tapeten- und Hinterglasdruck bieten wir nicht an – im Digitaldruck bedrucken wir Folie, Platten und Papier.",
      alt: "Großformatdruck auf Folie" },
    { terms: ["vollfolier","komplettfolier","vollverkleb","carwrapping","car wrapping","wrapping","wrap","auto komplett","ganzes auto","komplett folieren","auto umfolieren","umfolierung","farbwechsel auto"],
      msg: "Eine Vollfolierung von Fahrzeugen bieten wir nicht an – Teilbeschriftung und Teilfolierung nach Absprache.",
      alt: "Fahrzeugbeschriftung (Teilbeschriftung)" },
    { terms: ["3d buchstaben","3d schrift","3d schriftzug","3d logo","profilbuchstab","acrylbuchstab","edelstahlbuchstab","metallbuchstab","3d einzelbuchstaben"],
      msg: "3D-Einzelbuchstaben bieten wir nicht an – Schriftzüge setzen wir mit Folie oder als Schild um.",
      alt: "Klebefolien-Buchstaben / Schriftzüge" },
    { terms: ["fassadenfolie","fassade folie","fassade bekleben","fassadenfolierung","hauswand folie","wand folie"],
      msg: "Fassaden bekleben wir nicht mit Folie – wir beschriften Fassaden mit Dispersionsfarbe direkt auf der Wand.",
      alt: "Fassadenbeschriftung (Dispersionsfarbe auf Wand)" },
    { terms: ["copyshop","copy shop","kopier","kopien","fotokopie"],
      msg: "Einen Kopierservice bieten wir nicht an – wir sind auf Werbetechnik und Druck spezialisiert.",
      alt: "Flyer & Handzettel" },
    { terms: ["onlineshop","online shop","webshop","shopsystem","e commerce","ecommerce","app","apps","newsletter","terminbuchung","login bereich"],
      msg: "Onlineshops, Apps und Newsletter-Systeme bieten wir nicht an – wir erstellen Unternehmenswebsites und Landingpages.",
      alt: "Unternehmenswebsite / Homepage" },
    { terms: ["fahrradständer","fahrradparker","radständer"],
      msg: "Fahrradständer bieten wir nicht an.",
      alt: "" }
  ];

  // Füllwörter (in normaler Schreibweise) – werden ignoriert
  var STOP = ["für","fuer","fürs","fuers","auf","am","an","im","in","ins","mit","und","oder","der","die","das","den","dem","des",
    "ein","eine","einen","einem","einer","eines","zum","zur","von","vom","bei","beim","ich","wir","suche","suchen","brauche","brauchen",
    "benötige","benoetige","möchte","moechte","hätte","haette","gern","gerne","bitte","was","wie","wo","wer","wann","mein","meine","meinen",
    "unser","unsere","unseren","auch","noch","nur","so","als","zu","aus","es","sie","uns","mir","mich","einfach","mal","bis","hallo","hi",
    "moin","gibt","habt","ihr","könnt","koennt","kann","können","koennen","ist","sind","soll","sollen","sollte","will","wollen",
    "euch","eure","euer","eurem","euren","eurer","du","dir","dich","ihnen","ihre","ihren","gegen","damit","man","nicht","kein","keine","keinen",
    "schnell","günstig","guenstig","billig","gute","guten","gut","stück","stueck","stk","paar","viele","dass","hier","da","dort",
    "welche","welcher","welches","macht","gemacht","seid","aufs","ans","ums","übers","uebers","unters","vors","aufm","sowas","so","etwas","ne","nen","einige","mehrere"];
  // Weiche Wörter: zählen mit, wenn sie passen – verhindern aber keinen Treffer
  var SOFT = ["bedrucken","bedruckt","bedruckte","drucken","druck","beschriften","beschriftet","beschriftung","bekleben","beklebt","folieren",
    "logo","logos","werbung","werbe","firmenlogo","individuell","eigenem","eigene","eigenen","personalisiert","personalisieren","herstellen",
    "anfertigen","machen","lassen","erstellen","fertigen","angebot","preis","preise","kosten","kostet","teuer","anfrage","firma","firmen",
    "verein","vereine","professionell","hochwertig","qualität","bestellen","bestellung","bestelle","kaufen","kauf","besorgen","neu","neue","neuen","neues","neuer","neuem"];

  // ── Normalisierung ────────────────────────────────────────────────────────────────────────
  function lower(s) { return String(s || "").toLowerCase(); }
  function fold(s) {
    return lower(s)
      .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "s")
      .replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u").replace(/ss/g, "s")
      .replace(/ph/g, "f")
      .replace(/[^a-z0-9]+/g, " ").trim();
  }
  function toks(s) { var f = fold(s); return f ? f.split(" ") : []; }
  function itoks(s) { return toks(s).filter(function (w) { return !STOPF[w]; }); } // Index-Wörter ohne Füllwörter
  function compact(s) { return fold(s).replace(/ /g, ""); }
  var SUF = ["ern","en","er","em","es","e","n","s"];
  function stem(w) {
    if (w.length <= 4) return w;
    for (var i = 0; i < SUF.length; i++) {
      var x = SUF[i];
      if (w.length - x.length >= 4 && w.slice(-x.length) === x) return w.slice(0, -x.length);
    }
    return w;
  }
  var STOPSET = {}, SOFTSET = {};
  var STOPF = {};
  STOP.forEach(function (w) { STOPSET[lower(w)] = 1; STOPF[fold(w)] = 1; });
  SOFT.forEach(function (w) { SOFTSET[fold(w)] = 1; });

  // Tippfehler-Abstand (Levenshtein inkl. Buchstabendreher), bricht bei > max ab
  function osa(a, b, max) {
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    var prev2 = null, prev = [], cur, i, j;
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur = [i]; var rowMin = i;
      for (j = 1; j <= lb; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1))
          v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v; if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[lb];
  }

  // Wie gut passt ein Suchwort q auf ein Index-Wort w? (0 = gar nicht, 1 = exakt)
  var memo = {};
  function tokScore(q, w) {
    var key = q + "|" + w;
    if (key in memo) return memo[key];
    return (memo[key] = tokScore0(q, w));
  }
  function tokScore0(q, w) {
    if (q === w) return 1;
    var qs = stem(q), ws = stem(w);
    if (qs === ws && qs.length >= 3 && (q.indexOf(w) === 0 || w.indexOf(q) === 0)) return 0.9; // Einzahl/Mehrzahl
    if (q.length >= 2 && w.indexOf(q) === 0) return q.length >= 3 ? 0.88 - Math.min(0.13, (w.length - q.length) * 0.01) : 0.6; // Wortanfang
    var mi = q.length >= 4 ? w.indexOf(q, 1) : -1;                                       // Teil eines zusammengesetzten Wortes
    if (mi > 0 && (q.length >= 5 || /^(e|n|s|en|er|es|ern)?$/.test(w.slice(mi + q.length)))) return 0.76; // kurze Wörter nur als Wortende („firmenauto")
    var si = qs.length >= 5 && qs !== q ? w.indexOf(qs) : -1;                              // Wortstamm im Kompositum
    if (si > 0 || (si === 0 && w.length >= qs.length + 4)) return 0.72;
    var th = q.length >= 9 ? 2 : (q.length >= 5 ? 1 : 0);
    if (!th && q.length === 4 && w.length >= 4 && w.length <= 6 && q.charAt(0) === w.charAt(0)) th = 1;  // kurze Wörter: 1 Tippfehler
    var d = th ? osa(q, w, th) : 9;
    if (d <= th) return d === 1 ? 0.7 : 0.62;                                             // Tippfehler
    if (ws.length >= 5 && q.length > w.length && q.indexOf(ws) === 0) return 0.66;      // Suchwort länger (z. B. „stempelkissen")
    if (!th) return 0;
    if (qs.length >= 4 && osa(qs, ws, th) <= th) return 0.6;
    if (q.length >= 5 && w.length > q.length && osa(q, w.slice(0, q.length), th) <= th) return 0.55; // Tippfehler beim Weitertippen
    if (q.length >= 6 && w.length > q.length + 1) {                                                    // Tippfehler im Kompositum
      for (var i = 1; i + q.length <= w.length; i++) {
        if (osa(q, w.substr(i, q.length), th) <= th) return 0.5;
      }
    }
    return 0;
  }

  // ── Index aufbauen ────────────────────────────────────────────────────────────────────────
  var ITEMS = [], VOCAB = {};
  GROUPS.forEach(function (g) {
    var label = CAT_LABEL[g.short] || g.short;
    var catToks = itoks(label).concat((CAT_SYN[g.short] || []).reduce(function (a, s) { return a.concat(itoks(s)); }, []));
    g.items.forEach(function (it, pos) {
      var text = typeof it === "string" ? it : it.t;
      var page = typeof it === "string" ? g.page : (it.page || g.page);
      var syn = SYN[text] || [];
      var nameT = itoks(text), synT = [];
      syn.forEach(function (s) { synT = synT.concat(itoks(s)); });
      ITEMS.push({ text: text, page: page, group: label, short: g.short, pos: pos,
        nameT: uniq(nameT), synT: uniq(synT), catT: uniq(catToks),
        nameC: compact(text), synC: syn.map(compact), synWhole: syn.reduce(function (o, x) { o[compact(x)] = 1; return o; }, {}) });
      nameT.concat(synT).concat(catToks).forEach(function (w) { if (w.length >= 3) { VOCAB[w] = 1; VOCAB[stem(w)] = 1; } });
    });
  });
  function uniq(a) { var s = {}, r = []; a.forEach(function (x) { if (x && !s[x]) { s[x] = 1; r.push(x); } }); return r; }
  var ALT = {}; ITEMS.forEach(function (it) { ALT[it.text] = it; });

  function bestIn(q, list) {
    var b = 0;
    for (var i = 0; i < list.length; i++) { var s = tokScore(q, list[i]); if (s > b) { b = s; if (b === 1) break; } }
    return b;
  }
  function knownWord(w) { return !!(VOCAB[w] || VOCAB[stem(w)]); }
  // Zusammengesetzte Suchwörter zerlegen („tassendruck" → „tassen" + „druck"), auch mit Fugen-s
  function splitCompound(q) {
    if (q.length < 7 || knownWord(q)) return null;
    for (var v in VOCAB) if (v.indexOf(q) === 0) return null;   // Wort wird noch getippt („werbetur…")
    for (var i = q.length - 3; i >= 3; i--) {
      var a = q.slice(0, i), b = q.slice(i);
      if (knownWord(a) && knownWord(b)) return [a, b];
      if (a.length > 3 && a.charAt(a.length - 1) === "s" && knownWord(a.slice(0, -1)) && knownWord(b)) return [a.slice(0, -1), b];
    }
    return null;
  }

  // Nicht angebotene Leistungen erkennen; gibt Hinweise + die „verbrauchten" Wörter zurück
  function negFor(all) {
    var hits = [], used = {};
    NEG.forEach(function (n) {
      var hit = false;
      n.terms.forEach(function (t) {
        var tt = toks(t);
        if (tt.length > 1) {
          var idx = tt.map(function (p) {
            for (var i = 0; i < all.length; i++) if (all[i] === p || (p.length >= 3 && all[i].indexOf(p) === 0)) return i;
            return -1;
          });
          if (idx.indexOf(-1) < 0) { hit = true; idx.forEach(function (i) { used[i] = 1; }); }
          var c = tt.join("");
          all.forEach(function (w, i) { if (w === c) { hit = true; used[i] = 1; } });
          return;
        }
        var tf = tt[0];
        all.forEach(function (w, i) {
          var m = tf.length <= 4 ? w === tf
            : (w === tf || w.indexOf(tf) === 0 || (w.length >= 7 && tf.length >= 7 && !knownWord(w) && osa(w, tf, 1) <= 1));
          if (m) { hit = true; used[i] = 1; }
        });
      });
      if (hit) hits.push(n);
    });
    return { hits: hits, used: used };
  }

  function scoreItem(item, words) {
    var total = 0, hardHit = 0, hardAll = true, softHit = 0;
    for (var k = 0; k < words.length; k++) {
      var w = words[k];
      var main = Math.max(bestIn(w.q, item.nameT), bestIn(w.q, item.synT) * 0.92);
      var cat = bestIn(w.q, item.catT);
      var s = main > 0 ? main + 0.15 * cat : cat * 0.6;
      if (s > 0 && (item.synWhole[w.q] || item.nameC === w.q)) s += 0.08;
      if (s > 0) { total += w.soft ? s * 0.35 : s; if (w.soft) softHit++; else hardHit++; }
      else if (!w.soft) hardAll = false;
    }
    return { total: total, hardAll: hardAll, hardHit: hardHit, softHit: softHit };
  }

  // Hauptfunktion: liefert Hinweise (nicht angebotene Leistungen) und nach Relevanz sortierte Treffer
  function search(query) {
    memo = {};
    var rawLower = lower(query).replace(/ß/g, "ss").split(/[^a-z0-9äöü]+/).filter(Boolean);
    var all = [];                                   // alle Wörter (für Hinweise)
    var cand = [];                                  // Wörter ohne Füllwörter (für Treffer)
    rawLower.forEach(function (r) {
      var parts = toks(r);
      var stop = !!STOPSET[r];
      parts.forEach(function (p) { all.push(p); cand.push({ q: p, stop: stop, idx: all.length - 1 }); });
    });
    var neg = all.length ? negFor(all) : { hits: [], used: {} };
    var words = [];
    cand.forEach(function (c) {
      if (c.stop || neg.used[c.idx] || c.q.length < 2) return;
      var parts = splitCompound(c.q);
      (parts || [c.q]).forEach(function (p) { words.push({ q: p, soft: !!SOFTSET[p] }); });
    });
    if (!words.length && !neg.hits.length) {        // nur Füllwörter/Wortanfänge („übers", „aufm") → trotzdem suchen
      cand.forEach(function (c) { if (c.q.length >= 3) words.push({ q: c.q, soft: false }); });
    }
    if (words.length && words.every(function (w) { return w.soft; })) words.forEach(function (w) { w.soft = false; });

    // Ganze Eingabe entspricht genau einem Namen/Synonym (auch mit Füllwörtern, z. B. „zu verkaufen")
    var fullC = all.join("");
    var qCompact = words.map(function (w) { return w.q; }).join("");
    var scored = ITEMS.map(function (it) {
      var r = words.length ? scoreItem(it, words) : { total: 0, hardAll: false, hardHit: 0, softHit: 0 };
      var exact = fullC.length >= 3 && (it.nameC === fullC || it.synC.indexOf(fullC) >= 0);
      if (exact) r.total += 1.5;
      else if (r.total > 0 && qCompact && (it.nameC === qCompact || it.synC.indexOf(qCompact) >= 0)) r.total += 0.25;
      // Mehrere Wörter zusammen als Begriff („roll up" = „Roll-Up", „t shirt" = „T-Shirt")
      if (words.length > 1 && qCompact.length >= 5 && r.total > 0) {
        if (it.nameC.indexOf(qCompact) >= 0) r.total += 0.6;
        else if (it.synC.some(function (c) { return c === qCompact; })) r.total += 0.55;
        else if (it.synC.some(function (c) { return c.indexOf(qCompact) >= 0; })) r.total += 0.3;
      }
      return { item: it, score: r.total, exact: exact, hardAll: r.hardAll, hardHit: r.hardHit, softHit: r.softHit };
    });
    var hard = words.filter(function (w) { return !w.soft; }).length;
    var results = scored.filter(function (x) {
      return x.exact || (x.hardAll && x.score > 0 && (hard > 0 ? x.hardHit > 0 : x.softHit > 0));
    });
    var mode = "and";
    if (!results.length && hard > 1) {                // nichts passt auf alle Wörter → ähnliche Treffer
      var maxHit = 0; scored.forEach(function (x) { if (x.hardHit > maxHit) maxHit = x.hardHit; });
      if (maxHit > 0) { results = scored.filter(function (x) { return x.hardHit === maxHit && x.score > 0; }); mode = "or"; }
    }
    // Schwache Zufallstreffer ausblenden, wenn es klar bessere gibt
    if (results.length) {
      var top = Math.max.apply(null, results.map(function (x) { return x.score; }));
      var cut = words.length > 1 ? top * 0.45 : (top >= 0.85 ? Math.min(0.58, top * 0.5) : top * 0.5);
      if (top >= 1.5 && words.length <= 1) cut = Math.max(cut, 0.58);
      results = results.filter(function (x) { return x.exact || x.score >= cut; });
    }
    // Gleichstand: Hauptleistung der Kategorie (steht in GROUPS vorn) zuerst
    results.sort(function (a, b) { return b.score - a.score || a.item.pos - b.item.pos || a.item.text.localeCompare(b.item.text, "de"); });
    return { neg: neg.hits, results: results, mode: mode, words: words };
  }

  var api = { search: search, items: ITEMS, fold: fold, neg: NEG, alt: ALT, vocab: VOCAB };
  if (typeof window !== "undefined") window.PLSearch = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  // ── Oberfläche ────────────────────────────────────────────────────────────────────────────
  if (typeof document === "undefined") return;
  var input = document.getElementById("lsuche");
  if (!input) return;
  var dd = document.getElementById("lsuche-dd");
  var clearBtn = document.getElementById("lsuche-clear");
  var box = input.closest(".lsuche__box");

  function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // Treffer hervorheben – tolerant für ä/ae, ö/oe, ü/ue, ß/ss, Bindestrich/Leerzeichen
  function markup(text, words) {
    if (!words || !words.length) return escHtml(text);
    var pats = words.map(function (w) { return w.q; }).filter(function (q) { return q.length >= 3; })
      .sort(function (a, b) { return b.length - a.length; })
      .map(function (q) {
        return q.split("").map(function (c, i) {
          if (c === "a") return "(?:ä|ae|a)"; if (c === "o") return "(?:ö|oe|o)"; if (c === "u") return "(?:ü|ue|u)";
          if (c === "s") return i ? "(?:ß|ss|s)" : "(?:ß|s)"; if (c === "f") return "(?:ph|f)";
          return c;
        }).join("[- ]?");
      });
    if (!pats.length) return escHtml(text);
    var re;
    try { re = new RegExp(pats.join("|"), "gi"); } catch (_) { return escHtml(text); }
    var out = "", last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (!m[0]) { re.lastIndex++; continue; }
      out += escHtml(text.slice(last, m.index)) + "<mark>" + escHtml(m[0]) + "</mark>";
      last = m.index + m[0].length;
    }
    return (out + escHtml(text.slice(last))).replace(/<\/mark><mark>/g, "");   // angrenzende Markierungen zusammenfassen
  }

  // Ohne Eingabe: alle Kategorien A–Z; mit Eingabe: nach Relevanz
  var GROUPED_ALL = (function () {
    var byLabel = {};
    ITEMS.forEach(function (it) { (byLabel[it.group] = byLabel[it.group] || []).push(it); });
    return Object.keys(byLabel).sort(function (a, b) { return a.localeCompare(b, "de"); }).map(function (l) {
      return { label: l, items: byLabel[l].slice().sort(function (a, b) { return a.text.localeCompare(b.text, "de"); }) };
    });
  })();

  var opts = [], active = -1;
  function optionHtml(it, words) {
    var i = opts.length; opts.push(it);
    return '<li role="option" id="ls-' + i + '" data-page="' + escHtml(it.page) + '"><span class="nm">' + markup(it.text, words) + '</span></li>';
  }
  function render(query) {
    opts = []; active = -1; input.removeAttribute("aria-activedescendant");
    var html = "";
    var q = String(query || "").trim();
    if (!q) {
      GROUPED_ALL.forEach(function (gr) {
        html += '<li class="optgroup" aria-hidden="true">' + escHtml(gr.label) + '</li>';
        gr.items.forEach(function (it) { html += optionHtml(it, null); });
      });
      dd.innerHTML = html; return;
    }
    var r = search(q);
    r.neg.forEach(function (n) {
      html += '<li class="note">' + escHtml(n.msg) + '</li>';
      var a = n.alt && ALT[n.alt];
      if (a && !r.results.some(function (x) { return x.item === a; }) && opts.indexOf(a) < 0) html += optionHtml(a, null);
    });
    if (r.results.length) {
      if (r.mode === "or") html += '<li class="note">Keine genaue Übereinstimmung – ähnliche Leistungen:</li>';
      var groups = [], idx = {};
      r.results.forEach(function (x) {
        var g = x.item.group;
        if (!(g in idx)) { idx[g] = groups.length; groups.push({ label: g, items: [] }); }
        groups[idx[g]].items.push(x.item);
      });
      groups.forEach(function (gr) {
        html += '<li class="optgroup" aria-hidden="true">' + escHtml(gr.label) + '</li>';
        gr.items.forEach(function (it) { html += optionHtml(it, r.words); });
      });
    } else if (!r.neg.length) {
      html += '<li class="note">Dazu haben wir nichts Passendes gefunden – fragen Sie uns einfach, wir helfen gern weiter.</li>';
      html += optionHtml(ALT["Kontakt & Anfrage"], null);
    }
    dd.innerHTML = html;
  }
  function open() { if (!dd.hidden) return; render(input.value); dd.hidden = false; input.setAttribute("aria-expanded", "true"); }
  function close() { if (dd.hidden) return; dd.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); active = -1; }
  function move(d) {
    var lis = dd.querySelectorAll("li[role=option]"); if (!lis.length) return;
    active = active < 0 ? (d > 0 ? 0 : lis.length - 1) : Math.max(0, Math.min(lis.length - 1, active + d));
    for (var i = 0; i < lis.length; i++) { lis[i].classList.toggle("active", i === active); }
    var el = lis[active]; if (el) { el.scrollIntoView({ block: "nearest" }); input.setAttribute("aria-activedescendant", el.id); }
  }
  function go(page) { if (page) { window.location.href = page; } }

  input.addEventListener("focus", open);
  input.addEventListener("click", open);
  input.addEventListener("input", function () {
    clearBtn.style.display = input.value ? "block" : "none";
    if (dd.hidden) open(); else render(input.value);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (dd.hidden) open(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (dd.hidden) open(); move(-1); }
    else if (e.key === "Enter") { if (!dd.hidden && opts.length) { e.preventDefault(); go(opts[active < 0 ? 0 : active].page); } }
    else if (e.key === "Escape") { close(); }
  });
  dd.addEventListener("mousedown", function (e) {
    var li = e.target.closest("li[data-page]");
    if (li) { e.preventDefault(); go(li.getAttribute("data-page")); }
  });
  clearBtn.addEventListener("click", function () { input.value = ""; clearBtn.style.display = "none"; render(""); open(); input.focus(); });
  document.addEventListener("click", function (e) { if (box && !box.contains(e.target)) close(); });
})();
