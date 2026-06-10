/* ============================================================
   Módulo: Análise de Logs (Windows / aplicação / rede)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.logs = (function () {
  const { el, sound, modal, hintBox } = HDL.ui;
  const { logScenarios } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('file', 24), 'Análise de Logs'),
        el('p', { text: 'Logs do Windows, de aplicações e de rede. Leia, filtre o ruído, marque as linhas suspeitas e identifique a causa. Use as dicas graduais se travar — elas orientam sem entregar a resposta.' })
      )
    );
    const grid = el('div', { class: 'grid grid--cards' });
    logScenarios.forEach(lg => {
      const done = s.solvedLogs.includes(lg.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.8' : ''), onclick: () => open(lg) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'ticket__id', text: lg.id }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Resolvido' }) : el('span', { class: 'chip chip--cat', text: '+' + lg.xp + ' XP' })),
        el('strong', { style: 'display:block;margin:10px 0 6px;font-size:16px', text: lg.title }),
        el('div', { style: 'font-size:12px;color:var(--text-mute);margin-bottom:6px', text: '📄 ' + lg.source }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.5', text: lg.context })
      ));
    });
    view.append(grid);
  }

  function open(lg) {
    const done = HDL.state.get().solvedLogs.includes(lg.id);
    const startedAt = Date.now();
    const body = el('div', {});
    body.append(el('p', { style: 'color:var(--text-dim);font-size:14px;line-height:1.6;margin-bottom:12px', text: lg.context }));
    body.append(el('div', { style: 'font-size:12px;color:var(--text-mute);margin-bottom:6px', text: '📄 ' + lg.source + ' — clique nas linhas que considerar suspeitas' }));

    const logview = el('div', { class: 'logview' });
    lg.lines.forEach(ln => {
      const lineEl = el('span', { class: 'logline lvl-' + ln.lvl, text: ln.text });
      lineEl.addEventListener('click', () => { if (!done) lineEl.classList.toggle('flagged'); });
      logview.append(lineEl);
    });
    body.append(logview);

    const hb = hintBox(lg.hints || []);
    if (lg.hints && lg.hints.length && !done) body.append(hb.el);

    body.append(el('p', { style: 'font-weight:600;margin:16px 0 12px', text: lg.question }));
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(lg.options.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = done;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt', disabled: done }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o.correct, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const fb = el('div'); body.append(fb);
    if (done) { Array.from(opts.children).forEach((b, i) => { if (shuffled[i].correct) b.classList.add('is-correct'); b.disabled = true; }); fb.append(box(true, lg, true, 0)); }

    modal({ title: lg.title, sub: lg.id + ' · ' + lg.source, body, width: 720 });

    function reveal(correct, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!correct) btn.classList.add('is-wrong');
      const hintsUsed = hb.used();
      HDL.state.recordAttempt({ correct, tags: lg.tags, category: 'Análise de Logs', timeMs: Date.now() - startedAt });
      if (correct) {
        sound.success();
        const xp = Math.max(20, lg.xp - hintsUsed * 10);
        HDL.state.solveLog(lg.id, { xp, points: xp, reason: `Log ${lg.id} analisado` });
        fb.append(box(true, lg, false, hintsUsed));
      } else {
        sound.error();
        fb.append(box(false, lg, false, hintsUsed));
        const sug = HDL.modules.knowledge.suggestEl(lg.tags); if (sug) fb.append(sug);
      }
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function box(correct, lg, replay, hintsUsed) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Causa identificada' : 'Análise correta!') : 'Releia os logs'),
      el('p', { text: lg.explanation }));
    if (correct && !replay) {
      const xp = Math.max(20, lg.xp - hintsUsed * 10);
      b.append(el('div', { class: 'reward', text: `⭐ +${xp} XP` + (hintsUsed ? ` (−${hintsUsed * 10} por dicas)` : '') }));
    }
    return b;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
