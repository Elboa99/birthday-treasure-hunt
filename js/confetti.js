/* =========================================================================
   confetti.js - Pixel Art Finale Animation
   ========================================================================= */

let confettiActive = false;
let animationFrameId;

function initFinale() {
    if(confettiActive) return;
    confettiActive = true;
    
    const canvas = document.getElementById('confetti-canvas');
    if(!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Pixel confetti colors
    const colors = [
        '#BA4A76', // Deep Rose
        '#FFD1DC', // Soft Pink
        '#D4AF37', // Gold
        '#FFFFFF', // White
        '#E8A0BF'  // Mid Pink
    ];
    
    const particles = [];
    
    // Generate particles
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4, // 4-12px blocks
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 4 - 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: 0,
            rotationSpeed: Math.random() * 0.2 - 0.1
        });
    }
    
    function animate() {
        if(!confettiActive) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            
            // Draw pixel block
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            
            // Add blocky highlight
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size/4);
            
            ctx.restore();
            
            // Reset particle at top varying x position
            if(p.y > canvas.height + p.size) {
                p.y = -p.size;
                p.x = Math.random() * canvas.width;
            }
        });
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function stopConfetti() {
    confettiActive = false;
    cancelAnimationFrame(animationFrameId);
    
    const canvas = document.getElementById('confetti-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
