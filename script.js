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

// Resize wheel
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

// Generate bright colors
function generateColors(n) {
  colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(`hsl(${i * (360 / n)}, 80%, 55%)`);
  }
}

// Draw wheel with 3D gradient
function drawWheel() {
  const len = names.length;
  const radius = wheelCanvas.width / 2;
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  if (!len) return;

  const arc = (2 * Math.PI) / len;

  for (let i = 0; i < len; i++) {
    const startAngle = i * arc;
    const endAngle = (i + 1) * arc;

    const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
    grad.addColorStop(0.4, colors[i]);
    grad.addColorStop(1, colors[i]);

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + arc / 2);
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
  ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = radius * 0.05;
  ctx.stroke();

  // Inner rim
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.1, 0, 2 * Math.PI);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = radius * 0.03;
  ctx.stroke();
}

// Spin wheel with consistent segment
function spinWheel() {
  if (isSpinning) return;
  if (names.length < 2) { alert("Enter at least 2 names"); return; }

  isSpinning = true;
  const len = names.length;
  const arc = 2 * Math.PI / len;

  const selectedIndex = Math.floor(Math.random() * len);
  const extraSpins = 5 + Math.floor(Math.random() * 5);
  const totalRotation = (2 * Math.PI * extraSpins) + (len - selectedIndex - 0.5) * arc;

  const duration = 4000;
  const start = performance.now();

  function animate(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const angle = totalRotation * easeOutQuad(progress);

    ctx.save();
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-wheelCanvas.width / 2, -wheelCanvas.height / 2);
    drawWheel();
    ctx.restore();

    if (progress < 1) requestAnimationFrame(animate);
    else {
      isSpinning = false;
      const selectedName = names[selectedIndex];
      lastSelected = selectedName;
      lastSelectedEl.textContent = "Last Selected: " + selectedName;
      selectedNameEl.textContent = selectedName;
      overlay.style.display = 'flex';
    }
  }
  requestAnimationFrame(animate);
}

function easeOutQuad(t) { return t * (2 - t); }

generateButton.addEventListener('click', () => {
  const input = namesInput.value.trim();
  names = input.split("\n").filter(n => n.trim() !== "");
  if (names.length < 2) { alert("Enter at least 2 names"); return; }
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
