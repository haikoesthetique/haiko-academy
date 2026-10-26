# Site Haïko Academy (haiko-academy.com)

Le site vient de Claude Design : Servane remplace régulièrement tout le dossier « site-html 14 »
par une nouvelle version. Tout ce qui est fait ici, hors Claude Design, doit donc survivre à ce remplacement.

## Règles

- **Une seule mise en ligne par série de changements.** Chaque push sur `main` déclenche un déploiement
  Netlify qui coûte des crédits (le site a déjà été mis en pause pour crédits épuisés). Regrouper tous
  les changements dans un seul commit/push.
- **Tout ajout hors Claude Design doit être protégé** dans `_ajouts-site/` :
  - `fichiers/` : copiés tels quels dans le site à chaque mise en ligne (fonctions Netlify, pages ajoutées, images).
    Si tu modifies l'un de ces fichiers dans « site-html 14 », modifie AUSSI sa copie dans `_ajouts-site/fichiers/`,
    sinon la mise en ligne remettra l'ancienne version.
  - `morceaux/` : fragments insérés dans site.js, index.html et sitemap.xml par `_outils-blog/mise_a_jour_site.py`
    (ajoute la règle d'insertion correspondante dans ce script pour tout nouveau morceau).
- `_outils-blog/mise_a_jour_site.py` est lancé par Netlify à chaque build (commande dans `site-html 14/netlify.toml`) :
  ajouts protégés, blog, lien « Le blog » du pied de page, slash final des URL, bouton « Espace élèves ».
- Si une nouvelle version de Claude Design efface cette commande, l'action GitHub
  `.github/workflows/remise-en-place-site.yml` la rétablit et corrige le site (un déploiement de plus).
