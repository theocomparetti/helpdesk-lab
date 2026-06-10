/* ============================================================
   Módulo: Central de Monitoramento (NOC)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.monitoring = (function () {
  const { el, sound, modal } = HDL.ui;
  const { monitoringServices, monitoringAlerts, company } = HDL.data;

  const sevLabel = { medium: 'Atenção', high: 'Degradado', critical: 'Crítico' };

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('activity', 24), 'Central de Monitoramento — NOC'),
        el('p', { text: `Painel de operações de TI da ${company.name}. Os serviços mudam de status dinamicamente. Clique em um serviço em alerta para investigar e identificar a causa raiz.` })
      )
    );

    // status por serviço
    const statusOf = (svc) => {
      const alert = monitoringAlerts.find(a => a.service === svc.id);
      if (!alert) return { type: 'ok' };
      if (s.solvedMonitoring.includes(alert.id)) return { type: 'resolved', alert };
      return { type: alert.severity, alert };
    };

    const states = monitoringServices.map(statusOf);
    const critical = states.filter(x => x.type === 'critical').length;
    const degraded = states.filter(x => x.type === 'high' || x.type === 'medium').length;
    const ok = states.filter(x => x.type === 'ok' || x.type === 'resolved').length;

    view.append(el('div', { class: 'noc-summary' },
      el('div', { class: 'noc-pill' }, el('span', { style: 'color:var(--green)', text: '●' }), el('b', { text: ok }), ' Operacionais'),
      el('div', { class: 'noc-pill' }, el('span', { style: 'color:var(--p-high)', text: '●' }), el('b', { text: degraded }), ' Em alerta'),
      el('div', { class: 'noc-pill' }, el('span', { style: 'color:var(--p-critical)', text: '●' }), el('b', { text: critical }), ' Críticos')
    ));

    const grid = el('div', { class: 'noc-grid' });
    monitoringServices.forEach((svc, i) => {
      const st = states[i];
      const cls = st.type === 'ok' ? 's-ok' : st.type === 'resolved' ? 's-resolved' : 's-' + st.type;
      const card = el('div', { class: 'noc-card ' + cls + (st.alert && st.type !== 'resolved' ? ' is-alert' : '') });
      let statusEl, metric;
      if (st.type === 'ok') {
        statusEl = el('span', { class: 'noc-status ok' }, el('i'), 'Operacional');
        metric = okMetric(svc);
      } else if (st.type === 'resolved') {
        statusEl = el('span', { class: 'noc-status resolved' }, el('i'), 'Resolvido');
        metric = 'Incidente tratado. Serviço estável.';
      } else {
        statusEl = el('span', { class: 'noc-status alert-' + st.type }, el('i'), sevLabel[st.type]);
        metric = st.alert.metric;
        card.addEventListener('click', () => openAlert(st.alert));
      }
      card.append(
        el('div', { class: 'noc-card__top' },
          el('span', { class: 'noc-card__ico' }, HDL.ui.icon(svc.ico, 22)),
          el('div', {}, el('div', { class: 'noc-card__name', text: svc.name }), el('div', { class: 'noc-card__kind', text: svc.kind }))
        ),
        statusEl,
        el('div', { class: 'noc-card__metric', text: metric })
      );
      if (st.alert && st.type !== 'resolved') {
        card.append(el('div', { style: 'margin-top:10px' }, el('span', { class: 'chip chip--cat' }, HDL.ui.icon('search', 13), ' Investigar (+' + st.alert.xp + ' XP)')));
      }
      grid.append(card);
    });
    view.append(grid);
  }

  function okMetric(svc) {
    const samples = {
      Servidor: 'CPU 22% · RAM 41% · Uptime 38d',
      Aplicação: 'Resp. 120ms · Sessões 312 · OK',
      Rede: 'Latência 9ms · Perda 0% · OK',
      Impressora: 'Fila 0 · Toner 64% · Pronta'
    };
    return samples[svc.kind] || 'Operando normalmente';
  }

  function openAlert(alert) {
    const done = HDL.state.get().solvedMonitoring.includes(alert.id);
    const startedAt = Date.now();
    const body = el('div', {});
    body.append(
      el('div', { class: 'problem-box no-before' },
        el('div', { style: 'font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px', text: '🚨 Alerta ' + alert.id + ' · ' + (sevLabel[alert.severity] || '') }),
        el('div', { style: 'font-family:var(--mono);font-size:12.5px;color:var(--amber);margin-bottom:10px', text: alert.metric }),
        el('div', { text: alert.detail })
      ),
      el('p', { style: 'font-weight:600;margin:16px 0 12px', text: 'Qual a causa / conduta correta?' })
    );
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(alert.causes.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = done;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt', disabled: done }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o.correct, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const fb = el('div'); body.append(fb);
    if (done) { Array.from(opts.children).forEach((b, i) => { if (shuffled[i].correct) b.classList.add('is-correct'); b.disabled = true; }); fb.append(box(true, alert, true)); }

    modal({ title: '🚨 ' + alert.title, sub: alert.id + ' · NOC', body, width: 680 });

    function reveal(correct, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!correct) btn.classList.add('is-wrong');
      HDL.state.recordAttempt({ correct, tags: alert.tags, category: 'Monitoramento', timeMs: Date.now() - startedAt });
      if (correct) {
        sound.success();
        HDL.state.solveMonitoring(alert.id, { xp: alert.xp, points: alert.xp, reason: `Alerta ${alert.id} resolvido no NOC` });
        fb.append(box(true, alert, false));
      } else {
        sound.error();
        fb.append(box(false, alert, false));
        const sug = HDL.modules.knowledge.suggestEl(alert.tags);
        if (sug) fb.append(sug);
      }
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function box(correct, alert, replay) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Causa raiz' : 'Correto!') : 'Releia as métricas'),
      el('p', { text: alert.explanation }));
    if (correct && !replay) b.append(el('div', { class: 'reward', text: `⭐ +${alert.xp} XP · +${alert.xp} pontos` }));
    return b;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
