// Netlify Function : notification Alma (IPN). Compte les places une fois le paiement Alma accepté,
// et prévient l'équipe + l'élève pour une formule CAP avec e-learning (voir _acces-elearning.js).
const { store, compter } = require('./_places.js');
const { accesElearning } = require('./_acces-elearning.js');
exports.handler = async (event) => {
  const pid = (event.queryStringParameters || {}).pid;
  if (!pid) return { statusCode: 400, body: 'pid manquant' };
  const api = process.env.ALMA_MODE === 'live' ? 'https://api.getalma.eu' : 'https://api.sandbox.getalma.eu';
  const r = await fetch(api + '/v1/payments/' + encodeURIComponent(pid), { headers: { Authorization: 'Alma-Auth ' + process.env.ALMA_API_KEY } });
  if (!r.ok) return { statusCode: 502, body: 'Paiement introuvable' };
  const p = await r.json();
  if (['in_progress', 'paid'].includes(p.state)) {
    const cles = ((p.custom_data && p.custom_data.cles) || '').split(',').filter(Boolean);
    if (cles.length) await compter(store(event), cles, 'alma:' + pid);
    const c = p.customer || {}, m = p.custom_data || {};
    try { await accesElearning(store(event), { id: 'alma:' + pid, email: c.email, prenom: m.prenom || c.first_name || '', nom: m.nom || c.last_name || '', telephone: m.telephone || c.phone || '', formations: m.formations || '', mode: 'Alma, ' + (p.installments_count || '') + ' fois', statut: 'paid' }); } catch (e) { console.log('Accès e-learning, erreur', e.message); }
  }
  return { statusCode: 200, body: 'ok' };
};
