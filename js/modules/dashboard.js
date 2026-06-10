/* ============================================================
   Módulo: Home / Hub principal
   Hub guiado com cartões por categoria, jornada inicial,
   recomendações e botão "Começar agora".
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.dashboard = (function () {
  const { el, timeAgo } = HDL.ui;
  const { tickets, diagnostics, networkLabs, achievements, knowledge,
    monitoringAlerts, interviewQuestions, slaScenarios, surpriseScenarios, company, certifications } = HDL.data;

  /* Catálogo completo de módulos por categoria (tudo acessível pela Home) */
  const CATALOG = {
    'Treinamento': [
      { route: 'tickets', ico: 'ticket', title: 'Resolver Chamados', desc: 'Resolva problemas reais de suporte técnico e ganhe experiência.', cta: 'Iniciar', level: 'ini', featured: true },
      { route: 'daylife', ico: 'building', title: 'Dia na Vida do Analista', desc: 'Simule um dia completo trabalhando em uma equipe de suporte.', cta: 'Iniciar Jornada', level: 'ini', featured: true },
      { route: 'interview', ico: 'mic', title: 'Simulador de Entrevistas', desc: 'Treine para entrevistas técnicas de Help Desk e Suporte.', cta: 'Começar', level: 'ini' },
      { route: 'pressure', ico: 'flame', title: 'Modo Pressão', desc: 'Resolva uma fila cronometrada de chamados sob pressão.', cta: 'Jogar', level: 'int' },
      { route: 'incident', ico: 'alert', title: 'Incidente Crítico', desc: 'Gerencie um incidente P1 de alto impacto contra o relógio.', cta: 'Encarar', level: 'adv' },
      { route: 'surprise', ico: 'layers', title: 'Desafios Surpresa', desc: 'Cenários reais em que um sintoma esconde várias causas.', cta: 'Investigar', level: 'adv' }
    ],
    'Laboratórios': [
      { route: 'terminal', ico: 'terminal', title: 'Terminal CMD', desc: 'Investigue problemas utilizando comandos reais.', cta: 'Abrir Laboratório', level: 'ini', featured: true },
      { route: 'network', ico: 'globe', title: 'Laboratório de Redes', desc: 'Diagnostique e corrija problemas de infraestrutura.', cta: 'Acessar', level: 'int' },
      { route: 'windows', ico: 'monitor', title: 'Máquina Windows', desc: 'Resolva desafios navegando pelo sistema operacional.', cta: 'Acessar', level: 'int' },
      { route: 'remote', ico: 'cast', title: 'Acesso Remoto', desc: 'Atenda à distância coletando evidências na máquina do usuário.', cta: 'Conectar', level: 'int' },
      { route: 'diagnostics', ico: 'stethoscope', title: 'Simulador de Diagnóstico', desc: 'Encontre a causa raiz a partir dos sintomas e pistas.', cta: 'Diagnosticar', level: 'ini' },
      { route: 'logs', ico: 'file', title: 'Análise de Logs', desc: 'Encontre a causa nos logs de Windows, aplicação e rede.', cta: 'Analisar', level: 'adv' }
    ],
    'Operação': [
      { route: 'monitoring', ico: 'activity', title: 'Monitoramento (NOC)', desc: 'Acompanhe serviços e resolva alertas críticos da empresa.', cta: 'Abrir NOC', level: 'int' },
      { route: 'emails', ico: 'mail', title: 'Central de E-mails', desc: 'Interprete e classifique as demandas dos usuários.', cta: 'Abrir caixa', level: 'ini' },
      { route: 'sla', ico: 'clock', title: 'Simulador de SLA', desc: 'Priorize chamados por impacto × urgência.', cta: 'Treinar', level: 'ini' }
    ],
    'Carreira': [
      { route: 'careers', ico: 'compass', title: 'Trilhas de Carreira', desc: 'Evolua de Estagiário a Especialista em Suporte.', cta: 'Ver trilhas' },
      { route: 'achievements', ico: 'trophy', title: 'Conquistas', desc: 'Colecione badges — incluindo conquistas ocultas.', cta: 'Ver' },
      { route: 'certifications', ico: 'award', title: 'Certificações', desc: 'Emita certificados internos de competência.', cta: 'Ver' },
      { route: 'executive', ico: 'dashboard', title: 'Painel Executivo', desc: 'Indicadores de gestor: SLA, satisfação e eficiência.', cta: 'Ver painel' },
      { route: 'performance', ico: 'barchart', title: 'Análise de Desempenho', desc: 'Seu raio-x: precisão, pontos fortes e a melhorar.', cta: 'Ver' },
      { route: 'meeting', ico: 'users', title: 'Reunião com Gestores', desc: 'Justifique decisões com visão de negócio.', cta: 'Treinar', level: 'adv' }
    ],
    'Aprendizado': [
      { route: 'knowledge', ico: 'book', title: 'Base de Conhecimento', desc: 'Aprenda conceitos importantes de TI.', cta: 'Explorar', featured: true },
      { route: 'assistant', ico: 'bot', title: 'IA Analista', desc: 'Tire dúvidas técnicas com o assistente virtual.', cta: 'Conversar' },
      { route: 'history', ico: 'folder', title: 'Casos Resolvidos', desc: 'Revise diagnósticos e soluções de atendimentos passados.', cta: 'Abrir' },
      { route: 'daily', ico: 'calendar', title: 'Desafio Diário', desc: 'Um novo desafio por dia, com XP bônus.', cta: 'Jogar' },
      { route: 'missions', ico: 'target', title: 'Missões', desc: 'Metas semanais e mensais com recompensas.', cta: 'Ver' }
    ]
  };
  const LVL = { ini: ['lvl-ini', 'Iniciante'], int: ['lvl-int', 'Intermediário'], adv: ['lvl-adv', 'Avançado'] };
  const go = (route) => { location.hash = '#' + route; };

  function render(view) {
    const s = HDL.state.get();
    const lvl = HDL.state.levelInfo();
    view.innerHTML = '';

    view.append(hero(s, lvl));

    view.append(missionOfDay(s));

    view.append(engageRow(s, lvl));

    const journeyEl = journey(s);
    if (journeyEl) view.append(journeyEl);

    // Categorias com cartões grandes
    Object.entries(CATALOG).forEach(([cat, items]) => {
      view.append(el('div', { class: 'hub-catbar' },
        el('h2', { text: cat }),
        el('div', { class: 'line' }),
        el('span', { style: 'font-size:12px;color:var(--text-mute)', text: items.length + ' recursos' })));
      const grid = el('div', { class: 'hub-grid' });
      items.forEach(it => grid.append(hubCard(it, s)));
      view.append(grid);
    });

    // Resumo recolhível (progresso + ranking + atividade)
    view.append(summary(s, lvl));
  }

  /* ---------- Hero ---------- */
  function hero(s, lvl) {
    const totalChallenges = tickets.length + diagnostics.length + networkLabs.length
      + monitoringAlerts.length + interviewQuestions.length + slaScenarios.length + surpriseScenarios.length;
    const done = s.solvedTickets.length + s.solvedDiagnostics.length + s.solvedLabs.length
      + s.solvedMonitoring.length + s.solvedInterview.length + s.solvedSla.length + s.solvedSurprise.length;
    const name = HDL.state.displayName();
    const firstTime = done === 0;

    return el('div', { class: 'hub-hero' },
      el('div', { class: 'hub-hero__eyebrow', text: company.name + ' · Central de Treinamento' }),
      el('h1', { text: (firstTime ? 'Bem-vindo, ' : 'Olá de novo, ') + name }),
      el('p', { text: firstTime
        ? 'Esta é uma plataforma prática para você aprender e treinar Suporte Técnico e Help Desk resolvendo problemas reais. Não sabe por onde começar? É só clicar abaixo.'
        : 'Pronto para continuar evoluindo? Escolha um treino, retome de onde parou ou siga a recomendação do dia.' }),
      el('div', { class: 'hub-hero__actions' },
        el('button', { class: 'btn btn--lg btn--cta', onclick: startNow }, HDL.ui.icon('rocket', 18), 'Começar agora'),
        firstTime ? null : el('button', { class: 'btn btn--lg', onclick: continueWhere }, HDL.ui.icon('rotate', 16), 'Continuar de onde parei')
      ),
      el('div', { class: 'hub-hero__stats' },
        heroStat(lvl.level, 'Nível'),
        heroStat(s.points, 'Pontos'),
        heroStat(done + '/' + totalChallenges, 'Desafios'),
        heroStat(s.unlockedAchievements.length, 'Conquistas'),
        el('div', { class: 'hub-hero__xp' },
          el('div', { class: 'bar' }, el('span', { style: 'width:' + lvl.pct + '%' })),
          el('small', { text: lvl.next ? `${lvl.rank} · ${lvl.xpIntoLevel}/${lvl.xpForNext} XP para o nível ${lvl.level + 1}` : 'Nível máximo — ' + lvl.rank })
        )
      )
    );
  }
  function heroStat(v, label) { return el('div', { class: 'hub-hero__stat' }, el('b', { text: v }), el('span', { text: label })); }

  /* índice plano rota → cartão do catálogo */
  const ROUTE_INDEX = (() => { const m = {}; Object.values(CATALOG).forEach(arr => arr.forEach(it => m[it.route] = it)); return m; })();

  /* ---------- Engajamento: streak, meta, continuar, progressão ---------- */
  function engageRow(s, lvl) {
    const row = el('div', { class: 'engage-row' });
    const streak = s.streak || { count: 0, best: 0 };
    const daily = HDL.state.dailyInfo();

    const ic = (n, sz) => HDL.ui.icon(n, sz || 16);

    // Streak
    row.append(el('div', { class: 'streak-card' },
      el('span', { class: 'streak-flame' }, ic('flame', 32)),
      el('div', {},
        el('b', { text: streak.count + (streak.count === 1 ? ' dia' : ' dias') }),
        el('div', {}, el('small', { text: streak.count > 0 ? 'de sequência · recorde ' + (streak.best || streak.count) : 'Comece sua sequência hoje!' })))));

    // Meta diária
    const gpct = Math.min(100, Math.round(daily.solved / daily.goal * 100));
    row.append(el('div', { class: 'goal-card' },
      el('div', { class: 'goal-card__top' }, el('b', {}, ic('target'), ' Meta diária'), el('span', { text: daily.solved + '/' + daily.goal })),
      el('div', { class: 'bar bar--green', style: 'margin-top:10px' }, el('span', { style: 'width:' + gpct + '%' })),
      el('div', { style: 'margin-top:8px;font-size:12px;color:var(--text-mute)', text: daily.solved >= daily.goal ? 'Concluída — +40 XP recebidos!' : `Resolva ${daily.goal - daily.solved} desafio(s) hoje · +40 XP` })));

    // Continuar de onde parou (ou Treino Relâmpago)
    const resume = s.lastRoute && ROUTE_INDEX[s.lastRoute];
    if (resume) {
      row.append(el('div', { class: 'resume-card', onclick: () => go(s.lastRoute) },
        el('div', { class: 'resume-card__tag', text: 'Continuar de onde parou' }),
        el('div', { class: 'resume-card__title' }, ic(resume.ico, 18), ' ', resume.title),
        el('div', { class: 'resume-card__go', text: 'Retomar →' })));
    } else {
      row.append(el('div', { class: 'resume-card', onclick: () => go('quick') },
        el('div', { class: 'resume-card__tag', text: 'Treino rápido' }),
        el('div', { class: 'resume-card__title' }, ic('zap', 18), ' Treino Relâmpago'),
        el('div', { class: 'resume-card__go', text: '5 min · começar →' })));
    }

    // Progressão visível
    const nextAch = achievements.find(a => !a.hidden && !s.unlockedAchievements.includes(a.id));
    const nextCert = certifications.find(c => !s.certificates.includes(c.id));
    row.append(el('div', { class: 'prog-card' },
      el('b', { style: 'font-size:14px' }, ic('trending'), ' Sua evolução'),
      el('div', { class: 'row' }, el('span', { class: 'ico' }, ic('trophy')), el('span', {}, 'Nível ', el('b', { text: lvl.level }), ' — ', lvl.rank), el('span', { class: 'spacer' }), el('span', { style: 'color:var(--text-mute);font-size:12px', text: lvl.next ? lvl.xpIntoLevel + '/' + lvl.xpForNext + ' XP' : 'máx' })),
      nextAch ? el('div', { class: 'row' }, el('span', { class: 'ico' }, ic('award')), el('span', {}, 'Próxima conquista: ', el('b', { text: nextAch.name }))) : null,
      nextCert ? el('div', { class: 'row' }, el('span', { class: 'ico' }, ic('award')), el('span', {}, 'Próxima certificação: ', el('b', { text: nextCert.name }))) : null
    ));

    return row;
  }

  /* ---------- Jornada inicial (onboarding guiado) ---------- */
  function journey(s) {
    const steps = [
      { done: s.solvedTickets.length >= 1, t: 'Resolva seu 1º chamado', d: 'Vá à Central de Chamados e atenda um usuário.', route: 'tickets', start: true },
      { done: s.terminalSolved.length >= 1, t: 'Use o Terminal', d: 'Investigue um cenário com comandos reais.', route: 'terminal' },
      { done: HDL.state.levelInfo().level >= 2, t: 'Ganhe XP e suba de nível', d: 'Acumule experiência resolvendo desafios.', route: 'tickets' },
      { done: s.unlockedAchievements.length >= 1, t: 'Desbloqueie uma conquista', d: 'Suas ações liberam badges automaticamente.', route: 'achievements' }
    ];
    const completed = steps.filter(x => x.done).length;
    if (completed === steps.length) return null; // some quando a jornada termina
    const pct = Math.round((completed / steps.length) * 100);

    const wrap = el('div', { class: 'journey' },
      el('div', { class: 'journey__head' },
        el('strong', {}, HDL.ui.icon('compass', 16), ' Primeiros passos — comece por aqui'),
        el('span', { class: 'level-tag', text: completed + '/' + steps.length + ' concluídos' })),
      el('div', { class: 'bar bar--green', style: 'margin-top:10px' }, el('span', { style: 'width:' + pct + '%' })));
    const grid = el('div', { class: 'journey__steps' });
    steps.forEach((st, i) => {
      grid.append(el('div', { class: 'journey-step' + (st.done ? ' done' : ''), onclick: () => { if (!st.done) (st.start ? startNow() : go(st.route)); } },
        el('div', { class: 'journey-step__num', text: st.done ? '✓' : (i + 1) }),
        el('div', { class: 'journey-step__txt' }, el('b', { text: st.t }), el('span', { text: st.d }))));
    });
    wrap.append(grid);
    return wrap;
  }

  /* ---------- Missão do Dia (foco imediato) ---------- */
  const MISSIONS = [
    { ico: 'stethoscope', title: 'Diagnosticar uma falha de DNS', desc: 'Use as pistas para encontrar a causa raiz de um problema de DNS.', route: 'diagnostics', cta: 'Diagnosticar', check: s => s.solvedDiagnostics.some(id => { const d = diagnostics.find(x => x.id === id); return d && (d.tags || []).includes('dns'); }) },
    { ico: 'alert', title: 'Atender um chamado crítico', desc: 'Resolva um chamado de prioridade crítica — alto impacto para a empresa.', route: 'tickets', cta: 'Atender', critical: true, check: s => s.solvedTickets.some(id => { const t = tickets.find(x => x.id === id); return t && t.priority === 'critical'; }) },
    { ico: 'shield', title: 'Resolver o alerta da VPN no NOC', desc: 'Identifique a causa da instabilidade da VPN corporativa.', route: 'monitoring', cta: 'Investigar', check: s => s.solvedMonitoring.includes('NOC-02') },
    { ico: 'terminal', title: 'Investigar um cenário no Terminal', desc: 'Use comandos reais (ping, nslookup, ipconfig) para achar a causa.', route: 'terminal', cta: 'Abrir terminal', check: s => s.terminalSolved.length >= 1 },
    { ico: 'building', title: 'Concluir um expediente no Dia na Vida', desc: 'Trabalhe um dia inteiro como analista de suporte.', route: 'daylife', cta: 'Iniciar jornada', check: s => (s.daylifeRuns || []).length >= 1 },
    { ico: 'globe', title: 'Corrigir uma configuração de rede', desc: 'Restaure a conectividade ajustando IP, máscara, gateway ou DNS.', route: 'network', cta: 'Acessar lab', check: s => s.solvedLabs.length >= 1 },
    { ico: 'zap', title: 'Fazer um Treino Relâmpago', desc: '5 desafios variados em 5 minutos para aquecer o raciocínio.', route: 'quick', cta: 'Começar treino', check: s => (s.quickRuns || []).length >= 1 }
  ];
  function missionOfDay(s) {
    const d = new Date();
    const key = `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
    let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    const m = MISSIONS[h % MISSIONS.length];
    const done = m.check(s);
    const action = () => {
      if (m.critical) { const ct = tickets.find(t => t.priority === 'critical' && !s.solvedTickets.includes(t.id)); if (ct) { openTicket(ct.id); return; } }
      go(m.route);
    };
    return el('div', { class: 'mission-banner' + (done ? ' is-done' : ''), onclick: action },
      el('div', { class: 'mission-banner__ico' }, HDL.ui.icon(done ? 'check' : m.ico, 28)),
      el('div', { class: 'mission-banner__body' },
        el('div', { class: 'mission-banner__eyebrow', text: done ? 'Missão do dia concluída' : 'Missão do dia' }),
        el('div', { class: 'mission-banner__title', text: m.title }),
        el('div', { class: 'mission-banner__desc', text: done ? 'Mandou bem! Volte amanhã para uma nova missão — ou refaça este desafio quando quiser.' : m.desc })),
      el('button', { class: 'btn ' + (done ? '' : 'btn--cta'), onclick: (e) => { e.stopPropagation(); action(); } }, done ? 'Refazer' : (m.cta + ' →')));
  }

  /* ---------- Cartão grande do catálogo ---------- */
  function hubCard(it, s) {
    const progress = moduleProgress(it.route, s);
    const card = el('div', { class: 'hub-card' + (it.featured ? ' hub-card--featured' : '') },
      el('div', { class: 'hub-card__ico' }, HDL.ui.icon(it.ico, 24)),
      el('div', { class: 'hub-card__title', text: it.title }),
      el('div', { class: 'hub-card__desc', text: it.desc }),
      el('div', { class: 'hub-card__foot' },
        el('button', { class: 'btn btn--sm btn--primary', onclick: () => (it.route === 'tickets' && progress && progress.done === 0) ? startNow() : go(it.route) }, it.cta + ' →'),
        rightTag(it, progress)
      ));
    return card;
  }
  function rightTag(it, progress) {
    if (progress && progress.total) {
      if (progress.done >= progress.total) return el('span', { class: 'chip chip--done', text: '✓ Completo' });
      if (progress.done > 0) return el('span', { class: 'chip chip--cat', text: progress.done + '/' + progress.total });
    }
    if (it.level && LVL[it.level]) return el('span', { class: 'lvl-badge ' + LVL[it.level][0], text: LVL[it.level][1] });
    return el('span', {});
  }
  function moduleProgress(route, s) {
    const map = {
      tickets: [s.solvedTickets.length, tickets.length],
      diagnostics: [s.solvedDiagnostics.length, diagnostics.length],
      network: [s.solvedLabs.length, networkLabs.length],
      monitoring: [s.solvedMonitoring.length, monitoringAlerts.length],
      interview: [s.solvedInterview.length, interviewQuestions.length],
      sla: [s.solvedSla.length, slaScenarios.length],
      surprise: [s.solvedSurprise.length, surpriseScenarios.length],
      knowledge: [s.kbRead.length, knowledge.length],
      achievements: [s.unlockedAchievements.length, achievements.length],
      certifications: [s.certificates.length, certifications.length]
    };
    const v = map[route];
    return v ? { done: v[0], total: v[1] } : null;
  }

  /* ---------- Ações de navegação guiada ---------- */
  function startNow() {
    HDL.ui.sound.click();
    const s = HDL.state.get();
    const firstTicket = tickets.find(t => !s.solvedTickets.includes(t.id));
    if (firstTicket) openTicket(firstTicket.id);
    else go('daylife');
  }
  const continueWhere = startNow;
  function openTicket(id) {
    go('tickets');
    setTimeout(() => { if (HDL.modules.tickets && HDL.modules.tickets.openById) HDL.modules.tickets.openById(id); }, 320);
  }

  /* ---------- Resumo recolhível ---------- */
  function summary(s, lvl) {
    const totalChallenges = tickets.length + diagnostics.length + networkLabs.length;
    const doneChallenges = s.solvedTickets.length + s.solvedDiagnostics.length + s.solvedLabs.length;
    const det = el('details', { class: 'hub-summary card', style: 'margin-top:28px;padding:6px 18px 18px' });
    det.append(el('summary', {}, el('span', { class: 'arrow', text: '›' }), ' Seu progresso, ranking e atividade'));

    const inner = el('div', { style: 'margin-top:12px' });
    // mini progressos
    inner.append(el('div', { class: 'grid grid--stats' },
      miniProg('Chamados', s.solvedTickets.length, tickets.length),
      miniProg('Diagnósticos', s.solvedDiagnostics.length, diagnostics.length),
      miniProg('Lab. de Redes', s.solvedLabs.length, networkLabs.length),
      miniProg('Artigos lidos', s.kbRead.length, knowledge.length)));

    const cols = el('div', { class: 'two-col', style: 'margin-top:18px' });
    // atividade
    const act = el('div', { class: 'card' }, el('strong', { style: 'font-size:14px', text: 'Atividade recente' }));
    if (!s.activity.length) act.append(el('p', { style: 'color:var(--text-mute);font-size:13px;margin-top:10px', text: 'Nada ainda — resolva seu primeiro desafio!' }));
    else s.activity.slice(0, 6).forEach(a => act.append(el('div', { class: 'list-row' },
      el('span', { class: 'ico', text: a.ico }), el('span', { text: a.text }), el('span', { class: 'spacer' }), el('span', { class: 'when', text: timeAgo(a.ts) }))));
    cols.append(act, buildRanking(s));
    inner.append(cols);
    det.append(inner);
    return det;
  }

  function buildRanking(s) {
    const me = { name: HDL.state.displayName() + ' (você)', role: HDL.state.levelInfo().rank, points: s.points, you: true };
    const all = [...HDL.data.rankingSeed.map(r => ({ ...r })), me].sort((a, b) => b.points - a.points);
    const card = el('div', { class: 'card' }, el('strong', { style: 'font-size:14px' }, HDL.ui.icon('trophy', 15), ' Ranking'));
    all.forEach((r, i) => {
      const posCls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
      card.append(el('div', { class: 'rank-row' + (r.you ? ' is-you' : '') },
        el('span', { class: 'rank-pos ' + posCls, text: medal }),
        el('span', { class: 'rank-name' }, el('b', { text: r.name }), ' ', el('small', { text: '· ' + r.role })),
        el('span', { class: 'rank-pts', text: r.points + ' pts' })));
    });
    return card;
  }

  function miniProg(label, done, total) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return el('div', {},
      el('div', { style: 'display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;color:var(--text-dim)' },
        el('span', { text: label }), el('span', { text: `${done}/${total}` })),
      el('div', { class: 'bar' }, el('span', { style: `width:${pct}%` })));
  }

  return { render };
})();
