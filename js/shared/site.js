// js/shared/site.js
// "Chrome" del sito: tema chiaro/scuro, fallback degli asset esterni,
// contatore visite e avvio del motore i18n.
//
// Tutto è racchiuso in una IIFE: nessuna funzione finisce nello scope
// globale, così non può collidere con i simboli globali dei due tool
// (l'orologio, per esempio, definisce già $ , download , round ...).
(function () {
  "use strict";

  var THEME_KEY = "lsvgTheme";

  // ------------------------------------------------------------- tema ---
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage non disponibile */ }
  }

  // Va eseguita durante il parsing dell'<head>, prima che il body sia
  // dipinto: altrimenti chi usa il tema chiaro vede un lampo scuro.
  function applySavedTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignora */ }
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
    }
  }

  function wireThemeToggle() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
    });
  }

  // ------------------------------------------- fallback asset esterni ---
  // Logo e contatore visite sono ospitati su servizi di terzi: se non
  // rispondono la pagina deve restare perfettamente utilizzabile, quindi
  // li nascondiamo invece di lasciare un'icona rotta.
  function initLogoFallback() {
    document.querySelectorAll("[data-fallback-hide] img").forEach(function (img) {
      img.addEventListener("error", function () {
        var box = img.closest("[data-fallback-hide]");
        if (box) box.style.display = "none";
      }, { once: true });
    });
  }

  function initVisitCounter() {
    var el = document.getElementById("visit-counter");
    if (!el) return;
    var img = new Image();
    img.onload = function () {
      var a = document.createElement("a");
      a.href = "https://hits.seeyoufarm.com";
      a.target = "_blank";
      a.rel = "noopener";
      a.style.display = "inline-flex";
      a.style.alignItems = "center";
      var badge = document.createElement("img");
      badge.src = img.src;
      badge.alt = "Visitors";
      badge.style.height = "18px";
      badge.style.border = "0";
      a.appendChild(badge);
      el.appendChild(a);
    };
    img.onerror = function () { el.style.display = "none"; };
    img.src = "https://hits.seeyoufarm.com/api/count/incr/badge.svg" +
      "?url=https%3A%2F%2Flucchior.github.io%2FPuzzle_Generator%2F" +
      "&count_bg=%230D0D10&title_bg=%238F81F0&icon=&icon_color=%23E7E7E7" +
      "&title=Visitors%3A&edge_flat=false&t=" + Date.now();
  }

  // -------------------------------------------------------- anno footer ---
  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // Questo file viene caricato nell'<head> in modo sincrono proprio per
  // poter applicare il tema prima del primo paint.
  applySavedTheme();

  document.addEventListener("DOMContentLoaded", function () {
    wireThemeToggle();
    initLogoFallback();
    initVisitCounter();
    initFooterYear();
    // A questo punto tutti i dizionari dei tool sono già stati registrati
    // (i loro script sono sincroni e precedono questo evento).
    if (window.LSI18n) window.LSI18n.boot();
  });
})();
