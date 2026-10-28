(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  // ---------- meniu ----------
  var MENU = [
    [["Burrata cu roșii coapte", "Roșii de grădină, ulei de busuioc", 185, "#e7c9a0,#b9442d"], ["Tartar de vită", "Gălbenuș marinat, capere", 210, "#a8322a,#4a120d"], ["Ardei copți pe jar", "Brânză de oaie, miere", 140, "#e0641f,#7a2e10"], ["Supă cremă de dovleac", "Semințe prăjite, smântână", 115, "#f2a13b,#9b4d14"]],
    [["Antricot maturat", "300 g, 28 de zile, sos de piper", 520, "#7a2416,#2a0d07"], ["Piept de rață", "Țelină, cireșe, vin roșu", 390, "#93303b,#3b1015"], ["Păstrăv la jar", "Lămâie coaptă, unt cu capere", 320, "#d9b98a,#6f5a3a"], ["Conopidă întreagă", "Tahini, rodie, fistic", 210, "#e8d6a8,#a07a3c"]],
    [["Tartă cu ciocolată", "Sare de mare, înghețată de vanilie", 145, "#5a2e1a,#1e0e07"], ["Piersici la grătar", "Mascarpone, migdale", 130, "#ffb36b,#d5641e"], ["Plăcintă cu brânză", "Rețeta bunicii, cu smântână", 110, "#f3dfb8,#c0904c"], ["Sorbet de sezon", "Trei arome din fructe locale", 95, "#ff9a8a,#b9364a"]]
  ];
  var list = document.getElementById("dishList"), follow = document.getElementById("follow");
  function render(k) {
    list.replaceChildren();
    MENU[k].forEach(function (d, i) {
      var row = document.createElement("div"); row.className = "dish"; row.dataset.g = d[3];
      var n = document.createElement("span"); n.className = "n"; n.textContent = "0" + (i + 1);
      var mid = document.createElement("div");
      var h = document.createElement("h3"); h.textContent = d[0];
      var p = document.createElement("p"); p.textContent = d[1];
      mid.append(h, p);
      var pr = document.createElement("span"); pr.className = "p"; pr.textContent = d[2];
      row.append(n, mid, pr);
      list.appendChild(row);
    });
    list.classList.remove("swap"); void list.offsetWidth; list.classList.add("swap");
  }
  document.querySelectorAll("[role=tab]").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll("[role=tab]").forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
      render(+t.dataset.t);
    });
  });
  render(0);

  // „fotografia” care urmărește cursorul peste meniu
  if (matchMedia("(hover:hover)").matches && !reduce) {
    var tx = 0, ty = 0, x = 0, y = 0;
    list.addEventListener("pointermove", function (e) {
      tx = e.clientX + 170; ty = e.clientY;
      var row = e.target.closest(".dish");
      if (row) {
        var g = row.dataset.g.split(",");
        follow.style.background = "radial-gradient(circle at 40% 35%, rgba(255,255,255,.35), transparent 40%), linear-gradient(160deg," + g[0] + "," + g[1] + ")";
        follow.classList.add("on");
      }
    });
    list.addEventListener("pointerleave", function () { follow.classList.remove("on"); });
    (function loop() { x += (tx - x) * .14; y += (ty - y) * .14; follow.style.left = x + "px"; follow.style.top = y + "px"; requestAnimationFrame(loop); })();
  }

  // ---------- rezervare ----------
  var d = document.getElementById("rd"), msg = document.getElementById("rmsg");
  var t = new Date(Date.now() + 864e5); d.min = new Date().toISOString().slice(0, 10); d.value = t.toISOString().slice(0, 10);
  document.getElementById("rezerva").addEventListener("submit", function (e) {
    e.preventDefault();
    var dt = new Date(d.value + "T12:00").toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
    msg.textContent = "Demo: masă pentru " + document.getElementById("rg").value + ", " + dt + ", la " + document.getElementById("rt").value + ".";
    msg.classList.add("show"); setTimeout(function () { msg.classList.remove("show"); }, 4000);
  });

  // ---------- scântei ----------
  var c = document.getElementById("sparks"), cx = c.getContext("2d"), W, H, P = [];
  function rs() { var r = Math.min(devicePixelRatio || 1, 2); W = c.clientWidth; H = c.clientHeight; c.width = W * r; c.height = H * r; cx.setTransform(r, 0, 0, r, 0, 0); }
  function sp() { return { x: W * (.2 + Math.random() * .6), y: H + 10, vx: (Math.random() - .5) * .5, vy: -(.5 + Math.random() * 1.3), r: .6 + Math.random() * 2, l: 0, m: 220 + Math.random() * 260 }; }
  rs(); addEventListener("resize", rs);
  if (reduce) return;
  for (var i = 0; i < 45; i++) { var p = sp(); p.y = Math.random() * H; p.l = Math.random() * p.m; P.push(p); }
  var on = true, running = false;
  new IntersectionObserver(function (e) { on = e[0].isIntersecting; if (on && !running) loop(); }).observe(c);
  function loop() {
    if (!on) { running = false; return; }
    running = true;
    cx.clearRect(0, 0, W, H);
    P.forEach(function (p, i) {
      p.l++; p.x += p.vx + Math.sin(p.l * .03) * .3; p.y += p.vy; var a = 1 - p.l / p.m;
      if (a <= 0 || p.y < -10) { P[i] = sp(); return; }
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fillStyle = "rgba(255," + (150 + Math.round(70 * a)) + ",90," + (a * .85) + ")"; cx.fill();
    });
    requestAnimationFrame(loop);
  }
})();
