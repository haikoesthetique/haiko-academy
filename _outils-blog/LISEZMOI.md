# Blog Haïko Academy (géré automatiquement par Claude)

Ce dossier est en dehors du site publié : ne le supprimez pas lors des mises à jour.

- `articles/` : la source de chaque article du blog.
- `generer_blog.py` : reconstruit `site-html 14/blog/`, le sitemap et le lien « Blog » du menu.

Si une mise à jour du site (Claude Design) remplace le dossier du site, le blog est
automatiquement remis en place lors de la publication suivante :

    python3 _outils-blog/generer_blog.py "site-html 14" _outils-blog/articles/*.py

## Bouton « Espace élèves »

`espace_eleves.py` ajoute le bouton rose « Espace élèves » (lien vers https://espaceeleves.haiko-academy.com/)
dans le header (ordinateur et mobile), le menu mobile et le pied de page de toutes les pages.
Il est sans effet si le bouton est déjà présent. À relancer après une mise à jour du site (Claude Design)
ou après `generer_blog.py` :

    python3 _outils-blog/espace_eleves.py "site-html 14"

## Mise à jour automatique (rien à faire)

À chaque mise en ligne, Netlify lance `mise_a_jour_site.py` (commande de build dans
`site-html 14/netlify.toml`) : le blog, le lien « Le blog » du pied de page et le bouton
« Espace élèves » sont remis en place tout seuls, même après une nouvelle version Claude Design.

Si une nouvelle version efface cette commande de `netlify.toml`, l'action GitHub
« Remise en place du site » (`.github/workflows/`) la remet et corrige le site automatiquement.
