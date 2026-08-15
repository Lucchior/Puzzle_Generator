// js/clock/export.js
// Esportazione dei livelli del quadrante come file SVG.
//
// Ogni livello (quadrante, indici, lancette) è un file autonomo, così può
// essere tagliato/stampato in materiali o colori diversi. "Scarica tutti"
// li raccoglie in un unico ZIP: prima venivano lanciati cinque download in
// sequenza con dei setTimeout, e i browser ne bloccano quasi sempre più di
// uno per volta.

function exportDial() {
  var cfg = readCFG();
  download("dial.svg", buildDialStandaloneSVG(cfg));
}

function exportIndices() {
  var cfg = readCFG();
  download("indices.svg", buildIndicesStandaloneSVG(cfg));
}

function exportHand(which) {
  var cfg = readCFG();
  download("hand_" + which + ".svg", buildHandStandaloneSVG(cfg, which));
}

// Elenco dei livelli attualmente esportabili, nell'ordine in cui compaiono
// nel pannello. Usato sia dallo ZIP sia dal fallback a download singoli.
function collectLayerFiles(cfg) {
  var files = [
    { name: "dial.svg", content: buildDialStandaloneSVG(cfg) },
    { name: "indices.svg", content: buildIndicesStandaloneSVG(cfg) },
    { name: "hand_hour.svg", content: buildHandStandaloneSVG(cfg, "hour") },
    { name: "hand_minute.svg", content: buildHandStandaloneSVG(cfg, "minute") }
  ];
  if (cfg.hands.second.enabled) {
    files.push({ name: "hand_second.svg", content: buildHandStandaloneSVG(cfg, "second") });
  }
  return files;
}

// Fallback usato quando JSZip non è disponibile (CDN irraggiungibile, rete
// offline, blocco da parte di un'estensione): torniamo ai download in
// sequenza distanziati, che è il comportamento storico del tool.
function downloadFilesSequentially(files) {
  files.forEach(function (f, i) {
    setTimeout(function () { download(f.name, f.content); }, i * 150);
  });
}

function exportAll() {
  var cfg = readCFG();
  var files = collectLayerFiles(cfg);
  var btn = $("btnDlAll");

  if (typeof JSZip === "undefined") {
    downloadFilesSequentially(files);
    return;
  }

  var zip = new JSZip();
  files.forEach(function (f) { zip.file(f.name, f.content); });

  if (btn) btn.disabled = true;
  zip.generateAsync({ type: "blob" }).then(function (blob) {
    downloadBlob("clock_svg_" + Math.round(cfg.dial.diameterMM) + "mm.zip", blob);
  }).catch(function (err) {
    // Non lasciamo l'utente a mani vuote: se lo ZIP fallisce scarichiamo
    // comunque i singoli file, dicendolo nella barra info.
    console.error("JSZip:", err);
    var info = $("info-bar-text");
    if (info && window.LSI18n) info.textContent = window.LSI18n.t("zip-fallback");
    downloadFilesSequentially(files);
  }).then(function () {
    if (btn) btn.disabled = false;
  });
}

// Esporta un unico SVG con quadrante + indici + lancette sovrapposti, esattamente
// come nell'anteprima live (stessa ora, stessi angoli): comodo per una prova
// veloce del risultato finale.
function buildCombinedSVG(cfg) {
  var R = cfg.dial.diameterMM / 2;
  var cx = R, cy = R;
  var angles = currentAngles(cfg);

  var inner = buildDialMarkup(cfg, cx, cy, R);
  inner += buildIndicesMarkup(cfg, cx, cy, R);
  inner += buildHandPreviewMarkup(cfg.hands.hour, cx, cy, R, angles.hour);
  inner += buildHandPreviewMarkup(cfg.hands.minute, cx, cy, R, angles.minute);
  if (cfg.hands.second.enabled) {
    inner += buildHandPreviewMarkup(cfg.hands.second, cx, cy, R, angles.second);
  }
  inner += '<circle cx="' + cx + '" cy="' + cy + '" r="' + round(R * 0.02 + 1.2) + '" fill="' + cfg.hands.hour.color + '"/>';

  return svgWrap(cfg.dial.diameterMM, cfg.dial.diameterMM, inner);
}

function exportCombined() {
  var cfg = readCFG();
  download("clock_combined.svg", buildCombinedSVG(cfg));
}
