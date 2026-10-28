# Generează versiunea rusă a site-ului în /ru/ și adaugă legăturile hreflang pe ambele versiuni.
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from i18n import PAGES, apply
from ru_dict import RU

ROOT = sys.argv[1]
BASE = "https://afyze.github.io/"
os.makedirs(os.path.join(ROOT, "ru"), exist_ok=True)

FONTS_RO = '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">'
FONTS_RU = ('<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..800&family=Manrope:wght@400;500;600&display=swap&subset=cyrillic" rel="stylesheet">\n'
            '<style>:root{--serif:"Playfair Display",Georgia,serif;--sans:"Manrope","Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
            '.display{letter-spacing:-.025em}</style>')

def hreflang(page):
    p = "" if page == "index.html" else page
    return (f'<link rel="alternate" hreflang="ro" href="{BASE}{p}">\n'
            f'<link rel="alternate" hreflang="ru" href="{BASE}ru/{p}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{BASE}{p}">\n')

missing = set()
for page in PAGES:
    path = os.path.join(ROOT, page)
    ro = open(path, encoding="utf-8").read()
    # ---- versiunea română: hreflang (o singură dată) ----
    ro = re.sub(r'<link rel="alternate" hreflang=[^>]+>\n', "", ro)
    ro = ro.replace("</head>", hreflang(page) + '<meta property="og:locale" content="ro_MD">\n</head>', 1) if 'og:locale' not in ro else ro.replace("</head>", hreflang(page) + "</head>", 1)
    open(path, "w", encoding="utf-8").write(ro)

    # ---- versiunea rusă ----
    ru = apply(ro, RU, missing)
    ru = ru.replace('<html lang="ro">', '<html lang="ru">', 1)
    ru = ru.replace('content="ro_MD"', 'content="ru_MD"')
    assert FONTS_RO in ru, "linkul de fonturi s-a schimbat"
    ru = ru.replace(FONTS_RO, FONTS_RU)
    # căi relative: pagina stă acum în /ru/
    ru = re.sub(r'(\s(?:href|src))="(assets/|templates/|admin/)', r'\1="../\2', ru)
    # comutatorul de limbă duce înapoi la română
    ru = re.sub(r'<a class="langsw" href="ru/([\w.-]+)" lang="ru" hreflang="ru" aria-label="[^"]*">RU</a>',
                r'<a class="langsw" href="../\1" lang="ro" hreflang="ro" aria-label="Versiunea în română">RO</a>', ru)
    ru = re.sub(r'<a class="langsw-m" href="ru/([\w.-]+)" lang="ru" hreflang="ru">Русский</a>',
                r'<a class="langsw-m" href="../\1" lang="ro" hreflang="ro">Română</a>', ru)
    assert 'href="ru/' not in ru, page
    open(os.path.join(ROOT, "ru", page), "w", encoding="utf-8").write(ru)

if missing:
    print("NETRADUSE:")
    for m in sorted(missing): print("  ", m)
else:
    print("ok: toate textele traduse")
