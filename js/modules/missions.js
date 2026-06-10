/* ============================================================
   Módulo: Missões (semanais / mensais) — gamificação avançada
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.missions = (function () {
  const { el, sound } = HDL.ui;
  const { missions } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('target', 24), 'Missões'),
        el('p', { text: 'Metas semanais e mensais que orientam sua evolução e rendem XP extra. Complete o objetivo e resgate a recompensa.' })
      )
    );

    ['Semanal', 'Mensal'].forEach(period => {
      view.append(el('div', { class: 'section-title', text: period === 'Semanal' ? 'Missões semanais' : 'Desafios mensais' }));
      missions.filter(m => m.period === period).forEach(m => view.append(missionRow(m, s, view)));
    });
  }

  function missionRow(m, s, view) {
    const prog = Math.min(m.prog(s), m.target);
    const pct = Math.round((prog / m.target) * 100);
    const complete = prog >= m.target;
    const claimed = s.missionsClaimed.includes(m.id);

    const row = el('div', { class: 'mission' },
      el('span', { class: 'mission__ico', text: m.ico }),
      el('div', { class: 'mission__main' },
        el('div', { style: 'display:flex;align-items:center;gap:8px' },
          el('span', { class: 'mission__name', text: m.name }),
          el('span', { class: 'mission__period', text: m.period })),
        el('div', { class: 'mission__desc', text: m.desc + `  ·  +${m.reward.xp} XP` }),
        el('div', { class: 'bar mission__bar' }, el('span', { style: `width:${pct}%` + (complete ? ';background:linear-gradient(90deg,var(--green-dim),var(--green))' : '') }))
      ),
      el('div', { style: 'text-align:right;min-width:96px' },
        el('div', { style: 'font-family:var(--mono);font-size:13px;color:var(--text-dim);margin-bottom:6px', text: prog + '/' + m.target }),
        claimed
          ? el('span', { class: 'chip chip--done', text: '✓ Resgatada' })
          : el('button', { class: 'btn btn--sm' + (complete ? ' btn--primary' : ''), disabled: !complete, onclick: () => claim(m, view) }, complete ? 'Resgatar' : 'Em progresso')
      )
    );
    return row;
  }

  function claim(m, view) {
    const ok = HDL.state.claimMission(m.id, { xp: m.reward.xp, points: m.reward.xp, reason: `Missão concluída: ${m.name}` });
    if (ok) {
      sound.badge();
      HDL.ui.toast({ kind: 'badge', ico: m.ico, title: 'Missão concluída!', msg: `${m.name} · +${m.reward.xp} XP` }, 4000);
    }
    render(view);
  }

  return { render };
})();
