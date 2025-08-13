let names = [];
let colors = [];
let lastSelected = null;
let isSpinning = false;

const wheelCanvas = document.getElementById('wheel');
const ctx = wheelCanvas.getContext('2d');
const spinButton = document.getElementById('spin-button');
const generateButton = document.getElementById('generate-button');
const clearButton = document.getElementById('clear-button');
const resetButton = document.getElementById('reset-button');
const namesInput = document.getElementById('names-input');
const overlay = document.getElementById('overlay');
const selectedNameEl = document.getElementById('selected-name');
const closeOverlay = document.getElementById('close-overlay');
const lastSelectedEl = document.getElementById('last-selected');

// Resize wheel for viewport
function resizeWheel() {
  const controlsHeight = document.querySelector('.input-container').offsetHeight + 80;
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight - controlsHeight;
  const size = Math.min(maxWidth, maxHeight);
  wheelCanvas.width = size;
  wheelCanvas.height = size;
  drawWheel();
}
window.addEventListener('resize', resizeWheel);

// Generate colors
function generateColors(n) {
  colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(`hsl(${i * (360 / n)}, 70%, 50%)`);
  }
}

// Draw 3D/embossed roulette-style wheel
function drawWheel() {
  const len = names.length;
  const radius = wheelCanvas.width / 2;
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  if (!len) return;

  const arc = (2 * Math.PI) / len;

  for (let i = 0; i < len; i++) {
    const startAngle = i * arc;
    const endAngle = (i + 1) * arc;

    // Radial gradient for 3D effect
    const grad = ctx.createRadialGradient(radius, radius, radius*0.1, radius, radius, radius);
    grad.addColorStop(0, 'rgba(255,255,255,0.2)'); // highlight
    grad.addColorStop(0.3, colors[i]);
    grad.addColorStop(1, 'rgba(0,0,0,0.3)'); // shadow

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text with outline
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + arc/2);
    ctx.textAlign = "right";
    ctx.font = `${Math.floor(radius / 8)}px Arial`;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeText(names[i], radius - 10, 5);
    ctx.fillText(names[i], radius - 10, 5);
    ctx.restore();
  }

  // Outer rim
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, 2*Math.PI);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = radius*0.05;
  ctx.stroke();

  // Inner rim
  ctx.beginPath();
  ctx.arc(radius, radius, radius*0.1, 0, 2*Math.PI);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = radius*0.03;
  ctx.stroke();
}

// Spin animation
function spinWheel() {
  if (isSpinning) return;
  if (names.length < 2) {
    alert("Please enter at least 2 names.");
    return;
  }

  isSpinning = true;
  const spins = Math.floor(Math.random() * 5 + 10);
  const randomIndex = Math.floor(Math.random() * names.length);
  const arc = 2 * Math.PI / names.length;
  const targetAngle = (2 * Math.PI * spins) + (arc * randomIndex) + arc/2;
  const duration = 4000;
  const start = performance.now();

  function animate(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const angle = targetAngle * easeOutQuad(progress);

    ctx.save();
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    ctx.translate(wheelCanvas.width/2, wheelCanvas.height/2);
    ctx.rotate(angle);
    ctx.translate(-wheelCanvas.width/2, -wheelCanvas.height/2);
    drawWheel();
    ctx.restore();

    if (progress < 1) requestAnimationFrame(animate);
    else {
      isSpinning = false;
      lastSelected = names[randomIndex];
      lastSelectedEl.textContent = "Last Selected: " + lastSelected;
      selectedNameEl.textContent = lastSelected;
      overlay.style.display = 'flex';
    }
  }
  requestAnimationFrame(animate);
}

function easeOutQuad(t) { return t*(2-t); }

// Event listeners
generateButton.addEventListener('click', () => {
  const input = namesInput.value.trim();
  names = input.split("\n").filter(n => n.trim() !== "");
  if (names.length < 2) {
    alert("Please enter at least 2 names.");
    return;
  }
  generateColors(names.length);
  resizeWheel();
});

clearButton.addEventListener('click', () => {
  namesInput.value = "";
  names = [];
  colors = [];
  drawWheel();
});

resetButton.addEventListener('click', () => {
  names = [];
  colors = [];
  drawWheel();
  lastSelectedEl.textContent = "Last Selected: None";
  overlay.style.display = 'none';
});

spinButton.addEventListener('click', spinWheel);

closeOverlay.addEventListener('click', () => overlay.style.display = 'none');

resizeWheel();
