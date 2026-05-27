// ─── Canvas mouse events ──────────────────────────────────────────────────────
function getActiveCanvas() { return mode === '2D' ? canvasEl : canvas1D; }

// Asignación de Listeners
canvasEl.addEventListener('mousedown', onMouseDown);
canvas1D.addEventListener('mousedown', onMouseDown);
canvasEl.addEventListener('mousemove', onMouseMove);
canvas1D.addEventListener('mousemove', onMouseMove);
canvasEl.addEventListener('mouseup', onMouseUp);
canvas1D.addEventListener('mouseup', onMouseUp);
canvasEl.addEventListener('wheel', onWheel, { passive: true });
canvas1D.addEventListener('wheel', onWheel, { passive: true });

function onMouseDown(e) {
  const rect = e.target.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;

  if (e.shiftKey) {
    const [wx, wy] = toWorld(mx, my);
    probePoint = { x: wx, y: mode === '1D' ? 0 : wy };
    updateResults();
    render();
    return;
  }

  for (let i = 0; i < charges.length; i++) {
    const c = charges[i];
    const [cx, cy] = mode === '2D' ? toCanvas(c.x, c.y) : [canvasEl.width/2 + c.x * zoom, canvasEl.height/2];
    const [acx, acy] = mode === '1D' ? [canvas1D.width/2 + c.x*zoom, canvas1D.height/2] : [cx, cy];
    const dist = Math.sqrt((mx-acx)**2 + (my-acy)**2);
    if (dist < 16) {
      dragging = i;
      selectedIdx = i;
      dragStart = { mx, my, cx: c.x, cy: c.y };
      renderChargeList();
      updateResults();
      return;
    }
  }

  const [wx, wy] = toWorld(mx, my);
  const magNC = parseFloat(document.getElementById('chargeVal').value) || 1;
  const q = chargeType * magNC * 1e-9;
  charges.push({ id: nextId++, q, x: parseFloat(wx.toFixed(3)), y: mode === '1D' ? 0 : parseFloat(wy.toFixed(3)) });
  selectedIdx = charges.length - 1;
  renderChargeList();
  updateResults();
  render();
}

function onMouseMove(e) {
  if (dragging === null) return;
  const rect = e.target.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const dx = (mx - dragStart.mx) / zoom;
  const dy = -(my - dragStart.my) / zoom;
  charges[dragging].x = parseFloat((dragStart.cx + dx).toFixed(3));
  charges[dragging].y = mode === '1D' ? 0 : parseFloat((dragStart.cy + dy).toFixed(3));
  renderChargeList();
  updateResults();
  render();

  const [wx, wy] = toWorld(mx, my);
  document.getElementById('statusbar').innerHTML =
    `x: <span>${wx.toFixed(2)} m</span> · y: <span>${wy.toFixed(2)} m</span> · Cargas: <span>${charges.length}</span>`;
}

function onMouseUp() { dragging = null; }

function onWheel(e) {
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  zoom = Math.max(10, Math.min(300, zoom * factor));
  render();
}