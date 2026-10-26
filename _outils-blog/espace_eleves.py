"""Ajoute le bouton « Espace élèves » (header desktop + mobile, menu mobile, footer) sur toutes les pages du site.

Idempotent : peut être relancé sans dupliquer le bouton.
Usage : python3 _outils-blog/espace_eleves.py "site-html 14"
"""
import os
import re
import sys

URL = "https://espaceeleves.haiko-academy.com/"
ICONE = ('<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
         'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex:none">'
         '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>')
CSS = ('<style id="hk-espace-css">'
       '.hk-espace{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 20px;border-radius:999px;'
       'background:#f9b0e7;color:#000aff!important;border:2px solid #000aff;font-family:Poppins,sans-serif;font-weight:700;'
       'font-size:14px;text-decoration:none!important;white-space:nowrap;transition:background .15s,transform .15s}'
       '.hk-espace:hover{background:#cdf564;transform:translateY(-1px)}'
       '.hk-espace:focus-visible{outline:3px solid #cdf564;outline-offset:2px}'
       '.hk-espace--mobile{min-height:44px;padding:0 12px;font-size:13px;gap:6px}'
       '@media (max-width:959px){header>div{gap:10px!important}header a>img[src*="logo-haiko-academy-bleu"]{height:30px!important}}'
       '.hk-espace--menu{margin-top:28px;min-height:56px;font-size:18px;justify-content:center;border-color:#f9b0e7}'
       '.hk-espace--footer{margin-top:28px;min-height:52px;font-size:15px;border-color:#f9b0e7}'
       '@media (max-width:359px){.hk-espace--mobile span{display:none}}'
       '</style>')


def bouton(variante, texte="Espace élèves"):
    return (f'<a href="{URL}" class="hk-espace hk-espace--{variante}" data-hk-espace="{variante}" '
            f'aria-label="Espace élèves : se connecter à ma formation">{ICONE}<span>{texte}</span></a>')


def traiter(html):
    if 'data-hk-espace=' in html:
        return html, False
    n = 0
    # CSS dans le <head>
    if 'id="hk-espace-css"' not in html:
        html = html.replace('</head>', CSS + '\n</head>', 1)
    # 1) Header desktop : après le bouton « Tarifs & inscription », avant </nav>
    html, k = re.subn(r'(Tarifs &amp; inscription</a>)(\s*</nav>)',
                      lambda m: m.group(1) + '\n        ' + bouton('desktop').replace('class="hk-espace ', 'style="margin-left:8px" class="hk-espace ') + m.group(2),
                      html, count=1)
    n += k
    # 2) Header mobile : bouton compact à côté de « Menu »
    html, k = re.subn(r'(<button type="button" aria-expanded="false" aria-controls="menu-mobile"[^>]*?) class="only-mobile">Menu</button>',
                      lambda m: '<div class="only-mobile" style="display:flex;align-items:center;gap:8px">' + bouton('mobile', 'Élèves')
                      + m.group(1) + '>Menu</button></div>',
                      html, count=1)
    n += k
    # 3) Menu mobile plein écran : grand bouton sous la navigation
    html, k = re.subn(r'(<div id="menu-mobile".*?<nav aria-label="Navigation principale"[^>]*>.*?)(\s*</nav>)',
                      lambda m: m.group(1) + '\n      ' + bouton('menu') + m.group(2), html, count=1, flags=re.S)
    n += k
    # 4) Footer : sous le logo
    html, k = re.subn(r'(<footer[^>]*>.*?Apprenez\. Entraînez-vous\. Maîtrisez\.</span>\s*</a>)',
                      lambda m: m.group(1) + '\n    <div>' + bouton('footer', 'Espace élèves : se connecter') + '</div>',
                      html, count=1, flags=re.S)
    n += k
    return html, n


def main(site):
    total = 0
    for racine, _, fichiers in os.walk(site):
        if os.sep + 'netlify' in racine:
            continue
        for f in fichiers:
            if not f.endswith('.html'):
                continue
            p = os.path.join(racine, f)
            html = open(p, encoding='utf-8').read()
            neuf, n = traiter(html)
            if n:
                open(p, 'w', encoding='utf-8').write(neuf)
                total += 1
                print(f'{p} : {n} emplacements', file=sys.stderr)
    print(f'espace élèves : {total} pages modifiées', file=sys.stderr)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'site-html 14')
