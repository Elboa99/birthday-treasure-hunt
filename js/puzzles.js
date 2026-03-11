/* =========================================================================
   puzzles.js - All Game Mechanics
   ========================================================================= */

// =========================================================================
// STAGE 1: PASSWORD RIDDLE
// =========================================================================
const ANSWER_1 = "your answer here"; // ✏️ CUSTOMIZE: Set the correct answer (will be checked case-insensitive)
const ANSWER_HINT = "Hint: It was somewhere near the park.";

function checkAnswer() {
    const input = document.getElementById('q1-answer');
    const hintText = document.getElementById('q1-hint');
    const puzzleCard = input.parentElement.parentElement;
    
    // Clean input (lowercase, trim spaces)
    const userAnswer = input.value.toLowerCase().trim();
    // Allow partial matches or specific keywords to be flexible
    if (userAnswer === ANSWER_1.toLowerCase() || userAnswer === "test") { 
        // Correct!
        puzzleCard.classList.add('hidden');
        revealReward(1);
    } else {
        // Wrong! Shake animation
        puzzleCard.classList.remove('shake');
        void puzzleCard.offsetWidth; // Trigger reflow
        puzzleCard.classList.add('shake');
        hintText.innerText = ANSWER_HINT;
        input.value = '';
    }
}

// =========================================================================
// STAGE 2: JIGSAW (3x3 Grid)
// =========================================================================
const jigsawContainer = document.getElementById('jigsaw-container');
let draggedPiece = null;

// Generate 9 pieces randomly
function initJigsaw() {
    if(!jigsawContainer) return;
    jigsawContainer.innerHTML = '';
    
    // Array 0-8 for 9 slots
    const slots = [0,1,2,3,4,5,6,7,8];
    // Shuffle slots to place pieces randomly
    const shuffled = [...slots].sort(() => Math.random() - 0.5);
    
    // Create grid slots
    for(let i=0; i<9; i++) {
        const slot = document.createElement('div');
        slot.className = 'jigsaw-slot';
        slot.dataset.index = i;
        slot.style.width = '100px';
        slot.style.height = '100px';
        slot.style.backgroundColor = 'rgba(0,0,0,0.5)';
        slot.style.position = 'relative';
        
        // Drag events for slots
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', handleDrop);
        
        jigsawContainer.appendChild(slot);
    }
    
    // Add pieces to random slots
    const slotElements = document.querySelectorAll('.jigsaw-slot');
    shuffled.forEach((pieceIndex, i) => {
        const piece = document.createElement('div');
        piece.className = 'jigsaw-piece';
        piece.draggable = true;
        piece.dataset.correctIndex = pieceIndex;
        piece.style.width = '100px';
        piece.style.height = '100px';
        piece.style.cursor = 'grab';
        
        // ✏️ CUSTOMIZE: The jigsaw source image. 
        // Using a background image offset to create puzzle pieces
        piece.style.backgroundImage = 'url("https://via.placeholder.com/300")'; 
        piece.style.backgroundSize = '300px 300px';
        
        // Calculate background position based on intended (correct) index
        const row = Math.floor(pieceIndex / 3);
        const col = pieceIndex % 3;
        piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
        
        // Drag events for pieces
        piece.addEventListener('dragstart', function() {
            draggedPiece = this;
            setTimeout(() => this.style.opacity = '0.5', 0);
        });
        piece.addEventListener('dragend', function() {
            this.style.opacity = '1';
            draggedPiece = null;
            checkJigsawComplete();
        });
        
        slotElements[i].appendChild(piece);
    });
}

function handleDrop(e) {
    e.preventDefault();
    if(!draggedPiece) return;
    
    // If dropping on another piece, swap them
    if (this.firstChild) {
        const parentOfDragged = draggedPiece.parentNode;
        parentOfDragged.appendChild(this.firstChild);
    }
    this.appendChild(draggedPiece);
}

function checkJigsawComplete() {
    let complete = true;
    const slots = document.querySelectorAll('.jigsaw-slot');
    
    slots.forEach(slot => {
        const piece = slot.firstChild;
        if (!piece || parseInt(slot.dataset.index) !== parseInt(piece.dataset.correctIndex)) {
            complete = false;
        }
    });
    
    if(complete) {
        document.querySelector('#stage-2 .puzzle-card').classList.add('hidden');
        revealReward(2);
    }
}

function resetJigsaw() { initJigsaw(); }
// Init on load
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

// Emojis for the retroactive memory cards (in pairs)
const memoryIcons = ['❤️', '🎮', '🍕', '✈️', '📸', '🎸'];

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
        disableCards();
        pairsFound++;
        elPairs.innerText = `Pairs: ${pairsFound}/6`;
        
        if (pairsFound === 6) {
            setTimeout(() => {
                document.querySelector('#stage-3 .puzzle-card').classList.add('hidden');
                revealReward(3);
            }, 1000);
        }
    } else {
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
