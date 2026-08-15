// test/random.test.js
// Test unitari per js/random.js con il test runner nativo di Node
// (node:test — zero dipendenze, disponibile da Node 18+). Eseguibili con:
//   node --test test/
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const PZRandom = require("../js/puzzle/random.js");

test("createRng: stesso seed produce sempre la stessa sequenza (determinismo)", () => {
  const a = PZRandom.createRng(42);
  const b = PZRandom.createRng(42);
  for (let i = 0; i < 20; i++) {
    assert.equal(a.random(), b.random());
  }
});

test("createRng: valori golden per seed=42 (protegge la riproducibilità dei seed esistenti)", () => {
  const rng = PZRandom.createRng(42);
  const values = [1, 2, 3, 4, 5].map(() => rng.random());
  assert.deepEqual(values, [
    0.7845208436629036,
    0.2525737140167621,
    0.01925105413576489,
    0.03524534118514566,
    0.8834764880921284
  ]);
});

test("createRng: valori golden per seed=7", () => {
  const rng = PZRandom.createRng(7);
  const values = [1, 2, 3, 4, 5].map(() => rng.random());
  assert.deepEqual(values, [
    0.8659871878908234,
    0.5824662338181952,
    0.18485241756570758,
    0.7888911063018895,
    0.0979344929655781
  ]);
});

test("createRng: due istanze diverse non condividono stato (nessuna variabile globale nascosta)", () => {
  const a = PZRandom.createRng(1);
  const b = PZRandom.createRng(2);
  const firstA = a.random();
  // consumo molte chiamate su "b": se ci fosse stato condiviso, "a" ne risentirebbe
  for (let i = 0; i < 50; i++) b.random();
  const c = PZRandom.createRng(1);
  assert.equal(firstA, c.random(), "createRng(1) deve restare deterministico anche dopo aver usato un'altra istanza");
});

test("uniform: i valori restano sempre dentro l'intervallo [a, b)", () => {
  const rng = PZRandom.createRng(123);
  for (let i = 0; i < 500; i++) {
    const v = rng.uniform(-4, 4);
    assert.ok(v >= -4 && v < 4, `valore fuori range: ${v}`);
  }
});

test("uniform: funziona anche con intervalli non centrati sullo zero", () => {
  const rng = PZRandom.createRng(9);
  for (let i = 0; i < 200; i++) {
    const v = rng.uniform(10, 30);
    assert.ok(v >= 10 && v < 30, `valore fuori range: ${v}`);
  }
});

test("rbool: nel tempo produce sia true che false (non è sempre lo stesso valore)", () => {
  const rng = PZRandom.createRng(55);
  const results = new Set();
  for (let i = 0; i < 100; i++) results.add(rng.rbool());
  assert.deepEqual([...results].sort(), [false, true]);
});
