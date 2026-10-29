(function () {
  "use strict";

  const data = {
    "avalanche": "Avalanches happen when a layer of snow breaks away and slides down a slope, often at more than 100 km/h. Most avalanches that catch people are slab avalanches triggered by the victims themselves. The danger is highest on slopes between 30 and 45 degrees, after heavy snowfall, during strong wind and when the sun warms the snow in the afternoon. Check the avalanche forecast, travel early, cross risky slopes one person at a time and avoid gullies below steep snow. Every member of the team should carry a transceiver, a probe and a shovel, and know how to use them. Most buried victims survive only if they are dug out within about 15 minutes.",
    "extreme weather": "Extreme Weather is the most unpredictable danger in the mountains. At altitudes above 3000m, weather can change within 10-15 minutes. Sudden snowstorms, whiteouts where you cannot see 2 meters ahead, and winds up to 100km/h are common. Temperature can drop 20°C in an hour. Always check the forecast, start early (before sunrise), and carry waterproof layers, goggles, and emergency shelter. If clouds build fast, turn back - summit can wait.",
    "altitude sickness": "Altitude Sickness (AMS) happens when your body doesn't get enough oxygen above 2500m. Symptoms start with headache, nausea, dizziness, and extreme fatigue. If ignored, it can become life-threatening HAPE or HACE where fluid fills lungs or brain. To prevent it, climb slowly - don't gain more than 300-500m per day above 3000m. Drink 4-5 liters water daily, avoid alcohol, and acclimatize for 1-2 days. If symptoms worsen, descend immediately 500m.",
    "crevasses": "Crevasses are deep cracks in glaciers, sometimes 100 feet deep and hidden under thin snow bridges. They are invisible and deadly. Even experienced climbers can fall if unroped. Always travel in rope teams of 2-3 people with 10-12m gap, wear harness, and probe suspicious snow with ice axe. Learn crevasse rescue techniques before your expedition. Early morning travel is safer when snow bridges are frozen hard.",
    "lightning": "Lightning is a major killer on high ridges and summits. Mountains attract lightning because you are the highest point. Storms usually build after 11 AM in summer. If you hear thunder, you are already in danger. Rule: If you can see summit and clouds are building, turn back. Avoid isolated trees, metal gear, and ridge tops. Crouch low on insulated pad, feet together, if caught. The safest place is below treeline in a depression.",
    "wildlife": "Wildlife encounters are rare but can be dangerous in remote alpine areas. This includes snow leopards, bears, wolves, and aggressive mountain goats protecting their territory. More common is encountering venomous snakes below 3000m or insects. Keep 100m distance from all wildlife, never feed them, and store food in sealed containers 50m away from tent. Make noise while hiking to avoid surprising animals. Carry bear spray where required and know how to use it.",
    "dehydration": "Dehydration at altitude is 2x faster than at sea level because air is dry, you breathe faster, and you sweat even in cold. Even mild dehydration causes headache, fatigue, poor decisions, and increases altitude sickness risk. Your body loses 2-3 liters per day without realizing. Drink 4-5 liters daily, check urine color (should be light yellow), and add electrolytes. Avoid excess caffeine. Keep water inside jacket to prevent freezing. Dehydration is preventable but often ignored.",
    "rockfall": "Rockfall is when loose rocks fall from above, triggered by wind, melting ice, other climbers, or temperature changes. A small rock at high speed can cause fatal head injury. 80% of rockfall happens in afternoon when sun melts ice. Wear helmet always, even on easy terrain. Avoid climbing directly below other teams, stay close to walls in gullies, and test holds before putting weight. If you hear 'ROCK!', don't look up - press against wall and cover head.",
    "frostbite": "Frostbite occurs when skin and tissue freeze in extreme cold, typically below -10°C with wind. Nose, ears, fingers, and toes are first affected. It starts with numbness and white patches, then blisters. Prevention is key: Wear 3 layers, waterproof mittens over gloves, cover all skin, and keep moving to maintain circulation. No cotton - it stays wet. If frostbite starts, warm gently with body heat, don't rub. Severe frostbite needs immediate evacuation.",
    "hypothermia": "Hypothermia is when core body temperature drops below 35°C and body cannot produce heat. It kills quickly. Caused by combination of cold, wind, wet clothes, and exhaustion. Signs are shivering, confusion, slurred speech, and drowsiness. To prevent, stay dry at all costs, wear wool/synthetic layers, carry emergency bivvy, and eat high-calorie food. If someone is hypothermic, insulate from ground, give warm drinks, and handle gently. Never give alcohol.",
    "falls": "Falls are the #1 cause of death in mountaineering, accounting for 50% of accidents. Causes are slippery ice, loose rock, fatigue, bad rope management, and overconfidence. A slip on a 30-degree snow slope can send you 500m down. Always use crampons properly fitted, use ice axe for self-arrest, rope up on glaciers and exposed ridges, and don't rush. Check knots and harness every time. Most falls happen on descent when tired - stay focused till base camp."
  };

  const cards = document.querySelectorAll(".hazard-card");
  const search = document.getElementById("searchHazard");
  const empty = document.getElementById("hazardEmpty");
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("popClose");
  let lastCard = null;

  cards.forEach(function (c) {
    const info = c.querySelector(".info");
    const more = document.createElement("span");
    more.className = "more";
    more.textContent = "Read more ↗";
    info.appendChild(more);

    const img = c.querySelector("img");
    if (img && img.dataset.fallback) {
      img.addEventListener("error", function () {
        if (img.src.indexOf(img.dataset.fallback) === -1) img.src = img.dataset.fallback;
      }, { once: true });
    }
  });

  search.addEventListener("input", function (e) {
    const v = e.target.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach(function (c) {
      const match = c.dataset.name.includes(v) || c.textContent.toLowerCase().includes(v);
      c.hidden = !match;
      if (match) { shown++; c.classList.add("visible"); }
    });
    empty.hidden = shown !== 0;
  });

  function openPopup(c) {
    lastCard = c;
    document.getElementById("pop-tag").textContent = c.querySelector(".tag").textContent;
    document.getElementById("pop-title").textContent = c.querySelector(".title").textContent;
    document.getElementById("pop-desc").textContent = data[c.dataset.name];
    const img = c.querySelector("img");
    const popImg = document.getElementById("pop-img");
    popImg.src = img.currentSrc || img.src;
    popImg.alt = img.alt;
    popup.hidden = false;
    requestAnimationFrame(function () { popup.classList.add("show"); });
    closeBtn.focus();
  }

  function closePopup() {
    if (popup.hidden) return;
    popup.classList.remove("show");
    setTimeout(function () { popup.hidden = true; }, 400);
    if (lastCard) lastCard.focus({ preventScroll: true });
  }

  cards.forEach(function (c) { c.addEventListener("click", function () { openPopup(c); }); });
  closeBtn.addEventListener("click", closePopup);
  popup.addEventListener("click", function (e) { if (e.target === popup) closePopup(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePopup(); });
})();
