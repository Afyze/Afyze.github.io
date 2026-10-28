(function () {
  "use strict";
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .1 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  var NS = "http://www.w3.org/2000/svg";
  function s(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; }
  var eur = function (n) { return Math.round(n).toLocaleString("ro-RO") + " €"; };

  // ---------- date demo: 9 etaje × 8 apartamente (determinist) ----------
  var APTS = [], seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  for (var f = 1; f <= 9; f++) for (var u = 1; u <= 8; u++) {
    var rooms = u <= 2 ? 1 : u <= 6 ? 2 : 3;
    var area = rooms === 1 ? 38 + Math.round(rnd() * 8) : rooms === 2 ? 56 + Math.round(rnd() * 12) : 78 + Math.round(rnd() * 16);
    var price = area * (1050 + f * 18 + Math.round(rnd() * 60));
    APTS.push({ id: f + "." + u, floor: f, rooms: rooms, area: area, price: Math.round(price / 500) * 500, free: rnd() > .32 });
  }
  var st = { floor: 0, rooms: 0, max: 140000, onlyFree: false };

  // ---------- clădirea ----------
  var svg = document.getElementById("bsvg"), tipN = document.getElementById("tipN"), label = document.getElementById("floorLabel");
  var etaj = +(new URLSearchParams(location.search).get("etaj") || 0);
  if (etaj >= 1 && etaj <= 9) st.floor = etaj;
  if (svg) {
  svg.appendChild(s("rect", { x: 40, y: 450, width: 320, height: 20, fill: "#1c1c1a" }));
  svg.appendChild(s("path", { d: "M60 32 L200 4 L340 32 Z", fill: "#1c1c1a" }));
  for (var i = 9; i >= 1; i--) (function (fl) {
    var y = 32 + (9 - fl) * 46;
    var g = s("g", { class: "fl", tabindex: "0", role: "button", "aria-label": "Etajul " + fl });
    g.appendChild(s("rect", { class: "body", x: 60, y: y, width: 280, height: 42 }));
    for (var w = 0; w < 6; w++) g.appendChild(s("rect", { x: 78 + w * 42, y: y + 11, width: 26, height: 20, fill: "rgba(255,255,255,.55)" }));
    var t = s("text", { x: 350, y: y + 27 }); t.textContent = fl; t.setAttribute("x", 30); g.appendChild(t);
    var free = APTS.filter(function (a) { return a.floor === fl && a.free; }).length;
    function hover() { tipN.textContent = free + " ap. la etajul " + fl; }
    function pick() { location.href = "apartamente.html?etaj=" + fl; }
    g.addEventListener("mouseenter", hover); g.addEventListener("focus", hover);
    g.addEventListener("mouseleave", setTip);
    g.addEventListener("click", pick);
    g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    svg.appendChild(g);
  })(i);
  function setTip() { tipN.textContent = APTS.filter(function (a) { return a.free; }).length + " apartamente"; }
  setTip();
  }

  var grid = document.getElementById("grid");
  if (grid) {

  // ---------- filtre și listă ----------
  function seg(id, key, conv) {
    document.getElementById(id).addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      st[key] = conv(b); render();
    });
  }
  seg("rooms", "rooms", function (b) { return +b.dataset.r; });
  seg("avail", "onlyFree", function (b) { return b.dataset.a === "1"; });
  var maxp = document.getElementById("maxp"), maxpv = document.getElementById("maxpv");
  maxp.addEventListener("input", function () { st.max = +maxp.value; render(); });

  function plan(rooms) {
    var p = s("svg", { viewBox: "0 0 120 70", role: "img", "aria-label": "Schița apartamentului" });
    p.appendChild(s("rect", { x: 4, y: 4, width: 112, height: 62, fill: "none", stroke: "#1c1c1a", "stroke-width": 2 }));
    var cuts = rooms === 1 ? [70] : rooms === 2 ? [46, 82] : [34, 62, 90];
    cuts.forEach(function (x) { p.appendChild(s("line", { x1: x, y1: 4, x2: x, y2: 46, stroke: "#1c1c1a", "stroke-width": 1.5 })); });
    p.appendChild(s("line", { x1: 4, y1: 46, x2: 116, y2: 46, stroke: "#1c1c1a", "stroke-width": 1, "stroke-dasharray": "3 3" }));
    p.appendChild(s("rect", { x: 8, y: 50, width: 30, height: 12, fill: "#dfe8cc" }));
    return p;
  }

  var count = document.getElementById("count");
  function render() {
    maxpv.textContent = eur(st.max);
    var list = APTS.filter(function (a) {
      return (!st.floor || a.floor === st.floor) && (!st.rooms || a.rooms === st.rooms) && a.price <= st.max && (!st.onlyFree || a.free);
    }).slice(0, 12);
    var total = APTS.filter(function (a) { return (!st.floor || a.floor === st.floor) && (!st.rooms || a.rooms === st.rooms) && a.price <= st.max && (!st.onlyFree || a.free); }).length;
    count.replaceChildren(el("b", null, String(total)), document.createTextNode(" apartamente găsite" + (total > 12 ? " · primele 12" : "")));
    grid.replaceChildren();
    if (!list.length) { grid.appendChild(el("p", "none", "Niciun apartament nu se potrivește. Încearcă alt preț sau alt etaj.")); return; }
    list.forEach(function (a, i) {
      var card = el("article", "apt anim"); card.style.animationDelay = (i * .04) + "s";
      var top = el("div", "top"); top.append(el("span", null, "Ap. " + a.id + " · etajul " + a.floor), el("span", "st " + (a.free ? "free" : "res"), a.free ? "Disponibil" : "Rezervat"));
      var h = el("h3", null, a.rooms + (a.rooms === 1 ? " cameră" : " camere") + " · " + a.area + " m²");
      var row = el("div", "row"); row.append(el("span", "pr", eur(a.price)), el("span", null, eur(a.price / a.area) + "/m²"));
      card.append(top, plan(a.rooms), h, row);
      grid.appendChild(card);
    });
  }
  render();
  if (st.floor) { var fb = document.createElement("p"); fb.className = "count"; fb.style.cssText = "width:100%;margin:0"; fb.textContent = "Afișezi etajul " + st.floor + ". "; var all = document.createElement("a"); all.href = "apartamente.html"; all.textContent = "Vezi toate etajele"; all.style.textDecoration = "underline"; fb.appendChild(all); document.querySelector(".filters").appendChild(fb); }
  }

  // ---------- calculator credit ----------
  if (!document.getElementById("cP")) return;
  var ids = ["cP", "cA", "cY", "cR"], inp = {};
  ids.forEach(function (k) { inp[k] = document.getElementById(k); inp[k].addEventListener("input", calc); });
  function calc() {
    var P = +inp.cP.value, A = +inp.cA.value / 100, Y = +inp.cY.value, R = +inp.cR.value / 100 / 12, n = Y * 12;
    var loan = P * (1 - A), m = R ? loan * R / (1 - Math.pow(1 + R, -n)) : loan / n;
    document.getElementById("vP").textContent = eur(P);
    document.getElementById("vA").textContent = Math.round(A * 100) + "% · " + eur(P * A);
    document.getElementById("vY").textContent = Y + " ani";
    document.getElementById("vR").textContent = (+inp.cR.value).toLocaleString("ro-RO") + "%";
    document.getElementById("rate").textContent = eur(m) + "/lună";
    document.getElementById("oA").textContent = eur(P * A);
    document.getElementById("oL").textContent = eur(loan);
    document.getElementById("oT").textContent = eur(m * n + P * A);
  }
  calc();
})();
