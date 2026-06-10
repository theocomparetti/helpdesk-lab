/* Gera um GIF animado do fluxo: resolver um chamado -> ganhar XP. */
const sharp = require('C:/Users/theoc/OneDrive/Desktop/reginaldo-imoveis/node_modules/sharp');
const path = require('path');
const W = 900, H = 620;
const C = {
  bg: '#0b1120', panel: '#131c31', panel2: '#18233d', panel3: '#1e2c4a',
  border: '#243250', borderSoft: '#1b2742', accent: '#38bdf8', accent2: '#0ea5e9',
  purple: '#a78bfa', green: '#34d399', amber: '#fbbf24', red: '#f87171',
  text: '#e6edf7', dim: '#9fb0cc', mute: '#6b7c9c'
};
const SANS = 'Segoe UI, Arial, sans-serif';
function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function T(x, y, s, o = {}) {
  const { size = 22, weight = 600, fill = C.text, anchor = 'start', spacing = 0, opacity = 1 } = o;
  return `<text x="${x}" y="${y}" font-family="${SANS}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}">${esc(s)}</text>`;
}
function check(x, y, col) { return `<g fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="${x + 11}" cy="${y + 11}" r="10"/><path d="M${x + 6} ${y + 11} l3 3 l7 -8"/></g>`; }

const OPTS = [
  ['A', 'Formatar a estação e reinstalar o Windows.', false],
  ['B', 'A senha de domínio expirou — resetar no Active Directory.', true],
  ['C', 'Trocar o teclado.', false]
];

function scene(st) {
  let s = `<defs>
    <radialGradient id="g1" cx="90%" cy="-10%" r="70%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.18"/><stop offset="60%" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${C.accent}"/><stop offset="100%" stop-color="${C.accent2}"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/><rect width="${W}" height="${H}" fill="url(#g1)"/>`;

  // HUD topo
  s += `<rect x="0" y="0" width="${W}" height="68" fill="#0e1729"/>`;
  s += T(28, 42, 'HELP DESK LAB', { size: 16, weight: 800, fill: C.dim, spacing: 2 });
  s += T(560, 30, 'NÍVEL', { size: 11, weight: 700, fill: C.mute, spacing: 1 });
  s += T(560, 50, '4', { size: 22, weight: 800 });
  // barra XP
  s += `<rect x="595" y="28" width="170" height="12" rx="6" fill="${C.panel2}" stroke="${C.borderSoft}"/>`;
  s += `<rect x="595" y="28" width="${170 * st.xpPct / 100}" height="12" rx="6" fill="${C.accent}"/>`;
  s += T(595, 58, st.xpLabel, { size: 12, fill: C.mute });
  s += T(872, 30, 'PONTOS', { size: 11, weight: 700, fill: C.mute, anchor: 'end', spacing: 1 });
  s += T(872, 52, String(st.pontos), { size: 22, weight: 800, fill: C.accent, anchor: 'end' });
  if (st.floatXp) s += T(770, 52, '+30 XP', { size: 18, weight: 800, fill: C.green });

  // modal
  const mx = 70, my = 100, mw = 760, mh = 480;
  s += `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="18" fill="${C.panel}" stroke="${C.border}"/>`;
  s += T(mx + 32, my + 46, 'Não consigo fazer login no computador', { size: 24, weight: 800 });
  s += T(mx + 32, my + 74, 'CHM-1042 · Financeiro · Mariana Lopes', { size: 14, fill: C.mute });
  // relato
  s += `<rect x="${mx + 32}" y="${my + 92}" width="${mw - 64}" height="62" rx="12" fill="${C.bg}" stroke="${C.borderSoft}"/>`;
  s += T(mx + 50, my + 130, '“Voltei de férias e minha senha não funciona mais.”', { size: 17, fill: C.text });
  s += T(mx + 32, my + 188, 'Qual a melhor conduta?', { size: 18, weight: 700 });

  // opções
  OPTS.forEach((o, i) => {
    const y = my + 208 + i * 70, ox = mx + 32, ow = mw - 64;
    let bd = C.borderSoft, bgf = C.panel2, op = 1, keyc = C.mute;
    const isSel = st.selected === o[0];
    if (st.reveal) {
      if (o[2]) { bd = C.green; bgf = '#15372b'; keyc = C.green; }
      else { op = 0.45; }
    } else if (isSel) { bd = C.accent; }
    s += `<rect x="${ox}" y="${y}" width="${ow}" height="56" rx="11" fill="${bgf}" stroke="${bd}" opacity="${op}"/>`;
    s += T(ox + 22, y + 35, o[0], { size: 18, weight: 800, fill: keyc, opacity: op });
    s += T(ox + 52, y + 35, o[1], { size: 16.5, fill: C.text, opacity: op });
    if (st.reveal && o[2]) s += check(ox + ow - 40, y + 17, C.green);
  });

  // feedback
  if (st.feedback) {
    const fy = my + 208 + 3 * 70 + 6, fx = mx + 32, fw = mw - 64;
    s += `<rect x="${fx}" y="${fy}" width="${fw}" height="64" rx="12" fill="#15372b" stroke="${C.green}"/>`;
    s += check(fx + 16, fy + 14, C.green);
    s += T(fx + 48, fy + 30, 'Correto!', { size: 17, weight: 800, fill: C.green });
    s += T(fx + 48, fy + 52, 'Senhas de domínio expiram (GPO). Resetar no AD resolve.', { size: 14.5, fill: C.dim });
    s += T(fx + fw - 16, fy + 40, '+30 XP', { size: 17, weight: 800, fill: C.accent, anchor: 'end' });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

const frames = [
  { st: { selected: null, reveal: false, feedback: false, xpPct: 58, xpLabel: '70/120 XP', pontos: 880 }, d: 1100 },
  { st: { selected: 'B', reveal: false, feedback: false, xpPct: 58, xpLabel: '70/120 XP', pontos: 880 }, d: 650 },
  { st: { selected: 'B', reveal: true, feedback: false, xpPct: 58, xpLabel: '70/120 XP', pontos: 880 }, d: 750 },
  { st: { selected: 'B', reveal: true, feedback: true, xpPct: 64, xpLabel: '85/120 XP', pontos: 880, floatXp: true }, d: 1500 },
  { st: { selected: 'B', reveal: true, feedback: true, xpPct: 83, xpLabel: '100/120 XP', pontos: 910 }, d: 1700 },
  { st: { selected: 'B', reveal: true, feedback: true, xpPct: 83, xpLabel: '100/120 XP', pontos: 910 }, d: 1400 }
];

(async () => {
  const bufs = [];
  for (const f of frames) bufs.push(await sharp(Buffer.from(scene(f.st))).png().toBuffer());
  await sharp(bufs, { join: { animated: true } })
    .gif({ delay: frames.map(f => f.d), loop: 0 })
    .toFile(path.join(__dirname, 'demo-flow.gif'));
  const meta = await sharp(path.join(__dirname, 'demo-flow.gif'), { animated: true }).metadata();
  console.log('FEITO demo-flow.gif — frames:', meta.pages, 'tamanho:', meta.width + 'x' + (meta.pageHeight || meta.height));
})().catch(e => { console.error('ERRO', e); process.exit(1); });
