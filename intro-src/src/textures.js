// Texturas procedurales livianas (sin imágenes externas) para el interior de la cúpula.
// Se generan una sola vez, a 512 px, antes de que arranque la animación.
import { CanvasTexture, SRGBColorSpace, NoColorSpace, RepeatWrapping } from 'three';

// generador pseudoaleatorio con semilla: el resultado es idéntico en cada visita
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function canvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h || w;
  return [c, c.getContext('2d', { willReadFrequently: true })];
}

// ruido suave por octavas
function fbm(ctx, size, rand, { octaves = 5, base = 6, alpha = 0.2 } = {}) {
  for (let o = 0; o < octaves; o++) {
    const cells = base * (1 << o);
    const [nc, nx] = canvas(cells, cells);
    const img = nx.createImageData(cells, cells);
    for (let i = 0; i < img.data.length; i += 4) { const v = rand() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    nx.putImageData(img, 0, 0);
    ctx.save(); ctx.globalAlpha = alpha / (o + 1); ctx.globalCompositeOperation = 'overlay';
    ctx.imageSmoothingEnabled = true; ctx.drawImage(nc, 0, 0, size, size); ctx.restore();
  }
}

// relieve -> normal map (Sobel)
function heightToNormal(hctx, size, strength) {
  const src = hctx.getImageData(0, 0, size, size).data;
  const [nc, nx] = canvas(size);
  const out = nx.createImageData(size, size);
  const h = (x, y) => src[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1)) - (h(x - 1, y - 1) + 2 * h(x - 1, y) + h(x - 1, y + 1));
    const dy = (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1)) - (h(x - 1, y - 1) + 2 * h(x, y - 1) + h(x + 1, y - 1));
    let a = -dx * strength, b = dy * strength, c = 1; const l = Math.hypot(a, b, c); a /= l; b /= l; c /= l;
    const i = (y * size + x) * 4;
    out.data[i] = (a * 0.5 + 0.5) * 255; out.data[i + 1] = (b * 0.5 + 0.5) * 255; out.data[i + 2] = (c * 0.5 + 0.5) * 255; out.data[i + 3] = 255;
  }
  nx.putImageData(out, 0, 0);
  return nc;
}

function tex(c, srgb, aniso) {
  const t = new CanvasTexture(c);
  t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = aniso;
  return t;
}

/* ---------- revestimiento del interior: grafito satinado con juntas y fijaciones ---------- */
export function liningTextures(size, aniso, { tint = '#16191e', seed = 3 } = {}) {
  const rand = rng(seed);
  const [ac, a] = canvas(size), [hc, h] = canvas(size), [rc, r] = canvas(size);
  a.fillStyle = tint; a.fillRect(0, 0, size, size);
  fbm(a, size, rand, { base: 8, alpha: 0.05 });
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  r.fillStyle = '#6a6a6a'; r.fillRect(0, 0, size, size);
  fbm(r, size, rand, { base: 10, alpha: 0.28 });
  // juntas entre placas
  for (const [x, y, w, hh] of [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 1, 0.5]]) {
    const X = x * size + 2, Y = y * size + 2, W = w * size - 4, H = hh * size - 4;
    a.strokeStyle = 'rgba(4,5,7,.9)'; a.lineWidth = 2; a.strokeRect(X, Y, W, H);
    a.strokeStyle = 'rgba(150,160,175,.10)'; a.lineWidth = 1; a.strokeRect(X + 1.5, Y + 1.5, W, H);
    h.strokeStyle = '#3a3a3a'; h.lineWidth = 3; h.strokeRect(X, Y, W, H);
    // fijaciones en las esquinas
    for (const [px, py] of [[X + 9, Y + 9], [X + W - 9, Y + 9], [X + 9, Y + H - 9], [X + W - 9, Y + H - 9]]) {
      a.fillStyle = '#4a515b'; a.beginPath(); a.arc(px, py, size / 160, 0, 6.283); a.fill();
      h.fillStyle = '#c8c8c8'; h.beginPath(); h.arc(px, py, size / 160, 0, 6.283); h.fill();
    }
  }
  // pequeñas placas identificatorias
  for (let i = 0; i < 5; i++) {
    const x = rand() * size * 0.8, y = rand() * size * 0.9, w = size * (0.04 + rand() * 0.05), hh = size * 0.018;
    a.fillStyle = rand() < 0.3 ? 'rgba(214,122,44,.85)' : 'rgba(205,210,216,.6)'; a.fillRect(x, y, w, hh);
    r.fillStyle = '#9a9a9a'; r.fillRect(x, y, w, hh);
  }
  // roce muy fino (sin manchas grandes: aspecto limpio y actual)
  for (let i = 0; i < 120; i++) {
    const x = rand() * size, y = rand() * size, an = rand() * 6.283, l = (0.02 + rand() * 0.05) * size;
    a.strokeStyle = `rgba(190,200,215,${0.03 + rand() * 0.05})`; a.lineWidth = 0.6;
    a.beginPath(); a.moveTo(x, y); a.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); a.stroke();
  }
  return { map: tex(ac, true, aniso), roughnessMap: tex(rc, false, aniso), normalMap: tex(heightToNormal(h, size, 2.4), false, aniso) };
}

/* ---------- destello suave (sol / luces) ---------- */
export function glowTexture(size) {
  const [c, x] = canvas(size);
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,246,230,.6)');
  g.addColorStop(0.4, 'rgba(190,215,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
