/* ============================================================
   Módulo: Trilhas de Carreira
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.careers = (function () {
  const { el } = HDL.ui;
  const { careerTracks } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('compass', 24), 'Trilhas de Carreira'),
        el('p', { text: 'Jornadas completas que organizam os desafios por cargo real de TI. Complete os passos de cada trilha para evoluir de Help Desk N1 até Analista de Sistemas e Redes.' })
      )
    );

    careerTracks.forEach(trk => {
      const steps = trk.steps.map(st => ({ st, done: !!st.done(s), prog: st.prog(s) }));
      const doneCount = steps.filter(x => x.done).length;
      const pct = Math.round((doneCount / steps.length) * 100);
      const complete = doneCount === steps.length;

      const track = el('div', { class: 'track', style: complete ? `border-color:${trk.color}` : '' });
      track.append(el('div', { class: 'track__head' },
        el('span', { class: 'track__ico', text: trk.ico }),
        el('div', { style: 'flex:1' },
          el('div', { class: 'track__name' }, trk.name, ' ', complete ? el('span', { class: 'chip chip--done', style: 'margin-left:6px', text: '✓ Trilha completa' }) : ''),
          el('div', { class: 'track__desc', text: trk.desc })),
        el('div', { style: 'text-align:right' },
          el('div', { style: `font-size:20px;font-weight:800;color:${trk.color}`, text: pct + '%' }),
          el('div', { style: 'font-size:11px;color:var(--text-mute)', text: doneCount + '/' + steps.length + ' passos' }))
      ));
      track.append(el('div', { class: 'bar', style: 'margin-top:12px' }, el('span', { style: `width:${pct}%;background:${trk.color}` })));

      const stepsEl = el('div', { class: 'track__steps' });
      steps.forEach(({ st, done, prog }) => {
        stepsEl.append(el('div', { class: 'track-step' + (done ? ' done' : '') },
          el('div', { class: 'track-step__check', text: done ? '✓' : '' }),
          el('div', { class: 'track-step__label', text: st.label }),
          el('div', { class: 'track-step__prog', text: Math.min(prog, st.total) + '/' + st.total })
        ));
      });
      track.append(stepsEl);
      view.append(track);
    });
  }

  return { render };
})();
