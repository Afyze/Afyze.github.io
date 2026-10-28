/* Afyze — panou de administrare.
   Datele venite de la vizitatori se afișează doar ca text (textContent), niciodată ca HTML. */
(function () {
  "use strict";

  var csrf = "";
  var state = { status: "", q: "", content: null, days: 30 };
  var ART = { road: "Hartă (RoadFix)", att: "Tabel", flow: "Cod și arbore", exam: "Test", vip: "Bilet", afyze: "Frunză Afyze" };
  var SIZE = { w12: "Lățime completă", w7: "Mare", w5: "Mică" };
  var FILTER = { web: "Web", auto: "Automatizări", app: "Aplicații" };
  var STATUS = { nou: "Nouă", in_lucru: "În lucru", castigat: "Câștigată", pierdut: "Pierdută", spam: "Spam" };

  // ---------- utilitare ----------
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "text") el.textContent = v;
      else if (k === "on") Object.keys(v).forEach(function (ev) { el.addEventListener(ev, v[ev]); });
      else if (k in el && typeof v !== "string") el[k] = v;
      else el.setAttribute(k, v === true ? "" : String(v));
    });
    (kids || []).forEach(function (c) { if (c !== null && c !== undefined) el.append(c); });
    return el;
  }
  var toastT;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2600); }
  function fmtDate(s) {
    var d = new Date(String(s).replace(" ", "T") + "Z");
    return isNaN(d) ? s : d.toLocaleString("ro-RO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = { Accept: "application/json" };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.method && opts.method !== "GET") headers["X-CSRF-Token"] = csrf;
    return fetch("/api" + path, { method: opts.method || "GET", headers: headers, credentials: "same-origin", body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) {
          if (r.status === 401 && path !== "/admin/login") { show("Login"); throw new Error(b.error || "Sesiune expirată"); }
          if (!r.ok || b.ok === false) throw new Error(b.error || "Eroare " + r.status);
          return b;
        });
      });
  }

  // ---------- ecrane ----------
  var SCREENS = ["Loading", "Offline", "Setup", "Login", "Leads", "Content", "Stats", "Account"];
  function show(name) {
    SCREENS.forEach(function (s) { $("#scr" + s).hidden = s !== name; });
    var inApp = ["Leads", "Content", "Stats", "Account"].indexOf(name) > -1;
    $("#tabs").hidden = !inApp; $("#who").hidden = !inApp;
    $$("#tabs button").forEach(function (b) {
      var on = b.dataset.tab.toLowerCase() === name.toLowerCase();
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
  }
  $$("#tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.tab;
      if (t === "leads") { show("Leads"); loadLeads(); }
      if (t === "content") { show("Content"); loadContent(); }
      if (t === "stats") { show("Stats"); loadStats(); }
      if (t === "account") { show("Account"); loadAudit(); }
    });
  });

  function enterApp(email) {
    $("#whoEmail").textContent = email;
    show("Leads"); loadLeads();
  }

  // ---------- pornire ----------
  function boot() {
    var ctrl = new AbortController();
    setTimeout(function () { ctrl.abort(); }, 3000);
    fetch("/api/health", { signal: ctrl.signal }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (hb) {
        if (!hb || !hb.ok) { show("Offline"); return; }
        return api("/admin/status").then(function (st) {
          if (!st.configured) { show("Setup"); return; }
          return fetch("/api/admin/session", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (s) {
            if (s.ok) { csrf = s.csrf; enterApp(s.email); } else show("Login");
          });
        });
      }).catch(function () { show("Offline"); });
  }

  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, btn = f.querySelector("button");
    $("#loginErr").textContent = ""; btn.disabled = true;
    api("/admin/login", { method: "POST", body: { email: f.email.value, password: f.password.value } })
      .then(function (b) { csrf = b.csrf; f.password.value = ""; enterApp(b.email); })
      .catch(function (err) { $("#loginErr").textContent = err.message; })
      .finally(function () { btn.disabled = false; });
  });

  $("#logoutBtn").addEventListener("click", function () {
    api("/admin/logout", { method: "POST" }).catch(function () {}).then(function () { csrf = ""; show("Login"); });
  });

  // ================= CERERI =================
  var searchT;
  $("#leadSearch").addEventListener("input", function (e) { clearTimeout(searchT); searchT = setTimeout(function () { state.q = e.target.value; loadLeads(); }, 250); });
  $$("#leadFilters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#leadFilters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      state.status = b.dataset.status; loadLeads();
    });
  });

  function loadLeads() {
    var qs = "?limit=100" + (state.status ? "&status=" + encodeURIComponent(state.status) : "") + (state.q ? "&q=" + encodeURIComponent(state.q) : "");
    return api("/admin/leads" + qs).then(function (b) {
      Object.keys(b.counts).forEach(function (k) { var el = $('[data-count="' + k + '"]'); if (el) el.textContent = b.counts[k] ? "(" + b.counts[k] + ")" : ""; });
      var nb = $("#newCount"); nb.hidden = !b.counts.nou; nb.textContent = b.counts.nou || "";
      var list = $("#leadList"); list.replaceChildren();
      b.items.forEach(function (l) { list.append(leadCard(l)); });
      $("#leadEmpty").hidden = b.items.length > 0;
    }).catch(function (e) { toast(e.message); });
  }

  function leadCard(l) {
    var statusSel = h("select", { "aria-label": "Status" }, Object.keys(STATUS).map(function (k) { return h("option", { value: k, text: STATUS[k], selected: l.status === k }); }));
    var notes = h("textarea", { rows: 3, placeholder: "Notițe interne (nu le vede clientul)", "aria-label": "Notițe" });
    notes.value = l.notes || "";
    var pill = h("span", { class: "pill " + l.status, text: STATUS[l.status] });

    function save(extra) {
      return api("/admin/leads/" + l.id, { method: "PATCH", body: Object.assign({ status: statusSel.value, notes: notes.value }, extra || {}) })
        .then(function (b) { l = b.item; pill.className = "pill " + l.status; pill.textContent = STATUS[l.status]; card.classList.toggle("is-new", l.status === "nou"); toast("Salvat"); loadCountsOnly(); })
        .catch(function (e) { toast(e.message); });
    }
    statusSel.addEventListener("change", function () { save(); });

    var contact = [];
    if (l.email) contact.push(h("dt", { text: "E-mail" }), h("dd", null, [h("a", { href: "mailto:" + encodeURIComponent(l.email).replace("%40", "@"), text: l.email })]));
    if (l.phone) contact.push(h("dt", { text: "Telefon" }), h("dd", null, [h("a", { href: "tel:" + l.phone.replace(/[^\d+]/g, ""), text: l.phone })]));
    if (l.type) contact.push(h("dt", { text: "Tip" }), h("dd", { text: l.type }));
    if (l.package) contact.push(h("dt", { text: "Pachet" }), h("dd", { text: l.package }));
    contact.push(h("dt", { text: "Primită" }), h("dd", { text: fmtDate(l.created_at) }));

    var card = h("details", { class: "lead" + (l.status === "nou" ? " is-new" : "") }, [
      h("summary", null, [
        h("div", null, [h("b", { text: l.name }), h("span", { class: "sub", text: l.email || l.phone })]),
        h("div", { class: "sub hide-m", text: [l.type, l.package].filter(Boolean).join(" · ") }),
        h("span", { class: "sub hide-m", text: fmtDate(l.created_at) }),
        pill
      ]),
      h("div", { class: "body" }, [
        h("div", null, [h("p", { class: "msg", text: l.message })]),
        h("div", null, [
          h("dl", null, contact),
          h("label", null, ["Status", statusSel]),
          h("label", null, ["Notițe", notes]),
          h("div", { class: "actions" }, [
            h("button", { type: "button", class: "btn sm", text: "Salvează notițele", on: { click: function () { save(); } } }),
            l.email ? h("a", { class: "btn sm ghost", href: "mailto:" + l.email + "?subject=" + encodeURIComponent("Re: proiectul tău — Afyze"), text: "Răspunde pe e-mail" }) : null,
            h("button", { type: "button", class: "btn sm danger", text: "Șterge", on: { click: function () {
              if (!confirm("Ștergi definitiv cererea de la " + l.name + "?")) return;
              api("/admin/leads/" + l.id, { method: "DELETE" }).then(function () { card.remove(); toast("Cererea a fost ștearsă"); loadCountsOnly(); }).catch(function (e) { toast(e.message); });
            } } })
          ])
        ])
      ])
    ]);
    return card;
  }

  function loadCountsOnly() {
    api("/admin/leads?limit=1").then(function (b) {
      Object.keys(b.counts).forEach(function (k) { var el = $('[data-count="' + k + '"]'); if (el) el.textContent = b.counts[k] ? "(" + b.counts[k] + ")" : ""; });
      var nb = $("#newCount"); nb.hidden = !b.counts.nou; nb.textContent = b.counts.nou || "";
    }).catch(function () {});
  }

  // ================= CONȚINUT =================
  var form = $("#contentForm");
  function setField(name, v) { var el = form.elements[name]; if (!el) return; if (el.type === "checkbox") el.checked = !!v; else el.value = v || ""; }

  function loadContent() {
    $("#contentErr").textContent = ""; $("#contentOk").textContent = "";
    return api("/admin/content").then(function (b) {
      var c = state.content = b.content;
      setField("contact.email", c.contact.email); setField("contact.phone", c.contact.phone); setField("contact.city", c.contact.city);
      setField("announcement.enabled", c.announcement.enabled); setField("announcement.text", c.announcement.text);
      setField("urgentNote", c.urgentNote);
      renderPlans(c.plans); renderProjects(c.projects);
      $("#contentOk").textContent = "Ultima salvare: " + fmtDate(b.updatedAt);
    }).catch(function (e) { toast(e.message); });
  }

  function renderPlans(plans) {
    var box = $("#plansBox"); box.replaceChildren();
    plans.forEach(function (p) {
      var feats = h("textarea", { rows: 8, "data-k": "features" }); feats.value = p.features.join("\n");
      var name = h("input", { "data-k": "name", maxlength: 30 }); name.value = p.name;
      var price = h("input", { "data-k": "price", maxlength: 12, inputmode: "numeric" }); price.value = p.price;
      var term = h("input", { "data-k": "term", maxlength: 60 }); term.value = p.term;
      box.append(h("div", { class: "plan-box", "data-plan": p.id }, [
        h("h3", { text: "Pachetul " + p.name }),
        h("label", null, ["Nume", name]),
        h("label", null, ["Preț (MDL)", price]),
        h("label", null, ["Termen", term]),
        h("label", null, ["Ce include (câte unul pe rând)", feats])
      ]));
    });
  }

  function select(map, value, k) {
    return h("select", { "data-k": k }, Object.keys(map).map(function (key) { return h("option", { value: key, text: map[key], selected: key === value }); }));
  }

  function projectRow(p) {
    var input = function (k, v, attrs) { var el = h("input", Object.assign({ "data-k": k }, attrs || {})); el.value = v || ""; return el; };
    var desc = h("textarea", { rows: 3, "data-k": "description", maxlength: 600 }); desc.value = p.description || "";
    var vis = h("input", { type: "checkbox", "data-k": "visible" }); vis.checked = p.visible !== false;
    var title = h("b", { text: p.title || "Proiect nou" });
    var row = h("div", { class: "proj", "data-id": p.id || "" }, [
      h("div", { class: "head" }, [title, h("div", { class: "tools" }, [
        h("button", { type: "button", title: "Mută mai sus", "aria-label": "Mută mai sus", text: "↑", on: { click: function () { if (row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling); } } }),
        h("button", { type: "button", title: "Mută mai jos", "aria-label": "Mută mai jos", text: "↓", on: { click: function () { if (row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row); } } }),
        h("button", { type: "button", title: "Șterge", "aria-label": "Șterge proiectul", text: "✕", on: { click: function () { if (confirm("Ștergi proiectul din listă?")) row.remove(); } } })
      ])]),
      h("div", { class: "row" }, [
        h("label", null, ["Titlu", input("title", p.title, { maxlength: 80, on: { input: function (e) { title.textContent = e.target.value || "Proiect nou"; } } })]),
        h("label", null, ["Categorie", input("category", p.category, { maxlength: 80 })]),
        h("label", null, ["Filtru", select(FILTER, p.filter, "filter")]),
        h("label", null, ["Ilustrație", select(ART, p.art, "art")]),
        h("label", null, ["Mărime", select(SIZE, p.size, "size")])
      ]),
      h("label", null, ["Descriere", desc]),
      h("div", { class: "grid2" }, [
        h("label", null, ["Link (opțional, https://…)", input("link", p.link, { type: "url", maxlength: 300 })]),
        h("label", null, ["Etichete (separate prin virgulă)", input("tags", (p.tags || []).join(", "), { maxlength: 240 })])
      ]),
      h("label", { class: "check" }, [vis, "Afișat pe site"])
    ]);
    return row;
  }

  function renderProjects(list) {
    var box = $("#projectsBox"); box.replaceChildren();
    list.forEach(function (p) { box.append(projectRow(p)); });
  }
  $("#addProject").addEventListener("click", function () {
    var row = projectRow({ id: "", title: "", category: "", filter: "web", art: "afyze", size: "w7", visible: true, tags: [] });
    $("#projectsBox").append(row);
    row.querySelector("input").focus();
  });

  function collect() {
    var v = function (n) { return form.elements[n].value; };
    var plans = $$("#plansBox [data-plan]").map(function (box) {
      var g = function (k) { return box.querySelector('[data-k="' + k + '"]').value; };
      return { id: box.dataset.plan, name: g("name"), price: g("price"), term: g("term"), features: g("features").split("\n").map(function (s) { return s.trim(); }).filter(Boolean) };
    });
    var projects = $$("#projectsBox .proj").map(function (row) {
      var g = function (k) { var el = row.querySelector('[data-k="' + k + '"]'); return el.type === "checkbox" ? el.checked : el.value; };
      return {
        id: row.dataset.id, title: g("title"), category: g("category"), filter: g("filter"), art: g("art"), size: g("size"),
        description: g("description"), link: g("link").trim(), visible: g("visible"),
        tags: g("tags").split(",").map(function (s) { return s.trim(); }).filter(Boolean)
      };
    });
    return {
      contact: { email: v("contact.email"), phone: v("contact.phone"), city: v("contact.city") },
      announcement: { enabled: form.elements["announcement.enabled"].checked, text: v("announcement.text") },
      urgentNote: v("urgentNote"), plans: plans, projects: projects
    };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector(".savebar .btn");
    $("#contentErr").textContent = ""; $("#contentOk").textContent = ""; btn.disabled = true;
    api("/admin/content", { method: "PUT", body: { content: collect() } })
      .then(function (b) { state.content = b.content; renderProjects(b.content.projects); $("#contentOk").textContent = "Salvat. Ultima salvare: " + fmtDate(b.updatedAt); toast("Conținutul a fost salvat"); })
      .catch(function (err) { $("#contentErr").textContent = err.message; })
      .finally(function () { btn.disabled = false; });
  });

  // ================= STATISTICI =================
  $$("#statDays button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#statDays button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      state.days = Number(b.dataset.days); loadStats();
    });
  });

  function svg(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function drawChart(daily) {
    var box = $("#chart"); box.replaceChildren();
    var W = 1000, H = 220, pad = { l: 36, r: 8, t: 12, b: 26 };
    var max = Math.max(4, Math.max.apply(null, daily.map(function (d) { return d.views; })));
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": "Vizualizări pe zi" });
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, bw = iw / daily.length;
    [0, 0.5, 1].forEach(function (f) {
      var y = pad.t + ih * (1 - f);
      s.append(svg("line", { x1: pad.l, x2: W - pad.r, y1: y, y2: y, stroke: "rgba(19,40,31,.1)" }));
      var t = svg("text", { x: pad.l - 6, y: y + 4, "text-anchor": "end" }); t.textContent = Math.round(max * f); s.append(t);
    });
    daily.forEach(function (d, i) {
      var bh = ih * d.views / max, x = pad.l + i * bw + bw * 0.18;
      var r = svg("rect", { class: "bar-r", x: x, y: pad.t + ih - bh, width: Math.max(1, bw * 0.64), height: Math.max(0, bh), rx: 2 });
      var tt = svg("title"); tt.textContent = d.day + ": " + d.views + " vizualizări, " + d.visitors + " vizitatori"; r.append(tt);
      s.append(r);
      var every = daily.length > 31 ? 14 : daily.length > 8 ? 5 : 1;
      if (i % every === 0 || i === daily.length - 1) {
        var lb = svg("text", { x: x + bw * 0.32, y: H - 8, "text-anchor": "middle" }); lb.textContent = d.day.slice(8, 10) + "." + d.day.slice(5, 7); s.append(lb);
      }
    });
    box.append(s);
  }

  function top(el, rows) {
    el.replaceChildren();
    if (!rows.length) { el.append(h("li", { class: "none", text: "Încă nu sunt date." })); return; }
    var max = rows[0].n;
    rows.forEach(function (r) {
      var bar = h("i"); bar.style.width = Math.round(100 * r.n / max) + "%";
      el.append(h("li", null, [bar, h("span", { text: r.label }), h("b", { text: String(r.n) })]));
    });
  }

  function loadStats() {
    return api("/admin/stats?days=" + state.days).then(function (b) {
      $("#kViews").textContent = b.totals.views.toLocaleString("ro-RO");
      $("#kVisitors").textContent = b.totals.visitors.toLocaleString("ro-RO");
      $("#kLeads").textContent = b.totals.leads.toLocaleString("ro-RO");
      drawChart(b.daily); top($("#tPages"), b.pages); top($("#tRefs"), b.referrers); top($("#tDevices"), b.devices);
    }).catch(function (e) { toast(e.message); });
  }

  // ================= CONT =================
  var ACTIONS = { login: "Autentificare", login_esuat: "Încercare de autentificare eșuată", parola_schimbata: "Parolă schimbată", cerere_modificata: "Cerere modificată", cerere_stearsa: "Cerere ștearsă", continut_salvat: "Conținut salvat", export_csv: "Export CSV" };
  function loadAudit() {
    api("/admin/audit").then(function (b) {
      var ol = $("#auditList"); ol.replaceChildren();
      b.items.forEach(function (a) { ol.append(h("li", null, [h("span", { text: (ACTIONS[a.action] || a.action) + (a.detail ? " " + a.detail : "") }), h("time", { text: fmtDate(a.ts) })])); });
      if (!b.items.length) ol.append(h("li", { text: "Nicio activitate încă." }));
    }).catch(function () {});
  }
  $("#pwForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target; $("#pwErr").textContent = ""; $("#pwOk").textContent = "";
    if (f.next.value !== f.again.value) { $("#pwErr").textContent = "Parolele noi nu coincid."; return; }
    api("/admin/password", { method: "POST", body: { current: f.current.value, next: f.next.value } })
      .then(function () { f.reset(); $("#pwOk").textContent = "Parola a fost schimbată."; loadAudit(); })
      .catch(function (err) { $("#pwErr").textContent = err.message; });
  });

  boot();
})();
