(function () {
  "use strict";

  var buttons = document.querySelectorAll("[data-topic].filter-btn");
  var cards = document.querySelectorAll(".news-card");
  var empty = document.getElementById("newsEmpty");

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      var t = btn.getAttribute("data-topic");
      var shown = 0;
      Array.prototype.forEach.call(buttons, function (b) {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      Array.prototype.forEach.call(cards, function (c) {
        var show = t === "all" || c.getAttribute("data-topic") === t;
        c.hidden = !show;
        if (show) { c.classList.add("visible"); shown++; }
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });
})();
