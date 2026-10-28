// Parole, token-uri de sesiune și utilitare de securitate.
import crypto from "node:crypto";

const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEYLEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEYLEN, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password, stored) {
  try {
    const [alg, N, r, p, saltB64, hashB64] = String(stored).split("$");
    if (alg !== "scrypt") return false;
    const expected = Buffer.from(hashB64, "base64");
    const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, { N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// un hash fals, folosit când e-mailul nu există, ca timpul de răspuns să fie același
export const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString("hex"));

export function passwordProblem(pw) {
  if (typeof pw !== "string" || pw.length < 10) return "Parola trebuie să aibă cel puțin 10 caractere.";
  if (pw.length > 200) return "Parola e prea lungă.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return "Parola trebuie să conțină litere și cifre.";
  return null;
}

export const token = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");
export const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function parseCookies(header = "") {
  const out = {};
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const k = part.slice(0, i).trim();
    try { out[k] = decodeURIComponent(part.slice(i + 1).trim()); } catch { /* ignorăm cookie-uri stricate */ }
  }
  return out;
}

export function cookie(name, value, { maxAge, secure, path = "/api/admin" } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, "HttpOnly", "SameSite=Strict"];
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
