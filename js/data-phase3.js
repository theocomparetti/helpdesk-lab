/* ============================================================
   Help Desk Lab — Conteúdo da Fase 3
   Anexado a HDL.data após data.js carregar.
   ============================================================ */
(function () {
  const D = HDL.data;

  /* ---------------- Perfis de usuário (personalidades) ---------------- */
  const personas = {
    leigo: { id: 'leigo', name: 'Usuário leigo', ico: '🙂', tone: 'Descreve de forma vaga e usa termos errados.' },
    avancado: { id: 'avancado', name: 'Usuário avançado', ico: '🤓', tone: 'Traz detalhes técnicos e já tentou resolver.' },
    diretor: { id: 'diretor', name: 'Diretor', ico: '🤵', tone: 'Curto, direto e com urgência por ser VIP.' },
    impaciente: { id: 'impaciente', name: 'Usuário impaciente', ico: '😤', tone: 'Reclama, cobra e dá pouca informação útil.' },
    semtecnico: { id: 'semtecnico', name: 'Sem conhecimento técnico', ico: '🧓', tone: 'Confunde sintomas e causas.' },
    colaborativo: { id: 'colaborativo', name: 'Usuário colaborativo', ico: '😇', tone: 'Organizado, informa contexto e prints.' },
    estagiario: { id: 'estagiario', name: 'Estagiário', ico: '🧑‍🎓', tone: 'Inseguro, pede desculpas, mas tenta colaborar.' },
    gerente: { id: 'gerente', name: 'Gerente', ico: '👔', tone: 'Foca em impacto no negócio e prazos.' }
  };

  /* ---------------- Central de E-mails Corporativos ----------------
     Classificar a demanda corretamente. Uma das opções é a conduta certa.
  -------------------------------------------------------------------*/
  const emails = [
    {
      id: 'MAIL-01', persona: 'leigo', from: 'Mariana Lopes', dept: 'Financeiro', time: '08:12',
      subject: 'a internete não ta indo',
      body: 'oi bom dia, o computador não entra na internete, fica aquela bolinha rodando e não abre nada. ontem funcionava. me ajuda pq tenho q mandar o relatorio. obrigada!',
      options: [
        { text: 'Abrir chamado de Rede/Conectividade (prioridade média) e iniciar o diagnóstico: isolar se é só ela, testar ping no gateway → IP externo → nome.', correct: true },
        { text: 'Arquivar — não é uma demanda de TI.' },
        { text: 'Responder pedindo para ela "formatar o computador".' },
        { text: 'Abrir chamado de Impressão.' }
      ],
      explanation: 'Apesar da escrita informal e vaga (usuária leiga), a demanda é clara: sem acesso à internet. Classifique como Rede/Conectividade e siga a escada de diagnóstico. Extrair o problema real de um relato leigo é a habilidade treinada aqui.',
      impact: { satisfaction: 4, good: true }, tags: ['rede', 'conectividade', 'atendimento']
    },
    {
      id: 'MAIL-02', persona: 'diretor', from: 'Rafael Tavares', dept: 'Diretoria', time: '08:40',
      subject: 'E-mail travando — reunião 9h',
      body: 'Bom dia. Outlook travando e não consigo abrir os anexos da reunião com clientes às 9h. Preciso disso resolvido agora. Rafael, Diretor Comercial.',
      options: [
        { text: 'Abrir chamado de E-mail/Outlook com prioridade ALTA (VIP + prazo imediato) e atuar: outlook /safe para isolar suplementos.', correct: true },
        { text: 'Abrir com prioridade baixa e atender no fim do dia.' },
        { text: 'Arquivar — não é demanda de TI.' },
        { text: 'Pedir para o diretor reiniciar e aguardar 2 horas.' }
      ],
      explanation: 'Usuário VIP (diretor) + prazo imediato (reunião em minutos) elevam a urgência: prioridade ALTA. Reconhecer o peso do solicitante e do prazo é parte da priorização corporativa.',
      impact: { satisfaction: 5, good: true }, tags: ['outlook', 'sla', 'priorização']
    },
    {
      id: 'MAIL-03', persona: 'impaciente', from: 'Carlos Eduardo', dept: 'Comercial', time: '09:05',
      subject: 'DE NOVO ISSO???',
      body: 'isso é uma palhaçada, a impressora NUNCA funciona, já é a terceira vez essa semana!!! manda alguém AGORA. não aguento mais.',
      options: [
        { text: 'Manter a calma, abrir chamado de Impressão e tratar a recorrência (verificar Spooler/driver) — e registrar que é reincidente para tratar a causa raiz.', correct: true },
        { text: 'Responder no mesmo tom de reclamação.' },
        { text: 'Ignorar por ser um e-mail mal-educado.' },
        { text: 'Arquivar — não é demanda de TI.' }
      ],
      explanation: 'Com usuário impaciente, não leve para o pessoal: foque no problema. A recorrência ("terceira vez") é a pista importante — trate a causa raiz (Spooler/driver/fila), não só o sintoma. Atendimento profissional separa emoção de demanda.',
      impact: { satisfaction: 4, good: true }, tags: ['impressora', 'atendimento', 'recorrência']
    },
    {
      id: 'MAIL-04', persona: 'avancado', from: 'Bruno Antunes', dept: 'TI', time: '09:22',
      subject: 'Resolução de nomes falhando em 3 estações',
      body: 'Pessoal, em 3 máquinas o ping em 8.8.8.8 responde, mas nomes não resolvem. nslookup dá timeout apontando pro DNS 10.0.0.250. Já testei flushdns sem sucesso. Parece o servidor DNS.',
      options: [
        { text: 'Abrir incidente de DNS e investigar o servidor 10.0.0.250 (serviço/encaminhadores) — o usuário avançado já entregou o diagnóstico, valide e atue na origem.', correct: true },
        { text: 'Pedir para ele reinstalar o Windows das 3 máquinas.' },
        { text: 'Tratar como problema isolado de cada estação.' },
        { text: 'Arquivar — não é demanda de TI.' }
      ],
      explanation: 'Usuário avançado já fez metade do trabalho: isolou que é DNS no servidor 10.0.0.250. Aproveite as informações, valide e atue na origem (servidor), tratando como incidente que afeta várias estações.',
      impact: { satisfaction: 5, good: true }, tags: ['dns', 'incidente', 'servidor']
    },
    {
      id: 'MAIL-05', persona: 'semtecnico', from: 'Sandra Vieira', dept: 'Recepção', time: '10:01',
      subject: 'a tela ta escrita sem sinal',
      body: 'bom dia, liguei o computador e a tela ficou preta escrito "sem sinal". o computadorzinho ta com a luzinha acesa. será que queimou tudo? vou ter que comprar outro?',
      options: [
        { text: 'Abrir chamado de Hardware/Vídeo (prioridade média) e orientar/verificar o cabo de vídeo e a entrada selecionada — começar pelo simples antes de cogitar troca.', correct: true },
        { text: 'Confirmar que "queimou tudo" e pedir compra de um PC novo.' },
        { text: 'Arquivar — não é demanda de TI.' },
        { text: 'Abrir chamado de Rede.' }
      ],
      explanation: 'A usuária confunde sintoma com catástrofe ("queimou tudo"). "Sem sinal" com gabinete ligado é, na maioria, conexão de vídeo. Tranquilize, classifique como Hardware/Vídeo e comece pelo cabo/entrada antes de qualquer troca.',
      impact: { satisfaction: 4, good: true }, tags: ['monitor', 'vídeo', 'hardware']
    },
    {
      id: 'MAIL-06', persona: 'colaborativo', from: 'Fernanda Castro', dept: 'Atendimento', time: '10:30',
      subject: 'PC lento desde hoje — disco em 100% (print anexo)',
      body: 'Oi! Meu PC está demorando ~10min para ficar usável após ligar. No Gerenciador de Tarefas o disco fica em 100% logo no boot (anexei print). Não instalei nada novo. Qualquer info, só avisar. Obrigada!',
      options: [
        { text: 'Abrir chamado de Desempenho e usar as ótimas informações: revisar inicialização e a saúde do disco (HDD em 100% no boot é gargalo clássico).', correct: true },
        { text: 'Arquivar — não é demanda de TI.' },
        { text: 'Mandar ela apagar arquivos pessoais aleatórios.' },
        { text: 'Abrir chamado de VPN.' }
      ],
      explanation: 'Usuária colaborativa entrega contexto e print — aproveite. Disco em 100% no boot aponta para excesso de inicialização ou HDD saturado. Classifique como Desempenho e siga o roteiro (Inicializar, saúde do disco, SSD).',
      impact: { satisfaction: 5, good: true }, tags: ['desempenho', 'disco', 'inicialização']
    },
    {
      id: 'MAIL-07', persona: 'colaborativo', from: 'Boletim RH', dept: 'RH', time: '11:00',
      subject: '🎉 Festa junina da empresa — confirme presença',
      body: 'Olá pessoal! Convidamos todos para a festa junina da TechCorp nesta sexta. Confirme presença respondendo este e-mail. Não é necessário levar nada. Abraços, RH.',
      options: [
        { text: 'Arquivar / encaminhar — não é uma demanda de suporte técnico, não gera chamado.', correct: true },
        { text: 'Abrir chamado crítico de Infraestrutura.' },
        { text: 'Abrir chamado de Rede.' },
        { text: 'Escalar para o N3 imediatamente.' }
      ],
      explanation: 'Nem todo e-mail é demanda de TI. Saber filtrar o que NÃO vira chamado evita ruído na fila e demonstra discernimento. Este é um comunicado de RH — arquive ou encaminhe.',
      impact: { satisfaction: 2, good: true }, tags: ['triagem', 'atendimento']
    }
  ];

  /* ---------------- Análise de Logs ---------------- */
  const logScenarios = [
    {
      id: 'LOG-01', xp: 60, title: 'Falha de login em massa', source: 'Log de Segurança do Windows',
      context: 'Vários usuários relatam que não conseguem logar. Analise o log de segurança do controlador de domínio e identifique a causa.',
      lines: [
        { lvl: 'info', text: '08:00:11  Event 4624  Logon bem-sucedido  usuário: jsilva' },
        { lvl: 'warn', text: '08:14:03  Event 4625  Falha de logon  usuário: mlopes  motivo: 0xC0000071 (senha expirada)' },
        { lvl: 'warn', text: '08:15:22  Event 4625  Falha de logon  usuário: ceduardo  motivo: 0xC0000071 (senha expirada)' },
        { lvl: 'warn', text: '08:16:40  Event 4625  Falha de logon  usuário: svieira  motivo: 0xC0000071 (senha expirada)' },
        { lvl: 'info', text: '08:20:01  Event 4768  Kerberos TGT solicitado  host: DC01' }
      ],
      question: 'Qual a causa raiz indicada pelos logs?',
      options: [
        { text: 'Senhas expiradas em massa (motivo 0xC0000071) — provável GPO de expiração que venceu para um grupo. Forçar troca/ajustar política.', correct: true },
        { text: 'Ataque de força bruta vindo da internet.' },
        { text: 'O controlador de domínio está offline.' },
        { text: 'Problema de cabo de rede nas estações.' }
      ],
      explanation: 'Os eventos 4625 repetem o código 0xC0000071 = senha expirada, para usuários diferentes no mesmo intervalo. Isso indica expiração em massa (política/GPO), não ataque nem rede. O DC responde (eventos 4624/4768).',
      hints: ['Compare os eventos de FALHA (4625) com os de sucesso (4624).', 'Repare no código de motivo que se repete nas falhas.', 'O código 0xC0000071 tem um significado específico sobre a senha.'],
      tags: ['active directory', 'senha', 'gpo', 'logs']
    },
    {
      id: 'LOG-02', xp: 65, title: 'Aplicação web caindo', source: 'Log da aplicação (ERP)',
      context: 'O ERP fica indisponível por alguns segundos repetidamente. Analise o log da aplicação.',
      lines: [
        { lvl: 'info', text: '14:02:10  INFO  Pool de conexões: 18/20 em uso' },
        { lvl: 'warn', text: '14:02:45  WARN  Pool de conexões: 20/20 em uso (esgotado)' },
        { lvl: 'err', text: '14:02:46  ERROR  TimeoutException: não foi possível obter conexão com o banco em 30s' },
        { lvl: 'err', text: '14:02:51  ERROR  TimeoutException: não foi possível obter conexão com o banco em 30s' },
        { lvl: 'info', text: '14:03:30  INFO  Pool de conexões: 12/20 em uso' }
      ],
      question: 'O que os logs apontam como causa?',
      options: [
        { text: 'Esgotamento do pool de conexões com o banco (20/20) gerando timeouts — ajustar tamanho do pool / consultas que seguram conexão.', correct: true },
        { text: 'O servidor web foi desligado manualmente.' },
        { text: 'Erro de DNS impedindo o acesso.' },
        { text: 'Disco cheio no servidor de aplicação.' }
      ],
      explanation: 'O pool chega a 20/20 (esgotado) e, em seguida, surgem TimeoutException ao obter conexão com o banco. Causa: pool insuficiente ou conexões não liberadas (consultas lentas/leak). Solução: aumentar o pool e/ou otimizar as queries que retêm conexões.',
      hints: ['Observe o número de conexões em uso antes dos erros.', 'O que acontece exatamente no momento em que aparece "20/20"?', 'Relacione o esgotamento do pool com a TimeoutException seguinte.'],
      tags: ['erp', 'banco de dados', 'desempenho', 'logs']
    },
    {
      id: 'LOG-03', xp: 65, title: 'Tráfego suspeito na rede', source: 'Log do firewall',
      context: 'O monitoramento acusou tráfego anormal de uma estação. Analise o log do firewall.',
      lines: [
        { lvl: 'info', text: '02:11:09  ALLOW  192.168.1.77 → 142.250.0.14:443  (https)' },
        { lvl: 'warn', text: '02:11:10  ALLOW  192.168.1.77 → 185.62.x.x:6667  (irc)' },
        { lvl: 'warn', text: '02:11:12  ALLOW  192.168.1.77 → 185.62.x.x:6667  (irc) — 4200 conexões/min' },
        { lvl: 'err', text: '02:11:30  ALERT  Beaconing detectado: 192.168.1.77 — tráfego periódico a host externo' },
        { lvl: 'info', text: '02:12:00  INFO  Demais estações: tráfego normal' }
      ],
      question: 'Qual a interpretação correta dos logs?',
      options: [
        { text: 'A estação 192.168.1.77 apresenta sinais de comprometimento (beaconing/IRC para host externo) — isolar a máquina e investigar malware.', correct: true },
        { text: 'É tráfego normal de navegação web.' },
        { text: 'O firewall está com defeito e deve ser desligado.' },
        { text: 'Apenas atualização do Windows em andamento.' }
      ],
      explanation: 'Conexões periódicas (beaconing) para um host externo em porta de IRC, com volume anormal e só nessa estação, são indicadores clássicos de malware/C2. Conduta: isolar o host da rede e acionar a resposta a incidentes — não desligar o firewall.',
      hints: ['Compare o comportamento da estação .77 com as demais.', 'A porta 6667 (IRC) e o padrão periódico dizem algo.', 'O termo "beaconing" é típico de comunicação de malware com servidor externo.'],
      tags: ['segurança', 'rede', 'malware', 'logs']
    }
  ];

  /* ---------------- Modo Incidente Crítico (cronometrado) ---------------- */
  const incidentEvents = [
    {
      id: 'INC-01', xp: 150, timeLimit: 75, severity: 'critical',
      title: 'INTERNET DA EMPRESA CAIU',
      intro: 'P1 — Toda a TechCorp está sem internet. Telefones tocando, diretoria cobrando. Tome as decisões na ordem certa, rápido.',
      steps: [
        {
          prompt: 'Primeira ação?',
          options: [
            { text: 'Dimensionar o impacto e confirmar a abrangência (todos os setores? só um link?) antes de agir.', correct: true },
            { text: 'Sair reiniciando estações aleatórias.' },
            { text: 'Pedir para cada usuário trocar o cabo.' }
          ],
          explanation: 'Em P1, primeiro dimensione: é toda a empresa ou um segmento? Isso direciona toda a investigação.'
        },
        {
          prompt: 'Confirmado: todos sem internet, mas a rede interna funciona. Próximo passo?',
          options: [
            { text: 'Verificar o link de borda / roteador WAN e o status do provedor (operadora).', correct: true },
            { text: 'Reinstalar o Windows do servidor de arquivos.' },
            { text: 'Trocar o switch de um andar.' }
          ],
          explanation: 'Rede interna OK + sem internet = problema na saída (WAN): roteador de borda, link ou operadora. Foque na borda.'
        },
        {
          prompt: 'O link com a operadora está fora. O que fazer agora?',
          options: [
            { text: 'Acionar a operadora abrindo incidente, comunicar os usuários/gestores e ativar o link de contingência, se houver.', correct: true },
            { text: 'Esperar em silêncio o link voltar sozinho.' },
            { text: 'Culpar os usuários pelo problema.' }
          ],
          explanation: 'Causa externa (operadora): acione o provedor formalmente, comunique stakeholders e use redundância/contingência. Comunicação é parte da gestão do incidente.'
        }
      ],
      finalExplanation: 'Incidente P1 conduzido como manda o processo: dimensionar → isolar a camada (WAN) → acionar responsável + comunicar + contingência. Velocidade com método, não pânico.',
      tags: ['incidente', 'wan', 'sla', 'comunicação']
    },
    {
      id: 'INC-02', xp: 150, timeLimit: 75, severity: 'critical',
      title: 'SISTEMA FINANCEIRO FORA DO AR (fechamento)',
      intro: 'P1 — É dia de fechamento e o sistema financeiro parou para todos. Cada minuto conta.',
      steps: [
        {
          prompt: 'Primeira ação?',
          options: [
            { text: 'Confirmar abrangência e checar se o servidor da aplicação/banco está no ar (serviço/conectividade).', correct: true },
            { text: 'Pedir para o financeiro reinstalar o sistema em cada PC.' },
            { text: 'Trocar os monitores do setor.' }
          ],
          explanation: 'Falha para todos = central. Verifique o servidor de aplicação e o banco antes de tocar nas estações.'
        },
        {
          prompt: 'O serviço da aplicação está rodando, mas não conecta ao banco de dados. Próximo passo?',
          options: [
            { text: 'Investigar o servidor de banco de dados (serviço parado, disco cheio, conexões) e a rede entre app e banco.', correct: true },
            { text: 'Formatar o servidor de aplicação imediatamente.' },
            { text: 'Encerrar o expediente do financeiro.' }
          ],
          explanation: 'App de pé sem conectar ao banco → foco no servidor de banco e na conectividade app↔banco. Não formatar nada às cegas.'
        },
        {
          prompt: 'O serviço do banco caiu por disco cheio. Conduta?',
          options: [
            { text: 'Liberar espaço com segurança, reativar o serviço do banco, validar a aplicação e comunicar o financeiro — depois, ação preventiva (monitorar disco).', correct: true },
            { text: 'Apagar arquivos do banco aleatoriamente.' },
            { text: 'Ignorar e esperar o próximo dia.' }
          ],
          explanation: 'Resolva a causa (espaço em disco) com cuidado, restabeleça o serviço, valide e comunique. Depois, previna a reincidência com monitoração — pensamento de quem trata causa, não só sintoma.'
        }
      ],
      finalExplanation: 'Incidente crítico de negócio conduzido com método mesmo sob pressão de fechamento: isolar a camada (banco), tratar a causa (disco) com segurança, validar, comunicar e prevenir.',
      tags: ['incidente', 'banco de dados', 'sla', 'servidor']
    }
  ];

  /* ---------------- Reunião com Gestores (justificar decisões) ---------------- */
  const meetingScenarios = [
    {
      id: 'MEET-01', xp: 45, manager: 'Gerente de TI',
      question: 'Por que você priorizou o chamado do diretor à frente de outros que chegaram antes?',
      options: [
        { text: 'Porque a priorização considera impacto × urgência: era usuário VIP com prazo crítico imediato, elevando a urgência — não foi ordem de chegada.', correct: true },
        { text: 'Porque diretor manda e a gente obedece sem critério.' },
        { text: 'Porque eu quis, sem motivo específico.' }
      ],
      explanation: 'Justifique com critério técnico/processual (impacto × urgência, SLA), não com hierarquia pura. Demonstra maturidade na priorização.',
      tags: ['sla', 'priorização', 'comunicação']
    },
    {
      id: 'MEET-02', xp: 45, manager: 'Diretora de Operações',
      question: 'Esse incidente de rede voltou a acontecer. Como você garante que não se repita?',
      options: [
        { text: 'Tratei a causa raiz (não só o sintoma), documentei na base de conhecimento e propus ação preventiva/monitoração para detectar antes do impacto.', correct: true },
        { text: 'Só reiniciei tudo de novo e torci para não voltar.' },
        { text: 'A culpa é dos usuários, não tenho o que fazer.' }
      ],
      explanation: 'A resposta madura foca em causa raiz + documentação + prevenção/monitoração. É o que diferencia apagar incêndio de gerir o serviço.',
      tags: ['causa raiz', 'documentação', 'prevenção']
    },
    {
      id: 'MEET-03', xp: 45, manager: 'CFO',
      question: 'Qual foi o impacto do incidente do sistema financeiro e o que aprendemos?',
      options: [
        { text: 'Quantifico o impacto (tempo parado, setor afetado), explico a causa (disco cheio no banco) e a ação preventiva adotada (monitoração de disco e alerta proativo).', correct: true },
        { text: 'Não sei medir impacto, só sei que deu erro.' },
        { text: 'Foi rápido, não precisa falar nada para ninguém.' }
      ],
      explanation: 'Para gestores, traduza TI em impacto de negócio (tempo, setores, risco) e mostre aprendizado/prevenção. Comunicação executiva é uma competência valorizada.',
      tags: ['comunicação', 'impacto', 'gestão']
    },
    {
      id: 'MEET-04', xp: 45, manager: 'Gerente de TI',
      question: 'Por que você escalou esse chamado para o N2 em vez de resolver sozinho?',
      options: [
        { text: 'Estava fora do escopo/permissões do N1 e o SLA corria risco; escalei com um resumo claro (sintomas, testes feitos, logs) para agilizar o N2.', correct: true },
        { text: 'Porque não quis trabalhar e empurrei para outro.' },
        { text: 'Escalei sem avisar nada nem passar contexto.' }
      ],
      explanation: 'Escalar é correto quando foge do escopo/SLA — desde que com contexto claro. Reconhecer limites e passar bem o bastão é profissionalismo, não fraqueza.',
      tags: ['escalonamento', 'sla', 'comunicação']
    }
  ];

  /* ---------------- IA Analista (assistente, orienta sem entregar) ---------------- */
  const aiKnowledge = [
    { keys: ['dns', 'resolução', 'nome'], answer: 'DNS traduz nomes (ex.: site.com) em endereços IP. Para investigar: teste se o ping por IP funciona mas por nome não — se sim, suspeite do DNS. Use nslookup para ver se o servidor responde e ipconfig /flushdns para limpar o cache. Pergunte-se: o DNS configurado está acessível?' },
    { keys: ['dhcp', 'apipa', '169.254', 'ip automático'], answer: 'DHCP entrega IP, máscara, gateway e DNS automaticamente. Se uma máquina aparece com 169.254.x.x (APIPA), ela NÃO recebeu resposta do DHCP. Investigue: o serviço DHCP está no ar? O escopo esgotou? Há comunicação (relay/ip helper) até o servidor?' },
    { keys: ['lentidão', 'lento', 'desempenho', 'travando'], answer: 'Para lentidão, isole a camada: é a máquina, a aplicação ou a rede? No host, olhe CPU/disco/memória no Gerenciador de Tarefas (disco 100% no boot? inicialização pesada?). Na rede, veja se há saturação de banda em horários de pico (tracert/latência). Pergunte: muda por horário? afeta só um ou vários?' },
    { keys: ['vpn', 'túnel', 'home office', 'remoto'], answer: 'Com VPN "conectada" mas sem acesso interno, verifique três coisas: (1) o DNS interno está sendo aplicado pelo túnel? (2) as rotas das sub-redes internas chegaram ao cliente (route print)? (3) há conflito de faixa — a rede de casa usa a mesma sub-rede da empresa? Cada uma explica o sintoma.' },
    { keys: ['impressora', 'imprimir', 'spooler', 'impressão'], answer: 'Para impressão: confirme conexão (USB/rede) e ping se for de rede; verifique se não está como "Usar impressora offline"; limpe a fila e reinicie o serviço Spooler de Impressão; confira a impressora padrão e o driver. Documentos que somem da fila geralmente são Spooler travado.' },
    { keys: ['sla', 'prioridade', 'prioridade', 'priorizar'], answer: 'Priorize por impacto × urgência, não por ordem de chegada. Muitos afetados ou serviço de negócio parado = impacto alto. Prazo imediato/VIP = urgência alta. A combinação define Baixa/Média/Alta/Crítica. SLA é o acordo de tempo de resposta/solução por prioridade.' },
    { keys: ['senha', 'login', 'logon', 'active directory', 'ad'], answer: 'Falha de login costuma ser senha expirada (política/GPO de expiração), conta bloqueada ou usuário fora do grupo correto. Se vários usuários falham juntos, suspeite de expiração em massa ou do controlador de domínio. Verifique os eventos 4625 no log de segurança e o motivo do código.' },
    { keys: ['gateway', 'rota', 'sem rede', 'conectividade'], answer: 'Faça a escada de conectividade: ping no gateway (rede local), depois num IP externo como 8.8.8.8 (saída/WAN), depois num nome (DNS). Onde parar de responder indica a camada do problema. Confirme também IP/máscara/gateway com ipconfig /all.' },
    { keys: ['log', 'evento', 'analisar log'], answer: 'Para analisar logs: filtre por nível (erro/aviso), procure padrões que se repetem e correlacione horários com o início do problema. Compare o item problemático com um que funciona. O segredo é ligar cada linha suspeita a uma causa, não ler tudo às cegas.' }
  ];

  /* ---------------- Trilhas de Carreira ---------------- */
  const careerTracks = [
    {
      id: 'trk-n1', name: 'Help Desk N1', ico: '🎧', color: '#34d399',
      desc: 'O básico do atendimento: senhas, impressoras, Wi-Fi, hardware e bom atendimento.',
      steps: [
        { label: 'Resolver 3 chamados nível 1', done: s => s.solvedTickets.filter(id => (D.tickets.find(t => t.id === id) || {}).difficulty === 1).length >= 3, total: 3, prog: s => s.solvedTickets.filter(id => (D.tickets.find(t => t.id === id) || {}).difficulty === 1).length },
        { label: 'Triagem de 3 e-mails na caixa corporativa', done: s => s.emailsHandled.filter(e => e.correct).length >= 3, total: 3, prog: s => s.emailsHandled.filter(e => e.correct).length },
        { label: 'Responder 3 perguntas de entrevista', done: s => s.solvedInterview.length >= 3, total: 3, prog: s => s.solvedInterview.length },
        { label: 'Ler 3 artigos da base de conhecimento', done: s => s.kbRead.length >= 3, total: 3, prog: s => s.kbRead.length }
      ]
    },
    {
      id: 'trk-n2', name: 'Help Desk N2', ico: '🛠️', color: '#38bdf8',
      desc: 'Problemas intermediários: Outlook, DNS, compartilhamentos, permissões e SLA.',
      steps: [
        { label: 'Resolver 3 chamados nível ≥2', done: s => s.solvedTickets.filter(id => (D.tickets.find(t => t.id === id) || {}).difficulty >= 2).length >= 3, total: 3, prog: s => s.solvedTickets.filter(id => (D.tickets.find(t => t.id === id) || {}).difficulty >= 2).length },
        { label: 'Acertar 3 cenários de SLA', done: s => s.solvedSla.length >= 3, total: 3, prog: s => s.solvedSla.length },
        { label: 'Documentar um chamado com nota ≥70%', done: s => s.docScores.some(d => d.score >= 70), total: 1, prog: s => s.docScores.some(d => d.score >= 70) ? 1 : 0 },
        { label: 'Concluir 2 diagnósticos', done: s => s.solvedDiagnostics.length >= 2, total: 2, prog: s => s.solvedDiagnostics.length }
      ]
    },
    {
      id: 'trk-infra', name: 'Suporte de Infraestrutura', ico: '🏗️', color: '#fbbf24',
      desc: 'Servidores, DHCP, AD/GPO, incidentes de alto impacto e operação NOC.',
      steps: [
        { label: 'Resolver 3 alertas no NOC', done: s => s.solvedMonitoring.length >= 3, total: 3, prog: s => s.solvedMonitoring.length },
        { label: 'Concluir 1 Incidente Crítico', done: s => s.solvedIncidents.length >= 1, total: 1, prog: s => s.solvedIncidents.length },
        { label: 'Resolver 1 desafio na Máquina Windows', done: s => s.solvedWindows.length >= 1, total: 1, prog: s => s.solvedWindows.length },
        { label: 'Acertar 1 chamado nível 4 (Especialista)', done: s => s.solvedTickets.some(id => (D.tickets.find(t => t.id === id) || {}).difficulty === 4), total: 1, prog: s => s.solvedTickets.some(id => (D.tickets.find(t => t.id === id) || {}).difficulty === 4) ? 1 : 0 }
      ]
    },
    {
      id: 'trk-redes', name: 'Analista de Redes', ico: '🌐', color: '#a78bfa',
      desc: 'Domínio de IP, DNS, VPN, roteamento e diagnóstico via terminal.',
      steps: [
        { label: 'Concluir todos os laboratórios de rede', done: s => s.solvedLabs.length >= D.networkLabs.length, total: D.networkLabs.length, prog: s => s.solvedLabs.length },
        { label: 'Resolver todos os cenários do terminal', done: s => s.terminalSolved.length >= 3, total: 3, prog: s => s.terminalSolved.length },
        { label: 'Analisar o log de tráfego suspeito', done: s => s.solvedLogs.includes('LOG-03'), total: 1, prog: s => s.solvedLogs.includes('LOG-03') ? 1 : 0 },
        { label: 'Resolver 1 Desafio Surpresa', done: s => s.solvedSurprise.length >= 1, total: 1, prog: s => s.solvedSurprise.length }
      ]
    },
    {
      id: 'trk-sis', name: 'Analista de Sistemas', ico: '💾', color: '#f87171',
      desc: 'Aplicações, banco de dados, logs e relação com a operação/negócio.',
      steps: [
        { label: 'Analisar 2 logs de aplicação/segurança', done: s => s.solvedLogs.filter(id => id !== 'LOG-03').length >= 2, total: 2, prog: s => s.solvedLogs.filter(id => id !== 'LOG-03').length },
        { label: 'Resolver o alerta de ERP (CPU) no NOC', done: s => s.solvedMonitoring.includes('NOC-04'), total: 1, prog: s => s.solvedMonitoring.includes('NOC-04') ? 1 : 0 },
        { label: 'Concluir o incidente do sistema financeiro', done: s => s.solvedIncidents.includes('INC-02'), total: 1, prog: s => s.solvedIncidents.includes('INC-02') ? 1 : 0 },
        { label: 'Justificar 2 decisões em reunião', done: s => s.solvedMeetings.length >= 2, total: 2, prog: s => s.solvedMeetings.length }
      ]
    }
  ];

  /* ---------------- Missões semanais / mensais ---------------- */
  const missions = [
    { id: 'wk-tickets', period: 'Semanal', ico: '🎫', name: 'Plantão da semana', desc: 'Resolva 5 chamados.', target: 5, prog: s => s.solvedTickets.length, reward: { xp: 50 } },
    { id: 'wk-noc', period: 'Semanal', ico: '📡', name: 'Vigilância NOC', desc: 'Resolva 2 alertas no NOC.', target: 2, prog: s => s.solvedMonitoring.length, reward: { xp: 40 } },
    { id: 'wk-kb', period: 'Semanal', ico: '📚', name: 'Sempre aprendendo', desc: 'Leia 4 artigos da base.', target: 4, prog: s => s.kbRead.length, reward: { xp: 30 } },
    { id: 'mo-incident', period: 'Mensal', ico: '🚨', name: 'Bombeiro de plantão', desc: 'Conclua 2 Incidentes Críticos.', target: 2, prog: s => s.solvedIncidents.length, reward: { xp: 120 } },
    { id: 'mo-career', period: 'Mensal', ico: '📜', name: 'Rumo à senioridade', desc: 'Conquiste 2 certificações.', target: 2, prog: s => s.certificates.length, reward: { xp: 150 } },
    { id: 'mo-master', period: 'Mensal', ico: '🏆', name: 'Maratona de TI', desc: 'Acumule 1000 pontos.', target: 1000, prog: s => s.points, reward: { xp: 100 } }
  ];

  /* ---------------- Conquistas ocultas ---------------- */
  D.achievements.push(
    { id: 'hidden-perfectionist', ico: '💎', name: 'Perfeccionista', desc: 'Documente um chamado com nota 100%.', hidden: true, cond: s => (s.docScores || []).some(d => d.score >= 100) },
    { id: 'hidden-firefighter', ico: '🚒', name: 'Bombeiro', desc: 'Conclua todos os Incidentes Críticos.', hidden: true, cond: s => (s.solvedIncidents || []).length >= incidentEvents.length },
    { id: 'hidden-mindreader', ico: '🔮', name: 'Leitor de Mentes', desc: 'Classifique corretamente todos os e-mails.', hidden: true, cond: s => (s.emailsHandled || []).filter(e => e.correct).length >= emails.length },
    { id: 'hidden-curious', ico: '🦉', name: 'Mente Curiosa', desc: 'Faça 10 perguntas à IA Analista.', hidden: true, cond: s => (s.aiAsked || 0) >= 10 },
    { id: 'hidden-detective', ico: '🕵️', name: 'Detetive de Logs', desc: 'Resolva todas as análises de log.', hidden: true, cond: s => (s.solvedLogs || []).length >= logScenarios.length },
    { id: 'hidden-diplomat', ico: '🤝', name: 'Diplomata', desc: 'Acerte todas as reuniões com gestores.', hidden: true, cond: s => (s.solvedMeetings || []).length >= meetingScenarios.length }
  );

  /* ---------------- Certificação extra (carreira completa) ---------------- */
  D.certifications.push(
    { id: 'cert-gestao', ico: '📊', name: 'Visão de Gestão', desc: 'Justifique 3 decisões em reunião e mantenha satisfação ≥ 80%.',
      cond: s => (s.solvedMeetings || []).length >= 3 && s.corp.satisfaction >= 80 }
  );

  Object.assign(D, {
    personas, emails, logScenarios, incidentEvents, meetingScenarios,
    aiKnowledge, careerTracks, missions
  });
})();
