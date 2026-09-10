/* ══════════════════════════════════════════════════════════════
   WEIHNACHTS-MODUL — eigenständig, greift in nichts anderes ein.
   Aktiv automatisch vom 1. bis 25. Dezember (jedes Jahr, ohne
   dass etwas umgestellt werden muss).

   Test/Vorschau außerhalb der Saison:
     - URL mit ?xmas=1 aufrufen (immer an) bzw. ?xmas=0 (immer aus)
     - oder einfach irgendwo auf der Seite "weihnachten" tippen
       (keine Eingabe in ein Feld nötig) — schaltet um (an/aus),
       unabhängig vom Datum. Funktioniert auf jeder Unterseite.
       Nochmal "weihnachten" tippen schaltet wieder ab.

   Auf welchen Elementen die Schnee-Anhäufung erscheint, wird
   unten in SNOWCAP_SELECTORS festgelegt — einfach anpassen,
   ohne dass an anderer Stelle im Code etwas geändert werden muss.

   Entfernen: diese Datei + weihnachten.css löschen (bzw. deren
   <link>/<script>-Einbindung aus den HTML-Seiten entfernen).
   ══════════════════════════════════════════════════════════════ */
(function(){

  var SNOWCAP_SELECTORS = '.lk, .tc, .praxis-card, .rev-card';
  var FLAKE_COUNT = 22;
  var FLAKE_CHARS = ['❄', '❅', '❆'];
  var TRIGGER_WORD = 'weihnachten';

  var starTimer = null;
  var running = false;

  function isSeasonOrForced(){
    try{
      var params = new URLSearchParams(location.search);
      if(params.get('xmas') === '1') return true;
      if(params.get('xmas') === '0') return false;
    }catch(e){}
    var now = new Date();
    return now.getMonth() === 11 && now.getDate() >= 1 && now.getDate() <= 25;
  }

  function addSnowcaps(){
    document.querySelectorAll(SNOWCAP_SELECTORS).forEach(function(el){
      el.classList.add('xmas-snowcap');
    });
  }

  function removeSnowcaps(){
    document.querySelectorAll('.xmas-snowcap').forEach(function(el){
      el.classList.remove('xmas-snowcap');
    });
  }

  function addFlakes(){
    for(var i = 0; i < FLAKE_COUNT; i++){
      var flake = document.createElement('div');
      flake.className = 'xmas-flake';
      flake.textContent = FLAKE_CHARS[Math.floor(Math.random() * FLAKE_CHARS.length)];
      var duration = 10 + Math.random() * 12;
      flake.style.left = (Math.random() * 100) + 'vw';
      flake.style.fontSize = (10 + Math.random() * 8) + 'px';
      flake.style.opacity = (0.5 + Math.random() * 0.4).toFixed(2);
      flake.style.animationDuration = duration + 's';
      flake.style.animationDelay = '-' + (Math.random() * duration) + 's';
      document.body.appendChild(flake);
    }
  }

  function addSnowmen(){
    var spots = [
      {left: '14px', bottom: '18px'},
      {right: '18px', bottom: '80px'}
    ];
    spots.forEach(function(spot, i){
      var man = document.createElement('div');
      man.className = 'xmas-snowman';
      man.textContent = '⛄';
      Object.keys(spot).forEach(function(key){ man.style[key] = spot[key]; });
      man.style.animationDelay = (i * 1.5) + 's';
      document.body.appendChild(man);
    });
  }

  function spawnShootingStar(){
    var star = document.createElement('div');
    star.className = 'xmas-star';
    star.style.top = (Math.random() * 35) + 'vh';
    star.style.left = (55 + Math.random() * 35) + 'vw';
    document.body.appendChild(star);
    requestAnimationFrame(function(){
      star.classList.add('xmas-star-run');
    });
    star.addEventListener('animationend', function(){ star.remove(); });
  }

  function scheduleShootingStars(){
    var delay = 10000 + Math.random() * 15000;
    starTimer = setTimeout(function(){
      spawnShootingStar();
      scheduleShootingStars();
    }, delay);
  }

  function showToast(text){
    var toast = document.createElement('div');
    toast.textContent = text;
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);' +
      'background:rgba(8,10,12,0.95);border:1px solid rgba(201,168,76,0.4);color:#C9A84C;' +
      'font-family:"DM Sans",sans-serif;font-size:12px;letter-spacing:0.06em;padding:10px 20px;' +
      'border-radius:6px;z-index:9998;opacity:0;transition:opacity .3s;pointer-events:none;';
    document.body.appendChild(toast);
    requestAnimationFrame(function(){ toast.style.opacity = '1'; });
    setTimeout(function(){
      toast.style.opacity = '0';
      setTimeout(function(){ toast.remove(); }, 300);
    }, 2200);
  }

  function activate(silent){
    if(running) return;
    running = true;
    document.body.classList.add('xmas-active');
    addSnowcaps();
    addFlakes();
    addSnowmen();
    scheduleShootingStars();
    if(!silent) showToast('❄ Weihnachtsmodus aktiviert');
  }

  function deactivate(silent){
    if(!running) return;
    running = false;
    if(starTimer) clearTimeout(starTimer);
    document.body.classList.remove('xmas-active');
    removeSnowcaps();
    document.querySelectorAll('.xmas-flake, .xmas-snowman, .xmas-star').forEach(function(el){ el.remove(); });
    if(!silent) showToast('Weihnachtsmodus beendet');
  }

  // ── Tastatur-Trigger: irgendwo "weihnachten" tippen schaltet um ──
  var typedBuffer = '';
  document.addEventListener('keydown', function(e){
    var tag = (e.target && e.target.tagName || '').toUpperCase();
    if(tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
    if(!e.key || e.key.length !== 1) return;
    typedBuffer = (typedBuffer + e.key).slice(-TRIGGER_WORD.length).toLowerCase();
    if(typedBuffer === TRIGGER_WORD){
      typedBuffer = '';
      if(running) deactivate(); else activate();
    }
  });

  function init(){
    if(isSeasonOrForced()) activate(true);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }

})();
