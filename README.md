# afyze.com

Site-ul Afyze: 6 pagini + 4 template-uri demo. Fără build, fără dependențe externe în afară de Google Fonts.

```
index.html          Acasă
servicii.html       Servicii
portofoliu.html     Portofoliu
templateuri.html    Template-uri (previzualizări live)
pachete.html        Pachete, comparație, întrebări frecvente
contact.html        Contact (formularul deschide e-mailul spre hello@afyze.com)
templates/          lex.html · ember.html · atelier.html · nord.html
assets/css/site.css stiluri comune
assets/js/site.js   animații, tranziții, cursor, filtre, formular
assets/vendor/      GSAP, ScrollTrigger, Lenis (incluse local)
```

## Publicare pe GitHub Pages

1. Creează un repo nou și urcă **tot conținutul acestui folder** în rădăcina lui (cu tot cu folderele `assets` și `templates`).
2. Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)` → Save.
3. În 1–2 minute site-ul e live.

## Domeniul afyze.com

Adaugă un fișier `CNAME` în rădăcina repo-ului cu textul `afyze.com` (sau Settings → Pages → Custom domain). Apoi, la registrarul domeniului, în DNS:

| Tip   | Nume | Valoare         |
|-------|------|-----------------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| CNAME | www  | afyze.github.io |

Apoi Settings → Pages → bifează **Enforce HTTPS**.

## Ce modifici ușor

- **Prețuri** — `pachete.html` (cardurile și tabelul) și `contact.html` (opțiunile de pachet).
- **E-mail** — variabila `EMAIL` din `assets/js/site.js` și linkurile `mailto:` din pagini.
- **Proiecte** — `portofoliu.html`, fiecare `<article class="case">`.
- **Template nou** — copiezi un fișier din `templates/`, îl modifici și adaugi un card în `templateuri.html`.

## Note

- Animațiile se dezactivează automat pentru cei care au setat „reducere mișcare” în sistem.
- Dacă JavaScript nu se încarcă, tot conținutul rămâne vizibil.
- Datele din template-uri (nume, adrese, telefoane, prețuri) sunt fictive.
