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
