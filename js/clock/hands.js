// Builds a hand shape in LOCAL coordinates, tip pointing up (negative Y), pivot at (0,0).
// L = length in mm (from pivot to tip), W = max width in mm, tailPct = tail length as % of L.
function buildHandLocalMarkup(handCfg, L, skipPivotDot){
  var W = handCfg.width;
  var tail = L * (handCfg.tail / 100);
  var color = handCfg.color;

  switch(handCfg.shape){
    case "baton":
      return '<line x1="0" y1="' + round(tail) + '" x2="0" y2="' + round(-L) + '" ' +
             'stroke="' + color + '" stroke-width="' + W + '" stroke-linecap="round"/>';

    case "sword": {
      var w2 = W/2, wMid = W*0.28;
      var pts = [
        [round(-w2), round(tail)],
        [round(w2), round(tail)],
        [round(wMid), round(-L*0.82)],
        [0, round(-L)],
        [round(-wMid), round(-L*0.82)]
      ];
      return '<polygon points="' + pts.map(function(p){return p[0]+','+p[1];}).join(" ") + '" fill="' + color + '"/>';
    }

    case "dauphine": {
      var w2d = W/2;
      var pts2 = [
        [0, round(tail)],
        [round(w2d), round(-L*0.32)],
        [0, round(-L)],
        [round(-w2d), round(-L*0.32)]
      ];
      return '<polygon points="' + pts2.map(function(p){return p[0]+','+p[1];}).join(" ") + '" fill="' + color + '"/>';
    }

    case "breguet": {
      var ringR = W * 1.8;
      var ringCenterY = -L + ringR + L*0.06;
      var s = "";
      s += '<line x1="0" y1="' + round(tail) + '" x2="0" y2="' + round(ringCenterY + ringR) + '" ' +
           'stroke="' + color + '" stroke-width="' + round(W*0.55) + '" stroke-linecap="round"/>';
      s += '<circle cx="0" cy="' + round(ringCenterY) + '" r="' + round(ringR) + '" ' +
           'fill="none" stroke="' + color + '" stroke-width="' + round(W*0.45) + '"/>';
      s += '<line x1="0" y1="' + round(ringCenterY - ringR) + '" x2="0" y2="' + round(-L) + '" ' +
           'stroke="' + color + '" stroke-width="' + round(W*0.55) + '" stroke-linecap="round"/>';
      return s;
    }

    case "custom": {
      if(handCfg.customImage){
        // Bottom-anchored (xMidYMax) so the pivot end stays fixed regardless of the image's aspect ratio.
        var img = '<image href="' + handCfg.customImage + '" x="' + round(-W/2) + '" y="' + round(-L) + '" ' +
             'width="' + round(W) + '" height="' + round(L) + '" preserveAspectRatio="xMidYMax meet"/>';
        return img;
      }
      // placeholder while no file has been uploaded yet
      return '<line x1="0" y1="' + round(tail) + '" x2="0" y2="' + round(-L) + '" ' +
             'stroke="' + color + '" stroke-width="' + W + '" stroke-linecap="round" stroke-dasharray="2,2"/>';
    }

    default:
      return "";
  }
}

// Returns markup for the preview, positioned at (cx,cy) and rotated to angleDeg (+ any custom icon offset).
function buildHandPreviewMarkup(handCfg, cx, cy, radiusBase, angleDeg){
  var L = radiusBase * (handCfg.length / 100);
  var local = buildHandLocalMarkup(handCfg, L);
  var offset = (handCfg.shape === "custom" && handCfg.iconRotation) ? handCfg.iconRotation : 0;
  return '<g transform="translate(' + cx + ',' + cy + ') rotate(' + round(angleDeg + offset) + ')">' + local + '</g>\n';
}

// Standalone SVG export: hand pointing straight up (12 o'clock) + icon rotation offset, pivot centered in viewBox.
function buildHandStandaloneSVG(cfg, which){
  var handCfg = cfg.hands[which];
  var R = cfg.dial.diameterMM / 2;
  var L = R * (handCfg.length / 100);
  var pad = Math.max(handCfg.width * 2, L * 0.1);
  var viewSize = round((L + pad) * 2);
  var cx = viewSize / 2, cy = viewSize / 2;
  var local = buildHandLocalMarkup(handCfg, L);
  var pivotDot = handCfg.shape === "custom" ? "" :
    '<circle cx="0" cy="0" r="' + round(handCfg.width*0.5) + '" fill="' + handCfg.color + '"/>';
  var offset = (handCfg.shape === "custom" && handCfg.iconRotation) ? handCfg.iconRotation : 0;
  var inner = '<g transform="translate(' + cx + ',' + cy + ') rotate(' + round(offset) + ')">' + local + pivotDot + '</g>';
  return svgWrap(viewSize, viewSize, inner);
}
