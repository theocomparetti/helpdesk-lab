/* ============================================================
   Help Desk Lab — Bootstrap
   ============================================================ */
(function () {
  const { $, $$ } = HDL.ui;

  function updateHud() {
    const s = HDL.state.get();
    const lvl = HDL.state.levelInfo();
    $('#hudLevel').textContent = lvl.level;
    $('#hudRank').textContent = lvl.rank;
    $('#hudPoints').textContent = s.points;
    $('#hudXpFill').style.width = lvl.pct + '%';
    $('#hudXpText').textContent = lvl.next
      ? `${lvl.xpIntoLevel} / ${lvl.xpForNext} XP`
      : 'Nível máximo';
    const soundIco = $('#soundIco');
    if (soundIco) { soundIco.innerHTML = ''; soundIco.append(HDL.ui.icon(s.soundOn ? 'volume' : 'volume-x', 16)); }
    const name = HDL.state.displayName();
    $('#profileName').textContent = name;
    $('#profileAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function openProfileModal(welcome) {
    const cur = HDL.state.get().profile.name || '';
    const input = HDL.ui.el('input', {
      type: 'text', value: cur, maxlength: '28', placeholder: 'Ex.: Ana, João, Analista Théo…',
      style: 'width:100%;padding:12px 14px;border-radius:10px;background:var(--bg);border:1px solid var(--border-soft);color:var(--text);font-family:var(--font);font-size:15px;outline:none'
    });
    const save = () => {
      HDL.state.setProfileName(input.value);
      m.close();
      HDL.ui.toast({ ico: '👤', title: 'Perfil salvo', msg: 'Bom trabalho, ' + HDL.state.displayName() + '!' }, 2400);
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
    const body = HDL.ui.el('div', {},
      HDL.ui.el('p', { style: 'color:var(--text-dim);line-height:1.6;margin-bottom:14px', text: welcome ? 'Bem-vindo(a) ao Help Desk Lab! Como podemos te chamar? Seu nome aparece no topo e no ranking. (Seu progresso fica salvo neste navegador.)' : 'Edite o nome que aparece no seu perfil e no ranking.' }),
      input,
      HDL.ui.el('div', { style: 'display:flex;gap:10px;margin-top:18px;justify-content:flex-end' },
        welcome ? null : HDL.ui.el('button', { class: 'btn btn--ghost', onclick: () => m.close() }, 'Cancelar'),
        HDL.ui.el('button', { class: 'btn btn--primary', onclick: save }, welcome ? 'Começar a treinar' : 'Salvar'))
    );
    const m = HDL.ui.modal({ title: welcome ? 'Boas-vindas ao Help Desk Lab' : 'Seu perfil', sub: welcome ? 'Vamos começar' : 'Editar nome', body, width: 440 });
    setTimeout(() => input.focus(), 80);
  }

  function bindNav() {
    $$('.nav__item').forEach(item => {
      item.addEventListener('click', () => {
        location.hash = '#' + item.dataset.route;
        HDL.ui.sound.click();
      });
    });
  }

  function bindMobile() {
    const sidebar = $('#sidebar');
    const backdrop = $('#backdrop');
    const openSidebar = () => { sidebar.classList.add('is-open'); backdrop.classList.add('is-open'); };
    const closeSidebar = () => { sidebar.classList.remove('is-open'); backdrop.classList.remove('is-open'); };
    $('#menuToggle').addEventListener('click', () => { sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar(); });
    backdrop.addEventListener('click', closeSidebar);
    // barra de navegação inferior (mobile)
    $$('.bottom-nav__item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.id === 'bottomMenu') { openSidebar(); HDL.ui.sound.click(); return; }
        location.hash = '#' + item.dataset.route;
        HDL.ui.sound.click();
      });
    });
  }

  function bindControls() {
    $('#toggleSound').addEventListener('click', () => {
      const on = HDL.state.toggleSound();
      HDL.ui.toast({ ico: on ? '🔊' : '🔇', title: on ? 'Sons ativados' : 'Sons desativados' }, 1800);
    });
    $('#resetProgress').addEventListener('click', () => {
      const body = HDL.ui.el('div', {},
        HDL.ui.el('p', { style: 'color:var(--text-dim);line-height:1.6', text: 'Isso apagará todo o seu progresso: XP, pontos, chamados resolvidos e conquistas. Esta ação não pode ser desfeita.' }),
        HDL.ui.el('div', { style: 'display:flex;gap:10px;margin-top:18px;justify-content:flex-end' },
          HDL.ui.el('button', { class: 'btn btn--ghost', onclick: () => m.close() }, 'Cancelar'),
          HDL.ui.el('button', { class: 'btn', style: 'border-color:var(--red-dim);color:var(--red)', onclick: () => { HDL.state.reset(); m.close(); HDL.router.go(HDL.router.current || 'dashboard'); HDL.ui.toast({ ico: '↺', title: 'Progresso zerado' }); } }, 'Sim, resetar tudo')
        )
      );
      const m = HDL.ui.modal({ title: '↺ Resetar progresso', sub: 'Confirme a ação', body, width: 460 });
    });
    $('#profileChip').addEventListener('click', () => openProfileModal(false));
    const pv = $('#openPrivacy');
    if (pv) pv.addEventListener('click', openPrivacyModal);
  }

  function injectIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(span => {
      if (span.querySelector('.ico-svg')) return;
      const sz = span.classList.contains('bottom-nav__ico') ? 21 : span.classList.contains('nav__ico') ? 18 : 16;
      span.append(HDL.ui.icon(span.dataset.icon, sz));
    });
  }

  /* ---- Consentimento / Privacidade (LGPD) ---- */
  const CONSENT_KEY = 'hdl_consent_v1';
  function hasConsent() { try { return localStorage.getItem(CONSENT_KEY) === '1'; } catch (e) { return false; } }

  function openPrivacyModal() {
    const el = HDL.ui.el;
    const body = el('div', { class: 'policy' },
      el('p', { text: 'Esta plataforma é uma ferramenta de treinamento que funciona inteiramente no seu navegador. Levamos sua privacidade a sério e seguimos os princípios da LGPD (Lei nº 13.709/2018).' }),
      el('h4', {}, 'Quais dados são tratados'),
      el('ul', {},
        el('li', {}, el('strong', { text: 'Nome de exibição (opcional):' }), ' usado ', el('strong', { text: 'exclusivamente para exibir você no ranking' }), '.'),
        el('li', {}, el('strong', { text: 'Progresso de uso:' }), ' XP, nível, desafios concluídos, conquistas, certificações e estatísticas de desempenho.')),
      el('h4', {}, 'Onde os dados ficam'),
      el('p', {}, 'Tudo é salvo apenas no ', el('strong', { text: 'armazenamento local (localStorage) do seu próprio navegador' }), '. Não há servidor: ', el('strong', { text: 'nenhum dado é enviado, transmitido ou compartilhado com terceiros.' })),
      el('h4', {}, 'Cookies'),
      el('p', { text: 'Não utilizamos cookies de rastreamento, publicidade ou de terceiros — apenas o armazenamento local essencial para a plataforma funcionar e lembrar seu progresso.' }),
      el('h4', {}, 'Seus direitos (LGPD)'),
      el('p', {}, 'Você tem controle total: pode ', el('strong', { text: 'editar ou remover seu nome' }), ' a qualquer momento no perfil, e ', el('strong', { text: 'apagar todos os dados' }), ' no botão “Resetar”. Como os dados nunca saem do seu dispositivo, a exclusão é imediata e definitiva.'),
      el('p', { style: 'margin-top:14px;color:var(--text-mute);font-size:12px', text: 'Ao continuar usando a plataforma, você concorda com este uso de armazenamento local.' }),
      el('div', { style: 'display:flex;justify-content:flex-end;margin-top:16px' },
        el('button', { class: 'btn btn--primary', onclick: () => { acceptConsent(); m.close(); } }, 'Entendi e aceito'))
    );
    const m = HDL.ui.modal({ title: 'Política de Privacidade', sub: 'LGPD · Lei nº 13.709/2018', body, width: 600 });
  }

  function acceptConsent() {
    try { localStorage.setItem(CONSENT_KEY, '1'); } catch (e) {}
    const banner = $('#consent');
    if (banner) banner.hidden = true;
    if (!HDL.state.get().profile.onboarded) setTimeout(() => openProfileModal(true), 350);
  }

  function showConsentFlow() {
    if (hasConsent()) {
      if (!HDL.state.get().profile.onboarded) setTimeout(() => openProfileModal(true), 500);
      return;
    }
    const banner = $('#consent');
    banner.hidden = false;
    $('#consentAccept').addEventListener('click', acceptConsent);
    $('#consentPrivacy').addEventListener('click', openPrivacyModal);
    const link = $('#privacyLink');
    if (link) { link.addEventListener('click', openPrivacyModal); link.addEventListener('keydown', e => { if (e.key === 'Enter') openPrivacyModal(); }); }
  }

  function init() {
    injectIcons();
    bindNav();
    bindMobile();
    bindControls();
    // módulos com estado interativo vivo não devem ser re-renderizados automaticamente
    const NO_AUTO_RENDER = ['terminal', 'pressure', 'windows', 'incident', 'assistant', 'remote', 'daylife', 'quick'];
    // re-render coalescido por frame (evita rebuilds múltiplos numa rajada de eventos)
    let rerenderQueued = false;
    HDL.state.subscribe(() => {
      updateHud(); // barato e imediato
      if (rerenderQueued) return;
      rerenderQueued = true;
      requestAnimationFrame(() => {
        rerenderQueued = false;
        const r = HDL.router.current;
        if (r && HDL.modules[r] && !NO_AUTO_RENDER.includes(r)) {
          HDL.modules[r].render(document.getElementById('view'));
        }
      });
    });
    updateHud();
    HDL.router.init();
    // checagem inicial de conquistas (caso regras dependam de nível)
    HDL.state.checkAchievements();
    // consentimento (LGPD) na primeira visita; o onboarding vem após aceitar
    showConsentFlow();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
