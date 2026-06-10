/* ============================================================
   Módulo: Treino Relâmpago (desafio rápido de ~5 minutos)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.quick = (function () {
  const { el, sound } = HDL.ui;
  const TIME = 300; // 5 minutos
  const N = 5;

  let run = null, timerId = null;

  function buildPool() {
    const items = [];
    HDL.data.tickets.forEach(t => items.push({ title: t.title, context: t.desc, prompt: 'Qual a melhor conduta?', options: t.options, explanation: t.explanation, tags: t.tags, cat: t.category }));
    HDL.data.diagnostics.forEach(d => items.push({ title: d.title, context: d.scenario, prompt: 'Qual a causa raiz?', options: d.causes, explanation: d.explanation, tags: d.tags, cat: 'Diagnóstico' }));
    return shuffle(items).slice(0, N);
  }

  function render(view) {
    stopTimer();
    view.innerHTML = '';
    view.append(el('div', { class: 'page-head' },
      el('h1', {}, HDL.ui.icon('zap', 24), 'Treino Relâmpago'),
      el('p', { text: 'Um treino rápido de 5 minutos com ' + N + ' desafios variados — perfeito para manter a sequência diária e aquecer o raciocínio. Responda o mais rápido e certo que conseguir!' })));

    if (run && !run.finished) { renderQuestion(view); return; }

    const best = bestScore();
    view.append(el('div', { class: 'card card--pad-lg', style: 'max-width:560px' },
      el('div', { style: 'font-size:42px;text-align:center', text: '⚡' }),
      el('p', { style: 'text-align:center;color:var(--text-dim);line-height:1.6;margin:8px 0', text: `${N} desafios · 5 minutos · XP por acerto + bônus de velocidade.` }),
      best != null ? el('p', { style: 'text-align:center;color:var(--accent);font-weight:700', text: '🏅 Recorde: ' + best + '/' + N } ) : null,
      el('div', { style: 'text-align:center;margin-top:16px' },
        el('button', { class: 'btn btn--primary btn--lg', onclick: () => start(view) }, '▶ Começar treino'))));
  }

  function start(view) {
    run = { questions: buildPool(), idx: 0, correct: 0, timeLeft: TIME, finished: false, answered: false };
    sound.click();
    renderQuestion(view);
    timerId = setInterval(() => {
      run.timeLeft--;
      const t = document.getElementById('qkTimer');
      if (t) { t.textContent = fmt(run.timeLeft); t.classList.toggle('low', run.timeLeft <= 30); }
      if (run.timeLeft <= 0) finish(view);
    }, 1000);
  }

  function renderQuestion(view) {
    Array.from(view.querySelectorAll('.quick-body')).forEach(n => n.remove());
    const q = run.questions[run.idx];
    run.answered = false;
    const wrap = el('div', { class: 'quick-body', style: 'max-width:720px' });
    wrap.append(el('div', { class: 'quick-hud' },
      el('div', { class: 'pressure-timer', id: 'qkTimer', text: fmt(run.timeLeft) }),
      el('div', { class: 'quick-dots' }, ...run.questions.map((_, i) => el('i', { class: i < run.idx ? 'done' : i === run.idx ? 'cur' : '' }))),
      el('div', { class: 'noc-pill' }, '✅ ', el('b', { text: run.correct }), '/' + N)));

    wrap.append(el('div', { class: 'card' },
      el('div', { style: 'font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:.5px', text: (q.cat || 'Desafio') + ' · pergunta ' + (run.idx + 1) + '/' + N }),
      el('strong', { style: 'display:block;font-size:16px;margin:8px 0', text: q.title }),
      el('p', { style: 'color:var(--text-dim);font-size:13.5px;line-height:1.55', text: q.context }),
      el('p', { style: 'font-weight:600;margin:14px 0 10px', text: q.prompt })));

    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(q.options.slice());
    const keys = ['A', 'B', 'C', 'D'];
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => answer(o, btn, shuffled, opts, wrap, view));
      opts.append(btn);
    });
    wrap.append(opts);
    const fb = el('div'); wrap.append(fb);
    wrap._fb = fb;
    view.append(wrap);
  }

  function answer(o, btn, shuffled, opts, wrap, view) {
    if (run.answered) return;
    run.answered = true;
    Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
    if (!o.correct) btn.classList.add('is-wrong');
    const q = run.questions[run.idx];
    HDL.state.recordAttempt({ correct: o.correct, tags: q.tags, category: 'Treino Relâmpago' });
    if (o.correct) { run.correct++; sound.success(); HDL.state.award({ xp: 12, points: 12, reason: '' }); }
    else sound.error();
    wrap._fb.append(el('div', { class: 'explain ' + (o.correct ? 'is-ok' : 'is-bad'), style: 'margin-top:14px' },
      HDL.ui.result(o.correct, o.correct ? 'Correto!' : 'Não foi dessa vez'),
      el('p', { text: q.explanation }),
      el('button', { class: 'btn btn--primary', style: 'margin-top:12px', onclick: () => { run.idx++; (run.idx < N) ? renderQuestion(view) : finish(view); } },
        run.idx + 1 < N ? '➡️ Próxima' : '🏁 Ver resultado')));
    wrap._fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function finish(view) {
    if (run.finished) return;
    stopTimer();
    run.finished = true;
    const fast = run.timeLeft > TIME * 0.4 ? 20 : 0;
    const xp = run.correct * 8 + fast;
    HDL.state.recordQuick({ correct: run.correct, total: N });
    HDL.state.award({ xp, points: xp, reason: `Treino Relâmpago: ${run.correct}/${N}` });
    sound.levelup();
    Array.from(view.querySelectorAll('.quick-body')).forEach(n => n.remove());
    const pct = Math.round(run.correct / N * 100);
    const color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';
    view.append(el('div', { class: 'quick-body card card--pad-lg', style: 'max-width:520px;text-align:center' },
      el('div', { class: 'ring', style: `--p:${pct};background:conic-gradient(${color} ${pct}%, var(--panel-2) 0)` }, el('b', { text: run.correct + '/' + N })),
      el('div', { style: 'margin-top:12px;font-weight:700', text: pct >= 80 ? 'Excelente reflexo! ⚡' : pct >= 50 ? 'Bom treino! 👍' : 'Continue praticando 💪' }),
      el('div', { class: 'reward', style: 'justify-content:center;margin-top:8px', text: `⭐ +${xp} XP` + (fast ? ' (inclui bônus de velocidade)' : '') }),
      el('div', { style: 'display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap' },
        el('button', { class: 'btn btn--primary', onclick: () => { run = null; render(view); } }, '↻ Novo treino'),
        el('button', { class: 'btn', onclick: () => location.hash = '#dashboard' }, '🏠 Início'))));
  }

  function bestScore() { const r = HDL.state.get().quickRuns || []; return r.length ? Math.max(...r.map(x => x.correct)) : null; }
  function fmt(s) { const m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function teardown() { stopTimer(); if (run && !run.finished) run = null; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render, teardown };
})();
