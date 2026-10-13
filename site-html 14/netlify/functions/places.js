// Netlify Function : nombre d'inscrites par session (lu par le panier pour afficher « complet »).
const { store } = require('./_places.js');
const CAT = require('./catalogue.js');
exports.handler = async (event) => {
  const st = store(event), out = {};
  for (const p of CAT.produits) if (p.places) for (const s of p.sessions) {
    const v = await st.get(p.id + '@' + s.id, { type: 'json' });
    out[p.id + '@' + s.id] = { n: v ? v.n : 0, max: p.places };
  }
  return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(out) };
};
