// ============================================================
// shared.js — utilities and VerifyPage module for all stops
// ============================================================

function normalize(s) {
    return s.trim().toLowerCase()
        .replace(/æ/g,'ae').replace(/ø/g,'o').replace(/å/g,'a')
        .replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ß/g,'ss')
        .replace(/[^\w\s]/g,'').replace(/\s+/g,' ');
}

function spawnSparkle(container, fast) {
    var el = document.createElement('div');
    el.className = 'sparkle';
    var s = Math.random()*4+2;
    el.style.width  = s+'px';
    el.style.height = s+'px';
    el.style.left   = Math.random()*100+'%';
    el.style.setProperty('--drift', (Math.random()-0.5)*(fast?100:60)+'px');
    var dur = fast ? Math.random()*2.5+2 : Math.random()*10+12;
    el.style.animationDuration = dur+'s';
    if (!fast) el.style.animationDelay = Math.random()*dur+'s';
    container.appendChild(el);
    if (fast) setTimeout(function(){ el.remove(); }, dur*1000+400);
}

function initSparkles(n) {
    var c = document.getElementById('sparkles');
    for (var i=0; i<(n||14); i++) spawnSparkle(c, false);
}

function burstSparkles(n) {
    var c = document.getElementById('sparkles');
    for (var i=0; i<(n||22); i++) spawnSparkle(c, true);
}

function burstConfetti(n) {
    var c    = document.getElementById('sparkles');
    var cols = ['#f0c988','#d6a05c','#8fdba8','#e69090','#f4ecdd','#c9b2e8','#9c6a34','#b2a5c2'];
    for (var i=0; i<(n||55); i++) {
        var el   = document.createElement('div');
        el.className = 'confetti';
        var sz   = Math.random()*9+4;
        var circ = Math.random()>0.4;
        Object.assign(el.style, {
            width:               sz+'px',
            height:              (circ ? sz : sz*(Math.random()*1.4+0.5))+'px',
            borderRadius:        circ ? '50%' : '2px',
            background:          cols[Math.floor(Math.random()*cols.length)],
            left:                Math.random()*100+'%',
            opacity:             (Math.random()*0.7+0.3).toString(),
            animationDuration:   (Math.random()*2+2.5)+'s',
            animationDelay:      (Math.random()*0.9)+'s',
            animationName:       'confetti-fall',
            animationTimingFunction: 'ease-in',
            animationFillMode:   'forwards'
        });
        el.style.setProperty('--rot',   (Math.random()*720-360)+'deg');
        el.style.setProperty('--drift', (Math.random()-0.5)*240+'px');
        c.appendChild(el);
        setTimeout(function(){ el.remove(); }, 4200);
    }
}

// ---- Global: inline celebration (confetti + button/message below the fields) ----
// successType: 'normal' -> next-btn link, 'scan-qr' -> qr message, 'final' -> end message
function revealInline(successType, nextPage) {
    burstConfetti(55);
    burstSparkles(28);
    setTimeout(function() {
        var inline = document.getElementById('cel-inline');
        if (!inline) return;
        inline.style.display = '';
        if (successType === 'scan-qr') {
            inline.innerHTML =
                '<p class="block-title">Find the QR code</p>' +
                '<p class="block-sub">Scan it at the location to unlock the next stop and continue.</p>';
        } else if (successType === 'final') {
            inline.innerHTML =
                '<p class="block-title">The journey is complete.</p>' +
                '<p class="block-sub">Every seal has been broken. Well done, you made it!</p>';
        } else {
            inline.innerHTML = '<a href="' + nextPage + '" class="next-btn">Next Stop -&gt;</a>';
        }
        inline.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 400);
}

// ---- VerifyPage: used by all verification stops (1, 2, 3, 5-12) ----
var VerifyPage = (function() {
    var cfg;
    var solved = new Set();

    function init(config) {
        cfg = config;
        solved = new Set();

        document.getElementById('eyebrow-label').textContent = cfg.stopLabel;
        document.getElementById('page-title').textContent    = cfg.pageTitle;
        document.getElementById('page-subtitle').textContent = cfg.pageSubtitle;
        document.title = 'Break Every Seal – ' + cfg.stopLabel;

        renderStrand();
        if (cfg.riddles && cfg.riddles.length) renderRiddleDisplay();
        renderChecks();
        initSparkles();
    }

    function renderStrand() {
        var el = document.getElementById('seal-strand');
        el.innerHTML = cfg.checks.map(function(_,i){
            return '<div class="seal-dot" id="dot-'+i+'">&amp;</div>';
        }).join('');
        refreshCount();
    }

    function refreshCount() {
        document.getElementById('seal-count').textContent = solved.size + ' / ' + cfg.checks.length;
    }

    function renderRiddleDisplay() {
        var wrap  = document.getElementById('riddles-display');
        var cards = document.getElementById('riddle-cards');
        var note  = document.getElementById('riddles-note');
        if (!wrap || !cards) return;
        wrap.style.display = '';
        if (note) note.textContent = cfg.riddlesNote || 'Read these together — they point to where you go next.';
        cards.innerHTML = cfg.riddles.map(function(r, i){
            return '<div class="card">' +
                '<div class="item-label">Note ' + String(i+1).padStart(2,'0') + '</div>' +
                '<div class="q-text">' + r + '</div>' +
            '</div>';
        }).join('');
    }

    function renderChecks() {
        document.getElementById('checks-container').innerHTML = cfg.checks.map(function(c,i){
            return '<div class="card" id="card-'+i+'">' +
              '<div class="stamp" id="stamp-'+i+'">&amp;</div>' +
              '<div class="item-label">'+c.label+'</div>' +
              '<div class="input-row">' +
                '<input type="text" id="inp-'+i+'" placeholder="Your answer" enterkeyhint="go" ' +
                  'onkeydown="if(event.key===\'Enter\')VerifyPage.check('+i+')">' +
                '<button class="btn-check" id="btn-'+i+'" onclick="VerifyPage.check('+i+')">Unseal</button>' +
              '</div>' +
              '<div class="feedback" id="fb-'+i+'"></div>' +
              (c.hint
                ? '<button class="hint-toggle" onclick="VerifyPage.toggleHint('+i+')">Need a nudge?</button>' +
                  '<div class="hint-text" id="hint-'+i+'">'+c.hint+'</div>'
                : '') +
            '</div>';
        }).join('');
    }

    function check(i) {
        if (solved.has(i)) return;
        var inp   = document.getElementById('inp-'+i);
        var fb    = document.getElementById('fb-'+i);
        var card  = document.getElementById('card-'+i);
        var btn   = document.getElementById('btn-'+i);
        var stamp = document.getElementById('stamp-'+i);
        var val   = normalize(inp.value);
        var ok    = val.length > 0 && cfg.checks[i].answers.some(function(a){ return normalize(a) === val; });

        if (ok) {
            solved.add(i);
            inp.disabled    = true;
            btn.textContent = 'Opened';
            btn.classList.add('done');
            fb.textContent  = 'Correct — the seal breaks.';
            fb.className    = 'feedback correct';
            stamp.classList.add('show');
            card.classList.add('solved');
            document.getElementById('dot-'+i).classList.add('opened');
            refreshCount();
            if (solved.size === cfg.checks.length) setTimeout(celebrate, 600);
        } else {
            fb.textContent = 'Not quite — try again.';
            fb.className   = 'feedback wrong';
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
        }
    }

    function toggleHint(i) {
        document.getElementById('hint-'+i).classList.toggle('show');
    }

    function celebrate() {
        if (cfg.successType === 'popup') {
            burstConfetti(55);
            burstSparkles(28);
            var sub    = document.getElementById('cel-sub');
            var action = document.getElementById('cel-action');
            sub.textContent  = "You've solved this stop.";
            action.innerHTML = '<a href="' + cfg.nextPage + '" class="next-btn">Next Stop -&gt;</a>';
            setTimeout(function(){ document.getElementById('cel-overlay').classList.add('show'); }, 80);
        } else {
            revealInline(cfg.successType, cfg.nextPage);
        }
    }

    return { init: init, check: check, toggleHint: toggleHint };
})();
