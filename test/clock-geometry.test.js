// test/clock-geometry.test.js
// Test sulla matematica del generatore di quadranti.
//
// I file di js/clock/ sono scritti come <script> classici (funzioni globali),
// ma le funzioni davvero "pure" — quelle che calcolano angoli, arrotondamenti
// e path — sono anche esportate come modulo CommonJS in coda al file, così lo
// stesso identico codice che gira nel browser può essere verificato qui.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const utils = require("../js/clock/utils.js");

// roundedSquarePath vive in dial.js e chiama round()/polar() di utils.js,
// che nel browser sono globali: qui glieli mettiamo a disposizione allo
// stesso modo prima di caricare il modulo.
global.round = utils.round;
global.polar = utils.polar;
const dial = require("../js/clock/dial.js");

test("round arrotonda al numero di decimali richiesto", () => {
  assert.equal(utils.round(1.23456), 1.235);      // default: 3 decimali
  assert.equal(utils.round(1.23456, 1), 1.2);
  assert.equal(utils.round(2, 2), 2);
  assert.equal(utils.round(-1.5555, 2), -1.56);
});

test("polar: 0° punta alle ore 12 e si procede in senso orario", () => {
  const cx = 100, cy = 100, r = 50;

  const ore12 = utils.polar(cx, cy, r, 0);
  assert.equal(ore12.x, 100);
  assert.equal(ore12.y, 50);   // in SVG la y cresce verso il basso

  const ore3 = utils.polar(cx, cy, r, 90);
  assert.equal(ore3.x, 150);
  assert.equal(ore3.y, 100);

  const ore6 = utils.polar(cx, cy, r, 180);
  assert.equal(ore6.x, 100);
  assert.equal(ore6.y, 150);

  const ore9 = utils.polar(cx, cy, r, 270);
  assert.equal(ore9.x, 50);
  assert.equal(ore9.y, 100);
});

test("polar: il punto resta sempre sulla circonferenza", () => {
  const r = 37.5;
  for (let deg = 0; deg < 360; deg += 7) {
    const p = utils.polar(0, 0, r, deg);
    const dist = Math.sqrt(p.x * p.x + p.y * p.y);
    assert.ok(Math.abs(dist - r) < 0.01, `angolo ${deg}°: distanza ${dist}`);
  }
});

test("toRoman converte le 12 ore del quadrante", () => {
  const attesi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  attesi.forEach((atteso, i) => {
    assert.equal(utils.toRoman(i + 1, false), atteso);
  });
});

test("toRoman con lo stile tradizionale usa IIII al posto di IV", () => {
  assert.equal(utils.toRoman(4, true), "IIII");
  assert.equal(utils.toRoman(9, true), "VIIII");
  // le altre ore non cambiano
  assert.equal(utils.toRoman(12, true), "XII");
  assert.equal(utils.toRoman(3, true), "III");
});

test("roundedSquarePath: senza raggio produce un quadrato di 4 lati", () => {
  const d = dial.roundedSquarePath(50, 50, 20, 0);
  assert.equal(d, "M30,30 L70,30 L70,70 L30,70 Z");
  assert.equal((d.match(/A/g) || []).length, 0);  // nessun arco
});

test("roundedSquarePath: con raggio produce quattro archi", () => {
  const d = dial.roundedSquarePath(50, 50, 20, 5);
  assert.equal((d.match(/A/g) || []).length, 4);
  assert.ok(d.startsWith("M 35 30"), d);
  assert.ok(d.trim().endsWith("Z"));
});

test("roundedSquarePath: il raggio viene limitato al mezzo lato", () => {
  // Un raggio più grande del mezzo lato darebbe archi sovrapposti: viene
  // clampato, quindi chiedere 999 equivale a chiedere esattamente `half`.
  const clampato = dial.roundedSquarePath(50, 50, 20, 999);
  const massimo = dial.roundedSquarePath(50, 50, 20, 20);
  assert.equal(clampato, massimo);
});

test("svgWrap dichiara le dimensioni in mm e un viewBox coerente", () => {
  const svg = utils.svgWrap(200, 120, "<circle/>");
  assert.ok(svg.includes('width="200mm"'));
  assert.ok(svg.includes('height="120mm"'));
  assert.ok(svg.includes('viewBox="0 0 200 120"'));
  assert.ok(svg.includes("<circle/>"));
  assert.ok(svg.trim().endsWith("</svg>"));
});
