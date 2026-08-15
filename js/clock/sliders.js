// Wraps every <input type="number" class="has-slider"> with a draggable
// <input type="range"> mirroring the same min/max/step, so every "continuous"
// numeric field can be adjusted either by dragging or by typing an exact value.
// Must run BEFORE main.js wires the generic render-on-input listeners, so the
// newly created range inputs get picked up automatically.
function enhanceSliders(){
  document.querySelectorAll('input[type="number"].has-slider').forEach(function(numberInput){
    if(numberInput.dataset.sliderReady) return; // avoid double-wrapping if called twice
    numberInput.dataset.sliderReady = "1";

    var range = document.createElement("input");
    range.type = "range";
    range.className = "field-range";
    range.min = numberInput.min;
    range.max = numberInput.max;
    range.step = numberInput.step || "1";
    range.value = numberInput.value;

    var labelText = "";
    var label = numberInput.closest(".field") && numberInput.closest(".field").querySelector("label");
    if(label) labelText = label.textContent;
    range.setAttribute("aria-label", labelText);

    var row = document.createElement("div");
    row.className = "slider-row";

    numberInput.parentNode.insertBefore(row, numberInput);
    row.appendChild(range);
    row.appendChild(numberInput);

    range.addEventListener("input", function(){
      numberInput.value = range.value;
    });
    numberInput.addEventListener("input", function(){
      var v = parseFloat(numberInput.value);
      if(isNaN(v)) return;
      var min = parseFloat(range.min), max = parseFloat(range.max);
      if(!isNaN(min)) v = Math.max(v, min);
      if(!isNaN(max)) v = Math.min(v, max);
      range.value = v;
    });
  });
}
