/* =========================================================
   Afyze — site.js
   Scroll fluid (Lenis), animații (GSAP + ScrollTrigger),
   tranziții între pagini, cursor, filtre, formular.
   ========================================================= */
(function () {
  "use strict";

  window.__afyze = true;
  var html = document.documentElement;
  var EMAIL = "hello@afyze.com";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var anim = hasGsap && !reduce;

  if (!anim) html.classList.remove("js-anim");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Utilitare ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function mailto(subject, body) {
    var u = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject || "Salut, Afyze");
    if (body) u += "&body=" + encodeURIComponent(body);
    return u;
  }
  var toastEl = $(".toast"), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2800);
  }

  /* ---------- Scroll fluid ---------- */
  var lenis = null;
  if (anim && window.Lenis) {
    lenis = new Lenis({
      duration: 1.35,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ancore interne (#sectiune) cu scroll lin
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -40, duration: 1.6 });
      else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- Header: ascuns la scroll în jos, vizibil la scroll în sus ---------- */
  var header = $(".header"), lastY = 0;
  function onScroll(y) {
    if (!header) return;
    header.classList.toggle("is-solid", y > 40);
    if (!document.body.classList.contains("menu-open")) {
      header.classList.toggle("is-hidden", y > lastY && y > 300);
    }
    lastY = y;
  }
  if (lenis) lenis.on("scroll", function (e) { onScroll(e.scroll); });
  else window.addEventListener("scroll", function () { onScroll(window.scrollY); }, { passive: true });
  onScroll(window.scrollY);

  /* ---------- Meniu mobil ---------- */
  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      header.classList.remove("is-hidden");
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  /* ---------- Cursor ---------- */
  var cursor = $(".cursor"), dot = $(".cursor-dot");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (cursor && dot && fine && hasGsap) {
    var cx = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3.out" });
    var cy = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3.out" });
    var dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    var dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
    cursor.style.display = "flex";
    var shown = false;
    window.addEventListener("pointermove", function (e) { if (!shown) { shown = true; gsap.set([cursor, dot], { x: e.clientX, y: e.clientY }); gsap.to([cursor, dot], { opacity: 1, duration: 0.4 }); } cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); }, { passive: true });
    var label = cursor.querySelector("span");
    document.addEventListener("pointerover", function (e) {
      var v = e.target.closest("[data-cursor]");
      var l = e.target.closest("a,button,label,input,textarea,select");
      cursor.classList.toggle("is-view", !!v);
      cursor.classList.toggle("is-hover", !v && !!l);
      if (v && label) label.textContent = v.getAttribute("data-cursor") || "Vezi";
    });
    document.addEventListener("pointerleave", function () { gsap.to([cursor, dot], { opacity: 0, duration: 0.3 }); });
    document.addEventListener("pointerenter", function () { gsap.to([cursor, dot], { opacity: 1, duration: 0.3 }); });
  }

  /* ---------- Butoane magnetice ---------- */
  if (anim && fine) {
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.3;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.8, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- Animații la scroll ---------- */
  function heroIn() {
    if (!anim) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to("[data-lines='hero'] .line > span", { y: 0, duration: 1.8, stagger: 0.1 }, 0);
    tl.to("[data-hero-reveal]", { opacity: 1, y: 0, duration: 1.6, stagger: 0.1 }, 0.45);
    tl.fromTo(".hero-art", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 2.4 }, 0.1);
    return tl;
  }

  function setupScroll() {
    if (!anim) return;

    // titluri pe linii
    $$("[data-lines]").forEach(function (box) {
      if (box.getAttribute("data-lines") === "hero") return;
      gsap.to(box.querySelectorAll(".line > span"), {
        y: 0, duration: 1.6, ease: "expo.out", stagger: 0.09,
        scrollTrigger: { trigger: box, start: "top 88%", once: true }
      });
    });

    // elemente care apar lin
    $$("[data-reveal]").forEach(function (el) {
      if (el.hasAttribute("data-hero-reveal")) return;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.5, ease: "expo.out",
        delay: parseFloat(el.getAttribute("data-delay")) || 0,
        scrollTrigger: { trigger: el, start: "top 92%", once: true }
      });
    });

    // cadre care se deschid de jos în sus
    $$("[data-clip]").forEach(function (el) {
      var inner = el.querySelector(".inner");
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      tl.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.8, ease: "expo.inOut" });
      if (inner) tl.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 2.4, ease: "expo.out" }, 0.1);
    });

    // paralaxă
    $$("[data-speed]").forEach(function (el) {
      var s = parseFloat(el.getAttribute("data-speed"));
      gsap.to(el, { y: function () { return s * 120; }, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // text care se luminează cuvânt cu cuvânt
    $$("[data-words]").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) { return '<span class="w" style="opacity:.14">' + w + "</span>"; }).join(" ");
      gsap.to(el.querySelectorAll(".w"), {
        opacity: 1, stagger: 0.08, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 }
      });
    });

    // scroll orizontal (Acasă)
    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", function () {
      var wrap = $(".hscroll"), track = $(".hscroll .track");
      if (!wrap || !track) return;
      function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
      gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: wrap, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
    });

    // lumini care urmăresc mouse-ul în hero
    var art = $(".hero-art");
    if (art && fine) {
      var ax = gsap.quickTo(art, "x", { duration: 2, ease: "power3.out" });
      var ay = gsap.quickTo(art, "y", { duration: 2, ease: "power3.out" });
      window.addEventListener("pointermove", function (e) {
        ax((e.clientX / window.innerWidth - 0.5) * 40);
        ay((e.clientY / window.innerHeight - 0.5) * 40);
      }, { passive: true });
    }
  }

  /* ---------- Tranziție între pagini ---------- */
  var curtain = $(".curtain");
  var panels = curtain ? $$(".panel", curtain) : [];
  var mark = curtain ? $(".mark", curtain) : null;

  function isInternal(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return false;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin && location.protocol !== "file:") return false;
    if (url.pathname === location.pathname && url.hash) return false;
    return /\.html?$|\/$/.test(url.pathname);
  }

  function leave(href) {
    if (!anim || !curtain) { location.href = href; return; }
    curtain.style.pointerEvents = "auto";
    gsap.set(panels, { yPercent: 100 });
    gsap.set(mark, { opacity: 0 });
    var tl = gsap.timeline({ onComplete: function () { location.href = href; } });
    tl.to(panels[0], { yPercent: 0, duration: 0.8, ease: "expo.inOut" }, 0)
      .to(panels[1], { yPercent: 0, duration: 0.8, ease: "expo.inOut" }, 0.12)
      .to(mark, { opacity: 1, duration: 0.4 }, 0.6);
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest("a");
    if (!isInternal(a)) return;
    e.preventDefault();
    if (document.body.classList.contains("menu-open")) {
      document.body.classList.remove("menu-open");
    }
    leave(a.href);
  });

  function enter() {
    if (!curtain) { heroIn(); return; }
    if (!anim) { curtain.style.display = "none"; return; }
    var count = $(".count", curtain);
    var first = false;
    try { first = !sessionStorage.getItem("afyze-seen"); sessionStorage.setItem("afyze-seen", "1"); } catch (e) {}
    var tl = gsap.timeline({ onComplete: function () { curtain.style.pointerEvents = "none"; } });
    if (first && count) {
      var o = { v: 0 };
      tl.to(o, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: function () { count.textContent = String(Math.round(o.v)).padStart(3, "0"); } });
    } else if (count) {
      count.textContent = "";
    }
    tl.to(mark, { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, first ? ">" : 0.1)
      .to(panels[1], { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, ">-0.15")
      .to(panels[0], { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "<0.12")
      .add(heroIn() || function () {}, "<0.35");
  }

  // revenire cu butonul „Înapoi” din cache-ul browserului
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && curtain && hasGsap) {
      gsap.set(panels, { yPercent: -100 });
      gsap.set(mark, { opacity: 0 });
      curtain.style.pointerEvents = "none";
      if (anim) gsap.set("[data-lines] .line > span, [data-reveal]", { y: 0, opacity: 1 });
    }
  });

  /* ---------- Previzualizări live ale template-urilor ---------- */
  function fitFrames() {
    $$(".tpl .viewport").forEach(function (vp) {
      var f = vp.querySelector("iframe");
      if (!f) return;
      var s = vp.clientWidth / 1440;
      f.style.transform = "scale(" + s + ")";
      f.style.height = Math.ceil(vp.clientHeight / s) + "px";
    });
  }
  var frames = $$(".tpl iframe[data-src]");
  if (frames.length) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.src = en.target.getAttribute("data-src"); en.target.removeAttribute("data-src"); io.unobserve(en.target); }
      });
    }, { rootMargin: "400px 400px" });
    frames.forEach(function (f) { io.observe(f); });
  }
  fitFrames();
  if (window.ResizeObserver) { var ro = new ResizeObserver(fitFrames); $$(".tpl .viewport").forEach(function (v) { ro.observe(v); }); }
  else window.addEventListener("resize", fitFrames);

  /* ---------- Filtre ---------- */
  $$("[data-filters]").forEach(function (group) {
    var target = $(group.getAttribute("data-filters"));
    if (!target) return;
    var items = $$("[data-cat]", target);
    $$("button", group).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", group).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var f = b.getAttribute("data-filter");
        function apply() {
          items.forEach(function (it) { it.classList.toggle("is-out", !(f === "all" || it.getAttribute("data-cat").split(" ").indexOf(f) > -1)); });
          fitFrames();
          if (hasGsap) ScrollTrigger.refresh();
        }
        if (!anim) { apply(); return; }
        gsap.to(target, { opacity: 0, y: 16, duration: 0.45, ease: "power2.in", onComplete: function () {
          apply();
          gsap.fromTo(target, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out" });
        } });
      });
    });
  });

  /* ---------- FAQ ---------- */
  $$(".faq .q button").forEach(function (b) {
    b.addEventListener("click", function () {
      var q = b.closest(".q");
      var open = q.classList.toggle("open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
      if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 850);
    });
  });

  /* ---------- E-mail ---------- */
  $$("[data-mail]").forEach(function (a) {
    a.href = mailto(a.getAttribute("data-subject"), a.getAttribute("data-body"));
  });
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () { toast("Adresa a fost copiată: " + EMAIL); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(EMAIL).then(done, function () { toast(EMAIL); });
      else {
        var ta = document.createElement("textarea"); ta.value = EMAIL; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { toast(EMAIL); }
        document.body.removeChild(ta);
      }
    });
  });

  var form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var msg = form.elements.msg.value.trim();
      var phone = form.elements.phone ? form.elements.phone.value.trim() : "";
      var type = (form.querySelector("input[name=type]:checked") || {}).value || "";
      var pkg = (form.querySelector("input[name=pkg]:checked") || {}).value || "";
      if (!name || !msg) { toast("Scrie-ți numele și câteva cuvinte despre proiect."); (name ? form.elements.msg : form.elements.name).focus(); return; }
      var body = "Bună ziua,\n\n" + msg + "\n\n" +
        (type ? "Tip proiect: " + type + "\n" : "") +
        (pkg ? "Pachet: " + pkg + "\n" : "") +
        (phone ? "Telefon: " + phone + "\n" : "") +
        "\n— " + name;
      toast("Se deschide aplicația de e-mail…");
      location.href = mailto("Proiect nou" + (type ? " — " + type : "") + " — " + name, body);
    });
  }

  /* ---------- An curent ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Start ---------- */
  function start() {
    setupScroll();
    enter();
    if (hasGsap) {
      ScrollTrigger.refresh();
      window.addEventListener("load", function () { ScrollTrigger.refresh(); fitFrames(); });
    }
  }
  if (document.fonts && document.fonts.ready && anim) {
    var started = false;
    var go = function () { if (!started) { started = true; start(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1200);
  } else start();
})();
