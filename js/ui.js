// ─── UI interactions ──────────────────────────────────────────────────────────
function setMode(m) {
  mode = m;
  document.querySelectorAll('.mode-tab').forEach((t, i) => {
    t.classList.toggle('active', (i===0 && m==='2D') || (i===1 && m==='1D'));
  });
  canvasEl.style.display = m === '2D' ? 'block' : 'none';
  canvas1D.style.display = m === '1D' ? 'block' : 'none';
  document.getElementById('coords2D').style.display = m === '2D' ? 'block' : 'none';
  document.getElementById('coords1D').style.display = m === '1D' ? 'block' : 'none';
  
  if (m === '1D') charges.forEach(c => c.y = 0);
  render();
}

function selectType(t) {
  chargeType = t;
  document.getElementById('btnPos').classList.toggle('active', t === 1);
  document.getElementById('btnNeg').classList.toggle('active', t === -1);
}

function addCharge() {
  const magNC = parseFloat(document.getElementById('chargeVal').value) || 1;
  const q = chargeType * magNC * 1e-9;
  let x, y;
  if (mode === '2D') {
    x = parseFloat(document.getElementById('posX').value) || 0;
    y = parseFloat(document.getElementById('posY').value) || 0;
  } else {
    x = parseFloat(document.getElementById('posX1D').value) || 0;
    y = 0;
  }
  charges.push({ id: nextId++, q, x, y });
  renderChargeList();
  updateResults();
  render();
}

function renderChargeList() {
  const list = document.getElementById('chargeList');
  list.innerHTML = '';
  charges.forEach((c, i) => {
    const magNC = (Math.abs(c.q) * 1e9).toFixed(2);
    const sign = c.q > 0 ? '+' : '−';
    const div = document.createElement('div');
    div.className = 'charge-item' + (i === selectedIdx ? ' selected' : '');
    div.innerHTML = `
      <div class="charge-dot ${c.q>0?'pos':'neg'}"></div>
      <div class="charge-info">
        <div class="charge-label">q${i+1} = ${sign}${magNC} nC</div>
        <div class="charge-coords">(${c.x.toFixed(2)}, ${c.y.toFixed(2)}) m</div>
      </div>
      <button class="charge-del" onclick="deleteCharge(${i}, event)">✕</button>
    `;
    div.addEventListener('click', () => { selectedIdx = i; renderChargeList(); updateResults(); render(); });
    list.appendChild(div);
  });
}

function deleteCharge(idx, e) {
  e.stopPropagation();
  charges.splice(idx, 1);
  if (selectedIdx >= charges.length) selectedIdx = charges.length - 1;
  renderChargeList();
  updateResults();
  render();
}

function clearCharges() {
  charges = []; selectedIdx = -1; probePoint = null;
  renderChargeList(); updateResults(); render();
}

function updateResults() {
  const fmtE = (v) => {
    const abs = Math.abs(v);
    if (abs === 0) return '0';
    if (abs >= 1e6) return (v/1e6).toFixed(3) + ' M';
    if (abs >= 1e3) return (v/1e3).toFixed(3) + ' k';
    if (abs >= 1) return v.toFixed(4);
    if (abs >= 1e-3) return (v*1e3).toFixed(3) + ' m';
    return v.toExponential(3);
  };

  if (selectedIdx < 0 || selectedIdx >= charges.length) {
    document.getElementById('selCharge').textContent = '—';
    document.getElementById('netForceMag').textContent = '—';
    document.getElementById('fx').textContent = '—';
    document.getElementById('fy').textContent = '—';
    document.getElementById('fangle').textContent = '—';
  } else {
    const c = charges[selectedIdx];
    const magNC = (Math.abs(c.q)*1e9).toFixed(3);
    document.getElementById('selCharge').textContent = `q${selectedIdx+1} = ${c.q>0?'+':'−'}${magNC} nC`;
    const nf = netForce(selectedIdx);
    if (nf) {
      document.getElementById('netForceMag').textContent = fmtE(nf.mag) + ' N';
      document.getElementById('fx').textContent = fmtE(nf.fx) + ' N';
      document.getElementById('fy').textContent = fmtE(nf.fy) + ' N';
      document.getElementById('fangle').textContent = nf.angle.toFixed(2) + '°';
    }
  }

  const pairDiv = document.getElementById('pairForces');
  if (charges.length < 2) {
    pairDiv.innerHTML = 'Agrega al menos 2 cargas para ver las fuerzas entre pares.';
    pairDiv.style.color = 'var(--muted)';
  } else {
    let html = '';
    for (let i = 0; i < charges.length; i++) {
      for (let j = i+1; j < charges.length; j++) {
        const a = charges[i], b = charges[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const r = Math.sqrt(dx*dx + dy*dy);
        const F = k * Math.abs(a.q) * Math.abs(b.q) / (r*r);
        const type = (a.q * b.q > 0) ? '↔ Repuls.' : '→← Atrac.';
        const color = (a.q * b.q > 0) ? 'var(--accent-pos)' : 'var(--accent-neg)';
        html += `<div class="vector-row">
          <span class="vector-label" style="color:${color}">${type} q${i+1}↔q${j+1}</span>
          <span class="vector-val">${fmtE(F)} N</span>
        </div>`;
      }
    }
    pairDiv.innerHTML = html;
  }

  if (probePoint) {
    const { ex, ey, mag } = electricField(probePoint.x, probePoint.y);
    const angle = Math.atan2(ey, ex) * 180 / Math.PI;
    document.getElementById('probeE').textContent = fmtE(mag) + ' N/C';
    document.getElementById('probeEx').textContent = fmtE(ex) + ' N/C';
    document.getElementById('probeEy').textContent = fmtE(ey) + ' N/C';
    document.getElementById('probeAngle').textContent = angle.toFixed(2) + '°';
    document.getElementById('probeInfo').innerHTML =
      `Sonda en (<b style="color:var(--accent-gold)">${probePoint.x.toFixed(2)}</b>, <b style="color:var(--accent-gold)">${probePoint.y.toFixed(2)}</b>) m`;
  }
}

function toggleOpt(key) {
  opts[key] = !opts[key];
  const btn = document.getElementById('toggle' + key.charAt(0).toUpperCase() + key.slice(1));
  btn.classList.toggle('on', opts[key]);
  render();
}

function zoomIn() { zoom = Math.min(zoom * 1.25, 300); render(); }
function zoomOut() { zoom = Math.max(zoom / 1.25, 10); render(); }
function resetView() { zoom = 60; offsetX = canvasEl.width/2; offsetY = canvasEl.height/2; render(); }

function exportCanvas() {
  const link = document.createElement('a');
  const c = mode === '2D' ? canvasEl : canvas1D;
  link.download = 'simulacion_cargas.png';
  link.href = c.toDataURL();
  link.click();
}