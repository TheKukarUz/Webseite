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

   Entfernen: diese Datei + weihnachten.css löschen (bzw. deren
   <link>/<script>-Einbindung aus den HTML-Seiten entfernen).
   ══════════════════════════════════════════════════════════════ */
(function(){

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
    var lkCards = document.querySelectorAll('.lk');
    var tcCards = document.querySelectorAll('.tc');
    var spots = [
      { box: lkCards[0], side: 'left',  offset: '8%'  },
      { box: lkCards[2], side: 'right', offset: '10%' },
      { box: tcCards[0], side: 'left',  offset: '50%' },
      { box: document.getElementById('praxis-wels'), side: 'right', offset: '12%' }
    ];
    spots.forEach(function(spot, i){
      if(!spot.box) return;
      var man = document.createElement('div');
      man.className = 'xmas-snowman';
      man.textContent = '⛄';
      man.style[spot.side] = spot.offset;
      man.style.animationDelay = (i * 1.2) + 's';
      spot.box.appendChild(man);
    });
  }

  function spawnShootingStar(){
    var star = document.createElement('div');
    star.className = 'xmas-star';

    var w = window.innerWidth, h = window.innerHeight;
    var margin = 140;
    var edge = Math.floor(Math.random() * 4); // 0 links, 1 rechts, 2 oben, 3 unten
    var x0, y0, x1, y1;
    if(edge === 0){
      x0 = -margin; y0 = Math.random() * h;
      x1 = w + margin; y1 = y0 + (Math.random() - 0.5) * h * 0.8;
    }else if(edge === 1){
      x0 = w + margin; y0 = Math.random() * h;
      x1 = -margin; y1 = y0 + (Math.random() - 0.5) * h * 0.8;
    }else if(edge === 2){
      x0 = Math.random() * w; y0 = -margin;
      x1 = x0 + (Math.random() - 0.5) * w * 0.8; y1 = h + margin;
    }else{
      x0 = Math.random() * w; y0 = h + margin;
      x1 = x0 + (Math.random() - 0.5) * w * 0.8; y1 = -margin;
    }
    var angle = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI + 180;
    star.style.setProperty('--x0', x0.toFixed(0) + 'px');
    star.style.setProperty('--y0', y0.toFixed(0) + 'px');
    star.style.setProperty('--x1', x1.toFixed(0) + 'px');
    star.style.setProperty('--y1', y1.toFixed(0) + 'px');
    star.style.setProperty('--ang', angle.toFixed(1) + 'deg');
    document.body.appendChild(star);
    requestAnimationFrame(function(){
      star.classList.add('xmas-star-run');
    });
    star.addEventListener('animationend', function(){ star.remove(); });
  }

  function scheduleShootingStars(){
    var delay = 10000 + Math.random() * 10000;
    starTimer = setTimeout(function(){
      spawnShootingStar();
      scheduleShootingStars();
    }, delay);
  }

  // Verhindert, dass sich beim Wegtabben aufgestaute Sternschnuppen
  // beim Zurückkommen alle auf einmal entladen: Timer pausieren,
  // solange der Tab nicht sichtbar ist, danach frisch neu starten.
  document.addEventListener('visibilitychange', function(){
    if(!running) return;
    if(document.hidden){
      if(starTimer) clearTimeout(starTimer);
    }else{
      if(starTimer) clearTimeout(starTimer);
      scheduleShootingStars();
    }
  });

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
