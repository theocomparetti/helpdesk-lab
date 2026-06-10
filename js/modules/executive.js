/* ============================================================
   Módulo: Painel Executivo (visão de gestor de TI)
   Inclui o Painel de Impacto (consequências das decisões).
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.executive = (function () {
  const { el } = HDL.ui;
  const D = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    const a = HDL.state.analytics();
    const c = s.corp;

    const incidentsResolved = s.solvedTickets.length + s.solvedDiagnostics.length + s.solvedMonitoring.length
      + s.solvedIncidents.length + s.solvedLogs.length + (s.solvedRemote ? s.solvedRemote.length : 0) + s.solvedSurprise.length;
    const slaTotal = c.slaOnTime + c.slaLate;
    const slaPct = slaTotal ? Math.round((c.slaOnTime / slaTotal) * 100) : 100;
    const efficiency = a.accuracy;
    const goodRatio = c.decisions ? Math.round((c.goodDecisions / c.decisions) * 100) : 0;

    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('dashboard', 24), 'Painel Executivo'),
        el('p', {}, el('strong', { style: 'color:var(--text)', text: D.company.name }), ' — visão de gestor de TI. Indicadores de operação, qualidade e satisfação, no formato que diretores e gestores acompanham.')
      )
    );

    // KPIs principais
    const grid = el('div', { class: 'exec-grid' });
    grid.append(
      kpi('Incidentes resolvidos', incidentsResolved, 'casos tratados no total', 'sliders'),
      gauge('Satisfação dos usuários', c.satisfaction, satColor(c.satisfaction), c.satisfaction >= 80 ? 'Excelente' : c.satisfaction >= 60 ? 'Boa' : c.satisfaction >= 40 ? 'Atenção' : 'Crítica'),
      gauge('SLA cumprido', slaPct, slaPct >= 80 ? 'var(--green)' : slaPct >= 50 ? 'var(--amber)' : 'var(--red)', slaTotal ? `${c.slaOnTime} no prazo / ${c.slaLate} atrasados` : 'sem incidentes cronometrados'),
      kpi('Tempo médio de atend.', a.avgTimeSec + 's', 'por desafio resolvido', 'clock'),
      gauge('Eficiência operacional', efficiency, efficiency >= 75 ? 'var(--green)' : efficiency >= 50 ? 'var(--amber)' : 'var(--red)', `taxa de acerto (${s.stats.correct}/${s.stats.attempts || 0})`),
      kpi('Certificações', `${s.certificates.length}/${D.certifications.length}`, 'trilhas de competência', 'award')
    );
    view.append(grid);

    // Painel de Impacto
    view.append(el('div', { class: 'section-title', text: 'Painel de Impacto — consequências das suas decisões' }));
    const impact = el('div', { class: 'card card--pad-lg' });
    impact.append(el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.6;margin-bottom:14px', text: 'Cada decisão tem efeito: classificar bem um e-mail, priorizar certo e conter um incidente no prazo aumentam a satisfação e o cumprimento de SLA. Erros e estouros de tempo derrubam esses indicadores — como na operação real.' }));
    impact.append(
      barRow('Decisões corretas', goodRatio, goodRatio >= 70 ? 'green' : goodRatio >= 40 ? 'amber' : 'red', `${c.goodDecisions}/${c.decisions || 0}`),
      barRow('Satisfação atual', c.satisfaction, c.satisfaction >= 70 ? 'green' : c.satisfaction >= 40 ? 'amber' : 'red'),
      barRow('SLA no prazo', slaPct, slaPct >= 70 ? 'green' : slaPct >= 40 ? 'amber' : 'red')
    );
    view.append(impact);

    // Evolução
    view.append(el('div', { class: 'section-title', text: 'Histórico de evolução' }));
    const hist = s.xpHistory.slice(-30);
    const evo = el('div', { class: 'card' });
    if (hist.length < 2) evo.append(el('p', { style: 'color:var(--text-mute);font-size:13px', text: 'Continue resolvendo desafios para ver a curva de evolução do analista.' }));
    else {
      const max = Math.max(...hist.map(h => h.xp));
      const spark = el('div', { class: 'spark' });
      hist.forEach(h => spark.append(el('i', { style: `height:${Math.max(4, Math.round((h.xp / max) * 100))}%`, title: h.xp + ' XP' })));
      const lvl = HDL.state.levelInfo();
      evo.append(spark, el('div', { style: 'display:flex;justify-content:space-between;color:var(--text-mute);font-size:12px;margin-top:8px' },
        el('span', { text: 'início' }), el('span', { text: `${s.xp} XP · Nível ${lvl.level} — ${lvl.rank}` })));
    }
    view.append(evo);

    // resumo por área
    view.append(el('div', { class: 'section-title', text: 'Produção por área' }));
    const prod = el('div', { class: 'card' });
    [
      ['Chamados', s.solvedTickets.length, D.tickets.length],
      ['Alertas NOC', s.solvedMonitoring.length, D.monitoringAlerts.length],
      ['Incidentes P1', s.solvedIncidents.length, D.incidentEvents.length],
      ['Análises de log', s.solvedLogs.length, D.logScenarios.length],
      ['E-mails triados', s.emailsHandled.filter(e => e.correct).length, D.emails.length],
      ['Acessos remotos', (s.solvedRemote || []).length, 2]
    ].forEach(([label, done, total]) => prod.append(barRow(label, total ? Math.round(done / total * 100) : 0, 'accent', `${done}/${total}`)));
    view.append(prod);
  }

  function kpi(label, value, sub, ico) {
    return el('div', { class: 'exec-card' },
      el('span', { class: 'stat__ico', style: 'position:absolute;right:14px;top:12px;opacity:.18' }, HDL.ui.icon(ico, 24)),
      el('div', { class: 'exec-card__label', text: label }),
      el('div', { class: 'exec-card__value', text: value }),
      el('div', { class: 'exec-card__sub', text: sub }));
  }
  function gauge(label, pct, color, sub) {
    return el('div', { class: 'exec-card' },
      el('div', { class: 'exec-card__label', text: label }),
      el('div', { class: 'exec-card__value', style: 'color:' + color, text: pct + '%' }),
      el('div', { class: 'gauge' }, el('span', { style: `width:${pct}%;background:${color}` })),
      el('div', { class: 'exec-card__sub', style: 'margin-top:8px', text: sub }));
  }
  function barRow(label, pct, kind, extra) {
    const color = kind === 'green' ? 'var(--green)' : kind === 'amber' ? 'var(--amber)' : kind === 'red' ? 'var(--red)' : 'var(--accent)';
    return el('div', { class: 'bar-row' },
      el('span', { class: 'bar-row__label', text: label }),
      el('div', { class: 'bar' }, el('span', { style: `width:${pct}%;background:${color}` })),
      el('span', { class: 'bar-row__val', text: extra || (pct + '%') }));
  }
  function satColor(v) { return v >= 70 ? 'var(--green)' : v >= 40 ? 'var(--amber)' : 'var(--red)'; }

  return { render };
})();
