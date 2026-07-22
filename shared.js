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
// successType: 'normal' -> next-btn, 'scan-qr' -> find-qr message, 'final' -> end message
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

// ============================================================
// VerifyPage — unified section-based module for all stops
//
// Config shape:
//   {
//     stopLabel, pageTitle, pageSubtitle,
//     successType: 'normal' | 'popup' | 'scan-qr' | 'final',
//     nextPage: 'stopN.html',
//     sections: [
//       {
//         title: "Section Title",   // optional
//         note:  "Subtitle text",   // optional
//         items: [
//           { type: 'text',    label, question, answers, hint },
//           { type: 'date',    label, answers, hint },
//           { type: 'audio',   src, answers, hint },
//           { type: 'display', label, text },   // read-only, no answer required
//         ]
//       }
//     ]
//   }
// ============================================================
var VerifyPage = (function() {
    var cfg;
    var solved    = new Set();
    var countable = [];  // items that need an answer, indexed by their global _idx

    function init(config) {
        cfg       = config;
        solved    = new Set();
        countable = [];
        var audioCount = 0;

        cfg.sections.forEach(function(s) {
            s.items.forEach(function(item) {
                if (item.type !== 'display') {
                    item._idx = countable.length;
                    countable.push(item);
                }
                if (item.type === 'audio') {
                    item._num = ++audioCount;
                }
            });
        });

        document.getElementById('eyebrow-label').textContent = cfg.stopLabel;
        document.getElementById('page-title').textContent    = cfg.pageTitle;
        document.getElementById('page-subtitle').textContent = cfg.pageSubtitle;
        document.title = 'Break Every Seal - ' + cfg.stopLabel;

        renderStrand();
        renderSections();
        attachAllAudio();
        initSparkles();
    }

    function renderStrand() {
        var el = document.getElementById('seal-strand');
        el.innerHTML = countable.map(function(_, i) {
            return '<div class="seal-dot" id="dot-' + i + '">&amp;</div>';
        }).join('');
        refreshCount();
    }

    function refreshCount() {
        document.getElementById('seal-count').textContent = solved.size + ' / ' + countable.length;
    }

    function renderSections() {
        var container = document.getElementById('sections-container');
        container.innerHTML = '';
        cfg.sections.forEach(function(section, si) {
            if (si > 0) {
                container.insertAdjacentHTML('beforeend', '<hr class="divider">');
            }
            if (section.title) {
                container.insertAdjacentHTML('beforeend',
                    '<div class="section-head"><h2>' + section.title + '</h2></div>' +
                    (section.note ? '<p class="section-note">' + section.note + '</p>' : '')
                );
            }
            section.items.forEach(function(item) {
                container.insertAdjacentHTML('beforeend', renderItem(item));
            });
        });
    }

    function renderItem(item) {
        if (item.type === 'display') {
            return '<div class="card">' +
                (item.label ? '<div class="item-label">' + item.label + '</div>' : '') +
                '<div class="q-text">' + (item.text || '') + '</div>' +
                '</div>';
        }

        var idx   = item._idx;
        var inner = '<div class="stamp" id="stamp-' + idx + '">&amp;</div>';

        if (item.type === 'audio') {
            inner +=
                '<div class="song-top">' +
                    '<div class="song-num">' + pad(item._num) + '</div>' +
                    '<div class="song-mask">Mystery track</div>' +
                '</div>' +
                '<div class="player">' +
                    '<audio id="audio-' + idx + '"' +
                        (item.src ? ' src="' + item.src + '"' : '') +
                        ' preload="metadata"></audio>' +
                    '<div class="player-controls">' +
                        '<button class="play-btn" id="play-btn-' + idx + '" onclick="VerifyPage.togglePlay(' + idx + ')">' +
                            '<span class="play-icon"></span>' +
                        '</button>' +
                        '<div class="player-track" id="player-track-' + idx + '" onclick="VerifyPage.seek(event,' + idx + ')">' +
                            '<div class="player-fill" id="player-fill-' + idx + '"></div>' +
                        '</div>' +
                        '<div class="player-time" id="player-time-' + idx + '">0:00</div>' +
                    '</div>' +
                '</div>';
        } else {
            if (item.label)    inner += '<div class="item-label">' + item.label    + '</div>';
            if (item.question) inner += '<div class="q-text">'     + item.question + '</div>';
        }

        var inputEl;
        if (item.type === 'date') {
            inputEl = '<input type="date" id="inp-' + idx + '" class="inp-date">';
        } else if (item.prefix || item.suffix) {
            var ph = item.placeholder || '';
            inputEl =
                '<div class="inp-with-prefix" id="prefix-wrap-' + idx + '">' +
                    (item.prefix ? '<span class="inp-prefix">' + item.prefix + '</span>' : '') +
                    '<input type="text" id="inp-' + idx + '" placeholder="' + ph + '" enterkeyhint="go" ' +
                        'onkeydown="if(event.key===\'Enter\')VerifyPage.check(' + idx + ')">' +
                    (item.suffix ? '<span class="inp-suffix">' + item.suffix + '</span>' : '') +
                '</div>';
        } else {
            var ph = item.type === 'audio' ? 'Name this song' : (item.placeholder || 'Your answer');
            inputEl = '<input type="text" id="inp-' + idx + '" placeholder="' + ph + '" enterkeyhint="go" ' +
                'onkeydown="if(event.key===\'Enter\')VerifyPage.check(' + idx + ')">';
        }

        inner +=
            '<div class="input-row">' +
                inputEl +
                '<button class="btn-check" id="btn-' + idx + '" onclick="VerifyPage.check(' + idx + ')">Unseal</button>' +
            '</div>' +
            '<div class="feedback" id="fb-' + idx + '"></div>';

        if (item.hint) {
            inner +=
                '<button class="hint-toggle" onclick="VerifyPage.toggleHint(' + idx + ')">Need a nudge?</button>' +
                '<div class="hint-text" id="hint-' + idx + '">' + item.hint + '</div>';
        }

        return '<div class="card" id="card-' + idx + '">' + inner + '</div>';
    }

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    // Converts YYYY-MM-DD (date input internal value) to DD.MM.YYYY for comparison
    function dateToDisplay(val) {
        if (!val) return '';
        var p = val.split('-');
        return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : val;
    }

    function check(idx) {
        if (solved.has(idx)) return;
        var item  = countable[idx];
        var inp   = document.getElementById('inp-'   + idx);
        var fb    = document.getElementById('fb-'    + idx);
        var card  = document.getElementById('card-'  + idx);
        var btn   = document.getElementById('btn-'   + idx);
        var stamp = document.getElementById('stamp-' + idx);

        var isDate = item.type === 'date';
        var val    = isDate
            ? dateToDisplay(inp.value)
            : normalize((item.prefix || '') + inp.value + (item.suffix || ''));
        var ok     = val.length > 0 && item.answers.some(function(a) {
            return isDate ? a === val : normalize(a) === val;
        });

        if (ok) {
            solved.add(idx);
            inp.disabled    = true;
            var pw = document.getElementById('prefix-wrap-' + idx);
            if (pw) pw.classList.add('disabled');
            btn.textContent = 'Opened';
            btn.classList.add('done');
            fb.textContent  = 'Correct - the seal breaks.';
            fb.className    = 'feedback correct';
            stamp.classList.add('show');
            card.classList.add('solved');
            document.getElementById('dot-' + idx).classList.add('opened');
            refreshCount();
            if (solved.size === countable.length) setTimeout(celebrate, 600);
        } else {
            fb.textContent = 'Not quite - try again.';
            fb.className   = 'feedback wrong';
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
        }
    }

    function toggleHint(idx) {
        document.getElementById('hint-' + idx).classList.toggle('show');
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

    function togglePlay(idx) {
        var audio = document.getElementById('audio-' + idx);
        if (!audio.getAttribute('src')) {
            alert('No audio file yet - set a src in the items array.');
            return;
        }
        var wasPaused = audio.paused;
        document.querySelectorAll('audio').forEach(function(a) { a.pause(); });
        document.querySelectorAll('.play-btn').forEach(function(b) {
            b.innerHTML = '<span class="play-icon"></span>';
        });
        if (wasPaused) {
            audio.play().catch(function(){});
            document.getElementById('play-btn-' + idx).innerHTML =
                '<span class="pause-icon"><span></span><span></span></span>';
        }
    }

    function seek(evt, idx) {
        var audio = document.getElementById('audio-' + idx);
        if (!audio.duration || !isFinite(audio.duration)) return;
        var rect = document.getElementById('player-track-' + idx).getBoundingClientRect();
        audio.currentTime = Math.min(Math.max((evt.clientX - rect.left) / rect.width, 0), 1) * audio.duration;
    }

    function attachAllAudio() {
        countable.forEach(function(item) {
            if (item.type !== 'audio') return;
            var idx   = item._idx;
            var audio = document.getElementById('audio-' + idx);
            var fill  = document.getElementById('player-fill-' + idx);
            var timeL = document.getElementById('player-time-' + idx);
            var btn   = document.getElementById('play-btn-'  + idx);
            audio.addEventListener('timeupdate', function() {
                if (audio.duration && isFinite(audio.duration))
                    fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
                timeL.textContent = formatTime(audio.currentTime);
            });
            audio.addEventListener('ended', function() {
                btn.innerHTML     = '<span class="play-icon"></span>';
                fill.style.width  = '0%';
                timeL.textContent = '0:00';
            });
            audio.addEventListener('pause', function() {
                btn.innerHTML = '<span class="play-icon"></span>';
            });
        });
    }

    function formatTime(sec) {
        if (!isFinite(sec) || sec < 0) return '0:00';
        return Math.floor(sec / 60) + ':' + Math.floor(sec % 60).toString().padStart(2, '0');
    }

    return { init: init, check: check, toggleHint: toggleHint, togglePlay: togglePlay, seek: seek };
})();
