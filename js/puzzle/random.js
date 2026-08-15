// js/random.js
// Generatore pseudo-casuale seedato e deterministico: a parità di seed
// produce sempre la stessa sequenza di numeri (necessario per rendere
// riproducibile la forma delle linguette del puzzle).
//
// Prima della Fase 1 questo stato viveva in una variabile globale bare
// (`seedVal`) condivisa da tutto lo script. Qui è incapsulato in una
// closure: ogni chiamata a createRng() crea un generatore indipendente,
// senza toccare `window`.
//
// Wrapper UMD (Fase 3): lo stesso file funziona sia caricato via
// <script src="js/random.js"> nel browser (espone window.PZRandom),
// sia con require('./random.js') in Node per i test unitari
// (test/random.test.js) — senza bisogno di bundler o build step.
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PZRandom = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function createRng(seed) {
    var seedVal = seed;

    function random() {
      var x = Math.sin(seedVal) * 10000;
      seedVal += 1;
      return x - Math.floor(x);
    }

    function uniform(a, b) {
      return a + random() * (b - a);
    }

    function rbool() {
      return random() > 0.5;
    }

    return { random: random, uniform: uniform, rbool: rbool };
  }

  return { createRng: createRng };
});
