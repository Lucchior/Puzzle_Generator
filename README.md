# 🛠️ Ludwing SVG Tools

> Due generatori SVG gratuiti che girano interamente nel browser: **griglie di puzzle** e **quadranti d'orologio**, pronti per taglio laser e stampa 3D.

**Sito live:** [lucchior.github.io/Puzzle_Generator](https://lucchior.github.io/Puzzle_Generator/)

---

## 🔍 Cos'è

Questo repository ospita **un unico sito con due strumenti**:

| Strumento | Pagina | Cosa fa |
|-----------|--------|---------|
| 🧩 **Puzzle Generator** | `puzzle.html` | Griglie di puzzle con linguette realistiche generate da seed, esportate come singolo SVG |
| 🕐 **Clock Face Generator** | `orologio.html` | Quadranti tondi o quadrati con indici, tacche e lancette, esportati livello per livello |

Nessun server, nessun account, nessun build step, nessun `npm install`: sono file statici e tutta la generazione avviene nel browser con JavaScript puro.

Le pagine caricano quattro risorse esterne **facoltative** — i font Google, il logo nell'header, il badge contavisite e la libreria JSZip per l'export ZIP dell'orologio. Se una di queste non è raggiungibile il sito continua a funzionare identico: font di sistema, logo nascosto, badge nascosto, e download dei file uno alla volta invece che in ZIP.

---

## ✨ Funzionalità

### Comuni a tutto il sito

- 🌗 **Tema chiaro e scuro** con interruttore, ricordato tra una visita e l'altra
- 🌍 **Interfaccia bilingue IT/EN**, con la lingua che resta impostata passando da un tool all'altro
- 📐 **Millimetri reali** — ogni SVG esce già dimensionato in mm tramite `viewBox`
- 🎨 **Design system condiviso**: un solo accento, un solo set di componenti su tutte le pagine
- ♿ Focus da tastiera visibile su tutti i controlli, campi con `aria-describedby`, errori annunciati con `role="alert"`

### 🧩 Generatore di puzzle

- 🎛️ Controllo parametrico completo: larghezza, altezza, raggio angoli, margine, colonne, righe
- 🔀 Linguette casuali **riproducibili**: lo stesso seed produce sempre lo stesso puzzle
- 📏 Anteprima live che si aggiorna a ogni modifica
- 🖊️ Spessore linea regolabile, sincronizzato tra anteprima ed export
- ⬛ **Bordo pieno nero** per riempire il margine di nero, utile agli slicer 3D
- ✅ Validazione live: i valori fuori range vengono segnalati e corretti al blur
- ↺ Ripristino di tutti i parametri con un click
- 🖼️ **Foto di riferimento** per vedere come verrebbe il puzzle finito — resta nel browser, non viene mai caricata da nessuna parte e non entra nell'SVG esportato

### 🕐 Generatore di quadranti

- ⭕ Quadrante **tondo o quadrato**, con smusso angoli regolabile
- 🕰️ 60 tacche dei minuti, con lunghezza e spessore configurabili
- 🔢 Indici in **numeri arabi, romani** (con opzione `IIII` tradizionale), trattino, pallino, quadrato, triangolo, rombo — oppure nessuno
- 🖼️ **Immagini personalizzate** al posto di indici, tacche e lancette (SVG, PNG o JPG)
- ⏱️ Tre lancette (ore, minuti, secondi) in quattro forme: baguette, spada, dauphine, breguet
- ▶️ Anteprima **statica o live** con l'ora reale
- 📦 **Export per livelli**: ogni livello è un SVG autonomo, così puoi tagliarlo in materiali o colori diversi
- 🗜️ **Scarica tutti** raccoglie i livelli in un unico file ZIP; **Tutto in un unico file** sovrappone tutto in un solo SVG

---

## 🚀 Come si usa

1. Apri il sito e scegli lo strumento dalla home (o dalla barra in alto)
2. Configura i parametri nel pannello di sinistra — l'anteprima si aggiorna in tempo reale
3. Scarica i file dal pulsante verde in fondo al pannello

### Parametri del puzzle

| Parametro | Descrizione | Range consigliato |
|-----------|-------------|-------------------|
| **Larghezza / Altezza** | Dimensioni complessive in mm | fino a 2000 mm |
| **Raggio angoli** | Arrotondamento del bordo esterno | 0–10 mm |
| **Margine** | Spazio uniforme attorno alla griglia | 3–15 mm |
| **Bordo pieno** | Riempie il margine di nero (per slicer 3D) | on/off |
| **Colonne / Righe** | Numero di pezzi per lato | 2–100 |
| **Seed** | Determina la forma casuale di tutte le linguette | 0–9999 |
| **Dimensione linguetta** | % della cella occupata dalla linguetta | 15–25% |
| **Irregolarità (jitter)** | Quanto le linguette sono organiche | 0 (simmetrico) – 13 |
| **Spessore linea** | Spessore del tratto nell'SVG esportato | 0.05–0.5 mm |

### Parametri principali del quadrante

| Parametro | Descrizione | Range |
|-----------|-------------|-------|
| **Diametro / Lato** | Dimensione del quadrante in mm | 40–600 mm |
| **Spessore bordo** | Tratto del profilo esterno | 0–20 mm |
| **Lunghezza tacche** | Tacche dei minuti | 0.5–20 mm |
| **Dimensione indici** | Altezza di numeri o marker | 2–40 mm |
| **Distanza dal centro** | Posizione degli indici sul raggio | 30–98% |
| **Lunghezza lancette** | In % del raggio | 10–98% |
| **Coda lancette** | Sporgenza oltre il perno | 0–50% |

---

## 📂 File esportati

Tutti gli SVG hanno `width` e `height` **in millimetri** e un `viewBox` coerente, quindi si aprono già in scala 1:1 in LightBurn, RDWorks, Inkscape o in uno slicer.

Il puzzle esporta `puzzle_lines.svg`, con path separati per linee orizzontali, verticali, bordo e margine:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="310mm" height="210mm" viewBox="0 0 310 210">
  <path fill="none" stroke="black" stroke-width="0.1" d="..."/> <!-- margine -->
  <path fill="none" stroke="black" stroke-width="0.1" d="..."/> <!-- linguette orizzontali -->
  <path fill="none" stroke="black" stroke-width="0.1" d="..."/> <!-- linguette verticali -->
  <path fill="none" stroke="black" stroke-width="0.15" d="..."/> <!-- bordo puzzle -->
</svg>
```

L'orologio esporta `dial.svg`, `indices.svg`, `hand_hour.svg`, `hand_minute.svg`, `hand_second.svg` (in ZIP con "Scarica tutti") oppure `clock_combined.svg` con tutto sovrapposto. **Le lancette vengono esportate puntate verso le ore 12**, pronte per essere ruotate dal tuo software.

---

## 🗂️ Struttura del progetto

```
Puzzle_Generator/
├── index.html                 # Home: scelta dello strumento
├── puzzle.html                # Generatore di puzzle
├── orologio.html              # Generatore di quadranti
├── css/
│   ├── base.css               # Design system: token, temi, header, footer, componenti
│   ├── home.css               # Griglia delle card della home
│   ├── puzzle.css             # Solo il delta del puzzle
│   └── clock.css              # Solo il delta dell'orologio
├── js/
│   ├── shared/
│   │   ├── i18n.js            # Motore di traduzione + dizionario comune (window.LSI18n)
│   │   └── site.js            # Tema, fallback asset esterni, contavisite, anno footer
│   ├── home/i18n.js
│   ├── puzzle/
│   │   ├── random.js          # PRNG con seed (window.PZRandom / require()-abile)
│   │   ├── geometry.js        # Generazione dei path (window.PZGeometry / require()-abile)
│   │   ├── i18n.js            # Dizionario IT/EN del puzzle
│   │   └── app.js             # Binding DOM, validazione, anteprima, export
│   └── clock/
│       ├── i18n.js            # Dizionario IT/EN dell'orologio
│       ├── utils.js           # polar/round/toRoman/download (parzialmente require()-abile)
│       ├── dial.js            # Quadrante e tacche
│       ├── indices.js         # Indici delle ore
│       ├── hands.js           # Lancette
│       ├── render.js          # Lettura configurazione e disegno dell'anteprima
│       ├── export.js          # Export per livelli, ZIP e file combinato
│       ├── sliders.js         # Genera uno slider accanto a ogni campo numerico
│       └── main.js            # Avvio e binding degli eventi
├── test/
│   ├── random.test.js         # PRNG
│   ├── geometry.test.js       # Geometria del puzzle (con test di regressione)
│   └── clock-geometry.test.js # Angoli, numeri romani, path del quadrante
├── docs/tab-geometry.md       # Spiegazione dell'algoritmo delle linguette
├── .github/workflows/
│   ├── ci.yml                 # Test su ogni push/PR (Node 18/20/22)
│   └── static.yml             # Deploy su GitHub Pages
├── package.json
├── eslint.config.js
├── CHANGELOG.md
└── LICENSE                    # MIT
```

### Come sono organizzati CSS e JavaScript

Il punto delicato dell'unione dei due progetti era che i due tool usavano **le stesse classi CSS con regole diverse** (27 nomi in comune) e che l'orologio definisce **funzioni globali** (`$`, `download`, `round`, `renderAll`…). La soluzione:

- **CSS**: `base.css` contiene tutto ciò che è comune; ogni tool aggiunge solo il proprio delta. Un solo posto in cui cambiare accento, spaziature o tipografia.
- **JavaScript**: ogni tool vive su una pagina propria, quindi i suoi globali non incontrano mai quelli dell'altro. Il codice condiviso (`js/shared/`) è invece racchiuso in IIFE e non espone nulla oltre a `window.LSI18n`.
- **Tema e lingua** sono salvati in `localStorage` (`lsvgTheme`, `lsvgLang`), così restano coerenti navigando tra le pagine.

### Aggiungere una traduzione o una stringa

Ogni testo traducibile ha un attributo `data-i18n="chiave"` nell'HTML (esistono anche `data-i18n-ph`, `data-i18n-title` e `data-i18n-aria` per placeholder, tooltip ed etichette ARIA). Le chiavi vivono nel file `i18n.js` del tool, registrate con `LSI18n.register({ it: {...}, en: {...} })`. Dal codice si legge una stringa con `LSI18n.t("chiave", { var: valore })`.

Se aggiungi una chiave, **mettila in entrambe le lingue**: il motore non fa fallback e mostrerebbe una stringa vuota.

---

## 🧪 Sviluppo

L'app non ha dipendenze a runtime. La suite di test usa solo il runner integrato in Node (`node:test`), quindi non serve nemmeno `npm install`:

```bash
npm test
```

I test caricano gli stessi identici file che girano nel browser: sono scritti come piccoli moduli UMD, quindi funzionano sia come `<script>` sia via `require()`. Coprono il PRNG, la geometria del puzzle (con test "golden value" che verificano che uno stesso seed continui a produrre le stesse forme — vedi `docs/tab-geometry.md`) e la matematica del quadrante (posizione angolare degli indici, numeri romani, path del quadrante quadrato).

La CI (`.github/workflows/ci.yml`) esegue la stessa suite su ogni push e pull request verso `main`, con Node 18, 20 e 22.

Per far girare il sito in locale bastano i file statici: apri `index.html` in un browser, oppure servi la cartella con `python3 -m http.server` se preferisci un contesto HTTP.

---

## 🌐 Deploy

Il deploy avviene tramite **GitHub Pages** dal branch `main` (`.github/workflows/static.yml`): ogni push aggiorna il sito.

> **Nota sui link esistenti:** la root del sito ora è la home con la scelta dello strumento. Chi aveva salvato `lucchior.github.io/Puzzle_Generator/` continua ad arrivare sul sito e trova il generatore di puzzle a un click di distanza, su `/puzzle.html`.

---

## 🖨️ Casi d'uso

- **Taglio laser** — puzzle e quadranti in legno, acrilico, cartone o pelle
- **Stampa 3D** — bordo pieno per cornici stampabili, quadranti multi-livello a colori
- **Didattica** — template di puzzle personalizzati per scuole e laboratori
- **Regali** — puzzle fotografici e orologi da parete su misura

---

## 🤝 Sostieni il progetto

Se questi strumenti ti hanno fatto risparmiare tempo, puoi offrirmi un caffè su PayPal:

👉 [paypal.me/Lucchior](https://paypal.me/Lucchior)

---

## 👤 Autore

**Ludwing** — Maker, Anycubic Insider, appassionato di stampa 3D e taglio laser.

- 🔧 [Profilo Makeronline](https://www.makeronline.com/en/user/personalInfo/c302cd8c-3538-4ba1-b329-09ef4cabfb5d.html?trackUserType=1)
- ⚡ [Offerte Anycubic](https://lucchior.github.io/Anycubic_offerte/)

---

## 📄 Licenza

Distribuito con licenza **MIT** — vedi il file [LICENSE](LICENSE). Puoi usarlo, modificarlo e ridistribuirlo liberamente, anche in progetti commerciali, mantenendo l'avviso di copyright.

---

*Costruito con ❤️ per la comunità maker.*
