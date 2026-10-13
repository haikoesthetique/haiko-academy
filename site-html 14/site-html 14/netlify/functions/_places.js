const { getStore, connectLambda } = require('@netlify/blobs');
const store = (event) => { connectLambda(event); return getStore('inscriptions'); };
async function compter(st, cles, paiementId) {
  for (const k of cles) {
    const v = (await st.get(k, { type: 'json' })) || { n: 0, paiements: [] };
    if (v.paiements.includes(paiementId)) continue;
    v.n += 1; v.paiements.push(paiementId);
    await st.setJSON(k, v);
  }
}
module.exports = { store, compter };
