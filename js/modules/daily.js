/* ============================================================
   Módulo: Desafio Diário
   Seleciona deterministicamente um desafio por dia (mesmo para
   todos), com bônus de XP. Concluído uma vez por dia.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.daily = (function () {
  const { el, sound, modal } = HDL.ui;
  const { tickets, diagnostics } = HDL.data;

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  // hash simples e estável da string da data
  function seedFromDate(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return h;
  }

  function render(view) {
    const key = todayKey();
    const seed = seedFromDate(key);
    const pool = [...tickets.map(t => ({ ...t, kind: 'ticket' })), ...diagnostics.map(d => ({ ...d, kind: 'diag' }))];
    const pick = pool[seed % pool.length];
    const done = HDL.state.get().dailyDone.includes(key);
    const bonusXp = 40;

    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('calendar', 24), 'Desafio Diário'),
        el('p', { text: 'Todo dia, um novo desafio selecionado automaticamente — o mesmo para todos os usuários. Conclua para ganhar XP bônus e manter sua sequência.' })
      )
    );

    const card = el('div', { class: 'card card--pad-lg', style: 'max-width:640px' },
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap' },
        el('span', { class: 'chip chip--cat', text: '📆 ' + new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) }),
        done ? el('span', { class: 'chip chip--done', text: '✓ Concluído hoje' }) : el('span', { class: 'chip chip--medium', text: '+' + bonusXp + ' XP bônus' })
      ),
      el('div', { style: 'font-size:42px;text-align:center;margin:18px 0 6px', text: pick.kind === 'ticket' ? '🎫' : '🩺' }),
      el('strong', { style: 'display:block;text-align:center;font-size:19px', text: pick.title }),
      el('p', { style: 'text-align:center;color:var(--text-dim);font-size:14px;margin:10px auto 18px;max-width:460px', text: (pick.desc || pick.scenario) }),
      el('div', { style: 'text-align:center' },
        done
          ? el('div', { class: 'explain is-ok', style: 'text-align:left' },
              el('h4', {}, HDL.ui.icon('check-circle', 17), ' Desafio de hoje concluído!'),
              el('p', { text: 'Volte amanhã para um novo desafio. Sua constância gera a conquista “Constância”.' }))
          : el('button', { class: 'btn btn--primary', onclick: () => start(pick, key, bonusXp, view) }, '▶ Resolver desafio do dia')
      )
    );
    view.append(card);

    // sequência simples
    const streak = HDL.state.get().dailyDone.length;
    view.append(el('div', { class: 'section-title', text: 'Sua sequência' }));
    view.append(el('div', { class: 'card', style: 'max-width:640px;display:flex;align-items:center;gap:14px' },
      el('span', { style: 'font-size:30px', text: '🔥' }),
      el('div', {}, el('strong', { style: 'font-size:18px', text: streak + (streak === 1 ? ' dia' : ' dias') }),
        el('div', { style: 'color:var(--text-mute);font-size:13px', text: 'desafios diários concluídos no total' }))
    ));
  }

  function start(pick, key, bonusXp, view) {
    const body = el('div', {});
    if (pick.kind === 'diag') {
      body.append(el('p', { style: 'color:var(--text-dim);font-size:14px;line-height:1.6;margin-bottom:12px', text: pick.scenario }));
      const clues = el('div', { class: 'problem-box no-before', style: 'font-family:var(--mono);font-size:12.5px' });
      pick.clues.forEach(c => clues.append(el('div', { style: 'padding:3px 0', text: '› ' + c })));
      body.append(clues);
    } else {
      body.append(el('div', { class: 'problem-box', text: pick.desc }));
    }
    body.append(el('p', { style: 'font-weight:600;margin:16px 0 12px', text: pick.kind === 'diag' ? 'Qual é a causa raiz?' : 'Qual a melhor conduta?' }));

    const options = (pick.options || pick.causes).slice();
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(options);
    const keys = ['A', 'B', 'C', 'D', 'E'];
    let answered = false;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o.correct, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const fb = el('div'); body.append(fb);

    const m = modal({ title: '📅 Desafio Diário — ' + pick.title, sub: 'Bônus +' + bonusXp + ' XP', body, width: 680 });

    function reveal(correct, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!correct) btn.classList.add('is-wrong');
      const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
        HDL.ui.result(correct, correct ? 'Correto!' : 'Não foi dessa vez'),
        el('p', { text: pick.explanation }));
      if (correct) {
        sound.success();
        const totalXp = (pick.xp || 40) + bonusXp;
        HDL.state.completeDaily(key, { xp: totalXp, points: totalXp, reason: 'Desafio diário concluído' });
        b.append(el('div', { class: 'reward', text: `⭐ +${totalXp} XP (inclui +${bonusXp} bônus)` }));
        fb.append(b);
        setTimeout(() => { m.close(); render(view); }, 2600);
      } else {
        sound.error();
        b.append(el('p', { style: 'margin-top:8px;color:var(--text-mute)', text: 'O desafio diário permite uma tentativa. Estude a explicação — amanhã tem outro!' }));
        // marca como concluído mesmo errando? Não: permite tentar de novo recarregando. Mantemos aberto p/ leitura.
        fb.append(b);
      }
    }
  }

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
