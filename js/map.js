/* =========================================================================
   map.js - Interactive Treasure Map System
   Shows an animated map between stages with a glowing trail
   ========================================================================= */

const MAP_LOCATIONS = [
    { icon: '📺', label: 'QUIZ' },
    { icon: '🧩', label: 'JIGSAW' },
    { icon: '🃏', label: 'MEMORY' },
    { icon: '🎤', label: 'SCRATCH' },
    { icon: '🏆', label: 'FINALE' }
];

/**
 * Shows the treasure map overlay, highlights completed stages,
 * and animates the path to the next stage.
 * @param {number} completedStage - The stage number just completed (1-based)
 * @param {Function} callback - Called when map animation finishes
 */
function showTreasureMap(completedStage, callback) {
    const overlay = document.getElementById('map-overlay');
    if (!overlay) { if (callback) callback(); return; }

    // Build the map pins
    const pinsContainer = overlay.querySelector('.map-pins');
    if (pinsContainer) {
        pinsContainer.innerHTML = '';
        MAP_LOCATIONS.forEach((loc, i) => {
            const pin = document.createElement('div');
            pin.className = 'map-pin';
            // Stages 1..N: index i corresponds to stage i+1
            if (i + 1 < completedStage) {
                pin.classList.add('completed');
            } else if (i + 1 === completedStage) {
                pin.classList.add('current');
            }
            pin.innerHTML = `
                <span class="map-pin-icon">${loc.icon}</span>
                <span class="map-pin-label">${loc.label}</span>
            `;
            pinsContainer.appendChild(pin);
        });
    }

    // Show overlay
    overlay.classList.add('active');

    // Play SFX
    if (typeof SFX !== 'undefined') SFX.playBlip();

    // Animate the path fill
    const pathFill = overlay.querySelector('.map-path-fill');
    if (pathFill) {
        // Each completed stage fills a portion: stage 1 = 20%, stage 2 = 40%, etc.
        const pct = Math.min((completedStage / MAP_LOCATIONS.length) * 100, 100);
        // Reset first for re-animation
        pathFill.style.transition = 'none';
        pathFill.style.width = Math.max(pct - 20, 0) + '%';
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                pathFill.style.transition = 'width 1.5s ease-in-out';
                pathFill.style.width = pct + '%';
            });
        });
    }

    // After animation, auto-close and continue
    setTimeout(() => {
        overlay.classList.remove('active');
        if (callback) callback();
    }, 2500);
}
