/* ============================================================
   Módulo: Análise de Desempenho (dashboard profissional)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.performance = (function () {
  const { el } = HDL.ui;

  function render(view) {
    const s = HDL.state.get();
    const a = HDL.state.analytics();
    const lvl = HDL.state.levelInfo();

    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('barchart', 24), 'Análise de Desempenho'),
        el('p', { text: 'Seu raio-x como analista: precisão, tempo médio de resposta, categorias dominadas, pontos a melhorar e evolução de XP ao longo do tempo.' })
      )
    );

    if (s.stats.attempts === 0) {
      view.append(el('div', { class: 'empty' },
        el('div', { class: 'empty__ico', text: '📊' }),
        el('div', { text: 'Resolva alguns desafios para gerar suas estatísticas de desempenho.' }),
        el('button', { class: 'btn btn--primary', style: 'margin-top:16px', onclick: () => location.hash = '#tickets' }, 'Começar a praticar')));
      return;
    }

    // Topo: precisão (ring) + métricas
    const top = el('div', { class: 'two-col' });
    const accColor = a.accuracy >= 75 ? 'var(--green)' : a.accuracy >= 50 ? 'var(--amber)' : 'var(--red)';
    top.append(
      el('div', { class: 'card', style: 'text-align:center' },
        el('div', { class: 'section-title', style: 'margin:0 0 14px', text: 'Taxa de acerto' }),
        el('div', { class: 'ring', style: `--p:${a.accuracy};background:conic-gradient(${accColor} ${a.accuracy}%, var(--panel-2) 0)` }, el('b', { text: a.accuracy + '%' })),
        el('p', { style: 'color:var(--text-mute);font-size:13px;margin-top:12px', text: `${s.stats.correct} acertos em ${s.stats.attempts} tentativas` })
      ),
      el('div', { class: 'grid grid--stats' },
        stat('target', 'Tentativas', s.stats.attempts),
        stat('check-circle', 'Acertos', s.stats.correct),
        stat('clock', 'Tempo médio', a.avgTimeSec + 's'),
        stat('star', 'Pontos', s.points),
        stat('book', 'Artigos lidos', s.kbRead.length),
        stat('trophy', 'Conquistas', s.unlockedAchievements.length)
      )
    );
    view.append(top);

    // Categorias dominadas / fracas
    const cols = el('div', { class: 'two-col', style: 'margin-top:20px' });
    const mastered = el('div', { class: 'card' }, el('strong', { text: '💪 Categorias dominadas' }));
    if (!a.mastered.length) mastered.append(el('p', { style: 'color:var(--text-mute);font-size:13px;margin-top:10px', text: 'Acerte ≥80% em uma categoria (mín. 2 tentativas) para dominá-la.' }));
    else a.mastered.slice(0, 8).forEach(t => mastered.append(barRow(t.tag, t.pct, 'green')));

    const weak = el('div', { class: 'card' }, el('strong', { text: '🎯 A melhorar' }));
    if (!a.weak.length) weak.append(el('p', { style: 'color:var(--text-mute);font-size:13px;margin-top:10px', text: 'Nenhum ponto fraco evidente. Continue assim! 🎉' }));
    else a.weak.slice(0, 8).forEach(t => weak.append(barRow(t.tag, t.pct, t.pct < 40 ? 'red' : 'amber')));
    cols.append(mastered, weak);
    view.append(el('div', { class: 'section-title', text: 'Domínio por categoria' }), cols);

    // Evolução de XP (sparkline)
    view.append(el('div', { class: 'section-title', text: 'Evolução de XP' }));
    const hist = s.xpHistory.slice(-30);
    const evo = el('div', { class: 'card' });
    if (hist.length < 2) evo.append(el('p', { style: 'color:var(--text-mute);font-size:13px', text: 'Continue resolvendo desafios para ver sua curva de evolução.' }));
    else {
      const max = Math.max(...hist.map(h => h.xp));
      const spark = el('div', { class: 'spark' });
      hist.forEach(h => spark.append(el('i', { style: `height:${Math.max(4, Math.round((h.xp / max) * 100))}%`, title: h.xp + ' XP' })));
      evo.append(spark,
        el('div', { style: 'display:flex;justify-content:space-between;color:var(--text-mute);font-size:12px;margin-top:8px' },
          el('span', { text: 'início' }), el('span', { text: `${lvl.level === 8 ? 'nível máx.' : 'nível ' + lvl.level} · ${s.xp} XP` })));
    }
    view.append(evo);

    // Atividade por categoria (tabela)
    if (a.tagList.length) {
      view.append(el('div', { class: 'section-title', text: 'Detalhamento por tema' }));
      const card = el('div', { class: 'card' });
      a.tagList.slice(0, 12).forEach(t => card.append(barRow(t.tag, t.pct, t.pct >= 80 ? 'green' : t.pct >= 50 ? 'amber' : 'red', `${t.correct}/${t.total}`)));
      view.append(card);
    }
  }

  function barRow(label, pct, kind, extra) {
    const color = kind === 'green' ? 'var(--green)' : kind === 'amber' ? 'var(--amber)' : kind === 'red' ? 'var(--red)' : 'var(--accent)';
    return el('div', { class: 'bar-row' },
      el('span', { class: 'bar-row__label', text: '#' + label }),
      el('div', { class: 'bar' }, el('span', { style: `width:${pct}%;background:${color}` })),
      el('span', { class: 'bar-row__val', text: extra || (pct + '%') })
    );
  }
  function stat(ico, label, value) {
    return el('div', { class: 'card stat' },
      el('span', { class: 'stat__ico' }, HDL.ui.icon(ico, 26)),
      el('span', { class: 'stat__label', text: label }),
      el('span', { class: 'stat__value', text: value }));
  }

  return { render };
})();
