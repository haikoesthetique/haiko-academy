// Accès à l'espace élève LearnyBox après l'achat d'une formule CAP avec e-learning (E-learning ou Combo) sur le site.
// 1) e-mail d'alerte à l'équipe (ADMIN_EMAIL, par défaut contact@centrehaiko.com) avec le lien pour ajouter l'élève dans LearnyBox
// 2) e-mail à l'élève : paiement reçu, ses identifiants de connexion arrivent sous 24 h (envoyés par LearnyBox à l'ajout).
// Utilise les variables Netlify déjà en place : BREVO_API_KEY, BREVO_SENDER_EMAIL.
const LB_AJOUT = 'https://orinelservane.learnybox.com/app/formation/92874/membres/';
const ESPACE = 'https://espaceeleves.haiko-academy.com/';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const avecElearning = f => /Formule E-learning|Formule Combo/i.test(String(f || ''));

function cadre(titre, corps) {
  return '<!doctype html><html><body style="margin:0;background:#fffcf1;font-family:Poppins,Arial,sans-serif;color:#000aff">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffcf1"><tr><td align="center" style="padding:32px 16px">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:28px">'
    + '<tr><td style="background:#000aff;border-radius:28px 28px 0 0;padding:28px 32px"><img src="https://haiko-academy.com/images/logo-haiko-academy-lime.png" alt="Haïko Academy" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0"></td></tr>'
    + '<tr><td style="padding:32px"><p style="margin:0;font-size:24px;font-weight:bold;line-height:1.2">' + titre + '</p>' + corps + '</td></tr>'
    + '<tr><td style="padding:20px 32px;border-top:1px solid #d9dbff;font-size:12px;line-height:1.6;color:#000aff">Haïko Academy · 29 rue Edmond Rostand, 13006 Marseille · 07 56 97 91 88</td></tr>'
    + '</table></td></tr></table></body></html>';
}

async function envoyer(msg) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(msg) });
  console.log('Accès e-learning, e-mail', r.status, r.ok ? '' : await r.text());
}

// e : { id, email, prenom, nom, telephone, formations, mode, statut }
async function accesElearning(st, e) {
  if (!avecElearning(e.formations) || !e.email || !process.env.BREVO_API_KEY) return;
  const cle = 'acces-elearning/' + e.id;
  if (st && await st.get(cle)) return; // déjà traité (Stripe ou Alma peuvent renvoyer la notification)
  const sender = { email: process.env.BREVO_SENDER_EMAIL || 'contact@centrehaiko.com', name: 'Haïko Academy' };
  const admin = process.env.ADMIN_EMAIL || 'contact@centrehaiko.com';
  const ligne = (k, v) => '<tr><td style="padding:8px 0;border-top:1px solid #d9dbff;font-size:14px;width:120px"><b>' + k + '</b></td><td style="padding:8px 0;border-top:1px solid #d9dbff;font-size:14px">' + esc(v) + '</td></tr>';
  const enAttente = e.statut && e.statut !== 'paid';

  await envoyer({ sender, to: [{ email: admin, name: 'Haïko Academy' }], replyTo: { email: e.email, name: (e.prenom + ' ' + e.nom).trim() },
    subject: 'À faire : ajouter ' + e.prenom + ' ' + e.nom + ' dans LearnyBox (e-learning CAP)',
    htmlContent: cadre('Nouvel élève e-learning à ajouter',
      '<p style="margin:16px 0 0;font-size:16px;line-height:1.6">Un paiement vient d\'être fait sur haiko-academy.com. Ajoutez l\'élève dans la formation LearnyBox : il recevra automatiquement l\'e-mail de bienvenue avec ses identifiants.</p>'
      + (enAttente ? '<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#a3168f"><b>Prélèvement SEPA en cours d\'encaissement</b> (quelques jours). Vous pouvez attendre sa confirmation dans Stripe avant d\'ouvrir l\'accès.</p>' : '')
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse">'
      + ligne('Prénom', e.prenom) + ligne('Nom', e.nom) + ligne('E-mail', e.email) + ligne('Téléphone', e.telephone) + ligne('Formation', e.formations) + ligne('Paiement', e.mode) + '</table>'
      + '<p style="margin:8px 0 0"><a href="' + LB_AJOUT + '" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#000aff;color:#cdf564;font-weight:bold;text-decoration:none">Ajouter l\'élève dans LearnyBox</a></p>'
      + '<p style="margin:16px 0 0;font-size:13px;line-height:1.6">Dans LearnyBox : « Ajouter un membre », saisissez son prénom, son nom et son e-mail, puis validez.</p>') });

  await envoyer({ sender, to: [{ email: e.email, name: (e.prenom + ' ' + e.nom).trim() }], replyTo: { email: 'contact@centrehaiko.com', name: 'Haïko Academy' },
    subject: 'Votre inscription est confirmée : vos accès à l\'espace élève arrivent',
    htmlContent: cadre('Merci ' + esc(e.prenom) + ', votre inscription est confirmée !',
      '<p style="margin:16px 0 0;font-size:16px;line-height:1.6">Nous avons bien reçu votre ' + (enAttente ? 'mandat de prélèvement' : 'paiement') + ' pour <b>' + esc(e.formations) + '</b>.</p>'
      + '<p style="margin:12px 0 0;font-size:16px;line-height:1.6">Vous allez recevoir <b>sous 24 h</b> un second e-mail avec vos identifiants de connexion à votre espace élève Haïko Academy (cours, fiches, QCM et réservation de vos visios). Vous n\'avez rien à payer de plus.</p>'
      + '<p style="margin:12px 0 0;font-size:16px;line-height:1.6">Votre espace élève : <a href="' + ESPACE + '" style="color:#000aff;font-weight:bold">espaceeleves.haiko-academy.com</a></p>'
      + '<p style="margin:12px 0 0;font-size:15px;line-height:1.6">Pensez à vérifier vos courriers indésirables. Une question ? Répondez à cet e-mail ou appelez-nous au 07 56 97 91 88.</p>'
      + '<p style="margin:24px 0 0;font-size:15px">À très vite,<br><b>L\'équipe Haïko Academy</b></p>') });

  if (st) await st.set(cle, '1');
}
module.exports = { accesElearning, avecElearning };
