'use strict';
/*
 * Carrega o código REAL do app (data + state) num contexto Node isolado,
 * com stubs mínimos de window / localStorage / HDL.ui — sem modificar o app.
 * Cada chamada de loadApp() devolve um estado limpo e independente.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadApp(seedProgress) {
  let store = {};
  const localStorage = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
  // permite simular um progresso já salvo (ex.: save "antigo") antes do state.js carregar
  if (seedProgress) store['hdl_progress_v1'] = JSON.stringify(seedProgress);

  const ctx = {
    console,
    localStorage,
    setTimeout, clearTimeout,
    requestAnimationFrame: (cb) => cb()
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  const run = (file) =>
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });

  // Conteúdo (cria HDL.data e suas extensões)
  run('js/data.js');
  run('js/data-phase3.js');
  run('js/data-daylife.js');

  // Stub mínimo de HDL.ui (sons/toasts) usado pelo state em award/checkAchievements
  ctx.HDL.ui = {
    sound: new Proxy({}, { get: () => () => {} }),
    toast: () => {},
    modal: () => ({ close: () => {} })
  };

  // Estado (o que estamos testando)
  run('js/state.js');

  return { HDL: ctx.HDL, localStorage };
}

module.exports = { loadApp };
