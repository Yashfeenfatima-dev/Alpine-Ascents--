(function () {
  "use strict";

  var cards = document.querySelectorAll(".shelter-card");
  var modal = document.getElementById("bookingModal");
  var form = document.getElementById("bookingForm");
  var selectedInput = document.getElementById("selectedShelter");
  var locInput = document.getElementById("locInput");
  var locError = document.getElementById("locError");
  var nights = document.getElementById("bkNights");
  var total = document.getElementById("bkTotal");
  var closeBtn = document.getElementById("bookClose");
  var useBtn = document.querySelector(".use-loc");
  var price = 0, lastCard = null;

  var saved = window.AA ? window.AA.visitor() : {};
  if (saved.name) document.getElementById("bkName").value = saved.name;
  if (saved.location) locInput.value = saved.location;
  if (saved.email) document.getElementById("bkEmail").value = saved.email;
  if (saved.phone) document.getElementById("bkPhone").value = saved.phone;

  Array.prototype.forEach.call(cards, function (card) {
    var img = card.querySelector("img");
    if (img && img.dataset.fallback) {
      img.addEventListener("error", function () {
        if (img.src.indexOf(img.dataset.fallback) === -1) img.src = img.dataset.fallback;
      }, { once: true });
    }
    card.addEventListener("click", function () {
      lastCard = card;
      var title = card.querySelector(".name").textContent;
      var priceText = card.querySelector(".price").textContent;
      price = parseInt(priceText.replace(/[^\d]/g, ""), 10) || 0;
      selectedInput.value = title + " - " + priceText;
      updateTotal();
      modal.hidden = false;
      requestAnimationFrame(function () { modal.classList.add("show"); });
      document.getElementById("bkName").focus();
    });
  });

  function updateTotal() {
    var n = Math.max(1, Math.min(30, parseInt(nights.value, 10) || 1));
    total.textContent = "Estimated total: Rs " + (price * n).toLocaleString("en-PK") + " for " + n + (n === 1 ? " night" : " nights");
  }
  nights.addEventListener("input", updateTotal);

  function close() {
    if (modal.hidden) return;
    modal.classList.remove("show");
    setTimeout(function () { modal.hidden = true; }, 400);
    if (lastCard) lastCard.focus({ preventScroll: true });
  }
  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  if (useBtn && window.AA) {
    useBtn.addEventListener("click", function () {
      useBtn.textContent = "Locating…";
      window.AA.locate(function (place) {
        locInput.value = place;
        useBtn.textContent = "Use my location";
        locInput.closest(".form-field").classList.remove("invalid");
      }, function (msg) {
        useBtn.textContent = "Use my location";
        locError.textContent = msg;
        locInput.closest(".form-field").classList.add("invalid");
      });
    });
  }

  var rules = {
    bkName: function (v) { return v.trim().length >= 2; },
    bkNights: function (v) { var n = parseInt(v, 10); return n >= 1 && n <= 30; },
    locInput: function (v) { return v.trim().length >= 2; },
    bkEmail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    bkPhone: function (v) { return /^\+?[\d\s()-]{7,18}$/.test(v.trim()); }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, first = null;
    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      var good = rules[id](input.value);
      input.closest(".form-field").classList.toggle("invalid", !good);
      if (id === "locInput" && !good) locError.textContent = "Enter your location.";
      if (!good) { ok = false; first = first || input; }
    });
    if (!ok) { first.focus(); return; }

    var booking = {
      shelter: selectedInput.value,
      nights: parseInt(nights.value, 10),
      name: document.getElementById("bkName").value.trim(),
      location: locInput.value.trim(),
      email: document.getElementById("bkEmail").value.trim(),
      phone: document.getElementById("bkPhone").value.trim(),
      date: new Date().toISOString()
    };
    try {
      var all = JSON.parse(localStorage.getItem("aa_bookings") || "[]");
      all.push(booking);
      localStorage.setItem("aa_bookings", JSON.stringify(all));
    } catch (err) {}

    close();
    if (window.AA) window.AA.toast(selectedInput.value.split(" - ")[0] + " booked successfully for " + booking.nights + (booking.nights === 1 ? " night." : " nights."));
  });
})();
