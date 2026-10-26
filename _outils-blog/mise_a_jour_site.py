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
    """Vérifie (et rétablit) la commande de build dans netlify.toml. Renvoie True si le fichier a été modifié."""
    chemin = os.path.join(site, 'netlify.toml')
    texte = open(chemin, encoding='utf-8').read() if os.path.exists(chemin) else ''
    if COMMANDE in texte:
        return False
    texte = re.sub(r'^\s*command\s*=.*\n', '', texte, flags=re.M)
    if re.search(r'^\[build\]\s*$', texte, flags=re.M):
        texte = re.sub(r'^\[build\]\s*$', '[build]\n  command = "' + COMMANDE + '"', texte, count=1, flags=re.M)
    else:
        texte = '[build]\n  command = "' + COMMANDE + '"\n  publish = "."\n\n' + texte
    open(chemin, 'w', encoding='utf-8').write(texte)
    print('netlify.toml : commande de mise à jour rétablie')
    return True


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    site = os.path.abspath(args[0] if args else '.')
    if '--toml' in sys.argv:
        toml_ok(site)
    articles = sorted(glob.glob(os.path.join(ICI, 'articles', '*.py')))
    if articles:
        subprocess.run([sys.executable, os.path.join(ICI, 'generer_blog.py'), site] + articles, check=True)
    subprocess.run([sys.executable, os.path.join(ICI, 'espace_eleves.py'), site], check=True)
    print('Mise à jour automatique du site : terminée')


if __name__ == '__main__':
    main()
