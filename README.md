<div align="center">

<img src="assets/banner.png" alt="Help Desk Lab" width="100%" />

# Help Desk Lab

### Treine Suporte Técnico resolvendo problemas reais.

Uma plataforma de **simulação e treinamento prático** para profissionais e estudantes de
Help Desk, Suporte Técnico, Infraestrutura e Troubleshooting.

[![Licença](https://img.shields.io/badge/licença-MIT-38bdf8?style=flat-square)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-sem_dependências-0ea5e9?style=flat-square)](#-tecnologias-utilizadas)
[![Responsivo](https://img.shields.io/badge/responsivo-mobile_first-34d399?style=flat-square)](#-responsividade)
[![Build](https://img.shields.io/badge/build-não_necessário-a78bfa?style=flat-square)](#-como-executar-localmente)
[![Status](https://img.shields.io/badge/status-completo-34d399?style=flat-square)](#)

</div>

---

## 📋 Sobre o projeto

**Help Desk Lab** é uma plataforma web que coloca o usuário dentro de uma central de suporte de TI simulada. Em vez de textos teóricos e quizzes de múltipla escolha, a pessoa **investiga problemas reais**: lê chamados de usuários, usa um terminal de comandos funcional, acompanha um painel de monitoramento (NOC), corrige configurações de rede e gerencia incidentes críticos — ganhando experiência, níveis e conquistas no processo.

Tudo roda **100% no navegador**, sem backend, sem build e **sem nenhuma dependência externa**. O progresso é salvo localmente e a interface foi pensada para parecer um produto SaaS moderno, tanto no desktop quanto no celular.

> Projeto desenvolvido como estudo aprofundado de **UX/UI, arquitetura front-end e design de produto**.

---

## 🎯 Problema que resolve

Aprender Suporte Técnico é difícil porque a teoria não prepara para a prática — e ninguém quer **aprender errando no ambiente real de uma empresa**.

O Help Desk Lab cria um **ambiente seguro e realista** para treinar exatamente as competências do dia a dia:

- Interpretar o que o usuário realmente precisa (muitas vezes mal descrito);
- Investigar a causa raiz com ferramentas reais (CMD, logs, configurações);
- Priorizar por impacto × urgência (SLA);
- Documentar a solução de forma profissional;
- Tomar decisões sob pressão em incidentes críticos.

---

## ✨ Funcionalidades

| Área | Recursos |
|------|----------|
| **Operação** | Central de Chamados, Central de E-mails, Central de Monitoramento (NOC), Modo Pressão, Incidente Crítico |
| **Prática técnica** | Terminal CMD interativo, Máquina Windows simulada, Laboratório de Redes, Acesso Remoto, Análise de Logs, Simulador de Diagnóstico |
| **Carreira & gestão** | Trilhas de Carreira, Simulador de Entrevistas, Simulador de SLA, Reunião com Gestores, Painel Executivo, Análise de Desempenho |
| **Aprendizado** | Base de Conhecimento pesquisável, IA Analista (assistente), Histórico de casos, Treino Relâmpago, Desafio Diário |
| **Gamificação** | XP e níveis, conquistas (com badges ocultos), certificações, ranking, streak diário, missões e **Missão do Dia** |
| **Destaque** | **"Dia na Vida de um Analista"** — simula um expediente completo (08:00 → 18:00) com fila dinâmica, relógio corporativo, SLA e relatório final |

> 🔒 **Privacidade primeiro:** consentimento de armazenamento (LGPD), dados 100% locais, sem servidores nem rastreamento.

---

## 🖼️ Capturas de tela

<div align="center">

| Central de Monitoramento (NOC) | Terminal interativo |
|:--:|:--:|
| <img src="assets/shot-noc.png" width="420" /> | <img src="assets/shot-terminal.png" width="420" /> |

| Painel Executivo | Experiência mobile |
|:--:|:--:|
| <img src="assets/shot-executive.png" width="420" /> | <img src="assets/shot-mobile.png" width="200" /> |

</div>

---

## 🛠️ Tecnologias utilizadas

- **HTML5** semântico
- **CSS3** — design system próprio (variáveis CSS, Grid, Flexbox, tema escuro consistente, sistema de ícones SVG monocromáticos)
- **JavaScript (Vanilla)** — arquitetura modular em namespace global, **sem framework e sem build**
- **localStorage** — persistência de progresso
- **Web Audio API** — feedback sonoro (sem arquivos de áudio)
- **Google Fonts** — Inter e JetBrains Mono
- **Zero dependências de runtime** · **Zero etapa de build**

---

## 📱 Responsividade

A experiência foi desenhada **mobile-first**, com qualidade equivalente a um aplicativo nativo:

- **Desktop:** menu lateral completo + hub de descoberta.
- **Mobile:** barra de navegação inferior estilo app, alvos de toque confortáveis, feedback ao toque, layout em coluna única e **zero rolagem horizontal**.

---

## 📂 Estrutura do projeto

```
helpdesk-lab/
├── index.html              # Shell da aplicação (sidebar, topbar, containers)
├── css/
│   ├── styles.css          # Design system (tema, layout, componentes base)
│   └── advanced.css        # Estilos dos módulos avançados + ícones SVG
├── js/
│   ├── ui.js               # Helpers de UI (DOM, ícones SVG, modal, toasts, sons)
│   ├── data.js             # Conteúdo base (chamados, diagnósticos, KB, conquistas)
│   ├── data-phase3.js      # Conteúdo avançado (e-mails, logs, incidentes, trilhas)
│   ├── data-daylife.js     # Conteúdo do modo "Dia na Vida"
│   ├── state.js            # Estado, XP/níveis, conquistas e persistência
│   ├── router.js           # Roteamento por hash (#dashboard, #tickets…)
│   ├── app.js              # Bootstrap, HUD, navegação e consentimento (LGPD)
│   └── modules/            # 28 módulos (Dashboard, NOC, Terminal, Dia na Vida…)
├── assets/                 # Banner e imagens do README
└── README.md
```

---

## 🚀 Como executar localmente

Por ser **100% estático**, não há instalação nem build:

**Opção 1 — abrir direto**
> Dê um duplo clique em `index.html`. Funciona via `file://`.

**Opção 2 — servidor local (recomendado)**
```bash
# com Node
npx serve .

# ou com Python
python -m http.server 8000
```
Depois acesse `http://localhost:8000`.

### Publicar no GitHub Pages
O projeto já é compatível com GitHub Pages (caminhos relativos + roteamento por hash). Basta ativar **Settings → Pages → Deploy from branch → `main` / root**. Inclui um arquivo `.nojekyll` para evitar processamento do Jekyll.

---

## 🧭 Possíveis melhorias futuras

- [ ] **Ranking global real** com backend leve (Cloudflare Functions + KV/D1)
- [ ] Contas de usuário opcionais para sincronizar progresso entre dispositivos
- [ ] Exportação do relatório de desempenho em PDF
- [ ] Modo turma/multiplayer para uso em cursos
- [ ] Internacionalização (i18n)
- [ ] Mais cenários de incidentes e laboratórios de rede

---

## 👤 Autor

**Théo Comparetti**

Desenvolvido com foco em **experiência do usuário, organização e qualidade de produto**.

- 💼 LinkedIn: [Théo Comparetti](https://www.linkedin.com/in/th%C3%A9o-comparetti-62b20018a)
- 🐙 GitHub: [@theocomparetti](https://github.com/theocomparetti)
- ✉️ E-mail: theocomparetti@gmail.com

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

<div align="center">

⭐ Se este projeto te ajudou ou te inspirou, considere deixar uma estrela.

</div>
