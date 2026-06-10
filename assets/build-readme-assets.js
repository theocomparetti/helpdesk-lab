/* Gera banner + product shots para o README (PNG). */
const sharp = require('C:/Users/theoc/OneDrive/Desktop/reginaldo-imoveis/node_modules/sharp');
const path = require('path');

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
  server: '<rect x="3" y="4" width="18" height="7" rx="1"/><rect x="3" y="13" width="18" height="7" rx="1"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16.2 7.8-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M3 21h18"/><path d="M8 7h2M8 11h2M8 15h2"/>',
  wrench: '<path d="M14 7a4 4 0 0 1-5.3 5.3L4 17v3h3l4.7-4.7A4 4 0 0 1 17 10l3-3-3-3-3 3z"/>',
  ticket: '<path d="M3 9a2 2 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
};
function icon(name, x, y, size, color, sw) {
  const s = size / 24, stroke = (sw || 2) / s;
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;
}
function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function T(x, y, str, o = {}) {
  const { size = 40, weight = 600, fill = C.text, font = SANS, anchor = 'start', spacing = 0, opacity = 1 } = o;
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}">${esc(str)}</text>`;
}
function defs() {
  return `<defs>
    <radialGradient id="g1" cx="88%" cy="-10%" r="70%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.22"/><stop offset="60%" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="2%" cy="112%" r="60%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.16"/><stop offset="60%" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${C.panel}"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
  </defs>`;
}
function bg(w, h) { return `${defs()}<rect width="${w}" height="${h}" fill="${C.bg}"/><rect width="${w}" height="${h}" fill="url(#g1)"/><rect width="${w}" height="${h}" fill="url(#g2)"/>`; }
function svg(w, h, body) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`; }
async function render(name, w, h, body) {
  await sharp(Buffer.from(svg(w, h, body))).png().toFile(path.join(__dirname, name));
  console.log('ok', name);
}

/* ---- BANNER 1280x420 ---- */
function banner() {
  const W = 1280, Hh = 420;
  let s = bg(W, Hh);
  // brand
  s += `<rect x="70" y="64" width="52" height="52" rx="13" fill="${C.panel2}" stroke="${C.border}"/>${icon('wrench', 83, 77, 26, C.accent)}`;
  s += T(138, 98, 'HELP DESK LAB', { size: 24, weight: 800, fill: C.dim, spacing: 4 });
  // title + tagline
  s += T(70, 210, 'Treine Suporte Técnico', { size: 56, weight: 800 });
  s += T(70, 272, 'resolvendo problemas reais.', { size: 56, weight: 800, fill: C.accent });
  s += T(70, 330, 'Plataforma de simulação para Help Desk, Infraestrutura e Troubleshooting.', { size: 24, weight: 500, fill: C.dim });
  // right motif: status dots + terminal lines
  const rx = 880, ry = 120;
  s += `<rect x="${rx}" y="${ry}" width="330" height="190" rx="16" fill="#05080f" stroke="${C.border}"/>`;
  s += `<circle cx="${rx + 24}" cy="${ry + 24}" r="6" fill="#ff5f56"/><circle cx="${rx + 44}" cy="${ry + 24}" r="6" fill="#ffbd2e"/><circle cx="${rx + 64}" cy="${ry + 24}" r="6" fill="#27c93f"/>`;
  const lines = [['C:\\> ping 8.8.8.8', C.text], ['Resposta: tempo=4ms', C.green], ['C:\\> nslookup site', C.text], ['*** timeout', C.red]];
  lines.forEach((l, i) => s += T(rx + 22, ry + 70 + i * 30, l[0], { size: 17, font: MONO, fill: l[1] }));
  return render('banner.png', W, Hh, s);
}

/* ---- SHOT: TERMINAL 1100x700 ---- */
function shotTerminal() {
  const W = 1100, Hh = 700;
  let s = bg(W, Hh);
  const x = 90, y = 70, w = 920, h = 560;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#05080f" stroke="${C.border}"/>`;
  s += `<path d="M${x} ${y + 22} a18 18 0 0 1 18 -18 h${w - 36} a18 18 0 0 1 18 18 v34 h-${w} z" fill="#0a1020"/>`;
  s += `<circle cx="${x + 34}" cy="${y + 30}" r="8" fill="#ff5f56"/><circle cx="${x + 62}" cy="${y + 30}" r="8" fill="#ffbd2e"/><circle cx="${x + 90}" cy="${y + 30}" r="8" fill="#27c93f"/>`;
  s += T(x + 124, y + 38, 'Prompt de Comando — PC-FINANCEIRO-07', { size: 22, font: MONO, fill: C.mute });
  const L = [
    ['C:\\> ipconfig /all', C.text], ['   Endereço IPv4 . . . : 192.168.1.84', C.dim],
    ['   Gateway Padrão  . . : 192.168.1.1', C.dim], ['   Servidores DNS  . . : 192.168.1.250', C.amber],
    ['C:\\> ping 8.8.8.8', C.text], ['   Resposta de 8.8.8.8: bytes=32 tempo=4ms TTL=117', C.green],
    ['C:\\> nslookup google.com', C.text], ['   *** Tempo de espera do servidor esgotado', C.red]
  ];
  L.forEach((ln, i) => s += T(x + 28, y + 110 + i * 52, ln[0], { size: 25, font: MONO, fill: ln[1] }));
  return render('shot-terminal.png', W, Hh, s);
}

/* ---- SHOT: NOC 1100x760 ---- */
function shotNoc() {
  const W = 1100, Hh = 760;
  let s = bg(W, Hh);
  s += `<rect x="80" y="56" width="240" height="44" rx="22" fill="${C.panel}" stroke="${C.borderSoft}"/><circle cx="106" cy="78" r="6" fill="${C.green}"/>${T(122, 85, '4  Operacionais', { size: 19, weight: 700, fill: C.dim })}`;
  s += `<rect x="336" y="56" width="180" height="44" rx="22" fill="${C.panel}" stroke="${C.borderSoft}"/><circle cx="362" cy="78" r="6" fill="${C.red}"/>${T(378, 85, '2  Críticos', { size: 19, weight: 700, fill: C.dim })}`;
  const rows = [
    ['server', 'Servidor de Arquivos', 'Crítico', C.red], ['building', 'ERP Corporativo', 'Degradado', C.orange],
    ['mail', 'Servidor de E-mail', 'Operacional', C.green], ['shield', 'Concentrador VPN', 'Operacional', C.green],
    ['globe', 'Link de Internet (WAN)', 'Operacional', C.green], ['compass', 'Servidor DNS', 'Crítico', C.red]
  ];
  rows.forEach((r, i) => {
    const y = 130 + i * 102;
    s += `<rect x="80" y="${y}" width="940" height="86" rx="16" fill="url(#panel)" stroke="${C.borderSoft}"/>`;
    s += `<rect x="80" y="${y}" width="6" height="86" rx="3" fill="${r[3]}"/>`;
    s += `<rect x="116" y="${y + 20}" width="46" height="46" rx="11" fill="${C.panel2}" stroke="${C.border}"/>${icon(r[0], 129, y + 33, 20, r[3] === C.green ? C.dim : r[3])}`;
    s += T(186, y + 50, r[1], { size: 27, weight: 700 });
    s += `<circle cx="840" cy="${y + 43}" r="6" fill="${r[3]}"/>${T(860, y + 50, r[2], { size: 21, weight: 700, fill: r[3] })}`;
  });
  return render('shot-noc.png', W, Hh, s);
}

/* ---- SHOT: PAINEL EXECUTIVO 1100x560 ---- */
function shotExec() {
  const W = 1100, Hh = 560;
  let s = bg(W, Hh);
  const kpis = [['Satisfação dos usuários', '88%', C.green, .88], ['SLA cumprido', '86%', C.green, .86], ['Eficiência operacional', '85%', C.green, .85], ['Tempo médio de atend.', '42s', C.accent, .7]];
  kpis.forEach((k, i) => {
    const x = i % 2 === 0 ? 80 : 570, y = 70 + Math.floor(i / 2) * 240;
    s += `<rect x="${x}" y="${y}" width="450" height="200" rx="18" fill="url(#panel)" stroke="${C.borderSoft}"/>`;
    s += T(x + 30, y + 52, k[0], { size: 23, weight: 600, fill: C.dim });
    s += T(x + 30, y + 128, k[1], { size: 64, weight: 800, fill: k[2] });
    s += `<rect x="${x + 30}" y="${y + 150}" width="390" height="13" rx="6.5" fill="${C.panel2}"/><rect x="${x + 30}" y="${y + 150}" width="${390 * k[3]}" height="13" rx="6.5" fill="${k[2]}"/>`;
  });
  return render('shot-executive.png', W, Hh, s);
}

/* ---- SHOT: MOBILE 460x840 ---- */
function shotMobile() {
  const W = 460, Hh = 840, px = 60, py = 30, pw = 340, ph = 760;
  let s = bg(W, Hh);
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="40" fill="#0a1120" stroke="${C.border}" stroke-width="3"/>`;
  // topbar
  s += `<rect x="${px + 14}" y="${py + 18}" width="${pw - 28}" height="44" rx="12" fill="${C.panel}"/>${T(px + 30, py + 46, 'Help Desk Lab', { size: 17, weight: 800 })}`;
  s += `<circle cx="${px + pw - 40}" cy="${py + 40}" r="15" fill="${C.purple}"/>${T(px + pw - 40, py + 46, 'M', { size: 15, weight: 800, fill: '#05121f', anchor: 'middle' })}`;
  // hero
  s += `<rect x="${px + 14}" y="${py + 78}" width="${pw - 28}" height="150" rx="16" fill="url(#panel)" stroke="${C.borderSoft}"/>`;
  s += T(px + 32, py + 122, 'Olá de novo, Théo', { size: 22, weight: 800 });
  s += T(px + 32, py + 152, 'Nível 5 · 1340 pontos', { size: 16, fill: C.dim });
  s += `<rect x="${px + 32}" y="${py + 170}" width="${pw - 64}" height="32" rx="9" fill="${C.accent}"/>${T(px + pw / 2 - 30, py + 191, 'Começar agora', { size: 15, weight: 800, fill: '#05121f', anchor: 'middle' })}`;
  // mission
  s += `<rect x="${px + 14}" y="${py + 244}" width="${pw - 28}" height="110" rx="16" fill="url(#panel)" stroke="${C.accent}"/>`;
  s += T(px + 32, py + 280, 'MISSÃO DO DIA', { size: 13, weight: 800, fill: C.accent, spacing: 1.5 });
  s += T(px + 32, py + 312, 'Diagnosticar falha de DNS', { size: 19, weight: 800 });
  // streak + meta cards
  s += `<rect x="${px + 14}" y="${py + 370}" width="${pw - 28}" height="74" rx="14" fill="url(#panel)" stroke="${C.borderSoft}"/>`;
  s += icon('activity', px + 30, py + 392, 28, C.orange);
  s += T(px + 76, py + 405, '6 dias de sequência', { size: 18, weight: 800 });
  s += T(px + 76, py + 430, 'recorde 9', { size: 14, fill: C.dim });
  // bottom nav
  s += `<rect x="${px}" y="${py + ph - 60}" width="${pw}" height="60" fill="#0a1020"/>`;
  ['building', 'ticket', 'building', 'terminal', 'activity'].forEach((ic, i) => s += icon(ic, px + 30 + i * 62, py + ph - 46, 22, i === 0 ? C.accent : C.mute));
  return render('shot-mobile.png', W, Hh, s);
}

(async () => { await banner(); await shotTerminal(); await shotNoc(); await shotExec(); await shotMobile(); console.log('FEITO'); })()
  .catch(e => { console.error('ERRO', e); process.exit(1); });
