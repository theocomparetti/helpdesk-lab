/* ============================================================
   Módulo: Modo Entrevista Help Desk
   Perguntas reais de recrutador + autoavaliação automática
   por palavras-chave, com resposta-modelo.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.interview = (function () {
  const { el, sound, modal } = HDL.ui;
  const { interviewQuestions } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('mic', 24), 'Modo Entrevista Help Desk'),
        el('p', { text: 'Perguntas reais usadas por recrutadores de TI. Responda com suas palavras — o sistema avalia automaticamente os pontos-chave e mostra uma resposta-modelo para você comparar e melhorar.' })
      )
    );
    const grid = el('div', { class: 'grid grid--cards' });
    interviewQuestions.forEach(q => {
      const done = s.solvedInterview.includes(q.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.8' : ''), onclick: () => open(q) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'ticket__id', text: q.id }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Respondida' }) : el('span', { class: 'chip chip--cat', text: '🎤 Responder' })),
        el('p', { style: 'font-size:15px;font-weight:600;margin-top:10px;line-height:1.4', text: q.q })
      ));
    });
    view.append(grid);
  }

  function open(q) {
    const startedAt = Date.now();
    const body = el('div', { class: 'iv-card' });
    body.append(el('div', { class: 'iv-q', text: q.q }));
    const ta = el('textarea', { class: 'iv-textarea', placeholder: 'Digite sua resposta como se estivesse na entrevista…' });
    body.append(ta);
    const actions = el('div', { style: 'display:flex;gap:10px;margin-top:12px' },
      el('button', { class: 'btn btn--primary', onclick: () => evaluate() }, '✓ Avaliar resposta'));
    body.append(actions);
    const fb = el('div'); body.append(fb);

    modal({ title: '🎙️ Entrevista — ' + q.id, sub: 'Pergunta de recrutador', body, width: 720 });
    setTimeout(() => ta.focus(), 80);

    function evaluate() {
      const text = ta.value.toLowerCase();
      if (text.trim().length < 12) { ta.style.borderColor = 'var(--red)'; return; }
      const hits = q.ideal.filter(k => k.split('/').some(part => text.includes(part.split(' ')[0]) || text.includes(part)));
      const matched = q.ideal.map(k => ({ k, hit: k.split('/').some(part => containsAny(text, part)) }));
      const hitCount = matched.filter(m => m.hit).length;
      const score = Math.round((hitCount / q.ideal.length) * 100);
      const passed = score >= 50;

      ta.disabled = true;
      actions.querySelector('button').disabled = true;
      sound[passed ? 'success' : 'error']();
      HDL.state.recordAttempt({ correct: passed, tags: q.tags, category: 'Entrevista', timeMs: Date.now() - startedAt });
      const xp = passed ? 40 : 15;
      HDL.state.solveInterview(q.id, { xp, points: xp, reason: `Entrevista ${q.id} respondida (${score}%)` });

      const color = score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
      fb.append(
        el('div', { class: 'iv-score' },
          el('div', { class: 'iv-score__ring', style: `background:conic-gradient(${color} ${score}%, var(--panel-2) 0)` },
            el('span', { style: 'background:var(--bg-2);width:48px;height:48px;border-radius:50%;display:grid;place-items:center', text: score + '%' })),
          el('div', {}, el('strong', { text: score >= 70 ? 'Ótima resposta!' : score >= 50 ? 'Boa, dá pra aprimorar' : 'Faltaram pontos-chave' }),
            el('div', { style: 'color:var(--text-dim);font-size:13px', text: `${hitCount} de ${q.ideal.length} pontos-chave abordados` }))
        ),
        el('div', { class: 'iv-keywords' }, ...matched.map(m => el('span', { class: 'iv-kw ' + (m.hit ? 'hit' : 'miss'), text: (m.hit ? '✓ ' : '○ ') + m.k })))
      );
      fb.append(el('div', { class: 'explain is-ok', style: 'margin-top:16px' },
        el('h4', {}, '💬 Resposta-modelo'),
        el('p', { text: q.model }),
        el('div', { class: 'reward', text: `⭐ +${xp} XP` })
      ));
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function containsAny(text, phrase) {
    const words = phrase.split(' ').filter(w => w.length > 2);
    return words.some(w => text.includes(w));
  }

  return { render };
})();
