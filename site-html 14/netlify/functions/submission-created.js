// Déclenchée automatiquement par Netlify à chaque envoi de formulaire validé (nom de fichier imposé : submission-created.js).
// 1) ajoute ou met à jour le contact dans Brevo  2) envoie un e-mail de confirmation à la personne.
// Variables d'environnement Netlify :
//   BREVO_API_KEY          clé API Brevo (xkeysib-…)            obligatoire
//   BREVO_SENDER_EMAIL     adresse d'expéditeur validée dans Brevo  obligatoire (ex. contact@centrehaiko.com)
//   BREVO_CAP_LIST_ID      n° de la liste CAP esthétique (par défaut : 14, « Demandes CAP esthétique »)
//   BREVO_LIST_ID          n° de la liste des autres demandes (par défaut : 10, « Demandes Haïko Academy »)
//   BREVO_TEMPLATE_ID      n° d'un modèle Brevo à utiliser à la place de l'e-mail intégré  facultatif
//   BREVO_BROCHURE_URL     lien vers la brochure PDF CAP (par défaut : /brochure-cap-esthetique-2027.pdf sur le site)
const API = 'https://api.brevo.com/v3';
const FORMS = {
  'contact': 'votre demande de contact',
  'rappel': 'votre demande de rappel pour la préparation au CAP esthétique',
  'programme-cap': 'la préparation au CAP esthétique en candidat libre',
  'dates-drainage': 'la formation drainage lymphatique brésilien',
  'reservation-kobido': 'la formation Kobido',
  'reservation-maderotherapie': 'la formation madérothérapie',
  'reservation-hydraface': 'la formation Hydraface',
  'reservation-nanoneedling': 'la formation nanoneedling',
  'reservation-peeling': 'la formation peeling esthétique',
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const phone = t => { const d = String(t || '').replace(/[^0-9+]/g, ''); if (/^0[1-9]\d{8}$/.test(d)) return '+33' + d.slice(1); if (/^\+\d{8,15}$/.test(d)) return d; if (/^00\d{8,15}$/.test(d)) return '+' + d.slice(2); return null; };
const checked = v => v === true || /^(on|oui|yes|true|1)$/i.test(String(v || ''));

async function brevo(path, body, key) {
  const r = await fetch(API + path, { method: 'POST', headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body) });
  const txt = await r.text();
  return { ok: r.ok, status: r.status, txt };
}

function mail(prenom, sujet, d, brochure) {
  const lignes = [['Formation', d.formation || d.formule], ['Motif', d.motif], ['Session', d.session], ['Message', d.message || d.question]].filter(([, v]) => v);
  const recap = lignes.length ? '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;border-collapse:collapse">' + lignes.map(([k, v]) => '<tr><td style="padding:10px 0;border-top:1px solid #d9dbff;font-size:14px;color:#000aff;width:110px;vertical-align:top"><b>' + k + '</b></td><td style="padding:10px 0;border-top:1px solid #d9dbff;font-size:14px;color:#000aff">' + esc(v) + '</td></tr>').join('') + '</table>' : '';
  const btn = brochure ? '<p style="margin:24px 0 0"><a href="' + esc(brochure) + '" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#000aff;color:#cdf564;font-weight:bold;text-decoration:none">Télécharger la brochure</a></p>' : '';
  return '<!doctype html><html><body style="margin:0;background:#fffcf1;font-family:Poppins,Arial,sans-serif;color:#000aff">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffcf1"><tr><td align="center" style="padding:32px 16px">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:28px">'
    + '<tr><td style="background:#000aff;border-radius:28px 28px 0 0;padding:28px 32px"><p style="margin:0;font-size:26px;color:#fffcf1;font-weight:bold">haiko academy</p><p style="margin:4px 0 0;font-size:12px;color:#cdf564;letter-spacing:2px">ÉCOLE SUPÉRIEURE D\'ESTHÉTIQUE</p></td></tr>'
    + '<tr><td style="padding:32px">'
    + '<p style="margin:0;font-size:24px;font-weight:bold;line-height:1.2">Merci ' + esc(prenom || '') + ', votre demande est bien reçue.</p>'
    + (brochure ? '<p style="margin:16px 0 0;font-size:16px;line-height:1.6">Merci pour votre intérêt pour ' + esc(sujet) + '. Vous trouverez ci-dessous notre brochure 2027 : formules, programme, calendrier et tarifs. Notre équipe revient vers vous sous 48 h maximum.</p>' : '<p style="margin:16px 0 0;font-size:16px;line-height:1.6">Nous avons bien reçu votre message concernant ' + esc(sujet) + '. Notre équipe revient vers vous sous 48 h maximum.</p>')
    + recap + btn
    + '<p style="margin:24px 0 0;font-size:15px;line-height:1.6">Une question d\'ici là ? Répondez simplement à cet e-mail ou appelez-nous au 07 56 97 91 88.</p>'
    + '<p style="margin:24px 0 0;font-size:15px">À très vite,<br><b>L\'équipe Haïko Academy</b></p>'
    + '</td></tr><tr><td style="padding:20px 32px;border-top:1px solid #d9dbff;font-size:12px;line-height:1.6;color:#000aff">Haïko Academy · 29 rue Edmond Rostand, 13006 Marseille<br>Vous recevez cet e-mail car vous avez envoyé une demande sur haiko-academy.com.</td></tr>'
    + '</table></td></tr></table></body></html>';
}

exports.handler = async (event) => {
  const key = process.env.BREVO_API_KEY;
  if (!key) { console.log('BREVO_API_KEY manquante'); return { statusCode: 200, body: 'skip' }; }
  let payload;
  try { payload = JSON.parse(event.body).payload; } catch (e) { return { statusCode: 400, body: 'bad body' }; }
  const d = payload.data || {};
  const form = payload.form_name || d['form-name'] || '';
  const email = String(d.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { statusCode: 200, body: 'no email' };
  const prenom = String(d.prenom || '').trim();
  const choix = String(d.formation || d.formule || '');
  const isCap = form === 'programme-cap' || form === 'rappel' || /\bCAP\b/i.test(choix);
  const sujet = isCap && form === 'contact' ? 'la préparation au CAP esthétique en candidat libre' : (FORMS[form] || 'votre demande');

  // 1) Contact Brevo
  const listId = Number(isCap ? (process.env.BREVO_CAP_LIST_ID || 14) : (process.env.BREVO_LIST_ID || 10));
  const listIds = listId ? [listId] : [];
  if (isCap && !listId) console.log('BREVO_CAP_LIST_ID manquante : contact CAP non classé');
  const attributes = { FIRSTNAME: prenom };
  if (d.nom) attributes.LASTNAME = String(d.nom).trim();
  const sms = phone(d.telephone);
  if (sms) attributes.SMS = sms;
  const contact = { email, attributes, updateEnabled: true };
  if (listIds.length) contact.listIds = listIds;
  let r = await brevo('/contacts', contact, key);
  if (!r.ok && attributes.SMS) { delete attributes.SMS; r = await brevo('/contacts', contact, key); } // numéro déjà utilisé par un autre contact, etc.
  console.log('Brevo contact', r.status, r.ok ? '' : r.txt);

  // 2) E-mail de confirmation
  const sender = { email: process.env.BREVO_SENDER_EMAIL || 'contact@centrehaiko.com', name: 'Haïko Academy' };
  const brochure = isCap ? (process.env.BREVO_BROCHURE_URL || 'https://haiko-academy.com/brochure-cap-esthetique-2027.pdf') : '';
  const msg = { sender, to: [{ email, name: prenom || email }], replyTo: { email: 'contact@centrehaiko.com', name: 'Haïko Academy' } };
  if (process.env.BREVO_TEMPLATE_ID) {
    msg.templateId = Number(process.env.BREVO_TEMPLATE_ID);
    msg.params = { PRENOM: prenom, SUJET: sujet, FORMATION: d.formation || d.formule || '', MOTIF: d.motif || '', SESSION: d.session || '', BROCHURE: brochure };
  } else {
    msg.subject = isCap ? 'Votre brochure CAP esthétique 2027 – Haïko Academy' : 'Votre demande est bien reçue – Haïko Academy';
    msg.htmlContent = mail(prenom, sujet, d, brochure);
  }
  r = await brevo('/smtp/email', msg, key);
  console.log('Brevo email', r.status, r.ok ? '' : r.txt);
  return { statusCode: 200, body: 'ok' };
};
