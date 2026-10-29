(function () {
  "use strict";

  var table = document.getElementById("peaksTable");
  if (!table) return;
  var tbody = table.querySelector("tbody");
  var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
  var search = document.getElementById("peakSearch");
  var count = document.getElementById("peakCount");
  var rangeBtns = document.querySelectorAll("[data-range]");
  var sortBtns = table.querySelectorAll(".sort-btn");
  var range = "all";

  function apply() {
    var q = (search.value || "").trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (r) {
      var okText = !q || r.textContent.toLowerCase().indexOf(q) !== -1;
      var okRange = range === "all" || (range === "pakistan" ? r.classList.contains("pk") : r.getAttribute("data-range") === range);
      r.hidden = !(okText && okRange);
      if (!r.hidden) shown++;
    });
    count.textContent = shown + " of " + rows.length + " peaks shown.";
  }

  search.addEventListener("input", apply);

  Array.prototype.forEach.call(rangeBtns, function (b) {
    b.addEventListener("click", function () {
      range = b.getAttribute("data-range");
      Array.prototype.forEach.call(rangeBtns, function (x) {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      apply();
    });
  });

  Array.prototype.forEach.call(sortBtns, function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-key");
      var num = btn.getAttribute("data-type") === "num";
      var dir = btn.getAttribute("data-dir") === "asc" ? "desc" : "asc";
      Array.prototype.forEach.call(sortBtns, function (b) { b.removeAttribute("data-dir"); });
      btn.setAttribute("data-dir", dir);
      rows.sort(function (a, b) {
        var x = a.getAttribute("data-" + key), y = b.getAttribute("data-" + key);
        var c = num ? parseFloat(x) - parseFloat(y) : x.localeCompare(y);
        return dir === "asc" ? c : -c;
      });
      rows.forEach(function (r) {
        r.style.animation = "none";
        tbody.appendChild(r);
        void r.offsetWidth;
        r.style.animation = "";
      });
    });
  });

  apply();
})();
