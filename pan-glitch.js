/* ══════════════════════════════════════════════════════════════
   PAN-GLITCH — eigenständig, greift in nichts anderes ein.
   Das "PAN" in der Kopfzeile glitcht in unregelmäßigen Abständen
   in die altgriechische Schreibweise (Πάν) und wieder zurück.

   - Wird per JS um das Wort "PAN" in .nav-brand gelegt, dafür muss
     am HTML nichts geändert werden.
   - Die Breite wird beim Wechsel fixiert, damit "Physio" daneben
     nicht wackelt.
   - Bei "Bewegung reduzieren" (Systemeinstellung) bleibt alles ruhig.
   - Pausiert, solange der Tab nicht sichtbar ist.

   Anpassen: Texte/Zeiten ganz oben (LATIN, GREEK, IDLE_MIN/MAX, HOLD_MS).
   Entfernen: diese Datei löschen bzw. die <script>-Einbindung in den
   HTML-Seiten entfernen.
   ══════════════════════════════════════════════════════════════ */
(function(){

  var LATIN = 'PAN';
  var GREEK = 'Πάν'; // Πάν (Π + ά mit Akzent + ν, jeweils ein Zeichen)
  var SCRAMBLE = 'ΠΦΨΩΞΣΔΛΘΓπφψωξσδλθγάέήίόύώ';
  var FIRST_MS = 3000;
  var IDLE_MIN = 6000;
  var IDLE_MAX = 11000;
  var HOLD_MS = 1500;
  var STEPS = 9;
  var STEP_MS = 48;

  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function boot(){
    var brand = document.querySelector('.nav-brand');
    if(!brand) return;

    // griechische Buchstaben: Playfair hat kein Griechisch -> GFS Didot (Didone, passt dazu)
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=GFS+Didot&display=swap&text=' +
      encodeURIComponent(GREEK + SCRAMBLE);
    document.head.appendChild(link);

    var style = document.createElement('style');
    style.textContent =
      '.pan-glitch{display:inline-block;white-space:nowrap;text-align:left;' +
      "font-family:'Playfair Display','GFS Didot',serif;will-change:transform;}";
    document.head.appendChild(style);

    // Text-Knoten "PAN " finden und das Wort in ein eigenes span legen
    var node = null;
    for(var i = 0; i < brand.childNodes.length; i++){
      var n = brand.childNodes[i];
      if(n.nodeType === 3 && n.textContent.indexOf(LATIN) !== -1){ node = n; break; }
    }
    if(!node) return;
    var rest = node.textContent.slice(node.textContent.indexOf(LATIN) + LATIN.length);
    var el = document.createElement('span');
    el.className = 'pan-glitch';
    el.textContent = LATIN;
    brand.insertBefore(el, node);
    node.textContent = rest;

    var timer = null;
    var busy = false;

    function rand(a, b){ return a + Math.random() * (b - a); }
    function pick(){ return SCRAMBLE.charAt(Math.floor(Math.random() * SCRAMBLE.length)); }

    function fx(intensity){
      var s = intensity * 1.4;
      var dx = (Math.random() * 2 - 1) * intensity * 1.6;
      el.style.transform = 'translate(' + dx.toFixed(1) + 'px,0)' +
        (Math.random() < 0.3 ? ' skewX(' + (Math.random() * 16 - 8).toFixed(0) + 'deg)' : '');
      el.style.textShadow = (-s).toFixed(1) + 'px 0 rgba(255,50,110,.75),' +
        s.toFixed(1) + 'px 0 rgba(0,230,255,.7)';
      el.style.opacity = Math.random() < 0.12 ? '0.55' : '';
    }

    function clearFx(){
      el.style.transform = '';
      el.style.textShadow = '';
      el.style.opacity = '';
    }

    function lockWidth(){
      el.style.width = 'auto';
      el.textContent = LATIN;
      el.style.width = el.getBoundingClientRect().width + 'px';
    }

    function reset(){
      clearTimeout(timer);
      busy = false;
      el.textContent = LATIN;
      clearFx();
      el.style.width = '';
    }

    // Text wechselt Buchstabe für Buchstabe von "from" nach "to", dazwischen Rauschen
    function morph(to, done){
      var step = 0;
      (function tick(){
        if(step >= STEPS){
          el.textContent = to;
          clearFx();
          done();
          return;
        }
        var out = '';
        for(var j = 0; j < to.length; j++){
          var resolved = (step / STEPS) > ((j + 1) / (to.length + 1)) * rand(0.6, 1.1);
          out += resolved ? to.charAt(j) : pick();
        }
        el.textContent = out;
        fx(1 + Math.sin((step / STEPS) * Math.PI) * 1.8);
        step++;
        timer = setTimeout(tick, STEP_MS);
      })();
    }

    function cycle(){
      busy = true;
      lockWidth();
      morph(GREEK, function(){
        // kurzes Flackern mitten im Halten
        timer = setTimeout(function(){
          el.textContent = pick() + GREEK.charAt(1) + GREEK.charAt(2);
          fx(1.6);
          timer = setTimeout(function(){
            el.textContent = GREEK;
            clearFx();
            timer = setTimeout(function(){
              morph(LATIN, function(){
                el.style.width = '';
                busy = false;
                schedule(rand(IDLE_MIN, IDLE_MAX));
              });
            }, HOLD_MS * 0.55);
          }, 90);
        }, HOLD_MS * 0.45);
      });
    }

    function schedule(ms){
      clearTimeout(timer);
      timer = setTimeout(cycle, ms);
    }

    // Tab im Hintergrund: sofort ruhigstellen, beim Zurückkommen frisch starten
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){
        reset();
      }else if(!busy){
        schedule(rand(2000, IDLE_MAX));
      }
    });

    schedule(FIRST_MS);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }

})();
