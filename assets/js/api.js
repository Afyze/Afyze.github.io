/* Afyze — legătura cu backend-ul.
   Dacă backend-ul răspunde, site-ul trimite formularul direct, numără vizitele anonim și
   afișează conținutul editat din panou. Altfel, totul rămâne ca în varianta statică.
   Toate textele venite de la server se pun în pagină cu textContent, nu ca HTML. */
(function () {
  "use strict";

  var base = String(window.AFYZE_API || "").replace(/\/+$/, "");
  var api = { ready: false, content: null };
  window.afyzeApi = api;
  var shownAt = Date.now();
  var DEFAULT_EMAIL = "hello@afyze.com";

  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function call(path, opts) {
    opts = opts || {};
    return fetch(base + "/api" + path, {
      method: opts.method || "GET",
      headers: opts.body ? { "Content-Type": "application/json" } : {},
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: "omit",
      keepalive: !!opts.keepalive,
      signal: opts.signal
    });
  }

  /* ---------- trimiterea formularului ---------- */
  api.submit = function (data) {
    var body = Object.assign({}, data, { t: Date.now() - shownAt });
    return call("/contact", { method: "POST", body: body })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) {
          if (r.ok && b.ok) return { ok: true };
          return { ok: false, error: b.error || "Mesajul nu a putut fi trimis.", field: b.field };
        });
      })
      .catch(function () { return { ok: false, offline: true, error: "Nu am putut trimite mesajul. Verifică conexiunea la internet." }; });
  };

  /* ---------- statistici anonime ---------- */
  function track() {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    call("/hit", { method: "POST", keepalive: true, body: { p: location.pathname, r: document.referrer, w: window.innerWidth } }).catch(function () {});
  }

  /* ---------- conținut editabil ---------- */
  function setText(el, v) { if (el && typeof v === "string") el.textContent = v; }
  function mailtoHref(email, subject, body) {
    return "mailto:" + email + "?subject=" + encodeURIComponent(subject) + (body ? "&body=" + encodeURIComponent(body) : "");
  }

  function applyEmail(email) {
    if (!email || email === DEFAULT_EMAIL) return;
    $$('a[href^="mailto:"]').forEach(function (a) {
      a.href = a.href.replace(/^mailto:[^?]*/i, "mailto:" + email);
      if (a.textContent.trim() === DEFAULT_EMAIL) a.textContent = email;
    });
    $$("button, .small, p, span").forEach(function (el) {
      if (el.children.length === 0 && el.textContent.indexOf(DEFAULT_EMAIL) > -1) el.textContent = el.textContent.split(DEFAULT_EMAIL).join(email);
    });
  }

  function applyPlans(plans, email) {
    plans.forEach(function (p) {
      $$('[data-plan="' + p.id + '"]').forEach(function (card) {
        setText(card.querySelector(".js-name"), p.name);
        setText(card.querySelector(".js-price"), p.price);
        setText(card.querySelector(".js-term"), p.term);
        setText(card.querySelector(".js-cta"), "Alege " + p.name);
        var ul = card.querySelector(".js-feats");
        if (ul) { ul.replaceChildren(); p.features.forEach(function (f) { var li = document.createElement("li"); li.textContent = f; ul.appendChild(li); }); }
        var a = card.querySelector(".js-mail");
        if (a) a.href = mailtoHref(email, "Cerere pachet " + p.name, "Bună ziua,\n\nMă interesează pachetul " + p.name + " (" + p.price + " MDL).\n\nDespre afacerea mea:\n\nNumele:\nTelefon:\n");
      });
      $$('[data-plan-name="' + p.id + '"]').forEach(function (el) { setText(el, p.name); });
      $$('[data-plan-term="' + p.id + '"]').forEach(function (el) { setText(el, p.term.replace(/^Gata în\s*/i, "")); });
      $$('[data-plan-chip="' + p.id + '"]').forEach(function (input) {
        input.value = p.name + " — " + p.price + " MDL";
        setText(input.nextElementSibling, p.name);
      });
    });
  }

  function applyAnnouncement(a) {
    if (!a || !a.enabled || !a.text) return;
    var key = "afyze-ann-" + a.text.length + "-" + a.text.slice(0, 20);
    try { if (sessionStorage.getItem(key)) return; } catch (e) {}
    var bar = document.createElement("div");
    bar.className = "announce";
    bar.setAttribute("role", "status");
    var span = document.createElement("span"); span.textContent = a.text;
    var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Închide anunțul"); x.textContent = "×";
    x.addEventListener("click", function () { bar.classList.remove("show"); try { sessionStorage.setItem(key, "1"); } catch (e) {} setTimeout(function () { bar.remove(); }, 600); });
    bar.append(span, x);
    document.body.appendChild(bar);
    setTimeout(function () { bar.classList.add("show"); }, 1800);
  }

  function projectCard(p, offset) {
    var lib = document.getElementById("artLib");
    var tpl = lib && lib.querySelector('template[data-art="' + p.art + '"]');
    var art = document.createElement("div"); art.className = "art";
    if (tpl) art.appendChild(tpl.content.cloneNode(true));
    var frame = document.createElement("div"); frame.className = "frame";
    var inner = document.createElement("div"); inner.className = "inner"; inner.appendChild(art); frame.appendChild(inner);

    var wrap;
    if (p.link && /^https:\/\//.test(p.link)) {
      wrap = document.createElement("a"); wrap.href = p.link; wrap.target = "_blank"; wrap.rel = "noopener noreferrer";
      wrap.setAttribute("data-cursor", /github\.com/.test(p.link) ? "GitHub" : "Vezi");
    } else wrap = document.createElement("div");
    wrap.appendChild(frame);

    var info = document.createElement("div"); info.className = "info";
    var h3 = document.createElement("h3"); h3.textContent = p.title;
    var cat = document.createElement("span"); cat.className = "cat"; cat.textContent = p.category;
    info.append(h3, cat);
    var desc = document.createElement("p"); desc.textContent = p.description;

    var el = document.createElement("article");
    el.className = "case " + p.size + (offset ? " offset" : "");
    el.setAttribute("data-cat", p.filter);
    el.append(wrap, info, desc);
    if (p.tags && p.tags.length) {
      var tags = document.createElement("div"); tags.className = "tag-row";
      p.tags.forEach(function (t) { var s = document.createElement("span"); s.className = "tag"; s.textContent = t; tags.appendChild(s); });
      el.appendChild(tags);
    }
    return el;
  }

  function applyProjects(projects) {
    var grid = document.getElementById("workGrid");
    if (!grid || !Array.isArray(projects)) return;
    var frag = document.createDocumentFragment(), n = 0;
    projects.forEach(function (p) {
      var offset = p.size !== "w12" && (n++ % 2 === 1);
      if (p.size === "w12") n = 0;
      frag.appendChild(projectCard(p, offset));
    });
    grid.replaceChildren(frag);
    if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 50);
  }

  function apply(c) {
    api.content = c;
    var email = (c.contact && c.contact.email) || DEFAULT_EMAIL;
    try {
      applyPlans(c.plans || [], email);
      setText(document.querySelector('[data-c="urgentNote"]'), c.urgentNote);
      applyProjects(c.projects);
      applyEmail(email);
      applyAnnouncement(c.announcement);
    } catch (e) { /* conținutul static rămâne afișat */ }
  }

  /* ---------- pornire ---------- */
  if (location.protocol === "file:") return;
  var ctrl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 1500);
  call("/health", { signal: ctrl && ctrl.signal })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (h) {
      clearTimeout(timer);
      if (!h || !h.ok || h.service !== "afyze") return;
      api.ready = true;
      document.documentElement.classList.add("has-backend");
      track();
      return call("/content").then(function (r) { return r.ok ? r.json() : null; }).then(function (b) { if (b && b.ok) apply(b.content); });
    })
    .catch(function () { /* fără backend: varianta statică */ });
})();
