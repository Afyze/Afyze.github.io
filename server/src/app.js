// Aplicația Express: API public, API de administrare și servirea site-ului.
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { getContent, setContent, audit, tx } from "./db.js";
import { validateContent } from "./content.js";
import { hashPassword, verifyPassword, passwordProblem, DUMMY_HASH, token, sha256, safeEqual, parseCookies, cookie } from "./security.js";

const SID = "afyze_sid";
const STATUSES = ["nou", "in_lucru", "castigat", "pierdut", "spam"];
const TYPES = ["Site web", "Automatizare", "Aplicație", "Altceva", ""];
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python-requests/i;
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const today = () => new Date().toISOString().slice(0, 10);

class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}

function field(v, name, { max, min = 0, required = false, multiline = false, pattern } = {}) {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") throw new HttpError(400, "Date invalide.", { field: name });
  v = v.trim().replace(/\r\n/g, "\n");
  if (required && !v) throw new HttpError(400, "Completează toate câmpurile obligatorii.", { field: name });
  if (v && v.length < min) throw new HttpError(400, "Textul e prea scurt.", { field: name });
  if (v.length > max) throw new HttpError(400, "Textul e prea lung.", { field: name });
  if (CTRL.test(v) || (!multiline && v.includes("\n"))) throw new HttpError(400, "Textul conține caractere nepermise.", { field: name });
  if (v && pattern && !pattern.test(v)) throw new HttpError(400, "Format invalid.", { field: name });
  return v;
}

export function createApp({ db, config, mailer, log = console }) {
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", 1);

  // ---------- antete de securitate ----------
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        frameAncestors: ["'self'"],
        formAction: ["'self'", "mailto:"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        ...(config.production ? { upgradeInsecureRequests: [] } : {})
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: config.production ? { maxAge: 31536000, includeSubDomains: true } : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "sameorigin" }
  }));
  app.use((req, res, next) => {
    res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
    next();
  });

  // ---------- CORS doar pentru API-ul public și doar pentru site-urile permise ----------
  function publicCors(req, res, next) {
    const origin = req.get("origin");
    if (origin && config.allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Max-Age", "600");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  }

  const json = express.json({ limit: "32kb", strict: true });
  const limiter = (limit, windowMs, message) => rateLimit({
    windowMs, limit, standardHeaders: "draft-7", legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ ok: false, error: message })
  });
  const contactLimit = limiter(config.limits.contactPer15Min, 15 * 60_000, "Prea multe mesaje într-un timp scurt. Încearcă din nou peste câteva minute.");
  const loginLimit = limiter(config.limits.loginPer15Min, 15 * 60_000, "Prea multe încercări de autentificare. Încearcă din nou peste 15 minute.");
  const hitLimit = limiter(config.limits.hitsPerMin, 60_000, "Prea multe cereri.");

  // vizitator anonim: hash zilnic din IP + browser, cu o sare care se schimbă în fiecare zi
  function visitorId(req) {
    const day = today();
    const key = `salt:${day}`;
    let row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
    if (!row) {
      tx(db, () => {
        db.prepare("DELETE FROM meta WHERE key LIKE 'salt:%' AND key <> ?").run(key);
        db.prepare("INSERT OR IGNORE INTO meta(key, value) VALUES (?, ?)").run(key, token(24));
      });
      row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
    }
    return sha256(`${row.value}|${req.ip}|${req.get("user-agent") || ""}`).slice(0, 16);
  }

  // ================= API PUBLIC =================
  const pub = express.Router();
  pub.use(publicCors);

  pub.get("/health", (req, res) => res.json({ ok: true, service: "afyze", version: 1 }));

  pub.get("/content", (req, res) => {
    const { content, updatedAt } = getContent(db);
    res.set("Cache-Control", "no-cache");
    res.json({ ok: true, updatedAt, content: { ...content, projects: content.projects.filter((p) => p.visible) } });
  });

  pub.post("/contact", contactLimit, json, (req, res) => {
    const b = req.body || {};
    // capcane pentru roboți: câmp ascuns completat sau formular trimis prea repede
    const elapsed = Number(b.t);
    if ((typeof b.website === "string" && b.website.trim()) || !Number.isFinite(elapsed) || elapsed < 2500) {
      return res.json({ ok: true });
    }
    const lead = {
      name: field(b.name, "name", { required: true, min: 2, max: 80 }),
      email: field(b.email, "email", { max: 120, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ }),
      phone: field(b.phone, "phone", { max: 30, pattern: /^\+?[0-9][0-9 ()-]{5,28}$/ }),
      type: field(b.type, "type", { max: 40 }),
      package: field(b.package, "package", { max: 60 }),
      message: field(b.message, "message", { required: true, min: 10, max: 3000, multiline: true })
    };
    if (!lead.email && !lead.phone) throw new HttpError(400, "Lasă un e-mail sau un număr de telefon, ca să te pot contacta.", { field: "email" });
    if (!TYPES.includes(lead.type)) lead.type = "Altceva";
    const links = (lead.message.match(/https?:\/\//gi) || []).length;
    const status = links > 3 ? "spam" : "nou";
    const info = db.prepare(`INSERT INTO leads(name, email, phone, type, package, message, status, origin, visitor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(lead.name, lead.email, lead.phone, lead.type, lead.package, lead.message, status,
      (req.get("origin") || "").slice(0, 120), visitorId(req));
    if (status === "nou" && mailer) mailer.sendLead(lead).catch((e) => log.error?.("[mail] eroare:", e.message));
    res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
  });

  pub.post("/hit", hitLimit, json, (req, res) => {
    const ua = req.get("user-agent") || "";
    if (BOT.test(ua) || req.get("dnt") === "1") return res.sendStatus(204);
    const b = req.body || {};
    let p = typeof b.p === "string" ? b.p.split(/[?#]/)[0] : "";
    if (!p.startsWith("/") || p.length > 200 || CTRL.test(p)) return res.sendStatus(204);
    p = p.replace(/\/index\.html$/, "/");
    let ref = "";
    if (typeof b.r === "string" && b.r) {
      try {
        const host = new URL(b.r).hostname.replace(/^www\./, "");
        const own = config.allowedOrigins.map((o) => { try { return new URL(o).hostname.replace(/^www\./, ""); } catch { return ""; } });
        if (host && !own.includes(host)) ref = host.slice(0, 100);
      } catch { /* referrer invalid */ }
    }
    const w = Number(b.w) || 0;
    const device = w && w < 768 ? "mobil" : w && w < 1100 ? "tabletă" : "desktop";
    db.prepare("INSERT INTO hits(day, ts, path, ref, device, visitor) VALUES (?, ?, ?, ?, ?, ?)").run(today(), Date.now(), p, ref, device, visitorId(req));
    res.sendStatus(204);
  });

  app.use("/api", pub);

  // ================= API ADMINISTRARE =================
  const adm = express.Router();

  // refuzăm cererile venite de pe alte site-uri
  adm.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && origin !== `${req.protocol}://${req.get("host")}`) return res.status(403).json({ ok: false, error: "Origine nepermisă." });
    res.set("Cache-Control", "no-store");
    next();
  });

  function loadSession(req) {
    const sid = parseCookies(req.get("cookie"))[SID];
    if (!sid) return null;
    const row = db.prepare(`SELECT s.id_hash, s.csrf, s.expires_at, a.id, a.email FROM sessions s JOIN admins a ON a.id = s.admin_id
      WHERE s.id_hash = ?`).get(sha256(sid));
    if (!row || row.expires_at < Date.now()) return null;
    return row;
  }

  function requireAdmin(req, res, next) {
    const s = loadSession(req);
    if (!s) return res.status(401).json({ ok: false, error: "Sesiunea a expirat. Autentifică-te din nou." });
    if (!["GET", "HEAD"].includes(req.method) && !safeEqual(req.get("x-csrf-token") || "", s.csrf)) {
      return res.status(403).json({ ok: false, error: "Token de securitate invalid. Reîncarcă pagina." });
    }
    req.admin = { id: s.id, email: s.email, csrf: s.csrf, sessionHash: s.id_hash };
    next();
  }

  adm.get("/status", (req, res) => {
    const n = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
    res.json({ ok: true, configured: n > 0 });
  });

  adm.post("/login", loginLimit, json, (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().slice(0, 120) : "";
    const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 200) : "";
    const admin = email ? db.prepare("SELECT * FROM admins WHERE email = ?").get(email) : null;
    const now = Date.now();
    if (admin && admin.locked_until > now) {
      verifyPassword(password, DUMMY_HASH);
      return res.status(429).json({ ok: false, error: "Contul e blocat temporar după prea multe încercări. Încearcă peste 15 minute." });
    }
    const good = verifyPassword(password, admin ? admin.pass_hash : DUMMY_HASH) && !!admin;
    if (!good) {
      if (admin) {
        const failed = admin.failed + 1;
        if (failed >= 5) db.prepare("UPDATE admins SET failed = 0, locked_until = ? WHERE id = ?").run(now + 15 * 60_000, admin.id);
        else db.prepare("UPDATE admins SET failed = ? WHERE id = ?").run(failed, admin.id);
        audit(db, admin.id, "login_esuat");
      }
      return res.status(401).json({ ok: false, error: "E-mail sau parolă greșită." });
    }
    const sid = token(32), csrf = token(24);
    const maxAge = config.sessionHours * 3600;
    tx(db, () => {
      db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
      db.prepare("UPDATE admins SET failed = 0, locked_until = 0 WHERE id = ?").run(admin.id);
      db.prepare("INSERT INTO sessions(id_hash, admin_id, csrf, created_at, expires_at) VALUES (?, ?, ?, ?, ?)").run(sha256(sid), admin.id, csrf, now, now + maxAge * 1000);
    });
    audit(db, admin.id, "login");
    res.set("Set-Cookie", cookie(SID, sid, { maxAge, secure: config.cookieSecure }));
    res.json({ ok: true, email: admin.email, csrf });
  });

  adm.post("/logout", requireAdmin, (req, res) => {
    db.prepare("DELETE FROM sessions WHERE id_hash = ?").run(req.admin.sessionHash);
    res.set("Set-Cookie", cookie(SID, "", { maxAge: 0, secure: config.cookieSecure }));
    res.json({ ok: true });
  });

  adm.get("/session", requireAdmin, (req, res) => res.json({ ok: true, email: req.admin.email, csrf: req.admin.csrf }));

  adm.post("/password", requireAdmin, json, (req, res) => {
    const { current, next: nextPw } = req.body || {};
    const row = db.prepare("SELECT pass_hash FROM admins WHERE id = ?").get(req.admin.id);
    if (!verifyPassword(String(current || ""), row.pass_hash)) throw new HttpError(400, "Parola actuală nu e corectă.");
    const problem = passwordProblem(nextPw);
    if (problem) throw new HttpError(400, problem);
    tx(db, () => {
      db.prepare("UPDATE admins SET pass_hash = ? WHERE id = ?").run(hashPassword(nextPw), req.admin.id);
      db.prepare("DELETE FROM sessions WHERE admin_id = ? AND id_hash <> ?").run(req.admin.id, req.admin.sessionHash);
    });
    audit(db, req.admin.id, "parola_schimbata");
    res.json({ ok: true });
  });

  // ---------- cereri ----------
  adm.get("/leads", requireAdmin, (req, res) => {
    const status = STATUSES.includes(req.query.status) ? req.query.status : "";
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 80) : "";
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const where = [], args = [];
    if (status) { where.push("status = ?"); args.push(status); }
    else where.push("status <> 'spam'");
    if (q) {
      where.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\')");
      const like = `%${q.replace(/[\\%_]/g, (m) => "\\" + m)}%`;
      args.push(like, like, like, like);
    }
    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const items = db.prepare(`SELECT * FROM leads ${w} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...args, limit, offset);
    const total = db.prepare(`SELECT COUNT(*) AS n FROM leads ${w}`).get(...args).n;
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const r of db.prepare("SELECT status, COUNT(*) AS n FROM leads GROUP BY status").all()) counts[r.status] = r.n;
    res.json({ ok: true, items, total, counts });
  });

  adm.patch("/leads/:id", requireAdmin, json, (req, res) => {
    const id = Number(req.params.id);
    const lead = db.prepare("SELECT id FROM leads WHERE id = ?").get(id);
    if (!lead) throw new HttpError(404, "Cererea nu există.");
    const { status, notes } = req.body || {};
    if (status !== undefined) {
      if (!STATUSES.includes(status)) throw new HttpError(400, "Status invalid.");
      db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
    }
    if (notes !== undefined) db.prepare("UPDATE leads SET notes = ? WHERE id = ?").run(field(notes, "notes", { max: 2000, multiline: true }), id);
    audit(db, req.admin.id, "cerere_modificata", `#${id}`);
    res.json({ ok: true, item: db.prepare("SELECT * FROM leads WHERE id = ?").get(id) });
  });

  adm.delete("/leads/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const info = db.prepare("DELETE FROM leads WHERE id = ?").run(id);
    if (!info.changes) throw new HttpError(404, "Cererea nu există.");
    audit(db, req.admin.id, "cerere_stearsa", `#${id}`);
    res.json({ ok: true });
  });

  adm.get("/leads.csv", requireAdmin, (req, res) => {
    const rows = db.prepare("SELECT id, created_at, status, name, email, phone, type, package, message, notes FROM leads ORDER BY id DESC").all();
    // protecție împotriva formulelor injectate în Excel
    const cell = (v) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
    const head = ["ID", "Data", "Status", "Nume", "E-mail", "Telefon", "Tip", "Pachet", "Mesaj", "Notițe"];
    const csv = "﻿" + [head.map(cell).join(","), ...rows.map((r) => Object.values(r).map(cell).join(","))].join("\r\n");
    audit(db, req.admin.id, "export_csv");
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="cereri-afyze-${today()}.csv"`);
    res.send(csv);
  });

  // ---------- conținut ----------
  adm.get("/content", requireAdmin, (req, res) => res.json({ ok: true, ...getContent(db) }));

  adm.put("/content", requireAdmin, express.json({ limit: "200kb" }), (req, res) => {
    let clean;
    try { clean = validateContent(req.body && req.body.content); }
    catch (e) { throw new HttpError(400, e.message); }
    setContent(db, clean);
    audit(db, req.admin.id, "continut_salvat");
    res.json({ ok: true, ...getContent(db) });
  });

  // ---------- statistici ----------
  adm.get("/stats", requireAdmin, (req, res) => {
    const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const from = new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10);
    const byDay = new Map(db.prepare("SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM hits WHERE day >= ? GROUP BY day").all(from).map((r) => [r.day, r]));
    const daily = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      const r = byDay.get(d);
      daily.push({ day: d, views: r ? r.views : 0, visitors: r ? r.visitors : 0 });
    }
    const top = (col) => db.prepare(`SELECT ${col} AS label, COUNT(*) AS n FROM hits WHERE day >= ? AND ${col} <> '' GROUP BY ${col} ORDER BY n DESC LIMIT 10`).all(from);
    const leads = db.prepare("SELECT COUNT(*) AS n FROM leads WHERE status <> 'spam' AND date(created_at) >= ?").get(from).n;
    res.json({
      ok: true, days, daily,
      totals: { views: daily.reduce((a, b) => a + b.views, 0), visitors: daily.reduce((a, b) => a + b.visitors, 0), leads },
      pages: top("path"), referrers: top("ref"), devices: top("device")
    });
  });

  adm.get("/audit", requireAdmin, (req, res) => {
    res.json({ ok: true, items: db.prepare("SELECT ts, action, detail FROM audit ORDER BY id DESC LIMIT 50").all() });
  });

  app.use("/api/admin", adm);
  app.use("/api", (req, res) => res.status(404).json({ ok: false, error: "Ruta nu există." }));

  // ================= SITE-UL STATIC =================
  app.use((req, res, next) => {
    // nu servim niciodată codul serverului, dependențele sau fișierele ascunse
    if (/^\/(server|node_modules)(\/|$)/i.test(req.path) || /(^|\/)\.(?!well-known\/)/.test(req.path)) return res.status(404).send("Pagina nu există.");
    next();
  });
  app.use(express.static(config.siteRoot, {
    dotfiles: "allow",
    extensions: ["html"],
    index: ["index.html"],
    setHeaders(res, file) {
      if (file.endsWith(".html")) res.set("Cache-Control", "no-cache");
      else res.set("Cache-Control", "public, max-age=86400");
    }
  }));
  app.use((req, res) => res.status(404).type("text/plain; charset=utf-8").send("Pagina nu există."));

  // ---------- erori ----------
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ ok: false, error: err.message, ...(err.extra || {}) });
    if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, error: "Date invalide." });
    if (err.type === "entity.too.large") return res.status(413).json({ ok: false, error: "Mesajul e prea mare." });
    log.error?.("[eroare]", err);
    res.status(500).json({ ok: false, error: "A apărut o eroare pe server." });
  });

  return app;
}
