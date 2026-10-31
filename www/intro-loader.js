/* Decide, antes del primer cuadro, si se muestra la intro de la esclusa.
   Se muestra la primera vez que alguien abre la web en ese navegador.
   ?intro=1 la fuerza (para volver a verla) · ?intro=0 la omite.
   Nunca con "reducir movimiento" ni sin WebGL. Solo se descarga si se va a mostrar. */
(function () {
  try {
    var q = location.search, h = document.documentElement;
    if (/[?&]intro=0/.test(q)) return;
    var force = /[?&]intro=1/.test(q), seen = false;
    try { seen = localStorage.getItem('rb-intro') === '1'; } catch (e) { /* almacenamiento bloqueado */ }
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!force && (seen || reduce)) return;
    if (!window.WebGLRenderingContext) return;
    h.classList.add('intro-pending');
    var l = document.createElement('link'); l.rel = 'preload'; l.as = 'image'; l.href = '/intro/earth.webp'; document.head.appendChild(l);
    var s = document.createElement('script');
    s.type = 'module'; s.src = '/intro.js';
    s.onerror = function () { h.classList.remove('intro-pending'); };
    document.head.appendChild(s);
    // si la red es muy lenta, no se retiene a nadie frente a una pantalla negra
    setTimeout(function () { if (!window.__introStarted) h.classList.remove('intro-pending'); }, 7000);
  } catch (e) { /* ante cualquier error, la web se muestra normal */ }
})();
