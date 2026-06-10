/* ============================================================
   Módulo: Modo Pressão (fila simultânea de chamados)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.pressure = (function () {
  const { el, sound, modal, PRIORITY, initials } = HDL.ui;
  const { tickets } = HDL.data;

  const PRIO_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };
  let run = null;
  let timerId = null;

  function render(view) {
    stopTimer();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('flame', 24), 'Modo Pressão'),
        el('p', { text: 'Vários chamados chegam ao mesmo tempo e o relógio corre. Priorize os mais críticos, resolva o máximo que puder antes do tempo acabar e organize a fila como num plantão real de suporte.' })
      )
    );

    if (!run || run.finished) {
      const best = bestScore();
      view.append(el('div', { class: 'card card--pad-lg', style: 'max-width:560px' },
        el('div', { style: 'font-size:42px;text-align:center', text: '🎧' }),
        el('p', { style: 'text-align:center;color:var(--text-dim);line-height:1.6;margin:8px 0 4px' },
          '6 chamados na fila · 120 segundos.', el('br'), 'Acerto rápido = mais pontos. Erro custa 8s. Resolver os críticos primeiro vale bônus.'),
        best != null ? el('p', { style: 'text-align:center;color:var(--accent);font-weight:700;margin:8px 0', text: '🏅 Seu recorde: ' + best + ' pts' }) : null,
        el('div', { style: 'text-align:center;margin-top:16px' },
          el('button', { class: 'btn btn--primary', onclick: () => startRun(view) }, '▶ Iniciar plantão'))
      ));
      return;
    }
    renderRun(view);
  }

  function startRun(view) {
    const pool = shuffle(tickets.slice()).slice(0, 6);
    run = { queue: pool.map(t => ({ t, done: false, correct: false })), timeLeft: 120, score: 0, resolved: 0, finished: false };
    sound.click();
    renderRun(view);
    timerId = setInterval(() => {
      run.timeLeft--;
      const tEl = document.getElementById('pTimer');
      if (tEl) { tEl.textContent = fmt(run.timeLeft); tEl.classList.toggle('low', run.timeLeft <= 15); }
      if (run.timeLeft <= 0) finishRun(view);
    }, 1000);
  }

  function renderRun(view) {
    // remove páginas anteriores exceto head
    Array.from(view.querySelectorAll('.pressure-body')).forEach(n => n.remove());
    const wrap = el('div', { class: 'pressure-body' });
    wrap.append(el('div', { class: 'pressure-hud' },
      el('div', { class: 'pressure-timer', id: 'pTimer', text: fmt(run.timeLeft) }),
      el('div', { class: 'noc-pill' }, '⭐ ', el('b', { id: 'pScore', text: run.score }), ' pts'),
      el('div', { class: 'noc-pill' }, '✅ ', el('b', { id: 'pResolved', text: run.resolved }), ' / 6'),
      el('button', { class: 'btn btn--sm btn--ghost', style: 'margin-left:auto', onclick: () => finishRun(view) }, 'Encerrar')
    ));
    const queue = el('div', { class: 'queue' });
    // ordena por prioridade para sugerir foco
    run.queue.forEach((item, idx) => {
      const p = PRIORITY[item.t.priority];
      const card = el('div', { class: 'queue-card' + (item.done ? ' done' : ''), onclick: () => item.done ? null : answer(idx, view) },
        el('div', { class: 'queue-card__bar', style: 'background:var(--p-' + p.cls + ')' }),
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' },
          el('span', { class: 'ticket__id', text: item.t.id }),
          el('span', { class: 'chip chip--' + p.cls, text: p.label })),
        el('div', { style: 'font-weight:700;font-size:14px;margin:8px 0', text: item.t.title }),
        el('div', { style: 'display:flex;align-items:center;gap:8px' },
          el('div', { class: 'avatar', style: 'width:24px;height:24px;font-size:10px', text: initials(item.t.user) }),
          el('small', { style: 'color:var(--text-mute)', text: item.t.sector }),
          item.done ? el('span', { style: 'margin-left:auto;color:' + (item.correct ? 'var(--green)' : 'var(--red)'), text: item.correct ? '✓' : '✗' }) : null)
      );
      queue.append(card);
    });
    wrap.append(queue);
    view.append(wrap);
  }

  function answer(idx, view) {
    const item = run.queue[idx];
    const t = item.t;
    const startedAt = Date.now();
    const body = el('div', {});
    body.append(el('div', { class: 'problem-box', text: t.desc }));
    body.append(el('p', { style: 'font-weight:600;margin:14px 0 10px', text: 'Resposta rápida — qual a melhor conduta?' }));
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(t.options.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = false;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; resolve(o, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const m = modal({ title: t.title, sub: t.id + ' · ' + PRIORITY[t.priority].label, body, width: 640 });

    function resolve(o, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      item.done = true; item.correct = o.correct;
      HDL.state.recordAttempt({ correct: o.correct, tags: t.tags, category: 'Modo Pressão', timeMs: Date.now() - startedAt });
      if (o.correct) {
        sound.success();
        run.resolved++;
        const bonus = PRIO_WEIGHT[t.priority] * 5;
        run.score += 10 + bonus;
        run.queue[run.queue.indexOf(item)] = item;
      } else {
        btn.classList.add('is-wrong');
        sound.error();
        run.timeLeft = Math.max(1, run.timeLeft - 8); // penalidade
      }
      setTimeout(() => { m.close(); renderRun(view); if (run.queue.every(q => q.done)) finishRun(view); }, 700);
    }
  }

  function finishRun(view) {
    if (run.finished) return;
    stopTimer();
    run.finished = true;
    HDL.state.recordPressure({ score: run.score, resolved: run.resolved });
    const bonus = run.resolved === 6 ? 30 : 0;
    const xp = run.score + bonus;
    HDL.state.award({ xp, points: xp, reason: `Modo Pressão: ${run.resolved}/6 resolvidos (${run.score} pts)` });
    modal({
      title: '🏁 Plantão encerrado', sub: 'Modo Pressão',
      body: el('div', {},
        el('div', { class: 'explain is-ok' },
          el('h4', {}, HDL.ui.icon(run.resolved === 6 ? 'check-circle' : 'clock', 17), ' ' + (run.resolved === 6 ? 'Fila zerada!' : 'Tempo esgotado')),
          el('p', {}, `Você resolveu ${run.resolved} de 6 chamados e somou ${run.score} pontos na fila.` + (bonus ? ` Bônus de fila zerada: +${bonus} XP!` : '')),
          el('div', { class: 'reward', text: `⭐ +${xp} XP convertidos para seu perfil` })),
        el('button', { class: 'btn btn--primary', style: 'margin-top:14px', onclick: () => { run = null; render(view); document.getElementById('modalRoot').classList.remove('is-open'); } }, '↻ Jogar de novo')
      ), width: 560
    });
    renderRun(view);
  }

  function bestScore() {
    const runs = HDL.state.get().pressureRuns || [];
    if (!runs.length) return null;
    return Math.max(...runs.map(r => r.score));
  }
  function fmt(s) { const m = Math.floor(s / 60); const ss = s % 60; return `${m}:${String(ss).padStart(2, '0')}`; }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function teardown() { stopTimer(); if (run && !run.finished) run = null; }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render, teardown };
})();
