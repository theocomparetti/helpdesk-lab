# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] — 2026-06-09

Primeira versão pública e estável. Plataforma completa com 28 módulos.

### Adicionado
- **Núcleo:** Central de Chamados, Simulador de Diagnóstico, Terminal CMD interativo,
  Laboratório de Redes, Base de Conhecimento, Conquistas e sistema de XP/níveis (8 cargos).
- **Operação:** Central de Monitoramento (NOC), Central de E-mails, Incidente Crítico,
  Modo Pressão.
- **Prática técnica:** Máquina Windows simulada, Acesso Remoto, Análise de Logs,
  Desafios Surpresa (multi-causa).
- **Carreira & gestão:** Trilhas de Carreira, Simulador de Entrevistas, Simulador de SLA,
  Reunião com Gestores, Painel Executivo, Análise de Desempenho, Certificações.
- **Aprendizado:** IA Analista (assistente), Histórico de casos, Treino Relâmpago, Desafio Diário, Missões.
- **Modo "Dia na Vida de um Analista":** expediente completo (08:00 → 18:00) com relógio
  corporativo, fila dinâmica de chamados, SLA, consequências e relatório final.
- **Gamificação avançada:** streak diário, meta diária, Missão do Dia, badges ocultos.
- **Home como hub guiado** com onboarding, recomendações e catálogo por categorias.

### Experiência & UX
- **Sistema de ícones SVG** monocromático substituindo emojis em toda a interface.
- **Mobile premium:** barra de navegação inferior estilo app, feedback de toque, mobile-first.
- **Sistema de usuários** (perfil/nome persistente) usado no ranking.
- **Consentimento de privacidade (LGPD)** com política dedicada — dados 100% locais.

### Técnico
- Persistência via `localStorage`; arquitetura modular em namespace global, **sem dependências**.
- Re-render coalescido por `requestAnimationFrame` para fluidez.
- Compatível com hospedagem estática e **GitHub Pages** (caminhos relativos + roteamento por hash).
