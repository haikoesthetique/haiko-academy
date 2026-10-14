// Panier Haïko Academy : ajout de formations, choix de session, paiement Stripe ou Alma via /.netlify/functions/checkout
(function () {
  // Dans l'éditeur (maquette DC), le DOM appartient à React : le panier ne s'active que sur le site publié.
  if (document.querySelector('x-dc') || window.DCLogic) return;
  var KEY = 'haiko-panier';
  function cat() { return window.HAIKO_CATALOGUE || { produits: [], sansDate: '' }; }
  function find(id) { return cat().produits.filter(function (p) { return p.id === id; })[0]; }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]').filter(function (i) { return find(i.id); }); } catch (e) { return []; } }
  function write(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} render(); }
  function eur(n) { return n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + '\u00a0€'; }
  function q(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var PLACES = {};
  function sess(p, id) { return p.sessions.filter(function (s) { return s.id === id; })[0]; }
  function label(i) { var p = find(i.id), s = p && sess(p, i.session); return s ? s.label : cat().sansDate; }
  function complet(id, sid) { var v = PLACES[id + '@' + sid]; return !!(v && v.n >= v.max); }
  function majPlaces() {
    document.querySelectorAll('select[data-session-for]').forEach(function (sel) {
      var id = sel.getAttribute('data-session-for'), libres = 0;
      [].forEach.call(sel.options, function (o) { var full = complet(id, o.value); o.disabled = full; if (full && o.text.indexOf('complet') < 0) o.text += ' — complet'; if (!full) libres++; });
      if (sel.selectedOptions[0] && sel.selectedOptions[0].disabled) { var free = [].filter.call(sel.options, function (o) { return !o.disabled; })[0]; if (free) sel.value = free.value; }
      var b = document.querySelector('[data-add="' + id + '"]'); if (b && !libres) { b.disabled = true; b.textContent = 'Complet'; }
    });
  }
  function add(id, session) {
    var p = find(id); if (!p) return;
    var items = read();
    if (items.some(function (i) { return i.id === id && i.session === session; })) { flash('Cette formation est déjà dans votre panier.'); return; }
    if (session && complet(id, session)) { flash('Cette session est complète.'); return; }
    items.push({ id: id, session: session || '' });
    write(items); flash('Ajoutée au panier : ' + p.nom);
  }
  function flash(t) { var f = q('[data-panier-flash]'); if (!f) return; f.textContent = t; f.hidden = false; clearTimeout(flash.t); flash.t = setTimeout(function () { f.hidden = true; }, 3500); }

  function render() {
    var items = read();
    document.querySelectorAll('[data-panier-count]').forEach(function (el) { el.textContent = items.length; });
    var list = q('[data-panier-liste]'); if (!list) return;
    var total = 0, allCap = items.length > 0;
    list.innerHTML = items.length ? items.map(function (i, n) {
      var p = find(i.id); total += p.prix; 
      return '<li style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;padding:14px 0;border-top:1px solid rgba(0,10,255,0.25)">' +
        '<span style="font-weight:600;font-size:15px;line-height:1.35">' + esc(p.nom) + '</span><span style="font-weight:700;font-size:15px;white-space:nowrap">' + eur(p.prix) + '</span>' +
        '<span style="font-size:13px;line-height:1.45">' + esc(label(i)) + (i.session && complet(i.id, i.session) ? ' — complet, à retirer' : '') + '</span>' +
        '<button type="button" data-retirer="' + n + '" style="justify-self:end;min-height:44px;padding:0 4px;border:0;background:none;color:#000aff;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer">Retirer</button></li>';
    }).join('') : '<li style="padding:14px 0;border-top:1px solid rgba(0,10,255,0.25);font-size:15px">Votre panier est vide.</li>';
    var t = q('[data-panier-total]'); if (t) t.textContent = eur(total);
    var needE = items.some(function (i) { return i.id === 'cap-elearning' || i.id === 'cap-combo'; });
    var lim = Date.now() + 15 * 864e5;
    var needD = items.some(function (i) { var m = String(i.session || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m && new Date(+m[1], +m[2] - 1, +m[3]).getTime() < lim; });
    [['elearning', needE], ['debut', needD]].forEach(function (x) { var l = q('[data-cb="' + x[0] + '"]'); if (!l) return; l.hidden = !x[1]; var inp = l.querySelector('input'); inp.required = x[1]; if (!x[1]) inp.checked = false; });
    var p10 = q('[data-plan-info="stripe-10"]'); if (p10) p10.textContent = allCap ? '10 × ' + eur(Math.round(total * 10) / 100) + ' par mois' : 'Réservé aux formules CAP';
    var b10 = q('[data-pay="stripe-10"]'); if (b10) b10.disabled = !allCap;
    var almaOk = !!cat().almaActif && total > 0 && total <= (cat().almaMax || 2000);
    ['2', '3', '4'].forEach(function (k) { var el = q('[data-plan-info="alma-' + k + '"]'); if (el) el.textContent = !total ? '' : almaOk ? k + ' × ' + eur(Math.round(total * 100 / Number(k)) / 100) : 'au-delà de ' + eur(cat().almaMax || 2000); });
    var p1 = q('[data-plan-info="stripe-1"]'); if (p1) p1.textContent = total ? eur(total) : '';
    document.querySelectorAll('[data-pay]').forEach(function (b) { var k = b.getAttribute('data-pay'); if (!items.length) b.disabled = true; else if (k.indexOf('alma') === 0) b.disabled = !almaOk; else if (k !== 'stripe-10') b.disabled = false; });
  }

  async function pay(plan) {
    var err = q('[data-panier-erreur]'); if (err) err.hidden = true;
    var f = q('#panier-client'); var items = read();
    if (!items.length) return;
    if (f && !f.reportValidity()) return;
    var d = new FormData(f);
    var client = { prenom: d.get('prenom'), nom: d.get('nom'), email: d.get('email'), telephone: d.get('telephone'), cgv: d.get('cgv') === 'on', renonciationElearning: d.get('renonciation_elearning') === 'on', debutAnticipe: d.get('debut_anticipe') === 'on' };
    var btns = document.querySelectorAll('[data-pay]'); btns.forEach(function (b) { b.dataset.wasDisabled = b.disabled; b.disabled = true; });
    try {
      var r = await fetch('/.netlify/functions/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: plan, items: items, client: client }) });
      var out = await r.json().catch(function () { return {}; });
      if (!r.ok || !out.url) throw new Error(out.error || 'Erreur ' + r.status);
      window.location.href = out.url;
    } catch (e) {
      if (err) { err.textContent = 'Le paiement n’a pas pu démarrer (' + e.message + '). Réessayez ou appelez-nous au 07 56 97 91 88.'; err.hidden = false; }
      btns.forEach(function (b) { b.disabled = b.dataset.wasDisabled === 'true'; });
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-add]');
    if (a) { e.preventDefault(); var id = a.getAttribute('data-add'); var s = q('select[data-session-for="' + id + '"]'); add(id, s ? s.value : ''); return; }
    var r = e.target.closest && e.target.closest('[data-retirer]');
    if (r) { var items = read(); items.splice(Number(r.getAttribute('data-retirer')), 1); write(items); return; }
    var p = e.target.closest && e.target.closest('[data-pay]');
    if (p) { e.preventDefault(); pay(p.getAttribute('data-pay')); }
  });

  function init() {
    if (!cat().almaActif) document.querySelectorAll('[data-alma]').forEach(function (el) { el.hidden = true; });
    var u = new URLSearchParams(location.search);
    if (u.get('add') && find(u.get('add'))) { var p = find(u.get('add')); var s0 = q('select[data-session-for="' + p.id + '"]'); add(p.id, s0 ? s0.value : (p.sessions[0] ? p.sessions[0].id : '')); history.replaceState(null, '', location.pathname + '#panier'); }
    if (u.get('annule')) { var m = q('[data-panier-annule]'); if (m) m.hidden = false; }
    if (q('[data-paiement-ok]')) { try { localStorage.removeItem(KEY); } catch (e) {} }
    render();
    if (q('select[data-session-for]')) fetch('/.netlify/functions/places').then(function (r) { return r.ok ? r.json() : {}; }).then(function (d) { PLACES = d || {}; majPlaces(); render(); }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
