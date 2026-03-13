/* =========================================================================
   particles.js - Floating Background Particles
   ========================================================================= */

const PARTICLES = ['🎵', '💖', '✨', '🎶', '🍉', '🦋'];
const particleColors = ['#ff6eb4', '#ffcedc', '#fff', '#d4af37'];
const bgContainer = document.getElementById('hearts-bg');

function createParticle() {
    if (!bgContainer) return;
    
    const particle = document.createElement('div');
    particle.classList.add('floating-particle');
    
    // Randomize properties
    const icon = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    const size = Math.random() * 1.5 + 0.5; // 0.5x to 2x
    const left = Math.random() * 100; // 0 to 100vw
    const duration = Math.random() * 10 + 10; // 10s to 20s
    const delay = Math.random() * 5; // 0s to 5s
    
    particle.innerText = icon;
    particle.style.left = `${left}vw`;
    particle.style.color = color;
    particle.style.fontSize = `${size}rem`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    
    // Add pixel text shadow for retro look
    particle.style.textShadow = '2px 2px 0 #000';
    
    bgContainer.appendChild(particle);
    
    // Remove after animation to prevent DOM bloat
    setTimeout(() => {
        if(particle.parentNode) particle.remove();
    }, (duration + delay) * 1000);
}

// Start spawning particles occasionally
function initParticles() {
    // Initial batch
    for(let i=0; i<15; i++) createParticle();
    
    // Continuous spawn
    setInterval(createParticle, 2000);
}

document.addEventListener('DOMContentLoaded', initParticles);
