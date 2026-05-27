// ─── State ───────────────────────────────────────────────────────────────────
const k = 8.99e9; // Constante de Coulomb
let charges = [];
let selectedIdx = -1;
let mode = '2D';
let opts = { field: true, force: true, lines: true, potential: false };
let zoom = 60; // px por metro
let offsetX = 0, offsetY = 0;
let dragging = null, dragStart = null;
let nextId = 1;
let chargeType = 1; // +1 o -1
let probePoint = null;

// ─── Canvas setup ─────────────────────────────────────────────────────────────
const canvasEl = document.getElementById('canvas2D');
const ctx = canvasEl.getContext('2d');
const canvas1D = document.getElementById('canvas1D');
const ctx1D = canvas1D.getContext('2d');

function resizeCanvas() {
  const area = document.getElementById('canvasArea');
  canvasEl.width = area.clientWidth;
  canvasEl.height = area.clientHeight;
  canvas1D.width = area.clientWidth;
  canvas1D.height = area.clientHeight;
  if (offsetX === 0 && offsetY === 0) {
    offsetX = canvasEl.width / 2;
    offsetY = canvasEl.height / 2;
  }
  if (typeof render === 'function') render();
}
window.addEventListener('resize', resizeCanvas);

// ─── Transformación de Coordenadas ───────────────────────────────────────────
function toCanvas(wx, wy) {
  return [offsetX + wx * zoom, offsetY - wy * zoom];
}
function toWorld(cx, cy) {
  return [(cx - offsetX) / zoom, -(cy - offsetY) / zoom];
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();

  // Cargas de demostración iniciales
  charges = [
    { id: nextId++, q:  2e-9, x: -2, y:  0 },
    { id: nextId++, q: -2e-9, x:  2, y:  0 },
    { id: nextId++, q:  1e-9, x:  0, y:  2 },
  ];
  selectedIdx = 0;
  
  if (typeof renderChargeList === 'function') renderChargeList();
  if (typeof updateResults === 'function') updateResults();
  if (typeof render === 'function') render();
});