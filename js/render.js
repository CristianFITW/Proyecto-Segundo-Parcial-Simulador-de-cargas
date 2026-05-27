// ─── Rendering ────────────────────────────────────────────────────────────
function render() {
  if (mode === '2D') render2D();
  else render1D();
}

function render2D() {
  const W = canvasEl.width, H = canvasEl.height;
  ctx.clearRect(0, 0, W, H);

  // Background grid
  ctx.strokeStyle = '#dce8f5';
  ctx.lineWidth = 1;
  const step = zoom;
  const x0 = offsetX % step;
  for (let x = x0; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  const y0 = offsetY % step;
  for (let y = y0; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#aac3e0';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, offsetY); ctx.lineTo(W, offsetY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(offsetX, 0); ctx.lineTo(offsetX, H); ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#9ab4cc';
  ctx.font = '10px Space Mono';
  ctx.textAlign = 'center';
  for (let i = -20; i <= 20; i++) {
    if (i === 0) continue;
    const [cx] = toCanvas(i, 0);
    if (cx > 10 && cx < W - 10) {
      ctx.fillText(i, cx, offsetY + 14);
    }
    const [, cy] = toCanvas(0, i);
    if (cy > 10 && cy < H - 10) {
      ctx.textAlign = 'right';
      ctx.fillText(i, offsetX - 6, cy + 3);
      ctx.textAlign = 'center';
    }
  }

  // Potential map
  if (opts.potential && charges.length > 0) {
    const res = 8;
    for (let cx = 0; cx < W; cx += res) {
      for (let cy = 0; cy < H; cy += res) {
        const [wx, wy] = toWorld(cx + res/2, cy + res/2);
        const V = electricPotential(wx, wy);
        const norm = Math.tanh(V / 5e9);
        if (norm > 0) {
          ctx.fillStyle = `rgba(230,57,80,${Math.abs(norm)*0.22})`;
        } else {
          ctx.fillStyle = `rgba(26,127,196,${Math.abs(norm)*0.22})`;
        }
        ctx.fillRect(cx, cy, res, res);
      }
    }
  }

  // Field vectors
  if (opts.field && charges.length > 0) {
    const density = parseInt(document.getElementById('fieldDensity').value);
    const gx = Math.ceil(W / (W / density));
    const gy = Math.ceil(H / (H / density));
    const sx = W / density, sy = H / density;

    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const cx = sx * (i + 0.5), cy = sy * (j + 0.5);
        const [wx, wy] = toWorld(cx, cy);
        const { ex, ey, mag } = electricField(wx, wy);
        if (mag < 1e-10) continue;
        const len = Math.min(sx * 0.45, 15 + Math.log10(mag + 1) * 5);
        const ux = ex / mag, uy = ey / mag;
        const ex2 = cx + ux * len * 0.9;
        const ey2 = cy - uy * len * 0.9;
        const intensity = Math.min(1, Math.log10(mag + 1) / 10);
        const r = Math.round(26 + (230-26)*intensity);
        const g = Math.round(127 + (57-127)*intensity);
        const b = Math.round(196 + (80-196)*intensity);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.65)`;
        ctx.fillStyle = `rgba(${r},${g},${b},0.65)`;
        ctx.lineWidth = 1;
        drawArrow(ctx, cx, cy, ex2, ey2, 4);
      }
    }
  }

  // Field lines
  if (opts.lines && charges.length > 0) {
    drawFieldLines();
  }

  // Force vectors on selected
  if (opts.force && selectedIdx >= 0 && charges.length > 1) {
    const nf = netForce(selectedIdx);
    if (nf && nf.mag > 0) {
      const c = charges[selectedIdx];
      const [cx, cy] = toCanvas(c.x, c.y);
      const len = Math.min(80, 20 + Math.log10(nf.mag + 1) * 15);
      const ux = nf.fx / nf.mag, uy = nf.fy / nf.mag;
      ctx.strokeStyle = '#1a5fa8';
      ctx.fillStyle = '#1a5fa8';
      ctx.lineWidth = 2.5;
      drawArrow(ctx, cx, cy, cx + ux * len, cy - uy * len, 7);

      for (let i = 0; i < charges.length; i++) {
        if (i === selectedIdx) continue;
        const o = charges[i];
        const dx = c.x - o.x, dy = c.y - o.y;
        const r2 = dx*dx + dy*dy;
        if (r2 < 1e-10) continue;
        const r = Math.sqrt(r2);
        const F = k * c.q * o.q / r2;
        const fx = F * dx / r, fy = F * dy / r;
        const mag = Math.sqrt(fx*fx + fy*fy);
        const ilen = Math.min(50, 10 + Math.log10(mag + 1) * 10);
        const iux = fx / mag, iuy = fy / mag;
        ctx.strokeStyle = 'rgba(26,95,168,0.4)';
        ctx.fillStyle = 'rgba(26,95,168,0.4)';
        ctx.lineWidth = 1.5;
        drawArrow(ctx, cx, cy, cx + iux * ilen, cy - iuy * ilen, 5);
      }
    }
  }

  // Probe point
  if (probePoint) {
    const [cx, cy] = toCanvas(probePoint.x, probePoint.y);
    const { ex, ey, mag } = electricField(probePoint.x, probePoint.y);
    ctx.strokeStyle = '#1a9e5c';
    ctx.fillStyle = '#1a9e5c';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.stroke();
    if (mag > 0) {
      const len = 40;
      const ux = ex/mag, uy = ey/mag;
      drawArrow(ctx, cx, cy, cx + ux*len, cy - uy*len, 7);
    }
  }

  // Charges
  for (let i = 0; i < charges.length; i++) {
    const c = charges[i];
    const [cx, cy] = toCanvas(c.x, c.y);
    const isPos = c.q > 0;
    const color = isPos ? '#e63950' : '#1a7fc4';
    const glowColor = isPos ? 'rgba(230,57,80,0.3)' : 'rgba(26,127,196,0.3)';
    const isSelected = i === selectedIdx;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.arc(cx, cy, isSelected ? 14 : 11, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();

    if (isSelected) {
      ctx.strokeStyle = '#1a5fa8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPos ? '+' : '−', cx, cy);

    const mag = Math.abs(c.q * 1e9).toFixed(1);
    ctx.fillStyle = color;
    ctx.font = '9px Space Mono';
    ctx.textBaseline = 'top';
    ctx.fillText(`q${i+1}=${mag}nC`, cx, cy + 16);
    ctx.textBaseline = 'alphabetic';
  }
}

function drawArrow(ctxInstance, x1, y1, x2, y2, headLen) {
  const angle = Math.atan2(y2-y1, x2-x1);
  ctxInstance.beginPath();
  ctxInstance.moveTo(x1, y1);
  ctxInstance.lineTo(x2, y2);
  ctxInstance.stroke();
  ctxInstance.beginPath();
  ctxInstance.moveTo(x2, y2);
  ctxInstance.lineTo(x2 - headLen*Math.cos(angle-0.4), y2 - headLen*Math.sin(angle-0.4));
  ctxInstance.lineTo(x2 - headLen*Math.cos(angle+0.4), y2 - headLen*Math.sin(angle+0.4));
  ctxInstance.closePath();
  ctxInstance.fill();
}

function drawFieldLines() {
  if (charges.length === 0) return;
  const posCharges = charges.filter(c => c.q > 0);
  const numLines = Math.min(8, Math.max(6, posCharges.length * 6));

  for (const c of charges) {
    if (c.q <= 0) continue;
    for (let a = 0; a < numLines; a++) {
      const angle = (2 * Math.PI * a) / numLines;
      let x = c.x + 0.2 * Math.cos(angle);
      let y = c.y + 0.2 * Math.sin(angle);
      const pts = [[...toCanvas(x, y)]];

      for (let step = 0; step < 300; step++) {
        const { ex, ey, mag } = electricField(x, y);
        if (mag < 1e-10) break;
        const dt = 0.05;
        x += (ex / mag) * dt;
        y += (ey / mag) * dt;

        const [cx, cy] = toCanvas(x, y);
        if (cx < -50 || cx > canvasEl.width+50 || cy < -50 || cy > canvasEl.height+50) break;

        let hitNeg = false;
        for (const nc of charges) {
          if (nc.q >= 0) continue;
          const dist = Math.sqrt((x-nc.x)**2 + (y-nc.y)**2);
          if (dist < 0.25) { hitNeg = true; break; }
        }
        if (hitNeg) break;
        pts.push([cx, cy]);
      }

      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let p = 1; p < pts.length; p++) ctx.lineTo(pts[p][0], pts[p][1]);
      ctx.strokeStyle = 'rgba(26,95,168,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function render1D() {
  const W = canvas1D.width, H = canvas1D.height;
  ctx1D.clearRect(0, 0, W, H);

  const axisY = H / 2;
  const scale = zoom;
  const ox = W / 2;

  // Grid
  ctx1D.strokeStyle = '#dce8f5';
  ctx1D.lineWidth = 1;
  for (let i = -30; i <= 30; i++) {
    const x = ox + i * scale;
    if (x < 0 || x > W) continue;
    ctx1D.beginPath(); ctx1D.moveTo(x, 0); ctx1D.lineTo(x, H); ctx1D.stroke();
  }

  // Axis
  ctx1D.strokeStyle = '#aac3e0';
  ctx1D.lineWidth = 2;
  ctx1D.beginPath(); ctx1D.moveTo(0, axisY); ctx1D.lineTo(W, axisY); ctx1D.stroke();
  ctx1D.strokeStyle = '#9ab4cc'; ctx1D.lineWidth = 1;
  for (let i = -30; i <= 30; i++) {
    const x = ox + i * scale;
    if (x < 0 || x > W) continue;
    ctx1D.beginPath(); ctx1D.moveTo(x, axisY - 6); ctx1D.lineTo(x, axisY + 6); ctx1D.stroke();
    if (i !== 0) {
      ctx1D.fillStyle = '#9ab4cc'; ctx1D.font = '10px Space Mono'; ctx1D.textAlign = 'center';
      ctx1D.fillText(i, x, axisY + 18);
    }
  }
  ctx1D.fillStyle = '#9ab4cc'; ctx1D.font = '10px Space Mono';
  ctx1D.fillText('x (m)', W - 20, axisY - 8);

  // Field plot
  if (opts.field && charges.length > 0) {
    ctx1D.save();
    const samples = 200;
    const xMin = (0 - ox) / scale, xMax = (W - ox) / scale;
    let maxE = 0;
    const Evals = [];
    for (let s = 0; s <= samples; s++) {
      const wx = xMin + (xMax - xMin) * s / samples;
      const { ex } = electricField(wx, 0);
      Evals.push(ex);
      if (Math.abs(ex) > maxE) maxE = Math.abs(ex);
    }
    if (maxE > 0) {
      ctx1D.beginPath();
      for (let s = 0; s <= samples; s++) {
        const cx = s * W / samples;
        const cy = axisY + 80 - (Evals[s] / maxE) * 60;
        s === 0 ? ctx1D.moveTo(cx, cy) : ctx1D.lineTo(cx, cy);
      }
      ctx1D.strokeStyle = 'rgba(26,127,196,0.7)';
      ctx1D.lineWidth = 1.5;
      ctx1D.stroke();

      ctx1D.fillStyle = '#1a7fc4';
      ctx1D.font = '9px Space Mono';
      ctx1D.fillText('Ex(x)', 8, axisY + 90);
    }
    ctx1D.restore();
  }

  // Force arrows
  if (opts.force && selectedIdx >= 0 && charges.length > 1) {
    const nf = netForce(selectedIdx);
    if (nf && nf.mag > 0) {
      const c = charges[selectedIdx];
      const cx = ox + c.x * scale;
      const len = Math.min(80, 15 + Math.log10(nf.mag + 1) * 15);
      const dir = nf.fx > 0 ? 1 : -1;
      ctx1D.strokeStyle = '#1a5fa8'; ctx1D.fillStyle = '#1a5fa8'; ctx1D.lineWidth = 2.5;
      drawArrow(ctx1D, cx, axisY - 35, cx + dir * len, axisY - 35, 7);
      ctx1D.fillStyle = '#1a5fa8'; ctx1D.font = '9px Space Mono'; ctx1D.textAlign = 'center';
      ctx1D.fillText('F_neta', cx + dir * len * 0.5, axisY - 45);
    }
  }

  // Charges
  for (let i = 0; i < charges.length; i++) {
    const c = charges[i];
    const cx = ox + c.x * scale;
    const isPos = c.q > 0;
    const color = isPos ? '#e63950' : '#1a7fc4';
    const isSelected = i === selectedIdx;

    const grad = ctx1D.createRadialGradient(cx, axisY, 0, cx, axisY, 25);
    grad.addColorStop(0, isPos ? 'rgba(230,57,80,0.25)' : 'rgba(26,127,196,0.25)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx1D.fillStyle = grad;
    ctx1D.beginPath(); ctx1D.arc(cx, axisY, 25, 0, Math.PI*2); ctx1D.fill();

    ctx1D.beginPath(); ctx1D.arc(cx, axisY, isSelected ? 14 : 11, 0, Math.PI*2);
    ctx1D.fillStyle = color; ctx1D.fill();
    if (isSelected) { ctx1D.strokeStyle = '#1a5fa8'; ctx1D.lineWidth = 2.5; ctx1D.stroke(); }

    ctx1D.fillStyle = '#ffffff';
    ctx1D.font = 'bold 13px Syne';
    ctx1D.textAlign = 'center'; ctx1D.textBaseline = 'middle';
    ctx1D.fillText(isPos ? '+' : '−', cx, axisY);

    ctx1D.fillStyle = color; ctx1D.font = '9px Space Mono';
    ctx1D.textBaseline = 'top';
    ctx1D.fillText(`q${i+1}`, cx, axisY + 16);
    ctx1D.textBaseline = 'alphabetic';
  }
}