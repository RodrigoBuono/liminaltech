// Empaqueta la intro (Three.js + GSAP + código propio) en un único archivo servido por Vercel.
import { build } from 'esbuild';
await build({
  entryPoints: ['src/intro.js'],
  bundle: true,
  format: 'esm',
  target: 'es2020',
  minify: true,
  legalComments: 'inline',
  outfile: '../www/intro.js',
  logLevel: 'info',
});
