// Returns the list of hour numbers to mark, in correct clock positions.
function hourList(count){
  return count === 12 ? [1,2,3,4,5,6,7,8,9,10,11,12] : [12,3,6,9];
}

function buildIndicesMarkup(cfg, cx, cy, R){
  var idx = cfg.indices;
  if(idx.style === "none") return "";

  var s = "";
  var hours = hourList(idx.count);
  var distMM = R * (idx.distance / 100);

  hours.forEach(function(h){
    var a = h * 30;
    var isCardinal = (h % 3 === 0);
    var scale = (idx.emphasizeCardinal && isCardinal) ? 1.35 : 1;
    var pos = polar(cx, cy, distMM, a);
    s += buildSingleIndex(idx, h, pos.x, pos.y, a, scale);
  });
  return s;
}

function buildSingleIndex(idx, hourNum, x, y, angleDeg, scale){
  var size = idx.size * scale;
  var color = idx.color;

  if(idx.style === "arabic" || idx.style === "roman"){
    var label = idx.style === "roman" ? toRoman(hourNum, idx.traditionalFour) : String(hourNum);
    return '<text x="' + x + '" y="' + round(y + size * 0.35) + '" text-anchor="middle" ' +
           'font-family="Sora, sans-serif" font-size="' + round(size) + '" font-weight="700" ' +
           'fill="' + color + '">' + label + '</text>\n';
  }

  if(idx.style === "custom"){
    if(idx.customImage){
      var rot = idx.customRotation || 0;
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + round(rot) + ')">' +
             '<image href="' + idx.customImage + '" x="' + round(-size/2) + '" y="' + round(-size/2) + '" ' +
             'width="' + round(size) + '" height="' + round(size) + '" preserveAspectRatio="xMidYMid meet"/></g>\n';
    }
    // placeholder while no file has been uploaded yet
    return '<rect x="' + round(x - size/2) + '" y="' + round(y - size/2) + '" width="' + round(size) + '" height="' + round(size) + '" ' +
           'fill="none" stroke="' + color + '" stroke-width="0.5" stroke-dasharray="1.5,1.5"/>\n';
  }

  // geometric shapes: build in local space then translate + rotate to face outward
  var local = "";
  switch(idx.style){
    case "dash":
      local = '<rect x="' + round(-size*0.18) + '" y="' + round(-size*0.6) + '" width="' + round(size*0.36) + '" height="' + round(size*1.2) + '" rx="' + round(size*0.1) + '"/>';
      break;
    case "dot":
      local = '<circle cx="0" cy="0" r="' + round(size*0.42) + '"/>';
      break;
    case "square":
      local = '<rect x="' + round(-size*0.4) + '" y="' + round(-size*0.4) + '" width="' + round(size*0.8) + '" height="' + round(size*0.8) + '"/>';
      break;
    case "triangle":
      local = '<polygon points="0,' + round(-size*0.55) + ' ' + round(size*0.5) + ',' + round(size*0.45) + ' ' + round(-size*0.5) + ',' + round(size*0.45) + '"/>';
      break;
    case "diamond":
      local = '<polygon points="0,' + round(-size*0.6) + ' ' + round(size*0.4) + ',0 0,' + round(size*0.6) + ' ' + round(-size*0.4) + ',0' + '"/>';
      break;
    default:
      local = "";
  }
  return '<g transform="translate(' + x + ',' + y + ') rotate(' + angleDeg + ')" fill="' + color + '">' + local + '</g>\n';
}

function buildIndicesStandaloneSVG(cfg){
  var R = cfg.dial.diameterMM / 2;
  var cx = R, cy = R;
  var inner = buildIndicesMarkup(cfg, cx, cy, R);
  return svgWrap(cfg.dial.diameterMM, cfg.dial.diameterMM, inner);
}
