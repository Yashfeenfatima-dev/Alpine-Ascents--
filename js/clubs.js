(function () {
  "use strict";

  var clubs = [
    { name: "Alpine Club of Pakistan", city: "Islamabad", country: "Pakistan", region: "Asia", lat: 33.6938, lon: 73.0652, founded: 1974, url: "https://www.alpineclub.org.pk/", desc: "Pakistan's national mountaineering body. Supports expeditions to the Karakoram and Himalaya and runs training courses." },
    { name: "Nepal Mountaineering Association", city: "Kathmandu", country: "Nepal", region: "Asia", lat: 27.7172, lon: 85.324, founded: 1973, url: "https://www.nepalmountaineering.org/", desc: "Manages many of Nepal's trekking peaks and trains Nepali climbers and guides." },
    { name: "Indian Mountaineering Foundation", city: "New Delhi", country: "India", region: "Asia", lat: 28.5895, lon: 77.17, founded: 1958, url: "https://www.indmount.org/", desc: "India's national body for mountaineering, issuing permits and promoting climbing across the Indian Himalaya." },
    { name: "The Himalayan Club", city: "Mumbai", country: "India", region: "Asia", lat: 19.076, lon: 72.8777, founded: 1928, url: "https://www.himalayanclub.org/", desc: "A historic club that publishes the Himalayan Journal, one of the main records of climbing in the range." },
    { name: "Japanese Alpine Club", city: "Tokyo", country: "Japan", region: "Asia", lat: 35.6762, lon: 139.6503, founded: 1905, url: "https://jac1.or.jp/", desc: "One of Asia's oldest mountaineering clubs, with a long history of Himalayan expeditions." },
    { name: "The Alpine Club", city: "London", country: "United Kingdom", region: "Europe", lat: 51.5246, lon: -0.0812, founded: 1857, url: "https://www.alpine-club.org.uk/", desc: "The world's first mountaineering club. Its library and Alpine Journal record over 160 years of climbing." },
    { name: "British Mountaineering Council", city: "Manchester", country: "United Kingdom", region: "Europe", lat: 53.4808, lon: -2.2426, founded: 1944, url: "https://www.thebmc.co.uk/", desc: "Represents climbers, hill walkers and mountaineers in England and Wales, with safety and skills resources." },
    { name: "UIAA (International Climbing and Mountaineering Federation)", city: "Bern", country: "Switzerland", region: "Europe", lat: 46.948, lon: 7.4474, founded: 1932, url: "https://www.theuiaa.org/", desc: "The global federation that sets safety standards for climbing equipment and links national clubs worldwide." },
    { name: "Club Alpino Italiano", city: "Milan", country: "Italy", region: "Europe", lat: 45.4642, lon: 9.19, founded: 1863, url: "https://www.cai.it/", desc: "Italy's alpine club runs hundreds of mountain huts and trains thousands of climbers every year." },
    { name: "Deutscher Alpenverein", city: "Munich", country: "Germany", region: "Europe", lat: 48.1351, lon: 11.582, founded: 1869, url: "https://www.alpenverein.de/", desc: "The German Alpine Club, one of the largest mountain sports associations in the world." },
    { name: "FFCAM (French Alpine Clubs)", city: "Paris", country: "France", region: "Europe", lat: 48.8566, lon: 2.3522, founded: 1874, url: "https://www.ffcam.fr/", desc: "Founded as the Club Alpin Français. Runs huts, courses and clubs across France." },
    { name: "American Alpine Club", city: "Golden, Colorado", country: "USA", region: "Americas", lat: 39.7555, lon: -105.2211, founded: 1902, url: "https://americanalpineclub.org/", desc: "Publishes Accidents in North American Climbing and supports climbers with rescue insurance and grants." },
    { name: "Alpine Club of Canada", city: "Canmore, Alberta", country: "Canada", region: "Americas", lat: 51.089, lon: -115.359, founded: 1906, url: "https://www.alpineclubofcanada.ca/", desc: "Operates a network of backcountry huts in the Canadian Rockies and runs mountaineering camps." },
    { name: "Club Andino Bariloche", city: "San Carlos de Bariloche", country: "Argentina", region: "Americas", lat: -41.1335, lon: -71.3103, founded: 1931, url: "https://www.clubandino.org/", desc: "A leading club of the Andes, maintaining refuges and trails in Patagonia." },
    { name: "New Zealand Alpine Club", city: "Christchurch", country: "New Zealand", region: "Africa & Oceania", lat: -43.5321, lon: 172.6362, founded: 1891, url: "https://alpineclub.org.nz/", desc: "Supports climbing in the Southern Alps and maintains huts in remote mountain areas." },
    { name: "Mountain Club of South Africa", city: "Cape Town", country: "South Africa", region: "Africa & Oceania", lat: -33.9249, lon: 18.4241, founded: 1891, url: "https://www.mcsa.org.za/", desc: "Runs climbing, hiking and mountain rescue activities across South Africa." }
  ];

  var list = document.getElementById("clubList");
  var status = document.getElementById("mapStatus");
  var nearBtn = document.getElementById("nearMe");
  var gmaps = document.getElementById("gmapsLink");
  var regionBtns = document.querySelectorAll("[data-region]");
  var region = "all", me = null, map = null, meMarker = null;

  function gmapsUrl(c) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.name + ", " + c.city + ", " + c.country);
  }

  function km(aLat, aLon, bLat, bLon) {
    var R = 6371, toRad = Math.PI / 180;
    var dLat = (bLat - aLat) * toRad, dLon = (bLon - aLon) * toRad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(aLat * toRad) * Math.cos(bLat * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  if (window.L) {
    map = L.map("clubMap", { scrollWheelZoom: false, worldCopyJump: true }).setView([30, 20], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
    }).addTo(map);
    clubs.forEach(function (c) {
      var icon = L.divIcon({ className: "", html: '<div class="club-pin"></div>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
      c.marker = L.marker([c.lat, c.lon], { icon: icon, title: c.name }).addTo(map);
      var pop = el("div");
      pop.appendChild(el("h4", null, c.name));
      pop.appendChild(el("p", null, c.city + ", " + c.country + " · Founded " + c.founded));
      var a = el("a", null, "Visit website ↗");
      a.href = c.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      pop.appendChild(a);
      c.marker.bindPopup(pop);
      c.marker.on("click", function () { highlight(c, false); });
    });
  }

  function highlight(c, fly) {
    Array.prototype.forEach.call(list.children, function (item) { item.classList.toggle("active", item.dataset.name === c.name); });
    var item = list.querySelector('[data-name="' + c.name.replace(/"/g, '\\"') + '"]');
    if (item) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (map && fly) {
      map.flyTo([c.lat, c.lon], 6, { duration: 1.2 });
      c.marker.openPopup();
    }
  }

  function render() {
    var shown = clubs.filter(function (c) { return region === "all" || c.region === region; });
    if (me) {
      shown.forEach(function (c) { c.dist = km(me.lat, me.lon, c.lat, c.lon); });
      shown.sort(function (a, b) { return a.dist - b.dist; });
    }
    list.innerHTML = "";
    shown.forEach(function (c) {
      var item = el("article", "club-item");
      item.dataset.name = c.name;
      var where = el("span", "where", c.city + ", " + c.country + " · Est. " + c.founded);
      if (me) where.appendChild(el("span", "dist", c.dist.toLocaleString() + " km away"));
      item.appendChild(where);
      item.appendChild(el("h3", null, c.name));
      item.appendChild(el("p", null, c.desc));
      var actions = el("div", "club-actions");
      var show = el("button", null, "Show on map");
      show.type = "button";
      show.addEventListener("click", function () { highlight(c, true); });
      if (map) actions.appendChild(show);
      var site = el("a", null, "Website ↗");
      site.href = c.url; site.target = "_blank"; site.rel = "noopener noreferrer";
      var gm = el("a", null, "Google Maps ↗");
      gm.href = gmapsUrl(c); gm.target = "_blank"; gm.rel = "noopener noreferrer";
      actions.appendChild(site); actions.appendChild(gm);
      item.appendChild(actions);
      list.appendChild(item);
    });

    if (map) {
      clubs.forEach(function (c) {
        var visible = region === "all" || c.region === region;
        if (visible && !map.hasLayer(c.marker)) c.marker.addTo(map);
        if (!visible && map.hasLayer(c.marker)) map.removeLayer(c.marker);
      });
      var pts = shown.map(function (c) { return [c.lat, c.lon]; });
      if (me) pts.push([me.lat, me.lon]);
      if (pts.length) map.flyToBounds(pts, { padding: [40, 40], maxZoom: 6, duration: 1 });
    }

    var msg = "Showing " + shown.length + " organization" + (shown.length === 1 ? "" : "s") + ".";
    if (me && shown.length) msg += " Nearest to you: " + shown[0].name + " (" + shown[0].dist.toLocaleString() + " km).";
    status.textContent = msg;
  }

  Array.prototype.forEach.call(regionBtns, function (b) {
    b.addEventListener("click", function () {
      region = b.getAttribute("data-region");
      Array.prototype.forEach.call(regionBtns, function (x) {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      render();
    });
  });

  function useLocation(lat, lon) {
    me = { lat: lat, lon: lon };
    gmaps.href = "https://www.google.com/maps/search/mountaineering+clubs/@" + lat + "," + lon + ",10z";
    if (map) {
      if (meMarker) map.removeLayer(meMarker);
      meMarker = L.marker([lat, lon], { icon: L.divIcon({ className: "", html: '<div class="me-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), title: "You are here" }).addTo(map).bindPopup("You are here");
    }
    nearBtn.textContent = "Clubs Sorted By Distance";
    render();
  }

  nearBtn.addEventListener("click", function () {
    var v = window.AA ? window.AA.visitor() : {};
    if (v.lat && v.lon) { useLocation(v.lat, v.lon); return; }
    nearBtn.textContent = "Locating…";
    if (!window.AA) return;
    window.AA.locate(function (place, lat, lon) {
      useLocation(lat, lon);
    }, function (msg) {
      nearBtn.textContent = "Find Clubs Near Me";
      status.textContent = msg + " You can still browse all organizations on the map.";
    });
  });

  render();
})();
