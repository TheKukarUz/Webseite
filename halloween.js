/* ══════════════════════════════════════════════════════════════
   HALLOWEEN-MODUL — eigenständig, greift in nichts anderes ein.
   Aktiv automatisch vom 14. bis 31. Oktober, 23:59 (jedes Jahr, ohne
   dass etwas umgestellt werden muss).

   Test/Vorschau außerhalb der Saison:
     - URL mit ?halloween=1 aufrufen (immer an) bzw. ?halloween=0
       (immer aus)
     - oder einfach irgendwo auf der Seite "halloween" tippen
       (keine Eingabe in ein Feld nötig) — schaltet um (an/aus),
       unabhängig vom Datum. Funktioniert auf jeder Unterseite.

   Läuft nie zusammen mit dem Weihnachtsmodul (dort stehen an
   denselben Stellen die Schneemänner).

   Entfernen: diese Datei + halloween.css löschen (bzw. deren
   <link>/<script>-Einbindung aus den HTML-Seiten entfernen).
   ══════════════════════════════════════════════════════════════ */
(function(){

  var LEAF_COUNT = 16;
  var LEAF_CHARS = ['🍂', '🍁', '🍂'];
  var TRIGGER_WORD = 'halloween';

  var batTimer = null;
  var running = false;

  function isSeasonOrForced(){
    try{
      var params = new URLSearchParams(location.search);
      if(params.get('halloween') === '1') return true;
      if(params.get('halloween') === '0') return false;
    }catch(e){}
    var now = new Date();
    return now.getMonth() === 9 && now.getDate() >= 14 && now.getDate() <= 31;
  }

  function addLeaves(){
    for(var i = 0; i < LEAF_COUNT; i++){
      var leaf = document.createElement('div');
      leaf.className = 'hw-leaf';
      leaf.textContent = LEAF_CHARS[Math.floor(Math.random() * LEAF_CHARS.length)];
      var duration = 12 + Math.random() * 12;
      leaf.style.left = (Math.random() * 100) + 'vw';
      leaf.style.fontSize = (14 + Math.random() * 8) + 'px';
      leaf.style.opacity = (0.55 + Math.random() * 0.4).toFixed(2);
      leaf.style.animationDuration = duration + 's';
      leaf.style.animationDelay = '-' + (Math.random() * duration) + 's';
      document.body.appendChild(leaf);
    }
  }

  function addPumpkins(){
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
      var pumpkin = document.createElement('div');
      pumpkin.className = 'hw-pumpkin';
      pumpkin.textContent = '🎃';
      pumpkin.style[spot.side] = spot.offset;
      pumpkin.style.animationDelay = (i * 1.1) + 's, ' + (i * 0.9) + 's';
      spot.box.appendChild(pumpkin);
    });
  }

  function spawnBat(){
    var bat = document.createElement('div');
    bat.className = 'hw-bat';
    var inner = document.createElement('span');
    inner.textContent = '🦇';
    bat.appendChild(inner);

    var w = window.innerWidth, h = window.innerHeight;
    var margin = 80;
    var fromLeft = Math.random() < 0.5;
    var y0 = h * (0.1 + Math.random() * 0.6);
    var y1 = Math.max(0, Math.min(h, y0 + (Math.random() - 0.5) * h * 0.5));
    bat.style.setProperty('--x0', (fromLeft ? -margin : w + margin) + 'px');
    bat.style.setProperty('--y0', y0.toFixed(0) + 'px');
    bat.style.setProperty('--x1', (fromLeft ? w + margin : -margin) + 'px');
    bat.style.setProperty('--y1', y1.toFixed(0) + 'px');
    document.body.appendChild(bat);
    requestAnimationFrame(function(){
      bat.classList.add('hw-bat-run');
    });
    bat.addEventListener('animationend', function(e){
      if(e.target === bat) bat.remove();
    });
  }

  function scheduleBats(){
    var delay = 9000 + Math.random() * 9000;
    batTimer = setTimeout(function(){
      spawnBat();
      scheduleBats();
    }, delay);
  }

  // Verhindert, dass sich beim Wegtabben aufgestaute Fledermäuse
  // beim Zurückkommen alle auf einmal entladen: Timer pausieren,
  // solange der Tab nicht sichtbar ist, danach frisch neu starten.
  document.addEventListener('visibilitychange', function(){
    if(!running) return;
    if(batTimer) clearTimeout(batTimer);
    if(!document.hidden) scheduleBats();
  });

  function showToast(text){
    var toast = document.createElement('div');
    toast.textContent = text;
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);' +
      'background:rgba(8,10,12,0.95);border:1px solid rgba(255,140,0,0.45);color:#FF9A1F;' +
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
    document.body.classList.add('hw-active');
    addLeaves();
    addPumpkins();
    scheduleBats();
    if(!silent) showToast('🎃 Halloween-Modus aktiviert');
  }

  function deactivate(silent){
    if(!running) return;
    running = false;
    if(batTimer) clearTimeout(batTimer);
    document.body.classList.remove('hw-active');
    document.querySelectorAll('.hw-leaf, .hw-pumpkin, .hw-bat').forEach(function(el){ el.remove(); });
    if(!silent) showToast('Halloween-Modus beendet');
  }

  // ── Tastatur-Trigger: irgendwo "halloween" tippen schaltet um ──
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
    if(document.body.classList.contains('xmas-active')) return;
    if(isSeasonOrForced()) activate(true);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }

})();
