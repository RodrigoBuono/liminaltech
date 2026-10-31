/* =====================================================================
   CAPA DE EFECTOS (fx)
   Se suma encima de app.js y cuadernos.js sin modificar su lógica:
   no cambia datos, filtros, navegación ni el motor de escenas.
   Si algo falla o GSAP no carga, la página sigue funcionando igual.
   ===================================================================== */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const isCuadernos = !!document.getElementById('gridRepo');

  /* ---------- 1. foco de luz en tarjetas (sigue al cursor) ---------- */
  if (fine) {
    let raf = 0, last = null;
    document.addEventListener('pointermove', e => {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = last.target.closest && last.target.closest('.card, .pcard');
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--fx-x', (last.clientX - r.left) + 'px');
        el.style.setProperty('--fx-y', (last.clientY - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- 2. texto que se descifra al pasar por los enlaces del menú ---------- */
  if (fine && !reduce) {
    const GLYPHS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789·/';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const original = a.textContent;
      if (!original.trim()) return;
      a.setAttribute('aria-label', original.trim());   // los lectores de pantalla leen siempre el texto real
      let timer = 0;
      a.addEventListener('mouseenter', () => {
        clearInterval(timer);
        a.style.minWidth = a.getBoundingClientRect().width + 'px';  // sin saltos de ancho mientras se descifra
        let frame = 0;
        const total = original.length * 2 + 6;
        timer = setInterval(() => {
          frame++;
          const revealed = Math.floor(frame / 2);
          a.textContent = [...original].map((ch, i) =>
            ch === ' ' || i < revealed ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
          if (frame >= total) { clearInterval(timer); a.textContent = original; a.style.minWidth = ''; }
        }, 28);
      });
      a.addEventListener('mouseleave', () => { if (timer) { clearInterval(timer); a.textContent = original; a.style.minWidth = ''; } });
    });
  }

  if (!isCuadernos) return;

  /* ---------- 3. grilla interactiva + halo que siguen al cursor (Mis cuadernos) ---------- */
  if (fine && !reduce) {
    const grid = document.createElement('div'); grid.className = 'fx-grid'; grid.setAttribute('aria-hidden', 'true');
    const glow = document.createElement('div'); glow.className = 'fx-glow'; glow.setAttribute('aria-hidden', 'true');
    document.body.prepend(grid, glow);
    let tx = innerWidth / 2, ty = innerHeight / 3, gx = tx, gy = ty, started = false;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      root.style.setProperty('--cx', tx + 'px'); root.style.setProperty('--cy', ty + 'px');
      if (!started) { started = true; root.classList.add('fx-on'); loop(); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('fx-on'));
    document.addEventListener('pointerenter', () => { if (started) root.classList.add('fx-on'); });
    function loop() {   // el halo llega con inercia, la grilla responde al instante
      gx += (tx - gx) * 0.09; gy += (ty - gy) * 0.09;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      requestAnimationFrame(loop);
    }
  }

  /* ---------- 4. animaciones con GSAP (Mis cuadernos) ---------- */
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (!gsap || !ST || reduce) return;
  gsap.registerPlugin(ST);
  root.classList.add('fx-gsap');
  const ease = 'expo.out';

  // título: las letras emergen desde abajo, desenfocadas, una tras otra
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    const split = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach(ch => {
            if (ch === ' ') { frag.append(' '); return; }
            const s = document.createElement('span'); s.className = 'fx-char'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) split(n);
      });
    };
    split(h1);
    gsap.from(h1.querySelectorAll('.fx-char'), { yPercent: 110, opacity: 0, filter: 'blur(10px)', duration: 1.15, ease, stagger: 0.045, delay: 0.15 });
  }

  // cifras del encabezado: cuentan desde cero cuando aparecen
  document.querySelectorAll('.stats b').forEach(b => {
    const end = parseInt(b.textContent, 10);
    if (!end) return;
    const o = { v: 0 };
    b.textContent = '0';
    gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', delay: 0.5, snap: { v: 1 },
      onUpdate: () => { b.textContent = Math.round(o.v); },
      scrollTrigger: { trigger: b, start: 'top 95%', once: true } });
  });

  // tarjeta de invitación: entra con un leve giro 3D y flota apenas con el scroll
  const invite = document.querySelector('.invite');
  if (invite) {
    // GSAP toma la entrada: se quita la aparición original (si no, ambas se pisan y la tarjeta quedaría invisible)
    invite.classList.remove('reveal', 'in');
    gsap.fromTo(invite, { y: 40, rotateX: 12, opacity: 0, transformPerspective: 900 },
      { y: 0, rotateX: 0, opacity: 1, duration: 1.3, ease, delay: 0.45 });
    // la flotación usa otra propiedad (yPercent) para no chocar con la entrada
    gsap.to(invite, { yPercent: -9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // tarjetas: aparecen en cascada a medida que entran en pantalla,
  // también después de buscar o filtrar (las grillas se vuelven a dibujar)
  let batches = [];
  function revealCards() {
    batches.forEach(t => t.kill()); batches = [];
    const cards = document.querySelectorAll('#gridRepo .card, #gridDir .card');
    if (!cards.length) return;
    // la transición CSS de las tarjetas se pausa mientras GSAP las mueve (si no, se traban)
    gsap.set(cards, { opacity: 0, y: 34, scale: 0.97, transition: 'none' });
    batches = ST.batch(cards, {
      start: 'top 94%',
      once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease, stagger: 0.07, overwrite: true, clearProps: 'transform,opacity,transition' })
    });
  }
  let pending = 0;
  const queue = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(() => { revealCards(); ST.refresh(); }); };
  ['gridRepo', 'gridDir'].forEach(id => new MutationObserver(queue).observe(document.getElementById(id), { childList: true }));
  revealCards();

  // al cambiar de pestaña, recalcular posiciones (el panel oculto medía cero)
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => requestAnimationFrame(() => ST.refresh())));
  addEventListener('hashchange', () => requestAnimationFrame(() => ST.refresh()));

  // botones: atracción magnética con retorno elástico
  if (fine) {
    document.querySelectorAll('.btn, .tab').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.35)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.35)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22); yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }
})();
