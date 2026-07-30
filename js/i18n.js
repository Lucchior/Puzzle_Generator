// js/i18n.js
// Dizionario delle traduzioni (IT/EN) e funzione di cambio lingua.
// Modulo indipendente: non conosce app.js, non chiama update() da solo —
// riceve una callback opzionale da eseguire dopo aver applicato la lingua
// (così la UI si aggiorna, ma i18n non deve sapere nulla della logica
// applicativa).
window.PZI18n = (function () {
  "use strict";

  var dict={
    it:{
      "hero-sub":"Tool gratuito per creare file SVG di puzzle con linguette realistiche — taglio laser & stampa 3D ready.",
      "chip-offers":"Offerte Anycubic","chip-maker":"Profilo Makeronline",
      "tool-title":"Puzzle Line Generator",
      "tool-sub":"Configura la griglia, visualizza l'anteprima e scarica l'SVG pronto per il taglio",
      "sec-photo":"Foto di riferimento",
      "lbl-photo":"Carica una foto (JPG/PNG)",
      "lbl-photo-fit":"Adattamento immagine",
      "opt-fit-cover":"Riempi tutta l'area (ritaglia)",
      "opt-fit-contain":"Adatta senza ritagliare",
      "btn-remove-photo":"Rimuovi foto",
      "disclaimer-photo":"Questa immagine serve solo come anteprima visiva, mostrata localmente nel tuo browser: non viene mai caricata su alcun server e non fa parte del file SVG esportato (che contiene solo le linee di taglio). Si ritaglia automaticamente per riempire l'area del puzzle e non viene salvata da nessuna parte — ricaricando la pagina andrà persa. Carica solo immagini di cui hai i diritti d'uso.",
      "err-photo-type":"Formato non supportato: carica un file JPG o PNG",
      "err-photo-size":"File troppo grande: il limite è 20 MB",
      "sec-dimensions":"Dimensioni","sec-border":"Bordo esterno","sec-grid":"Griglia",
      "sec-tabs":"Linguette","sec-export":"Esporta",
      "lbl-width":"Larghezza (mm)","lbl-height":"Altezza (mm)","lbl-radius":"Raggio angoli (mm)",
      "lbl-margin":"Margine (mm)","hint-margin":"Spazio uniforme attorno alla griglia",
      "toggle-solid":"Bordo pieno nero","toggle-solid-hint":"Per stampa 3D — fill solido",
      "toggle-solid-on":"Attivo — fill nero solido per slicer 3D",
      "lbl-cols":"Colonne","lbl-rows":"Righe","lbl-seed":"Seed — forma casuale",
      "lbl-tabsize":"Dimensione linguetta","hint-tabsize":"% — consigliato 15–25%",
      "lbl-jitter":"Irregolarità (jitter)","hint-jitter":"0 = simmetrico · 13 = organico",
      "lbl-stroke":"Spessore linea SVG (mm)","hint-stroke":"0.1 mm — ottimale per laser",
      "btn-download":"Scarica SVG","preview-title":"Anteprima live",
      "btn-reset":"Ripristina valori predefiniti",
      "err-width":"Deve essere tra 10 e 2000 mm",
      "err-height":"Deve essere tra 10 e 2000 mm",
      "err-margin":"Deve essere tra 0 e 100 mm",
      "err-xn":"Deve essere tra 2 e 100",
      "err-yn":"Deve essere tra 2 e 100",
      "err-strokeWidth":"Deve essere tra 0.01 e 5 mm",
      "err-radius":"Troppo grande per queste dimensioni (max {max} mm)",
      "leg-h":"orizzontali","leg-v":"verticali","leg-b":"bordo puzzle","leg-m":"margine",
      "footer-by":"Creato da","footer-offers":"Offerte Anycubic"
    },
    en:{
      "hero-sub":"Free tool to generate puzzle SVG files with realistic tabs — laser cutting & 3D printing ready.",
      "chip-offers":"Anycubic Deals","chip-maker":"Makeronline Profile",
      "tool-title":"Puzzle Line Generator",
      "tool-sub":"Set up the grid, preview the result and download the SVG ready for cutting",
      "sec-photo":"Reference photo",
      "lbl-photo":"Upload a photo (JPG/PNG)",
      "lbl-photo-fit":"Image fit",
      "opt-fit-cover":"Fill entire area (crop)",
      "opt-fit-contain":"Fit without cropping",
      "btn-remove-photo":"Remove photo",
      "disclaimer-photo":"This image is only a visual preview, shown locally in your browser: it is never uploaded to any server and is not included in the exported SVG file (which only contains the cut lines). It's automatically cropped to fill the puzzle area and isn't saved anywhere — reloading the page will clear it. Only upload images you have the rights to use.",
      "err-photo-type":"Unsupported format: please upload a JPG or PNG file",
      "err-photo-size":"File too large: the limit is 20 MB",
      "sec-dimensions":"Dimensions","sec-border":"Outer border","sec-grid":"Grid",
      "sec-tabs":"Tabs","sec-export":"Export",
      "lbl-width":"Width (mm)","lbl-height":"Height (mm)","lbl-radius":"Corner radius (mm)",
      "lbl-margin":"Margin (mm)","hint-margin":"Uniform spacing around the grid",
      "toggle-solid":"Solid black border","toggle-solid-hint":"For 3D printing — solid fill",
      "toggle-solid-on":"Active — solid black fill for 3D slicer",
      "lbl-cols":"Columns","lbl-rows":"Rows","lbl-seed":"Seed — random shape",
      "lbl-tabsize":"Tab size","hint-tabsize":"% — recommended 15–25%",
      "lbl-jitter":"Irregularity (jitter)","hint-jitter":"0 = symmetric · 13 = organic",
      "lbl-stroke":"SVG stroke width (mm)","hint-stroke":"0.1 mm — optimal for laser",
      "btn-download":"Download SVG","preview-title":"Live preview",
      "btn-reset":"Reset to defaults",
      "err-width":"Must be between 10 and 2000 mm",
      "err-height":"Must be between 10 and 2000 mm",
      "err-margin":"Must be between 0 and 100 mm",
      "err-xn":"Must be between 2 and 100",
      "err-yn":"Must be between 2 and 100",
      "err-strokeWidth":"Must be between 0.01 and 5 mm",
      "err-radius":"Too large for these dimensions (max {max} mm)",
      "leg-h":"horizontal","leg-v":"vertical","leg-b":"puzzle border","leg-m":"margin",
      "footer-by":"Made by","footer-offers":"Anycubic Deals"
    }
  };

  var currentLang = "it";

  function setLang(lang, onAfterApply) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.getElementById("lang-pill").setAttribute("data-lang", lang);
    document.getElementById("btn-ita").classList.toggle("active", lang === "it");
    document.getElementById("btn-eng").classList.toggle("active", lang === "en");
    var d = dict[lang];
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (d[k] !== undefined) el.textContent = d[k];
    });
    var solid = document.getElementById("solidBorder").checked;
    document.getElementById("border-hint").textContent = d[solid ? "toggle-solid-on" : "toggle-solid-hint"];
    if (typeof onAfterApply === "function") onAfterApply();
  }

  function current() {
    return currentLang;
  }

  function get(lang) {
    return dict[lang];
  }

  return { setLang: setLang, current: current, get: get };
})();
