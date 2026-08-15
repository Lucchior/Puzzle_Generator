// js/shared/i18n.js
// Motore di traduzione condiviso da tutte le pagine del sito.
//
// Perché un motore unico: prima ogni tool aveva il suo (PZI18n nel puzzle,
// applyI18n()/setLang() globali nell'orologio) con dizionari che si
// sovrapponevano. Ora c'è un solo registro: ogni pagina registra il proprio
// dizionario con register() e il motore fonde tutto.
//
// La lingua scelta viene ricordata in localStorage, così passando da una
// pagina all'altra non torna all'italiano ad ogni click.
window.LSI18n = (function () {
  "use strict";

  var STORAGE_KEY = "lsvgLang";
  var SUPPORTED = ["it", "en"];

  var dict = { it: {}, en: {} };
  var callbacks = [];
  var currentLang = "it";

  // Fonde un dizionario {it:{...}, en:{...}} in quello globale.
  // I tool possono chiamarla più volte: le chiavi si sommano.
  function register(extra) {
    SUPPORTED.forEach(function (lang) {
      if (!extra[lang]) return;
      Object.keys(extra[lang]).forEach(function (k) { dict[lang][k] = extra[lang][k]; });
    });
  }

  // Registra una callback da eseguire dopo ogni cambio lingua (serve ai tool
  // per ridisegnare l'anteprima, che contiene testo tradotto).
  function onApply(fn) {
    if (typeof fn === "function") callbacks.push(fn);
  }

  // Traduce una chiave, sostituendo eventuali segnaposto {nome}.
  function t(key, vars) {
    var msg = dict[currentLang][key];
    if (msg === undefined) return "";
    if (vars) {
      Object.keys(vars).forEach(function (k) { msg = msg.split("{" + k + "}").join(vars[k]); });
    }
    return msg;
  }

  function apply() {
    var d = dict[currentLang];
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (d[k] !== undefined) el.textContent = d[k];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      if (d[k] !== undefined) el.setAttribute("placeholder", d[k]);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-title");
      if (d[k] !== undefined) el.setAttribute("title", d[k]);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      if (d[k] !== undefined) el.setAttribute("aria-label", d[k]);
    });

    var pill = document.querySelector(".lang-pill");
    if (pill) {
      pill.setAttribute("data-lang", currentLang);
      pill.querySelectorAll("button[data-lang]").forEach(function (b) {
        b.classList.toggle("active", b.dataset.lang === currentLang);
        b.setAttribute("aria-pressed", b.dataset.lang === currentLang ? "true" : "false");
      });
    }

    callbacks.forEach(function (fn) { fn(); });
  }

  function set(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage non disponibile */ }
    apply();
  }

  // Lingua iniziale: quella scelta in precedenza, altrimenti italiano —
  // che è il default storico di entrambi i tool. Di proposito NON usiamo
  // navigator.language: il sito è pensato in italiano e chi arriva da un
  // browser in inglese può cambiare con un click (la scelta viene ricordata).
  function initialLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignora */ }
    return SUPPORTED.indexOf(saved) !== -1 ? saved : "it";
  }

  // Chiamata una sola volta da site.js, a DOM pronto e dopo che tutti i
  // dizionari dei tool sono stati registrati.
  function boot() {
    currentLang = initialLang();
    document.querySelectorAll(".lang-pill button[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () { set(b.dataset.lang); });
    });
    apply();
  }

  return {
    register: register,
    onApply: onApply,
    apply: apply,
    boot: boot,
    set: set,
    t: t,
    current: function () { return currentLang; },
    get: function (lang) { return dict[lang] || {}; }
  };
})();

// ---------------------------------------------------------------------------
// Dizionario comune: header, navigazione, footer, testi presenti su ogni pagina.
// ---------------------------------------------------------------------------
window.LSI18n.register({
  it: {
    "nav-home": "Home",
    "nav-puzzle": "Puzzle",
    "nav-clock": "Orologi",
    "theme-toggle-label": "Cambia tema chiaro/scuro",
    "lang-label": "Lingua",
    "chip-offers": "Offerte Anycubic",
    "chip-maker": "Profilo Makeronline",
    "footer-by": "Creato da",
    "footer-role": "Maker · Anycubic Insider",
    "footer-offers": "Offerte Anycubic",
    "footer-maker": "Profilo Makeronline",
    "footer-coffee": "Offrimi un caffè",
    "footer-source": "Codice sorgente",
    "footer-license": "Licenza MIT"
  },
  en: {
    "nav-home": "Home",
    "nav-puzzle": "Puzzle",
    "nav-clock": "Clocks",
    "theme-toggle-label": "Toggle light/dark theme",
    "lang-label": "Language",
    "chip-offers": "Anycubic Deals",
    "chip-maker": "Makeronline Profile",
    "footer-by": "Made by",
    "footer-role": "Maker · Anycubic Insider",
    "footer-offers": "Anycubic Deals",
    "footer-maker": "Makeronline Profile",
    "footer-coffee": "Buy me a coffee",
    "footer-source": "Source code",
    "footer-license": "MIT License"
  }
});
