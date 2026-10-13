// Netlify Function : crée le paiement Stripe (1 fois ou 10 fois) ou Alma (2, 3 ou 4 fois).
// Variables d'environnement à définir dans Netlify > Site configuration > Environment variables :
//   STRIPE_SECRET_KEY   (sk_live_... ou sk_test_...)
//   ALMA_API_KEY        (clé API Alma, live ou test)
//   ALMA_MODE           ("live" ou "test")
const CAT = require('./catalogue.js');
const { store } = require('./_places.js');

const json = (code, body) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const form = (obj, prefix, out = []) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '[' + k + ']' : k;
    if (v && typeof v === 'object') form(v, key, out); else if (v !== undefined) out.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
  }
  return out.join('&');
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });
  let data; try { data = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Requête invalide' }); }
  const { plan, items, client } = data;
  const base = process.env.URL || ('https://' + event.headers.host);
  if (!Array.isArray(items) || !items.length || items.length > 10) return json(400, { error: 'Panier vide ou invalide' });
  if (!client || !client.email || !client.prenom || !client.nom || !client.telephone) return json(400, { error: 'Coordonnées incomplètes' });
  if (!client.cgv) return json(400, { error: 'Les conditions générales de vente doivent être acceptées' });
  const lignes = [];
  for (const it of items) {
    const p = CAT.produits.find(x => x.id === it.id);
    if (!p) return json(400, { error: 'Formation inconnue' });
    let s = null;
    if (p.sessions.length) { s = p.sessions.find(x => x.id === it.session); if (!s) return json(400, { error: 'Session invalide pour ' + p.nom }); }
    lignes.push({ p, s, session: s ? s.label : CAT.sansDate, cle: s ? p.id + '@' + s.id : null });
  }
  const st = store(event);
  for (const l of lignes) {
    if (!l.cle || !l.p.places) continue;
    const v = await st.get(l.cle, { type: 'json' });
    if (v && v.n >= l.p.places) return json(409, { error: 'La session « ' + l.session + ' » de ' + l.p.nom + ' est complète' });
  }
  const cles = lignes.filter(l => l.cle && l.p.places).map(l => l.cle).join(',');
  const total = lignes.reduce((s, l) => s + l.p.prix * 100, 0);
  const resume = lignes.map(l => l.p.nom + ' — ' + l.session).join(' | ').slice(0, 480);
  const meta = { cles: cles.slice(0, 490), formations: resume, prenom: client.prenom, nom: client.nom, telephone: client.telephone };

  if (plan === 'stripe-1' || plan === 'stripe-10') {
    const key = process.env.STRIPE_SECRET_KEY; if (!key) return json(500, { error: 'Paiement Stripe non configuré' });
    const dix = plan === 'stripe-10';
    if (dix && lignes.some(l => l.p.groupe !== 'cap')) return json(400, { error: 'Le paiement en 10 fois est réservé aux formules CAP' });
    const body = { mode: dix ? 'subscription' : 'payment', customer_email: client.email, locale: 'fr',
      success_url: base + '/paiement-confirme?session_id={CHECKOUT_SESSION_ID}', cancel_url: base + '/inscription?annule=1', metadata: meta, line_items: {} };
    lignes.forEach((l, i) => {
      const pd = { currency: 'eur', product_data: { name: l.p.nom, description: l.session }, unit_amount: dix ? Math.round(l.p.prix * 10) : l.p.prix * 100 };
      if (dix) pd.recurring = { interval: 'month' };
      body.line_items[i] = { price_data: pd, quantity: 1 };
    });
    if (dix) body.subscription_data = { metadata: { ...meta, echeances: '10' } };
    else body.payment_intent_data = { metadata: meta };
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form(body) });
    const out = await r.json();
    if (!r.ok) return json(502, { error: (out.error && out.error.message) || 'Erreur Stripe' });
    return json(200, { url: out.url });
  }

  const m = /^alma-([234])$/.exec(plan || '');
  if (m) {
    if (total > (CAT.almaMax || 2000) * 100) return json(400, { error: 'Le paiement en 2, 3 ou 4 fois n’est pas disponible au-delà de ' + (CAT.almaMax || 2000) + ' €' });
    const key = process.env.ALMA_API_KEY; if (!key) return json(500, { error: 'Paiement Alma non configuré' });
    const api = process.env.ALMA_MODE === 'live' ? 'https://api.getalma.eu' : 'https://api.sandbox.getalma.eu';
    const body = { payment: { purchase_amount: total, installments_count: Number(m[1]), locale: 'fr', return_url: base + '/paiement-confirme?alma=1', customer_cancel_url: base + '/inscription?annule=1', ipn_callback_url: base + '/.netlify/functions/alma-ipn', custom_data: meta },
      customer: { first_name: client.prenom, last_name: client.nom, email: client.email, phone: client.telephone } };
    const r = await fetch(api + '/v1/payments', { method: 'POST', headers: { Authorization: 'Alma-Auth ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const out = await r.json().catch(() => ({}));
    if (!r.ok || !out.url) return json(502, { error: out.message || out.error || 'Paiement Alma indisponible pour ce montant' });
    return json(200, { url: out.url });
  }
  return json(400, { error: 'Mode de paiement inconnu' });
};
