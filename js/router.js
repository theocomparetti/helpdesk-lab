/* ============================================================
   Help Desk Lab — Roteador (hash routing)
   ============================================================ */
window.HDL = window.HDL || {};

HDL.router = (function () {
  const routes = ['dashboard', 'tickets', 'diagnostics', 'terminal', 'network', 'daily', 'knowledge', 'achievements',
    'monitoring', 'windows', 'interview', 'sla', 'pressure', 'performance', 'certifications', 'surprise',
    'emails', 'incident', 'remote', 'logs', 'assistant', 'meeting', 'careers', 'history', 'executive', 'missions', 'daylife', 'quick'];
  let current = null;

  function go(route) {
    if (!routes.includes(route)) route = 'dashboard';
    // encerra o módulo anterior (para timers/estado vivo e evitar vazamentos)
    if (current && current !== route && HDL.modules[current] && typeof HDL.modules[current].teardown === 'function') {
      try { HDL.modules[current].teardown(); } catch (e) { /* noop */ }
    }
    current = route;
    if (HDL.state && HDL.state.setLastRoute) HDL.state.setLastRoute(route);
    const view = document.getElementById('view');
    view.classList.remove('view-enter');
    void view.offsetWidth; // reflow para reiniciar animação
    view.classList.add('view-enter');

    const mod = HDL.modules[route];
    if (mod && typeof mod.render === 'function') mod.render(view);

    // nav ativa (lateral + inferior)
    document.querySelectorAll('.nav__item').forEach(n => {
      n.classList.toggle('is-active', n.dataset.route === route);
    });
    document.querySelectorAll('.bottom-nav__item').forEach(n => {
      n.classList.toggle('is-active', n.dataset.route === route);
    });
    // fecha sidebar no mobile
    document.getElementById('sidebar').classList.remove('is-open');
    document.getElementById('backdrop').classList.remove('is-open');
    view.scrollTop = 0;
  }

  function parseHash() {
    const r = (location.hash || '#dashboard').replace('#', '');
    go(r);
  }

  function init() {
    window.addEventListener('hashchange', parseHash);
    parseHash();
  }

  return { init, go, get current() { return current; } };
})();
