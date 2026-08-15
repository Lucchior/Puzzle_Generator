# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate qui.
Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
il versionamento segue [Semantic Versioning](https://semver.org/lang/it/).

## [Unreleased]

## [2.0.0] - 2026-08-15

Unione dei due generatori (puzzle e quadranti d'orologio) in un unico sito.
Il repository `clock-svg-generator` confluisce qui: da ora il sito ha una
home con la scelta dello strumento e due pagine, `puzzle.html` e
`orologio.html`, che condividono grafica, tema e lingua.

### Added

- Pagina iniziale (`index.html`) con le due card degli strumenti e una barra
  di navigazione presente su tutte le pagine.
- Generatore di quadranti d'orologio (`orologio.html`) con tutto il codice
  del progetto `clock-svg-generator`: quadrante tondo o quadrato, tacche dei
  minuti, indici arabi/romani/marker/personalizzati, tre lancette, anteprima
  statica o live, export per livelli o combinato.
- Tema chiaro/scuro su tutto il sito, con interruttore nell'header e scelta
  ricordata in `localStorage`. Prima esisteva solo nel generatore di orologi;
  al puzzle è stata aggiunta la palette chiara che gli mancava.
- La lingua scelta (IT/EN) viene ricordata e resta impostata passando da una
  pagina all'altra.
- Export "Scarica tutti" dell'orologio come **file ZIP** unico tramite JSZip
  (caricato da CDN). Se la libreria non è disponibile si torna
  automaticamente ai download in sequenza, senza rompere nulla.
- Suite di test per la geometria del quadrante (`test/clock-geometry.test.js`):
  angoli di `polar`, numeri romani con e senza `IIII` tradizionale, path del
  quadrante quadrato con clamp del raggio, wrapper SVG in millimetri.
- Workflow di CI (`.github/workflows/ci.yml`) che esegue i test su Node 18,
  20 e 22 a ogni push e pull request — era citato nel README ma non esisteva.
- File `LICENSE` con il testo completo della licenza MIT.

### Changed

- **CSS riorganizzato**: i due progetti usavano 27 classi con lo stesso nome e
  regole diverse. Ora `css/base.css` contiene il design system condiviso
  (token, temi, header, hero, footer, campi, switch, slider, pulsanti,
  anteprima) e ogni pagina aggiunge solo il proprio delta in `home.css`,
  `puzzle.css` e `clock.css`.
- **Accento unico** per tutto il sito (viola). È stato introdotto il token
  `--on-accent` per il testo sopra l'accento: i colori scuri usati sopra
  l'arancio dell'orologio sarebbero risultati illeggibili sul viola.
- **i18n unificato**: al posto di `PZI18n` (puzzle) e delle funzioni globali
  `applyI18n()`/`setLang()` (orologio) c'è un unico motore condiviso,
  `window.LSI18n`, che raccoglie i dizionari registrati da ogni pagina e
  gestisce `data-i18n`, `data-i18n-ph`, `data-i18n-title` e `data-i18n-aria`.
- `render.js` dell'orologio non legge più il dizionario direttamente
  (`i18n[currentLang][...]`) ma passa da `LSI18n.t()`.
- Tema, fallback del logo e contatore visite sono usciti dai due tool e
  vivono in `js/shared/site.js`, in una IIFE che non espone globali.
- File JavaScript riorganizzati in `js/shared/`, `js/puzzle/`, `js/clock/` e
  `js/home/`; i test aggiornati di conseguenza.
- README riscritto per il sito unificato: struttura, tabelle dei parametri di
  entrambi i tool, note su CSS/JS condivisi e su come aggiungere una stringa
  tradotta.
- `package.json` rinominato in `ludwing-svg-tools`, versione 2.0.0, licenza
  dichiarata MIT (ora coerente con il file `LICENSE` e con il README).

### Fixed

- L'export "Scarica tutti" dell'orologio lanciava cinque download separati
  distanziati da `setTimeout`: i browser ne bloccano quasi sempre più di uno
  per volta. Ora i livelli vengono raccolti in un unico ZIP.
- Il tema viene applicato durante il parsing dell'`<head>`, così chi usa il
  tema chiaro non vede più il lampo di pagina scura al caricamento.
- Il focus da tastiera è ora visibile anche sugli switch on/off, il cui input
  reale è nascosto con `opacity: 0` per lo stile personalizzato.
- L'anteprima live poteva finire fuori dallo schermo scorrendo il pannello
  dei controlli quando questo diventava più alto di lei (es. dopo aver
  aggiunto la sezione "Foto di riferimento"). Ora l'anteprima resta
  "agganciata" in vista (`position: sticky`) mentre si scorre il pannello,
  solo su schermi abbastanza larghi da avere le due colonne affiancate
  (da 900px in su — sotto quella soglia il layout è già impilato in
  un'unica colonna e non serve).

## [1.1.0] - 2026-07-25

### Added

- **Foto di riferimento**: è ora possibile caricare un'immagine JPG/PNG
  per vedere un'anteprima di come il puzzle finito apparirebbe con quella
  foto, e regolare di conseguenza i parametri (dimensioni, margine,
  griglia). L'immagine:
  - resta **sempre e solo un'anteprima locale** nel browser: non viene
    mai caricata su alcun server (letta con `FileReader`, nessuna
    chiamata di rete) e **non viene mai inclusa nel file SVG esportato**
    (che contiene solo le linee di taglio, esattamente come prima);
  - non viene salvata da nessuna parte — si perde ricaricando la pagina;
  - supporta due modalità di adattamento (riempi con ritaglio / adatta
    senza ritagliare);
  - è accompagnata da un disclaimer visibile in UI (privacy, assenza
    dall'export, diritti d'uso dell'immagine caricata);
  - viene validata (formato JPG/PNG, limite 20 MB) con messaggi d'errore
    chiari in caso contrario.

### Fixed

- **Determinismo del seed**: a parità di seed, `generateHorizontal()`
  poteva produrre un primo "tab" leggermente diverso a seconda di cosa
  era stato generato in precedenza nella stessa sessione del browser
  (es. l'anteprima casuale mostrata al primo caricamento pagina),
  contraddicendo la promessa "stesso seed = stesso puzzle". Scoperto
  durante lo sviluppo della foto di riferimento, con un test di
  regressione automatico. Ora ogni chiamata a `generateHorizontal()`
  riparte da uno stato pulito, indipendentemente dalla cronologia della
  sessione.
- Il pulsante "Ripristina valori predefiniti" (e qualunque altro elemento
  con l'attributo `hidden`) poteva restare visibile anche quando
  nascosto, perché la regola CSS `.btn-reset{display:flex}` aveva la
  precedenza sull'attributo nativo `hidden`. Aggiunta una regola
  difensiva `[hidden]{display:none!important}`.

### Added (test)

- Nuovo test di regressione in `test/geometry.test.js` per il bug del
  determinismo del seed sopra descritto.

## [1.0.0] - 2026-07-25

Prima versione "hardened" del progetto: stessa identica esperienza d'uso e
stessa identica geometria dei puzzle generati (a parità di seed) rispetto
alla versione originale a file singolo, ma con bug corretti, struttura
riorganizzata e una prima suite di test automatici.

### Fixed

- Lo spessore del bordo nel file SVG esportato non coincideva con quello
  mostrato nell'anteprima live (mancava il fattore ×1.5 applicato solo in
  anteprima). Ora export e anteprima sono sempre identici.
- Nessuna validazione reale impediva di inserire valori fuori range
  (margine negativo, colonne/righe a zero, ecc.), producendo in alcuni
  casi SVG geometricamente non validi. Tutti i campi principali sono ora
  clampati prima della generazione.
- Il raggio degli angoli non era mai limitato rispetto alle dimensioni del
  pezzo: con raggio grande e pezzo piccolo gli archi potevano
  autointersecarsi. Ora il raggio massimo è calcolato dinamicamente come
  metà del lato più corto.
- Markup non valido (due `<label>` annidati) sul toggle "Bordo pieno
  nero", che poteva causare un doppio toggle in alcuni browser.
- Le etichette dei campi non avevano l'attributo `for`: cliccarle non
  spostava il focus sul campo corrispondente.
- L'URL del Blob creato per il download dell'SVG non veniva mai
  rilasciato (`URL.revokeObjectURL`).

### Changed

- **Ristrutturazione file**: da un unico `index.html` (HTML+CSS+JS
  inline) a `index.html` (solo markup) + `css/style.css` +
  `js/{random,geometry,i18n,app}.js`. Nessun build step o bundler
  richiesto: il progetto si apre ancora con un doppio click, senza
  server locale.
- Tutti gli handler di evento inline (`oninput`, `onclick`, `onchange`,
  `onblur`) sono stati rimossi dall'HTML e centralizzati in `js/app.js`
  tramite `addEventListener`.
- L'algoritmo di generazione delle linguette (curve di Bézier seedate) è
  stato incapsulato in una closure (`js/geometry.js`) invece di vivere in
  ~17 variabili globali (`a,b,c,d,e,t,j,flip,xi,yi,xn,yn,vertical,
  offset,width,height`).
- Il colore `--faint`, usato per etichette e testi di aiuto, è stato
  schiarito da `#4a4a54` a `#7a7a90`: il contrasto misurato sullo sfondo
  scuro passa da 2.22:1 a 4.64:1, superando la soglia WCAG AA (4.5:1) per
  il testo piccolo.

### Added

- Messaggi d'errore visibili e tradotti (IT/EN) sotto i campi con valori
  fuori range, con correzione automatica del valore all'uscita dal campo
  (blur).
- Pulsante "Ripristina valori predefiniti".
- Aggiornamento dell'anteprima con debounce (`requestAnimationFrame`),
  per restare fluido anche su griglie grandi (fino a 100×100).
- Contorno di focus visibile da tastiera sul toggle "Bordo pieno nero" e
  sugli slider (in precedenza il controllo reale era invisibile per lo
  styling custom e non mostrava alcun indicatore di focus).
- Fallback silenzioso se il logo esterno nell'header non si carica.
- Prima suite di **test automatici** (`test/random.test.js`,
  `test/geometry.test.js`) con il test runner nativo di Node
  (`node:test`, zero dipendenze da installare) — 18 test, inclusi test
  di regressione "golden value" che proteggono la riproducibilità dei
  seed già usati dai maker.
- **CI su GitHub Actions**: la suite di test viene eseguita ad ogni push
  e pull request su Node 18/20/22. Il deploy resta invariato (GitHub
  Pages da `main`, come già descritto nel README).
- `package.json` con script `npm test` e prima versione dichiarata
  (SemVer).

### Known limitations

- Il logo dell'header, il font Google e il badge dei visitatori restano
  hostati esternamente (vedi sezione "Technical Details" del README);
  hanno tutti un fallback silenzioso, ma non sono stati portati in
  locale in questa release.
- Lint automatico (ESLint) non ancora configurato/verificato in CI: vedi
  `eslint.config.js` fornito come base, da testare con `npm install`
  quando si ha accesso a Internet.

[Unreleased]: https://github.com/lucchior/Puzzle_Generator/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/lucchior/Puzzle_Generator/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/lucchior/Puzzle_Generator/releases/tag/v1.0.0
