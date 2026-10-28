(function () {
  "use strict";
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .1 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  function single(box, cb) {
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b || b.disabled) return;
      box.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      cb(b);
    });
  }

  // ---------- programare ----------
  var st = { svc: "Tuns + coafat", day: "", time: "" };
  if (document.getElementById("dayChips")) {
  var days = document.getElementById("dayChips"), times = document.getElementById("timeChips"), sum = document.getElementById("bsum");
  var wd = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"], now = new Date(), first = true;
  for (var i = 1; i <= 5; i++) {
    var d = new Date(now.getTime() + i * 864e5), b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = wd[d.getDay()] + " " + d.getDate();
    b.dataset.label = d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
    if (d.getDay() === 0) b.disabled = true;
    b.setAttribute("aria-pressed", "false");
    if (!b.disabled && first) { b.setAttribute("aria-pressed", "true"); st.day = b.dataset.label; first = false; }
    days.appendChild(b);
  }
  function buildTimes() {
    times.replaceChildren();
    ["10:00", "11:30", "13:00", "15:00", "17:30"].forEach(function (s, k) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = s; b.setAttribute("aria-pressed", "false");
      if ((k + st.day.length) % 3 === 0) b.disabled = true;
      times.appendChild(b);
    });
    var f = times.querySelector(".chip:not(:disabled)"); f.setAttribute("aria-pressed", "true"); st.time = f.textContent;
  }
  function upd() {
    sum.replaceChildren();
    var b1 = document.createElement("b"); b1.textContent = st.svc;
    sum.append(b1, document.createTextNode(" · " + st.day + ", " + st.time));
  }
  single(document.getElementById("svcChips"), function (b) { st.svc = b.textContent; upd(); });
  single(days, function (b) { st.day = b.dataset.label; buildTimes(); upd(); });
  single(times, function (b) { st.time = b.textContent; upd(); });
  buildTimes(); upd();
  document.getElementById("bgo").addEventListener("click", function () { sum.textContent = "Demo: în site-ul real, programarea ajunge direct în calendarul salonului."; });
  }

  // ---------- servicii ----------
  var S = {
    par: [["✂", "#e4dcff", "Tuns și coafat", "Consultație, spălat, tuns și coafat.", "60 min", "350"], ["◐", "#ffd8c2", "Vopsit rădăcini", "Culoare uniformă, fără să deteriorezi părul.", "90 min", "850"], ["☼", "#fff1b8", "Balayage", "Lumini naturale, lucrate manual.", "180 min", "2.200"], ["❋", "#d3f2e3", "Tratament de hidratare", "Mască profesională și masaj al scalpului.", "45 min", "500"]],
    unghii: [["◇", "#ffd8c2", "Manichiură cu gel", "Durează până la trei săptămâni.", "75 min", "400"], ["◆", "#e4dcff", "Pedichiură spa", "Baie caldă, exfoliere și masaj.", "90 min", "550"], ["○", "#fff1b8", "Întreținere gel", "Completare și formă nouă.", "60 min", "350"]],
    ten: [["✿", "#d3f2e3", "Curățare facială", "Curățare profundă adaptată tenului tău.", "60 min", "700"], ["❀", "#e4dcff", "Laminarea sprâncenelor", "Formă și direcție pentru 6 săptămâni.", "45 min", "380"], ["✧", "#ffd8c2", "Masaj facial", "Relaxare și tonifiere.", "40 min", "450"]]
  };
  var cards = document.getElementById("cards");
  if (!cards) return;
  function render(k) {
    cards.replaceChildren();
    S[k].forEach(function (s, i) {
      var c = document.createElement("article"); c.className = "card rv";
      c.style.setProperty("--d", (i * .06) + "s");
      var ic = document.createElement("div"); ic.className = "ic"; ic.style.background = s[1]; ic.textContent = s[0];
      var h = document.createElement("h3"); h.textContent = s[2];
      var p = document.createElement("p"); p.textContent = s[3];
      var m = document.createElement("div"); m.className = "meta";
      var dur = document.createElement("span"); dur.textContent = s[4];
      var pr = document.createElement("b"); pr.textContent = s[5] + " MDL";
      m.append(dur, pr); c.append(ic, h, p, m); cards.appendChild(c);
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add("in"); }); });
    });
  }
  single(document.getElementById("cat"), function (b) { render(b.dataset.c); });
  render("par");
})();
