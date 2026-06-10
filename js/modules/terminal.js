/* ============================================================
   Módulo: Terminal Interativo (CMD virtual realista)
   Os comandos respondem conforme o cenário ativo, fornecendo
   pistas para o diagnóstico.
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.terminal = (function () {
  const { el, sound, modal } = HDL.ui;

  /* --------- Cenários --------- */
  const scenarios = [
    {
      id: 'TERM-DNS', xp: 60, title: 'Estação não abre sites', tags: ['dns', 'resolução de nomes'],
      summary: 'A usuária diz que "a internet não funciona", mas alguns sistemas internos por IP abrem. Use o terminal para descobrir a causa.',
      host: 'PC-FINANCEIRO-07', user: 'mlopes',
      net: { ip: '192.168.1.84', mask: '255.255.255.0', gw: '192.168.1.1', dns: '192.168.1.250', mac: '3C-A0-67-1B-9E-22' },
      facts: { gatewayUp: true, internetIpUp: true, dnsUp: false },
      question: 'Com base na saída dos comandos, qual é o problema?',
      causes: [
        { text: 'O servidor DNS (192.168.1.250) não está respondendo — falha de resolução de nomes.', correct: true },
        { text: 'A placa de rede está sem conectividade física.' },
        { text: 'O gateway padrão está fora do ar.' },
        { text: 'O computador está sem endereço IP.' }
      ],
      explanation: 'O ping ao gateway e a 8.8.8.8 funciona (conectividade OK), mas ping por nome e nslookup falham apontando para 192.168.1.250 → o DNS está inacessível. Corrija o servidor DNS e rode ipconfig /flushdns.'
    },
    {
      id: 'TERM-DHCP', xp: 65, title: 'Máquina sem rede após ligar', tags: ['dhcp', 'apipa'],
      summary: 'Computador ligado hoje cedo está totalmente sem rede. Descubra por que, usando os comandos.',
      host: 'PC-LOGISTICA-12', user: 'jreis',
      net: { ip: '169.254.23.150', mask: '255.255.0.0', gw: '', dns: '', mac: '8C-16-45-7A-30-D1' },
      facts: { gatewayUp: false, internetIpUp: false, dnsUp: false, apipa: true },
      question: 'Qual o diagnóstico correto?',
      causes: [
        { text: 'Endereço 169.254.x.x (APIPA): o computador não recebeu IP do DHCP. Investigar o servidor/escopo DHCP.', correct: true },
        { text: 'O servidor DNS está fora do ar.' },
        { text: 'O usuário digitou a senha errada.' },
        { text: 'A internet da operadora caiu.' }
      ],
      explanation: 'O IP 169.254.23.150 é APIPA — atribuído pelo Windows quando o DHCP não responde. Sem gateway e sem DNS, não há comunicação. A causa está no DHCP (serviço parado, escopo esgotado ou sem relay). Rode ipconfig /release e /renew e investigue o servidor.'
    },
    {
      id: 'TERM-GW', xp: 60, title: 'Sem acesso a nada da rede', tags: ['gateway', 'rede'],
      summary: 'A máquina tem IP correto, mas o usuário não acessa nem sistemas internos nem internet. Investigue.',
      host: 'PC-RECEPCAO-03', user: 'svieira',
      net: { ip: '192.168.1.61', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mac: 'A4-5E-60-C2-11-77' },
      facts: { gatewayUp: false, internetIpUp: false, dnsUp: true },
      question: 'O que os testes indicam?',
      causes: [
        { text: 'O gateway padrão (192.168.1.1) não responde — sem ele, a máquina não alcança outras redes nem a internet.', correct: true },
        { text: 'O DNS está mal configurado.' },
        { text: 'A máquina está com APIPA.' },
        { text: 'O cabo está perfeito e o problema é o navegador.' }
      ],
      explanation: 'A configuração IP está correta, mas o ping ao gateway 192.168.1.1 falha. Sem o gateway, nenhum tráfego sai da sub-rede. Verifique o link até o gateway/switch, a porta, o cabo e a saúde do próprio roteador.'
    }
  ];

  let active = scenarios[0];
  let history = [];   // linhas renderizadas {cls, text}
  let cmdHistory = [];
  let cmdIdx = 0;

  function render(view) {
    history = [];
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('terminal', 24), 'Terminal Interativo'),
        el('p', { text: 'Um prompt de comando virtual e realista. Os resultados mudam conforme o cenário — investigue com comandos de rede para encontrar a causa e depois clique em “Diagnosticar”.' })
      )
    );
    view.append(HDL.ui.labMeta([{ icon: 'target', text: 'Objetivo: achar a causa via CMD' }, { icon: 'sliders', text: 'Intermediário' }, { icon: 'clock', text: '~5–10 min' }, { icon: 'brain', text: 'Redes, DNS, troubleshooting' }]));

    const selector = el('div', { class: 'toolbar' });
    const seg = el('div', { class: 'seg' });
    scenarios.forEach(sc => {
      const done = HDL.state.get().terminalSolved.includes(sc.id);
      seg.append(el('button', {
        class: active.id === sc.id ? 'is-active' : '',
        onclick: () => { active = sc; render(view); }
      }, (done ? '✓ ' : '') + sc.title));
    });
    selector.append(seg);
    view.append(selector);

    const wrap = el('div', { class: 'term-wrap' });

    // Briefing lateral
    const brief = el('div', { class: 'term-brief' },
      el('div', { class: 'card' },
        el('strong', { style: 'font-size:14px', text: '📋 Chamado' }),
        el('p', { style: 'color:var(--text-dim);font-size:13px;line-height:1.6;margin-top:8px', text: active.summary }),
        el('div', { class: 'kv', style: 'margin-top:12px' },
          kv('Host', active.host), kv('Usuário', active.user)
        )
      ),
      el('div', { class: 'card' },
        el('strong', { style: 'font-size:14px', text: '💡 Comandos úteis' }),
        el('div', { class: 'hint-list', style: 'margin-top:10px' },
          cmdHint('ipconfig /all', 'Configuração de rede completa'),
          cmdHint('ping 192.168.1.1', 'Testa o gateway'),
          cmdHint('ping 8.8.8.8', 'Testa a internet por IP'),
          cmdHint('ping google.com', 'Testa resolução de nome'),
          cmdHint('nslookup google.com', 'Testa o DNS isoladamente'),
          cmdHint('help', 'Lista todos os comandos')
        )
      ),
      el('button', { class: 'btn btn--primary btn--block', onclick: () => diagnose() }, '🩺 Diagnosticar problema')
    );

    // Terminal
    const screen = el('div', { class: 'term__screen', id: 'termScreen' });
    const input = el('input', { type: 'text', spellcheck: 'false', autocomplete: 'off', placeholder: 'digite um comando e Enter…' });
    const term = el('div', { class: 'term' },
      el('div', { class: 'term__bar' },
        el('div', { class: 'term__dots' }, el('i'), el('i'), el('i')),
        el('span', { class: 'term__title', text: `Prompt de Comando — ${active.host}` })
      ),
      screen,
      el('div', { class: 'term__input' },
        el('span', { class: 'prompt', text: 'C:\\>' }),
        input
      )
    );

    wrap.append(brief, term);
    view.append(wrap);

    // boot
    printBoot(screen);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const v = input.value.trim();
        if (v) { runCommand(v, screen); cmdHistory.push(v); cmdIdx = cmdHistory.length; }
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        if (cmdIdx > 0) { cmdIdx--; input.value = cmdHistory[cmdIdx] || ''; e.preventDefault(); }
      } else if (e.key === 'ArrowDown') {
        if (cmdIdx < cmdHistory.length) { cmdIdx++; input.value = cmdHistory[cmdIdx] || ''; }
      }
    });
    // foco automático
    setTimeout(() => input.focus(), 50);
    term.addEventListener('click', () => input.focus());

    // expõe para os "command pills"
    HDL.modules.terminal._inject = (cmd) => { runCommand(cmd, screen); input.focus(); };
  }

  /* --------- Render helpers --------- */
  function out(screen, text, cls = '') {
    const line = el('div', { class: 'ln ' + cls, text });
    screen.append(line);
    screen.scrollTop = screen.scrollHeight;
  }
  function echo(screen, cmd) {
    const line = el('div', { class: 'ln cmd' }, el('span', { class: 'prompt', text: 'C:\\> ' }), cmd);
    screen.append(line);
  }
  function printBoot(screen) {
    out(screen, 'Microsoft Windows [versão 10.0.19045.4291]', 'muted');
    out(screen, '(c) Microsoft Corporation. Todos os direitos reservados.', 'muted');
    out(screen, '');
    out(screen, 'Help Desk Lab — terminal de treinamento. Digite "help" para ver os comandos.', 'warn');
    out(screen, '');
  }

  /* --------- Execução de comandos --------- */
  function runCommand(raw, screen) {
    echo(screen, raw);
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');
    const n = active.net;

    switch (cmd) {
      case 'help':
      case '?':
        out(screen, 'Comandos disponíveis:');
        [
          ['ipconfig', 'IP, máscara, gateway e DNS resumidos'],
          ['ipconfig /all', 'Configuração completa (DNS, MAC, DHCP)'],
          ['ping <destino>', 'Testa conectividade (IP ou nome)'],
          ['tracert <destino>', 'Mostra o caminho até o destino'],
          ['nslookup <nome>', 'Consulta o servidor DNS'],
          ['route print', 'Tabela de rotas (gateway)'],
          ['net use', 'Unidades de rede mapeadas'],
          ['net user [nome]', 'Contas de usuário'],
          ['net share', 'Compartilhamentos locais'],
          ['gpupdate /force', 'Reaplica políticas (GPO)'],
          ['tasklist', 'Processos em execução'],
          ['netstat -an', 'Conexões e portas em uso'],
          ['hostname', 'Nome do computador'],
          ['whoami', 'Usuário logado'],
          ['systeminfo', 'Informações do sistema'],
          ['cls', 'Limpa a tela']
        ].forEach(([c, d]) => out(screen, '  ' + c.padEnd(20) + d, 'muted'));
        break;

      case 'cls':
      case 'clear':
        screen.innerHTML = ''; break;

      case 'hostname':
        out(screen, active.host); break;

      case 'whoami':
        out(screen, 'corp\\' + active.user); break;

      case 'ipconfig':
        if (/\/all/i.test(raw)) ipconfigAll(screen, n);
        else if (/\/flushdns/i.test(raw)) out(screen, 'Cache de resolvedor de DNS esvaziado com êxito.', 'ok');
        else if (/\/release/i.test(raw)) out(screen, 'Endereço IP liberado para o Adaptador Ethernet.', 'warn');
        else if (/\/renew/i.test(raw)) {
          if (active.facts.apipa) { out(screen, 'Erro: não foi possível contatar o servidor DHCP.', 'err'); out(screen, 'Endereço APIPA atribuído: ' + n.ip, 'warn'); }
          else out(screen, 'Endereço IP renovado: ' + n.ip, 'ok');
        }
        else ipconfigShort(screen, n);
        break;

      case 'ping': doPing(screen, arg); break;
      case 'tracert':
      case 'traceroute': doTracert(screen, arg); break;
      case 'nslookup': doNslookup(screen, arg); break;

      case 'netstat':
        out(screen, 'Conexões ativas', '');
        out(screen, '  Proto  Endereço local         Endereço remoto        Estado', 'muted');
        out(screen, '  TCP    ' + n.ip + ':49712      52.96.40.12:443        ESTABLISHED', 'muted');
        out(screen, '  TCP    ' + n.ip + ':49713      ' + (n.gw || '0.0.0.0') + ':445   ' + (active.facts.gatewayUp ? 'ESTABLISHED' : 'SYN_SENT'), 'muted');
        out(screen, '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING', 'muted');
        break;

      case 'systeminfo':
        out(screen, 'Nome do host:              ' + active.host);
        out(screen, 'Sistema operacional:       Microsoft Windows 10 Pro');
        out(screen, 'Fabricante do SO:          Microsoft Corporation');
        out(screen, 'Memória física total:      8.192 MB');
        out(screen, 'Domínio:                   corp.local');
        out(screen, 'Placa de rede:             1 NIC instalada(s)');
        out(screen, '   [01]: Intel(R) Ethernet Connection', 'muted');
        out(screen, '         IP: ' + n.ip + (active.facts.apipa ? '  (APIPA)' : ''), active.facts.apipa ? 'warn' : 'muted');
        break;

      case 'net':
        doNet(screen, parts.slice(1)); break;

      case 'gpupdate':
        out(screen, 'Atualizando a política...', '');
        out(screen, '');
        out(screen, 'A atualização da Política de Computador foi concluída com êxito.', 'ok');
        out(screen, 'A atualização da Política de Usuário foi concluída com êxito.', 'ok');
        if (/\/force/i.test(raw)) out(screen, '(todas as configurações foram reaplicadas)', 'muted');
        break;

      case 'tasklist':
        out(screen, 'Nome da imagem                   PID  Memória', 'muted');
        out(screen, '========================= ======== ==========', 'muted');
        [
          ['System', '4', '152 K'], ['svchost.exe', '892', '12.480 K'],
          ['explorer.exe', '3120', '52.300 K'], ['OUTLOOK.EXE', '5044', '210.900 K'],
          ['chrome.exe', '6210', '388.120 K'], ['MsMpEng.exe', '2588', '180.640 K']
        ].forEach(([n, p, m]) => out(screen, n.padEnd(26) + p.padStart(6) + '  ' + m.padStart(10), 'muted'));
        break;

      case 'route':
        if (/print/i.test(arg)) doRoutePrint(screen, n);
        else out(screen, 'Uso: route print', 'err');
        break;

      case 'exit':
        out(screen, '(o terminal de treinamento não pode ser fechado — continue investigando)', 'muted'); break;

      default:
        out(screen, `"${parts[0]}" não é reconhecido como um comando interno ou externo,`, 'err');
        out(screen, 'um programa operável ou um arquivo em lotes.', 'err');
    }
    out(screen, '');
  }

  function ipconfigShort(screen, n) {
    out(screen, 'Adaptador Ethernet Ethernet:', '');
    out(screen, '   Endereço IPv4. . . . . . . . . : ' + n.ip + (active.facts.apipa ? '(Preferencial)' : ''), active.facts.apipa ? 'warn' : '');
    out(screen, '   Máscara de Sub-rede . . . . . : ' + n.mask);
    out(screen, '   Gateway Padrão. . . . . . . . : ' + (n.gw || ''), n.gw ? '' : 'warn');
  }
  function ipconfigAll(screen, n) {
    out(screen, 'Configuração de IP do Windows', '');
    out(screen, '   Nome do host . . . . . . . . . : ' + active.host);
    out(screen, '   Domínio . . . . . . . . . . . : corp.local');
    out(screen, '');
    out(screen, 'Adaptador Ethernet Ethernet:', '');
    out(screen, '   Descrição. . . . . . . . . . . : Intel(R) Ethernet Connection');
    out(screen, '   Endereço Físico (MAC). . . . . : ' + n.mac);
    out(screen, '   DHCP Habilitado. . . . . . . . : Sim');
    out(screen, '   Endereço IPv4. . . . . . . . . : ' + n.ip + (active.facts.apipa ? '  (Autoconfiguração / APIPA)' : '  (Preferencial)'), active.facts.apipa ? 'warn' : '');
    out(screen, '   Máscara de Sub-rede. . . . . . : ' + n.mask);
    out(screen, '   Gateway Padrão . . . . . . . . : ' + (n.gw || '(nenhum)'), n.gw ? '' : 'warn');
    out(screen, '   Servidores DNS . . . . . . . . : ' + (n.dns || '(nenhum)'), n.dns ? (active.facts.dnsUp ? '' : 'warn') : 'warn');
  }

  function doPing(screen, target) {
    if (!target) { out(screen, 'Uso: ping <destino>', 'err'); return; }
    const t = target.toLowerCase();
    const isName = /[a-z]/i.test(target) && !/^[0-9.]+$/.test(target);
    const f = active.facts;

    // resolução de nome primeiro
    if (isName) {
      if (!f.dnsUp) {
        out(screen, `A solicitação ping não pôde encontrar o host ${target}.`, 'err');
        out(screen, 'Verifique o nome e tente novamente.', 'err');
        return;
      }
    }
    let reachable;
    if (t === (active.net.gw || '').toLowerCase()) reachable = f.gatewayUp;
    else if (t === '8.8.8.8' || t === '1.1.1.1') reachable = f.internetIpUp;
    else if (isName) reachable = f.internetIpUp; // nome resolvido + internet
    else reachable = f.internetIpUp || f.gatewayUp;

    const ip = isName ? '142.250.218.110' : target;
    out(screen, `Disparando ${target} [${ip}] com 32 bytes de dados:`);
    if (reachable) {
      for (let i = 0; i < 4; i++) out(screen, `Resposta de ${ip}: bytes=32 tempo=${2 + i}ms TTL=117`, 'ok');
      out(screen, '');
      out(screen, `Estatísticas do Ping para ${ip}:`, '');
      out(screen, '    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda),', 'ok');
    } else {
      for (let i = 0; i < 4; i++) out(screen, 'Esgotado o tempo limite do pedido.', 'err');
      out(screen, '');
      out(screen, `Estatísticas do Ping para ${ip}:`, '');
      out(screen, '    Pacotes: Enviados = 4, Recebidos = 0, Perdidos = 4 (100% de perda),', 'err');
    }
  }

  function doTracert(screen, target) {
    if (!target) { out(screen, 'Uso: tracert <destino>', 'err'); return; }
    const f = active.facts;
    const isName = /[a-z]/i.test(target) && !/^[0-9.]+$/.test(target);
    if (isName && !f.dnsUp) { out(screen, `Não foi possível resolver o nome de destino ${target}.`, 'err'); return; }
    out(screen, `Rastreando a rota para ${target}`);
    out(screen, '');
    out(screen, `  1    <1 ms    <1 ms    <1 ms  ${active.net.gw || 'gateway'}`, f.gatewayUp ? '' : 'err');
    if (!f.gatewayUp) { out(screen, '  2     *        *        *     Esgotado o tempo limite.', 'err'); return; }
    if (!f.internetIpUp) { out(screen, '  2     *        *        *     Esgotado o tempo limite.', 'err'); out(screen, '  3     *        *        *     Falha na rota.', 'err'); return; }
    out(screen, '  2     8 ms     7 ms     8 ms  10.255.0.1', 'muted');
    out(screen, '  3    14 ms    13 ms    12 ms  200.152.0.1', 'muted');
    out(screen, '  4    21 ms    20 ms    22 ms  ' + target, 'muted');
    out(screen, 'Rastreamento concluído.', 'ok');
  }

  function doNslookup(screen, name) {
    const f = active.facts;
    const dns = active.net.dns || '(nenhum)';
    out(screen, 'Servidor:  dns.corp.local');
    out(screen, 'Address:  ' + dns);
    out(screen, '');
    if (!name) { return; }
    if (!f.dnsUp) {
      out(screen, `*** dns.corp.local não conseguiu encontrar ${name}: Tempo de espera do servidor esgotado`, 'err');
      out(screen, '(o servidor DNS configurado não respondeu)', 'muted');
      return;
    }
    out(screen, 'Resposta não autoritativa:', 'muted');
    out(screen, 'Nome:    ' + name);
    out(screen, 'Address:  142.250.218.110', 'ok');
  }

  function doNet(screen, args) {
    const sub = (args[0] || '').toLowerCase();
    const n = active.net;
    if (sub === 'use') {
      out(screen, 'Novas conexões serão lembradas.', 'muted');
      out(screen, '');
      out(screen, 'Status       Local     Remoto', 'muted');
      out(screen, '-------------------------------------------------------', 'muted');
      const ok = active.facts.gatewayUp;
      out(screen, (ok ? 'OK' : 'Indisponível').padEnd(13) + 'Z:'.padEnd(10) + '\\\\FILE-SRV01\\setor', ok ? 'ok' : 'err');
      out(screen, (ok ? 'OK' : 'Indisponível').padEnd(13) + 'S:'.padEnd(10) + '\\\\FILE-SRV01\\publico', ok ? 'ok' : 'err');
      out(screen, 'O comando foi concluído com êxito.', ok ? 'ok' : 'muted');
    } else if (sub === 'user') {
      if (args[1]) {
        out(screen, 'Nome de usuário                 ' + args[1]);
        out(screen, 'Nome completo                   Usuário Corporativo');
        out(screen, 'Conta ativa                     Sim');
        out(screen, 'Conta expira                    Nunca');
        out(screen, 'Senha expira                    ' + (Math.random() > .5 ? '90 dias' : 'Expirada'), 'muted');
        out(screen, 'Associações de grupo local      *Usuários do Domínio');
        out(screen, 'O comando foi concluído com êxito.', 'ok');
      } else {
        out(screen, 'Contas de usuário de \\\\' + active.host, '');
        out(screen, '-------------------------------------------------------', 'muted');
        out(screen, 'Administrador     ' + active.user + '          Convidado', 'muted');
        out(screen, 'O comando foi concluído com êxito.', 'ok');
      }
    } else if (sub === 'share') {
      out(screen, 'Nome do compart.   Recurso                        Comentário', 'muted');
      out(screen, '-------------------------------------------------------------', 'muted');
      out(screen, 'C$                 C:\\                            Compart. padrão', 'muted');
      out(screen, 'ADMIN$             C:\\Windows                     Admin remota', 'muted');
      out(screen, 'setor              D:\\Dados\\Setor                 ', 'muted');
      out(screen, 'O comando foi concluído com êxito.', 'ok');
    } else {
      out(screen, 'Sintaxe: net [ use | user | share ]', 'warn');
    }
  }

  function doRoutePrint(screen, n) {
    out(screen, '===========================================================================', 'muted');
    out(screen, 'Lista de Interfaces', '');
    out(screen, ' 12 ...' + n.mac + ' ......Intel(R) Ethernet Connection', 'muted');
    out(screen, '===========================================================================', 'muted');
    out(screen, 'Rotas Ativas IPv4:', '');
    out(screen, 'Destino de Rede     Máscara          Gateway        Interface  Métrica', 'muted');
    if (active.facts.apipa || !n.gw) {
      out(screen, '(nenhuma rota padrão — sem gateway configurado)', 'err');
    } else {
      out(screen, '        0.0.0.0          0.0.0.0      ' + n.gw + '     ' + n.ip + '     25', active.facts.gatewayUp ? '' : 'warn');
    }
    out(screen, '   ' + netOf(n.ip) + '    ' + n.mask + '       Em link        ' + n.ip + '    281', 'muted');
    out(screen, '===========================================================================', 'muted');
    if (!active.facts.gatewayUp && n.gw) out(screen, '(rota padrão existe, mas o gateway não responde)', 'warn');
  }
  function netOf(ip) { const p = ip.split('.'); p[3] = '0'; return p.join('.'); }

  /* --------- Diagnóstico final --------- */
  function diagnose() {
    const sc = active;
    const done = HDL.state.get().terminalSolved.includes(sc.id);
    const body = el('div', {});
    body.append(el('p', { style: 'color:var(--text-dim);font-size:14px;line-height:1.6;margin-bottom:14px', text: sc.question }));
    const opts = el('div', { class: 'options' });
    const shuffled = shuffle(sc.causes.slice());
    const keys = ['A', 'B', 'C', 'D'];
    let answered = done;
    shuffled.forEach((o, i) => {
      const btn = el('button', { class: 'opt', disabled: done },
        el('span', { class: 'opt__key', text: keys[i] }), el('span', { text: o.text }));
      btn.addEventListener('click', () => { if (answered) return; answered = true; reveal(o.correct, btn); });
      opts.append(btn);
    });
    body.append(opts);
    const fb = el('div'); body.append(fb);
    if (done) { Array.from(opts.children).forEach((b, i) => { if (shuffled[i].correct) b.classList.add('is-correct'); b.disabled = true; }); fb.append(boxR(true, sc, true)); }

    modal({ title: '🩺 Diagnóstico — ' + sc.title, sub: sc.id, body, width: 660 });

    function reveal(correct, btn) {
      Array.from(opts.children).forEach((b, i) => { b.disabled = true; if (shuffled[i].correct) b.classList.add('is-correct'); });
      if (!correct) btn.classList.add('is-wrong');
      HDL.state.recordAttempt({ correct, tags: sc.tags || [], category: 'Terminal' });
      if (correct) {
        sound.success();
        HDL.state.solveTerminal(sc.id, { xp: sc.xp, points: sc.xp, reason: `Cenário de terminal ${sc.id} resolvido` });
        fb.append(boxR(true, sc, false));
      } else {
        sound.error();
        fb.append(boxR(false, sc, false));
        const sug = HDL.modules.knowledge.suggestEl(sc.tags || []);
        if (sug) fb.append(sug);
      }
      fb.firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  function boxR(correct, sc, replay) {
    const b = el('div', { class: 'explain ' + (correct ? 'is-ok' : 'is-bad') },
      HDL.ui.result(correct, correct ? (replay ? 'Resolução' : 'Correto!') : 'Reanalise as saídas'),
      el('p', { text: sc.explanation }));
    if (correct && !replay) b.append(el('div', { class: 'reward', text: `⭐ +${sc.xp} XP · +${sc.xp} pontos` }));
    return b;
  }

  /* --------- pequenos helpers --------- */
  function kv(label, value) { return el('div', {}, el('label', { text: label }), el('span', { text: value })); }
  function cmdHint(cmd, desc) {
    const pill = el('span', { class: 'cmd-pill', text: cmd, onclick: () => HDL.modules.terminal._inject && HDL.modules.terminal._inject(cmd) });
    return el('div', { class: 'hint' }, pill, el('span', { style: 'color:var(--text-mute)', text: desc }));
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  return { render };
})();
