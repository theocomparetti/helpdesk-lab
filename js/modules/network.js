/* ============================================================
   Módulo: Laboratório de Redes (corrigir configuração)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.network = (function () {
  const { el, sound, modal } = HDL.ui;
  const { networkLabs } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('globe', 24), 'Laboratório de Redes'),
        el('p', { text: 'Configurações de rede com defeito. Analise o diagrama, identifique o campo incorreto e corrija para restaurar a conectividade. Cobre IPv4, máscara, gateway e DNS.' })
      )
    );
    view.append(HDL.ui.labMeta([{ icon: 'target', text: 'Objetivo: corrigir a configuração de rede' }, { icon: 'sliders', text: 'Intermediário' }, { icon: 'clock', text: '~5 min' }, { icon: 'brain', text: 'IPv4, máscara, gateway, DNS' }]));
    const grid = el('div', { class: 'grid grid--cards' });
    networkLabs.forEach(lab => {
      const done = s.solvedLabs.includes(lab.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.75' : ''), onclick: () => open(lab) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:10px' },
          el('span', { class: 'ticket__id', text: lab.id }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Resolvido' }) : el('span', { class: 'chip chip--cat', text: '+' + lab.xp + ' XP' })
        ),
        el('strong', { style: 'display:block;margin:10px 0 8px;font-size:16px', text: lab.title }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.5', text: lab.brief }),
        el('div', { style: 'margin-top:12px' }, el('span', { class: 'chip chip--cat', text: 'N' + lab.difficulty }))
      ));
    });
    view.append(grid);
  }

  function open(lab) {
    const done = HDL.state.get().solvedLabs.includes(lab.id);
    const body = el('div', {});

    // diagrama
    const linkBad = !done; // visual: link quebrado até resolver
    body.append(el('div', { class: 'net-diagram' },
      node('💻', lab.id.includes('NET') ? 'Host' : 'PC'),
      el('div', { class: 'net-link' + (linkBad ? ' is-bad' : '') }),
      node('🔀', 'Switch'),
      el('div', { class: 'net-link' + (linkBad ? ' is-bad' : '') }),
      node('🌐', 'Gateway'),
      el('div', { class: 'net-link' + (linkBad ? ' is-bad' : '') }),
      node('☁️', 'Internet')
    ));
    body.append(el('p', { style: 'color:var(--text-dim);font-size:14px;line-height:1.6;margin-bottom:16px', text: lab.brief }));

    const inputs = {};
    lab.fields.forEach(f => {
      const inp = el('input', { type: 'text', value: done ? f.answer : f.value, spellcheck: 'false', autocomplete: 'off', disabled: done });
      inputs[f.key] = inp;
      body.append(el('div', { class: 'field' + (done ? ' ' : '') },
        el('label', { text: f.label }),
        inp,
        el('div', { class: 'hintline', text: '' })
      ));
    });

    const feedback = el('div');
    const actions = el('div', { style: 'display:flex;gap:10px;margin-top:6px' },
      el('button', { class: 'btn btn--primary', disabled: done, onclick: check }, '✓ Validar configuração'),
      el('button', { class: 'btn btn--ghost', disabled: done, onclick: showHints }, '💡 Dica')
    );
    body.append(actions, feedback);

    if (done) {
      lab.fields.forEach(f => inputs[f.key].classList.add('is-ok'));
      feedback.append(boxR(true, lab, true));
    }

    modal({ title: lab.title, sub: lab.id + ' · Laboratório nível ' + lab.difficulty, body, width: 640 });

    function showHints() {
      lab.fields.forEach(f => {
        const hintEl = inputs[f.key].parentElement.querySelector('.hintline');
        hintEl.textContent = f.hint;
      });
      HDL.ui.sound.click();
    }

    function check() {
      let allOk = true;
      lab.fields.forEach(f => {
        const val = inputs[f.key].value.trim();
        const ok = normalize(val) === normalize(f.answer);
        inputs[f.key].classList.toggle('is-ok', ok);
        inputs[f.key].classList.toggle('is-bad', !ok);
        if (!ok) allOk = false;
      });
      feedback.innerHTML = '';
      if (allOk) {
        sound.success();
        actions.querySelectorAll('button').forEach(b => b.disabled = true);
        lab.fields.forEach(f => inputs[f.key].disabled = true);
        // anima o link consertando
        body.querySelectorAll('.net-link').forEach(l => l.classList.remove('is-bad'));
        HDL.state.solveLab(lab.id, { xp: lab.xp, points: lab.xp, reason: `Laboratório de rede ${lab.id} concluído` });
        feedback.append(boxR(true, lab, false));
      } else {
        sound.error();
        feedback.append(el('div', { class: 'explain is-bad' },
          el('h4', {}, HDL.ui.icon('x-circle', 17), ' Ainda há campo(s) incorreto(s)'),
          el('p', { text: 'Os campos em vermelho estão errados. Use o botão “Dica” se precisar de uma pista sobre cada parâmetro.' })
        ));
      }
    }
  }

  function boxR(correct, lab, replay) {
    const b = el('div', { class: 'explain is-ok' },
      el('h4', {}, HDL.ui.icon('check-circle', 17), ' ' + (replay ? 'Configuração correta' : 'Conectividade restaurada!')),
      el('p', { text: lab.explanation }));
    if (!replay) b.append(el('div', { class: 'reward', text: `⭐ +${lab.xp} XP · +${lab.xp} pontos` }));
    return b;
  }

  function node(ico, label) {
    return el('div', { class: 'node' }, el('span', { class: 'node__ico', text: ico }), el('small', { text: label }));
  }
  function normalize(v) { return String(v).trim().replace(/\s+/g, '').toLowerCase(); }

  return { render };
})();
