"""Ajoute le slash final à toutes les URL de pages internes (canonical, og:url, JSON-LD, liens, sitemap).

Pourquoi : Netlify sert chaque page depuis « dossier/index.html » et redirige
/formation-kobido-marseille vers /formation-kobido-marseille/. Si la canonical et le
sitemap annoncent la version sans slash, Google tourne en boucle et n'indexe pas la page.

Usage : python3 _outils-blog/slash_final.py "site-html 14"
(appelé automatiquement à la fin de generer_blog.py)
"""
import os, re, sys

EXTS = (".html", ".xml", ".js")


def pages(site):
    """Chemins de pages servies depuis un dossier/index.html (hors page d'accueil)."""
    out = []
    for root, dirs, files in os.walk(site):
        dirs[:] = [d for d in dirs if d not in ("netlify", "images", ".git")]
        rel = os.path.relpath(root, site).replace(os.sep, "/")
        if rel != "." and "index.html" in files:
            out.append(rel)
    return sorted(out, key=len, reverse=True)


def normaliser(site):
    chemins = pages(site)
    if not chemins:
        return 0
    motif = re.compile(
        r"""(?<=["'(>\s])((?:https://(?:www\.)?haiko-academy\.com)?/(?:%s))(?=["'#?<)\s])"""
        % "|".join(re.escape(c) for c in chemins)
    )
    modifies = 0
    for root, dirs, files in os.walk(site):
        dirs[:] = [d for d in dirs if d not in ("images", ".git")]
        for f in files:
            if not f.endswith(EXTS):
                continue
            p = os.path.join(root, f)
            s = open(p, encoding="utf-8").read()
            n = motif.sub(r"\1/", s)
            if n != s:
                open(p, "w", encoding="utf-8").write(n)
                modifies += 1
    # Cibles des redirections 301 : pointer directement vers la version avec slash
    red = os.path.join(site, "_redirects")
    if os.path.exists(red):
        lignes = []
        for l in open(red, encoding="utf-8").read().split("\n"):
            parts = l.split()
            if len(parts) >= 2 and not l.lstrip().startswith("#"):
                cible = parts[1]
                if cible.lstrip("/") in chemins:
                    l = l.replace(" " + cible, " " + cible.rstrip("/") + "/", 1)
            lignes.append(l)
        open(red, "w", encoding="utf-8").write("\n".join(lignes))
    return modifies


if __name__ == "__main__":
    print(f"slash final : {normaliser(sys.argv[1])} fichiers modifiés", file=sys.stderr)
