/* ============================================================
   Módulo: Simulador de Acesso Remoto
   Conectar na máquina do colaborador, coletar informações e resolver.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.remote = (function () {
  const { el, sound, modal } = HDL.ui;

  const sessions = [
    {
      id: 'RMT-01', xp: 70, user: 'Patrícia Gomes', host: 'PC-RH-04', ip: '192.168.1.58',
      complaint: '"Não consigo acessar a pasta compartilhada do RH (unidade Z:). Aparece acesso negado, mas meus colegas acessam."',
      tools: [
        { id: 'ip', label: 'Ver ipconfig', sub: 'Configuração de rede', finding: 'IP 192.168.1.58/24, gateway 192.168.1.1, DNS OK. Conectividade normal.' },
        { id: 'grp', label: 'Ver grupos do usuário', sub: 'whoami /groups', finding: 'A conta pgomes NÃO pertence ao grupo "GRP-RH-Arquivos". Colegas que acessam estão no grupo.' },
        { id: 'net', label: 'Testar caminho UNC', sub: '\\\\FILE-SRV01\\rh', finding: 'O caminho abre o servidor, mas retorna "Acesso negado" para esta conta.' },
        { id: 'evt', label: 'Ver Visualizador de Eventos', sub: 'Segurança', finding: 'Evento de auditoria: negação de acesso por falta de permissão (não por bloqueio de conta).' }
      ],
      question: 'Coletadas as evidências, qual a solução correta?',
      options: [
        { text: 'Adicionar a conta pgomes ao grupo de segurança "GRP-RH-Arquivos" (acesso é concedido por grupo) e validar o acesso.', correct: true },
        { text: 'Dar a ela Administrador do Domínio.' },
        { text: 'Compartilhar a pasta para "Todos" com controle total.' },
        { text: 'Reinstalar o Windows da estação dela.' }
      ],
      explanation: 'As evidências convergem: conectividade OK, o servidor responde, mas a conta não está no grupo de segurança que dá acesso (os colegas estão). A correção segue o menor privilégio: adicionar a usuária ao grupo correto — nunca Admin de Domínio nem abrir para "Todos".',
      tags: ['permissões', 'grupos', 'compartilhamento', 'active directory']
    },
    {
      id: 'RMT-02', xp: 75, user: 'Diego Moura', host: 'NB-VENDAS-09', ip: '10.8.0.14',
      complaint: '"A VPN diz conectado, mas não abro o ERP nem pingo os servidores internos. Em casa funcionava ontem."',
      tools: [
        { id: 'vpn', label: 'Ver status da VPN', sub: 'Cliente VPN', finding: 'Túnel ativo, IP atribuído 10.8.0.14. Sessão estável.' },
        { id: 'route', label: 'Ver route print', sub: 'Tabela de rotas', finding: 'Não há rota para a sub-rede interna 172.16.0.0/16 pelo túnel. Apenas rota padrão local.' },
        { id: 'ip', label: 'Ver ipconfig da rede local', sub: 'Rede doméstica', finding: 'Rede de casa: 172.16.0.0/24 — MESMA faixa usada internamente pela empresa.' },
        { id: 'dns', label: 'Ver DNS atribuído', sub: 'nslookup', finding: 'DNS interno não foi aplicado pelo túnel; nomes internos não resolvem.' }
      ],
      question: 'Qual a causa raiz e a conduta?',
      options: [
        { text: 'Conflito de sub-rede: a rede doméstica usa a mesma faixa interna (172.16.0.0), então o tráfego não entra no túnel. Orientar mudar a faixa da rede doméstica / ajustar o split-tunnel e empurrar rotas+DNS internos.', correct: true },
        { text: 'A VPN está desconectada e precisa reconectar.' },
        { text: 'O ERP foi desinstalado do servidor.' },
        { text: 'A senha do usuário expirou.' }
      ],
      explanation: 'Túnel ativo, mas sem rota interna + DNS interno ausente + rede de casa na MESMA faixa da empresa (172.16.0.0). Esse conflito de sub-rede faz o tráfego interno nunca entrar no túnel. Solução: mudar a faixa doméstica e/ou ajustar rotas e DNS do cliente VPN.',
      tags: ['vpn', 'rotas', 'sub-rede', 'dns']
    }
  ];

  function render(view) {
    const s = HDL.state.get();
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('cast', 24), 'Simulador de Acesso Remoto'),
        el('p', { text: 'Conecte-se à estação do colaborador, colete informações com as ferramentas de diagnóstico e resolva o problema à distância — como num atendimento remoto real.' })
      )
    );
    const grid = el('div', { class: 'grid grid--cards' });
    sessions.forEach(se => {
      const done = s.solvedRemote.includes(se.id);
      grid.append(el('div', { class: 'card', style: 'cursor:pointer' + (done ? ';opacity:.8' : ''), onclick: () => connect(se) },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'ticket__id', text: se.id }),
          done ? el('span', { class: 'chip chip--done', text: '✓ Resolvido' }) : el('span', { class: 'chip chip--cat', text: '+' + se.xp + ' XP' })),
        el('strong', { style: 'display:block;margin:10px 0 6px;font-size:15px', text: se.user + ' — ' + se.host }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.5', text: se.complaint })
      ));
    });
    view.append(grid);
  }

  function connect(se) {
    const done = HDL.state.get().solvedRemote.includes(se.id);
    const investigated = new Set();
    const body = el('div', {});
    body.append(el('div', { class: 'remote' },
      el('div', { class: 'remote__bar' },
        el('span', { class: 'dot' }), el('b', { text: 'Sessão remota: ' + se.host }), el('small', { text: se.ip + ' · ' + se.user })),
      remoteScreen()
    ));
    const findings = el('div', { style: 'margin-top:14px' });
    body.append(el('div', { class: 'problem-box', style: 'margin-top:14px' }, '🗣️ ' + se.complaint));
    body.append(findings);

    const answerHost = el('div', { style: 'margin-top:14px' });
    body.append(answerHost);

    const m = modal({ title: '🖥️ Acesso Remoto — ' + se.host, sub: se.id + ' · ' + se.user, body, width: 720 });

    function remoteScreen() {
      const tools = el('div', { class: 'remote-tools' });
      se.tools.forEach(t => {
        tools.append(el('div', { class: 'remote-tool', onclick: () => investigate(t) },
          el('b', { text: '🔧 ' + t.label }), el('small', { text: t.sub })));
      });
      return el('div', { class: 'remote__screen' },
        el('div', { style: 'color:#cfe3ff;font-size:13px;margin-bottom:12px', text: 'Você assumiu o controle. Use as ferramentas para coletar informações:' }),
        tools);
    }

    function investigate(t) {
      if (investigated.has(t.id)) return;
      investigated.add(t.id);
      sound.click();
      findings.append(el('div', { class: 'remote-finding' }, el('b', { text: '› ' + t.label + ': ' }), t.finding));
      if (investigated.size >= 2 && !answerHost.querySelector('.options') && !done) showAnswer();
      findings.firstChild && findings.lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showAnswer() {
      answerHost.innerHTML = '';
      answerHost.append(el('p', { style: 'font-weight:600;margin:6px 0 12px', text: se.question }));
      const opts = el('div', { class: 'options' });
      const shuffled = shuffle(se.options.slice());
      const keys = ['A', 'B', 'C', 'D'];
      let answered = false;
      shuffled.forEach((o, i) => {
        const btn = el('button', { class: 'opt' }, el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
        btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o, btn); });
        opts.append(btn);
      });
      answerHost.append(opts);
      const fb = el('div'); answerHost.append(fb);

      function reveal(o, btn) {
        Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
        if (!o.correct) btn.classList.add('is-wrong');
        HDL.state.recordAttempt({ correct: o.correct, tags: se.tags, category: 'Acesso Remoto' });
        if (o.correct) {
          sound.success();
          HDL.state.applyImpact({ satisfaction: 6, good: true, silent: true });
          HDL.state.solveRemote(se.id, { xp: se.xp, points: se.xp, reason: `Acesso remoto ${se.id} resolvido` });
          fb.append(boxR(true, se, false));
        } else { sound.error(); fb.append(boxR(false, se, false)); const sug = HDL.modules.knowledge.suggestEl(se.tags); if (sug) fb.append(sug); }
        fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    if (done) { se.tools.forEach(t => investigate(t)); showAnswerDone(); }
    function showAnswerDone() {
      answerHost.innerHTML = '';
      answerHost.append(el('p', { style: 'font-weight:600;margin:6px 0 12px', text: se.question }));
      const opts = el('div', { class: 'options' });
      const shuffled = shuffle(se.options.slice());
      shuffled.forEach((o, i) => { const btn = el('button', { class: 'opt', disabled: true }, el('span', { class: 'opt__key', text: ['A', 'B', 'C', 'D'][i] }), el('span', { text: o.text })); if (o.correct) btn.classList.add('is-correct'); opts.append(btn); });
      answerHost.append(opts, boxR(true, se, true));
    }
  }

  function boxR(correct, se, replay) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Solução' : 'Resolvido remotamente!') : 'Reveja as evidências'),
      el('p', { text: se.explanation }));
    if (correct && !replay) b.append(el('div', { class: 'reward', text: `⭐ +${se.xp} XP · 😊 satisfação ↑` }));
    return b;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
