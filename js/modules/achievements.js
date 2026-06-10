/* ============================================================
   Módulo: Conquistas (badges)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.achievements = (function () {
  const { el } = HDL.ui;
  const { achievements } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    const unlocked = s.unlockedAchievements.length;

    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('trophy', 24), 'Conquistas'),
        el('p', { text: 'Badges que você desbloqueia ao dominar diferentes áreas do suporte técnico. Resolva chamados, diagnósticos e laboratórios para colecionar todas.' })
      )
    );

    const pct = Math.round((unlocked / achievements.length) * 100);
    view.append(el('div', { class: 'card card--pad-lg', style: 'margin-bottom:22px' },
      el('div', { style: 'display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px' },
        el('strong', { style: 'font-size:15px', text: `${unlocked} de ${achievements.length} conquistas desbloqueadas` }),
        el('span', { class: 'level-tag', text: pct + '% completo' })),
      el('div', { class: 'bar', style: 'margin-top:12px' }, el('span', { style: `width:${pct}%` }))
    ));

    const hiddenTotal = achievements.filter(a => a.hidden).length;
    if (hiddenTotal) {
      const hiddenGot = achievements.filter(a => a.hidden && s.unlockedAchievements.includes(a.id)).length;
      view.append(el('p', { style: 'color:var(--text-mute);font-size:13px;margin:-6px 0 16px', text: `🔮 Inclui ${hiddenTotal} conquistas ocultas — descubra-as jogando (${hiddenGot} reveladas).` }));
    }

    const grid = el('div', { class: 'ach-grid' });
    achievements.forEach(a => {
      const got = s.unlockedAchievements.includes(a.id);
      const masked = a.hidden && !got;
      grid.append(el('div', { class: 'ach ' + (got ? 'is-unlocked' : 'is-locked') },
        el('span', { class: 'ach__ico', text: got ? a.ico : masked ? '❓' : '🔒' }),
        el('div', { class: 'ach__name', text: masked ? 'Conquista oculta' : a.name }),
        el('div', { class: 'ach__desc', text: masked ? 'Continue jogando para revelar esta conquista secreta.' : a.desc }),
        el('div', { class: 'ach__state', text: got ? '✓ Desbloqueada' : masked ? '🔮 Oculta' : 'Bloqueada' })
      ));
    });
    view.append(grid);
  }

  return { render };
})();
