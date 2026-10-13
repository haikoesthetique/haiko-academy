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
            location.href='/merci?demande='+(form.getAttribute('data-demande')||'contact');
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
  var d=new URLSearchParams(location.search).get('demande');if(!d&&location.pathname.indexOf('/merci')===0){try{d=sessionStorage.getItem('haiko-demande');sessionStorage.removeItem('haiko-demande')}catch(e){}}
  var ok="Votre demande a bien été reçue. Nous revenons vers vous sous 48 h maximum.";
  var M={cap:['PROGRAMME CAP',ok],drainage:['DRAINAGE LYMPHATIQUE BRÉSILIEN',ok],kobido:['FORMATION KOBIDO',ok],maderotherapie:['FORMATION MADÉROTHÉRAPIE',ok],hydraface:['FORMATION HYDRAFACE',ok],nanoneedling:['FORMATION NANONEEDLING',ok],peeling:['FORMATION PEELING ESTHÉTIQUE',ok],rappel:['DEMANDE DE RAPPEL',"Merci, nous vous rappelons très vite."],contact:['CONTACT',"Votre message a bien été transmis. Nous revenons vers vous sous 48 h maximum."]};
  if(d&&M[d]){var e1=document.querySelector('[data-merci="eyebrow"]'),e2=document.querySelector('[data-merci="message"]');if(e1)e1.textContent=M[d][0];if(e2)e2.textContent=M[d][1];}
  // Bandeau cookies : GA et Meta chargés uniquement après consentement
  (function(){
    var GA_ID='', META_ID=''; // A RENSEIGNER : GA_ID='G-XXXXXXX' ; META_ID='identifiant Pixel Meta'
    var KEY='haiko-cookies', SIX=1000*60*60*24*182, loaded={};
    function read(){try{var c=JSON.parse(localStorage.getItem(KEY)||'null');if(c&&Date.now()-c.t<SIX)return c;}catch(e){}return null;}
    function load(src){var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s);}
    function apply(c){
      if(c.a&&GA_ID&&!loaded.ga){loaded.ga=1;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',GA_ID,{anonymize_ip:true});load('https://www.googletagmanager.com/gtag/js?id='+GA_ID);}
      if(c.m&&META_ID&&!loaded.meta){loaded.meta=1;var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};if(!window._fbq)window._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];load('https://connect.facebook.net/fr_FR/fbevents.js');window.fbq('init',META_ID);window.fbq('track','PageView');}
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
        +'<p style="margin:0 0 16px;font-size:14px;line-height:1.55">Avec votre accord, nous utilisons des cookies de mesure d’audience (Google Analytics) et de publicité (Meta). <a href="/mentions-legales#confidentialite" style="color:#cdf564;font-weight:600">En savoir plus</a></p>'
        +'<div data-ck-panel'+(custom?'':' hidden')+' style="margin:0 0 16px;padding:4px 0;border-top:1px solid rgba(255,252,241,0.3);border-bottom:1px solid rgba(255,252,241,0.3)">'+sw('ck-a','Mesure d’audience (Google Analytics)',c.a)+sw('ck-m','Publicité (Meta)',c.m)+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:10px">'+btn('Tout accepter','all')+btn('Tout refuser','none')+(custom?btn('Enregistrer mes choix','save'):btn('Personnaliser','custom'))+'</div>';
      document.body.appendChild(box);
      var first=box.querySelector('button');if(first&&custom)first.focus();
    }
    function save(a,m){var c={a:!!a,m:!!m,t:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}if(box){box.remove();box=null;}if((loaded.ga&&!c.a)||(loaded.meta&&!c.m)){location.reload();return;}apply(c);}
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
})();
