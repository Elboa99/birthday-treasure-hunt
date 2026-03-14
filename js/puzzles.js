/* =========================================================================
   puzzles.js - All Game Mechanics
   ========================================================================= */

// =========================================================================
// STAGE 1: THE ULTIMATE FAN QUIZ
// =========================================================================
const QUIZ_ANSWERS = {
    1: "Chenford",
    2: "Serpenti",
    3: "Ombrello",
    4: "Colin",
    5: "Padre"
};

let currentQuestion = 1;
let score = 0;
let consecutiveFails = 0;

// New Quiz Mechanics Variables
let lives = 5;
let combo = 0;
let timerInterval = null;
let timeLeft = 15;
let timeMultiplier = 1; // Used for adjusting time per question if needed
const BASE_TIME_PER_QUESTION = 15; // secondi

function selectQuizAnswer(qIndex, selectedAnswer) {
    if (lives <= 0) return; // Ignore input if game over
    
    // Disable buttons temporarily to prevent double clicking
    const buttons = document.querySelectorAll(`#q${qIndex} .quiz-opt`);
    buttons.forEach(btn => btn.disabled = true);
    
    stopTimer();

    const hintText = document.getElementById('quiz-hint');
    const puzzleCard = document.querySelector('#stage-1 .puzzle-card');
    
    if (selectedAnswer === QUIZ_ANSWERS[qIndex]) {
        // Correct!
        if(typeof SFX !== 'undefined') SFX.playWin();
        score++;
        consecutiveFails = 0;
        hintText.innerText = "Correct! ✅";
        hintText.style.color = "green";
        
        updateCombo(true);
        updateProgressPath();
        
        // Trigger stars at button position
        const rect = buttons[0].getBoundingClientRect(); // Rough center
        triggerStars(window.innerWidth / 2, window.innerHeight / 2);
        
        advanceQuiz();
    } else {
        // Wrong
        if(typeof SFX !== 'undefined') SFX.playError();
        consecutiveFails++;
        updateCombo(false);
        loseLife();
        
        puzzleCard.classList.remove('shake');
        void puzzleCard.offsetWidth; // reflow
        puzzleCard.classList.add('shake');
        setTimeout(() => puzzleCard.classList.remove('shake'), 400);
        
        if (lives > 0) {
            if(consecutiveFails >= 2) {
                hintText.innerText = "That's some white shit. 😂";
            } else {
                hintText.innerText = "Wrong! Try again ❌";
            }
            hintText.style.color = "red";
            
            // Re-enable buttons if not game over and need to retry
            setTimeout(() => {
                buttons.forEach(btn => btn.disabled = false);
                startTimer(); // Restart timer for retry
            }, 1000);
        }
    }
}

function advanceQuiz() {
    setTimeout(() => {
        // Hide current
        document.getElementById(`q${currentQuestion}`).classList.remove('active');
        document.getElementById(`q${currentQuestion}`).classList.add('hidden');
        
        // Check if game over happened during timeout
        if (lives <= 0) return;
        
        currentQuestion++;
        const hintText = document.getElementById('quiz-hint');
        hintText.innerText = "";
        
        // Re-enable all buttons for the new question
        const allButtons = document.querySelectorAll('#stage-1 .quiz-opt');
        allButtons.forEach(btn => btn.disabled = false);
        
        if(currentQuestion <= 5) {
            // Show next
            document.getElementById(`q${currentQuestion}`).classList.remove('hidden');
            document.getElementById(`q${currentQuestion}`).classList.add('active');
            document.getElementById('quiz-current-q').innerText = currentQuestion;
            startTimer(); // Start timer for the next question
        } else {
            // Quiz finished! Check score
            const puzzleCard = document.querySelector('#stage-1 .puzzle-card');
            puzzleCard.classList.add('hidden');
            
            const rewardMsg = document.getElementById('reward-msg-1');
            if(score >= 4) {
                if(typeof SFX !== 'undefined') SFX.playLevelClear();
                if(typeof confetti !== 'undefined') confetti({particleCount: 50, spread: 60, origin: {y: 0.6}});
                rewardMsg.innerText = `You got ${score}/5! You know your shows, but you know my heart even better. 💕`;
                revealReward(1);
            } else {
                // Failed the whole quiz, let them restart
                if(typeof SFX !== 'undefined') SFX.playError();
                puzzleCard.classList.remove('hidden');
                
                // Instead of simple restart, show game over
                triggerGameOver(`You only got ${score}/5. That's some white shit.`);
            }
        }
    }, 800);
}

// --- NEW QUIZ MECHANICS FUNCTIONS ---

function startTimer() {
    stopTimer(); // Ensure no duplicates
    
    // Adjust time slightly based on question (e.g. Q4 and Q5 get 20s)
    timeLeft = currentQuestion >= 4 ? 20 : BASE_TIME_PER_QUESTION;
    const totalTime = timeLeft;
    
    const timerText = document.getElementById('timer-text');
    const timerFill = document.getElementById('timer-bar-fill');
    
    const updateUI = () => {
        timerText.innerText = timeLeft;
        const percentage = (timeLeft / totalTime) * 100;
        timerFill.style.width = `${percentage}%`;
        
        timerFill.classList.remove('warning', 'danger');
        timerText.classList.remove('danger');
        
        if (timeLeft <= 5) {
            timerFill.classList.add('danger');
            timerText.classList.add('danger');
            if(typeof SFX !== 'undefined' && timeLeft > 0) SFX.playTimerTick(true);
        } else if (timeLeft <= totalTime / 2) {
            timerFill.classList.add('warning');
            if(typeof SFX !== 'undefined' && timeLeft > 0) SFX.playTimerTick(false);
        }
    };
    
    updateUI();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            handleTimeout();
        } else {
            updateUI();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleTimeout() {
    stopTimer();
    
    const buttons = document.querySelectorAll(`#q${currentQuestion} .quiz-opt`);
    buttons.forEach(btn => btn.disabled = true);
    
    const hintText = document.getElementById('quiz-hint');
    hintText.innerText = "Time's up! ⏰❌";
    hintText.style.color = "red";
    
    if(typeof SFX !== 'undefined') SFX.playError();
    
    // Flash red
    const flash = document.createElement('div');
    flash.className = 'flash-damage';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
    
    loseLife();
    updateCombo(false);
    
    if (lives > 0) {
         // Allow retry on timeout too
         setTimeout(() => {
             buttons.forEach(btn => btn.disabled = false);
             startTimer();
             hintText.innerText = "";
         }, 1500);
    }
}

function loseLife() {
    if (lives <= 0) return;
    
    const heart = document.getElementById(`heart-${lives}`);
    if (heart) {
        heart.classList.remove('full');
        heart.classList.remove('recovered'); // In case it was recovered previously
        heart.classList.add('taking-damage');
        
        // Screen shake on life loss
        document.body.classList.remove('shake');
        void document.body.offsetWidth;
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 400);
        
        setTimeout(() => {
            heart.classList.remove('taking-damage');
            heart.classList.add('lost');
        }, 300);
    }
    
    lives--;
    
    if (lives === 0) {
        if(typeof SFX !== 'undefined') SFX.playGameOver();
        setTimeout(() => triggerGameOver("Out of lives!"), 500);
    }
}

function regainLife() {
    if (lives >= 5) return;
    
    lives++;
    const heart = document.getElementById(`heart-${lives}`);
    if (heart) {
        heart.classList.remove('lost');
        heart.classList.add('recovered');
        heart.classList.add('full');
        if(typeof SFX !== 'undefined') SFX.playLifeUp();
    }
}

function updateCombo(correct) {
    const comboEl = document.getElementById('quiz-combo');
    
    if (correct) {
        combo++;
        if (combo >= 2) {
            comboEl.innerText = `🔥 ×${combo}`;
            comboEl.classList.remove('hidden');
            
            // Pop animation
            comboEl.classList.remove('pop');
            void comboEl.offsetWidth;
            comboEl.classList.add('pop');
            
            // Regain life every 2 combo streak if missing lives
            if (combo % 2 === 0 && lives < 5) {
                regainLife();
                const hintText = document.getElementById('quiz-hint');
                hintText.innerText = "Combo! +1 Life ❤️";
                hintText.style.color = "var(--primary-rose)";
            }
        }
    } else {
        combo = 0;
        comboEl.classList.add('hidden');
    }
}

function updateProgressPath() {
    const walker = document.getElementById('harry-walker');
    const percentageEl = document.getElementById('path-percentage');
    
    // Mark current stop as completed
    const stop = document.querySelector(`.path-stop[data-q="${currentQuestion}"]`);
    if (stop) stop.classList.add('completed');
    
    // Move walker
    // Positions: Q1=0%, Q2=25%, Q3=50%, Q4=75%, Q5(End)=100%
    const position = ((currentQuestion) / 5) * 100;
    
    walker.classList.add('walking');
    walker.style.left = `${position}%`;
    
    setTimeout(() => walker.classList.remove('walking'), 800);
    
    if (currentQuestion === 5) {
        percentageEl.innerText = '100%';
    } else {
        percentageEl.innerText = `${Math.round(position)}%`;
    }
}

function triggerGameOver(msg = "You ran out of lives!") {
    stopTimer();
    
    const overlay = document.getElementById('game-over-overlay');
    const msgEl = document.getElementById('game-over-msg');
    const statsEl = document.getElementById('game-over-stats');
    const title = overlay.querySelector('.game-over-title');
    
    if (title) title.classList.add('glitch-text');
    
    msgEl.innerText = msg;
    statsEl.innerHTML = `Score: <span style="color:var(--text-light)">${score}/5</span><br>Reached Q: <span style="color:var(--text-light)">${currentQuestion}</span>`;
    
    overlay.classList.remove('hidden');
    
    if(typeof SFX !== 'undefined') SFX.playGameOver();
}

// --- PARTICLE SYSTEM: PIXEL STARS ---
function triggerStars(x, y) {
    const container = document.body;
    for (let i = 0; i < 15; i++) {
        const star = document.createElement('div');
        star.className = 'pixel-star';
        star.innerHTML = '✦'; 
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        star.style.color = ['#FFD700', '#FF69B4', '#FFF'][Math.floor(Math.random() * 3)];
        star.style.fontSize = (12 + Math.random() * 20) + 'px';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 3 + Math.random() * 8;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let posX = x;
        let posY = y;
        let opacity = 1;
        
        const animate = () => {
            posX += vx;
            posY += vy;
            posY += 0.1; // slight gravity
            opacity -= 0.02;
            star.style.left = posX + 'px';
            star.style.top = posY + 'px';
            star.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                star.remove();
            }
        };
        
        container.appendChild(star);
        requestAnimationFrame(animate);
    }
}


function restartQuizFromGameOver() {
    // Reset Variables
    lives = 5;
    score = 0;
    currentQuestion = 1;
    consecutiveFails = 0;
    combo = 0;
    
    // Reset UI
    const overlay = document.getElementById('game-over-overlay');
    overlay.classList.add('hidden');
    
    const comboEl = document.getElementById('quiz-combo');
    comboEl.classList.add('hidden');
    
    const hintText = document.getElementById('quiz-hint');
    hintText.innerText = "";
    
    // Reset Hearts
    for (let i = 1; i <= 5; i++) {
        const heart = document.getElementById(`heart-${i}`);
        heart.classList.remove('lost', 'recovered', 'taking-damage');
        heart.classList.add('full');
    }
    
    // Reset Path
    const walker = document.getElementById('harry-walker');
    walker.style.left = '0%';
    document.getElementById('path-percentage').innerText = '0%';
    const stops = document.querySelectorAll('.path-stop');
    stops.forEach(stop => stop.classList.remove('completed'));
    
    // Hide all questions, reveal Q1
    for (let i = 1; i <= 5; i++) {
        const q = document.getElementById(`q${i}`);
        if(q) {
            q.classList.remove('active');
            q.classList.add('hidden');
        }
    }
    
    document.getElementById('q1').classList.remove('hidden');
    document.getElementById('q1').classList.add('active');
    document.getElementById('quiz-current-q').innerText = "1";
    
    // Re-enable buttons
    const allButtons = document.querySelectorAll('#stage-1 .quiz-opt');
    allButtons.forEach(btn => btn.disabled = false);
    
    // Start timer for Q1
    startTimer();
}

// =========================================================================
// STAGE 2: JIGSAW (3x3 Grid)
// =========================================================================
const jigsawContainer = document.getElementById('jigsaw-container');
let draggedPiece = null;
let touchDraggedPiece = null;
let originalParent = null;

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function isSolvedOrder(arr) {
    return arr.every((value, index) => value === index);
}

function initJigsaw() {
    if (!jigsawContainer) return;

    jigsawContainer.innerHTML = '';

    const imgSrc = "images/IMG_2199.jpeg";
    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
        const containerSize = 320;
        const rows = 3;
        const cols = 3;
        const totalPieces = rows * cols;

        const pieceWidth = containerSize / cols;
        const pieceHeight = containerSize / rows;

        jigsawContainer.style.width = `${containerSize}px`;
        jigsawContainer.style.height = `${containerSize}px`;
        jigsawContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        jigsawContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        jigsawContainer.style.backgroundImage = 'none';

        const correctIndexes = Array.from({ length: totalPieces }, (_, i) => i);
        let shuffledIndexes = shuffleArray(correctIndexes);

        // Evita che parta già risolto
        while (isSolvedOrder(shuffledIndexes)) {
            shuffledIndexes = shuffleArray(correctIndexes);
        }

        // Crea gli slot
        for (let i = 0; i < totalPieces; i++) {
            const slot = document.createElement('div');
            slot.className = 'jigsaw-slot';
            slot.dataset.index = i;
            slot.style.width = `${pieceWidth}px`;
            slot.style.height = `${pieceHeight}px`;

            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', handleDrop);

            jigsawContainer.appendChild(slot);
        }

        const slotElements = [...jigsawContainer.querySelectorAll('.jigsaw-slot')];

        // Crea i pezzi e li mette in slot random
        shuffledIndexes.forEach((pieceIndex, i) => {
            const piece = document.createElement('div');
            piece.className = 'jigsaw-piece';
            piece.draggable = true;
            piece.dataset.correctIndex = pieceIndex;

            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url("${imgSrc}")`;
            piece.style.backgroundSize = `${containerSize}px ${containerSize}px`;

            const row = Math.floor(pieceIndex / cols);
            const col = pieceIndex % cols;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;

            piece.addEventListener('dragstart', function () {
                draggedPiece = this;
                this.classList.add('dragging');
                setTimeout(() => {
                    this.style.opacity = '0.35';
                }, 0);
            });

            piece.addEventListener('dragend', function () {
                this.style.opacity = '1';
                this.classList.remove('dragging');
                draggedPiece = null;
                checkJigsawComplete();
            });

            piece.addEventListener('touchstart', handleTouchStart, { passive: false });
            piece.addEventListener('touchmove', handleTouchMove, { passive: false });
            piece.addEventListener('touchend', handleTouchEnd);

            slotElements[i].appendChild(piece);
        });
    };
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedPiece) return;

    const targetSlot = this;
    const sourceSlot = draggedPiece.parentNode;

    if (!targetSlot || !sourceSlot || targetSlot === sourceSlot) return;

    const targetPiece = targetSlot.firstElementChild;

    if (targetPiece) {
        sourceSlot.appendChild(targetPiece);
    }

    targetSlot.appendChild(draggedPiece);

    if (typeof SFX !== 'undefined') SFX.playBlip();
}

function handleTouchStart(e) {
    e.preventDefault();

    touchDraggedPiece = this;
    originalParent = this.parentNode;

    const touch = e.touches[0];
    const rect = this.getBoundingClientRect();

    this.classList.add('dragging');
    this.style.opacity = '0.8';
    this.style.position = 'fixed';
    this.style.left = `${touch.clientX - rect.width / 2}px`;
    this.style.top = `${touch.clientY - rect.height / 2}px`;
    this.style.zIndex = '9999';
    this.style.pointerEvents = 'none';
}

function handleTouchMove(e) {
    if (!touchDraggedPiece) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = touchDraggedPiece.getBoundingClientRect();

    touchDraggedPiece.style.left = `${touch.clientX - rect.width / 2}px`;
    touchDraggedPiece.style.top = `${touch.clientY - rect.height / 2}px`;
}

function handleTouchEnd(e) {
    if (!touchDraggedPiece) return;

    const piece = touchDraggedPiece;
    const touch = e.changedTouches[0];

    piece.style.pointerEvents = '';
    piece.style.opacity = '1';
    piece.style.position = 'relative';
    piece.style.left = '0';
    piece.style.top = '0';
    piece.style.zIndex = '';
    piece.classList.remove('dragging');

    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetSlot = dropTarget ? dropTarget.closest('.jigsaw-slot') : null;

    if (targetSlot && originalParent) {
        const targetPiece = targetSlot.firstElementChild;

        if (targetPiece && targetPiece !== piece) {
            originalParent.appendChild(targetPiece);
        }

        targetSlot.appendChild(piece);

        if (typeof SFX !== 'undefined') SFX.playBlip();
    } else if (originalParent) {
        originalParent.appendChild(piece);
    }

    touchDraggedPiece = null;
    originalParent = null;

    checkJigsawComplete();
}

function checkJigsawComplete() {
    const slots = document.querySelectorAll('.jigsaw-slot');
    let complete = true;

    slots.forEach((slot) => {
        const piece = slot.firstElementChild;
        if (!piece || Number(slot.dataset.index) !== Number(piece.dataset.correctIndex)) {
            complete = false;
        }
    });

    if (complete) {
        if (typeof SFX !== 'undefined') SFX.playLevelClear();
        if (typeof confetti !== 'undefined') {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }

        const puzzleCard = document.querySelector('#stage-2 .puzzle-card');
        if (puzzleCard) puzzleCard.classList.add('hidden');

        revealReward(2);
    }
}

function resetJigsaw() {
    initJigsaw();
}

document.addEventListener('DOMContentLoaded', initJigsaw);

// =========================================================================
// STAGE 3: MEMORY GAME
// =========================================================================
const memoryGrid = document.getElementById('memory-grid');
const elMoves = document.getElementById('memory-moves');
const elPairs = document.getElementById('memory-pairs');

let cardsArray = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let pairsFound = 0;

// Custom emojis representing her interests (Gym, Harry Styles, Bridgerton, Squid Game, Pepper, scopare)
const memoryIcons = ['🏋️‍♀️', '🍉', '👑', '🦑', '🐕', '🛏️'];

function initMemory() {
    if(!memoryGrid) return;
    memoryGrid.innerHTML = '';
    moves = 0;
    pairsFound = 0;
    elMoves.innerText = `Moves: 0`;
    elPairs.innerText = `Pairs: 0/6`;
    
    // Create card pairs
    cardsArray = [...memoryIcons, ...memoryIcons];
    cardsArray.sort(() => 0.5 - Math.random());
    
    cardsArray.forEach(icon => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.icon = icon;
        
        // Inner symbol hidden by default (using text transparent until flipped)
        card.innerHTML = `<span style="opacity:0; transition:opacity 0.2s">${icon}</span>`;
        
        card.addEventListener('click', flipCard);
        memoryGrid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');
    this.querySelector('span').style.opacity = 1;
    if(typeof SFX !== 'undefined') SFX.playBlip();

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    elMoves.innerText = `Moves: ${moves}`;
    
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
        if(typeof SFX !== 'undefined') SFX.playWin();
        disableCards();
        pairsFound++;
        elPairs.innerText = `Pairs: ${pairsFound}/6`;
        
        if (pairsFound === 6) {
            setTimeout(() => {
                if(typeof SFX !== 'undefined') SFX.playLevelClear();
                if(typeof confetti !== 'undefined') confetti({particleCount: 50, spread: 60, origin: {y: 0.6}});
                document.querySelector('#stage-3 .puzzle-card').classList.add('hidden');
                revealReward(3);
            }, 1000);
        }
    } else {
        if(typeof SFX !== 'undefined') SFX.playError();
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        firstCard.querySelector('span').style.opacity = 0;
        secondCard.classList.remove('flipped');
        secondCard.querySelector('span').style.opacity = 0;
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function resetMemory() { initMemory(); }
document.addEventListener('DOMContentLoaded', initMemory);

// =========================================================================
// STAGE 4: SCRATCH CARD
// =========================================================================
let scratchCanvas, scratchCtx;
let isDrawing = false;
let scratchedPixels = 0;
let totalPixels = 0;
let scratchComplete = false;

function initScratch() {
    scratchCanvas = document.getElementById('scratch-canvas');
    if(!scratchCanvas) return;
    
    scratchCtx = scratchCanvas.getContext('2d', { willReadFrequently: true });
    
    // Match wrapper dimensions
    const wrapper = document.getElementById('scratch-wrapper');
    scratchCanvas.width = wrapper.offsetWidth || 300;
    scratchCanvas.height = wrapper.offsetHeight || 300;
    
    totalPixels = scratchCanvas.width * scratchCanvas.height;
    scratchComplete = false;
    
    // Fill with gold pixel pattern
    scratchCtx.fillStyle = '#D4AF37'; // Gold
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    
    // Add some pixel noise for texture
    for(let i=0; i<1000; i++) {
        scratchCtx.fillStyle = Math.random() > 0.5 ? '#b89423' : '#e6c245';
        scratchCtx.fillRect(
            Math.random() * scratchCanvas.width, 
            Math.random() * scratchCanvas.height, 
            4, 4 // 4px blocks
        );
    }
    
    // Setup composite operation for erasing
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.lineWidth = 30; // Brush size
    scratchCtx.lineJoin = 'round';
    scratchCtx.lineCap = 'square'; // blocky brush
    
    // Events
    scratchCanvas.addEventListener('mousedown', startScratch);
    scratchCanvas.addEventListener('mousemove', scratch);
    scratchCanvas.addEventListener('mouseup', endScratch);
    scratchCanvas.addEventListener('mouseleave', endScratch);
    
    // Touch support
    scratchCanvas.addEventListener('touchstart', startScratch, {passive: false});
    scratchCanvas.addEventListener('touchmove', scratch, {passive: false});
    scratchCanvas.addEventListener('touchend', endScratch);
}

function getPointerPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    return { x, y };
}

function startScratch(e) {
    if(scratchComplete) return;
    e.preventDefault();
    isDrawing = true;
    const pos = getPointerPos(e);
    scratchCtx.beginPath();
    scratchCtx.moveTo(pos.x, pos.y);
}

function scratch(e) {
    if (!isDrawing || scratchComplete) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    scratchCtx.lineTo(pos.x, pos.y);
    scratchCtx.stroke();
    
    // Throttle the checking
    if(Math.random() < 0.1) checkScratchCompletion();
}

function endScratch() {
    isDrawing = false;
    checkScratchCompletion();
}

function checkScratchCompletion() {
    if(scratchComplete) return;
    
    // Check how many pixels are clear (alpha = 0)
    const imgData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const data = imgData.data;
    let clearCount = 0;
    
    // Check every 4th pixel for speed (stride of 16 bytes)
    for (let i = 3; i < data.length; i += 16) {
        if (data[i] === 0) {
            clearCount++;
        }
    }
    
    const percentage = clearCount / (totalPixels / 4);
    
    if (percentage > 0.45) { // 45% cleared is enough
        scratchComplete = true;
        if(typeof SFX !== 'undefined') SFX.playLevelClear();
        if(typeof confetti !== 'undefined') confetti({particleCount: 50, spread: 60, origin: {y: 0.6}});
        // Fade out canvas completely
        scratchCanvas.style.transition = 'opacity 1s';
        scratchCanvas.style.opacity = '0';
        
        setTimeout(() => {
            scratchCanvas.style.display = 'none';
            revealReward(4);
            document.getElementById('scratch-hint').innerText = "Memory Revealed!";
        }, 1000);
    }
}

function resetScratch() {
    if(scratchCanvas) {
        scratchCanvas.style.display = 'block';
        scratchCanvas.style.opacity = '1';
        scratchCanvas.style.transition = 'none';
    }
    initScratch();
}
document.addEventListener('DOMContentLoaded', initScratch);
