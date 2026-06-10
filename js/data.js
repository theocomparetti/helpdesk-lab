/* ============================================================
   Help Desk Lab — Conteúdo (HDL.data)
   Chamados, diagnósticos, laboratórios de rede, base de
   conhecimento, conquistas, níveis e ranking.
   ============================================================ */
window.HDL = window.HDL || {};

HDL.data = (function () {

  /* ---------------- Níveis / XP ---------------- */
  // XP necessário acumulado para alcançar cada nível
  const LEVELS = [
    { level: 1, xp: 0,    rank: 'Aprendiz de Suporte' },
    { level: 2, xp: 120,  rank: 'Atendente N1' },
    { level: 3, xp: 300,  rank: 'Analista de Suporte' },
    { level: 4, xp: 560,  rank: 'Analista N2' },
    { level: 5, xp: 900,  rank: 'Especialista de Redes' },
    { level: 6, xp: 1350, rank: 'Analista de Infraestrutura' },
    { level: 7, xp: 1900, rank: 'Engenheiro de Suporte' },
    { level: 8, xp: 2600, rank: 'Mestre do Troubleshooting' }
  ];

  /* ---------------- Chamados (tickets) ----------------
     dificuldade: 1=Iniciante 2=Intermediário 3=Avançado 4=Especialista
     options: a primeira marcada com correct:true é a resposta certa.
  -------------------------------------------------------*/
  const tickets = [
    {
      id: 'CHM-1042', difficulty: 1, xp: 30,
      user: 'Mariana Lopes', sector: 'Financeiro', category: 'Conta de usuário', priority: 'high',
      title: 'Não consigo fazer login no computador',
      desc: 'Bom dia! Voltei de férias e minha senha não funciona mais. Aparece "nome de usuário ou senha incorretos". Tenho um relatório para entregar até as 10h.',
      options: [
        { text: 'A senha de domínio provavelmente expirou durante as férias. Resetar a senha no Active Directory e orientar a definir uma nova.', correct: true },
        { text: 'Formatar a estação de trabalho e reinstalar o Windows.' },
        { text: 'Trocar o teclado, pois pode estar com defeito.' },
        { text: 'Pedir para ela usar o computador de um colega permanentemente.' }
      ],
      explanation: 'Senhas de domínio têm validade (GPO de expiração, normalmente 30–90 dias). Quem fica afastado costuma voltar com a senha vencida. O procedimento correto é resetar no AD (ou orientar Ctrl+Alt+Del → Alterar senha se ela ainda souber a antiga). Formatar é desproporcional e teclado não causa erro de credencial.',
      tags: ['active directory', 'senha', 'login']
    },
    {
      id: 'CHM-1043', difficulty: 1, xp: 25,
      user: 'Carlos Eduardo', sector: 'Comercial', category: 'Impressão', priority: 'medium',
      title: 'A impressora não imprime',
      desc: 'Mandei imprimir uma proposta 3 vezes e não sai nada. O documento some da fila e nada acontece. A impressora está ligada e com papel.',
      options: [
        { text: 'Verificar se há trabalhos travados na fila de impressão, reiniciar o serviço Spooler de Impressão e confirmar se a impressora padrão está correta.', correct: true },
        { text: 'Comprar uma impressora nova imediatamente.' },
        { text: 'Reinstalar o Microsoft Office.' },
        { text: 'Trocar o cabo de rede do computador.' }
      ],
      explanation: 'Documentos que "somem" da fila sem imprimir indicam fila travada ou serviço Spooler com problema. O caminho clássico: limpar a fila, reiniciar o serviço "Spooler de Impressão" (services.msc) e checar se a impressora padrão não foi trocada por uma virtual (PDF/OneNote). Reinstalar Office não tem relação com o subsistema de impressão.',
      tags: ['impressora', 'spooler', 'fila']
    },
    {
      id: 'CHM-1044', difficulty: 1, xp: 25,
      user: 'Patrícia Gomes', sector: 'RH', category: 'Rede / Wi-Fi', priority: 'medium',
      title: 'Notebook não conecta no Wi-Fi',
      desc: 'Meu notebook parou de pegar o Wi-Fi do escritório. No celular a rede aparece normal e funciona. No notebook nem aparece na lista de redes.',
      options: [
        { text: 'A rede funciona em outro aparelho, então o problema é local: verificar se o Wi-Fi do notebook está ativado (tecla/“modo avião”) e reiniciar o adaptador de rede sem fio.', correct: true },
        { text: 'Reiniciar o roteador de toda a empresa no horário comercial.' },
        { text: 'Trocar a senha do Wi-Fi para todos os usuários.' },
        { text: 'Concluir que a operadora de internet está fora do ar.' }
      ],
      explanation: 'Se a rede aparece e funciona em outros dispositivos, o ponto de acesso está OK — o problema é isolado ao notebook. Causas comuns: botão/tecla de função que desliga o rádio Wi-Fi, modo avião ativado ou driver do adaptador travado. Reiniciar o roteador afetaria todos sem necessidade.',
      tags: ['wi-fi', 'rede', 'adaptador']
    },
    {
      id: 'CHM-1045', difficulty: 2, xp: 45,
      user: 'Rafael Tavares', sector: 'Diretoria', category: 'E-mail / Outlook', priority: 'high',
      title: 'Outlook travando e abrindo em "Modo de Segurança"',
      desc: 'O Outlook está extremamente lento, congela ao abrir e-mails grandes e às vezes pergunta se quero abrir em Modo de Segurança. Já reiniciei o PC duas vezes.',
      options: [
        { text: 'Iniciar o Outlook em modo seguro (outlook /safe) para isolar suplementos, desativar add-ins problemáticos e verificar o tamanho/saúde do arquivo OST/PST.', correct: true },
        { text: 'Excluir a conta de e-mail e criar um endereço novo.' },
        { text: 'Desinstalar o antivírus corporativo.' },
        { text: 'Aumentar a memória RAM do servidor de e-mail.' }
      ],
      explanation: 'Travamentos e o prompt de Modo de Segurança quase sempre apontam para suplementos (add-ins) defeituosos ou um arquivo de dados (OST/PST) grande/corrompido. Abrir com `outlook /safe` carrega sem add-ins; se normalizar, desative-os um a um. Também vale recriar o perfil ou o OST. Excluir a conta perde dados sem necessidade.',
      tags: ['outlook', 'suplementos', 'ost']
    },
    {
      id: 'CHM-1046', difficulty: 2, xp: 50,
      user: 'JulianaReis', sector: 'Operações', category: 'Compartilhamento de rede', priority: 'high',
      title: 'Unidade de rede Z: indisponível',
      desc: 'A pasta compartilhada que uso todo dia (a unidade Z:) sumiu. Aparece um X vermelho e diz "não foi possível reconectar todas as unidades de rede". Meus colegas conseguem acessar.',
      options: [
        { text: 'Como os colegas acessam, o servidor de arquivos está no ar: testar acessar o caminho UNC (\\\\servidor\\pasta), reconectar/remapear a unidade e verificar as credenciais/permissões do usuário.', correct: true },
        { text: 'Reiniciar o servidor de arquivos imediatamente.' },
        { text: 'Reinstalar o Windows Explorer.' },
        { text: 'Desabilitar o firewall do servidor.' }
      ],
      explanation: 'Se os colegas acessam normalmente, o servidor e o compartilhamento estão funcionando — o problema é o mapeamento na máquina dela. Teste o caminho UNC direto (\\\\servidor\\pasta). Se abrir, remapeie a unidade (net use) e verifique se as credenciais/permissões NTFS+compartilhamento do usuário continuam corretas. Reiniciar o servidor afetaria todos.',
      tags: ['compartilhamento', 'unidade de rede', 'unc', 'net use']
    },
    {
      id: 'CHM-1047', difficulty: 2, xp: 55,
      user: 'Bruno Antunes', sector: 'TI', category: 'DNS', priority: 'high',
      title: 'Sites não abrem, mas o IP responde',
      desc: 'Não consigo abrir nenhum site pelo nome (google.com dá erro), porém quando dou ping em 8.8.8.8 funciona. O navegador diz "não foi possível encontrar o endereço DNS do servidor".',
      options: [
        { text: 'O ping por IP funciona mas a resolução por nome falha: é um problema de DNS. Verificar/ajustar o servidor DNS configurado e limpar o cache com ipconfig /flushdns.', correct: true },
        { text: 'Trocar o cabo de rede, pois há perda de pacotes.' },
        { text: 'A placa de rede está queimada.' },
        { text: 'O navegador precisa ser reinstalado.' }
      ],
      explanation: 'Sintoma clássico de DNS: o IP responde (camada de rede OK), mas nomes não resolvem ("DNS server not found"). Verifique o servidor DNS em ipconfig /all, troque por um conhecido (ex.: DNS interno ou 8.8.8.8) e rode ipconfig /flushdns. Se fosse cabo/placa, o ping por IP também falharia.',
      tags: ['dns', 'flushdns', 'resolução de nomes']
    },
    {
      id: 'CHM-1048', difficulty: 2, xp: 40,
      user: 'Fernanda Castro', sector: 'Atendimento', category: 'Desempenho', priority: 'low',
      title: 'Computador muito lento depois de ligar',
      desc: 'Meu PC demora uns 10 minutos pra ficar utilizável depois que ligo. O disco fica em 100% no Gerenciador de Tarefas e tudo trava.',
      options: [
        { text: 'Abrir o Gerenciador de Tarefas, identificar processos/inicialização pesados, revisar programas que iniciam com o Windows e verificar a saúde do disco (HDD x SSD, uso 100%).', correct: true },
        { text: 'Aumentar o brilho do monitor para "acordar" o sistema mais rápido.' },
        { text: 'Apagar arquivos pessoais aleatoriamente para liberar espaço.' },
        { text: 'Reinstalar a placa de vídeo.' }
      ],
      explanation: 'Disco em 100% logo após o boot indica excesso de programas na inicialização ou um HDD mecânico saturado. Use a aba Inicializar do Gerenciador de Tarefas para desabilitar itens desnecessários, verifique malware e considere a saúde/substituição do disco (migrar para SSD resolve a maioria desses casos).',
      tags: ['lentidão', 'inicialização', 'disco', 'gerenciador de tarefas']
    },
    {
      id: 'CHM-1049', difficulty: 3, xp: 70,
      user: 'Diego Moura', sector: 'Vendas Externas', category: 'VPN', priority: 'high',
      title: 'VPN conecta mas não acessa o sistema interno',
      desc: 'Estou em home office. A VPN diz "conectado", mas não consigo abrir o ERP nem pingar os servidores internos. Ontem funcionava.',
      options: [
        { text: 'VPN conectada sem acesso a recursos internos sugere falha de rota/DNS do túnel ou conflito de faixa IP: verificar rotas (route print), DNS interno e se a rede local do usuário usa a mesma sub-rede da empresa.', correct: true },
        { text: 'Pedir para o usuário ir presencialmente ao escritório todos os dias.' },
        { text: 'Desinstalar o cliente de VPN e usar a rede aberta.' },
        { text: 'Reiniciar o roteador doméstico do usuário 10 vezes.' }
      ],
      explanation: 'Túnel "up" mas sem acessar recursos costuma ser: (1) DNS interno não aplicado pelo túnel, (2) rotas não empurradas para as sub-redes internas, ou (3) conflito de faixa — a rede doméstica usa a mesma sub-rede (ex.: 192.168.0.0/24) da empresa, então o tráfego nunca entra no túnel. Verifique route print, o DNS atribuído e a sobreposição de sub-redes.',
      tags: ['vpn', 'rotas', 'sub-rede', 'dns']
    },
    {
      id: 'CHM-1050', difficulty: 3, xp: 75,
      user: 'Setor Inteiro — Logística', sector: 'Logística', category: 'Sistema corporativo', priority: 'critical',
      title: 'Sistema corporativo fora do ar para todo o setor',
      desc: 'URGENTE: ninguém da logística consegue acessar o sistema de expedição. Aparece "não foi possível conectar ao servidor". A operação está parada e os caminhões esperando.',
      options: [
        { text: 'Tratar como incidente de alto impacto: confirmar a abrangência, verificar disponibilidade do servidor/serviço da aplicação e a conectividade de rede até ele, e acionar a equipe responsável escalando conforme o SLA.', correct: true },
        { text: 'Atender um usuário por vez reinstalando o sistema em cada PC.' },
        { text: 'Ignorar até que alguém da diretoria reclame formalmente.' },
        { text: 'Mandar todos reiniciarem o Windows e aguardar.' }
      ],
      explanation: 'Falha simultânea para um setor inteiro = problema central (servidor de aplicação, serviço/banco caído ou link de rede), não nas estações. A conduta correta é dimensionar o impacto, validar o servidor e o caminho de rede até ele e escalar imediatamente conforme o SLA, comunicando os afetados. Reinstalar em cada PC seria inútil e lentíssimo.',
      tags: ['incidente', 'sla', 'servidor', 'indisponibilidade']
    },
    {
      id: 'CHM-1051', difficulty: 1, xp: 20,
      user: 'Sandra Vieira', sector: 'Recepção', category: 'Hardware', priority: 'medium',
      title: 'Monitor sem sinal ("No Signal")',
      desc: 'Cheguei e o monitor está preto com a mensagem "Sem sinal", mas o gabinete está ligado e com luz acesa. Já fui tomar um café e não voltou.',
      options: [
        { text: 'Verificar o cabo de vídeo (HDMI/DisplayPort/VGA) nas duas pontas, testar outra entrada do monitor e confirmar se a fonte de vídeo correta está selecionada.', correct: true },
        { text: 'Reinstalar o sistema operacional imediatamente.' },
        { text: 'Trocar a fonte de alimentação do gabinete.' },
        { text: 'Substituir a memória RAM do computador.' }
      ],
      explanation: '"Sem sinal" com o gabinete ligado quase sempre é conexão de vídeo: cabo solto/danificado, entrada errada selecionada no monitor (Source/Input) ou cabo na placa de vídeo errada (onboard x dedicada). Comece pelo simples e barato antes de cogitar troca de peças.',
      tags: ['monitor', 'vídeo', 'hardware', 'cabo']
    },
    {
      id: 'CHM-1052', difficulty: 3, xp: 80,
      user: 'Equipe Marketing', sector: 'Marketing', category: 'Permissões / GPO', priority: 'medium',
      title: 'Usuários novos sem acesso à pasta do departamento',
      desc: 'Contratamos 3 pessoas no marketing. Elas logam normalmente, mas não conseguem abrir a pasta compartilhada do departamento — diz "acesso negado". Os antigos acessam.',
      options: [
        { text: 'Verificar se as contas novas pertencem ao grupo de segurança do departamento e revisar as permissões NTFS/compartilhamento concedidas a esse grupo.', correct: true },
        { text: 'Dar permissão de Administrador do Domínio para os três usuários.' },
        { text: 'Compartilhar a pasta para "Todos" com controle total.' },
        { text: 'Recriar a pasta do zero e copiar tudo manualmente.' }
      ],
      explanation: 'Boa prática é conceder acesso por grupo de segurança, não por usuário. Se os antigos acessam e os novos não, provavelmente as contas novas não foram adicionadas ao grupo do departamento. Adicione-as ao grupo correto. Dar Admin de Domínio ou abrir para "Todos" são falhas graves de segurança (princípio do menor privilégio).',
      tags: ['permissões', 'ntfs', 'grupos', 'active directory', 'menor privilégio']
    },
    {
      id: 'CHM-1053', difficulty: 4, xp: 110,
      user: 'Vários setores', sector: 'Toda a empresa', category: 'DHCP / Infraestrutura', priority: 'critical',
      title: 'Máquinas pegando IP 169.254.x.x e sem rede',
      desc: 'Desde cedo vários computadores de andares diferentes estão sem internet. Em todos, o ipconfig mostra um IP começando com 169.254 e máscara 255.255.0.0. Quem já estava ligado ontem continua funcionando.',
      options: [
        { text: 'IP 169.254.x.x é APIPA: o cliente não recebeu endereço do DHCP. Verificar a disponibilidade do servidor/escopo DHCP (escopo esgotado ou serviço parado) e a comunicação até ele.', correct: true },
        { text: 'Configurar IP fixo manualmente em todas as máquinas da empresa.' },
        { text: 'Trocar todas as placas de rede simultaneamente.' },
        { text: 'Reinstalar o Windows em todos os equipamentos afetados.' }
      ],
      explanation: 'O endereço 169.254.x.x (APIPA) é atribuído pelo próprio Windows quando NÃO há resposta do DHCP. Como afeta máquinas que ligaram hoje (e não as que já tinham lease), o servidor/serviço DHCP caiu ou o escopo esgotou. Investigue o serviço DHCP, o escopo (endereços disponíveis) e o caminho de rede (ex.: ip helper/relay) até ele. IP fixo em massa é gambiarra que gera conflitos.',
      tags: ['dhcp', 'apipa', '169.254', 'infraestrutura', 'escopo']
    },
    {
      id: 'CHM-1054', difficulty: 4, xp: 120,
      user: 'João Pedro / TI', sector: 'TI', category: 'Active Directory / GPO', priority: 'high',
      title: 'GPO de mapeamento de unidade não aplica em um setor',
      desc: 'Criamos uma GPO para mapear a unidade S: automaticamente. Funciona para a maioria, mas o setor Fiscal nunca recebe o mapeamento, mesmo após reiniciar e rodar gpupdate /force.',
      options: [
        { text: 'Investigar o escopo da GPO: verificar em qual OU os usuários/computadores do Fiscal estão, a vinculação (link) da GPO, filtragem de segurança e herança/bloqueio de herança na OU.', correct: true },
        { text: 'Desabilitar todas as outras GPOs do domínio.' },
        { text: 'Recriar manualmente o mapeamento em cada PC e desistir da GPO.' },
        { text: 'Promover um novo controlador de domínio para forçar a replicação.' }
      ],
      explanation: 'GPO que aplica para uns e não para outros é quase sempre escopo. Confirme: (1) a OU onde estão os objetos do Fiscal está dentro do alcance do link da GPO; (2) a Filtragem de Segurança inclui o grupo/usuários certos; (3) não há "Bloquear herança" na OU do Fiscal; (4) o tipo de configuração (usuário x computador) bate com onde o objeto está. Use gpresult /r para confirmar o que está realmente sendo aplicado.',
      tags: ['gpo', 'active directory', 'ou', 'gpresult', 'herança']
    }
  ];

  /* ---------------- Simulador de Diagnóstico ----------------
     O usuário lê sintomas/pistas e escolhe a CAUSA RAIZ.
  -------------------------------------------------------------*/
  const diagnostics = [
    {
      id: 'DIAG-01', difficulty: 2, xp: 50,
      title: 'A internet "caiu" em uma estação',
      scenario: 'Um usuário relata que ficou sem internet. Você coleta os dados abaixo no computador dele.',
      clues: [
        'ipconfig mostra: IP 192.168.10.45, Máscara 255.255.255.0, Gateway 192.168.10.1',
        'ping 192.168.10.1 (gateway) → responde normalmente',
        'ping 8.8.8.8 → "Esgotado o tempo limite do pedido"',
        'Outros computadores da mesma rede estão navegando sem problema'
      ],
      causes: [
        { text: 'O computador alcança o gateway, mas não a internet, enquanto os vizinhos navegam — provável bloqueio/regra específica para esse host ou falha na saída para a WAN a partir dele.', correct: true },
        { text: 'A placa de rede está totalmente queimada.' },
        { text: 'O servidor DNS está fora do ar para toda a empresa.' },
        { text: 'O cabo de rede está desconectado.' }
      ],
      explanation: 'Ele pinga o gateway (LAN OK, cabo e placa OK), mas não alcança 8.8.8.8, enquanto os vizinhos navegam. Logo, não é cabo, placa nem DNS geral. A causa está na saída desse host específico para a WAN: regra de firewall/proxy bloqueando o IP/MAC, bloqueio por controle de acesso, ou rota/NAT específica. Investigue políticas aplicadas a essa máquina.',
      tags: ['diagnóstico', 'ping', 'gateway', 'wan']
    },
    {
      id: 'DIAG-02', difficulty: 2, xp: 50,
      title: 'Consigo pingar IP, mas nenhum site abre',
      scenario: 'Usuário consegue usar um sistema interno por IP, mas nenhum site abre pelo nome. Dados coletados:',
      clues: [
        'ping 8.8.8.8 → responde (0% de perda)',
        'ping google.com → "não foi possível localizar o host google.com"',
        'nslookup google.com → "Tempo de espera esgotado" / sem resposta do servidor',
        'No ipconfig /all, o Servidor DNS aponta para 10.0.0.250'
      ],
      causes: [
        { text: 'Falha na resolução de nomes: o servidor DNS configurado (10.0.0.250) não está respondendo. Trocar/validar o DNS e limpar o cache resolve.', correct: true },
        { text: 'A internet está totalmente fora.' },
        { text: 'O cabo de rede está com defeito.' },
        { text: 'O antivírus apagou o navegador.' }
      ],
      explanation: 'IP responde (conectividade OK), mas nomes não resolvem e o nslookup não obtém resposta do servidor 10.0.0.250 → o DNS configurado está inacessível ou parado. Aponte para um DNS funcional (interno ou externo), rode ipconfig /flushdns e teste novamente o nslookup.',
      tags: ['dns', 'nslookup', 'resolução de nomes']
    },
    {
      id: 'DIAG-03', difficulty: 3, xp: 65,
      title: 'Lentidão intermitente só de tarde',
      scenario: 'Um setor reclama que o sistema web interno fica lento todos os dias após o almoço. De manhã é normal. Observações:',
      clues: [
        'A lentidão começa por volta das 13h e melhora após as 18h',
        'tracert até o servidor mostra salto alto de latência apenas no link de saída',
        'O uso de CPU e disco das estações está normal',
        'Coincide com o horário em que o setor assiste vídeos de treinamento em streaming'
      ],
      causes: [
        { text: 'Saturação de banda no horário de pico (streaming consumindo o link), e não problema nas estações — exige QoS/limitação de tráfego ou priorização do sistema crítico.', correct: true },
        { text: 'Todas as estações estão com vírus que só agem à tarde.' },
        { text: 'O servidor web desliga sozinho no almoço.' },
        { text: 'A memória RAM das máquinas evapora após o almoço.' }
      ],
      explanation: 'Padrão por horário + latência alta apenas no link de saída + coincidência com streaming = congestionamento de banda (saturação do link), não falha de estação. A solução é de rede: aplicar QoS para priorizar o sistema crítico, limitar/bloquear streaming ou ampliar o link. Hardware das máquinas está saudável.',
      tags: ['lentidão', 'banda', 'qos', 'tracert', 'rede']
    },
    {
      id: 'DIAG-04', difficulty: 3, xp: 70,
      title: 'Conflito de IP na rede',
      scenario: 'Dois usuários relatam que a rede "pisca" — conecta e desconecta. O Windows mostrou um aviso a um deles. Dados:',
      clues: [
        'Windows exibiu: "Foi detectado um conflito de endereço IP nesta rede"',
        'As duas máquinas estão configuradas com IP fixo 192.168.1.20',
        'O escopo DHCP da rede distribui a faixa 192.168.1.10–192.168.1.200',
        'Quando uma máquina é desligada, a outra normaliza'
      ],
      causes: [
        { text: 'Conflito de IP: duas máquinas com o mesmo endereço fixo dentro da faixa do DHCP. A correção é usar IPs fora do escopo (ou reserva no DHCP) e endereços únicos.', correct: true },
        { text: 'O roteador está com defeito de fábrica.' },
        { text: 'Excesso de cabos de rede no andar.' },
        { text: 'O Windows precisa ser reativado.' }
      ],
      explanation: 'A própria mensagem confirma: dois hosts com o mesmo IP (192.168.1.20), ainda por cima fixo dentro da faixa distribuída pelo DHCP — receita para conflito. Quando uma desliga, a outra volta porque o endereço fica livre. Correção: endereços únicos, e IPs estáticos sempre FORA do escopo DHCP ou configurados como reserva no servidor.',
      tags: ['conflito de ip', 'dhcp', 'ip fixo', 'escopo']
    }
  ];

  /* ---------------- Laboratório de Redes ----------------
     O usuário corrige uma configuração de rede quebrada.
  --------------------------------------------------------*/
  const networkLabs = [
    {
      id: 'NET-01', difficulty: 1, xp: 40,
      title: 'Gateway na sub-rede errada',
      brief: 'O host não navega. A rede é 192.168.1.0/24. Corrija o campo incorreto para que o host alcance o gateway.',
      fields: [
        { key: 'ip', label: 'Endereço IP', value: '192.168.1.50', answer: '192.168.1.50', hint: 'Já está correto, dentro da rede.' },
        { key: 'mask', label: 'Máscara de Sub-rede', value: '255.255.255.0', answer: '255.255.255.0', hint: '/24 = 255.255.255.0' },
        { key: 'gateway', label: 'Gateway Padrão', value: '192.168.2.1', answer: '192.168.1.1', hint: 'O gateway precisa estar NA MESMA sub-rede do host.' },
        { key: 'dns', label: 'Servidor DNS', value: '8.8.8.8', answer: '8.8.8.8', hint: 'DNS público válido.' }
      ],
      explanation: 'O gateway estava em 192.168.2.1, fora da rede 192.168.1.0/24 do host. O gateway padrão precisa pertencer à mesma sub-rede da interface; caso contrário o host não tem como entregar pacotes a ele. Correto: 192.168.1.1.',
      tags: ['ipv4', 'gateway', 'sub-rede']
    },
    {
      id: 'NET-02', difficulty: 2, xp: 55,
      title: 'Máscara incompatível',
      brief: 'Servidor e gateway deveriam estar na mesma rede /24, mas a máscara ficou errada e o servidor "não enxerga" o gateway.',
      fields: [
        { key: 'ip', label: 'Endereço IP', value: '10.0.0.20', answer: '10.0.0.20', hint: 'Mantém.' },
        { key: 'mask', label: 'Máscara de Sub-rede', value: '255.255.255.240', answer: '255.255.255.0', hint: '/24 padrão = 255.255.255.0. /28 (…240) cria uma rede pequena demais.' },
        { key: 'gateway', label: 'Gateway Padrão', value: '10.0.0.1', answer: '10.0.0.1', hint: 'Correto.' },
        { key: 'dns', label: 'Servidor DNS', value: '10.0.0.1', answer: '10.0.0.1', hint: 'Correto.' }
      ],
      explanation: 'Com máscara 255.255.255.240 (/28), o IP 10.0.0.20 fica em uma sub-rede (10.0.0.16–10.0.0.31) que inclui o gateway 10.0.0.1? Não — 10.0.0.1 está no bloco 10.0.0.0–10.0.0.15. Resultado: host e gateway ficam em redes diferentes e não se comunicam. A máscara correta para o cenário /24 é 255.255.255.0.',
      tags: ['máscara', 'cidr', 'sub-rede']
    },
    {
      id: 'NET-03', difficulty: 2, xp: 60,
      title: 'DNS apontando para lugar nenhum',
      brief: 'O host pinga IPs externos, mas não abre sites. A configuração de IP está correta; conserte a resolução de nomes.',
      fields: [
        { key: 'ip', label: 'Endereço IP', value: '172.16.5.30', answer: '172.16.5.30', hint: 'OK.' },
        { key: 'mask', label: 'Máscara de Sub-rede', value: '255.255.0.0', answer: '255.255.0.0', hint: '/16 para 172.16.x.x — OK.' },
        { key: 'gateway', label: 'Gateway Padrão', value: '172.16.0.1', answer: '172.16.0.1', hint: 'OK.' },
        { key: 'dns', label: 'Servidor DNS', value: '172.16.0.99', answer: '8.8.8.8', hint: 'Esse DNS não responde. Use um servidor DNS válido (ex.: 8.8.8.8).' }
      ],
      explanation: 'IP, máscara e gateway estavam corretos — o ping por IP funciona. O DNS 172.16.0.99 não existe/não responde, então nomes não resolvem. Apontando para um DNS válido (interno funcional ou 8.8.8.8) a navegação por nome volta. Sempre confirme o DNS com nslookup.',
      tags: ['dns', 'resolução', 'ipv4']
    },
    {
      id: 'NET-04', difficulty: 3, xp: 80,
      title: 'IP de rede e endereço de broadcast',
      brief: 'Alguém configurou o host com o endereço de rede. Em uma /24 (255.255.255.0), o primeiro endereço é a rede e o último é o broadcast — nenhum dos dois pode ser de host. Corrija o IP.',
      fields: [
        { key: 'ip', label: 'Endereço IP', value: '192.168.50.0', answer: '192.168.50.10', hint: 'Em 192.168.50.0/24, .0 é o endereço de REDE. Use um IP de host válido (.1 a .254).' },
        { key: 'mask', label: 'Máscara de Sub-rede', value: '255.255.255.0', answer: '255.255.255.0', hint: 'OK.' },
        { key: 'gateway', label: 'Gateway Padrão', value: '192.168.50.1', answer: '192.168.50.1', hint: 'OK.' },
        { key: 'dns', label: 'Servidor DNS', value: '1.1.1.1', answer: '1.1.1.1', hint: 'DNS Cloudflare, válido.' }
      ],
      explanation: 'Em uma rede /24, o primeiro endereço (.0) identifica a própria rede e o último (.255) é o broadcast — nenhum pode ser atribuído a um host. Por isso 192.168.50.0 é inválido como IP de máquina. Qualquer valor de .1 a .254 (exceto o já usado pelo gateway) serve; aqui usamos .10.',
      tags: ['endereço de rede', 'broadcast', 'ipv4', 'sub-rede']
    }
  ];

  /* ---------------- Base de Conhecimento ---------------- */
  const kbCategories = ['Redes', 'Windows', 'Office', 'VPN', 'Segurança', 'Help Desk'];
  const knowledge = [
    {
      cat: 'Redes', title: 'Comandos essenciais de diagnóstico de rede',
      tags: ['ipconfig', 'ping', 'tracert', 'nslookup'],
      html: `
        <p>Estes comandos resolvem a maioria dos chamados de rede no N1/N2:</p>
        <ul>
          <li><code>ipconfig /all</code> — mostra IP, máscara, gateway, DNS e MAC de cada interface.</li>
          <li><code>ping &lt;destino&gt;</code> — testa conectividade. Pingue primeiro o <strong>gateway</strong>, depois um IP externo (<code>8.8.8.8</code>), depois um nome (<code>google.com</code>).</li>
          <li><code>tracert &lt;destino&gt;</code> — mostra o caminho/saltos e onde a latência aumenta.</li>
          <li><code>nslookup &lt;nome&gt;</code> — testa a resolução DNS isoladamente.</li>
          <li><code>ipconfig /flushdns</code> — limpa o cache de DNS local.</li>
        </ul>
        <p><strong>Regra de ouro:</strong> se o ping por IP funciona mas por nome não, o problema é <strong>DNS</strong>.</p>`
    },
    {
      cat: 'Redes', title: 'Entendendo IP, máscara, gateway e DNS',
      tags: ['ipv4', 'gateway', 'máscara', 'dns'],
      html: `
        <p>Quatro parâmetros definem a rede de um host:</p>
        <ul>
          <li><strong>Endereço IP</strong> — identidade do host na rede (ex.: <code>192.168.1.50</code>).</li>
          <li><strong>Máscara de sub-rede</strong> — define qual parte é rede e qual é host (<code>255.255.255.0</code> = /24).</li>
          <li><strong>Gateway padrão</strong> — porta de saída para outras redes; deve estar na <strong>mesma sub-rede</strong> do host.</li>
          <li><strong>DNS</strong> — traduz nomes (google.com) em IPs.</li>
        </ul>
        <p>Em uma rede /24, o endereço terminado em <code>.0</code> é a <strong>rede</strong> e o <code>.255</code> é o <strong>broadcast</strong> — nenhum dos dois pode ser usado por um host.</p>`
    },
    {
      cat: 'Redes', title: 'O que é APIPA (169.254.x.x)?',
      tags: ['apipa', 'dhcp', '169.254'],
      html: `
        <p>Quando um cliente configurado para DHCP <strong>não recebe resposta</strong> do servidor, o Windows atribui automaticamente um endereço da faixa <code>169.254.0.0/16</code> (APIPA).</p>
        <p>Ver um IP <code>169.254.x.x</code> significa quase sempre: <strong>o DHCP não está respondendo</strong> — serviço parado, escopo esgotado, cabo/porta sem link ou falha no relay (ip helper).</p>
        <p>Diagnóstico rápido: <code>ipconfig /all</code> → se vir 169.254, rode <code>ipconfig /release</code> e <code>ipconfig /renew</code> e investigue o servidor DHCP.</p>`
    },
    {
      cat: 'Windows', title: 'Resolver fila de impressão travada',
      tags: ['impressora', 'spooler'],
      html: `
        <p>Quando documentos somem da fila ou ficam presos:</p>
        <ol>
          <li>Abra <code>services.msc</code> e localize <strong>Spooler de Impressão</strong>.</li>
          <li>Pare o serviço.</li>
          <li>Apague os arquivos em <code>C:\\Windows\\System32\\spool\\PRINTERS</code>.</li>
          <li>Inicie o serviço novamente.</li>
          <li>Confirme se a <strong>impressora padrão</strong> não virou uma virtual (PDF/OneNote).</li>
        </ol>`
    },
    {
      cat: 'Windows', title: 'Computador lento: por onde começar',
      tags: ['desempenho', 'inicialização', 'disco'],
      html: `
        <p>Roteiro objetivo:</p>
        <ul>
          <li><strong>Gerenciador de Tarefas → Inicializar</strong>: desative programas desnecessários que sobem com o Windows.</li>
          <li>Verifique <strong>uso de disco</strong>. 100% constante em HDD mecânico é gargalo clássico — migrar para SSD resolve.</li>
          <li>Cheque <strong>malware</strong> e processos suspeitos consumindo CPU.</li>
          <li>Confirme <strong>RAM</strong> suficiente para a carga de trabalho.</li>
          <li>Limpe arquivos temporários e atualize o sistema.</li>
        </ul>`
    },
    {
      cat: 'Office', title: 'Outlook travando: diagnóstico de suplementos',
      tags: ['outlook', 'suplementos', 'ost'],
      html: `
        <p>Travamentos e o prompt de "Modo de Segurança" geralmente vêm de <strong>add-ins</strong> ou do arquivo de dados:</p>
        <ol>
          <li>Feche o Outlook e abra com <code>outlook /safe</code> (sem suplementos).</li>
          <li>Se normalizar: <strong>Arquivo → Opções → Suplementos</strong> e desative-os, reativando um a um.</li>
          <li>Verifique o tamanho/saúde do <strong>OST/PST</strong>; um OST corrompido pode ser recriado (o cache é baixado de novo do servidor).</li>
          <li>Em último caso, recrie o <strong>perfil do Outlook</strong>.</li>
        </ol>`
    },
    {
      cat: 'VPN', title: 'VPN conecta mas não acessa nada interno',
      tags: ['vpn', 'rotas', 'sub-rede', 'dns'],
      html: `
        <p>Túnel "conectado" sem acesso a recursos quase sempre é um destes três:</p>
        <ul>
          <li><strong>DNS interno</strong> não aplicado pelo túnel → nomes internos não resolvem.</li>
          <li><strong>Rotas</strong> das sub-redes internas não empurradas para o cliente (veja <code>route print</code>).</li>
          <li><strong>Conflito de faixa</strong>: a rede doméstica do usuário usa a mesma sub-rede da empresa (ex.: <code>192.168.0.0/24</code>), então o tráfego nunca entra no túnel.</li>
        </ul>
        <p>Verifique o DNS atribuído, as rotas e a sobreposição de sub-redes.</p>`
    },
    {
      cat: 'Segurança', title: 'Princípio do menor privilégio e grupos',
      tags: ['permissões', 'menor privilégio', 'grupos', 'ntfs'],
      html: `
        <p>Conceda acesso pelo <strong>menor privilégio necessário</strong> e sempre via <strong>grupos de segurança</strong>, nunca usuário a usuário:</p>
        <ul>
          <li>Crie grupos por função/departamento e atribua permissões ao grupo.</li>
          <li>Para dar acesso a alguém, adicione a conta ao grupo correto.</li>
          <li>Evite conceder <strong>Admin de Domínio</strong> ou compartilhar para <strong>"Todos"</strong> — falhas graves de segurança.</li>
          <li>Lembre-se: o acesso efetivo é a interseção das permissões de <strong>compartilhamento</strong> e <strong>NTFS</strong> (a mais restritiva vence).</li>
        </ul>`
    },
    {
      cat: 'Segurança', title: 'Como reconhecer um e-mail de phishing',
      tags: ['phishing', 'segurança', 'e-mail'],
      html: `
        <p>Oriente os usuários a desconfiar de:</p>
        <ul>
          <li>Senso de <strong>urgência</strong> e ameaça ("sua conta será bloqueada em 24h").</li>
          <li>Remetente com <strong>domínio estranho</strong> ou levemente trocado.</li>
          <li>Links cujo destino real (ao passar o mouse) difere do texto.</li>
          <li>Pedidos de <strong>senha</strong>, dados bancários ou pagamento fora do processo.</li>
          <li>Anexos inesperados.</li>
        </ul>
        <p>Na dúvida, <strong>não clique</strong> — reporte ao TI/segurança.</p>`
    },
    {
      cat: 'Help Desk', title: 'Boas práticas de atendimento e SLA',
      tags: ['sla', 'atendimento', 'incidente', 'priorização'],
      html: `
        <p>Um bom atendimento de Help Desk segue um fluxo previsível:</p>
        <ol>
          <li><strong>Registre</strong> o chamado (quem, o quê, quando, impacto).</li>
          <li><strong>Classifique</strong> prioridade pelo impacto × urgência (1 usuário vs. setor inteiro).</li>
          <li><strong>Diagnostique</strong> do simples ao complexo, isolando variáveis.</li>
          <li><strong>Resolva ou escale</strong> dentro do <strong>SLA</strong>, comunicando o usuário.</li>
          <li><strong>Documente</strong> a solução para alimentar a base de conhecimento.</li>
        </ol>
        <p>Falha que afeta muitos = incidente de alto impacto → escale rápido. Nunca trate problema central reinstalando máquina por máquina.</p>`
    },
    {
      cat: 'Help Desk', title: 'Escada de troubleshooting: do simples ao complexo',
      tags: ['troubleshooting', 'método', 'diagnóstico'],
      html: `
        <p>Resolva sempre na ordem de menor custo/risco:</p>
        <ol>
          <li><strong>Está ligado/conectado?</strong> Cabos, energia, link.</li>
          <li><strong>É só com este usuário/máquina</strong> ou com todos? Isolar o escopo direciona tudo.</li>
          <li><strong>Mudou algo recentemente?</strong> Atualização, nova senha, troca de local.</li>
          <li><strong>Camada de rede</strong>: ping gateway → IP externo → nome (DNS).</li>
          <li><strong>Reproduza</strong> e teste uma hipótese por vez.</li>
        </ol>
        <p>Comparar com um caso que <strong>funciona</strong> (outro PC, outro usuário) é a técnica mais poderosa de isolamento.</p>`
    }
  ];

  /* ---------------- Conquistas (badges) ----------------
     cond(state, stats) → boolean
  ------------------------------------------------------*/
  const achievements = [
    { id: 'first-blood', ico: '🎯', name: 'Primeiro Atendimento', desc: 'Resolva seu primeiro chamado.',
      cond: s => (s.solvedTickets || []).length >= 1 },
    { id: 'ticket-5', ico: '🦸', name: 'Herói do Help Desk', desc: 'Resolva 5 chamados.',
      cond: s => (s.solvedTickets || []).length >= 5 },
    { id: 'ticket-all', ico: '👑', name: 'Central Zerada', desc: 'Resolva todos os chamados disponíveis.',
      cond: s => (s.solvedTickets || []).length >= tickets.length },
    { id: 'dns-master', ico: '🧭', name: 'Mestre do DNS', desc: 'Acerte um chamado/diagnóstico de DNS.',
      cond: s => hasTag(s, ['dns']) },
    { id: 'net-expert', ico: '🌐', name: 'Especialista em Redes', desc: 'Conclua 3 laboratórios de rede.',
      cond: s => (s.solvedLabs || []).length >= 3 },
    { id: 'bug-hunter', ico: '🐞', name: 'Caçador de Bugs', desc: 'Conclua 3 diagnósticos.',
      cond: s => (s.solvedDiagnostics || []).length >= 3 },
    { id: 'infra', ico: '🏗️', name: 'Analista de Infraestrutura', desc: 'Acerte um chamado de nível Especialista (4).',
      cond: s => (s.solvedTickets || []).some(id => { const t = tickets.find(x => x.id === id); return t && t.difficulty === 4; }) },
    { id: 'terminal', ico: '⌨️', name: 'Linha de Comando', desc: 'Use o Terminal Interativo e resolva um cenário.',
      cond: s => (s.terminalSolved || []).length >= 1 },
    { id: 'daily', ico: '🔥', name: 'Constância', desc: 'Complete um Desafio Diário.',
      cond: s => (s.dailyDone || []).length >= 1 },
    { id: 'scholar', ico: '📖', name: 'Estudioso', desc: 'Leia 5 artigos da Base de Conhecimento.',
      cond: s => (s.kbRead || []).length >= 5 },
    { id: 'level-5', ico: '⭐', name: 'Veterano', desc: 'Alcance o nível 5.',
      cond: (s, st) => (st ? st.level : 1) >= 5 },
    { id: 'troubleshoot-master', ico: '🏆', name: 'Mestre do Troubleshooting', desc: 'Alcance o nível máximo (8).',
      cond: (s, st) => (st ? st.level : 1) >= 8 },
    // ---- badges raros (recursos avançados) ----
    { id: 'dns-hunter', ico: '🩸', name: 'Caçador de DNS', desc: 'Acerte 3 desafios envolvendo DNS.',
      cond: s => countTag(s, ['dns']) >= 3 },
    { id: 'cmd-master', ico: '🖥️', name: 'Mestre do CMD', desc: 'Resolva todos os cenários do Terminal.',
      cond: s => (s.terminalSolved || []).length >= 3 },
    { id: 'vpn-hero', ico: '🛡️', name: 'Herói da VPN', desc: 'Acerte um desafio de VPN.',
      cond: s => hasTag(s, ['vpn']) },
    { id: 'printer-expert', ico: '🖨️', name: 'Especialista em Impressoras', desc: 'Resolva um chamado de impressão.',
      cond: s => hasTag(s, ['impressora', 'spooler']) },
    { id: 'sla-pro', ico: '⏱️', name: 'Mestre do SLA', desc: 'Acerte 3 cenários do Simulador de SLA.',
      cond: s => (s.solvedSla || []).length >= 3 },
    { id: 'interviewee', ico: '🎙️', name: 'Pronto p/ Entrevista', desc: 'Conclua 5 perguntas do Modo Entrevista.',
      cond: s => (s.solvedInterview || []).length >= 5 },
    { id: 'noc-watch', ico: '📡', name: 'Olho do NOC', desc: 'Resolva 3 alertas na Central de Monitoramento.',
      cond: s => (s.solvedMonitoring || []).length >= 3 },
    { id: 'windows-navigator', ico: '🪟', name: 'Navegador do Windows', desc: 'Resolva um desafio na Máquina Windows.',
      cond: s => (s.solvedWindows || []).length >= 1 },
    { id: 'multi-cause', ico: '🧩', name: 'Detetive de TI', desc: 'Resolva um Desafio Surpresa multi-causa.',
      cond: s => (s.solvedSurprise || []).length >= 1 },
    { id: 'documenter', ico: '📝', name: 'Documentador', desc: 'Documente um chamado com nota ≥ 80%.',
      cond: s => (s.docScores || []).some(d => d.score >= 80) },
    { id: 'pressure-survivor', ico: '🔥', name: 'Sangue-frio', desc: 'Conclua o Modo Pressão.',
      cond: s => (s.pressureRuns || []).length >= 1 },
    { id: 'senior-analyst', ico: '🎖️', name: 'Analista Sênior', desc: 'Acumule 1500 pontos.',
      cond: s => (s.points || 0) >= 1500 }
  ];
  function countTag(s, wanted) {
    const solved = [
      ...(s.solvedTickets || []).map(id => tickets.find(t => t.id === id)),
      ...(s.solvedDiagnostics || []).map(id => diagnostics.find(t => t.id === id)),
      ...(s.solvedSurprise || []).map(id => (surpriseScenarios.find(t => t.id === id)))
    ].filter(Boolean);
    let n = 0;
    solved.forEach(item => { if ((item.tags || []).some(tg => wanted.includes(tg))) n++; });
    return n;
  }
  function hasTag(s, wanted) {
    const solved = [
      ...(s.solvedTickets || []).map(id => tickets.find(t => t.id === id)),
      ...(s.solvedDiagnostics || []).map(id => diagnostics.find(t => t.id === id))
    ].filter(Boolean);
    return solved.some(item => (item.tags || []).some(tg => wanted.includes(tg)));
  }

  /* ---------------- Ranking simulado ---------------- */
  const rankingSeed = [
    { name: 'Lucas A.', role: 'Analista N2', points: 1480 },
    { name: 'Bianca M.', role: 'Especialista de Redes', points: 1320 },
    { name: 'Rodrigo P.', role: 'Engenheiro de Suporte', points: 1180 },
    { name: 'Camila R.', role: 'Analista de Suporte', points: 920 },
    { name: 'Thiago N.', role: 'Atendente N1', points: 640 },
    { name: 'Aline S.', role: 'Analista de Suporte', points: 510 },
    { name: 'Marcos V.', role: 'Atendente N1', points: 360 },
    { name: 'Paula F.', role: 'Aprendiz de Suporte', points: 180 }
  ];

  /* ---------------- Empresa fictícia (Modo Empresa Real) ---------------- */
  const company = {
    name: 'TechCorp Solutions',
    tagline: 'Tecnologia & Serviços Corporativos',
    departments: [
      { id: 'fin', name: 'Financeiro', ico: '💰', users: 28 },
      { id: 'rh', name: 'RH', ico: '👥', users: 12 },
      { id: 'com', name: 'Comercial', ico: '📈', users: 35 },
      { id: 'mkt', name: 'Marketing', ico: '🎨', users: 18 },
      { id: 'ti', name: 'TI', ico: '🖧', users: 9 },
      { id: 'dir', name: 'Diretoria', ico: '🏛️', users: 6 },
      { id: 'log', name: 'Logística', ico: '🚚', users: 22 }
    ]
  };

  /* ---------------- Central de Monitoramento (NOC) ----------------
     Cada serviço tem um estado; alertas com problema viram desafios.
  -------------------------------------------------------------------*/
  const monitoringServices = [
    { id: 'srv-arq', name: 'Servidor de Arquivos', ico: 'server', kind: 'Servidor' },
    { id: 'srv-erp', name: 'ERP Corporativo', ico: 'building', kind: 'Aplicação' },
    { id: 'srv-mail', name: 'Servidor de E-mail', ico: 'mail', kind: 'Aplicação' },
    { id: 'net-wan', name: 'Link de Internet (WAN)', ico: 'globe', kind: 'Rede' },
    { id: 'net-vpn', name: 'Concentrador VPN', ico: 'shield', kind: 'Rede' },
    { id: 'net-dns', name: 'Servidor DNS', ico: 'compass', kind: 'Rede' },
    { id: 'net-dhcp', name: 'Servidor DHCP', ico: 'activity', kind: 'Rede' },
    { id: 'prn-fin', name: 'Impressora — Financeiro', ico: 'printer', kind: 'Impressora' },
    { id: 'ad-dc', name: 'Controlador de Domínio (AD)', ico: 'key', kind: 'Servidor' }
  ];
  // alertas (cenários) — o aluno identifica a causa
  const monitoringAlerts = [
    {
      id: 'NOC-01', service: 'srv-arq', severity: 'critical', xp: 55,
      title: 'Servidor de Arquivos OFFLINE',
      metric: 'Ping: 100% perda · Compartilhamentos inacessíveis',
      detail: 'O monitor perdeu contato com o FILE-SRV01. Vários usuários relatam unidade de rede indisponível ao mesmo tempo.',
      causes: [
        { text: 'O servidor/serviço de arquivos está indisponível (host caído ou serviço Server parado). Validar o servidor e escalar conforme SLA — é um incidente de alto impacto.', correct: true },
        { text: 'Cada usuário precisa reinstalar o Windows.' },
        { text: 'Trocar o cabo de rede de cada estação.' },
        { text: 'O problema é o navegador dos usuários.' }
      ],
      explanation: 'Perda total de ping ao servidor + múltiplos usuários afetados simultaneamente = o próprio servidor/serviço caiu, não as estações. Conduta: confirmar abrangência, checar host e serviço (Server/LanmanServer), acionar a equipe e comunicar os afetados dentro do SLA.',
      tags: ['servidor', 'compartilhamento', 'incidente', 'sla']
    },
    {
      id: 'NOC-02', service: 'net-vpn', severity: 'high', xp: 55,
      title: 'VPN INSTÁVEL — quedas intermitentes',
      metric: 'Sessões caindo · Latência 380ms · Perda 12%',
      detail: 'Usuários em home office reclamam que a VPN cai a cada poucos minutos. O concentrador mostra renegociações constantes.',
      causes: [
        { text: 'Instabilidade/perda no link de internet ou saturação do concentrador causando renegociação do túnel — investigar qualidade do link e carga da VPN.', correct: true },
        { text: 'Os usuários digitaram a senha errada.' },
        { text: 'O DNS interno está desligado.' },
        { text: 'As impressoras estão consumindo a VPN.' }
      ],
      explanation: 'Latência alta + perda de pacotes + renegociações = problema de qualidade do link ou sobrecarga do concentrador VPN, não credenciais. Verifique a saúde do link de internet, a carga de sessões e logs do concentrador.',
      tags: ['vpn', 'rede', 'latência', 'link']
    },
    {
      id: 'NOC-03', service: 'net-dns', severity: 'critical', xp: 60,
      title: 'DNS INDISPONÍVEL',
      metric: 'Consultas DNS: timeout · Resolução de nomes falhando',
      detail: 'Em toda a empresa, sites e sistemas por nome pararam de abrir. Ping por IP funciona normalmente.',
      causes: [
        { text: 'O servidor DNS parou de responder — resolução de nomes falha enquanto a conectividade por IP segue OK. Reativar o serviço DNS e validar.', correct: true },
        { text: 'A internet caiu por completo.' },
        { text: 'Todos os cabos foram desconectados.' },
        { text: 'O antivírus bloqueou os navegadores.' }
      ],
      explanation: 'Sintoma clássico de DNS: IP responde, nomes não. Como afeta todos, o servidor DNS central caiu. Reinicie/valide o serviço DNS, confirme o escopo de encaminhadores e teste com nslookup.',
      tags: ['dns', 'resolução de nomes', 'incidente']
    },
    {
      id: 'NOC-04', service: 'srv-erp', severity: 'high', xp: 55,
      title: 'ERP — Uso de CPU acima de 90%',
      metric: 'CPU 94% · Fila de requisições crescendo · Tempo de resposta 8s',
      detail: 'O ERP está lentíssimo. O servidor de aplicação mostra CPU saturada de forma sustentada no horário de fechamento.',
      causes: [
        { text: 'Saturação de recursos do servidor de aplicação (processo/consulta pesada ou pico de carga) — identificar o processo, otimizar/escalar e priorizar o fechamento.', correct: true },
        { text: 'Os usuários estão com mouse com defeito.' },
        { text: 'É problema de DNS.' },
        { text: 'A impressora do financeiro travou o ERP.' }
      ],
      explanation: 'CPU sustentada em 94% + fila crescente = gargalo de recursos no servidor. Identifique o processo/consulta dominante (Gerenciador de Tarefas/monitor da aplicação), avalie query pesada ou job concorrente, e escale recursos ou janela de execução.',
      tags: ['desempenho', 'servidor', 'cpu', 'erp']
    },
    {
      id: 'NOC-05', service: 'net-dhcp', severity: 'critical', xp: 60,
      title: 'DHCP — estações recebendo APIPA',
      metric: 'Leases concedidos: 0 nas últimas 2h · Escopo 98% utilizado',
      detail: 'Máquinas ligadas hoje aparecem com IP 169.254.x.x. O escopo do DHCP está quase esgotado.',
      causes: [
        { text: 'Escopo DHCP esgotado/serviço sem conceder leases — clientes caem em APIPA. Ampliar/limpar o escopo e validar o serviço/relay DHCP.', correct: true },
        { text: 'Configurar IP fixo manualmente em todas as máquinas.' },
        { text: 'O DNS está fora do ar.' },
        { text: 'Trocar todas as placas de rede.' }
      ],
      explanation: 'APIPA (169.254) = cliente sem resposta do DHCP. Com o escopo a 98% e zero leases novos, ele esgotou ou o serviço parou. Amplie o escopo, libere leases antigos e confirme o relay (ip helper).',
      tags: ['dhcp', 'apipa', 'escopo', 'incidente']
    },
    {
      id: 'NOC-06', service: 'prn-fin', severity: 'medium', xp: 45,
      title: 'Impressora do Financeiro — fila travada',
      metric: 'Spooler: 14 trabalhos presos · Status: erro',
      detail: 'A fila de impressão do setor financeiro acumulou 14 trabalhos e nada imprime.',
      causes: [
        { text: 'Fila/Spooler travado — limpar a fila e reiniciar o serviço Spooler de Impressão no servidor de impressão.', correct: true },
        { text: 'Comprar uma nova impressora para o setor.' },
        { text: 'Reinstalar o Office de todos.' },
        { text: 'Desligar o servidor de arquivos.' }
      ],
      explanation: '14 trabalhos presos com status de erro indicam Spooler travado. Pare o serviço, limpe a pasta PRINTERS e reinicie. Verifique conectividade e driver da impressora.',
      tags: ['impressora', 'spooler', 'fila']
    }
  ];

  /* ---------------- Modo Entrevista (perguntas de recrutador) ---------------- */
  const interviewQuestions = [
    {
      id: 'INT-01', q: 'Como você resolveria uma impressora que aparece como "offline"?',
      ideal: ['verificar conexão/cabo/rede', 'reiniciar spooler', 'limpar fila', 'checar impressora padrão', 'driver'],
      model: 'Confirmo se a impressora está ligada e conectada (USB/rede), testo o ping se for de rede, verifico se não está em "Usar impressora offline", limpo a fila e reinicio o serviço Spooler de Impressão. Checo a impressora padrão e o driver. Escalo se for hardware.',
      tags: ['impressora', 'spooler', 'atendimento']
    },
    {
      id: 'INT-02', q: 'Qual a diferença entre IP público e IP privado?',
      ideal: ['privado é interno/rfc1918', 'público é roteável na internet', 'nat', '192.168/10/172.16'],
      model: 'IP privado é usado dentro da rede local (faixas RFC1918: 10.x, 172.16–31.x, 192.168.x) e não é roteável na internet. IP público é único e roteável na internet. O NAT traduz os endereços privados para um público na saída.',
      tags: ['ipv4', 'nat', 'redes']
    },
    {
      id: 'INT-03', q: 'O que é DNS e por que ele é importante?',
      ideal: ['traduz nome em ip', 'resolução de nomes', 'sem dns sites por nome não abrem'],
      model: 'DNS (Domain Name System) traduz nomes (ex.: google.com) em endereços IP. Sem ele, só conseguiríamos acessar serviços pelo IP. Quando o ping por IP funciona mas por nome não, o problema costuma ser DNS.',
      tags: ['dns', 'resolução de nomes']
    },
    {
      id: 'INT-04', q: 'Como você atenderia um usuário irritado e sem paciência?',
      ideal: ['escuta ativa', 'empatia', 'calma', 'não levar para o pessoal', 'comunicar prazo'],
      model: 'Mantenho a calma e pratico escuta ativa, demonstro empatia ("entendo o impacto disso no seu trabalho"), não levo para o lado pessoal, confirmo o que entendi, dou um prazo realista e mantenho o usuário informado até a resolução.',
      tags: ['atendimento', 'soft skills', 'comunicação']
    },
    {
      id: 'INT-05', q: 'Um usuário diz que "a internet não funciona". Quais seus primeiros passos?',
      ideal: ['isolar escopo (só ele?)', 'verificar cabo/wifi', 'ipconfig', 'ping gateway', 'ping ip externo', 'ping nome/dns'],
      model: 'Primeiro isolo o escopo: é só com ele ou com mais gente? Verifico conexão física/Wi-Fi, rodo ipconfig, e faço a escada: ping no gateway, depois em um IP externo (8.8.8.8) e depois em um nome. Assim descubro se é rede local, saída para internet ou DNS.',
      tags: ['troubleshooting', 'redes', 'dns', 'método']
    },
    {
      id: 'INT-06', q: 'O que você faz quando não sabe resolver um chamado?',
      ideal: ['pesquisar/base de conhecimento', 'reproduzir', 'escalar com contexto', 'documentar', 'não chutar em produção'],
      model: 'Pesquiso na base de conhecimento e tento reproduzir o problema em ambiente seguro. Se não resolver dentro do meu nível/SLA, escalo para o N2/N3 com um resumo claro (sintomas, o que já testei, logs). Documento tudo e evito mexer às cegas em produção.',
      tags: ['atendimento', 'sla', 'documentação', 'escalonamento']
    },
    {
      id: 'INT-07', q: 'Explique o que é um endereço APIPA (169.254.x.x).',
      ideal: ['autoconfiguração', 'sem dhcp', 'cliente não recebeu ip'],
      model: 'É o endereço que o Windows atribui automaticamente (169.254.x.x) quando o cliente está configurado para DHCP mas não recebe resposta do servidor. Ver isso indica falha no DHCP: serviço parado, escopo esgotado ou sem comunicação até o servidor.',
      tags: ['apipa', 'dhcp', 'redes']
    },
    {
      id: 'INT-08', q: 'Qual a diferença entre um incidente e uma requisição de serviço?',
      ideal: ['incidente = algo quebrou/interrupção', 'requisição = pedido/solicitação padrão', 'itil'],
      model: 'Um incidente é uma interrupção não planejada ou queda de qualidade de um serviço (algo parou de funcionar). Uma requisição de serviço é um pedido padrão do usuário (ex.: novo acesso, instalação de software). São tratados por fluxos e prioridades diferentes (conceito de ITIL).',
      tags: ['itil', 'sla', 'atendimento']
    }
  ];

  /* ---------------- Simulador de SLA (priorização) ---------------- */
  const slaScenarios = [
    {
      id: 'SLA-01', xp: 35,
      title: 'Diretor não consegue acessar e-mail antes de uma reunião com clientes em 30 min',
      answer: 'high',
      explanation: 'Impacto individual, mas alta urgência e usuário VIP com prazo crítico imediato. Prioridade ALTA. (Crítica seria parada de serviço afetando muitos.)'
    },
    {
      id: 'SLA-02', xp: 40,
      title: 'Sistema de expedição fora do ar — toda a logística parada, caminhões esperando',
      answer: 'critical',
      explanation: 'Serviço crítico de negócio parado afetando um setor inteiro com perda operacional/financeira contínua. Prioridade CRÍTICA — máximo impacto + máxima urgência.'
    },
    {
      id: 'SLA-03', xp: 30,
      title: 'Um usuário quer trocar o papel de parede da área de trabalho',
      answer: 'low',
      explanation: 'Sem impacto na operação e sem urgência. Prioridade BAIXA — pode ser atendido após demandas de maior impacto.'
    },
    {
      id: 'SLA-04', xp: 35,
      title: 'Impressora compartilhada do RH parou; 12 pessoas dependem dela para hoje',
      answer: 'medium',
      explanation: 'Afeta um grupo, mas há alternativas (outras impressoras) e o impacto não para o negócio. Prioridade MÉDIA — impacto moderado, urgência moderada.'
    },
    {
      id: 'SLA-05', xp: 40,
      title: 'E-commerce da empresa fora do ar — clientes não conseguem comprar',
      answer: 'critical',
      explanation: 'Serviço que gera receita, indisponível para clientes externos. Prioridade CRÍTICA — perda direta de faturamento e imagem.'
    },
    {
      id: 'SLA-06', xp: 35,
      title: 'Novo funcionário começa amanhã e ainda não tem usuário criado no AD',
      answer: 'medium',
      explanation: 'Importante e com prazo (amanhã), mas planejável e sem afetar a operação atual. Prioridade MÉDIA — resolver ainda hoje, sem ser emergência imediata.'
    }
  ];

  /* ---------------- Desafios Surpresa (múltiplas causas) ---------------- */
  const surpriseScenarios = [
    {
      id: 'SUR-01', xp: 130, difficulty: 4,
      title: 'O usuário "sem internet" que esconde dois problemas',
      intro: 'Diego, do comercial externo, abriu um chamado: "Estou sem internet em home office e não consigo trabalhar". Investigue por etapas — pode haver mais de uma causa.',
      tags: ['dns', 'vpn', 'troubleshooting', 'multi-causa'],
      stages: [
        {
          prompt: 'Etapa 1 — Você pede para ele rodar testes. Resultado: ping em 8.8.8.8 responde, mas nenhum site abre pelo nome. nslookup dá timeout. Qual a primeira causa?',
          options: [
            { text: 'Problema de DNS — IP responde, nomes não resolvem. Corrigir o servidor DNS e limpar o cache.', correct: true },
            { text: 'A placa de rede está queimada.' },
            { text: 'A internet da casa dele caiu totalmente.' }
          ],
          explanation: 'IP responde mas nomes não → DNS. Após apontar um DNS válido e rodar flushdns, a navegação web volta.'
        },
        {
          prompt: 'Etapa 2 — DNS corrigido, a navegação web voltou. Mas ele ainda não acessa o ERP interno. A VPN diz "conectado", porém não pinga os servidores internos. Qual a segunda causa?',
          options: [
            { text: 'A VPN está conectada mas sem rota/DNS interno (ou conflito de sub-rede) — o tráfego interno não entra no túnel.', correct: true },
            { text: 'O ERP foi desinstalado do servidor.' },
            { text: 'O problema continua sendo o DNS público.' }
          ],
          explanation: 'Mesmo com internet OK, recursos internos exigem o túnel funcional. VPN "up" sem acesso interno = rotas não empurradas, DNS interno ausente ou conflito de faixa (rede doméstica igual à da empresa). Resolvendo isso, o ERP volta.'
        }
      ],
      finalExplanation: 'Cenário real de múltiplas causas: o sintoma único ("sem internet") escondia DOIS problemas independentes — DNS na navegação e VPN no acesso interno. Resolver um não resolve o outro; o bom analista não para na primeira causa.'
    },
    {
      id: 'SUR-02', xp: 140, difficulty: 4,
      title: 'Setor inteiro lento: a cascata',
      intro: 'O Financeiro relata "tudo lento". Vários sintomas se acumulam. Resolva camada por camada.',
      tags: ['dhcp', 'dns', 'desempenho', 'multi-causa', 'rede'],
      stages: [
        {
          prompt: 'Etapa 1 — Metade das máquinas do setor está com IP 169.254.x.x e sem rede alguma. As demais funcionam. Qual a causa dessa parte?',
          options: [
            { text: 'Escopo/serviço DHCP sem conceder leases → APIPA nas máquinas que ligaram depois. Corrigir o DHCP.', correct: true },
            { text: 'Cada máquina pegou vírus simultaneamente.' },
            { text: 'O monitor está sem sinal.' }
          ],
          explanation: 'APIPA em parte das máquinas = DHCP esgotado/parado. As que já tinham lease seguem funcionando. Corrige-se ampliando/validando o escopo.'
        },
        {
          prompt: 'Etapa 2 — DHCP normalizado, todas pegaram IP. Agora todas navegam, mas o sistema web interno continua lento só à tarde. tracert mostra latência alta apenas no link de saída, no horário de treinamentos em vídeo. Causa?',
          options: [
            { text: 'Saturação de banda no pico (streaming) — aplicar QoS/limitar o tráfego não crítico.', correct: true },
            { text: 'O servidor web desliga no almoço.' },
            { text: 'É novamente o DHCP.' }
          ],
          explanation: 'Padrão por horário + latência só no link de saída + coincidência com streaming = congestionamento de banda. Solução de rede (QoS/limitação), não de estação.'
        }
      ],
      finalExplanation: 'Dois problemas distintos no mesmo chamado: infraestrutura (DHCP) e capacidade de rede (banda). Resolver em camadas, validando cada etapa, é o que diferencia o suporte avançado.'
    }
  ];

  /* ---------------- Certificações ---------------- */
  const certifications = [
    {
      id: 'cert-atendimento', ico: '🎧', name: 'Especialista em Atendimento',
      desc: 'Conclua 5 perguntas do Modo Entrevista e 3 cenários de SLA.',
      cond: s => (s.solvedInterview || []).length >= 5 && (s.solvedSla || []).length >= 3
    },
    {
      id: 'cert-redes', ico: '🌐', name: 'Especialista em Redes',
      desc: 'Conclua todos os laboratórios de rede e acerte 3 desafios de DNS/DHCP.',
      cond: (s) => (s.solvedLabs || []).length >= networkLabs.length && countTag(s, ['dns', 'dhcp']) >= 3
    },
    {
      id: 'cert-suporte', ico: '🛠️', name: 'Analista de Suporte',
      desc: 'Resolva 8 chamados e leia 5 artigos da base de conhecimento.',
      cond: s => (s.solvedTickets || []).length >= 8 && (s.kbRead || []).length >= 5
    },
    {
      id: 'cert-troubleshooting', ico: '🏆', name: 'Mestre do Troubleshooting',
      desc: 'Resolva todos os diagnósticos, todos os cenários de terminal e um Desafio Surpresa.',
      cond: s => (s.solvedDiagnostics || []).length >= diagnostics.length && (s.terminalSolved || []).length >= 3 && (s.solvedSurprise || []).length >= 1
    }
  ];

  return {
    LEVELS, tickets, diagnostics, networkLabs, knowledge, kbCategories, achievements, rankingSeed,
    company, monitoringServices, monitoringAlerts, interviewQuestions, slaScenarios,
    surpriseScenarios, certifications
  };
})();
