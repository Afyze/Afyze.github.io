// Teste automate pentru API. Rulare: npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../src/db.js";
import { readConfig } from "../src/config.js";
import { createApp } from "../src/app.js";
import { hashPassword } from "../src/security.js";

const quiet = { info() {}, error() {} };
let server, base, db, sent = [];

before(async () => {
  db = openDb(":memory:");
  db.prepare("INSERT INTO admins(email, pass_hash) VALUES (?, ?)").run("admin@afyze.com", hashPassword("ParolaTest123"));
  const config = { ...readConfig({}), limits: { contactPer15Min: 8, loginPer15Min: 50, hitsPerMin: 100 } };
  const mailer = { enabled: true, async sendLead(l) { sent.push(l); } };
  const app = createApp({ db, config, mailer, log: quiet });
  await new Promise((r) => { server = app.listen(0, "127.0.0.1", r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); db.close(); });

const post = (path, body, headers = {}) => fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
const goodLead = { name: "Ion Popescu", email: "ion@exemplu.md", type: "Site web", package: "Business — 7.000 MDL", message: "Am nevoie de un site pentru firma mea.", t: 6000, website: "" };

async function login(email = "admin@afyze.com", password = "ParolaTest123") {
  const r = await post("/api/admin/login", { email, password });
  const body = await r.json();
  const cookie = (r.headers.get("set-cookie") || "").split(";")[0];
  return { r, body, cookie };
}

test("health răspunde", async () => {
  const r = await fetch(base + "/api/health");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
});

test("antete de securitate prezente", async () => {
  const r = await fetch(base + "/api/health");
  assert.match(r.headers.get("content-security-policy"), /default-src 'self'/);
  assert.match(r.headers.get("content-security-policy"), /object-src 'none'/);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.ok(r.headers.get("permissions-policy").includes("camera=()"));
  assert.equal(r.headers.get("x-powered-by"), null);
});

test("codul serverului și fișierele ascunse nu sunt servite", async () => {
  for (const p of ["/server/package.json", "/server/.env.example", "/server/src/app.js", "/.git/config", "/.gitignore"]) {
    const r = await fetch(base + p);
    assert.equal(r.status, 404, p);
  }
  assert.equal((await fetch(base + "/.well-known/security.txt")).status !== 500, true);
});

test("conținutul public conține pachetele", async () => {
  const r = await fetch(base + "/api/content");
  const b = await r.json();
  assert.equal(b.content.plans.length, 3);
  assert.equal(b.content.plans[1].id, "business");
});

test("CORS doar pentru site-urile permise", async () => {
  const ok = await fetch(base + "/api/content", { headers: { origin: "https://afyze.github.io" } });
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://afyze.github.io");
  const bad = await fetch(base + "/api/content", { headers: { origin: "https://rau.example" } });
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});

test("formularul de contact salvează cererea și trimite e-mail", async () => {
  const r = await post("/api/contact", goodLead);
  assert.equal(r.status, 201);
  const row = db.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 1").get();
  assert.equal(row.name, "Ion Popescu");
  assert.equal(row.status, "nou");
  await new Promise((res) => setTimeout(res, 20));
  assert.equal(sent.length, 1);
});

test("formularul respinge date lipsă sau invalide", async () => {
  let r = await post("/api/contact", { ...goodLead, name: "" });
  assert.equal(r.status, 400);
  r = await post("/api/contact", { ...goodLead, email: "", phone: "" });
  assert.equal(r.status, 400);
  r = await post("/api/contact", { ...goodLead, email: "nu-e-email" });
  assert.equal(r.status, 400);
});

test("roboții sunt ignorați în tăcere (câmp capcană / prea rapid)", async () => {
  const before = db.prepare("SELECT COUNT(*) AS n FROM leads").get().n;
  const r = await fetch(base + "/api/health"); await r.text();
  const a = await post("/api/contact", { ...goodLead, website: "http://spam" }, { "x-forwarded-for": "1" });
  assert.equal(a.status, 200);
  const after = db.prepare("SELECT COUNT(*) AS n FROM leads").get().n;
  assert.equal(after, before);
});

test("limită de mesaje pe IP", async () => {
  let last;
  for (let i = 0; i < 6; i++) last = await post("/api/contact", goodLead);
  assert.equal(last.status, 429);
});

test("panoul cere autentificare", async () => {
  assert.equal((await fetch(base + "/api/admin/leads")).status, 401);
  assert.equal((await fetch(base + "/api/admin/stats")).status, 401);
});

test("parolă greșită → 401, fără să spună dacă e-mailul există", async () => {
  const a = await login("admin@afyze.com", "gresita12345");
  const b = await login("nimeni@afyze.com", "gresita12345");
  assert.equal(a.r.status, 401);
  assert.equal(b.r.status, 401);
  assert.equal(a.body.error, b.body.error);
});

test("autentificare, CSRF, cereri, conținut, statistici", async () => {
  db.prepare("UPDATE admins SET failed = 0, locked_until = 0").run();
  const { r, body, cookie } = await login();
  assert.equal(r.status, 200);
  assert.ok(body.csrf);
  assert.match(r.headers.get("set-cookie"), /HttpOnly/);
  assert.match(r.headers.get("set-cookie"), /SameSite=Strict/);

  const list = await fetch(base + "/api/admin/leads", { headers: { cookie } });
  const lb = await list.json();
  assert.ok(lb.items.length >= 1);
  const id = lb.items[0].id;

  // fără token CSRF → refuzat
  const noCsrf = await fetch(base + `/api/admin/leads/${id}`, { method: "PATCH", headers: { cookie, "content-type": "application/json" }, body: JSON.stringify({ status: "in_lucru" }) });
  assert.equal(noCsrf.status, 403);
  // de pe alt site → refuzat
  const cross = await fetch(base + `/api/admin/leads/${id}`, { method: "PATCH", headers: { cookie, origin: "https://rau.example", "x-csrf-token": body.csrf, "content-type": "application/json" }, body: "{}" });
  assert.equal(cross.status, 403);
  // corect
  const ok = await fetch(base + `/api/admin/leads/${id}`, { method: "PATCH", headers: { cookie, "x-csrf-token": body.csrf, "content-type": "application/json" }, body: JSON.stringify({ status: "in_lucru", notes: "Sunat luni" }) });
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).item.status, "in_lucru");

  // export CSV protejat împotriva formulelor
  db.prepare("INSERT INTO leads(name, email, message) VALUES ('=HYPERLINK(1)', 'x@y.md', 'mesaj de test aici')").run();
  const csv = await (await fetch(base + "/api/admin/leads.csv", { headers: { cookie } })).text();
  assert.ok(csv.includes(`"'=HYPERLINK(1)"`));

  // conținut invalid → 400
  const c = (await (await fetch(base + "/api/admin/content", { headers: { cookie } })).json()).content;
  const bad = structuredClone(c); bad.plans[0].price = "<script>";
  const badR = await fetch(base + "/api/admin/content", { method: "PUT", headers: { cookie, "x-csrf-token": body.csrf, "content-type": "application/json" }, body: JSON.stringify({ content: bad }) });
  assert.equal(badR.status, 400);
  const badLink = structuredClone(c); badLink.projects[0].link = "javascript:alert(1)";
  assert.equal((await fetch(base + "/api/admin/content", { method: "PUT", headers: { cookie, "x-csrf-token": body.csrf, "content-type": "application/json" }, body: JSON.stringify({ content: badLink }) })).status, 400);
  // conținut valid → apare public
  const good = structuredClone(c); good.plans[1].price = "7.500";
  const goodR = await fetch(base + "/api/admin/content", { method: "PUT", headers: { cookie, "x-csrf-token": body.csrf, "content-type": "application/json" }, body: JSON.stringify({ content: good }) });
  assert.equal(goodR.status, 200);
  const pub = await (await fetch(base + "/api/content")).json();
  assert.equal(pub.content.plans[1].price, "7.500");

  // statistici
  await post("/api/hit", { p: "/pachete.html?x=1", r: "https://www.google.com/search", w: 400 }, { "user-agent": "Mozilla/5.0" });
  await post("/api/hit", { p: "/", w: 1400 }, { "user-agent": "Googlebot/2.1" });
  const st = await (await fetch(base + "/api/admin/stats?days=7", { headers: { cookie } })).json();
  assert.equal(st.totals.views, 1);
  assert.equal(st.pages[0].label, "/pachete.html");
  assert.equal(st.referrers[0].label, "google.com");
  assert.equal(st.devices[0].label, "mobil");

  // deconectare
  const out = await fetch(base + "/api/admin/logout", { method: "POST", headers: { cookie, "x-csrf-token": body.csrf } });
  assert.equal(out.status, 200);
  assert.equal((await fetch(base + "/api/admin/leads", { headers: { cookie } })).status, 401);
});

test("blocare după 5 parole greșite", async () => {
  db.prepare("UPDATE admins SET failed = 0, locked_until = 0").run();
  for (let i = 0; i < 5; i++) await login("admin@afyze.com", "gresita12345");
  const { r } = await login();
  assert.equal(r.status, 429);
});
