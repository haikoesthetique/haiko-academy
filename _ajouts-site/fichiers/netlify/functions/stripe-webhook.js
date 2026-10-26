// Netlify Function : webhook Stripe. Arrête automatiquement les paiements en plusieurs fois après la dernière échéance (10 par défaut, ou metadata « echeances »),
// et prévient l'équipe + l'élève quand une formule CAP avec e-learning est payée (accès LearnyBox, voir _acces-elearning.js).
// Dans Stripe > Développeurs > Webhooks, ajoutez l'URL https://haiko-academy.com/.netlify/functions/stripe-webhook
// avec l'événement « checkout.session.completed », puis copiez la clé de signature dans STRIPE_WEBHOOK_SECRET.
const crypto = require('crypto');
const { store, compter } = require('./_places.js');
const { accesElearning } = require('./_acces-elearning.js');
exports.handler = async (event) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET, key = process.env.STRIPE_SECRET_KEY;
  const sig = event.headers['stripe-signature'] || '';
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  const parts = Object.fromEntries(sig.split(',').map(s => s.split('=')));
  const expected = crypto.createHmac('sha256', secret || '').update(parts.t + '.' + raw).digest('hex');
  if (!secret || !parts.v1 || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1.padEnd(expected.length).slice(0, expected.length)))) return { statusCode: 400, body: 'Signature invalide' };
  const evt = JSON.parse(raw);
  if (evt.type === 'checkout.session.completed') {
    const o = evt.data.object, cles = ((o.metadata && o.metadata.cles) || '').split(',').filter(Boolean);
    if (cles.length) await compter(store(event), cles, 'stripe:' + o.id);
    const m = o.metadata || {};
    try { await accesElearning(store(event), { id: 'stripe:' + o.id, email: (o.customer_details && o.customer_details.email) || o.customer_email, prenom: m.prenom || '', nom: m.nom || '', telephone: m.telephone || '', formations: m.formations || '', mode: o.mode === 'subscription' ? 'Stripe, 10 fois (prélèvement SEPA)' : 'Stripe, 1 fois', statut: o.payment_status }); } catch (e) { console.log('Accès e-learning, erreur', e.message); }
  }
  if (evt.type === 'checkout.session.completed' && evt.data.object.mode === 'subscription' && evt.data.object.subscription) {
    // Nombre d'échéances : metadata « echeances » (lien de paiement ou site), 10 par défaut (paiement en 10 fois du site).
    const n = Math.max(2, parseInt((evt.data.object.metadata && evt.data.object.metadata.echeances) || '10', 10) || 10);
    const d = new Date(); d.setMonth(d.getMonth() + n - 1); d.setDate(d.getDate() + 15);
    await fetch('https://api.stripe.com/v1/subscriptions/' + evt.data.object.subscription, { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'cancel_at=' + Math.floor(d.getTime() / 1000) + '&proration_behavior=none' });
  }
  return { statusCode: 200, body: 'ok' };
};
