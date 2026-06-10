/* ============================================================
   Módulo: Máquina Windows Interativa
   O aluno navega por um Windows simulado (Configurações, Serviços,
   Painel de Controle, Adaptadores, Dispositivos, Tarefas, CMD)
   e resolve o objetivo navegando pelo sistema.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.windows = (function () {
  const { el, sound, toast } = HDL.ui;

  // Apps disponíveis na área de trabalho
  const APPS = [
    { id: 'settings', name: 'Configurações', ico: '⚙️' },
    { id: 'services', name: 'Serviços', ico: '🧩' },
    { id: 'control', name: 'Painel de Controle', ico: '🛠️' },
    { id: 'network', name: 'Conexões de Rede', ico: '🌐' },
    { id: 'devmgr', name: 'Ger. de Dispositivos', ico: '🖧' },
    { id: 'taskmgr', name: 'Ger. de Tarefas', ico: '📊' },
    { id: 'cmd', name: 'Prompt de Comando', ico: '⬛' }
  ];

  // Cenários: objetivo + app correto + ação correta
  const scenarios = [
    {
      id: 'WIN-01', xp: 55, tags: ['rede', 'adaptador'],
      objective: 'O usuário ficou sem rede. A placa de rede "Ethernet" foi desabilitada por engano. Reative-a navegando pelo sistema.',
      targetApp: 'network', targetItem: 'Ethernet', action: 'Habilitar',
      success: 'Adaptador Ethernet habilitado. A conexão de rede foi restaurada.',
      explanation: 'Conexões de Rede (ncpa.cpl) lista os adaptadores. Um adaptador desabilitado aparece em cinza; basta clicar com o botão direito → Habilitar. Sempre verifique aqui antes de cogitar troca de hardware.'
    },
    {
      id: 'WIN-02', xp: 55, tags: ['impressora', 'spooler', 'serviços'],
      objective: 'A impressão não funciona em nenhum aplicativo. O serviço "Spooler de Impressão" está parado. Inicie o serviço.',
      targetApp: 'services', targetItem: 'Spooler de Impressão', action: 'Iniciar',
      success: 'Serviço "Spooler de Impressão" iniciado. A fila voltou a processar.',
      explanation: 'Em services.msc, serviços parados aparecem sem status "Em execução". O Spooler é essencial para impressão; inicie-o e configure a inicialização como Automática para evitar reincidência.'
    },
    {
      id: 'WIN-03', xp: 60, tags: ['desempenho', 'cpu', 'tarefas'],
      objective: 'O computador está travado e lento. Um processo está consumindo 98% da CPU. Abra o Gerenciador de Tarefas e finalize o processo culpado.',
      targetApp: 'taskmgr', targetItem: 'CryptoMiner.exe', action: 'Finalizar tarefa',
      success: 'Processo "CryptoMiner.exe" finalizado. A CPU normalizou para 12%.',
      explanation: 'No Gerenciador de Tarefas, ordene por CPU para achar o processo que satura o sistema. Aqui um processo suspeito (CryptoMiner.exe) consumia 98% — finalize-o e, em seguida, investigue malware/persistência (Inicializar, Tarefas Agendadas).'
    }
  ];

  let active = scenarios[0];
  let openApp = null;

  function render(view) {
    openApp = null;
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('monitor', 24), 'Máquina Windows Interativa'),
        el('p', { text: 'Um computador corporativo simulado. Leia o objetivo e resolva navegando pelo sistema — abra a ferramenta certa e execute a ação correta, como faria numa estação real.' })
      )
    );
    view.append(HDL.ui.labMeta([{ icon: 'target', text: 'Objetivo: resolver navegando pelo Windows' }, { icon: 'sliders', text: 'Intermediário' }, { icon: 'clock', text: '~5 min' }, { icon: 'brain', text: 'Serviços, rede, gerenciador de tarefas' }]));

    const seg = el('div', { class: 'seg' });
    scenarios.forEach(sc => {
      const done = HDL.state.get().solvedWindows.includes(sc.id);
      seg.append(el('button', { class: active.id === sc.id ? 'is-active' : '', onclick: () => { active = sc; render(view); } }, (done ? '✓ ' : '') + sc.id));
    });
    view.append(el('div', { class: 'toolbar' }, seg));

    const done = HDL.state.get().solvedWindows.includes(active.id);
    view.append(el('div', { class: 'card', style: 'margin-bottom:16px;border-left:3px solid var(--accent)' },
      el('div', { style: 'display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap' },
        el('strong', { text: '🎯 Objetivo' }),
        done ? el('span', { class: 'chip chip--done', text: '✓ Concluído' }) : el('span', { class: 'chip chip--cat', text: '+' + active.xp + ' XP' })),
      el('p', { style: 'color:var(--text-dim);font-size:14px;line-height:1.6;margin-top:8px', text: active.objective })
    ));

    const desktop = el('div', { class: 'win__desktop' });
    APPS.forEach(app => {
      desktop.append(el('div', { class: 'win-ico', onclick: () => openWindow(app, view) },
        el('span', { text: app.ico }), el('small', { text: app.name })));
    });
    const winRoot = el('div', { id: 'winRoot' });
    const winEl = el('div', { class: 'win' },
      desktop,
      winRoot,
      el('div', { class: 'win__taskbar' },
        el('div', { class: 'win__start' }, el('span', { text: '🪟' }), 'Iniciar'),
        el('div', { class: 'win__clock', text: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) })
      )
    );
    view.append(winEl);
  }

  function openWindow(app, view) {
    sound.click();
    const root = document.getElementById('winRoot');
    root.innerHTML = '';
    const win = el('div', { class: 'win-window' },
      el('div', { class: 'win-window__bar' },
        el('span', { text: app.ico }), el('b', { text: app.name }),
        el('button', { class: 'win-window__close', onclick: () => { root.innerHTML = ''; }, text: '✕' })),
      el('div', { class: 'win-window__body' }, appBody(app, view))
    );
    root.append(win);
  }

  function appBody(app, view) {
    switch (app.id) {
      case 'network': return listApp(networkAdapters(), app, view);
      case 'services': return listApp(servicesList(), app, view);
      case 'taskmgr': return listApp(processes(), app, view);
      case 'settings': return infoApp('Configurações do Windows', ['Sistema', 'Dispositivos', 'Rede e Internet', 'Contas', 'Atualização e Segurança'], app, view);
      case 'control': return infoApp('Painel de Controle', ['Central de Rede e Compartilhamento', 'Programas e Recursos', 'Dispositivos e Impressoras', 'Sistema'], app, view);
      case 'devmgr': return infoApp('Gerenciador de Dispositivos', ['Adaptadores de rede', 'Controladores de vídeo', 'Discos', 'Portas (COM e LPT)'], app, view);
      case 'cmd': return cmdHint();
      default: return el('p', { text: 'Aplicativo indisponível.' });
    }
  }

  /* dados dependentes do cenário */
  function networkAdapters() {
    return [
      { name: 'Ethernet', meta: active.targetApp === 'network' ? 'Desabilitado' : 'Conectado · 1 Gbps', badge: active.targetApp === 'network' ? 'stopped' : 'running', badgeText: active.targetApp === 'network' ? 'Desabilitado' : 'Ativo', actions: active.targetApp === 'network' ? ['Habilitar', 'Propriedades'] : ['Desabilitar', 'Propriedades'] },
      { name: 'Wi-Fi', meta: 'Não conectado', badge: 'stopped', badgeText: 'Inativo', actions: ['Habilitar', 'Propriedades'] }
    ];
  }
  function servicesList() {
    const spoolerStopped = active.targetApp === 'services';
    return [
      { name: 'Spooler de Impressão', meta: spoolerStopped ? 'Parado · Automático' : 'Em execução · Automático', badge: spoolerStopped ? 'stopped' : 'running', badgeText: spoolerStopped ? 'Parado' : 'Em execução', actions: spoolerStopped ? ['Iniciar', 'Propriedades'] : ['Parar', 'Reiniciar'] },
      { name: 'DHCP Client', meta: 'Em execução · Automático', badge: 'running', badgeText: 'Em execução', actions: ['Parar', 'Reiniciar'] },
      { name: 'DNS Client', meta: 'Em execução · Automático', badge: 'running', badgeText: 'Em execução', actions: ['Parar', 'Reiniciar'] },
      { name: 'Windows Update', meta: 'Em execução · Manual', badge: 'running', badgeText: 'Em execução', actions: ['Parar', 'Reiniciar'] }
    ];
  }
  function processes() {
    const miner = active.targetApp === 'taskmgr';
    const list = [
      { name: 'explorer.exe', meta: 'CPU 2% · 88 MB', badge: 'running', badgeText: 'Ativo', actions: ['Finalizar tarefa'] },
      { name: 'chrome.exe', meta: 'CPU 6% · 420 MB', badge: 'running', badgeText: 'Ativo', actions: ['Finalizar tarefa'] },
      { name: 'OUTLOOK.exe', meta: 'CPU 3% · 310 MB', badge: 'running', badgeText: 'Ativo', actions: ['Finalizar tarefa'] }
    ];
    if (miner) list.unshift({ name: 'CryptoMiner.exe', meta: 'CPU 98% · 540 MB', badge: 'stopped', badgeText: 'Suspeito', actions: ['Finalizar tarefa', 'Abrir local do arquivo'] });
    return list;
  }

  function listApp(items, app, view) {
    const wrap = el('div', { class: 'win-list' });
    items.forEach(it => {
      const isTarget = app.id === active.targetApp && it.name === active.targetItem;
      const row = el('div', { class: 'win-row' + (isTarget ? ' is-target' : '') },
        el('span', { class: 'win-row__ico', text: app.id === 'network' ? '🔌' : app.id === 'services' ? '🧩' : '📦' }),
        el('div', { style: 'flex:1' },
          el('div', { class: 'win-row__name', text: it.name }),
          el('div', { class: 'win-row__meta', text: it.meta })),
        el('span', { class: 'win-badge ' + it.badge, text: it.badgeText })
      );
      const acts = el('div', { style: 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap' });
      it.actions.forEach(a => {
        acts.append(el('button', { class: 'btn btn--sm', onclick: (e) => { e.stopPropagation(); doAction(app, it, a, view); } }, a));
      });
      wrap.append(el('div', {}, row, acts));
    });
    return wrap;
  }

  function infoApp(title, items, app, view) {
    const wrap = el('div', {});
    wrap.append(el('p', { style: 'color:var(--text-dim);margin-bottom:10px', text: title }));
    const list = el('div', { class: 'win-list' });
    items.forEach(label => {
      list.append(el('div', { class: 'win-row', onclick: () => doAction(app, { name: label }, 'open', view) },
        el('span', { class: 'win-row__ico', text: '📁' }), el('div', { class: 'win-row__name', text: label }), el('span', { style: 'color:var(--text-mute)', text: '›' })));
    });
    wrap.append(list);
    wrap.append(el('p', { style: 'color:var(--text-mute);font-size:12px;margin-top:12px', text: 'Dica: a ferramenta certa para este objetivo pode ser outra. Explore os ícones da área de trabalho.' }));
    return wrap;
  }

  function cmdHint() {
    return el('div', {},
      el('p', { style: 'color:var(--text-dim);line-height:1.6', text: 'O Prompt de Comando completo fica no módulo “Terminal Interativo”, com cenários investigativos próprios.' }),
      el('button', { class: 'btn btn--primary', style: 'margin-top:12px', onclick: () => location.hash = '#terminal' }, '⌨️ Abrir Terminal Interativo')
    );
  }

  function doAction(app, item, action, view) {
    const isCorrect = app.id === active.targetApp && item.name === active.targetItem && action === active.action;
    if (isCorrect) {
      sound.success();
      HDL.state.recordAttempt({ correct: true, tags: active.tags, category: 'Windows' });
      const first = HDL.state.solveWindows(active.id, { xp: active.xp, points: active.xp, reason: `Desafio Windows ${active.id} resolvido` });
      HDL.ui.modal({
        title: '✅ Objetivo concluído', sub: active.id,
        body: el('div', {},
          el('div', { class: 'explain is-ok' }, el('h4', {}, HDL.ui.icon('check-circle', 17), ' ' + active.success), el('p', { text: active.explanation }), el('div', { class: 'reward', text: `+${active.xp} XP · +${active.xp} pontos` })),
        ), width: 560
      });
    } else if (action === 'open' || action === 'Propriedades') {
      toast({ ico: 'ℹ️', title: item.name, msg: 'Você abriu este item, mas não é a ação que resolve o objetivo.' }, 2600);
      sound.click();
    } else {
      sound.error();
      HDL.state.recordAttempt({ correct: false, tags: active.tags, category: 'Windows' });
      toast({ ico: '⚠️', title: 'Ação incorreta', msg: `"${action}" em "${item.name}" não resolve o objetivo. Reveja o que se pede.` }, 3200);
    }
  }

  return { render };
})();
