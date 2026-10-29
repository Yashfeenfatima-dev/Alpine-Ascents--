(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  (function heroVideos() {
    var vids = $$(".hero-video");
    var counter = $("#heroCounter");
    if (!vids.length) return;
    var cur = 0, timer = null, MAX_MS = 8000;

    function load(v) {
      if (!v.getAttribute("src")) { v.setAttribute("src", v.dataset.src); v.preload = "auto"; v.load(); }
    }
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(next, MAX_MS);
    }
    function show(i) {
      var incoming = vids[i], outgoing = vids[cur];
      load(incoming);
      try { incoming.currentTime = 0; } catch (e) {}
      var done = false;
      function swap() {
        if (done) return; done = true;
        vids.forEach(function (v) { v.classList.remove("prev"); });
        if (outgoing !== incoming) { outgoing.classList.remove("active"); outgoing.classList.add("prev"); }
        incoming.classList.add("active");
        cur = i;
        if (counter) counter.textContent = pad(i + 1) + " / " + pad(vids.length);
        setTimeout(function () { if (vids[cur] !== outgoing) outgoing.pause(); }, 1400);
        schedule();
        load(vids[(i + 1) % vids.length]);
      }
      var p = incoming.play();
      if (p && p.then) { p.then(swap, swap); } else { swap(); }
      setTimeout(swap, 2500);
    }
    function next() { show((cur + 1) % vids.length); }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { vids[cur].pause(); clearTimeout(timer); }
      else { var p = vids[cur].play(); if (p && p.catch) p.catch(function () {}); schedule(); }
    });

    load(vids[0]);
    var first = vids[0].play();
    if (first && first.catch) first.catch(function () {});
    schedule();
    load(vids[1]);
  })();

  (function cardPreviews() {
    $$(".video-card").forEach(function (c) {
      var v = $("video", c);
      if (!v) return;
      c.addEventListener("mouseenter", function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); });
      c.addEventListener("mouseleave", function () { v.pause(); });
    });
  })();

  (function filters() {
    var btns = $$(".filter-btn"), photos = $$(".photo");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.toggle("active", x === b); });
        var f = b.dataset.filter;
        photos.forEach(function (p) { p.classList.toggle("is-hidden", f !== "all" && p.dataset.cat !== f); });
      });
    });
  })();

  (function lightbox() {
    var box = $("#lightbox"), stage = $("#lbStage"), label = $("#lbLabel"), title = $("#lbTitle"), count = $("#lbCount");
    var list = [], idx = 0, lastFocus = null;

    function render() {
      var it = list[idx];
      stage.innerHTML = "";
      var el;
      if (it.type === "video") {
        el = document.createElement("video");
        el.controls = true; el.autoplay = true; el.playsInline = true; el.loop = true;
        el.poster = it.poster; el.src = it.src;
      } else {
        el = document.createElement("img");
        el.src = it.src; el.alt = it.title;
      }
      stage.appendChild(el);
      label.textContent = it.label;
      title.textContent = it.title;
      count.textContent = (idx + 1) + " / " + list.length;
    }
    function open(items, i) {
      list = items; idx = i; lastFocus = document.activeElement;
      box.hidden = false;
      render();
      requestAnimationFrame(function () { box.classList.add("show"); });
      document.documentElement.classList.add("lb-open");
      $("#lbClose").focus();
    }
    function close() {
      if (box.hidden) return;
      box.classList.remove("show");
      var v = $("video", stage); if (v) v.pause();
      setTimeout(function () { box.hidden = true; stage.innerHTML = ""; }, 350);
      document.documentElement.classList.remove("lb-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    function step(d) { idx = (idx + d + list.length) % list.length; render(); }

    function photoItems() {
      return $$(".photo").filter(function (p) { return !p.classList.contains("is-hidden"); }).map(function (p) {
        return { type: "image", src: p.dataset.full, title: p.dataset.title, label: p.dataset.label.toUpperCase(), el: p };
      });
    }
    function videoItems() {
      return $$(".video-card").map(function (c) {
        return { type: "video", src: c.dataset.video, poster: c.dataset.poster, title: c.dataset.title, label: "VIDEO", el: c };
      });
    }
    function bind(sel, getItems) {
      $$(sel).forEach(function (el) {
        function go() { var items = getItems(); open(items, items.map(function (x) { return x.el; }).indexOf(el)); }
        el.addEventListener("click", go);
        el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
    }
    bind(".photo", photoItems);
    bind(".video-card", videoItems);

    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", function () { step(-1); });
    $("#lbNext").addEventListener("click", function () { step(1); });
    box.addEventListener("click", function (e) { if (e.target === box || e.target === stage) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  })();
})();