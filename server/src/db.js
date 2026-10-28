// Baza de date SQLite (inclusă în Node.js, fără dependențe native).
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_CONTENT } from "./content.js";

const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS meta(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS admins(
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash TEXT NOT NULL,
  failed INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions(
  id_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  csrf TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS leads(
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  package TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nou' CHECK (status IN ('nou','in_lucru','castigat','pierdut','spam')),
  notes TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT '',
  visitor TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at);
CREATE TABLE IF NOT EXISTS content(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS hits(
  id INTEGER PRIMARY KEY,
  day TEXT NOT NULL,
  ts INTEGER NOT NULL,
  path TEXT NOT NULL,
  ref TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  visitor TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS hits_day ON hits(day);
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  admin_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
`;

export function openDb(file) {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  if (file !== ":memory:") db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  const has = db.prepare("SELECT 1 FROM content WHERE key = 'site'").get();
  if (!has) db.prepare("INSERT INTO content(key, value) VALUES ('site', ?)").run(JSON.stringify(DEFAULT_CONTENT));
  return db;
}

export function getContent(db) {
  const row = db.prepare("SELECT value, updated_at FROM content WHERE key = 'site'").get();
  return { content: JSON.parse(row.value), updatedAt: row.updated_at };
}

export function setContent(db, content) {
  db.prepare("UPDATE content SET value = ?, updated_at = datetime('now') WHERE key = 'site'").run(JSON.stringify(content));
}

export function audit(db, adminId, action, detail = "") {
  db.prepare("INSERT INTO audit(admin_id, action, detail) VALUES (?, ?, ?)").run(adminId ?? null, action, String(detail).slice(0, 500));
}

/** Rulează o funcție într-o tranzacție. */
export function tx(db, fn) {
  db.exec("BEGIN");
  try { const r = fn(); db.exec("COMMIT"); return r; }
  catch (e) { db.exec("ROLLBACK"); throw e; }
}
