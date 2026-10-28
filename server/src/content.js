// Conținutul editabil al site-ului: valorile implicite și validarea.

export const ART_KEYS = ["road", "att", "flow", "exam", "vip", "afyze"];
export const SIZES = ["w5", "w7", "w12"];
export const FILTERS = ["web", "auto", "app"];
export const PLAN_IDS = ["start", "business", "pro"];

export const DEFAULT_CONTENT = {
  contact: { email: "hello@afyze.com", phone: "", city: "Chișinău, Moldova" },
  announcement: { enabled: false, text: "" },
  urgentNote: "Ai nevoie urgent? Se poate și în câteva zile, discutăm termenul și costul. Toate pachetele includ 14 zile de suport gratuit după lansare; mentenanța lunară, de la 800 MDL/lună.",
  plans: [
    { id: "start", name: "Start", price: "5.000", term: "Gata în aproximativ 1 săptămână",
      features: ["Site de o pagină (landing)", "Șablon adaptat la brand", "Formular de contact și hartă", "Versiune mobilă", "1 limbă", "Certificat SSL și instalare", "2 runde de modificări"] },
    { id: "business", name: "Business", price: "7.000", term: "Gata în aproximativ 2 săptămâni",
      features: ["Până la 5 pagini", "Design personalizat", "Formular de contact și hartă", "Versiune mobilă", "1 limbă", "SEO de bază", "Certificat SSL și instalare", "2 runde de modificări"] },
    { id: "pro", name: "Pro", price: "10.500", term: "Gata în 3–4 săptămâni",
      features: ["Până la 10 pagini", "Design personalizat", "Formular de contact și hartă", "Versiune mobilă", "2 limbi (RO + RU/EN)", "SEO de bază", "Certificat SSL și instalare", "2 runde de modificări"] }
  ],
  projects: [
    { id: "roadfix", title: "RoadFix", category: "Aplicație iOS · Lider de echipă", filter: "app", art: "road", size: "w12", visible: true,
      link: "https://github.com/Afyze/RoadFix", tags: ["SwiftUI", "MapKit", "CoreLocation", "Firebase"],
      description: "Cetățenii raportează gropi, felinare stricate și trotuare deteriorate cu poză și locație. Sesizările apar pe o hartă live, iar angajații primăriei urmăresc fiecare caz până la rezolvare. Am condus o echipă de patru oameni." },
    { id: "prezenta", title: "Evidența prezenței la instruiri", category: "Automatizare", filter: "auto", art: "att", size: "w7", visible: true,
      link: "", tags: ["Apps Script", "Zoom API", "Sheets", "Drive"],
      description: "Un sistem care citește zilnic rapoartele Zoom, potrivește participanții după e-mail, calculează orele și marchează prezența la pragul de 80%. Cerințe diferite pentru fiecare categorie de participanți și statistici globale." },
    { id: "flowscript", title: "FlowScript DSL", category: "Limbaj de programare · Lead developer", filter: "app", art: "flow", size: "w5", visible: true,
      link: "", tags: ["Python", "LL(1)", "CLI"],
      description: "Un limbaj declarativ care adună date din mai multe surse într-una singură. Am scris lexer-ul, parser-ul, arborele sintactic și interfața în linie de comandă." },
    { id: "examen", title: "Aplicații de pregătire pentru examen", category: "Aplicație web", filter: "web", art: "exam", size: "w5", visible: true,
      link: "", tags: ["HTML / JS", "localStorage"],
      description: "Site-uri de studiu cu sute de întrebări, navigare pe capitole și un mod care repetă întrebările greșite până le înveți. Progresul se salvează în browser." },
    { id: "vip", title: "Bilete VIP pentru eveniment", category: "Automatizare · Design", filter: "auto", art: "vip", size: "w7", visible: true,
      link: "", tags: ["Python", "Playwright", "QR"],
      description: "Bilete cu cod QR unic pentru o prezentare de produs, generate și exportate în PDF gata de tipar dintr-o singură rulare." },
    { id: "afyze", title: "Afyze", category: "Identitate și site", filter: "web", art: "afyze", size: "w12", visible: true,
      link: "", tags: ["HTML / CSS", "GSAP", "Lenis", "Node.js"],
      description: "Acest site: identitate vizuală, template-uri demo, animații fluide, backend propriu și panou de administrare." }
  ]
};

// ---------- validare ----------
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function text(v, field, max, { required = false, multiline = false } = {}) {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") throw new Error(`${field}: trebuie să fie text`);
  v = v.trim();
  if (required && !v) throw new Error(`${field}: câmp obligatoriu`);
  if (v.length > max) throw new Error(`${field}: maximum ${max} caractere`);
  if (CTRL.test(v) || (!multiline && /[\r\n]/.test(v))) throw new Error(`${field}: conține caractere nepermise`);
  return v;
}

function list(v, field, maxItems, maxLen) {
  if (!Array.isArray(v)) throw new Error(`${field}: trebuie să fie o listă`);
  if (v.length > maxItems) throw new Error(`${field}: maximum ${maxItems} elemente`);
  return v.map((x, i) => text(x, `${field}[${i + 1}]`, maxLen, { required: true }));
}

/** Validează și normalizează conținutul trimis din panou. Aruncă Error cu mesaj în română. */
export function validateContent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Conținut invalid");
  const c = input.contact || {};
  const email = text(c.email, "contact.email", 120, { required: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("contact.email: adresă invalidă");
  const out = {
    contact: { email, phone: text(c.phone, "contact.phone", 40), city: text(c.city, "contact.city", 80) },
    announcement: {
      enabled: Boolean(input.announcement && input.announcement.enabled),
      text: text(input.announcement && input.announcement.text, "announcement.text", 160)
    },
    urgentNote: text(input.urgentNote, "urgentNote", 400),
    plans: [],
    projects: []
  };
  if (out.announcement.enabled && !out.announcement.text) throw new Error("announcement.text: scrie textul anunțului");

  if (!Array.isArray(input.plans) || input.plans.length !== 3) throw new Error("plans: trebuie să fie exact 3 pachete");
  for (const id of PLAN_IDS) {
    const p = input.plans.find((x) => x && x.id === id);
    if (!p) throw new Error(`plans: lipsește pachetul ${id}`);
    const price = text(p.price, `${id}.price`, 12, { required: true });
    if (!/^[0-9][0-9 .,]*$/.test(price)) throw new Error(`${id}.price: doar cifre (ex. 7.000)`);
    out.plans.push({
      id,
      name: text(p.name, `${id}.name`, 30, { required: true }),
      price,
      term: text(p.term, `${id}.term`, 60, { required: true }),
      features: list(p.features || [], `${id}.features`, 14, 80)
    });
  }

  if (!Array.isArray(input.projects)) throw new Error("projects: trebuie să fie o listă");
  if (input.projects.length > 30) throw new Error("projects: maximum 30 de proiecte");
  const ids = new Set();
  input.projects.forEach((p, i) => {
    const n = `proiect ${i + 1}`;
    if (!p || typeof p !== "object") throw new Error(`${n}: invalid`);
    let id = text(p.id, `${n}.id`, 40) || `p${Date.now().toString(36)}${i}`;
    id = id.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (ids.has(id)) throw new Error(`${n}: id duplicat`);
    ids.add(id);
    const link = text(p.link, `${n}.link`, 300);
    if (link && !/^https:\/\/[^\s"'<>]+$/.test(link)) throw new Error(`${n}.link: trebuie să înceapă cu https://`);
    if (!ART_KEYS.includes(p.art)) throw new Error(`${n}.art: ilustrație necunoscută`);
    if (!SIZES.includes(p.size)) throw new Error(`${n}.size: mărime necunoscută`);
    if (!FILTERS.includes(p.filter)) throw new Error(`${n}.filter: categorie necunoscută`);
    out.projects.push({
      id,
      title: text(p.title, `${n}.title`, 80, { required: true }),
      category: text(p.category, `${n}.category`, 80),
      description: text(p.description, `${n}.description`, 600, { required: true, multiline: true }),
      tags: list(p.tags || [], `${n}.tags`, 8, 30),
      link, art: p.art, size: p.size, filter: p.filter,
      visible: p.visible !== false
    });
  });
  return out;
}
