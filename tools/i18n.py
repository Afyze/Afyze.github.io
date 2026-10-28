# Instrumente comune: extragerea textelor traductibile și înlocuirea lor.
import re, html as H

PAGES = ["index.html", "servicii.html", "portofoliu.html", "templateuri.html", "pachete.html", "contact.html"]
ATTRS = ["content", "aria-label", "placeholder", "alt", "title", "data-subject", "data-body", "data-cursor"]
TOKEN = re.compile(r"(<!--.*?-->|<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)", re.S | re.I)
ATTR = re.compile(r'(\s(?:' + "|".join(re.escape(a) for a in ATTRS) + r')=")([^"]*)(")')
LETTERS = re.compile(r"[A-Za-zĂÂÎȘȚăâîșț]")
SKIP_META = re.compile(r'<meta\s+(?:http-equiv|name="(?:viewport|theme-color|robots|referrer)"|charset)', re.I)

def norm(s):
    return re.sub(r"\s+", " ", H.unescape(s)).strip()

def translatable(t):
    return bool(t) and bool(LETTERS.search(t))

def collect(src):
    out = []
    for part in TOKEN.split(src):
        if not part: continue
        if part.startswith("<"):
            if part[:7].lower() in ("<script", "<style") or part.startswith("<!--") or SKIP_META.match(part): continue
            for m in ATTR.finditer(part):
                t = norm(m.group(2))
                if translatable(t): out.append(t)
        else:
            t = norm(part)
            if translatable(t): out.append(t)
    return out

def apply(src, tr, missing):
    res = []
    inside_title = False
    for part in TOKEN.split(src):
        if not part: continue
        if part.startswith("<"):
            low = part[:7].lower()
            if low in ("<script", "<style") or part.startswith("<!--") or SKIP_META.match(part):
                res.append(part); continue
            def rep(m):
                t = norm(m.group(2))
                if not translatable(t): return m.group(0)
                if t in tr: return m.group(1) + H.escape(tr[t], quote=True).replace("\n", "&#10;") + m.group(3)
                missing.add(t); return m.group(0)
            res.append(ATTR.sub(rep, part))
        else:
            t = norm(part)
            if translatable(t):
                if t in tr:
                    lead = part[: len(part) - len(part.lstrip())]
                    trail = part[len(part.rstrip()):]
                    res.append(lead + H.escape(tr[t], quote=False) + trail)
                else:
                    missing.add(t); res.append(part)
            else:
                res.append(part)
    return "".join(res)
