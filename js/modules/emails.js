/* ============================================================
   Módulo: Central de E-mails Corporativos
   Ler, interpretar e classificar a demanda corretamente.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.emails = (function () {
  const { el, sound } = HDL.ui;
  const { emails, personas } = HDL.data;

  let selected = null;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('mail', 24), 'Central de E-mails Corporativos'),
        el('p', { text: 'A caixa de entrada do suporte da TechCorp. Cada usuário escreve do seu jeito — leigo, avançado, diretor, impaciente. Leia, interprete a real demanda e classifique/encaminhe corretamente.' })
      )
    );

    const handledCount = s.emailsHandled.length;
    view.append(el('div', { class: 'noc-summary' },
      el('div', { class: 'noc-pill' }, '📥 ', el('b', { text: emails.length - handledCount }), ' na caixa'),
      el('div', { class: 'noc-pill' }, '✅ ', el('b', { text: s.emailsHandled.filter(e => e.correct).length }), ' classificados certo'),
      el('div', { class: 'noc-pill' }, '😊 ', el('b', { text: s.corp.satisfaction + '%' }), ' satisfação')
    ));

    const grid = el('div', { class: 'mail-grid' });
    const list = el('div', { class: 'mail-list' });
    emails.forEach(m => {
      const handled = s.emailsHandled.find(e => e.id === m.id);
      const persona = personas[m.persona] || { ico: '✉️' };
      const item = el('div', { class: 'mail-item' + (selected === m.id ? ' is-active' : '') + (handled ? ' is-read' : ''), onclick: () => { selected = m.id; render(view); } },
        el('div', { class: 'mail-item__avatar', text: persona.ico }),
        el('div', { class: 'mail-item__main' },
          el('div', { class: 'mail-item__from' }, el('b', { text: m.from }), el('small', { text: m.time })),
          el('div', { class: 'mail-item__subj', text: (handled ? (handled.correct ? '✓ ' : '✗ ') : '') + m.subject }),
          el('div', { class: 'mail-item__prev', text: m.body.slice(0, 60) + '…' })
        )
      );
      list.append(item);
    });
    grid.append(list);

    // painel de leitura
    const m = emails.find(x => x.id === selected);
    if (!m) {
      grid.append(el('div', { class: 'mail-read' }, el('div', { class: 'empty' },
        el('div', { class: 'empty__ico', text: '📨' }), el('div', { text: 'Selecione um e-mail para ler e classificar.' }))));
    } else {
      grid.append(readPane(m, view));
    }
    view.append(grid);
  }

  function readPane(m, view) {
    const s = HDL.state.get();
    const persona = personas[m.persona] || { ico: '✉️', name: '', tone: '' };
    const handled = s.emailsHandled.find(e => e.id === m.id);
    const pane = el('div', { class: 'mail-read' },
      el('div', { class: 'mail-read__head' },
        el('div', { class: 'mail-read__subject', text: m.subject }),
        el('div', { class: 'mail-read__meta' },
          el('div', { class: 'mail-item__avatar', text: persona.ico }),
          el('div', {}, el('b', { text: m.from }), el('div', { style: 'font-size:12px;color:var(--text-mute)', text: m.dept + ' · ' + m.time })),
          el('span', { class: 'persona-tag', text: persona.ico + ' ' + persona.name })
        )
      ),
      el('div', { class: 'mail-read__body', text: m.body })
    );

    pane.append(el('p', { style: 'font-weight:600;margin:18px 0 12px', text: '📋 Qual a classificação/conduta correta?' }));
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(m.options.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = !!handled;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt', disabled: !!handled }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o, btn); });
      opts.append(btn);
    });
    pane.append(opts);
    const fb = el('div'); pane.append(fb);
    if (handled) { Array.from(opts.children).forEach((b, i) => { if (shuffled[i].correct) b.classList.add('is-correct'); b.disabled = true; }); fb.append(box(handled.correct, m, true)); }

    function reveal(o, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!o.correct) btn.classList.add('is-wrong');
      HDL.state.recordAttempt({ correct: o.correct, tags: m.tags, category: 'E-mails', timeMs: 0 });
      HDL.state.handleEmail(m.id, o.correct);
      if (o.correct) {
        sound.success();
        const xp = 30;
        HDL.state.applyImpact({ satisfaction: m.impact.satisfaction || 3, good: true });
        HDL.state.award({ xp, points: xp, reason: `E-mail ${m.id} classificado corretamente` });
        fb.append(box(true, m, false));
      } else {
        sound.error();
        HDL.state.applyImpact({ satisfaction: -4 });
        fb.append(box(false, m, false));
        const sug = HDL.modules.knowledge.suggestEl(m.tags); if (sug) fb.append(sug);
      }
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    return pane;
  }

  function box(correct, m, replay) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Classificação correta' : 'Classificado corretamente!') : 'Classificação incorreta'),
      el('p', { text: m.explanation }));
    if (correct && !replay) b.append(el('div', { class: 'reward', text: '⭐ +30 XP · 😊 satisfação ↑' }));
    return b;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
