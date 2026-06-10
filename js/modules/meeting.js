/* ============================================================
   Módulo: Simulador de Reunião com Gestores
   Justificar decisões — visão profissional além do técnico.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.meeting = (function () {
  const { el, sound, modal } = HDL.ui;
  const { meetingScenarios } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('users', 24), 'Reunião com Gestores'),
        el('p', { text: 'Na reunião, o gestor questiona suas decisões. Saber justificar com critério técnico e de processo — e traduzir TI em impacto de negócio — é o que demonstra maturidade profissional.' })
      )
    );
    const grid = el('div', { class: 'grid grid--cards' });
    meetingScenarios.forEach(mt => {
      const done = s.solvedMeetings.includes(mt.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.8' : ''), onclick: () => open(mt) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'chip chip--cat', text: '👔 ' + mt.manager }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Respondido' }) : el('span', { class: 'chip chip--cat', text: '+' + mt.xp + ' XP' })),
        el('p', { style: 'font-size:14.5px;font-weight:600;margin-top:10px;line-height:1.45', text: '“' + mt.question + '”' })
      ));
    });
    view.append(grid);
  }

  function open(mt) {
    const done = HDL.state.get().solvedMeetings.includes(mt.id);
    const body = el('div', {});
    body.append(el('div', { class: 'problem-box no-before' },
      el('div', { style: 'font-size:11px;color:var(--text-mute);text-transform:uppercase;margin-bottom:6px', text: '👔 ' + mt.manager + ' pergunta' }),
      el('div', { style: 'font-size:15.5px;line-height:1.5;font-style:italic', text: '“' + mt.question + '”' })));
    body.append(el('p', { style: 'font-weight:600;margin:16px 0 12px', text: 'Como você responde?' }));
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(mt.options.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = done;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt', disabled: done }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o.correct, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const fb = el('div'); body.append(fb);
    if (done) { Array.from(opts.children).forEach((b, i) => { if (shuffled[i].correct) b.classList.add('is-correct'); b.disabled = true; }); fb.append(box(true, mt, true)); }

    modal({ title: '🧑‍💼 Reunião — ' + mt.manager, sub: mt.id, body, width: 660 });

    function reveal(correct, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!correct) btn.classList.add('is-wrong');
      HDL.state.recordAttempt({ correct, tags: mt.tags, category: 'Reunião' });
      if (correct) {
        sound.success();
        HDL.state.applyImpact({ satisfaction: 3, good: true, silent: true });
        HDL.state.solveMeeting(mt.id, { xp: mt.xp, points: mt.xp, reason: `Reunião ${mt.id}: decisão bem justificada` });
        fb.append(box(true, mt, false));
      } else { sound.error(); fb.append(box(false, mt, false)); }
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function box(correct, mt, replay) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Resposta-modelo' : 'Boa justificativa!') : 'Resposta pouco profissional'),
      el('p', { text: mt.explanation }));
    if (correct && !replay) b.append(el('div', { class: 'reward', text: `⭐ +${mt.xp} XP` }));
    return b;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
