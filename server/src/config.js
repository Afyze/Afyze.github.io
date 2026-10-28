// Configurarea serverului, citită din variabile de mediu (fișierul .env).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_DIR = path.resolve(here, "..");
export const SITE_ROOT = path.resolve(SERVER_DIR, "..");

/** Încarcă server/.env în process.env (fără să suprascrie variabilele deja setate). */
export function loadEnv(file = path.join(SERVER_DIR, ".env")) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}

export function readConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const list = (v, d) => (v || d).split(",").map((s) => s.trim()).filter(Boolean);
  return {
    production,
    host: env.HOST || (production ? "0.0.0.0" : "127.0.0.1"),
    port: Number(env.PORT) || 3000,
    dbPath: env.DB_PATH || path.join(SERVER_DIR, "data", "afyze.db"),
    siteRoot: env.SITE_ROOT || SITE_ROOT,
    // site-urile care au voie să trimită formularul și statisticile către acest backend
    allowedOrigins: list(env.ALLOWED_ORIGINS, "http://localhost:3000,http://127.0.0.1:3000,https://afyze.github.io,https://afyze.com,https://www.afyze.com"),
    trustProxy: env.TRUST_PROXY === "1" || env.TRUST_PROXY === "true",
    cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === "true" : production,
    sessionHours: Number(env.SESSION_HOURS) || 8,
    mail: {
      host: env.SMTP_HOST || "",
      port: Number(env.SMTP_PORT) || 465,
      secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : (Number(env.SMTP_PORT) || 465) === 465,
      user: env.SMTP_USER || "",
      pass: env.SMTP_PASS || "",
      from: env.MAIL_FROM || env.SMTP_USER || "",
      to: env.MAIL_TO || "hello@afyze.com"
    },
    // limitele pot fi micșorate în teste
    limits: {
      contactPer15Min: Number(env.LIMIT_CONTACT) || 5,
      loginPer15Min: Number(env.LIMIT_LOGIN) || 10,
      hitsPerMin: Number(env.LIMIT_HITS) || 120
    }
  };
}
