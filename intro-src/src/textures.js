// Texturas procedurales: todo se dibuja con código (sin imágenes externas).
// Cada superficie tiene color (albedo), rugosidad y relieve (normal map),
// que es lo que le da al metal un aspecto físico creíble bajo las luces.
import { CanvasTexture, SRGBColorSpace, NoColorSpace, RepeatWrapping, ClampToEdgeWrapping } from 'three';

// generador pseudoaleatorio con semilla: el resultado es idéntico en cada visita
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function canvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h || w;
  return [c, c.getContext('2d', { willReadFrequently: true })];
}

// ruido suave por octavas: se dibuja ruido chico y se escala con suavizado
function fbm(ctx, size, rand, { octaves = 5, base = 4, alpha = 0.5, light = false } = {}) {
  for (let o = 0; o < octaves; o++) {
    const cells = base * (1 << o);
    const [nc, nx] = canvas(cells, cells);
    const img = nx.createImageData(cells, cells);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rand() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    nx.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalAlpha = alpha / (o + 1);
    ctx.globalCompositeOperation = light ? 'soft-light' : 'overlay';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(nc, 0, 0, size, size);
    ctx.restore();
  }
}

// relieve -> normal map (operador de Sobel)
function heightToNormal(hctx, size, strength) {
  const src = hctx.getImageData(0, 0, size, size).data;
  const [nc, nx] = canvas(size);
  const out = nx.createImageData(size, size);
  const h = (x, y) => src[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1)) - (h(x - 1, y - 1) + 2 * h(x - 1, y) + h(x - 1, y + 1));
    const dy = (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1)) - (h(x - 1, y - 1) + 2 * h(x, y - 1) + h(x + 1, y - 1));
    let nx_ = -dx * strength, ny_ = dy * strength, nz = 1;
    const l = Math.hypot(nx_, ny_, nz); nx_ /= l; ny_ /= l; nz /= l;
    const i = (y * size + x) * 4;
    out.data[i] = (nx_ * 0.5 + 0.5) * 255; out.data[i + 1] = (ny_ * 0.5 + 0.5) * 255; out.data[i + 2] = (nz * 0.5 + 0.5) * 255; out.data[i + 3] = 255;
  }
  nx.putImageData(out, 0, 0);
  return nc;
}

function tex(c, { srgb = false, repeat = false, aniso = 1 } = {}) {
  const t = new CanvasTexture(c);
  t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  t.wrapS = t.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  t.anisotropy = aniso;
  return t;
}

function scratches(ctx, hctx, rctx, size, rand, n, len) {
  for (let i = 0; i < n; i++) {
    const x = rand() * size, y = rand() * size, a = rand() * Math.PI * 2, l = (0.2 + rand()) * len;
    const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    ctx.strokeStyle = `rgba(220,226,232,${0.05 + rand() * 0.12})`; ctx.lineWidth = 0.6 + rand();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    hctx.strokeStyle = 'rgba(96,96,96,.5)'; hctx.lineWidth = 0.8;
    hctx.beginPath(); hctx.moveTo(x, y); hctx.lineTo(x2, y2); hctx.stroke();
    rctx.strokeStyle = 'rgba(40,40,40,.6)'; rctx.lineWidth = 1;
    rctx.beginPath(); rctx.moveTo(x, y); rctx.lineTo(x2, y2); rctx.stroke();
  }
}

function rivet(ctx, hctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#a9b1ba'); g.addColorStop(0.6, '#6c747d'); g.addColorStop(1, '#2a2f35');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  const hg = hctx.createRadialGradient(x, y, 0, x, y, r);
  hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.7, '#c8c8c8'); hg.addColorStop(1, '#808080');
  hctx.fillStyle = hg; hctx.beginPath(); hctx.arc(x, y, r, 0, 6.283); hctx.fill();
}

// pintura gastada: se aplica con una máscara de ruido para que se vea el metal debajo
function wornPaint(ctx, size, rand, draw, wear = 0.42) {
  const [pc, px] = canvas(size); draw(px);
  const [mc, mx] = canvas(size); mx.fillStyle = '#808080'; mx.fillRect(0, 0, size, size);
  fbm(mx, size, rand, { octaves: 6, base: 6, alpha: 1.2 });
  const m = mx.getImageData(0, 0, size, size).data, p = px.getImageData(0, 0, size, size);
  for (let i = 0; i < p.data.length; i += 4) {
    const v = m[i] / 255; const k = Math.min(1, Math.max(0, (v - wear) * 6));
    p.data[i + 3] *= k;
  }
  px.putImageData(p, 0, 0); ctx.drawImage(pc, 0, 0);
}

// cepillado: trazos finos y largos que dan la veta del metal laminado
function brushed(ctx, size, rand, { n = 900, radial = null, alpha = 0.06 } = {}) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const v = rand() < 0.5 ? 255 : 0;
    ctx.strokeStyle = `rgba(${v},${v},${v},${alpha * (0.3 + rand())})`; ctx.lineWidth = 0.5 + rand() * 1.2;
    ctx.beginPath();
    if (radial) { const rr = rand() * radial.r, a0 = rand() * 6.283; ctx.arc(radial.x, radial.y, rr, a0, a0 + 0.3 + rand() * 1.6); }
    else { const y = rand() * size, x = rand() * size, l = (0.2 + rand() * 0.8) * size; ctx.moveTo(x - l / 2, y); ctx.lineTo(x + l / 2, y + (rand() - 0.5) * 2); }
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- compuerta ---------- */
export function doorTextures(size, R, aniso) {
  const rand = rng(7);
  const [ac, a] = canvas(size), [hc, h] = canvas(size), [rc, r] = canvas(size);
  const s = size / (2 * R);                    // px por unidad
  const P = (x, y) => [size / 2 + x * s, size / 2 - y * s];
  // metal base con variación
  const g = a.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, '#646d77'); g.addColorStop(1, '#4b535c');
  a.fillStyle = g; a.fillRect(0, 0, size, size);
  fbm(a, size, rand, { octaves: 6, base: 8, alpha: 0.26 });
  brushed(a, size, rand, { n: 1400, radial: { x: size / 2, y: size / 2, r: size * 0.5 }, alpha: 0.07 });
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  fbm(h, size, rand, { octaves: 4, base: 16, alpha: 0.12 });
  r.fillStyle = '#7a7a7a'; r.fillRect(0, 0, size, size);
  fbm(r, size, rand, { octaves: 5, base: 6, alpha: 0.7 });
  // ranuras: anillos y radios del panelado
  const groove = (draw, w) => {
    a.strokeStyle = 'rgba(18,20,24,.85)'; a.lineWidth = w; draw(a); a.strokeStyle = 'rgba(160,168,176,.25)'; a.lineWidth = 1; a.save(); a.translate(1, 1); draw(a); a.restore();
    h.strokeStyle = '#1e1e1e'; h.lineWidth = w * 1.4; draw(h);
    r.strokeStyle = '#d0d0d0'; r.lineWidth = w; draw(r);
  };
  const [cx, cy] = P(0, 0);
  for (const rr of [0.42, 0.98, 1.38]) groove(c => { c.beginPath(); c.arc(cx, cy, rr * s, 0, 6.283); c.stroke(); }, 3);
  for (let k = 0; k < 12; k++) {
    const ang = k / 12 * Math.PI * 2 + Math.PI / 12;
    groove(c => { c.beginPath(); c.moveTo(cx + Math.cos(ang) * 0.42 * s, cy + Math.sin(ang) * 0.42 * s); c.lineTo(cx + Math.cos(ang) * 1.38 * s, cy + Math.sin(ang) * 1.38 * s); c.stroke(); }, 2.5);
  }
  // remaches sobre los anillos
  for (const [rr, n] of [[0.98, 36], [1.38, 48], [0.42, 16]]) for (let k = 0; k < n; k++) {
    const ang = k / n * Math.PI * 2;
    rivet(a, h, cx + Math.cos(ang) * (rr + 0.05) * s, cy + Math.sin(ang) * (rr + 0.05) * s, size / 230);
  }
  // franjas de peligro a lo largo de la junta central (pintura gastada)
  wornPaint(a, size, rand, px => {
    const w = 0.34 * s;
    px.save(); px.beginPath(); px.rect(size / 2 - w / 2, 0, w, size); px.clip();
    px.fillStyle = '#c99a33'; px.fillRect(0, 0, size, size);
    px.fillStyle = '#16181b';
    for (let y = -size; y < size * 2; y += size / 22) { px.beginPath(); px.moveTo(size / 2 - w, y); px.lineTo(size / 2 + w, y + w * 1.2); px.lineTo(size / 2 + w, y + w * 1.2 + size / 44); px.lineTo(size / 2 - w, y + size / 44); px.fill(); }
    px.restore();
  }, 0.38);
  // núcleo: placa central más oscura
  a.fillStyle = 'rgba(26,30,36,.5)'; a.beginPath(); a.arc(cx, cy, 0.36 * s, 0, 6.283); a.fill();
  // rotulado estarcido
  wornPaint(a, size, rand, px => {
    px.textAlign = 'center'; px.textBaseline = 'middle';
    px.font = `700 ${size * 0.13}px Inter, "Helvetica Neue", Arial, sans-serif`;
    // sombra oscura detrás del número para que se lea sobre el metal
    px.fillStyle = 'rgba(10,12,15,.55)';
    px.fillText('0', size / 2 - 0.68 * s + 3, size / 2 + 0.06 * s + 3);
    px.fillText('1', size / 2 + 0.68 * s + 3, size / 2 + 0.06 * s + 3);
    px.fillStyle = '#ece6d9';
    px.fillText('0', size / 2 - 0.68 * s, size / 2 + 0.06 * s);
    px.fillText('1', size / 2 + 0.68 * s, size / 2 + 0.06 * s);
    px.font = `600 ${size * 0.026}px Inter, Arial, sans-serif`;
    px.save(); px.translate(size / 2, size / 2); px.fillStyle = '#e9e4da';
    const txt = 'ESCLUSA EXTERIOR  ·  RB-01  ·  NO ABRIR SIN TRAJE';
    const rad = 1.2 * s;
    for (let i = 0; i < txt.length; i++) {
      const ang = -Math.PI / 2 - (txt.length / 2 - i) * 0.035;
      px.save(); px.rotate(ang + Math.PI / 2); px.translate(0, -rad); px.fillText(txt[i], 0, 0); px.restore();
    }
    px.restore();
    px.fillStyle = '#c99a33'; px.font = `700 ${size * 0.03}px Inter, Arial, sans-serif`;
    px.fillText('PELIGRO · VACÍO EXTERIOR', size / 2, size / 2 + 0.72 * s);
  }, 0.22);
  // suciedad que chorrea y oscurecimiento del borde (oclusión)
  for (let i = 0; i < 160; i++) {
    const x = rand() * size, y = rand() * size, l = (0.05 + rand() * 0.25) * size;
    const gr = a.createLinearGradient(x, y, x, y + l); gr.addColorStop(0, 'rgba(20,16,12,.18)'); gr.addColorStop(1, 'rgba(20,16,12,0)');
    a.fillStyle = gr; a.fillRect(x, y, 1 + rand() * 3, l);
  }
  const vg = a.createRadialGradient(cx, cy, 0.9 * s, cx, cy, R * s);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  a.fillStyle = vg; a.fillRect(0, 0, size, size);
  scratches(a, h, r, size, rand, 520, size * 0.06);
  return {
    map: tex(ac, { srgb: true, aniso }),
    roughnessMap: tex(rc, { aniso }),
    normalMap: tex(heightToNormal(h, size, 2.2), { aniso }),
  };
}

/* ---------- paneles del mamparo y del pasillo (repetibles) ---------- */
export function panelTextures(size, aniso, { tint = '#4b525b', seed = 3, label = true } = {}) {
  const rand = rng(seed);
  const [ac, a] = canvas(size), [hc, h] = canvas(size), [rc, r] = canvas(size);
  a.fillStyle = tint; a.fillRect(0, 0, size, size);
  fbm(a, size, rand, { octaves: 6, base: 8, alpha: 0.16 });
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  r.fillStyle = '#8c8c8c'; r.fillRect(0, 0, size, size);
  fbm(r, size, rand, { octaves: 5, base: 10, alpha: 0.35 });
  const m = size * 0.02;
  const rects = [[0, 0, 0.5, 0.62], [0.5, 0, 0.5, 0.62], [0, 0.62, 1, 0.38]];
  for (const [x, y, w, hh] of rects) {
    const X = x * size + m, Y = y * size + m, W = w * size - 2 * m, H = hh * size - 2 * m;
    // cada chapa tiene un tono apenas distinto (lotes de fabricación)
    const t = (rand() - 0.5) * 0.12;
    a.fillStyle = t > 0 ? `rgba(255,255,255,${t})` : `rgba(0,0,0,${-t})`; a.fillRect(X, Y, W, H);
    a.save(); a.beginPath(); a.rect(X, Y, W, H); a.clip(); brushed(a, size, rand, { n: 260, alpha: 0.05 }); a.restore();
    a.strokeStyle = 'rgba(14,16,19,.9)'; a.lineWidth = 3; a.strokeRect(X, Y, W, H);
    a.strokeStyle = 'rgba(170,178,186,.18)'; a.lineWidth = 1; a.strokeRect(X + 2, Y + 2, W, H);
    h.strokeStyle = '#202020'; h.lineWidth = 5; h.strokeRect(X, Y, W, H);
    r.strokeStyle = '#e0e0e0'; r.lineWidth = 4; r.strokeRect(X, Y, W, H);
    for (const [px, py] of [[X + 10, Y + 10], [X + W - 10, Y + 10], [X + 10, Y + H - 10], [X + W - 10, Y + H - 10]]) rivet(a, h, px, py, size / 110);
  }
  // rejilla de ventilación
  const vx = size * 0.12, vy = size * 0.74, vw = size * 0.3;
  for (let i = 0; i < 9; i++) {
    a.fillStyle = 'rgba(8,9,11,.85)'; a.fillRect(vx, vy + i * size * 0.022, vw, size * 0.01);
    h.fillStyle = '#1a1a1a'; h.fillRect(vx, vy + i * size * 0.022, vw, size * 0.01);
  }
  if (label) {
    a.fillStyle = 'rgba(201,154,51,.85)'; a.font = `700 ${size * 0.05}px Inter, Arial, sans-serif`;
    a.fillText('07', size * 0.62, size * 0.86);
    a.fillStyle = 'rgba(233,228,218,.55)'; a.font = `600 ${size * 0.022}px Inter, Arial, sans-serif`;
    a.fillText('SOPORTE VITAL · CIRCUITO B', size * 0.62, size * 0.91);
  }
  for (let i = 0; i < 90; i++) {
    const x = rand() * size, y = rand() * size, l = (0.05 + rand() * 0.2) * size;
    const gr = a.createLinearGradient(x, y, x, y + l); gr.addColorStop(0, 'rgba(15,12,9,.16)'); gr.addColorStop(1, 'rgba(15,12,9,0)');
    a.fillStyle = gr; a.fillRect(x, y, 1 + rand() * 2, l);
  }
  scratches(a, h, r, size, rand, 160, size * 0.05);
  return {
    map: tex(ac, { srgb: true, repeat: true, aniso }),
    roughnessMap: tex(rc, { repeat: true, aniso }),
    normalMap: tex(heightToNormal(h, size, 2.6), { repeat: true, aniso }),
  };
}

/* ---------- bisel del marco: franjas de advertencia en anillo ---------- */
export function bezelTexture(size, inner, outer, aniso) {
  const rand = rng(11);
  const [ac, a] = canvas(size);
  const img = a.createImageData(size, size);
  const c = size / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x - c) / c * outer, dy = (y - c) / c * outer, rr = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    const band = rr > inner + 0.06 && rr < outer - 0.07;
    const stripe = Math.floor((ang / (Math.PI * 2)) * 48 + rr * 3.2) % 2 === 0;
    let col = [52, 57, 64];
    if (band) col = stripe ? [178, 134, 42] : [22, 24, 27];
    const n = (rand() - 0.5) * 18;
    const i = (y * size + x) * 4;
    img.data[i] = col[0] + n; img.data[i + 1] = col[1] + n; img.data[i + 2] = col[2] + n; img.data[i + 3] = 255;
  }
  a.putImageData(img, 0, 0);
  fbm(a, size, rand, { octaves: 5, base: 8, alpha: 0.32 });
  // desgaste: manchas que dejan ver metal
  for (let i = 0; i < 260; i++) {
    a.fillStyle = `rgba(110,118,126,${0.15 + rand() * 0.3})`;
    a.beginPath(); a.arc(rand() * size, rand() * size, rand() * size * 0.012, 0, 6.283); a.fill();
  }
  return tex(ac, { srgb: true, aniso });
}

/* ---------- piso de rejilla ---------- */
export function gratingTextures(size, aniso) {
  const rand = rng(21);
  const [ac, a] = canvas(size), [hc, h] = canvas(size);
  a.fillStyle = '#2a2e33'; a.fillRect(0, 0, size, size);
  h.fillStyle = '#909090'; h.fillRect(0, 0, size, size);
  const n = 12, cell = size / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    a.fillStyle = '#0b0c0e'; a.fillRect(i * cell + cell * 0.18, j * cell + cell * 0.18, cell * 0.64, cell * 0.64);
    h.fillStyle = '#101010'; h.fillRect(i * cell + cell * 0.18, j * cell + cell * 0.18, cell * 0.64, cell * 0.64);
  }
  fbm(a, size, rand, { octaves: 4, base: 4, alpha: 0.5 });
  return { map: tex(ac, { srgb: true, repeat: true, aniso }), normalMap: tex(heightToNormal(h, size, 3), { repeat: true, aniso }) };
}

/* ---------- sprites de luz y de vapor ---------- */
export function glowTexture(size, warm) {
  const [c, x] = canvas(size);
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, warm ? 'rgba(255,240,215,1)' : 'rgba(255,255,255,1)');
  g.addColorStop(0.15, warm ? 'rgba(255,214,160,.55)' : 'rgba(220,235,255,.5)');
  g.addColorStop(0.45, warm ? 'rgba(255,170,90,.12)' : 'rgba(160,190,230,.1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return tex(c, { srgb: true });
}
export function flareTexture(size) {
  const [c, x] = canvas(size, size / 4);
  const g = x.createLinearGradient(0, 0, size, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(255,236,205,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, size / 8 - 1.5, size, 3);
  const g2 = x.createRadialGradient(size / 2, size / 8, 0, size / 2, size / 8, size / 8);
  g2.addColorStop(0, 'rgba(255,240,220,.35)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g2; x.fillRect(0, 0, size, size / 4);
  return tex(c, { srgb: true });
}
export function smokeTexture(size) {
  const rand = rng(31);
  const [c, x] = canvas(size);
  x.fillStyle = '#808080'; x.fillRect(0, 0, size, size);
  fbm(x, size, rand, { octaves: 5, base: 3, alpha: 1.4 });
  const d = x.getImageData(0, 0, size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const k = (j * size + i) * 4, dx = (i - size / 2) / (size / 2), dy = (j - size / 2) / (size / 2);
    const fall = Math.max(0, 1 - Math.hypot(dx, dy)); const v = d.data[k] / 255;
    const al = Math.pow(fall, 1.6) * Math.min(1, Math.max(0, (v - 0.25) * 1.6));
    d.data[k] = d.data[k + 1] = d.data[k + 2] = 255; d.data[k + 3] = al * 255;
  }
  x.putImageData(d, 0, 0);
  return tex(c, { srgb: true });
}
