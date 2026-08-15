// js/app.js
// Orchestrazione dell'applicazione: legge/valida gli input, chiama
// PZGeometry/PZRandom per generare i path, aggiorna l'anteprima SVG,
// costruisce il file da esportare ed effettua il binding di tutti gli
// eventi (prima erano attributi inline oninput/onclick/onchange/onblur
// nell'HTML — qui sono centralizzati e leggibili in un unico posto).
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  // Valori di default = quelli dichiarati nell'HTML originale (usati dal
  // pulsante "Ripristina"). Il seed di default coincide con quello che
  // l'app mostrerebbe prima della randomizzazione al load.
  var DEFAULTS = {
    width: "300", height: "200", radius: "2", margin: "5",
    xn: "10", yn: "7", strokeWidth: "0.1",
    seed: "42", tabsize: "20", jitter: "4"
  };

  // ---------- Foto di riferimento (SOLO anteprima locale, mai esportata) ----------
  // photoDataUrl vive solo in memoria per la durata della sessione: non viene
  // salvata (niente localStorage), non viene mai inviata da nessuna parte
  // (nessuna chiamata di rete: FileReader legge il file localmente), e non
  // viene mai inclusa in generate()/save() — l'export resta sempre e solo
  // le linee di taglio del puzzle, come promesso nel disclaimer in UI.
  var photoDataUrl = null;
  var photoFitMode = "cover";
  var MAX_PHOTO_BYTES = 20 * 1024 * 1024; // 20 MB

  // ---------- Validazione / clamp centralizzato ----------
  function clampNum(v, min, max) {
    if (isNaN(v)) return min;
    return Math.min(max, Math.max(min, v));
  }

  function maxRadiusFor(W, H) {
    return Math.max(0, Math.min(W, H) / 2 - 0.01);
  }

  // Marca un campo come valido/non valido e mostra/nasconde il messaggio
  // d'errore corrispondente (id + "-error"), tradotto nella lingua attiva.
  // Scrive nel DOM solo se il testo è realmente cambiato, per non spammare
  // gli screen reader (il contenitore ha role="alert") ad ogni keystroke.
  function setFieldError(id, ok, key, vars) {
    $(id).classList.toggle("invalid", !ok);
    var errEl = document.getElementById(id + "-error");
    if (!errEl) return;
    if (ok) {
      if (errEl.textContent !== "") errEl.textContent = "";
      errEl.classList.remove("show");
      return;
    }
    var msg = window.LSI18n.t(key, vars);
    if (errEl.textContent !== msg) errEl.textContent = msg;
    errEl.classList.add("show");
  }

  // Legge tutti gli input principali dal DOM, li clampa nei range validi
  // e mostra un messaggio d'errore leggibile per i campi fuori range,
  // senza però sovrascrivere il valore mentre il maker sta ancora
  // scrivendo (lo "snap" avviene solo al blur, vedi snapField).
  function getParams() {
    var rawW = parseFloat($("width").value), W = clampNum(rawW, 10, 2000);
    setFieldError("width", rawW === W, "err-width");

    var rawH = parseFloat($("height").value), H = clampNum(rawH, 10, 2000);
    setFieldError("height", rawH === H, "err-height");

    var rawM = parseFloat($("margin").value), mMM = clampNum(rawM, 0, 100);
    setFieldError("margin", rawM === mMM, "err-margin");

    var rawCols = parseInt($("xn").value, 10), cols = clampNum(rawCols, 2, 100);
    setFieldError("xn", rawCols === cols, "err-xn");

    var rawRows = parseInt($("yn").value, 10), rows = clampNum(rawRows, 2, 100);
    setFieldError("yn", rawRows === rows, "err-yn");

    var maxR = maxRadiusFor(W, H);
    var rawR = parseFloat($("radius").value), rMM = clampNum(rawR, 0, maxR);
    setFieldError("radius", rawR === rMM, "err-radius", { max: maxR.toFixed(2) });

    var rawSw = parseFloat($("strokeWidth").value), sw = clampNum(rawSw, 0.01, 5);
    setFieldError("strokeWidth", rawSw === sw, "err-strokeWidth");

    return {
      W: W, H: H, mMM: mMM, cols: cols, rows: rows, rMM: rMM, sw: sw,
      solid: $("solidBorder").checked
    };
  }

  // Al blur di un campo, "snappa" il valore digitato al range valido più
  // vicino (per radius il range dipende dinamicamente da width/height).
  function snapField(el, min, max, dynamicRadius) {
    var v = parseFloat(el.value), mx = max;
    if (dynamicRadius) {
      var W = clampNum(parseFloat($("width").value), 10, 2000);
      var H = clampNum(parseFloat($("height").value), 10, 2000);
      mx = maxRadiusFor(W, H);
    }
    el.value = clampNum(v, min, mx);
    el.classList.remove("invalid");
    update();
  }

  function getTabParams() {
    return {
      seed: parseInt($("seed").value, 10),
      tabSizePct: parseFloat($("tabsize").value),
      jitterPct: parseFloat($("jitter").value)
    };
  }

  // ---------- Rendering anteprima ----------
  function update() {
    var p = getParams();
    $("border-hint").textContent = window.LSI18n.t(p.solid ? "toggle-solid-on" : "toggle-solid-hint");

    var vW = p.W + p.mMM * 2, vH = p.H + p.mMM * 2;
    $("puzzlecontainer").setAttribute("viewBox", "0 0 " + vW + " " + vH);
    renderPhoto(p);
    $("puzzlepath_h").setAttribute("stroke-width", p.sw);
    $("puzzlepath_v").setAttribute("stroke-width", p.sw);
    $("puzzlepath_b").setAttribute("stroke-width", p.sw * 1.5);
    $("puzzlepath_margin").setAttribute("stroke-width", p.sw);
    $("puzzlepath_margin").setAttribute("stroke-dasharray", (p.sw * 6) + " " + (p.sw * 3));

    var tp = getTabParams();
    // Un solo generatore casuale condiviso tra linguette orizzontali e
    // verticali: la sequenza continua dall'una all'altra, esattamente
    // come nella versione originale (vedi commento in geometry.js).
    var rng = window.PZRandom.createRng(tp.seed);
    var baseParams = {
      rng: rng, tabSizePct: tp.tabSizePct, jitterPct: tp.jitterPct,
      cols: p.cols, rows: p.rows, off: p.mMM, w: p.W, h: p.H
    };

    $("puzzlepath_h").setAttribute("d", window.PZGeometry.generateHorizontal(baseParams));
    $("puzzlepath_v").setAttribute("d", window.PZGeometry.generateVertical(baseParams));
    $("puzzlepath_b").setAttribute("d", window.PZGeometry.border(p.mMM, p.W, p.H, p.rMM));

    if (p.solid && p.mMM > 0) {
      $("puzzlepath_margin_solid").setAttribute("d", window.PZGeometry.marginSolid(p.mMM, p.W, p.H, p.mMM, p.rMM));
      $("puzzlepath_margin_solid").setAttribute("fill", "#111");
      $("puzzlepath_margin_solid").setAttribute("fill-rule", "evenodd");
      $("puzzlepath_margin_solid").setAttribute("stroke", "none");
      $("puzzlepath_margin").setAttribute("d", "");
    } else {
      $("puzzlepath_margin_solid").setAttribute("d", "");
      $("puzzlepath_margin").setAttribute("d", window.PZGeometry.marginOutline(p.mMM, p.W, p.H, p.mMM, p.rMM));
    }

    var cw = (p.W / p.cols).toFixed(1), ch = (p.H / p.rows).toFixed(1);
    var tW = (p.W + p.mMM * 2).toFixed(1), tH = (p.H + p.mMM * 2).toFixed(1);
    $("info-bar").textContent = p.cols * p.rows + " pz · " + cw + "x" + ch + " mm · SVG: " + tW + "x" + tH + " mm";
  }

  // Posiziona/nasconde l'immagine di sfondo nell'anteprima, allineata
  // esattamente all'area del puzzle (stesso rettangolo del bordo). Non
  // tocca mai generate()/save(): l'immagine non entra nell'export.
  function renderPhoto(p) {
    var img = $("puzzlephoto");
    if (!photoDataUrl) {
      img.setAttribute("href", "");
      img.setAttribute("width", 0);
      img.setAttribute("height", 0);
      return;
    }
    img.setAttribute("href", photoDataUrl);
    img.setAttribute("x", p.mMM);
    img.setAttribute("y", p.mMM);
    img.setAttribute("width", p.W);
    img.setAttribute("height", p.H);
    img.setAttribute("preserveAspectRatio", photoFitMode === "contain" ? "xMidYMid meet" : "xMidYMid slice");
  }

  function setPhotoError(key) {
    var errEl = $("photo-error");
    if (!key) {
      errEl.textContent = "";
      errEl.classList.remove("show");
      return;
    }
    errEl.textContent = window.LSI18n.t(key);
    errEl.classList.add("show");
  }

  function handlePhotoFile(file) {
    if (!file) return;
    var okType = file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg";
    if (!okType) {
      setPhotoError("err-photo-type");
      $("photoInput").value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("err-photo-size");
      $("photoInput").value = "";
      return;
    }
    setPhotoError(null);
    var reader = new FileReader();
    reader.onload = function () {
      photoDataUrl = reader.result;
      $("photoFitField").hidden = false;
      $("btn-remove-photo").hidden = false;
      update();
    };
    reader.onerror = function () {
      setPhotoError("err-photo-type");
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    photoDataUrl = null;
    $("photoInput").value = "";
    $("photoFitField").hidden = true;
    $("btn-remove-photo").hidden = true;
    setPhotoError(null);
    update();
  }

  // requestAnimationFrame-debounce: durante il trascinamento di uno slider
  // o la digitazione rapida, più eventi "input" possono arrivare nello
  // stesso frame — ne eseguiamo solo uno per frame. Su griglie piccole non
  // si nota nulla (resta "istantaneo"); su griglie grandi (fino a 100x100)
  // evita di ricalcolare migliaia di curve di Bézier più volte al secondo.
  var rafPending = false;
  function scheduleUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      update();
    });
  }

  // ---------- Esportazione file SVG ----------
  function generate() {
    var p = getParams();
    var tW = p.W + p.mMM * 2, tH = p.H + p.mMM * 2;

    var tp = getTabParams();
    var rng = window.PZRandom.createRng(tp.seed);
    var baseParams = {
      rng: rng, tabSizePct: tp.tabSizePct, jitterPct: tp.jitterPct,
      cols: p.cols, rows: p.rows, off: p.mMM, w: p.W, h: p.H
    };

    var s = '<?xml version="1.0" encoding="UTF-8"?>\n';
    s += '<svg xmlns="http://www.w3.org/2000/svg" width="' + tW + 'mm" height="' + tH + 'mm" viewBox="0 0 ' + tW + ' ' + tH + '">\n';
    if (p.mMM > 0) {
      if (p.solid) {
        s += '<path fill="black" fill-rule="evenodd" stroke="none" d="' + window.PZGeometry.marginSolid(p.mMM, p.W, p.H, p.mMM, p.rMM) + '"/>\n';
      } else {
        s += '<path fill="none" stroke="black" stroke-width="' + p.sw + '" d="' + window.PZGeometry.marginOutline(p.mMM, p.W, p.H, p.mMM, p.rMM) + '"/>\n';
      }
    }
    s += '<path fill="none" stroke="black" stroke-width="' + p.sw + '" d="' + window.PZGeometry.generateHorizontal(baseParams) + '"/>\n';
    s += '<path fill="none" stroke="black" stroke-width="' + p.sw + '" d="' + window.PZGeometry.generateVertical(baseParams) + '"/>\n';
    s += '<path fill="none" stroke="black" stroke-width="' + (p.sw * 1.5) + '" d="' + window.PZGeometry.border(p.mMM, p.W, p.H, p.rMM) + '"/>\n';
    s += '</svg>';
    save("puzzle_lines.svg", s);
  }

  function save(fn, data) {
    var blob = new Blob([data], { type: "image/svg+xml" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = fn;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ---------- Ripristino valori predefiniti ----------
  function resetToDefaults() {
    ["width", "height", "radius", "margin", "xn", "yn", "strokeWidth"].forEach(function (id) {
      $(id).value = DEFAULTS[id];
      $(id).classList.remove("invalid");
      var errEl = document.getElementById(id + "-error");
      if (errEl) { errEl.textContent = ""; errEl.classList.remove("show"); }
    });
    $("seed").value = DEFAULTS.seed;
    $("_seed").value = DEFAULTS.seed;
    $("tabsize").value = DEFAULTS.tabsize;
    $("_tabsize").value = DEFAULTS.tabsize;
    $("jitter").value = DEFAULTS.jitter;
    $("_jitter").value = DEFAULTS.jitter;
    $("solidBorder").checked = false;
    update();
  }

  // ---------- Sincronizzazione coppie number/range (seed, tabsize, jitter) ----------
  // I campi "range" hanno min/max nativi: il browser clampa da solo il
  // valore anche se scritto via JS, quindi qui basta tenere sincronizzati
  // i due input gemelli (numero + slider) e richiamare l'aggiornamento
  // (con debounce, dato che durante il trascinamento dello slider questi
  // eventi possono arrivare a raffica).
  function updateseed() { $("_seed").value = $("seed").value; scheduleUpdate(); }
  function updatetabsize() { $("_tabsize").value = $("tabsize").value; scheduleUpdate(); }
  function updatejitter() { $("_jitter").value = $("jitter").value; scheduleUpdate(); }

  function update_seed() {
    var v = parseFloat($("_seed").value);
    if (!isNaN(v)) $("seed").value = v;
    updateseed();
  }
  function update_tabsize() {
    var v = parseFloat($("_tabsize").value);
    if (!isNaN(v)) $("tabsize").value = v;
    updatetabsize();
  }
  function update_jitter() {
    var v = parseFloat($("_jitter").value);
    if (!isNaN(v)) $("jitter").value = v;
    updatejitter();
  }

  // ---------- Binding eventi (prima: attributi inline nell'HTML) ----------
  function bindEvents() {
    ["width", "height", "radius", "margin", "xn", "yn", "strokeWidth"].forEach(function (id) {
      $(id).addEventListener("input", scheduleUpdate);
    });

    var blurSnap = {
      width: [10, 2000, false],
      height: [10, 2000, false],
      margin: [0, 100, false],
      xn: [2, 100, false],
      yn: [2, 100, false],
      strokeWidth: [0.01, 5, false],
      radius: [0, 20, true]
    };
    Object.keys(blurSnap).forEach(function (id) {
      var cfg = blurSnap[id];
      $(id).addEventListener("blur", function () { snapField(this, cfg[0], cfg[1], cfg[2]); });
    });

    $("solidBorder").addEventListener("change", update);

    $("_seed").addEventListener("input", update_seed);
    $("seed").addEventListener("input", updateseed);
    $("_tabsize").addEventListener("input", update_tabsize);
    $("tabsize").addEventListener("input", updatetabsize);
    $("_jitter").addEventListener("input", update_jitter);
    $("jitter").addEventListener("input", updatejitter);

    // I pulsanti IT/EN e il tema sono gestiti dal codice condiviso
    // (js/shared/*): qui registriamo solo il ridisegno dell'anteprima
    // dopo un cambio lingua, perché la barra info contiene testo tradotto.
    window.LSI18n.onApply(update);

    $("btn-download").addEventListener("click", generate);
    $("btn-reset").addEventListener("click", resetToDefaults);

    $("photoInput").addEventListener("change", function () {
      handlePhotoFile(this.files && this.files[0]);
    });
    $("photoFit").addEventListener("change", function () {
      photoFitMode = this.value;
      update();
    });
    $("btn-remove-photo").addEventListener("click", removePhoto);
  }

  // ---------- Bootstrap ----------
  bindEvents();
  window.addEventListener("load", function () {
    $("seed").value = Math.floor(Math.random() * 9999);
    $("_seed").value = $("seed").value;
    update();
  });
})();
