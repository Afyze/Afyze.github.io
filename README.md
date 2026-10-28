# afyze.com

Site-ul Afyze: 6 pagini, 4 template-uri demo și un backend propriu cu panou de administrare.

```
index.html, servicii.html, portofoliu.html, templateuri.html, pachete.html, contact.html
templates/            4 site-uri demo (lex, ember, atelier, nord)
admin/                panoul de administrare (funcționează doar cu backend-ul pornit)
assets/js/config.js   adresa backend-ului (gol = același domeniu)
assets/js/api.js      legătura site ↔ backend
server/               backend: Node.js + Express + SQLite
```

## Cum funcționează

| Unde rulează site-ul | Formular | Panou admin | Conținut editabil | Statistici |
|---|---|---|---|---|
| GitHub Pages (afyze.github.io) | deschide e-mailul | — | conținutul din HTML | — |
| Cu backend pornit (`npm start`) | salvat + notificare e-mail | da | da, din panou | da |

Site-ul verifică singur dacă backend-ul răspunde (`/api/health`). Dacă nu, rămâne varianta statică, fără erori.

## Pornirea backend-ului pe computerul tău

Ai nevoie de **Node.js 22.13 sau mai nou** (nodejs.org).

```bash
cd server
npm install
npm run setup     # creezi contul de administrator (o singură dată)
npm start         # pornește site-ul + backend-ul
```

Apoi deschide:
- site-ul: http://localhost:3000
- panoul: http://localhost:3000/admin/

Opțional, pentru notificări pe e-mail la fiecare cerere: copiază `server/.env.example` ca `server/.env` și completează `SMTP_*`.

Testele automate: `cd server && npm test`.

## Ce face backend-ul

- **Formular de contact**: validare pe server, câmp-capcană și verificare de timp împotriva roboților, limită de 5 mesaje / 15 minute pe IP, mesajele cu multe linkuri merg la spam, notificare pe e-mail.
- **Panou de administrare**: cereri cu status (nouă, în lucru, câștigată, pierdută, spam), notițe, căutare, export CSV; editarea pachetelor, prețurilor, proiectelor, datelor de contact și a unui anunț pe site; statistici; schimbarea parolei; jurnal de activitate.
- **Statistici fără cookie-uri**: nu se salvează IP-ul, ci un identificator anonim care se schimbă zilnic. Roboții și vizitatorii cu „Do Not Track” nu sunt numărați.

## Securitate

- Parole stocate cu **scrypt** (sare unică), comparații în timp constant, aceeași eroare pentru e-mail sau parolă greșită.
- Blocare **15 minute** după 5 parole greșite + limită de încercări pe IP.
- Sesiuni în cookie **HttpOnly, SameSite=Strict** (și `Secure` în producție), stocate doar ca hash, expiră după 8 ore.
- **Token CSRF** obligatoriu pentru orice modificare; cererile de pe alte site-uri sunt refuzate.
- **CORS** doar pentru site-urile din `ALLOWED_ORIGINS`.
- Antete: **Content-Security-Policy** strictă (fără scripturi inline), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS în producție.
- Pe GitHub Pages (unde nu se pot seta antete), CSP și Referrer-Policy sunt puse prin `<meta>` în fiecare pagină.
- Toate datele venite de la vizitatori se afișează doar ca text, niciodată ca HTML (protecție XSS); interogări SQL parametrizate; export CSV protejat împotriva formulelor.
- Codul serverului, fișierele ascunse și baza de date nu sunt servite niciodată. `server/.env` și `server/data/` nu se urcă pe GitHub.
- `/.well-known/security.txt` pentru raportarea problemelor de securitate.

## Publicarea backend-ului (mai târziu)

Backend-ul rulează pe orice hosting cu Node.js (un VPS, Render, Railway, Fly.io etc.):
1. Variabile: `NODE_ENV=production`, `TRUST_PROXY=true` (dacă e în spatele unui proxy), `ALLOWED_ORIGINS`, `SMTP_*`.
2. `npm install --omit=dev`, `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run setup`, apoi `npm start`.
3. Pune adresa lui în `assets/js/config.js` (de ex. `https://api.afyze.com`). Subdomeniile `*.afyze.com` sunt deja permise în CSP.

## GitHub Pages și domeniul afyze.com

Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)`.
Pentru domeniu: Settings → Pages → Custom domain `afyze.com`, iar la registrar, în DNS:

| Tip   | Nume | Valoare         |
|-------|------|-----------------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| CNAME | www  | afyze.github.io |

Apoi bifează **Enforce HTTPS**.

## Note

- Animațiile se opresc automat pentru cei care au setat „reducere mișcare” în sistem; dacă JavaScript nu se încarcă, tot conținutul rămâne vizibil.
- Datele din template-uri (nume, adrese, telefoane, prețuri) sunt fictive.
