# Contribuindo com o Help Desk Lab

Obrigado pelo interesse em contribuir! Este guia explica como o projeto é organizado e como propor melhorias mantendo a qualidade e a consistência.

## 🧱 Princípios do projeto

- **Sem dependências e sem build.** Tudo é HTML, CSS e JavaScript puro. Qualquer mudança deve preservar isso.
- **Funciona via `file://` e em hospedagem estática.** Nada de `fetch` para arquivos locais; o conteúdo fica embutido em JS.
- **Namespace global `HDL`.** Os scripts são clássicos (não ES modules) e tudo vive em `window.HDL` (`HDL.ui`, `HDL.state`, `HDL.data`, `HDL.modules`, `HDL.router`).

## ▶️ Rodando localmente

```bash
npx serve .
# ou
python -m http.server 8000
```

## 📁 Onde mexer

| Quero… | Vá para |
|--------|---------|
| Adicionar um chamado, diagnóstico, artigo ou conquista | `js/data.js` |
| Adicionar e-mails, logs, incidentes, trilhas, missões | `js/data-phase3.js` |
| Ajustar o modo "Dia na Vida" | `js/data-daylife.js` e `js/modules/daylife.js` |
| Criar/editar uma tela | `js/modules/<modulo>.js` |
| Estilos base / design system | `css/styles.css` |
| Estilos de módulos avançados e ícones | `css/advanced.css` |
| Estado, XP, conquistas, persistência | `js/state.js` |

## ➕ Criando um novo módulo

1. Crie `js/modules/meu-modulo.js` no padrão:
   ```js
   window.HDL = window.HDL || {};
   HDL.modules = HDL.modules || {};
   HDL.modules.meuModulo = (function () {
     const { el, icon } = HDL.ui;
     function render(view) { /* monta a tela em `view` */ }
     return { render };
   })();
   ```
2. Adicione o `<script>` em `index.html`.
3. Registre a rota em `js/router.js`.
4. Adicione o item de navegação (lateral e/ou inferior) em `index.html`.
5. Se o módulo tiver estado vivo (timers), adicione-o a `NO_AUTO_RENDER` em `js/app.js` e exporte um `teardown()`.

## 🎨 Padrões de código

- Use o helper `HDL.ui.el(tag, props, ...children)` para criar DOM com segurança.
- Ícones sempre via `HDL.ui.icon('nome', tamanho)` (SVG monocromático) — **evite emojis na interface**.
- Recompensas e progresso sempre via `HDL.state` (`award`, `recordAttempt`, `solveX`).
- Mantenha o tom visual: tema escuro, espaçamentos do design system, hierarquia clara.

## ✅ Antes de abrir um PR

- Teste no desktop **e** no mobile (sem rolagem horizontal).
- Confira o console: **zero erros**.
- Não quebre fluxos existentes nem a persistência.

## 📝 Mensagens de commit

Use prefixos curtos e descritivos: `feat:`, `fix:`, `style:`, `docs:`, `refactor:`.
