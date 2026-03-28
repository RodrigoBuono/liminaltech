// Run: node scripts/generate-icons.js
// Requires: npm install canvas (only needed once, locally)
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Green circle
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  ctx.fillStyle = '#25D366';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Letter C
  ctx.fillStyle = '#000';
  ctx.font = `bold ${Math.round(size * 0.45)}px -apple-system, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', cx, cy + size * 0.02);

  return canvas.toBuffer('image/png');
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

[192, 512].forEach(size => {
  const buf = generateIcon(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log(`Generated icon-${size}.png`);
});
