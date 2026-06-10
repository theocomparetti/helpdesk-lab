/* ============================================================
   Help Desk Lab — Conteúdo do modo "Dia na Vida de um Analista"
   Anexado a HDL.data após data.js. (HDL.data.dayShift)
   Tempo em minutos a partir das 08:00 (0 = 08:00, 600 = 18:00).
   ============================================================ */
(function () {
  const D = HDL.data;

  // Ferramentas de investigação disponíveis no expediente
  // Cada chamado fornece "findings" por ferramenta (a que não tiver, mostra "nada relevante").
  const TOOLS = [
    { id: 'ask', label: 'Perguntar ao usuário', ico: '💬', cost: 3 },
    { id: 'cmd', label: 'Rodar diagnóstico (CMD)', ico: '⌨️', cost: 5 },
    { id: 'logs', label: 'Ver logs / eventos', ico: '🔎', cost: 5 },
    { id: 'config', label: 'Verificar configuração/sistema', ico: '⚙️', cost: 5 }
  ];

  // Pool de chamados do expediente
  const tickets = [
    {
      id: 'D-101', arriveAt: 0, sla: 60, timeCost: 5, channel: 'chamado',
      persona: 'leigo', from: 'Mariana Lopes', dept: 'Financeiro',
      subject: 'Esqueci minha senha', priority: 'low',
      message: 'Oi! Esqueci minha senha e não consigo entrar no computador. Pode resetar pra mim? Obrigada 🙂',
      findings: {
        ask: 'Ela confirma que sabe o usuário, só esqueceu a senha. Sem outros sintomas.',
        cmd: 'Sem relevância — é uma solicitação de reset, não um problema técnico.',
        logs: 'Evento 4625 (falha de logon) motivo: senha incorreta repetida. Conta NÃO está bloqueada.',
        config: 'Conta ativa no AD, sem bloqueio. Apenas senha esquecida.'
      },
      rootCauses: [
        { text: 'Solicitação de reset de senha — resetar no AD e orientar a definir nova senha.', correct: true },
        { text: 'Conta bloqueada por tentativas — desbloquear.' },
        { text: 'Defeito no teclado.' }
      ],
      solution: 'Resetar a senha no Active Directory e orientar a criação de uma nova.',
      explanation: 'É uma requisição de serviço simples (reset de senha). Os logs mostram só senha incorreta, sem bloqueio. Baixa prioridade, resolução rápida.',
      followups: ['Oi, conseguiu resetar? 🙏']
    },
    {
      id: 'D-102', arriveAt: 20, sla: 90, timeCost: 15, channel: 'chamado',
      persona: 'impaciente', from: 'Carlos Eduardo', dept: 'Comercial',
      subject: 'IMPRESSORA NÃO FUNCIONA DE NOVO', priority: 'medium',
      message: 'de novo isso!! mandei imprimir a proposta 4 vezes e nada sai. ta tudo ligado. preciso AGORA.',
      findings: {
        ask: 'Diz que a impressora está ligada, com papel, e que os documentos "somem" da fila.',
        cmd: 'ping na impressora de rede responde — conectividade OK.',
        logs: 'Spooler de Impressão: 6 trabalhos presos com erro. Serviço em estado inconsistente.',
        config: 'Impressora padrão correta. Driver instalado. Fila travada.'
      },
      rootCauses: [
        { text: 'Fila/Spooler travado — limpar a fila e reiniciar o serviço Spooler de Impressão.', correct: true },
        { text: 'Impressora sem conexão de rede.' },
        { text: 'Office precisa ser reinstalado.' }
      ],
      solution: 'Parar o Spooler, limpar a pasta PRINTERS, reiniciar o serviço e reimprimir.',
      explanation: 'Documentos que somem da fila + trabalhos presos = Spooler travado. O ping confirma que a rede está OK. Trate a recorrência verificando driver/permissões.',
      followups: ['e ai?? ainda não saiu nada', 'isso é inaceitável, meu cliente ta esperando']
    },
    {
      id: 'D-103', arriveAt: 45, sla: 75, timeCost: 30, channel: 'chamado',
      persona: 'avancado', from: 'Diego Moura', dept: 'Vendas Externas',
      subject: 'VPN não me deixa acessar o ERP', priority: 'high',
      message: 'Pessoal, conecto na VPN normalmente (diz "conectado"), mas não acesso o ERP. Ontem funcionava. Já reiniciei o cliente VPN.',
      misdirection: 'Parece problema de VPN, mas a VPN está saudável.',
      findings: {
        ask: 'Ele diz que a VPN conecta e recebe IP. Só hoje parou de acessar os sistemas. Lembra que recebeu um aviso de "muitas tentativas de senha" mais cedo.',
        cmd: 'Túnel VPN ativo, IP atribuído, ping no gateway interno responde. A VPN está OK!',
        logs: 'Segurança/AD: a conta dmoura está BLOQUEADA após várias tentativas falhas de autenticação (lockout).',
        config: 'Cliente VPN configurado corretamente. Conta de domínio: status BLOQUEADA.'
      },
      rootCauses: [
        { text: 'A VPN está saudável — a causa real é a conta de domínio bloqueada (lockout). Desbloquear a conta resolve o acesso.', correct: true },
        { text: 'Reinstalar o cliente de VPN.' },
        { text: 'Trocar o servidor VPN.' }
      ],
      solution: 'Desbloquear a conta no AD, orientar sobre a senha e validar o acesso ao ERP pela VPN.',
      explanation: 'Cenário com desvio: o sintoma ("VPN não acessa") aponta para a VPN, mas a investigação mostra o túnel saudável e a CONTA BLOQUEADA por tentativas. Sem investigar os logs/AD, você "consertaria" a VPN à toa. A causa raiz é o lockout da conta.',
      followups: ['Conseguiu ver? Tenho visita em cliente daqui a pouco.']
    },
    {
      id: 'D-104', arriveAt: 70, sla: 100, timeCost: 20, channel: 'mensagem',
      persona: 'semtecnico', from: 'Sandra Vieira', dept: 'Recepção',
      subject: 'Internet não abre os sites', priority: 'medium',
      message: 'bom dia, a internet não ta indo, não abre nenhum site. mas o moço do TI falou que a internet da empresa ta normal.',
      misdirection: 'Parece "internet caiu", mas a conectividade existe — o problema é DNS.',
      findings: {
        ask: 'Ela diz que nada abre pelo nome. Não sabe informar detalhes técnicos.',
        cmd: 'ping 8.8.8.8 responde (0% perda). ping google.com falha: "não foi possível encontrar o host". nslookup dá timeout.',
        logs: 'Sem eventos de hardware/rede física. Adaptador conectado.',
        config: 'ipconfig /all: IP e gateway OK, mas o Servidor DNS aponta para 10.0.0.99 (inexistente/sem resposta).'
      },
      rootCauses: [
        { text: 'DNS incorreto: IP responde mas nomes não resolvem. Corrigir o servidor DNS e limpar o cache (flushdns).', correct: true },
        { text: 'A internet da empresa está fora do ar.' },
        { text: 'A placa de rede está queimada.' }
      ],
      solution: 'Ajustar o DNS para um servidor válido, rodar ipconfig /flushdns e validar com nslookup.',
      explanation: 'Outro desvio clássico: "sem internet" mas o ping por IP funciona — logo, conectividade OK. O DNS configurado (10.0.0.99) não responde. Corrigindo o DNS, a navegação por nome volta.',
      followups: ['oi, deu pra arrumar? preciso acessar o sistema da recepção']
    },
    {
      id: 'D-105', arriveAt: 95, sla: 120, timeCost: 25, channel: 'email',
      persona: 'colaborativo', from: 'Fernanda Castro', dept: 'Atendimento',
      subject: 'Outlook travando ao abrir anexos (print anexo)', priority: 'medium',
      message: 'Oi! O Outlook congela ao abrir e-mails com anexos grandes e às vezes pede pra abrir em Modo de Segurança. Anexei um print. Já reiniciei. Obrigada!',
      findings: {
        ask: 'Confirma que o travamento começou hoje e que aparece o aviso de Modo de Segurança.',
        cmd: 'Recursos do PC normais (CPU/RAM ok). Não é lentidão da máquina.',
        logs: 'Log de aplicação: falha no carregamento de um suplemento (add-in) de terceiros do Outlook.',
        config: 'Arquivo OST grande. Suplemento de terceiros recém-atualizado habilitado.'
      },
      rootCauses: [
        { text: 'Suplemento (add-in) defeituoso — iniciar o Outlook em modo seguro (outlook /safe), desabilitar o add-in e verificar o OST.', correct: true },
        { text: 'A conta de e-mail precisa ser recriada do zero.' },
        { text: 'O antivírus apagou o Outlook.' }
      ],
      solution: 'Abrir com outlook /safe, desabilitar o suplemento problemático e, se preciso, recriar o OST/perfil.',
      explanation: 'O log aponta falha de suplemento e o aviso de Modo de Segurança confirma. Isole com /safe, desabilite o add-in e verifique o OST. Não recrie a conta sem necessidade.',
      followups: []
    },
    {
      id: 'D-106', arriveAt: 130, sla: 110, timeCost: 20, channel: 'chamado',
      persona: 'estagiario', from: 'Lucas (estagiário)', dept: 'Marketing',
      subject: 'PC demora 10 min pra ficar usável', priority: 'low',
      message: 'oi, será que é normal o pc demorar uns 10 minutos depois de ligar? fica tudo travado no começo. desculpa se for besteira',
      findings: {
        ask: 'Diz que demora muito logo após ligar e depois melhora. Não instalou nada.',
        cmd: 'Sem problemas de rede.',
        logs: 'Sem erros críticos. Muitos programas iniciando com o Windows.',
        config: 'Gerenciador de Tarefas: disco em 100% no boot (HDD mecânico). Vários itens na inicialização.'
      },
      rootCauses: [
        { text: 'Disco/inicialização sobrecarregados: HDD em 100% no boot + excesso de inicialização. Revisar itens de inicialização e avaliar migração para SSD.', correct: true },
        { text: 'A internet está lenta.' },
        { text: 'O monitor está com defeito.' }
      ],
      solution: 'Desabilitar inicializações desnecessárias e avaliar troca do HDD por SSD.',
      explanation: 'Disco 100% no boot + muita inicialização = gargalo clássico de HDD. Limpe a inicialização e proponha SSD. Tranquilize o estagiário: a dúvida é válida.',
      followups: []
    },
    {
      id: 'D-107', arriveAt: 160, sla: 90, timeCost: 15, channel: 'chamado',
      persona: 'colaborativo', from: 'Equipe RH (3 novos)', dept: 'RH',
      subject: 'Novos funcionários sem acesso à pasta do setor', priority: 'medium',
      message: 'Os 3 contratados novos conseguem logar, mas não abrem a pasta compartilhada do RH (acesso negado). Os antigos acessam normalmente.',
      findings: {
        ask: 'Os novos logam normalmente; só a pasta do RH dá "acesso negado". Antigos acessam.',
        cmd: 'Caminho UNC \\\\FILE-SRV01\\rh abre, mas nega acesso a essas contas.',
        logs: 'Auditoria de segurança: negação por falta de permissão (não por bloqueio de conta).',
        config: 'As contas novas NÃO estão no grupo de segurança "GRP-RH-Arquivos". As antigas estão.'
      },
      rootCauses: [
        { text: 'Contas novas fora do grupo de segurança do RH — adicionar ao grupo "GRP-RH-Arquivos" (acesso por grupo, menor privilégio).', correct: true },
        { text: 'Dar Administrador do Domínio aos três.' },
        { text: 'Compartilhar a pasta para "Todos".' }
      ],
      solution: 'Adicionar as contas ao grupo de segurança correto e validar o acesso.',
      explanation: 'Acesso é concedido por grupo. Os novos não foram incluídos no grupo do RH. Adicione-os ao grupo — nunca Admin de Domínio nem "Todos" (menor privilégio).',
      followups: ['Conseguem nos ajudar? Eles precisam dos arquivos para começar.']
    },
    {
      id: 'D-108', arriveAt: 200, sla: 80, timeCost: 25, channel: 'email',
      persona: 'diretor', from: 'Rafael Tavares', dept: 'Diretoria',
      subject: 'Apresentação não abre — reunião do conselho', priority: 'high',
      message: 'Preciso abrir a apresentação no servidor compartilhado para o conselho em 1h e a unidade Z: sumiu (X vermelho). Resolver com urgência. Rafael, Diretor.',
      findings: {
        ask: 'Diz que a unidade Z: aparece com X vermelho. Colegas do setor acessam normalmente.',
        cmd: 'Caminho UNC \\\\FILE-SRV01\\diretoria abre normalmente — o servidor responde.',
        logs: 'Sem falha no servidor de arquivos. Outros usuários conectados ao share.',
        config: 'Mapeamento da unidade Z: perdido nesta estação (credenciais/reconexão).'
      },
      rootCauses: [
        { text: 'Servidor OK (colegas acessam) — mapeamento perdido nesta estação. Remapear a unidade (net use) e validar credenciais/permissões.', correct: true },
        { text: 'Reiniciar o servidor de arquivos imediatamente.' },
        { text: 'Reinstalar o Windows do diretor.' }
      ],
      solution: 'Testar o UNC, remapear a unidade Z: e confirmar credenciais/permissões.',
      explanation: 'Como os colegas acessam, o servidor está no ar — o problema é o mapeamento local. Remapeie a unidade. VIP + prazo elevam a prioridade para Alta. Reiniciar o servidor afetaria todos.',
      followups: ['Preciso disso resolvido. O conselho começa em minutos.']
    }
  ];

  // Incidentes críticos surpresa — disparam em horários do expediente e interrompem a rotina
  const incidents = [
    {
      id: 'DI-201', fireAt: 110, timeCost: 45, priority: 'critical',
      title: 'VPN CORPORATIVA CAIU',
      message: 'P1 — O concentrador VPN parou. Dezenas de usuários em home office ficaram sem acesso aos sistemas internos de uma vez.',
      decision: 'Qual sua primeira ação diante do P1?',
      options: [
        { text: 'Confirmar a abrangência (todos os usuários remotos?), verificar a saúde do concentrador VPN e do link, e acionar a equipe/escalar comunicando os afetados.', correct: true },
        { text: 'Atender um usuário remoto por vez, reconfigurando o cliente de cada um.' },
        { text: 'Ignorar e seguir resolvendo os chamados pequenos da fila.' }
      ],
      explanation: 'P1 que afeta muitos = priorize sobre tudo. Dimensione, verifique o concentrador/link e acione/escale comunicando. Atender um a um seria inútil; ignorar destrói o SLA.',
      tags: ['vpn', 'incidente', 'sla']
    },
    {
      id: 'DI-202', fireAt: 175, timeCost: 45, priority: 'critical',
      title: 'DNS PAROU DE RESPONDER',
      message: 'P1 — Em toda a empresa, sistemas e sites por nome pararam de abrir. Ping por IP funciona. A fila de chamados vai explodir.',
      decision: 'O que fazer primeiro?',
      options: [
        { text: 'Tratar como incidente central de DNS: validar/reativar o serviço DNS no servidor e comunicar — resolver na origem corta dezenas de chamados.', correct: true },
        { text: 'Abrir um chamado individual para cada usuário que reclamar.' },
        { text: 'Pedir para todos reiniciarem o Windows.' }
      ],
      explanation: 'IP responde, nomes não, e afeta todos = DNS central. Resolver na origem (servidor DNS) elimina a enxurrada de chamados. Tratar individualmente seria caótico.',
      tags: ['dns', 'incidente', 'sla']
    },
    {
      id: 'DI-203', fireAt: 260, timeCost: 45, priority: 'critical',
      title: 'SISTEMA DE VENDAS FORA DO AR',
      message: 'P1 — O sistema de vendas caiu para toda a equipe comercial. Negócios parados, gerência cobrando.',
      decision: 'Sua conduta?',
      options: [
        { text: 'Confirmar abrangência, checar o servidor da aplicação/banco e a conectividade, acionar a equipe responsável e comunicar a gerência com previsão — gestão de incidente.', correct: true },
        { text: 'Reinstalar o sistema de vendas em cada PC do comercial.' },
        { text: 'Esperar o sistema voltar sozinho.' }
      ],
      explanation: 'Falha para todo um setor = central (aplicação/banco/rede). Dimensione, valide o servidor, acione e comunique com previsão. Reinstalar por estação seria lento e inútil.',
      tags: ['incidente', 'servidor', 'sla', 'vendas']
    }
  ];

  // Cargos do Modo Carreira (progressão por desempenho acumulado no Dia na Vida)
  const careerRanks = [
    { id: 'estagiario', name: 'Estagiário de Suporte', ico: '🎓', minResolved: 0 },
    { id: 'n1', name: 'Help Desk N1', ico: '🎧', minResolved: 6 },
    { id: 'n2', name: 'Help Desk N2', ico: '🛠️', minResolved: 16 },
    { id: 'analista', name: 'Analista de Suporte', ico: '💼', minResolved: 30 },
    { id: 'infra', name: 'Analista de Infraestrutura', ico: '🏗️', minResolved: 48 },
    { id: 'especialista', name: 'Especialista em Suporte', ico: '🏆', minResolved: 70 }
  ];

  D.dayShift = { TOOLS, tickets, incidents, careerRanks, startMin: 0, endMin: 600 };
})();
