"""Remet en place automatiquement les ajouts faits hors de Claude Design :
le blog (pages, lien « Le blog » du pied de page, sitemap, URL avec slash final)
et le bouton « Espace élèves ».

Lancé automatiquement par Netlify à chaque mise en ligne (commande de build dans
« site-html 14/netlify.toml »). Avec --toml, remet aussi cette commande dans
netlify.toml si une nouvelle version du site l'a effacée (utilisé par GitHub).

Usage : python3 _outils-blog/mise_a_jour_site.py "<dossier du site>" [--toml]
"""
import glob, os, re, subprocess, sys

ICI = os.path.dirname(os.path.abspath(__file__))
COMMANDE = 'python3 ../_outils-blog/mise_a_jour_site.py .'


def toml_ok(site):
    """Vérifie (et rétablit) dans netlify.toml la commande de mise à jour et « ignore = exit 1 »
    (toujours construire). Renvoie True si le fichier a été modifié."""
    chemin = os.path.join(site, 'netlify.toml')
    texte = open(chemin, encoding='utf-8').read() if os.path.exists(chemin) else ''
    avant = texte
    if not re.search(r'^\[build\]\s*$', texte, flags=re.M):
        texte = '[build]\n  publish = "."\n\n' + texte
    if COMMANDE not in texte:
        texte = re.sub(r'^\s*command\s*=.*\n', '', texte, flags=re.M)
        texte = re.sub(r'^\[build\]\s*$', '[build]\n  command = "' + COMMANDE + '"', texte, count=1, flags=re.M)
    if not re.search(r'^\s*ignore\s*=\s*"exit 1"', texte, flags=re.M):
        texte = re.sub(r'^\s*ignore\s*=.*\n', '', texte, flags=re.M)
        texte = re.sub(r'^\[build\]\s*$', '[build]\n  ignore = "exit 1"', texte, count=1, flags=re.M)
    if texte == avant:
        return False
    open(chemin, 'w', encoding='utf-8').write(texte)
    print('netlify.toml : réglages de mise en ligne rétablis')
    return True


AJOUTS = os.path.join(os.path.dirname(ICI), '_ajouts-site')


def appliquer_ajouts(site):
    """Remet les ajouts faits hors de Claude Design (dossier _ajouts-site) :
    - fichiers/ : copiés tels quels dans le site (fonctions Netlify, page visio, image) ;
    - morceaux/ : insérés dans site.js, index.html et sitemap.xml s'ils n'y sont plus."""
    if not os.path.isdir(AJOUTS):
        return
    n = 0
    base = os.path.join(AJOUTS, 'fichiers')
    for racine, _, fichiers in os.walk(base):
        for nom in fichiers:
            src = os.path.join(racine, nom)
            dst = os.path.join(site, os.path.relpath(src, base))
            data = open(src, 'rb').read()
            if os.path.exists(dst) and open(dst, 'rb').read() == data:
                continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            open(dst, 'wb').write(data)
            n += 1
    lire = lambda p: open(p, encoding='utf-8').read()
    m = os.path.join(AJOUTS, 'morceaux')
    # site.js : pop-up de la visio + message de la page merci
    p = os.path.join(site, 'site.js')
    if os.path.exists(p):
        js = lire(p)
        avant = js
        if 'haiko-popup-visio-cap' not in js and '  // Bandeau cookies' in js:
            js = js.replace('  // Bandeau cookies', lire(os.path.join(m, 'popup-visio.js')) + '  // Bandeau cookies', 1)
        if "visio:['" not in js and "contact:['CONTACT'," in js:
            js = js.replace("contact:['CONTACT',", lire(os.path.join(m, 'merci-visio.js')) + "contact:['CONTACT',", 1)
        if js != avant:
            open(p, 'w', encoding='utf-8').write(js); n += 1
    # index.html : bandeau de la visio au-dessus du menu
    p = os.path.join(site, 'index.html')
    if os.path.exists(p):
        h = lire(p)
        i = h.find('<header')
        if 'class="hk-jpo"' not in h and i != -1:
            open(p, 'w', encoding='utf-8').write(h[:i] + lire(os.path.join(m, 'bandeau-visio.html')) + h[i:]); n += 1
    # sitemap : page de la visio
    p = os.path.join(site, 'sitemap.xml')
    if os.path.exists(p):
        s = lire(p)
        if '/visio-cap-esthetique' not in s and '</urlset>' in s:
            s = s.replace('</urlset>', '  <url><loc>https://haiko-academy.com/visio-cap-esthetique/</loc><priority>0.8</priority></url>\n</urlset>', 1)
            open(p, 'w', encoding='utf-8').write(s); n += 1
    print('ajouts du site : %d fichier(s) remis en place' % n)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    site = os.path.abspath(args[0] if args else '.')
    if '--toml' in sys.argv:
        toml_ok(site)
    appliquer_ajouts(site)
    articles = sorted(glob.glob(os.path.join(ICI, 'articles', '*.py')))
    if articles:
        subprocess.run([sys.executable, os.path.join(ICI, 'generer_blog.py'), site] + articles, check=True)
    subprocess.run([sys.executable, os.path.join(ICI, 'espace_eleves.py'), site], check=True)
    print('Mise à jour automatique du site : terminée')


if __name__ == '__main__':
    main()
