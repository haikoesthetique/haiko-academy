"""Corrige les données « Fil d'Ariane » (BreadcrumbList) pour Google.

Google exige un lien (« item ») sur chaque niveau sauf le dernier. Les pages de
formation exportées par Claude Design ont un niveau intermédiaire sans lien
(« Formations courtes », « Formations ») : tout le fil est alors refusé.
Ce script retire ces niveaux sans lien et renumérote les positions.
Le fil d'Ariane visible sur la page n'est pas modifié.

Usage : python3 _outils-blog/fil_ariane.py "<dossier du site>"
(appelé automatiquement par mise_a_jour_site.py)
"""
import json, os, re, sys

MOTIF = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)


def corriger_liste(bc):
    items = bc.get('itemListElement') or []
    garde = [it for i, it in enumerate(items) if it.get('item') or i == len(items) - 1]
    if len(garde) == len(items):
        return False
    for n, it in enumerate(garde, 1):
        it['position'] = n
    bc['itemListElement'] = garde
    return True


def parcourir(obj):
    change = False
    if isinstance(obj, list):
        for x in obj:
            change |= parcourir(x)
    elif isinstance(obj, dict):
        if obj.get('@type') == 'BreadcrumbList':
            change |= corriger_liste(obj)
        for v in obj.values():
            if isinstance(v, (list, dict)):
                change |= parcourir(v)
    return change


def corriger(site):
    n = 0
    for racine, dirs, fichiers in os.walk(site):
        dirs[:] = [d for d in dirs if d not in ('images', 'netlify', '.git')]
        for f in fichiers:
            if not f.endswith('.html'):
                continue
            p = os.path.join(racine, f)
            html = open(p, encoding='utf-8').read()
            modifie = False

            def remplacer(m):
                nonlocal modifie
                try:
                    data = json.loads(m.group(2))
                except ValueError:
                    return m.group(0)
                if not parcourir(data):
                    return m.group(0)
                modifie = True
                return m.group(1) + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + m.group(3)

            nouveau = MOTIF.sub(remplacer, html)
            if modifie:
                open(p, 'w', encoding='utf-8').write(nouveau)
                n += 1
    return n


if __name__ == '__main__':
    print("fil d'Ariane : %d page(s) corrigée(s)" % corriger(sys.argv[1] if len(sys.argv) > 1 else '.'))
