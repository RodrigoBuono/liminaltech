/* Decide, antes del primer cuadro, si se muestra la intro de la cúpula.
   Se muestra cada vez que se abre la web o se recarga la página.
   No se repite al volver al inicio desde otra página del sitio (ni con "atrás").
   ?intro=1 la fuerza · ?intro=0 la omite. Solo se descarga si se va a mostrar. */
(function () {
  try {
    var q = location.search, h = document.documentElement;
    if (/[?&]intro=0/.test(q)) return;
    var force = /[?&]intro=1/.test(q);
    var off = false;
    try { off = localStorage.getItem('rb-intro') === 'off'; } catch (e) { /* almacenamiento bloqueado */ }
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
    var type = nav.type || 'navigate';
    var internal = false;
    try { internal = type !== 'reload' && !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) { /* nada */ }
    if (!force && (off || internal || type === 'back_forward')) return;
    if (!window.WebGLRenderingContext) return;
    h.classList.add('intro-pending');
    var l = document.createElement('link'); l.rel = 'preload'; l.as = 'image'; l.href = '/intro/earth.webp'; document.head.appendChild(l);
    var s = document.createElement('script');
    s.type = 'module'; s.src = '/intro.js';
    s.onerror = function () { h.classList.remove('intro-pending'); };
    document.head.appendChild(s);
    // si la red es muy lenta, no se retiene a nadie frente a una pantalla negra
    setTimeout(function () { if (!window.__introStarted) h.classList.remove('intro-pending'); }, 9000);
  } catch (e) { /* ante cualquier error, la web se muestra normal */ }
})();
