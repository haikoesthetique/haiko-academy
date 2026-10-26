// Rappels automatiques de la visio CAP esthétique du mercredi 4 novembre 2026 à 19 h.
// Fonction programmée (toutes les heures) : J-3, J-2 et J-1 à 10 h, et le jour J à 17 h (heure de Paris).
// Chaque rappel part une seule fois, à toutes les inscrites de la liste Brevo « Visio CAP esthétique – 04/11/2026 ».
// Variables d'environnement : BREVO_API_KEY, BREVO_SENDER_EMAIL, VISIO_LINK (lien Google Meet),
//   BREVO_VISIO_LIST_ID (facultatif), VISIO_NOTIFY_EMAIL (reçoit un compte rendu de chaque envoi).
import { getStore } from '@netlify/blobs';

const API = 'https://api.brevo.com/v3';
const LISTE = 'Visio CAP esthétique – 04/11/2026';
const H = 3600 * 1000;

// Heures en UTC (Paris = UTC+1 en novembre)
const RAPPELS = [
  { id: 'j-3', quand: '2026-11-01T09:00:00Z', sujet: 'J-3 : votre visio CAP esthétique, c\'est mercredi à 19 h',
    titre: 'Plus que 3 jours{{params.VIRGULE_PRENOM}} !',
    texte: 'Petit rappel : vous êtes inscrite à notre visio gratuite <b>« Tout savoir sur le CAP esthétique en candidat libre »</b>. Bloquez dès maintenant votre soirée de mercredi.' },
  { id: 'j-2', quand: '2026-11-02T09:00:00Z', sujet: 'J-2 : préparez vos questions pour la visio CAP de mercredi',
    titre: 'J-2 : notez vos questions{{params.VIRGULE_PRENOM}}',
    texte: 'Mercredi, on vous présente l\'examen, l\'école et la Méthode Haïko, puis on répond à <b>toutes vos questions</b> en direct. Le financement, l\'organisation avec un emploi, les épreuves pratiques&nbsp;: notez tout ce qui vous trotte dans la tête, il n\'y a pas de petite question.' },
  { id: 'j-1', quand: '2026-11-03T09:00:00Z', sujet: 'C\'est demain : visio CAP esthétique à 19 h',
    titre: 'C\'est demain{{params.VIRGULE_PRENOM}} !',
    texte: 'Rendez-vous <b>demain, mercredi 4 novembre à 19 h</b>, pour notre visio gratuite sur le CAP esthétique en candidat libre. Votre lien de connexion est juste en dessous&nbsp;: gardez cet e-mail sous la main.' },
  { id: 'jour-j', quand: '2026-11-04T16:00:00Z', sujet: 'C\'est ce soir à 19 h : votre lien pour la visio CAP',
    titre: 'C\'est ce soir{{params.VIRGULE_PRENOM}} !',
    texte: 'On se retrouve <b>ce soir à 19 h</b> pour la visio. Connectez-vous quelques minutes avant, depuis votre ordinateur ou votre téléphone&nbsp;: il suffit de cliquer sur le bouton ci-dessous, aucune installation n\'est nécessaire sur ordinateur.' },
];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function call(path, key, body) {
  const r = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'api-key': key, accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  let json = null; try { json = JSON.parse(txt); } catch (e) {}
  return { ok: r.ok, status: r.status, txt, json };
}

async function listeId(key) {
  const env = Netlify.env.get('BREVO_VISIO_LIST_ID');
  if (env) return Number(env);
  for (let offset = 0; offset < 500; offset += 50) {
    const r = await call('/contacts/lists?limit=50&offset=' + offset, key);
    const lists = (r.json && r.json.lists) || [];
    const hit = lists.find(l => l.name === LISTE);
    if (hit) return hit.id;
    if (lists.length < 50) break;
  }
  return 0;
}

async function inscrites(id, key) {
  const out = [];
  for (let offset = 0; offset < 5000; offset += 500) {
    const r = await call('/contacts/lists/' + id + '/contacts?limit=500&offset=' + offset, key);
    const cs = (r.json && r.json.contacts) || [];
    for (const c of cs) if (c.email && !c.emailBlacklisted) out.push({ email: c.email, prenom: (c.attributes && (c.attributes.FIRSTNAME || c.attributes.PRENOM)) || '' });
    if (cs.length < 500) break;
  }
  return out;
}

export function mailRappel(r, lien) {
  const bouton = (href, txt, fond, coul) => '<a href="' + esc(href) + '" style="display:inline-block;margin:0 8px 10px 0;padding:14px 26px;border-radius:999px;background:' + fond + ';color:' + coul + ';font-weight:bold;text-decoration:none">' + txt + '</a>';
  const quand = r.id === 'jour-j' ? 'Ce soir à 19 h' : r.id === 'j-1' ? 'Demain, mercredi 4 novembre à 19 h' : 'Mercredi 4 novembre à 19 h';
  return '<!doctype html><html><body style="margin:0;background:#fffcf1;font-family:Poppins,Arial,sans-serif;color:#000aff">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffcf1"><tr><td align="center" style="padding:32px 16px">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:28px">'
    + '<tr><td style="background:#000aff;border-radius:28px 28px 0 0;padding:28px 32px"><a href="https://haiko-academy.com" style="text-decoration:none"><img src="https://haiko-academy.com/images/logo-haiko-academy-lime.png" alt="Haïko Academy – École Supérieure d\'Esthétique" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0"></a></td></tr>'
    + '<tr><td style="padding:32px">'
    + '<p style="margin:0;font-size:24px;font-weight:bold;line-height:1.2">' + r.titre + '</p>'
    + '<p style="margin:16px 0 0;font-size:16px;line-height:1.6">' + r.texte + '</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;background:#f9b0e7;border-radius:20px"><tr><td style="padding:20px 24px;font-size:16px;line-height:1.6;color:#000aff">'
    + '<b style="font-size:13px;letter-spacing:2px">VISIO GRATUITE · CAP ESTHÉTIQUE</b><br><b style="font-size:22px">' + quand + '</b><br>En ligne, sur Google Meet</td></tr></table>'
    + (lien
      ? '<p style="margin:0">' + bouton(lien, 'Rejoindre la visio', '#000aff', '#cdf564') + '</p><p style="margin:6px 0 0;font-size:13px;line-height:1.6">Ou copiez ce lien dans votre navigateur : <a href="' + esc(lien) + '" style="color:#000aff">' + esc(lien) + '</a></p>'
      : '<p style="margin:0;font-size:15px;line-height:1.6">Le lien de connexion vous sera envoyé par e-mail avant la visio.</p>')
    + '<p style="margin:24px 0 8px;font-size:16px;font-weight:bold">Au programme</p>'
    + '<p style="margin:0;font-size:15px;line-height:1.7">1. La présentation de l\'examen du CAP esthétique<br>2. La présentation de l\'école et de la Méthode Haïko<br>3. Les réponses à toutes vos questions</p>'
    + '<p style="margin:20px 0 0;font-size:15px;line-height:1.6">Bon à savoir : les inscriptions à l\'examen du CAP 2027 ferment le <b>jeudi 12 novembre 2026 à 18 h</b>.</p>'
    + '<p style="margin:24px 0 0;font-size:15px;line-height:1.6">Un empêchement ? Répondez simplement à cet e-mail ou appelez-nous au 07 56 97 91 88.</p>'
    + '<p style="margin:24px 0 0;font-size:15px">À ' + (r.id === 'jour-j' ? 'ce soir' : 'mercredi') + ',<br><b>L\'équipe Haïko Academy</b></p>'
    + '</td></tr><tr><td style="padding:20px 32px;border-top:1px solid #d9dbff;font-size:12px;line-height:1.6;color:#000aff">Haïko Academy · 29 rue Edmond Rostand, 13006 Marseille<br>Vous recevez cet e-mail car vous vous êtes inscrite à la visio sur haiko-academy.com.</td></tr>'
    + '</table></td></tr></table></body></html>';
}

export default async () => {
  const key = Netlify.env.get('BREVO_API_KEY');
  if (!key) { console.log('BREVO_API_KEY manquante'); return; }
  const now = Date.now();
  const dus = RAPPELS.filter(r => now >= Date.parse(r.quand) && now < Date.parse(r.quand) + 6 * H);
  if (!dus.length) return;
  const store = getStore('rappels-visio-cap');
  const id = await listeId(key);
  if (!id) { console.log('Liste « ' + LISTE + ' » introuvable : aucune inscrite'); return; }
  const sender = { email: Netlify.env.get('BREVO_SENDER_EMAIL') || 'contact@centrehaiko.com', name: 'Haïko Academy' };
  const lien = Netlify.env.get('VISIO_LINK') || '';
  for (const r of dus) {
    if (await store.get(r.id)) continue;
    await store.set(r.id, new Date().toISOString()); // verrou avant envoi : jamais de double envoi
    const liste = await inscrites(id, key);
    let envoyes = 0;
    for (let i = 0; i < liste.length; i += 900) {
      const lot = liste.slice(i, i + 900);
      const res = await call('/smtp/email', key, {
        sender, replyTo: { email: 'contact@centrehaiko.com', name: 'Haïko Academy' },
        subject: r.sujet, htmlContent: mailRappel(r, lien), tags: ['visio-cap-rappel', 'visio-cap-' + r.id],
        messageVersions: lot.map(c => ({ to: [{ email: c.email, name: c.prenom || c.email }], params: { PRENOM: c.prenom || '', VIRGULE_PRENOM: c.prenom ? ', ' + c.prenom : '' } })),
      });
      console.log('Rappel', r.id, 'lot', i / 900 + 1, res.status, res.ok ? '' : res.txt);
      if (res.ok) envoyes += lot.length;
    }
    const admin = Netlify.env.get('VISIO_NOTIFY_EMAIL') || 'contact@centrehaiko.com';
    await call('/smtp/email', key, {
      sender: { email: sender.email, name: 'Site Haïko Academy' }, to: [{ email: admin }],
      subject: 'Rappel visio CAP ' + r.id.toUpperCase() + ' envoyé à ' + envoyes + ' inscrite' + (envoyes > 1 ? 's' : ''),
      htmlContent: '<p style="font-family:Arial,sans-serif;color:#000aff">Le rappel « ' + esc(r.sujet) + ' » vient de partir à <b>' + envoyes + '</b> inscrite(s) sur ' + liste.length + '.</p>'
        + (lien ? '' : '<p style="font-family:Arial,sans-serif;color:#c00"><b>Attention : aucun lien de visio n\'est renseigné (VISIO_LINK).</b></p>'),
    });
  }
};

// Toutes les heures à la 7e minute (UTC) ; la fonction ne fait rien hors des créneaux de rappel.
export const config = { schedule: '7 * * * *' };
