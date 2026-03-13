/* =========================================================================
   app.js - Main Application Logic
   Handles stage navigation, UI updates, and initializing systems
   ========================================================================= */

// Global state
let currentStage = 0;
const totalStages = 6;

// Game State Tracking
let gameStartTime = null;
let gameEndTime = null;

// DOM Elements
const stages = document.querySelectorAll('.stage');
const progressHearts = document.querySelectorAll('.pixel-heart');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Hide progress bar on landing page
    document.getElementById('progress-container').style.display = 'none';
});

// Playlist setup
const playlist = [
    { title: "As It Was (8-bit) - Harry Styles", src: "sounds/as_it_was.mp3" },
    { title: "Watermelon Sugar (8-bit) - Harry Styles", src: "sounds/watermelon_sugar.mp3" },
    { title: "Matilda - Harry Styles", src: "sounds/matilda.mp3" },
    { title: "Late Night Talking (8-bit) - Harry Styles", src: "sounds/late_night_talking.mp3" },
    { title: "Sweet Creature (8-bit) - Harry Styles", src: "sounds/sweet_creature.mp3" }
];
let currentTrackIndex = 0;

// Start the adventure from landing page
function startAdventure() {
    // Show progress bar
    document.getElementById('progress-container').style.display = 'block';
    goToStage(1);
    
    // Start tracking time
    gameStartTime = Date.now();
    
    // Play audio
    const bgMusic = document.getElementById('bg-music');
    if(bgMusic && !bgMusic.playing) {
        bgMusic.src = playlist[currentTrackIndex].src;
        document.getElementById('track-name').innerText = (currentTrackIndex + 1) + ". " + playlist[currentTrackIndex].title;
        
        // Auto-next when song ends
        bgMusic.onended = nextTrack;
        
        bgMusic.play().then(() => {
            bgMusic.playing = true;
            document.getElementById('audio-toggle').innerText = '🔊';
        }).catch(e => console.log("Audio autoplay prevented by browser. User must click play."));
    }
}

// Next Track
function nextTrack() {
    const bgMusic = document.getElementById('bg-music');
    if(!bgMusic) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    bgMusic.src = playlist[currentTrackIndex].src;
    document.getElementById('track-name').innerText = (currentTrackIndex + 1) + ". " + playlist[currentTrackIndex].title;
    
    if (bgMusic.playing || !bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Audio play prevented"));
        document.getElementById('audio-toggle').innerText = '🔊';
        bgMusic.playing = true;
    }
}

// Toggle Background Music
function toggleAudio() {
    const bgMusic = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('audio-toggle');
    
    if(!bgMusic) return;
    
    if(!bgMusic.src || bgMusic.src.endsWith(window.location.host + '/') || bgMusic.src === "") {
        bgMusic.src = playlist[currentTrackIndex].src;
        document.getElementById('track-name').innerText = (currentTrackIndex + 1) + ". " + playlist[currentTrackIndex].title;
        bgMusic.onended = nextTrack;
    }

    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Audio play prevented"));
        bgMusic.playing = true;
        toggleBtn.innerText = '🔊';
    } else {
        bgMusic.pause();
        bgMusic.playing = false;
        toggleBtn.innerText = '🔇';
    }
}

// Navigate between stages with transition wrapper
// We rename the old logic to `executeGoToStage`
function goToStage(stageIndex) {
    if (stageIndex < 0 || stageIndex > totalStages) return;
    
    // Play map + transition between puzzles (Stage 1->2, 2->3, 3->4, 4->5, 5->6)
    // Only play if moving forward and past the landing
    if (stageIndex > currentStage && stageIndex > 1) {
        // Show treasure map first, then transition
        if (typeof showTreasureMap === 'function' && stageIndex <= 5) {
            showTreasureMap(currentStage, () => {
                if (typeof playTransition === 'function' && stageIndex <= 5) {
                    playTransition(stageIndex, () => executeGoToStage(stageIndex));
                } else {
                    executeGoToStage(stageIndex);
                }
            });
            return;
        }
        
        if (typeof playTransition === 'function' && stageIndex <= 5) {
            playTransition(stageIndex, () => executeGoToStage(stageIndex));
            return;
        }
    }
    
    // If no transition needed, just execute immediately
    executeGoToStage(stageIndex);
}

// The actual internal logic for hiding/showing stages
function executeGoToStage(stageIndex) {
    // Hide all stages
    stages.forEach(stage => {
        stage.classList.remove('active');
    });

    // Show target stage
    const targetStage = document.getElementById(`stage-${stageIndex}`);
    if (targetStage) {
        targetStage.classList.add('active');
        
        // Always scroll to top on new stage
        window.scrollTo(0, 0);
    }

    currentStage = stageIndex;
    updateProgress();

    // Trigger stage-specific initialization
    if (stageIndex === 1) {
        // Start quiz timer when entering stage 1
        if(typeof startTimer === 'function' && currentQuestion === 1) {
            setTimeout(startTimer, 500); // Small delay to let transition finish
        }
    }
    if (stageIndex === 5) {
        // Karaoke stage
        if(typeof initKaraoke === 'function') {
            setTimeout(initKaraoke, 500);
        }
    }
    if (stageIndex === 6) {
        if(typeof initFinale === 'function') initFinale();
    }
}

// Update the pixel heart progress bar
function updateProgress() {
    progressHearts.forEach((heart, index) => {
        if (index <= currentStage) {
            heart.classList.add('filled');
        } else {
            heart.classList.remove('filled');
        }
    });
}

// Reveal reward for current stage
function revealReward(stageNumber) {
    const rewardContainer = document.getElementById(`reward-${stageNumber}`);
    if (rewardContainer) {
        rewardContainer.classList.remove('hidden');
        rewardContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Stage 5 Finale Logic
function initFinale() {
    // Trigger massive confetti
    if(typeof confetti !== 'undefined') {
        confetti({particleCount: 150, spread: 100, origin: {y: 0.1}});
        setTimeout(() => confetti({particleCount: 100, spread: 80, origin: {y: 0.2}}), 1000);
        setTimeout(() => confetti({particleCount: 100, spread: 80, origin: {y: 0.3}}), 2000);
    }
    
    // Play big finish sound
    if(typeof SFX !== 'undefined') {
        setTimeout(() => SFX.playLevelClear(), 500);
    }

    // Calculate Timer
    gameEndTime = Date.now();
    let totalSeconds = Math.floor((gameEndTime - gameStartTime) / 1000);
    if(totalSeconds < 0 || isNaN(totalSeconds)) totalSeconds = 0;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let timeStr = `${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;

    const gallery = document.getElementById('finale-gallery');
    if (gallery) {
        let finalGalleryHTML = `
            <div class="finale-stats">
                <p style="text-shadow: 2px 2px 0 #000;">TOTAL TIME: <span style="color:var(--accent-gold)">${timeStr}</span></p>
            </div>
            <div class="photo-carousel">
        `;
        
        // Add unlocked photos to carousel
        for(let i=1; i<=4; i++) {
            finalGalleryHTML += `<img src="images/reward-${i}.jpg" class="carousel-photo pop-in" style="animation-delay: ${0.2 * i}s">`;
        }
        finalGalleryHTML += `</div>`;
        gallery.innerHTML = finalGalleryHTML;
    }

    // Typewriter effect for dedication
    const dedTextEl = document.getElementById('dedication-text');
    if (dedTextEl) {
        // We read it from a data attribute or direct HTML
        const originalText = dedTextEl.innerHTML.replace(/\s+/g, ' ').trim();
        // Clear it
        dedTextEl.innerHTML = '';
        
        let i = 0;
        let isTag = false;
        let pText = "";
        
        // Simple manual typewriter dealing with HTML tags
        function typeWriter() {
            if (i < originalText.length) {
                if (originalText.charAt(i) === '<') isTag = true;
                if (originalText.charAt(i) === '>') {
                    isTag = false;
                    pText += originalText.charAt(i);
                    i++;
                    typeWriter(); // Skip delays on tags
                    return;
                }
                
                pText += originalText.charAt(i);
                dedTextEl.innerHTML = pText + '<span class="t-blink">_</span>';
                i++;
                
                if(typeof SFX !== 'undefined' && !isTag && Math.random() > 0.5) SFX.playBlip(); // Keyboard sound

                setTimeout(typeWriter, isTag ? 0 : 40); // 40ms per char
            } else {
                dedTextEl.innerHTML = originalText; // Finish cleanly
            }
        }
        
        // Start typing after gallery appears
        setTimeout(typeWriter, 1500);
    }
}

// Replay from the beginning
function replayAdventure() {
    // Reset puzzles if reset functions exist
    if(typeof restartQuizFromGameOver === 'function') restartQuizFromGameOver();
    if(typeof resetJigsaw === 'function') resetJigsaw();
    if(typeof resetMemory === 'function') resetMemory();
    if(typeof resetScratch === 'function') resetScratch();
    
    // Hide rewards
    for(let i=1; i<=4; i++) {
        const reward = document.getElementById(`reward-${i}`);
        if(reward) reward.classList.add('hidden');
    }
    
    // Clear input
    const q1Input = document.getElementById('q1-answer');
    if(q1Input) q1Input.value = '';

    // Go back to landing
    document.getElementById('progress-container').style.display = 'none';
    currentStage = 0;
    
    stages.forEach(stage => stage.classList.remove('active'));
    document.getElementById('stage-landing').classList.add('active');
    updateProgress();
}
