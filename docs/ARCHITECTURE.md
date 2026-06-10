# Arquitetura & Decisões Técnicas

Este documento explica **como o Help Desk Lab é construído** e, principalmente, **por que** cada decisão foi tomada. O objetivo não foi usar a tecnologia mais nova, e sim entregar uma experiência fluida, organizada e fácil de manter — com o mínimo de complexidade possível.

> TL;DR — É uma SPA estática em **JavaScript puro**, sem framework e sem etapa de build, organizada em camadas claras (**dados → estado → módulos → roteador**), com um **modelo de renderização reativo** otimizado por `requestAnimationFrame` e persistência em `localStorage`.

---

## 1. Princípios

- **Sem dependências de runtime e sem build.** O projeto roda abrindo o `index.html` ou em qualquer hospedagem estática. Isso reduz atrito (qualquer pessoa clona e roda), facilita o deploy (GitHub Pages) e mantém o bundle minúsculo.
- **Conteúdo separado de lógica.** Os cenários (chamados, diagnósticos, logs, incidentes…) são **dados**, não código espalhado. Adicionar um desafio é editar um array — não mexer na renderização.
- **Uma única fonte de verdade.** Todo o progresso vive em `HDL.state`. A interface é função do estado: quando o estado muda, a tela se atualiza sozinha.
- **Simplicidade acima de esperteza.** Preferi um padrão previsível e legível a abstrações que economizam linhas mas custam clareza.

---

## 2. Visão geral em camadas

```
┌──────────────────────────────────────────────────────────┐
│  app.js        Bootstrap, HUD, navegação, consentimento   │
├──────────────────────────────────────────────────────────┤
│  router.js     Roteamento por hash  (#dashboard, #noc…)   │
├──────────────────────────────────────────────────────────┤
│  modules/*.js  28 telas — cada uma um módulo isolado      │
├──────────────────────────────────────────────────────────┤
│  state.js      Estado, XP/níveis, conquistas, persistência│
│  ui.js         Helpers de UI (el, ícones SVG, modal, sons)│
├──────────────────────────────────────────────────────────┤
│  data*.js      Conteúdo (cenários) como dados puros        │
└──────────────────────────────────────────────────────────┘
```

Tudo vive sob um **namespace global `HDL`** (`HDL.data`, `HDL.state`, `HDL.ui`, `HDL.modules`, `HDL.router`). Os scripts são clássicos (carregados por `<script>`, na ordem de dependência), e **não** ES modules.

**Por que namespace global e não `import/export`?** Porque o projeto precisava funcionar via `file://` (duplo clique no HTML), e ES modules são bloqueados pelo CORS nesse cenário. O namespace global resolve isso sem build, mantendo o encapsulamento via IIFEs.

---

## 3. Camada de dados — conteúdo como dado

Os arquivos `data.js`, `data-phase3.js` e `data-daylife.js` exportam **arrays de objetos** descrevendo cada cenário. Exemplo (simplificado) de um chamado:

```js
{
  id: 'CHM-1042', difficulty: 1, xp: 30,
  user: 'Mariana Lopes', sector: 'Financeiro', priority: 'high',
  title: 'Não consigo fazer login no computador',
  desc: 'Voltei de férias e minha senha não funciona...',
  options: [ { text: '...', correct: true }, ... ],
  explanation: 'Senhas de domínio expiram (GPO)...',
  tags: ['active directory', 'senha']
}
```

**Benefício:** os módulos são genéricos. A `Central de Chamados` sabe renderizar *qualquer* chamado — o conteúdo é parametrizado. Isso mantém a lógica enxuta mesmo com dezenas de cenários e facilita expansão.

---

## 4. Estado (`HDL.state`) — o coração

`state.js` é a **única fonte de verdade** e o único lugar que toca o `localStorage`. Decisões centrais:

- **Funil de recompensas.** Existem funções específicas (`award`, `recordAttempt`, `applyImpact`, `recordDoc`…) por onde *todo* ganho passa. Isso garante que XP, nível, streak, conquistas e estatísticas sejam sempre atualizados de forma consistente — nenhum módulo mexe no estado "na mão".
- **Conclusões idempotentes.** `markOnce(lista, id, recompensa)` garante que resolver o mesmo desafio duas vezes não dá XP duas vezes. Os `solveTicket`, `solveLab`, etc. são só açúcar sobre ele.
- **Derivações, não duplicação.** Nível e cargo são **calculados** a partir do XP (`levelInfo()`), não armazenados. Menos estado para sincronizar = menos bug.
- **Persistência resiliente.** No `load()`, o estado salvo é mesclado sobre um `DEFAULT`, e objetos aninhados (`stats`, `corp`, `streak`, `profile`) recebem merge explícito. Assim, **saves antigos continuam válidos** quando novos campos são adicionados — sem migration.

```js
function award({ xp = 0, points = 0, reason = '' }) {
  if (xp) updateStreak();
  state.xp += xp; state.points += points;
  save(); checkAchievements(); checkCertifications(); emit();
}
```

---

## 5. Renderização reativa

A interface é **função do estado**. Em vez de cada módulo atualizar a tela manualmente após uma ação, o `state` notifica os interessados:

```js
HDL.state.subscribe(() => { /* re-renderiza a view atual */ });
```

Duas decisões importantes:

### 5.1. Re-render coalescido por `requestAnimationFrame`
Uma única ação pode disparar vários `emit()` em sequência (ganhar XP **+** subir satisfação **+** registrar tentativa). Re-renderizar a cada um seria desperdício. Por isso o `app.js` **agrupa** os eventos de um mesmo frame em **um único re-render**:

```js
let queued = false;
HDL.state.subscribe(() => {
  updateHud();                 // barato, imediato
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    HDL.modules[router.current].render(view);
  });
});
```
*Medição real: uma rajada de 40 eventos passou de 40 renders para **1**.*

### 5.2. `NO_AUTO_RENDER` + `teardown()`
Alguns módulos têm **estado vivo** que não pode ser destruído por um re-render automático: o **Terminal** (input do usuário), o **Modo Pressão** e o **Incidente Crítico** (cronômetros), o **Dia na Vida** (expediente em andamento) e a **IA Analista** (histórico do chat).

- Esses módulos ficam numa lista `NO_AUTO_RENDER` e são **ignorados** pelo re-render automático.
- Módulos com `setInterval` exportam um `teardown()` que o **roteador chama ao sair da tela**, evitando *timer leaks* (um cronômetro que continuaria rodando — e até disparando um modal — depois que o usuário trocou de página).

---

## 6. Módulos

Cada uma das 28 telas é um **IIFE independente** que se registra em `HDL.modules` e expõe um contrato mínimo:

```js
HDL.modules.tickets = (function () {
  const { el, icon } = HDL.ui;
  function render(view) { /* monta a tela dentro de `view` */ }
  function teardown() { /* opcional: limpar timers */ }
  return { render, teardown };
})();
```

O roteador só precisa saber chamar `render(view)`. Isso mantém os módulos **desacoplados** entre si — eles conversam apenas pelo `HDL.state` e pelo `HDL.ui`.

---

## 7. Roteamento por hash

`router.js` usa **roteamento por hash** (`#dashboard`, `#monitoring`…) ouvindo `hashchange`.

**Por que hash e não History API?** Porque o app é **estático** e hospedado no GitHub Pages. Rotas baseadas em path (`/monitoring`) exigiriam configuração de servidor para devolver o `index.html` em qualquer caminho (fallback). O hash funciona em qualquer hospedagem estática, **sem nenhuma configuração**, e ainda dá deep-linking de graça.

O roteador também: marca o item ativo (menu lateral **e** barra inferior), fecha a sidebar no mobile, chama o `teardown()` do módulo anterior e registra a última rota (para o "continuar de onde parou").

---

## 8. UI: helper `el()` e ícones SVG

- **`HDL.ui.el(tag, props, ...children)`** — um criador de elementos minúsculo que substitui template strings. Ele **escapa texto por padrão** (sem `innerHTML` com dado dinâmico → sem XSS acidental) e ignora filhos `null`/`false`, o que torna a montagem condicional limpa.
- **Sistema de ícones SVG.** Toda a interface usa um conjunto de ícones de traço monocromáticos (`HDL.ui.icon('terminal', 18)`), gerados a partir de paths inline. Decisão de **branding**: emojis deixam a UI com cara de protótipo/IA; ícones coesos a deixam com cara de produto. Eles herdam `currentColor`, então se adaptam ao contexto sem CSS extra.

---

## 9. Performance

- **Zero dependências, zero build** → carregamento quase instantâneo.
- **Re-render coalescido** (seção 5.1) evita rebuilds desnecessários.
- **Sem framework de virtual DOM**: para a escala deste app, recriar a `<div>` da view é mais barato e simples do que um runtime de diffing.
- **Imagens** geradas como SVG→PNG (banner, capturas, social preview) — sem libs de gráfico no cliente.

---

## 10. Privacidade desde o design

Não há backend: **todos os dados ficam no `localStorage` do próprio navegador**, nunca trafegam. Mesmo assim, o app trata isso com seriedade: um **banner de consentimento (LGPD)** aparece na primeira visita (antes do onboarding), com política dedicada, e o nome do usuário é usado **apenas** no ranking. O consentimento é guardado numa chave separada do progresso, então não é apagado ao "Resetar".

---

## 11. Trade-offs assumidos (com honestidade)

Toda decisão tem custo. Os principais:

| Escolha | Ganho | Custo aceito |
|--------|-------|--------------|
| Vanilla JS, sem framework | Zero deps, fundamentos à mostra, bundle mínimo | Sem ecossistema de componentes; mais código manual |
| Namespace global em vez de ES modules | Funciona via `file://`, sem build | Acoplamento via global; ordem de `<script>` importa |
| Conteúdo embutido em JS (sem `fetch`) | Funciona offline e via `file://` | Conteúdo vai junto no bundle inicial |
| Re-render da view inteira | Simples e previsível | Não é ideal para listas gigantes (não é o caso aqui) |
| Sem backend | Deploy trivial, privacidade total | Ranking é local/simulado (um backend leve resolveria) |

Essas escolhas são **deliberadas para o contexto** (um projeto de treinamento, estático, focado em UX). Num produto com login e dados compartilhados, várias delas mudariam.

---

## 12. Como estender

Adicionar um módulo novo é um padrão de 4 passos — veja o [CONTRIBUTING.md](../CONTRIBUTING.md). Resumo: criar o IIFE em `js/modules/`, incluir o `<script>`, registrar a rota e o item de navegação. Conteúdo novo é só editar os arrays em `data*.js`.
