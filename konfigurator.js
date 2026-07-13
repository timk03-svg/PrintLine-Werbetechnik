/* ══════════════════════════════════════════════════════════════
   PrintLine — Fahrzeug-Konfigurator (v4)
   • Mehransichten (Seite/Heck/Front) je Karosserie, jede Fläche
     einzeln anklickbar; Inhalt PRO Fläche: Text / Digitaldruck /
     Bild·PDF / Gemischt, Uploads „einpassen" oder „frei" (ziehen/
     skalieren). Auto-Suche, Orafol-Folien (Haltbarkeit), ORACAL-
     Farben, Fahrzeug-Grundfarbe, PNG/Druck, Formspree (DSGVO).
   • DATENGETRIEBEN: KONFIG unten anpassen. Autos: konfigurator-autos.json
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var app = document.getElementById('kfg-app');
  if (!app) return;
  var FORMSPREE = 'https://formspree.io/f/mnnzegpa';
  var STORE = 'printline_konfig_v4';
  var bigStage = false;

  /* ── Flächen-Helfer: {id,name,d,c:[x,y,w,h]} c = Inhaltsbereich ── */
  function sf(id, name, d, c) { return { id: id, name: name, d: d, c: c }; }

  var KONFIG = {
    fahrzeuge: [
      { id:'pkw', name:'PKW / Limousine', ico:'🚗', maxFlaeche:'ca. 2,2 × 1,1 m je Seite',
        views: {
          seite: { vb:'0 0 480 260', glass:'M204,100 L286,100 L308,146 L186,146 Z', wheels:[{cx:122,cy:202,r:30},{cx:360,cy:202,r:30}],
            deco:'<path d="M88,202 a34,34 0 0 1 68,0" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><path d="M326,202 a34,34 0 0 1 68,0" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><line x1="60" y1="178" x2="432" y2="178" stroke="rgba(0,0,0,.10)" stroke-width="2"/><rect x="41" y="164" width="12" height="11" rx="3" fill="#fbe38a"/><rect x="430" y="164" width="9" height="13" rx="2" fill="#d24a47"/><line x1="240" y1="150" x2="240" y2="200" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/><path d="M152,150 l-13,-6 l0,8 z" fill="#2c2f33"/><rect x="200" y="170" width="16" height="3" rx="1.5" fill="rgba(0,0,0,.25)"/>',
            surfaces:[ sf('motorhaube','Motorhaube','M40,176 Q40,150 64,150 L118,150 L118,196 L70,196 Q40,196 40,180 Z',[48,158,62,32]),
              sf('dach','Dach & Fenster','M168,150 L196,96 Q201,88 216,88 L289,88 Q299,88 304,98 L330,150 Z',[198,110,104,30]),
              sf('tuerVorn','Tür vorne','M150,150 L238,150 L238,196 L150,196 Z',[154,154,82,38]),
              sf('tuerHinten','Tür hinten','M242,150 L330,150 L330,196 L242,196 Z',[246,154,82,38]),
              sf('heck','Heck','M330,150 L416,150 Q440,150 440,176 L440,182 Q440,196 412,196 L330,196 Z',[336,156,90,34]),
              sf('schweller','Schweller','M120,196 L412,196 L412,202 L120,202 Z',[150,196,236,5]) ] },
          heck: { vb:'0 0 480 260', glass:null, wheels:[{cx:178,cy:214,r:22},{cx:302,cy:214,r:22}],
            deco:'<rect x="150" y="198" width="180" height="14" rx="4" fill="#2c2f33"/><rect x="158" y="160" width="20" height="22" rx="3" fill="#d24a47"/><rect x="302" y="160" width="20" height="22" rx="3" fill="#d24a47"/><rect x="218" y="190" width="44" height="14" rx="2" fill="#eef0f2" stroke="rgba(0,0,0,.25)"/>',
            surfaces:[ sf('heckscheibe','Heckscheibe','M178,86 L302,86 L312,128 L168,128 Z',[180,90,120,34]),
              sf('heckklappe','Heckklappe','M162,132 L318,132 L326,196 L154,196 Z',[168,138,144,52]) ] },
          front: { vb:'0 0 480 260', glass:null, wheels:[{cx:178,cy:214,r:22},{cx:302,cy:214,r:22}],
            deco:'<rect x="148" y="196" width="184" height="14" rx="4" fill="#2c2f33"/><rect x="158" y="156" width="26" height="20" rx="4" fill="#fbe38a"/><rect x="296" y="156" width="26" height="20" rx="4" fill="#fbe38a"/><rect x="210" y="176" width="60" height="12" rx="3" fill="rgba(0,0,0,.4)"/>',
            surfaces:[ sf('frontscheibe','Frontscheibe','M178,86 L302,86 L312,128 L168,128 Z',[180,90,120,34]),
              sf('haube','Motorhaube (Front)','M160,130 L320,130 L324,194 L156,194 Z',[166,136,148,48]) ] }
        } },
      { id:'transporter', name:'Transporter / Kombi', ico:'🚐', maxFlaeche:'ca. 3,0 × 1,6 m je Seite',
        views: {
          seite: { vb:'0 0 480 260', glass:'M50,150 L70,110 L86,110 L86,150 Z', wheels:[{cx:118,cy:212,r:30},{cx:372,cy:212,r:30}],
            deco:'<path d="M84,212 a34,34 0 0 1 68,0" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><path d="M338,212 a34,34 0 0 1 68,0" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><rect x="41" y="170" width="9" height="12" rx="2" fill="#fbe38a"/><rect x="425" y="168" width="7" height="14" rx="2" fill="#d24a47"/><path d="M86,148 l-14,-6 l0,8 z" fill="#2c2f33"/><rect x="170" y="150" width="3" height="60" fill="rgba(0,0,0,.12)"/><rect x="240" y="178" width="16" height="3" rx="1.5" fill="rgba(0,0,0,.22)"/>',
            surfaces:[ sf('fahrerhaus','Fahrerhaus / Front','M40,150 L66,104 L86,104 L86,206 L52,206 Q40,206 40,196 Z',[44,128,44,72]),
              sf('tuerFahrer','Fahrertür','M86,96 L150,96 L150,206 L86,206 Z',[90,104,60,96]),
              sf('schiebetuer','Schiebetür','M154,96 L250,96 L250,206 L154,206 Z',[158,104,92,96]),
              sf('seitenwand','Seitenwand (groß)','M254,96 L404,96 L404,206 L254,206 Z',[258,104,146,96]),
              sf('heck','Hecktüren','M404,96 L424,96 Q432,96 432,104 L432,202 Q432,206 424,206 L404,206 Z',[405,104,26,96]),
              sf('dach','Dach','M86,78 L424,78 Q432,78 432,86 L432,96 L86,96 Z',[92,80,334,14]),
              sf('schweller','Schweller','M86,206 L404,206 L404,210 L86,210 Z',[100,206,290,4]) ] },
          heck: { vb:'0 0 480 260', glass:null, wheels:[{cx:168,cy:216,r:22},{cx:312,cy:216,r:22}],
            deco:'<rect x="148" y="204" width="186" height="12" rx="3" fill="#2c2f33"/><rect x="152" y="180" width="16" height="22" rx="2" fill="#d24a47"/><rect x="316" y="180" width="16" height="22" rx="2" fill="#d24a47"/><rect x="238" y="112" width="3" height="94" fill="rgba(0,0,0,.2)"/>',
            surfaces:[ sf('heckfenster','Heckfenster','M170,74 L230,74 L230,108 L170,108 Z',[172,78,56,28]),
              sf('tuerL','Hecktür links','M150,112 L238,112 L238,206 L150,206 Z',[154,116,82,86]),
              sf('tuerR','Hecktür rechts','M242,112 L330,112 L330,206 L242,206 Z',[246,116,82,86]) ] },
          front: { vb:'0 0 480 260', glass:null, wheels:[{cx:168,cy:216,r:22},{cx:312,cy:216,r:22}],
            deco:'<rect x="146" y="196" width="188" height="14" rx="3" fill="#2c2f33"/><rect x="152" y="150" width="24" height="18" rx="3" fill="#fbe38a"/><rect x="304" y="150" width="24" height="18" rx="3" fill="#fbe38a"/><rect x="210" y="170" width="60" height="14" rx="2" fill="rgba(0,0,0,.35)"/>',
            surfaces:[ sf('frontscheibe','Frontscheibe','M156,74 L324,74 L324,120 L156,120 Z',[160,78,160,38]),
              sf('frontmaske','Frontmaske','M150,124 L330,124 L330,196 L150,196 Z',[156,128,168,62]) ] }
        } },
      { id:'lkw', name:'LKW / Koffer', ico:'🚚', maxFlaeche:'ca. 6,0 × 2,4 m je Seite',
        views: {
          seite: { vb:'0 0 480 260', glass:'M50,138 L66,104 L118,104 L118,138 Z', wheels:[{cx:96,cy:214,r:26},{cx:300,cy:216,r:28},{cx:372,cy:216,r:28}],
            deco:'<path d="M66,214 a30,30 0 0 1 60,0" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><path d="M270,216 a30,30 0 0 1 60,0" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><path d="M342,216 a30,30 0 0 1 60,0" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><rect x="41" y="176" width="10" height="12" rx="2" fill="#fbe38a"/><rect x="124" y="74" width="4" height="138" fill="rgba(0,0,0,.18)"/><path d="M118,136 l-14,-6 l0,8 z" fill="#2c2f33"/>',
            surfaces:[ sf('fahrerhaus','Fahrerhaus / Front','M40,140 L60,96 L86,96 L86,212 L52,212 Q40,212 40,198 Z',[44,150,42,56]),
              sf('tuerFahrer','Fahrertür','M90,96 L120,96 L120,212 L90,212 Z',[92,112,28,94]),
              sf('kofferVorn','Koffer vorne','M132,72 L286,72 L286,212 L132,212 Z',[138,80,148,124]),
              sf('kofferHinten','Koffer hinten','M290,72 L440,72 L440,212 L290,212 Z',[296,80,144,124]),
              sf('dach','Dach','M132,60 L440,60 L440,72 L132,72 Z',[140,62,294,8]) ] },
          heck: { vb:'0 0 480 260', glass:null, wheels:[{cx:172,cy:224,r:20},{cx:308,cy:224,r:20}],
            deco:'<rect x="128" y="210" width="224" height="12" rx="3" fill="#2c2f33"/><rect x="134" y="190" width="14" height="20" rx="2" fill="#d24a47"/><rect x="332" y="190" width="14" height="20" rx="2" fill="#d24a47"/><rect x="238" y="52" width="4" height="164" fill="rgba(0,0,0,.2)"/>',
            surfaces:[ sf('hecktuer','Koffer-Heck (riesig)','M130,52 L350,52 L350,216 L130,216 Z',[138,58,204,150]) ] },
          front: { vb:'0 0 480 260', glass:null, wheels:[{cx:172,cy:224,r:20},{cx:308,cy:224,r:20}],
            deco:'<rect x="138" y="204" width="204" height="14" rx="3" fill="#2c2f33"/><rect x="146" y="150" width="22" height="18" rx="3" fill="#fbe38a"/><rect x="312" y="150" width="22" height="18" rx="3" fill="#fbe38a"/>',
            surfaces:[ sf('frontscheibe','Frontscheibe','M150,60 L330,60 L330,118 L150,118 Z',[156,64,168,48]),
              sf('frontmaske','Frontmaske','M140,122 L340,122 L340,206 L140,206 Z',[148,128,184,72]) ] }
        } },
      { id:'sattelzug', name:'Sattelzug / Auflieger', ico:'🚛', maxFlaeche:'ca. 13,6 × 2,6 m je Seite (Auflieger)',
        views: {
          seite: { vb:'0 0 480 260', glass:'M46,128 L60,98 L92,98 L92,128 Z', wheels:[{cx:78,cy:212,r:24},{cx:300,cy:214,r:24},{cx:352,cy:214,r:24},{cx:404,cy:214,r:24}],
            deco:'<path d="M54,212 a28,28 0 0 1 56,0" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><path d="M272,214 a28,28 0 0 1 56,0" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/><path d="M376,214 a28,28 0 0 1 56,0" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/><rect x="37" y="172" width="10" height="12" rx="2" fill="#fbe38a"/><rect x="98" y="118" width="4" height="92" fill="rgba(0,0,0,.18)"/><path d="M92,126 l-12,-5 l0,7 z" fill="#2c2f33"/><rect x="104" y="186" width="14" height="22" fill="rgba(0,0,0,.25)"/>',
            surfaces:[ sf('zugmaschine','Zugmaschine','M34,130 L52,92 L92,92 L92,206 L46,206 Q34,206 34,192 Z',[38,116,52,80]),
              sf('aufliegerVorn','Auflieger vorne','M108,70 L228,70 L228,206 L108,206 Z',[114,78,114,124]),
              sf('aufliegerMitte','Auflieger Mitte','M232,70 L336,70 L336,206 L232,206 Z',[236,78,100,124]),
              sf('aufliegerHinten','Auflieger hinten','M340,70 L444,70 L444,206 L340,206 Z',[344,78,100,124]),
              sf('dach','Dach Auflieger','M108,58 L444,58 L444,70 L108,70 Z',[114,60,328,8]) ] },
          heck: { vb:'0 0 480 260', glass:null, wheels:[{cx:178,cy:226,r:18},{cx:302,cy:226,r:18}],
            deco:'<rect x="126" y="214" width="228" height="12" rx="3" fill="#2c2f33"/><rect x="132" y="196" width="14" height="20" rx="2" fill="#d24a47"/><rect x="334" y="196" width="14" height="20" rx="2" fill="#d24a47"/><rect x="238" y="50" width="4" height="170" fill="rgba(0,0,0,.2)"/>',
            surfaces:[ sf('hecktuer','Auflieger-Heck (riesig)','M126,50 L354,50 L354,218 L126,218 Z',[134,56,212,154]) ] },
          front: { vb:'0 0 480 260', glass:null, wheels:[{cx:180,cy:222,r:20},{cx:300,cy:222,r:20}],
            deco:'<rect x="146" y="202" width="188" height="14" rx="3" fill="#2c2f33"/><rect x="152" y="150" width="22" height="18" rx="3" fill="#fbe38a"/><rect x="306" y="150" width="22" height="18" rx="3" fill="#fbe38a"/>',
            surfaces:[ sf('frontscheibe','Frontscheibe','M156,58 L324,58 L324,116 L156,116 Z',[160,62,168,48]),
              sf('frontmaske','Frontmaske','M146,120 L334,120 L334,204 L146,204 Z',[152,126,182,72]) ] }
        } },
      { id:'bus', name:'Bus / Reisebus', ico:'🚌', maxFlaeche:'ca. 11,0 × 2,8 m je Seite',
        views: {
          seite: { vb:'0 0 480 260', glass:null, wheels:[{cx:118,cy:212,r:28},{cx:372,cy:212,r:28}],
            deco:'<path d="M84,212 a32,32 0 0 1 68,0" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/><path d="M338,212 a32,32 0 0 1 68,0" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><rect x="44" y="100" width="392" height="34" rx="6" fill="#23323f" opacity="0.85"/><rect x="44" y="100" width="392" height="34" rx="6" fill="url(#kfgGlass)"/><g fill="rgba(255,255,255,.12)"><rect x="60" y="104" width="2" height="26"/><rect x="118" y="104" width="2" height="26"/><rect x="176" y="104" width="2" height="26"/><rect x="234" y="104" width="2" height="26"/><rect x="292" y="104" width="2" height="26"/><rect x="350" y="104" width="2" height="26"/></g><rect x="40" y="176" width="9" height="12" rx="2" fill="#fbe38a"/><rect x="431" y="176" width="9" height="12" rx="2" fill="#d24a47"/><rect x="150" y="138" width="4" height="68" fill="rgba(0,0,0,.18)"/>',
            surfaces:[ sf('front','Front','M40,150 Q40,98 70,98 L96,98 L96,210 L52,210 Q40,210 40,198 Z',[42,138,52,64]),
              sf('seiteVorn','Seite vorne','M96,138 L210,138 L210,210 L96,210 Z',[102,144,108,60]),
              sf('seiteMitte','Seite Mitte','M214,138 L322,138 L322,210 L214,210 Z',[218,144,104,60]),
              sf('seiteHinten','Seite hinten','M326,138 L430,138 L430,210 L326,210 Z',[330,144,100,60]),
              sf('heck','Heck','M430,98 L440,98 Q444,98 444,108 L444,200 Q444,210 434,210 L430,210 Z',[430,140,14,62]),
              sf('dach','Dach','M70,82 L432,82 Q444,82 444,96 L444,100 L60,100 Q60,86 70,82 Z',[80,84,356,14]) ] },
          heck: { vb:'0 0 480 260', glass:'M158,70 L322,70 L322,108 L158,108 Z', wheels:[{cx:178,cy:222,r:20},{cx:302,cy:222,r:20}],
            deco:'<rect x="138" y="210" width="204" height="12" rx="3" fill="#2c2f33"/><rect x="146" y="190" width="16" height="20" rx="2" fill="#d24a47"/><rect x="318" y="190" width="16" height="20" rx="2" fill="#d24a47"/>',
            surfaces:[ sf('heck','Heckfläche','M140,112 L340,112 L340,206 L140,206 Z',[148,118,184,80]) ] },
          front: { vb:'0 0 480 260', glass:null, wheels:[{cx:178,cy:222,r:20},{cx:302,cy:222,r:20}],
            deco:'<rect x="140" y="204" width="200" height="14" rx="3" fill="#2c2f33"/><rect x="146" y="156" width="22" height="18" rx="3" fill="#fbe38a"/><rect x="312" y="156" width="22" height="18" rx="3" fill="#fbe38a"/>',
            surfaces:[ sf('frontscheibe','Frontscheibe (groß)','M150,58 L330,58 L330,128 L150,128 Z',[156,64,168,58]),
              sf('frontmaske','Frontmaske','M146,132 L334,132 L334,202 L146,202 Z',[152,138,182,58]) ] }
        } }
    ],
    ansichten: [ {id:'seiteL',n:'Fahrerseite'}, {id:'seiteR',n:'Beifahrerseite'}, {id:'heck',n:'Heck'}, {id:'front',n:'Front'} ],
    inhalte: [ {id:'text',n:'Nur Text'}, {id:'druck',n:'Digitaldruck'}, {id:'bild',n:'Bild / PDF'}, {id:'gemischt',n:'Gemischt'} ],
    folien: [
      { id:'751c',   serie:'ORACAL 751C',  kurz:'High-Performance-Cast', jahre:8, finishes:['glaenzend','matt'],            desc:'Guss, konturtreu – Beschriftung & Teilflächen.' },
      { id:'970ra',  serie:'ORACAL 970RA',  kurz:'Premium-Wrapping-Cast', jahre:7, finishes:['glaenzend','matt','metallic'], desc:'Premium-Guss, RapidAir – auch Metallic.' },
      { id:'651',    serie:'ORACAL 651',   kurz:'Intermediate Cal',      jahre:6, finishes:['glaenzend','matt'],            desc:'Standard für Beschriftung & Schilder.' },
      { id:'631',    serie:'ORACAL 631',   kurz:'Removable (matt)',      jahre:3, finishes:['matt'],                        desc:'Ablösbar – kurzfristig, innen, Messen.' }
    ],
    finishMeta: { glaenzend:{name:'Glänzend',sheen:0.30}, matt:{name:'Matt',sheen:0}, metallic:{name:'Metallic',sheen:0.42,metallic:true}, reflektierend:{name:'Reflektierend',sheen:0.5,refl:true} },
    farben: [
      {nr:'010',n:'Weiß',h:'#FFFFFF'},{nr:'023',n:'Elfenbein',h:'#EFE7CE'},{nr:'020',n:'Goldgelb',h:'#F4A900'},
      {nr:'021',n:'Gelb',h:'#F7D417'},{nr:'022',n:'Hellgelb',h:'#F9E11E'},{nr:'036',n:'Hellorange',h:'#F39200'},
      {nr:'034',n:'Orange',h:'#EF7D00'},{nr:'047',n:'Orangerot',h:'#DA531E'},{nr:'032',n:'Hellrot',h:'#C8161D'},
      {nr:'031',n:'Rot',h:'#C1121C'},{nr:'026',n:'Purpurrot',h:'#9E1B32'},{nr:'041',n:'Pink',h:'#E6007E'},
      {nr:'040',n:'Violett',h:'#50237F'},{nr:'043',n:'Lavendel',h:'#8A6FBF'},{nr:'049',n:'Königsblau',h:'#15418E'},
      {nr:'057',n:'Verkehrsblau',h:'#14579F'},{nr:'050',n:'Dunkelblau',h:'#14306E'},{nr:'052',n:'Azurblau',h:'#0E76BC'},
      {nr:'053',n:'Hellblau',h:'#4FA3DD'},{nr:'066',n:'Türkis',h:'#009BA4'},{nr:'064',n:'Gelbgrün',h:'#8CBE22'},
      {nr:'062',n:'Hellgrün',h:'#3FA535'},{nr:'061',n:'Grün',h:'#1E7D34'},{nr:'060',n:'Dunkelgrün',h:'#0B5D2E'},
      {nr:'080',n:'Braun',h:'#5A3A1B'},{nr:'081',n:'Hellbraun',h:'#8B5A2B'},{nr:'071',n:'Grau',h:'#8E9192'},
      {nr:'074',n:'Mittelgrau',h:'#6A6E71'},{nr:'073',n:'Dunkelgrau',h:'#4D4F53'},{nr:'076',n:'Telegrau',h:'#5C6063'},
      {nr:'070',n:'Schwarz',h:'#111111'},{nr:'090',n:'Silber',h:'#9A9C9E',metallic:true},{nr:'091',n:'Gold',h:'#C19A2E',metallic:true},
      {nr:'092',n:'Kupfer',h:'#B06A3B',metallic:true}
    ],
    autoFarben: [ {n:'Weiß',h:'#F2F3F4'},{n:'Perlweiß',h:'#EAE7DD'},{n:'Silber',h:'#C7CACD',metallic:true},{n:'Hellgrau',h:'#AAB0B4',metallic:true},{n:'Grau',h:'#6A6E71'},{n:'Dunkelgrau',h:'#3E4146',metallic:true},{n:'Anthrazit',h:'#2B2E33'},{n:'Schwarz',h:'#161616'},{n:'Schwarz matt',h:'#232527'},{n:'Rot',h:'#A91319'},{n:'Weinrot',h:'#6E1A24'},{n:'Bordeaux',h:'#4A1420'},{n:'Orange',h:'#D2691E'},{n:'Gelb',h:'#E8B400'},{n:'Beige',h:'#D9CBB0'},{n:'Sandbeige',h:'#C2A878'},{n:'Hellblau',h:'#5C86B8'},{n:'Blau',h:'#1B3A6B'},{n:'Dunkelblau',h:'#14223F'},{n:'Türkis',h:'#1C8C8C'},{n:'Hellgrün',h:'#4E8B45'},{n:'Grün',h:'#1E5631'},{n:'Dunkelgrün',h:'#143D24'},{n:'Braun',h:'#5A3A22'},{n:'Bronze',h:'#7A5A33',metallic:true},{n:'Gold',h:'#B08D2E',metallic:true} ]
  };

  var STEPS = ['Fahrzeug', 'Folie & Farbe', 'Flächen gestalten', 'Anfrage'];

  var s = {
    step:0, fahrzeug:null, auto:'', fahrzeugfarbe:'#C7CACD', fahrzeugfarbeName:'Silber',
    folie:'651', finish:'glaenzend', farbe:'#14306E', farbeName:'Dunkelblau (050)',
    ansicht:'seiteL', aktiv:null,
    basis:'schema', foto:null, fotoName:'',
    objekte:{}, sel:{}, objNextId:1,
    belegung:{}   // "view:sid" -> {unwrap,col}  (Bauteil-Farbe)
  };
  var SKIP_SAVE={ _files:1, _fotoFile:1, _fotoFiles:1, foto:1, objekte:1, fotoObjekte:1 };
  try { var sv = JSON.parse(localStorage.getItem(STORE)||'null'); if (sv) for (var k in sv) if (k!=='step'&&k!=='aktiv') s[k]=sv[k]; } catch(e){}
  if (s.basis==='foto' && !s.foto) s.basis='schema';
  // Migration alt→neu: Foto-Objekte übernehmen, alte Pro-Fläche-Inhalte auf reine Farbe reduzieren
  if (Array.isArray(s.fotoObjekte) && s.fotoObjekte.length){ if(typeof s.objekte!=='object'||!s.objekte) s.objekte={}; s.objekte.foto=s.fotoObjekte; }
  try{ delete s.fotoObjekte; delete s.fotoSel; delete s.fotoNextId; }catch(e){}
  if (typeof s.objekte!=='object'||!s.objekte) s.objekte={};
  if (typeof s.sel!=='object'||!s.sel) s.sel={};
  if (!s.objNextId) s.objNextId=1;
  try { for (var _bk in s.belegung){ var _b=s.belegung[_bk]||{}, _k={}; if(_b.unwrap)_k.unwrap=true; if(_b.col)_k.col=_b.col; if(Object.keys(_k).length) s.belegung[_bk]=_k; else delete s.belegung[_bk]; } } catch(e){}
  function save() { try { var c={}; for (var k in s) if (!SKIP_SAVE[k]) c[k]=s[k]; localStorage.setItem(STORE, JSON.stringify(c)); } catch(e){} }
  function sceneKey(){ return 'foto'; }
  function objs(){ var k=sceneKey(); if(!s.objekte[k]) s.objekte[k]=[]; return s.objekte[k]; }
  function selId(){ return s.sel[sceneKey()]; }
  function setSel(id){ s.sel[sceneKey()]=id; }

  var AUTOS=[], AUTOS_NORM=[], DIAK=new RegExp('[\\u0300-\\u036f]','g');
  function norm(t){ return String(t).toLowerCase().normalize('NFD').replace(DIAK,''); }
  var NUTZ=['Mercedes-Benz Vito','Mercedes-Benz Sprinter','Volkswagen Transporter T6','Volkswagen Transporter T5','Volkswagen Multivan','Volkswagen Caddy Cargo','Renault Trafic','Renault Master','Opel Combo','Opel Movano','Citroën Jumpy','Citroën Jumper','Peugeot Boxer','Peugeot Expert','Peugeot Partner','Iveco Daily','MAN TGE','Ford Transit Custom','Ford Transit Connect','Fiat Doblò','Fiat Talento','Nissan Primastar','Toyota Proace'];
  function addAuto(l,seen){ if(seen[l])return; seen[l]=1; AUTOS.push(l); AUTOS_NORM.push(norm(l)); }
  function ladeAutos(){ fetch('konfigurator-autos.json').then(function(r){return r.json();}).then(function(d){ var seen={}; (d||[]).forEach(function(m){(m.models||[]).forEach(function(mo){addAuto(m.brand+' '+mo,seen);});}); NUTZ.forEach(function(l){addAuto(l,seen);}); }).catch(function(){ var seen={}; NUTZ.forEach(function(l){addAuto(l,seen);}); }); }

  /* Karosserie aus Modellname raten (Heuristik – Nutzer kann überschreiben) */
  var TYPE_HINTS=[
    ['bus',['tourismo','citaro','setra','travego','intouro','tourliner','reisebus','lions coach','crossway','citea','cito']],
    ['sattelzug',['sattelzug','auflieger','sattelzugmaschine','sattel ']],
    ['lkw',['actros','arocs','atego','antos','econic','tgx','tgs','tgm','tgl','stralis','eurocargo','s-way','t-way','x-way','canter','fuso','daf xf','daf cf','daf lf','volvo fh','volvo fm','volvo fl','scania r','scania s','scania p','scania g','koffer','lkw']],
    ['transporter',['sprinter','vito','transporter','multivan','caddy','transit','trafic','master','combo','movano','jumpy','jumper','boxer','expert','partner','daily','tge','doblo','talento','primastar','proace','crafter','ducato','berlingo','kangoo','vivaro','nv200','nv300','nv400','scudo','dokker','hiace','vario','interstar','nv250','express','e-traffic']]
  ];
  function guessType(label){ var t=norm(' '+label+' '); for(var i=0;i<TYPE_HINTS.length;i++){ var ks=TYPE_HINTS[i][1]; for(var j=0;j<ks.length;j++){ if(t.indexOf(norm(ks[j]))>=0) return TYPE_HINTS[i][0]; } } return 'pkw'; }

  function vh(){ for(var i=0;i<KONFIG.fahrzeuge.length;i++) if(KONFIG.fahrzeuge[i].id===s.fahrzeug) return KONFIG.fahrzeuge[i]; return null; }
  function geomOf(vid){ var v=vh(); if(!v) return null; var a=(vid==='seiteL'||vid==='seiteR')?'seite':vid; return v.views[a]; }
  function view(){ return geomOf(s.ansicht); }
  function folieObj(){ for(var i=0;i<KONFIG.folien.length;i++) if(KONFIG.folien[i].id===s.folie) return KONFIG.folien[i]; return KONFIG.folien[3]; }
  function finObj(){ return KONFIG.finishMeta[s.finish]||KONFIG.finishMeta.glaenzend; }
  function esc(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];}); }
  function lum(hex){ var m=/^#?([0-9a-f]{6})$/i.exec(hex); if(!m)return 1; var n=parseInt(m[1],16); return (0.2126*(n>>16&255)+0.7152*(n>>8&255)+0.0722*(n&255))/255; }
  function bel(sid){ return s.belegung[s.ansicht+':'+sid]; }
  function belegt(sid){ var b=bel(sid); return !!(b && (b.unwrap || b.col)); }
  /* Pfad horizontal spiegeln (nur absolute M/L/Q-Pfade, x→480-x) – für Beifahrerseite */
  function mirrorPath(d){ return d.replace(/([MLQ])([^MLQZ]+)/g,function(_,c,a){ var nums=a.trim().split(/[\s,]+/).filter(function(t){return t!=='';}), o=[]; for(var i=0;i<nums.length;i+=2){ o.push((480-parseFloat(nums[i])).toFixed(1)); o.push(nums[i+1]); } return c+o.join(','); }); }
  function mBox(c){ return [480-c[0]-c[2], c[1], c[2], c[3]]; }

  /* ── Vorschau ──────────────────────────────────────────────── */
  function txtSpans(text, tx, fs){
    var lines=String(text).split('\n').slice(0,4), n=Math.max(1,lines.length);
    return lines.map(function(ln,i){ return '<tspan x="'+tx.toFixed(1)+'" dy="'+(i===0?(-((n-1)/2)*fs*1.15).toFixed(1):(fs*1.15).toFixed(1))+'">'+esc(ln.slice(0,28))+'</tspan>'; }).join('');
  }
  /* Ein frei platziertes Objekt (Text/Bild) als SVG – geteilt von Schema- und Foto-Modus */
  function objektSVG(o, forExport){
    var out='', sel=(!forExport && selId()===o.id);
    if(o.typ==='bild'&&o.img){ var w=(o.scale||1)*120, x=(o.x!=null?o.x:240)-w/2, y=(o.y!=null?o.y:130)-w/2;
      out+='<image data-fobj="'+o.id+'" href="'+o.img+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+w.toFixed(1)+'" preserveAspectRatio="xMidYMid meet" pointer-events="'+(forExport?'none':'auto')+'" style="cursor:move"/>';
      if(sel) out+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+w.toFixed(1)+'" fill="none" stroke="#40E0D0" stroke-width="2.5" stroke-dasharray="6 4" pointer-events="none"/>';
    } else if(o.typ==='text'&&o.text){ var fs=o.fs||20, tx=(o.x!=null?o.x:240), ty=(o.y!=null?o.y:130), col=o.color||s.farbe, strk=lum(col)>0.6?'rgba(0,0,0,.5)':'rgba(255,255,255,.6)';
      out+='<text data-fobj="'+o.id+'" x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="middle" font-family="Arial, sans-serif" font-size="'+fs+'" font-weight="800" fill="'+col+'" stroke="'+strk+'" stroke-width="0.6" paint-order="stroke" pointer-events="'+(forExport?'none':'auto')+'" style="cursor:move">'+txtSpans(o.text,tx,fs)+'</text>';
      if(sel) out+='<circle cx="'+tx.toFixed(1)+'" cy="'+(ty-fs).toFixed(1)+'" r="3" fill="#40E0D0" pointer-events="none"/>';
    }
    return out;
  }
  function buildFotoSVG(forExport){
    var p=[];
    p.push('<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vorschau auf eigenem Foto">');
    p.push('<defs><clipPath id="kfgFotoClip"><rect x="0" y="0" width="480" height="260" rx="10"/></clipPath></defs>');
    p.push('<g clip-path="url(#kfgFotoClip)"><image href="'+s.foto+'" x="0" y="0" width="480" height="260" preserveAspectRatio="xMidYMid slice"/>');
    objs().forEach(function(o){ p.push(objektSVG(o,forExport)); });
    p.push('</g><rect x="0.5" y="0.5" width="479" height="259" rx="10" fill="none" stroke="rgba(0,0,0,.15)"/></svg>');
    return p.join('');
  }
  function placeholderSVG(){
    return '<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kein Foto">'+
      '<rect x="7" y="7" width="466" height="246" rx="14" fill="#eef2f7" stroke="rgba(16,32,50,.16)" stroke-width="2" stroke-dasharray="9 7"/>'+
      '<text x="240" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#64748b">📷 Fahrzeugfoto hochladen</text>'+
      '<text x="240" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Schritt 1 · danach Text &amp; Logos frei darauf platzieren</text></svg>';
  }
  function buildSVG(forExport){
    if(s.foto) return buildFotoSVG(forExport);
    return placeholderSVG();
  }

  function renderPreview(){
    var stage=document.getElementById('kfg-stage'); if(!stage) return;
    var vhObj=vh(), modelLbl=esc(s.auto||(vhObj?vhObj.name:'')), hint;
    if(!s.foto) hint='Bitte ein Fahrzeugfoto hochladen (Schritt 1)';
    else if(s.step===3) hint=(modelLbl?modelLbl+' · ':'')+'So wird Ihre Anfrage gesendet (fixiert)';
    else if(s.step===2) hint=(modelLbl?modelLbl+' · ':'')+'Text & Logos frei ziehen/skalieren';
    else hint=(modelLbl?modelLbl+' · ':'')+'Ihr Fahrzeugfoto';
    stage.innerHTML=buildSVG(s.step===3)+'<span class="kfg-stage__hint">'+hint+'</span>';
    var fo=folieObj(), badge=document.getElementById('kfg-finishbadge');
    if(badge) badge.innerHTML=s.fahrzeug?('● '+esc(fo.serie)+' · '+finObj().name+' · '+esc(s.farbeName)+' <span style="opacity:.7">(bis '+fo.jahre+' J.)</span>'):'';
    // Flächen anklickbar
    Array.prototype.forEach.call(stage.querySelectorAll('.kfg-srf'),function(pa){ pa.style.cursor=(s.step===2?'pointer':'default'); pa.addEventListener('click',function(){ if(s.step===2){ s.aktiv=s.ansicht+':'+this.getAttribute('data-srf'); renderPanel(); renderPreview(); } }); });
    // Frei platzierte Objekte (Text/Bilder) ziehen – nur wenn nicht im statischen Abschluss
    var svgEl=stage.querySelector('svg');
    if(s.step!==3) Array.prototype.forEach.call(stage.querySelectorAll('[data-fobj]'),function(o){ macheZiehbar(o,svgEl); });
  }
  function fObj(id){ var a=objs(); for(var i=0;i<a.length;i++) if(String(a[i].id)===String(id)) return a[i]; return null; }
  function macheZiehbar(el, svg){
    if(!el||!svg) return;
    var target=fObj(el.getAttribute('data-fobj')); if(!target) return;
    var isText=(el.tagName.toLowerCase()==='text'), moved=false;
    el.style.touchAction='none'; el.style.cursor='move';
    el.addEventListener('pointerdown',function(ev){ ev.preventDefault(); ev.stopPropagation(); try{el.setPointerCapture(ev.pointerId);}catch(e){}
      setSel(target.id); moved=false;
      function move(e){ var m=svg.getScreenCTM(); if(!m) return; var pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; var lp=pt.matrixTransform(m.inverse()); moved=true;
        target.x=lp.x; target.y=lp.y;
        if(isText){ el.setAttribute('x',lp.x); el.setAttribute('y',lp.y); var t1=el.getElementsByTagName('tspan'); for(var i=0;i<t1.length;i++) t1[i].setAttribute('x',lp.x); }
        else { var w0=parseFloat(el.getAttribute('width')); el.setAttribute('x',lp.x-w0/2); el.setAttribute('y',lp.y-w0/2); } }
      function up(){ try{el.releasePointerCapture(ev.pointerId);}catch(e){} el.removeEventListener('pointermove',move); el.removeEventListener('pointerup',up); save(); renderPreview(); renderPanel(); }
      el.addEventListener('pointermove',move); el.addEventListener('pointerup',up);
    });
  }

  /* Vollbild-Vorschau (Vergrößern) – Overlay, kein Layout-Shift */
  function openZoom(){
    var ov=document.createElement('div'); ov.className='kfg-zoomov';
    ov.innerHTML='<div class="kfg-zoomov__inner"><div class="kfg-zoomov__bar"><span>Vorschau</span><button type="button" class="kfg-zoomov__close" aria-label="Schließen">✕ Schließen</button></div><div class="kfg-zoomov__stage">'+buildSVG(true)+'</div></div>';
    function close(){ document.removeEventListener('keydown',esc); ov.remove(); }
    function esc(e){ if(e.key==='Escape') close(); }
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    ov.querySelector('.kfg-zoomov__close').addEventListener('click',close);
    document.addEventListener('keydown',esc);
    document.body.appendChild(ov);
  }

  /* ── Gerüst ────────────────────────────────────────────────── */
  function renderApp(){
    var chips=STEPS.map(function(n,i){return '<span class="'+(i===s.step?'active':(i<s.step?'done':''))+'">'+(i+1)+'. '+n+'</span>';}).join('');
    var pct=Math.round((s.step/(STEPS.length-1))*100);
    app.innerHTML='<div class="kfg-progress"><div class="kfg-progress__bar"><div class="kfg-progress__fill" style="width:'+Math.max(8,pct)+'%"></div></div><div class="kfg-progress__row"><span class="kfg-progress__label">Schritt '+(s.step+1)+' von '+STEPS.length+': '+STEPS[s.step]+'</span><div class="kfg-steps">'+chips+'</div></div></div>'+
      '<div class="kfg-layout"><div class="kfg-preview kfg-card"><div class="kfg-viewtabs" id="kfg-viewtabs"></div><div class="kfg-stage" id="kfg-stage"></div><div class="kfg-finishbadge" id="kfg-finishbadge"></div><div class="kfg-preview__actions"><button type="button" class="btn btn-ghost" id="kfg-zoom">⛶ Vergrößern</button><button type="button" class="btn btn-ghost" id="kfg-png">⬇ Bild speichern</button><button type="button" class="btn btn-ghost" id="kfg-print">🖨 Drucken / PDF</button></div></div><div class="kfg-panel kfg-card" id="kfg-panel"></div></div>';
    document.getElementById('kfg-zoom').addEventListener('click',openZoom);
    document.getElementById('kfg-png').addEventListener('click',exportPNG);
    document.getElementById('kfg-print').addEventListener('click',function(){window.print();});
    renderViewTabs(); renderPanel(); renderPreview(); save();
  }
  function renderViewTabs(){
    var el=document.getElementById('kfg-viewtabs'); if(!el) return;
    el.innerHTML='';   // keine Schema-Ansichten mehr – Basis ist immer das eigene Foto
  }
  function head(t,h){ return '<h2 class="kfg-stephead">'+esc(t)+'</h2><p class="kfg-stephint">'+h+'</p>'; }

  function renderPanel(){
    var p=document.getElementById('kfg-panel'), html='';
    if(s.step===0){
      html+=head('Ihr Fahrzeug','Lade ein <strong>Foto deines Fahrzeugs</strong> hoch – darauf gestaltest du im nächsten Schritt frei mit Text und Logos. Marke/Modell und Karosserie helfen uns beim Angebot.');
      html+='<label class="kfg-lbl" style="margin-top:0">Fahrzeugfoto hochladen <span class="kfg-empf">★ erforderlich</span></label><p class="kfg-sub" style="margin:.1rem 0 .55rem">Am besten eine seitliche Aufnahme – darauf platzierst du Text &amp; Logos.</p>';
      if(s.foto){ html+='<div class="kfg-logo-ctrl"><img class="kfg-logo-thumb" src="'+s.foto+'" alt=""><div><div style="font-size:.82rem;font-weight:700;color:var(--accent-ink,#0D9488)">✓ '+esc(s.fotoName||'Foto')+'</div><span class="kfg-sub">Weiter zu „Gestalten", um Text &amp; Logos zu platzieren.</span><br><button type="button" class="btn btn-ghost" id="kfg-foto-del" style="padding:.3rem .8rem;margin-top:.4rem">Anderes Foto</button></div></div>'; }
      else { html+='<div class="kfg-drop" id="kfg-fotodrop" tabindex="0" role="button"><span class="kfg-drop__ico">📷</span><strong>Fahrzeugfoto hierher</strong> oder klicken<br><span style="font-size:.72rem">PNG·JPG · seitliche Aufnahme · max 20 MB</span><input type="file" id="kfg-fotofile" accept="image/png,image/jpeg" hidden></div>'; }
      html+='<div class="kfg-field" style="margin-top:1.1rem"><label for="kfg-auto">Marke &amp; Modell <span class="kfg-sub">(Suche, Freitext erlaubt)</span></label><div class="kfg-ac"><input type="text" id="kfg-auto" autocomplete="off" placeholder="z. B. Mercedes Sprinter, VW Transporter…" value="'+esc(s.auto)+'"><div class="kfg-ac__list" id="kfg-auto-list" hidden></div></div></div>';
      html+='<label class="kfg-lbl">Karosserie <span class="kfg-sub">— für das Angebot</span></label><div class="kfg-grid kfg-grid--3">';
      KONFIG.fahrzeuge.forEach(function(v){ html+='<button type="button" class="kfg-opt '+(s.fahrzeug===v.id?'sel':'')+'" data-fz="'+v.id+'"><span class="kfg-opt__title"><span class="kfg-opt__ico">'+v.ico+'</span>'+esc(v.name)+'</span><span class="kfg-opt__desc">📏 '+esc(v.maxFlaeche)+'</span></button>'; });
      html+='</div>';
    } else if(s.step===1){
      html+=head('Folie & Wunschfarbe','Welche <strong>Orafol-Folie</strong> (nach Haltbarkeit), welche Oberfläche und welche Wunschfarbe? Diese Angaben gehen mit in dein Angebot.');
      html+='<label class="kfg-lbl">Orafol-Folie <span class="kfg-sub">— nach Haltbarkeit</span></label><div class="kfg-grid">';
      KONFIG.folien.forEach(function(f){ html+='<button type="button" class="kfg-opt kfg-folie '+(s.folie===f.id?'sel':'')+'" data-folie="'+f.id+'"><span class="kfg-opt__title">'+esc(f.serie)+' <span class="kfg-jahre">bis '+f.jahre+' J.</span></span><span class="kfg-opt__desc">'+esc(f.kurz)+' — '+esc(f.desc)+'</span></button>'; });
      html+='</div>';
      var fo=folieObj();
      if(fo.finishes.length>1){ html+='<label class="kfg-lbl">Oberfläche</label><div class="kfg-surfaces">'; fo.finishes.forEach(function(fi){ html+='<button type="button" class="kfg-surf '+(s.finish===fi?'sel':'')+'" data-finish="'+fi+'">'+esc(KONFIG.finishMeta[fi].name)+'</button>'; }); html+='</div>'; }
      html+='<label class="kfg-lbl">Grundfarbe (ORACAL)</label><div class="kfg-swatches">';
      KONFIG.farben.forEach(function(c){ html+='<button type="button" class="kfg-swatch '+(s.farbe.toLowerCase()===c.h.toLowerCase()?'sel':'')+'" style="background:'+c.h+'" data-col="'+c.h+'" data-cn="'+esc(c.n+' ('+c.nr+')')+'" title="'+esc(c.n+' · ORACAL '+c.nr)+'"><span class="kfg-swatch__name">'+esc(c.n)+'</span></button>'; });
      html+='</div><div class="kfg-hexrow"><label class="kfg-lbl" style="margin:0">Eigener Code:</label><input type="color" id="kfg-color" value="'+s.farbe+'"><input type="text" id="kfg-hex" value="'+esc(s.farbe)+'" maxlength="7"></div>';
    } else if(s.step===2){
      if(!s.foto){
        html+=head('Erst Fahrzeugfoto hochladen','Zum Gestalten brauchst du ein Foto deines Fahrzeugs.');
        html+='<button type="button" class="btn btn-primary" id="kfg-tofoto">← Zur Fahrzeug-Auswahl</button>';
      } else {
        html+=head('Auf Ihrem Foto gestalten','Füge beliebig viele <strong>Textboxen</strong> und bis zu <strong>5 Bilder/Logos</strong> hinzu – jedes frei verschiebbar und skalierbar. Über „⛶ Vergrößern" siehst du alles groß.');
        html+=objektEditor();
      }
    } else if(s.step===3){
      html+=renderSummary();
    }
    html+='<div class="kfg-nav">'+(s.step>0?'<button type="button" class="btn btn-ghost" id="kfg-back">← Zurück</button>':'<span></span>');
    if(s.step<STEPS.length-1) html+='<button type="button" class="btn btn-primary" id="kfg-next">Weiter →</button>';
    html+='</div>';
    p.innerHTML=html; wirePanel();
  }

  function bauteilListe(){
    var vw=view(); if(!vw) return '';
    var h='<label class="kfg-lbl" style="margin-top:0">Bauteile <span class="kfg-sub">— anklicken zum Umfärben</span></label><div class="kfg-surfaces" style="margin-bottom:.8rem">';
    vw.surfaces.forEach(function(sff){ var b=bel(sff.id), tag=b&&b.unwrap?' <span class="kfg-tag">Orig.</span>':(b&&b.col?' <span class="kfg-tag" style="background:'+b.col+';color:#fff">●</span>':''); h+='<button type="button" class="kfg-surf '+(s.aktiv===s.ansicht+':'+sff.id?'sel':'')+(belegt(sff.id)?' has':'')+'" data-pick="'+sff.id+'">'+esc(sff.name)+tag+'</button>'; });
    h+='</div>'; return h;
  }
  function bauteilFarbEditor(){
    if(!s.aktiv || s.aktiv.indexOf(s.ansicht+':')!==0) return '<p class="kfg-stephint" style="margin:.2rem 0 .6rem">↑ Bauteil anklicken, um es einzeln umzufärben (optional).</p>';
    var sid=s.aktiv.split(':')[1], vw=view(), sff=(vw.surfaces.filter(function(x){return x.id===sid;})[0]); if(!sff) return '';
    var b=s.belegung[s.aktiv]||{}, isFolie=!b.unwrap&&!b.col, isOrig=!!b.unwrap;
    var h='<div class="kfg-editor"><h3 class="kfg-edhead">'+esc(sff.name)+' – Farbe</h3><div class="kfg-surfaces">';
    h+='<button type="button" class="kfg-surf '+(isFolie?'sel':'')+'" data-pcol="folie">Folienfarbe</button>';
    h+='<button type="button" class="kfg-surf '+(isOrig?'sel':'')+'" data-pcol="orig">Originalfarbe</button>';
    h+='</div><div class="kfg-hexrow"><label class="kfg-lbl" style="margin:0">Eigene Bauteilfarbe:</label><input type="color" id="kfg-pcustom" value="'+(b.col||s.farbe)+'"></div></div>';
    return h;
  }

  function objektEditor(){
    var list=objs(), bildCount=0; list.forEach(function(o){ if(o.typ==='bild') bildCount++; });
    var h='<label class="kfg-lbl"'+(s.basis==='foto'?' style="margin-top:0"':'')+'>Text & Bilder <span class="kfg-sub">— frei platzierbar &amp; skalierbar</span></label>';
    h+='<div class="kfg-surfaces" style="margin-bottom:.8rem"><button type="button" class="kfg-surf" id="kfg-fadd-text">＋ Text</button><button type="button" class="kfg-surf"'+(bildCount>=5?' disabled style="opacity:.5"':'')+' id="kfg-fadd-bild">＋ Bild / Logo'+(bildCount>=5?' (max 5)':'')+'</button></div>';
    if(!list.length){ h+='<p class="kfg-stephint">Noch keine Objekte – „＋ Text" oder „＋ Bild/Logo" hinzufügen und auf dem Fahrzeug platzieren.</p>'; return h; }
    h+='<div class="kfg-surfaces" style="margin-bottom:1rem">';
    list.forEach(function(o){ var lbl=o.typ==='text'?('„'+String(o.text||'Text').split('\n')[0].slice(0,16)+'"'):(o.imgName||'Logo'); h+='<button type="button" class="kfg-surf '+(selId()===o.id?'sel':'')+'" data-fsel="'+o.id+'">'+(o.typ==='text'?'T ':'🖼 ')+esc(lbl)+'</button>'; });
    h+='</div>';
    var o=fObj(selId());
    if(o){
      h+='<div class="kfg-editor"><h3 class="kfg-edhead">'+(o.typ==='text'?'Text-Objekt':'Bild-/Logo-Objekt')+'</h3>';
      if(o.typ==='text'){
        h+='<div class="kfg-field"><label for="kfg-fotext">Text <span class="kfg-sub">— Enter = neue Zeile (max. 4)</span></label><textarea id="kfg-fotext" maxlength="120" rows="3" placeholder="z. B. Musterfirma GmbH">'+esc(o.text||'')+'</textarea></div>';
        h+='<label class="kfg-lbl">Größe <input type="range" id="kfg-fofs" min="10" max="48" step="1" value="'+(o.fs||20)+'" style="vertical-align:middle"></label>';
        h+='<div class="kfg-hexrow"><label class="kfg-lbl" style="margin:0">Textfarbe:</label><input type="color" id="kfg-focol" value="'+(o.color||s.farbe)+'"></div>';
      } else {
        h+='<label class="kfg-lbl">Bild / Logo</label><div class="kfg-drop" id="kfg-fodrop" tabindex="0" role="button"><span class="kfg-drop__ico">⬆️</span>'+(o.img?'Anderes Bild wählen':'<strong>Datei hierher</strong> oder klicken')+'<br><span style="font-size:.72rem">PNG·JPG·SVG · max 20 MB</span><input type="file" id="kfg-fofile" accept="image/png,image/jpeg,image/svg+xml" hidden></div>';
        if(o.img){ h+='<div class="kfg-logo-ctrl"><img class="kfg-logo-thumb" src="'+o.img+'" alt=""><label class="kfg-lbl" style="margin:0">Größe <input type="range" id="kfg-foscale" min="0.3" max="3" step="0.05" value="'+(o.scale||1)+'" style="vertical-align:middle"> <span class="kfg-sub">(im Bild ziehen)</span></label></div>'; }
      }
      h+='<button type="button" class="btn btn-ghost" id="kfg-fodel" style="margin-top:1rem">Objekt löschen</button></div>';
    } else { h+='<p class="kfg-stephint">↑ Objekt anwählen zum Bearbeiten – oder im Bild anklicken/ziehen.</p>'; }
    return h;
  }

  function renderSummary(){
    var v=vh(), fo=folieObj();
    var html=head('Ihre Konfiguration','Prüfen und unverbindlich senden – wir melden uns mit einem kostenlosen Angebot. <strong>Ohne Preisangabe.</strong>');
    html+='<ul class="kfg-summary">';
    html+=row('Fahrzeug',esc(s.auto||(v?v.name:'–')));
    html+=row('Karosserie',v?v.name:'–');
    html+=row('Fahrzeugfoto',esc(s.fotoName||'–'));
    html+=row('Folie',esc(fo.serie)+' · '+esc(fo.kurz)+' (bis '+fo.jahre+' J.)');
    html+=row('Oberfläche',finObj().name);
    html+=row('Wunschfarbe','<span class="kfg-sw-dot" style="background:'+s.farbe+'"></span>'+esc(s.farbeName));
    var objCount=0;
    (s.objekte.foto||[]).forEach(function(o){ objCount++; var d=o.typ==='text'?('Text „'+String(o.text||'').replace(/\n/g,' / ').slice(0,40)+'"'):('Logo/Bild'+(o.imgName?' '+o.imgName:'')); html+=row('Objekt '+objCount, esc(d)); });
    if(!objCount) html+=row('Gestaltung','noch nichts platziert');
    html+='</ul>';
    html+='<form id="kfg-form" novalidate><div class="kfg-field"><label for="kfg-name">Ihr Name <span class="kfg-req">*</span></label><input type="text" id="kfg-name" name="name" required></div><div class="kfg-field"><label for="kfg-email">Ihre E-Mail <span class="kfg-req">*</span></label><input type="email" id="kfg-email" name="email" required></div><div class="kfg-field"><label for="kfg-tel">Telefon (optional)</label><input type="tel" id="kfg-tel" name="telefon"></div><div class="kfg-field"><label for="kfg-msg">Nachricht (optional)</label><textarea id="kfg-msg" name="nachricht" rows="3"></textarea></div><input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px"><label class="kfg-consent"><input type="checkbox" id="kfg-consent" required><span>Ich willige ein, dass meine Angaben und die Konfiguration zur Bearbeitung meiner Anfrage gespeichert und übermittelt werden. Nutzung ausschließlich für diese Anfrage. <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutz</a>. <span class="kfg-req">*</span></span></label><button type="submit" class="btn btn-primary btn-lg" id="kfg-send" style="width:100%">Konfiguration unverbindlich senden</button><div class="kfg-status" id="kfg-status" role="status" aria-live="polite"></div></form>';
    return html;
  }
  function row(k,v){ return '<li><span>'+esc(k)+'</span><span>'+v+'</span></li>'; }

  /* ── Auto-Suche ────────────────────────────────────────────── */
  function wireAuto(){
    var inp=document.getElementById('kfg-auto'), list=document.getElementById('kfg-auto-list'); if(!inp||!list) return;
    function close(){ list.hidden=true; list.innerHTML=''; }
    function show(){ var q=norm(inp.value.trim()); s.auto=inp.value; save(); if(q.length<2){close();return;} var hits=[],i=0; for(;i<AUTOS.length&&hits.length<20;i++) if(AUTOS_NORM[i].indexOf(q)>=0) hits.push(AUTOS[i]); if(!hits.length){close();return;} list.innerHTML=hits.map(function(h){return '<button type="button" class="kfg-ac__item">'+esc(h)+'</button>';}).join(''); list.hidden=false; Array.prototype.forEach.call(list.children,function(b){ b.addEventListener('click',function(){ var label=b.textContent; inp.value=label; s.auto=label; close(); var g=guessType(label); if(g&&g!==s.fahrzeug){ s.fahrzeug=g; s.ansicht='seiteL'; s.aktiv=null; save(); renderApp(); } else { save(); } }); }); }
    inp.addEventListener('input',show); inp.addEventListener('focus',show);
    document.addEventListener('click',function(e){ if(e.target!==inp&&!list.contains(e.target)) close(); });
  }

  /* ── Events ────────────────────────────────────────────────── */
  function wirePanel(){
    var by=function(id){return document.getElementById(id);}, on=function(el,ev,fn){if(el)el.addEventListener(ev,fn);};
    wireAuto();
    qsa('[data-fz]').forEach(function(b){on(b,'click',function(){s.fahrzeug=b.getAttribute('data-fz');s.ansicht='seiteL';s.aktiv=null;renderApp();});});
    qsa('[data-acol]').forEach(function(b){on(b,'click',function(){s.fahrzeugfarbe=b.getAttribute('data-acol');s.fahrzeugfarbeName=b.getAttribute('data-acn');renderApp();});});
    on(by('kfg-acolor'),'input',function(){s.fahrzeugfarbe=this.value;s.fahrzeugfarbeName='Eigene Farbe';renderPreview();}); on(by('kfg-acolor'),'change',save);
    qsa('[data-folie]').forEach(function(b){on(b,'click',function(){s.folie=b.getAttribute('data-folie');var fo=folieObj();if(fo.finishes.indexOf(s.finish)<0)s.finish=fo.finishes[0];renderApp();});});
    qsa('[data-finish]').forEach(function(b){on(b,'click',function(){s.finish=b.getAttribute('data-finish');renderApp();});});
    qsa('[data-col]').forEach(function(b){on(b,'click',function(){s.farbe=b.getAttribute('data-col');s.farbeName=b.getAttribute('data-cn');renderApp();});});
    on(by('kfg-color'),'input',function(){s.farbe=this.value;s.farbeName='Eigener Code';renderPreview();var h=by('kfg-hex');if(h)h.value=this.value;}); on(by('kfg-color'),'change',save);
    on(by('kfg-hex'),'change',function(){var v=this.value.trim();if(/^#?[0-9a-f]{6}$/i.test(v)){s.farbe=v[0]==='#'?v:'#'+v;s.farbeName='Eigener Code';renderApp();}});
    // Schritt 2: Bauteil-Farbe
    qsa('[data-pick]').forEach(function(b){on(b,'click',function(){s.aktiv=s.ansicht+':'+b.getAttribute('data-pick');renderPanel();renderPreview();});});
    qsa('[data-pcol]').forEach(function(b){on(b,'click',function(){ var key=s.aktiv; if(!key)return; var b2=s.belegung[key]=s.belegung[key]||{}; if(b.getAttribute('data-pcol')==='orig'){ b2.unwrap=true; delete b2.col; } else { delete b2.unwrap; delete b2.col; } if(!b2.unwrap&&!b2.col) delete s.belegung[key]; renderPanel(); renderPreview(); save(); });});
    on(by('kfg-pcustom'),'input',function(){ var key=s.aktiv; if(!key)return; var b2=s.belegung[key]=s.belegung[key]||{}; b2.col=this.value; delete b2.unwrap; renderPreview(); }); on(by('kfg-pcustom'),'change',function(){ renderPanel(); save(); });
    // Schritt 0: eigenes Fahrzeugfoto
    var fdrop=by('kfg-fotodrop'), ffile=by('kfg-fotofile');
    if(fdrop&&ffile){ on(fdrop,'click',function(){ffile.click();}); on(fdrop,'keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();ffile.click();}});
      ['dragover','dragenter'].forEach(function(ev){on(fdrop,ev,function(e){e.preventDefault();fdrop.classList.add('drag');});});
      ['dragleave','drop'].forEach(function(ev){on(fdrop,ev,function(e){e.preventDefault();fdrop.classList.remove('drag');});});
      on(fdrop,'drop',function(e){if(e.dataTransfer.files[0])loadFoto(e.dataTransfer.files[0]);});
      on(ffile,'change',function(){if(this.files[0])loadFoto(this.files[0]);}); }
    on(by('kfg-foto-del'),'click',function(){ s.foto=null; s.fotoName=''; s._fotoFile=null; s.basis='schema'; renderApp(); });
    // Objekt-Editor (Schritt 2 – Schema- UND Foto-Modus)
    on(by('kfg-fadd-text'),'click',function(){ var o={id:s.objNextId++,typ:'text',text:'Musterfirma',fs:22,color:s.farbe,x:240,y:(s.basis==='foto'?118:130)}; objs().push(o); setSel(o.id); renderPanel(); renderPreview(); save(); });
    on(by('kfg-fadd-bild'),'click',function(){ var n=0; objs().forEach(function(x){if(x.typ==='bild')n++;}); if(n>=5){ alert('Maximal 5 Bilder.'); return; } var o={id:s.objNextId++,typ:'bild',img:null,imgName:'',scale:1,x:240,y:140}; objs().push(o); setSel(o.id); renderPanel(); renderPreview(); save(); });
    qsa('[data-fsel]').forEach(function(b){on(b,'click',function(){ setSel(parseInt(b.getAttribute('data-fsel'),10)); renderPanel(); renderPreview(); });});
    on(by('kfg-fotext'),'input',function(){ var o=fObj(selId()); if(o){o.text=this.value; renderPreview(); save();} });
    on(by('kfg-fofs'),'input',function(){ var o=fObj(selId()); if(o){o.fs=parseInt(this.value,10); renderPreview(); save();} });
    on(by('kfg-focol'),'input',function(){ var o=fObj(selId()); if(o){o.color=this.value; renderPreview(); save();} });
    var fodrop=by('kfg-fodrop'), fofile=by('kfg-fofile');
    if(fodrop&&fofile){ on(fodrop,'click',function(){fofile.click();}); on(fodrop,'keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fofile.click();}});
      ['dragover','dragenter'].forEach(function(ev){on(fodrop,ev,function(e){e.preventDefault();fodrop.classList.add('drag');});});
      ['dragleave','drop'].forEach(function(ev){on(fodrop,ev,function(e){e.preventDefault();fodrop.classList.remove('drag');});});
      on(fodrop,'drop',function(e){var o=fObj(selId()); if(o&&e.dataTransfer.files[0])loadFotoImg(e.dataTransfer.files[0],o);});
      on(fofile,'change',function(){var o=fObj(selId()); if(o&&this.files[0])loadFotoImg(this.files[0],o);}); }
    on(by('kfg-foscale'),'input',function(){ var o=fObj(selId()); if(o){o.scale=parseFloat(this.value); renderPreview(); save();} });
    on(by('kfg-fodel'),'click',function(){ var id=selId(), a=objs(); for(var i=a.length-1;i>=0;i--) if(a[i].id===id) a.splice(i,1); if(s._fotoFiles)delete s._fotoFiles[id]; s.sel[sceneKey()]=null; renderPanel(); renderPreview(); save(); });
    // Navigation
    on(by('kfg-back'),'click',function(){s.step=Math.max(0,s.step-1);renderApp();scrollTop();});
    on(by('kfg-next'),'click',next);
    on(by('kfg-tofoto'),'click',function(){s.step=0;renderApp();scrollTop();});
    on(by('kfg-form'),'submit',submitForm);
  }
  function scrollTop(){ window.scrollTo({top:app.offsetTop-80,behavior:'smooth'}); }
  function next(){ if(s.step===0){ if(!s.foto){alert('Bitte lade zuerst ein Foto deines Fahrzeugs hoch.');return;} if(!s.fahrzeug){alert('Bitte Karosserieform wählen.');return;} } s.step=Math.min(STEPS.length-1,s.step+1); renderApp(); scrollTop(); }

  function loadFoto(f){
    if(f.size>20*1024*1024){ alert('Datei zu groß (max 20 MB).'); return; }
    if(!/image\/(png|jpeg)/.test(f.type)){ alert('Bitte ein Foto als PNG oder JPG.'); return; }
    var r=new FileReader(); r.onload=function(){ s.foto=r.result; s.fotoName=f.name; s._fotoFile=f; s.basis='foto'; s.step=Math.max(s.step,0); renderApp(); }; r.readAsDataURL(f);
  }
  function loadFotoImg(f,o){
    if(f.size>20*1024*1024){ alert('Datei zu groß (max 20 MB).'); return; }
    if(!/image\/(png|jpeg|svg\+xml)/.test(f.type)){ alert('Bitte PNG, JPG oder SVG.'); return; }
    var r=new FileReader(); r.onload=function(){ o.img=r.result; o.imgName=f.name; s._fotoFiles=s._fotoFiles||{}; s._fotoFiles[o.id]=f; renderPanel(); renderPreview(); save(); }; r.readAsDataURL(f);
  }

  /* ── Export ────────────────────────────────────────────────── */
  function svgToCanvas(cb){ if(!s.foto){cb(null);return;} var W=1200,H=650,svg=buildSVG(true).replace('<svg ','<svg width="'+W+'" height="'+H+'" '),img=new Image(); img.onload=function(){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.drawImage(img,0,0,W,H);cb(cv);}; img.onerror=function(){cb(null);}; img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); }
  function exportPNG(){ svgToCanvas(function(cv){ if(!cv){alert('Vorschau noch nicht bereit.');return;} try{var a=document.createElement('a');a.download='printline-konfiguration.png';a.href=cv.toDataURL('image/png');a.click();}catch(e){alert('Export nicht möglich.');} }); }

  /* ── Absenden ──────────────────────────────────────────────── */
  function submitForm(e){
    e.preventDefault();
    var by=function(id){return document.getElementById(id);}, st=by('kfg-status'), btn=by('kfg-send');
    if(!by('kfg-consent').checked){alert('Bitte der Datenverarbeitung zustimmen.');return;}
    if(!by('kfg-name').value.trim()||!by('kfg-email').value.trim()){alert('Bitte Name und E-Mail angeben.');return;}
    var v=vh(), fo=folieObj();
    st.className='kfg-status show sending'; st.textContent='Wird gesendet …'; btn.disabled=true;
    svgToCanvas(function(cv){
      function buildFD(withFiles, blob){
        var fd=new FormData();
        fd.append('name',by('kfg-name').value.trim()); fd.append('email',by('kfg-email').value.trim());
        if(by('kfg-tel').value.trim()) fd.append('telefon',by('kfg-tel').value.trim());
        fd.append('_subject','Konfigurator-Anfrage: '+(s.auto||(v?v.name:'')));
        if(s.auto) fd.append('Fahrzeug',s.auto);
        fd.append('Karosserie',v?v.name:'');
        fd.append('Folie',fo.serie+' ('+fo.kurz+', bis '+fo.jahre+' J.)'); fd.append('Oberflaeche',finObj().name);
        fd.append('Wunschfarbe',s.farbeName+' ('+s.farbe+')');
        fd.append('Basis','Eigenes Fahrzeugfoto ('+(s.fotoName||'Foto')+')');
        var olines=[];
        (s.objekte.foto||[]).forEach(function(o,i){ olines.push('Objekt '+(i+1)+': '+(o.typ==='text'?('Text "'+String(o.text||'').replace(/\n/g,' / ')+'" (Größe '+(o.fs||20)+', Farbe '+(o.color||s.farbe)+')'):('Logo/Bild '+(o.imgName||'–')+' (Größe '+(o.scale||1)+'×)'))); });
        fd.append('Gestaltung_Objekte', olines.length?olines.join('\n'):'keine');
        fd.append('Einwilligung','Ja, Daten nur zur Bearbeitung der Anfrage');
        if(by('kfg-msg').value.trim()) fd.append('nachricht',by('kfg-msg').value.trim());
        if(withFiles && s._files){ var i=0; for(var key in s._files){ if(s._files[key]){ fd.append('Datei_'+(++i), s._files[key], s._files[key].name); } } }
        if(withFiles && s._fotoFile) fd.append('Fahrzeugfoto', s._fotoFile, s._fotoFile.name);
        if(withFiles && s._fotoFiles){ var fi2=0; for(var k2 in s._fotoFiles){ if(s._fotoFiles[k2]) fd.append('FotoLogo_'+(++fi2), s._fotoFiles[k2], s._fotoFiles[k2].name); } }
        if(withFiles && blob) fd.append('Vorschau', blob, 'vorschau.png');
        return fd;
      }
      function post(fd){ return fetch(FORMSPREE,{method:'POST',body:fd,headers:{'Accept':'application/json'}}); }
      function ok2(){ st.className='kfg-status show ok'; st.innerHTML='✓ Vielen Dank! Ihre Konfiguration ist bei uns – wir melden uns innerhalb eines Werktages mit einem kostenlosen Angebot.'; try{localStorage.removeItem(STORE);}catch(e2){} btn.disabled=false; }
      function bad(){ st.className='kfg-status show err'; st.innerHTML='⚠ Senden hat nicht geklappt. Bitte rufen Sie uns an: <a href="tel:+4915203016900">+49 152 03016900</a> oder per <a href="mailto:print2002@gmx.de">E-Mail</a>.'; btn.disabled=false; }
      function send(blob){ post(buildFD(true,blob)).then(function(r){ if(r.ok) ok2(); else return post(buildFD(false)).then(function(r2){ r2.ok?ok2():bad(); }); }).catch(function(){ post(buildFD(false)).then(function(r2){ r2.ok?ok2():bad(); }).catch(bad); }); }
      if(cv) cv.toBlob(function(b){ send(b); },'image/png'); else send(null);
    });
  }

  function qsa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  ladeAutos(); renderApp();
})();
