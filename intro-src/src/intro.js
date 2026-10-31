// Intro: cúpula de observación orbital. Un iris se abre sobre la Tierra
// (imagen Blue Marble de la NASA, dominio público) y la cámara sale al
// espacio atravesando la ventana; ahí la escena se funde con la web real.
import {
  WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, Group, Mesh, Shape, Path, ExtrudeGeometry, ShapeGeometry,
  TorusGeometry, BoxGeometry, PlaneGeometry, CylinderGeometry, SphereGeometry, TubeGeometry, CatmullRomCurve3,
  MeshStandardMaterial, MeshBasicMaterial, ShaderMaterial, PointsMaterial, Points, BufferGeometry, BufferAttribute,
  DirectionalLight, PointLight, HemisphereLight, Color, Vector2, Vector3, Matrix4, Quaternion, Object3D, InstancedMesh,
  ACESFilmicToneMapping, SRGBColorSpace, NoColorSpace, PMREMGenerator, AdditiveBlending, BackSide,
  Texture, WebGLRenderTarget, LinearFilter, LinearMipmapLinearFilter, ClampToEdgeWrapping, MathUtils
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { liningTextures, rng } from './textures.js';

const html = document.documentElement;
const DEBUG = /[?&]introdebug/.test(location.search);
const D = Math.PI / 180;

let cleanupFns = [];
function finish(immediate) {
  cleanupFns.forEach(f => { try { f(); } catch (e) { /* nada */ } });
  cleanupFns = [];
  html.classList.remove('intro-pending', 'intro-running', 'intro-cover');
  const el = document.getElementById('intro');
  if (el) { if (immediate) el.remove(); else setTimeout(() => el.remove(), 50); }
  window.dispatchEvent(new Event('intro:done'));
}

function loadImage(src, ms) {
  return new Promise((res, rej) => {
    const img = new Image(); img.decoding = 'async';
    const t = setTimeout(() => rej(new Error('timeout')), ms);
    img.onload = () => { clearTimeout(t); (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => res(img)); };
    img.onerror = () => { clearTimeout(t); rej(new Error('imagen')); };
    img.src = src;
  });
}

// recorte de la imagen de la Tierra (grados): Sudamérica y el Atlántico Sur
const CROP = { lon0: -125, lon1: -5, lat0: -90, lat1: 5 };
// latitud/longitud -> dirección, con la misma convención que SphereGeometry
const dirLL = (lat, lon) => { const p = (lon + 180) * D, t = (90 - lat) * D; return new Vector3(-Math.cos(p) * Math.sin(t), Math.cos(t), Math.sin(p) * Math.sin(t)); };

const NOISE = `
  float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
  float fbm(vec3 p, int oct){ float a = 0.5, s = 0.0; for (int i = 0; i < 9; i++){ if (i >= oct) break; s += a * noise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }`;

async function start() {
  window.__introStarted = true;
  const small = Math.min(innerWidth, innerHeight) < 700 || matchMedia('(pointer: coarse)').matches;
  let DPR = Math.min(devicePixelRatio || 1, 2);

  /* ---------- contenedor, HUD y botón saltar ---------- */
  const box = document.createElement('div');
  box.id = 'intro';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Intro: cúpula de observación');
  box.innerHTML = `
    <canvas aria-hidden="true"></canvas>
    <div class="intro-vig" aria-hidden="true"></div>
    <div class="intro-hud" aria-hidden="true">
      <div class="h-tl"><i></i>RB-01 · Cúpula de observación</div>
      <div class="h-tr">Órbita terrestre · 1.150 km</div>
    </div>
    <button type="button" class="intro-skip">Saltar intro <span aria-hidden="true">›</span></button>`;
  document.body.appendChild(box);
  const cvs = box.querySelector('canvas');
  const $ = s => box.querySelector(s);
  let ended = false, ready = false, skipNow = null;
  function skip() {
    if (ended) return;
    if (!ready) { ended = true; window.dispatchEvent(new Event('intro:reveal')); finish(true); return; }
    skipNow();
  }
  $('.intro-skip').addEventListener('click', () => skip());

  // mientras dura la intro, la web de atrás no recibe teclado, rueda ni toques
  const page = [document.querySelector('nav'), document.getElementById('stagewrap'), document.getElementById('scenenav')].filter(Boolean);
  page.forEach(el => { el.inert = true; });
  cleanupFns.push(() => page.forEach(el => { el.inert = false; }));
  const swallow = e => { if (!box.contains(e.target) || e.type === 'wheel') { e.stopImmediatePropagation(); if (e.cancelable && e.type !== 'keydown') e.preventDefault(); } };
  const onKey = e => {
    if (e.key === 'Escape' || (['Enter', ' '].includes(e.key) && document.activeElement !== $('.intro-skip'))) { e.preventDefault(); skip(); }
    if (e.key !== 'Tab') e.stopImmediatePropagation();
  };
  ['wheel', 'touchstart', 'touchmove', 'touchend'].forEach(t => window.addEventListener(t, swallow, { capture: true, passive: false }));
  window.addEventListener('keydown', onKey, true);
  cleanupFns.push(() => {
    ['wheel', 'touchstart', 'touchmove', 'touchend'].forEach(t => window.removeEventListener(t, swallow, { capture: true }));
    window.removeEventListener('keydown', onKey, true);
  });

  // la imagen de la Tierra se pide ya (el cargador también la precarga)
  const earthImgP = loadImage('/intro/earth.webp', 9000);

  /* ---------- render ---------- */
  const renderer = new WebGLRenderer({ canvas: cvs, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.autoClear = false;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  /* =========================================================
     LA TIERRA (escena propia, a escala planetaria)
     ========================================================= */
  const earthScene = new Scene();
  const earthCam = new PerspectiveCamera(58, innerWidth / innerHeight, 0.002, 120);
  const ER = 1, ALT = 0.18, ATM = 1.03;
  // marco local en el punto bajo la nave (Patagonia), mirando al nor-noreste
  const SUB = { lat: -43, lon: -63, heading: 18 };
  const U_e = dirLL(SUB.lat, SUB.lon);
  let N_e = dirLL(SUB.lat + 0.01, SUB.lon).sub(U_e).normalize();
  N_e.applyAxisAngle(U_e, -SUB.heading * D);
  const E_e = new Vector3().crossVectors(N_e, U_e).normalize();
  // horizonte a ~9° sobre la línea de vista inicial
  const dip = Math.acos(ER / (ER + ALT)) / D;
  const pitch = (9 + dip) * D;
  const N_w = new Vector3(0, Math.sin(pitch), -Math.cos(pitch));
  const U_w = new Vector3(0, Math.cos(pitch), Math.sin(pitch));
  const E_w = new Vector3().crossVectors(N_w, U_w).normalize();
  const earthRot = new Matrix4().makeBasis(E_w, N_w, U_w).multiply(new Matrix4().makeBasis(E_e, N_e, U_e).transpose());
  const center = U_w.clone().multiplyScalar(-(ER + ALT));
  // sol: alto, desde el este-noreste -> reflejo especular sobre el Atlántico
  const sunL = new Vector3(Math.sin(70 * D) * Math.cos(34 * D), Math.cos(70 * D) * Math.cos(34 * D), Math.sin(34 * D));
  const sunDir = E_w.clone().multiplyScalar(sunL.x).add(N_w.clone().multiplyScalar(sunL.y)).add(U_w.clone().multiplyScalar(sunL.z)).normalize();

  const earthImg = await earthImgP;
  if (ended) { renderer.dispose(); renderer.forceContextLoss(); return; }
  const earthTex = new Texture(earthImg);
  earthTex.colorSpace = SRGBColorSpace; earthTex.anisotropy = aniso;
  earthTex.wrapS = earthTex.wrapT = ClampToEdgeWrapping; earthTex.minFilter = LinearMipmapLinearFilter; earthTex.needsUpdate = true;

  // nubes: se calculan una sola vez en la GPU y quedan como textura
  const CW = small ? 2048 : 3072, CH = Math.round(CW * (CROP.lat1 - CROP.lat0) / (CROP.lon1 - CROP.lon0));
  const cloudRT = new WebGLRenderTarget(CW, CH, { depthBuffer: false, generateMipmaps: true, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter });
  cloudRT.texture.colorSpace = NoColorSpace;
  {
    const bake = new Scene();
    const quad = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({
      uniforms: { uCrop: { value: [CROP.lon0, CROP.lon1, CROP.lat0, CROP.lat1] } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `precision highp float; varying vec2 vUv; uniform float uCrop[4]; ${NOISE}
        void main(){
          float latd = mix(uCrop[2], uCrop[3], vUv.y), lond = mix(uCrop[0], uCrop[1], vUv.x);
          float ph = radians(lond + 180.0), th = radians(90.0 - latd);
          vec3 p = vec3(-cos(ph) * sin(th), cos(th), sin(ph) * sin(th));
          // franjas climáticas: tormentas en latitudes medias, cielo más limpio en los subtrópicos
          float band = 0.5 + 0.30 * exp(-pow((latd + 54.0) / 13.0, 2.0)) + 0.16 * exp(-pow((latd - 4.0) / 7.0, 2.0)) - 0.14 * exp(-pow((latd + 24.0) / 9.0, 2.0));
          vec3 q = p * vec3(4.6, 7.5, 4.6);
          vec3 w = vec3(fbm(q * 0.8, 4), fbm(q * 0.8 + vec3(5.2, 1.3, 2.8), 4), fbm(q * 0.8 + vec3(2.1, 7.7, 4.4), 4));
          float c = fbm(q + (w - 0.5) * 2.6, 9);
          c += (fbm(q * 7.0 + w * 3.0, 4) - 0.5) * 0.16;
          float cov = smoothstep(0.97 - band, 1.22 - band, c);
          cov *= 0.94;
          gl_FragColor = vec4(cov, c, 0.0, 1.0);
        }`,
      depthTest: false, depthWrite: false
    }));
    bake.add(quad);
    renderer.setRenderTarget(cloudRT); renderer.clear(); renderer.render(bake, new OrthographicCamera(-1, 1, 1, -1, 0, 1)); renderer.setRenderTarget(null);
    quad.geometry.dispose(); quad.material.dispose();
  }

  const earthMat = new ShaderMaterial({
    uniforms: { map: { value: earthTex }, clouds: { value: cloudRT.texture }, sunDir: { value: sunDir }, uShadow: { value: new Vector2(0.0016, -0.0012) } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `precision highp float; uniform sampler2D map; uniform sampler2D clouds; uniform vec3 sunDir; uniform vec2 uShadow;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 N = normalize(vN), V = normalize(cameraPosition - vW), L = normalize(sunDir);
        vec3 alb = texture2D(map, vUv).rgb;
        alb = pow(alb, vec3(0.92)) * vec3(1.18, 1.2, 1.28);
        float ocean = smoothstep(0.01, 0.05, alb.b - max(alb.r, alb.g)) * (1.0 - smoothstep(0.2, 0.35, alb.r));
        vec3 albSoft = pow(texture2D(map, vUv, 2.5).rgb, vec3(0.92)) * vec3(1.18, 1.2, 1.28);
        alb = mix(alb, albSoft, ocean);
        float cl = texture2D(clouds, vUv).r;
        float sh = texture2D(clouds, vUv + uShadow).r;
        float ndl = dot(N, L), lam = max(ndl, 0.0);
        vec3 col = alb * (lam * 1.7 + 0.012) * (1.0 - sh * 0.5);
        vec3 H = normalize(L + V); float nh = max(dot(N, H), 0.0);
        col += vec3(1.0, 0.93, 0.82) * (pow(nh, 260.0) * 4.0 + pow(nh, 36.0) * 0.22) * ocean * (1.0 - cl) * step(0.0, ndl);
        col = mix(col, vec3(1.0) * (lam * 1.6 + 0.015), cl);
        float mu = max(dot(N, V), 0.0);
        float lit = smoothstep(-0.2, 0.3, ndl);
        vec3 sky = vec3(0.26, 0.5, 1.0);
        col = mix(col, sky * (0.95 * lit + 0.02), clamp(pow(1.0 - mu, 2.4) * 0.92, 0.0, 0.95));
        col += sky * 0.03 * lit;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const earthGeo = new SphereGeometry(ER, small ? 160 : 256, small ? 128 : 200,
    (CROP.lon0 + 180) * D, (CROP.lon1 - CROP.lon0) * D, (90 - CROP.lat1) * D, (CROP.lat1 - CROP.lat0) * D);
  const earth = new Mesh(earthGeo, earthMat);
  earth.matrixAutoUpdate = false; earth.matrix.copy(earthRot).setPosition(center);
  earthScene.add(earth);

  // atmósfera: densidad según la altura mínima del rayo de vista
  const atmo = new Mesh(new SphereGeometry(ATM, 128, 96), new ShaderMaterial({
    uniforms: { uC: { value: center }, sunDir: { value: sunDir }, uR: { value: ER }, uRa: { value: ATM } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
    fragmentShader: `precision highp float; uniform vec3 uC; uniform vec3 sunDir; uniform float uR; uniform float uRa; varying vec3 vW;
      void main(){
        vec3 rd = normalize(vW - cameraPosition), oc = cameraPosition - uC;
        float b = dot(oc, rd), d = sqrt(max(dot(oc, oc) - b * b, 0.0));
        float h = clamp((d - uR) / (uRa - uR), 0.0, 1.0);
        float g = exp(-h * 5.5) * (1.0 - smoothstep(0.8, 1.0, h));
        float lit = smoothstep(-0.25, 0.35, dot(normalize(cameraPosition + rd * (-b) - uC), normalize(sunDir)));
        vec3 c = mix(vec3(0.16, 0.36, 1.0), vec3(0.62, 0.82, 1.0), g);
        gl_FragColor = vec4(c * g * (0.04 + lit * 1.7), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: BackSide, transparent: true, blending: AdditiveBlending, depthWrite: false
  }));
  atmo.position.copy(center); earthScene.add(atmo);

  // estrellas finas y nítidas
  {
    const n = 2200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), r = rng(17);
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      pos.set([Math.cos(a) * s * 60, u * 60, Math.sin(a) * s * 60], i * 3);
      const k = 0.25 + Math.pow(r(), 3) * 0.9, w = r();
      col.set([k * (w < 0.2 ? 0.8 : 1), k * 0.95, k * (w > 0.8 ? 0.8 : 1.05)], i * 3);
    }
    const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(pos, 3)); g.setAttribute('color', new BufferAttribute(col, 3));
    earthScene.add(new Points(g, new PointsMaterial({ size: 1.3, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false })));
  }

  /* =========================================================
     LA CÚPULA (interior, escala humana)
     ========================================================= */
  const Rw = 0.55, RT = 1.32, RB = 2.8, ZT = -1.6, ZB = -0.2, PT = 0.14, SP = 0.12;

  const lin = liningTextures(512, aniso);
  [lin.map, lin.roughnessMap, lin.normalMap].forEach(t => t.repeat.set(0.9, 0.9));
  const liningMat = new MeshStandardMaterial({ map: lin.map, normalMap: lin.normalMap, normalScale: new Vector2(0.5, 0.5), metalness: 0.3, roughness: 0.58, envMapIntensity: 0.32 });
  const frameMat = new MeshStandardMaterial({ color: 0x2a2f36, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.55 });
  const chromeMat = new MeshStandardMaterial({ color: 0xe3e8ee, metalness: 1, roughness: 0.1, envMapIntensity: 1.4 });
  const bladeMat = new MeshStandardMaterial({ color: 0x15181d, metalness: 0.72, roughness: 0.3, envMapIntensity: 0.8 });
  const glassMat = new MeshStandardMaterial({ color: 0x0b0e12, metalness: 1, roughness: 0.02, envMapIntensity: 2.2, transparent: true, opacity: 0.08, depthWrite: false });
  const blueMat = new MeshStandardMaterial({ color: 0x2b63c4, metalness: 0.15, roughness: 0.42, envMapIntensity: 0.6 });
  const whiteMat = new MeshStandardMaterial({ color: 0xd9dde3, metalness: 0.05, roughness: 0.5, envMapIntensity: 0.5 });
  const orangeMat = new MeshStandardMaterial({ color: 0xd8742a, metalness: 0.05, roughness: 0.55 });
  const ledMat = new MeshBasicMaterial({ color: new Color(0.7, 0.86, 1), toneMapped: false });

  const cup = new Group(); scene.add(cup);
  const tmp = new Object3D();

  // contorno con esquinas redondeadas
  function rounded(path, pts, r) {
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      const da = new Vector2(a[0] - p[0], a[1] - p[1]), db = new Vector2(b[0] - p[0], b[1] - p[1]);
      const ra = Math.min(r, da.length() / 2), rb = Math.min(r, db.length() / 2);
      da.normalize(); db.normalize();
      const p1 = [p[0] + da.x * ra, p[1] + da.y * ra], p2 = [p[0] + db.x * rb, p[1] + db.y * rb];
      if (i === 0) path.moveTo(p1[0], p1[1]); else path.lineTo(p1[0], p1[1]);
      path.quadraticCurveTo(p[0], p[1], p2[0], p2[1]);
    }
    path.closePath();
    return path;
  }

  // placa superior hexagonal con la ventana redonda
  {
    const sh = new Shape();
    for (let k = 0; k < 6; k++) { const a = k * 60 * D; k ? sh.lineTo(RT * Math.cos(a), RT * Math.sin(a)) : sh.moveTo(RT * Math.cos(a), RT * Math.sin(a)); }
    sh.closePath();
    const hole = new Path(); hole.absarc(0, 0, Rw, 0, Math.PI * 2, true); sh.holes.push(hole);
    const plate = new Mesh(new ExtrudeGeometry(sh, { depth: PT, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 128 }), liningMat);
    plate.position.z = ZT - PT; cup.add(plate);
  }
  // aro de la ventana central: goma oscura, filo cromado y una línea de luz
  const rim = new Mesh(new TorusGeometry(Rw + 0.03, 0.055, 32, 160), frameMat); rim.position.z = ZT + 0.01; cup.add(rim);
  const chrome = new Mesh(new TorusGeometry(Rw + 0.1, 0.011, 16, 200), chromeMat); chrome.position.z = ZT + 0.03; cup.add(chrome);
  const led = new Mesh(new TorusGeometry(Rw + 0.16, 0.005, 8, 200), ledMat); led.position.z = ZT + 0.025; cup.add(led);
  const glassC = new Mesh(new ShapeGeometry(new Shape().absarc(0, 0, Rw, 0, Math.PI * 2), 96), glassMat); glassC.position.z = ZT - 0.11; cup.add(glassC);

  // iris de 8 hojas (la "compuerta")
  const blades = [];
  {
    const th = (Math.PI / 8) * 1.5, L = Rw * 1.08;
    const bs = new Shape();
    bs.moveTo(0, 0); bs.lineTo(L * Math.cos(-th), L * Math.sin(-th)); bs.absarc(0, 0, L, -th, th, false);
    bs.quadraticCurveTo(L * 0.5 * Math.cos(th * 1.7), L * 0.5 * Math.sin(th * 1.7), 0, 0);
    const bg = new ExtrudeGeometry(bs, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 32 });
    for (let i = 0; i < 8; i++) {
      const m = new Mesh(bg, bladeMat); m.userData.a = i * Math.PI / 4; m.userData.z = ZT - 0.05 - i * 0.0035;
      cup.add(m); blades.push(m);
    }
  }

  // seis paneles laterales con ventanas trapezoidales
  const bolts = [];
  const inward = [];
  for (let i = 0; i < 6; i++) {
    const a0 = i * 60 * D, a1 = (i + 1) * 60 * D;
    const T0 = new Vector3(RT * Math.cos(a0), RT * Math.sin(a0), ZT), T1 = new Vector3(RT * Math.cos(a1), RT * Math.sin(a1), ZT);
    const B0 = new Vector3(RB * Math.cos(a0), RB * Math.sin(a0), ZB), B1 = new Vector3(RB * Math.cos(a1), RB * Math.sin(a1), ZB);
    const c = T0.clone().add(T1).add(B0).add(B1).multiplyScalar(0.25);
    const u = T1.clone().sub(T0).normalize();
    const v = B0.clone().add(B1).sub(T0).sub(T1).normalize();
    const n = new Vector3().crossVectors(u, v);
    if (n.dot(new Vector3(c.x, c.y, 0)) < 0) { u.negate(); n.negate(); }
    const M = new Matrix4().makeBasis(u, v, n).setPosition(c);
    const to2 = p => { const d = p.clone().sub(c); return [d.dot(u), d.dot(v)]; };
    const yt = to2(T0)[1], yb = to2(B0)[1];
    const wt = Math.abs(to2(T1)[0] - to2(T0)[0]) / 2, wb = Math.abs(to2(B1)[0] - to2(B0)[0]) / 2;
    const s = (wb - wt) / (yb - yt);
    const trap = (fs, ft, fb) => { const sh = fs * Math.sqrt(1 + s * s), hx = y => wt + s * (y - yt) - sh, a = yt + ft, b = yb - fb; return [[-hx(a), a], [hx(a), a], [hx(b), b], [-hx(b), b]]; };
    const outer = [[-wt, yt], [wt, yt], [wb, yb], [-wb, yb]];
    const holePts = trap(0.17, 0.2, 0.24);
    const sh = new Shape(); outer.forEach((p, k) => k ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])); sh.closePath();
    sh.holes.push(rounded(new Path(), holePts, 0.12));
    const g = new ExtrudeGeometry(sh, { depth: SP, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 10 });
    g.applyMatrix4(M);
    cup.add(new Mesh(g, liningMat));
    const gg = new ShapeGeometry(rounded(new Shape(), holePts, 0.12), 10); gg.translate(0, 0, SP * 0.7); gg.applyMatrix4(M);
    cup.add(new Mesh(gg, glassMat));
    // fijaciones alrededor de la ventana
    const mid = trap(0.085, 0.1, 0.12), q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), n.clone().negate());
    for (let e = 0; e < 4; e++) {
      const p = mid[e], r = mid[(e + 1) % 4], len = Math.hypot(r[0] - p[0], r[1] - p[1]), cnt = Math.max(2, Math.round(len / 0.17));
      for (let k = 1; k < cnt; k++) {
        const t = k / cnt, x = p[0] + (r[0] - p[0]) * t, y = p[1] + (r[1] - p[1]) * t;
        bolts.push({ p: new Vector3(x, y, -0.02).applyMatrix4(M), q });
      }
    }
    inward.push(n.clone().negate());
  }
  // vigas entre ventanas
  const beamEnds = [];
  for (let k = 0; k < 6; k++) {
    const a = k * 60 * D;
    const T = new Vector3(RT * Math.cos(a), RT * Math.sin(a), ZT), B = new Vector3(RB * Math.cos(a), RB * Math.sin(a), ZB);
    const y = B.clone().sub(T); const len = y.length(); y.normalize();
    const radial = new Vector3(Math.cos(a), Math.sin(a), 0);
    const z = radial.clone().sub(y.clone().multiplyScalar(radial.dot(y))).normalize();
    const x = new Vector3().crossVectors(y, z);
    const inw = z.clone().negate();
    const beam = new Mesh(new BoxGeometry(0.17, len, 0.12), frameMat);
    beam.matrixAutoUpdate = false;
    beam.matrix.makeBasis(x, y, z).setPosition(T.clone().add(B).multiplyScalar(0.5).add(inw.clone().multiplyScalar(0.03)));
    cup.add(beam);
    beamEnds.push({ T, B, inw, y, x });
  }
  // pared del módulo detrás de la cúpula
  {
    const sh = new Shape(); sh.moveTo(-12, -12); sh.lineTo(12, -12); sh.lineTo(12, 12); sh.lineTo(-12, 12); sh.closePath();
    const h = new Path(); for (let k = 0; k < 6; k++) { const a = k * 60 * D; k ? h.lineTo(RB * Math.cos(a), RB * Math.sin(a)) : h.moveTo(RB * Math.cos(a), RB * Math.sin(a)); } h.closePath(); sh.holes.push(h);
    const wall = new Mesh(new ShapeGeometry(sh), liningMat); wall.position.z = ZB + 0.02; cup.add(wall);
  }
  // pasamanos azules y blancos, cable y etiquetas: la vida real de una estación
  function handrail(be, t0, t1, off, mat) {
    const P = t => be.T.clone().lerp(be.B, t);
    const pts = [P(t0), P(t0).add(be.inw.clone().multiplyScalar(off * 0.7)), P(t0 + 0.04).add(be.inw.clone().multiplyScalar(off)),
      P((t0 + t1) / 2).add(be.inw.clone().multiplyScalar(off)), P(t1 - 0.04).add(be.inw.clone().multiplyScalar(off)), P(t1).add(be.inw.clone().multiplyScalar(off * 0.7)), P(t1)]
      .map(p => p.add(be.x.clone().multiplyScalar(0.0)));
    cup.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts, false, 'centripetal'), 80, 0.017, 12), mat));
  }
  handrail(beamEnds[2], 0.18, 0.72, 0.13, blueMat);
  handrail(beamEnds[5], 0.2, 0.78, 0.13, blueMat);
  handrail(beamEnds[4], 0.3, 0.7, 0.11, whiteMat);
  {
    const boltGeo = new CylinderGeometry(0.016, 0.016, 0.02, 10);
    const inst = new InstancedMesh(boltGeo, chromeMat, bolts.length);
    bolts.forEach((b, i) => { tmp.position.copy(b.p); tmp.quaternion.copy(b.q); tmp.scale.set(1, 1, 1); tmp.updateMatrix(); inst.setMatrixAt(i, tmp.matrix); });
    cup.add(inst);
    const r = rng(23), tags = [];
    beamEnds.forEach(be => { for (let k = 0; k < 3; k++) tags.push({ be, t: 0.15 + r() * 0.7, o: r() < 0.35 }); });
    const tagGeo = new BoxGeometry(0.06, 0.035, 0.01);
    const wTag = new InstancedMesh(tagGeo, whiteMat, tags.length), oTag = new InstancedMesh(tagGeo, orangeMat, tags.length);
    let wi = 0, oi = 0;
    tags.forEach(t => {
      tmp.position.copy(t.be.T.clone().lerp(t.be.B, t.t).add(t.be.inw.clone().multiplyScalar(0.095)));
      tmp.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(t.be.x, t.be.y, t.be.inw.clone().negate())); tmp.updateMatrix();
      if (t.o) oTag.setMatrixAt(oi++, tmp.matrix); else wTag.setMatrixAt(wi++, tmp.matrix);
    });
    wTag.count = wi; oTag.count = oi; cup.add(wTag, oTag);
  }

  // luces del interior
  scene.add(new HemisphereLight(0xbcd2ff, 0x0a0c10, 0.5));
  const fill = new DirectionalLight(0xe2eaff, 1.15); fill.position.set(1.4, 2.4, 3); fill.target.position.set(0, 0, -1.5); scene.add(fill, fill.target);
  const cabin = new PointLight(0xffd8b0, 2.2, 5, 2); cabin.position.set(-0.9, -1.0, 0.7); scene.add(cabin);
  const earthGlow = new DirectionalLight(0x9cc0ff, 0.6); earthGlow.position.set(0, -0.6, -3); scene.add(earthGlow);

  /* ---------- cámara y encuadre ---------- */
  const camera = new PerspectiveCamera(58, innerWidth / innerHeight, 0.01, 60);
  let baseFov = 58, Z0 = 0.9;
  function frame() {
    const asp = innerWidth / innerHeight;
    baseFov = asp < 0.9 ? 80 : asp < 1.3 ? 68 : 58;
    Z0 = asp < 0.9 ? 1.25 : 0.9;
    camera.aspect = earthCam.aspect = asp;
    renderer.setSize(innerWidth, innerHeight, false);
  }
  frame();
  const onResize = () => frame();
  addEventListener('resize', onResize); cleanupFns.push(() => removeEventListener('resize', onResize));

  /* ---------- línea de tiempo (~2,4 s) ---------- */
  const S = { fade: 0, iris: 0, cam: 0, tilt: 0, fovAdd: 0, out: 1 };
  const hud = $('.intro-hud');
  const tl = gsap.timeline({ paused: true, onComplete: () => done() });
  tl.to(S, { fade: 1, duration: 0.35, ease: 'power1.out' }, 0)
    .call(() => html.classList.add('intro-running', 'intro-cover'), null, 0.36)
    .to(hud, { opacity: 1, duration: 0.4 }, 0.12)
    .to(S, { iris: 1, duration: 0.7, ease: 'power3.inOut' }, 0.38)
    .to(S, { cam: 1, duration: 1.35, ease: 'power2.inOut' }, 0.78)
    .to(S, { fovAdd: 10, duration: 0.7, ease: 'power2.in' }, 0.78)
    .to(S, { fovAdd: 0, duration: 0.65, ease: 'power2.out' }, 1.48)
    .to(S, { tilt: 1, duration: 1.2, ease: 'sine.inOut' }, 1.15)
    .to(hud, { opacity: 0, duration: 0.3 }, 1.35)
    .call(() => { html.classList.remove('intro-cover'); window.dispatchEvent(new Event('intro:reveal')); }, null, 1.66)
    .to(S, { out: 0, duration: 0.55, ease: 'power1.inOut' }, 1.85);

  /* ---------- cuadro a cuadro ---------- */
  const look = new Vector3(), d0 = new Vector3(0, 0.06, -1).normalize(), d1 = new Vector3(0, 0.42, -1).normalize();
  let slow = 0, frames = 0, last = performance.now();
  function draw() {
    blades.forEach(b => {
      const o = S.iris, a = b.userData.a + o * 1.05;
      b.rotation.z = a; b.position.set(Math.cos(a) * o * Rw * 1.06, Math.sin(a) * o * Rw * 1.06, b.userData.z);
      b.scale.setScalar(1 - 0.22 * o); b.visible = o < 0.995;
    });
    ledMat.color.setRGB(0.7, 0.86, 1).multiplyScalar(0.25 + 0.75 * S.iris);
    renderer.toneMappingExposure = 0.95 + 0.12 * S.iris;
    camera.position.set(0, MathUtils.lerp(-0.1, 0.02, S.cam), MathUtils.lerp(Z0, -2.9, S.cam));
    look.copy(d0).lerp(d1, S.tilt).normalize().add(camera.position);
    camera.fov = earthCam.fov = baseFov + S.fovAdd;
    camera.lookAt(look); camera.updateProjectionMatrix();
    earthCam.quaternion.copy(camera.quaternion); earthCam.updateProjectionMatrix();
    cvs.style.opacity = String(S.fade * S.out);
    renderer.clear();
    renderer.render(earthScene, earthCam);
    renderer.clearDepth();
    renderer.render(scene, camera);
  }
  function tick() {
    const now = performance.now(), dt = now - last; last = now;
    // calidad adaptativa: si el equipo no llega a ~40 fps, se baja la resolución una vez
    if (frames++ > 3 && frames < 24 && dt > 25) slow++;
    if (slow === 6 && DPR > 1) { DPR = Math.max(1, DPR * 0.7); renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight, false); slow++; }
    draw();
  }

  /* ---------- arranque y cierre ---------- */
  renderer.initTexture(earthTex);
  renderer.compile(earthScene, earthCam); renderer.compile(scene, camera);
  draw();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  if (ended) { cloudRT.dispose(); earthTex.dispose(); renderer.dispose(); renderer.forceContextLoss(); return; }
  draw(); ready = true;
  last = performance.now();
  gsap.ticker.add(tick);
  cleanupFns.push(() => gsap.ticker.remove(tick));
  if (!(DEBUG && /[?&]introhold/.test(location.search))) tl.play(0);
  const watchdog = DEBUG ? 0 : setTimeout(() => skip(), 9000);   // red de seguridad para equipos muy lentos
  cleanupFns.push(() => clearTimeout(watchdog));
  try { localStorage.setItem('rb-intro', '1'); } catch (e) { /* nada */ }

  const skipBtn = $('.intro-skip');
  setTimeout(() => { try { skipBtn.focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 300);

  skipNow = () => {
    tl.pause();
    html.classList.remove('intro-cover');
    gsap.to(S, { out: 0, duration: 0.35, ease: 'power1.out', onComplete: done });
    gsap.to(hud, { opacity: 0, duration: 0.25 });
    setTimeout(done, 700);   // en equipos lentos, cierra igual aunque la animación se demore
    window.dispatchEvent(new Event('intro:reveal'));
  };
  function done() {
    if (ended) return; ended = true;
    gsap.ticker.remove(tick);
    tl.kill();
    [scene, earthScene].forEach(sc => sc.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => { Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); }); if (m.uniforms) Object.values(m.uniforms).forEach(u => u.value && u.value.isTexture && u.value.dispose()); m.dispose(); });
    }));
    cloudRT.dispose(); earthTex.dispose();
    if (scene.environment) scene.environment.dispose();
    renderer.dispose(); renderer.forceContextLoss();
    finish(false);
  }

  if (DEBUG) window.__intro = { tl, S, scene, earthScene, camera, renderer, draw, seek: t => { tl.pause(); tl.seek(t); draw(); } };
}

// arranque (al final: así todo lo anterior ya está declarado)
if (html.classList.contains('intro-pending')) start().catch(err => { console.warn('[intro]', err); finish(true); });
