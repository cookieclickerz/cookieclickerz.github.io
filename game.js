// ============================================
// COOKIE CLICKER GAME ENGINE – CookieClickerz
// ============================================

const Game = (() => {
  // ---- STATE ----
  let state = {
    cookies: 0,
    totalEver: 0,
    cpc: 1,          // cookies per click
    cpsBase: 0,      // cookies per second from buildings
    cpsMultiplier: 1,
    buildings: {},
    upgrades: {},
    achievements: {},
    goldenCooldown: 0,
    frenzyActive: false,
    frenzyMultiplier: 1,
    frenzyEnd: 0,
    lastSave: Date.now(),
    lastTick: Date.now(),
  };

  // ---- BUILDING DEFINITIONS ----
  const BUILDINGS = [
    { id: 'cursor',    name: 'Cursor',      emoji: '🖱️', baseCost: 15,      baseCps: 0.1,   desc: 'Auto-clicks the cookie for you.' },
    { id: 'grandma',   name: 'Grandma',     emoji: '👵', baseCost: 100,     baseCps: 1,     desc: 'A kind old lady who bakes cookies.' },
    { id: 'farm',      name: 'Farm',        emoji: '🌾', baseCost: 1100,    baseCps: 8,     desc: 'Grows cookie plants in vast fields.' },
    { id: 'mine',      name: 'Mine',        emoji: '⛏️', baseCost: 12000,   baseCps: 47,    desc: 'Digs for cookie dough and chips.' },
    { id: 'factory',   name: 'Factory',     emoji: '🏭', baseCost: 130000,  baseCps: 260,   desc: 'Mass-produces cookies industrially.' },
    { id: 'bank',      name: 'Bank',        emoji: '🏦', baseCost: 1.4e6,   baseCps: 1400,  desc: 'Generates cookie revenue.' },
    { id: 'temple',    name: 'Temple',      emoji: '🛕', baseCost: 2e7,     baseCps: 7600,  desc: 'Prays to ancient cookie gods.' },
    { id: 'wizard',    name: 'Wizard Tower',emoji: '🧙', baseCost: 3.3e8,   baseCps: 44000, desc: 'Conjures cookies with magic.' },
    { id: 'shipment',  name: 'Shipment',    emoji: '🚀', baseCost: 5.1e9,   baseCps: 260000,desc: 'Imports cookies from distant planets.' },
    { id: 'lab',       name: 'Alchemy Lab', emoji: '🧪', baseCost: 7.5e10,  baseCps: 1.6e6, desc: 'Transmutes matter into cookies.' },
    { id: 'portal',    name: 'Portal',      emoji: '🌀', baseCost: 1e12,    baseCps: 1e7,   desc: 'Opens a rift to the cookieverse.' },
    { id: 'timemachine',name:'Time Machine', emoji: '⏰', baseCost: 1.4e13,  baseCps: 6.5e7, desc: 'Brings cookies from the future.' },
    { id: 'condenser', name: 'Antimatter',  emoji: '⚛️', baseCost: 1.7e14,  baseCps: 4.3e8, desc: 'Condenses antimatter into cookies.' },
    { id: 'prism',     name: 'Prism',       emoji: '🌈', baseCost: 2.1e15,  baseCps: 2.9e9, desc: 'Turns light into delicious cookies.' },
  ];

  // ---- UPGRADE DEFINITIONS ----
  const UPGRADES = [
    { id: 'u1',  name: 'Reinforced Index Finger', emoji: '👆', cost: 100,    desc: 'Doubles clicking power.', type: 'click', mult: 2, req: () => state.totalEver >= 15 },
    { id: 'u2',  name: 'Carpal Tunnel Prevention', emoji: '🖐️', cost: 500,   desc: 'Clicks give +1 cookie.', type: 'clickFlat', bonus: 1, req: () => state.totalEver >= 100 },
    { id: 'u3',  name: 'Forwards from Grandma', emoji: '👵', cost: 1000,     desc: 'Grandmas bake 2× faster.', type: 'building', building: 'grandma', mult: 2, req: () => (state.buildings['grandma']?.count || 0) >= 1 },
    { id: 'u4',  name: 'Steel-plated Rolling Pin', emoji: '🎳', cost: 5000,  desc: 'Grandmas bake 2× faster.', type: 'building', building: 'grandma', mult: 2, req: () => (state.buildings['grandma']?.count || 0) >= 5 },
    { id: 'u5',  name: 'Cheap Hoes', emoji: '⛏️', cost: 11000,              desc: 'Farms 2× more productive.', type: 'building', building: 'farm', mult: 2, req: () => (state.buildings['farm']?.count || 0) >= 1 },
    { id: 'u6',  name: 'Fertilizer', emoji: '🌱', cost: 55000,              desc: 'Farms 2× more productive.', type: 'building', building: 'farm', mult: 2, req: () => (state.buildings['farm']?.count || 0) >= 5 },
    { id: 'u7',  name: 'Cookie Trees', emoji: '🌳', cost: 275000,           desc: 'Farms 2× more productive.', type: 'building', building: 'farm', mult: 2, req: () => (state.buildings['farm']?.count || 0) >= 25 },
    { id: 'u8',  name: 'Sugar Gas', emoji: '⛽', cost: 1.3e5,               desc: 'Mines 2× more productive.', type: 'building', building: 'mine', mult: 2, req: () => (state.buildings['mine']?.count || 0) >= 1 },
    { id: 'u9',  name: 'Megadrill', emoji: '🔩', cost: 6.5e5,               desc: 'Mines 2× more productive.', type: 'building', building: 'mine', mult: 2, req: () => (state.buildings['mine']?.count || 0) >= 5 },
    { id: 'u10', name: 'Sturdier Conveyor Belts', emoji: '🏭', cost: 1.3e6, desc: 'Factories 2× more productive.', type: 'building', building: 'factory', mult: 2, req: () => (state.buildings['factory']?.count || 0) >= 1 },
    { id: 'u11', name: 'Child Labor', emoji: '👶', cost: 6.5e6,             desc: 'Factories 2× more productive.', type: 'building', building: 'factory', mult: 2, req: () => (state.buildings['factory']?.count || 0) >= 5 },
    { id: 'u12', name: 'Cookie Turret', emoji: '🔫', cost: 1e7,             desc: 'Doubles clicking power.', type: 'click', mult: 2, req: () => state.totalEver >= 1e6 },
    { id: 'u13', name: 'Trillion Fingers', emoji: '🖐️', cost: 5e7,          desc: 'Clicks give 20 cookies.', type: 'clickFlat', bonus: 20, req: () => state.totalEver >= 5e6 },
    { id: 'u14', name: 'Chocolate Eggs', emoji: '🥚', cost: 5e8,            desc: 'Triples clicking power!', type: 'click', mult: 3, req: () => state.totalEver >= 1e8 },
    { id: 'u15', name: 'Cookie Cloning Machine', emoji: '🔬', cost: 1e9,    desc: 'All buildings 1.5× productive.', type: 'global', mult: 1.5, req: () => state.totalEver >= 5e8 },
    { id: 'u16', name: 'Elder Covenant', emoji: '📜', cost: 5e9,            desc: 'Grandmas 5× more productive.', type: 'building', building: 'grandma', mult: 5, req: () => (state.buildings['grandma']?.count || 0) >= 50 },
    { id: 'u17', name: 'Quantum Baking', emoji: '⚛️', cost: 1e10,           desc: 'All buildings 2× productive.', type: 'global', mult: 2, req: () => state.totalEver >= 1e9 },
    { id: 'u18', name: 'Time Warp', emoji: '⏰', cost: 1e11,                desc: 'Time machines 3× productive.', type: 'building', building: 'timemachine', mult: 3, req: () => (state.buildings['timemachine']?.count || 0) >= 1 },
    { id: 'u19', name: 'Cookie God Mode', emoji: '👑', cost: 1e12,          desc: 'Clicks give 500 cookies.', type: 'clickFlat', bonus: 500, req: () => state.totalEver >= 1e11 },
    { id: 'u20', name: 'Infinite Cookies', emoji: '♾️', cost: 1e13,         desc: 'All production 3× multiplied.', type: 'global', mult: 3, req: () => state.totalEver >= 1e12 },
  ];

  // ---- ACHIEVEMENTS ----
  const ACHIEVEMENTS = [
    { id: 'a1',  name: 'First Cookie', emoji: '🍪', desc: 'Bake your very first cookie.', check: () => state.totalEver >= 1 },
    { id: 'a2',  name: 'Getting Started', emoji: '🌱', desc: 'Bake 100 cookies.', check: () => state.totalEver >= 100 },
    { id: 'a3',  name: 'Awakening', emoji: '⚡', desc: 'Bake 1,000 cookies.', check: () => state.totalEver >= 1000 },
    { id: 'a4',  name: 'Cookie Monster', emoji: '👾', desc: 'Bake 10,000 cookies.', check: () => state.totalEver >= 10000 },
    { id: 'a5',  name: 'Rookie Baker', emoji: '👨‍🍳', desc: 'Bake 100K cookies.', check: () => state.totalEver >= 100000 },
    { id: 'a6',  name: 'Cookie Millionaire', emoji: '💰', desc: 'Bake 1 million cookies.', check: () => state.totalEver >= 1e6 },
    { id: 'a7',  name: 'Cookie Billionaire', emoji: '🤑', desc: 'Bake 1 billion cookies.', check: () => state.totalEver >= 1e9 },
    { id: 'a8',  name: 'Cookie Trillionaire', emoji: '🌌', desc: 'Bake 1 trillion cookies.', check: () => state.totalEver >= 1e12 },
    { id: 'a9',  name: 'First Employee', emoji: '👵', desc: 'Hire your first Grandma.', check: () => (state.buildings['grandma']?.count || 0) >= 1 },
    { id: 'a10', name: 'Factory Owner', emoji: '🏭', desc: 'Build your first Factory.', check: () => (state.buildings['factory']?.count || 0) >= 1 },
    { id: 'a11', name: 'Space Importer', emoji: '🚀', desc: 'Launch your first Shipment.', check: () => (state.buildings['shipment']?.count || 0) >= 1 },
    { id: 'a12', name: 'Time Traveler', emoji: '⏰', desc: 'Build a Time Machine.', check: () => (state.buildings['timemachine']?.count || 0) >= 1 },
    { id: 'a13', name: 'Golden Touch', emoji: '✨', desc: 'Click a Golden Cookie.', check: () => state.goldenClicks >= 1 },
    { id: 'a14', name: 'Speed Clicker', emoji: '🏃', desc: 'Reach 10 CPS from buildings.', check: () => calcCPS() >= 10 },
    { id: 'a15', name: 'Cookie Factory Boss', emoji: '👑', desc: 'Have 10+ of every building.', check: () => BUILDINGS.slice(0, 5).every(b => (state.buildings[b.id]?.count || 0) >= 10) },
    { id: 'a16', name: 'Upgrade Junkie', emoji: '⚗️', desc: 'Purchase 5 upgrades.', check: () => Object.values(state.upgrades).filter(v => v).length >= 5 },
  ];

  state.goldenClicks = 0;

  // ---- HELPERS ----
  function fmtNum(n) {
    if (n < 1000) return Math.floor(n).toLocaleString();
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'De'];
    let i = 0;
    while (n >= 1000 && i < suffixes.length - 1) { n /= 1000; i++; }
    return n.toFixed(i > 0 ? 2 : 0) + suffixes[i];
  }

  function getBuildingCost(b, count) {
    return Math.ceil(b.baseCost * Math.pow(1.15, count || 0));
  }

  function calcCPS() {
    let total = 0;
    BUILDINGS.forEach(b => {
      const count = state.buildings[b.id]?.count || 0;
      if (count === 0) return;
      let cps = b.baseCps * count;
      // Apply building upgrades
      UPGRADES.forEach(u => {
        if (state.upgrades[u.id] && u.type === 'building' && u.building === b.id) {
          cps *= u.mult;
        }
      });
      total += cps;
    });
    // Apply global upgrades
    UPGRADES.forEach(u => {
      if (state.upgrades[u.id] && u.type === 'global') {
        total *= u.mult;
      }
    });
    return total * state.cpsMultiplier;
  }

  function calcCPC() {
    let cpc = 1;
    UPGRADES.forEach(u => {
      if (!state.upgrades[u.id]) return;
      if (u.type === 'click') cpc *= u.mult;
      if (u.type === 'clickFlat') cpc += u.bonus;
    });
    return cpc;
  }

  // ---- RENDER ----
  function renderStats() {
    document.getElementById('cookie-count').textContent = fmtNum(state.cookies);
    document.getElementById('cps-display').textContent = fmtNum(calcCPS()) + '/s';
    document.getElementById('cpc-display').textContent = fmtNum(calcCPC());
    document.getElementById('total-all-time').textContent = `Total baked: ${fmtNum(state.totalEver)} cookies`;
    updateMilestone();
  }

  function updateMilestone() {
    const milestones = [
      [1e15, '🌌 Cookie God! Unimaginable power!'],
      [1e12, '♾️ Trillions baked! You are legendary!'],
      [1e9,  '🚀 A Billion cookies! Unstoppable!'],
      [1e6,  '💰 Cookie Millionaire! The empire rises!'],
      [1e5,  '🏆 100K cookies! You are a true baker!'],
      [1e4,  '⚡ 10,000 cookies! The factory hums!'],
      [1000, '🎉 1,000 cookies! Keep clicking!'],
      [100,  '🌱 Growing fast! Buy a Grandma!'],
      [10,   '👍 Nice start! Keep baking!'],
      [0,    '🍪 Click the cookie to begin your journey!'],
    ];
    for (const [threshold, msg] of milestones) {
      if (state.totalEver >= threshold) {
        document.getElementById('milestone-text').textContent = msg;
        return;
      }
    }
  }

  function renderUpgrades() {
    const list = document.getElementById('upgrades-list');
    list.innerHTML = '';
    UPGRADES.forEach(u => {
      const purchased = state.upgrades[u.id];
      const available = u.req();
      const canAfford = state.cookies >= u.cost;

      const div = document.createElement('div');
      div.className = `upgrade-item${purchased ? ' purchased' : ''}${!available && !purchased ? ' locked' : ''}`;
      div.innerHTML = `
        <span class="upgrade-name">${u.emoji} ${u.name}</span>
        <span class="upgrade-cost">${purchased ? '✅ Purchased' : fmtNum(u.cost) + ' 🍪'}</span>
        <span class="upgrade-desc">${u.desc}</span>
      `;
      if (!purchased && available) {
        div.addEventListener('click', () => buyUpgrade(u.id));
        if (!canAfford) div.style.opacity = '0.6';
      }
      list.appendChild(div);
    });
  }

  function renderBuildings() {
    const list = document.getElementById('buildings-list');
    list.innerHTML = '';
    BUILDINGS.forEach(b => {
      const count = state.buildings[b.id]?.count || 0;
      const cost = getBuildingCost(b, count);
      const canAfford = state.cookies >= cost;
      const cps = b.baseCps * count;

      const div = document.createElement('div');
      div.className = `building-item${!canAfford ? ' too-expensive' : ''}`;
      div.innerHTML = `
        <span class="building-emoji">${b.emoji}</span>
        <div class="building-info">
          <span class="building-name">${b.name}</span>
          <span class="building-cps-text">${count > 0 ? fmtNum(cps) + '/s' : b.desc.substring(0, 28) + '…'}</span>
          <span class="building-cost-text">${fmtNum(cost)} 🍪</span>
        </div>
        <span class="building-count">${count}</span>
      `;
      div.addEventListener('click', () => buyBuilding(b.id));
      list.appendChild(div);
    });
  }

  function renderAchievements() {
    const grid = document.getElementById('achievements-display');
    if (!grid) return;
    grid.innerHTML = '';
    ACHIEVEMENTS.forEach(a => {
      const earned = state.achievements[a.id];
      const div = document.createElement('div');
      div.className = `ach-card${earned ? ' earned' : ''}`;
      div.innerHTML = `
        <span class="ach-icon">${earned ? a.emoji : '🔒'}</span>
        <div class="ach-name">${earned ? a.name : '???'}</div>
        <div class="ach-desc">${earned ? a.desc : 'Keep baking to unlock!'}</div>
      `;
      grid.appendChild(div);
    });
  }

  // ---- ACTIONS ----
  function clickCookie(e) {
    const cpc = calcCPC();
    const actual = state.frenzyActive && state.frenzyMultiplier > 10 ? cpc * 777 : cpc;
    state.cookies += actual;
    state.totalEver += actual;

    // Float text
    spawnClickFloat(e, '+' + fmtNum(actual));

    // Ripple
    const ripple = document.getElementById('click-ripple');
    ripple.classList.remove('animate');
    void ripple.offsetWidth;
    ripple.classList.add('animate');

    renderStats();
    renderBuildings();
    checkAchievements();
  }

  function spawnClickFloat(e, text) {
    const wrapper = document.getElementById('cookie-wrapper');
    const rect = wrapper.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'click-float';
    el.textContent = text;
    const x = (e ? e.clientX - rect.left : 120) + (Math.random() * 40 - 20);
    const y = (e ? e.clientY - rect.top : 120);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    wrapper.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function buyBuilding(id) {
    const b = BUILDINGS.find(x => x.id === id);
    if (!b) return;
    const count = state.buildings[id]?.count || 0;
    const cost = getBuildingCost(b, count);
    if (state.cookies < cost) return;
    state.cookies -= cost;
    state.buildings[id] = { count: count + 1 };
    renderStats();
    renderBuildings();
    renderUpgrades();
    checkAchievements();
    saveGame();
  }

  function buyUpgrade(id) {
    const u = UPGRADES.find(x => x.id === id);
    if (!u || state.upgrades[id]) return;
    if (state.cookies < u.cost) return;
    state.cookies -= u.cost;
    state.upgrades[id] = true;
    renderStats();
    renderBuildings();
    renderUpgrades();
    saveGame();
  }

  // ---- GOLDEN COOKIE ----
  function triggerGoldenCookie() {
    const bonuses = [
      { msg: '🍪 Cookie Frenzy!', sub: '7× production for 77 seconds!', fn: () => startFrenzy(7, 77) },
      { msg: '✨ Click Frenzy!', sub: '777× clicks for 30 seconds!', fn: () => startFrenzy(777, 30, true) },
      { msg: '🎁 Lucky!', sub: `+${fmtNum(calcCPS() * 15)} instant cookies!`, fn: () => { const bonus = Math.max(calcCPS() * 15, 13); state.cookies += bonus; state.totalEver += bonus; } },
      { msg: '💰 Jackpot!', sub: `+${fmtNum(state.cookies * 0.1)} bonus cookies!`, fn: () => { const bonus = state.cookies * 0.1 + 100; state.cookies += bonus; state.totalEver += bonus; } },
      { msg: '🚀 Building Rush!', sub: '2× production for 60 seconds!', fn: () => startFrenzy(2, 60) },
    ];
    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
    document.getElementById('golden-cookie-msg').textContent = bonus.msg;
    document.getElementById('golden-cookie-sub').textContent = bonus.sub;
    const overlay = document.getElementById('golden-cookie-overlay');
    overlay.classList.remove('hidden');
    bonus.fn();
    renderStats();
    state.goldenClicks = (state.goldenClicks || 0) + 1;
    checkAchievements();
    setTimeout(() => overlay.classList.add('hidden'), 2200);
  }

  function startFrenzy(mult, seconds, isClick = false) {
    state.frenzyActive = true;
    state.frenzyMultiplier = mult;
    state.frenzyEnd = Date.now() + seconds * 1000;
    if (!isClick) {
      state.cpsMultiplier = mult;
    }
    const btn = document.getElementById('golden-cookie-btn');
    btn.textContent = `⏳ Frenzy! ${seconds}s`;
    setTimeout(() => {
      state.frenzyActive = false;
      state.frenzyMultiplier = 1;
      state.cpsMultiplier = 1;
      btn.textContent = '✨ Golden Cookie';
    }, seconds * 1000);
  }

  // ---- ACHIEVEMENTS ----
  function checkAchievements() {
    let newOne = false;
    ACHIEVEMENTS.forEach(a => {
      if (!state.achievements[a.id] && a.check()) {
        state.achievements[a.id] = true;
        showAchievementToast(a);
        newOne = true;
      }
    });
    if (newOne) renderAchievements();
  }

  function showAchievementToast(a) {
    const toast = document.getElementById('achievement-toast');
    document.getElementById('toast-title').textContent = 'Achievement Unlocked!';
    document.getElementById('toast-desc').textContent = `${a.emoji} ${a.name}`;
    toast.classList.remove('hidden');
    toast.style.animation = 'none';
    void toast.offsetWidth;
    toast.style.animation = '';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
  }

  // ---- AUTO-SAVE & TICK ----
  function saveGame() {
    localStorage.setItem('ccz_save', JSON.stringify(state));
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('ccz_save');
      if (!raw) return;
      const saved = JSON.parse(raw);
      // Offline progress
      const offlineSeconds = (Date.now() - (saved.lastTick || Date.now())) / 1000;
      Object.assign(state, saved);
      state.lastTick = Date.now();
      state.frenzyActive = false;
      state.frenzyMultiplier = 1;
      state.cpsMultiplier = 1;
      if (offlineSeconds > 5) {
        const offlineCookies = calcCPS() * Math.min(offlineSeconds, 3600 * 8);
        if (offlineCookies > 0) {
          state.cookies += offlineCookies;
          state.totalEver += offlineCookies;
          setTimeout(() => showOfflineBonus(offlineCookies), 800);
        }
      }
    } catch (e) { /* ignore */ }
  }

  function showOfflineBonus(amount) {
    const overlay = document.getElementById('golden-cookie-overlay');
    document.getElementById('golden-cookie-msg').textContent = '😴 Welcome Back!';
    document.getElementById('golden-cookie-sub').textContent = `Your empire baked ${fmtNum(amount)} cookies while you were away!`;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), 2800);
  }

  function gameLoop() {
    const now = Date.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;

    const earned = calcCPS() * dt;
    state.cookies += earned;
    state.totalEver += earned;

    renderStats();

    // Auto-save every 30s
    if (now - state.lastSave > 30000) {
      saveGame();
      state.lastSave = now;
    }

    // Re-render buildings every 2s
    if (!gameLoop._renderTick) gameLoop._renderTick = 0;
    gameLoop._renderTick += dt;
    if (gameLoop._renderTick > 2) {
      gameLoop._renderTick = 0;
      renderBuildings();
      renderUpgrades();
      checkAchievements();
    }

    requestAnimationFrame(gameLoop);
  }

  // ---- BACKGROUND PARTICLES ---- 
  function spawnParticle() {
    const container = document.getElementById('cookie-particles');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'particle';
    el.textContent = ['🍪', '✨', '🍫', '🍬', '⭐'][Math.floor(Math.random() * 5)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (8 + Math.random() * 12) + 's';
    el.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
    container.appendChild(el);
    setTimeout(() => el.remove(), 20000);
  }

  // ---- RESET ----
  function resetGame() {
    if (!confirm('Are you sure you want to reset all your progress? This cannot be undone! 🍪')) return;
    localStorage.removeItem('ccz_save');
    state = {
      cookies: 0, totalEver: 0, cpc: 1, cpsBase: 0, cpsMultiplier: 1,
      buildings: {}, upgrades: {}, achievements: {}, goldenCooldown: 0,
      frenzyActive: false, frenzyMultiplier: 1, frenzyEnd: 0,
      lastSave: Date.now(), lastTick: Date.now(), goldenClicks: 0,
    };
    renderStats();
    renderBuildings();
    renderUpgrades();
    renderAchievements();
  }

  // ---- FAQ TOGGLE ---- (exposed globally)
  window.toggleFaq = function(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = answer.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
  };

  // ---- INIT ----
  function init() {
    loadGame();

    // Cookie click
    const cookieEl = document.getElementById('main-cookie');
    cookieEl.addEventListener('click', clickCookie);
    cookieEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      clickCookie(e.touches[0]);
    }, { passive: false });

    // Golden cookie button
    document.getElementById('golden-cookie-btn').addEventListener('click', triggerGoldenCookie);

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetGame);

    // Start game loop
    requestAnimationFrame(gameLoop);

    // Initial renders
    renderStats();
    renderBuildings();
    renderUpgrades();
    renderAchievements();

    // Particle spawner
    setInterval(spawnParticle, 2500);
    spawnParticle(); spawnParticle(); spawnParticle();

    // Save on unload
    window.addEventListener('beforeunload', saveGame);

    console.log('🍪 CookieClickerz loaded! Happy baking!');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
