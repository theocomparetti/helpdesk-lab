/* Gera os slides do carrossel LinkedIn (1080x1350) como PNG. */
const sharp = require('C:/Users/theoc/OneDrive/Desktop/reginaldo-imoveis/node_modules/sharp');
const path = require('path');
const W = 1080, H = 1350;

const C = {
  bg: '#0b1120', panel: '#131c31', panel2: '#18233d', panel3: '#1e2c4a',
  border: '#243250', borderSoft: '#1b2742',
  accent: '#38bdf8', accent2: '#0ea5e9', purple: '#a78bfa',
  green: '#34d399', amber: '#fbbf24', orange: '#fb923c', red: '#f87171',
  text: '#e6edf7', dim: '#9fb0cc', mute: '#6b7c9c'
};
const SANS = 'Segoe UI, Arial, sans-serif';
const MONO = 'Consolas, monospace';

const ICONS = {
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  ticket: '<path d="M3 9a2 2 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M3 21h18"/><path d="M8 7h2M8 11h2M8 15h2"/>',
  server: '<rect x="3" y="4" width="18" height="7" rx="1"/><rect x="3" y="13" width="18" height="7" rx="1"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16.2 7.8-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z"/>',
  rocket: '<path d="M5 16c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  wrench: '<path d="M14 7a4 4 0 0 1-5.3 5.3L4 17v3h3l4.7-4.7A4 4 0 0 1 17 10l3-3-3-3-3 3z"/>'
};
function icon(name, x, y, size, color, sw) {
  const s = size / 24, stroke = (sw || 2) / s;
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;
}
function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function T(x, y, str, { size = 40, weight = 600, fill = C.text, font = SANS, anchor = 'start', spacing = 0, opacity = 1 } = {}) {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}">${esc(str)}</text>`;
}
function bgBase(extra = '') {
  return `<defs>
    <radialGradient id="g1" cx="85%" cy="-5%" r="60%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.20"/><stop offset="60%" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="5%" cy="108%" r="55%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.16"/><stop offset="60%" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${C.panel}"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${C.accent}"/><stop offset="100%" stop-color="${C.accent2}"/></linearGradient>
    ${extra}
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>`;
}
function brandMark(x, y) {
  return `<rect x="${x}" y="${y}" width="46" height="46" rx="12" fill="${C.panel2}" stroke="${C.border}"/>
    ${icon('wrench', x + 11, y + 11, 24, C.accent)}
    ${T(x + 62, y + 31, 'HELP DESK LAB', { size: 22, weight: 800, fill: C.dim, spacing: 3 })}`;
}
function pill(x, y, w, label, color) {
  return `<rect x="${x}" y="${y}" width="${w}" height="40" rx="20" fill="${C.panel}" stroke="${C.borderSoft}"/>
    <circle cx="${x + 22}" cy="${y + 20}" r="5" fill="${color}"/>
    ${T(x + 38, y + 27, label, { size: 19, weight: 700, fill: C.dim })}`;
}
function wrap(svg) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`; }

/* ---------------- SLIDES ---------------- */
const slides = [];

// 1 — CAPA
slides.push(wrap(`${bgBase()}
${brandMark(80, 90)}
${T(80, 470, 'Eu construí uma', { size: 78, weight: 800 })}
${T(80, 560, 'plataforma para', { size: 78, weight: 800 })}
${T(80, 650, 'treinar quem faz', { size: 78, weight: 800 })}
${T(80, 740, 'Suporte de TI.', { size: 78, weight: 800, fill: C.accent })}
${T(80, 850, 'Do zero, sem framework.', { size: 34, weight: 500, fill: C.dim })}
${T(80, 898, 'Um estudo de UX, produto e front-end.', { size: 34, weight: 500, fill: C.dim })}
<rect x="80" y="1150" width="260" height="64" rx="14" fill="url(#cta)"/>
${T(112, 1190, 'Deslize', { size: 26, weight: 800, fill: '#05121f' })}
${icon('arrowDown', 232, 1170, 26, '#05121f', 2.4)}
<g transform="rotate(-90 245 1183)">${''}</g>
${T(80, 1280, 'Help Desk Lab — plataforma de treinamento prático de TI', { size: 20, weight: 500, fill: C.mute })}
`));

// 2 — PROBLEMA
slides.push(wrap(`${bgBase()}
${brandMark(80, 90)}
${T(80, 300, 'O PROBLEMA', { size: 22, weight: 800, fill: C.accent, spacing: 3 })}
${T(80, 430, 'Suporte técnico se', { size: 72, weight: 800 })}
${T(80, 516, 'aprende na prática.', { size: 72, weight: 800 })}
${T(80, 650, 'Mas ninguém quer', { size: 48, weight: 600, fill: C.dim })}
${T(80, 716, 'aprender ', { size: 48, weight: 600, fill: C.dim })}
${T(258, 716, 'errando', { size: 48, weight: 800, fill: C.red })}
${T(470, 716, ' no ambiente', { size: 48, weight: 600, fill: C.dim })}
${T(80, 782, 'real da empresa.', { size: 48, weight: 600, fill: C.dim })}
<rect x="80" y="940" width="920" height="200" rx="16" fill="url(#panel)" stroke="${C.borderSoft}"/>
${T(112, 1000, 'C:\\> ping 8.8.8.8', { size: 26, font: MONO, fill: C.text })}
${T(112, 1048, 'Esgotado o tempo limite do pedido.', { size: 26, font: MONO, fill: C.red })}
${T(112, 1096, 'Esgotado o tempo limite do pedido.', { size: 26, font: MONO, fill: C.red, opacity: 0.55 })}
`));

// 3 — A IDEIA
const feats = [
  ['ticket', 'Central de Chamados', 'Casos reais de usuários'],
  ['terminal', 'Terminal CMD', 'Investigação com comandos'],
  ['activity', 'Monitoramento (NOC)', 'Operação em tempo real'],
  ['building', 'Dia na Vida', 'Um expediente completo']
];
let f3 = `${bgBase()}${brandMark(80, 90)}
${T(80, 300, 'A IDEIA', { size: 22, weight: 800, fill: C.accent, spacing: 3 })}
${T(80, 410, 'Um laboratório onde', { size: 64, weight: 800 })}
${T(80, 488, 'você ', { size: 64, weight: 800 })}
${T(232, 488, 'investiga', { size: 64, weight: 800, fill: C.accent })}
${T(540, 488, ' o problema —', { size: 64, weight: 800 })}
${T(80, 566, 'não chuta a resposta.', { size: 64, weight: 800 })}`;
feats.forEach((ft, i) => {
  const x = i % 2 === 0 ? 80 : 560, y = 700 + Math.floor(i / 2) * 250;
  f3 += `<rect x="${x}" y="${y}" width="440" height="218" rx="18" fill="url(#panel)" stroke="${C.borderSoft}"/>
    <rect x="${x + 28}" y="${y + 28}" width="62" height="62" rx="14" fill="${C.panel3}" stroke="${C.border}"/>
    ${icon(ft[0], x + 47, y + 47, 24, C.accent)}
    ${T(x + 28, y + 142, ft[1], { size: 30, weight: 800 })}
    ${T(x + 28, y + 182, ft[2], { size: 22, weight: 500, fill: C.dim })}`;
});
slides.push(wrap(f3));

// 4 — TERMINAL
const termLines = [
  ['C:\\> ipconfig /all', C.text],
  ['   Endereço IPv4 . . . : 192.168.1.84', C.dim],
  ['   Gateway Padrão  . . : 192.168.1.1', C.dim],
  ['   Servidores DNS  . . : 192.168.1.250', C.amber],
  ['C:\\> ping 8.8.8.8', C.text],
  ['   Resposta de 8.8.8.8: bytes=32 tempo=4ms', C.green],
  ['C:\\> nslookup google.com', C.text],
  ['   *** Tempo de espera do servidor esgotado', C.red]
];
let t4 = `${bgBase()}${brandMark(80, 90)}
${T(80, 300, 'O DIFERENCIAL', { size: 22, weight: 800, fill: C.accent, spacing: 3 })}
${T(80, 408, 'Investigação real,', { size: 60, weight: 800 })}
${T(80, 482, 'não múltipla escolha.', { size: 60, weight: 800 })}
<rect x="80" y="560" width="920" height="560" rx="18" fill="#05080f" stroke="${C.border}"/>
<rect x="80" y="560" width="920" height="64" rx="18" fill="#0a1020"/>
<rect x="80" y="600" width="920" height="24" fill="#0a1020"/>
<circle cx="116" cy="592" r="8" fill="#ff5f56"/><circle cx="144" cy="592" r="8" fill="#ffbd2e"/><circle cx="172" cy="592" r="8" fill="#27c93f"/>
${T(206, 600, 'Prompt de Comando — PC-FINANCEIRO-07', { size: 22, font: MONO, fill: C.mute })}`;
termLines.forEach((ln, i) => { t4 += T(116, 690 + i * 50, ln[0], { size: 25, font: MONO, fill: ln[1] }); });
t4 += T(80, 1200, 'As saídas mudam conforme o cenário — a causa você descobre.', { size: 28, weight: 500, fill: C.dim });
slides.push(wrap(t4));

// 5 — NOC
const svcs = [
  ['server', 'Servidor de Arquivos', 'Crítico', C.red],
  ['building', 'ERP Corporativo', 'Degradado', C.orange],
  ['mail', 'Servidor de E-mail', 'Operacional', C.green],
  ['shield', 'Concentrador VPN', 'Operacional', C.green],
  ['globe', 'Link de Internet (WAN)', 'Operacional', C.green],
  ['compass', 'Servidor DNS', 'Crítico', C.red]
];
let n5 = `${bgBase()}${brandMark(80, 90)}
${T(80, 300, 'OPERAÇÃO', { size: 22, weight: 800, fill: C.accent, spacing: 3 })}
${T(80, 408, 'Uma central que muda', { size: 58, weight: 800 })}
${T(80, 480, 'em tempo real.', { size: 58, weight: 800 })}
${pill(80, 540, 230, '4  Operacionais', C.green)}
${pill(330, 540, 180, '2  Críticos', C.red)}`;
svcs.forEach((s, i) => {
  const y = 640 + i * 112;
  n5 += `<rect x="80" y="${y}" width="920" height="92" rx="16" fill="url(#panel)" stroke="${C.borderSoft}"/>
    <rect x="80" y="${y}" width="6" height="92" rx="3" fill="${s[3]}"/>
    <rect x="116" y="${y + 22}" width="48" height="48" rx="11" fill="${C.panel2}" stroke="${C.border}"/>
    ${icon(s[0], y === y ? 130 : 130, y + 36, 20, s[3] === C.green ? C.dim : s[3])}
    ${T(190, y + 52, s[1], { size: 28, weight: 700 })}
    <circle cx="800" cy="${y + 46}" r="6" fill="${s[3]}"/>
    ${T(820, y + 53, s[2], { size: 22, weight: 700, fill: s[3] })}`;
});
slides.push(wrap(n5));

// 6 — RESULTADOS / KPIs
const kpis = [
  ['Satisfação dos usuários', '88%', C.green],
  ['SLA cumprido', '86%', C.green],
  ['Eficiência operacional', '85%', C.green],
  ['Tempo médio de atend.', '42s', C.accent]
];
let k6 = `${bgBase()}${brandMark(80, 90)}
${T(80, 300, 'PRODUTO, NÃO SÓ TELAS', { size: 22, weight: 800, fill: C.accent, spacing: 3 })}
${T(80, 410, 'Pensei em métricas', { size: 60, weight: 800 })}
${T(80, 484, 'e em resultado.', { size: 60, weight: 800 })}`;
kpis.forEach((kp, i) => {
  const x = i % 2 === 0 ? 80 : 560, y = 580 + Math.floor(i / 2) * 280;
  k6 += `<rect x="${x}" y="${y}" width="440" height="240" rx="18" fill="url(#panel)" stroke="${C.borderSoft}"/>
    ${T(x + 30, y + 56, kp[0], { size: 24, weight: 600, fill: C.dim })}
    ${T(x + 30, y + 140, kp[1], { size: 72, weight: 800, fill: kp[2] })}
    <rect x="${x + 30}" y="${y + 172}" width="380" height="14" rx="7" fill="${C.panel2}"/>
    <rect x="${x + 30}" y="${y + 172}" width="${380 * (parseInt(kp[1]) >= 50 ? parseInt(kp[1]) / 100 : 0.7)}" height="14" rx="7" fill="${kp[2]}"/>`;
});
k6 += T(80, 1200, 'Painel executivo com SLA, satisfação e impacto das decisões.', { size: 28, weight: 500, fill: C.dim });
slides.push(wrap(k6));

// 7 — FECHO + MOBILE
let s7 = `${bgBase()}${brandMark(80, 90)}
${T(80, 300, 'E NO CELULAR', { size: 22, weight: 800, fill: C.accent, spacing: 3 })}
${T(80, 408, 'Parece um app —', { size: 60, weight: 800 })}
${T(80, 482, 'não um site.', { size: 60, weight: 800 })}`;
// phone mock
const px = 660, py = 560, pw = 340, ph = 680;
s7 += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="38" fill="#0a1120" stroke="${C.border}" stroke-width="3"/>
  <rect x="${px + 14}" y="${py + 60}" width="${pw - 28}" height="140" rx="16" fill="url(#panel)" stroke="${C.borderSoft}"/>
  ${T(px + 34, py + 110, 'Olá de novo, Théo', { size: 24, weight: 800 })}
  ${T(px + 34, py + 150, 'Nível 5 · 1340 pontos', { size: 18, fill: C.dim })}
  <rect x="${px + 34}" y="${py + 168}" width="${pw - 68}" height="10" rx="5" fill="${C.panel2}"/>
  <rect x="${px + 34}" y="${py + 168}" width="120" height="10" rx="5" fill="${C.accent}"/>
  <rect x="${px + 14}" y="${py + 220}" width="${pw - 28}" height="120" rx="16" fill="url(#panel)" stroke="${C.accent}"/>
  ${T(px + 34, py + 256, 'MISSÃO DO DIA', { size: 14, weight: 800, fill: C.accent, spacing: 1.5 })}
  ${T(px + 34, py + 290, 'Diagnosticar falha de DNS', { size: 20, weight: 800 })}
  <rect x="${px}" y="${py + ph - 64}" width="${pw}" height="64" rx="0" fill="#0a1020"/>`;
['home', 'ticket', 'building', 'terminal'].forEach((ic, i) => {
  s7 += icon(ic === 'home' ? 'building' : ic, px + 40 + i * 78, py + ph - 50, 22, i === 0 ? C.accent : C.mute);
});
s7 += `${T(80, 700, 'Qual problema de', { size: 40, weight: 700, fill: C.dim })}
${T(80, 752, 'suporte merecia virar', { size: 40, weight: 700, fill: C.dim })}
${T(80, 804, 'um cenário de treino?', { size: 40, weight: 800, fill: C.text })}
<rect x="80" y="900" width="320" height="66" rx="14" fill="url(#cta)"/>
${T(112, 942, 'Comenta aqui', { size: 26, weight: 800, fill: '#05121f' })}
${icon('arrowDown', 330, 920, 28, '#05121f', 2.6)}
${T(80, 1270, '#helpdesk   #suportetecnico   #ux   #ti', { size: 22, weight: 600, fill: C.mute })}`;
slides.push(wrap(s7));

/* ---------------- RENDER ---------------- */
(async () => {
  const out = path.join(__dirname);
  const names = ['1-capa', '2-problema', '3-ideia', '4-terminal', '5-noc', '6-resultados', '7-fecho'];
  for (let i = 0; i < slides.length; i++) {
    await sharp(Buffer.from(slides[i])).png().toFile(path.join(out, `slide-${names[i]}.png`));
    console.log('ok slide-' + names[i] + '.png');
  }
  console.log('FEITO:', slides.length, 'slides');
})().catch(e => { console.error('ERRO', e); process.exit(1); });
