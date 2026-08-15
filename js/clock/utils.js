function $(id){ return document.getElementById(id); }

// Reads a numeric <input>'s current value, clamping it to the input's own
// min/max attributes (if present) and falling back to `fallback` when the
// value is missing/invalid. Protects against out-of-range values typed in
// manually (HTML5 min/max are not enforced automatically on .value).
function numVal(id, fallback){
  var el = $(id);
  if(!el) return fallback;
  var v = parseFloat(el.value);
  if(isNaN(v)) return fallback;
  if(el.min !== "" && !isNaN(parseFloat(el.min))) v = Math.max(v, parseFloat(el.min));
  if(el.max !== "" && !isNaN(parseFloat(el.max))) v = Math.min(v, parseFloat(el.max));
  return v;
}

function round(v, dec){
  dec = dec === undefined ? 3 : dec;
  var m = Math.pow(10, dec);
  return Math.round(v * m) / m;
}

// angleDeg: 0 = 12 o'clock (up), clockwise positive
function polar(cx, cy, r, angleDeg){
  var rad = (angleDeg - 90) * Math.PI / 180;
  return { x: round(cx + r * Math.cos(rad)), y: round(cy + r * Math.sin(rad)) };
}

var ROMAN_MAP = [
  [1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],
  [100,"C"],[90,"XC"],[50,"L"],[40,"XL"],
  [10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]
];
function toRoman(num, traditionalFour){
  if(traditionalFour && num === 4) return "IIII";
  if(traditionalFour && num === 9) return "VIIII";
  var result = "", n = num;
  for(var i = 0; i < ROMAN_MAP.length; i++){
    while(n >= ROMAN_MAP[i][0]){
      result += ROMAN_MAP[i][1];
      n -= ROMAN_MAP[i][0];
    }
  }
  return result;
}

// Scarica un Blob già pronto (usato dall'export ZIP).
function downloadBlob(filename, blob){
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

function download(filename, content){
  downloadBlob(filename, new Blob([content], {type: "image/svg+xml"}));
}

function svgWrap(viewW, viewH, inner){
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + viewW + 'mm" height="' + viewH + 'mm" viewBox="0 0 ' + viewW + ' ' + viewH + '">\n' +
    inner +
    '\n</svg>';
}

// Le funzioni qui sopra sono pure (niente DOM): le esportiamo anche come
// modulo CommonJS così lo stesso file può girare nel browser come <script>
// ed essere caricato da Node nei test (vedi test/clock-geometry.test.js).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { round: round, polar: polar, toRoman: toRoman, numVal: numVal, svgWrap: svgWrap };
}
