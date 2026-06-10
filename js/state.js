/* ============================================================
   Help Desk Lab — Estado, progresso e gamificação (HDL.state)
   Persistência em localStorage. Sem backend.
   ============================================================ */
window.HDL = window.HDL || {};

HDL.state = (function () {
  const KEY = 'hdl_progress_v1';
  const { LEVELS, achievements, certifications } = HDL.data;

  const DEFAULT = {
    soundOn: true,
    profile: { name: '', onboarded: false },
    points: 0,
    xp: 0,
    solvedTickets: [],
    solvedDiagnostics: [],
    solvedLabs: [],
    terminalSolved: [],
    dailyDone: [],
    kbRead: [],
    // ---- novos módulos avançados ----
    solvedInterview: [],
    solvedSla: [],
    solvedMonitoring: [],
    solvedWindows: [],
    solvedSurprise: [],
    // ---- Fase 3 ----
    solvedLogs: [],
    solvedIncidents: [],
    solvedMeetings: [],
    solvedRemote: [],
    emailsHandled: [],      // {id, correct}
    aiAsked: 0,
    missionsClaimed: [],
    daylifeRuns: [],        // {date, resolved, pending, slaPct, satisfaction, score, success}
    streak: { count: 0, best: 0, lastDay: '' },   // dias consecutivos
    daily: { day: '', solved: 0, goal: 3, rewarded: false }, // meta diária
    lastRoute: '',          // continuar de onde parou
    quickRuns: [],          // treinos relâmpago concluídos
    corp: { satisfaction: 72, slaOnTime: 0, slaLate: 0, decisions: 0, goodDecisions: 0 },
    docScores: [],          // {ticketId, score, ts}
    pressureRuns: [],       // {score, resolved, ts}
    certificates: [],       // ids de certificados emitidos
    unlockedAchievements: [],
    // ---- estatísticas p/ análise de desempenho ----
    stats: { attempts: 0, correct: 0, wrong: 0, totalTimeMs: 0, byTag: {}, byCat: {} },
    xpHistory: [],          // {ts, xp}
    activity: []            // {ico, text, ts}
  };

  let state = load();
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULT);
      const saved = JSON.parse(raw);
      const merged = { ...clone(DEFAULT), ...saved };
      // garante shape de stats mesmo em saves antigos
      merged.stats = { ...clone(DEFAULT.stats), ...(saved.stats || {}) };
      merged.stats.byTag = { ...(saved.stats && saved.stats.byTag || {}) };
      merged.stats.byCat = { ...(saved.stats && saved.stats.byCat || {}) };
      merged.corp = { ...clone(DEFAULT.corp), ...(saved.corp || {}) };
      merged.profile = { ...clone(DEFAULT.profile), ...(saved.profile || {}) };
      merged.streak = { ...clone(DEFAULT.streak), ...(saved.streak || {}) };
      merged.daily = { ...clone(DEFAULT.daily), ...(saved.daily || {}) };
      return merged;
    } catch (e) { return clone(DEFAULT); }
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function get() { return state; }
  function subscribe(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(fn => fn(state, computed())); }

  /* ---- Nível derivado do XP ---- */
  function levelInfo(xp = state.xp) {
    let current = LEVELS[0];
    for (const l of LEVELS) if (xp >= l.xp) current = l;
    const idx = LEVELS.indexOf(current);
    const next = LEVELS[idx + 1] || null;
    const floor = current.xp;
    const ceil = next ? next.xp : current.xp;
    const into = xp - floor;
    const span = next ? (ceil - floor) : 1;
    return {
      level: current.level, rank: current.rank, next,
      xpIntoLevel: into,
      xpForNext: next ? (ceil - floor) : 0,
      pct: next ? Math.min(100, Math.round((into / span) * 100)) : 100
    };
  }
  function computed() { return levelInfo(); }

  /* ---- Recompensas ---- */
  /* ---- Streak diário e meta diária (engajamento) ---- */
  function todayStr(d) { d = d || new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function updateStreak() {
    const today = todayStr();
    const st = state.streak;
    if (st.lastDay === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    st.count = (st.lastDay === todayStr(y)) ? (st.count + 1) : 1;
    st.lastDay = today;
    st.best = Math.max(st.best || 0, st.count);
  }
  function resetDailyIfNeeded() {
    const today = todayStr();
    if (state.daily.day !== today) { state.daily.day = today; state.daily.solved = 0; state.daily.rewarded = false; }
  }
  function bumpDaily() {
    resetDailyIfNeeded();
    state.daily.solved++;
    if (state.daily.solved >= state.daily.goal && !state.daily.rewarded) {
      state.daily.rewarded = true;
      logActivity({ ico: '🎯', text: `Meta diária concluída (${state.daily.goal} desafios)` });
      HDL.ui.toast({ kind: 'badge', ico: '🎯', title: 'Meta diária concluída!', msg: '+40 XP de bônus' }, 4200);
      award({ xp: 40, points: 40, reason: '' });
    }
  }

  function award({ xp = 0, points = 0, reason = '' }) {
    const before = levelInfo().level;
    if (xp) updateStreak();
    state.xp += xp;
    state.points += points;
    if (xp) state.xpHistory.push({ ts: Date.now(), xp: state.xp });
    if (state.xpHistory.length > 200) state.xpHistory = state.xpHistory.slice(-200);
    if (reason) logActivity({ ico: '✅', text: reason });
    const after = levelInfo();
    if (after.level > before) {
      HDL.ui.sound.levelup();
      HDL.ui.toast({ kind: 'badge', ico: '⬆️', title: `Nível ${after.level}!`, msg: `Novo cargo: ${after.rank}` }, 5000);
    }
    save();
    checkAchievements();
    checkCertifications();
    emit();
  }

  function logActivity(item) {
    state.activity.unshift({ ...item, ts: Date.now() });
    state.activity = state.activity.slice(0, 30);
  }

  /* ---- Registro de tentativas (precisão / analytics) ---- */
  function recordAttempt({ correct, tags = [], category = '', timeMs = 0 }) {
    const s = state.stats;
    s.attempts++;
    if (correct) s.correct++; else s.wrong++;
    if (timeMs) s.totalTimeMs += timeMs;
    tags.forEach(t => {
      s.byTag[t] = s.byTag[t] || { correct: 0, wrong: 0 };
      s.byTag[t][correct ? 'correct' : 'wrong']++;
    });
    if (category) {
      s.byCat[category] = s.byCat[category] || { correct: 0, wrong: 0 };
      s.byCat[category][correct ? 'correct' : 'wrong']++;
    }
    save();
  }

  function analytics() {
    const s = state.stats;
    const acc = s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
    const avgTime = s.correct + s.wrong ? Math.round(s.totalTimeMs / (s.correct + s.wrong) / 1000) : 0;
    const tagList = Object.entries(s.byTag).map(([tag, v]) => {
      const total = v.correct + v.wrong;
      return { tag, total, correct: v.correct, pct: total ? Math.round((v.correct / total) * 100) : 0 };
    }).sort((a, b) => b.total - a.total);
    const mastered = tagList.filter(t => t.total >= 2 && t.pct >= 80);
    const weak = tagList.filter(t => t.total >= 1 && t.pct < 60);
    return { accuracy: acc, avgTimeSec: avgTime, tagList, mastered, weak };
  }

  /* ---- Marcadores de conclusão (idempotentes) ---- */
  function markOnce(listKey, id, reward) {
    if (!state[listKey]) state[listKey] = [];
    if (state[listKey].includes(id)) return false;
    state[listKey].push(id);
    award(reward);
    bumpDaily();
    save();
    return true;
  }
  function setLastRoute(route) { if (route && route !== 'dashboard') { state.lastRoute = route; save(); } }
  function dailyInfo() { resetDailyIfNeeded(); return state.daily; }
  function recordQuick(entry) { state.quickRuns.push({ ...entry, ts: Date.now() }); save(); checkAchievements(); emit(); }
  const solveTicket = (id, r) => markOnce('solvedTickets', id, r);
  const solveDiagnostic = (id, r) => markOnce('solvedDiagnostics', id, r);
  const solveLab = (id, r) => markOnce('solvedLabs', id, r);
  const solveTerminal = (id, r) => markOnce('terminalSolved', id, r);
  const completeDaily = (id, r) => markOnce('dailyDone', id, r);
  const solveInterview = (id, r) => markOnce('solvedInterview', id, r);
  const solveSla = (id, r) => markOnce('solvedSla', id, r);
  const solveMonitoring = (id, r) => markOnce('solvedMonitoring', id, r);
  const solveWindows = (id, r) => markOnce('solvedWindows', id, r);
  const solveSurprise = (id, r) => markOnce('solvedSurprise', id, r);
  const solveLog = (id, r) => markOnce('solvedLogs', id, r);
  const solveIncident = (id, r) => markOnce('solvedIncidents', id, r);
  const solveMeeting = (id, r) => markOnce('solvedMeetings', id, r);
  const solveRemote = (id, r) => markOnce('solvedRemote', id, r);

  function handleEmail(id, correct) {
    if (state.emailsHandled.some(e => e.id === id)) return false;
    state.emailsHandled.push({ id, correct });
    save();
    return true;
  }
  function askAi() { state.aiAsked = (state.aiAsked || 0) + 1; save(); checkAchievements(); }

  /* ---- Painel de Impacto: consequências das decisões ---- */
  function applyImpact({ satisfaction = 0, slaOnTime = 0, slaLate = 0, good = false, silent = false }) {
    const c = state.corp;
    c.satisfaction = Math.max(0, Math.min(100, c.satisfaction + satisfaction));
    c.slaOnTime += slaOnTime;
    c.slaLate += slaLate;
    c.decisions++;
    if (good) c.goodDecisions++;
    save();
    if (!silent && satisfaction) {
      const up = satisfaction > 0;
      HDL.ui.toast({
        ico: up ? '😊' : '😟', kind: up ? 'xp' : '',
        title: (up ? '+' : '') + satisfaction + ' satisfação',
        msg: `Satisfação dos usuários: ${c.satisfaction}%`
      }, 2600);
    }
    emit();
  }

  function claimMission(id, reward) {
    if (state.missionsClaimed.includes(id)) return false;
    state.missionsClaimed.push(id);
    award(reward);
    return true;
  }

  function recordDoc(entry) { state.docScores.push({ ...entry, ts: Date.now() }); save(); checkAchievements(); emit(); }
  function recordDaylife(entry) { state.daylifeRuns.push({ ...entry, ts: Date.now() }); save(); checkAchievements(); checkCertifications(); emit(); }
  function daylifeResolvedTotal() { return (state.daylifeRuns || []).reduce((a, r) => a + (r.resolved || 0), 0); }
  function recordPressure(entry) { state.pressureRuns.push({ ...entry, ts: Date.now() }); save(); checkAchievements(); checkCertifications(); emit(); }

  function readArticle(id) {
    if (state.kbRead.includes(id)) return;
    state.kbRead.push(id);
    save(); checkAchievements(); emit();
  }

  /* ---- Conquistas ---- */
  function checkAchievements() {
    const st = levelInfo();
    achievements.forEach(a => {
      if (state.unlockedAchievements.includes(a.id)) return;
      let ok = false;
      try { ok = a.cond(state, st); } catch (e) { ok = false; }
      if (ok) {
        state.unlockedAchievements.push(a.id);
        logActivity({ ico: a.ico, text: `Conquista desbloqueada: ${a.name}` });
        HDL.ui.sound.badge();
        HDL.ui.toast({ kind: 'badge', ico: a.ico, title: 'Conquista desbloqueada!', msg: a.name }, 5200);
      }
    });
    save();
  }

  /* ---- Certificações ---- */
  function checkCertifications() {
    if (!certifications) return;
    const st = levelInfo();
    certifications.forEach(c => {
      if (state.certificates.includes(c.id)) return;
      let ok = false;
      try { ok = c.cond(state, st, analytics()); } catch (e) { ok = false; }
      if (ok) {
        state.certificates.push(c.id);
        logActivity({ ico: '📜', text: `Certificado emitido: ${c.name}` });
        HDL.ui.sound.badge();
        HDL.ui.toast({ kind: 'badge', ico: '📜', title: 'Certificado emitido!', msg: c.name }, 6000);
      }
    });
    save();
  }

  function toggleSound() { state.soundOn = !state.soundOn; save(); emit(); return state.soundOn; }
  function setProfileName(name) {
    state.profile.name = (name || '').trim().slice(0, 28);
    state.profile.onboarded = true;
    save(); emit();
  }
  function displayName() { return (state.profile && state.profile.name) ? state.profile.name : 'Analista'; }
  function reset() {
    const keepProfile = clone(state.profile || DEFAULT.profile);
    state = clone(DEFAULT);
    state.profile = keepProfile; // o reset zera o progresso, não a identidade
    save(); emit();
  }

  return {
    get, computed, levelInfo, subscribe, emit, award,
    solveTicket, solveDiagnostic, solveLab, solveTerminal, completeDaily,
    solveInterview, solveSla, solveMonitoring, solveWindows, solveSurprise,
    solveLog, solveIncident, solveMeeting, solveRemote, handleEmail, askAi,
    applyImpact, claimMission,
    recordAttempt, analytics, recordDoc, recordPressure, recordDaylife, daylifeResolvedTotal,
    setLastRoute, dailyInfo, recordQuick,
    readArticle, checkAchievements, checkCertifications, toggleSound, setProfileName, displayName, reset, save
  };
})();
