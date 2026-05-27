// ─── Physics ─────────────────────────────────────────────────────────────────
function coulombForce(q1, x1, y1, q2, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const r2 = dx*dx + dy*dy;
  if (r2 < 1e-10) return { fx: 0, fy: 0, mag: 0 };
  const r = Math.sqrt(r2);
  const F = k * q1 * q2 / r2;
  return { fx: F * dx / r, fy: F * dy / r, mag: Math.abs(F) };
}

function netForce(idx) {
  if (idx < 0 || idx >= charges.length) return null;
  const c = charges[idx];
  let fx = 0, fy = 0;
  for (let i = 0; i < charges.length; i++) {
    if (i === idx) continue;
    const o = charges[i];
    const dx = c.x - o.x, dy = c.y - o.y;
    const r2 = dx*dx + dy*dy;
    if (r2 < 1e-10) continue;
    const r = Math.sqrt(r2);
    const F = k * c.q * o.q / r2;
    fx += F * dx / r;
    fy += F * dy / r;
  }
  const mag = Math.sqrt(fx*fx + fy*fy);
  const angle = Math.atan2(fy, fx) * 180 / Math.PI;
  return { fx, fy, mag, angle };
}

function electricField(px, py, excludeIdx = -1) {
  let ex = 0, ey = 0;
  for (let i = 0; i < charges.length; i++) {
    if (i === excludeIdx) continue;
    const c = charges[i];
    const dx = px - c.x, dy = py - c.y;
    const r2 = dx*dx + dy*dy;
    if (r2 < 1e-10) continue;
    const r = Math.sqrt(r2);
    const E = k * c.q / r2;
    ex += E * dx / r;
    ey += E * dy / r;
  }
  const mag = Math.sqrt(ex*ex + ey*ey);
  return { ex, ey, mag };
}

function electricPotential(px, py) {
  let V = 0;
  for (const c of charges) {
    const dx = px - c.x, dy = py - c.y;
    const r = Math.sqrt(dx*dx + dy*dy);
    if (r < 0.01) continue;
    V += k * c.q / r;
  }
  return V;
}