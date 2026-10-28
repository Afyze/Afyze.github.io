// Creează sau resetează contul de administrator.
// Utilizare: npm run setup
// Fără întrebări (de ex. pe server): ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run setup
import readline from "node:readline";
import { loadEnv, readConfig } from "../src/config.js";
import { openDb } from "../src/db.js";
import { hashPassword, passwordProblem } from "../src/security.js";

loadEnv();
const config = readConfig();
const db = openDb(config.dbPath);

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = function (s) { if (s.includes(question)) rl.output.write(s); else rl.output.write("*"); };
    }
    rl.question(question, (answer) => { rl.close(); if (hidden) process.stdout.write("\n"); resolve(answer.trim()); });
  });
}

const email = process.env.ADMIN_EMAIL || await ask("E-mail administrator: ");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { console.error("E-mail invalid."); process.exit(1); }

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await ask("Parolă (min. 10 caractere, litere și cifre): ", { hidden: true });
  const again = await ask("Repetă parola: ", { hidden: true });
  if (password !== again) { console.error("Parolele nu coincid."); process.exit(1); }
}
const problem = passwordProblem(password);
if (problem) { console.error(problem); process.exit(1); }

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
if (existing) {
  db.prepare("UPDATE admins SET pass_hash = ?, failed = 0, locked_until = 0 WHERE id = ?").run(hashPassword(password), existing.id);
  db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(existing.id);
  console.log(`Parola pentru ${email} a fost schimbată.`);
} else {
  db.prepare("INSERT INTO admins(email, pass_hash) VALUES (?, ?)").run(email, hashPassword(password));
  console.log(`Contul ${email} a fost creat. Pornește serverul cu: npm start`);
}
db.close();
