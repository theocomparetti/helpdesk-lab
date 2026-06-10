/* ============================================================
   Módulo: Sistema de Certificação
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.certifications = (function () {
  const { el, modal } = HDL.ui;
  const { certifications, company } = HDL.data;

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('award', 24), 'Certificações'),
        el('p', { text: 'Trilhas de competência. Ao atingir as metas de cada trilha, você emite um certificado interno do Help Desk Lab — prova prática das suas habilidades.' })
      )
    );

    const earned = s.certificates.length;
    view.append(el('div', { class: 'card card--pad-lg', style: 'margin-bottom:20px' },
      el('div', { style: 'display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px' },
        el('strong', { style: 'font-size:15px', text: `${earned} de ${certifications.length} certificações conquistadas` }),
        el('span', { class: 'level-tag', text: Math.round((earned / certifications.length) * 100) + '% da trilha' })),
      el('div', { class: 'bar', style: 'margin-top:12px' }, el('span', { style: `width:${Math.round((earned / certifications.length) * 100)}%` }))
    ));

    const grid = el('div', { class: 'cert-grid' });
    certifications.forEach(c => {
      const got = s.certificates.includes(c.id);
      const card = el('div', { class: 'cert ' + (got ? 'is-earned' : 'is-locked'), style: got ? 'cursor:pointer' : '' },
        el('span', { class: 'cert__seal', text: got ? '🏅' : '🔒' }),
        el('div', { class: 'cert__ico', text: c.ico }),
        el('div', { class: 'cert__name', text: c.name }),
        el('div', { class: 'cert__desc', text: c.desc }),
        el('div', { class: 'cert__state', text: got ? '✓ Certificado emitido — clique para ver' : '🔒 Em progresso' })
      );
      if (got) card.addEventListener('click', () => showDiploma(c));
      grid.append(card);
    });
    view.append(grid);
  }

  function showDiploma(c) {
    const lvl = HDL.state.levelInfo();
    modal({
      title: 'Certificado', sub: c.name,
      body: el('div', { class: 'diploma' },
        el('div', { class: 'diploma__ico', text: c.ico }),
        el('div', { style: 'font-size:12px;letter-spacing:1px;color:var(--text-mute);text-transform:uppercase', text: company.name + ' · Help Desk Lab' }),
        el('h3', { text: c.name }),
        el('p', { class: 'who', text: 'Certificamos que o(a) analista concluiu com êxito a trilha de competências exigida.' }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;margin-top:8px', text: c.desc }),
        el('div', { class: 'sig' }, `Nível ${lvl.level} — ${lvl.rank}  ·  Emitido em ${new Date().toLocaleDateString('pt-BR')}`)
      ), width: 520
    });
  }

  return { render };
})();
