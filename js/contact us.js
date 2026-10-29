(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;
  const locBtn = document.getElementById("locBtn");
  const locInput = document.getElementById("locInput");
  const locError = document.getElementById("locError");
  const success = document.getElementById("contactSuccess");

  const saved = window.AA ? window.AA.visitor() : {};
  if (saved.name) document.getElementById("ctName").value = saved.name;
  if (saved.location) locInput.value = saved.location;
  if (saved.email) document.getElementById("ctEmail").value = saved.email;
  if (saved.phone) document.getElementById("ctPhone").value = saved.phone;

  locBtn.addEventListener("click", function () {
    if (!window.AA) return;
    locBtn.textContent = "Locating...";
    window.AA.locate(function (place) {
      locInput.value = place;
      locInput.closest(".form-field").classList.remove("invalid");
      locBtn.textContent = "✓ Done";
      window.AA.toast("Your location was added successfully.");
      setTimeout(function () { locBtn.textContent = "Use my location"; }, 2000);
    }, function (msg) {
      locError.textContent = msg;
      locInput.closest(".form-field").classList.add("invalid");
      locBtn.textContent = "Use my location";
    });
  });

  const rules = {
    ctName: function (v) { return v.trim().length >= 2; },
    locInput: function (v) { return v.trim().length >= 2; },
    ctEmail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    ctPhone: function (v) { return /^\+?[\d\s()-]{7,18}$/.test(v.trim()); },
    ctMessage: function (v) { return v.trim().length >= 10; }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let ok = true, first = null;
    Object.keys(rules).forEach(function (id) {
      const input = document.getElementById(id);
      const good = rules[id](input.value);
      input.closest(".form-field").classList.toggle("invalid", !good);
      if (id === "locInput" && !good) locError.textContent = "Enter your location.";
      if (!good) { ok = false; first = first || input; }
    });
    if (!ok) { first.focus(); return; }

    const entry = {
      name: document.getElementById("ctName").value.trim(),
      location: locInput.value.trim(),
      email: document.getElementById("ctEmail").value.trim(),
      phone: document.getElementById("ctPhone").value.trim(),
      mountain: document.getElementById("ctMountain").value.trim(),
      message: document.getElementById("ctMessage").value.trim(),
      date: new Date().toISOString()
    };
    try {
      const all = JSON.parse(localStorage.getItem("aa_messages") || "[]");
      all.push(entry);
      localStorage.setItem("aa_messages", JSON.stringify(all));
    } catch (err) {}

    document.getElementById("ctThanks").textContent = entry.name.split(" ")[0];
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  document.getElementById("ctAgain").addEventListener("click", function () {
    form.reset();
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    success.hidden = true;
    form.hidden = false;
    document.getElementById("ctName").focus();
  });
})();
