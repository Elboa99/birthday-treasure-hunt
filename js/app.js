/* =========================================================================
   app.js - Main Application Logic
   Handles stage navigation, UI updates, and initializing systems
   ========================================================================= */

// Global state
let currentStage = 0;
const totalStages = 5;

// DOM Elements
const stages = document.querySelectorAll('.stage');
const progressHearts = document.querySelectorAll('.pixel-heart');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Hide progress bar on landing page
    document.getElementById('progress-container').style.display = 'none';
});

// Start the adventure from landing page
function startAdventure() {
    // Show progress bar
    document.getElementById('progress-container').style.display = 'block';
    goToStage(1);
    
    // Play audio
    const bgMusic = document.getElementById('bg-music');
    if(bgMusic && !bgMusic.playing) {
        bgMusic.play().catch(e => console.log("Audio autoplay prevented by browser. User must click play."));
        bgMusic.playing = true;
        document.getElementById('audio-toggle').innerText = '🔊';
    }
}

// Toggle Background Music
function toggleAudio() {
    const bgMusic = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('audio-toggle');
    
    if(!bgMusic) return;
    
    if (bgMusic.paused) {
        bgMusic.play();
        bgMusic.playing = true;
        toggleBtn.innerText = '🔊';
    } else {
        bgMusic.pause();
        bgMusic.playing = false;
        toggleBtn.innerText = '🔇';
    }
}

// Navigate between stages
function goToStage(stageIndex) {
    if (stageIndex < 0 || stageIndex > totalStages) return;

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
    if (stageIndex === 5) {
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

// Replay from the beginning
function replayAdventure() {
    // Reset puzzles if reset functions exist
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
