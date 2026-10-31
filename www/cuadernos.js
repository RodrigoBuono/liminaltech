(function(){
  'use strict';
  const DATA = window.CUADERNOS || { repositorio: [], directorio: [] };
  const $ = (s, r) => (r || document).querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utilidades ---------- */
  // búsqueda sin acentos ni mayúsculas: "antropologia" encuentra "Antropología"
  const norm = s => (s == null ? '' : String(s)).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => (/^https?:\/\//i.test(u || '') ? u : null);
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const LANG = { es: 'Español', en: 'Inglés', pt: 'Portugués', fr: 'Francés', de: 'Alemán', it: 'Italiano', nl: 'Neerlandés', ca: 'Catalán', da: 'Danés', sv: 'Sueco' };
  const TIPO = { articulo: 'Artículo', libro: 'Libro', capitulo: 'Capítulo', tesis: 'Tesis', informe: 'Informe' };
  const PERIODOS = [['all', 'Todas'], ['pre2000', 'Antes de 2000'], ['2000s', '2000 – 2009'], ['2010s', '2010 – 2019'], ['2020s', '2020 en adelante']];
  const inPeriod = (y, p) => {
    if (p === 'all') return true;
    if (!y) return false;
    return p === 'pre2000' ? y < 2000 : p === '2000s' ? y >= 2000 && y < 2010 : p === '2010s' ? y >= 2010 && y < 2020 : y >= 2020;
  };
  const DIR_ORDER = ['Red', 'Directorio', 'Ecoaldea', 'Cohousing y co-living', 'Formación', 'Voluntariado', 'Organización'];

  const authorsText = a => {
    if (!a || !a.length) return '';
    const names = a.map(n => n.includes(',') ? n.split(',').reverse().map(x => x.trim()).join(' ') : n);
    return names.length > 3 ? names.slice(0, 3).join(', ') + ' et al.' : names.join(', ');
  };

  /* ---------- datos ---------- */
  const repo = DATA.repositorio.filter(r => safeUrl(r.url)).map((r, i) => ({
    ...r, _i: i,
    _q: norm([r.titulo, (r.autores || []).join(' '), r.fuente, r.tema, (r.etiquetas || []).join(' '), r.resumen, r.anio].join(' '))
  }));
  const dir = DATA.directorio.filter(d => safeUrl(d.url)).map((d, i) => ({
    ...d, _i: i,
    _q: norm([d.nombre, d.tipo, d.region, d.pais, d.descripcion, (d.etiquetas || []).join(' '), host(d.url)].join(' '))
  }));

  const count = (arr, key) => arr.reduce((m, x) => { const k = x[key]; if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const countMulti = (arr, key) => arr.reduce((m, x) => { (x[key] || []).forEach(k => { m[k] = (m[k] || 0) + 1; }); return m; }, {});

  /* ---------- estadísticas del encabezado ---------- */
  const langs = new Set(repo.map(r => r.idioma).filter(Boolean));
  $('#nRepo').textContent = repo.length;
  $('#nDir').textContent = dir.length;
  $('#nLang').textContent = langs.size;
  $('#cRepo').textContent = repo.length;
  $('#cDir').textContent = dir.length;

  /* ---------- controles ---------- */
  function fillSelect(sel, entries, allLabel) {
    sel.innerHTML = `<option value="all">${esc(allLabel)}</option>` +
      entries.map(([v, label, n]) => `<option value="${esc(v)}">${esc(label)}${n != null ? ` (${n})` : ''}</option>`).join('');
  }
  function fillChips(box, entries, allLabel, total) {
    box.innerHTML = `<button type="button" class="chip" data-v="all" aria-pressed="true">${esc(allLabel)} <small>${total}</small></button>` +
      entries.map(([v, n]) => `<button type="button" class="chip" data-v="${esc(v)}" aria-pressed="false">${esc(v)} <small>${n}</small></button>`).join('');
  }
  const byCount = o => Object.entries(o).sort((a, b) => b[1] - a[1]);

  // Repositorio
  const temas = byCount(count(repo, 'tema'));
  fillChips($('#chipsRepo'), temas, 'Todos los temas', repo.length);
  fillSelect($('#sTipo'), byCount(count(repo, 'tipo')).map(([k, n]) => [k, TIPO[k] || k, n]), 'Todos');
  fillSelect($('#sIdioma'), byCount(count(repo, 'idioma')).map(([k, n]) => [k, LANG[k] || k.toUpperCase(), n]), 'Todos');
  $('#sPeriodo').innerHTML = PERIODOS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');

  // Directorio
  const tiposDir = Object.entries(count(dir, 'tipo')).sort((a, b) => (DIR_ORDER.indexOf(a[0]) + 99) % 99 - (DIR_ORDER.indexOf(b[0]) + 99) % 99);
  fillChips($('#chipsDir'), tiposDir, 'Todo', dir.length);
  fillSelect($('#sRegion'), byCount(count(dir, 'region')).map(([k, n]) => [k, k, n]), 'Todas');
  fillSelect($('#sPais'), Object.entries(count(dir, 'pais')).sort((a, b) => a[0].localeCompare(b[0], 'es')).map(([k, n]) => [k, k, n]), 'Todos');
  fillSelect($('#sDirIdioma'), byCount(countMulti(dir, 'idiomas')).map(([k, n]) => [k, LANG[k] || k.toUpperCase(), n]), 'Todos');

  /* ---------- desplegables propios ----------
     El <select> real sigue guardando el valor (y la lógica de filtros lo escucha igual);
     encima se muestra un botón + lista redondeados con la estética de la web. */
  const dds = [];
  function closeAll(except) { dds.forEach(d => { if (d.wrap !== except) d.close(false); }); }
  function enhanceSelect(sel) {
    const labId = sel.getAttribute('aria-labelledby');
    const wrap = document.createElement('div'); wrap.className = 'dd';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dd-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', sel.id + '-list');
    btn.innerHTML = '<span class="dd-v"></span><svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5"/></svg>';
    const list = document.createElement('ul'); list.className = 'dd-list'; list.id = sel.id + '-list';
    list.setAttribute('role', 'listbox'); list.tabIndex = -1;
    if (labId) list.setAttribute('aria-labelledby', labId);
    sel.classList.add('dd-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    sel.after(wrap); wrap.append(btn, list);
    let active = -1;
    const items = () => list.querySelectorAll('[role=option]');
    function build() {
      list.innerHTML = [...sel.options].map((o, i) => `<li role="option" id="${sel.id}-o${i}" data-i="${i}" aria-selected="${i === sel.selectedIndex}">${esc(o.textContent)}</li>`).join('');
    }
    function sync() {
      const o = sel.options[sel.selectedIndex];
      btn.querySelector('.dd-v').textContent = o ? o.textContent : '';
      const lab = labId ? document.getElementById(labId).textContent : '';
      btn.setAttribute('aria-label', `${lab}: ${o ? o.textContent : ''}`);
      btn.classList.toggle('on', sel.id !== 'sOrden' && sel.value !== 'all');
      items().forEach((li, i) => li.setAttribute('aria-selected', String(i === sel.selectedIndex)));
    }
    function setActive(i) {
      const its = items(); if (!its.length) return;
      active = Math.max(0, Math.min(i, its.length - 1));
      its.forEach(x => x.classList.remove('act'));
      its[active].classList.add('act'); list.setAttribute('aria-activedescendant', its[active].id);
      its[active].scrollIntoView({ block: 'nearest' });
    }
    function open() {
      closeAll(wrap); build();
      const r = btn.getBoundingClientRect(), below = innerHeight - r.bottom;
      wrap.classList.toggle('up', below < 280 && r.top > below);   // sin lugar abajo: abre hacia arriba
      wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      setActive(sel.selectedIndex);
      list.focus({ preventScroll: true });
      if (document.activeElement !== list) requestAnimationFrame(() => list.focus({ preventScroll: true }));
    }
    function close(focusBtn) {
      if (!wrap.classList.contains('open')) return;
      wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); list.removeAttribute('aria-activedescendant');
      if (focusBtn) btn.focus();
    }
    function choose(i) {
      if (i !== sel.selectedIndex) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      sync(); close(true);
    }
    btn.addEventListener('click', () => (wrap.classList.contains('open') ? close(false) : open()));
    btn.addEventListener('keydown', e => { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); } });
    list.addEventListener('click', e => { const li = e.target.closest('[role=option]'); if (li) choose(+li.dataset.i); });
    list.addEventListener('mousemove', e => { const li = e.target.closest('[role=option]'); if (li && +li.dataset.i !== active) setActive(+li.dataset.i); });
    list.addEventListener('keydown', e => {
      const n = sel.options.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(n - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
      else if (e.key.length === 1) {               // saltar a la opción que empieza con esa letra
        const k = norm(e.key), opts = [...sel.options];
        for (let j = 1; j <= n; j++) { const x = (active + j) % n; if (norm(opts[x].textContent).startsWith(k)) { setActive(x); break; } }
      }
    });
    dds.push({ wrap, sync, close });
    sync();
  }
  document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeAll(); });
  addEventListener('resize', () => closeAll());
  ['#sTipo', '#sIdioma', '#sPeriodo', '#sOrden', '#sRegion', '#sPais', '#sDirIdioma'].forEach(id => enhanceSelect($(id)));
  const syncDropdowns = () => dds.forEach(d => d.sync());

  /* ---------- estado ---------- */
  const R0 = { q: '', tema: 'all', tipo: 'all', idioma: 'all', periodo: 'all', abierto: false, orden: 'recientes' };
  const D0 = { q: '', tipo: 'all', region: 'all', pais: 'all', idioma: 'all' };
  const R = { ...R0 }, Dst = { ...D0 };
  const PAGE = 24;
  let repoLimit = PAGE;

  /* ---------- tarjetas ---------- */
  function repoCard(r) {
    const url = safeUrl(r.url);
    const abierto = r.acceso === 'abierto';
    const meta = [r.fuente, LANG[r.idioma] || ''].filter(Boolean).join(' · ');
    return `<article class="card enter">
      <div class="c-top">
        <span class="badge t">${esc(TIPO[r.tipo] || r.tipo || 'Trabajo')}</span>
        ${abierto ? '<span class="badge oa">Acceso abierto</span>' : ''}
        <span class="yr">${esc(r.anio || 's/f')}</span>
      </div>
      <h3 class="c-title"><a class="stretch" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(r.titulo)}</a></h3>
      ${r.autores && r.autores.length ? `<p class="c-auth">${esc(authorsText(r.autores))}</p>` : ''}
      ${meta ? `<p class="c-src">${esc(meta)}</p>` : ''}
      ${r.resumen ? `<p class="c-sum">${esc(r.resumen)}</p>` : ''}
      ${(r.etiquetas || []).length ? `<div class="c-tags">${r.etiquetas.slice(0, 5).map(t => `<button type="button" class="tag" data-tag="${esc(t)}" data-for="repo">${esc(t)}</button>`).join('')}</div>` : ''}
      <div class="c-foot"><span class="c-host">${esc(r.doi ? 'DOI ' + r.doi : host(url))}</span><span class="c-go" aria-hidden="true">Abrir fuente ↗</span></div>
    </article>`;
  }
  function dirCard(d) {
    const url = safeUrl(d.url);
    const place = [d.pais, d.region && d.region !== d.pais ? d.region : ''].filter(Boolean).join(' · ');
    return `<article class="card d enter">
      <div class="c-top"><span class="badge t">${esc(d.tipo)}</span></div>
      <h3 class="c-title"><a class="stretch" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(d.nombre)}</a></h3>
      ${place ? `<p class="c-place">${esc(place)}</p>` : ''}
      ${d.descripcion ? `<p class="c-sum">${esc(d.descripcion)}</p>` : ''}
      ${(d.etiquetas || []).length ? `<div class="c-tags">${d.etiquetas.slice(0, 4).map(t => `<button type="button" class="tag" data-tag="${esc(t)}" data-for="dir">${esc(t)}</button>`).join('')}</div>` : ''}
      <div class="c-foot"><span class="c-host">${esc(host(url))}</span><span class="c-go" aria-hidden="true">Visitar sitio ↗</span></div>
    </article>`;
  }

  /* ---------- filtrado ---------- */
  const terms = q => norm(q).split(/\s+/).filter(Boolean);
  const matches = (item, ts) => ts.every(t => item._q.includes(t));

  function renderRepo(resetLimit) {
    if (resetLimit) repoLimit = PAGE;
    const ts = terms(R.q);
    let out = repo.filter(r =>
      (R.tema === 'all' || r.tema === R.tema) &&
      (R.tipo === 'all' || r.tipo === R.tipo) &&
      (R.idioma === 'all' || r.idioma === R.idioma) &&
      inPeriod(r.anio, R.periodo) &&
      (!R.abierto || r.acceso === 'abierto') &&
      matches(r, ts));
    const yr = r => r.anio || 0;
    if (R.orden === 'recientes') out.sort((a, b) => yr(b) - yr(a) || a.titulo.localeCompare(b.titulo, 'es'));
    else if (R.orden === 'antiguos') out.sort((a, b) => (yr(a) || 9999) - (yr(b) || 9999) || a.titulo.localeCompare(b.titulo, 'es'));
    else out.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    const shown = out.slice(0, repoLimit);
    $('#gridRepo').innerHTML = shown.map(repoCard).join('');
    $('#countRepo').innerHTML = out.length === repo.length
      ? `<b>${out.length}</b> trabajos en el repositorio`
      : `<b>${out.length}</b> de ${repo.length} trabajos coinciden`;
    $('#emptyRepo').hidden = out.length > 0;
    const more = $('#moreRepo');
    more.hidden = out.length <= repoLimit;
    more.textContent = `Mostrar más (${out.length - shown.length})`;
    syncFilterUi('repo');
  }

  function renderDir() {
    const ts = terms(Dst.q);
    const out = dir.filter(d =>
      (Dst.tipo === 'all' || d.tipo === Dst.tipo) &&
      (Dst.region === 'all' || d.region === Dst.region) &&
      (Dst.pais === 'all' || d.pais === Dst.pais) &&
      (Dst.idioma === 'all' || (d.idiomas || []).includes(Dst.idioma)) &&
      matches(d, ts));
    const ord = t => { const i = DIR_ORDER.indexOf(t); return i < 0 ? 99 : i; };
    out.sort((a, b) => ord(a.tipo) - ord(b.tipo) || a.nombre.localeCompare(b.nombre, 'es'));
    $('#gridDir').innerHTML = out.map(dirCard).join('');
    $('#countDir').innerHTML = out.length === dir.length
      ? `<b>${out.length}</b> sitios en el directorio`
      : `<b>${out.length}</b> de ${dir.length} sitios coinciden`;
    $('#emptyDir').hidden = out.length > 0;
    syncFilterUi('dir');
  }

  // cuántos filtros activos (para el botón de filtros en el celular y "limpiar")
  function syncFilterUi(which) {
    const st = which === 'repo' ? R : Dst, base = which === 'repo' ? R0 : D0;
    const active = Object.keys(base).filter(k => k !== 'q' && k !== 'orden' && st[k] !== base[k]).length;
    const panel = which === 'repo' ? '#panel-repo' : '#panel-dir';
    const badge = $(panel + ' .ftoggle .n');
    badge.hidden = !active; badge.textContent = active;
    $(which === 'repo' ? '#clearRepo' : '#clearDir').hidden = !(active || st.q);
    syncDropdowns();
    const chips = $(which === 'repo' ? '#chipsRepo' : '#chipsDir');
    const val = which === 'repo' ? R.tema : Dst.tipo;
    chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.v === val)));
  }

  /* ---------- eventos ---------- */
  const qRepo = $('#qRepo'), qDir = $('#qDir');
  qRepo.addEventListener('input', debounce(() => { R.q = qRepo.value; renderRepo(true); }, 120));
  qDir.addEventListener('input', debounce(() => { Dst.q = qDir.value; renderDir(); }, 120));

  $('#chipsRepo').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; R.tema = c.dataset.v; renderRepo(true); });
  $('#chipsDir').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; Dst.tipo = c.dataset.v; renderDir(); });

  [['#sTipo', 'tipo'], ['#sIdioma', 'idioma'], ['#sPeriodo', 'periodo'], ['#sOrden', 'orden']]
    .forEach(([s, k]) => $(s).addEventListener('change', e => { R[k] = e.target.value; renderRepo(true); }));
  $('#sAbierto').addEventListener('change', e => { R.abierto = e.target.checked; renderRepo(true); });
  [['#sRegion', 'region'], ['#sPais', 'pais'], ['#sDirIdioma', 'idioma']]
    .forEach(([s, k]) => $(s).addEventListener('change', e => { Dst[k] = e.target.value; renderDir(); }));

  function clearRepo() {
    Object.assign(R, R0); qRepo.value = ''; $('#sAbierto').checked = false;
    ['#sTipo', '#sIdioma', '#sPeriodo'].forEach(s => { $(s).value = 'all'; }); $('#sOrden').value = 'recientes';
    renderRepo(true);
  }
  function clearDir() {
    Object.assign(Dst, D0); qDir.value = '';
    ['#sRegion', '#sPais', '#sDirIdioma'].forEach(s => { $(s).value = 'all'; });
    renderDir();
  }
  $('#clearRepo').addEventListener('click', clearRepo);
  $('#clearDir').addEventListener('click', clearDir);
  document.querySelectorAll('[data-clear]').forEach(b => b.addEventListener('click', () => b.dataset.clear === 'repo' ? clearRepo() : clearDir()));
  $('#moreRepo').addEventListener('click', () => { repoLimit += PAGE; renderRepo(false); });

  // tocar una etiqueta busca por esa etiqueta
  document.addEventListener('click', e => {
    const t = e.target.closest('.tag'); if (!t) return;
    if (t.dataset.for === 'repo') { qRepo.value = t.dataset.tag; R.q = t.dataset.tag; renderRepo(true); qRepo.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
    else { qDir.value = t.dataset.tag; Dst.q = t.dataset.tag; renderDir(); qDir.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
  });

  // botón "Filtros" (celular)
  document.querySelectorAll('.ftoggle').forEach(b => b.addEventListener('click', () => {
    const f = document.getElementById(b.getAttribute('aria-controls'));
    const open = !f.classList.contains('open');
    f.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
  }));

  /* ---------- pestañas (con enlace directo #repositorio / #directorio) ---------- */
  const tabs = [$('#tab-repo'), $('#tab-dir')];
  function showTab(which, push) {
    const isDir = which === 'dir';
    tabs[0].setAttribute('aria-selected', String(!isDir)); tabs[0].tabIndex = isDir ? -1 : 0;
    tabs[1].setAttribute('aria-selected', String(isDir)); tabs[1].tabIndex = isDir ? 0 : -1;
    $('#panel-repo').hidden = isDir; $('#panel-dir').hidden = !isDir;
    if (push) history.replaceState(null, '', isDir ? '#directorio' : '#repositorio');
  }
  tabs[0].addEventListener('click', () => showTab('repo', true));
  tabs[1].addEventListener('click', () => showTab('dir', true));
  tabs.forEach((t, i) => t.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = tabs[(i + 1) % 2]; n.focus(); n.click();
  }));
  showTab(/directorio/.test(location.hash) ? 'dir' : 'repo', false);
  addEventListener('hashchange', () => showTab(/directorio/.test(location.hash) ? 'dir' : 'repo', false));

  /* ---------- menú móvil ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const setMenu = open => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  menu.addEventListener('click', () => setMenu(false)); // tocar un enlace o el fondo cierra el menú
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false); });

  /* ---------- aparición suave ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  renderRepo(true);
  renderDir();

  /* ---------- cielo estrellado liviano ---------- */
  const cvs = $('#sky'), ctx = cvs.getContext('2d');
  let W = 0, H = 0, DPR = 1, stars = [], meteors = [], nextMeteor = 0, lastW = 0;
  function build() {
    lastW = innerWidth;
    DPR = Math.min(devicePixelRatio || 1, innerWidth <= 980 ? 1.5 : 2);
    W = cvs.width = Math.round(innerWidth * DPR); H = cvs.height = Math.round(innerHeight * DPR);
    const n = Math.round(Math.min(900, innerWidth * innerHeight / 2400));
    const col = () => { const t = Math.random(); return t < .15 ? '200,214,255' : t < .82 ? '255,248,238' : '255,222,182'; };
    stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() ** 3 * 1.7 + .3) * DPR,
      a: .18 + Math.random() * .7, p: Math.random() * 6.28, s: .4 + Math.random() * 1.6, c: col() }));
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = reduce ? s.a : s.a * (.55 + .45 * Math.sin(t * .001 * s.s + s.p));
      ctx.fillStyle = `rgba(${s.c},${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    if (reduce) return;
    if (t > nextMeteor) {
      meteors.push({ x: Math.random() * W * .8 + W * .1, y: Math.random() * H * .35, vx: (3 + Math.random() * 5) * DPR * (Math.random() < .5 ? -1 : 1), vy: (2 + Math.random() * 3) * DPR, life: 1 });
      nextMeteor = t + 4500 + Math.random() * 7000;
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]; m.x += m.vx; m.y += m.vy; m.life -= .018;
      if (m.life <= 0) { meteors.splice(i, 1); continue; }
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
      g.addColorStop(0, `rgba(255,255,255,${(.8 * m.life).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.4 * DPR;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9); ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  build();
  // en el celular, la barra del navegador cambia el alto al scrollear: solo se rehace si cambia el ancho
  addEventListener('resize', debounce(() => { if (innerWidth !== lastW) { build(); if (reduce) draw(0); } }, 200));
  requestAnimationFrame(draw);
})();
