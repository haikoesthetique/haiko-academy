"""Génère la section blog de haiko-academy.com à partir de blog/articles.json + contenus.

Usage : python3 academy_blog.py <dossier_site> <article.py> [<article.py> ...]
Chaque article.py définit ARTICLE = {slug, title, seo_title, meta, date, excerpt, image, image_alt, keyword, body:[blocs], faq:[(q,r)]}
"""
import json, re, sys, html, os, importlib.util, datetime

SITE = sys.argv[1]
BASE = "https://haiko-academy.com"
MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]

def fr_date(iso):
    d = datetime.date.fromisoformat(iso)
    return f"{d.day} {MOIS[d.month-1]} {d.year}"

tpl = open(os.path.join(SITE, "mentions-legales/index.html"), encoding="utf-8").read()
head_shared = tpl[tpl.index('<link rel="preconnect"'):tpl.index("</head>")]
body_top = tpl[tpl.index("<body>")+len("<body>"):tpl.index('<main id="contenu"')]
footer = tpl[tpl.index("<footer"):tpl.index("</body>")]

# Ancien lien « Blog » du menu du haut (retiré à la demande de Servane : le blog est dans le pied de page)
OLD_STYLE = "<style>.xblog:hover{background:rgba(0,10,255,0.06) !important}</style>\n"
OLD_DESK = ('<li style="display:flex;position:relative"><a href="/blog" style="position:relative;display:flex;align-items:center;'
            'min-height:44px;padding:0 14px;border-radius:999px;font-family:Poppins,sans-serif;font-size:14px;font-weight:500;'
            'color:#000aff;text-decoration:none" class="xblog">Blog</a></li>\n          ')
OLD_MOB = ('<li><a href="/blog" style="display:flex;align-items:center;min-height:56px;font-family:Poppins,sans-serif;font-weight:700;'
           'font-size:36px;letter-spacing:-0.04em;color:#cdf564;text-decoration:none">Blog</a></li>\n          ')

FOOT_STYLE = "<style>.xblogf:hover{text-decoration:underline !important;color:#fffcf1 !important}</style>\n"
FOOT_LI = ('\n          <li><a href="/blog" style="display:flex;align-items:center;min-height:44px;color:#fffcf1;'
           'text-decoration:none;font-size:15px" class="xblogf">Le blog</a></li>')

def add_blog_nav(page):
    """Retire le lien Blog du menu du haut et place « Le blog » dans le pied de page (rubrique Nos établissements)."""
    for old in (OLD_DESK, OLD_MOB, OLD_STYLE):
        page = page.replace(old, "")
    page = page.replace('href="/blog" aria-current="page" style', 'href="/blog" style')
    page = page.replace('href="/blog/" aria-current="page" style', 'href="/blog/" style')
    if 'class="xblogf"' in page or "<footer" not in page:
        return page
    f = page.index("<footer")
    i = page.find('<a href="/#ecole"', f)
    if i == -1:
        i = page.find('<a href="/mentions-legales', f)
    if i == -1:
        return page
    end = page.index("</li>", i) + len("</li>")
    page = page[:end] + FOOT_LI + page[end:]
    if FOOT_STYLE not in page:
        page = page.replace("</head>", FOOT_STYLE + "</head>", 1)
    return page

POST_CSS = """<style>
.post{max-width:760px;margin:0 auto;padding:0 clamp(20px,4vw,48px);font-size:17px;line-height:1.75;color:#000aff}
.post p{margin:0 0 22px}
.post h2{margin:56px 0 18px;font-weight:700;font-size:clamp(26px,3vw,38px);line-height:1.1;letter-spacing:-0.04em}
.post h3{margin:34px 0 12px;font-weight:700;font-size:20px;letter-spacing:-0.01em}
.post ul,.post ol{margin:0 0 26px;padding-left:22px}
.post li{margin:0 0 10px}
.post a{color:#000aff;text-decoration:underline;text-underline-offset:3px}
.post strong{font-weight:600}
.post figure{margin:36px 0}
.post img{display:block;width:100%;max-width:900px;height:auto;border-radius:28px}
.post figcaption{margin-top:10px;font-size:14px;opacity:.8}
.post .cta{margin:44px 0;padding:28px clamp(22px,3vw,36px);border-radius:28px;background:#000aff;color:#fffcf1}
.post .cta p{margin:0 0 18px}
.post .cta a{display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border-radius:999px;background:#cdf564;color:#000aff;font-weight:600;text-decoration:none}
.post .faq h3{margin-top:28px}
.post .note{font-size:14px;opacity:.85;border-top:1px solid rgba(0,10,255,.3);padding-top:18px;margin-top:48px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:28px}
.card{display:flex;flex-direction:column;border:2px solid #000aff;border-radius:28px;overflow:hidden;text-decoration:none;color:#000aff;background:#fffcf1;transition:background .2s}
.card:hover{background:rgba(0,10,255,0.04)}
.card img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;display:block}
.card div{padding:22px 24px 26px}
.card time{font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
.card h2{margin:10px 0 10px;font-size:22px;line-height:1.2;letter-spacing:-0.02em}
.card p{margin:0;font-size:15px;line-height:1.6}
</style>"""

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    def link(m):
        txt, url = m.group(1), m.group(2)
        ext = not url.startswith("/") and "haiko-academy.com" not in url
        attrs = ' target="_blank" rel="noopener"' if ext else ""
        return f'<a href="{url}"{attrs}>{txt}</a>'
    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, s)

def render(blocks):
    out = []
    for b in blocks:
        k = b[0]
        if k == "p": out.append(f"<p>{inline(b[1])}</p>")
        elif k == "h2": out.append(f"<h2>{inline(b[1])}</h2>")
        elif k == "h3": out.append(f"<h3>{inline(b[1])}</h3>")
        elif k == "ul": out.append("<ul>" + "".join(f"<li>{inline(i)}</li>" for i in b[1]) + "</ul>")
        elif k == "ol": out.append("<ol>" + "".join(f"<li>{inline(i)}</li>" for i in b[1]) + "</ol>")
        elif k == "img":
            src, w, h, alt, cap = b[1:]
            out.append(f'<figure><img src="{src}" width="{w}" height="{h}" alt="{html.escape(alt)}" loading="lazy"><figcaption>{inline(cap)}</figcaption></figure>')
        elif k == "cta":
            txt, label, url = b[1:]
            out.append(f'<div class="cta"><p>{inline(txt)}</p><a href="{url}">{html.escape(label)}</a></div>')
    return "\n".join(out)

def head(title, meta, canonical, og_type="website", extra=""):
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(meta)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="{og_type}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Haïko Academy">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(meta)}">
<meta property="og:url" content="{canonical}">
{extra}
{head_shared}{POST_CSS}
</head>
<body>"""

def page(title, meta, canonical, main, og_type="website", extra=""):
    p = head(title, meta, canonical, og_type, extra) + body_top + main + "\n\n" + footer + "</body>\n</html>\n"
    return add_blog_nav(p)

def article_page(a):
    url = f"{BASE}/blog/{a['slug']}"
    faq_html = '<div class="faq">' + "".join(f"<h3>{inline(q)}</h3><p>{inline(r)}</p>" for q, r in a["faq"]) + "</div>"
    ld = [{"@context":"https://schema.org","@type":"BlogPosting","headline":a["title"],"description":a["meta"],
           "image":BASE+a["image"],"datePublished":a["date"],"dateModified":a["date"],"inLanguage":"fr-FR",
           "author":{"@type":"Person","name":"Servane Orinel"},
           "publisher":{"@type":"Organization","name":"Haïko Academy","logo":{"@type":"ImageObject","url":BASE+"/images/favicon-512.png"}},
           "mainEntityOfPage":url},
          {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":r}} for q, r in a["faq"]]},
          {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
            {"@type":"ListItem","position":1,"name":"Accueil","item":BASE+"/"},
            {"@type":"ListItem","position":2,"name":"Blog","item":BASE+"/blog"},
            {"@type":"ListItem","position":3,"name":a["title"],"item":url}]}]
    extra = (f'<meta property="og:image" content="{BASE}{a["image"]}">\n'
             f'<meta property="article:published_time" content="{a["date"]}">\n'
             + "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in ld))
    main = f"""<main id="contenu" style="font-family:Poppins,sans-serif;color:#000aff">
  <section style="max-width:1440px;margin:0 auto;padding:clamp(40px,7vw,104px) clamp(20px,4vw,48px) 0">
    <nav aria-label="Fil d'Ariane" style="font-size:14px"><a href="/" style="text-decoration:none">Accueil</a> › <a href="/blog" style="text-decoration:none">Blog</a></nav>
    <p style="margin:28px 0 0;font-size:clamp(12px,1vw,14px);font-weight:600;letter-spacing:0.14em">BLOG · <time datetime="{a['date']}">{fr_date(a['date']).upper()}</time></p>
    <h1 style="margin:clamp(20px,2.4vw,36px) 0 0;max-width:20ch;font-weight:700;font-size:clamp(36px,5.2vw,80px);line-height:0.98;letter-spacing:-0.05em;text-wrap:balance">{html.escape(a['title'])}</h1>
    <p style="margin:24px 0 0;max-width:62ch;font-size:clamp(17px,1.4vw,20px);line-height:1.6">{inline(a['excerpt'])}</p>
  </section>
  <figure style="max-width:1100px;margin:clamp(36px,5vw,64px) auto 0;padding:0 clamp(20px,4vw,48px)">
    <img src="{a['image']}" width="{a['image_w']}" height="{a['image_h']}" alt="{html.escape(a['image_alt'])}" style="display:block;width:100%;max-height:560px;object-fit:cover;border-radius:clamp(28px,4vw,56px)">
  </figure>
  <article class="post" style="margin-top:clamp(40px,5vw,72px)">
{render(a['body'])}
<h2>FAQ : {html.escape(a['keyword'])}</h2>
{faq_html}
<p class="note">Article rédigé par l'équipe Haïko Academy. Les dates et modalités officielles de l'examen sont celles publiées par l'Éducation nationale et votre académie : en cas de doute, seule votre convocation fait foi.</p>
  </article>
</main>"""
    return page(a["seo_title"], a["meta"], url, main, "article", extra)

def index_page(arts):
    cards = "\n".join(f"""      <a class="card" href="/blog/{a['slug']}">
        <img src="{a['image']}" width="{a['image_w']}" height="{a['image_h']}" alt="{html.escape(a['image_alt'])}" loading="lazy">
        <div><time datetime="{a['date']}">{fr_date(a['date'])}</time><h2>{html.escape(a['title'])}</h2><p>{html.escape(a['card'])}</p></div>
      </a>""" for a in arts)
    main = f"""<main id="contenu" style="font-family:Poppins,sans-serif;color:#000aff">
  <section style="max-width:1440px;margin:0 auto;padding:clamp(40px,7vw,104px) clamp(20px,4vw,48px) 0">
    <p style="margin:0;font-size:clamp(12px,1vw,14px);font-weight:600;letter-spacing:0.14em">LE BLOG</p>
    <h1 style="margin:clamp(20px,2.4vw,36px) 0 0;max-width:16ch;font-weight:700;font-size:clamp(40px,6.4vw,104px);line-height:0.94;letter-spacing:-0.055em;text-wrap:balance">Blog esthétique : CAP et formations à Marseille</h1>
    <p style="margin:24px 0 0;max-width:60ch;font-size:clamp(17px,1.4vw,20px);line-height:1.6">Conseils pour préparer le CAP esthétique en candidat libre, réussir sa reconversion et se former aux nouvelles techniques de l'esthétique avancée.</p>
  </section>
  <section style="max-width:1440px;margin:0 auto;padding:clamp(48px,6vw,88px) clamp(20px,4vw,48px) 0">
    <div class="cards">
{cards}
    </div>
  </section>
</main>"""
    return page("Blog esthétique : CAP et formations à Marseille | Haïko Academy",
                "Le blog de Haïko Academy : conseils pour préparer le CAP esthétique en candidat libre, se reconvertir et se former aux techniques esthétiques à Marseille.",
                BASE + "/blog", main)

def update_sitemap(arts):
    p = os.path.join(SITE, "sitemap.xml")
    s = open(p, encoding="utf-8").read()
    s = re.sub(r"\s*<url><loc>https://haiko-academy\.com/blog[^<]*</loc>.*?</url>", "", s)
    latest = max(a["date"] for a in arts)
    add = f'\n  <url><loc>{BASE}/blog</loc><lastmod>{latest}</lastmod><priority>0.7</priority></url>'
    for a in sorted(arts, key=lambda a: a["date"], reverse=True):
        add += f'\n  <url><loc>{BASE}/blog/{a["slug"]}</loc><lastmod>{a["date"]}</lastmod><priority>0.7</priority></url>'
    s = s.replace("\n</urlset>", add + "\n</urlset>")
    open(p, "w", encoding="utf-8").write(s)

# --- charge les articles ---
manifest_path = os.path.join(SITE, "blog", "articles.json")
os.makedirs(os.path.join(SITE, "blog"), exist_ok=True)
manifest = json.load(open(manifest_path, encoding="utf-8")) if os.path.exists(manifest_path) else []
for path in sys.argv[2:]:
    spec = importlib.util.spec_from_file_location("art", path); mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    a = mod.ARTICLE
    d = os.path.join(SITE, "blog", a["slug"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(article_page(a))
    manifest = [m for m in manifest if m["slug"] != a["slug"]]
    manifest.append({k: a[k] for k in ("slug","title","date","card","image","image_w","image_h","image_alt")})
    # contrôles checklist
    txt = re.sub(r"<[^>]+>", " ", render(a["body"])) + " ".join(q+" "+r for q,r in a["faq"])
    words = len(html.unescape(txt).split())
    bolds = re.findall(r"\*\*(.+?)\*\*", json.dumps(a["body"], ensure_ascii=False))
    links = re.findall(r"\]\(([^)]+)\)", json.dumps(a["body"], ensure_ascii=False))
    print(f"{a['slug']}: mots={words} title={len(a['seo_title'])} meta={len(a['meta'])} gras={bolds} "
          f"liens_int={sum(1 for l in links if l.startswith('/'))} liens_ext={sum(1 for l in links if not l.startswith('/'))}", file=sys.stderr)

manifest.sort(key=lambda m: m["date"], reverse=True)
json.dump(manifest, open(manifest_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(SITE, "blog", "index.html"), "w", encoding="utf-8").write(index_page(manifest))
update_sitemap(manifest)

# --- lien Blog dans le menu de toutes les pages ---
for root, _, files in os.walk(SITE):
    if "/blog" in root.replace(SITE, ""): continue
    for f in files:
        if f.endswith(".html"):
            p = os.path.join(root, f); s = open(p, encoding="utf-8").read()
            if "<footer" in s:
                n = add_blog_nav(s)
                if n != s: open(p, "w", encoding="utf-8").write(n)
print("ok", file=sys.stderr)

# --- slash final sur toutes les URL de pages (évite la boucle de redirection Netlify / Google) ---
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import slash_final
print(f"slash final : {slash_final.normaliser(SITE)} fichiers modifiés", file=sys.stderr)

# --- Netlify : toujours construire (sinon les déploiements sont annulés à tort) ---
toml = os.path.join(SITE, "netlify.toml")
if os.path.exists(toml):
    t = open(toml, encoding="utf-8").read()
    if "ignore" not in t and "[build]" in t:
        t = t.replace("[build]", '[build]\n  ignore = "exit 1"', 1)
        open(toml, "w", encoding="utf-8").write(t)

