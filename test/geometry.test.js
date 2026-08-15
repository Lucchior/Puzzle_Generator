// test/geometry.test.js
// Test unitari per js/geometry.js con il test runner nativo di Node
// (node:test — zero dipendenze). Eseguibili con: node --test test/
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const PZRandom = require("../js/puzzle/random.js");
const PZGeometry = require("../js/puzzle/geometry.js");

test("rect: con raggio 0 disegna un rettangolo netto (nessun arco)", () => {
  const d = PZGeometry.rect(0, 0, 100, 50, 0);
  assert.equal(d, "M 0 0 L 100 0 L 100 50 L 0 50 Z");
  assert.doesNotMatch(d, /A /, "non deve contenere comandi arco quando r=0");
});

test("rect: con raggio > 0 disegna angoli arrotondati (comandi arco presenti)", () => {
  const d = PZGeometry.rect(0, 0, 100, 50, 5);
  assert.equal(d, "M 5 0 L 95 0 A 5 5 0 0 1 100 5 L 100 45 A 5 5 0 0 1 95 50 L 5 50 A 5 5 0 0 1 0 45 L 0 5 A 5 5 0 0 1 5 0 Z");
  assert.match(d, /A 5 5 0 0 1/);
});

test("border: equivale a rect(off, off, w, h, r) — il bordo è il rettangolo traslato di 'off'", () => {
  const a = PZGeometry.border(2, 100, 50, 3);
  const b = PZGeometry.rect(2, 2, 100, 50, 3);
  assert.equal(a, b);
});

test("marginOutline: ritorna stringa vuota se il margine è <= 0 (niente da disegnare)", () => {
  assert.equal(PZGeometry.marginOutline(5, 90, 60, 0, 2), "");
  assert.equal(PZGeometry.marginOutline(5, 90, 60, -1, 2), "");
});

test("marginOutline: con margine > 0 disegna il rettangolo esterno allargato", () => {
  const d = PZGeometry.marginOutline(5, 90, 60, 5, 2);
  assert.equal(d, "M 7 0 L 93 0 A 7 7 0 0 1 100 7 L 100 63 A 7 7 0 0 1 93 70 L 7 70 A 7 7 0 0 1 0 63 L 0 7 A 7 7 0 0 1 7 0 Z");
});

test("marginSolid: ritorna stringa vuota se il margine è <= 0, come marginOutline", () => {
  assert.equal(PZGeometry.marginSolid(5, 90, 60, 0, 2), "");
});

test("marginSolid: è la concatenazione di marginOutline + border (per il fill-rule evenodd)", () => {
  const outline = PZGeometry.marginOutline(5, 90, 60, 5, 2);
  const border = PZGeometry.border(5, 90, 60, 2);
  const solid = PZGeometry.marginSolid(5, 90, 60, 5, 2);
  assert.equal(solid, outline + " " + border);
});

test("generateHorizontal/generateVertical: determinismo — stesso seed e parametri = stesso output", () => {
  const params = { tabSizePct: 20, jitterPct: 4, cols: 3, rows: 2, off: 5, w: 90, h: 60 };

  const rngA = PZRandom.createRng(42);
  const dhA = PZGeometry.generateHorizontal({ ...params, rng: rngA });
  const dvA = PZGeometry.generateVertical({ ...params, rng: rngA });

  const rngB = PZRandom.createRng(42);
  const dhB = PZGeometry.generateHorizontal({ ...params, rng: rngB });
  const dvB = PZGeometry.generateVertical({ ...params, rng: rngB });

  assert.equal(dhA, dhB);
  assert.equal(dvA, dvB);
});

test("generateHorizontal: lo stesso seed produce lo stesso risultato anche dopo generazioni intermedie non correlate", () => {
  // Regressione: prima della Fase 4, il valore di `flip` lasciato da una
  // generazione precedente nella stessa sessione (es. l'anteprima casuale
  // mostrata al primo caricamento pagina) influenzava il primo tab della
  // generazione successiva, anche a parità di seed — rompendo la promessa
  // "stesso seed = stesso puzzle". Questo test fallisce se quel bug torna.
  const params = { tabSizePct: 20, jitterPct: 4, cols: 10, rows: 7, off: 5, w: 300, h: 200 };

  const primaDiRumore = PZGeometry.generateHorizontal({ ...params, rng: PZRandom.createRng(42) });

  // "rumore" di sessione: un'altra generazione, con un altro seed, in mezzo
  PZGeometry.generateHorizontal({ ...params, rng: PZRandom.createRng(999) });
  PZGeometry.generateVertical({ ...params, rng: PZRandom.createRng(12345) });

  const dopoIlRumore = PZGeometry.generateHorizontal({ ...params, rng: PZRandom.createRng(42) });

  assert.equal(primaDiRumore, dopoIlRumore);
});

test("generateHorizontal/generateVertical: valori golden (protegge la forma dei puzzle già generati dagli utenti)", () => {
  // Se questo test fallisce dopo una modifica all'algoritmo, vuol dire che
  // a parità di seed i maker otterrebbero pezzi diversi da prima: è un
  // cambiamento importante da segnalare esplicitamente (es. nel CHANGELOG),
  // non un refactor "silenzioso".
  const params = { tabSizePct: 20, jitterPct: 4, cols: 3, rows: 2, off: 5, w: 90, h: 60 };
  const rng = PZRandom.createRng(42);

  const dh = PZGeometry.generateHorizontal({ ...params, rng });
  assert.equal(
    dh,
    "M 5,35 C 11 35.683 19.767 30.885 15.846 36.885 C 11.926 42.885 23.926 42.885 21.846 36.885 C 19.767 30.885 29 35.555 35 35 C 41 34.445 49.437 31.404 46.936 37.404 C 44.436 43.404 56.436 43.404 52.936 37.404 C 49.437 31.404 59 34.462 65 35 C 71 35.538 79.039 31.876 76.063 37.876 C 73.087 43.876 85.087 43.876 82.063 37.876 C 79.039 31.876 89 35.354 95 35 "
  );

  // stessa istanza rng: la sequenza continua da dove l'ha lasciata dh (per
  // design — vedi il commento in geometry.js/app.js)
  const dv = PZGeometry.generateVertical({ ...params, rng });
  assert.equal(
    dv,
    "M 35,5 C 35.137 11 31.972 20.209 37.972 16.488 C 43.972 12.768 43.972 24.768 37.972 22.488 C 31.972 20.209 35.536 29 35 35 C 34.464 41 32.112 50.337 38.112 47.976 C 44.112 45.616 44.112 57.616 38.112 53.976 C 32.112 50.337 34.473 59 35 65 M 65,5 C 65.896 11 61.491 19.435 67.491 16.088 C 73.491 12.741 73.491 24.741 67.491 22.088 C 61.491 19.435 65.968 29 65 35 C 64.032 41 62.772 50.957 68.772 46.797 C 74.772 42.638 74.772 54.638 68.772 52.797 C 62.772 50.957 65.466 59 65 65 "
  );
});

test("generateHorizontal: righe generate = rows - 1 (una linea di taglio tra ogni coppia di righe adiacenti)", () => {
  const rng = PZRandom.createRng(1);
  const d = PZGeometry.generateHorizontal({ rng, tabSizePct: 20, jitterPct: 4, cols: 4, rows: 5, off: 0, w: 100, h: 100 });
  const moveToCount = (d.match(/M /g) || []).length;
  assert.equal(moveToCount, 5 - 1, "con 5 righe ci si aspettano 4 linee di taglio orizzontali");
});

test("generateVertical: colonne generate = cols - 1 (una linea di taglio tra ogni coppia di colonne adiacenti)", () => {
  const rng = PZRandom.createRng(1);
  const d = PZGeometry.generateVertical({ rng, tabSizePct: 20, jitterPct: 4, cols: 4, rows: 5, off: 0, w: 100, h: 100 });
  const moveToCount = (d.match(/M /g) || []).length;
  assert.equal(moveToCount, 4 - 1, "con 4 colonne ci si aspettano 3 linee di taglio verticali");
});
