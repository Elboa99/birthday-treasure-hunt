/* =========================================================================
   transitions.js - Transition Scene Logic
   ========================================================================= */

const TransitionScenes = [
    // Transition 0: Landing -> Quiz
    null, // No transition needed here (or maybe a quick fade)
    
    // Transition 1: Quiz -> Jigsaw
    {
        bgClass: 'bg-meadow',
        music: 'sounds/as_it_was.mp3', // Map to playlist if needed, or play directly
        actionClass: 'action-wave',
        text: 'LEVEL 1 COMPLETE',
        dialog: "You know me too well! Let's piece things together..."
    },
    // Transition 2: Jigsaw -> Memory Match
    {
        bgClass: 'bg-concert',
        music: 'sounds/watermelon_sugar.mp3',
        actionClass: 'action-jump',
        text: 'LEVEL 2 COMPLETE',
        dialog: "Great job! Now let's test that memory!"
    },
    // Transition 3: Memory Match -> Scratch Card
    {
        bgClass: 'bg-sunset',
        music: 'sounds/late_night_talking.mp3',
        actionClass: 'action-wave',
        text: 'LEVEL 3 COMPLETE',
        dialog: "Can't get you off my mind... Time to scratch & reveal!"
    },
    // Transition 4: Scratch Card -> Finale
    {
        bgClass: 'bg-stadium',
        music: 'sounds/sweet_creature.mp3',
        actionClass: 'action-bow',
        text: 'FINAL LEVEL UNLOCKED •_•',
        dialog: "You made it! Here's to you, sweet creature! 🎉"
    }
];

let transitionCallback = null;
let walkInterval = null;
let transitionTimeoutId = null;

function playTransition(toStageIndex, onCompleteCallback) {
    const sceneData = TransitionScenes[toStageIndex - 1];
    
    // If no scene data (e.g. stage 0->1), just go immediately
    if(!sceneData || toStageIndex < 2) {
        if(onCompleteCallback) onCompleteCallback();
        return;
    }

    transitionCallback = onCompleteCallback;

    const overlay = document.getElementById('transition-overlay');
    const bg = document.getElementById('t-bg');
    const sprite = document.getElementById('t-sprite');
    const container = document.getElementById('t-character-container');
    const textEl = document.getElementById('t-text');
    const speechBubble = document.getElementById('t-speech-bubble');

    // Reset Elements
    overlay.className = 'active';
    bg.className = 't-background ' + sceneData.bgClass;
    
    // Reset Sprite & Bubble
    sprite.className = 't-sprite t-sprite-base';
    container.style.transform = 'scale(3) translateX(-40vw)'; 
    container.className = 't-character-container'; // clear action classes
    speechBubble.classList.remove('visible');
    speechBubble.innerText = sceneData.dialog || "Hello!";
    
    textEl.innerHTML = sceneData.text + '<span class="t-blink">_</span>';

    // 1. Walk in animation (3-frame cycle)
    let walkPhase = 0; // 0=base, 1=walk1, 2=base, 3=walk2
    let positionVW = -40; // start offscreen left
    
    walkInterval = setInterval(() => {
        walkPhase = (walkPhase + 1) % 4;
        
        switch(walkPhase) {
            case 0: case 2: sprite.className = 't-sprite t-sprite-base'; break;
            case 1: sprite.className = 't-sprite t-sprite-walk-1'; break;
            case 3: sprite.className = 't-sprite t-sprite-walk-2'; break;
        }
        
        positionVW += 1; // Move right
        container.style.transform = `scale(3) translateX(${positionVW}vw)`;
        
        // Stop at center
        if(positionVW >= 0) {
            clearInterval(walkInterval);
            sprite.className = 't-sprite t-sprite-base'; // Stand still
            
            // 2. Perform action & Show Dialog
            setTimeout(() => {
                container.classList.add(sceneData.actionClass);
                speechBubble.classList.add('visible');
                
                // 3. Wait and exit
                transitionTimeoutId = setTimeout(endTransition, 3500); // Wait a bit longer to read text
            }, 500);
        }
    }, 100); // 10fps walk cycle
}

function skipTransition() {
    if(walkInterval) clearInterval(walkInterval);
    if(transitionTimeoutId) clearTimeout(transitionTimeoutId);
    endTransition();
}

function endTransition() {
    const overlay = document.getElementById('transition-overlay');
    overlay.classList.add('fade-out');
    
    setTimeout(() => {
        overlay.classList.remove('active', 'fade-out');
        if(transitionCallback) {
            transitionCallback();
            transitionCallback = null;
        }
    }, 500); // match fade out duration
}

// Ensure DOM elements exist, they will be injected into index.html
