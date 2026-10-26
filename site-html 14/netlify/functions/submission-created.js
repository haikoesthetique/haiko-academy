// Déclenchée automatiquement par Netlify à chaque envoi de formulaire validé (nom de fichier imposé : submission-created.js).
// 1) ajoute ou met à jour le contact dans Brevo  2) envoie un e-mail de confirmation à la personne.
// Variables d'environnement Netlify :
//   BREVO_API_KEY          clé API Brevo (xkeysib-…)            obligatoire
//   BREVO_SENDER_EMAIL     adresse d'expéditeur validée dans Brevo  obligatoire (ex. contact@centrehaiko.com)
//   BREVO_CAP_LIST_ID      n° de la liste CAP esthétique (par défaut : 14, « Demandes CAP esthétique »)
//   BREVO_LIST_ID          n° de la liste des autres demandes (par défaut : 10, « Demandes Haïko Academy »)
//   BREVO_TEMPLATE_ID      n° d'un modèle Brevo à utiliser à la place de l'e-mail intégré  facultatif
//   BREVO_BROCHURE_URL     lien vers la brochure PDF CAP (par défaut : /brochure-cap-esthetique-2027.pdf sur le site)
// Visio CAP du 4/11/2026 (formulaire « visio-cap ») :
//   VISIO_LINK             lien de connexion (Zoom, Meet…) inclus dans l'e-mail de confirmation  facultatif
//   VISIO_NOTIFY_EMAIL     adresse qui reçoit l'alerte « nouvelle inscrite » (par défaut : contact@centrehaiko.com)
//   BREVO_VISIO_LIST_ID    n° de la liste Brevo des inscrites ; sinon la liste « Visio CAP esthétique – 04/11/2026 » est trouvée ou créée automatiquement
const API = 'https://api.brevo.com/v3';
const FORMS = {
  'contact': 'votre demande de contact',
  'rappel': 'votre demande de rappel pour la préparation au CAP esthétique',
  'programme-cap': 'la préparation au CAP esthétique en candidat libre',
  'visio-cap': 'la visio gratuite sur le CAP esthétique en candidat libre',
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

async function brevoGet(path, key) {
  const r = await fetch(API + path, { headers: { 'api-key': key, accept: 'application/json' } });
  let json = null; try { json = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, json };
}

// ---------- Visio CAP esthétique du mercredi 4 novembre 2026 à 19 h ----------
const VISIO = {
  nom: 'Visio CAP esthétique – 04/11/2026',
  titre: 'Visio gratuite : tout savoir sur le CAP esthétique en candidat libre',
  quand: 'mercredi 4 novembre 2026 à 19 h (heure de Paris)',
  debutUTC: '20261104T180000Z', finUTC: '20261104T190000Z',
};

async function visioListId(key) {
  if (process.env.BREVO_VISIO_LIST_ID) return Number(process.env.BREVO_VISIO_LIST_ID);
  for (let offset = 0; offset < 500; offset += 50) {
    const r = await brevoGet('/contacts/lists?limit=50&offset=' + offset, key);
    const lists = (r.json && r.json.lists) || [];
    const hit = lists.find(l => l.name === VISIO.nom);
    if (hit) return hit.id;
    if (lists.length < 50) break;
  }
  const f = await brevoGet('/contacts/folders?limit=10&offset=0', key);
  const folderId = f.json && f.json.folders && f.json.folders[0] && f.json.folders[0].id;
  if (!folderId) { console.log('Aucun dossier Brevo trouvé', f.status); return 0; }
  const c = await brevo('/contacts/lists', { name: VISIO.nom, folderId }, key);
  console.log('Création liste visio', c.status, c.txt);
  try { return JSON.parse(c.txt).id || 0; } catch (e) { return 0; }
}

function agendaUrl(lien) {
  const details = 'Présentation de l\'examen du CAP esthétique, de l\'école Haïko Academy et réponses à vos questions.' + (lien ? '\n\nLien de connexion : ' + lien : '\n\nLe lien de connexion vous est envoyé par e-mail.');
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(VISIO.titre + ' – Haïko Academy')
    + '&dates=' + VISIO.debutUTC + '/' + VISIO.finUTC + '&ctz=Europe/Paris&details=' + encodeURIComponent(details) + (lien ? '&location=' + encodeURIComponent(lien) : '');
}

function cadre(contenu, pied) {
  return '<!doctype html><html><body style="margin:0;background:#fffcf1;font-family:Poppins,Arial,sans-serif;color:#000aff">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffcf1"><tr><td align="center" style="padding:32px 16px">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:28px">'
    + '<tr><td style="background:#000aff;border-radius:28px 28px 0 0;padding:28px 32px"><a href="https://haiko-academy.com" style="text-decoration:none"><img src="https://haiko-academy.com/images/logo-haiko-academy-lime.png" alt="Haïko Academy – École Supérieure d\'Esthétique" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0"></a></td></tr>'
    + '<tr><td style="padding:32px">' + contenu + '</td></tr>'
    + '<tr><td style="padding:20px 32px;border-top:1px solid #d9dbff;font-size:12px;line-height:1.6;color:#000aff">' + pied + '</td></tr>'
    + '</table></td></tr></table></body></html>';
}

function mailVisio(prenom, lien) {
  const bouton = (href, txt, fond, coul) => '<a href="' + esc(href) + '" style="display:inline-block;margin:0 8px 10px 0;padding:14px 26px;border-radius:999px;background:' + fond + ';color:' + coul + ';font-weight:bold;text-decoration:none">' + txt + '</a>';
  return cadre(
    '<p style="margin:0;font-size:24px;font-weight:bold;line-height:1.2">C\'est noté ' + esc(prenom) + ', votre place est réservée !</p>'
    + '<p style="margin:16px 0 0;font-size:16px;line-height:1.6">Merci pour votre inscription à notre visio gratuite <b>« Tout savoir sur le CAP esthétique en candidat libre »</b>.</p>'
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;background:#f9b0e7;border-radius:20px"><tr><td style="padding:20px 24px;font-size:16px;line-height:1.6;color:#000aff">'
    + '<b style="font-size:13px;letter-spacing:2px">RENDEZ-VOUS</b><br><b style="font-size:22px">Mercredi 4 novembre à 19 h</b><br>En visio, depuis chez vous · gratuit</td></tr></table>'
    + '<p style="margin:0 0 8px;font-size:16px;font-weight:bold">Au programme</p>'
    + '<p style="margin:0;font-size:15px;line-height:1.7">1. La présentation de l\'examen du CAP esthétique<br>2. La présentation de l\'école et de la Méthode Haïko<br>3. Les réponses à toutes vos questions</p>'
    + '<p style="margin:24px 0 8px;font-size:15px;line-height:1.6">' + (lien ? 'Le jour J, cliquez simplement sur ce lien pour nous rejoindre :' : 'Le lien de connexion vous sera envoyé par e-mail avant la visio. Pensez à vérifier vos spams.') + '</p>'
    + '<p style="margin:16px 0 0">' + (lien ? bouton(lien, 'Rejoindre la visio', '#000aff', '#cdf564') : '') + bouton(agendaUrl(lien), 'Ajouter à mon agenda', lien ? '#cdf564' : '#000aff', lien ? '#000aff' : '#cdf564') + '</p>'
    + '<p style="margin:14px 0 0;font-size:15px;line-height:1.6">Bon à savoir : les inscriptions à l\'examen du CAP 2027 ferment le <b>jeudi 12 novembre 2026 à 18 h</b>. Venez avec vos questions !</p>'
    + '<p style="margin:24px 0 0;font-size:15px;line-height:1.6">Un empêchement ou une question d\'ici là ? Répondez simplement à cet e-mail ou appelez-nous au 07 56 97 91 88.</p>'
    + '<p style="margin:24px 0 0;font-size:15px">À mercredi,<br><b>L\'équipe Haïko Academy</b></p>',
    'Haïko Academy · 29 rue Edmond Rostand, 13006 Marseille<br>Vous recevez cet e-mail car vous vous êtes inscrite à la visio sur haiko-academy.com.');
}

function mailAlerte(d, total) {
  const lignes = [['Prénom', d.prenom], ['Nom', d.nom], ['E-mail', d.email], ['Téléphone', d.telephone], ['Situation', d.situation], ['Question', d.question], ['Actualités', checked(d.actualites) ? 'Oui' : 'Non']].filter(([, v]) => v);
  return cadre(
    '<p style="margin:0;font-size:22px;font-weight:bold;line-height:1.2">Nouvelle inscrite à la visio CAP du 4 novembre 🎉</p>'
    + (total ? '<p style="margin:12px 0 0;font-size:16px">Nombre total d\'inscrites : <b>' + total + '</b></p>' : '')
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse">'
    + lignes.map(([k, v]) => '<tr><td style="padding:10px 0;border-top:1px solid #d9dbff;font-size:14px;width:110px;vertical-align:top"><b>' + k + '</b></td><td style="padding:10px 0;border-top:1px solid #d9dbff;font-size:14px">' + esc(v) + '</td></tr>').join('')
    + '</table><p style="margin:0;font-size:14px;line-height:1.6">La liste complète est dans Brevo : <b>Contacts › Listes › ' + VISIO.nom + '</b>.</p>',
    'Alerte automatique envoyée par haiko-academy.com');
}

async function inscriptionVisio(d, key) {
  const email = String(d.email || '').trim();
  const prenom = String(d.prenom || '').trim();
  const listId = await visioListId(key);
  const capList = Number(process.env.BREVO_CAP_LIST_ID || 14);
  const attributes = { FIRSTNAME: prenom };
  if (d.nom) attributes.LASTNAME = String(d.nom).trim();
  const sms = phone(d.telephone);
  if (sms) attributes.SMS = sms;
  const contact = { email, attributes, updateEnabled: true, listIds: [listId, capList].filter(Boolean) };
  let r = await brevo('/contacts', contact, key);
  if (!r.ok && attributes.SMS) { delete attributes.SMS; r = await brevo('/contacts', contact, key); }
  console.log('Brevo contact visio', listId, r.status, r.ok ? '' : r.txt);

  let total = 0;
  if (listId) { const l = await brevoGet('/contacts/lists/' + listId, key); total = (l.json && l.json.uniqueSubscribers) || 0; }

  const sender = { email: process.env.BREVO_SENDER_EMAIL || 'contact@centrehaiko.com', name: 'Haïko Academy' };
  const lien = process.env.VISIO_LINK || '';
  r = await brevo('/smtp/email', {
    sender, to: [{ email, name: prenom || email }], replyTo: { email: 'contact@centrehaiko.com', name: 'Haïko Academy' },
    subject: 'C\'est confirmé : visio CAP esthétique mercredi 4/11 à 19 h',
    htmlContent: mailVisio(prenom, lien), tags: ['visio-cap'],
  }, key);
  console.log('Brevo email visio', r.status, r.ok ? '' : r.txt);

  const admin = process.env.VISIO_NOTIFY_EMAIL || 'contact@centrehaiko.com';
  r = await brevo('/smtp/email', {
    sender: { email: sender.email, name: 'Site Haïko Academy' }, to: [{ email: admin }], replyTo: { email, name: (prenom + ' ' + (d.nom || '')).trim() || email },
    subject: 'Nouvelle inscrite visio CAP : ' + (prenom + ' ' + (d.nom || '')).trim() + (total ? ' (' + total + ' inscrites)' : ''),
    htmlContent: mailAlerte(d, total), tags: ['visio-cap-alerte'],
  }, key);
  console.log('Brevo alerte visio', r.status, r.ok ? '' : r.txt);
  return { statusCode: 200, body: 'ok' };
}

function mail(prenom, sujet, d, brochure) {
  const lignes = [['Formation', d.formation || d.formule], ['Motif', d.motif], ['Session', d.session], ['Message', d.message || d.question]].filter(([, v]) => v);
  const recap = lignes.length ? '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;border-collapse:collapse">' + lignes.map(([k, v]) => '<tr><td style="padding:10px 0;border-top:1px solid #d9dbff;font-size:14px;color:#000aff;width:110px;vertical-align:top"><b>' + k + '</b></td><td style="padding:10px 0;border-top:1px solid #d9dbff;font-size:14px;color:#000aff">' + esc(v) + '</td></tr>').join('') + '</table>' : '';
  const btn = brochure ? '<p style="margin:24px 0 0"><a href="' + esc(brochure) + '" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#000aff;color:#cdf564;font-weight:bold;text-decoration:none">Télécharger la brochure</a></p>' : '';
  return '<!doctype html><html><body style="margin:0;background:#fffcf1;font-family:Poppins,Arial,sans-serif;color:#000aff">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffcf1"><tr><td align="center" style="padding:32px 16px">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:28px">'
    + '<tr><td style="background:#000aff;border-radius:28px 28px 0 0;padding:28px 32px"><a href="https://haiko-academy.com" style="text-decoration:none"><img src="https://haiko-academy.com/images/logo-haiko-academy-lime.png" alt="Haïko Academy – École Supérieure d\'Esthétique" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0"></a></td></tr>'
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
  if (form === 'visio-cap') return inscriptionVisio(d, key);
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
