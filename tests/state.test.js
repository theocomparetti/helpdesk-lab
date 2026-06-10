'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./setup');

test('o nível é derivado do XP (não armazenado)', () => {
  const { HDL } = loadApp();
  assert.equal(HDL.state.levelInfo().level, 1);
  HDL.state.award({ xp: 120, points: 0 });   // limiar do nível 2
  assert.equal(HDL.state.levelInfo().level, 2);
  HDL.state.award({ xp: 180, points: 0 });   // total 300 -> nível 3
  assert.equal(HDL.state.levelInfo().level, 3);
});

test('award acumula XP/pontos e persiste no localStorage', () => {
  const { HDL, localStorage } = loadApp();
  HDL.state.award({ xp: 50, points: 70, reason: 'teste' });
  assert.equal(HDL.state.get().xp, 50);
  assert.equal(HDL.state.get().points, 70);
  const saved = JSON.parse(localStorage.getItem('hdl_progress_v1'));
  assert.equal(saved.points, 70, 'o progresso deve ser salvo');
});

test('solveTicket é idempotente — não recompensa o mesmo desafio duas vezes', () => {
  const { HDL } = loadApp();
  const first = HDL.state.solveTicket('CHM-1042', { xp: 30, points: 30 });
  const second = HDL.state.solveTicket('CHM-1042', { xp: 30, points: 30 });
  assert.equal(first, true);
  assert.equal(second, false);
  assert.equal(HDL.state.get().points, 30);
  assert.equal(HDL.state.get().solvedTickets.length, 1);
});

test('a meta diária concede o bônus ao ser concluída', () => {
  const { HDL } = loadApp();
  HDL.state.solveTicket('A', { xp: 10, points: 10 });
  HDL.state.solveTicket('B', { xp: 10, points: 10 });
  assert.equal(HDL.state.dailyInfo().solved, 2);
  assert.equal(HDL.state.dailyInfo().rewarded, false);
  HDL.state.solveTicket('C', { xp: 10, points: 10 }); // atinge a meta (3) -> +40
  assert.equal(HDL.state.dailyInfo().rewarded, true);
  assert.equal(HDL.state.get().points, 70, '30 dos desafios + 40 de bônus');
});

test('recordAttempt alimenta a taxa de acerto (analytics)', () => {
  const { HDL } = loadApp();
  HDL.state.recordAttempt({ correct: true, tags: ['dns'], category: 'X' });
  HDL.state.recordAttempt({ correct: true, tags: ['dns'], category: 'X' });
  HDL.state.recordAttempt({ correct: false, tags: ['vpn'], category: 'X' });
  const a = HDL.state.analytics();
  assert.equal(a.accuracy, 67); // 2 de 3 -> 66.7 arredondado
  assert.equal(a.tagList.find((t) => t.tag === 'dns').pct, 100);
});

test('a conquista "Primeiro Atendimento" desbloqueia no 1º chamado', () => {
  const { HDL } = loadApp();
  assert.equal(HDL.state.get().unlockedAchievements.includes('first-blood'), false);
  HDL.state.solveTicket('CHM-1042', { xp: 30, points: 30 });
  assert.equal(HDL.state.get().unlockedAchievements.includes('first-blood'), true);
});

test('o streak começa em 1 ao ganhar XP', () => {
  const { HDL } = loadApp();
  HDL.state.award({ xp: 10, points: 10 });
  assert.equal(HDL.state.get().streak.count, 1);
  assert.equal(HDL.state.get().streak.best, 1);
});

test('reset zera o progresso mas preserva a identidade (perfil)', () => {
  const { HDL } = loadApp();
  HDL.state.setProfileName('Théo');
  HDL.state.award({ xp: 100, points: 100 });
  HDL.state.reset();
  assert.equal(HDL.state.get().points, 0);
  assert.equal(HDL.state.get().xp, 0);
  assert.equal(HDL.state.displayName(), 'Théo'); // perfil mantido
});

test('save antigo é mesclado com novos campos (persistência resiliente, sem migration)', () => {
  // simula um progresso salvo por uma versão anterior, sem vários campos atuais
  const { HDL } = loadApp({ xp: 200, points: 200, solvedTickets: ['CHM-1042'] });
  assert.equal(HDL.state.get().points, 200, 'preserva o que já existia');
  assert.equal(HDL.state.get().xp, 200);
  assert.deepEqual(HDL.state.get().solvedTickets, ['CHM-1042']);
  // campos novos recebem o default sem quebrar
  assert.ok(HDL.state.get().streak, 'streak recebe default');
  assert.equal(HDL.state.get().streak.count, 0);
  assert.ok(HDL.state.get().stats, 'stats recebe default');
  assert.ok(HDL.state.get().corp, 'corp recebe default');
});
