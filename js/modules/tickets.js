/* ============================================================
   Módulo: Central de Chamados (tickets interativos)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.tickets = (function () {
  const { el, esc, initials, fmtClock, PRIORITY, sound, modal } = HDL.ui;
  const { tickets } = HDL.data;

  let filter = { level: 'all', status: 'all', q: '' };
  // horários fictícios estáveis por chamado
  const openTimes = {};
  tickets.forEach((t, i) => { openTimes[t.id] = Date.now() - (i * 17 + 8) * 60000; });

  function render(view) {
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('ticket', 24), 'Central de Chamados'),
        el('p', { text: 'Cada card é um chamado real aberto por um usuário. Leia o relato, investigue e escolha a melhor solução. Após responder, você recebe a explicação técnica.' })
      )
    );

    // Toolbar
    const toolbar = el('div', { class: 'toolbar' });
    const segLevel = el('div', { class: 'seg' });
    [['all', 'Todos'], ['1', 'N1'], ['2', 'N2'], ['3', 'N3'], ['4', 'N4']].forEach(([v, label]) => {
      segLevel.append(el('button', {
        class: filter.level === v ? 'is-active' : '',
        onclick: () => { filter.level = v; render(view); }
      }, label));
    });
    const segStatus = el('div', { class: 'seg' });
    [['all', 'Todos'], ['open', 'Abertos'], ['done', 'Resolvidos']].forEach(([v, label]) => {
      segStatus.append(el('button', {
        class: filter.status === v ? 'is-active' : '',
        onclick: () => { filter.status = v; render(view); }
      }, label));
    });
    const search = el('div', { class: 'search' },
      el('span', { text: '🔎' }),
      el('input', {
        type: 'text', placeholder: 'Buscar por título, setor, categoria…', value: filter.q,
        oninput: (e) => { filter.q = e.target.value.toLowerCase(); renderList(); }
      })
    );
    toolbar.append(segLevel, segStatus, search);
    view.append(toolbar);

    const listWrap = el('div', { class: 'ticket-list', id: 'ticketList' });
    view.append(listWrap);
    renderList();

    function renderList() {
      const s = HDL.state.get();
      listWrap.innerHTML = '';
      const items = tickets.filter(t => {
        if (filter.level !== 'all' && String(t.difficulty) !== filter.level) return false;
        const done = s.solvedTickets.includes(t.id);
        if (filter.status === 'open' && done) return false;
        if (filter.status === 'done' && !done) return false;
        if (filter.q) {
          const hay = (t.title + ' ' + t.sector + ' ' + t.category + ' ' + t.user + ' ' + t.tags.join(' ')).toLowerCase();
          if (!hay.includes(filter.q)) return false;
        }
        return true;
      });
      if (!items.length) {
        listWrap.append(el('div', { class: 'empty', style: 'grid-column:1/-1' },
          el('div', { class: 'empty__ico', text: '🔍' }),
          el('div', { text: 'Nenhum chamado encontrado com esses filtros.' })
        ));
        return;
      }
      items.forEach(t => listWrap.append(card(t, s.solvedTickets.includes(t.id), view)));
    }
  }

  function card(t, done, view) {
    const p = PRIORITY[t.priority];
    return el('div', { class: 'ticket' + (done ? ' is-done' : ''), onclick: () => open(t, view) },
      el('div', { class: 'ticket__bar ticket__bar--' + p.cls }),
      el('div', { class: 'ticket__body' },
        el('div', { class: 'ticket__top' },
          el('span', { class: 'ticket__id', text: t.id }),
          el('span', { class: 'chip chip--' + p.cls, text: p.label })
        ),
        el('div', { class: 'ticket__title', text: t.title }),
        el('div', { class: 'ticket__desc', text: truncate(t.desc, 120) }),
        el('div', { class: 'ticket__meta' },
          el('span', { class: 'chip chip--cat', text: '📂 ' + t.category }),
          el('span', { class: 'chip chip--cat', text: 'N' + t.difficulty }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Resolvido' }) : el('span', { class: 'chip chip--cat', text: '+' + t.xp + ' XP' })
        ),
        el('div', { class: 'ticket__user' },
          el('div', { class: 'avatar', text: initials(t.user) }),
          el('div', { class: 'ticket__user-info' },
            el('b', { text: t.user }),
            el('br'),
            el('small', { text: t.sector + ' · aberto ' + fmtClock(openTimeOf(t.id)) })
          )
        )
      )
    );
  }

  const openTimeOf = (id) => Date.now() - (tickets.findIndex(t => t.id === id) * 17 + 8) * 60000;

  function open(t, view) {
    const p = PRIORITY[t.priority];
    const s = HDL.state.get();
    const alreadyDone = s.solvedTickets.includes(t.id);
    const startedAt = Date.now();

    const body = el('div', {});
    body.append(
      el('div', { class: 'kv' },
        kv('Solicitante', t.user),
        kv('Setor', t.sector),
        kv('Categoria', t.category),
        kv('Prioridade', p.label),
        kv('Aberto às', fmtClock(openTimeOf(t.id))),
        kv('Recompensa', '+' + t.xp + ' XP')
      ),
      el('div', { class: 'problem-box', text: t.desc })
    );

    const prompt = el('p', { style: 'font-weight:600;margin-bottom:12px', text: 'Qual a melhor conduta?' });
    body.append(prompt);

    const opts = el('div', { class: 'options' });
    // embaralhar mantendo referência ao correto
    const shuffled = shuffle(t.options.map((o, i) => ({ ...o, _i: i })));
    const keys = ['A', 'B', 'C', 'D', 'E'];
    let answered = alreadyDone;

    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt', disabled: alreadyDone },
        el('span', { class: 'opt__key', text: keys[i] }),
        el('span', { text: o.text })
      );
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        reveal(o.correct, btn);
      });
      opts.append(btn);
    });
    body.append(opts);

    const feedback = el('div');
    body.append(feedback);

    if (alreadyDone) {
      // mostra a resposta correta marcada e a explicação
      Array.from(opts.children).forEach((btn, i) => {
        if (shuffled[i].correct) btn.classList.add('is-correct');
        btn.disabled = true;
      });
      feedback.append(explainBox(true, t, true));
    }

    modal({ title: t.title, sub: `${t.id} · ${t.sector}`, body, width: 680 });

    function reveal(correct, btn) {
      Array.from(opts.children).forEach((b, i) => {
        b.disabled = true;
        if (shuffled[i].correct) b.classList.add('is-correct');
      });
      if (!correct) btn.classList.add('is-wrong');

      HDL.state.recordAttempt({ correct, tags: t.tags, category: t.category, timeMs: Date.now() - startedAt });
      if (correct) {
        sound.success();
        const first = HDL.state.solveTicket(t.id, { xp: t.xp, points: t.xp, reason: `Chamado ${t.id} resolvido` });
        feedback.append(explainBox(true, t, false));
        // Simulador de Documentação (bônus)
        if (first && !HDL.state.get().docScores.some(d => d.ticketId === t.id)) {
          feedback.append(el('button', { class: 'btn btn--ghost', style: 'margin-top:12px', onclick: () => openDoc(t, feedback) }, '📝 Documentar este chamado (+bônus)'));
        }
      } else {
        sound.error();
        feedback.append(explainBox(false, t, false));
        const sug = HDL.modules.knowledge.suggestEl(t.tags);
        if (sug) feedback.append(sug);
      }
      feedback.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ---- Simulador de Documentação ---- */
  function openDoc(t, feedback) {
    const body = el('div', {});
    body.append(el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.6;margin-bottom:14px', text: 'Documentar é uma habilidade muito valorizada. Registre o atendimento — a qualidade gera pontos bônus.' }));
    const fields = {
      diag: docField('Diagnóstico — o que foi identificado?', true),
      cause: docField('Causa raiz', true),
      sol: docField('Solução aplicada', true),
      time: docField('Tempo gasto (min)', false, 'input')
    };
    Object.values(fields).forEach(f => body.append(f.wrap));
    const actions = el('div', { style: 'display:flex;gap:10px;margin-top:6px' },
      el('button', { class: 'btn btn--primary', onclick: submit }, '✓ Salvar documentação'));
    body.append(actions);
    const fb = el('div'); body.append(fb);
    const m = modal({ title: '📝 Documentação — ' + t.id, sub: 'Simulador de Documentação', body, width: 600 });

    function submit() {
      const diag = fields.diag.input.value.trim();
      const cause = fields.cause.input.value.trim();
      const sol = fields.sol.input.value.trim();
      const time = fields.time.input.value.trim();
      let score = 0;
      if (diag.length >= 15) score += 30; else if (diag.length >= 5) score += 15;
      if (cause.length >= 10) score += 30; else if (cause.length >= 4) score += 15;
      if (sol.length >= 15) score += 30; else if (sol.length >= 5) score += 15;
      if (/^\d+$/.test(time)) score += 10;
      score = Math.min(100, score);
      const xp = Math.round(score / 5); // até 20 XP bônus
      HDL.state.recordDoc({ ticketId: t.id, score });
      HDL.state.award({ xp, points: xp, reason: `Documentação do ${t.id} (${score}%)` });
      actions.querySelector('button').disabled = true;
      Object.values(fields).forEach(f => f.input.disabled = true);
      const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
      HDL.ui.sound[score >= 50 ? 'success' : 'error']();
      fb.append(el('div', { class: 'explain ' + (score >= 50 ? 'is-ok' : 'is-bad'), style: 'margin-top:14px' },
        el('h4', {}, `📝 Qualidade da documentação: ${score}%`),
        el('p', { text: score >= 80 ? 'Documentação completa e clara — exatamente o que um gestor espera de um analista sênior.' : score >= 50 ? 'Boa documentação. Para nota máxima, detalhe melhor diagnóstico, causa e solução.' : 'Documentação incompleta. Registre diagnóstico, causa e solução com mais detalhes.' }),
        el('div', { class: 'reward', text: `⭐ +${xp} XP bônus` })));
    }
  }
  function docField(label, multi, type) {
    const input = multi
      ? el('textarea', { rows: 2, placeholder: 'Descreva…' })
      : el('input', { type: 'text', placeholder: type === 'input' ? 'ex.: 15' : '' });
    const wrap = el('div', { class: 'doc-field' }, el('label', { text: label }), input);
    return { wrap, input };
  }

  function explainBox(correct, t, replay) {
    const box = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Resolução' : 'Correto!') : 'Não foi a melhor escolha'),
      el('p', { text: t.explanation })
    );
    if (correct && !replay) box.append(el('div', { class: 'reward', text: `⭐ +${t.xp} XP · +${t.xp} pontos` }));
    if (!correct) box.append(el('p', { style: 'margin-top:10px;color:var(--text-mute)', text: 'A alternativa correta está destacada em verde. Reabra o chamado para revisar quando quiser.' }));
    // Feedback profissional: competências treinadas
    box.append(el('div', { style: 'margin-top:12px;border-top:1px solid var(--border-soft);padding-top:10px' },
      el('div', { style: 'font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px', text: '🧠 Competências treinadas' }),
      el('div', { class: 'kb-tags' }, ...t.tags.map(tg => el('span', { class: 'chip chip--cat', text: '#' + tg })))));
    return box;
  }

  /* utils */
  function kv(label, value) { return el('div', {}, el('label', { text: label }), el('span', { text: value })); }
  function truncate(s, n) { return s.length > n ? s.slice(0, n).trim() + '…' : s; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  // abre um chamado específico (usado pela Home / "Começar agora")
  function openById(id) {
    const t = tickets.find(x => x.id === id);
    if (t) open(t, document.getElementById('view'));
  }

  return { render, openById };
})();
