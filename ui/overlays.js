import { gameState } from '../state.js';
import { LOGIN_CYCLE, MONTHLY_MILESTONES } from '../data/game-data.js';
import { playSound } from './audio-ui.js';
import { showToast } from './audio-ui.js';

const t = (key, values) => window.miniappI18n?.t(key, values) ?? key;

// ═══════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════

export function createSplashScreen(onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[60] flex flex-col items-center justify-center select-none gap-2';
  overlay.style.backgroundColor = '#DC2626';

  const text = document.createElement('h1');
  text.textContent = 'DylVen Corp';
  text.style.fontFamily = "'Bebas Neue', sans-serif";
  text.style.fontSize = 'clamp(2.5rem, 12vw, 5rem)';
  text.style.color = '#000000';
  text.style.letterSpacing = '0.08em';
  text.style.margin = '0';
  text.style.opacity = '0';
  text.style.transform = 'scale(0.9)';
  text.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Developed with Passion by Jonas Sison';
  subtitle.style.fontStyle = 'italic';
  subtitle.style.fontSize = 'clamp(0.75rem, 3vw, 1rem)';
  subtitle.style.color = '#000000';
  subtitle.style.margin = '0';
  subtitle.style.opacity = '0';
  subtitle.style.transition = 'opacity 0.6s ease 0.2s';

  overlay.appendChild(text);
  overlay.appendChild(subtitle);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      text.style.opacity = '1';
      text.style.transform = 'scale(1)';
      subtitle.style.opacity = '1';
    });
  });

  setTimeout(() => {
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.remove(); onComplete(); }, 500);
  }, 2500);
}

// ═══════════════════════════════════════════
// WELCOME SCREEN (Farm Naming)
// ═══════════════════════════════════════════

export function createWelcomeScreen(onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4';

  overlay.innerHTML = `
    <div class="w-full max-w-sm text-center animate-fade-in">
      <div class="text-7xl mb-4">🌱</div>
      <h1 class="text-2xl text-slate-400 mb-1">${t('app.welcome.title')}</h1>
      <h2 class="text-4xl font-bold text-green-400 mb-8">${t('app.welcome.subtitle')}</h2>
      <div class="mb-6">
        <label for="farm-name-input" class="block text-sm text-slate-400 mb-3">${t('app.welcome.name_label')}</label>
        <input type="text" id="farm-name-input" maxlength="10" minlength="2" placeholder="${t('app.welcome.name_placeholder')}" autocomplete="off" class="w-full px-4 py-3.5 bg-slate-800 border border-slate-600 rounded-2xl text-white text-center text-xl font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition">
        <p class="mt-2 text-sm h-5" id="name-preview"></p>
        <p class="mt-1 text-xs text-slate-600" id="name-hint">Minimum 2 characters</p>
      </div>
      <button id="start-btn" class="w-full py-4 bg-green-600 hover:bg-green-500 active:bg-green-400 text-white rounded-2xl text-lg font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed" disabled>🌾 Start Farming</button>
    </div>
  `;

  const input = overlay.querySelector('#farm-name-input');
  const preview = overlay.querySelector('#name-preview');
  const hint = overlay.querySelector('#name-hint');
  const startBtn = overlay.querySelector('#start-btn');

  function updatePreview() {
    const name = input.value.trim();
    if (name.length === 0) {
      preview.textContent = ''; preview.className = 'mt-2 text-sm h-5';
      hint.textContent = 'Minimum 2 characters'; hint.className = 'mt-1 text-xs text-slate-600';
      startBtn.disabled = true;
    } else if (name.length < 2) {
      preview.textContent = `"${name} Farm"`; preview.className = 'mt-2 text-sm h-5 text-slate-500';
      hint.textContent = `${2 - name.length} more character${2 - name.length > 1 ? 's' : ''} needed`; hint.className = 'mt-1 text-xs text-amber-500';
      startBtn.disabled = true;
    } else {
      preview.textContent = `"${name} Farm"`; preview.className = 'mt-2 text-sm h-5 text-green-400';
      hint.textContent = '✓ Looks good!'; hint.className = 'mt-1 text-xs text-green-500';
      startBtn.disabled = false;
    }
  }

  input.addEventListener('input', updatePreview);
  startBtn.addEventListener('click', () => {
    const name = input.value.trim().slice(0, 10);
    if (name.length >= 2) { onComplete(name); overlay.remove(); }
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !startBtn.disabled) startBtn.click(); });
  setTimeout(() => input.focus(), 300);
  return overlay;
}

// ═══════════════════════════════════════════
// TUTORIAL OVERLAY
// ═══════════════════════════════════════════

const TUTORIAL_STEPS = [
  { emoji: '🌱', title: 'Welcome to Pocket Farm!', desc: "Grow Filipino crops, harvest mutations, and build your dream farm. Let's learn the basics!", bg: 'from-green-900/40 to-emerald-900/20' },
  { emoji: '🪴', title: 'Plant Seeds', desc: 'Tap an empty plot to plant seeds. Buy seeds from the Shop tab. Different crops have different grow times and sell prices.', bg: 'from-green-900/40 to-lime-900/20' },
  { emoji: '✨', title: 'Harvest Crops', desc: 'When crops are ready (glowing green), tap to harvest! Harvested crops go to your Inventory. Mutated crops are worth more!', bg: 'from-amber-900/40 to-yellow-900/20' },
  { emoji: '💰', title: 'Sell at Market', desc: 'Sell your harvested crops at the Market for Pesos. Mutated crops have their own premium section with higher prices!', bg: 'from-yellow-900/40 to-orange-900/20' },
  { emoji: '🌧️', title: 'Weather System', desc: 'Weather changes every 2 minutes! Certain weather boosts mutation chances. Some weather blocks planting certain crops.', bg: 'from-blue-900/40 to-cyan-900/20' },
  { emoji: '🧬', title: 'Mutations', desc: 'Ready crops can get mutations during weather changes! Mutated crops sell for much more. Stack rare mutations for huge multipliers!', bg: 'from-purple-900/40 to-pink-900/20' },
  { emoji: '⭐', title: 'Level Up & Research', desc: 'Earn XP from harvesting to unlock new plots and crops. Spend Pesos in Research Lab for permanent upgrades. Happy farming!', bg: 'from-amber-900/40 to-red-900/20' },
];

export function createTutorialOverlay(onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4';
  let currentStep = 0;

  function render() {
    const step = TUTORIAL_STEPS[currentStep];
    const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
    const isLast = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirst = currentStep === 0;

    overlay.innerHTML = `
      <div class="w-full max-w-sm animate-fade-in">
        <div class="h-1 bg-slate-800 rounded-full mb-6 overflow-hidden"><div class="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500" style="width: ${progress}%"></div></div>
        <div class="text-center p-6 rounded-2xl bg-gradient-to-br ${step.bg} border border-white/10">
          <div class="text-6xl mb-4">${step.emoji}</div>
          <h2 class="text-xl font-bold text-white mb-3">${step.title}</h2>
          <p class="text-sm text-slate-300 leading-relaxed">${step.desc}</p>
        </div>
        <div class="flex justify-center gap-2 mt-5 mb-6">${TUTORIAL_STEPS.map((_, i) => `<div class="w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-green-400 w-6' : i < currentStep ? 'bg-green-600' : 'bg-slate-700'}"></div>`).join('')}</div>
        <div class="flex gap-3">
          ${!isFirst ? `<button class="tutorial-prev flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition active:scale-95">← Back</button>` : ''}
          <button class="tutorial-next flex-1 py-3 rounded-xl ${isLast ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-700 hover:bg-slate-600'} text-white font-bold transition active:scale-95">${isLast ? '🌾 Start Farming!' : 'Next →'}</button>
        </div>
        ${!isLast ? `<button class="tutorial-skip w-full mt-3 py-2 text-xs text-slate-600 hover:text-slate-400 transition">Skip Tutorial</button>` : ''}
      </div>
    `;

    const prevBtn = overlay.querySelector('.tutorial-prev');
    const nextBtn = overlay.querySelector('.tutorial-next');
    const skipBtn = overlay.querySelector('.tutorial-skip');
    if (prevBtn) prevBtn.onclick = () => { currentStep--; render(); };
    if (nextBtn) nextBtn.onclick = () => { if (isLast) close(); else { currentStep++; render(); } };
    if (skipBtn) skipBtn.onclick = () => close();
  }

  function close() {
    overlay.classList.add('animate-fade-out');
    setTimeout(() => { overlay.remove(); if (onClose) onClose(); }, 300);
  }

  render();
  return overlay;
}

// ═══════════════════════════════════════════
// UPDATE NOTES OVERLAY
// ═══════════════════════════════════════════

const UPDATE_VERSION = 'v2.1';

const UPDATE_ITEMS = [
  { emoji: '❤️', title: 'Favorite Your Plots', desc: "Tap the heart on any plot to protect it from accidental harvesting! Favorited plots are locked until you unfavorite them.", bg: 'from-pink-900/40 to-rose-900/20' },
  { emoji: '👆', title: 'Tap to Harvest', desc: 'Ready crops are now harvested with a simple tap — no more buttons! Just tap a glowing plot to harvest it instantly.', bg: 'from-green-900/40 to-emerald-900/20' },
  { emoji: '🌧️', title: 'Weather Visual Effects', desc: 'Watch rain, snow, fog, cherry blossoms, shooting stars, aurora borealis & thunder sweep across your farm!', bg: 'from-blue-900/40 to-cyan-900/20' },
  { emoji: '🌡️', title: 'Weather Affects Farming', desc: 'Snow blocks advanced crops from being planted. Each weather type boosts specific mutation chances.', bg: 'from-sky-900/40 to-indigo-900/20' },
  { emoji: '🧬', title: 'Mutation Badges on Crops', desc: 'Mutated crops now glow and show their multiplier directly on your farm plots.', bg: 'from-purple-900/40 to-pink-900/20' },
  { emoji: '💎', title: 'Premium Mutated Market', desc: 'Mutated crops sell in their own premium section at the Market with higher prices.', bg: 'from-amber-900/40 to-orange-900/20' },
  { emoji: '📅', title: '7-Day Daily Rewards', desc: "Log in every day to claim rewards! See all 7 days in advance. Build a streak for bigger bonuses.", bg: 'from-yellow-900/40 to-amber-900/20' },
  { emoji: '📊', title: 'Level Rewards & XP Bar', desc: 'Every level milestone now rewards you with bonus seeds! Track your XP progress.', bg: 'from-emerald-900/40 to-green-900/20' },
  { emoji: '🏆', title: 'Achievements & Titles', desc: 'Unlock 20+ achievements across Farming, Money, Mutations, Weather, Collection & Level categories.', bg: 'from-rose-900/40 to-red-900/20' },
  { emoji: '🎓', title: 'New Player Tutorial', desc: "A step-by-step guide now teaches new farmers the basics. Skip it if you're already a pro!", bg: 'from-teal-900/40 to-emerald-900/20' },
];

export function createUpdateNotesOverlay(onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4';
  let currentStep = 0;

  function render() {
    const item = UPDATE_ITEMS[currentStep];
    const progress = ((currentStep + 1) / UPDATE_ITEMS.length) * 100;
    const isLast = currentStep === UPDATE_ITEMS.length - 1;
    const isFirst = currentStep === 0;

    overlay.innerHTML = `
      <div class="w-full max-w-sm animate-fade-in">
        <div class="text-center mb-4"><div class="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-500/30 rounded-full px-3 py-1 mb-2"><span class="text-xs font-bold text-amber-300">🆕 WHAT'S NEW</span><span class="text-xs text-amber-500">${UPDATE_VERSION}</span></div></div>
        <div class="h-1 bg-slate-800 rounded-full mb-5 overflow-hidden"><div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" style="width: ${progress}%"></div></div>
        <div class="text-center p-6 rounded-2xl bg-gradient-to-br ${item.bg} border border-white/10">
          <div class="text-6xl mb-4">${item.emoji}</div>
          <h2 class="text-xl font-bold text-white mb-3">${item.title}</h2>
          <p class="text-sm text-slate-300 leading-relaxed">${item.desc}</p>
        </div>
        <div class="flex justify-center gap-2 mt-5 mb-6">${UPDATE_ITEMS.map((_, i) => `<div class="w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-amber-400 w-6' : i < currentStep ? 'bg-amber-600' : 'bg-slate-700'}"></div>`).join('')}</div>
        <p class="text-center text-xs text-slate-600 mb-4">${currentStep + 1} of ${UPDATE_ITEMS.length}</p>
        <div class="flex gap-3">
          ${!isFirst ? `<button class="update-prev flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition active:scale-95">← Back</button>` : ''}
          <button class="update-next flex-1 py-3 rounded-xl ${isLast ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'} text-white font-bold transition active:scale-95">${isLast ? "🌾 Let's Farm!" : 'Next →'}</button>
        </div>
        ${!isLast ? `<button class="update-skip w-full mt-3 py-2 text-xs text-slate-600 hover:text-slate-400 transition">Skip</button>` : ''}
      </div>
    `;

    const prevBtn = overlay.querySelector('.update-prev');
    const nextBtn = overlay.querySelector('.update-next');
    const skipBtn = overlay.querySelector('.update-skip');
    if (prevBtn) prevBtn.onclick = () => { currentStep--; render(); };
    if (nextBtn) nextBtn.onclick = () => { if (isLast) close(); else { currentStep++; render(); } };
    if (skipBtn) skipBtn.onclick = () => close();
  }

  function close() {
    overlay.classList.add('animate-fade-out');
    setTimeout(() => { overlay.remove(); if (onClose) onClose(); }, 300);
  }

  render();
  return overlay;
}

export async function hasSeenUpdateNotes() {
  try {
    const seen = await window.miniappsAI?.storage?.getItem('seenUpdateNotes');
    return seen === UPDATE_VERSION;
  } catch { return localStorage.getItem('seenUpdateNotes') === UPDATE_VERSION; }
}

export async function markUpdateNotesSeen() {
  try {
    await window.miniappsAI?.storage?.setItem('seenUpdateNotes', UPDATE_VERSION);
  } catch { localStorage.setItem('seenUpdateNotes', UPDATE_VERSION); }
}

// ═══════════════════════════════════════════
// LOGIN REWARD POPUP
// ═══════════════════════════════════════════

export function showLoginRewardPopup() {
  const reward = gameState.pendingLoginReward;
  if (!reward) return;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';

  const card = document.createElement('div');
  card.className = 'bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-md shadow-2xl animate-fade-in overflow-hidden';

  const { daily, monthly } = reward;
  const streak = gameState.loginRewards.streak;

  const headerHTML = `
    <div class="bg-gradient-to-br from-amber-600/30 to-yellow-600/10 p-5 text-center border-b border-slate-700">
      <div class="text-5xl mb-2">🎁</div>
      <h2 class="text-xl font-bold text-amber-300">Daily Rewards</h2>
      <p class="text-xs text-slate-400 mt-1">Day ${streak} Login Streak 🔥</p>
    </div>
  `;

  let rewardsGrid = '<div class="grid grid-cols-7 gap-1.5 px-4 pt-4">';
  for (let d = 1; d <= 7; d++) {
    const cycle = LOGIN_CYCLE.find(l => l.day === d);
    if (!cycle) continue;
    const isPast = d < streak, isCurrent = d === streak;
    rewardsGrid += `
      <div class="flex flex-col items-center rounded-xl py-2 px-1 text-center transition-all ${isCurrent ? 'bg-amber-600/40 border-2 border-amber-400 shadow-lg shadow-amber-600/20' : isPast ? 'bg-slate-800/60 border border-slate-700 opacity-60' : 'bg-slate-800/40 border border-slate-700'}">
        <span class="text-[10px] font-bold ${isCurrent ? 'text-amber-300' : isPast ? 'text-slate-600' : 'text-slate-500'}">Day ${d}</span>
        <span class="text-lg my-1 ${isPast ? 'grayscale' : ''}">${cycle.emoji}</span>
        <span class="text-[9px] ${isCurrent ? 'text-amber-200 font-bold' : isPast ? 'text-slate-600' : 'text-slate-500'} leading-tight">${cycle.label.replace(/[₱×]/g, '').trim().slice(0, 8)}</span>
        ${isPast ? '<span class="text-[8px] text-emerald-500 mt-0.5">✓</span>' : ''}
        ${isCurrent ? '<span class="text-[8px] text-amber-400 mt-0.5 animate-pulse">▲</span>' : ''}
      </div>`;
  }
  rewardsGrid += '</div>';

  const todayReward = `
    <div class="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-amber-600/30">
      <div class="flex items-center gap-4">
        <div class="text-4xl">${daily.emoji}</div>
        <div class="flex-1"><p class="text-xs text-amber-500 font-semibold uppercase tracking-wider">Today's Reward</p><p class="text-lg font-bold text-amber-200">${daily.label}</p></div>
      </div>
    </div>`;

  let monthlyHTML = '';
  if (monthly) {
    monthlyHTML = `
      <div class="mx-4 mt-3 p-3 rounded-2xl bg-purple-900/20 border border-purple-600/30">
        <div class="flex items-center gap-3">
          <div class="text-3xl">${monthly.emoji}</div>
          <div class="flex-1"><p class="text-xs text-purple-400 font-semibold">🌟 Monthly Milestone!</p><p class="text-sm font-bold text-purple-200">${monthly.label}</p></div>
        </div>
      </div>`;
  }

  let milestonesHTML = '<div class="mx-4 mt-3 flex gap-2">';
  for (const ms of MONTHLY_MILESTONES) {
    const claimed = gameState.loginRewards.monthlyClaimed[ms.days];
    const reached = gameState.loginRewards.totalLoginDays >= ms.days;
    milestonesHTML += `
      <div class="flex-1 text-center py-2 rounded-lg text-[9px] ${claimed ? 'bg-emerald-900/30 border border-emerald-700/30 text-emerald-400' : reached ? 'bg-amber-900/20 border border-amber-700/30 text-amber-400' : 'bg-slate-800/40 border border-slate-700 text-slate-600'}">
        <span class="block text-base">${ms.emoji}</span><span class="block">${ms.days}d</span>
        ${claimed ? '<span class="block text-emerald-500">✓</span>' : ''}
      </div>`;
  }
  milestonesHTML += '</div>';

  card.innerHTML = headerHTML + rewardsGrid + todayReward + monthlyHTML + milestonesHTML;

  const btnWrap = document.createElement('div');
  btnWrap.className = 'p-4';
  const claimBtn = document.createElement('button');
  claimBtn.className = 'w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-amber-600/20';
  claimBtn.textContent = '✨ Claim Rewards';
  claimBtn.onclick = () => {
    const res = gameState.claimLoginReward();
    if (res.success) {
      playSound('levelup');
      const msgs = [`${daily.emoji} ${daily.label}`];
      if (monthly) msgs.push(`${monthly.emoji} ${monthly.label}`);
      showToast(msgs.join(' + '), 'gold');
    }
    overlay.classList.add('animate-fade-out');
    setTimeout(() => overlay.remove(), 300);
  };
  btnWrap.appendChild(claimBtn);
  card.appendChild(btnWrap);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}
