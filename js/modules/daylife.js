/* ============================================================
   Módulo: "Dia na Vida de um Analista de Suporte"
   Simulação de um expediente completo (08:00 → 18:00).
   Integra-se a XP/níveis/conquistas/estatísticas existentes.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.daylife = (function () {
  const { el, sound, modal, toast } = HDL.ui;
  const DS = HDL.data.dayShift;
  const personas = HDL.data.personas || {};
  const personaIco = { estagiario: '🧑‍🎓', gerente: '👔' };

  let day = null;   // estado vivo do expediente

  /* ---------- helpers de tempo ---------- */
  function clockStr(min) {
    const h = 8 + Math.floor(min / 60);
    const m = min % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }
  function persona(id) { return personas[id] || { ico: personaIco[id] || '✉️', name: id, tone: '' }; }

  /* ============================================================ */
  function render(view) {
    view.innerHTML = '';
    view.append(el('div', { class: 'page-head' },
      el('h1', {}, HDL.ui.icon('building', 24), 'Dia na Vida de um Analista de Suporte'),
      el('p', { text: 'Assuma o posto na ' + HDL.data.company.name + '. Um expediente das 08:00 às 18:00: chamados chegam ao longo do dia, incidentes interrompem a rotina, o relógio corre conforme suas ações. Investigue, priorize, resolva, documente — e receba o relatório de desempenho no fim do dia.' })));

    if (day && !day.finished) { renderDesk(view); return; }
    if (day && day.finished && day.report) { renderReport(view, day.report); return; }
    renderIntro(view);
  }

  /* ---------- tela inicial + carreira ---------- */
  function renderIntro(view) {
    Array.from(view.querySelectorAll('.daylife-body')).forEach(n => n.remove());
    const s = HDL.state.get();
    const rank = careerRank();
    const totalResolved = HDL.state.daylifeResolvedTotal();
    const next = nextRank(rank);
    const wrap = el('div', { class: 'daylife-body' });
    view.append(wrap);

    wrap.append(el('div', { class: 'card card--pad-lg', style: 'max-width:640px' },
      el('div', { style: 'display:flex;align-items:center;gap:14px' },
        el('span', { style: 'font-size:40px', text: rank.ico }),
        el('div', {}, el('div', { style: 'font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--text-mute)', text: 'Seu cargo atual (Modo Carreira)' }),
          el('strong', { style: 'font-size:20px', text: rank.name }))),
      next ? el('div', { style: 'margin-top:14px' },
        el('div', { style: 'display:flex;justify-content:space-between;font-size:12px;color:var(--text-dim);margin-bottom:6px' },
          el('span', { text: 'Progresso para ' + next.name }), el('span', { text: totalResolved + '/' + next.minResolved + ' chamados' })),
        el('div', { class: 'bar bar--green' }, el('span', { style: `width:${Math.min(100, Math.round(totalResolved / next.minResolved * 100))}%` }))) : el('p', { style: 'color:var(--accent);font-weight:700;margin-top:12px', text: '🏆 Cargo máximo alcançado!' }),
      el('p', { style: 'color:var(--text-dim);font-size:14px;line-height:1.6;margin:18px 0', text: 'Durante o expediente você vai receber chamados de usuários com perfis diferentes, priorizar demandas, investigar de verdade (logs, CMD, perguntas), cumprir SLA, lidar com incidentes críticos e documentar cada solução. Cada decisão tem consequência na satisfação e no SLA.' }),
      el('button', { class: 'btn btn--primary', onclick: () => startDay(view) }, '▶ Iniciar expediente (08:00)')
    ));

    if (s.daylifeRuns.length) {
      wrap.append(el('div', { class: 'section-title', text: 'Expedientes anteriores' }));
      const card = el('div', { class: 'card', style: 'max-width:640px' });
      s.daylifeRuns.slice(-5).reverse().forEach(r => {
        card.append(el('div', { class: 'list-row' },
          el('span', { class: 'ico', text: r.success >= 70 ? '🌟' : r.success >= 40 ? '✅' : '⚠️' }),
          el('span', { text: `${r.resolved} resolvidos · SLA ${r.slaPct}% · satisfação ${r.satisfaction}%` }),
          el('span', { class: 'spacer' }),
          el('span', { class: 'when', text: 'Nota ' + r.success + '%' })));
      });
      wrap.append(card);
    }
  }

  /* ---------- início do expediente ---------- */
  function startDay(view) {
    day = {
      clock: 0, satisfaction: 80, score: 0,
      queue: [], resolved: [], breached: {}, arrived: {},
      incidentsFired: {}, followed: {}, errors: [], finished: false, report: null
    };
    sound.click();
    tick(view, true);
    renderDesk(view);
  }

  /* ---------- avanço de tempo + eventos ---------- */
  function advance(mins, view) {
    if (!day || day.finished) return;
    day.clock = Math.min(DS.endMin, day.clock + mins);
    tick(view);
  }

  function tick(view, initial) {
    // chegada de chamados
    DS.tickets.forEach(t => {
      if (t.arriveAt <= day.clock && !day.arrived[t.id]) {
        day.arrived[t.id] = true;
        day.queue.push(makeRuntime(t));
        if (!initial) { toast({ ico: '📥', kind: 'xp', title: 'Novo chamado', msg: `${t.from} — ${t.subject}` }, 3200); sound.click(); }
      }
    });
    // incidentes críticos surpresa
    DS.incidents.forEach(inc => {
      if (inc.fireAt <= day.clock && !day.incidentsFired[inc.id]) {
        day.incidentsFired[inc.id] = true;
        day.queue.push(makeRuntime(inc, true));
        toast({ ico: '🚨', title: 'INCIDENTE CRÍTICO!', msg: inc.title }, 5000);
        sound.error();
      }
    });
    // SLA estourado + follow-ups
    day.queue.forEach(item => {
      if (item.isIncident) return;
      const deadline = item.arriveAt + item.sla;
      if (day.clock > deadline && !item.breached) {
        item.breached = true;
        day.satisfaction = Math.max(0, day.satisfaction - 8);
        HDL.state.applyImpact({ satisfaction: -6, slaLate: 1, silent: true });
        day.errors.push(`SLA estourado: ${item.id} (${item.subject}).`);
        toast({ ico: '⏰', title: 'SLA estourado', msg: `${item.from} esperou demais.` }, 3600);
      } else if (!item.breached && !day.followed[item.id] && day.clock > item.arriveAt + Math.round(item.sla * 0.6) && item.followups && item.followups.length) {
        day.followed[item.id] = true;
        toast({ ico: '💬', title: item.from, msg: item.followups[0] }, 4000);
      }
    });
    if (day.clock >= DS.endMin && !day.finished) endDay(view);
    else if (view && !day.finished) updateDeskHud();
  }

  function makeRuntime(src, isIncident) {
    return Object.assign({}, src, { isIncident: !!isIncident, breached: false });
  }

  /* ---------- mesa de trabalho ---------- */
  function renderDesk(view) {
    Array.from(view.querySelectorAll('.daylife-body')).forEach(n => n.remove());
    const wrap = el('div', { class: 'daylife-body' });

    wrap.append(deskHud(view));

    const active = day.queue.filter(i => !i.done);
    if (!active.length) {
      wrap.append(el('div', { class: 'card', style: 'text-align:center;padding:30px' },
        el('div', { style: 'font-size:34px', text: '☕' }),
        el('p', { style: 'color:var(--text-dim);margin:10px 0', text: 'Fila vazia por enquanto. Adiante o relógio para o próximo chamado.' }),
        el('button', { class: 'btn btn--primary', onclick: () => advance(20, view) || renderDesk(view) }, '⏩ Avançar 20 min')));
    } else {
      const q = el('div', { class: 'queue' });
      // incidentes primeiro (visualmente)
      active.sort((a, b) => (b.isIncident - a.isIncident) || (a.arriveAt - b.arriveAt));
      active.forEach(item => q.append(queueCard(item, view)));
      wrap.append(q);
    }
    view.append(wrap);
  }

  function deskHud(view) {
    const pending = day.queue.filter(i => !i.done).length;
    const lowTime = day.clock >= DS.endMin - 60;
    const hud = el('div', { class: 'daylife-hud' },
      el('div', { class: 'daylife-clock' + (lowTime ? ' low' : ''), id: 'dlClock' }, '🕗 ', clockStr(day.clock)),
      satMeter(day.satisfaction),
      el('div', { class: 'noc-pill' }, '✅ ', el('b', { id: 'dlResolved', text: day.resolved.length }), ' resolvidos'),
      el('div', { class: 'noc-pill' }, '📥 ', el('b', { id: 'dlPending', text: pending }), ' na fila'),
      el('button', { class: 'btn btn--sm btn--ghost', style: 'margin-left:auto', onclick: () => confirmEnd(view) }, '⏹️ Encerrar expediente')
    );
    return hud;
  }
  function satMeter(v) {
    const color = v >= 70 ? 'var(--green)' : v >= 40 ? 'var(--amber)' : 'var(--red)';
    return el('div', { class: 'noc-pill', style: 'gap:10px' }, '😊',
      el('div', { class: 'sat-meter' }, el('span', { id: 'dlSatFill', style: `width:${v}%;background:${color}` })),
      el('b', { id: 'dlSat', text: v + '%' }));
  }
  function updateDeskHud() {
    const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    if (document.getElementById('dlClock')) document.getElementById('dlClock').innerHTML = '🕗 ' + clockStr(day.clock);
    set('dlResolved', day.resolved.length);
    set('dlPending', day.queue.filter(i => !i.done).length);
    const sf = document.getElementById('dlSatFill'); if (sf) { const v = day.satisfaction; sf.style.width = v + '%'; sf.style.background = v >= 70 ? 'var(--green)' : v >= 40 ? 'var(--amber)' : 'var(--red)'; }
    set('dlSat', day.satisfaction + '%');
  }

  function queueCard(item, view) {
    if (item.isIncident) {
      return el('div', { class: 'queue-card incident-card', onclick: () => openIncident(item, view) },
        el('div', { class: 'queue-card__bar', style: 'background:var(--red)' }),
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'chip chip--critical', text: '🚨 P1 INCIDENTE' }), el('span', { class: 'ticket__id', text: item.id })),
        el('div', { style: 'font-weight:800;font-size:15px;margin:8px 0', text: item.title }),
        el('div', { style: 'font-size:12.5px;color:var(--text-dim);line-height:1.5', text: item.message.slice(0, 90) + '…' }));
    }
    const p = persona(item.persona);
    const left = item.arriveAt + item.sla - day.clock;
    const slaClass = item.breached ? 'sla-over' : left <= 20 ? 'sla-soon' : 'sla-ok';
    const slaText = item.breached ? 'SLA estourado' : 'SLA em ' + left + ' min';
    return el('div', { class: 'queue-card', onclick: () => openTicket(item, view) },
      el('div', { class: 'queue-card__bar', style: 'background:var(--border)' }),
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' },
        el('span', { class: 'persona-tag', text: p.ico + ' ' + (p.name || item.persona) }),
        el('span', { class: 'dl-sla ' + slaClass, text: '⏱ ' + slaText })),
      el('div', { style: 'font-weight:700;font-size:14px;margin:8px 0 4px', text: item.subject }),
      el('div', { style: 'font-size:12.5px;color:var(--text-mute)', text: `${item.from} · ${item.dept} · chegou ${clockStr(item.arriveAt)}` }),
      el('div', { style: 'margin-top:8px' }, el('span', { class: 'chip chip--cat', text: chanLabel(item.channel) })));
  }
  function chanLabel(c) { return c === 'email' ? '📧 E-mail' : c === 'mensagem' ? '💬 Mensagem' : '🎫 Chamado'; }

  /* ============================================================
     Fluxo de atendimento de um chamado (investigação real)
     ============================================================ */
  function openTicket(item, view) {
    const investigated = {};
    const flow = { priority: null, root: null, doc: null, started: day.clock };
    const body = el('div', {});
    const p = persona(item.persona);

    // cabeçalho fixo: mensagem do usuário
    body.append(el('div', { class: 'problem-box no-before' },
      el('div', { style: 'display:flex;align-items:center;gap:10px;margin-bottom:8px' },
        el('div', { class: 'mail-item__avatar', text: p.ico }),
        el('div', {}, el('b', { text: item.from }), el('div', { style: 'font-size:11px;color:var(--text-mute)', text: item.dept + ' · ' + chanLabel(item.channel) + ' · ' + clockStr(item.arriveAt) }))),
      el('div', { style: 'font-style:italic', text: '“' + item.message + '”' })));

    const stepHost = el('div', { style: 'margin-top:16px' });
    body.append(stepHost);
    const m = modal({ title: item.subject, sub: item.id + ' · ' + p.name, body, width: 720 });

    renderInvestigate();

    /* Passo 1 — investigação */
    function renderInvestigate() {
      stepHost.innerHTML = '';
      stepHost.append(el('div', { class: 'dl-steptitle', text: '🔍 1. Investigue (use as ferramentas — cada uma consome tempo)' }));
      const tools = el('div', { class: 'remote-tools' });
      DS.TOOLS.forEach(tool => {
        const card = el('div', { class: 'remote-tool' + (investigated[tool.id] ? ' is-used' : ''), onclick: () => useTool(tool) },
          el('b', { text: tool.ico + ' ' + tool.label }), el('small', { text: '+' + tool.cost + ' min' }));
        tools.append(card);
      });
      stepHost.append(el('div', { style: 'background:var(--bg);border:1px solid var(--border-soft);border-radius:12px;padding:12px' }, tools));
      const findings = el('div', { id: 'dlFindings', style: 'margin-top:12px' });
      Object.keys(investigated).forEach(tid => findings.append(findingEl(tid)));
      stepHost.append(findings);

      const count = Object.keys(investigated).length;
      const next = el('button', { class: 'btn btn--primary', style: 'margin-top:16px', disabled: count < 2, onclick: renderPriority },
        count < 2 ? `Investigue ao menos 2 ferramentas (${count}/2)` : '➡️ Registrar diagnóstico');
      stepHost.append(next);

      function useTool(tool) {
        if (investigated[tool.id]) return;
        investigated[tool.id] = true;
        advance(tool.cost, view);
        sound.click();
        document.getElementById('dlFindings').append(findingEl(tool.id));
        renderInvestigate(); // atualiza contador/botão
      }
    }
    function findingEl(tid) {
      const tool = DS.TOOLS.find(t => t.id === tid);
      const found = item.findings[tid] || 'Nada relevante encontrado por aqui.';
      return el('div', { class: 'remote-finding' }, el('b', { text: tool.ico + ' ' + tool.label + ': ' }), found);
    }

    /* Passo 2 — prioridade */
    function renderPriority() {
      stepHost.innerHTML = '';
      stepHost.append(el('div', { class: 'dl-steptitle', text: '🎯 2. Classifique a prioridade (impacto × urgência)' }));
      const grid = el('div', { class: 'sla-grid' });
      [['low', 'Baixa'], ['medium', 'Média'], ['high', 'Alta'], ['critical', 'Crítica']].forEach(([k, label]) => {
        grid.append(el('button', { class: 'sla-btn p-' + k, onclick: () => { flow.priority = k; renderRoot(); } }, el('i'), label));
      });
      stepHost.append(grid);
    }

    /* Passo 3 — causa raiz (construída pela investigação) */
    function renderRoot() {
      stepHost.innerHTML = '';
      stepHost.append(el('div', { class: 'dl-steptitle', text: '🧠 3. Qual a causa raiz? (com base na sua investigação)' }));
      if (item.misdirection) stepHost.append(el('p', { style: 'font-size:12px;color:var(--amber);margin-bottom:8px', text: '⚠️ Cuidado: o sintoma aparente pode não ser a causa real.' }));
      const opts = el('div', { class: 'options' });
      const shuffled = shuffle(item.rootCauses.slice());
      const keys = ['A', 'B', 'C', 'D'];
      let answered = false;
      shuffled.forEach((o, i) => {
        const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
        btn.addEventListener('click', () => { if (answered) return; answered = true; flow.root = o; Array.from(opts.children).forEach((b, j) => { b.disabled = true; if (shuffled[j].correct) b.classList.add('is-correct'); }); if (!o.correct) btn.classList.add('is-wrong'); setTimeout(renderDoc, 650); });
        opts.append(btn);
      });
      stepHost.append(opts);
    }

    /* Passo 4 — documentação obrigatória */
    function renderDoc() {
      stepHost.innerHTML = '';
      stepHost.append(el('div', { class: 'dl-steptitle', text: '📝 4. Documente o atendimento (obrigatório)' }));
      const f = {
        problema: docField('Problema relatado'),
        diag: docField('Diagnóstico'),
        causa: docField('Causa raiz'),
        sol: docField('Solução aplicada'),
        tempo: docField('Tempo gasto (min)', 'input')
      };
      Object.values(f).forEach(x => stepHost.append(x.wrap));
      stepHost.append(el('button', { class: 'btn btn--primary', style: 'margin-top:6px', onclick: () => finish(f) }, '✅ Concluir e resolver chamado'));
    }

    function finish(f) {
      const docScore = scoreDoc(f);
      const priorityCorrect = flow.priority === item.priority;
      const rootCorrect = !!(flow.root && flow.root.correct);
      const timeSpent = (day.clock - flow.started) + item.timeCost;
      advance(item.timeCost, view); // resolução consome tempo
      const onTime = day.clock <= item.arriveAt + item.sla;

      // marca como resolvido e remove da fila
      item.done = true;
      day.resolved.push({ item, onTime, priorityCorrect, rootCorrect, docScore, timeSpent });

      // consequências
      let sat = 0;
      if (rootCorrect) sat += 6; else { sat -= 8; day.errors.push(`Causa raiz incorreta em ${item.id} (${item.subject}).`); }
      if (onTime) sat += 3; else day.errors.push(`Resolução fora do SLA em ${item.id}.`);
      if (priorityCorrect) sat += 1; else day.errors.push(`Prioridade incorreta em ${item.id}.`);
      if (docScore < 50) { sat -= 2; day.errors.push(`Documentação fraca em ${item.id} (${docScore}%).`); }
      day.satisfaction = Math.max(0, Math.min(100, day.satisfaction + sat));

      // integração global (XP/stats/impacto/doc)
      const baseXp = 15 + Math.round(item.timeCost / 2);
      const xp = Math.max(5, Math.round((rootCorrect ? baseXp : baseXp * 0.3) + docScore / 10 + (onTime ? 5 : 0)));
      HDL.state.recordAttempt({ correct: rootCorrect, tags: tagsOf(item), category: 'Dia na Vida', timeMs: 0 });
      HDL.state.recordDoc({ ticketId: 'DAY-' + item.id, score: docScore });
      HDL.state.applyImpact({ satisfaction: rootCorrect ? 3 : -3, slaOnTime: onTime ? 1 : 0, slaLate: onTime ? 0 : 1, good: rootCorrect, silent: true });
      HDL.state.award({ xp, points: xp, reason: `Dia na Vida: ${item.id} resolvido` });

      sound[rootCorrect ? 'success' : 'error']();
      // resumo
      stepHost.innerHTML = '';
      const okCls = rootCorrect ? 'is-ok' : 'is-bad';
      stepHost.append(el('div', { class: 'explain ' + okCls },
        el('h4', {}, HDL.ui.icon(rootCorrect ? 'check-circle' : 'alert', 17), ' ' + (rootCorrect ? 'Chamado resolvido' : 'Resolvido com causa incorreta')),
        el('p', { text: item.explanation }),
        el('div', { style: 'margin-top:10px;display:flex;flex-wrap:wrap;gap:8px' },
          chip(rootCorrect ? '✅ Causa correta' : '❌ Causa errada', rootCorrect),
          chip(priorityCorrect ? '✅ Prioridade certa' : '⚠️ Prioridade ' + prioLabel(item.priority), priorityCorrect),
          chip(onTime ? '✅ Dentro do SLA' : '⏰ Fora do SLA', onTime),
          chip('📝 Doc ' + docScore + '%', docScore >= 60)),
        el('div', { class: 'reward', text: `⭐ +${xp} XP · 😊 ${sat >= 0 ? '+' : ''}${sat} satisfação` }),
        el('button', { class: 'btn btn--primary', style: 'margin-top:14px', onclick: () => { m.close(); renderDesk(view); } }, '↩ Voltar à fila')));
      stepHost.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ---------- incidente crítico ---------- */
  function openIncident(item, view) {
    const body = el('div', {});
    body.append(el('div', { class: 'incident-banner' },
      el('span', { class: 'chip chip--critical', text: '🚨 INCIDENTE P1' }),
      el('strong', { style: 'display:block;font-size:18px;margin-top:8px', text: item.title }),
      el('p', { style: 'color:var(--text-dim);margin-top:8px;line-height:1.5', text: item.message })));
    body.append(el('p', { style: 'font-weight:600;margin:16px 0 12px', text: item.decision }));
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(item.options.slice());
    const keys = ['A', 'B', 'C'];
    let answered = false;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; resolve(o, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const fb = el('div'); body.append(fb);
    const m = modal({ title: '🚨 ' + item.title, sub: item.id + ' · P1', body, width: 700 });

    function resolve(o, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!o.correct) btn.classList.add('is-wrong');
      advance(item.timeCost, view);
      item.done = true;
      day.resolved.push({ item, onTime: true, priorityCorrect: true, rootCorrect: o.correct, docScore: 100, timeSpent: item.timeCost, incident: true });
      let sat = o.correct ? 12 : -14;
      day.satisfaction = Math.max(0, Math.min(100, day.satisfaction + sat));
      if (!o.correct) day.errors.push(`Conduta inadequada no incidente ${item.id}.`);
      HDL.state.recordAttempt({ correct: o.correct, tags: item.tags, category: 'Dia na Vida — Incidente' });
      HDL.state.applyImpact({ satisfaction: o.correct ? 6 : -8, slaOnTime: o.correct ? 1 : 0, slaLate: o.correct ? 0 : 1, good: o.correct, silent: true });
      const xp = o.correct ? 60 : 15;
      HDL.state.award({ xp, points: xp, reason: `Dia na Vida: incidente ${item.id}` });
      sound[o.correct ? 'success' : 'error']();
      fb.append(el('div', { class: 'explain ' + (o.correct ? 'is-ok' : 'is-bad') },
        el('h4', {}, HDL.ui.icon(o.correct ? 'check-circle' : 'alert', 17), ' ' + (o.correct ? 'Incidente conduzido corretamente' : 'Conduta inadequada')),
        el('p', { text: item.explanation }),
        el('div', { class: 'reward', text: `⭐ +${xp} XP · 😊 ${sat >= 0 ? '+' : ''}${sat} satisfação` }),
        el('button', { class: 'btn btn--primary', style: 'margin-top:14px', onclick: () => { m.close(); renderDesk(view); } }, '↩ Voltar à fila')));
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ---------- encerramento ---------- */
  function confirmEnd(view) {
    const pending = day.queue.filter(i => !i.done).length;
    const body = el('div', {},
      el('p', { style: 'color:var(--text-dim);line-height:1.6', text: pending ? `Ainda há ${pending} chamado(s) na fila. Encerrar agora deixará pendências, que pesam no relatório. Deseja encerrar o expediente?` : 'Encerrar o expediente e gerar o relatório de desempenho?' }),
      el('div', { style: 'display:flex;gap:10px;margin-top:18px;justify-content:flex-end' },
        el('button', { class: 'btn btn--ghost', onclick: () => m.close() }, 'Continuar trabalhando'),
        el('button', { class: 'btn btn--primary', onclick: () => { m.close(); endDay(view); } }, 'Encerrar expediente')));
    const m = modal({ title: '⏹️ Encerrar expediente', sub: clockStr(day.clock), body, width: 460 });
  }

  function endDay(view) {
    if (day.finished) return;
    day.finished = true;
    const resolved = day.resolved.length;
    const pending = day.queue.filter(i => !i.done).length;
    const onTime = day.resolved.filter(r => r.onTime).length;
    const rootOk = day.resolved.filter(r => r.rootCorrect).length;
    const avgTime = resolved ? Math.round(day.resolved.reduce((a, r) => a + r.timeSpent, 0) / resolved) : 0;
    const avgDoc = resolved ? Math.round(day.resolved.reduce((a, r) => a + r.docScore, 0) / resolved) : 0;
    const slaPct = resolved ? Math.round(onTime / resolved * 100) : 0;
    const successRate = resolved ? Math.round(rootOk / resolved * 100) : 0;

    // nota geral do dia
    const score = Math.round(0.35 * successRate + 0.25 * slaPct + 0.25 * day.satisfaction + 0.15 * avgDoc - pending * 4);
    const finalScore = Math.max(0, Math.min(100, score));

    // pontos fortes / a melhorar / recomendações
    const strengths = [], weak = [], recs = [];
    if (successRate >= 70) strengths.push('Diagnóstico preciso (causa raiz correta na maioria).'); else { weak.push('Acertou a causa raiz em poucos casos.'); recs.push('Investigue mais antes de concluir — use logs e CMD para confirmar a causa real.'); }
    if (slaPct >= 70) strengths.push('Bom cumprimento de SLA.'); else { weak.push('Vários atendimentos fora do prazo.'); recs.push('Priorize os chamados de maior impacto/urgência e ataque incidentes P1 primeiro.'); }
    if (day.satisfaction >= 70) strengths.push('Usuários satisfeitos com o atendimento.'); else { weak.push('Satisfação dos usuários abaixo do ideal.'); recs.push('Resolva certo da primeira vez e comunique-se com os usuários que aguardam.'); }
    if (avgDoc >= 70) strengths.push('Documentação consistente.'); else { weak.push('Documentação incompleta.'); recs.push('Registre problema, diagnóstico, causa, solução e tempo com clareza.'); }
    if (pending > 0) { weak.push(`${pending} chamado(s) deixados pendentes.`); recs.push('Gerencie melhor o tempo para não deixar a fila acumular.'); }
    if (!strengths.length) strengths.push('Concluiu o expediente — todo começo conta!');
    if (!recs.length) recs.push('Excelente dia! Mantenha o método e tente cargos mais altos no Modo Carreira.');

    const rankBefore = careerRank();
    const report = { resolved, pending, avgTime, avgDoc, slaPct, successRate, satisfaction: day.satisfaction, finalScore, errors: dedupe(day.errors), strengths, weak, recs };

    HDL.state.recordDaylife({ date: new Date().toLocaleDateString('pt-BR'), resolved, pending, slaPct, satisfaction: day.satisfaction, score: finalScore, success: successRate });
    const bonus = Math.round(finalScore * 0.8);
    HDL.state.award({ xp: bonus, points: bonus, reason: `Expediente concluído (nota ${finalScore}%)` });

    const rankAfter = careerRank();
    report.promoted = rankAfter.id !== rankBefore.id ? rankAfter : null;

    day.report = report;
    sound.levelup();
    renderReport(view, report);
  }

  function renderReport(view, r) {
    Array.from(view.querySelectorAll('.daylife-body')).forEach(n => n.remove());
    const wrap = el('div', { class: 'daylife-body' });

    const noteColor = r.finalScore >= 75 ? 'var(--green)' : r.finalScore >= 50 ? 'var(--amber)' : 'var(--red)';
    wrap.append(el('div', { class: 'card card--pad-lg', style: 'text-align:center' },
      el('div', { style: 'font-size:13px;color:var(--text-mute);text-transform:uppercase;letter-spacing:.6px', text: '🏁 Fim do expediente — 18:00' }),
      el('div', { class: 'ring', style: `--p:${r.finalScore};background:conic-gradient(${noteColor} ${r.finalScore}%, var(--panel-2) 0);margin-top:14px` }, el('b', { text: r.finalScore })),
      el('div', { style: 'margin-top:10px;font-weight:700', text: r.finalScore >= 75 ? 'Dia excelente! 🌟' : r.finalScore >= 50 ? 'Bom dia de trabalho 👍' : 'Dia difícil — dá pra melhorar 💪' })));

    if (r.promoted) {
      wrap.append(el('div', { class: 'card', style: 'border-color:var(--accent);box-shadow:0 0 30px -14px var(--accent-glow);text-align:center;margin-top:14px' },
        el('div', { style: 'font-size:32px', text: r.promoted.ico }),
        el('strong', { style: 'font-size:17px', text: '🎉 Promoção! Novo cargo: ' + r.promoted.name })));
    }

    wrap.append(el('div', { class: 'exec-grid', style: 'margin-top:16px' },
      kpi('Chamados resolvidos', r.resolved, '🛠️'),
      kpi('Pendentes', r.pending, '📥'),
      kpi('SLA atingido', r.slaPct + '%', '⏱️'),
      kpi('Taxa de sucesso', r.successRate + '%', '🎯'),
      kpi('Satisfação', r.satisfaction + '%', '😊'),
      kpi('Tempo médio', r.avgTime + ' min', '⌛'),
      kpi('Doc. média', r.avgDoc + '%', '📝')
    ));

    const cols = el('div', { class: 'two-col', style: 'margin-top:18px' });
    cols.append(
      listCard('💪 Pontos fortes', r.strengths, 'var(--green)'),
      listCard('🎯 A melhorar', r.weak.length ? r.weak : ['Sem pontos fracos relevantes!'], 'var(--amber)')
    );
    wrap.append(cols);

    if (r.errors.length) wrap.append(listCard('⚠️ Principais erros do dia', r.errors.slice(0, 8), 'var(--red)'));
    wrap.append(listCard('📌 Recomendações de melhoria', r.recs, 'var(--accent)'));

    wrap.append(el('div', { style: 'margin-top:20px;display:flex;gap:12px;flex-wrap:wrap' },
      el('button', { class: 'btn btn--primary', onclick: () => { day = null; render(view); } }, '🔁 Novo expediente'),
      el('button', { class: 'btn', onclick: () => location.hash = '#executive' }, '📊 Ver Painel Executivo')));

    view.append(wrap);
  }

  /* ---------- helpers de UI/cálculo ---------- */
  function listCard(title, items, color) {
    const card = el('div', { class: 'card' }, el('strong', { style: 'font-size:14px', text: title }));
    items.forEach(it => card.append(el('div', { style: 'display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--border-soft);font-size:13.5px;color:var(--text-dim)' },
      el('span', { style: 'color:' + color, text: '•' }), el('span', { text: it }))));
    return card;
  }
  function kpi(label, value, ico) {
    return el('div', { class: 'exec-card' },
      el('span', { style: 'position:absolute;right:14px;top:12px;font-size:24px;opacity:.18', text: ico }),
      el('div', { class: 'exec-card__label', text: label }),
      el('div', { class: 'exec-card__value', text: value }));
  }
  function chip(text, ok) { return el('span', { class: 'chip ' + (ok ? 'chip--done' : 'chip--critical'), text }); }
  function docField(label, type) {
    const input = type === 'input' ? el('input', { type: 'text', placeholder: 'ex.: 20' }) : el('textarea', { rows: 2, placeholder: 'Descreva…' });
    return { wrap: el('div', { class: 'doc-field' }, el('label', { text: label }), input), input };
  }
  function scoreDoc(f) {
    let s = 0;
    if (f.problema.input.value.trim().length >= 8) s += 22;
    if (f.diag.input.value.trim().length >= 12) s += 26;
    if (f.causa.input.value.trim().length >= 8) s += 26;
    if (f.sol.input.value.trim().length >= 12) s += 18;
    if (/^\d+$/.test(f.tempo.input.value.trim())) s += 8;
    return Math.min(100, s);
  }
  const TAG_MAP = {
    'D-101': ['senha', 'active directory'], 'D-102': ['impressora', 'spooler'],
    'D-103': ['vpn', 'senha', 'active directory'], 'D-104': ['dns', 'resolução de nomes'],
    'D-105': ['outlook', 'suplementos'], 'D-106': ['desempenho', 'disco'],
    'D-107': ['permissões', 'grupos'], 'D-108': ['compartilhamento', 'unidade de rede']
  };
  function tagsOf(item) { return item.tags || TAG_MAP[item.id] || []; }
  function prioLabel(p) { return { low: 'era Baixa', medium: 'era Média', high: 'era Alta', critical: 'era Crítica' }[p] || ''; }
  function careerRank() {
    const total = HDL.state.daylifeResolvedTotal();
    let r = DS.careerRanks[0];
    DS.careerRanks.forEach(c => { if (total >= c.minResolved) r = c; });
    return r;
  }
  function nextRank(cur) { const i = DS.careerRanks.indexOf(cur); return DS.careerRanks[i + 1] || null; }
  function dedupe(arr) { return Array.from(new Set(arr)); }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
