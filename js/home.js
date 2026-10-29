(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  if (!slides.length) return;

  var count = document.getElementById("heroCount");
  var title = document.getElementById("heroTitle");
  var pauseBtn = document.getElementById("heroPause");
  var MAX_MS = 9000;
  var cur = 0, timer = null, paused = false;

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function load(v) {
    if (!v.getAttribute("src")) { v.setAttribute("src", v.getAttribute("data-src")); v.preload = "auto"; v.load(); }
  }
  function play(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function schedule() {
    clearTimeout(timer);
    if (!paused) timer = setTimeout(next, MAX_MS);
  }

  function go(i) {
    if (i === cur) return;
    var outgoing = slides[cur], incoming = slides[i];
    load(incoming);
    try { incoming.currentTime = 0; } catch (e) {}
    if (!paused) play(incoming);
    slides.forEach(function (s) { s.classList.remove("prev"); });
    outgoing.classList.remove("active");
    outgoing.classList.add("prev");
    incoming.classList.add("active");
    cur = i;
    count.textContent = pad(cur + 1) + " / " + pad(slides.length);
    title.textContent = incoming.getAttribute("data-title");
    setTimeout(function () { if (slides[cur] !== outgoing) outgoing.pause(); }, 1300);
    load(slides[(cur + 1) % slides.length]);
    schedule();
  }

  function next() { go((cur + 1) % slides.length); }

  pauseBtn.addEventListener("click", function () {
    paused = !paused;
    pauseBtn.textContent = paused ? "Play" : "Pause";
    pauseBtn.setAttribute("aria-pressed", String(paused));
    if (paused) { slides[cur].pause(); clearTimeout(timer); }
    else { play(slides[cur]); schedule(); }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { slides[cur].pause(); clearTimeout(timer); }
    else if (!paused) { play(slides[cur]); schedule(); }
  });

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    paused = true;
    pauseBtn.textContent = "Play";
    pauseBtn.setAttribute("aria-pressed", "true");
  }

  load(slides[0]);
  if (!paused) play(slides[0]);
  load(slides[1]);
  schedule();
})();
