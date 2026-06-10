/* ============================================================
   Help Desk Lab — UI helpers (namespace global HDL.ui)
   ============================================================ */
window.HDL = window.HDL || {};

HDL.ui = (function () {
  /* ---- DOM helpers ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== false && v != null) node.setAttribute(k, v);
    }
    children.flat().forEach(c => {
      if (c == null || c === false) return;
      node.append(c.nodeType ? c : document.createTextNode(c));
    });
    return node;
  }

  /* ---- Biblioteca de ícones SVG (traço, monocromático estilo Lucide) ---- */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/>',
    building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M3 21h18"/><path d="M8 7h2M8 11h2M8 15h2"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    ticket: '<path d="M3 9a2 2 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1-2-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    stethoscope: '<path d="M4 3v5a5 5 0 0 0 10 0V3"/><path d="M9 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    cast: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="12" cy="10" r="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/><path d="M12 18v3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16.2 7.8-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z"/>',
    barchart: '<path d="M12 20V10M18 20V4M6 20v-6"/>',
    dashboard: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="12" width="8" height="9" rx="1"/><rect x="3" y="15" width="8" height="6" rx="1"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.2 13.9-1.2 7.1 5-3 5 3-1.2-7.1"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M9 20h6M10 20l1-3h2l1 3"/>',
    bot: '<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M12 8V4M9 4h6"/><path d="M2 14h3M19 14h3"/><path d="M9 13v1M15 13v1"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    folder: '<path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    rocket: '<path d="M5 16c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    star: '<path d="m12 3 2.9 5.9 6.1.9-4.5 4.3 1 6-5.5-2.9-5.5 2.9 1-6L3 9.8l6.1-.9z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    'x-circle': '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
    brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 5 1V4a3 3 0 0 0-1-1z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-5 1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    'volume-x': '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="1"/><rect x="3" y="13" width="18" height="7" rx="1"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.3-8.3M16 7l2 2 2.5-2.5L18.5 4z"/>',
    dot: '<circle cx="12" cy="12" r="3"/>'
  };
  function icon(name, size) {
    const d = document.createElement('div');
    d.innerHTML = `<svg viewBox="0 0 24 24" width="${size || 18}" height="${size || 18}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico-svg" aria-hidden="true">${ICONS[name] || ICONS.dot}</svg>`;
    return d.firstElementChild;
  }

  /* Escapa HTML para inserções seguras de texto do usuário/dados */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* ---- Sons (WebAudio, sem arquivos) ---- */
  let audioCtx = null;
  function tone(freq, dur, type = 'sine', gain = 0.04) {
    if (!HDL.state || !HDL.state.get().soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g); g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.stop(audioCtx.currentTime + dur);
    } catch (e) { /* silencioso */ }
  }
  const sound = {
    success() { tone(660, .12, 'triangle'); setTimeout(() => tone(880, .18, 'triangle'), 90); },
    error() { tone(180, .25, 'sawtooth', .03); },
    click() { tone(420, .04, 'square', .02); },
    levelup() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, .18, 'triangle'), i * 110)); },
    badge() { [784, 988, 1318].forEach((f, i) => setTimeout(() => tone(f, .2, 'sine', .05), i * 130)); },
    key() { tone(1200, .015, 'square', .008); }
  };

  /* ---- Toasts ---- */
  function toast({ title, msg, ico = '✅', kind = '' }, ms = 3800) {
    const wrap = $('#toastWrap');
    const t = el('div', { class: 'toast ' + (kind ? 'toast--' + kind : '') },
      el('span', { class: 'toast__ico', text: ico }),
      el('div', { class: 'toast__body' },
        el('b', { text: title }),
        msg ? el('small', { text: msg }) : null
      )
    );
    wrap.append(t);
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 260); }, ms);
  }

  /* ---- Modal ---- */
  function modal({ title, sub, body, width }) {
    const root = $('#modalRoot');
    root.innerHTML = '';
    const close = () => {
      root.classList.remove('is-open');
      setTimeout(() => { root.innerHTML = ''; }, 220);
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const m = el('div', { class: 'modal' },
      el('div', { class: 'modal__head' },
        el('div', {},
          el('h2', { text: title }),
          sub ? el('div', { class: 'sub', text: sub }) : null
        ),
        el('button', { class: 'modal__close', onclick: close, 'aria-label': 'Fechar', text: '✕' })
      ),
      el('div', { class: 'modal__body' }, body)
    );
    if (width) m.style.width = `min(${width}px, 100%)`;
    root.append(el('div', { class: 'modal-ov', onclick: close }), m);
    requestAnimationFrame(() => root.classList.add('is-open'));
    document.addEventListener('keydown', onKey);
    return { close, root };
  }

  /* ---- Sistema de Dicas Inteligentes (graduais) ---- */
  // Retorna { el, used } — revela uma dica por vez, sem entregar a resposta.
  function hintBox(hints) {
    let i = 0;
    const list = el('div', { style: 'display:flex;flex-direction:column;gap:8px;margin-top:8px' });
    const btn = el('button', { class: 'btn btn--ghost btn--sm' });
    const wrap = el('div', { class: 'hintbox' }, btn, list);
    function label() { btn.textContent = i < hints.length ? `💡 Pedir dica (${hints.length - i} restante${hints.length - i > 1 ? 's' : ''})` : '✓ Todas as dicas reveladas'; btn.disabled = i >= hints.length; }
    btn.addEventListener('click', () => {
      if (i >= hints.length) return;
      sound.click();
      list.append(el('div', { class: 'hint-reveal' }, el('b', { text: `Dica ${i + 1}: ` }), hints[i]));
      i++; label();
    });
    label();
    return { el: wrap, used: () => i };
  }

  /* ---- Contexto de laboratório (objetivo, dificuldade, tempo, competências) ----
     items: array de string OU { icon, text } */
  function labMeta(items) {
    return el('div', { class: 'lab-meta' }, ...items.map(it => {
      if (typeof it === 'string') return el('span', { class: 'meta-chip', text: it });
      return el('span', { class: 'meta-chip' }, it.icon ? icon(it.icon, 13) : null, it.text);
    }));
  }

  /* ---- Cabeçalho de resultado (acerto/erro) com ícone SVG ---- */
  function result(ok, title) {
    return el('h4', {}, icon(ok ? 'check-circle' : 'x-circle', 17), ' ' + title);
  }

  /* ---- Util ---- */
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'agora há pouco';
    const m = Math.floor(s / 60); if (m < 60) return `há ${m} min`;
    const h = Math.floor(m / 60); if (h < 24) return `há ${h} h`;
    const d = Math.floor(h / 24); return `há ${d} dia${d > 1 ? 's' : ''}`;
  }
  function fmtClock(ts) {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  const PRIORITY = {
    low: { label: 'Baixa', cls: 'low' },
    medium: { label: 'Média', cls: 'medium' },
    high: { label: 'Alta', cls: 'high' },
    critical: { label: 'Crítica', cls: 'critical' }
  };
  const LEVEL_NAMES = ['Iniciante', 'Intermediário', 'Avançado', 'Especialista'];
  function initials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  return { $, $$, el, esc, icon, sound, toast, modal, hintBox, labMeta, result, timeAgo, fmtClock, initials, PRIORITY, LEVEL_NAMES };
})();
