(function () {
  "use strict";
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .1 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; }

  var DAYS = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
  var LV = ["", "Începător", "Mediu", "Avansat"];
  var BASE = [
    ["07:00", "Forță totală", "Cu Andrei", 2], ["09:00", "Mobilitate", "Cu Elena", 1], ["12:30", "Condiție fizică", "Cu Victor", 2],
    ["17:30", "Box tehnic", "Cu Sergiu", 1], ["18:30", "Circuit intens", "Cu Andrei", 3], ["19:30", "Haltere olimpice", "Cu Ion", 3], ["20:30", "Stretching", "Cu Elena", 1]
  ];
  var state = { day: (new Date().getDay() + 6) % 7, lvl: 0 }, booked = {};
  var days = document.getElementById("days"), sched = document.getElementById("sched");

  DAYS.forEach(function (d, i) {
    var b = el("button", null, d); b.type = "button"; b.setAttribute("role", "tab");
    b.addEventListener("click", function () { state.day = i; render(); });
    days.appendChild(b);
  });
  document.getElementById("lv").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    state.lvl = +b.dataset.l; render();
  });

  function render() {
    days.querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-selected", i === state.day ? "true" : "false"); });
    var list = BASE.filter(function (c, k) { return (k + state.day) % 7 !== 0 || state.day === 5; })
      .filter(function (c) { return !state.lvl || c[3] === state.lvl; });
    if (state.day === 6) list = list.slice(0, 3);
    sched.replaceChildren();
    if (!list.length) { sched.appendChild(el("p", "empty", "Nicio clasă pentru acest nivel în ziua aleasă.")); return; }
    list.forEach(function (c, i) {
      var key = state.day + c[0];
      var row = el("div", "cls anim-in"); row.style.animationDelay = (i * .05) + "s";
      var bk = el("button", "bk" + (booked[key] ? " on" : ""), booked[key] ? "Rezervat ✓" : "Rezervă locul");
      bk.type = "button";
      bk.addEventListener("click", function () { booked[key] = !booked[key]; bk.classList.toggle("on", booked[key]); bk.textContent = booked[key] ? "Rezervat ✓" : "Rezervă locul"; });
      row.append(el("span", "tm", c[0]), el("b", null, c[1]), el("span", "co", c[2]), el("span", "lvl l" + c[3], LV[c[3]]), bk);
      sched.appendChild(row);
    });
  }
  render();

  // abonamente: lunar / anual
  document.getElementById("per").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    var p = b.dataset.p;
    document.querySelectorAll(".pr").forEach(function (pr) {
      var to = +pr.dataset[p], from = parseInt(pr.textContent, 10) || to, t0 = performance.now();
      var small = pr.querySelector("small");
      (function step(t) {
        var k = Math.min(1, (t - t0) / 500), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        pr.firstChild.nodeValue = String(v);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
      small.textContent = " MDL/lună";
    });
  });

  document.getElementById("tf").addEventListener("submit", function (e) { e.preventDefault(); document.getElementById("tok").textContent = "Demo: în site-ul real, te sună un antrenor în aceeași zi."; });
})();
