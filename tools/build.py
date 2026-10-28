# Generează paginile site-ului Afyze dintr-un layout comun.
import os, sys
OUT = sys.argv[1]

LOGO = '''<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="19.25" stroke="currentColor" stroke-opacity=".3"/><path d="M11.5 28.5c8.5-1 14.5-8.2 16.8-17.5-9.4 2.1-15.9 8.4-16.8 17.5z" fill="#cdb88a"/><path d="M11.5 28.5c4-5.2 8.3-9.2 12.8-12.4" stroke="#0e1d17" stroke-width="1.3" stroke-linecap="round"/></svg>'''
ARROW = '<svg class="arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 8h12.5M9.5 3.5 14 8l-4.5 4.5"/></svg>'
PLUS = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M9 2v14M2 9h14"/></svg>'

CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; "
       "connect-src 'self' http://localhost:3000 http://127.0.0.1:3000 https://*.afyze.com; "
       "frame-src 'self'; form-action 'self' mailto:; base-uri 'self'; object-src 'none'")

PAGES = [("index.html","Acasă"),("servicii.html","Servicii"),("portofoliu.html","Portofoliu"),("templateuri.html","Template-uri"),("pachete.html","Pachete"),("contact.html","Contact")]

def head(title, desc, extra_css=""):
    return f'''<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0e1d17">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<script src="assets/js/boot.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
{('<style>'+extra_css+'</style>') if extra_css else ''}
</head>'''

def header(active):
    cur = ' aria-current="page"'
    links = "".join(f'<a href="{f}"{cur if f==active else ""}>{n}</a>' for f,n in PAGES)
    big = "".join(f'<a class="big" href="{f}"><span>{n}</span></a>' for f,n in PAGES)
    return f'''<body>
<a class="skip" href="#main">Sari la conținut</a>
<div class="curtain" aria-hidden="true"><div class="panel gold"></div><div class="panel"></div><div class="mark">{LOGO}<span class="count"></span></div></div>
<div class="cursor" aria-hidden="true"><span>Vezi</span></div><div class="cursor-dot" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<header class="header">
  <div class="container">
    <a class="logo" href="index.html" aria-label="Afyze — Acasă">{LOGO}<span>Afyze</span></a>
    <nav class="nav" aria-label="Principal">{links}</nav>
    <a class="langsw" href="ru/{active}" lang="ru" hreflang="ru" aria-label="Версия на русском">RU</a>
    <a class="btn btn-gold" href="contact.html" data-magnetic=".25"><span>Discută un proiect</span></a>
    <button class="burger" type="button" aria-label="Meniu" aria-expanded="false"><i></i><i></i></button>
  </div>
</header>
<div class="mmenu" aria-label="Meniu mobil">
  {big}
  <div class="foot"><a href="mailto:hello@afyze.com">hello@afyze.com</a><a data-msg="telegram" hidden>Telegram</a><a data-msg="viber" hidden>Viber</a><a class="langsw-m" href="ru/{active}" lang="ru" hreflang="ru">Русский</a><span>Chișinău, Moldova</span></div>
</div>
<main id="main">'''

CTA = f'''
<section class="cta-big">
  <div class="glow a" aria-hidden="true"></div><div class="glow b" aria-hidden="true"></div>
  <div class="container">
    <p class="kicker" style="justify-content:center" data-reveal>Următorul pas</p>
    <h2 class="display display-l" data-lines><span class="line"><span>Hai să construim</span></span><span class="line"><span>ceva remarcabil.</span></span></h2>
    <a class="mail link-u" href="mailto:hello@afyze.com" data-mail data-subject="Proiect nou" data-cursor="Scrie" data-reveal>hello@afyze.com</a>
  </div>
</section>'''

def footer(cta=True):
    pages = "".join(f'<li><a class="link-u" href="{f}">{n}</a></li>' for f,n in PAGES)
    return f'''{CTA if cta else ""}
</main>
<footer class="footer">
  <div class="container">
    <div class="cols">
      <div>
        <a class="logo" href="index.html">{LOGO}<span>Afyze</span></a>
        <p class="small" style="max-width:34ch;margin-top:20px">Site-uri și automatizări pentru afaceri din Moldova. Termene clare, plata la predare.</p>
      </div>
      <div><h4>Pagini</h4><ul>{pages}</ul></div>
      <div><h4>Servicii</h4><ul>
        <li><a class="link-u" href="servicii.html#web">Site-uri web</a></li>
        <li><a class="link-u" href="servicii.html#automatizari">Automatizări</a></li>
        <li><a class="link-u" href="servicii.html#aplicatii">Aplicații</a></li></ul></div>
      <div><h4>Contact</h4><ul>
        <li><a class="link-u" href="mailto:hello@afyze.com" data-mail>hello@afyze.com</a></li>
        <li data-msg-wrap hidden><a class="link-u" data-msg="telegram" hidden>Telegram</a></li>
        <li data-msg-wrap hidden><a class="link-u" data-msg="viber" hidden>Viber</a></li>
        <li><a class="link-u" href="https://github.com/Afyze" target="_blank" rel="noopener">GitHub</a></li>
        <li>Chișinău, Moldova</li></ul></div>
    </div>
    <p class="huge" aria-hidden="true" data-reveal>afyze</p>
    <div class="bottom"><span>© <span data-year>2026</span> Afyze. Toate drepturile rezervate.</span><a class="link-u" href="#main">Înapoi sus ↑</a></div>
  </div>
</footer>
<div class="toast" role="status" aria-live="polite"></div>
<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/vendor/lenis.min.js"></script>
<script src="assets/js/config.js"></script>
<script src="assets/js/api.js"></script>
<script src="assets/js/site.js"></script>
</body>
</html>
'''

def lines(*parts, tag="h1", cls="display display-l", kind=""):
    inner = "".join(f'<span class="line"><span>{p}</span></span>' for p in parts)
    k = f'="{kind}"' if kind else ""
    return f'<{tag} class="{cls}" data-lines{k}>{inner}</{tag}>'

def page_hero(kicker, title_lines, lead, meta_right=""):
    return f'''
<section class="page-hero">
  <div class="glow a" aria-hidden="true"></div>
  <div class="container">
    <p class="kicker" data-reveal data-hero-reveal>{kicker}</p>
    {lines(*title_lines, kind="hero", cls="display display-xl")}
    <div class="meta">
      <p class="lead" data-reveal data-hero-reveal>{lead}</p>
      {meta_right}
    </div>
  </div>
</section>'''

# ---------------- Artă SVG pentru proiecte ----------------
ART = {
"road": '''<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="800" height="600" fill="#132a20"/>
<g stroke="#2c5240" stroke-width="1" fill="none">
<path d="M-20 140 L820 90M-20 300 L820 330M-20 470 L820 420M120 -20 L180 620M330 -20 L300 620M520 -20 L560 620M690 -20 L660 620"/>
<path d="M-20 220 Q300 260 820 200" stroke-width="10" stroke="#1b3a2c"/>
<path d="M260 -20 Q240 300 420 620" stroke-width="10" stroke="#1b3a2c"/></g>
<g fill="none" stroke="#cdb88a"><circle cx="430" cy="270" r="60" stroke-opacity=".25"/><circle cx="430" cy="270" r="110" stroke-opacity=".12"/></g>
<g fill="#cdb88a"><path d="M430 210c-22 0-38 16-38 37 0 28 38 62 38 62s38-34 38-62c0-21-16-37-38-37z"/><circle cx="430" cy="247" r="12" fill="#132a20"/></g>
<g fill="#9fd0a6"><circle cx="180" cy="160" r="6"/><circle cx="610" cy="380" r="6"/><circle cx="330" cy="440" r="6"/><circle cx="660" cy="150" r="6"/></g>
</svg>''',
"att": '''<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="800" height="600" fill="#e8e1d3"/>
<rect x="130" y="110" width="540" height="380" rx="10" fill="#f6f2ea" stroke="#13281f" stroke-opacity=".12"/>
<rect x="130" y="110" width="540" height="46" rx="10" fill="#13281f"/>
<g fill="#cdb88a"><circle cx="156" cy="133" r="5"/><circle cx="174" cy="133" r="5" opacity=".6"/><circle cx="192" cy="133" r="5" opacity=".35"/></g>
<g font-family="Georgia,serif" font-size="15" fill="#13281f">
<g opacity=".8"><rect x="160" y="190" width="120" height="10" rx="5" fill="#13281f" opacity=".15"/><rect x="330" y="190" width="200" height="10" rx="5" fill="#2f6a4c"/><rect x="560" y="184" width="80" height="22" rx="11" fill="#2f6a4c" opacity=".15"/></g>
<g opacity=".8"><rect x="160" y="250" width="100" height="10" rx="5" fill="#13281f" opacity=".15"/><rect x="330" y="250" width="170" height="10" rx="5" fill="#2f6a4c"/><rect x="560" y="244" width="80" height="22" rx="11" fill="#2f6a4c" opacity=".15"/></g>
<g opacity=".8"><rect x="160" y="310" width="130" height="10" rx="5" fill="#13281f" opacity=".15"/><rect x="330" y="310" width="90" height="10" rx="5" fill="#b07a5c"/><rect x="560" y="304" width="80" height="22" rx="11" fill="#b07a5c" opacity=".18"/></g>
<g opacity=".8"><rect x="160" y="370" width="110" height="10" rx="5" fill="#13281f" opacity=".15"/><rect x="330" y="370" width="200" height="10" rx="5" fill="#2f6a4c"/><rect x="560" y="364" width="80" height="22" rx="11" fill="#2f6a4c" opacity=".15"/></g>
<g opacity=".8"><rect x="160" y="430" width="90" height="10" rx="5" fill="#13281f" opacity=".15"/><rect x="330" y="430" width="150" height="10" rx="5" fill="#cdb88a"/><rect x="560" y="424" width="80" height="22" rx="11" fill="#cdb88a" opacity=".25"/></g></g>
</svg>''',
"flow": '''<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="800" height="600" fill="#0f2019"/>
<g transform="translate(90 120)">
<rect width="70" height="12" rx="6" fill="#cdb88a"/><rect x="82" width="120" height="12" rx="6" fill="#9fd0a6" opacity=".7"/>
<rect x="30" y="34" width="90" height="12" rx="6" fill="#f2ede3" opacity=".25"/><rect x="132" y="34" width="60" height="12" rx="6" fill="#cdb88a" opacity=".6"/>
<rect x="30" y="68" width="150" height="12" rx="6" fill="#f2ede3" opacity=".25"/>
<rect x="30" y="102" width="60" height="12" rx="6" fill="#9fd0a6" opacity=".7"/><rect x="102" y="102" width="110" height="12" rx="6" fill="#f2ede3" opacity=".25"/>
<rect y="136" width="40" height="12" rx="6" fill="#cdb88a"/>
<rect y="190" width="90" height="12" rx="6" fill="#cdb88a"/><rect x="102" y="190" width="80" height="12" rx="6" fill="#9fd0a6" opacity=".7"/>
<rect x="30" y="224" width="170" height="12" rx="6" fill="#f2ede3" opacity=".25"/>
<rect x="30" y="258" width="120" height="12" rx="6" fill="#f2ede3" opacity=".25"/></g>
<g stroke="#cdb88a" stroke-opacity=".5" fill="none" stroke-width="1.2"><path d="M560 170 L480 280M560 170 L640 280M480 280 L430 390M480 280 L530 390M640 280 L640 390"/></g>
<g fill="#13281f" stroke="#cdb88a" stroke-width="1.4"><circle cx="560" cy="170" r="18"/><circle cx="480" cy="280" r="15"/><circle cx="640" cy="280" r="15"/><circle cx="430" cy="390" r="12"/><circle cx="530" cy="390" r="12"/><circle cx="640" cy="390" r="12"/></g>
<circle cx="560" cy="170" r="6" fill="#cdb88a"/>
</svg>''',
"exam": '''<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="800" height="600" fill="#e8e1d3"/>
<g transform="rotate(-6 400 300)"><rect x="210" y="150" width="380" height="300" rx="14" fill="#d9d0bf"/></g>
<g transform="rotate(3 400 300)"><rect x="210" y="150" width="380" height="300" rx="14" fill="#efe9dd"/></g>
<rect x="210" y="150" width="380" height="300" rx="14" fill="#fbf8f2" stroke="#13281f" stroke-opacity=".1"/>
<rect x="244" y="184" width="200" height="12" rx="6" fill="#13281f" opacity=".75"/><rect x="244" y="206" width="140" height="12" rx="6" fill="#13281f" opacity=".3"/>
<g><rect x="244" y="248" width="312" height="38" rx="19" fill="none" stroke="#13281f" stroke-opacity=".15"/><circle cx="268" cy="267" r="7" fill="none" stroke="#13281f" stroke-opacity=".4"/><rect x="286" y="262" width="150" height="10" rx="5" fill="#13281f" opacity=".2"/></g>
<g><rect x="244" y="298" width="312" height="38" rx="19" fill="#2f6a4c"/><circle cx="268" cy="317" r="7" fill="#cdb88a"/><rect x="286" y="312" width="180" height="10" rx="5" fill="#f2ede3" opacity=".8"/></g>
<g><rect x="244" y="348" width="312" height="38" rx="19" fill="none" stroke="#13281f" stroke-opacity=".15"/><circle cx="268" cy="367" r="7" fill="none" stroke="#13281f" stroke-opacity=".4"/><rect x="286" y="362" width="120" height="10" rx="5" fill="#13281f" opacity=".2"/></g>
<rect x="244" y="410" width="220" height="6" rx="3" fill="#13281f" opacity=".1"/><rect x="244" y="410" width="140" height="6" rx="3" fill="#cdb88a"/>
</svg>''',
"vip": '''<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><linearGradient id="gt" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e6d6ad"/><stop offset="1" stop-color="#a88c58"/></linearGradient></defs>
<rect width="800" height="600" fill="#0f2019"/>
<g transform="rotate(-8 400 300)">
<path d="M150 200h500a0 0 0 0 1 0 0v70a30 30 0 0 0 0 60v70H150v-70a30 30 0 0 0 0-60z" fill="url(#gt)"/>
<path d="M520 205v190" stroke="#0f2019" stroke-width="2" stroke-dasharray="6 8" opacity=".5"/>
<text x="190" y="270" font-family="Georgia,serif" font-size="46" fill="#13281f">VIP</text>
<rect x="190" y="300" width="200" height="10" rx="5" fill="#13281f" opacity=".45"/><rect x="190" y="322" width="140" height="10" rx="5" fill="#13281f" opacity=".25"/>
<g fill="#13281f" transform="translate(548 255)">
<rect width="24" height="24"/><rect x="48" width="24" height="24"/><rect y="48" width="24" height="24"/>
<rect x="30" y="10" width="8" height="8"/><rect x="30" y="30" width="12" height="8"/><rect x="10" y="30" width="8" height="12"/><rect x="50" y="34" width="8" height="8"/><rect x="34" y="52" width="8" height="12"/><rect x="52" y="52" width="16" height="8"/><rect x="60" y="64" width="8" height="8"/></g></g>
</svg>''',
"afyze": '''<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><radialGradient id="ga" cx=".7" cy=".3" r=".8"><stop offset="0" stop-color="#2f5a44"/><stop offset="1" stop-color="#0e1d17"/></radialGradient></defs>
<rect width="800" height="600" fill="url(#ga)"/>
<circle cx="400" cy="300" r="170" fill="none" stroke="#cdb88a" stroke-opacity=".3"/>
<circle cx="400" cy="300" r="120" fill="none" stroke="#cdb88a" stroke-opacity=".15"/>
<path d="M330 380c58-7 99-56 115-120-64 14-109 58-115 120z" fill="#cdb88a"/>
<path d="M330 380c27-35 57-63 87-84" stroke="#0e1d17" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>''',
}

def case(art, title, cat, desc, cls="", data_cat="", href=None, tags=()):
    link_open = f'<a href="{href}" target="_blank" rel="noopener" data-cursor="GitHub">' if href else '<div>'
    link_close = '</a>' if href else '</div>'
    t = "".join(f'<span class="tag">{x}</span>' for x in tags)
    return f'''<article class="case {cls}" data-cat="{data_cat}">
  {link_open}<div class="frame" data-clip><div class="inner"><div class="art">{ART[art]}</div></div></div>{link_close}
  <div class="info"><h3>{title}</h3><span class="cat">{cat}</span></div>
  <p>{desc}</p>
  {('<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">'+t+'</div>') if t else ''}
</article>'''

TEMPLATES = [
 ("lex","Lex","Cabinet de avocat","juridic","Editorial și clasic, ca o publicație juridică: frontispiciu, text pe coloane, cuprins interactiv al domeniilor și formular sub formă de scrisoare.","lex.afyze.com"),
 ("ember","Ember","Restaurant","restaurant","Întunecat și îndrăzneț: tipografie uriașă, meniu cu „fotografia” care urmărește cursorul și bară de rezervare mereu la îndemână.","ember.afyze.com"),
 ("atelier","Atelier","Salon de frumusețe","beauty","Jucăuș, în culori pastelate, construit din plăci: programare rapidă direct pe prima pagină și servicii pe categorii.","atelier.afyze.com"),
 ("nord","Nord Dental","Clinică stomatologică","medical","Ca o aplicație: meniu lateral, recomandare după ce te deranjează și programare în patru pași, cu medic, zi și oră.","nord.afyze.com"),
 ("forja","Forja","Sală de sport","fitness","Brutalist și energic: negru și galben, orar al claselor pe zile și niveluri, abonamente lunare sau anuale.","forja.afyze.com"),
 ("casa","Casa Verde","Ansamblu rezidențial","imobiliare","Arhitectural și precis: clădire interactivă pe etaje, filtru de apartamente și calculator de credit ipotecar.","casaverde.afyze.com"),
]

def tpl(slug, name, cat, data_cat, desc, url, show_actions=True, extra_cls=""):
    actions = f'''<div style="display:flex;flex-wrap:wrap;gap:22px;margin-top:18px;font-size:15px">
    <a class="link-u" href="templates/{slug}/index.html" target="_blank" rel="noopener">Deschide demo ↗</a>
    <a class="link-u" style="color:var(--champagne)" href="mailto:hello@afyze.com" data-mail data-subject="Vreau template-ul {name}" data-body="Bună ziua,&#10;&#10;Mă interesează template-ul {name} ({cat}) pentru afacerea mea.&#10;&#10;Numele afacerii:&#10;Telefon:&#10;">Vreau acest design</a></div>''' if show_actions else ""
    return f'''<article class="tpl {extra_cls}" data-cat="{data_cat}">
  <a href="templates/{slug}/index.html" target="_blank" rel="noopener" data-cursor="Demo" aria-label="Deschide demo {name}">
    <div class="screen" data-clip><div class="inner"><div class="bar"><i></i><i></i><i></i><span>{url}</span></div>
    <div class="viewport"><img src="assets/img/tpl-{slug}.jpg?v=4" alt="Previzualizare template {name}" width="1440" height="900" loading="lazy" decoding="async"></div></div></div>
  </a>
  <div class="info"><h3>{name}</h3><span class="cat">{cat}</span></div>
  <p class="small" style="margin:8px 0 0;max-width:52ch">{desc}</p>
  {actions}
</article>'''

# ======================= ACASĂ =======================
home_css = '''
.home-hero{min-height:100vh;min-height:100svh;display:flex;align-items:flex-end;padding:150px 0 48px;overflow:hidden}
.hero-art{position:absolute;right:-8vw;top:50%;margin-top:-34vw;width:68vw;max-width:980px;aspect-ratio:1;pointer-events:none}
@media (min-width:1440px){.hero-art{margin-top:-490px}}
.orb{position:absolute;border-radius:50%;will-change:transform}
.o1{inset:20%;background:radial-gradient(circle at 40% 40%,rgba(205,184,138,.42),transparent 62%);animation:d1 20s ease-in-out infinite}
.o2{inset:30% 6% 6% 34%;background:radial-gradient(circle,rgba(56,120,88,.75) 0%,transparent 65%);animation:d2 26s ease-in-out infinite}
.o3{inset:8% 40% 52% 18%;background:radial-gradient(circle,rgba(230,214,173,.25) 0%,transparent 65%);animation:d3 30s ease-in-out infinite}
@keyframes d1{50%{transform:translate(4%,-6%) scale(1.08)}}
@keyframes d2{50%{transform:translate(-8%,4%) scale(.92)}}
@keyframes d3{50%{transform:translate(10%,8%) scale(1.15)}}
.ring{position:absolute;inset:14%;animation:spin 80s linear infinite}
.ring text{font-family:var(--sans);font-size:9.5px;letter-spacing:.42em;fill:var(--champagne);opacity:.75}
.ring2{position:absolute;inset:22%;border-radius:50%;border:1px solid rgba(205,184,138,.18)}
.leaf-big{position:absolute;left:36%;top:36%;width:28%;opacity:.9}
@keyframes spin{to{transform:rotate(360deg)}}
.hero-inner{position:relative;z-index:2}
.hero-bottom{display:grid;grid-template-columns:1fr auto;align-items:end;gap:32px;margin-top:48px}
.hero-bottom .ctas{display:flex;gap:12px;flex-wrap:wrap}
.hero-meta{display:flex;justify-content:space-between;gap:20px;margin-top:72px;padding-top:22px;border-top:1px solid var(--line);font-size:13.5px;color:var(--mist)}
.scroll-ind{display:flex;align-items:center;gap:12px}
.scroll-ind i{width:1px;height:28px;background:linear-gradient(var(--champagne),transparent);animation:sc 2.4s var(--ease) infinite;transform-origin:top}
@keyframes sc{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
.statement{font-family:var(--serif);font-size:clamp(30px,4vw,60px);line-height:1.15;letter-spacing:-.01em;margin:0;max-width:22ch}
.home-work .case .frame{aspect-ratio:5/4}
@media (max-width:900px){
 .hero-art{width:120vw;right:-50vw;top:6vh;margin-top:0;opacity:.6}
 .hero-bottom{grid-template-columns:1fr}
 .hero-meta{flex-wrap:wrap}
}'''

hero_ring = '''<div class="hero-art" aria-hidden="true">
  <div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>
  <div class="ring2"></div>
  <svg class="ring" viewBox="0 0 300 300"><defs><path id="circ" d="M150,150 m-128,0 a128,128 0 1,1 256,0 a128,128 0 1,1 -256,0"/></defs><text><textPath href="#circ">AFYZE ✦ STUDIO DIGITAL ✦ CHIȘINĂU ✦ SITE-URI ✦ AUTOMATIZĂRI ✦</textPath></text></svg>
  <svg class="leaf-big" viewBox="0 0 40 40" fill="none"><path d="M6 34C20 32 31 20 35 5 20 9 8 19 6 34z" stroke="#cdb88a" stroke-width=".5"/><path d="M6 34c7-9 15-16 23-22" stroke="#cdb88a" stroke-width=".5"/></svg>
</div>'''

svc_teaser = [
 ("web","01","Site-uri web","Site-uri de prezentare și landing page-uri, gândite întâi pentru telefon. Lansare în 1–2 săptămâni.",("WordPress","HTML / CSS","SEO")),
 ("automatizari","02","Automatizări","Rapoarte, prezențe și e-mailuri care se fac singure, în fiecare zi, fără greșeli.",("Apps Script","Zoom API","Python")),
 ("aplicatii","03","Aplicații","Aplicații web și iOS construite pentru un singur scop, bine făcut.",("SwiftUI","React","Firebase")),
]
def svc_row(anchor, num, title, desc, tags, href="servicii.html"):
    t="".join(f'<span class="tag">{x}</span>' for x in tags)
    return f'''<a class="svc-row" href="{href}#{anchor}" data-reveal>
  <span class="num">{num}</span><h3>{title}</h3>
  <div><p>{desc}</p><div class="tags">{t}</div></div>
  <span class="plus">{PLUS}</span></a>'''

home = head("Afyze — Site-uri elegante și automatizări","Studio digital din Chișinău: site-uri elegante și automatizări care lucrează singure. Plata la predare.", home_css) + header("index.html") + f'''
<section class="home-hero">
  {hero_ring}
  <div class="container hero-inner">
    <p class="kicker" data-reveal data-hero-reveal>Studio digital din Chișinău</p>
    {lines("Site-uri elegante,","automatizări care","lucrează singure.", kind="hero", cls="display display-l")}
    <div class="hero-bottom">
      <p class="lead" data-reveal data-hero-reveal>Construiesc site-uri care fac o primă impresie impecabilă și sisteme care îți dau înapoi orele pierdute cu munca repetitivă.</p>
      <div class="ctas" data-reveal data-hero-reveal>
        <a class="btn btn-gold" href="contact.html" data-magnetic=".3"><span>Începe un proiect</span>{ARROW}</a>
        <a class="btn btn-line" href="templateuri.html" data-magnetic=".3"><span>Vezi template-urile</span></a>
      </div>
    </div>
    <div class="hero-meta" data-reveal data-hero-reveal>
      <span class="scroll-ind"><i></i>Derulează</span><span>Lansare în 1–2 săptămâni</span><span>Plata 100% la predare</span><span>Română · Русский · English</span>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="track">
  {"".join(f"<span>{w}</span><em>✦</em>" for w in ["Site-uri de prezentare","Landing page","Automatizări","Aplicații iOS","Aplicații web","WordPress","Google Apps Script"]*2)}
</div></div>

<section class="sec">
  <div class="container">
    <p class="kicker" data-reveal>Filozofie</p>
    <p class="statement" data-words>Fiecare proiect pleacă de la o întrebare simplă: ce ar trebui să meargă singur, ca tu să te ocupi de ce contează cu adevărat?</p>
  </div>
</section>

<section class="sec-tight" style="padding-top:0">
  <div class="container">
    <div class="facts">
      <div class="fact" data-reveal><b>1–2</b><span>săptămâni durează de obicei un site de prezentare, de la discuție la lansare.</span></div>
      <div class="fact" data-reveal data-delay=".1"><b>0</b><span>lei avans. Vezi site-ul funcționând înainte să plătești.</span></div>
      <div class="fact" data-reveal data-delay=".2"><b>14</b><span>zile de suport gratuit după lansare, pentru orice ajustare.</span></div>
    </div>
  </div>
</section>

<section class="hscroll sec-tight">
  <div class="track">
    <div class="intro">
      <p class="kicker" data-reveal>Template-uri</p>
      {lines("Design-uri","gata de lansat.", tag="h2", cls="display display-m")}
      <p class="lead" style="margin-top:28px" data-reveal>Șase direcții vizuale complet diferite, fiecare cu interacțiunile ei, adaptate la brandul tău.</p>
      <a class="btn btn-line" style="margin-top:36px;align-self:flex-start" href="templateuri.html" data-reveal><span>Toate template-urile</span>{ARROW}</a>
    </div>
    {"".join(tpl(*t, show_actions=False) for t in TEMPLATES)}
  </div>
</section>

<section class="sec">
  <div class="container">
    <div class="head-row">
      <div><p class="kicker" data-reveal>Servicii</p>{lines("Ce pot face","pentru tine.", tag="h2", cls="display display-m")}</div>
      <p class="lead" data-reveal>Două meserii care se completează: un site care atrage clienți și sisteme care te scapă de munca de rutină.</p>
    </div>
    <div class="svc-list">{"".join(svc_row(*s) for s in svc_teaser)}</div>
  </div>
</section>

<section class="sec light home-work">
  <div class="container">
    <div class="head-row">
      <div><p class="kicker" data-reveal>Lucrări alese</p>{lines("Proiecte care","rezolvă ceva real.", tag="h2", cls="display display-m")}</div>
      <a class="btn btn-ink" style="justify-self:end" href="portofoliu.html" data-magnetic=".3" data-reveal><span>Tot portofoliul</span>{ARROW}</a>
    </div>
    <div class="work">
      {case("road","RoadFix","Aplicație iOS","Sesizări urbane cu poză și locație, pe o hartă live a orașului.", "w7", href="https://github.com/Afyze/RoadFix")}
      {case("att","Evidența prezenței","Automatizare","Rapoartele Zoom devin zilnic un tabel de prezență, fără nicio intervenție.", "w5 offset")}
    </div>
  </div>
</section>

<section class="sec light" style="padding-top:0">
  <div class="container">
    <div class="head-row">
      <div><p class="kicker" data-reveal>Proces</p>{lines("De la idee","la lansare.", tag="h2", cls="display display-m")}</div>
      <p class="lead" data-reveal>Un ritm clar, fără surprize. Un site de prezentare durează de obicei 1–2 săptămâni, iar dacă e urgent, se poate și mai repede.</p>
    </div>
    <div class="steps">
      <div class="step" data-reveal><span class="d">Etapa 1</span><h3>Discuție</h3><p>Afli prețul și termenul exact. Stabilim paginile și ce trebuie să facă site-ul.</p></div>
      <div class="step" data-reveal data-delay=".1"><span class="d">Etapa 2</span><h3>Machetă</h3><p>Vezi designul înainte de cod și alegem împreună direcția finală.</p></div>
      <div class="step" data-reveal data-delay=".2"><span class="d">Etapa 3</span><h3>Construire</h3><p>Site-ul prinde viață pe o adresă de test, unde îl poți urmări oricând.</p></div>
      <div class="step" data-reveal data-delay=".3"><span class="d">Etapa 4</span><h3>Lansare</h3><p>Două runde de corecturi, apoi îl publicăm pe domeniul tău.</p></div>
    </div>
  </div>
</section>
''' + footer()

# ======================= SERVICII =======================
svc_css = '''
.svc-detail{display:grid;grid-template-columns:90px 1fr 1fr;gap:32px;padding:64px 0;border-top:1px solid var(--line);scroll-margin-top:100px}
.svc-detail .num{font-family:var(--serif);color:var(--champagne);font-size:18px}
.svc-detail h2{font-family:var(--serif);font-weight:400;font-size:clamp(36px,4vw,64px);line-height:1;margin:0 0 22px}
.svc-detail .deliver{list-style:none;margin:0;padding:0;display:grid;gap:0}
.svc-detail .deliver li{padding:16px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:16px;font-size:16px}
.svc-detail .deliver li span{color:var(--mist);font-size:14px;text-align:right}
.auto-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.auto-item{background:var(--ivory);padding:32px 30px 34px;border:1px solid var(--line-dark);border-radius:8px;transition:background .6s var(--ease),transform .8s var(--ease)}
.auto-item:hover{background:#ebe4d5;transform:translateY(-4px)}
.auto-item h3{font-family:var(--serif);font-weight:400;font-size:26px;margin:0 0 12px;line-height:1.15}
.auto-item p{margin:0;color:var(--ink-soft);font-size:15.5px}
.auto-item .ex{display:block;margin-top:22px;font-size:13px;color:#8f7a4a}
.auto-item .dom{display:inline-block;font-size:12px;letter-spacing:.04em;padding:5px 10px;border-radius:999px;background:rgba(19,40,31,.06);color:var(--ink-soft);margin-bottom:18px}
.auto-cta{display:flex;justify-content:space-between;align-items:center;gap:28px;flex-wrap:wrap;margin-top:40px;padding:32px 36px;border-radius:8px;background:var(--ink);color:var(--ivory)}
.auto-cta p{margin:0;max-width:56ch;font-size:18px}
.auto-cta .btn-ink{background:var(--champagne);color:var(--night)}
@media (max-width:900px){.svc-detail{grid-template-columns:1fr;gap:18px}.auto-grid{grid-template-columns:1fr}}'''

def svc_detail(anchor,num,title,lead,items,tags):
    li="".join(f"<li>{a}<span>{b}</span></li>" for a,b in items)
    t="".join(f'<span class="tag">{x}</span>' for x in tags)
    return f'''<article class="svc-detail" id="{anchor}">
  <span class="num" data-reveal>{num}</span>
  <div><h2 data-reveal>{title}</h2><p class="lead" data-reveal>{lead}</p><div class="tags" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:26px" data-reveal>{t}</div></div>
  <ul class="deliver" data-reveal>{li}</ul>
</article>'''

servicii = head("Servicii — Afyze","Site-uri web, automatizări și aplicații. Ce primești concret la fiecare serviciu.", svc_css) + header("servicii.html") + page_hero(
  "Servicii", ("Tot ce ai nevoie","ca să crești online."),
  "Trei servicii, un singur standard: lucruri făcute cu grijă, livrate repede și explicate pe înțeles.",
  f'<a class="btn btn-gold" href="pachete.html" data-magnetic=".3" data-reveal data-hero-reveal><span>Vezi pachetele</span>{ARROW}</a>') + f'''
<section class="sec-tight" style="padding-top:0">
  <div class="container">
    {svc_detail("web","01","Site-uri web","Site-uri de prezentare, landing page-uri și site-uri pe WordPress pe care le poți edita singur.",
      [("Design personalizat","adaptat brandului"),("Versiune mobilă","testată pe iOS și Android"),("Formular de contact și hartă","cu e-mail direct"),("SEO de bază","titluri, descrieri, sitemap"),("Certificat SSL și instalare","pe hostingul tău"),("Lansare","1–4 săptămâni, după mărime")],
      ("WordPress","HTML / CSS / JS","Multilingv","SEO"))}
    {svc_detail("automatizari","02","Automatizări","Procesele pe care le faci de mână în fiecare săptămână, transformate în sisteme care rulează singure.",
      [("Analiza procesului actual","ce se poate automatiza"),("Integrare cu ce folosești deja","Google, Zoom, e-mail"),("Rulare programată","zilnic, săptămânal"),("Rapoarte automate","în Sheets sau pe e-mail"),("Documentație","ca să știi ce face"),("Suport după predare","14 zile")],
      ("Google Apps Script","Sheets / Forms","Zoom API","Python"))}
    {svc_detail("aplicatii","03","Aplicații","Aplicații web și iOS mici, concentrate pe o singură sarcină: teste, instrumente interne, panouri de control.",
      [("Prototip clicabil","înainte de cod"),("Aplicație iOS nativă","SwiftUI, MapKit"),("Aplicație web","fără instalare"),("Date sincronizate","Firebase"),("Publicare","GitHub, App Store"),("Cod sursă","rămâne al tău")],
      ("SwiftUI","React","Node.js","Firebase"))}
  </div>
</section>

<section class="sec light">
  <div class="container">
    <div class="head-row">
      <div><p class="kicker" data-reveal>Exemple de automatizări</p>{lines("Ce poate rula","singur la tine.", tag="h2", cls="display display-m")}</div>
      <p class="lead" data-reveal>Dacă repeți ceva în fiecare săptămână, cel mai probabil poate fi automatizat. Câteva exemple realizabile, pe domenii:</p>
    </div>
    <div class="filters" data-filters="#autoGrid" data-reveal><button type="button" data-filter="all" aria-pressed="true">Toate</button><button type="button" data-filter="general" aria-pressed="false">Orice firmă</button><button type="button" data-filter="juridic" aria-pressed="false">Avocați</button><button type="button" data-filter="horeca" aria-pressed="false">Restaurante</button><button type="button" data-filter="beauty" aria-pressed="false">Saloane și clinici</button><button type="button" data-filter="shop" aria-pressed="false">Magazine online</button><button type="button" data-filter="imobiliare" aria-pressed="false">Imobiliare</button><button type="button" data-filter="educatie" aria-pressed="false">Cursuri și școli</button></div>
    <div class="auto-grid" id="autoGrid">
      <div class="auto-item" data-cat="general" data-reveal data-delay="0.00"><span class="dom">Orice firmă</span><h3>Raport săptămânal automat</h3><p>Datele din tabele, formulare sau CRM se adună într-un raport trimis pe e-mail în fiecare luni dimineață.</p><span class="ex">Apps Script · Gmail</span></div>
      <div class="auto-item" data-cat="general" data-reveal data-delay="0.06"><span class="dom">Orice firmă</span><h3>Notificări instant</h3><p>O cerere nouă, o plată primită sau un termen care se apropie: afli imediat, pe e-mail sau Telegram.</p><span class="ex">Apps Script · Telegram</span></div>
      <div class="auto-item" data-cat="general" data-reveal data-delay="0.12"><span class="dom">Orice firmă</span><h3>Formular → tabel → răspuns</h3><p>Cererile de pe site intră într-un tabel, iar clientul primește pe loc o confirmare personalizată.</p><span class="ex">Forms · Sheets · Gmail</span></div>
      <div class="auto-item" data-cat="general" data-reveal data-delay="0.00"><span class="dom">Orice firmă</span><h3>Facturi restante</h3><p>Reamintiri politicoase trimise automat la 3, 7 și 14 zile după scadență, până se marchează plata.</p><span class="ex">Sheets · Gmail</span></div>
      <div class="auto-item" data-cat="general" data-reveal data-delay="0.06"><span class="dom">Orice firmă</span><h3>Cereri de concediu</h3><p>Angajatul completează un formular, managerul aprobă dintr-un click, iar calendarul echipei se actualizează.</p><span class="ex">Forms · Calendar</span></div>
      <div class="auto-item" data-cat="general" data-reveal data-delay="0.12"><span class="dom">Orice firmă</span><h3>Copii de siguranță zilnice</h3><p>Fișierele importante se copiază în fiecare noapte într-un folder separat, cu istoric pe zile.</p><span class="ex">Apps Script · Drive</span></div>
      <div class="auto-item" data-cat="general" data-reveal data-delay="0.00"><span class="dom">Orice firmă</span><h3>Bot pentru întrebări frecvente</h3><p>Un bot de Telegram răspunde singur la program, adresă, prețuri și preia cererile când nu ești disponibil.</p><span class="ex">Telegram Bot API · Python</span></div>
      <div class="auto-item" data-cat="juridic" data-reveal data-delay="0.06"><span class="dom">Avocați</span><h3>Termene procesuale în calendar</h3><p>Fiecare termen nou intră în calendar, cu reamintire cu trei zile și cu o zi înainte.</p><span class="ex">Sheets · Calendar</span></div>
      <div class="auto-item" data-cat="juridic" data-reveal data-delay="0.12"><span class="dom">Avocați</span><h3>Urmărirea ședințelor</h3><p>Verificare zilnică a agendei de ședințe publicate online pentru dosarele tale, cu alertă la orice schimbare.</p><span class="ex">Python · e-mail</span></div>
      <div class="auto-item" data-cat="juridic" data-reveal data-delay="0.00"><span class="dom">Avocați</span><h3>Ore lucrate pe client</h3><p>Timpul pe fiecare dosar se notează rapid, iar la final de lună ai totalul pentru onorariu.</p><span class="ex">Sheets · Apps Script</span></div>
      <div class="auto-item" data-cat="juridic" data-reveal data-delay="0.06"><span class="dom">Avocați</span><h3>Prezența la instruiri</h3><p>Raportul Zoom se citește singur, orele se calculează pe persoană și prezența se marchează automat.</p><span class="ex">Zoom API · Sheets</span></div>
      <div class="auto-item" data-cat="horeca" data-reveal data-delay="0.12"><span class="dom">Restaurante</span><h3>Rezervări fără telefon</h3><p>Rezervările de pe site ajung într-un tabel și la tine pe Telegram, iar clientul primește confirmarea.</p><span class="ex">Forms · Telegram</span></div>
      <div class="auto-item" data-cat="horeca" data-reveal data-delay="0.00"><span class="dom">Restaurante</span><h3>Stoc minim</h3><p>Când un produs scade sub limita stabilită, primești lista de comandat pentru furnizor.</p><span class="ex">Sheets · Telegram</span></div>
      <div class="auto-item" data-cat="horeca" data-reveal data-delay="0.06"><span class="dom">Restaurante</span><h3>Recenzii după vizită</h3><p>A doua zi după vizită, clienții care au fost de acord primesc un mesaj cu link spre recenzii.</p><span class="ex">Sheets · Gmail</span></div>
      <div class="auto-item" data-cat="beauty" data-reveal data-delay="0.12"><span class="dom">Saloane și clinici</span><h3>Reamintire programare</h3><p>Cu o zi înainte, clientul primește un mesaj cu ora și adresa. Mai puține locuri goale.</p><span class="ex">Calendar · Telegram / SMS</span></div>
      <div class="auto-item" data-cat="beauty" data-reveal data-delay="0.00"><span class="dom">Saloane și clinici</span><h3>Clienți care revin</h3><p>La șase săptămâni după ultima vizită, clientul primește o invitație să-și facă din nou programare.</p><span class="ex">Sheets · Gmail</span></div>
      <div class="auto-item" data-cat="beauty" data-reveal data-delay="0.06"><span class="dom">Saloane și clinici</span><h3>Fișa clientului înainte de vizită</h3><p>Datele și preferințele se completează online, înainte de programare, și ajung în dosarul clientului.</p><span class="ex">Forms · Drive</span></div>
      <div class="auto-item" data-cat="shop" data-reveal data-delay="0.12"><span class="dom">Magazine online</span><h3>Comenzi noi pe Telegram</h3><p>Fiecare comandă de pe site ajunge imediat pe telefon, cu produsele, adresa și telefonul clientului.</p><span class="ex">API magazin · Telegram</span></div>
      <div class="auto-item" data-cat="shop" data-reveal data-delay="0.00"><span class="dom">Magazine online</span><h3>Stoc sincronizat</h3><p>Stocul din tabelul tău și cel de pe site se actualizează unul pe altul, fără dublă introducere.</p><span class="ex">API · Sheets</span></div>
      <div class="auto-item" data-cat="shop" data-reveal data-delay="0.06"><span class="dom">Magazine online</span><h3>Prețurile concurenței</h3><p>Un raport săptămânal cu prețurile publice ale produselor urmărite, ca să știi când să ajustezi.</p><span class="ex">Python · Sheets</span></div>
      <div class="auto-item" data-cat="imobiliare" data-reveal data-delay="0.12"><span class="dom">Imobiliare</span><h3>Lead-uri din reclame</h3><p>Cererile din reclamele Facebook și Instagram intră direct în tabel și ajung la agentul liber.</p><span class="ex">Meta Lead Ads · Sheets</span></div>
      <div class="auto-item" data-cat="imobiliare" data-reveal data-delay="0.00"><span class="dom">Imobiliare</span><h3>Potrivire client – ofertă</h3><p>Când apare o ofertă nouă, clienții ale căror criterii se potrivesc primesc automat un e-mail.</p><span class="ex">Sheets · Gmail</span></div>
      <div class="auto-item" data-cat="educatie" data-reveal data-delay="0.06"><span class="dom">Cursuri și școli</span><h3>Înscrieri la cursuri</h3><p>Înscrierea, confirmarea plății și repartizarea în grupă se fac singure, fără liste pe hârtie.</p><span class="ex">Forms · Sheets</span></div>
      <div class="auto-item" data-cat="educatie" data-reveal data-delay="0.12"><span class="dom">Cursuri și școli</span><h3>Anunțuri pentru grupe</h3><p>Orarul și schimbările se trimit automat elevilor sau părinților, pe Telegram sau e-mail.</p><span class="ex">Telegram · Calendar</span></div>
    </div>
    <div class="auto-cta" data-reveal><p>Ai un proces care nu e pe listă? Descrie-mi ce faci de mână și îți spun dacă se poate automatiza și cât ar costa.</p><a class="btn btn-ink" href="mailto:hello@afyze.com" data-mail data-subject="Ce se poate automatiza la mine?" data-body="Bună ziua,&#10;&#10;În fiecare săptămână fac de mână următorul lucru:&#10;&#10;Folosim aceste programe:&#10;&#10;Numele:&#10;Telefon:&#10;" data-magnetic=".2"><span>Descrie procesul</span>{ARROW}</a></div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="track">
  {"".join(f"<span>{w}</span><em>✦</em>" for w in ["WordPress","SwiftUI","Google Apps Script","Python","React","Firebase","Node.js","Zoom API","PostgreSQL"]*2)}
</div></div>
''' + footer()

# ======================= PORTOFOLIU =======================
portofoliu = head("Portofoliu — Afyze","Proiecte Afyze: aplicații iOS, automatizări, limbaje de programare și site-uri.", ".port .case{margin-bottom:clamp(40px,6vw,96px)} .port .work{row-gap:0}") + header("portofoliu.html") + page_hero(
  "Portofoliu", ("Lucrări","care contează."),
  "O selecție de proiecte: de la aplicații pentru oraș la sisteme care economisesc ore în fiecare săptămână.") + f'''
<section class="sec-tight port" style="padding-top:0">
  <div class="container">
    <div class="filters" data-filters="#workGrid" data-reveal>
      <button type="button" data-filter="all" aria-pressed="true">Toate</button>
      <button type="button" data-filter="web" aria-pressed="false">Web</button>
      <button type="button" data-filter="auto" aria-pressed="false">Automatizări</button>
      <button type="button" data-filter="app" aria-pressed="false">Aplicații</button>
    </div>
    <div hidden id="artLib">{"".join(f'<template data-art="{k}">{v}</template>' for k,v in ART.items())}</div>
    <div class="work" id="workGrid">
      {case("road","RoadFix","Aplicație iOS · Lider de echipă","Cetățenii raportează gropi, felinare stricate și trotuare deteriorate cu poză și locație. Sesizările apar pe o hartă live, iar angajații primăriei urmăresc fiecare caz până la rezolvare. Am condus o echipă de patru oameni.", "w12", "app", "https://github.com/Afyze/RoadFix", ("SwiftUI","MapKit","CoreLocation","Firebase"))}
      {case("att","Evidența prezenței la instruiri","Automatizare","Un sistem care citește zilnic rapoartele Zoom, potrivește participanții după e-mail, calculează orele și marchează prezența la pragul de 80%. Cerințe diferite pentru fiecare categorie de participanți și statistici globale.", "w7", "auto", None, ("Apps Script","Zoom API","Sheets","Drive"))}
      {case("flow","FlowScript DSL","Limbaj de programare · Lead developer","Un limbaj declarativ care adună date din mai multe surse într-una singură. Am scris lexer-ul, parser-ul, arborele sintactic și interfața în linie de comandă.", "w5 offset", "app", None, ("Python","LL(1)","CLI"))}
      {case("exam","Aplicații de pregătire pentru examen","Aplicație web","Site-uri de studiu cu sute de întrebări, navigare pe capitole și un mod care repetă întrebările greșite până le înveți. Progresul se salvează în browser.", "w12", "web", None, ("HTML / JS","localStorage"))}
      {case("afyze","Afyze","Identitate și site","Acest site: identitate vizuală, template-uri demo, animații fluide și pagini rapide, publicat pe GitHub Pages.", "w12", "web", None, ("HTML / CSS","GSAP","Lenis"))}
    </div>
  </div>
</section>
''' + footer()

# ======================= TEMPLATE-URI =======================
tpl_css = '''.tpl-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,5vw,72px) clamp(20px,3vw,40px)}
.tpl-grid .tpl:nth-child(even){margin-top:clamp(0px,8vw,120px)}
.tpl-grid .tpl.is-out + .tpl, .tpl-grid.filtered .tpl{margin-top:0}
.how{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.how h3{font-family:var(--serif);font-weight:400;font-size:28px;margin:0 0 10px}
.how p{margin:0;color:var(--ink-soft)}
@media (max-width:900px){.tpl-grid{grid-template-columns:1fr}.tpl-grid .tpl:nth-child(even){margin-top:0}.how{grid-template-columns:1fr}}'''
templateuri = head("Template-uri — Afyze","Template-uri de site gata de lansat: avocat, restaurant, salon, clinică, sală de sport, imobiliare.", tpl_css) + header("templateuri.html") + page_hero(
  "Template-uri", ("Alege un stil.","Îl fac al tău."),
  "Fiecare template e un site complet, cu mai multe pagini. Îl adaptez la brandul tău — culori, texte, fotografii — și îl lansez în aproximativ o săptămână.") + f'''
<section class="sec-tight" style="padding-top:0">
  <div class="container">
    <div class="filters" data-filters="#tplGrid" data-reveal>
      <button type="button" data-filter="all" aria-pressed="true">Toate</button>
      <button type="button" data-filter="juridic" aria-pressed="false">Juridic</button>
      <button type="button" data-filter="restaurant" aria-pressed="false">Restaurant</button>
      <button type="button" data-filter="beauty" aria-pressed="false">Frumusețe</button>
      <button type="button" data-filter="medical" aria-pressed="false">Medical</button>
      <button type="button" data-filter="fitness" aria-pressed="false">Sport</button>
      <button type="button" data-filter="imobiliare" aria-pressed="false">Imobiliare</button>
    </div>
    <div class="tpl-grid" id="tplGrid">
      {"".join(tpl(*t) for t in TEMPLATES)}
    </div>
  </div>
</section>
<section class="sec light">
  <div class="container">
    <div class="head-row">
      <div><p class="kicker" data-reveal>Cum funcționează</p>{lines("De la template","la site-ul tău.", tag="h2", cls="display display-m")}</div>
      <p class="lead" data-reveal>Nu e un șablon pe care îl completezi singur. Îl personalizez eu, până arată ca și cum a fost făcut doar pentru tine.</p>
    </div>
    <div class="how">
      <div data-reveal><h3>Alegi direcția</h3><p>Deschizi demo-urile și alegi stilul care ți se potrivește. Poți combina idei din mai multe.</p></div>
      <div data-reveal data-delay=".1"><h3>Îmi trimiți materialele</h3><p>Logo, texte, fotografii și date de contact. Dacă lipsesc, te ajut să le pregătim.</p></div>
      <div data-reveal data-delay=".2"><h3>Îl primești gata</h3><p>Adaptat brandului tău și lansat pe domeniul tău în aproximativ o săptămână. Plătești la predare.</p></div>
    </div>
  </div>
</section>
''' + footer()

# ======================= PACHETE =======================
def plan(tier, name, price, term, items, feat=False, badge=""):
    li="".join(f"<li>{x}</li>" for x in items)
    b = f'<span class="badge">{badge}</span>' if badge else ""
    btn = "btn-ink" if feat else "btn-line"
    pid = name.lower()
    return f'''<article class="plan{' feat' if feat else ''}" data-reveal data-plan="{pid}">
  <div class="tier"><span>{tier}</span>{b}</div>
  <h3 class="js-name">{name}</h3>
  <div class="price"><span class="js-price">{price}</span><small>MDL</small></div>
  <p class="term js-term">{term}</p>
  <ul class="js-feats">{li}</ul>
  <a class="btn {btn} js-mail" href="mailto:hello@afyze.com" data-mail data-subject="Cerere pachet {name}" data-body="Bună ziua,&#10;&#10;Mă interesează pachetul {name} ({price} MDL).&#10;&#10;Despre afacerea mea:&#10;&#10;Numele:&#10;Telefon:&#10;" data-magnetic=".2"><span class="js-cta">Alege {name}</span>{ARROW}</a>
</article>'''

def q(question, answer):
    return f'''<div class="q" data-reveal><button type="button" aria-expanded="false"><span>{question}</span><span class="ic" aria-hidden="true"></span></button><div class="a"><div><p>{answer}</p></div></div></div>'''

Y='<span class="y">●</span>'; N='<span class="n">—</span>'
pachete = head("Pachete — Afyze","Pachete de site: Start 5.000 MDL, Business 7.000 MDL, Pro 10.500 MDL. Fără avans, plata la predare.") + header("pachete.html") + page_hero(
  "Pachete și prețuri", ("Prețuri clare.","Fără avans."),
  "Plătești 100% la predare, după ce vezi site-ul funcționând pe o adresă de test. Domeniul și hostingul se plătesc separat.") + f'''
<section class="sec-tight" style="padding-top:0">
  <div class="container">
    <div class="plans">
      {plan("Pentru început","Start","5.000","Gata în aproximativ 1 săptămână",["Site de o pagină (landing)","Șablon adaptat la brand","Formular de contact și hartă","Versiune mobilă","1 limbă","Certificat SSL și instalare","2 runde de modificări"])}
      {plan("Cel mai ales","Business","7.000","Gata în aproximativ 2 săptămâni",["Până la 5 pagini","Design personalizat","Formular de contact și hartă","Versiune mobilă","1 limbă","SEO de bază","Certificat SSL și instalare","2 runde de modificări"], feat=True, badge="Recomandat")}
      {plan("Pentru mai mult","Pro","10.500","Gata în 3–4 săptămâni",["Până la 10 pagini","Design personalizat","Formular de contact și hartă","Versiune mobilă","2 limbi (RO + RU/EN)","SEO de bază","Certificat SSL și instalare","2 runde de modificări"])}
    </div>
    <p class="small" style="margin-top:36px;text-align:center" data-reveal data-c="urgentNote">Ai nevoie urgent? Se poate și în câteva zile, discutăm termenul și costul. Toate pachetele includ 14 zile de suport gratuit după lansare; mentenanța lunară, de la 800 MDL/lună.</p>
  </div>
</section>

<section class="sec light">
  <div class="container">
    <div class="head-row">
      <div><p class="kicker" data-reveal>Comparație</p>{lines("Ce intră","în fiecare.", tag="h2", cls="display display-m")}</div>
      <p class="lead" data-reveal>Toate pachetele pornesc de la același standard de calitate. Diferă doar mărimea site-ului.</p>
    </div>
    <div class="table-wrap" data-reveal>
      <table class="compare">
        <thead><tr><th></th><th data-plan-name="start">Start</th><th data-plan-name="business">Business</th><th data-plan-name="pro">Pro</th></tr></thead>
        <tbody>
          <tr><td>Pagini</td><td>1</td><td>până la 5</td><td>până la 10</td></tr>
          <tr><td>Design</td><td>Șablon adaptat</td><td>Personalizat</td><td>Personalizat</td></tr>
          <tr><td>Limbi</td><td>1</td><td>1</td><td>2</td></tr>
          <tr><td>Formular de contact și hartă</td><td>{Y}</td><td>{Y}</td><td>{Y}</td></tr>
          <tr><td>Versiune mobilă</td><td>{Y}</td><td>{Y}</td><td>{Y}</td></tr>
          <tr><td>SEO de bază</td><td>{N}</td><td>{Y}</td><td>{Y}</td></tr>
          <tr><td>Certificat SSL și instalare</td><td>{Y}</td><td>{Y}</td><td>{Y}</td></tr>
          <tr><td>Runde de modificări</td><td>2</td><td>2</td><td>2</td></tr>
          <tr><td>Suport gratuit</td><td>14 zile</td><td>14 zile</td><td>14 zile</td></tr>
          <tr><td>Termen</td><td data-plan-term="start">~1 săptămână</td><td data-plan-term="business">~2 săptămâni</td><td data-plan-term="pro">3–4 săptămâni</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="sec light" style="padding-top:0">
  <div class="container" style="max-width:980px">
    <p class="kicker" data-reveal>Întrebări frecvente</p>
    {lines("Bine de știut.", tag="h2", cls="display display-m")}
    <div class="faq" style="margin-top:56px">
      {q("Chiar nu plătesc nimic înainte?","Da. Construiesc site-ul pe o adresă de test, îl verifici și îl aprobi, apoi plătești integral. Abia după plată îl mut pe domeniul tău și îți dau accesul de administrare.")}
      {q("Ce trebuie să pregătesc?","Logo-ul, textele, fotografiile și datele de contact. Termenul începe din ziua în care le primesc. Dacă îți lipsesc unele, te ajut să le pregătim.")}
      {q("Se poate mai repede?","Da. În regim urgent, un site mic poate fi gata și în câteva zile. Spune-mi termenul de care ai nevoie și îți confirm dacă e realist și cât costă.")}
      {q("Domeniul și hostingul sunt incluse?","Nu, se plătesc separat, direct de tine, aproximativ 500–1.500 MDL pe an. Așa rămân pe numele tău. Te ajut să le alegi și le configurez eu.")}
      {q("Pot modifica singur site-ul după lansare?","Da. Dacă site-ul e pe WordPress, îți arăt cum să schimbi textele și fotografiile. Pentru modificări mai mari, poți apela oricând la mine.")}
      {q("Ce se întâmplă după cele 14 zile de suport?","Poți continua cu mentenanță lunară, de la 800 MDL pe lună, sau poți cere modificări punctuale, estimate separat.")}
      {q("Faceți și automatizări fără site?","Da. Automatizările se estimează separat, după ce înțeleg procesul. Scrie-mi ce faci de mână și îți spun ce se poate automatiza.")}
    </div>
  </div>
</section>
''' + footer()

# ======================= CONTACT =======================
contact_css = '''.contact-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:clamp(48px,7vw,120px);align-items:start}
.contact-side{display:grid;gap:40px;position:sticky;top:120px}
.contact-side h4{font-weight:500;font-size:13px;letter-spacing:.04em;color:#8f7a4a;margin:0 0 10px}
.contact-side p{margin:0;font-size:18px}
.contact-side .serif{font-size:28px}
.big-mail{font-family:var(--serif);font-size:clamp(40px,8.5vw,140px);line-height:1;letter-spacing:-.03em;display:inline-block;margin-top:40px}
@media (max-width:900px){.contact-grid{grid-template-columns:1fr}.contact-side{position:static}}'''
contact = head("Contact — Afyze","Scrie-mi la hello@afyze.com. Răspund de obicei în aceeași zi.", contact_css) + header("contact.html") + f'''
<section class="page-hero">
  <div class="glow a" aria-hidden="true"></div><div class="glow b" aria-hidden="true"></div>
  <div class="container">
    <p class="kicker" data-reveal data-hero-reveal>Contact</p>
    {lines("Hai să","vorbim.", kind="hero", cls="display display-xl")}
    <a class="big-mail link-u" href="mailto:hello@afyze.com" data-mail data-subject="Salut, Afyze" data-cursor="Scrie" data-reveal data-hero-reveal>hello@afyze.com</a>
    <div class="meta">
      <p class="lead" data-reveal data-hero-reveal>Spune-mi în câteva propoziții ce ai nevoie. De obicei răspund în aceeași zi, cu un preț și un termen clar.</p>
      <div class="msg-row" data-reveal data-hero-reveal><button class="btn btn-line" type="button" data-copy data-magnetic=".3"><span>Copiază adresa</span></button><a class="btn btn-line" data-msg="telegram" target="_blank" rel="noopener" hidden><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M21.4 3.6 2.9 10.8c-1.1.4-1.1 1.4-.2 1.7l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5zM9.6 14.4l-.4 4-1.4-4.6L18.6 7z"/></svg><span>Telegram</span></a><a class="btn btn-line" data-msg="viber" hidden><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2.8c-5 0-8.5 2.3-8.5 8 0 3 1.1 5 3 6.2V21l3-2.1c.8.2 1.6.2 2.5.2 5 0 8.5-2.3 8.5-8.3s-3.5-8-8.5-8z"/><path d="M9 8.5c.4 2.6 2 4.7 5 5.8M13 7.5c1.6.2 2.7 1.2 3 2.8M13 9.6c.6.2 1 .6 1.1 1.2"/></svg><span>Viber</span></a></div>
    </div>
  </div>
</section>

<section class="sec light">
  <div class="container">
    <div class="contact-grid">
      <form class="form" id="contactForm" novalidate>
        <div data-reveal>
          <span class="small" style="color:#8f7a4a">Ce ai nevoie?</span>
          <div class="chips">
            <label><input type="radio" name="type" value="Site web" checked><span>Site web</span></label>
            <label><input type="radio" name="type" value="Automatizare"><span>Automatizare</span></label>
            <label><input type="radio" name="type" value="Aplicație"><span>Aplicație</span></label>
            <label><input type="radio" name="type" value="Altceva"><span>Altceva</span></label>
          </div>
        </div>
        <div data-reveal>
          <span class="small" style="color:#8f7a4a">Pachet (opțional)</span>
          <div class="chips">
            <label><input type="radio" name="pkg" value="Start — 5.000 MDL" data-plan-chip="start"><span>Start</span></label>
            <label><input type="radio" name="pkg" value="Business — 7.000 MDL" data-plan-chip="business"><span>Business</span></label>
            <label><input type="radio" name="pkg" value="Pro — 10.500 MDL" data-plan-chip="pro"><span>Pro</span></label>
            <label><input type="radio" name="pkg" value="Încă nu știu"><span>Încă nu știu</span></label>
          </div>
        </div>
        <div class="field" data-reveal><input id="f-name" name="name" placeholder=" " autocomplete="name" maxlength="80" required><label for="f-name">Numele tău</label></div>
        <div class="field" data-reveal><input id="f-email" name="email" type="email" placeholder=" " autocomplete="email" maxlength="120"><label for="f-email">E-mail</label></div>
        <div class="field" data-reveal><input id="f-phone" name="phone" placeholder=" " autocomplete="tel" inputmode="tel" maxlength="30"><label for="f-phone">Telefon (opțional)</label></div>
        <div class="hp" aria-hidden="true"><label for="f-website">Lasă gol</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
        <div class="field" data-reveal><textarea id="f-msg" name="msg" placeholder=" " maxlength="3000" required></textarea><label for="f-msg">Despre proiect</label></div>
        <div data-reveal style="display:flex;flex-wrap:wrap;align-items:center;gap:22px;margin-top:8px">
          <button class="btn btn-ink" type="submit" data-magnetic=".25"><span>Trimite la hello@afyze.com</span>{ARROW}</button>
          <span class="small">Se deschide aplicația ta de e-mail cu mesajul deja scris.</span>
        </div>
      </form>
      <aside class="contact-side">
        <div data-reveal><h4>E-mail</h4><p class="serif"><a class="link-u" href="mailto:hello@afyze.com" data-mail>hello@afyze.com</a></p></div>
        <div data-reveal><h4>Răspuns</h4><p>De obicei în aceeași zi lucrătoare.</p></div>
        <div data-reveal><h4>Locație</h4><p>Chișinău, Moldova. Lucrez cu clienți din toată țara.</p></div>
        <div data-reveal><h4>Cod</h4><p><a class="link-u" href="https://github.com/Afyze" target="_blank" rel="noopener">github.com/Afyze</a></p></div>
      </aside>
    </div>
  </div>
</section>
''' + footer(cta=False)

for name, html in [("index.html",home),("servicii.html",servicii),("portofoliu.html",portofoliu),("templateuri.html",templateuri),("pachete.html",pachete),("contact.html",contact)]:
    with open(os.path.join(OUT,name),"w",encoding="utf-8") as f: f.write(html)
print("ok")
