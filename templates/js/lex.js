(function () {
  "use strict";
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  var AREAS = [
    { n: "I", t: "Drept civil", d: "Contracte, obligații și despăgubiri. Te ajutăm să-ți recuperezi banii sau să te aperi de pretenții nejustificate.", l: ["Redactarea și verificarea contractelor", "Recuperarea creanțelor", "Acțiuni în despăgubire"] },
    { n: "II", t: "Drept comercial", d: "Asistență pentru companii, de la înființare până la relația zilnică cu partenerii și clienții.", l: ["Înființarea și reorganizarea firmelor", "Contracte comerciale", "Litigii între parteneri"] },
    { n: "III", t: "Litigii", d: "Reprezentare în instanțele de judecată și în procedurile de mediere, cu o strategie clară pentru fiecare etapă.", l: ["Prima instanță, apel și recurs", "Mediere și soluționare amiabilă", "Executarea hotărârilor"] },
    { n: "IV", t: "Drept imobiliar", d: "Siguranță juridică la cumpărarea, vânzarea sau închirierea unui bun imobil.", l: ["Verificarea actelor de proprietate", "Contracte de vânzare-cumpărare", "Litigii privind imobilele"] },
    { n: "V", t: "Dreptul familiei", d: "Situații delicate, tratate cu discreție și cu grijă pentru toți cei implicați.", l: ["Divorț și partajul bunurilor", "Pensie de întreținere", "Stabilirea domiciliului copilului"] },
    { n: "VI", t: "Consultanță", d: "Opinii juridice scrise și verificarea documentelor înainte să semnezi ceva important.", l: ["Opinii juridice", "Verificarea documentelor", "Consultanță continuă pentru firme"] }
  ];
  var toc = document.getElementById("toc"), leaf = document.getElementById("leaf");

  function show(i) {
    var a = AREAS[i];
    toc.querySelectorAll("button").forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
    var box = document.createElement("div"); box.className = "fade";
    var num = document.createElement("span"); num.className = "num"; num.textContent = "Capitolul " + a.n;
    var h = document.createElement("h3"); h.textContent = a.t;
    var p = document.createElement("p"); p.textContent = a.d;
    var ul = document.createElement("ul");
    a.l.forEach(function (x) { var li = document.createElement("li"); li.textContent = x; ul.appendChild(li); });
    box.append(num, h, p, ul);
    leaf.replaceChildren(box);
  }

  AREAS.forEach(function (a, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab");
    var n = document.createElement("i"); n.textContent = a.n;
    var t = document.createElement("span"); t.textContent = a.t;
    var dots = document.createElement("span"); dots.className = "dots";
    var s = document.createElement("small"); s.textContent = "Detalii";
    b.append(n, t, dots, s);
    b.addEventListener("click", function () { show(i); });
    b.addEventListener("mouseenter", function () { if (window.matchMedia("(hover:hover)").matches) show(i); });
    li.appendChild(b); toc.appendChild(li);
  });
  show(0);

  document.getElementById("lexForm").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("lexNote").textContent = "Demo: în site-ul real, scrisoarea ajunge direct pe e-mailul cabinetului.";
  });
})();
