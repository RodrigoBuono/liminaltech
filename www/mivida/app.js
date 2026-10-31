/* Mi vida — plataforma personal de Rodrigo.
   Mapa estilo Miro (de lo abstracto a lo concreto) + cursos (CRM) + hábitos + documentos.
   Todo vive en un único documento privado en Supabase: solo se lee y se escribe con la clave. */
(() => {
  'use strict';

  /* ================= configuración ================= */
  const API = 'https://qjnojndyeddvvokltbxv.supabase.co/rest/v1/rpc/';
  const KEY = 'sb_publishable_dBupScA3MM7zghHUnHU6xA_WQQ_aHRw';
  const LEVELS = ['Esencia', 'Dimensiones', 'Intereses y ámbitos', 'Hábitos y prácticas', 'Acciones concretas'];
  const LEVEL_COLORS = ['#8fd14f', '#1b1b1d', '#4a4d53', '#a9cf9b', '#c9ccd2'];
  const BANDS = [520, 1060, 2000, 2420, 3150];          // radios que separan los niveles en el mapa
  const KINDS = { core: 'Centro', area: 'Dimensión', topic: 'Idea / ámbito', habit: 'Hábito', course: 'Curso', doc: 'Documento', note: 'Nota' };
  const KIND_LEVEL = { core: 0, area: 1, topic: 2, habit: 3, course: 4, doc: 3 };
  const SIZE = { core: [330, 150], area: [210, 68], topic: [178, 54], habit: [196, 60], course: [196, 60], doc: [210, 64], note: [260, 120] };
  const STATUSES = ['Por hacer', 'Investigando', 'Inscripto', 'En curso', 'Hecho'];
  const STATUS_COLOR = { 'Por hacer': '#c9ccd2', 'Investigando': '#d9a22b', 'Inscripto': '#8a63d2', 'En curso': '#4262ff', 'Hecho': '#3f9a5a' };
  const PRIORITIES = ['Alta', 'Media', 'Baja'];
  const SWATCHES = ['', '#1b1b1d', '#8fd14f', '#4262ff', '#d64545', '#e8a33d', '#8a63d2', '#ffffff', '#fff3a1'];
  const BLOCK_TYPES = { h1: 'Título', h2: 'Subtítulo', h3: 'Sección', p: 'Texto', item: 'Tarea', aff: 'Afirmación' };

  /* ================= utilidades ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const icon = {
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5 9-10"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 11 15.7 7M8.3 13l7.4 4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h12l-3-3M17 17H5l3 3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* lleno o bloqueado */ } },
    del(k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) { /* nada */ } },
  };

  /* ================= servidor ================= */
  async function rpc(fn, args) {
    const r = await fetch(API + fn, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args), cache: 'no-store' });
    const t = await r.text(); let j = null;
    try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
    if (!r.ok) {
      const err = new Error((j && j.message) || ('Error ' + r.status));
      err.session = r.status === 401 || (j && (j.code === '28000' || /sesion/.test(j.message || '')));
      throw err;
    }
    return j;
  }
  let token = null, remember = true;
  function loadToken() {
    try { token = localStorage.getItem('mv-token') || sessionStorage.getItem('mv-token'); remember = !!localStorage.getItem('mv-token'); } catch (e) { token = null; }
  }
  function saveToken(t, rem) {
    token = t; remember = rem;
    try { (rem ? localStorage : sessionStorage).setItem('mv-token', t); } catch (e) { /* nada */ }
  }

  /* ================= documento ================= */
  let doc = null, rev = 0, idx = new Map();
  function normalize(d) {
    d = d && typeof d === 'object' ? d : {};
    d.v = 1;
    d.levels = Array.isArray(d.levels) && d.levels.length === 5 ? d.levels : LEVELS.slice();
    d.nodes = (Array.isArray(d.nodes) ? d.nodes : []).filter(n => n && n.id);
    d.edges = (Array.isArray(d.edges) ? d.edges : []).filter(e => e && e.from && e.to);
    d.docs = Array.isArray(d.docs) ? d.docs : [];
    for (const n of d.nodes) {
      if (!SIZE[n.kind]) n.kind = 'topic';
      const [w, h] = SIZE[n.kind];
      n.w = +n.w || w; n.h = +n.h || h; n.x = +n.x || 0; n.y = +n.y || 0;
      n.text = String(n.text ?? '');
      if (n.level == null && n.kind !== 'note') n.level = KIND_LEVEL[n.kind] ?? 2;
      if (n.kind === 'course') n.course = Object.assign({ status: 'Por hacer', priority: 'Media', where: '', cost: '', start: '', notes: '' }, n.course || {});
      if (n.kind === 'habit') { n.habit = Object.assign({ freq: 'Diario' }, n.habit || {}); n.habit.checks = n.habit.checks || {}; }
    }
    if (!d.nodes.some(n => n.kind === 'core')) d.nodes.unshift({ id: 'n1', text: 'MI EQUILIBRIO VITAL', kind: 'core', level: 0, x: -165, y: -75, w: 330, h: 150 });
    for (const dd of d.docs) {
      dd.id = dd.id || uid('d'); dd.title = dd.title || 'Documento'; dd.blocks = Array.isArray(dd.blocks) ? dd.blocks : [];
      for (const b of dd.blocks) { b.id = b.id || uid('b'); b.t = BLOCK_TYPES[b.t] ? b.t : 'p'; b.text = String(b.text ?? ''); }
    }
    return d;
  }
  function reindex() { idx = new Map(doc.nodes.map(n => [n.id, n])); }
  const N = id => idx.get(id);
  const core = () => doc.nodes.find(n => n.kind === 'core');
  const center = n => [n.x + (sizes.get(n.id)?.[0] ?? n.w) / 2, n.y + (sizes.get(n.id)?.[1] ?? n.h) / 2];
  const incoming = id => doc.edges.filter(e => e.to === id);
  const outgoing = id => doc.edges.filter(e => e.from === id);
  function parentOf(id) {
    const ins = incoming(id).map(e => N(e.from)).filter(Boolean);
    return ins.find(n => !['course', 'habit', 'note'].includes(n.kind)) || ins[0] || null;
  }
  function areaOf(n) {
    const seen = new Set(); let cur = n;
    while (cur && !seen.has(cur.id)) {
      if (cur.kind === 'area' || cur.kind === 'core') return cur;
      seen.add(cur.id); cur = parentOf(cur.id);
    }
    return null;
  }
  function descendants(id) {
    const out = new Set(), st = [id];
    while (st.length) { const c = st.pop(); for (const e of outgoing(c)) if (!out.has(e.to) && e.to !== id) { out.add(e.to); st.push(e.to); } }
    return [...out].map(N).filter(Boolean);
  }

  /* ================= deshacer / guardar ================= */
  const undoStack = [], redoStack = [];
  const snap = () => JSON.stringify(doc);
  function change(fn, opts = {}) {
    const before = snap();
    fn();
    if (snap() === before) return;
    undoStack.push(before); if (undoStack.length > 120) undoStack.shift();
    redoStack.length = 0;
    reindex(); markDirty();
    if (!opts.silent) renderAll();
  }
  function pushUndo(before) { undoStack.push(before); if (undoStack.length > 120) undoStack.shift(); redoStack.length = 0; }
  function undo() { if (!undoStack.length) return toast('No hay nada para deshacer'); redoStack.push(snap()); doc = normalize(JSON.parse(undoStack.pop())); reindex(); sel.clear(); selEdge = null; markDirty(); renderAll(); }
  function redo() { if (!redoStack.length) return; undoStack.push(snap()); doc = normalize(JSON.parse(redoStack.pop())); reindex(); markDirty(); renderAll(); }

  let dirty = false, saving = false, saveTimer = 0, pendingSave = false;
  function backup() { if (remember) store.set('mv-backup', { rev, dirty, at: Date.now(), doc }); }
  function markDirty() { dirty = true; setStatus('saving', 'Guardando…'); backup(); clearTimeout(saveTimer); saveTimer = setTimeout(save, 900); }
  async function save() {
    if (!dirty || !token) return;
    if (saving) { pendingSave = true; return; }
    saving = true; dirty = false; let delay = 600;
    try {
      const r = await rpc('mv_save', { p_token: token, p_data: doc, p_base_rev: rev });
      if (r && r.ok) { rev = r.rev; if (!dirty) { setStatus('ok', 'Guardado'); backup(); } }
      else if (r) { await conflict(r); }
    } catch (e) {
      dirty = true;
      if (e.session) { delay = null; setStatus('error', 'Sesión vencida'); showLogin('Tu sesión venció. Volvé a entrar: tus cambios quedan a salvo en este dispositivo.'); }
      else { delay = 5000; setStatus('error', 'Sin conexión · reintentando'); }
    } finally {
      saving = false;
      if ((dirty || pendingSave) && delay != null) { pendingSave = false; clearTimeout(saveTimer); saveTimer = setTimeout(save, delay); }
    }
  }
  async function conflict(r) {
    const when = r.updated_at ? new Date(r.updated_at).toLocaleString('es-AR') : '';
    const keepServer = await ask('Hay una versión más nueva', `Este espacio se modificó desde otro dispositivo (${esc(when)}). ¿Con cuál te quedás?`,
      [['Quedarme con la de este dispositivo', false], ['Traer la más nueva', true, 'primary']]);
    if (keepServer) { doc = normalize(r.data); rev = r.rev; reindex(); renderAll(); setStatus('ok', 'Actualizado'); backup(); }
    else { rev = r.rev; dirty = true; saveTimer = setTimeout(save, 100); }
  }
  addEventListener('beforeunload', e => { if (dirty || saving) { e.preventDefault(); e.returnValue = ''; } });

  /* ================= interfaz general ================= */
  const statusEl = $('#status');
  function setStatus(kind, txt) { statusEl.className = 'status ' + (kind === 'ok' ? '' : kind); statusEl.querySelector('span').textContent = txt; }
  let toastT = 0;
  function toast(msg, action) {
    const t = $('#toast'); t.innerHTML = `<span>${esc(msg)}</span>`;
    if (action) { const b = document.createElement('button'); b.textContent = action[0]; b.onclick = () => { t.hidden = true; action[1](); }; t.appendChild(b); }
    t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, action ? 6000 : 2600);
  }
  // diálogo genérico: devuelve el valor del botón elegido
  function ask(title, html, buttons, onOpen) {
    const d = $('#dlg');
    d.querySelector('.dh').textContent = title; d.querySelector('.db').innerHTML = html;
    const f = d.querySelector('.df'); f.innerHTML = '';
    return new Promise(res => {
      buttons.forEach(([label, val, style]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + (style === 'primary' ? '' : style === 'danger' ? 'danger' : 'ghost'); b.textContent = label;
        b.onclick = () => { const v = typeof val === 'function' ? val(d) : val; if (v === undefined) return; d.onclose = null; d.close(); res(v); };
        f.appendChild(b);
      });
      d.onclose = () => res(null);
      d.showModal(); if (onOpen) onOpen(d);
    });
  }

  let view = 'map';
  function setView(v) {
    view = v;
    $$('nav.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.view === v));
    $$('main .view').forEach(s => { s.hidden = s.id !== 'v-' + v; });
    store.set('mv-tab', v);
    renderAll();
  }
  $$('nav.tabs button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  function renderAll() {
    if (!doc) return;
    if (view === 'map') renderMap();
    else if (view === 'courses') renderCourses();
    else if (view === 'habits') renderHabits();
    else if (view === 'docs') renderDocs();
  }

  /* ================= MAPA ================= */
  const board = $('#board'), world = $('#world'), nodesEl = $('#nodes'), eg = $('#eg'), tmpEdge = $('#tmpEdge');
  const sel = new Set(); let selEdge = null, editing = null;
  const sizes = new Map(), els = new Map();
  let V = Object.assign({ x: 0, y: 0, z: 0.35 }, store.get('mv-view') || {});
  let layers = Object.assign({ rings: true, course: true, habit: true, note: true, doc: true }, store.get('mv-layers') || {});
  let inspectorOpen = false, firstMap = true;

  function applyView() {
    world.style.transform = `translate(${V.x}px,${V.y}px) scale(${V.z})`;
    const g = 24 * V.z; board.style.backgroundSize = `${g}px ${g}px`; board.style.backgroundPosition = `${V.x}px ${V.y}px`;
    $('#zoomlbl').textContent = Math.round(V.z * 100) + '%';
    clearTimeout(applyView.t); applyView.t = setTimeout(() => store.set('mv-view', V), 400);
    placeFloatbar(); drawMinimap();
  }
  function zoomAt(f, sx, sy) {
    const z = clamp(V.z * f, 0.06, 2.6); const k = z / V.z;
    V.x = sx - (sx - V.x) * k; V.y = sy - (sy - V.y) * k; V.z = z; applyView();
  }
  const toWorld = (sx, sy) => { const r = board.getBoundingClientRect(); return [(sx - r.left - V.x) / V.z, (sy - r.top - V.y) / V.z]; };
  function visibleNodes() { return doc.nodes.filter(n => layers[n.kind] !== false); }
  function fit(nodes = visibleNodes(), pad = 0.9) {
    if (!nodes.length) return;
    const r = board.getBoundingClientRect();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of nodes) { const [w, h] = sizes.get(n.id) || [n.w, n.h]; x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x + w); y1 = Math.max(y1, n.y + h); }
    const z = clamp(Math.min(r.width / (x1 - x0 + 80), r.height / (y1 - y0 + 80)) * pad, 0.06, 1.4);
    V.z = z; V.x = r.width / 2 - (x0 + x1) / 2 * z; V.y = r.height / 2 - (y0 + y1) / 2 * z; applyView();
  }
  function focusNode(id, flash = true) {
    const n = N(id); if (!n) return;
    if (view !== 'map') setView('map');
    if (layers[n.kind] === false) { layers[n.kind] = true; store.set('mv-layers', layers); renderMap(); }
    const r = board.getBoundingClientRect(); const [cx, cy] = center(n);
    V.z = Math.max(V.z, 0.75); V.x = r.width / 2 - cx * V.z; V.y = r.height / 2 - cy * V.z; applyView();
    sel.clear(); sel.add(id); selEdge = null; paintSelection();
    if (flash) { const el = els.get(id); if (el) { el.classList.remove('hit-flash'); void el.offsetWidth; el.classList.add('hit-flash'); } }
  }

  function textColorFor(bg) {
    const m = /^#?([0-9a-f]{6})$/i.exec(bg || ''); if (!m) return null;
    const v = parseInt(m[1], 16), r = v >> 16, g = (v >> 8) & 255, b = v & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1b1b1d' : '#ffffff';
  }
  function nodeEl(n) {
    const el = document.createElement('div');
    el.className = 'node k-' + n.kind; el.dataset.id = n.id;
    if (n.kind === 'course') { el.classList.add('s-' + slug(n.course.status)); if (n.course.priority === 'Alta') el.classList.add('p-alta'); }
    if (n.kind === 'habit' && n.habit.checks[dayKey()]) el.classList.add('today');
    el.style.cssText = `left:${n.x}px;top:${n.y}px;width:${n.w}px;min-height:${n.h}px`;
    if (n.color) { el.style.background = n.color; const tc = textColorFor(n.color); if (tc) el.style.color = tc; el.style.borderColor = 'rgba(0,0,0,.18)'; }
    if (n.fs) el.style.fontSize = n.fs + 'px';
    let inner = `<div class="t">${esc(n.text)}</div>`;
    if (n.kind === 'habit') inner = `<span class="chk" title="Hecho hoy"></span>` + inner;
    if (n.kind === 'course') inner += `<span class="pill">${esc(n.course.status)}</span>`;
    inner += '<span class="h n" data-side="n"></span><span class="h e" data-side="e"></span><span class="h s" data-side="s"></span><span class="h w" data-side="w"></span><span class="rz"></span>';
    el.innerHTML = inner;
    if (n.note) el.title = n.note;
    return el;
  }
  function renderMap() {
    reindex();
    board.classList.toggle('hide-rings', !layers.rings);
    for (const k of ['course', 'habit', 'note', 'doc']) board.classList.toggle('layer-off-' + k, !layers[k]);
    nodesEl.innerHTML = ''; els.clear();
    const frag = document.createDocumentFragment();
    for (const n of doc.nodes) { const el = nodeEl(n); els.set(n.id, el); frag.appendChild(el); }
    nodesEl.appendChild(frag);
    sizes.clear();
    for (const n of doc.nodes) { const el = els.get(n.id); sizes.set(n.id, [el.offsetWidth || n.w, el.offsetHeight || n.h]); }
    drawRings(); drawEdges(); paintSelection(); renderLegend(); renderLayers(); renderHint();
    // primera vista: el centro y las dimensiones (lo más legible); el resto se ve alejando
    if (firstMap) { firstMap = false; if (!store.get('mv-view')) fit(doc.nodes.filter(n => n.level != null && n.level <= 1), 0.72); else applyView(); } else applyView();
    if (inspectorOpen) renderInspector();
  }
  function drawRings() {
    const svg = $('#rings'); const c = core(); if (!c) return;
    const [cx, cy] = center(c);
    let h = '';
    const fills = ['rgba(143,209,79,.07)', 'rgba(27,27,29,.035)', 'rgba(27,27,29,.018)', 'rgba(143,172,130,.06)', 'rgba(66,98,255,.025)'];
    for (let i = BANDS.length - 1; i >= 0; i--) h += `<circle cx="${cx}" cy="${cy}" r="${BANDS[i]}" style="fill:${fills[i]}"/>`;
    doc.levels.forEach((name, i) => {
      if (i === 0) return;
      const r = BANDS[i] - 46;
      h += `<text x="${cx}" y="${cy - r}" text-anchor="middle">${i} · ${esc(name)}</text>`;
    });
    svg.innerHTML = h;
  }
  function anchors(a, b) {
    const [aw, ah] = sizes.get(a.id) || [a.w, a.h], [bw, bh] = sizes.get(b.id) || [b.w, b.h];
    const ax = a.x + aw / 2, ay = a.y + ah / 2, bx = b.x + bw / 2, by = b.y + bh / 2;
    const dx = bx - ax, dy = by - ay;
    let p1, p2, d1, d2;
    if (Math.abs(dx) * (ah + bh) > Math.abs(dy) * (aw + bw)) {
      const s = Math.sign(dx) || 1; p1 = [ax + s * aw / 2, ay]; p2 = [bx - s * bw / 2, by]; d1 = [s, 0]; d2 = [-s, 0];
    } else {
      const s = Math.sign(dy) || 1; p1 = [ax, ay + s * ah / 2]; p2 = [bx, by - s * bh / 2]; d1 = [0, s]; d2 = [0, -s];
    }
    return { p1, p2, d1, d2 };
  }
  function edgePath(e) {
    const a = N(e.from), b = N(e.to); if (!a || !b) return '';
    const { p1, p2, d1, d2 } = anchors(a, b);
    if (e.style === 'straight') return `M${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`;
    const k = Math.max(40, Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 0.4);
    return `M${p1[0]},${p1[1]} C${p1[0] + d1[0] * k},${p1[1] + d1[1] * k} ${p2[0] + d2[0] * k},${p2[1] + d2[1] * k} ${p2[0]},${p2[1]}`;
  }
  function edgeVisible(e) { const a = N(e.from), b = N(e.to); return a && b && layers[a.kind] !== false && layers[b.kind] !== false; }
  function drawEdges() {
    let h = '';
    for (const e of doc.edges) {
      if (!edgeVisible(e)) continue;
      const d = edgePath(e); if (!d) continue;
      const on = selEdge === e.id;
      h += `<g data-edge="${esc(e.id)}"${on ? ' class="sel"' : ''}><path class="hit" d="${d}"/><path class="e${e.dash ? ' dash' : ''}" d="${d}"${e.noArrow ? '' : ` marker-end="url(#${on ? 'arrSel' : 'arr'})"`}/></g>`;
    }
    eg.innerHTML = h;
  }
  function updateEdgesFor(ids) {
    const set = new Set(ids);
    for (const e of doc.edges) {
      if (!set.has(e.from) && !set.has(e.to)) continue;
      const g = eg.querySelector(`g[data-edge="${CSS.escape(e.id)}"]`); if (!g) continue;
      const d = edgePath(e); g.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
    }
  }
  function paintSelection() {
    for (const [id, el] of els) el.classList.toggle('sel', sel.has(id));
    $$('#eg g').forEach(g => g.classList.toggle('sel', g.dataset.edge === selEdge));
    placeFloatbar();
    if (inspectorOpen) renderInspector();
  }
  function renderLegend() {
    $('#legend').innerHTML = `<b>De lo abstracto a lo concreto</b>` + doc.levels.map((l, i) =>
      `<span><i style="background:${LEVEL_COLORS[i]};${i === 4 ? 'border:1px solid #9a9da3;' : ''}"></i>${i} · ${esc(l)}</span>`).join('') + `<div class="arrow">centro → afuera</div>`;
  }
  function renderLayers() {
    const items = [['rings', 'Niveles'], ['course', 'Cursos'], ['habit', 'Hábitos'], ['doc', 'Documentos'], ['note', 'Notas']];
    $('#layerdock').innerHTML = items.map(([k, l]) => `<button data-layer="${k}" aria-pressed="${layers[k] !== false}">${l}</button>`).join('')
      + `<button data-add="topic" title="Agregar una idea en el centro de la vista">${icon.plus}<span class="lbl">Idea</span></button><button data-add="note" title="Agregar una nota">${icon.plus}<span class="lbl">Nota</span></button>`;
  }
  $('#layerdock').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.layer) { layers[b.dataset.layer] = !(layers[b.dataset.layer] !== false); store.set('mv-layers', layers); renderMap(); }
    if (b.dataset.add) { const r = board.getBoundingClientRect(); const [x, y] = toWorld(r.left + r.width / 2, r.top + r.height / 2); createNodeAt(x, y, b.dataset.add); }
  });
  function renderHint() {
    const h = $('#hint');
    if (store.get('mv-hint-off')) { h.hidden = true; return; }
    h.hidden = false;
    h.innerHTML = `<b>Cómo se usa</b><br>Doble clic en el fondo: crear · Doble clic en un cuadro: escribir<br>Arrastrá los puntos azules para conectar (o soltalos en el vacío para crear)<br>Rueda o pellizco: zoom · Arrastrar el fondo: moverte · Shift + arrastrar: seleccionar varios<br>Tab: crear hijo · Supr: borrar · Ctrl+Z: deshacer<br><button type="button">Ocultar ayuda</button>`;
    h.querySelector('button').onclick = () => { store.set('mv-hint-off', true); h.hidden = true; };
  }

  /* ---------- barra flotante ---------- */
  let floatbar = null;
  function placeFloatbar() {
    if (floatbar) { floatbar.remove(); floatbar = null; }
    if (view !== 'map' || editing || dragState) return;
    let x, y;
    if (sel.size) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity;
      for (const id of sel) { const n = N(id); if (!n) continue; const [w] = sizes.get(id) || [n.w]; x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x + w); y0 = Math.min(y0, n.y); }
      if (x0 === Infinity) return;
      x = V.x + (x0 + x1) / 2 * V.z; y = V.y + y0 * V.z - 12;
    } else if (selEdge) {
      const g = eg.querySelector(`g[data-edge="${CSS.escape(selEdge)}"] .e`); if (!g) return;
      const L = g.getTotalLength(), p = g.getPointAtLength(L / 2); x = V.x + p.x * V.z; y = V.y + p.y * V.z - 14;
    } else return;
    floatbar = document.createElement('div'); floatbar.className = 'floatbar';
    floatbar.innerHTML = sel.size ? nodeBarHTML() : edgeBarHTML();
    $('#v-map').appendChild(floatbar);
    const bw = floatbar.offsetWidth, bh = floatbar.offsetHeight, W = board.clientWidth;
    floatbar.style.left = clamp(x, bw / 2 + 8, W - bw / 2 - 8) + 'px';
    floatbar.style.top = Math.max(bh + 8, y) + 'px';
    wireFloatbar();
  }
  function nodeBarHTML() {
    const one = sel.size === 1 ? N([...sel][0]) : null;
    let h = '';
    if (one) {
      const kinds = Object.entries(KINDS).filter(([k]) => k !== 'core' || one.kind === 'core');
      h += `<select data-f="kind" aria-label="Tipo">${kinds.map(([k, l]) => `<option value="${k}"${k === one.kind ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
      if (one.kind !== 'note') h += `<select data-f="level" aria-label="Nivel">${doc.levels.map((l, i) => `<option value="${i}"${i === one.level ? ' selected' : ''}>${i} · ${esc(l)}</option>`).join('')}</select>`;
      h += '<span class="sep"></span>';
    }
    h += SWATCHES.map(c => `<button class="sw" data-color="${c}" title="${c ? 'Color' : 'Color original'}" style="background:${c || 'conic-gradient(#1b1b1d 0 25%,#8fd14f 0 50%,#fff 0 75%,#a9cf9b 0)'}"></button>`).join('');
    h += `<span class="sep"></span><button data-f="fs-" title="Texto más chico">A−</button><button data-f="fs+" title="Texto más grande">A+</button>`;
    if (one) h += `<span class="sep"></span><button data-f="child" title="Crear un cuadro hijo (Tab)">${icon.plus}Hijo</button><button data-f="card" title="Abrir la ficha">${icon.card}Ficha</button>`;
    if (one && one.kind === 'doc') h += `<button data-f="opendoc">Abrir</button>`;
    h += `<span class="sep"></span><button data-f="del" title="Borrar (Supr)">${icon.trash}</button>`;
    return h;
  }
  function edgeBarHTML() {
    const e = doc.edges.find(x => x.id === selEdge); if (!e) return '';
    return `<button data-f="estyle">${e.style === 'straight' ? 'Recta' : 'Curva'}</button><button data-f="edash">${e.dash ? 'Punteada' : 'Continua'}</button><button data-f="earrow">${e.noArrow ? 'Sin flecha' : 'Con flecha'}</button><button data-f="eflip" title="Invertir">${icon.swap}</button><span class="sep"></span><button data-f="edel" title="Borrar conexión">${icon.trash}</button>`;
  }
  function wireFloatbar() {
    floatbar.addEventListener('pointerdown', e => e.stopPropagation());
    floatbar.addEventListener('change', e => {
      const f = e.target.dataset.f, one = N([...sel][0]); if (!one) return;
      if (f === 'kind') change(() => setKind(one, e.target.value));
      if (f === 'level') change(() => { one.level = +e.target.value; });
    });
    floatbar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const f = b.dataset.f;
      if (b.dataset.color !== undefined) return change(() => { for (const id of sel) { const n = N(id); if (b.dataset.color) n.color = b.dataset.color; else delete n.color; } });
      if (f === 'fs-' || f === 'fs+') return change(() => { for (const id of sel) { const n = N(id); const base = n.fs || parseFloat(getComputedStyle(els.get(id)).fontSize); n.fs = clamp(Math.round(base + (f === 'fs+' ? 2 : -2)), 8, 72); } });
      if (f === 'child') return addChild([...sel][0]);
      if (f === 'card') { inspectorOpen = true; return renderInspector(); }
      if (f === 'opendoc') return openDoc(N([...sel][0]).doc);
      if (f === 'del') return deleteSelection();
      const ed = doc.edges.find(x => x.id === selEdge); if (!ed) return;
      if (f === 'estyle') change(() => { ed.style = ed.style === 'straight' ? 'curve' : 'straight'; });
      if (f === 'edash') change(() => { ed.dash = !ed.dash; });
      if (f === 'earrow') change(() => { ed.noArrow = !ed.noArrow; });
      if (f === 'eflip') change(() => { [ed.from, ed.to] = [ed.to, ed.from]; });
      if (f === 'edel') return deleteSelection();
    });
  }
  function setKind(n, k) {
    n.kind = k;
    const [w, h] = SIZE[k]; n.w = Math.max(n.w, w); n.h = h;
    if (k === 'note') delete n.level; else n.level = KIND_LEVEL[k] ?? n.level ?? 2;
    if (k === 'course') n.course = Object.assign({ status: 'Por hacer', priority: 'Media', where: '', cost: '', start: '', notes: '' }, n.course || {});
    if (k === 'habit') { n.habit = Object.assign({ freq: 'Diario', checks: {} }, n.habit || {}); }
    if (k === 'doc' && !n.doc) { const d = { id: uid('d'), title: n.text || 'Documento', blocks: [{ id: uid('b'), t: 'p', text: '' }] }; doc.docs.push(d); n.doc = d.id; }
  }

  /* ---------- crear / borrar ---------- */
  function levelForPoint(x, y) {
    const c = core(); if (!c) return 2; const [cx, cy] = center(c); const r = Math.hypot(x - cx, y - cy);
    const i = BANDS.findIndex(b => r < b); return i < 0 ? 4 : i;
  }
  function freeSpot(x, y, w, h, dir = [0, 1]) {
    const hits = (px, py) => doc.nodes.some(n => { const [nw, nh] = sizes.get(n.id) || [n.w, n.h]; return px < n.x + nw + 16 && n.x < px + w + 16 && py < n.y + nh + 16 && n.y < py + h + 16; });
    const perp = [-dir[1], dir[0]];
    for (let i = 0; i < 40; i++) {
      const k = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.abs(perp[0]) > Math.abs(perp[1]) ? w + 24 : h + 24);
      const px = x + perp[0] * k, py = y + perp[1] * k;
      if (!hits(px, py)) return [Math.round(px), Math.round(py)];
    }
    return [Math.round(x), Math.round(y)];
  }
  function placeNear(parent, kind) {
    const [w, h] = SIZE[kind]; const c = core();
    const [px, py] = center(parent); const [cx, cy] = c ? center(c) : [0, 0];
    let dx = px - cx, dy = py - cy; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    if (parent.kind === 'core') { const a = Math.random() * Math.PI * 2; dx = Math.cos(a); dy = Math.sin(a); }
    const dist = parent.kind === 'core' ? 520 : 300;
    return freeSpot(px + dx * dist - w / 2, py + dy * dist - h / 2, w, h, [dx, dy]);
  }
  function newNode(kind, text, x, y, extra = {}) {
    const [w, h] = SIZE[kind];
    const n = Object.assign({ id: uid('n'), text, kind, x: Math.round(x), y: Math.round(y), w, h }, extra);
    if (kind !== 'note' && n.level == null) n.level = KIND_LEVEL[kind] ?? 2;
    if (kind === 'course') n.course = Object.assign({ status: 'Por hacer', priority: 'Media', where: '', cost: '', start: '', notes: '' }, extra.course || {});
    if (kind === 'habit') n.habit = Object.assign({ freq: 'Diario', checks: {} }, extra.habit || {});
    doc.nodes.push(n); return n;
  }
  function createNodeAt(x, y, kind = 'topic', fromId = null) {
    let n;
    change(() => {
      const [w, h] = SIZE[kind];
      const from = fromId ? N(fromId) : null;
      const level = from && from.level != null ? Math.min(4, from.level + 1) : levelForPoint(x, y);
      n = newNode(kind, kind === 'note' ? '' : 'Nueva idea', x - w / 2, y - h / 2, { level: kind === 'note' ? undefined : level });
      if (kind === 'note') delete n.level;
      if (fromId) doc.edges.push({ id: uid('e'), from: fromId, to: n.id });
    });
    sel.clear(); sel.add(n.id); paintSelection(); startEdit(n.id, true);
    return n;
  }
  function addChild(pid) {
    const p = N(pid); if (!p) return;
    const lvl = Math.min(4, (p.level ?? 1) + 1);
    const kind = p.kind === 'core' ? 'area' : 'topic';
    let n;
    change(() => {
      const [x, y] = placeNear(p, kind);
      n = newNode(kind, 'Nueva idea', x, y, { level: lvl });
      doc.edges.push({ id: uid('e'), from: pid, to: n.id });
    });
    sel.clear(); sel.add(n.id); paintSelection(); startEdit(n.id, true);
  }
  async function deleteSelection() {
    if (selEdge && !sel.size) { change(() => { doc.edges = doc.edges.filter(e => e.id !== selEdge); }); selEdge = null; return; }
    if (!sel.size) return;
    const ids = new Set(sel);
    if ([...ids].some(id => N(id)?.kind === 'core')) return toast('El centro no se puede borrar');
    change(() => {
      doc.nodes = doc.nodes.filter(n => !ids.has(n.id));
      doc.edges = doc.edges.filter(e => !ids.has(e.from) && !ids.has(e.to));
    });
    sel.clear(); paintSelection();
    toast(ids.size === 1 ? 'Cuadro borrado' : `${ids.size} cuadros borrados`, ['Deshacer', undo]);
  }

  /* ---------- edición de texto en el cuadro ---------- */
  function startEdit(id, selectAll = false) {
    const el = els.get(id), n = N(id); if (!el || !n) return;
    editing = id; placeFloatbar();
    const t = el.querySelector('.t');
    el.classList.add('editing');
    try { t.contentEditable = 'plaintext-only'; } catch (e) { /* navegador sin soporte */ }
    if (t.contentEditable !== 'plaintext-only') t.contentEditable = 'true';
    t.focus();
    const r = document.createRange(); r.selectNodeContents(t); if (!selectAll) r.collapse(false);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const before = snap();
    const finish = (cancel) => {
      t.removeEventListener('blur', onBlur); t.removeEventListener('keydown', onKey); t.removeEventListener('paste', onPaste);
      t.contentEditable = 'false'; el.classList.remove('editing'); editing = null;
      const txt = t.innerText.replace(/\n{3,}/g, '\n\n').trim();
      if (!cancel && txt !== n.text) { n.text = txt; pushUndo(before); reindex(); markDirty(); }
      t.textContent = n.text;
      sizes.set(id, [el.offsetWidth, el.offsetHeight]); updateEdgesFor([id]); placeFloatbar(); drawMinimap();
      if (inspectorOpen) renderInspector();
      board.focus({ preventScroll: true });
    };
    const onBlur = () => finish(false);
    const onKey = e => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); t.textContent = n.text; finish(true); }
      if (e.key === 'Enter' && (n.kind !== 'note' ? !e.shiftKey : (e.ctrlKey || e.metaKey))) { e.preventDefault(); finish(false); }
    };
    const onPaste = e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); };
    t.addEventListener('blur', onBlur); t.addEventListener('keydown', onKey); t.addEventListener('paste', onPaste);
  }

  /* ---------- puntero: mover, conectar, redimensionar, paneo, zoom ---------- */
  let dragState = null; const pointers = new Map(); let lastTap = { t: 0, x: 0, y: 0 };
  board.addEventListener('pointerdown', e => {
    if (e.target.closest('.floatbar')) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) { // pellizco
      const [a, b] = [...pointers.values()];
      dragState = { type: 'pinch', d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      return;
    }
    if (e.button === 2) return;
    const nodeE = e.target.closest('.node'), id = nodeE?.dataset.id;
    if (editing && id === editing) return;
    board.setPointerCapture(e.pointerId);
    // doble toque (pantallas táctiles)
    const now = Date.now(), dbl = e.pointerType !== 'mouse' && now - lastTap.t < 330 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 24;
    lastTap = { t: now, x: e.clientX, y: e.clientY };
    if (dbl) { dragState = null; return onDouble(e); }
    if (e.target.classList.contains('chk')) { toggleHabitToday(id); dragState = null; return; }
    if (e.target.classList.contains('h')) {
      const [wx, wy] = toWorld(e.clientX, e.clientY);
      dragState = { type: 'connect', from: id, x: wx, y: wy }; tmpEdge.hidden = false; return;
    }
    if (e.target.classList.contains('rz')) {
      const n = N(id); dragState = { type: 'resize', id, sx: e.clientX, sy: e.clientY, w: n.w, h: sizes.get(id)?.[1] ?? n.h, before: snap() }; return;
    }
    if (nodeE) {
      if (e.shiftKey || e.metaKey || e.ctrlKey) { sel.has(id) ? sel.delete(id) : sel.add(id); }
      else if (!sel.has(id)) { sel.clear(); sel.add(id); }
      selEdge = null; paintSelection();
      const start = new Map([...sel].map(s => [s, [N(s).x, N(s).y]]));
      dragState = { type: 'move', sx: e.clientX, sy: e.clientY, start, moved: false, before: snap() }; return;
    }
    const edgeG = e.target.closest('#eg g');
    if (edgeG) { sel.clear(); selEdge = edgeG.dataset.edge; paintSelection(); dragState = null; return; }
    // fondo
    if (e.shiftKey) {
      const r = board.getBoundingClientRect();
      dragState = { type: 'marquee', x: e.clientX - r.left, y: e.clientY - r.top, add: new Set(sel) };
      const m = $('#marquee'); m.hidden = false; m.style.cssText = `left:${dragState.x}px;top:${dragState.y}px;width:0;height:0`; return;
    }
    dragState = { type: 'pan', sx: e.clientX, sy: e.clientY, vx: V.x, vy: V.y, moved: false };
    board.classList.add('panning');
  });
  board.addEventListener('pointermove', e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = dragState; if (!s) return;
    if (s.type === 'pinch' && pointers.size >= 2) {
      const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const r = board.getBoundingClientRect();
      V.x += mx - s.mx; V.y += my - s.my; zoomAt(d / s.d, mx - r.left, my - r.top);
      s.d = d; s.mx = mx; s.my = my; return;
    }
    if (s.type === 'pan') { V.x = s.vx + e.clientX - s.sx; V.y = s.vy + e.clientY - s.sy; if (Math.abs(e.clientX - s.sx) + Math.abs(e.clientY - s.sy) > 3) s.moved = true; applyView(); return; }
    if (s.type === 'move') {
      const dx = (e.clientX - s.sx) / V.z, dy = (e.clientY - s.sy) / V.z;
      if (!s.moved && Math.abs(dx) + Math.abs(dy) < 3 / V.z) return;
      if (!s.moved) { s.moved = true; if (floatbar) { floatbar.remove(); floatbar = null; } }
      for (const [id, [x0, y0]] of s.start) { const n = N(id); n.x = Math.round(x0 + dx); n.y = Math.round(y0 + dy); const el = els.get(id); el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; }
      updateEdgesFor([...s.start.keys()]); return;
    }
    if (s.type === 'resize') {
      const n = N(s.id), el = els.get(s.id);
      n.w = Math.max(60, Math.round(s.w + (e.clientX - s.sx) / V.z)); n.h = Math.max(30, Math.round(s.h + (e.clientY - s.sy) / V.z));
      el.style.width = n.w + 'px'; el.style.minHeight = n.h + 'px'; sizes.set(s.id, [el.offsetWidth, el.offsetHeight]); updateEdgesFor([s.id]); return;
    }
    if (s.type === 'connect') {
      const a = N(s.from); const [ax, ay] = center(a); const [wx, wy] = toWorld(e.clientX, e.clientY);
      tmpEdge.setAttribute('d', `M${ax},${ay} L${wx},${wy}`); return;
    }
    if (s.type === 'marquee') {
      const r = board.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      const m = $('#marquee'); const x0 = Math.min(x, s.x), y0 = Math.min(y, s.y), w = Math.abs(x - s.x), h = Math.abs(y - s.y);
      m.style.cssText = `left:${x0}px;top:${y0}px;width:${w}px;height:${h}px`;
      const wx0 = (x0 - V.x) / V.z, wy0 = (y0 - V.y) / V.z, wx1 = (x0 + w - V.x) / V.z, wy1 = (y0 + h - V.y) / V.z;
      sel.clear(); s.add.forEach(i => sel.add(i));
      for (const n of visibleNodes()) { const [nw, nh] = sizes.get(n.id) || [n.w, n.h]; if (n.x < wx1 && n.x + nw > wx0 && n.y < wy1 && n.y + nh > wy0) sel.add(n.id); }
      for (const [id, el] of els) el.classList.toggle('sel', sel.has(id));
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    const s = dragState; if (!s) return;
    if (s.type === 'pinch') { if (pointers.size < 2) dragState = null; return; }
    dragState = null;
    board.classList.remove('panning');
    if (s.type === 'pan') { if (!s.moved && !e.shiftKey) { sel.clear(); selEdge = null; paintSelection(); } else placeFloatbar(); return; }
    if (s.type === 'move') { if (s.moved) { pushUndo(s.before); reindex(); markDirty(); drawMinimap(); } placeFloatbar(); return; }
    if (s.type === 'resize') { pushUndo(s.before); markDirty(); placeFloatbar(); return; }
    if (s.type === 'marquee') { $('#marquee').hidden = true; paintSelection(); return; }
    if (s.type === 'connect') {
      tmpEdge.hidden = true;
      const t = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.node');
      if (t && t.dataset.id !== s.from) {
        if (doc.edges.some(x => x.from === s.from && x.to === t.dataset.id)) return toast('Ya están conectados');
        change(() => doc.edges.push({ id: uid('e'), from: s.from, to: t.dataset.id }));
      } else if (!t) {
        const [wx, wy] = toWorld(e.clientX, e.clientY);
        const src = N(s.from); const kind = src.kind === 'core' ? 'area' : 'topic';
        createNodeAt(wx, wy, kind, s.from);
      }
    }
  }
  board.addEventListener('pointerup', endPointer);
  board.addEventListener('pointercancel', endPointer);
  board.addEventListener('dblclick', e => { if (e.target.closest('.floatbar')) return; onDouble(e); });
  function onDouble(e) {
    const nodeE = e.target.closest('.node');
    if (nodeE) { const id = nodeE.dataset.id; sel.clear(); sel.add(id); paintSelection(); return startEdit(id, false); }
    if (e.target.closest('#eg g')) return;
    const [x, y] = toWorld(e.clientX, e.clientY); createNodeAt(x, y, 'topic');
  }
  board.addEventListener('wheel', e => {
    e.preventDefault();
    const r = board.getBoundingClientRect();
    const mouseWheel = e.deltaMode === 1 || (Math.abs(e.deltaY) >= 50 && e.deltaX === 0 && Number.isInteger(e.deltaY));
    if (e.ctrlKey || e.metaKey || mouseWheel) zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - r.left, e.clientY - r.top);
    else { V.x -= e.deltaX; V.y -= e.deltaY; applyView(); }
  }, { passive: false });
  board.addEventListener('contextmenu', e => e.preventDefault());
  $('#zIn').onclick = () => zoomAt(1.25, board.clientWidth / 2, board.clientHeight / 2);
  $('#zOut').onclick = () => zoomAt(0.8, board.clientWidth / 2, board.clientHeight / 2);
  $('#zoomlbl').onclick = () => fit();
  $('#fitBtn').onclick = () => fit();
  $('#undoBtn').onclick = undo; $('#redoBtn').onclick = redo;

  function toggleHabitToday(id) {
    const n = N(id); if (!n || n.kind !== 'habit') return;
    const k = dayKey();
    change(() => { if (n.habit.checks[k]) delete n.habit.checks[k]; else n.habit.checks[k] = 1; });
    if (n.habit.checks[k]) toast('¡Hábito cumplido hoy!');
  }

  /* ---------- teclado ---------- */
  let clip = null;
  document.addEventListener('keydown', e => {
    if (!doc || !$('#login').hidden) return;
    const typing = e.target.closest('input,textarea,select,[contenteditable="true"],[contenteditable="plaintext-only"]');
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (mod && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); return; }
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#q').focus(); return; }
    if (view !== 'map' || typing || editing) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelection(); }
    else if (e.key === 'Escape') { sel.clear(); selEdge = null; paintSelection(); }
    else if (e.key === 'Enter' && sel.size === 1) { e.preventDefault(); startEdit([...sel][0], true); }
    else if (e.key === 'Tab' && sel.size === 1) { e.preventDefault(); addChild([...sel][0]); }
    else if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); visibleNodes().forEach(n => sel.add(n.id)); paintSelection(); }
    else if (mod && e.key.toLowerCase() === 'c' && sel.size) { clip = { nodes: [...sel].map(id => JSON.parse(JSON.stringify(N(id)))), edges: doc.edges.filter(x => sel.has(x.from) && sel.has(x.to)).map(x => ({ ...x })) }; toast('Copiado'); }
    else if (mod && (e.key.toLowerCase() === 'v' || e.key.toLowerCase() === 'd')) {
      const src = e.key.toLowerCase() === 'd' ? { nodes: [...sel].map(id => JSON.parse(JSON.stringify(N(id)))), edges: doc.edges.filter(x => sel.has(x.from) && sel.has(x.to)).map(x => ({ ...x })) } : clip;
      if (!src || !src.nodes.length) return; e.preventDefault();
      const map = new Map();
      change(() => {
        for (const n of src.nodes) { if (n.kind === 'core') continue; const c = Object.assign({}, n, { id: uid('n'), x: n.x + 40, y: n.y + 40 }); map.set(n.id, c.id); doc.nodes.push(c); }
        for (const x of src.edges) if (map.has(x.from) && map.has(x.to)) doc.edges.push({ ...x, id: uid('e'), from: map.get(x.from), to: map.get(x.to) });
      });
      sel.clear(); map.forEach(v => sel.add(v)); paintSelection();
    }
    else if (e.key.startsWith('Arrow') && sel.size) {
      e.preventDefault(); const st = e.shiftKey ? 20 : 4; const before = snap();
      for (const id of sel) { const n = N(id); if (e.key === 'ArrowLeft') n.x -= st; if (e.key === 'ArrowRight') n.x += st; if (e.key === 'ArrowUp') n.y -= st; if (e.key === 'ArrowDown') n.y += st; const el = els.get(id); el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; }
      updateEdgesFor([...sel]); pushUndo(before); markDirty(); placeFloatbar();
    }
  });

  /* ---------- minimapa ---------- */
  const mm = $('#minimap'), mctx = mm.getContext('2d');
  let mmBox = null;
  function drawMinimap() {
    if (!doc || view !== 'map' || getComputedStyle(mm).display === 'none') return;
    cancelAnimationFrame(drawMinimap.r);
    drawMinimap.r = requestAnimationFrame(() => {
      const W = mm.width, H = mm.height; mctx.clearRect(0, 0, W, H);
      const ns = visibleNodes(); if (!ns.length) return;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const n of ns) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x + n.w); y1 = Math.max(y1, n.y + n.h); }
      const s = Math.min((W - 20) / (x1 - x0), (H - 20) / (y1 - y0)); const ox = (W - (x1 - x0) * s) / 2 - x0 * s, oy = (H - (y1 - y0) * s) / 2 - y0 * s;
      mmBox = { s, ox, oy };
      const col = { core: '#8fd14f', area: '#1b1b1d', topic: '#4a4d53', habit: '#7fb56d', course: '#9fa3aa', doc: '#c9a86a', note: '#e8cf4a' };
      for (const n of ns) { mctx.fillStyle = n.color || col[n.kind]; mctx.fillRect(n.x * s + ox, n.y * s + oy, Math.max(2, n.w * s), Math.max(2, n.h * s)); }
      const r = board.getBoundingClientRect();
      mctx.strokeStyle = '#4262ff'; mctx.lineWidth = 2;
      mctx.strokeRect((-V.x / V.z) * s + ox, (-V.y / V.z) * s + oy, (r.width / V.z) * s, (r.height / V.z) * s);
    });
  }
  function mmGo(e) {
    if (!mmBox) return; const r = mm.getBoundingClientRect();
    const px = (e.clientX - r.left) * (mm.width / r.width), py = (e.clientY - r.top) * (mm.height / r.height);
    const wx = (px - mmBox.ox) / mmBox.s, wy = (py - mmBox.oy) / mmBox.s, b = board.getBoundingClientRect();
    V.x = b.width / 2 - wx * V.z; V.y = b.height / 2 - wy * V.z; applyView();
  }
  mm.addEventListener('pointerdown', e => { mmGo(e); mm.setPointerCapture(e.pointerId); mm.onpointermove = mmGo; });
  mm.addEventListener('pointerup', () => { mm.onpointermove = null; });
  addEventListener('resize', () => { if (view === 'map') { applyView(); } });

  /* ---------- ficha (panel lateral) ---------- */
  const insp = $('#inspector');
  function parentOptions(current, excludeId) {
    const areas = doc.nodes.filter(n => n.kind === 'area');
    let h = '';
    const c = core(); if (c) h += `<option value="${c.id}"${current === c.id ? ' selected' : ''}>${esc(c.text)}</option>`;
    for (const a of areas) {
      const sub = descendants(a.id).filter(n => (n.kind === 'topic' || n.kind === 'area') && n.id !== excludeId);
      h += `<optgroup label="${esc(a.text)}"><option value="${a.id}"${current === a.id ? ' selected' : ''}>${esc(a.text)} (dimensión)</option>` +
        sub.map(n => `<option value="${n.id}"${current === n.id ? ' selected' : ''}>${esc(n.text)}</option>`).join('') + '</optgroup>';
    }
    return h;
  }
  function setParent(id, pid, move = true) {
    const n = N(id), p = N(pid); if (!n || !p) return;
    const old = parentOf(id);
    doc.edges = doc.edges.filter(e => !(e.to === id && old && e.from === old.id));
    doc.edges.push({ id: uid('e'), from: pid, to: id });
    if (move) { reindex(); const [x, y] = placeNear(p, n.kind); n.x = x; n.y = y; }
  }
  function renderInspector() {
    if (view !== 'map') return;
    const one = sel.size === 1 ? N([...sel][0]) : null;
    if (!one) { insp.hidden = true; return; }
    insp.hidden = false;
    const p = parentOf(one.id), area = areaOf(one);
    let h = `<div class="hd"><b>${esc(KINDS[one.kind])}${one.level != null ? ' · nivel ' + one.level : ''}</b><button class="iconbtn" data-x="close" aria-label="Cerrar ficha">${icon.close}</button></div><div class="bd">`;
    h += `<div class="field"><textarea class="title" data-k="text" rows="2" aria-label="Título">${esc(one.text)}</textarea></div>`;
    if (one.kind !== 'core' && one.kind !== 'note') h += `<div class="field"><label>Cuelga de</label><select data-k="parent">${p ? '' : '<option value="">(sin conexión)</option>'}${parentOptions(p?.id, one.id)}</select></div>`;
    if (one.kind === 'course') {
      const c = one.course;
      h += `<div class="two"><div class="field"><label>Estado</label><select data-c="status">${STATUSES.map(s => `<option${s === c.status ? ' selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>Prioridad</label><select data-c="priority">${PRIORITIES.map(s => `<option${s === c.priority ? ' selected' : ''}>${s}</option>`).join('')}</select></div></div>
        <div class="field"><label>Dónde / link</label><input data-c="where" value="${esc(c.where)}" placeholder="Institución, plataforma o enlace">${/^https?:\/\//.test(c.where) ? `<p style="margin-top:6px"><a href="${esc(c.where)}" target="_blank" rel="noopener noreferrer">Abrir enlace ↗</a></p>` : ''}</div>
        <div class="two"><div class="field"><label>Costo</label><input data-c="cost" value="${esc(c.cost)}" placeholder="$"></div><div class="field"><label>Inicio</label><input type="date" data-c="start" value="${esc(c.start)}"></div></div>
        <div class="field"><label>Notas del curso</label><textarea data-c="notes">${esc(c.notes)}</textarea></div>`;
    }
    if (one.kind === 'habit') {
      const hb = one.habit; const today = new Date();
      let days = '';
      for (let i = 20; i >= 0; i--) { const d = addDays(today, -i), k = dayKey(d); days += `<button data-day="${k}" class="${hb.checks[k] ? 'on' : ''}${i === 0 ? ' today' : ''}" title="${d.toLocaleDateString('es-AR')}">${d.getDate()}</button>`; }
      h += `<div class="field"><label>Frecuencia</label><select data-hb="freq">${['Diario', 'Semanal', 'Cuando pueda'].map(s => `<option${s === hb.freq ? ' selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>Últimos 21 días · racha ${streak(one)}</label><div class="days">${days}</div></div>`;
    }
    if (one.kind === 'doc') h += `<p style="margin-bottom:14px"><button class="btn" data-x="opendoc">Abrir documento</button></p>`;
    h += `<div class="field"><label>Notas</label><textarea data-k="note" placeholder="Detalle, reflexión, próximos pasos…">${esc(one.note || '')}</textarea></div>`;
    if (one.kind === 'area' || one.kind === 'topic' || one.kind === 'core') {
      const ds = descendants(one.id);
      const cs = ds.filter(n => n.kind === 'course'), hs = ds.filter(n => n.kind === 'habit');
      if (cs.length || hs.length) {
        h += `<div class="field"><label>Proyección concreta</label>`;
        if (cs.length) h += `<p style="font-size:.82rem;color:var(--ink2);margin-bottom:6px">${cs.length} curso${cs.length > 1 ? 's' : ''} · ${cs.filter(n => n.course.status === 'Hecho').length} hecho${cs.filter(n => n.course.status === 'Hecho').length === 1 ? '' : 's'}</p>`;
        h += `<div class="chips">${[...hs, ...cs].slice(0, 40).map(n => `<button class="chip" data-go="${n.id}">${n.kind === 'course' ? `<span class="st" style="background:${STATUS_COLOR[n.course.status]}"></span>` : '✓ '}${esc(n.text)}</button>`).join('')}</div></div>`;
      }
    }
    const links = [...incoming(one.id).map(e => ['←', e.from]), ...outgoing(one.id).map(e => ['→', e.to])].filter(([, i]) => N(i));
    if (links.length) h += `<div class="field"><label>Conexiones</label><div class="chips">${links.map(([d, i]) => `<button class="chip" data-go="${i}">${d} ${esc(N(i).text)}</button>`).join('')}</div></div>`;
    if (area && area.id !== one.id) h += `<p style="font-size:.78rem;color:var(--ink3);margin-top:8px">Dimensión: ${esc(area.text)}</p>`;
    h += `</div>`;
    insp.innerHTML = h;
  }
  insp.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.x === 'close') { inspectorOpen = false; insp.hidden = true; return; }
    if (b.dataset.x === 'opendoc') return openDoc(N([...sel][0]).doc);
    if (b.dataset.go) return focusNode(b.dataset.go);
    if (b.dataset.day) { const n = N([...sel][0]); const k = b.dataset.day; change(() => { if (n.habit.checks[k]) delete n.habit.checks[k]; else n.habit.checks[k] = 1; }); }
  });
  let inspBefore = null;
  insp.addEventListener('focusin', () => { inspBefore = snap(); });
  insp.addEventListener('input', e => {
    const n = N([...sel][0]); if (!n) return; const t = e.target;
    if (t.dataset.k === 'text') { n.text = t.value; const el = els.get(n.id); if (el) { el.querySelector('.t').textContent = n.text; sizes.set(n.id, [el.offsetWidth, el.offsetHeight]); updateEdgesFor([n.id]); } }
    else if (t.dataset.k === 'note') n.note = t.value;
    else if (t.dataset.c && t.tagName !== 'SELECT' && t.type !== 'date') n.course[t.dataset.c] = t.value;
    else return;
    markDirty();
  });
  insp.addEventListener('focusout', () => { if (inspBefore && inspBefore !== snap()) pushUndo(inspBefore); inspBefore = null; });
  insp.addEventListener('change', e => {
    const n = N([...sel][0]); if (!n) return; const t = e.target;
    if (t.dataset.k === 'parent' && t.value) change(() => setParent(n.id, t.value));
    else if (t.dataset.c && (t.tagName === 'SELECT' || t.type === 'date')) change(() => { n.course[t.dataset.c] = t.value; });
    else if (t.dataset.hb) change(() => { n.habit[t.dataset.hb] = t.value; });
  });

  /* ================= CURSOS (CRM) ================= */
  let cf = Object.assign({ q: '', status: 'Todos', area: '', sort: 'area', dir: 1 }, store.get('mv-cf') || {});
  function courses() { return doc.nodes.filter(n => n.kind === 'course'); }
  function renderCourses() {
    const root = $('#v-courses');
    const all = courses(); const done = all.filter(n => n.course.status === 'Hecho').length, now = all.filter(n => n.course.status === 'En curso').length;
    const areas = doc.nodes.filter(n => n.kind === 'area');
    root.innerHTML = `<div class="page">
      <h2>Cursos</h2><p class="lead">Tu listado de formación. Cada curso cuelga de un cuadro del mapa: lo que cambies acá se proyecta allá, y viceversa.</p>
      <div class="stats">
        <div class="stat"><b>${all.length}</b><span>cursos</span></div>
        <div class="stat"><b>${done}</b><span>hechos</span></div>
        <div class="stat"><b>${now}</b><span>en curso</span></div>
        <div class="stat" style="flex:1;min-width:200px"><b>${all.length ? Math.round(done / all.length * 100) : 0}%</b><span>de avance</span><div class="bar"><i style="width:${all.length ? done / all.length * 100 : 0}%"></i></div></div>
      </div>
      <div class="toolbar">
        <input type="search" id="cq" placeholder="Buscar curso…" value="${esc(cf.q)}">
        <div class="chips" id="cst">${['Todos', ...STATUSES].map(s => `<button class="chip" aria-pressed="${cf.status === s}" data-s="${s}">${s === 'Todos' ? s : `<span class="st" style="background:${STATUS_COLOR[s]}"></span>${s}`} <small>${s === 'Todos' ? all.length : all.filter(n => n.course.status === s).length}</small></button>`).join('')}</div>
        <select id="carea"><option value="">Todas las dimensiones</option>${areas.map(a => `<option value="${a.id}"${cf.area === a.id ? ' selected' : ''}>${esc(a.text)}</option>`).join('')}</select>
        <button class="btn" id="cadd">${icon.plus}Nuevo curso</button>
      </div>
      <div class="tablewrap"><table class="crm"><thead><tr>
        <th data-sort="done" style="width:40px"></th><th data-sort="name">Curso</th><th data-sort="area">Cuadro del mapa</th><th data-sort="status">Estado</th><th data-sort="priority">Prioridad</th>
        <th data-sort="where">Dónde / link</th><th data-sort="cost" style="width:90px">Costo</th><th data-sort="start" style="width:140px">Inicio</th><th>Notas</th><th></th></tr></thead><tbody></tbody></table></div>
    </div>`;
    fillCourseRows();
    $('#cq').addEventListener('input', e => { cf.q = e.target.value; store.set('mv-cf', cf); fillCourseRows(); });
    $('#cst').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; cf.status = b.dataset.s; store.set('mv-cf', cf); renderCourses(); });
    $('#carea').addEventListener('change', e => { cf.area = e.target.value; store.set('mv-cf', cf); fillCourseRows(); });
    $('#cadd').addEventListener('click', addCourse);
    root.querySelector('thead').addEventListener('click', e => { const th = e.target.closest('th[data-sort]'); if (!th) return; if (cf.sort === th.dataset.sort) cf.dir *= -1; else { cf.sort = th.dataset.sort; cf.dir = 1; } store.set('mv-cf', cf); fillCourseRows(); });
  }
  function fillCourseRows() {
    const tb = $('#v-courses tbody'); if (!tb) return;
    const q = norm(cf.q);
    let rows = courses().map(n => ({ n, p: parentOf(n.id), a: areaOf(n) }));
    rows = rows.filter(({ n, p, a }) => (cf.status === 'Todos' || n.course.status === cf.status) && (!cf.area || a?.id === cf.area) &&
      (!q || norm(n.text + ' ' + (p?.text || '') + ' ' + (a?.text || '') + ' ' + n.course.notes + ' ' + n.course.where).includes(q)));
    const key = { name: r => norm(r.n.text), area: r => norm((r.a?.text || '') + ' ' + (r.p?.text || '')), status: r => STATUSES.indexOf(r.n.course.status), priority: r => PRIORITIES.indexOf(r.n.course.priority),
      where: r => norm(r.n.course.where), cost: r => parseFloat(String(r.n.course.cost).replace(/[^\d.]/g, '')) || 0, start: r => r.n.course.start || '9', done: r => r.n.course.status === 'Hecho' ? 0 : 1 }[cf.sort] || (r => 0);
    rows.sort((x, y) => { const a = key(x), b = key(y); return (a > b ? 1 : a < b ? -1 : norm(x.n.text) > norm(y.n.text) ? 1 : -1) * cf.dir; });
    tb.innerHTML = rows.map(({ n, p }) => { const c = n.course; return `<tr data-id="${n.id}" class="${c.status === 'Hecho' ? 'done' : ''}">
      <td><button class="habit-x tickc" data-a="done" aria-label="Marcar hecho" style="width:24px;height:24px;border-radius:7px;border:1.6px solid ${c.status === 'Hecho' ? '#3f9a5a' : '#c9ccd2'};background:${c.status === 'Hecho' ? '#3f9a5a' : '#fff'};color:#fff;display:grid;place-items:center">${c.status === 'Hecho' ? icon.check : ''}</button></td>
      <td class="name"><input data-f="text" value="${esc(n.text)}" title="${esc(n.text)}" aria-label="Nombre del curso"></td>
      <td><select data-f="parent" aria-label="Cuadro del mapa">${parentOptions(p?.id, n.id)}</select></td>
      <td><select data-f="status" aria-label="Estado" style="color:${STATUS_COLOR[c.status] === '#c9ccd2' ? 'inherit' : STATUS_COLOR[c.status]};font-weight:600">${STATUSES.map(s => `<option${s === c.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td>
      <td><select data-f="priority" aria-label="Prioridad">${PRIORITIES.map(s => `<option${s === c.priority ? ' selected' : ''}>${s}</option>`).join('')}</select></td>
      <td><input data-f="where" value="${esc(c.where)}" placeholder="—" aria-label="Dónde"></td>
      <td><input data-f="cost" value="${esc(c.cost)}" placeholder="—" aria-label="Costo"></td>
      <td><input data-f="start" type="date" value="${esc(c.start)}" aria-label="Inicio"></td>
      <td class="notes"><input data-f="notes" value="${esc(c.notes)}" placeholder="—" aria-label="Notas"></td>
      <td class="acts"><button data-a="map" title="Ver en el mapa">${icon.target}</button><button data-a="del" title="Borrar">${icon.trash}</button></td></tr>`; }).join('')
      || `<tr><td colspan="10" style="padding:30px;text-align:center;color:var(--ink3)">No hay cursos con ese filtro.</td></tr>`;
  }
  const vc = $('#v-courses');
  let rowBefore = null;
  vc.addEventListener('focusin', e => { if (e.target.closest('tbody')) rowBefore = snap(); });
  vc.addEventListener('input', e => {
    const tr = e.target.closest('tr[data-id]'); if (!tr || e.target.tagName === 'SELECT' || e.target.type === 'date') return;
    const n = N(tr.dataset.id); const f = e.target.dataset.f;
    if (f === 'text') n.text = e.target.value; else n.course[f] = e.target.value;
    markDirty();
  });
  vc.addEventListener('focusout', e => { if (e.target.closest('tbody') && rowBefore && rowBefore !== snap()) { pushUndo(rowBefore); } rowBefore = null; });
  vc.addEventListener('change', e => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return; const n = N(tr.dataset.id), f = e.target.dataset.f;
    if (f === 'parent') change(() => setParent(n.id, e.target.value), { silent: true });
    else if (f === 'status' || f === 'priority' || f === 'start') change(() => { n.course[f] = e.target.value; }, { silent: true });
    else return;
    if (f === 'status') renderCourses();
  });
  vc.addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return; const n = N(b.closest('tr').dataset.id);
    if (b.dataset.a === 'map') focusNode(n.id);
    if (b.dataset.a === 'done') { change(() => { n.course.status = n.course.status === 'Hecho' ? 'Por hacer' : 'Hecho'; }, { silent: true }); renderCourses(); if (n.course.status === 'Hecho') toast('¡Curso hecho! 🎓'); }
    if (b.dataset.a === 'del') { change(() => { doc.nodes = doc.nodes.filter(x => x.id !== n.id); doc.edges = doc.edges.filter(x => x.from !== n.id && x.to !== n.id); }); toast('Curso borrado', ['Deshacer', undo]); }
  });
  async function addCourse() {
    const pid = await ask('Nuevo curso', `<div class="field"><label>Nombre</label><input id="ncName" placeholder="Ej.: Introducción a la bioconstrucción"></div><div class="field"><label>Cuelga de (cuadro del mapa)</label><select id="ncParent">${parentOptions(cf.area || null)}</select></div>`,
      [['Cancelar', null], ['Crear', d => { const name = d.querySelector('#ncName').value.trim(); if (!name) { d.querySelector('#ncName').focus(); return undefined; } return [name, d.querySelector('#ncParent').value]; }, 'primary']],
      d => setTimeout(() => d.querySelector('#ncName').focus(), 30));
    if (!pid) return;
    const [name, parent] = pid; const p = N(parent);
    change(() => { const [x, y] = placeNear(p, 'course'); const n = newNode('course', name, x, y); doc.edges.push({ id: uid('e'), from: p.id, to: n.id }); });
    toast('Curso creado y proyectado en el mapa');
  }

  /* ================= HÁBITOS ================= */
  function streak(n) {
    let d = new Date(), c = 0;
    if (!n.habit.checks[dayKey(d)]) d = addDays(d, -1);
    while (n.habit.checks[dayKey(d)]) { c++; d = addDays(d, -1); }
    return c;
  }
  function affirmationOfDay() {
    const a = doc.docs.find(d => d.id === 'afirmaciones') || doc.docs.find(d => d.blocks.some(b => b.t === 'aff'));
    const list = a ? a.blocks.filter(b => b.t === 'aff' && b.text.trim()) : [];
    if (!list.length) return null;
    const t = new Date(); const seed = t.getFullYear() * 400 + t.getMonth() * 32 + t.getDate();
    return list[(seed * 2654435761 >>> 0) % list.length].text;
  }
  function renderHabits() {
    const root = $('#v-habits'); const hs = doc.nodes.filter(n => n.kind === 'habit'); const k = dayKey();
    const done = hs.filter(n => n.habit.checks[k]).length;
    const groups = new Map();
    for (const n of hs) { const a = areaOf(n); const key = a ? a.text : 'Sin dimensión'; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(n); }
    const aff = affirmationOfDay();
    const today = new Date();
    let h = `<div class="page"><h2>Hábitos</h2><p class="lead">Las prácticas diarias que bajan tu equilibrio vital a lo concreto. Marcá lo que hiciste hoy: queda registrado y se ve en el mapa.</p>`;
    if (aff) h += `<div class="today-aff"><small>Afirmación del día</small><p>${esc(aff)}</p></div>`;
    h += `<div class="stats"><div class="stat" style="flex:1;min-width:220px"><b>${done} / ${hs.length}</b><span>hábitos cumplidos hoy · ${today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><div class="bar"><i style="width:${hs.length ? done / hs.length * 100 : 0}%"></i></div></div><div class="stat"><button class="btn" id="hadd">${icon.plus}Nuevo hábito</button></div></div>`;
    for (const [g, list] of groups) {
      h += `<div class="group"><h3>${esc(g)}</h3><span>${list.filter(n => n.habit.checks[k]).length}/${list.length}</span></div>`;
      for (const n of list) {
        let days = '';
        for (let i = 13; i >= 0; i--) { const d = addDays(today, -i), dk = dayKey(d); days += `<button data-day="${dk}" class="${n.habit.checks[dk] ? 'on' : ''}${i === 0 ? ' today' : ''}" title="${d.toLocaleDateString('es-AR')}">${d.getDate()}</button>`; }
        h += `<div class="habit" data-id="${n.id}"><button class="tick ${n.habit.checks[k] ? 'on' : ''}" data-a="today" aria-label="Hecho hoy">${icon.check}</button>
          <div><div class="ht">${esc(n.text)}</div>${n.note && norm(n.note).replace(/[^a-z0-9]/g, '') !== norm(n.text).replace(/[^a-z0-9]/g, '') ? `<div class="hn">${esc(n.note)}</div>` : ''}</div>
          <div class="meta"><span class="streak">racha <b>${streak(n)}</b> días · ${esc(n.habit.freq)}</span><div class="days">${days}</div>
          <div><button class="btn ghost sm" data-a="map">${icon.target}Mapa</button></div></div></div>`;
      }
    }
    if (!hs.length) h += `<p class="lead">Todavía no hay hábitos. Creá uno o cambiá el tipo de un cuadro del mapa a “Hábito”.</p>`;
    root.innerHTML = h + '</div>';
    $('#hadd')?.addEventListener('click', addHabit);
  }
  $('#v-habits').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const card = b.closest('.habit'); if (!card) return; const n = N(card.dataset.id);
    if (b.dataset.a === 'today') { toggleHabitToday(n.id); }
    else if (b.dataset.day) { const k = b.dataset.day; change(() => { if (n.habit.checks[k]) delete n.habit.checks[k]; else n.habit.checks[k] = 1; }); }
    else if (b.dataset.a === 'map') focusNode(n.id);
  });
  async function addHabit() {
    const r = await ask('Nuevo hábito', `<div class="field"><label>Hábito</label><input id="nhName" placeholder="Ej.: Caminar 30 minutos"></div><div class="field"><label>Cuelga de</label><select id="nhParent">${parentOptions(null)}</select></div>`,
      [['Cancelar', null], ['Crear', d => { const v = d.querySelector('#nhName').value.trim(); if (!v) return undefined; return [v, d.querySelector('#nhParent').value]; }, 'primary']],
      d => setTimeout(() => d.querySelector('#nhName').focus(), 30));
    if (!r) return; const p = N(r[1]);
    change(() => { const [x, y] = placeNear(p, 'habit'); const n = newNode('habit', r[0], x, y); doc.edges.push({ id: uid('e'), from: p.id, to: n.id }); });
  }

  /* ================= DOCUMENTOS ================= */
  let curDoc = store.get('mv-doc') || 'afirmaciones';
  function openDoc(id) { curDoc = id; store.set('mv-doc', id); if (view !== 'docs') setView('docs'); else renderDocs(); }
  function renderDocs() {
    const root = $('#v-docs');
    if (!doc.docs.find(d => d.id === curDoc)) curDoc = doc.docs[0]?.id;
    const d = doc.docs.find(x => x.id === curDoc);
    let h = `<div class="docs"><nav class="doclist" aria-label="Documentos">${doc.docs.map(x => `<button data-doc="${x.id}" aria-current="${x.id === curDoc}">${esc(x.title)}<small>${x.blocks.length}</small></button>`).join('')}
      <button data-doc="__new" style="color:var(--ink3)">+ Nuevo documento</button></nav><article class="doc">`;
    if (d) {
      const isAff = d.blocks.some(b => b.t === 'aff');
      const onMap = doc.nodes.find(n => n.kind === 'doc' && n.doc === d.id);
      h += `<div class="dt" contenteditable="plaintext-only" spellcheck="false" data-title>${esc(d.title)}</div><div class="dtools">`;
      if (isAff) h += `<button class="btn" data-dt="read">Modo lectura</button><button class="btn ghost" data-dt="shuffle">Una al azar</button>`;
      h += onMap ? `<button class="btn ghost" data-dt="map">${icon.target}Ver en el mapa</button>` : `<button class="btn ghost" data-dt="tomap">${icon.map}Ubicar en el mapa</button>`;
      h += `<button class="btn ghost" data-dt="add">${icon.plus}Bloque</button><button class="btn danger" data-dt="del">${icon.trash}Borrar documento</button></div><div class="blocks">`;
      h += blocksHTML(d) + `</div>`;
    }
    root.innerHTML = h + `</article></div>`;
    $$('#v-docs .dt, #v-docs .bt').forEach(x => { if (x.contentEditable !== 'plaintext-only') x.contentEditable = 'true'; });
  }
  function blocksHTML(d) {
    let h = '', sec = null;
    const flush = () => { if (!sec) return; let out = ''; if (sec.sum > 0) out += `Total: $${sec.sum.toLocaleString('es-AR')}`; if (sec.items >= 3 && sec.done > 0) out += `${out ? ' · ' : ''}${sec.done} de ${sec.items} ✓`; if (out) h += `<div class="sum">${out}</div>`; sec = null; };
    for (const b of d.blocks) {
      if (b.t === 'h1' || b.t === 'h2' || b.t === 'h3') { flush(); sec = { sum: 0, items: 0, done: 0 }; }
      if (b.t === 'item' && sec) { sec.items++; if (b.done) sec.done++; const m = /\$\s?([\d.]+)/.exec(b.text); if (m) sec.sum += +m[1].replace(/\./g, '') || 0; }
      h += `<div class="blk ${b.t}${b.done ? ' done' : ''}" data-b="${b.id}">`
        + (b.t === 'item' ? `<button class="cb ${b.done ? 'on' : ''}" data-bx="tick" aria-label="Marcar">${icon.check}</button>` : '')
        + `<div class="bt" contenteditable="plaintext-only" data-ph="${b.t === 'aff' ? 'Escribí una afirmación…' : 'Escribí…'}">${esc(b.text)}</div>`
        + `<div class="bx"><select data-bx="type" aria-label="Tipo de bloque">${Object.entries(BLOCK_TYPES).map(([k, l]) => `<option value="${k}"${k === b.t ? ' selected' : ''}>${l}</option>`).join('')}</select><button data-bx="up" title="Subir">${icon.up}</button><button data-bx="down" title="Bajar">${icon.down}</button><button data-bx="map" title="Llevar al mapa">${icon.map}</button><button data-bx="del" title="Borrar">${icon.trash}</button></div></div>`;
    }
    flush();
    return h || '<p class="lead">Documento vacío. Agregá un bloque.</p>';
  }
  const vd = $('#v-docs');
  let docBefore = null;
  const D = () => doc.docs.find(x => x.id === curDoc);
  vd.addEventListener('focusin', e => { if (e.target.matches('.bt,.dt')) docBefore = snap(); });
  vd.addEventListener('input', e => {
    const d = D(); if (!d) return;
    if (e.target.matches('[data-title]')) { d.title = e.target.innerText.trim() || 'Documento'; const n = doc.nodes.find(x => x.kind === 'doc' && x.doc === d.id); if (n) n.text = d.title; markDirty(); return; }
    const bl = e.target.closest('.blk'); if (!bl || !e.target.matches('.bt')) return;
    const b = d.blocks.find(x => x.id === bl.dataset.b); if (b) { b.text = e.target.innerText.replace(/\n$/, ''); markDirty(); }
  });
  vd.addEventListener('focusout', e => {
    if (!e.target.matches('.bt,.dt')) return;
    if (docBefore && docBefore !== snap()) pushUndo(docBefore);
    docBefore = null;
    if (e.target.matches('[data-title]')) { const nav = vd.querySelector(`[data-doc="${curDoc}"]`); if (nav) nav.firstChild.textContent = D().title; }
  });
  vd.addEventListener('paste', e => {
    if (!e.target.closest('.bt,.dt')) return; e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  });
  function focusBlock(id, atEnd = true) {
    const el = vd.querySelector(`[data-b="${id}"] .bt`); if (!el) return; el.focus();
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(!atEnd ? true : false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  vd.addEventListener('keydown', e => {
    const bt = e.target.closest('.bt'); const d = D();
    if (e.target.matches('[data-title]') && e.key === 'Enter') { e.preventDefault(); e.target.blur(); return; }
    if (!bt || !d) return;
    const id = bt.closest('.blk').dataset.b, i = d.blocks.findIndex(x => x.id === id), b = d.blocks[i];
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const nb = { id: uid('b'), t: ['item', 'aff', 'p'].includes(b.t) ? b.t : 'p', text: '' };
      change(() => d.blocks.splice(i + 1, 0, nb)); focusBlock(nb.id);
    } else if (e.key === 'Backspace' && !bt.innerText.trim() && d.blocks.length > 1) {
      e.preventDefault(); const prev = d.blocks[i - 1];
      change(() => d.blocks.splice(i, 1)); if (prev) focusBlock(prev.id);
    }
  });
  vd.addEventListener('change', e => {
    if (e.target.dataset.bx !== 'type') return; const d = D(); const b = d.blocks.find(x => x.id === e.target.closest('.blk').dataset.b);
    change(() => { b.t = e.target.value; if (b.t !== 'item') delete b.done; });
  });
  vd.addEventListener('click', async e => {
    const nav = e.target.closest('[data-doc]');
    if (nav) {
      if (nav.dataset.doc === '__new') { const nd = { id: uid('d'), title: 'Nuevo documento', blocks: [{ id: uid('b'), t: 'p', text: '' }] }; change(() => doc.docs.push(nd)); return openDoc(nd.id); }
      return openDoc(nav.dataset.doc);
    }
    const d = D(); if (!d) return;
    const tool = e.target.closest('[data-dt]')?.dataset.dt;
    if (tool === 'read') return reader(d);
    if (tool === 'shuffle') { const l = d.blocks.filter(b => b.t === 'aff' && b.text.trim()); if (l.length) toast(l[Math.floor(Math.random() * l.length)].text); return; }
    if (tool === 'map') { const n = doc.nodes.find(x => x.kind === 'doc' && x.doc === d.id); return focusNode(n.id); }
    if (tool === 'tomap') {
      const pid = await ask('Ubicar en el mapa', `<div class="field"><label>Conectar con</label><select id="dp">${parentOptions(core()?.id)}</select></div>`, [['Cancelar', null], ['Ubicar', dd => dd.querySelector('#dp').value, 'primary']]);
      if (!pid) return; let n; change(() => { const p = N(pid); const [x, y] = placeNear(p, 'doc'); n = newNode('doc', d.title, x, y, { doc: d.id }); doc.edges.push({ id: uid('e'), from: p.id, to: n.id }); });
      return toast('Documento ubicado en el mapa', ['Ver', () => focusNode(n.id)]);
    }
    if (tool === 'add') { const nb = { id: uid('b'), t: 'p', text: '' }; change(() => d.blocks.push(nb)); return focusBlock(nb.id); }
    if (tool === 'del') {
      const ok = await ask('Borrar documento', `¿Borrar “${esc(d.title)}”? Podés recuperarlo con Deshacer o desde el Historial.`, [['Cancelar', false], ['Borrar', true, 'danger']]);
      if (!ok) return; change(() => { doc.docs = doc.docs.filter(x => x.id !== d.id); const ids = new Set(doc.nodes.filter(n => n.kind === 'doc' && n.doc === d.id).map(n => n.id)); doc.nodes = doc.nodes.filter(n => !ids.has(n.id)); doc.edges = doc.edges.filter(x => !ids.has(x.from) && !ids.has(x.to)); }); return;
    }
    const bx = e.target.closest('[data-bx]'); if (!bx || bx.tagName === 'SELECT') return;
    const i = d.blocks.findIndex(x => x.id === bx.closest('.blk').dataset.b), b = d.blocks[i];
    if (bx.dataset.bx === 'tick') change(() => { b.done = !b.done; if (!b.done) delete b.done; });
    if (bx.dataset.bx === 'up' && i > 0) change(() => { d.blocks.splice(i, 1); d.blocks.splice(i - 1, 0, b); });
    if (bx.dataset.bx === 'down' && i < d.blocks.length - 1) change(() => { d.blocks.splice(i, 1); d.blocks.splice(i + 1, 0, b); });
    if (bx.dataset.bx === 'del') change(() => d.blocks.splice(i, 1));
    if (bx.dataset.bx === 'map') {
      const r = await ask('Llevar al mapa', `<p style="margin-bottom:12px">“${esc(b.text.slice(0, 120))}”</p><div class="two"><div class="field"><label>Como</label><select id="bk"><option value="topic">Idea / ámbito</option><option value="habit">Hábito</option><option value="course">Curso</option><option value="note">Nota</option></select></div><div class="field"><label>Conectar con</label><select id="bp">${parentOptions(null)}</select></div></div>`,
        [['Cancelar', null], ['Llevar', dd => [dd.querySelector('#bk').value, dd.querySelector('#bp').value], 'primary']]);
      if (!r) return; let n;
      change(() => { const p = N(r[1]); const [x, y] = placeNear(p, r[0]); n = newNode(r[0], b.text.slice(0, 160), x, y); doc.edges.push({ id: uid('e'), from: p.id, to: n.id }); });
      toast('Agregado al mapa', ['Ver', () => focusNode(n.id)]);
    }
  });
  function reader(d) {
    const list = d.blocks.filter(b => b.t === 'aff' && b.text.trim()).map(b => b.text); if (!list.length) return;
    let i = 0, auto = 0;
    const el = document.createElement('div'); el.className = 'reader'; el.tabIndex = -1;
    el.innerHTML = `<p></p><div class="rc"><button data-r="prev">‹ Anterior</button><span></span><button data-r="play">Reproducir</button><button data-r="next">Siguiente ›</button><button data-r="close">Cerrar</button></div>`;
    document.body.appendChild(el); el.focus();
    const p = el.querySelector('p'), cnt = el.querySelector('span');
    const show = k => { i = (k + list.length) % list.length; p.style.opacity = 0; setTimeout(() => { p.textContent = list[i]; p.style.opacity = 1; }, 180); cnt.textContent = `${i + 1} / ${list.length}`; };
    const close = () => { clearInterval(auto); el.remove(); };
    el.addEventListener('click', e => { const r = e.target.closest('[data-r]')?.dataset.r; if (r === 'prev') show(i - 1); if (r === 'next') show(i + 1); if (r === 'close') close();
      if (r === 'play') { if (auto) { clearInterval(auto); auto = 0; e.target.textContent = 'Reproducir'; } else { auto = setInterval(() => show(i + 1), 7000); e.target.textContent = 'Pausa'; } } });
    el.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === ' ') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'Escape') close(); });
    show(0);
  }

  /* ================= búsqueda global ================= */
  const qi = $('#q'), qres = $('#qres'); let qsel = 0, qlist = [];
  qi.addEventListener('input', () => {
    const q = norm(qi.value.trim()); if (q.length < 2) { qres.hidden = true; return; }
    qlist = [];
    for (const n of doc.nodes) if (norm(n.text + ' ' + (n.note || '') + ' ' + (n.course?.notes || '')).includes(q)) qlist.push({ type: 'node', id: n.id, label: n.text, sub: KINDS[n.kind] });
    for (const d of doc.docs) for (const b of d.blocks) if (norm(b.text).includes(q)) qlist.push({ type: 'blk', doc: d.id, id: b.id, label: b.text, sub: d.title });
    qlist = qlist.slice(0, 30); qsel = 0;
    qres.innerHTML = qlist.map((r, i) => `<button data-i="${i}" class="${i === 0 ? 'on' : ''}"><span>${esc(r.label.slice(0, 80))}</span><small>${esc(r.sub)}</small></button>`).join('') || '<p style="padding:12px;color:var(--ink3);font-size:.86rem">Sin resultados</p>';
    qres.hidden = false;
  });
  function qgo(i) {
    const r = qlist[i]; if (!r) return; qres.hidden = true; qi.blur();
    if (r.type === 'node') focusNode(r.id);
    else { openDoc(r.doc); setTimeout(() => { const el = vd.querySelector(`[data-b="${r.id}"]`); if (el) { el.scrollIntoView({ block: 'center' }); el.style.background = 'var(--blue-soft)'; setTimeout(() => { el.style.background = ''; }, 1600); } }, 60); }
  }
  qres.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) qgo(+b.dataset.i); });
  qi.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); qsel = clamp(qsel + (e.key === 'ArrowDown' ? 1 : -1), 0, qlist.length - 1); $$('button', qres).forEach((b, i) => b.classList.toggle('on', i === qsel)); }
    if (e.key === 'Enter') { e.preventDefault(); qgo(qsel); }
    if (e.key === 'Escape') { qres.hidden = true; qi.blur(); }
  });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('.search')) qres.hidden = true; if (!e.target.closest('#menu,#menuBtn')) $('#menu').hidden = true; });

  /* ================= menú: historial, copias, clave, salir ================= */
  $('#menuBtn').addEventListener('click', () => { $('#menu').hidden = !$('#menu').hidden; });
  $('#menu').addEventListener('click', async e => {
    const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return; $('#menu').hidden = true;
    if (a === 'history') return history();
    if (a === 'export') {
      const blob = new Blob([JSON.stringify(doc, null, 1)], { type: 'application/json' }); const u = URL.createObjectURL(blob);
      const l = document.createElement('a'); l.href = u; l.download = `mi-vida-${dayKey()}.json`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000);
      return toast('Copia descargada');
    }
    if (a === 'import') return $('#importFile').click();
    if (a === 'pass') return changePass();
    if (a === 'logout') { try { await rpc('mv_logout', { p_token: token }); } catch (err) { /* nada */ } store.del('mv-token'); store.del('mv-backup'); location.reload(); }
  });
  $('#importFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const d = JSON.parse(await f.text()); if (!Array.isArray(d.nodes)) throw new Error('formato');
      const ok = await ask('Restaurar copia', `Se va a reemplazar todo por el contenido de <b>${esc(f.name)}</b> (${d.nodes.length} cuadros). Podés volver atrás con Deshacer o desde el Historial.`, [['Cancelar', false], ['Restaurar', true, 'primary']]);
      if (ok) change(() => { doc = normalize(d); });
    } catch (err) { toast('Ese archivo no es una copia válida'); }
  });
  async function history() {
    let list = [];
    try { list = await rpc('mv_history_list', { p_token: token }); } catch (e) { return toast('No pude traer el historial'); }
    const html = `<p style="margin-bottom:10px">Cada vez que trabajás, se guarda una foto de la versión anterior (como máximo una cada 10 minutos, hasta 300). Elegí una para volver a ella.</p><div class="hist">${list.map(h => `<button data-h="${h.id}"><span>${new Date(h.saved_at).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}</span><small>versión ${h.rev} · ${Math.round(h.size / 1024)} KB</small></button>`).join('') || '<p>Todavía no hay versiones anteriores.</p>'}</div>`;
    const id = await ask('Historial y memoria', html, [['Cerrar', null]], d => d.querySelector('.hist').addEventListener('click', ev => { const b = ev.target.closest('[data-h]'); if (b) { d.close(); restoreVersion(+b.dataset.h); } }));
    return id;
  }
  async function restoreVersion(id) {
    try {
      const data = await rpc('mv_history_get', { p_token: token, p_id: id }); if (!data) return;
      const ok = await ask('Volver a esta versión', 'Se va a cargar esa versión como la actual. La de ahora no se pierde: queda en el historial y podés deshacer.', [['Cancelar', false], ['Volver a esta versión', true, 'primary']]);
      if (ok) { change(() => { doc = normalize(data); }); toast('Versión restaurada', ['Deshacer', undo]); }
    } catch (e) { toast('No pude traer esa versión'); }
  }
  async function changePass() {
    const r = await ask('Cambiar clave', `<div class="field"><label>Clave actual</label><input type="password" id="op" autocomplete="current-password"></div><div class="field"><label>Clave nueva (mínimo 10 caracteres)</label><input type="password" id="np" autocomplete="new-password"></div><div class="field"><label>Repetir clave nueva</label><input type="password" id="np2" autocomplete="new-password"></div><p class="err" id="perr" style="color:var(--danger);font-size:.85rem"></p>`,
      [['Cancelar', null], ['Cambiar', d => { const o = d.querySelector('#op').value, n1 = d.querySelector('#np').value, n2 = d.querySelector('#np2').value; const er = d.querySelector('#perr');
        if (n1.length < 10) { er.textContent = 'La clave nueva necesita al menos 10 caracteres.'; return undefined; } if (n1 !== n2) { er.textContent = 'Las claves nuevas no coinciden.'; return undefined; } return [o, n1]; }, 'primary']]);
    if (!r) return;
    try { const ok = await rpc('mv_set_pass', { p_token: token, p_old: r[0], p_new: r[1] }); toast(ok ? 'Clave cambiada. Se cerraron las demás sesiones.' : 'La clave actual no es correcta'); }
    catch (e) { toast(e.message || 'No pude cambiar la clave'); }
  }

  /* ================= ingreso y arranque ================= */
  function showLogin(msg) {
    $('#boot').hidden = true; $('#login').hidden = false; $('#loginErr').textContent = msg || '';
    setTimeout(() => $('#pass').focus(), 50);
  }
  $('#peek').addEventListener('click', () => { const p = $('#pass'); p.type = p.type === 'password' ? 'text' : 'password'; $('#peek').textContent = p.type === 'password' ? 'Mostrar' : 'Ocultar'; });
  $('#login form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#login .go'), pass = $('#pass').value; if (!pass) return;
    btn.disabled = true; $('#loginErr').textContent = '';
    try {
      const t = await rpc('mv_login', { p_pass: pass, p_agent: navigator.userAgent.slice(0, 180), p_remember: $('#remember').checked });
      if (!t) { $('#loginErr').textContent = 'Clave incorrecta.'; btn.disabled = false; return; }
      saveToken(t, $('#remember').checked); $('#pass').value = '';
      $('#login').hidden = true;
      if (doc) { setStatus('saving', 'Guardando…'); dirty = true; save(); } else boot();
    } catch (err) { $('#loginErr').textContent = err.message || 'No me pude conectar. Revisá tu conexión.'; }
    btn.disabled = false;
  });
  async function decryptSeed(hexKey) {
    const buf = await (await fetch('/mivida/semilla.bin', { cache: 'no-store' })).arrayBuffer();
    const key = await crypto.subtle.importKey('raw', new Uint8Array(hexKey.match(/../g).map(h => parseInt(h, 16))), 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(buf, 0, 12), additionalData: new TextEncoder().encode('mi-vida-semilla-v1') }, key, new Uint8Array(buf, 12));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  async function boot() {
    $('#boot').hidden = false; $('#bootMsg').textContent = 'Cargando tu espacio…';
    let r;
    try { r = await rpc('mv_get', { p_token: token }); }
    catch (e) { store.del('mv-token'); return showLogin(e.session ? '' : 'No me pude conectar. Revisá tu conexión.'); }
    if (r.data) { doc = normalize(r.data); rev = r.rev; }
    else {
      $('#bootMsg').textContent = 'Preparando tu plataforma por primera vez…';
      try { doc = normalize(r.seed_key ? await decryptSeed(r.seed_key) : {}); } catch (e) { doc = normalize({}); toast('No pude cargar el contenido inicial'); }
      rev = 0; dirty = true;
    }
    // cambios de una sesión anterior que no llegaron a guardarse
    const b = store.get('mv-backup');
    if (b && b.dirty && b.doc && b.rev === rev && remember) { doc = normalize(b.doc); dirty = true; toast('Recuperé cambios que no se habían guardado'); }
    reindex();
    $('#boot').hidden = true; $('#app').hidden = false;
    setView(store.get('mv-tab') || 'map');
    if (dirty) save(); else setStatus('ok', 'Guardado');
  }
  // refresco suave al volver a la pestaña (por si editaste desde otro dispositivo)
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden || !doc || dirty || saving || editing) return;
    try { const r = await rpc('mv_get', { p_token: token }); if (r.data && r.rev !== rev) { doc = normalize(r.data); rev = r.rev; reindex(); renderAll(); toast('Actualizado con los cambios de otro dispositivo'); } } catch (e) { /* nada */ }
  });

  loadToken();
  if (token) boot(); else showLogin();
})();
