// Netlify Function : notification Alma (IPN). Compte les places une fois le paiement Alma accepté.
const { store, compter } = require('./_places.js');
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
  }
  return { statusCode: 200, body: 'ok' };
};
