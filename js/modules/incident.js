/* ============================================================
   Módulo: Modo Incidente Crítico (cronometrado, decisões rápidas)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.incident = (function () {
  const { el, sound } = HDL.ui;
  const { incidentEvents } = HDL.data;

  let timerId = null;
  let session = null;

  function render(view) {
    stopTimer();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('alert', 24), 'Modo Incidente Crítico'),
        el('p', { text: 'Eventos P1 de alto impacto com o relógio correndo. Tome as decisões na ordem certa, rápido e com método — como na gestão real de uma crise de TI.' })
      )
    );
    view.append(HDL.ui.labMeta([{ icon: 'target', text: 'Objetivo: conter um incidente P1' }, { icon: 'sliders', text: 'Avançado' }, { icon: 'clock', text: '~75s por incidente' }, { icon: 'brain', text: 'Gestão de incidente, SLA, comunicação' }]));

    if (session && !session.finished) { renderSession(view); return; }

    const grid = el('div', { class: 'grid grid--cards' });
    incidentEvents.forEach(ev => {
      const done = HDL.state.get().solvedIncidents.includes(ev.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer;border-left:3px solid var(--red)' + (done ? ';opacity:.8' : ''), onclick: () => start(ev, view) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'chip chip--critical', text: '⚠️ P1 · ' + ev.timeLimit + 's' }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Contido' }) : el('span', { class: 'chip chip--cat', text: '+' + ev.xp + ' XP' })),
        el('strong', { style: 'display:block;margin:10px 0 8px;font-size:17px', text: ev.title }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.5', text: ev.intro })
      ));
    });
    view.append(grid);
  }

  function start(ev, view) {
    session = { ev, step: 0, timeLeft: ev.timeLimit, finished: false, failed: false };
    sound.click();
    renderSession(view);
    timerId = setInterval(() => {
      session.timeLeft--;
      const c = document.getElementById('incClock');
      if (c) { c.textContent = session.timeLeft + 's'; c.classList.toggle('low', session.timeLeft <= 15); }
      if (session.timeLeft <= 0) fail(view);
    }, 1000);
  }

  function renderSession(view) {
    Array.from(view.querySelectorAll('.incident-body')).forEach(n => n.remove());
    const ev = session.ev;
    const wrap = el('div', { class: 'incident-body' });
    wrap.append(el('div', { class: 'incident-banner' },
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap' },
        el('div', {}, el('span', { class: 'chip chip--critical', text: '⚠️ INCIDENTE P1' }),
          el('strong', { style: 'display:block;font-size:18px;margin-top:8px', text: ev.title })),
        el('div', { style: 'text-align:right' }, el('div', { style: 'font-size:11px;color:var(--text-mute)', text: 'TEMPO' }), el('div', { class: 'incident-clock' + (session.timeLeft <= 15 ? ' low' : ''), id: 'incClock', text: session.timeLeft + 's' }))),
      el('div', { class: 'incident-steps' }, ...ev.steps.map((_, i) => el('i', { class: i < session.step ? 'done' : i === session.step ? 'cur' : '' })))
    ));
    const host = el('div', { style: 'margin-top:16px' });
    wrap.append(host);
    view.append(wrap);
    renderStep(host, view);
  }

  function renderStep(host, view) {
    host.innerHTML = '';
    if (session.finished) return;
    const ev = session.ev;
    const step = ev.steps[session.step];
    host.append(el('div', { style: 'font-size:11px;color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px', text: `Decisão ${session.step + 1} de ${ev.steps.length}` }));
    host.append(el('p', { style: 'font-weight:600;font-size:15px;line-height:1.5;margin-bottom:12px', text: step.prompt }));
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(step.options.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = false;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o, btn); });
      opts.append(btn);
    });
    host.append(opts);
    const fb = el('div'); host.append(fb);

    function reveal(o, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      HDL.state.recordAttempt({ correct: o.correct, tags: ev.tags, category: 'Incidente Crítico' });
      if (o.correct) {
        sound.success();
        fb.append(el('div', { class: 'explain is-ok' }, el('h4', {}, HDL.ui.icon('check-circle', 17), ' Decisão correta'), el('p', { text: step.explanation }),
          el('button', { class: 'btn btn--primary', style: 'margin-top:12px', onclick: () => { session.step++; (session.step < ev.steps.length) ? renderStep(host, view) : succeed(view); } },
            session.step + 1 < ev.steps.length ? '➡️ Próxima decisão' : '🏁 Conter incidente')));
      } else {
        btn.classList.add('is-wrong');
        sound.error();
        session.timeLeft = Math.max(1, session.timeLeft - 10);
        fb.append(el('div', { class: 'explain is-bad' }, el('h4', {}, HDL.ui.icon('x-circle', 17), ' Decisão equivocada (−10s)'), el('p', { text: 'Sob pressão, a ordem das ações importa. A correta está em verde — clique para seguir.' })));
        Array.from(opts.children).forEach((b, i) => { if (shuffled[i].correct) { b.disabled = false; b.onclick = () => { session.step++; (session.step < ev.steps.length) ? renderStep(host, view) : succeed(view); }; } });
      }
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function succeed(view) {
    stopTimer();
    session.finished = true;
    const ev = session.ev;
    const first = HDL.state.solveIncident(ev.id, { xp: ev.xp, points: ev.xp, reason: `Incidente ${ev.id} contido` });
    HDL.state.applyImpact({ satisfaction: 8, slaOnTime: 1, good: true, silent: true });
    Array.from(view.querySelectorAll('.incident-body')).forEach(n => n.remove());
    view.append(el('div', { class: 'incident-body' },
      el('div', { class: 'explain is-ok' }, el('h4', {}, HDL.ui.icon('check-circle', 17), ' Incidente contido!'), el('p', { text: ev.finalExplanation }),
        el('div', { class: 'reward', text: `⭐ +${ev.xp} XP · 😊 satisfação ↑ · ✅ SLA cumprido` })),
      el('button', { class: 'btn btn--primary', style: 'margin-top:14px', onclick: () => { session = null; render(view); } }, '← Voltar aos incidentes')
    ));
  }

  function fail(view) {
    stopTimer();
    if (session.finished) return;
    session.finished = true; session.failed = true;
    HDL.state.applyImpact({ satisfaction: -10, slaLate: 1 });
    Array.from(view.querySelectorAll('.incident-body')).forEach(n => n.remove());
    view.append(el('div', { class: 'incident-body' },
      el('div', { class: 'explain is-bad' }, el('h4', {}, '⏱️ Tempo esgotado — SLA violado'),
        el('p', { text: 'O tempo acabou antes da contenção. Em um P1 real, isso significa mais impacto e usuários afetados. A satisfação caiu. Tente de novo, decidindo mais rápido e na ordem certa.' })),
      el('button', { class: 'btn btn--primary', style: 'margin-top:14px', onclick: () => { session = null; render(view); } }, '↻ Tentar outro incidente')
    ));
  }

  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function teardown() { stopTimer(); if (session && !session.finished) session = null; }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render, teardown };
})();
