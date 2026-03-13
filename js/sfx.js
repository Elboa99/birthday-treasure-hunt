/* =========================================================================
   sfx.js - Web Audio API 8-Bit Sound Engine
   ========================================================================= */

const SFX = {
    audioCtx: null,
    
    init: function() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
    },

    // Resumes audio context if it was suspended (browser policy)
    ensureAudio: function() {
        this.init();
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    // Helper to play a raw tone
    playTone: function(frequency, type, duration, vol = 0.1) {
        this.ensureAudio();
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = type; // 'square' or 'sawtooth' are best for 8-bit
        oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

        gainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        // Quick fade out to avoid clicks
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + duration);
    },

    // --- Sound Definitions ---

    // Standard UI Click
    playBlip: function() {
        this.playTone(600, 'square', 0.1, 0.05);
    },

    // Correct Answer / Item placed
    playWin: function() {
        this.ensureAudio();
        // Arpeggio up
        setTimeout(() => this.playTone(440, 'square', 0.1, 0.1), 0);
        setTimeout(() => this.playTone(554, 'square', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(659, 'square', 0.2, 0.1), 200);
    },

    // Wrong Answer
    playError: function() {
        this.ensureAudio();
        // Low double downward tone
        setTimeout(() => this.playTone(200, 'sawtooth', 0.15, 0.1), 0);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.25, 0.1), 150);
    },

    // Level Complete
    playLevelClear: function() {
        this.ensureAudio();
        // Classic triumphant jingle
        setTimeout(() => this.playTone(523.25, 'square', 0.1, 0.1), 0);
        setTimeout(() => this.playTone(659.25, 'square', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(783.99, 'square', 0.1, 0.1), 200);
        setTimeout(() => this.playTone(1046.50, 'square', 0.3, 0.1), 300);
    }
};

// Auto wire up standard buttons to play blip
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            // Don't override play/pause button sounds if they have their own logic
            if(!e.target.closest('#music-controls')) {
                SFX.playBlip();
            }
        }
    });
});
