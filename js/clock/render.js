var CFG = null;
var liveInterval = null;

// Holds uploaded custom images (data URLs) - kept outside the DOM-driven CFG
// since <input type="file"> does not persist its read content across renders.
var customAssets = {
  hourIndex: null,
  minuteTick: null,
  handHour: null,
  handMinute: null,
  handSecond: null
};

function readCFG(){
  return {
    dial: {
      shape: document.querySelector('input[name="dialShape"]:checked').value,
      diameterMM: numVal("diameter", 200),
      cornerRadius: numVal("cornerRadius", 0),
      strokeWidth: numVal("dialStroke", 2),
      bgColor: $("dialBg").value,
      strokeColor: $("dialColor").value,
      minuteTicks: $("minuteTicks").checked,
      tickLength: numVal("tickLen", 3),
      tickWidth: numVal("tickWidth", 0.6),
      customTicks: $("customTicks").checked,
      customTickImage: customAssets.minuteTick,
      customTickSize: numVal("customTickSize", 3),
      customTickRotation: numVal("tickIconRotation", 0),
      centerText: $("centerText").value,
      centerTextSize: numVal("centerTextSize", 8),
      centerTextY: numVal("centerTextY", 30)
    },
    indices: {
      style: $("indexCustomToggle").checked ? "custom" : $("indexStyle").value,
      count: parseInt($("indexCount").value) || 12,
      size: numVal("indexSize", 10),
      distance: numVal("indexDistance", 85),
      color: $("indexColor").value,
      traditionalFour: $("traditionalFour").checked,
      emphasizeCardinal: $("emphasizeCardinal").checked,
      customImage: customAssets.hourIndex,
      customRotation: numVal("indexIconRotation", 0)
    },
    hands: {
      hour: {
        shape: $("hourCustomToggle").checked ? "custom" : $("hourShape").value,
        length: numVal("hourLength", 50),
        width: numVal("hourWidth", 6),
        tail: numVal("hourTail", 15),
        color: $("hourColor").value,
        customImage: customAssets.handHour,
        iconRotation: numVal("hourIconRotation", 0)
      },
      minute: {
        shape: $("minuteCustomToggle").checked ? "custom" : $("minuteShape").value,
        length: numVal("minuteLength", 72),
        width: numVal("minuteWidth", 4),
        tail: numVal("minuteTail", 15),
        color: $("minuteColor").value,
        customImage: customAssets.handMinute,
        iconRotation: numVal("minuteIconRotation", 0)
      },
      second: {
        enabled: $("secondEnabled").checked,
        shape: $("secondCustomToggle").checked ? "custom" : $("secondShape").value,
        length: numVal("secondLength", 82),
        width: numVal("secondWidth", 1.5),
        tail: numVal("secondTail", 25),
        color: $("secondColor").value,
        customImage: customAssets.handSecond,
        iconRotation: numVal("secondIconRotation", 0)
      }
    },
    mode: document.querySelector('input[name="mode"]:checked').value,
    staticTime: {
      h: numVal("staticH", 0),
      m: numVal("staticM", 0),
      s: numVal("staticS", 0)
    }
  };
}

function currentAngles(cfg){
  var h, m, s;
  if(cfg.mode === "live"){
    var now = new Date();
    h = now.getHours() % 12;
    m = now.getMinutes();
    s = now.getSeconds() + now.getMilliseconds()/1000;
  } else {
    h = cfg.staticTime.h % 12;
    m = cfg.staticTime.m;
    s = cfg.staticTime.s;
  }
  return {
    hour: (h + m/60) * 30,
    minute: (m + s/60) * 6,
    second: s * 6
  };
}

function renderAll(){
  CFG = readCFG();
  var R = CFG.dial.diameterMM / 2;
  var cx = R, cy = R;

  var svg = $("clockSvg");
  svg.setAttribute("viewBox", "0 0 " + CFG.dial.diameterMM + " " + CFG.dial.diameterMM);

  var dialMarkup = buildDialMarkup(CFG, cx, cy, R);
  var indicesMarkup = buildIndicesMarkup(CFG, cx, cy, R);

  var angles = currentAngles(CFG);
  var handsMarkup = "";
  handsMarkup += buildHandPreviewMarkup(CFG.hands.hour, cx, cy, R, angles.hour);
  handsMarkup += buildHandPreviewMarkup(CFG.hands.minute, cx, cy, R, angles.minute);
  if(CFG.hands.second.enabled){
    handsMarkup += buildHandPreviewMarkup(CFG.hands.second, cx, cy, R, angles.second);
  }
  handsMarkup += '<circle cx="' + cx + '" cy="' + cy + '" r="' + round(R*0.02 + 1.2) + '" fill="' + CFG.hands.hour.color + '"/>';

  svg.innerHTML = dialMarkup + indicesMarkup + handsMarkup;

  $("info-bar-text").textContent = round(CFG.dial.diameterMM,1) + "mm \u00d8 \u00b7 " +
    window.LSI18n.t(CFG.mode === "live" ? "mode-live" : "mode-static");

  toggleStaticTimeVisibility();
  toggleConditionalFields(CFG);
  updateExportAllLabel(CFG);
}

// Keeps the "Download all (N files)" label in sync with how many layers will
// actually be exported (the second hand is skipped when disabled).
function updateExportAllLabel(cfg){
  var count = cfg.hands.second.enabled ? 5 : 4;
  var unit = window.LSI18n.t(count === 1 ? "unit-file-singular" : "unit-file-plural");
  $("btnDlAllCount").textContent = "(" + count + " " + unit + ")";
}

function toggleStaticTimeVisibility(){
  var isLive = document.querySelector('input[name="mode"]:checked').value === "live";
  $("staticTimeField").style.display = isLive ? "none" : "block";
}

// Shows/hides fields whose relevance depends on other selected options.
function toggleConditionalFields(cfg){
  $("cornerRadiusField").style.display = cfg.dial.shape === "square" ? "block" : "none";
  $("diameterLabel").textContent = window.LSI18n.t(cfg.dial.shape === "square" ? "field-side" : "field-diameter");

  $("customTickUploadField").style.display = cfg.dial.customTicks ? "block" : "none";
  $("tickWidth").closest(".field").style.display = cfg.dial.customTicks ? "none" : "block";

  $("indexStyleField").style.display = cfg.indices.style === "custom" ? "none" : "block";
  $("customIndexUploadField").style.display = cfg.indices.style === "custom" ? "block" : "none";
  $("indexColor").closest(".field").style.display = cfg.indices.style === "custom" ? "none" : "block";

  ["hour","minute","second"].forEach(function(which){
    var isCustom = cfg.hands[which].shape === "custom";
    $(which + "ShapeField").style.display = isCustom ? "none" : "block";
    $(which + "CustomUploadField").style.display = isCustom ? "block" : "none";
    $(which + "Tail").closest(".field").style.display = isCustom ? "none" : "block";
  });
}

function startLiveClock(){
  stopLiveClock();
  liveInterval = setInterval(function(){
    if(CFG && CFG.mode === "live") renderAll();
  }, 1000);
}
function stopLiveClock(){
  if(liveInterval){ clearInterval(liveInterval); liveInterval = null; }
}

function onModeChange(){
  var mode = document.querySelector('input[name="mode"]:checked').value;
  document.querySelectorAll(".mode-toggle button[data-mode]").forEach(function(b){
    b.classList.toggle("active", b.dataset.mode === mode);
  });
  if(mode === "live") startLiveClock(); else stopLiveClock();
  renderAll();
}
