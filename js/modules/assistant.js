/* ============================================================
   Módulo: IA Analista (assistente virtual — orienta sem entregar)
   ============================================================ */
window.HDL = window.HDL || {};
HDL.modules = HDL.modules || {};

HDL.modules.assistant = (function () {
  const { el, sound } = HDL.ui;
  const { aiKnowledge } = HDL.data;

  const suggestions = ['O que é DNS?', 'Como funciona DHCP?', 'Como investigar lentidão?', 'O que verificar na VPN?', 'Como priorizar chamados?', 'Como analisar um log?'];

  function render(view) {
    view.innerHTML = '';
    view.append(
      el('div', { class: 'page-head' },
        el('h1', {}, HDL.ui.icon('bot', 24), 'IA Analista'),
        el('p', { text: 'Seu assistente técnico interno. Faça perguntas sobre redes, Windows, suporte e processos — a IA orienta o raciocínio e o caminho de investigação, sem entregar a resposta pronta dos desafios.' })
      )
    );

    const msgs = el('div', { class: 'chat__msgs', id: 'chatMsgs' });
    const input = el('input', { type: 'text', placeholder: 'Pergunte algo técnico…', autocomplete: 'off' });

    const chat = el('div', { class: 'chat' },
      msgs,
      suggestionsBar(),
      el('div', { class: 'chat__input' }, input, el('button', { class: 'btn btn--primary', onclick: send }, 'Enviar'))
    );
    view.append(chat);

    addAi('Olá! 👋 Sou a IA Analista do Help Desk Lab. Posso te orientar em diagnósticos de rede, Windows, VPN, DNS, SLA e mais. Sobre o que você quer raciocinar?');
    setTimeout(() => input.focus(), 60);

    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

    function suggestionsBar() {
      const bar = el('div', { class: 'chat-suggest' });
      suggestions.forEach(q => bar.append(el('button', { onclick: () => { input.value = q; send(); } }, q)));
      return bar;
    }
    function send() {
      const q = input.value.trim();
      if (!q) return;
      addMe(q);
      input.value = '';
      HDL.state.askAi();
      setTimeout(() => addAi(answerFor(q)), 350);
    }
    function addMe(text) { msgs.append(el('div', { class: 'msg me', text })); scroll(); sound.click(); }
    function addAi(text) { msgs.append(el('div', { class: 'msg ai' }, el('div', { class: 'chat__ico', text: '🤖 IA Analista' }), el('span', { text }))); scroll(); }
    function scroll() { msgs.scrollTop = msgs.scrollHeight; }
  }

  function answerFor(q) {
    const t = q.toLowerCase();
    let best = null, bestScore = 0;
    aiKnowledge.forEach(entry => {
      const score = entry.keys.filter(k => t.includes(k)).length;
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    if (best) return best.answer + '\n\n💡 Dica: tente aplicar isso nos desafios — eu oriento o caminho, a conclusão é sua. 😉';
    return 'Boa pergunta! Não tenho um guia específico pra isso, mas o método geral vale sempre: (1) isole o escopo — é com um ou com vários? (2) verifique a camada física/conexão; (3) suba pela rede: gateway → IP externo → nome (DNS); (4) compare com algo que funciona. Reformule citando um tema (DNS, DHCP, VPN, impressora, lentidão, SLA, logs) que eu detalho.';
  }

  return { render };
})();
