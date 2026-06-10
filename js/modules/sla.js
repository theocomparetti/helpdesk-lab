/* ============================================================
   Módulo: Simulador de SLA (priorização de chamados)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.sla = (function () {
  const { el, sound, modal, PRIORITY } = HDL.ui;
  const { slaScenarios } = HDL.data;

  const PRIOS = [
    { key: 'low', label: 'Baixa' },
    { key: 'medium', label: 'Média' },
    { key: 'high', label: 'Alta' },
    { key: 'critical', label: 'Crítica' }
  ];

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('clock', 24), 'Simulador de SLA'),
        el('p', { text: 'Decida a prioridade de cada chamado considerando impacto × urgência. Depois o sistema explica o porquê — exatamente o raciocínio cobrado em ambientes corporativos com SLA.' })
      )
    );
    const grid = el('div', { class: 'grid grid--cards' });
    slaScenarios.forEach(sc => {
      const done = s.solvedSla.includes(sc.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.8' : ''), onclick: () => open(sc) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'ticket__id', text: sc.id }),
          done ? el('span', { class: 'chip chip--' + PRIORITY[sc.answer].cls, text: '✓ ' + PRIORITY[sc.answer].label }) : el('span', { class: 'chip chip--cat', text: '+' + sc.xp + ' XP' })),
        el('p', { style: 'font-size:14.5px;margin-top:10px;line-height:1.5', text: sc.title })
      ));
    });
    view.append(grid);
  }

  function open(sc) {
    const done = HDL.state.get().solvedSla.includes(sc.id);
    const startedAt = Date.now();
    const body = el('div', {});
    body.append(el('div', { class: 'problem-box no-before' },
      el('div', { style: 'font-size:11px;color:var(--text-mute);text-transform:uppercase;margin-bottom:6px', text: '🎫 Chamado recebido' }),
      el('div', { style: 'font-size:15px;line-height:1.5', text: sc.title })));
    body.append(el('p', { style: 'font-weight:600;margin:16px 0 10px', text: 'Que prioridade você atribui?' }));

    const grid = el('div', { class: 'sla-grid' });
    let answered = done;
    PRIOS.forEach(p => {
      const btn = el('button', { class: 'sla-btn p-' + p.key, disabled: done }, el('i'), p.label);
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(p.key, btn); });
      grid.append(btn);
    });
    body.append(grid);
    const fb = el('div'); body.append(fb);
    if (done) {
      Array.from(grid.children).forEach(b => { b.disabled = true; if (b.classList.contains('p-' + sc.answer)) b.classList.add('is-correct'); });
      fb.append(box(true, sc, true));
    }

    modal({ title: '⏱️ Priorização — ' + sc.id, sub: 'Simulador de SLA', body, width: 640 });

    function reveal(choice, btn) {
      const correct = choice === sc.answer;
      Array.from(grid.children).forEach(b => { b.disabled = true; if (b.classList.contains('p-' + sc.answer)) b.classList.add('is-correct'); });
      if (!correct) btn.classList.add('is-wrong');
      HDL.state.recordAttempt({ correct, tags: ['sla', 'priorização', 'atendimento'], category: 'SLA', timeMs: Date.now() - startedAt });
      if (correct) {
        sound.success();
        HDL.state.solveSla(sc.id, { xp: sc.xp, points: sc.xp, reason: `SLA ${sc.id} priorizado corretamente` });
        fb.append(box(true, sc, false));
      } else { sound.error(); fb.append(box(false, sc, false)); }
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function box(correct, sc, replay) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Prioridade correta' : 'Correto!') : 'Prioridade incorreta'),
      el('p', {}, el('strong', { text: 'Resposta: ' + PRIORITY[sc.answer].label + '. ' }), sc.explanation));
    if (correct && !replay) b.append(el('div', { class: 'reward', text: `⭐ +${sc.xp} XP · +${sc.xp} pontos` }));
    return b;
  }

  return { render };
})();
