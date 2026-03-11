/* =========================================================================
   countdown.js - Landing Page Timer
   ========================================================================= */

// ✏️ CUSTOMIZE: Target Date (Format: YYYY-MM-DDTHH:MM:SS)
const targetDateStr = "2026-03-15T00:00:00";
const targetDate = new Date(targetDateStr).getTime();

// DOM Elements
const elDays = document.getElementById('cd-days');
const elHours = document.getElementById('cd-hours');
const elMinutes = document.getElementById('cd-minutes');
const elSeconds = document.getElementById('cd-seconds');

// Update interval
let countdownInterval;

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Check if target is reached
    if (distance < 0) {
        clearInterval(countdownInterval);
        elDays.innerText = "00";
        elHours.innerText = "00";
        elMinutes.innerText = "00";
        elSeconds.innerText = "00";
        document.querySelector('.countdown-label').innerText = "HAPPY BIRTHDAY! 🎉";
        document.querySelector('.countdown-label').style.color = "var(--primary-rose)";
        return;
    }

    // Time calculations
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update DOM (with leading zeros)
    if(elDays) elDays.innerText = days.toString().padStart(2, '0');
    if(elHours) elHours.innerText = hours.toString().padStart(2, '0');
    if(elMinutes) elMinutes.innerText = minutes.toString().padStart(2, '0');
    if(elSeconds) elSeconds.innerText = seconds.toString().padStart(2, '0');
}

// Start timer 
// Delay standard start if DOM not ready, but we use defer/script at end so it's fine
if(elDays) {
    updateCountdown(); // Run once immediately
    countdownInterval = setInterval(updateCountdown, 1000);
}
