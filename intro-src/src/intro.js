// Intro: apertura de la esclusa de una nave, del interior hacia el espacio.
// Detrás de la compuerta está la web real (el lienzo 3D es transparente donde
// no hay geometría), así que al abrirse se ve la página misma, en vivo.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Shape, Path, ExtrudeGeometry, ShapeGeometry,
  CylinderGeometry, TorusGeometry, RingGeometry, BoxGeometry, PlaneGeometry, CapsuleGeometry, SphereGeometry,
  MeshStandardMaterial, MeshBasicMaterial, ShaderMaterial, Points, BufferGeometry, BufferAttribute,
  SpotLight, PointLight, DirectionalLight, HemisphereLight, Sprite, SpriteMaterial, Color, Vector2,
  ACESFilmicToneMapping, SRGBColorSpace, PMREMGenerator, AdditiveBlending, NormalBlending, BackSide, DoubleSide,
  PCFShadowMap, InstancedMesh, Object3D, MathUtils
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { doorTextures, panelTextures, bezelTexture, gratingTextures, glowTexture, flareTexture, smokeTexture, rng } from './textures.js';

const html = document.documentElement;
const DEBUG = /[?&]introdebug/.test(location.search);


let cleanupFns = [];
function finish(immediate) {
  cleanupFns.forEach(f => { try { f(); } catch (e) { /* nada */ } });
  cleanupFns = [];
  html.classList.remove('intro-pending', 'intro-running');
  const el = document.getElementById('intro');
  if (el) { if (immediate) el.remove(); else setTimeout(() => el.remove(), 50); }
  window.dispatchEvent(new Event('intro:done'));
}

async function start() {
  window.__introStarted = true;
  const small = Math.min(innerWidth, innerHeight) < 700 || matchMedia('(pointer: coarse)').matches;
  const DPR = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);

  /* ---------- contenedor, HUD y botón saltar ---------- */
  const box = document.createElement('div');
  box.id = 'intro';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Apertura de la esclusa');
  box.innerHTML = `
    <canvas aria-hidden="true"></canvas>
    <div class="intro-vig" aria-hidden="true"></div>
    <div class="intro-hud" aria-hidden="true">
      <div class="h-tl"><i></i>RB-01 · Esclusa exterior</div>
      <div class="h-tr">Sector 7 · Órbita baja</div>
      <div class="h-c">
        <div class="h-status">Secuencia de apertura</div>
        <div class="h-bar"><b></b></div>
        <div class="h-sub">Presión interior <span class="h-kpa">101</span> kPa</div>
      </div>
      <span class="h-corner c1"></span><span class="h-corner c2"></span><span class="h-corner c3"></span><span class="h-corner c4"></span>
    </div>
    <button type="button" class="intro-skip">Saltar intro <span aria-hidden="true">›</span></button>`;
  document.body.appendChild(box);
  const cvs = box.querySelector('canvas');
  const $ = s => box.querySelector(s);

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

  /* ---------- render ---------- */
  const renderer = new WebGLRenderer({ canvas: cvs, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !small;
  renderer.shadowMap.type = PCFShadowMap;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  // tipografía del rotulado: se espera brevemente a que cargue Inter
  try { await Promise.race([document.fonts.load('600 64px Inter'), new Promise(r => setTimeout(r, 700))]); } catch (e) { /* nada */ }

  /* ---------- medidas ---------- */
  const R = 1.55;            // radio del hueco de paso
  const RO = R + 0.12;       // la hoja se mete debajo del marco
  const RH = R + 0.06;       // agujero del mamparo
  const TS = small ? 512 : 1024;

  /* ---------- materiales ---------- */
  const dT = doorTextures(TS, RO, aniso);
  [dT.map, dT.roughnessMap, dT.normalMap].forEach(t => { t.repeat.set(1 / (2 * RO), 1 / (2 * RO)); t.offset.set(0.5, 0.5); });
  const doorMat = new MeshStandardMaterial({ map: dT.map, roughnessMap: dT.roughnessMap, normalMap: dT.normalMap, normalScale: new Vector2(0.9, 0.9), metalness: 0.82, roughness: 1, envMapIntensity: 0.55 });
  const pT = panelTextures(small ? 512 : 768, aniso, { tint: '#3c424a', seed: 3 });
  const wallMat = new MeshStandardMaterial({ map: pT.map, roughnessMap: pT.roughnessMap, normalMap: pT.normalMap, normalScale: new Vector2(0.8, 0.8), metalness: 0.7, roughness: 1, envMapIntensity: 0.35 });
  [pT.map, pT.roughnessMap, pT.normalMap].forEach(t => t.repeat.set(1 / 1.35, 1 / 1.35));
  const pT2 = panelTextures(small ? 512 : 768, aniso, { tint: '#3d434b', seed: 9, label: false });
  const sideMat = new MeshStandardMaterial({ map: pT2.map, roughnessMap: pT2.roughnessMap, normalMap: pT2.normalMap, metalness: 0.6, roughness: 1, envMapIntensity: 0.1 });
  [pT2.map, pT2.roughnessMap, pT2.normalMap].forEach(t => t.repeat.set(1 / 1.6, 1 / 1.6));
  const gT = gratingTextures(512, aniso);
  gT.map.repeat.set(6, 10); gT.normalMap.repeat.set(6, 10);
  const floorMat = new MeshStandardMaterial({ map: gT.map, normalMap: gT.normalMap, metalness: 0.8, roughness: 0.55, envMapIntensity: 0.3 });
  const gunMat = new MeshStandardMaterial({ color: 0x2c3138, metalness: 0.9, roughness: 0.32, envMapIntensity: 0.7, roughnessMap: pT.roughnessMap });
  const steelMat = new MeshStandardMaterial({ color: 0xb9c0c8, metalness: 1, roughness: 0.18, envMapIntensity: 1 });
  const bezelMap = bezelTexture(small ? 512 : 1024, RH, RH + 0.46, aniso);
  const bezelMat = new MeshStandardMaterial({ map: bezelMap, metalness: 0.55, roughness: 0.6, envMapIntensity: 0.4 });

  /* ---------- mamparo con el hueco ---------- */
  const wallShape = new Shape();
  wallShape.moveTo(-40, -40); wallShape.lineTo(40, -40); wallShape.lineTo(40, 40); wallShape.lineTo(-40, 40); wallShape.lineTo(-40, -40);
  const hole = new Path(); hole.absarc(0, 0, RH + 0.46, 0, Math.PI * 2, true); wallShape.holes.push(hole);
  const wall = new Mesh(new ShapeGeometry(wallShape, 96), wallMat);
  wall.receiveShadow = true; scene.add(wall);

  // bisel con franjas de advertencia
  const bezel = new Mesh(new RingGeometry(RH, RH + 0.46, 160, 1), bezelMat);
  bezel.position.z = 0.012; bezel.receiveShadow = true;
  { // UV planar para que la textura polar calce con el anillo
    const pos = bezel.geometry.attributes.position, uv = bezel.geometry.attributes.uv, o = RH + 0.46;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) / o) * 0.5 + 0.5, (pos.getY(i) / o) * 0.5 + 0.5);
  }
  scene.add(bezel);
  const ringMat = new MeshStandardMaterial({ color: 0x2c3138, metalness: 0.9, roughness: 0.34, envMapIntensity: 0.7 });
  const torus = new Mesh(new TorusGeometry(RH + 0.02, 0.085, 24, 180), ringMat);
  torus.position.z = 0.05; torus.castShadow = true; torus.receiveShadow = true; scene.add(torus);
  const torus2 = new Mesh(new TorusGeometry(RH + 0.47, 0.05, 16, 180), ringMat);
  torus2.position.z = 0.03; scene.add(torus2);
  // túnel de la compuerta (el espesor del casco)
  const lip = new Mesh(new CylinderGeometry(RH, RH, 0.7, 160, 1, true), new MeshStandardMaterial({ color: 0x23272d, metalness: 0.9, roughness: 0.45, side: BackSide, envMapIntensity: 0.6 }));
  lip.rotation.x = Math.PI / 2; lip.position.z = -0.35; scene.add(lip);

  // tornillería del marco
  const boltGeo = new CylinderGeometry(0.032, 0.032, 0.05, 6);
  const nuts = new InstancedMesh(boltGeo, steelMat, 40);
  const tmp = new Object3D();
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * Math.PI * 2; tmp.position.set(Math.cos(a) * (RH + 0.4), Math.sin(a) * (RH + 0.4), 0.04);
    tmp.rotation.set(Math.PI / 2, 0, a); tmp.updateMatrix(); nuts.setMatrixAt(i, tmp.matrix);
  }
  scene.add(nuts);

  /* ---------- hojas de la compuerta: dientes entrelazados ---------- */
  const seam = [[0, RO + 0.02], [0, 1.25], [0.13, 1.0], [-0.13, 0.62], [0.13, 0.24], [-0.13, -0.14], [0.13, -0.52], [-0.13, -0.9], [0, -1.18], [0, -(RO + 0.02)]];
  const extrude = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.028, bevelSegments: 4, curveSegments: 120 };
  function half(side) {
    const sh = new Shape(), g = side * 0.004;     // pequeña luz en la junta
    if (side < 0) {
      sh.moveTo(seam[0][0] + g, seam[0][1]);
      sh.absarc(0, 0, RO, Math.PI / 2, Math.PI * 1.5, false);
      for (let i = seam.length - 1; i >= 0; i--) sh.lineTo(seam[i][0] + g, seam[i][1]);
    } else {
      sh.moveTo(seam[0][0] + g, seam[0][1]);
      for (let i = 0; i < seam.length; i++) sh.lineTo(seam[i][0] + g, seam[i][1]);
      sh.absarc(0, 0, RO, -Math.PI / 2, Math.PI / 2, false);
    }
    const geo = new ExtrudeGeometry(sh, extrude);
    geo.translate(0, 0, -0.2 - 0.035);
    const m = new Mesh(geo, doorMat); m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  const door = new Group(); door.position.z = -0.06; scene.add(door);
  const leafL = half(-1), leafR = half(1); door.add(leafL, leafR);

  // cerrojos radiales
  const bolts = [];
  const boltMesh = new CylinderGeometry(0.055, 0.055, 0.42, 20);
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + Math.PI / 10;
    const b = new Mesh(boltMesh, steelMat); b.castShadow = true;
    b.rotation.z = a - Math.PI / 2;
    b.userData = { a, r0: RH - 0.02 };
    b.position.set(Math.cos(a) * (RH - 0.02), Math.sin(a) * (RH - 0.02), -0.1);
    scene.add(b); bolts.push(b);
    const housing = new Mesh(new BoxGeometry(0.2, 0.26, 0.09), gunMat);
    housing.position.set(Math.cos(a) * (RH + 0.24), Math.sin(a) * (RH + 0.24), 0.05); housing.rotation.z = a;
    housing.castShadow = true; scene.add(housing);
  }

  /* ---------- luces de estado ---------- */
  const glowW = glowTexture(128, false), glowA = glowTexture(128, true);
  const lamps = [];
  for (const ang of [Math.PI * 0.75, Math.PI * 0.25]) {
    const p = [Math.cos(ang) * (RH + 0.25), Math.sin(ang) * (RH + 0.25)];
    const mat = new MeshStandardMaterial({ color: 0x220303, emissive: 0xff2a1a, emissiveIntensity: 3, roughness: 0.3 });
    const lamp = new Mesh(new CapsuleGeometry(0.05, 0.12, 6, 12), mat);
    lamp.position.set(p[0], p[1], 0.12); lamp.rotation.z = ang;
    const sp = new Sprite(new SpriteMaterial({ map: glowW, color: 0xff3a22, blending: AdditiveBlending, depthWrite: false, transparent: true }));
    sp.scale.set(0.9, 0.9, 1); sp.position.copy(lamp.position); sp.position.z += 0.05;
    const pl = new PointLight(0xff3a22, 2.2, 3, 1.8); pl.position.set(p[0] * 0.92, p[1] * 0.92, 0.5);
    scene.add(lamp, sp, pl); lamps.push({ mat, sp, pl });
  }
  // balizas ámbar a los lados (giran con un pulso)
  const ambers = [];
  for (const x of [-1, 1]) {
    const pl = new PointLight(0xffa13a, 0, 6, 1.6); pl.position.set(x * (RH + 0.95), 1.15, 0.6);
    const sp = new Sprite(new SpriteMaterial({ map: glowA, color: 0xffa13a, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    sp.scale.set(1.4, 1.4, 1); sp.position.set(x * (RH + 0.95), 1.15, 0.12);
    const capMat = new MeshStandardMaterial({ color: 0x3a2205, emissive: 0xffa13a, emissiveIntensity: 0, roughness: 0.4 });
    const cap = new Mesh(new SphereGeometry(0.08, 20, 12), capMat); cap.position.set(x * (RH + 0.95), 1.15, 0.08);
    scene.add(pl, sp, cap); ambers.push({ pl, sp, capMat });
  }

  /* ---------- pasillo ---------- */
  const corr = new Group(); scene.add(corr);
  const L = 18, HW = 2.7, FY = -1.95, CY = 2.25;
  const floor = new Mesh(new PlaneGeometry(HW * 2, L), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.set(0, FY, L / 2); floor.receiveShadow = true; corr.add(floor);
  const ceil = new Mesh(new PlaneGeometry(HW * 2, L), sideMat); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CY, L / 2); corr.add(ceil);
  for (const s of [-1, 1]) { const w = new Mesh(new PlaneGeometry(L, CY - FY), sideMat); w.rotation.y = -s * Math.PI / 2; w.position.set(s * HW, (CY + FY) / 2, L / 2); w.receiveShadow = true; corr.add(w); }
  // costillas estructurales
  const ribGeo = new BoxGeometry(0.16, 0.16, 0.16);
  const ribMat = new MeshStandardMaterial({ color: 0x15181c, metalness: 0.8, roughness: 0.66, envMapIntensity: 0.25, roughnessMap: pT.roughnessMap });
  const ribs = new InstancedMesh(ribGeo, ribMat, 2 * 22);
  let ri = 0;
  for (let k = 0; k < 22; k++) {
    const z = 0.55 + k * 0.85;
    for (const [px, py, sx, sy] of [[-HW + 0.08, (CY + FY) / 2, 1, (CY - FY) / 0.16], [HW - 0.08, (CY + FY) / 2, 1, (CY - FY) / 0.16]]) {
      tmp.position.set(px, py, z); tmp.rotation.set(0, 0, 0); tmp.scale.set(sx, sy, 1); tmp.updateMatrix(); ribs.setMatrixAt(ri++, tmp.matrix);
    }
  }
  ribs.castShadow = true; ribs.receiveShadow = true; corr.add(ribs);
  // tiras de luz del techo y guías del piso
  const stripMat = new MeshBasicMaterial({ color: new Color(0.85, 0.92, 1).multiplyScalar(2.2), toneMapped: false });
  const guideMat = new MeshBasicMaterial({ color: new Color(0.56, 0.67, 0.51).multiplyScalar(2.6), toneMapped: false });
  for (const s of [-1, 1]) {
    const strip = new Mesh(new BoxGeometry(0.07, 0.02, L - 1), stripMat); strip.position.set(s * 0.9, CY - 0.02, L / 2 + 0.4); corr.add(strip);
    const guide = new Mesh(new BoxGeometry(0.03, 0.01, L - 0.6), guideMat); guide.position.set(s * 1.25, FY + 0.012, L / 2 + 0.3); corr.add(guide);
  }
  const ceilLights = [];
  for (const z of [1.4, 4.2]) { const pl = new PointLight(0xdbe8ff, 4, 9, 1.4); pl.position.set(0, CY - 0.75, z); scene.add(pl); ceilLights.push(pl); }

  /* ---------- luces principales ---------- */
  scene.add(new HemisphereLight(0x8ea4bd, 0x1a140f, 0.28));
  const key = new SpotLight(0xf1f4ff, 38, 14, 0.62, 0.75, 1.5);
  key.position.set(0.3, CY - 0.1, 2.6); key.target.position.set(0, 0.1, 0); scene.add(key, key.target);
  key.castShadow = !small; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  // luz del exterior (el sol) que entra por la compuerta al abrirse
  const sunLight = new DirectionalLight(0xfff0d8, 0); sunLight.position.set(1.6, 1.2, -8); sunLight.target.position.set(-0.4, -0.6, 3); scene.add(sunLight, sunLight.target);
  const sunFill = new PointLight(0xffe6c2, 0, 9, 1.2); sunFill.position.set(0, 0, -0.6); scene.add(sunFill);

  // sol y destello, solo visibles a través del hueco
  const sun = new Sprite(new SpriteMaterial({ map: glowA, color: 0xfff1dc, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  sun.position.set(1.9, 1.15, -9); sun.scale.set(9, 9, 1); scene.add(sun);
  const flare = new Sprite(new SpriteMaterial({ map: flareTexture(512), color: 0xffe9cc, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  flare.position.copy(sun.position); flare.scale.set(30, 7.5, 1); scene.add(flare);

  // rayos de luz volumétricos atravesando el vapor
  const raysMat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
    uniforms: { uI: { value: 0 }, uT: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float uI; uniform float uT; varying vec2 vUv;
      float h(float n){ return fract(sin(n)*43758.5453); }
      float nz(float x){ float i=floor(x), f=fract(x); return mix(h(i),h(i+1.),f*f*(3.-2.*f)); }
      void main(){
        float along = pow(vUv.y, 1.6);
        float streak = 0.35 + 0.65*nz(vUv.x*38. + uT*0.6) * nz(vUv.x*11. - uT*0.25 + 7.);
        float a = along * streak * uI * smoothstep(0.0, 0.08, vUv.y);
        gl_FragColor = vec4(vec3(1.0, 0.93, 0.8) * a, a);
      }`
  });
  const rays = new Mesh(new CylinderGeometry(R * 0.95, R * 2.6, 4.2, 96, 1, true), raysMat);
  rays.rotation.x = -Math.PI / 2; rays.position.set(-0.25, -0.2, 1.8); rays.rotation.z = 0.06; scene.add(rays);

  /* ---------- vapor (aire que escapa al vacío) y polvo ---------- */
  const rand = rng(77);
  const NV = small ? 260 : 620;
  const vPos = new Float32Array(NV * 3), vSize = new Float32Array(NV), vAlpha = new Float32Array(NV), vRot = new Float32Array(NV);
  const vel = new Float32Array(NV * 3), life = new Float32Array(NV), maxLife = new Float32Array(NV), grow = new Float32Array(NV);
  const vapGeo = new BufferGeometry();
  vapGeo.setAttribute('position', new BufferAttribute(vPos, 3)); vapGeo.setAttribute('aSize', new BufferAttribute(vSize, 1));
  vapGeo.setAttribute('aAlpha', new BufferAttribute(vAlpha, 1)); vapGeo.setAttribute('aRot', new BufferAttribute(vRot, 1));
  const smokeMap = smokeTexture(128);
  const vapMat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: NormalBlending, premultipliedAlpha: true,
    uniforms: { uMap: { value: smokeMap }, uScale: { value: 1 }, uWarm: { value: 0 } },
    vertexShader: `attribute float aSize; attribute float aAlpha; attribute float aRot; uniform float uScale;
      varying float vA; varying float vR;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv;
        gl_PointSize = aSize*uScale/max(0.1,-mv.z); vA=aAlpha; vR=aRot; }`,
    fragmentShader: `uniform sampler2D uMap; uniform float uWarm; varying float vA; varying float vR;
      void main(){ vec2 p = gl_PointCoord-0.5; float c=cos(vR), s=sin(vR); p = mat2(c,-s,s,c)*p + 0.5;
        vec4 t = texture2D(uMap, p); float a = t.a*vA; if(a<0.003) discard;
        vec3 col = mix(vec3(0.80,0.85,0.92), vec3(1.0,0.92,0.80), uWarm);
        gl_FragColor = vec4(col*a, a); }`
  });
  const vapor = new Points(vapGeo, vapMat); vapor.frustumCulled = false; scene.add(vapor);
  let vHead = 0;
  function emit(x, y, z, vx, vy, vz, size, lifeS) {
    const i = vHead; vHead = (vHead + 1) % NV;
    vPos[i * 3] = x; vPos[i * 3 + 1] = y; vPos[i * 3 + 2] = z;
    vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
    vSize[i] = size; grow[i] = 0.6 + rand() * 0.9; life[i] = lifeS; maxLife[i] = lifeS; vRot[i] = rand() * 6.28; vAlpha[i] = 0;
  }
  for (let i = 0; i < NV; i++) vPos[i * 3 + 2] = -999;

  const ND = small ? 180 : 420;
  const dPos = new Float32Array(ND * 3), dVel = new Float32Array(ND * 3);
  for (let i = 0; i < ND; i++) { dPos[i * 3] = (rand() - 0.5) * HW * 1.8; dPos[i * 3 + 1] = FY + rand() * (CY - FY); dPos[i * 3 + 2] = 0.2 + rand() * 6; }
  const dustGeo = new BufferGeometry(); dustGeo.setAttribute('position', new BufferAttribute(dPos, 3));
  const dustMat = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { uScale: { value: 1 }, uA: { value: 0.55 } },
    vertexShader: 'uniform float uScale; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=0.018*uScale/max(0.1,-mv.z); }',
    fragmentShader: 'uniform float uA; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.,d)*uA; gl_FragColor=vec4(vec3(1.,0.96,0.9)*a,a); }'
  });
  const dust = new Points(dustGeo, dustMat); dust.frustumCulled = false; scene.add(dust);

  /* ---------- cámara: encuadre que se adapta a cualquier pantalla ---------- */
  const camera = new PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 80);
  let baseZ = 6, baseFov = 50;
  function frame() {
    const a = innerWidth / innerHeight;
    baseFov = a < 1 ? 64 : 46;
    const need = (RH + 0.62) * 1.12;   // que entre el marco completo con aire
    baseZ = need / (Math.tan(MathUtils.degToRad(baseFov / 2)) * Math.min(1, a));
    camera.aspect = a; renderer.setSize(innerWidth, innerHeight, false);
    const sc = innerHeight * DPR / (2 * Math.tan(MathUtils.degToRad(baseFov / 2)));
    vapMat.uniforms.uScale.value = sc; dustMat.uniforms.uScale.value = sc;
  }
  frame();
  const onResize = () => frame();
  window.addEventListener('resize', onResize); cleanupFns.push(() => window.removeEventListener('resize', onResize));

  /* ---------- estado animado ---------- */
  const S = { fade: 0, kpa: 101, bar: 0, amber: 0, lamp: 0, bolts: 0, unseal: 0, open: 0, rays: 0, sun: 0, interior: 1, cam: 0, fovAdd: 0, shake: 0, out: 1 };

  /* ---------- coreografía ---------- */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const status = $('.h-status'), kpa = $('.h-kpa'), bar = $('.h-bar b');
  const setStatus = t => () => { status.textContent = t; status.classList.remove('flash'); void status.offsetWidth; status.classList.add('flash'); };
  tl.to(S, { fade: 1, duration: 0.7, ease: 'power1.out' }, 0)
    .add(() => html.classList.add('intro-running'), 0.72)   // la cortina negra se retira cuando la escena ya cubre todo
    .to(box.querySelector('.intro-hud'), { opacity: 1, duration: 0.6 }, 0.35)
    .to(S, { amber: 1, duration: 0.4 }, 0.4)
    .to(S, { kpa: 0, bar: 0.55, duration: 1.4, ease: 'power1.inOut', onUpdate: () => { kpa.textContent = Math.round(S.kpa); bar.style.transform = `scaleX(${S.bar})`; } }, 0.55)
    .add(setStatus('Igualando presión'), 0.55)
    .to(S, { lamp: 1, duration: 0.18, ease: 'none' }, 1.95)
    .add(setStatus('Liberando cerrojos'), 1.95)
    .to(S, { bolts: 1, bar: 0.8, duration: 0.65, ease: 'power3.in', onUpdate: () => { bar.style.transform = `scaleX(${S.bar})`; } }, 2.05)
    .to(S, { shake: 0.012, duration: 0.08, yoyo: true, repeat: 5 }, 2.1)
    .to(S, { unseal: 1, duration: 0.32, ease: 'power4.out' }, 2.72)
    .add(() => burst(), 2.75)
    .to(S, { shake: 0.02, duration: 0.06, yoyo: true, repeat: 3 }, 2.74)
    .add(setStatus('Esclusa abierta'), 3.0)
    .to(S, { bar: 1, duration: 0.5, onUpdate: () => { bar.style.transform = `scaleX(${S.bar})`; } }, 3.0)
    .to(S, { open: 1, duration: 1.75, ease: 'power3.inOut' }, 3.0)
    .to(S, { rays: 1, sun: 1, duration: 1.2, ease: 'power2.out' }, 3.25)
    .to(S, { interior: 0.28, amber: 0.35, duration: 1.0 }, 3.15)
    .to(box.querySelector('.intro-hud'), { opacity: 0, duration: 0.6 }, 4.05)
    .to(S, { cam: 1, fovAdd: 14, duration: 2.0, ease: 'power2.inOut' }, 4.0)
    .add(() => window.dispatchEvent(new Event('intro:reveal')), 5.25)
    .to(S, { out: 0, duration: 0.75, ease: 'power1.inOut' }, 5.35)
    .add(() => done(), 6.12);

  function burst() {
    // el sello se rompe: chorros de vapor por toda la junta y el perímetro
    for (let i = 0; i < (small ? 70 : 150); i++) {
      const t = rand(); const k = Math.floor(t * (seam.length - 1)); const f = t * (seam.length - 1) - k;
      const x = seam[k][0] + (seam[k + 1][0] - seam[k][0]) * f, y = seam[k][1] + (seam[k + 1][1] - seam[k][1]) * f;
      emit(x, y, 0.02, (rand() - 0.5) * 1.6, (rand() - 0.5) * 0.6, 0.6 + rand() * 1.4, 0.18 + rand() * 0.22, 0.8 + rand() * 0.9);
    }
    for (let i = 0; i < (small ? 50 : 110); i++) {
      const a = rand() * Math.PI * 2;
      emit(Math.cos(a) * RH, Math.sin(a) * RH, 0.02, Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0.5 + rand(), 0.16 + rand() * 0.2, 0.7 + rand() * 0.8);
    }
  }

  /* ---------- bucle ---------- */
  let last = performance.now(), T = 0, raf = 0;
  const RED = new Color(0xff2a1a), GRN = new Color(0x7fd18a), TMPC = new Color();
  const shakeR = rng(5);
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    // hojas, cerrojos, sello
    const gap = S.open * (RO * 2 + 0.25);
    leafL.position.x = -gap / 2; leafR.position.x = gap / 2;
    door.position.z = -0.06 - S.unseal * 0.07;
    bolts.forEach((b, i) => { const st = MathUtils.clamp(S.bolts * 1.6 - i * 0.06, 0, 1); const rr = b.userData.r0 + st * 0.3; b.position.x = Math.cos(b.userData.a) * rr; b.position.y = Math.sin(b.userData.a) * rr; });
    // luces de estado: rojo -> verde salvia
    lamps.forEach(l => { const c = TMPC.copy(RED).lerp(GRN, S.lamp); l.mat.emissive.copy(c); l.sp.material.color.copy(c); l.pl.color.copy(c); });
    // balizas ámbar giratorias
    ambers.forEach((am, i) => { const p = Math.max(0, Math.sin(T * 7.5 + i * Math.PI)) ** 3 * S.amber; am.pl.intensity = p * 7; am.sp.material.opacity = p; am.capMat.emissiveIntensity = 0.4 + p * 6; });
    // el interior titila mientras se despresuriza
    const flick = S.open > 0.02 && S.open < 0.7 ? (0.75 + 0.25 * Math.sin(T * 61) * Math.sin(T * 23.7)) : 1;
    ceilLights.forEach(l => { l.intensity = 3 * S.interior * flick; });
    key.intensity = 38 * (0.45 + 0.55 * S.interior) * flick;
    stripMat.color.setRGB(0.85, 0.92, 1).multiplyScalar(2.2 * S.interior * flick);
    // exterior
    sunLight.intensity = 3.2 * S.sun * S.open; sunFill.intensity = 6 * S.sun * S.open;
    sun.material.opacity = 0.9 * S.sun * Math.min(1, S.open * 3); flare.material.opacity = 0.55 * S.sun * Math.min(1, S.open * 3);
    raysMat.uniforms.uI.value = 0.22 * S.rays * Math.min(1, S.open * 2.2); raysMat.uniforms.uT.value = T;
    rays.scale.x = Math.max(0.02, gap / (2 * R)) * 0.9;
    vapMat.uniforms.uWarm.value = S.sun * S.open * 0.7;
    // vapor que sigue saliendo por la abertura
    if (S.open > 0 && S.open < 0.92) {
      const n = small ? 3 : 6;
      for (let i = 0; i < n; i++) {
        const side = rand() < 0.5 ? -1 : 1, y = (rand() - 0.5) * 2 * R * 0.95;
        emit(side * gap / 2 * (0.9 + rand() * 0.1), y, 0.4 + rand() * 1.5, -side * 0.3 * rand(), (rand() - 0.5) * 0.3, -2.6 - rand() * 2, 0.22 + rand() * 0.3, 1.2 + rand());
      }
    }
    // simulación del vapor: la succión hacia el vacío crece con la apertura
    const pull = S.open * 6.5;
    for (let i = 0; i < NV; i++) {
      if (life[i] <= 0) { vAlpha[i] = 0; continue; }
      life[i] -= dt;
      const ix = i * 3;
      vel[ix + 2] -= pull * dt;                                     // hacia el exterior
      vel[ix] += (-vPos[ix] * 0.6 * S.open + (rand() - 0.5) * 1.4) * dt;
      vel[ix + 1] += (-vPos[ix + 1] * 0.6 * S.open + (rand() - 0.5) * 1.4 + 0.05) * dt;
      vel[ix] *= 0.985; vel[ix + 1] *= 0.985; vel[ix + 2] *= 0.992;
      vPos[ix] += vel[ix] * dt; vPos[ix + 1] += vel[ix + 1] * dt; vPos[ix + 2] += vel[ix + 2] * dt;
      vSize[i] += grow[i] * dt;
      vRot[i] += dt * 0.4;
      const k = life[i] / maxLife[i];
      vAlpha[i] = Math.min(1, (1 - k) * 6) * k * 0.42;
    }
    vapGeo.attributes.position.needsUpdate = true; vapGeo.attributes.aSize.needsUpdate = true;
    vapGeo.attributes.aAlpha.needsUpdate = true; vapGeo.attributes.aRot.needsUpdate = true;
    // polvo flotando en la luz, después aspirado hacia afuera
    for (let i = 0; i < ND; i++) {
      const ix = i * 3;
      dVel[ix] += ((rand() - 0.5) * 0.02 - dPos[ix] * 0.25 * S.open) * dt * 2;
      dVel[ix + 1] += ((rand() - 0.5) * 0.02 - dPos[ix + 1] * 0.25 * S.open) * dt * 2;
      dVel[ix + 2] += (-pull * 0.55) * dt;
      dVel[ix] *= 0.98; dVel[ix + 1] *= 0.98; dVel[ix + 2] *= 0.99;
      dPos[ix] += dVel[ix] * dt; dPos[ix + 1] += dVel[ix + 1] * dt; dPos[ix + 2] += dVel[ix + 2] * dt + Math.sin(T + i) * 0.0006;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dustMat.uniforms.uA.value = 0.5 * (0.4 + 0.6 * S.interior) + S.rays * 0.4;
    // cámara: respiración, temblor y el paso a través de la compuerta
    const sh = S.shake;
    camera.position.set(
      Math.sin(T * 0.7) * 0.03 + (shakeR() - 0.5) * sh * 2,
      Math.sin(T * 0.53) * 0.02 + (shakeR() - 0.5) * sh * 2,
      MathUtils.lerp(baseZ, -1.6, S.cam)
    );
    camera.fov = baseFov + S.fovAdd; camera.updateProjectionMatrix();
    camera.lookAt(0, 0, -4);
    cvs.style.opacity = String(S.fade * S.out);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  /* ---------- arranque y cierre ---------- */
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(t => { last = t; tick(t); });
  tl.play(0);
  const watchdog = setTimeout(() => skip(), 12000);   // red de seguridad para equipos muy lentos
  cleanupFns.push(() => clearTimeout(watchdog));
  try { localStorage.setItem('rb-intro', '1'); } catch (e) { /* nada */ }

  const skipBtn = $('.intro-skip');
  skipBtn.addEventListener('click', skip);
  setTimeout(() => { try { skipBtn.focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 400);

  let ended = false;
  function skip() {
    if (ended) return;
    tl.pause();
    gsap.to(S, { out: 0, duration: 0.45, ease: 'power1.out', onComplete: done });
    setTimeout(done, 900);   // en equipos lentos, cierra igual aunque la animación se demore
    gsap.to(box.querySelector('.intro-hud'), { opacity: 0, duration: 0.3 });
    window.dispatchEvent(new Event('intro:reveal'));
  }
  function done() {
    if (ended) return; ended = true;
    cancelAnimationFrame(raf);
    tl.kill();
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => { Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); }); if (m.uniforms) Object.values(m.uniforms).forEach(u => u.value && u.value.isTexture && u.value.dispose()); m.dispose(); });
    });
    if (scene.environment) scene.environment.dispose();
    renderer.dispose(); renderer.forceContextLoss();
    finish(false);
  }

  if (DEBUG) window.__intro = { tl, S, scene, camera, renderer, seek: t => { tl.pause(); tl.seek(t); } };
}

// arranque (al final: así todo lo anterior ya está declarado)
if (html.classList.contains('intro-pending')) start().catch(err => { console.warn('[intro]', err); finish(true); });
