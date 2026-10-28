(function () {
  "use strict";
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .08 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

  // ---------- recomandare după simptom ----------
  var RECO = [
    ["Recomandăm", "Consultație și igienizare", "Verificare completă, radiografie digitală și curățare profesională.", ["~1h 30 min", "1.000 MDL"]],
    ["Te primim azi", "Consultație de urgență", "Găsim cauza durerii și o calmăm în aceeași vizită.", ["40 min", "de la 300 MDL"]],
    ["Recomandăm", "Albire în cabinet", "Mai întâi o igienizare, apoi albirea, pentru un rezultat uniform.", ["90 min", "3.500 MDL"]],
    ["Recomandăm", "Consultație de implantologie", "Plan de tratament digital, cu etapele și costul total în scris.", ["40 min", "300 MDL"]],
    ["Recomandăm", "Prima vizită a copilului", "O vizită de cunoaștere, fără tratament, ca cel mic să se obișnuiască.", ["30 min", "gratuit"]]
  ];
  var reco = document.getElementById("reco");
  if (reco) {
  function showReco(i) {
    var r = RECO[i], box = el("div", "fade");
    var top = el("div"); top.append(el("small", null, r[0]), el("h3", null, r[1]), el("p", null, r[2]));
    var row = el("div", "row"); r[3].forEach(function (x) { row.appendChild(el("span", null, x)); });
    top.appendChild(row);
    var b = el("a", "btn light", "Programează-te →"); b.href = "#programare";
    var wrap = el("div"); wrap.style.cssText = "display:flex;flex-direction:column;justify-content:space-between;height:100%;gap:18px";
    wrap.append(top, b); box.appendChild(wrap);
    reco.replaceChildren(box);
  }
  document.getElementById("symptoms").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    this.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    showReco(+b.dataset.s);
  });
  showReco(0);
  }

  if (!document.getElementById("o0")) return;

  // ---------- asistent de programare în 4 pași ----------
  var SVC = [["Consultație", "40 min · 300 MDL"], ["Igienizare", "60 min · 700 MDL"], ["Tratament carie", "45 min · de la 800"], ["Albire", "90 min · 3.500 MDL"], ["Ortodonție", "consultație · 400 MDL"], ["Copii", "30 min · gratuit"]];
  var DOC = [["AM", "#0f857a", "Dr. Ana Moraru", "Implantologie"], ["VC", "#ff7a59", "Dr. Victor Ciobanu", "Ortodonție"], ["IR", "#4f9e95", "Dr. Irina Rotaru", "Pediatrie"], ["?", "#9bb3af", "Oricare medic", "Primul loc liber"]];
  var st = { step: 0, svc: null, doc: null, day: null, time: null };
  var steps = document.querySelectorAll(".step"), bars = document.querySelectorAll(".prog i");
  var next = document.getElementById("next"), back = document.getElementById("back");

  function opts(boxId, list, render, key) {
    var box = document.getElementById(boxId);
    list.forEach(function (it, i) {
      var b = el("button", "opt"); b.type = "button"; b.setAttribute("aria-pressed", "false");
      render(b, it); box.appendChild(b);
      b.addEventListener("click", function () {
        box.querySelectorAll(".opt").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        st[key] = i; sync();
      });
    });
  }
  opts("o0", SVC, function (b, s) { b.append(el("b", null, s[0]), el("span", null, s[1])); }, "svc");
  opts("o1", DOC, function (b, d) { var a = el("div", "av", d[0]); a.style.background = d[1]; b.append(a, el("b", null, d[2]), el("span", null, d[3])); }, "doc");

  var dBox = document.getElementById("o2d"), tBox = document.getElementById("o2t"), wd = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
  for (var i = 1, n = 0; n < 6; i++) {
    var d = new Date(Date.now() + i * 864e5); if (d.getDay() === 0) continue; n++;
    var b = el("button", "chip", wd[d.getDay()] + " " + d.getDate()); b.type = "button"; b.setAttribute("aria-pressed", "false");
    b.dataset.label = d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
    dBox.appendChild(b);
  }
  dBox.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    dBox.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    st.day = b.dataset.label; st.time = null; tBox.replaceChildren();
    ["08:30", "10:00", "11:30", "14:00", "15:30", "17:00", "18:30"].forEach(function (t, k) {
      var c = el("button", "chip", t); c.type = "button"; c.setAttribute("aria-pressed", "false");
      if ((k + st.day.length) % 4 === 0) { c.disabled = true; c.style.opacity = ".35"; }
      tBox.appendChild(c);
    });
    sync();
  });
  tBox.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b || b.disabled) return;
    tBox.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    st.time = b.textContent; sync();
  });

  function canNext() { return [st.svc !== null, st.doc !== null, !!(st.day && st.time), true][st.step]; }
  function sync() {
    steps.forEach(function (s, k) { s.classList.toggle("on", k === st.step); });
    bars.forEach(function (b, k) { b.classList.toggle("done", k <= st.step); });
    back.disabled = st.step === 0;
    next.disabled = !canNext();
    next.textContent = st.step === 3 ? "Confirmă programarea" : "Continuă";
    if (st.step === 3) {
      var c = document.getElementById("conf"); c.replaceChildren();
      [["Serviciu", SVC[st.svc][0]], ["Medic", DOC[st.doc][2]], ["Când", st.day + ", " + st.time]].forEach(function (r) { c.append(el("dt", null, r[0]), el("dd", null, r[1])); });
    }
  }
  next.addEventListener("click", function () {
    if (st.step < 3) { st.step++; sync(); return; }
    document.getElementById("wOk").textContent = "Demo: în site-ul real, programarea ajunge imediat la recepție și primești un SMS de confirmare.";
  });
  back.addEventListener("click", function () { if (st.step > 0) { st.step--; sync(); } });
  sync();
})();
