import { gameState } from '../state.js';
import { getStoredUsername, logout } from '../api-client.js';
import { triggerCloudSave } from '../api-client.js';
import { getSaveData } from '../storage.js';
import { showToast } from './audio-ui.js';
import { TITLE_DISPLAY } from '../data/game-data.js';

const t = (key) => window.miniappI18n?.t(key) ?? key;

// ═══════════════════════════════════════════
// STATS BAR
// ═══════════════════════════════════════════

export function createStatsBar() {
  const bar = document.createElement('header');
  bar.className = 'sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-white/10 px-4 py-3';
  bar.innerHTML = `
    <div class="flex items-center justify-between max-w-lg mx-auto">
      <button type="button" id="profile-btn" class="flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition active:scale-[0.97]">
        <span class="text-2xl flex-shrink-0">🌱</span>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span id="farm-name-display" class="font-bold text-lg text-white truncate">Pocket Farm</span>
            <span id="title-badge" class="hidden text-xs bg-amber-600/30 text-amber-300 px-1.5 py-0.5 rounded-full font-bold truncate max-w-[80px]"></span>
          </div>
          <span class="flex items-center gap-1.5">
            <span id="level-title" class="text-xs text-purple-400 truncate">Newbie</span>
            <span id="cloud-badge" class="text-[9px] font-bold bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded-full tracking-wider">🟢 ONLINE</span>
          </span>
        </div>
      </button>
      <div class="flex items-center gap-2 text-sm flex-shrink-0">
        <div class="flex items-center gap-1" title="Farmer Tokens"><span class="text-purple-400">🪙</span><span id="stat-tokens" class="font-semibold text-purple-300">0</span></div>
        <div class="flex items-center gap-1" title="Peso"><span class="text-yellow-400 font-bold">₱</span><span id="stat-peso" class="font-semibold text-yellow-300">100</span></div>
      </div>
    </div>
    <div class="flex items-center justify-between max-w-lg mx-auto mt-1">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1" title="${t('app.stats.level')}"><span class="text-purple-400">⭐</span><span id="stat-level" class="font-semibold text-purple-300">1</span></div>
        <div class="flex items-center gap-1" title="${t('app.stats.xp')}"><span class="text-blue-400">✨</span><span id="stat-xp" class="font-semibold text-blue-300">0</span></div>
      </div>
      <div class="flex items-center gap-2">
        <div id="crate-badge" class="hidden items-center gap-1 text-xs bg-orange-900/30 text-orange-300 px-2 py-0.5 rounded-full border border-orange-700/30"><span>🎁</span><span id="stat-crates">0</span></div>
        <div id="ticket-badge" class="hidden items-center gap-1 text-xs bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/30"><span>🎫</span><span id="stat-tickets">0</span></div>
      </div>
    </div>
    <div id="xp-bar-container" class="max-w-lg mx-auto mt-1.5">
      <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div id="xp-bar" class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style="width: 0%"></div></div>
      <div class="flex justify-between text-[10px] text-slate-500 mt-0.5"><span id="xp-current">0 XP</span><span id="xp-next">50 XP</span></div>
    </div>`;

  // Profile popup on click
  bar.querySelector('#profile-btn').addEventListener('click', () => {
    showProfilePopup();
  });

  function update() {
    const { level, xp, peso } = gameState.player;
    bar.querySelector('#stat-level').textContent = level;
    bar.querySelector('#stat-peso').textContent = peso.toLocaleString();
    bar.querySelector('#stat-xp').textContent = xp.toLocaleString();
    bar.querySelector('#farm-name-display').textContent = gameState.getDisplayName();
    bar.querySelector('#level-title').textContent = gameState.getLevelTitle();
    bar.querySelector('#stat-tokens').textContent = gameState.farmerTokens;

    const titleBadge = bar.querySelector('#title-badge');
    const activeTitle = gameState.getActiveTitle();
    if (activeTitle && TITLE_DISPLAY[activeTitle]) {
      titleBadge.textContent = `${TITLE_DISPLAY[activeTitle].emoji} ${TITLE_DISPLAY[activeTitle].name}`;
      titleBadge.classList.remove('hidden');
    } else { titleBadge.classList.add('hidden'); }

    // Cloud badge — always shown (game is online-only)
    const cloudBadge = bar.querySelector('#cloud-badge');
    cloudBadge.classList.remove('hidden');

    const crateBadge = bar.querySelector('#crate-badge');
    const ticketBadge = bar.querySelector('#ticket-badge');
    if (gameState.giftCrates > 0) { crateBadge.classList.remove('hidden'); crateBadge.classList.add('flex'); bar.querySelector('#stat-crates').textContent = gameState.giftCrates; }
    else { crateBadge.classList.add('hidden'); crateBadge.classList.remove('flex'); }
    if (gameState.weatherTickets > 0) { ticketBadge.classList.remove('hidden'); ticketBadge.classList.add('flex'); bar.querySelector('#stat-tickets').textContent = gameState.weatherTickets; }
    else { ticketBadge.classList.add('hidden'); ticketBadge.classList.remove('flex'); }

    const current = gameState.getCurrentLevelXP();
    const next = gameState.getNextLevelXP();
    const xpBar = bar.querySelector('#xp-bar');
    const xpCurrent = bar.querySelector('#xp-current');
    const xpNext = bar.querySelector('#xp-next');
    if (next !== null) {
      const pct = Math.min(100, ((xp - current) / (next - current)) * 100);
      xpBar.style.width = `${pct}%`;
      xpCurrent.textContent = `${xp.toLocaleString()} XP`;
      xpNext.textContent = `${next.toLocaleString()} XP`;
    } else { xpBar.style.width = '100%'; xpCurrent.textContent = 'MAX'; xpNext.textContent = 'MAX'; }
  }

  gameState.subscribe(update);
  update();
  return { element: bar, update };
}

// ═══════════════════════════════════════════
// PROFILE POPUP
// ═══════════════════════════════════════════

function showProfilePopup() {
  const username = getStoredUsername();
  const farmName = gameState.getDisplayName();
  const { level } = gameState.player;
  const title = gameState.getLevelTitle();
  const activeTitle = gameState.getActiveTitle();
  const titleInfo = activeTitle ? TITLE_DISPLAY[activeTitle] : null;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center';
  overlay.innerHTML = `
    <div class="w-full max-w-sm animate-fade-in">
      <div class="bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden safe-bottom">
        <!-- Header -->
        <div class="px-5 pt-5 pb-4 text-center border-b border-white/10">
          <div class="text-5xl mb-2">🌱</div>
          <h2 class="text-xl font-bold text-white">${farmName}</h2>
          ${titleInfo ? `<span class="inline-block mt-1 text-xs bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">${titleInfo.emoji} ${titleInfo.name}</span>` : ''}
          <div class="flex items-center justify-center gap-3 mt-2 text-sm text-slate-400">
            <span>⭐ Level ${level}</span>
            <span class="text-slate-600">·</span>
            <span>${title}</span>
          </div>
        </div>

        <!-- Account Info -->
        <div class="px-5 py-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500">${t('app.profile.account')}</span>
            <span class="text-sm text-white font-medium">${username}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500">${t('app.profile.save')}</span>
            <span class="text-xs font-bold bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">🟢 Online</span>
          </div>
        </div>

        <!-- Rename Farm -->
        <div class="px-5 pb-4">
          <div id="rename-section" class="bg-slate-800/50 border border-white/5 rounded-xl p-3">
            <div id="rename-display" class="flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500">${t('app.profile.farm_name')}</span>
                <div class="text-sm text-white font-medium mt-0.5">${gameState.player.farmName || '—'}</div>
              </div>
              <button type="button" id="rename-btn"
                class="text-xs px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 text-amber-300 rounded-lg font-bold transition active:scale-[0.97]">
                ${t('app.profile.rename')}
              </button>
            </div>
            <div id="rename-form" class="hidden mt-3 space-y-2">
              <input type="text" id="rename-input" maxlength="10"
                class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                placeholder="${t('app.welcome.name_placeholder')}" value="${gameState.player.farmName || ''}">
              <div class="flex items-center justify-between">
                <span id="rename-cost" class="text-xs text-slate-400"></span>
                <div class="flex gap-2">
                  <button type="button" id="rename-cancel"
                    class="text-xs px-3 py-1.5 text-slate-400 hover:text-white transition">${t('app.profile.cancel')}</button>
                  <button type="button" id="rename-confirm"
                    class="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition active:scale-[0.97]">
                    ${t('app.profile.rename_confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-5 pb-5 space-y-2">
          <button type="button" id="logout-btn"
            class="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-xl font-bold text-sm transition active:scale-[0.98]">
            ${t('app.profile.logout')}
          </button>
          <button type="button" id="close-profile"
            class="w-full py-2.5 text-slate-500 hover:text-slate-300 text-xs transition rounded-xl hover:bg-slate-800/50">
            ${t('app.profile.close')}
          </button>
        </div>
      </div>
    </div>`;

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay.querySelector('#close-profile').addEventListener('click', () => overlay.remove());

  // Logout button
  const logoutBtn = overlay.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      overlay.remove();
      window.location.reload();
    });
  }

  // Rename farm logic
  const renameBtn = overlay.querySelector('#rename-btn');
  const renameForm = overlay.querySelector('#rename-form');
  const renameInput = overlay.querySelector('#rename-input');
  const renameCost = overlay.querySelector('#rename-cost');
  const renameCancel = overlay.querySelector('#rename-cancel');
  const renameConfirm = overlay.querySelector('#rename-confirm');

  if (renameBtn && renameForm) {
    const cost = gameState.getRenameCost();
    renameCost.textContent = cost === 0 ? t('app.profile.rename_free') : `₱${cost.toLocaleString()} ${t('app.profile.rename_cost')}`;

    renameBtn.addEventListener('click', () => {
      renameForm.classList.remove('hidden');
      renameBtn.classList.add('hidden');
      renameInput.focus();
      renameInput.select();
    });

    renameCancel.addEventListener('click', () => {
      renameForm.classList.add('hidden');
      renameBtn.classList.remove('hidden');
    });

    renameConfirm.addEventListener('click', async () => {
      const newName = renameInput.value.trim();
      if (!newName) {
        showToast(t('app.profile.rename_empty'), 'error');
        return;
      }
      renameConfirm.disabled = true;
      renameConfirm.textContent = '...';
      const result = await gameState.setFarmName(newName);
      if (!result.success) {
        renameConfirm.disabled = false;
        renameConfirm.textContent = t('app.profile.rename_confirm');
        if (result.reason === 'cost') {
          showToast(t('app.toast.not_enough_peso'), 'error');
        } else {
          showToast(t('app.profile.rename_empty'), 'error');
        }
        return;
      }
      overlay.remove();
      showToast(t('app.toast.farm_named', { name: gameState.getDisplayName() }), 'success');
      // Cloud save after rename — await to ensure it reaches the database
      const saveResult = await triggerCloudSave(getSaveData);
      if (saveResult.ok) {
        showToast(t('app.toast.cloud_saved'), 'success');
      } else {
        showToast(t('app.toast.cloud_error'), 'error');
      }
    });

    // Enter to confirm
    renameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') renameConfirm.click();
    });
  }

  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════
// BOTTOM TAB NAVIGATION
// ═══════════════════════════════════════════

const TABS = [
  { id: 'farm', icon: '🌾', labelKey: 'app.tabs.farm' },
  { id: 'shop', icon: '🏪', labelKey: 'app.tabs.shop' },
  { id: 'market', icon: '💰', labelKey: 'app.tabs.market' },
  { id: 'research', icon: '🔬', labelKey: 'app.tabs.research' },
  { id: 'inventory', icon: '🎒', labelKey: 'app.tabs.inventory' },
  { id: 'objectives', icon: '📋', labelKey: 'app.tabs.progress' },
  { id: 'leaderboard', icon: '🏆', labelKey: 'app.tabs.leaderboard' },
];

export function createTabs(onChange) {
  const nav = document.createElement('nav');
  nav.className = 'fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-white/10 flex justify-around py-2 px-1 z-40 safe-bottom';
  nav.setAttribute('role', 'tablist');
  let active = 'farm';

  for (const tab of TABS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', tab.id === active ? 'true' : 'false');
    btn.className = 'flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg transition text-[9px] min-w-[36px]';
    btn.innerHTML = `<span class="text-lg leading-none">${tab.icon}</span><span class="leading-tight whitespace-nowrap">${t(tab.labelKey)}</span>`;

    btn.addEventListener('click', () => {
      active = tab.id;
      nav.querySelectorAll('button').forEach(b => { b.setAttribute('aria-selected', 'false'); b.classList.remove('text-green-400'); b.classList.add('text-slate-400'); });
      btn.setAttribute('aria-selected', 'true');
      btn.classList.remove('text-slate-400');
      btn.classList.add('text-green-400');
      onChange(tab.id);
    });

    if (tab.id === active) btn.classList.add('text-green-400');
    else btn.classList.add('text-slate-400');
    nav.appendChild(btn);
  }
  return nav;
}
