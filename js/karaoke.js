/* =========================================================================
   karaoke.js - 8-Bit Karaoke Mini-Game
   Guitar Hero-style lyrics scrolling game synced to the 8-bit music
   ========================================================================= */

// Lyrics for "As It Was" — timed to a ~30 second clip
const KARAOKE_LYRICS = [
    { time: 0.5,  text: "Holdin' me back..." },
    { time: 2.5,  text: "Gravity's holdin' me back" },
    { time: 5.0,  text: "I want you to hold out" },
    { time: 7.0,  text: "the palm of your hand" },
    { time: 9.5,  text: "Why don't we leave it at that?" },
    { time: 12.0, text: "Nothin' to say..." },
    { time: 14.0, text: "When everything gets" },
    { time: 16.0, text: "in the way" },
    { time: 18.5, text: "Seems you cannot be replaced" },
    { time: 21.0, text: "And I'm the one who will" },
    { time: 23.0, text: "stay..." },
    { time: 25.0, text: "In this world..." },
    { time: 27.0, text: "it's just us" },
    { time: 29.0, text: "You know it's not the same" },
    { time: 31.0, text: "AS IT WAS ♪" }
];

const KARAOKE_DURATION = 33; // seconds for the whole segment

let karaokeScore = 0;
let karaokeCombo = 0;
let karaokeLyricElements = [];
let karaokeInterval = null;
let karaokeStartTime = null;
let karaokeActive = false;

/**
 * Initialize and start the karaoke mini-game
 */
function initKaraoke() {
    const stage = document.querySelector('.karaoke-stage');
    if (!stage) return;

    // Reset
    karaokeScore = 0;
    karaokeCombo = 0;
    karaokeActive = true;
    karaokeLyricElements = [];

    const track = stage.querySelector('.karaoke-track');
    const scoreEl = stage.querySelector('.karaoke-score');
    const comboEl = stage.querySelector('.karaoke-combo');

    if (track) track.innerHTML = '';
    if (scoreEl) scoreEl.textContent = '0';
    if (comboEl) comboEl.textContent = '';

    // Remove any previous result overlay
    const oldResult = stage.querySelector('.karaoke-result');
    if (oldResult) oldResult.remove();

    karaokeStartTime = Date.now();

    // Spawn lyrics at their designated times
    KARAOKE_LYRICS.forEach((lyric, i) => {
        setTimeout(() => {
            if (!karaokeActive) return;
            spawnLyric(lyric.text, track, i);
        }, lyric.time * 1000);
    });

    // End the game after duration
    setTimeout(() => {
        endKaraoke();
    }, KARAOKE_DURATION * 1000);

    // Bind click/tap on the stage for hitting lyrics
    stage.onclick = handleKaraokeTap;
    stage.ontouchstart = (e) => { e.preventDefault(); handleKaraokeTap(e); };
}

/**
 * Spawn a single lyric element that falls down
 */
function spawnLyric(text, track, index) {
    const el = document.createElement('div');
    el.className = 'karaoke-lyric';
    el.textContent = text;
    el.dataset.index = index;
    el.dataset.hit = 'false';

    // Animation: fall for 4 seconds
    el.style.animationDuration = '4s';

    track.appendChild(el);
    karaokeLyricElements.push(el);

    // Remove after animation
    setTimeout(() => {
        if (el.dataset.hit === 'false') {
            el.classList.add('miss');
            karaokeCombo = 0;
            updateKaraokeCombo();
        }
    }, 3200); // Near end of fall
}

/**
 * Handle tap/click — check if any lyric is in the hit zone
 */
function handleKaraokeTap(e) {
    if (!karaokeActive) return;

    const stage = document.querySelector('.karaoke-stage');
    const hitZone = stage.querySelector('.karaoke-hit-zone');
    if (!hitZone) return;

    const hitRect = hitZone.getBoundingClientRect();
    const hitTop = hitRect.top;
    const hitBottom = hitRect.bottom;

    let bestLyric = null;
    let bestDist = Infinity;

    karaokeLyricElements.forEach(el => {
        if (el.dataset.hit === 'true') return;
        const rect = el.getBoundingClientRect();
        const lyricCenter = rect.top + rect.height / 2;

        // Check if lyric overlaps with hit zone
        if (lyricCenter >= hitTop - 30 && lyricCenter <= hitBottom + 30) {
            const dist = Math.abs(lyricCenter - (hitTop + hitRect.height / 2));
            if (dist < bestDist) {
                bestDist = dist;
                bestLyric = el;
            }
        }
    });

    if (bestLyric) {
        // HIT!
        bestLyric.dataset.hit = 'true';
        bestLyric.classList.add('hit');
        karaokeScore += 100 + (karaokeCombo * 10);
        karaokeCombo++;

        // Update displays
        const scoreEl = stage.querySelector('.karaoke-score');
        if (scoreEl) scoreEl.textContent = karaokeScore;
        updateKaraokeCombo();

        // Star effect
        const star = document.createElement('span');
        star.className = 'karaoke-star';
        star.textContent = '⭐';
        star.style.left = (Math.random() * 60 + 20) + '%';
        star.style.top = hitRect.top - stage.getBoundingClientRect().top + 'px';
        stage.appendChild(star);
        setTimeout(() => star.remove(), 600);

        // SFX
        if (typeof SFX !== 'undefined') SFX.playBlip();
    }
}

function updateKaraokeCombo() {
    const stage = document.querySelector('.karaoke-stage');
    const comboEl = stage ? stage.querySelector('.karaoke-combo') : null;
    if (comboEl) {
        comboEl.textContent = karaokeCombo > 1 ? `${karaokeCombo}x COMBO!` : '';
    }
}

/**
 * End the karaoke mini-game and show result
 */
function endKaraoke() {
    karaokeActive = false;
    const stage = document.querySelector('.karaoke-stage');
    if (!stage) return;

    // Determine rating
    const hitCount = karaokeLyricElements.filter(el => el.dataset.hit === 'true').length;
    const total = KARAOKE_LYRICS.length;
    let rating = '🎤 ROCK STAR!';
    if (hitCount < total * 0.5) rating = '🎵 NICE TRY!';
    if (hitCount < total * 0.3) rating = '🎶 KEEP SINGING!';

    // Show result overlay
    const result = document.createElement('div');
    result.className = 'karaoke-result';
    result.innerHTML = `
        <h3>${rating}</h3>
        <p>SCORE: ${karaokeScore}</p>
        <p style="margin-top:10px; font-size:8px; color:var(--primary-rose);">${hitCount}/${total} LYRICS HIT</p>
    `;
    stage.appendChild(result);

    // Play celebrate SFX
    if (typeof SFX !== 'undefined') SFX.playLevelClear();

    // Auto-advance after showing result
    setTimeout(() => {
        goToStage(6); // Go to finale (now stage 6)
    }, 3000);
}
