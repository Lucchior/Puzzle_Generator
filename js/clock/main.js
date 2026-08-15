// js/clock/main.js
// Avvio del generatore di quadranti: crea gli slider, collega ogni controllo
// al ridisegno dell'anteprima e i pulsanti di export alle rispettive funzioni.
// Tema e cambio lingua NON sono qui: sono condivisi con il resto del sito
// (vedi js/shared/site.js e js/shared/i18n.js).

// Reads an uploaded file (SVG/PNG/JPG) as a data URL and stores it in customAssets, then re-renders.
// previewId (optional): id of an <img> used to show a live thumbnail of the uploaded file.
function wireFileInput(inputId, assetKey, statusId, previewId){
  var input = $(inputId);
  if(!input) return;
  input.addEventListener("change", function(){
    var file = input.files && input.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(e){
      customAssets[assetKey] = e.target.result;
      if(statusId && $(statusId)) $(statusId).textContent = file.name;
      if(previewId && $(previewId)){
        $(previewId).src = e.target.result;
        $(previewId).removeAttribute("hidden");
      }
      renderAll();
    };
    reader.readAsDataURL(file);
  });
}

window.addEventListener("load", function(){
  enhanceSliders();

  // Tema, lingua e footer sono gestiti dal codice condiviso (js/shared/*).
  // Qui chiediamo solo di ridisegnare l'anteprima dopo un cambio lingua:
  // il quadrante contiene testo tradotto (barra info, etichette dinamiche).
  window.LSI18n.onApply(renderAll);

  // mode toggle buttons (static/live)
  document.querySelectorAll(".mode-toggle button[data-mode]").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelector('input[name="mode"][value="' + b.dataset.mode + '"]').checked = true;
      onModeChange();
    });
  });

  // dial shape toggle (circle/square)
  document.querySelectorAll(".mode-toggle button[data-shape]").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelector('input[name="dialShape"][value="' + b.dataset.shape + '"]').checked = true;
      document.querySelectorAll(".mode-toggle button[data-shape]").forEach(function(x){
        x.classList.toggle("active", x === b);
      });
      renderAll();
    });
  });

  // wire every input/select/checkbox/color to re-render on change/input
  var allInputs = document.querySelectorAll(".controls input:not([type=file]), .controls select");
  allInputs.forEach(function(el){
    var evt = (el.type === "checkbox" || el.type === "radio" || el.tagName === "SELECT") ? "change" : "input";
    el.addEventListener(evt, function(){ renderAll(); });
  });

  // custom file uploads
  wireFileInput("hourIndexFile", "hourIndex", "hourIndexFileName", "hourIndexPreview");
  wireFileInput("minuteTickFile", "minuteTick", "minuteTickFileName", "minuteTickPreview");
  wireFileInput("hourHandFile", "handHour", "hourHandFileName", "hourHandPreview");
  wireFileInput("minuteHandFile", "handMinute", "minuteHandFileName", "minuteHandPreview");
  wireFileInput("secondHandFile", "handSecond", "secondHandFileName", "secondHandPreview");

  // export buttons
  $("btnDlDial").addEventListener("click", exportDial);
  $("btnDlIndices").addEventListener("click", exportIndices);
  $("btnDlHour").addEventListener("click", function(){ exportHand("hour"); });
  $("btnDlMinute").addEventListener("click", function(){ exportHand("minute"); });
  $("btnDlSecond").addEventListener("click", function(){ exportHand("second"); });
  $("btnDlAll").addEventListener("click", exportAll);
  $("btnDlCombined").addEventListener("click", exportCombined);

  // set a nice default static time (10:10:30 - classic watch pose)
  $("staticH").value = 10;
  $("staticM").value = 10;
  $("staticS").value = 30;

  toggleStaticTimeVisibility();
  renderAll();
});
