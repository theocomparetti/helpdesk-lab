/* ============================================================
   Módulo: Simulador de Diagnóstico (achar a causa raiz)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.diagnostics = (function () {
  const { el, sound, modal } = HDL.ui;
  const { diagnostics } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('stethoscope', 24), 'Simulador de Diagnóstico'),
        el('p', { text: 'O sistema apresenta os sintomas e as pistas coletadas. Sua missão é identificar a CAUSA RAIZ — exatamente como em um troubleshooting real, isolando variáveis até chegar ao culpado.' })
      )
    );

    const grid = el('div', { class: 'grid grid--cards' });
    diagnostics.forEach(d => {
      const done = s.solvedDiagnostics.includes(d.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.75' : ''), onclick: () => open(d) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:10px' },
          el('span', { class: 'ticket__id', text: d.id }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Resolvido' }) : el('span', { class: 'chip chip--cat', text: '+' + d.xp + ' XP' })
        ),
        el('strong', { style: 'display:block;margin:10px 0 8px;font-size:16px', text: d.title }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.5', text: d.scenario }),
        el('div', { style: 'margin-top:12px;display:flex;gap:7px;flex-wrap:wrap' },
          el('span', { class: 'chip chip--cat', text: 'N' + d.difficulty }),
          el('span', { class: 'chip chip--cat', text: '🔎 ' + d.clues.length + ' pistas' })
        )
      ));
    });
    view.append(grid);
  }

  function open(d) {
    const s = HDL.state.get();
    const alreadyDone = s.solvedDiagnostics.includes(d.id);
    const startedAt = Date.now();
    const body = el('div', {});

    body.append(el('p', { style: 'color:var(--text-dim);font-size:14px;line-height:1.6;margin-bottom:14px', text: d.scenario }));

    const clues = el('div', { class: 'problem-box' });
    clues.style.fontFamily = 'var(--mono)';
    clues.style.fontSize = '12.5px';
    clues.replaceChildren();
    const clueTitle = el('div', { style: 'font-size:11px;color:var(--text-mute);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px', text: '🔬 Dados coletados' });
    clues.append(clueTitle);
    d.clues.forEach(c => clues.append(el('div', { style: 'padding:4px 0;border-bottom:1px dashed var(--border-soft)', text: '› ' + c })));
    // remove o ::before padrão do problem-box
    clues.classList.add('no-before');
    body.append(clues);

    body.append(el('p', { style: 'font-weight:600;margin:18px 0 12px', text: 'Qual é a causa raiz?' }));

    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(d.causes.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = alreadyDone;

    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt', disabled: alreadyDone },
        el('span', { class: 'opt__key', text: keys[i] }),
        el('span', { text: o.text })
      );
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o.correct, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const feedback = el('div');
    body.append(feedback);

    if (alreadyDone) {
      Array.from(opts.children).forEach((btn, i) => { if (shuffled[i].correct) btn.classList.add('is-correct'); btn.disabled = true; });
      feedback.append(box(true, d, true));
    }

    modal({ title: d.title, sub: d.id + ' · Diagnóstico nível ' + d.difficulty, body, width: 700 });

    function reveal(correct, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!correct) btn.classList.add('is-wrong');
      HDL.state.recordAttempt({ correct, tags: d.tags, category: 'Diagnóstico', timeMs: Date.now() - startedAt });
      if (correct) {
        sound.success();
        HDL.state.solveDiagnostic(d.id, { xp: d.xp, points: d.xp, reason: `Diagnóstico ${d.id} concluído` });
        feedback.append(box(true, d, false));
      } else {
        sound.error();
        feedback.append(box(false, d, false));
        const sug = HDL.modules.knowledge.suggestEl(d.tags);
        if (sug) feedback.append(sug);
      }
      feedback.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function box(correct, d, replay) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Causa raiz' : 'Diagnóstico correto!') : 'Causa incorreta'),
      el('p', { text: d.explanation })
    );
    if (correct && !replay) b.append(el('div', { class: 'reward', text: `⭐ +${d.xp} XP · +${d.xp} pontos` }));
    if (!correct) b.append(el('p', { style: 'margin-top:10px;color:var(--text-mute)', text: 'A causa correta está em verde. Releia as pistas e tente conectar cada sintoma à causa.' }));
    return b;
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
