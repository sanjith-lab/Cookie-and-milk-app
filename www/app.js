/* Cookie & Milk: personal + shared expense tracker. Plain JS, no build step. */
(function () {
  const L = window.Logic;
  const $app = document.getElementById('app');

  // ---------- Icons ----------
  const P = {
    home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    people: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM17 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5',
    plus: 'M12 5v14M5 12h14',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    back: 'M15 5l-7 7 7 7',
    left: 'M15 5l-7 7 7 7',
    right: 'M9 5l7 7-7 7',
    close: 'M6 6l12 12M18 6L6 18',
    check: 'M5 12l5 5 9-10',
    arrow: 'M7 17L17 7M9 7h8v8',
    send: 'M5 12h14M13 6l6 6-6 6',
    sync: 'M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4',
    swap: 'M7 7h11l-3-3M17 17H6l3 3',
  };
  const CATS = [
    { name: 'Food', bg: '#F9D4DA', d: 'M4 11h16a8 8 0 0 1-16 0zM8 7c0-2 2-2 2-4M12 7c0-2 2-2 2-4' },
    { name: 'Travel', bg: '#E8F7B8', d: 'M5 17h14l-1.5-6h-11zM7 17v2M17 17v2M8 11l1.5-4h5L16 11' },
    { name: 'Shopping', bg: '#E4E0F7', d: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2' },
    { name: 'Bills', bg: '#DCEAF4', d: 'M13 3L5 14h6l-1 7 8-11h-6z' },
    { name: 'Health', bg: '#FCE3C4', d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z' },
    { name: 'Fun', bg: '#CDC6F2', d: 'M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z' },
    { name: 'Home', bg: '#D7F0E6', d: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
    { name: 'Other', bg: '#FFFFFF', d: 'M5 12h.01M12 12h.01M19 12h.01' },
  ];
  const catOf = (n) => CATS.find((c) => c.name === n) || CATS[CATS.length - 1];
  const KEYWORDS = {
    Food: 'swiggy zomato dinner lunch breakfast food chai tea coffee grocery groceries bigbasket blinkit zepto instamart restaurant snacks biryani pizza milk',
    Travel: 'uber ola auto metro cab petrol fuel diesel bus train flight rapido toll parking taxi',
    Shopping: 'amazon flipkart myntra ajio clothes shoes shopping gift meesho',
    Bills: 'rent electricity wifi internet bill recharge gas water broadband dth emi maintenance',
    Health: 'medicine doctor pharmacy gym hospital clinic tablets',
    Fun: 'movie netflix party drinks game games concert bar pub trip',
    Home: 'furniture repair cleaning maid plumber decor kitchen',
  };
  function guessCat(note) {
    const words = String(note || '').toLowerCase().split(/[^a-z]+/);
    for (const [cat, list] of Object.entries(KEYWORDS)) {
      const set = list.split(' ');
      if (words.some((w) => w && set.includes(w))) return cat;
    }
    return 'Other';
  }
  function svg(d, extra) {
    const dots = d.indexOf('.01') !== -1;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (dots ? 3.2 : 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '><path d="' + d + '"/></svg>';
  }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initial = (n) => esc(String(n || '?').trim().charAt(0).toUpperCase() || '?');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const fmt = L.formatINR;

  // ---------- Storage ----------
  const KEY_S = 'paisa.settings.v1', KEY_R = 'paisa.records.v1';
  function load(k, def) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  const state = {
    settings: load(KEY_S, null),
    records: load(KEY_R, []),
    view: 'home',
    month: L.monthKey(new Date()),
    sharedWith: null,
    overlay: null, // {type:'add'|'settle'|'onboard', ...}
    sync: { status: 'off', msg: '' },
  };
  function saveSettings() { localStorage.setItem(KEY_S, JSON.stringify(state.settings)); }
  function saveRecords() { localStorage.setItem(KEY_R, JSON.stringify(state.records)); }
  const me = () => (state.settings && state.settings.me) || 'Me';
  const people = () => (state.settings && state.settings.people) || [];
  const live = () => state.records.filter((r) => !r.deleted);

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2600);
  }

  // ---------- Dates ----------
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function monthLabel(key) { const [y, m] = key.split('-').map(Number); return MONTHS[m - 1] + (y !== new Date().getFullYear() ? ' ' + y : ''); }
  function shiftMonth(key, n) { const [y, m] = key.split('-').map(Number); return L.monthKey(new Date(y, m - 1 + n, 1)); }
  function dayLabel(iso) {
    const today = L.isoDate(new Date());
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (iso === today) return 'Today';
    if (iso === L.isoDate(y)) return 'Yesterday';
    const [yy, mm, dd] = iso.split('-').map(Number);
    const d = new Date(yy, mm - 1, dd);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  const byNewest = (a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0);
  const byOldest = (a, b) => -byNewest(a, b);

  // ---------- Render root ----------
  function render() {
    if (!state.settings || !state.settings.me) { $app.innerHTML = renderOnboard(); return; }
    let html = '';
    if (state.view === 'home') html = renderHome();
    else if (state.view === 'shared') html = renderShared();
    else html = renderSettings();
    html += renderNav();
    if (state.overlay && state.overlay.type === 'add') html += renderAdd();
    if (state.overlay && state.overlay.type === 'settle') html += renderSettle();
    const y = window.scrollY;
    $app.innerHTML = html;
    if (state.view === 'shared' && state.scrollFeed) { window.scrollTo(0, document.body.scrollHeight); state.scrollFeed = false; }
    else window.scrollTo(0, y);
  }

  function renderNav() {
    const b = (v, d, label) => '<button class="' + (state.view === v ? 'on' : '') + '" data-act="nav" data-v="' + v + '" aria-label="' + label + '">' + svg(d) + '</button>';
    return '<nav class="nav">' + b('home', P.home, 'Home') + b('shared', P.people, 'Shared') +
      '<button class="add" data-act="add" aria-label="Add expense">' + svg(P.plus, ' style="stroke-width:2.6"') + '</button>' +
      b('settings', P.gear, 'Settings') + '</nav>';
  }

  function syncDot() {
    const s = state.sync.status;
    const cls = s === 'busy' ? 'busy' : s === 'err' ? 'err' : s === 'ok' ? '' : 'off';
    return '<span class="sync-dot ' + cls + '"></span>';
  }

  // ---------- Onboarding ----------
  function renderOnboard() {
    return '<div class="screen" style="padding-bottom:40px">' +
      '<div style="height:20px"></div><span class="pill lime sm" style="align-self:flex-start">Hi there</span>' +
      '<h1>Welcome to Cookie &amp; Milk</h1><p class="help" style="font-size:14px">Track your own spending and split costs with the people you live or hang out with.</p>' +
      '<div class="form-card">' +
      '<label class="field-label" for="ob-me">Your name</label><input id="ob-me" class="text-input" placeholder="e.g. Sanjith" autocomplete="off">' +
      '<label class="field-label" for="ob-budget">Monthly budget (₹)</label><input id="ob-budget" class="text-input" inputmode="numeric" placeholder="e.g. 35000">' +
      '<label class="field-label" for="ob-p">Someone you split with (optional)</label><input id="ob-p" class="text-input" placeholder="e.g. Arjun" autocomplete="off">' +
      '<p class="help">Use the same spelling for names on both phones, so shared expenses match up.</p>' +
      '</div><button class="btn-primary" data-act="onboard-done">Start<span class="go">' + svg(P.send) + '</span></button></div>';
  }

  // ---------- Home ----------
  function renderHome() {
    const recs = live();
    const month = state.month;
    const spend = L.mySpend(recs, me(), (r) => (r.date || '').startsWith(month));
    const budget = Number(state.settings.budget) || 0;
    const left = budget - spend.total;
    const pct = budget ? Math.min(spend.total / budget, 1) : 0;
    const C = 2 * Math.PI * 46;
    const ringColor = budget && spend.total > budget ? '#F2A0AE' : '#B6D84E';

    let h = '<div class="screen">';
    h += '<div class="row between"><div class="row"><span class="avatar">' + initial(me()) + '</span>' +
      '<div class="row" style="gap:4px;background:#fff;border-radius:999px;padding:4px">' +
      '<button class="icon-btn" style="width:36px;height:36px" data-act="month" data-n="-1" aria-label="Previous month">' + svg(P.left) + '</button>' +
      '<span style="font-size:14px;font-weight:700;padding:0 4px;min-width:74px;text-align:center">' + esc(monthLabel(month)) + '</span>' +
      '<button class="icon-btn" style="width:36px;height:36px" data-act="month" data-n="1" aria-label="Next month">' + svg(P.right) + '</button></div></div>' +
      '<button class="icon-btn" data-act="sync" aria-label="Sync now">' + svg(P.sync) + '</button></div>';

    // Bento
    h += '<div class="bento">';
    h += '<div class="tile ring">' +
      '<svg width="132" height="132" viewBox="0 0 120 120" role="img" aria-label="' + Math.round(pct * 100) + '% of budget used">' +
      '<circle cx="60" cy="60" r="46" fill="none" stroke="#EEEDF3" stroke-width="14"/>' +
      (pct > 0 ? '<circle cx="60" cy="60" r="46" fill="none" stroke="' + ringColor + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + (pct * C).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 60 60)"/>' : '') +
      '<text x="60" y="55" text-anchor="middle" font-size="11" fill="#6B6A75" font-family="PJS, sans-serif">' + (budget ? (left >= 0 ? 'left' : 'over') : 'spent') + '</text>' +
      '<text x="60" y="74" text-anchor="middle" font-size="' + (budget ? 17 : 17) + '" font-weight="800" fill="#17171A" font-family="PJS, sans-serif">' + esc(budget ? fmt(Math.abs(left)) : fmt(spend.total)) + '</text></svg>' +
      '<span class="pill sm soft">' + (budget ? esc(fmt(spend.total) + ' of ' + fmt(budget)) : 'Set a budget in Settings') + '</span></div>';

    // Owed tile
    const ps = people();
    if (!ps.length) {
      h += '<button class="tile lav" data-act="nav" data-v="settings"><div class="row between"><span class="label">Split costs</span><span class="corner">' + svg(P.plus, ' width="14" height="14"') + '</span></div><span style="font-weight:800;font-size:16px">Add a person</span></button>';
    } else {
      let net = 0; let who = null; let count = 0;
      for (const p of ps) { const b = L.balanceWith(recs, me(), p.name); if (b !== 0) { count++; who = p.name; } net += b; }
      const label = ps.length === 1 ? (net >= 0 ? esc(ps[0].name) + ' owes you' : 'You owe ' + esc(ps[0].name))
        : (net >= 0 ? 'Owed to you' : 'You owe');
      h += '<button class="tile lav" data-act="nav" data-v="shared"><div class="row between"><span class="label">' + (net === 0 ? 'All settled' : label) + '</span><span class="corner">' + svg(P.arrow, ' width="14" height="14"') + '</span></div><span class="big">' + esc(fmt(Math.abs(net))) + '</span></button>';
    }
    // Bill tile
    const nb = L.nextBill(state.settings.bills || [], new Date());
    if (nb) {
      h += '<button class="tile black" data-act="nav" data-v="settings"><span class="label">Next bill · ' + (nb.days === 0 ? 'today' : nb.days === 1 ? 'tomorrow' : nb.days + ' days') + '</span>' +
        '<div style="display:flex;flex-direction:column"><span style="font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(nb.name) + '</span><span style="font-size:20px;font-weight:800;color:#D8F27E">' + esc(fmt(nb.amount)) + '</span></div></button>';
    } else {
      h += '<button class="tile black" data-act="nav" data-v="settings"><span class="label">Bills</span><span style="font-size:15px;font-weight:700">Add your rent, wifi and other bills</span></button>';
    }
    h += '</div>';

    // Categories (top 4 by spend)
    const ranked = CATS.map((c) => ({ c, v: spend.byCat[c.name] || 0 })).sort((a, b) => b.v - a.v).slice(0, 4);
    h += '<div class="cats">' + ranked.map(({ c, v }) =>
      '<div class="cat-tile" style="background:' + c.bg + '">' + svg(c.d) + '<span class="n">' + c.name + '</span><span class="v">' + esc(L.shortINR(v)) + '</span></div>').join('') + '</div>';

    // Week
    const week = L.weekSpend(recs, me(), new Date());
    const max = Math.max(1, ...week.map((d) => d.total));
    const wTotal = week.reduce((s, d) => s + d.total, 0);
    h += '<div class="card"><div class="row between" style="margin-bottom:12px"><p class="card-title">This week</p><span class="pill sm soft">' + esc(fmt(wTotal)) + '</span></div><div class="week">' +
      week.map((d) => '<div class="col"><div class="bar ' + (d.isToday ? 'today' : '') + '" style="height:' + Math.max(6, Math.round((d.total / max) * 62)) + 'px" title="' + esc(fmt(d.total)) + '"></div><span class="d ' + (d.isToday ? 'today' : '') + '">' + d.label + '</span></div>').join('') + '</div></div>';

    // Recent
    const recent = recs.filter((r) => L.involves(r, me()) && (r.date || '').startsWith(month)).sort(byNewest);
    h += '<div class="card"><div class="row between"><p class="card-title">' + (month === L.monthKey(new Date()) ? 'Recent' : esc(monthLabel(month))) + '</p>' +
      '<span class="row small muted" style="gap:6px">' + syncDot() + esc(syncText()) + '</span></div>';
    if (!recent.length) h += '<div class="empty">No expenses yet. Tap the green + to add one.</div>';
    else h += '<div class="list">' + recent.slice(0, state.showAll ? 500 : 8).map(renderItem).join('') + '</div>' +
      (recent.length > 8 && !state.showAll ? '<button class="pill soft" style="align-self:center;margin:6px auto 0;display:flex" data-act="show-all">Show all ' + recent.length + '</button>' : '');
    h += '</div></div>';
    return h;
  }

  function renderItem(r) {
    if (r.kind === 'settlement') {
      const inbound = L.same(r.to, me());
      return '<button class="item" data-act="edit" data-id="' + esc(r.id) + '"><span class="ic" style="background:#CDC6F2">' + svg(P.swap) + '</span>' +
        '<span class="grow"><span class="t" style="display:block">' + (inbound ? esc(r.from) + ' paid you' : 'You paid ' + esc(r.to)) + '</span><span class="s">' + esc(dayLabel(r.date)) + ' · Settle up</span></span>' +
        '<span class="amt">' + esc(fmt(r.amount)) + '</span></button>';
    }
    const c = catOf(r.category);
    const mine = L.shareOf(r, me());
    const shared = !!r.with;
    const other = shared ? (L.same(r.paidBy, me()) ? r.with : r.paidBy) : '';
    const sub = esc(dayLabel(r.date)) + ' · ' + (shared ? (L.same(r.paidBy, me()) ? 'You paid, split with ' : esc(other) + ' paid, split with you') + (L.same(r.paidBy, me()) ? esc(other) : '') : esc(c.name));
    return '<button class="item" data-act="edit" data-id="' + esc(r.id) + '"><span class="ic" style="background:' + (c.bg === '#FFFFFF' ? '#EEEDF3' : c.bg) + '">' + svg(c.d) + '</span>' +
      '<span class="grow"><span class="t" style="display:block">' + esc(r.note || c.name) + '</span><span class="s">' + sub + '</span></span>' +
      '<span class="amt">' + esc(fmt(mine)) + (shared ? '<span class="s" style="display:block;font-weight:500">of ' + esc(fmt(r.amount)) + '</span>' : '') + '</span></button>';
  }

  function syncText() {
    const s = state.settings;
    if (!s.syncUrl) return 'On this phone';
    if (state.sync.status === 'busy') return 'Syncing';
    if (state.sync.status === 'err') return 'Sync failed';
    if (s.lastSync) {
      const mins = Math.round((Date.now() - s.lastSync) / 60000);
      return mins < 1 ? 'Synced now' : mins < 60 ? 'Synced ' + mins + 'm ago' : 'Synced ' + Math.round(mins / 60) + 'h ago';
    }
    return 'Not synced yet';
  }

  // ---------- Shared (chat) ----------
  function renderShared() {
    const ps = people();
    let h = '<div class="screen">';
    h += '<div class="row between"><h1>Shared</h1><button class="icon-btn" data-act="sync" aria-label="Sync now">' + svg(P.sync) + '</button></div>';
    if (!ps.length) {
      return h + '<div class="card empty">Add the people you split with in Settings, then shared expenses show up here like a chat.<br><br><button class="pill black" data-act="nav" data-v="settings">Add a person</button></div></div>';
    }
    if (!state.sharedWith || !ps.some((p) => L.same(p.name, state.sharedWith))) state.sharedWith = ps[0].name;
    const who = state.sharedWith;
    const recs = live();
    h += '<div class="people">' + ps.map((p) => '<button class="person ' + (L.same(p.name, who) ? 'on' : '') + '" data-act="pick-person" data-name="' + esc(p.name) + '"><span class="avatar" style="background:#CDC6F2">' + initial(p.name) + '</span>' + esc(p.name) + '</button>').join('') + '</div>';

    const bal = L.balanceWith(recs, me(), who);
    const tot = L.paidTotals(recs, me(), who);
    const sum = tot.mine + tot.theirs;
    const myPct = sum ? Math.round((tot.mine / sum) * 100) : 50;
    h += '<div class="card lav" style="display:flex;flex-direction:column;gap:14px;border-radius:32px">' +
      '<div class="row between"><div><div class="small bold" style="color:#3E3B52">You paid</div><div style="font-size:20px;font-weight:800">' + esc(fmt(tot.mine)) + '</div></div>' +
      '<div style="text-align:right"><div class="small bold" style="color:#3E3B52">' + esc(who) + ' paid</div><div style="font-size:20px;font-weight:800">' + esc(fmt(tot.theirs)) + '</div></div></div>' +
      '<div class="split-bar"><div style="width:' + myPct + '%;background:#1B1B1F"></div><div style="width:' + (100 - myPct) + '%;background:#fff"></div></div>' +
      '<div class="owes"><span style="font-size:15px;font-weight:800">' + (bal === 0 ? 'All settled up' : bal > 0 ? esc(who) + ' owes you ' + esc(fmt(bal)) : 'You owe ' + esc(who) + ' ' + esc(fmt(-bal))) + '</span>' +
      '<button class="pill lime" data-act="settle" ' + (bal === 0 ? 'disabled' : '') + '>Settle</button></div></div>';

    const feed = recs.filter((r) => (r.kind === 'settlement' ? (L.involves(r, me()) && L.involves(r, who)) : r.with && L.involves(r, me()) && L.involves(r, who))).sort(byOldest);
    h += '<div class="feed">';
    if (!feed.length) h += '<div class="empty">Nothing shared with ' + esc(who) + ' yet.<br>Type something like <b>450 groceries</b> below.</div>';
    let lastDay = '';
    for (const r of feed) {
      if (r.date !== lastDay) { h += '<span class="day-sep">' + esc(dayLabel(r.date)) + '</span>'; lastDay = r.date; }
      if (r.kind === 'settlement') {
        const txt = L.same(r.from, me()) ? 'You paid ' + esc(r.to) + ' ' + esc(fmt(r.amount)) : esc(r.from) + ' paid you ' + esc(fmt(r.amount));
        h += '<button class="bubble settle" data-act="edit" data-id="' + esc(r.id) + '"><span class="who">Settled up</span><span class="what">' + txt + '</span></button>';
        continue;
      }
      const mine = L.same(r.paidBy, me());
      const c = catOf(r.category);
      const otherShare = mine ? L.shareOf(r, who) : L.shareOf(r, me());
      const shareTxt = mine ? (otherShare ? esc(who) + '\'s share: ' + esc(fmt(otherShare)) : 'You covered it all') : (otherShare ? 'Your share: ' + esc(fmt(otherShare)) : esc(who) + ' covered it all');
      const bubble = '<button class="bubble ' + (mine ? 'me' : 'them') + '" data-act="edit" data-id="' + esc(r.id) + '"><span class="who">' + (mine ? 'You paid' : esc(r.paidBy) + ' paid') + '</span>' +
        '<span class="what">' + esc(r.note || c.name) + ' · ' + esc(fmt(r.amount)) + '</span><span class="share">' + shareTxt + '</span></button>';
      h += mine ? '<div class="bubble-row me">' + bubble + '</div>' : '<div class="bubble-row"><span class="avatar sm">' + initial(r.paidBy) + '</span>' + bubble + '</div>';
    }
    h += '</div></div>';
    h += '<form class="composer" data-act="quick"><label class="field"><input id="quick" placeholder="450 groceries, split half" autocomplete="off" enterkeyhint="send"></label>' +
      '<button class="send" type="submit" aria-label="Add shared expense">' + svg(P.send) + '</button></form>';
    return h;
  }

  // ---------- Settings ----------
  function renderSettings() {
    const s = state.settings;
    let h = '<div class="screen"><h1>Settings</h1>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><p class="card-title">You</p>' +
      '<label class="field-label" for="s-me">Your name</label><input id="s-me" class="text-input" data-set="me" value="' + esc(s.me) + '">' +
      '<label class="field-label" for="s-upi">Your UPI ID (so others can pay you)</label><input id="s-upi" class="text-input" data-set="myUpi" placeholder="name@okhdfc" value="' + esc(s.myUpi || '') + '">' +
      '<label class="field-label" for="s-budget">Monthly budget (₹)</label><input id="s-budget" class="text-input" data-set="budget" inputmode="numeric" value="' + esc(s.budget || '') + '"></div>';

    h += '<div class="card"><p class="card-title" style="margin-bottom:8px">People you split with</p><div class="set-list">' +
      people().map((p, i) => '<div class="li"><span class="avatar sm">' + initial(p.name) + '</span><span class="grow"><span class="bold" style="display:block">' + esc(p.name) + '</span><span class="small muted">' + esc(p.upi || 'No UPI ID') + '</span></span><button class="x-btn" data-act="del-person" data-i="' + i + '" aria-label="Remove ' + esc(p.name) + '">' + svg(P.close) + '</button></div>').join('') +
      '</div><div class="set-row" style="margin-top:10px"><input id="np-name" class="text-input" placeholder="Name" aria-label="Name"><input id="np-upi" class="text-input" placeholder="UPI ID (optional)" aria-label="UPI ID"></div>' +
      '<button class="pill black" style="margin-top:10px" data-act="add-person">Add person</button>' +
      '<p class="help" style="margin-top:10px">Spell names exactly the way they set their own name in the app on their phone.</p></div>';

    h += '<div class="card"><p class="card-title" style="margin-bottom:8px">Bills</p><div class="set-list">' +
      (s.bills || []).map((b, i) => '<div class="li"><span class="grow"><span class="bold" style="display:block">' + esc(b.name) + '</span><span class="small muted">' + esc(fmt(b.amount)) + ' · every month on day ' + esc(b.day) + '</span></span><button class="x-btn" data-act="del-bill" data-i="' + i + '" aria-label="Remove ' + esc(b.name) + '">' + svg(P.close) + '</button></div>').join('') +
      '</div><div class="set-row" style="margin-top:10px"><input id="nb-name" class="text-input" placeholder="Rent" aria-label="Bill name"><input id="nb-amt" class="text-input" inputmode="numeric" placeholder="₹" aria-label="Amount" style="max-width:90px"><input id="nb-day" class="text-input" inputmode="numeric" placeholder="Day" aria-label="Day of month" style="max-width:70px"></div>' +
      '<button class="pill black" style="margin-top:10px" data-act="add-bill">Add bill</button></div>';

    h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><div class="row between"><p class="card-title">Sync with Google Sheets</p><span class="row small muted" style="gap:6px">' + syncDot() + esc(syncText()) + '</span></div>' +
      '<p class="help">Shared expenses and settlements sync through one Google Sheet that everyone uses. Your personal expenses stay on this phone. The setup steps are in the guide that came with the app.</p>' +
      '<label class="field-label" for="s-url">Apps Script web app URL</label><input id="s-url" class="text-input box" data-set="syncUrl" placeholder="https://script.google.com/macros/s/.../exec" value="' + esc(s.syncUrl || '') + '">' +
      '<label class="field-label" for="s-key">Secret key</label><input id="s-key" class="text-input" data-set="syncKey" value="' + esc(s.syncKey || '') + '">' +
      (state.sync.status === 'err' && state.sync.msg ? '<p class="help" style="color:#B3261E">' + esc(state.sync.msg) + '</p>' : '') +
      '<button class="pill lime" data-act="sync" style="align-self:flex-start">Sync now</button></div>';

    h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><p class="card-title">Backup</p>' +
      '<p class="help">Copy a backup of everything on this phone, and paste it into a note or email to yourself. Restoring replaces what is on this phone.</p>' +
      '<div class="row"><button class="pill black" data-act="backup">Copy backup</button><button class="pill soft" data-act="restore-open">Restore</button></div>' +
      (state.restoreOpen ? '<textarea id="restore-text" class="text-input" placeholder="Paste backup here" aria-label="Backup text"></textarea><button class="pill lime" data-act="restore" style="align-self:flex-start">Restore now</button>' : '') +
      '</div>';
    h += '<p class="help" style="text-align:center">Cookie &amp; Milk v1.0</p></div>';
    return h;
  }

  // ---------- Add / edit expense ----------
  function openAdd(opts) {
    opts = opts || {};
    const rec = opts.id ? state.records.find((r) => r.id === opts.id) : null;
    if (rec && rec.kind === 'settlement') { state.overlay = { type: 'settle', id: rec.id, person: L.same(rec.from, me()) ? rec.to : rec.from, amount: rec.amount, dir: L.same(rec.to, me()) ? 'in' : 'out' }; pushOverlay(); render(); return; }
    let f;
    if (rec) {
      const withName = rec.with ? (L.same(rec.paidBy, me()) ? rec.with : rec.paidBy) : null;
      const paidByMe = L.same(rec.paidBy, me());
      const other = withName ? L.shareOf(rec, withName) : 0;
      const mine = L.shareOf(rec, me());
      let split = 'none';
      if (withName) {
        const payerShare = paidByMe ? mine : other;
        const nonPayer = paidByMe ? other : mine;
        if (payerShare === 0) split = 'all';
        else if (Math.abs(nonPayer - Math.floor((rec.amount / 2) * 100) / 100) < 0.01) split = 'half';
        else split = 'custom';
      }
      f = { id: rec.id, category: rec.category || 'Other', amount: String(rec.amount), note: rec.note || '', date: rec.date, withName, paidByMe, split, myShare: String(mine) };
    } else {
      const withName = opts.withName || null;
      f = { id: null, category: opts.category || 'Food', amount: opts.amount ? String(opts.amount) : '', note: opts.note || '', date: L.isoDate(new Date()), withName, paidByMe: true, split: withName ? 'half' : 'none', myShare: '' };
    }
    state.overlay = { type: 'add', f };
    pushOverlay();
    render();
    if (!rec) setTimeout(() => { const el = document.getElementById('f-amount'); if (el) el.focus(); }, 60);
  }

  function addSummary(f) {
    const amt = Number(f.amount) || 0;
    if (!f.withName || f.split === 'none') return 'Personal expense, ' + fmt(amt) + ' counts toward your budget.';
    const paidBy = f.paidByMe ? me() : f.withName;
    const shares = L.makeShares({ amount: amt, paidBy, withName: f.paidByMe ? f.withName : me(), split: f.split, myShare: f.myShare, me: me() });
    const mine = L.shareOf({ shares }, me());
    const theirs = L.shareOf({ shares }, f.withName);
    if (f.paidByMe) return theirs ? f.withName + ' will owe you ' + fmt(theirs) + '. Your share is ' + fmt(mine) + '.' : 'You covered it all, ' + f.withName + ' owes nothing.';
    return mine ? 'You will owe ' + f.withName + ' ' + fmt(mine) + '.' : f.withName + ' covered it all, you owe nothing.';
  }

  function renderAdd() {
    const f = state.overlay.f;
    const ps = people();
    let h = '<div class="overlay"><div class="screen">';
    h += '<div class="row between"><button class="icon-btn" data-act="close" aria-label="Back">' + svg(P.back) + '</button><span style="font-size:17px;font-weight:700">' + (f.id ? 'Edit expense' : 'Add expense') + '</span><span style="width:48px"></span></div>';
    h += '<div class="cat-grid">' + CATS.map((c) => '<button class="cat-pick ' + (f.category === c.name ? 'on' : '') + '" style="background:' + c.bg + '" data-act="f-cat" data-c="' + c.name + '">' + svg(c.d) + c.name + '</button>').join('') + '</div>';
    h += '<div class="form-card">' +
      '<div class="row between"><label class="field-label" for="f-amount">Amount</label><input type="date" class="pill sm soft" style="border:none" data-f="date" value="' + esc(f.date) + '" aria-label="Date"></div>' +
      '<div class="row" style="gap:2px"><span style="font-size:42px;font-weight:800">₹</span><input id="f-amount" class="amount-input" inputmode="decimal" placeholder="0" data-f="amount" value="' + esc(f.amount) + '"></div>' +
      '<input class="text-input" data-f="note" placeholder="What was it for?" aria-label="Note" value="' + esc(f.note) + '">';
    if (ps.length) {
      h += '<span class="field-label">Split with</span><div class="chips">' +
        '<button class="pill ' + (!f.withName ? 'black' : 'soft') + '" data-act="f-with" data-name="">Just me</button>' +
        ps.map((p) => '<button class="pill ' + (L.same(f.withName, p.name) ? 'black' : 'soft') + '" data-act="f-with" data-name="' + esc(p.name) + '">' + esc(p.name) + '</button>').join('') + '</div>';
    }
    if (f.withName) {
      h += '<span class="field-label">Paid by</span><div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))">' +
        '<button class="' + (f.paidByMe ? 'on' : '') + '" data-act="f-payer" data-me="1">You</button><button class="' + (!f.paidByMe ? 'on' : '') + '" data-act="f-payer" data-me="0">' + esc(f.withName) + '</button></div>' +
        '<span class="field-label">Split</span><div class="seg lime" style="grid-template-columns:repeat(3,minmax(0,1fr))">' +
        '<button class="' + (f.split === 'half' ? 'on' : '') + '" data-act="f-split" data-s="half">Half</button>' +
        '<button class="' + (f.split === 'custom' ? 'on' : '') + '" data-act="f-split" data-s="custom">Custom</button>' +
        '<button class="' + (f.split === 'all' ? 'on' : '') + '" data-act="f-split" data-s="all">' + (f.paidByMe ? 'All on them' : 'All on me') + '</button></div>';
      if (f.split === 'custom') h += '<label class="field-label" for="f-myshare">Your share (₹)</label><input id="f-myshare" class="text-input" inputmode="decimal" data-f="myShare" value="' + esc(f.myShare) + '">';
    }
    h += '<div class="summary" id="f-summary">' + esc(addSummary(f)) + '</div></div>';
    h += '<button class="btn-primary" data-act="f-save">' + (f.id ? 'Save changes' : 'Save expense') + '<span class="go">' + svg(P.check) + '</span></button>';
    if (f.id) h += '<button class="btn-text" data-act="f-delete" style="align-self:center">Delete expense</button>';
    h += '</div></div>';
    return h;
  }

  function saveForm() {
    const f = state.overlay.f;
    const amount = L.round2(Number(String(f.amount).replace(/[^0-9.]/g, '')) || 0);
    if (!amount) { toast('Enter an amount'); return; }
    const withName = f.withName || null;
    const paidBy = withName && !f.paidByMe ? withName : me();
    if (withName && f.split === 'custom') {
      const ms = Number(f.myShare);
      if (isNaN(ms) || ms < 0 || ms > amount) { toast('Your share must be between ₹0 and ' + fmt(amount)); return; }
    }
    const shares = L.makeShares({ amount, paidBy, withName: withName ? (f.paidByMe ? withName : me()) : null, split: withName ? f.split : 'none', myShare: f.myShare, me: me() });
    const now = Date.now();
    const base = f.id ? state.records.find((r) => r.id === f.id) : null;
    const rec = Object.assign({}, base || { id: uid(), createdAt: now, createdBy: me() }, {
      kind: 'expense', date: f.date || L.isoDate(new Date()), amount, category: f.category, note: f.note.trim(),
      paidBy, with: withName ? (f.paidByMe ? withName : me()) : null, shares, updatedAt: now, synced: false, deleted: false,
    });
    upsert(rec);
    closeOverlay();
    toast(f.id ? 'Saved' : 'Added ' + fmt(amount));
    if (rec.with) scheduleSync();
  }

  function upsert(rec) {
    const i = state.records.findIndex((r) => r.id === rec.id);
    if (i >= 0) state.records[i] = rec; else state.records.push(rec);
    saveRecords();
  }

  function deleteRecord(id) {
    const i = state.records.findIndex((r) => r.id === id);
    if (i < 0) return;
    const r = state.records[i];
    if (L.syncable(r)) { state.records[i] = Object.assign({}, r, { deleted: true, updatedAt: Date.now(), synced: false }); scheduleSync(); }
    else state.records.splice(i, 1);
    saveRecords();
  }

  // ---------- Settle ----------
  function renderSettle() {
    const o = state.overlay;
    const p = people().find((x) => L.same(x.name, o.person)) || { name: o.person };
    const isIn = o.dir === 'in';
    let h = '<div class="backdrop" data-act="backdrop"><div class="sheet" data-stop="1"><div class="grabber"></div>';
    h += '<div class="row between"><span style="font-size:18px;font-weight:800">' + (o.id ? 'Edit settlement' : 'Settle up with ' + esc(p.name)) + '</span><button class="x-btn" data-act="close" aria-label="Close">' + svg(P.close) + '</button></div>';
    h += '<p class="help" style="font-size:14px">' + (isIn ? esc(p.name) + ' pays you. Record it once the money has reached you.' : 'You pay ' + esc(p.name) + '. Record it once you have paid.') + '</p>';
    h += '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button class="' + (isIn ? 'on' : '') + '" data-act="s-dir" data-d="in">' + esc(p.name) + ' paid me</button><button class="' + (!isIn ? 'on' : '') + '" data-act="s-dir" data-d="out">I paid ' + esc(p.name) + '</button></div>';
    h += '<div class="row" style="gap:2px"><span style="font-size:38px;font-weight:800">₹</span><input id="s-amount" class="amount-input" style="font-size:38px" inputmode="decimal" value="' + esc(o.amount) + '" aria-label="Amount"></div>';
    if (!isIn && p.upi) h += '<button class="pill lav" data-act="upi" style="align-self:flex-start">Open UPI app to pay ' + esc(p.upi) + '</button>';
    if (isIn && state.settings.myUpi) h += '<p class="help">Your UPI ID: <b>' + esc(state.settings.myUpi) + '</b></p>';
    h += '<button class="btn-primary" data-act="s-save">' + (isIn ? 'Mark as received' : 'Mark as paid') + '<span class="go">' + svg(P.check) + '</span></button>';
    if (o.id) h += '<button class="btn-text" data-act="s-delete" style="align-self:center">Delete settlement</button>';
    h += '</div></div>';
    return h;
  }

  function openSettle() {
    const who = state.sharedWith;
    const bal = L.balanceWith(live(), me(), who);
    state.overlay = { type: 'settle', person: who, amount: String(Math.abs(bal)), dir: bal >= 0 ? 'in' : 'out' };
    pushOverlay();
    render();
  }

  function saveSettle() {
    const o = state.overlay;
    const amt = L.round2(Number(document.getElementById('s-amount').value) || 0);
    if (!amt) { toast('Enter an amount'); return; }
    const now = Date.now();
    const base = o.id ? state.records.find((r) => r.id === o.id) : null;
    const rec = Object.assign({}, base || { id: uid(), createdAt: now, createdBy: me(), date: L.isoDate(new Date()) }, {
      kind: 'settlement', amount: amt, from: o.dir === 'in' ? o.person : me(), to: o.dir === 'in' ? me() : o.person, updatedAt: now, synced: false, deleted: false,
    });
    upsert(rec);
    closeOverlay();
    toast('Settlement recorded');
    scheduleSync();
  }

  // ---------- Overlay + back button ----------
  function pushOverlay() { try { history.pushState({ o: 1 }, ''); } catch (e) {} }
  function closeOverlay(fromPop) {
    state.overlay = null;
    if (!fromPop) { try { if (history.state && history.state.o) { ignorePop = true; history.back(); } } catch (e) {} }
    render();
  }
  let ignorePop = false;
  window.addEventListener('popstate', () => {
    if (ignorePop) { ignorePop = false; return; }
    if (state.overlay) closeOverlay(true);
    else if (state.view !== 'home') { state.view = 'home'; render(); try { history.pushState({ base: 1 }, ''); } catch (e) {} }
  });

  // ---------- Sync ----------
  let syncTimer;
  function scheduleSync() { clearTimeout(syncTimer); syncTimer = setTimeout(() => sync(false), 1200); }
  let syncing = false;
  async function sync(manual) {
    const s = state.settings;
    if (!s || !s.syncUrl) { if (manual) toast('Add your Google Sheet link in Settings first'); return; }
    if (syncing) return;
    syncing = true;
    state.sync = { status: 'busy', msg: '' };
    updateSyncBadges();
    try {
      const push = state.records.filter((r) => L.syncable(r) && !r.synced).map((r) => { const c = Object.assign({}, r); delete c.synced; return c; });
      const res = await fetch(s.syncUrl.trim(), { method: 'POST', body: JSON.stringify({ key: s.syncKey || '', records: push }) });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { throw new Error('The sheet link did not answer correctly. Check the URL and that the script is deployed as a web app.'); }
      if (data.error) throw new Error(data.error === 'bad key' ? 'The secret key does not match the one in the script.' : data.error);
      const pushedIds = new Set(push.map((r) => r.id));
      state.records = state.records.map((r) => (pushedIds.has(r.id) ? Object.assign({}, r, { synced: true }) : r));
      const merged = L.mergeRecords(state.records, data.records || [], me());
      state.records = merged.records;
      saveRecords();
      s.lastSync = Date.now(); saveSettings();
      state.sync = { status: 'ok', msg: '' };
      if (manual) toast(merged.changed ? merged.changed + ' update' + (merged.changed > 1 ? 's' : '') + ' from the sheet' : 'All synced');
      if (!state.overlay) render(); else updateSyncBadges();
    } catch (e) {
      state.sync = { status: 'err', msg: e.message || 'Could not reach the sheet' };
      if (manual) toast(navigator.onLine === false ? 'You are offline' : 'Sync failed. See Settings.');
      if (!state.overlay) render(); else updateSyncBadges();
    } finally { syncing = false; }
  }
  function updateSyncBadges() { document.querySelectorAll('.sync-dot').forEach((el) => { el.className = 'sync-dot ' + (state.sync.status === 'busy' ? 'busy' : state.sync.status === 'err' ? 'err' : state.sync.status === 'ok' ? '' : 'off'); }); }

  // ---------- Renaming yourself ----------
  function renameMe(oldName, newName) {
    const fix = (n) => (L.same(n, oldName) ? newName : n);
    state.records = state.records.map((r) => {
      const c = Object.assign({}, r);
      if (c.paidBy) c.paidBy = fix(c.paidBy);
      if (c.with) c.with = fix(c.with);
      if (c.from) c.from = fix(c.from);
      if (c.to) c.to = fix(c.to);
      if (c.shares) { const s = {}; for (const k of Object.keys(c.shares)) s[fix(k)] = c.shares[k]; c.shares = s; }
      if (L.syncable(c)) { c.updatedAt = Date.now(); c.synced = false; }
      return c;
    });
    saveRecords();
  }

  // ---------- Events ----------
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act;
    if (act === 'backdrop') { if (e.target === t) closeOverlay(); return; }
    const o = state.overlay;
    switch (act) {
      case 'nav': state.view = t.dataset.v; state.showAll = false; if (state.view === 'shared') state.scrollFeed = true; render(); window.scrollTo(0, state.view === 'shared' ? document.body.scrollHeight : 0); break;
      case 'add': openAdd(state.view === 'shared' && state.sharedWith ? { withName: state.sharedWith } : {}); break;
      case 'month': state.month = shiftMonth(state.month, Number(t.dataset.n)); state.showAll = false; render(); break;
      case 'show-all': state.showAll = true; render(); break;
      case 'sync': sync(true); break;
      case 'edit': openAdd({ id: t.dataset.id }); break;
      case 'close': closeOverlay(); break;
      case 'pick-person': state.sharedWith = t.dataset.name; state.scrollFeed = true; render(); break;
      case 'settle': openSettle(); break;
      case 'f-cat': o.f.category = t.dataset.c; render(); break;
      case 'f-with': o.f.withName = t.dataset.name || null; o.f.split = o.f.withName ? (o.f.split === 'none' ? 'half' : o.f.split) : 'none'; if (!o.f.withName) o.f.paidByMe = true; render(); break;
      case 'f-payer': o.f.paidByMe = t.dataset.me === '1'; render(); break;
      case 'f-split': o.f.split = t.dataset.s; render(); break;
      case 'f-save': saveForm(); break;
      case 'f-delete': deleteRecord(o.f.id); closeOverlay(); toast('Deleted'); break;
      case 's-dir': o.amount = document.getElementById('s-amount').value; o.dir = t.dataset.d; render(); break;
      case 's-save': saveSettle(); break;
      case 's-delete': deleteRecord(o.id); closeOverlay(); toast('Deleted'); break;
      case 'upi': {
        const p = people().find((x) => L.same(x.name, o.person));
        const amt = Number(document.getElementById('s-amount').value) || 0;
        const url = 'upi://pay?pa=' + encodeURIComponent(p.upi) + '&pn=' + encodeURIComponent(p.name) + (amt ? '&am=' + amt.toFixed(2) : '') + '&cu=INR&tn=' + encodeURIComponent('Settle up via Cookie and Milk');
        window.location.href = url;
        break;
      }
      case 'onboard-done': {
        const name = document.getElementById('ob-me').value.trim();
        if (!name) { toast('Enter your name'); return; }
        const budget = Number(document.getElementById('ob-budget').value.replace(/[^0-9.]/g, '')) || 0;
        const p = document.getElementById('ob-p').value.trim();
        state.settings = { me: name, budget, people: p ? [{ name: p, upi: '' }] : [], bills: [], syncUrl: '', syncKey: '', myUpi: '' };
        saveSettings();
        render();
        break;
      }
      case 'add-person': {
        const name = document.getElementById('np-name').value.trim();
        const upi = document.getElementById('np-upi').value.trim();
        if (!name) { toast('Enter a name'); return; }
        if (L.same(name, me()) || people().some((p) => L.same(p.name, name))) { toast('That name is already used'); return; }
        state.settings.people = people().concat([{ name, upi }]);
        saveSettings(); render(); toast(name + ' added');
        break;
      }
      case 'del-person': {
        const i = Number(t.dataset.i);
        const p = people()[i];
        if (L.balanceWith(live(), me(), p.name) !== 0 && !t.dataset.confirm) { t.dataset.confirm = '1'; toast('You still have a balance with ' + p.name + '. Tap again to remove.'); return; }
        state.settings.people = people().filter((_, j) => j !== i);
        saveSettings(); render();
        break;
      }
      case 'add-bill': {
        const name = document.getElementById('nb-name').value.trim();
        const amount = Number(document.getElementById('nb-amt').value.replace(/[^0-9.]/g, '')) || 0;
        const day = Math.min(Math.max(parseInt(document.getElementById('nb-day').value, 10) || 0, 1), 28);
        if (!name || !amount || !document.getElementById('nb-day').value) { toast('Fill in name, amount and day (1 to 28)'); return; }
        state.settings.bills = (state.settings.bills || []).concat([{ name, amount, day }]);
        saveSettings(); render();
        break;
      }
      case 'del-bill': state.settings.bills = (state.settings.bills || []).filter((_, j) => j !== Number(t.dataset.i)); saveSettings(); render(); break;
      case 'backup': {
        const data = JSON.stringify({ app: 'paisa', v: 1, settings: state.settings, records: state.records });
        try { await navigator.clipboard.writeText(data); toast('Backup copied. Paste it somewhere safe.'); }
        catch (err) { state.restoreOpen = true; render(); const ta = document.getElementById('restore-text'); ta.value = data; ta.select(); toast('Copy the selected text'); }
        break;
      }
      case 'restore-open': state.restoreOpen = !state.restoreOpen; render(); break;
      case 'restore': {
        try {
          const d = JSON.parse(document.getElementById('restore-text').value);
          if (d.app !== 'paisa' || !Array.isArray(d.records)) throw new Error();
          state.settings = d.settings; state.records = d.records; saveSettings(); saveRecords(); state.restoreOpen = false; render(); toast('Restored');
        } catch (err) { toast('That does not look like a Cookie & Milk backup'); }
        break;
      }
    }
  });

  // Live form inputs (no full re-render, so the keyboard stays open)
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.f && state.overlay && state.overlay.type === 'add') {
      state.overlay.f[t.dataset.f] = t.value;
      if (t.dataset.f === 'note' && !state.overlay.f.id && !state.overlay.f.catTouched) {
        const g = guessCat(t.value);
        if (g !== 'Other' && g !== state.overlay.f.category) {
          state.overlay.f.category = g;
          document.querySelectorAll('.cat-pick').forEach((b) => b.classList.toggle('on', b.dataset.c === g));
        }
      }
      const s = document.getElementById('f-summary');
      if (s) s.textContent = addSummary(state.overlay.f);
    }
  });
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-act="f-cat"]'); if (t && state.overlay && state.overlay.f) state.overlay.f.catTouched = true; }, true);

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (!t.dataset.set) return;
    const k = t.dataset.set;
    let v = t.value.trim();
    if (k === 'budget') v = Number(v.replace(/[^0-9.]/g, '')) || 0;
    if (k === 'me') {
      if (!v) { t.value = state.settings.me; return; }
      if (!L.same(v, state.settings.me)) renameMe(state.settings.me, v);
    }
    state.settings[k] = v;
    saveSettings();
    if (k === 'syncUrl' || k === 'syncKey') { state.sync = { status: 'off', msg: '' }; if (state.settings.syncUrl) sync(true); }
    toast('Saved');
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.dataset.act !== 'quick') return;
    e.preventDefault();
    const input = document.getElementById('quick');
    const q = L.parseQuick(input.value);
    if (!q) { toast('Try something like 450 groceries'); return; }
    const who = state.sharedWith;
    const now = Date.now();
    const rec = { id: uid(), createdAt: now, createdBy: me(), kind: 'expense', date: L.isoDate(new Date()), amount: L.round2(q.amount), category: guessCat(q.note), note: q.note,
      paidBy: me(), with: who, shares: L.makeShares({ amount: q.amount, paidBy: me(), withName: who, split: 'half', me: me() }), updatedAt: now, synced: false, deleted: false };
    upsert(rec);
    state.scrollFeed = true;
    render();
    toast('Added. Tap the bubble to change the split.');
    scheduleSync();
  });

  // Sync when the app comes back to the front, and every few minutes while open
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(false); });
  setInterval(() => { if (document.visibilityState === 'visible') sync(false); }, 180000);
  window.addEventListener('online', () => sync(false));


  // ---------- Keyboard: keep the focused field above the on-screen keyboard ----------
  (function keyboardFix() {
    const root = document.documentElement;
    let base = window.innerHeight;
    let kbH = 0;
    function apply(h) {
      kbH = h > 80 ? h : 0;
      const alreadyResized = Math.max(0, base - window.innerHeight);
      const extra = Math.max(0, kbH - alreadyResized);
      root.style.setProperty('--kb', extra + 'px');
      document.body.classList.toggle('kb-open', kbH > 0);
      if (kbH > 0) {
        const el = document.activeElement;
        if (el && el.closest && !el.closest('.composer') && el.scrollIntoView) setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60);
        if (el && el.closest && el.closest('.composer')) setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 60);
      }
    }
    window.addEventListener('resize', () => { if (!kbH) base = Math.max(base, window.innerHeight); });
    const K = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Keyboard;
    if (K && K.addListener) {
      K.addListener('keyboardWillShow', (i) => apply(i.keyboardHeight || 0));
      K.addListener('keyboardDidShow', (i) => apply(i.keyboardHeight || 0));
      K.addListener('keyboardWillHide', () => apply(0));
      K.addListener('keyboardDidHide', () => apply(0));
    } else if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => apply(window.innerHeight - window.visualViewport.height));
    }
  })();

  try { history.replaceState({ base: 1 }, ''); history.pushState({ base: 1 }, ''); } catch (e) {}
  render();
  sync(false);
})();
