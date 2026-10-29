(function () {
  "use strict";

  var buttons = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll(".tech-card");
  var empty = document.getElementById("techEmpty");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      var shown = 0;
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      cards.forEach(function (c) {
        var show = f === "all" || c.getAttribute("data-cat") === f;
        c.hidden = !show;
        if (show) { c.classList.add("visible"); shown++; }
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });
})();
