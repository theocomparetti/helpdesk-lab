/* ============================================================
   Módulo: Desafios Surpresa (cenários com múltiplas causas)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.surprise = (function () {
  const { el, sound, modal } = HDL.ui;
  const { surpriseScenarios } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('layers', 24), 'Desafios Surpresa'),
        el('p', { text: 'Cenários realistas em que um único sintoma esconde várias causas. Resolva camada por camada — corrigir o primeiro problema revela o próximo, como num atendimento de verdade.' })
      )
    );
    const grid = el('div', { class: 'grid grid--cards' });
    surpriseScenarios.forEach(sc => {
      const done = s.solvedSurprise.includes(sc.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.8' : ''), onclick: () => open(sc) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'ticket__id', text: sc.id }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Resolvido' }) : el('span', { class: 'chip chip--critical', text: '+' + sc.xp + ' XP' })),
        el('strong', { style: 'display:block;margin:10px 0 8px;font-size:16px', text: sc.title }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.5', text: sc.intro }),
        el('div', { style: 'margin-top:12px;display:flex;gap:7px' },
          el('span', { class: 'chip chip--cat', text: '🧩 ' + sc.stages.length + ' camadas' }),
          el('span', { class: 'chip chip--cat', text: 'N' + sc.difficulty }))
      ));
    });
    view.append(grid);
  }

  function open(sc) {
    const done = HDL.state.get().solvedSurprise.includes(sc.id);
    let stageIdx = 0;
    const body = el('div', {});
    const intro = el('div', { class: 'problem-box no-before' },
      el('div', { style: 'font-size:11px;color:var(--text-mute);text-transform:uppercase;margin-bottom:6px', text: '📞 Chamado' }),
      el('div', { text: sc.intro }));
    const progress = el('div', { style: 'display:flex;gap:6px;margin:14px 0' });
    const stageHost = el('div', {});
    body.append(intro, progress, stageHost);

    modal({ title: '🧩 ' + sc.title, sub: sc.id + ' · multi-causa', body, width: 700 });

    function renderProgress() {
      progress.innerHTML = '';
      sc.stages.forEach((_, i) => {
        progress.append(el('div', { style: `flex:1;height:6px;border-radius:6px;background:${i < stageIdx ? 'var(--green)' : i === stageIdx ? 'var(--accent)' : 'var(--panel-2)'}` }));
      });
    }

    function renderStage() {
      renderProgress();
      stageHost.innerHTML = '';
      if (done) { finish(true); return; }
      const stage = sc.stages[stageIdx];
      const startedAt = Date.now();
      stageHost.append(el('div', { style: 'font-size:11px;color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px', text: `Camada ${stageIdx + 1} de ${sc.stages.length}` }));
      stageHost.append(el('p', { style: 'font-weight:600;line-height:1.5;margin-bottom:12px', text: stage.prompt }));
      const opts = el('div', { class: 'options' });
      const shuffled = shuffle(stage.options.slice());
      const keys = ['A', 'B', 'C', 'D'];
      let answered = false;
      shuffled.forEach((o, i) => {
        const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
        btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o, btn); });
        opts.append(btn);
      });
      stageHost.append(opts);
      const fb = el('div'); stageHost.append(fb);

      function reveal(o, btn) {
        Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
        HDL.state.recordAttempt({ correct: o.correct, tags: sc.tags, category: 'Desafio Surpresa', timeMs: Date.now() - startedAt });
        if (o.correct) {
          sound.success();
          fb.append(el('div', { class: 'explain is-ok' }, el('h4', {}, HDL.ui.icon('check-circle', 17), ' Camada resolvida'), el('p', { text: stage.explanation }),
            el('button', { class: 'btn btn--primary', style: 'margin-top:12px', onclick: () => { stageIdx++; (stageIdx < sc.stages.length) ? renderStage() : finish(false); } },
              stageIdx + 1 < sc.stages.length ? '➡️ Próxima camada' : '🏁 Concluir cenário')));
        } else {
          btn.classList.add('is-wrong');
          sound.error();
          const errBox = el('div', { class: 'explain is-bad' }, el('h4', {}, HDL.ui.icon('x-circle', 17), ' Não é essa a causa desta camada'), el('p', { text: 'Reveja os sintomas. A alternativa correta está em verde — clique nela para avançar.' }));
          fb.append(errBox);
          const sug = HDL.modules.knowledge.suggestEl(sc.tags); if (sug) fb.append(sug);
          // permite avançar clicando na correta
          Array.from(opts.children).forEach((b, i) => { if (shuffled[i].correct) { b.disabled = false; b.onclick = () => { stageIdx++; (stageIdx < sc.stages.length) ? renderStage() : finish(false); }; } });
        }
        fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function finish(replay) {
      renderProgress();
      stageHost.innerHTML = '';
      if (!replay) HDL.state.solveSurprise(sc.id, { xp: sc.xp, points: sc.xp, reason: `Desafio Surpresa ${sc.id} resolvido` });
      const b = el('div', { class: 'explain is-ok' },
        el('h4', {}, HDL.ui.icon('check-circle', 17), ' ' + (replay ? 'Resumo do cenário' : 'Cenário concluído!')),
        el('p', { text: sc.finalExplanation }));
      if (!replay) b.append(el('div', { class: 'reward', text: `⭐ +${sc.xp} XP · +${sc.xp} pontos` }));
      stageHost.append(b);
    }

    renderStage();
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
