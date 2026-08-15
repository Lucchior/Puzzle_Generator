// js/geometry.js
// Generazione dei path SVG del puzzle: linguette (curve di Bézier seedate),
// bordo esterno e margine. Algoritmo invariato rispetto alla versione
// originale — questo file cambia solo *dove vive lo stato*, non *come
// viene calcolato*.
//
// Prima della Fase 1: a,b,c,d,e,t,j,flip,xi,yi,xn,yn,vertical,offset,
// width,height erano variabili globali (window.*), lette e scritte da
// funzioni sparse (first, next, sl, sw, ol, ow, l, w, p0l...p9w).
// Qui lo stesso identico algoritmo vive in una closure: nessuna di
// queste variabili tocca più `window`.
//
// Wrapper UMD (Fase 3): come random.js, funziona sia via <script> nel
// browser (window.PZGeometry) sia con require('./geometry.js') in Node
// per i test unitari (test/geometry.test.js).
//
// ANATOMIA DI UNA LINGUETTA (per chi vuole contribuire) — vedi anche
// docs/tab-geometry.md per lo schema disegnato:
// ogni linguetta è tracciata da 3 curve di Bézier cubiche consecutive
// che collegano 10 "punti" lungo il lato di una cella (p0..p9):
//   p0 -------- p1        collo di entrata (rettilineo)
//                \_____ p2..p6  il "fungo" della linguetta (la parte
//                              che si incastra nel pezzo adiacente)
//                       \_ p7 -------- p8 -------- p9   collo di uscita
// - `l(v)` = posizione LUNGO il lato della cella (0.0 = inizio, 1.0 = fine)
// - `w(v)` = scostamento PERPENDICOLARE al lato (l'ampiezza del fungo)
// - `t` (tabSize/200) = quanto sporge il fungo dal lato
// - `j` (jitter/100) = ampiezza massima delle variazioni casuali a,b,c,d,e
// - `flip` = alterna il verso del fungo (a volte sporge da un lato, a
//   volte dall'altro) così i pezzi si incastrano ma non sono tutti uguali
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PZGeometry = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // stato interno della state machine che genera le linguette
  var a, b, c, d, e, t, j, flip, xi, yi, xn, yn, vertical, offset, width, height;
  var rng; // { random, uniform, rbool } — fornito dal chiamante (vedi app.js)

  function first() {
    e = rng.uniform(-j, j);
    next();
  }

  function next() {
    var fo = flip;
    flip = rng.rbool();
    a = (flip === fo ? -e : e);
    b = rng.uniform(-j, j);
    c = rng.uniform(-j, j);
    d = rng.uniform(-j, j);
    e = rng.uniform(-j, j);
  }

  function sl() { return vertical ? height / yn : width / xn; }
  function sw() { return vertical ? width / xn : height / yn; }
  function ol() { return offset + sl() * (vertical ? yi : xi); }
  function ow() { return offset + sw() * (vertical ? xi : yi); }
  function l(v) { return Math.round((ol() + sl() * v) * 1000) / 1000; }
  function w(v) { return Math.round((ow() + sw() * v * (flip ? -1 : 1)) * 1000) / 1000; }

  function p0l() { return l(0.0); } function p0w() { return w(0.0); }
  function p1l() { return l(0.2); } function p1w() { return w(a); }
  function p2l() { return l(0.5 + b + d); } function p2w() { return w(-t + c); }
  function p3l() { return l(0.5 - t + b); } function p3w() { return w(t + c); }
  function p4l() { return l(0.5 - 2 * t + b - d); } function p4w() { return w(3 * t + c); }
  function p5l() { return l(0.5 + 2 * t + b - d); } function p5w() { return w(3 * t + c); }
  function p6l() { return l(0.5 + t + b); } function p6w() { return w(t + c); }
  function p7l() { return l(0.5 + b + d); } function p7w() { return w(-t + c); }
  function p8l() { return l(0.8); } function p8w() { return w(e); }
  function p9l() { return l(1.0); } function p9w() { return w(0.0); }

  // Prepara lo stato condiviso per una generazione. NB: qui `flip` non viene
  // toccato — il reset a inizio di una nuova "passata" avviene in
  // generateHorizontal() (vedi commento lì), non qui, perché setup() è
  // condivisa anche da generateVertical(), che invece DEVE continuare da
  // dove flip è stato lasciato da generateHorizontal() (stessa "passata").
  function setup(params) {
    rng = params.rng;
    t = params.tabSizePct / 200.0;
    j = params.jitterPct / 100.0;
    xn = params.cols;
    yn = params.rows;
    offset = params.off;
    width = params.w;
    height = params.h;
  }

  // Genera i path delle linguette orizzontali.
  // params: {rng, tabSizePct, jitterPct, cols, rows, off, w, h}
  function generateHorizontal(params) {
    setup(params);
    // Reset esplicito SOLO qui (inizio di un'intera "passata" di
    // generazione): senza questo, il valore di `flip` lasciato da una
    // generazione precedente nella stessa sessione del browser (es. il
    // rendering casuale mostrato al primo caricamento pagina) influenzava
    // il primo tab anche a parità di seed, rompendo la promessa "stesso
    // seed = stesso puzzle". generateVertical() NON deve fare questo reset:
    // deve continuare da dove lo lascia questa chiamata (vedi commento su
    // generateVertical più sotto).
    flip = undefined;
    vertical = 0;
    var s = "";
    for (yi = 1; yi < yn; ++yi) {
      xi = 0;
      first();
      s += "M " + p0l() + "," + p0w() + " ";
      for (; xi < xn; ++xi) {
        s += "C " + p1l() + " " + p1w() + " " + p2l() + " " + p2w() + " " + p3l() + " " + p3w() + " ";
        s += "C " + p4l() + " " + p4w() + " " + p5l() + " " + p5w() + " " + p6l() + " " + p6w() + " ";
        s += "C " + p7l() + " " + p7w() + " " + p8l() + " " + p8w() + " " + p9l() + " " + p9w() + " ";
        next();
      }
    }
    return s;
  }

  // Genera i path delle linguette verticali. Va chiamata con la STESSA
  // istanza `rng` usata per generateHorizontal(), nello stesso ordine
  // (prima orizzontali, poi verticali): la sequenza pseudo-casuale
  // continua da dove l'ha lasciata la generazione orizzontale, esattamente
  // come nella versione originale (che condivideva un unico contatore
  // globale seedVal tra le due generazioni).
  function generateVertical(params) {
    setup(params);
    vertical = 1;
    var s = "";
    for (xi = 1; xi < xn; ++xi) {
      yi = 0;
      first();
      s += "M " + p0w() + "," + p0l() + " ";
      for (; yi < yn; ++yi) {
        s += "C " + p1w() + " " + p1l() + " " + p2w() + " " + p2l() + " " + p3w() + " " + p3l() + " ";
        s += "C " + p4w() + " " + p4l() + " " + p5w() + " " + p5l() + " " + p6w() + " " + p6l() + " ";
        s += "C " + p7w() + " " + p7l() + " " + p8w() + " " + p8l() + " " + p9w() + " " + p9l() + " ";
        next();
      }
    }
    return s;
  }

  function rect(x, y, w, h, r) {
    if (r <= 0) {
      return "M " + x + " " + y + " L " + (x + w) + " " + y + " L " + (x + w) + " " + (y + h) + " L " + x + " " + (y + h) + " Z";
    }
    return "M " + (x + r) + " " + y +
      " L " + (x + w - r) + " " + y +
      " A " + r + " " + r + " 0 0 1 " + (x + w) + " " + (y + r) +
      " L " + (x + w) + " " + (y + h - r) +
      " A " + r + " " + r + " 0 0 1 " + (x + w - r) + " " + (y + h) +
      " L " + (x + r) + " " + (y + h) +
      " A " + r + " " + r + " 0 0 1 " + x + " " + (y + h - r) +
      " L " + x + " " + (y + r) +
      " A " + r + " " + r + " 0 0 1 " + (x + r) + " " + y + " Z";
  }

  function border(off, w, h, r) {
    return rect(off, off, w, h, r);
  }

  function marginOutline(off, w, h, mg, r) {
    if (mg <= 0) return "";
    return rect(off - mg, off - mg, w + mg * 2, h + mg * 2, r + mg);
  }

  function marginSolid(off, w, h, mg, r) {
    if (mg <= 0) return "";
    return marginOutline(off, w, h, mg, r) + " " + border(off, w, h, r);
  }

  return {
    generateHorizontal: generateHorizontal,
    generateVertical: generateVertical,
    rect: rect,
    border: border,
    marginOutline: marginOutline,
    marginSolid: marginSolid
  };
});
