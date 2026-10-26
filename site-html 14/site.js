(function(){
  var menu=document.getElementById('menu-mobile'),btn=document.querySelector('[aria-controls="menu-mobile"]');
  function setMenu(o){if(!menu)return;if(o)menu.removeAttribute('hidden');else menu.setAttribute('hidden','');if(btn)btn.setAttribute('aria-expanded',o?'true':'false');document.body.style.overflow=o?'hidden':'';}
  if(btn)btn.addEventListener('click',function(){setMenu(true);});
  if(menu)menu.querySelectorAll('button,a').forEach(function(el){el.addEventListener('click',function(){setMenu(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){setMenu(false);document.querySelectorAll('header details[open]').forEach(function(d){d.removeAttribute('open');});}});
  document.addEventListener('click',function(e){document.querySelectorAll('header details[open]').forEach(function(d){if(!d.contains(e.target))d.removeAttribute('open');});});
  document.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){var r=document.querySelector('input[name="formule"][value="'+a.getAttribute('data-pick')+'"]');if(r)r.checked=true;});});
  document.querySelectorAll('[data-map]').forEach(function(b){b.addEventListener('click',function(){var c=document.getElementById('carte-haiko');if(c)c.innerHTML='<iframe src="https://www.google.com/maps?q=29+rue+Edmond+Rostand+13006+Marseille&output=embed" title="Carte Google Maps : Haïko, 29 rue Edmond Rostand, 13006 Marseille" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>';});});
  document.querySelectorAll('[data-until]').forEach(function(el){if(Date.now()>Date.parse(el.getAttribute('data-until')))el.remove();});
  // Envoi Netlify Forms (urlencoded vers "/")
  document.querySelectorAll('[data-formation]').forEach(function(a){a.addEventListener('click',function(){var s=document.querySelector('form[name="rappel"] [name="formation"]');if(s)s.value=a.getAttribute('data-formation');});});
  document.querySelectorAll('form[name="rappel"]').forEach(function(f){f.addEventListener('submit',function(){try{sessionStorage.setItem('haiko-demande','rappel')}catch(e){}});});
  document.querySelectorAll('form[data-netlify]:not([name="rappel"])').forEach(function(form){
    var box=document.createElement('p');box.setAttribute('role','alert');box.hidden=true;box.style.cssText='margin:0;padding:14px 18px;border-radius:16px;background:#fffcf1;color:#000aff;border:2px solid #000aff;font-size:15px;line-height:1.5';
    var btn=form.querySelector('button[type="submit"]');if(btn)btn.insertAdjacentElement('afterend',box);else form.appendChild(box);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      box.hidden=true;if(btn)btn.disabled=true;
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Erreur " + res.status);
          if (form.getAttribute('name')==='rappel') {
            var p=(form.querySelector('[name="prenom"]')||{}).value||'';
            var m=document.createElement('div');m.setAttribute('role','status');m.style.cssText='display:flex;flex-direction:column;gap:12px;padding:8px 0';
            var h=document.createElement('p');h.style.cssText='margin:0;font-weight:700;font-size:clamp(24px,2.2vw,32px);line-height:1.1;letter-spacing:-0.04em;color:#000aff';h.textContent='Merci '+p.trim()+' ! On vous rappelle très vite.';
            m.appendChild(h);form.replaceWith(m);
          } else {
            location.href='/merci/?demande='+(form.getAttribute('data-demande')||'contact');
          }
        })
        .catch(function () {
          if(btn)btn.disabled=false;
          box.innerHTML='L’envoi n’a pas abouti. Réessayez, ou appelez-nous au <a href="tel:+33756979188" style="color:#000aff;font-weight:600">07 56 97 91 88</a>.';
          box.hidden=false;
        });
    });
  });
  // Formulaires : envoyés par Netlify Forms (notifications email à configurer dans Netlify > Forms).
  var d=new URLSearchParams(location.search).get('demande');if(!d&&location.pathname.indexOf('/merci/')===0){try{d=sessionStorage.getItem('haiko-demande');sessionStorage.removeItem('haiko-demande')}catch(e){}}
  var ok="Votre demande a bien été reçue. Nous revenons vers vous sous 48 h maximum.";
  var M={cap:['PROGRAMME CAP',ok],drainage:['DRAINAGE LYMPHATIQUE BRÉSILIEN',ok],kobido:['FORMATION KOBIDO',ok],maderotherapie:['FORMATION MADÉROTHÉRAPIE',ok],hydraface:['FORMATION HYDRAFACE',ok],nanoneedling:['FORMATION NANONEEDLING',ok],peeling:['FORMATION PEELING ESTHÉTIQUE',ok],rappel:['DEMANDE DE RAPPEL',"Merci, nous vous rappelons très vite."],visio:['VISIO CAP ESTHÉTIQUE · 4 NOVEMBRE',"Votre place est réservée ! Un e-mail de confirmation vient de vous être envoyé avec toutes les informations pour la visio du mercredi 4 novembre à 19 h. Pensez à vérifier vos spams."],contact:['CONTACT',"Votre message a bien été transmis. Nous revenons vers vous sous 48 h maximum."]};
  if(d&&M[d]){var e1=document.querySelector('[data-merci="eyebrow"]'),e2=document.querySelector('[data-merci="message"]');if(e1)e1.textContent=M[d][0];if(e2)e2.textContent=M[d][1];}
  var eb=document.querySelector('[data-merci="brochure"]');if(eb&&d&&d!=='cap'&&d!=='rappel')eb.remove();
  // Pop-up « Visio gratuite CAP esthétique » : s'ouvre 3 s après l'arrivée, jusqu'au 4/11/2026 19 h
  (function(){
    var FIN=Date.parse('2026-11-04T19:00:00+01:00'), KEY='haiko-popup-visio-cap', URL='/visio-cap-esthetique/';
    function mark(val){try{localStorage.setItem(KEY,val);sessionStorage.setItem(KEY,'1');}catch(e){}}
    document.querySelectorAll('form[name="visio-cap"]').forEach(function(f){f.addEventListener('submit',function(){mark('inscrite');});});
    if(Date.now()>FIN)return;
    if(/^\/(visio-cap-esthetique|merci|paiement-confirme)/.test(location.pathname))return;
    try{var v=localStorage.getItem(KEY);if(v==='inscrite'||(v&&Date.now()-(+v)<1000*60*60*24*2))return;if(sessionStorage.getItem(KEY))return;}catch(e){}
    function busy(){var m=document.getElementById('menu-mobile');return document.querySelector('[role="dialog"][aria-label="Gestion des cookies"]')||(m&&!m.hasAttribute('hidden'));}
    function wait(){if(busy()){setTimeout(wait,600);return;}open();}
    setTimeout(wait,3000);
    function open(){
      var last=document.activeElement;
      var ov=document.createElement('div');
      ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Visio gratuite : tout savoir sur le CAP esthétique en candidat libre, mercredi 4 novembre à 19 h');
      ov.style.cssText='position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,6,90,0.55);opacity:0;transition:opacity .3s';
      ov.innerHTML='<div style="position:relative;width:min(100%,720px);transform:translateY(16px) scale(.98);transition:transform .35s cubic-bezier(.2,.8,.2,1)" data-pop-card>'
        +'<a href="'+URL+'" data-pop-go style="display:block;border-radius:clamp(20px,3vw,32px);overflow:hidden;box-shadow:0 30px 80px rgba(0,10,40,0.35);background:#fffcf1"><img src="/images/visio-cap-esthetique-04-11.jpg" alt="Visio gratuite : tout savoir sur le CAP esthétique en candidat libre. Mercredi 04/11 à 19 h. Je m’inscris" width="1200" height="900" style="display:block;width:100%;height:auto;max-height:calc(100vh - 120px);object-fit:contain"></a>'
        +'<button type="button" data-pop-close aria-label="Fermer" style="position:absolute;top:-14px;right:-6px;width:48px;height:48px;border-radius:999px;border:2px solid #fffcf1;background:#000aff;color:#fffcf1;font:700 22px/1 Poppins,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,10,40,0.3)">×</button>'
        +'</div>';
      document.body.appendChild(ov);
      var prevOv=document.body.style.overflow;document.body.style.overflow='hidden';
      requestAnimationFrame(function(){ov.style.opacity='1';ov.querySelector('[data-pop-card]').style.transform='none';});
      var close=ov.querySelector('[data-pop-close]');close.focus();
      function shut(){mark(String(Date.now()));document.body.style.overflow=prevOv;ov.remove();document.removeEventListener('keydown',key);if(last&&last.focus)last.focus();}
      function key(e){if(e.key==='Escape')shut();if(e.key==='Tab'){var f=[ov.querySelector('[data-pop-go]'),close];if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[1].focus();}else if(!e.shiftKey&&document.activeElement===f[1]){e.preventDefault();f[0].focus();}}}
      document.addEventListener('keydown',key);
      close.addEventListener('click',shut);
      ov.addEventListener('click',function(e){if(e.target===ov)shut();});
      ov.querySelector('[data-pop-go]').addEventListener('click',function(){mark(String(Date.now()));});
    }
  })();
  // Bandeau cookies : GA et Meta chargés uniquement après consentement
  (function(){
    var GA_ID='', META_ID='', ADS_ID='AW-366799775'; // A RENSEIGNER : GA_ID='G-XXXXXXX' ; META_ID='identifiant Pixel Meta'
    var KEY='haiko-cookies', SIX=1000*60*60*24*182, loaded={};
    function read(){try{var c=JSON.parse(localStorage.getItem(KEY)||'null');if(c&&Date.now()-c.t<SIX)return c;}catch(e){}return null;}
    function load(src){var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s);}
    function apply(c){
      if(c.a&&GA_ID&&!loaded.ga){loaded.ga=1;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',GA_ID,{anonymize_ip:true});load('https://www.googletagmanager.com/gtag/js?id='+GA_ID);}
      if(c.m&&META_ID&&!loaded.meta){loaded.meta=1;var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};if(!window._fbq)window._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];load('https://connect.facebook.net/fr_FR/fbevents.js');window.fbq('init',META_ID);window.fbq('track','PageView');}
      if(c.m&&ADS_ID&&!loaded.ads){loaded.ads=1;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:c.a?'granted':'denied'});window.gtag('js',new Date());window.gtag('config',ADS_ID);load('https://www.googletagmanager.com/gtag/js?id='+ADS_ID);}
    }
    var box=null;
    function btn(label,act){return '<button type="button" data-ck="'+act+'" style="flex:1 1 140px;min-height:48px;padding:0 18px;border-radius:999px;border:2px solid #cdf564;background:#cdf564;color:#000aff;font:inherit;font-weight:700;font-size:15px;cursor:pointer">'+label+'</button>';}
    function sw(id,label,on){return '<label style="display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:48px;font-size:15px;font-weight:600;cursor:pointer">'+label+'<input type="checkbox" role="switch" id="'+id+'"'+(on?' checked':'')+' style="flex:none;width:22px;height:22px;accent-color:#cdf564;cursor:pointer"></label>';}
    function show(custom){
      var c=read()||{a:false,m:false};
      if(box)box.remove();
      box=document.createElement('div');
      box.setAttribute('role','dialog');box.setAttribute('aria-label','Gestion des cookies');
      box.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:100;max-width:680px;margin:0 auto;max-height:80vh;overflow:auto;background:#000aff;color:#fffcf1;border-radius:28px;padding:clamp(18px,3vw,28px);font-family:Poppins,sans-serif;box-shadow:0 20px 60px rgba(0,10,40,0.3)';
      box.innerHTML='<p style="margin:0 0 6px;font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#cdf564">Vos choix de cookies</p>'
        +'<p style="margin:0 0 16px;font-size:14px;line-height:1.55">Avec votre accord, nous utilisons des cookies de mesure d’audience et de publicité, pour comprendre comment notre site est utilisé et mesurer l’efficacité de nos annonces. <a href="/mentions-legales/#confidentialite" style="color:#cdf564;font-weight:600">En savoir plus</a></p>'
        +'<div data-ck-panel'+(custom?'':' hidden')+' style="margin:0 0 16px;padding:4px 0;border-top:1px solid rgba(255,252,241,0.3);border-bottom:1px solid rgba(255,252,241,0.3)">'+sw('ck-a','Mesure d’audience',c.a)+sw('ck-m','Publicité et mesure des annonces',c.m)+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:10px">'+btn('Tout accepter','all')+btn('Tout refuser','none')+(custom?btn('Enregistrer mes choix','save'):btn('Personnaliser','custom'))+'</div>';
      document.body.appendChild(box);
      var first=box.querySelector('button');if(first&&custom)first.focus();
    }
    function save(a,m){var c={a:!!a,m:!!m,t:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}if(box){box.remove();box=null;}if((loaded.ga&&!c.a)||((loaded.meta||loaded.ads)&&!c.m)){location.reload();return;}apply(c);}
    document.addEventListener('click',function(e){
      var t=e.target.closest&&e.target.closest('[data-ck],[data-cookies]');if(!t)return;
      if(t.hasAttribute('data-cookies')){e.preventDefault();show(true);return;}
      var k=t.getAttribute('data-ck');
      if(k==='all')save(true,true);else if(k==='none')save(false,false);
      else if(k==='custom')show(true);
      else if(k==='save')save(box.querySelector('#ck-a').checked,box.querySelector('#ck-m').checked);
    });
    var c=read();if(c)apply(c);else show(false);
  })();
(function(){var m=new URLSearchParams(location.search).get('motif');if(!m)return;var r=document.querySelector('input[name="motif"][value="'+m+'"]');if(r)r.checked=true;})();
(function(){var r=document.querySelector('[data-sim-input]');if(!r)return;var q=function(s){return document.querySelector(s);};function up(){var h=+r.value,w=h===2?104:Math.ceil(200/h),m=h===2?24:Math.min(24,Math.max(3,Math.round(200/h/4.33)));q('[data-sim-h]').textContent=h+' h';q('[data-sim-h2]').textContent=h;q('[data-sim-mois]').textContent=m;q('[data-sim-semaines]').textContent=w;q('[data-sim-rythme]').textContent=h<=4?'Un rythme doux, compatible avec un emploi à temps plein.':h<=9?'Un rythme régulier, idéal pour une reconversion en parallèle de votre activité.':'Un rythme soutenu, pour passer l\'examen rapidement.';r.setAttribute('aria-valuetext',h+' heures par semaine, environ '+m+' mois');}r.addEventListener('input',up);up();})();
})();
