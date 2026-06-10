/* ============================================================
   Módulo: Histórico de Incidentes (casos já resolvidos)
   Base de conhecimento corporativa do próprio analista.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.history = (function () {
  const { el, modal } = HDL.ui;
  const D = HDL.data;

  let query = '';

  function collect(s) {
    const cases = [];
    s.solvedTickets.forEach(id => { const t = D.tickets.find(x => x.id === id); if (t) cases.push({ id, ico: '🎫', kind: 'Chamado', title: t.title, sol: t.options.find(o => o.correct).text, why: t.explanation, tags: t.tags }); });
    s.solvedDiagnostics.forEach(id => { const t = D.diagnostics.find(x => x.id === id); if (t) cases.push({ id, ico: '🩺', kind: 'Diagnóstico', title: t.title, sol: t.causes.find(o => o.correct).text, why: t.explanation, tags: t.tags }); });
    s.solvedMonitoring.forEach(id => { const t = D.monitoringAlerts.find(x => x.id === id); if (t) cases.push({ id, ico: '📡', kind: 'Alerta NOC', title: t.title, sol: t.causes.find(o => o.correct).text, why: t.explanation, tags: t.tags }); });
    s.solvedIncidents.forEach(id => { const t = D.incidentEvents.find(x => x.id === id); if (t) cases.push({ id, ico: '🚨', kind: 'Incidente P1', title: t.title, sol: 'Contido seguindo o processo (dimensionar → isolar → acionar/comunicar).', why: t.finalExplanation, tags: t.tags }); });
    s.solvedLogs.forEach(id => { const t = D.logScenarios.find(x => x.id === id); if (t) cases.push({ id, ico: '🔎', kind: 'Análise de Log', title: t.title, sol: t.options.find(o => o.correct).text, why: t.explanation, tags: t.tags }); });
    s.solvedRemote && s.solvedRemote.forEach(id => { cases.push({ id, ico: '🖥️', kind: 'Acesso Remoto', title: 'Atendimento remoto ' + id, sol: 'Resolvido após coleta de evidências remotas.', why: 'Caso resolvido via acesso remoto — veja o módulo para revisar as evidências.', tags: ['remoto'] }); });
    s.solvedSurprise.forEach(id => { const t = D.surpriseScenarios.find(x => x.id === id); if (t) cases.push({ id, ico: '🧩', kind: 'Multi-causa', title: t.title, sol: 'Resolvido em camadas (múltiplas causas).', why: t.finalExplanation, tags: t.tags }); });
    return cases;
  }

  function render(view) {
    const s = HDL.state.get();
    const cases = collect(s);
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('folder', 24), 'Histórico de Incidentes'),
        el('p', { text: 'Sua base de conhecimento corporativa: todos os casos que você já resolveu, com diagnóstico e solução. Revise para estudar e para consultar em atendimentos futuros — como uma KB de empresa real.' })
      )
    );

    if (!cases.length) {
      view.append(el('div', { class: 'empty' },
        el('div', { class: 'empty__ico', text: '🗂️' }),
        el('div', { text: 'Nenhum caso resolvido ainda. Resolva chamados, alertas e incidentes para montar seu histórico.' }),
        el('button', { class: 'btn btn--primary', style: 'margin-top:16px', onclick: () => location.hash = '#tickets' }, 'Resolver um chamado')));
      return;
    }

    view.append(el('div', { class: 'search', style: 'max-width:420px;margin-bottom:18px' },
      el('span', { text: '🔎' }),
      el('input', { type: 'text', placeholder: 'Buscar caso por título, tipo ou tema…', value: query, oninput: e => { query = e.target.value.toLowerCase(); renderList(); } })
    ));

    const wrap = el('div', { id: 'histList' });
    view.append(wrap);
    renderList();

    function renderList() {
      wrap.innerHTML = '';
      const filtered = cases.filter(c => !query || (c.title + ' ' + c.kind + ' ' + c.tags.join(' ')).toLowerCase().includes(query));
      if (!filtered.length) { wrap.append(el('div', { class: 'empty' }, el('div', { text: 'Nenhum caso encontrado.' }))); return; }
      filtered.slice().reverse().forEach(c => {
        wrap.append(el('div', { class: 'card', style: 'cursor:pointer;margin-bottom:10px', onclick: () => detail(c) },
          el('div', { style: 'display:flex;align-items:center;gap:12px' },
            el('span', { style: 'font-size:20px', text: c.ico }),
            el('div', { style: 'flex:1' }, el('strong', { style: 'font-size:15px', text: c.title }), el('div', { style: 'font-size:12px;color:var(--text-mute)', text: c.kind + ' · ' + c.id })),
            el('span', { class: 'chip chip--done', text: '✓ Resolvido' }))));
      });
    }
  }

  function detail(c) {
    modal({
      title: c.ico + ' ' + c.title, sub: c.kind + ' · ' + c.id,
      body: el('div', {},
        el('div', { class: 'kv' }, el('div', {}, el('label', { text: 'Tipo' }), el('span', { text: c.kind })), el('div', {}, el('label', { text: 'Status' }), el('span', { text: '✓ Resolvido' }))),
        el('div', { class: 'doc-field' }, el('label', { text: '✅ Solução aplicada' }), el('div', { class: 'problem-box no-before', text: c.sol })),
        el('div', { class: 'doc-field' }, el('label', { text: '🧠 Diagnóstico / por quê' }), el('div', { class: 'problem-box no-before', text: c.why })),
        el('div', { class: 'kb-tags' }, ...c.tags.map(t => el('span', { class: 'chip chip--cat', text: '#' + t })))
      ), width: 640
    });
  }

  return { render };
})();
