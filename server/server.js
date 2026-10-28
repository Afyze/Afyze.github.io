// Pornește serverul Afyze: site + API + panou de administrare.
import { loadEnv, readConfig } from "./src/config.js";
import { openDb } from "./src/db.js";
import { createMailer } from "./src/mailer.js";
import { createApp } from "./src/app.js";

loadEnv();
const config = readConfig();
const db = openDb(config.dbPath);
const mailer = createMailer(config.mail);
const app = createApp({ db, config, mailer });

const admins = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;

const server = app.listen(config.port, config.host, () => {
  const url = `http://${config.host === "0.0.0.0" ? "localhost" : config.host}:${config.port}`;
  console.log(`\n  Afyze rulează la ${url}`);
  console.log(`  Panou de administrare: ${url}/admin/`);
  console.log(`  Notificări e-mail: ${mailer.enabled ? "active" : "dezactivate (completează SMTP_* în server/.env)"}`);
  if (!admins) console.log("\n  ⚠  Nu există încă un cont de administrator. Rulează: npm run setup\n");
});

function shutdown() {
  server.close(() => { db.close(); process.exit(0); });
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
