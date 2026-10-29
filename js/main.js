(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sGet: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sSet: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  var visitor = { name: "", location: "", email: "", phone: "", lat: null, lon: null };
  try { visitor = Object.assign(visitor, JSON.parse(store.get("aa_visitor") || "{}")); } catch (e) {}

  function saveVisitor() { store.set("aa_visitor", JSON.stringify(visitor)); }

  function locate(done, fail) {
    if (!navigator.geolocation) { fail("Geolocation is not supported by this browser."); return; }
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      var fallback = lat.toFixed(3) + ", " + lon.toFixed(3);
      if (!window.fetch) { done(fallback, lat, lon); return; }
      fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=" + lat + "&lon=" + lon)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var a = d.address || {};
          var place = [a.city || a.town || a.village || a.county || a.state, a.country].filter(Boolean).join(", ");
          done(place || fallback, lat, lon);
        })
        .catch(function () { done(fallback, lat, lon); });
    }, function () {
      fail("Location permission was denied. Please type your location.");
    }, { timeout: 10000 });
  }

  function toast(message) {
    var old = $(".toast");
    if (old) old.remove();
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    var icon = document.createElement("b");
    icon.textContent = "✓";
    var text = document.createElement("span");
    text.textContent = message;
    t.appendChild(icon); t.appendChild(text);
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 450); }, 3800);
  }

  function buildWelcome() {
    document.body.classList.add("locked");
    var w = document.createElement("div");
    w.className = "welcome";
    w.setAttribute("role", "dialog");
    w.setAttribute("aria-modal", "true");
    w.setAttribute("aria-label", "Welcome to Alpine Ascents");
    w.innerHTML =
      '<div class="welcome-inner">' +
        '<div class="welcome-logo"><span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 48 44"><path class="lm-b" d="M19 42 32.5 17 46 42z"/><path class="lm-cap" d="m28.6 24.2 3.9-7.2 3.9 7.2-1.9-1.2-2 1.7-2-1.7z"/><path class="lm-a" fill-rule="evenodd" d="M2 42 18 6l16 36h-7.2l-2.6-6H11.8l-2.6 6zM18 24.5l-4.1 8.5h8.2z"/><path class="lm-snow" d="m13.3 16.6 2.4-1.9 2.3 2.2 2.3-2.2 2.4 1.9"/></svg></span><span class="logo-name">ALPINE<br>ASCENTS</span><span class="logo-tag">THE MOUNTAINS ARE CALLING</span></div>' +
        '<form class="welcome-form" novalidate>' +
          '<h2>Tell us who is climbing</h2>' +
          field("aaName", "Full name", "text", "name", "Enter your name.") +
          '<div class="field"><label for="aaLocation">Location</label><div class="loc-row">' +
            '<input id="aaLocation" type="text" autocomplete="address-level2" placeholder="City, Country">' +
            '<button type="button" class="loc-btn" id="aaLocate">Use my location</button></div>' +
            '<p class="err" id="aaLocErr">Enter your location.</p></div>' +
          field("aaEmail", "Email address", "email", "email", "Enter a valid email address.") +
          field("aaPhone", "Contact number", "tel", "tel", "Enter a valid contact number.") +
          '<button type="submit" class="btn">Enter the mountains</button>' +
          '<button type="button" class="welcome-skip" id="aaSkip">Skip for now</button>' +
          '<p class="welcome-privacy">Your details stay in this browser only.</p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(w);

    function field(id, label, type, ac, err) {
      return '<div class="field"><label for="' + id + '">' + label + '</label>' +
        '<input id="' + id + '" type="' + type + '" autocomplete="' + ac + '" required>' +
        '<p class="err">' + err + '</p></div>';
    }

    setTimeout(function () { w.classList.add("ready"); var n = $("#aaName", w); if (n) n.focus({ preventScroll: true }); }, 1600);

    var form = $("form", w), locInput = $("#aaLocation", w), locBtn = $("#aaLocate", w), locErr = $("#aaLocErr", w);
    var coords = { lat: null, lon: null };

    locBtn.addEventListener("click", function () {
      locBtn.textContent = "Locating…";
      locate(function (place, lat, lon) {
        locInput.value = place; coords.lat = lat; coords.lon = lon;
        locBtn.textContent = "Use my location";
        locInput.closest(".field").classList.remove("invalid");
      }, function (msg) {
        locBtn.textContent = "Use my location";
        locErr.textContent = msg; locInput.closest(".field").classList.add("invalid");
      });
    });

    var rules = {
      aaName: function (v) { return v.trim().length >= 2; },
      aaLocation: function (v) { return v.trim().length >= 2; },
      aaEmail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      aaPhone: function (v) { return /^\+?[\d\s()-]{7,18}$/.test(v.trim()); }
    };

    $("#aaSkip", w).addEventListener("click", function () {
      store.sSet("aa_entered", "1");
      countVisit();
      updateTicker();
      w.classList.add("hide");
      document.body.classList.remove("locked");
      setTimeout(function () { w.remove(); }, 1000);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, first = null;
      Object.keys(rules).forEach(function (id) {
        var input = $("#" + id, w), good = rules[id](input.value);
        input.closest(".field").classList.toggle("invalid", !good);
        if (id === "aaLocation" && !good) locErr.textContent = "Enter your location.";
        if (!good) { ok = false; first = first || input; }
      });
      if (!ok) { first.focus(); return; }

      visitor = {
        name: $("#aaName", w).value.trim(), location: locInput.value.trim(),
        email: $("#aaEmail", w).value.trim(), phone: $("#aaPhone", w).value.trim(),
        lat: coords.lat, lon: coords.lon
      };
      saveVisitor();
      store.sSet("aa_entered", "1");
      countVisit();
      updateTicker();
      w.classList.add("hide");
      document.body.classList.remove("locked");
      showWelcomePopup(visitor.name);
      document.dispatchEvent(new CustomEvent("aa:visitor", { detail: visitor }));
      setTimeout(function () { w.remove(); }, 1000);
    });
  }

  /* Visitor counter: +1 per browser session (skip or sign-in both count), base of 10 kept.
     Stored in this browser only; a real site-wide total needs a server. */
  var VISIT_BASE = 10;
  function visitTotal() { return (parseInt(store.get("aa_visits") || "0", 10) || 0) + VISIT_BASE; }
  function showVisits(animate) {
    var el = $("#visitorCount");
    if (!el) return;
    var n = visitTotal();
    var from = parseInt(String(el.textContent).replace(/\D/g, ""), 10);
    if (!animate || !from || from >= n) { el.textContent = n.toLocaleString(); return; }
    var t0 = performance.now();
    (function tick(t) {
      var p = Math.min((t - t0) / 900, 1);
      el.textContent = Math.round(from + (n - from) * p).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  function countVisit() {
    var fresh = !store.sGet("aa_counted");
    if (fresh) {
      store.set("aa_visits", String((parseInt(store.get("aa_visits") || "0", 10) || 0) + 1));
      store.sSet("aa_counted", "1");
    }
    showVisits(fresh);
  }

  /* Small line icons used in the live ticker (this object was missing, which crashed the script
     before the welcome form and the visitor counter could run) */
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var tickIcon = (function () {
    function svg(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
    return {
      peak: svg('<path d="m2 20 7-12 4 6.5L15.5 11 22 20z"/><circle cx="17.5" cy="5.5" r="2"/>'),
      date: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
      time: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
      pin:  svg('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
      user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>')
    };
  })();

  function updateTicker() {
    var spans = $$(".ticker-track span");
    if (!spans.length) return;
    var now = new Date();
    var date = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    var time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    var loc = visitor.location || "Location not shared";
    var sep = "&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;";
    var who = visitor.name ? sep + tickIcon.user + "Welcome, " + esc(visitor.name) : "";
    var chunk = tickIcon.peak + "ALPINE ASCENTS" + sep + tickIcon.date + date + sep + tickIcon.time + time + sep + tickIcon.pin + esc(loc) + who + sep + "THE MOUNTAINS ARE CALLING";
    spans.forEach(function (s) { s.innerHTML = chunk; });
  }

  function initTickerLocation() {
    var btn = $("#tickerLocate");
    if (!btn) return;
    btn.addEventListener("click", function () {
      btn.textContent = "Locating…";
      locate(function (place, lat, lon) {
        visitor.location = place; visitor.lat = lat; visitor.lon = lon;
        saveVisitor(); updateTicker();
        btn.textContent = "Update location";
        toast("Location updated: " + place);
        document.dispatchEvent(new CustomEvent("aa:visitor", { detail: visitor }));
      }, function (msg) {
        btn.textContent = "Share location";
        toast(msg);
      });
    });
    if (visitor.location) btn.textContent = "Update location";
    document.addEventListener("aa:visitor", function () { if (visitor.location) btn.textContent = "Update location"; });
    if (!visitor.location && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then(function (r) {
        if (r.state === "granted") btn.click();
      }).catch(function () {});
    }
  }

  function initNav() {
    var header = $(".header"), toggle = $("#menuToggle"), nav = $("#nav");
    if (!header) return;
    function onScroll() { header.classList.toggle("scrolled", window.scrollY > 30); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var items = $$(".nav-item.has-dropdown");
    function closeAll(except) { items.forEach(function (it) { if (it !== except) { it.classList.remove("open"); $(".nav-link", it).setAttribute("aria-expanded", "false"); } }); }

    items.forEach(function (it) {
      var btn = $(".nav-link", it);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = !it.classList.contains("open");
        closeAll(it);
        it.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
      it.addEventListener("mouseleave", function () {
        if (window.innerWidth > 1120) { it.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
      });
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".nav-item")) closeAll(); });

    $$(".site-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        $$(".site-nav .is-clicked").forEach(function (x) { x.classList.remove("is-clicked"); });
        a.classList.add("is-clicked");
      });
    });

    if (toggle && nav) {
      var setOpen = function (open) {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.style.overflow = open ? "hidden" : "";
        if (!open) closeAll();
      };
      toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
      nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); closeAll(); } });
      window.addEventListener("resize", function () { if (window.innerWidth > 1120 && nav.classList.contains("open")) setOpen(false); });
    }
  }

  function initAnimations() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // stagger the children of card grids instead of fading the whole grid at once
    $$(".card-grid, .adventure-grid, .record-grid, .gallery-grid, .photo-wall, .video-wall, .contact-cards").forEach(function (grid) {
      grid.classList.remove("reveal");
      Array.prototype.slice.call(grid.children).forEach(function (child, i) {
        child.classList.add("reveal", "zoom-in");
        child.dataset.delay = (i % 6) * 80;
      });
    });

    // image blocks slide in from the side they sit on; their photo wipes in
    $$(".about-image, .history-image, .safety-image, .split-media").forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.classList.add("reveal", "img-reveal", r.left + r.width / 2 < window.innerWidth / 2 ? "from-left" : "from-right");
    });
    $$(".about-text, .history-content, .safety-content").forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.classList.add(r.left + r.width / 2 < window.innerWidth / 2 ? "from-left" : "from-right");
    });

    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    function progress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    }
    progress();
    window.addEventListener("scroll", progress, { passive: true });
    window.addEventListener("resize", progress);

    // count up numbers such as "8,849 m" or "1953" when they scroll into view
    var nums = $$(".record-grid strong, .stat strong").filter(function (el) { return /^\d[\d,]*/.test(el.textContent.trim()); });
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, text = el.textContent.trim();
        var m = text.match(/^(\d[\d,]*)(.*)$/), end = parseInt(m[1].replace(/,/g, ""), 10), rest = m[2];
        var comma = m[1].indexOf(",") > -1, from = end > 1500 && end < 2100 && !comma ? end - 120 : 0, t0 = performance.now();
        (function tick(t) {
          var p = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
          var v = Math.round(from + (end - from) * e);
          el.textContent = (comma ? v.toLocaleString("en-US") : String(v)) + rest;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (i) { i.classList.add("visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("visible");
        io.unobserve(el);
        // once shown, drop the reveal classes so each element's own hover transforms work again
        setTimeout(function () {
          el.classList.remove("reveal", "zoom-in", "from-left", "from-right", "img-reveal");
          el.style.transitionDelay = "";
        }, 1900 + (parseInt(el.style.transitionDelay, 10) || 0));
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (el.dataset.delay != null ? el.dataset.delay : (i % 4) * 90) + "ms";
      io.observe(el);
    });
  }

  function showWelcomePopup(name) {
    var p = document.createElement("div");
    p.className = "welcome-popup";
    p.setAttribute("role", "alertdialog");
    p.setAttribute("aria-modal", "true");
    var box = document.createElement("div");
    box.className = "welcome-popup-box";
    var msg = document.createElement("p");
    msg.textContent = "Welcome " + name + " to Our Alpine Ascents Website!";
    var ok = document.createElement("button");
    ok.type = "button"; ok.className = "btn btn-primary"; ok.textContent = "OK";
    box.appendChild(msg); box.appendChild(ok); p.appendChild(box);
    document.body.appendChild(p);
    setTimeout(function () { p.classList.add("show"); ok.focus(); }, 30);
    var closed = false;
    function close() {
      if (closed) return; closed = true;
      p.classList.remove("show");
      setTimeout(function () { p.remove(); }, 500);
    }
    ok.addEventListener("click", close);
    setTimeout(close, 5000);
  }

  window.AA = { $: $, $$: $$, store: store, locate: locate, toast: toast, visitor: function () { return visitor; } };

  showVisits(false);
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
  initNav();
  initAnimations();
  initReveal();
  initTickerLocation();
  updateTicker();
  setInterval(updateTicker, 1000);

  /* ===== Dancing favicon (browser-tab icon) ===== */
  (function () {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var poses = [[-5, 1, 6, .95], [0, 1.09, 0, 1.08], [5, .94, -6, 1], [0, 1.07, 0, 1.1]];
    function frame(p) {
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 44">' +
        '<rect width="48" height="44" rx="9" fill="#1a1f24"/>' +
        '<g transform="translate(24 22) scale(.82) translate(-24 -22)">' +
        '<g transform="translate(32.5 42) rotate(' + p[2] + ') scale(1 ' + p[3] + ') translate(-32.5 -42)">' +
        '<path d="M19 42 32.5 17 46 42z" fill="#2f7f8c"/><path d="m28.6 24.2 3.9-7.2 3.9 7.2-1.9-1.2-2 1.7-2-1.7z" fill="#fff"/></g>' +
        '<g transform="translate(18 42) rotate(' + p[0] + ') scale(1 ' + p[1] + ') translate(-18 -42)">' +
        '<path d="M2 42 18 6l16 36h-7.2l-2.6-6H11.8l-2.6 6zM18 24.5l-4.1 8.5h8.2z" fill="#9fd2da" fill-rule="evenodd"/></g></g></svg>';
      return "data:image/svg+xml," + encodeURIComponent(s);
    }
    var frames = poses.map(frame), i = 0;
    var link = document.querySelector('link[rel~="icon"]');
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.type = "image/svg+xml";
    setInterval(function () { if (document.hidden) return; i = (i + 1) % frames.length; link.href = frames[i]; }, 300);
  })();

  if (store.sGet("aa_entered")) { countVisit(); }
  else { buildWelcome(); }
})();
