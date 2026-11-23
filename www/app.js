/* Cookie & Milk: screens and phone features. */
(function () {
  'use strict';
  const L = window.Logic, E = window.Engine;
  const Cap = window.Capacitor;
  const Plug = (Cap && Cap.Plugins) || {};
  const native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const $app = document.getElementById('app');
  const fmt = (n, o) => L.formatINR(n, o);
  const esc = E.esc;
  const { same, norm } = L;

  // ---------- Icons ----------
  const P = {
    back: 'M15 5l-7 7 7 7', left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', close: 'M6 6l12 12M18 6L6 18', plus: 'M12 5v14M5 12h14',
    mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3', send: 'M5 12h14M13 6l6 6-6 6',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5', check: 'M5 12l5 5 9-10', share: 'M4 12v7h16v-7M12 3v13M7 8l5-5 5 5', copy: 'M8 8h12v12H8zM4 16V4h12',
    chev: 'M9 5l7 7-7 7', sync: 'M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4', trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l12-4v4M17 14h.01', pie: 'M12 3v9l8 3A9 9 0 1 1 12 3z', bill: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
    ppl: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM17 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5', bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0', msg: 'M4 5h16v11H8l-4 4zM8 9h8M8 12h5', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    cloud: 'M7 18a5 5 0 0 1-.5-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9z', down: 'M12 4v12M6 11l6 6 6-6M4 20h16', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  };
  const svg = (d, w, extra) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (d.indexOf('.01') !== -1 ? 3 : (w || 2)) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' + (extra || '') + '><path d="' + d + '"/></svg>';
  function cookie(sz, mood) {
    const id = 'b' + Math.random().toString(36).slice(2, 7);
    const mouth = mood === 'worried' ? '<path d="M42 64 Q50 58 58 64" fill="none" stroke="#5A3418" stroke-width="3.5" stroke-linecap="round"/>' : '<path d="M41 60 Q50 68 59 60" fill="none" stroke="#5A3418" stroke-width="3.5" stroke-linecap="round"/>';
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="' + id + '"><rect width="100" height="100" fill="#fff"/><circle cx="88" cy="14" r="14" fill="#000"/><circle cx="96" cy="32" r="11" fill="#000"/><circle cx="72" cy="6" r="10" fill="#000"/></mask></defs>' +
      '<g mask="url(#' + id + ')"><circle cx="50" cy="52" r="44" fill="#E6AE68"/><circle cx="50" cy="52" r="44" fill="none" stroke="#C98C45" stroke-width="3"/><circle cx="26" cy="34" r="5" fill="#6B3F1F"/><circle cx="70" cy="74" r="5" fill="#6B3F1F"/><circle cx="28" cy="74" r="4" fill="#6B3F1F"/><circle cx="74" cy="40" r="4" fill="#6B3F1F"/></g>' +
      '<circle cx="40" cy="48" r="4.5" fill="#3A2210"/><circle cx="60" cy="48" r="4.5" fill="#3A2210"/><circle cx="41.5" cy="46.5" r="1.5" fill="#fff"/><circle cx="61.5" cy="46.5" r="1.5" fill="#fff"/><ellipse cx="33" cy="58" rx="5" ry="3" fill="#F2A0AE"/><ellipse cx="67" cy="58" rx="5" ry="3" fill="#F2A0AE"/>' + mouth + '</svg>';
  }
  const catDef = (name) => { let c = L.CATS.find((x) => x.name === name); if (!c && D && D.catMeta && D.catMeta[name]) { const b = L.CATS.find((x) => x.name === D.catMeta[name].from); if (b) c = Object.assign({}, b, { name }); } return c || { name, bg: '#EEEDF3', fg: '#A99EEA', d: P.tag, type: 'want' }; };
  const catIcon = (name, size) => { const c = catDef(name); return '<span class="ic" style="background:' + c.bg + ';' + (c.dark ? 'color:#D8F27E;' : '') + (size ? 'width:' + size + 'px;height:' + size + 'px;' : '') + '">' + svg(c.d) + '</span>'; };
  const initial = (n) => esc(String(n || '?').trim().charAt(0).toUpperCase() || '?');
  const AV_COLORS = ['#CDC6F2', '#E8F7B8', '#F9D4DA', '#DCEAF4', '#FCE3C4', '#D7F0E6'];
  const avColor = (n) => AV_COLORS[Math.abs([...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0)) % AV_COLORS.length];
  const amt = (v) => '<span class="amt-v">' + v + '</span>';

  // ---------- Data ----------
  const KEY = 'cookie.v2';
  let D;
  try { D = JSON.parse(localStorage.getItem(KEY)); } catch (e) { D = null; }
  if (!D) {
    let s1 = null, r1 = [];
    try { s1 = JSON.parse(localStorage.getItem('paisa.settings.v1')); r1 = JSON.parse(localStorage.getItem('paisa.records.v1')) || []; } catch (e) {}
    if (s1 && s1.me) { D = E.migrateV1(s1, r1); E.say(D, 'Welcome to the new Cookie & Milk, ' + esc(D.me) + '! 🍪 I moved over all your old entries. Just tell me what you spend, like <b>tea 40</b>. Type <b>help</b> to see everything I can do.'); }
    else { D = E.blank(); E.startSetup(D); }
  }
  D = Object.assign(E.blank(), D);
  let saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { toast('Could not save. Phone storage may be full.'); } }, 150); }
  function saveNow() { clearTimeout(saveT); try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  window.addEventListener('pagehide', saveNow);

  const ui = { view: 'chat', page: null, sheet: null, daysBack: 0, chart: { mode: 'month', off: 0, sel: null, cat: null }, hist: { q: '', f: 'all' }, scroll: true, listening: false };

  // ---------- Toast ----------
  let toastT;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => el.remove(), 2600);
  }

  // ---------- Render ----------
  function render() {
    document.body.classList.toggle('hide-amt', !!D.hideAmounts);
    let h = header();
    if (D.setup !== 'done' || ui.view === 'chat') h += chatView(); else h += overview();
    if (ui.page) h += '<div class="sub">' + pageView() + '</div>';
    if (ui.sheet) h += sheetView();
    const keepFocus = document.activeElement && document.activeElement.id;
    const caret = document.activeElement && document.activeElement.selectionStart;
    const subScroll = document.querySelector('.sub') ? document.querySelector('.sub').scrollTop : 0;
    const winY = window.scrollY;
    $app.innerHTML = h;
    if (keepFocus) { const el = document.getElementById(keepFocus); if (el && el.focus) { el.focus(); try { if (caret != null) el.setSelectionRange(caret, caret); } catch (e) {} } }
    const sub = document.querySelector('.sub'); if (sub) sub.scrollTop = subScroll;
    if (!ui.page && ui.view === 'chat' && ui.scroll) { window.scrollTo(0, document.body.scrollHeight); ui.scroll = false; } else if (!ui.page) window.scrollTo(0, winY);
  }

  function header() {
    if (ui.page) return '';
    const s = D.setup === 'done' ? L.safeToSpend(D, E.live(D), new Date()) : null;
    const safe = s ? '<div class="safe grow"><div class="lbl">Safe to spend today</div><div class="val' + (s.over ? ' over' : '') + '">' + amt(fmt(s.safe)) + '</div></div>'
      : '<div class="safe grow"><div class="lbl">Cookie &amp; Milk</div><div class="val" style="font-size:18px">Your money buddy</div></div>';
    return '<div class="top"><div class="row" style="gap:12px"><button class="cookie-btn" data-act="settings" aria-label="Account and settings">' + cookie(36) + '</button>' + safe + '</div>' +
      (D.setup === 'done' ? '<div class="seg" style="grid-template-columns:1fr 1fr"><button class="' + (ui.view === 'chat' ? 'on' : '') + '" data-act="view" data-v="chat">Chat</button><button class="' + (ui.view === 'overview' ? 'on' : '') + '" data-act="view" data-v="overview">Overview</button></div>' : '') + '</div>';
  }

  // ---------- Chat ----------
  function chatView() {
    const today = L.isoDate(new Date());
    const days = [...new Set(D.chat.map((m) => m.day))].sort();
    const showFrom = days.filter((d) => d < today).slice(-ui.daysBack);
    const cleared = D.chatClearedAt || 0;
    const visible = D.chat.filter((m) => (m.ts || 0) >= cleared || m.day !== today).filter((m) => m.day === today || (ui.daysBack && showFrom.includes(m.day)));
    const earlier = days.filter((d) => d < today && !showFrom.includes(d)).length;
    let h = '<div class="chat' + (D.setup !== 'done' ? '" style="padding-top:calc(96px + var(--safe-top))' : '') + '">';
    if (earlier) h += '<button class="btn earlier" data-act="earlier">Show ' + (ui.daysBack ? 'more' : 'yesterday') + '</button>';
    let lastDay = '';
    for (const m of visible) {
      if (m.day !== lastDay) { h += '<span class="day-pill">' + (m.day === today ? 'Today · ' : '') + esc(E.niceDate(m.day)) + '</span>'; lastDay = m.day; }
      h += msgView(m);
    }
    if (!visible.length) h += '<div class="empty">' + cookie(64) + '<br>New day, fresh chat! Tell me what you spend, like <b>tea 40</b>.</div>';
    h += '</div>';
    const hasText = ui.draft && ui.draft.trim();
    h += '<form class="composer" data-act="send"><label class="field"><input id="cin" placeholder="' + (D.setup === 'done' ? 'tea 40, arjun me pizza 900...' : 'Type here...') + '" autocomplete="off" enterkeyhint="send" value="' + esc(ui.draft || '') + '">' +
      (D.setup === 'done' ? '<button type="button" class="plus" data-act="plus" aria-label="More ways to add">' + svg(P.plus, 2.2) + '</button>' : '') + '</label>' +
      '<button type="' + (hasText ? 'submit' : 'button') + '" class="mic' + (hasText ? ' send' : '') + '" data-act="' + (hasText ? 'noop' : 'mic') + '" aria-label="' + (hasText ? 'Send' : 'Speak') + '">' + svg(hasText ? P.send : P.mic, 2.2) + '</button></form>';
    return h;
  }

  function msgView(m) {
    if (m.from === 'me') return '<div class="msg-me"><div class="bub">' + esc(m.text) + '</div></div>';
    const c = m.card;
    if (c && c.type === 'confirm') {
      const r = D.records.find((x) => x.id === c.recId);
      if (!r && !c.undone) return '';
      let h = '<div class="conf"><div class="c' + (c.paid ? ' paid' : '') + (c.undone || (r && r.deleted) ? ' undone' : '') + '"><span>' + svg(P.check, 2.6, 'width="12" height="12" style="vertical-align:-1px;margin-right:4px"') + amt(c.text) + '</span>';
      if (!c.undone && r && !r.deleted) {
        h += '<span class="acts"><button class="mini" data-act="edit" data-id="' + esc(r.id) + '">Edit</button><button class="mini" data-act="undo-rec" data-id="' + esc(r.id) + '">Undo</button></span>';
        if (c.pickCat && !c.showCats) h += '<span class="acts"><button class="mini" data-act="show-cats" data-msg="' + m.id + '">Pick category ▾</button></span>';
        if (c.pickCat && c.showCats) h += '<span class="acts">' + ['Shopping', 'Food & Drink', 'Groceries', 'Transport', 'Entertainment', 'Personal Care', 'Medical', 'Home'].map((k) => '<button class="mini" data-act="set-cat" data-msg="' + m.id + '" data-c="' + esc(k) + '">' + esc(k) + '</button>').join('') + '<button class="mini" data-act="edit" data-id="' + esc(r.id) + '">More…</button></span>';
      }
      return h + '</div></div>';
    }
    let inner = m.text ? '<span>' + m.text + '</span>' : '';
    if (c) {
      if (c.type === 'answer') {
        inner += (c.title ? '<span class="b">' + esc(c.title) + '</span>' : '') + (c.big ? '<span class="xb" style="font-size:24px;line-height:1.1">' + amt(esc(c.big)) + '</span>' : '') + (c.sub ? '<span class="s12 muted">' + esc(c.sub) + '</span>' : '');
        if (c.rows && c.rows.length) inner += '<div style="display:flex;flex-direction:column;gap:7px;min-width:230px">' + c.rows.map((r) => '<div><div class="qrow between"><span class="grow">' + esc(r.label) + '</span><span class="b">' + amt(esc(r.value)) + '</span></div>' + (r.pct != null ? '<div class="bar" style="margin-top:4px"><i style="width:' + Math.max(3, Math.min(100, r.pct * 100)).toFixed(0) + '%;background:' + (r.color || '#A99EEA') + '"></i></div>' : '') + '</div>').join('') + '</div>';
        if (c.note) inner += '<span class="s12 muted">' + c.note + '</span>';
        if (c.link) inner += '<button class="link" style="text-align:left" data-act="open" data-v="' + esc(c.link) + '">See more ›</button>';
      }
      if (c.type === 'advice') {
        inner += '<div class="prompt-box">' + esc(c.prompt) + '</div><div class="btns"><button class="btn black" data-act="ai-share" data-msg="' + m.id + '">' + svg(P.share, 2, 'width="14" height="14"') + ' Ask AI</button><button class="btn" data-act="ai-copy" data-msg="' + m.id + '">' + svg(P.copy, 2, 'width="14" height="14"') + ' Copy</button></div>' +
          '<span class="s11 muted">' + (D.hideNames ? 'Friends\' names are hidden. ' : '') + 'Paste the AI\'s reply here and I\'ll save it as your plan.</span>';
      }
      if (c.type === 'capture' && c.showCats && !c.done) {
        inner += '<div class="btns">' + E.allCats(D).filter((k) => k !== 'Other').slice(0, 14).map((k) => '<button class="btn" data-act="cap-cat" data-msg="' + m.id + '" data-c="' + esc(k) + '">' + esc(k) + '</button>').join('') + '</div>';
      }
      if (c.options && c.options.length) {
        if (c.done) inner += '<span class="done-note">✓ ' + esc(c.done) + '</span>';
        else if (c.ignored) inner += '<span class="done-note">Ignored</span>';
        else if (!(c.type === 'capture' && c.showCats)) inner += '<div class="btns">' + c.options.map((o, i) => '<button class="btn ' + (o.style || '') + '" data-act="card" data-msg="' + m.id + '" data-i="' + i + '">' + esc(o.label) + '</button>').join('') + '</div>';
      }
    }
    const mood = c && c.type === 'mood' ? c.mood : 'happy';
    return '<div class="msg-ck"><span class="av">' + cookie(30, mood) + '</span><div class="bub">' + inner + '</div></div>';
  }

  // ---------- Overview ----------
  function overview() {
    const recs = E.live(D); const now = new Date(); const mk = L.monthKey(now);
    const s = L.safeToSpend(D, recs, now);
    const spent = L.mySpend(recs, D.me, (r) => (r.date || '').startsWith(mk)).total;
    const base = (D.income.amount ? D.income.amount : D.budget) || 0;
    const pct = base ? Math.min(1, spent / base) : 0;
    let h = '<div class="page">';
    h += '<div class="card black row" style="gap:14px"><svg width="76" height="76" viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" fill="none" stroke="#34343B" stroke-width="14"/>' + (pct ? '<circle cx="60" cy="60" r="46" fill="none" stroke="' + (pct > 0.9 ? '#F2A0AE' : '#D8F27E') + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + (pct * 289).toFixed(0) + ' 289" transform="rotate(-90 60 60)"/>' : '') + '<text x="60" y="68" text-anchor="middle" font-size="24" font-weight="800" fill="#fff" font-family="PJS">' + Math.round(pct * 100) + '%</text></svg>' +
      '<div class="grow"><div class="s13" style="color:#C9C8D1">Spent this month</div><div class="xb" style="font-size:24px">' + amt(fmt(spent)) + '</div><div class="s12" style="color:#C9C8D1">' + (base ? 'of ' + amt(fmt(base)) + (D.income.amount ? ' income' : ' budget') : 'Add your salary in chat: <b>salary 85000</b>') + (s ? ' · ' + s.daysLeft + ' days left' : '') + '</div></div></div>';
    // Due soon
    const due = E.dueSoon(D);
    if (due.length) {
      h += '<div class="card"><div class="card-h"><span class="t">Due soon</span><span class="s12 muted">bills, friends and loans</span></div>' + due.slice(0, 8).map((d) => {
        const icon = d.kind === 'bill' ? '<span class="ic" style="background:' + (d.urgent ? '#1B1B1F;color:#D8F27E' : '#EEEDF3') + '">' + d.day + '</span>' : d.kind === 'claim' ? '<span class="ic" style="background:#DCEAF4">' + svg(P.bill) + '</span>' : '<span class="ic" style="background:' + avColor(d.title) + '">' + initial(d.title.replace(/^You owe /, '')) + '</span>';
        const btn = d.kind === 'bill' ? '<button class="btn lime" data-act="do" data-t="bill-paid" data-id="' + d.id + '">Mark paid</button>'
          : d.kind === 'friend' ? '<button class="btn ' + (d.incoming ? '' : 'black') + '" data-act="say" data-text="settle ' + esc(norm(d.id)) + '">' + (d.incoming ? 'Settle' : 'Pay') + '</button>'
          : d.kind === 'loan' ? '<button class="btn" data-act="open" data-v="history">View</button>' : '<button class="btn" data-act="say" data-text="claim received">Received</button>';
        return '<div class="li"><span>' + icon + '</span><span class="grow"><span class="b s14 ell" style="display:block">' + esc(d.title) + '</span><span class="s12 ' + (d.urgent ? 'red' : 'muted') + '">' + esc(d.sub) + '</span></span><span class="amt ' + (d.incoming ? 'green' : '') + '">' + amt(fmt(d.amount)) + '</span>' + btn + '</div>';
      }).join('') + '</div>';
    }
    // Trip
    if (D.trip) {
      const tr = recs.filter((r) => r.trip === D.trip.id); const tm = L.mySpend(tr, D.me).total; const tt = tr.reduce((a, r) => a + (r.amount > 0 ? r.amount : 0), 0);
      h += '<div class="card" style="background:#D7F0E6"><div class="card-h"><span class="t">🏝️ ' + esc(D.trip.name) + ' trip</span><button class="btn black" data-act="say" data-text="end trip">End trip</button></div>' +
        '<div class="row between"><div><div class="s12 muted">Your share so far</div><div class="xb" style="font-size:22px">' + amt(fmt(tm)) + '</div><div class="s12 muted">group total ' + amt(fmt(tt)) + '</div></div>' +
        (D.trip.budget ? '<div style="text-align:right"><div class="s12 muted">Budget left</div><div class="xb" style="font-size:18px;' + (D.trip.budget - tm < 0 ? 'color:#B3261E' : '') + '">' + amt(fmt(D.trip.budget - tm)) + '</div></div>' : '') + '</div>' +
        (D.trip.budget ? '<div class="bar" style="margin-top:10px;background:#fff"><i style="width:' + Math.min(100, tm / D.trip.budget * 100).toFixed(0) + '%;background:#1B1B1F"></i></div>' : '') + '</div>';
    }
    // People
    const together = D.people.map((p) => ({ p, st: L.togetherStats(recs, D.me, p.name, (r) => (r.date || '').startsWith(mk)) })).filter((x) => x.st.together || x.st.myTreats || x.st.theirTreats).sort((a, b) => b.st.together - a.st.together).slice(0, 3);
    together.forEach(({ p, st }) => {
      const bal = L.balanceWith(recs, D.me, p.name);
      h += '<button class="card" style="text-align:left;background:#E4E0F7" data-act="open" data-v="person:' + esc(p.name) + '"><div class="card-h"><span class="t">You &amp; ' + esc(p.name) + '</span><span class="link">Details ›</span></div><div class="row between"><div><div class="s12" style="color:#3E3B52">Spent together this month</div><div class="xb" style="font-size:22px">' + amt(fmt(st.together)) + '</div></div><div style="text-align:right"><div class="s12" style="color:#3E3B52">' + (bal === 0 ? 'All settled' : bal > 0 ? p.name + ' owes you' : 'You owe') + '</div><div class="xb">' + (bal ? amt(fmt(Math.abs(bal))) : '✓') + '</div></div></div></button>';
    });
    // Budgets
    const bud = Object.entries(D.catBudgets || {}).filter(([, v]) => v > 0);
    const byCat = L.mySpend(recs, D.me, (r) => (r.date || '').startsWith(mk)).byCat;
    h += '<div class="card"><div class="card-h"><span class="t">Budgets</span><span class="s12 muted">' + (s ? s.daysLeft + ' days left' : '') + '</span></div>';
    if (!bud.length) h += '<div class="s13 muted">No category budgets yet. Type <b>budget food 8000</b> in the chat.</div>';
    bud.forEach(([k, v]) => { const u = byCat[k] || 0; const p = u / v; h += '<div style="padding:7px 0"><div class="row between s13"><span class="b">' + esc(k) + '</span><span class="' + (p >= 1 ? 'red b' : 'muted') + '">' + amt(fmt(u) + ' / ' + fmt(v)) + '</span></div><div class="bar" style="margin-top:6px"><i style="width:' + Math.min(100, p * 100).toFixed(0) + '%;background:' + (p >= 1 ? '#E5484D' : catDef(k).fg) + '"></i></div></div>'; });
    h += '</div>';
    // Savings
    h += '<div class="row between"><span class="b" style="font-size:15px">Savings</span><button class="link" data-act="open" data-v="savings">All savings ›</button></div>' + potsGrid();
    // Week
    const ws = L.weekStart(now); const week = L.daySeries(recs, D.me, ws, 7, false); const mx = Math.max(1, ...week.map((d) => d.total)); const wt = week.reduce((a, d) => a + d.total, 0);
    const fixedMonth = L.mySpend(recs, D.me, (r) => (r.date || '').startsWith(mk) && L.FIXED.has(r.category)).total;
    h += '<div class="card"><div class="card-h"><span class="t">This week</span><span class="s12 b" style="background:#EEEDF3;border-radius:999px;padding:4px 10px">everyday ' + amt(fmt(wt)) + '</span></div><div class="week" style="height:120px">' +
      week.map((d, i) => '<div class="col" style="height:120px"><span class="bb' + (d.key === L.isoDate(now) ? ' today' : '') + '" style="height:' + Math.max(4, d.total / mx * 92).toFixed(0) + 'px"></span><span class="s12 ' + (d.key === L.isoDate(now) ? 'b' : 'muted') + '">' + 'MTWTFSS'[i] + '</span></div>').join('') +
      '</div><div class="row between" style="margin-top:10px"><span class="s12 muted">Fixed costs this month: ' + amt(fmt(fixedMonth)) + '</span><button class="link" data-act="open" data-v="charts">All charts ›</button></div></div>';
    // Recent
    const recent = recs.filter((r) => r.kind !== 'saving' && L.involves(r, D.me) || r.kind === 'saving' || r.kind === 'income').sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    h += '<div class="card"><div class="card-h"><span class="t">Recent</span><button class="link" data-act="open" data-v="history">Full history ›</button></div>' + (recent.length ? recent.map(txRow).join('') : '<div class="s13 muted">Nothing yet.</div>') + '</div>';
    if (D.plans && D.plans.length) { const pl = D.plans[D.plans.length - 1]; h += '<div class="card lime"><div class="card-h"><span class="t">📌 Your plan</span><button class="link" data-act="plan-del">Remove</button></div><div class="s13" style="white-space:pre-wrap;max-height:220px;overflow:auto">' + esc(pl.text) + '</div><div class="s11" style="margin-top:6px;color:#3F4A16">Saved ' + esc(E.niceDate(pl.date)) + '</div></div>'; }
    h += '<div style="height:10px"></div></div>';
    return h;
  }

  function potsGrid() {
    const ess = L.essentialsMonthly(E.live(D), D.me, new Date(), D.bills);
    const pot = (key, name, val, pct, col, sub) => '<button class="pot" style="background:' + col + '" data-act="sheet" data-s="addmoney" data-k="' + key + '"><span class="s12 b">' + esc(name) + '</span><span class="xb" style="font-size:16px">' + amt(fmt(val)) + '</span><span class="pb"><i style="width:' + Math.max(2, Math.min(100, pct * 100)).toFixed(0) + '%"></i></span><span class="s11" style="color:#3E3B52">' + esc(sub) + '</span></button>';
    const g = D.goals[0];
    const goalsSaved = D.goals.reduce((a, x) => a + (x.saved || 0), 0); const goalsT = D.goals.reduce((a, x) => a + (x.target || 0), 0);
    const sinkS = D.sinking.reduce((a, x) => a + (x.saved || 0), 0); const sinkT = D.sinking.reduce((a, x) => a + (x.target || 0), 0);
    const inv = D.investments.reduce((a, x) => a + (x.total || 0), 0); const invM = D.investments.reduce((a, x) => a + (x.amount || 0), 0);
    return '<div class="pots">' +
      pot('emergency', 'Emergency', D.emergency.saved, ess ? D.emergency.saved / (ess * 6) : 0, '#F9D4DA', ess ? (D.emergency.saved / ess).toFixed(1) + ' of 6 months' : 'type: save 5000 emergency') +
      pot(g ? 'goal:' + g.id : 'goals', 'Goals', goalsSaved, goalsT ? goalsSaved / goalsT : 0, '#CDC6F2', g ? g.name + (g.by ? ' by ' + g.by.slice(5) + '/' + g.by.slice(2, 4) : '') : 'type: goal bike 60000 by june') +
      pot(D.sinking[0] ? 'sink:' + D.sinking[0].id : 'sinking', 'Sinking funds', sinkS, sinkT ? sinkS / sinkT : 0, '#E8F7B8', D.sinking[0] ? D.sinking[0].name : 'yearly costs, set aside monthly') +
      pot(D.investments[0] ? 'inv:' + D.investments[0].id : 'invest', 'Investments', inv, invM ? 1 : 0, '#DCEAF4', invM ? fmt(invM) + '/month' : 'type: sip 5000 on 5th') + '</div>';
  }

  function txRow(r) {
    const me = D.me;
    let icon, title, sub, val, cls = '';
    if (r.kind === 'expense') {
      icon = catIcon(r.category); title = r.note || r.category;
      const mine = L.shareOf(r, me);
      sub = E.niceDate(r.date) + ' · ' + (r.claim ? 'claim ' + (r.claimStatus || 'pending') : E.splitText(D, r));
      val = r.amount < 0 ? '+' + fmt(-r.amount) : (L.isShared(r) && mine !== r.amount ? fmt(-mine, { sign: true }) : fmt(-r.amount, { sign: true }));
      if (r.amount < 0) cls = 'green';
    } else if (r.kind === 'settlement') {
      const inb = same(r.to, me); icon = '<span class="ic" style="background:' + avColor(inb ? r.from : r.to) + '">' + initial(inb ? r.from : r.to) + '</span>';
      title = inb ? r.from + ' paid you' : 'You paid ' + r.to; sub = E.niceDate(r.date) + ' · settle up'; val = (inb ? '+' : '−') + fmt(r.amount); cls = inb ? 'green' : '';
    } else if (r.kind === 'loan') {
      const lend = same(r.lender, me); icon = '<span class="ic" style="background:#FCE3C4">' + svg(P.ppl) + '</span>';
      title = lend ? 'Lent to ' + r.borrower : 'Borrowed from ' + r.lender; const out = L.loanOutstanding(r);
      sub = E.niceDate(r.date) + (out ? ' · ' + fmt(out) + ' pending' + (r.due ? ' · due ' + E.niceDate(r.due) : '') : ' · returned ✓'); val = (lend ? '−' : '+') + fmt(r.amount); cls = lend ? '' : 'green';
    } else if (r.kind === 'income') {
      icon = '<span class="ic" style="background:#D8F27E">' + svg(P.wallet) + '</span>'; title = r.note || 'Income'; sub = E.niceDate(r.date) + ' · income'; val = '+' + fmt(r.amount); cls = 'green';
    } else if (r.kind === 'saving') {
      icon = '<span class="ic" style="background:#E8F7B8">' + svg(P.down) + '</span>'; title = 'Saved to ' + r.pot; sub = E.niceDate(r.date) + ' · savings'; val = fmt(r.amount);
    } else return '';
    return '<button class="li" data-act="edit" data-id="' + esc(r.id) + '">' + icon + '<span class="grow"><span class="b s14 ell" style="display:block">' + esc(title) + (r.trip ? ' 🏝️' : '') + (r.method === 'card' ? ' 💳' : '') + '</span><span class="s12 muted ell" style="display:block">' + esc(sub) + '</span></span><span class="amt ' + cls + '">' + amt(val) + '</span></button>';
  }

  // ---------- Pages ----------
  function pageHead(title, right) { return '<div class="row between"><button class="icon-btn" data-act="back" aria-label="Back">' + svg(P.back) + '</button><span class="title">' + title + '</span>' + (right || '<span style="width:44px"></span>') + '</div>'; }
  function pageView() {
    const p = ui.page;
    if (p === 'history') return historyPage();
    if (p === 'charts') return chartsPage();
    if (p === 'savings') return savingsPage();
    if (p === 'settings') return settingsPage();
    if (p && p.startsWith('person:')) return personPage(p.slice(7));
    return '';
  }

  function historyPage() {
    const q = norm(ui.hist.q); const f = ui.hist.f; const me = D.me;
    let list = E.live(D).filter((r) => L.involves(r, me) || r.kind === 'income' || r.kind === 'saving');
    list = list.filter((r) => {
      if (f === 'spent' && !(r.kind === 'expense' && L.shareOf(r, me) > 0)) return false;
      if (f === 'received' && !(r.kind === 'income' || (r.kind === 'settlement' && same(r.to, me)) || (r.kind === 'expense' && r.amount < 0))) return false;
      if (f === 'shared' && !(L.isShared(r) && r.kind === 'expense')) return false;
      if (f === 'savings' && r.kind !== 'saving') return false;
      if (f === 'loans' && r.kind !== 'loan') return false;
      if (f === 'claims' && !r.claim) return false;
      if (q) { const hay = norm([r.note, r.category, r.paidBy, r.from, r.to, r.lender, r.borrower, r.pot, Object.keys(r.shares || {}).join(' '), r.amount].join(' ')); if (!hay.includes(q)) return false; }
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);
    let h = '<div class="page">' + pageHead('Payment history');
    h += '<label class="search">' + svg(P.search, 2, 'width="18" height="18" class="muted"') + '<input id="hq" placeholder="Search swiggy, arjun, rent..." value="' + esc(ui.hist.q) + '" autocomplete="off"></label>';
    h += '<div class="scroll-x">' + [['all', 'All'], ['spent', 'Spent'], ['received', 'Received'], ['shared', 'Shared'], ['savings', 'Savings'], ['loans', 'Loans'], ['claims', 'Claims']].map(([k, v]) => '<button class="chip ' + (f === k ? 'on' : '') + '" data-act="hf" data-f="' + k + '">' + v + '</button>').join('') + '</div>';
    if (!list.length) h += '<div class="card empty">Nothing found.</div>';
    else {
      h += '<div class="card" style="padding:6px 18px">';
      let day = '';
      list.slice(0, 400).forEach((r) => {
        if (r.date !== day) { day = r.date; const tot = L.mySpend(list, me, (x) => x.date === day).total; h += '<div class="date-h"><span>' + esc(E.niceDate(day).toUpperCase()) + '</span><span>' + (tot ? amt(fmt(-tot, { sign: true })) : '') + '</span></div>'; }
        h += txRow(r);
      });
      h += '</div>';
    }
    return h + '</div>';
  }

  function chartsPage() {
    const recs = E.live(D); const me = D.me; const c = ui.chart; const now = new Date();
    let from, to, label, prevFrom, prevTo;
    if (c.mode === 'day') { from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + c.off); to = from; label = E.niceDate(L.isoDate(from)); prevFrom = new Date(from); prevFrom.setDate(from.getDate() - 1); prevTo = prevFrom; }
    else if (c.mode === 'week') { from = L.weekStart(now); from.setDate(from.getDate() + 7 * c.off); to = new Date(from); to.setDate(from.getDate() + 6); label = from.getDate() + ' ' + from.toLocaleDateString('en-IN', { month: 'short' }) + ' to ' + to.getDate() + ' ' + to.toLocaleDateString('en-IN', { month: 'short' }); prevFrom = new Date(from); prevFrom.setDate(from.getDate() - 7); prevTo = new Date(from); prevTo.setDate(from.getDate() - 1); }
    else { from = new Date(now.getFullYear(), now.getMonth() + c.off, 1); to = new Date(from.getFullYear(), from.getMonth() + 1, 0); label = from.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); prevFrom = new Date(from.getFullYear(), from.getMonth() - 1, 1); prevTo = new Date(from.getFullYear(), from.getMonth(), 0); }
    const A = L.isoDate(from), B = L.isoDate(to);
    const inP = (r) => r.date >= A && r.date <= B;
    const inPrev = (r) => r.date >= L.isoDate(prevFrom) && r.date <= L.isoDate(prevTo);
    const every = L.mySpend(recs, me, (r) => inP(r) && !L.FIXED.has(r.category));
    const fixed = L.mySpend(recs, me, (r) => inP(r) && L.FIXED.has(r.category)).total;
    const prevEvery = L.mySpend(recs, me, (r) => inPrev(r) && !L.FIXED.has(r.category)).total;
    const ndays = Math.round((to - from) / 86400000) + 1;
    const elapsed = Math.max(1, Math.min(ndays, Math.round((Math.min(to, now) - from) / 86400000) + 1));
    let h = '<div class="page">' + pageHead('Insights');
    h += '<div class="seg sm" style="grid-template-columns:repeat(3,1fr)">' + ['day', 'week', 'month'].map((m) => '<button class="' + (c.mode === m ? 'on' : '') + '" data-act="cmode" data-m="' + m + '">' + m[0].toUpperCase() + m.slice(1) + '</button>').join('') + '</div>';
    h += '<div class="row between"><button class="icon-btn" style="width:38px;height:38px" data-act="coff" data-n="-1" aria-label="Previous">' + svg(P.left) + '</button><span class="b">' + esc(label) + '</span><button class="icon-btn" style="width:38px;height:38px" data-act="coff" data-n="1" aria-label="Next" ' + (c.off >= 0 ? 'disabled style="opacity:.3;width:38px;height:38px"' : '') + '>' + svg(P.right) + '</button></div>';
    const diff = prevEvery ? (every.total - prevEvery) / prevEvery : 0;
    h += '<div class="stats3"><div class="stat"><div class="s12 muted">Everyday</div><div class="v">' + amt(fmt(every.total)) + '</div>' + (prevEvery ? '<div class="s12 b ' + (diff > 0 ? 'red' : 'green') + '">' + (diff > 0 ? '▲ ' : '▼ ') + Math.abs(Math.round(diff * 100)) + '%</div>' : '<div class="s12 muted">no earlier data</div>') + '</div>' +
      '<div class="stat"><div class="s12 muted">Fixed</div><div class="v">' + amt(fmt(fixed)) + '</div><div class="s12 muted">rent, bills, EMI</div></div>' +
      '<div class="stat" style="background:#D8F27E"><div class="s12" style="color:#3F4A16">Daily avg</div><div class="v">' + amt(fmt(Math.round(every.total / elapsed))) + '</div><div class="s12 b">everyday</div></div></div>';
    // Bars
    if (c.mode !== 'day') {
      const series = L.daySeries(recs, me, from, ndays, false);
      const mx = Math.max(1, ...series.map((d) => d.total));
      const H = 130;
      const budgetDay = D.budget ? D.budget / L.daysInMonth(from) : D.income.amount ? Math.max(0, (D.income.amount - L.billsThisMonth(D.bills, from).reduce((a, b) => a + b.amountNow, 0))) / L.daysInMonth(from) : 0;
      const top = Math.max(mx, budgetDay * 1.1);
      h += '<div class="card"><div class="card-h"><span class="t">Daily spending</span>' + (budgetDay ? '<span class="s12 red row" style="gap:5px"><span style="width:14px;border-top:2px dashed #F2A0AE"></span>daily budget</span>' : '<span class="s12 muted">tap a bar</span>') + '</div><div style="position:relative;height:' + (H + 22) + 'px">';
      if (budgetDay) h += '<div style="position:absolute;left:0;right:0;top:' + (H - budgetDay / top * H).toFixed(0) + 'px;border-top:2px dashed #F2A0AE"></div>';
      h += '<div style="display:grid;grid-template-columns:repeat(' + ndays + ',minmax(0,1fr));gap:' + (ndays > 7 ? 3 : 8) + 'px;align-items:end;height:' + H + 'px;position:relative">' + series.map((d) => '<button data-act="csel" data-k="' + d.key + '" style="height:100%;display:flex;align-items:flex-end" aria-label="' + esc(E.niceDate(d.key)) + ' ' + fmt(d.total) + '"><span style="display:block;width:100%;height:' + Math.max(3, d.total / top * H).toFixed(0) + 'px;border-radius:' + (ndays > 7 ? 4 : 9) + 'px;background:' + (c.sel === d.key ? '#1B1B1F' : d.total > budgetDay && budgetDay ? '#F2A0AE' : '#CDC6F2') + '"></span></button>').join('') + '</div>';
      h += '<div class="row between s12 muted" style="margin-top:6px">' + (ndays > 7 ? '<span>1</span><span>8</span><span>15</span><span>22</span><span>' + ndays + '</span>' : 'MTWTFSS'.split('').map((x) => '<span>' + x + '</span>').join('')) + '</div></div>';
      if (c.sel && c.sel >= A && c.sel <= B) {
        const dl = recs.filter((r) => r.date === c.sel && L.mySpendOf(r, me)).sort((a, b) => L.mySpendOf(b, me) - L.mySpendOf(a, me));
        h += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #EEEDF3"><div class="row between s13"><span class="b">' + esc(E.niceDate(c.sel)) + '</span><span class="b">' + amt(fmt(L.mySpend(dl, me).total)) + '</span></div>' + (dl.length ? dl.slice(0, 6).map(txRow).join('') : '<div class="s12 muted">No spending.</div>') + '</div>';
      }
      h += '</div>';
    }
    // Category ring
    const cats = Object.entries(every.byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    if (cats.length) {
      const tot = cats.reduce((a, x) => a + x[1], 0); const r = 44; const C = 2 * Math.PI * r; let off = 0;
      const arcs = cats.map(([k, v]) => { const Lg = v / tot * C; const s = '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="' + catDef(k).fg + '" stroke-width="' + (c.cat === k ? 22 : 18) + '" stroke-dasharray="' + Math.max(0.1, Lg - 2).toFixed(1) + ' ' + C.toFixed(1) + '" stroke-dashoffset="' + (-off).toFixed(1) + '" transform="rotate(-90 60 60)" opacity="' + (c.cat && c.cat !== k ? 0.3 : 1) + '"/>'; off += Lg; return s; }).join('');
      h += '<div class="card"><div class="card-h"><span class="t">Where it went</span><span class="s11 b" style="background:#EEEDF3;border-radius:999px;padding:4px 10px">rent &amp; bills hidden</span></div><div class="row" style="gap:12px;align-items:flex-start"><svg width="118" height="118" viewBox="0 0 120 120" style="flex-shrink:0">' + arcs + '<text x="60" y="56" text-anchor="middle" font-size="10" fill="#6B6A75" font-family="PJS">' + (c.cat ? esc(c.cat.split(' ')[0]) : 'everyday') + '</text><text x="60" y="72" text-anchor="middle" font-size="14" font-weight="800" fill="#17171A" font-family="PJS">' + L.shortINR(c.cat ? every.byCat[c.cat] : tot) + '</text></svg>' +
        '<div class="legend grow">' + cats.slice(0, 7).map(([k, v]) => '<button data-act="ccat" data-c="' + esc(k) + '" style="' + (c.cat && c.cat !== k ? 'opacity:.45' : '') + '"><span class="dot" style="background:' + catDef(k).fg + '"></span><span class="grow ell">' + esc(k) + '</span><span class="b">' + amt(fmt(v)) + '</span></button>').join('') + '</div></div>';
      if (c.cat) { const cl = recs.filter((r) => inP(r) && r.category === c.cat && L.mySpendOf(r, me)).sort((a, b) => L.mySpendOf(b, me) - L.mySpendOf(a, me)); h += '<div style="margin-top:6px;border-top:1px solid #EEEDF3">' + cl.slice(0, 8).map(txRow).join('') + '</div>'; }
      h += '</div>';
    } else h += '<div class="card empty">No everyday spending in this period.</div>';
    // Heatmap (month)
    if (c.mode === 'month') {
      const series = L.daySeries(recs, me, from, ndays, false); const mx = Math.max(1, ...series.map((d) => d.total));
      const offset = (from.getDay() + 6) % 7;
      let cells = ''; for (let i = 0; i < offset; i++) cells += '<span></span>';
      series.forEach((d) => { const v = d.total / mx; const col = !d.total ? '#EEEDF3' : v < 0.25 ? '#E4E0F7' : v < 0.5 ? '#CDC6F2' : v < 0.8 ? '#A99EEA' : '#1B1B1F'; cells += '<span style="background:' + col + (d.key === L.isoDate(now) ? ';outline:2px solid #B6D84E' : '') + '" title="' + esc(fmt(d.total)) + '"></span>'; });
      h += '<div class="card"><div class="card-h"><span class="t">Spending calendar</span><span class="s12 muted">darker = more</span></div><div class="heat" style="margin-bottom:5px">' + 'MTWTFSS'.split('').map((x) => '<span class="s11 muted" style="height:auto;text-align:center">' + x + '</span>').join('') + '</div><div class="heat">' + cells + '</div></div>';
      // Needs vs wants
      const nw = { need: 0, want: 0 }; Object.entries(L.mySpend(recs, me, inP).byCat).forEach(([k, v]) => { nw[catDef(k).type === 'need' ? 'need' : 'want'] += v; });
      const nt = nw.need + nw.want;
      if (nt) h += '<div class="card"><div class="card-h"><span class="t">Needs vs wants</span></div><div style="display:flex;height:14px;border-radius:7px;overflow:hidden;gap:3px"><div style="width:' + (nw.need / nt * 100).toFixed(0) + '%;background:#1B1B1F"></div><div style="width:' + (nw.want / nt * 100).toFixed(0) + '%;background:#F2A0AE"></div></div><div class="row between s13" style="margin-top:8px"><span>Needs <b>' + amt(fmt(nw.need)) + '</b></span><span>Wants <b>' + amt(fmt(nw.want)) + '</b></span></div></div>';
    }
    const rep = L.repeatSpends(recs, me, inP).slice(0, 5);
    if (rep.length) h += '<div class="card"><div class="card-h"><span class="t">Repeat spends</span><span class="s12 muted">3+ times</span></div>' + rep.map((x) => '<div class="li">' + catIcon(x.cat) + '<span class="grow"><span class="b s14">' + esc(x.name) + '</span><br><span class="s12 muted">' + x.count + ' times</span></span><span class="amt">' + amt(fmt(x.total)) + '</span></div>').join('') + '</div>';
    // Income vs spend (last 6 months)
    if (c.mode === 'month') {
      const months = []; for (let i = 5; i >= 0; i--) { const d = new Date(from.getFullYear(), from.getMonth() - i, 1); const mk = L.monthKey(d); months.push({ l: d.toLocaleDateString('en-IN', { month: 'short' }), inc: recs.filter((r) => r.kind === 'income' && (r.date || '').startsWith(mk)).reduce((a, r) => a + r.amount, 0), sp: L.mySpend(recs, me, (r) => (r.date || '').startsWith(mk)).total }); }
      const mx2 = Math.max(1, ...months.map((m) => Math.max(m.inc, m.sp)));
      if (months.some((m) => m.inc || m.sp)) h += '<div class="card"><div class="card-h"><span class="t">Income vs spending</span><span class="s12 row" style="gap:10px"><span class="row" style="gap:4px"><span class="dot" style="background:#B6D84E"></span>in</span><span class="row" style="gap:4px"><span class="dot" style="background:#A99EEA"></span>out</span></span></div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;align-items:end;height:120px">' +
        months.map((m) => '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:flex-end;height:100%"><div style="display:flex;gap:3px;align-items:flex-end;height:96px;width:100%"><span style="flex:1;height:' + Math.max(2, m.inc / mx2 * 96).toFixed(0) + 'px;background:#B6D84E;border-radius:5px"></span><span style="flex:1;height:' + Math.max(2, m.sp / mx2 * 96).toFixed(0) + 'px;background:#A99EEA;border-radius:5px"></span></div><span class="s11 muted">' + m.l + '</span></div>').join('') + '</div></div>';
    }
    return h + '</div>';
  }

  function savingsPage() {
    const recs = E.live(D); const now = new Date(); const mk = L.monthKey(now);
    const ess = L.essentialsMonthly(recs, D.me, now, D.bills);
    const total = D.emergency.saved + D.goals.reduce((a, g) => a + (g.saved || 0), 0) + D.sinking.reduce((a, g) => a + (g.saved || 0), 0) + D.investments.reduce((a, g) => a + (g.total || 0), 0);
    const savedMonth = recs.filter((r) => r.kind === 'saving' && (r.date || '').startsWith(mk)).reduce((a, r) => a + r.amount, 0);
    const inc = recs.filter((r) => r.kind === 'income' && (r.date || '').startsWith(mk)).reduce((a, r) => a + r.amount, 0) || D.income.amount;
    const rate = inc ? savedMonth / inc : 0;
    let h = '<div class="page">' + pageHead('Savings');
    h += '<div class="card black"><div class="s13" style="color:#C9C8D1">Total saved</div><div class="xb" style="font-size:32px">' + amt(fmt(total)) + '</div><div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><span class="btn" style="background:#2A2A30;color:#fff">Savings rate ' + Math.round(rate * 100) + '% this month</span>' + (D.income.amount ? '<button class="btn lime" data-act="say" data-text="__payday">Split payday</button>' : '') + '</div><div class="s12" style="color:#C9C8D1;margin-top:8px">' + (rate >= 0.2 ? 'Great! 20% or more is a strong savings rate.' : 'Aim for 20% of your income. Pay yourself first on payday.') + '</div></div>';
    const plan = E.splitPlan(D); if (plan.length) h += '<div class="s12 muted" style="padding:0 6px">Next ₹1,000 should go to: <b>' + esc(plan[0].label) + '</b></div>';
    // Emergency
    const target = ess * 6;
    h += '<div class="card" style="background:#F9D4DA"><div class="card-h"><span class="t">Emergency fund</span><button class="btn black" data-act="sheet" data-s="addmoney" data-k="emergency">Add money</button></div><div class="xb" style="font-size:22px">' + amt(fmt(D.emergency.saved)) + '</div>' +
      (ess ? '<div class="s13" style="color:#3E3B52">Covers ' + (D.emergency.saved / ess).toFixed(1) + ' months of essentials (' + fmt(ess) + '/month). Target: ' + fmt(target) + ' (6 months).</div><div class="bar" style="margin-top:8px;background:rgba(255,255,255,.7)"><i style="width:' + Math.min(100, D.emergency.saved / Math.max(1, target) * 100).toFixed(0) + '%;background:#1B1B1F"></i></div>' : '<div class="s13" style="color:#3E3B52">Log a month of spending and I\'ll work out your target (6 months of essentials).</div>') + '</div>';
    // Goals
    h += '<div class="card" style="background:#E4E0F7"><div class="card-h"><span class="t">Goals</span><span class="s12" style="color:#3E3B52">type: goal bike 60000 by june</span></div>' + (D.goals.length ? D.goals.map((g) => { const m = L.goalMonthly(g, now); return '<div style="padding:8px 0"><div class="row between"><span class="b">' + esc(g.name) + '</span><button class="btn" style="background:#fff" data-act="sheet" data-s="addmoney" data-k="goal:' + g.id + '">Add</button></div><div class="s13">' + amt(fmt(g.saved) + ' of ' + fmt(g.target)) + (g.by ? ' · by ' + new Date(g.by + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '') + (m ? ' · ' + fmt(m) + '/month' : '') + '</div><div class="bar" style="margin-top:6px;background:#fff"><i style="width:' + Math.min(100, (g.saved || 0) / g.target * 100).toFixed(0) + '%;background:#1B1B1F"></i></div></div>'; }).join('') : '<div class="s13" style="color:#3E3B52">No goals yet.</div>') + '</div>';
    // Sinking
    h += '<div class="card" style="background:#E8F7B8"><div class="card-h"><span class="t">Sinking funds</span><span class="s12" style="color:#3F4A16">type: sinking fund insurance 12000 due feb</span></div><div class="s12" style="color:#3F4A16;margin-bottom:6px">For yearly costs like insurance, festivals and bike service, set aside a little each month.</div>' + (D.sinking.length ? D.sinking.map((g) => '<div style="padding:6px 0"><div class="row between"><span class="b">' + esc(g.name) + '</span><button class="btn" style="background:#fff" data-act="sheet" data-s="addmoney" data-k="sink:' + g.id + '">Add</button></div><div class="s13">' + amt(fmt(g.saved) + ' of ' + fmt(g.target)) + (g.due ? ' · due ' + g.due : '') + '</div></div>').join('') : '') + '</div>';
    // Investments
    h += '<div class="card" style="background:#DCEAF4"><div class="card-h"><span class="t">Investments</span><span class="s12" style="color:#3E3B52">type: sip 5000 on 5th</span></div>' + (D.investments.length ? D.investments.map((i) => '<div class="row between" style="padding:6px 0"><span><span class="b">' + esc(i.name) + '</span><br><span class="s12" style="color:#3E3B52">' + fmt(i.amount) + ' every month on the ' + i.day + '</span></span><span class="xb">' + amt(fmt(i.total || 0)) + '</span></div>').join('') : '<div class="s13" style="color:#3E3B52">Track SIPs, PPF, EPF and NPS contributions here.</div>') + '</div>';
    return h + '</div>';
  }

  function personPage(name) {
    const p = D.people.find((x) => same(x.name, name)) || { name };
    const recs = E.live(D); const now = new Date();
    const per = ui.personPer || 'month';
    const filt = per === 'month' ? (r) => (r.date || '').startsWith(L.monthKey(now)) : per === 'last' ? (r) => (r.date || '').startsWith(L.monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))) : null;
    const st = L.togetherStats(recs, D.me, p.name, filt);
    const bal = L.balanceWith(recs, D.me, p.name);
    const lw = L.loansWith(recs, D.me, p.name);
    let h = '<div class="page">' + pageHead('You &amp; ' + esc(p.name));
    h += '<div class="seg sm" style="grid-template-columns:repeat(3,1fr)">' + [['month', 'This month'], ['last', 'Last month'], ['all', 'All time']].map(([k, v]) => '<button class="' + (per === k ? 'on' : '') + '" data-act="pper" data-v="' + k + '">' + v + '</button>').join('') + '</div>';
    h += '<div class="card lav"><div class="s12" style="color:#3E3B52">Spent together</div><div class="xb" style="font-size:30px">' + amt(fmt(st.together)) + '</div><table class="tbl" style="margin-top:8px"><tbody>' +
      [['You paid', st.iPaid], [p.name + ' paid', st.theyPaid], ['Your share', st.myShare], [p.name + '\'s share', st.theirShare], ['Your treats', st.myTreats], [p.name + '\'s treats', st.theirTreats]].map(([k, v]) => '<tr><td>' + esc(k) + '</td><td>' + amt(fmt(v)) + '</td></tr>').join('') + '</tbody></table></div>';
    h += '<div class="card row between"><div><div class="s12 muted">Balance now</div><div class="xb" style="font-size:20px">' + (bal === 0 ? 'All settled ✓' : amt(bal > 0 ? p.name + ' owes you ' + fmt(bal) : 'You owe ' + fmt(-bal))) + '</div>' + (lw.lentOut || lw.borrowed ? '<div class="s12 muted">Loans: ' + (lw.lentOut ? 'they owe ' + fmt(lw.lentOut) : '') + (lw.borrowed ? ' you owe ' + fmt(lw.borrowed) : '') + '</div>' : '') + '</div>' + (bal || lw.lentOut || lw.borrowed ? '<button class="btn lime" data-act="say" data-text="settle ' + esc(norm(p.name)) + '">Settle</button>' : '') + '</div>';
    const cats = Object.entries(st.byCat).sort((a, b) => b[1] - a[1]);
    if (cats.length) h += '<div class="card"><div class="card-h"><span class="t">What you share</span></div>' + cats.map(([k, v]) => '<div style="padding:6px 0"><div class="row between s13"><span>' + esc(k) + '</span><span class="b">' + amt(fmt(v)) + '</span></div><div class="bar" style="margin-top:5px"><i style="width:' + (v / cats[0][1] * 100).toFixed(0) + '%;background:' + catDef(k).fg + '"></i></div></div>').join('') + '</div>';
    h += '<div class="card"><div class="card-h"><span class="t">Settle up</span></div><div class="chips">' + [['', 'Whenever'], ['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']].map(([k, v]) => '<button class="chip ' + ((p.settle || '') === k ? 'on' : '') + '" style="background:' + ((p.settle || '') === k ? '' : '#F5F4FA') + '" data-act="pset" data-name="' + esc(p.name) + '" data-v="' + k + '">' + v + '</button>').join('') + '</div>' +
      '<div class="s12 muted" style="margin-top:10px">Split ratio: <b>' + (p.ratio ? p.ratio.mine + '/' + p.ratio.theirs : '50/50') + '</b> · change by typing <b>split with ' + esc(norm(p.name)) + ' 60 40</b></div>' +
      '<div class="s12 muted" style="margin-top:6px">Always split: <b>' + (Object.entries(D.autoSplit).filter(([, v]) => v.some((x) => same(x, p.name))).map(([k]) => k).join(', ') || 'nothing yet') + '</b> · type <b>always split groceries with ' + esc(norm(p.name)) + '</b></div></div>';
    const shared = recs.filter((r) => (r.kind === 'expense' || r.kind === 'settlement' || r.kind === 'loan') && L.involves(r, D.me) && L.involves(r, p.name) && (!filt || filt(r))).sort((a, b) => b.createdAt - a.createdAt).slice(0, 15);
    if (shared.length) h += '<div class="card"><div class="card-h"><span class="t">Recent together</span></div>' + shared.map(txRow).join('') + '</div>';
    return h + '</div>';
  }

  function settingsPage() {
    const row = (key, d, bg, title, sub, right) => '<button class="set-row" data-act="sheet" data-s="' + key + '"><span class="ic" style="background:' + bg + '">' + svg(d, 1.9) + '</span><span class="grow"><span class="b s14" style="display:block">' + title + '</span>' + (sub ? '<span class="s12 muted">' + sub + '</span>' : '') + '</span>' + (right != null ? right : '<span class="muted">' + svg(P.chev, 2, 'width="16" height="16"') + '</span>') + '</button>';
    const tog = (key, on, d, bg, title, sub) => '<button class="set-row" data-act="toggle" data-k="' + key + '"><span class="ic" style="background:' + bg + '">' + svg(d, 1.9) + '</span><span class="grow"><span class="b s14" style="display:block">' + title + '</span><span class="s12 muted">' + sub + '</span></span><span class="toggle ' + (on ? 'on' : '') + '"><i></i></span></button>';
    const val = (t) => '<span class="s13 b" style="margin-right:4px">' + t + '</span><span class="muted">' + svg(P.chev, 2, 'width="16" height="16"') + '</span>';
    let h = '<div class="page">' + pageHead('Account &amp; settings');
    h += '<div class="card row" style="gap:14px"><span style="width:64px;height:64px;border-radius:32px;background:#F5F4FA;display:inline-flex;align-items:center;justify-content:center">' + cookie(52) + '</span><div class="grow"><div class="xb" style="font-size:20px">' + esc(D.me) + '</div><div class="s13 muted">' + esc(D.myUpi || 'No UPI ID yet') + '</div><div class="row" style="gap:6px;margin-top:6px"><span class="btn ' + (D.sync.url ? 'lime' : '') + '" style="padding:4px 10px;font-size:11px">' + (D.sync.url ? 'Synced' : 'On this phone') + '</span></div></div><button class="btn black" data-act="sheet" data-s="profile">Edit</button></div>';
    const bills = D.bills.filter((b) => !b.stopped);
    h += '<div class="set-sec"><div class="h">MONEY SETUP</div>' + row('income', P.wallet, '#E8F7B8', 'Income &amp; payday', D.income.amount ? 'Payday on the ' + ord(D.income.payday) : 'Not set', val(D.income.amount ? amt(fmt(D.income.amount)) : '')) +
      row('budgets', P.pie, '#F9D4DA', 'Budgets', Object.keys(D.catBudgets).length + ' category limit' + (Object.keys(D.catBudgets).length === 1 ? '' : 's'), val(D.budget ? amt(fmt(D.budget)) : '')) +
      row('bills', P.bill, '#DCEAF4', 'Bills &amp; EMIs', bills.map((b) => b.name).slice(0, 4).join(', ') || 'None yet', val(bills.length)) +
      row('categories', P.tag, '#CDC6F2', 'Categories', E.allCats(D).length + ' categories · ' + Object.keys(D.learned).length + ' words learned') + '</div>';
    h += '<div class="set-sec"><div class="h">PEOPLE</div>' + row('people', P.ppl, '#CDC6F2', 'People you split with', D.people.map((p) => p.name).join(', ') || 'None yet', val(D.people.length)) +
      row('shortcuts', P.bolt, '#E4E0F7', 'Shortcuts', Object.keys(D.shortcuts).map((k) => '"' + k + '"').join(', ') || 'like "flat" = you, Arjun, Ram') + '</div>';
    h += '<div class="set-sec"><div class="h">COOKIE</div>' + row('reminders', P.bell, '#F9D4DA', 'Reminders', D.reminders.on ? 'Morning at ' + hourLabel(D.reminders.morning) + ', nightly nudge at ' + hourLabel(D.reminders.night) : 'Off') +
      row('chathist', P.msg, '#E4E0F7', 'Chat history', 'Chat opens fresh every day · old chats ' + E.keepLabel(D.chatKeep == null ? 7 : D.chatKeep), val(D.chatKeep < 0 ? 'Forever' : D.chatKeep === 0 ? '1 day' : (D.chatKeep == null ? 7 : D.chatKeep) + ' days')) +
      row('payments', P.msg, '#FCE3C4', 'Payment detection', D.sms.enabled ? 'Watching bank SMS for UPI and card payments' : 'Off · catch UPI payments automatically', val(D.sms.enabled ? 'On' : 'Off')) + '</div>';
    h += '<div class="set-sec"><div class="h">PRIVACY</div>' + tog('hideNames', D.hideNames, P.eye, '#EEEDF3', 'Hide names in Ask AI', 'Friends shown as Friend 1, 2') + tog('hideAmounts', D.hideAmounts, P.eye, '#EEEDF3', 'Hide amounts', 'Blur numbers when someone is looking') + '</div>';
    h += '<div class="set-sec"><div class="h">DATA</div>' + row('sync', P.sync, '#DCEAF4', 'Shared sync (Google Sheets)', D.sync.url ? 'Connected' + (D.sync.last ? ' · last ' + timeAgo(D.sync.last) : '') : 'Not set up', val(D.sync.url ? 'On' : 'Off')) +
      row('backup', P.down, '#E8F7B8', 'Backup &amp; restore', 'Copy everything, or restore a backup') + '</div>';
    h += '<div class="set-sec"><div class="h">ABOUT</div><div class="set-row"><span class="ic" style="background:#EEEDF3">' + svg(P.info, 1.9) + '</span><span class="grow"><span class="b s14">Cookie &amp; Milk</span><br><span class="s12 muted">Version 2.0 · type <b>help</b> in the chat for tips</span></span></div></div>';
    return h + '<div style="height:20px"></div></div>';
  }
  const ord = (n) => { const x = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (x[(v - 20) % 10] || x[v] || x[0]); };
  const hourLabel = (h) => { const hh = Math.floor(h); const mm = Math.round((h - hh) * 60); return new Date(2000, 0, 1, hh, mm).toLocaleTimeString('en-IN', { hour: 'numeric', minute: mm ? '2-digit' : undefined }); };
  function timeAgo(ts) { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'just now' : m < 60 ? m + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; }

  // ---------- Sheets ----------
  function sheetView() {
    const s = ui.sheet; let inner = '';
    const head = (t) => '<div class="grabber"></div><div class="row between"><span class="b" style="font-size:18px">' + t + '</span><button class="icon-btn" style="background:#F5F4FA;width:38px;height:38px" data-act="close" aria-label="Close">' + svg(P.close) + '</button></div>';
    if (s.type === 'record') inner = recordSheet(s, head);
    else if (s.type === 'plus') inner = head('Add') + [['form', P.grid, 'Add with a form', 'Pick category, people and split'], ['income-form', P.wallet, 'Add income', 'Salary, freelance, bonus'], ['save-form', P.down, 'Save money', 'Into a savings pot'], ['paste', P.msg, 'Paste a bank SMS', 'I\'ll read the payment from it']].map(([k, d, t, sub]) => '<button class="set-row" data-act="sheet" data-s="' + k + '"><span class="ic" style="background:#F5F4FA">' + svg(d) + '</span><span class="grow"><span class="b s14" style="display:block">' + t + '</span><span class="s12 muted">' + sub + '</span></span></button>').join('');
    else if (s.type === 'income-form') inner = head('Add income') + '<input id="f-amt" class="inp big" inputmode="decimal" placeholder="₹0"><input id="f-note" class="inp" placeholder="Salary" value="Salary"><button class="primary" data-act="f-income">Add income</button>';
    else if (s.type === 'save-form' || s.type === 'addmoney') {
      const keys = [['emergency', 'Emergency fund']].concat(D.goals.map((g) => ['goal:' + g.id, g.name])).concat(D.sinking.map((g) => ['sink:' + g.id, g.name + ' fund'])).concat(D.investments.map((i) => ['inv:' + i.id, i.name]));
      const sel = s.k && keys.some(([k]) => k === s.k) ? s.k : 'emergency';
      inner = head('Save money') + '<input id="f-amt" class="inp big" inputmode="decimal" placeholder="₹0"><div class="chips">' + keys.map(([k, v]) => '<button class="chip ' + (sel === k ? 'on' : '') + '" style="' + (sel === k ? '' : 'background:#F5F4FA') + '" data-act="pick-pot" data-k="' + esc(k) + '">' + esc(v) + '</button>').join('') + '</div>' +
        (s.k === 'goals' || s.k === 'sinking' || s.k === 'invest' ? '<div class="s13 muted">Tip: create one in the chat, like <b>' + (s.k === 'goals' ? 'goal bike 60000 by june' : s.k === 'sinking' ? 'sinking fund insurance 12000 due feb' : 'sip 5000 on 5th') + '</b>.</div>' : '') + '<button class="primary" data-act="f-save" data-k="' + esc(sel) + '">Save</button>';
    }
    else if (s.type === 'paste') inner = head('Paste a bank SMS') + '<textarea id="f-sms" class="inp" rows="5" placeholder="Rs 450 debited from A/c XX1234 to swiggy@icici..."></textarea><button class="primary" data-act="f-paste">Read it</button>';
    else inner = settingsSheet(s, head);
    return '<div class="backdrop" data-act="backdrop"><div class="sheet">' + inner + '</div></div>';
  }

  function recordSheet(s, head) {
    const f = s.f;
    if (f.kind !== 'expense') {
      const r = D.records.find((x) => x.id === f.id);
      return head(esc(E.recLine(D, r))) + '<div class="s13 muted">' + esc(E.niceDate(r.date)) + '</div>' + (r.kind === 'loan' && L.loanOutstanding(r) ? '<button class="primary" data-act="loan-done" data-id="' + r.id + '">Mark fully returned</button>' : '') + '<button class="danger" data-act="del" data-id="' + r.id + '">Delete</button>';
    }
    const cats = E.allCats(D);
    const ppl = [D.me].concat(D.people.map((p) => p.name));
    let h = head(f.id ? 'Edit expense' : 'Add expense');
    h += '<div class="row" style="gap:4px"><span class="xb" style="font-size:36px">₹</span><input id="f-amt" class="inp big" inputmode="decimal" placeholder="0" value="' + esc(f.amount || '') + '" data-f="amount"></div>';
    h += '<input class="inp" placeholder="What was it?" value="' + esc(f.note || '') + '" data-f="note" aria-label="Note"><input type="date" class="inp" value="' + esc(f.date) + '" data-f="date" aria-label="Date">';
    h += '<span class="lbl2">Category</span><div class="cat-grid">' + cats.map((c) => { const d = catDef(c); return '<button class="cat-pick ' + (f.category === c ? 'on' : '') + '" style="background:' + (d.dark ? '#E9E8EF' : d.bg) + '" data-act="f-cat" data-c="' + esc(c) + '">' + svg(d.d) + esc(c) + '</button>'; }).join('') + '</div>';
    if (D.people.length) {
      h += '<span class="lbl2">Shared with</span><div class="chips">' + ppl.map((p) => '<button class="chip ' + (f.parts.includes(p) ? 'on' : '') + '" style="' + (f.parts.includes(p) ? '' : 'background:#F5F4FA') + '" data-act="f-part" data-p="' + esc(p) + '">' + esc(same(p, D.me) ? 'You' : p) + '</button>').join('') + '</div>';
      if (f.parts.length > 1) {
        h += '<span class="lbl2">Paid by</span><div class="chips">' + f.parts.map((p) => '<button class="chip ' + (same(f.payer, p) ? 'on' : '') + '" style="' + (same(f.payer, p) ? '' : 'background:#F5F4FA') + '" data-act="f-payer" data-p="' + esc(p) + '">' + esc(same(p, D.me) ? 'You' : p) + '</button>').join('') + '</div>';
        h += '<div class="seg lime sm" style="grid-template-columns:repeat(3,1fr)">' + [['equal', 'Equal'], ['custom', 'Custom'], ['treat', 'Treat']].map(([k, v]) => '<button class="' + (f.split === k ? 'on' : '') + '" data-act="f-split" data-v="' + k + '">' + v + '</button>').join('') + '</div>';
        if (f.split === 'custom') h += f.parts.map((p) => '<div class="row"><span class="grow s14 b">' + esc(same(p, D.me) ? 'Your share' : p + '\'s share') + '</span><input class="inp" style="max-width:130px" inputmode="decimal" data-share="' + esc(p) + '" value="' + esc(f.custom[p] != null ? f.custom[p] : '') + '"></div>').join('');
      }
    }
    h += '<div class="chips"><button class="chip ' + (f.claim ? 'on' : '') + '" style="' + (f.claim ? '' : 'background:#F5F4FA') + '" data-act="f-claim">Office claim</button>' + ['upi', 'card', 'cash'].map((m) => '<button class="chip ' + (f.method === m ? 'on' : '') + '" style="' + (f.method === m ? '' : 'background:#F5F4FA') + '" data-act="f-method" data-v="' + m + '">' + m.toUpperCase() + '</button>').join('') + '</div>';
    h += '<button class="primary" data-act="f-rec-save">' + (f.id ? 'Save changes' : 'Add expense') + '</button>';
    if (f.id) h += '<button class="danger" data-act="del" data-id="' + f.id + '">Delete expense</button>';
    return h;
  }

  function openRecord(id) {
    const r = id ? D.records.find((x) => x.id === id) : null;
    if (r && r.kind !== 'expense') { ui.sheet = { type: 'record', f: { id: r.id, kind: r.kind } }; render(); return; }
    const parts = r ? Object.keys(r.shares || {}) : [D.me];
    if (r && !parts.some((p) => same(p, r.paidBy))) parts.push(r.paidBy);
    ui.sheet = { type: 'record', f: r ? { id: r.id, kind: 'expense', amount: r.amount, note: r.note, date: r.date, category: r.category, parts, payer: r.paidBy, split: r.split === 'treat' ? 'treat' : r.split === 'custom' || r.split === 'for' ? 'custom' : 'equal', custom: Object.assign({}, r.shares), claim: !!r.claim, method: r.method || null }
      : { id: null, kind: 'expense', amount: '', note: '', date: L.isoDate(new Date()), category: 'Food & Drink', parts: [D.me], payer: D.me, split: 'equal', custom: {}, claim: false, method: null } };
    render();
  }
  function saveRecordForm() {
    const f = ui.sheet.f;
    const amount = L.round2(Number(String(f.amount).replace(/[^0-9.\-]/g, '')));
    if (!amount) return toast('Enter an amount');
    let shares = {};
    if (f.parts.length <= 1) shares[D.me] = amount;
    else if (f.split === 'treat') f.parts.forEach((p) => { shares[p] = same(p, f.payer) ? amount : 0; });
    else if (f.split === 'custom') { let sum = 0; f.parts.forEach((p) => { const v = Number(f.custom[p]) || 0; shares[p] = v; sum += v; }); if (Math.abs(sum - amount) > 0.5) return toast('Shares add up to ' + fmt(sum) + ', not ' + fmt(amount)); }
    else shares = L.equalShares(amount, f.parts, f.payer, E.ctx(D).ratios);
    E.snapshot(D, 'edit');
    if (f.id) {
      const r = D.records.find((x) => x.id === f.id);
      Object.assign(r, { amount, note: f.note || f.category, date: f.date, category: f.category, paidBy: f.payer, shares, split: f.parts.length <= 1 ? 'equal' : f.split, claim: f.claim || undefined, claimStatus: f.claim ? (r.claimStatus || 'pending') : undefined, method: f.method });
      E.touch(r);
      const w = norm(f.note).split(' ')[0]; if (w && w.length > 2) D.learned[w] = f.category;
      D.chat.forEach((m) => { if (m.card && m.card.type === 'confirm' && m.card.recId === r.id) { m.card.text = E.recLine(D, r); m.card.pickCat = false; } });
      toast('Saved');
    } else {
      const r = E.addRecord(D, { kind: 'expense', amount, note: f.note || f.category, date: f.date, category: f.category, paidBy: f.payer, shares, split: f.parts.length <= 1 ? 'equal' : f.split, claim: f.claim || undefined, claimStatus: f.claim ? 'pending' : undefined, method: f.method });
      E.say(D, '', { type: 'confirm', recId: r.id, text: E.recLine(D, r) });
      ui.scroll = true; ui.view = 'chat';
    }
    popSheet(); afterChange();
  }

  function settingsSheet(s, head) {
    const t = s.type;
    if (t === 'profile') return head('Your profile') + '<span class="lbl2">Your name</span><input id="p-name" class="inp" value="' + esc(D.me) + '"><span class="lbl2">Your UPI ID (so friends can pay you)</span><input id="p-upi" class="inp" placeholder="name@okhdfc" value="' + esc(D.myUpi) + '"><div class="s12 muted">Use the same spelling of your name that your friends use for you on their phones.</div><button class="primary" data-act="p-save">Save</button>';
    if (t === 'income') return head('Income &amp; payday') + '<span class="lbl2">Monthly take-home</span><input id="i-amt" class="inp" inputmode="decimal" value="' + esc(D.income.amount || '') + '"><span class="lbl2">Payday (day of month)</span><input id="i-day" class="inp" inputmode="numeric" value="' + esc(D.income.payday || '') + '"><button class="primary" data-act="i-save">Save</button>';
    if (t === 'budgets') return head('Budgets') + '<span class="lbl2">Overall monthly budget (used if no income is set)</span><input id="b-total" class="inp" inputmode="decimal" value="' + esc(D.budget || '') + '"><span class="lbl2">Category budgets</span>' + E.allCats(D).filter((c) => !L.FIXED.has(c)).map((c) => '<div class="row"><span class="grow s14">' + esc(c) + '</span><input class="inp" style="max-width:120px" inputmode="decimal" placeholder="none" data-bud="' + esc(c) + '" value="' + esc(D.catBudgets[c] || '') + '"></div>').join('') + '<button class="primary" data-act="b-save">Save</button>';
    if (t === 'bills') return head('Bills &amp; EMIs') + (D.bills.filter((b) => !b.stopped).map((b) => '<div class="row"><span class="grow"><span class="b s14">' + esc(b.name) + '</span><br><span class="s12 muted">' + amt(fmt(L.billAmountFor(b, L.monthKey(new Date())))) + ' · ' + (b.freq === 'monthly' ? 'on the ' + b.day : b.freq) + ' · ' + esc(b.category) + '</span></span><button class="icon-btn" style="background:#F5F4FA;width:38px;height:38px" data-act="bill-del" data-id="' + b.id + '" aria-label="Remove ' + esc(b.name) + '">' + svg(P.trash) + '</button></div>').join('') || '<div class="s13 muted">No bills yet.</div>') + '<div class="s13 muted">Add or change bills in the chat: <b>wifi 999 every 10th</b>, <b>rent is 19500 from jan</b>, <b>stop netflix</b>.</div>';
    if (t === 'categories') return head('Categories') + '<div class="chips">' + E.allCats(D).map((c) => '<span class="chip" style="background:' + catDef(c).bg + (catDef(c).dark ? ';color:#fff;background:#1B1B1F' : '') + '">' + esc(c) + (D.customCats.includes(c) ? ' <button data-act="cat-del" data-c="' + esc(c) + '" aria-label="Remove">✕</button>' : '') + '</span>').join('') + '</div><span class="lbl2">Words I\'ve learned</span>' + (Object.keys(D.learned).length ? '<div class="chips">' + Object.entries(D.learned).map(([w, c]) => '<span class="chip" style="background:#F5F4FA">' + esc(w) + ' → ' + esc(c) + ' <button data-act="learn-del" data-w="' + esc(w) + '" aria-label="Forget">✕</button></span>').join('') + '</div>' : '<div class="s13 muted">Teach me with <b>zudio is shopping</b>.</div>') + '<div class="s13 muted">New category: <b>new category pets</b></div>';
    if (t === 'people') return head('People') + (D.people.map((p) => '<div class="row"><span class="ic" style="background:' + avColor(p.name) + '">' + initial(p.name) + '</span><span class="grow"><span class="b s14">' + esc(p.name) + '</span><br><span class="s12 muted">' + esc(p.upi || 'no UPI ID') + (p.settle ? ' · settles ' + p.settle : '') + '</span></span><button class="btn" data-act="open" data-v="person:' + esc(p.name) + '">Open</button><button class="icon-btn" style="background:#F5F4FA;width:38px;height:38px" data-act="person-del" data-name="' + esc(p.name) + '" aria-label="Remove ' + esc(p.name) + '">' + svg(P.trash) + '</button></div>').join('') || '<div class="s13 muted">No one yet.</div>') + '<div class="row"><input id="np-name" class="inp" placeholder="Name"><input id="np-upi" class="inp" placeholder="UPI ID (optional)"></div><button class="primary" data-act="person-add">Add person</button>';
    if (t === 'shortcuts') return head('Shortcuts') + (Object.entries(D.shortcuts).map(([k, v]) => '<div class="row"><span class="grow"><span class="b s14">' + esc(k) + '</span><br><span class="s12 muted">you, ' + esc(v.join(', ')) + '</span></span><button class="icon-btn" style="background:#F5F4FA;width:38px;height:38px" data-act="sc-del" data-k="' + esc(k) + '" aria-label="Remove">' + svg(P.trash) + '</button></div>').join('') || '<div class="s13 muted">No shortcuts yet.</div>') + '<div class="s13 muted">Create one in the chat: <b>flat is arjun ram</b>. Then <b>flat groceries 1200</b> splits it three ways.</div>';
    if (t === 'chathist') { const cur = D.chatKeep == null ? 7 : D.chatKeep; return head('Chat history') + '<div class="s12 muted" style="margin-bottom:10px">The chat always opens fresh each morning. Your entries are never deleted, this only decides how long old chat messages stay (tap "Show yesterday" to see them).</div>' + [[0, 'Only today', 'Old chats deleted every day'], [7, '7 days', 'Default'], [30, '30 days', ''], [-1, 'Keep forever', 'Never delete chats']].map((o) => '<button class="set-row" data-act="chat-keep" data-n="' + o[0] + '"><span class="grow"><span class="b s14">' + o[1] + '</span>' + (o[2] ? '<br><span class="s12 muted">' + o[2] + '</span>' : '') + '</span><span class="toggle ' + (cur === o[0] ? 'on' : '') + '"><i></i></span></button>').join(''); }
    if (t === 'reminders') return head('Reminders') + '<button class="set-row" data-act="toggle" data-k="reminders.on" style="border-top:none"><span class="grow b s14">Reminders on</span><span class="toggle ' + (D.reminders.on ? 'on' : '') + '"><i></i></span></button><span class="lbl2">Morning hello (hour, 0 to 23)</span><input id="r-m" class="inp" inputmode="numeric" value="' + Math.floor(D.reminders.morning) + '"><span class="lbl2">Nightly nudge (hour, 0 to 23)</span><input id="r-n" class="inp" inputmode="numeric" value="' + Math.floor(D.reminders.night) + '"><div class="s12 muted">Bills remind you a day before, loans on their due date, and month-end close on the last day.</div><button class="primary" data-act="r-save">Save</button>';
    if (t === 'payments') return head('Payment detection') + '<div class="s14">When your bank texts you about a UPI or card payment, Cookie pops a notification so you can add it in one tap. I only read payment messages, and nothing leaves your phone.</div>' +
      '<div class="card" style="background:#F5F4FA"><span class="b">Status: </span>' + (D.sms.enabled ? 'On ✓' : 'Off') + (native ? '' : '<div class="s12 muted">Works in the Android app.</div>') + '</div>' +
      (D.sms.enabled ? '<button class="primary" data-act="sms-scan">Check the last 3 days again</button><button class="danger" data-act="sms-off">Turn off</button>' : '<button class="primary" data-act="sms-on">Turn on</button>') +
      '<div class="s12 muted">If Android says the permission is restricted: open Settings › Apps › Cookie &amp; Milk › ⋮ (top right) › Allow restricted settings, then try again.</div>';
    if (t === 'sync') return head('Shared sync') + '<div class="s13 muted">Shared expenses sync through one Google Sheet that everyone uses. Personal expenses stay on your phone. Setup steps are in the app\'s GitHub page (README).</div><span class="lbl2">Apps Script web app URL</span><input id="sy-url" class="inp" placeholder="https://script.google.com/macros/s/.../exec" value="' + esc(D.sync.url) + '"><span class="lbl2">Secret key</span><input id="sy-key" class="inp" value="' + esc(D.sync.key) + '">' + (ui.syncErr ? '<div class="s12 red">' + esc(ui.syncErr) + '</div>' : '') + '<button class="primary" data-act="sy-save">Save and sync now</button>';
    if (t === 'backup') return head('Backup &amp; restore') + '<div class="s13 muted">Copy a backup of everything and keep it in a note or email to yourself. Restoring replaces what\'s on this phone.</div><button class="primary" data-act="bk-copy">Copy backup</button><textarea id="bk-text" class="inp" rows="4" placeholder="Paste a backup here to restore"></textarea><button class="btn black" style="align-self:flex-start" data-act="bk-restore">Restore</button>';
    return head('');
  }

  // ---------- Effects ----------
  function afterChange() { save(); render(); scheduleSync(); scheduleNotifs(); }
  function chatDo(fn) { ui.view = 'chat'; ui.page = null; ui.sheet = null; ui.scroll = true; fn(); afterChange(); }
  function sendText(text) {
    const t = String(text || '').trim(); if (!t) return;
    ui.draft = '';
    // A pasted AI reply? Offer to save it as a plan
    const lastAdvice = [...D.chat].reverse().find((m) => m.card && m.card.type === 'advice');
    if (lastAdvice && t.length > 160 && !/\d{3,}\s*$/.test(t)) { D.chat.push({ id: Math.random().toString(36).slice(2), ts: Date.now(), day: L.isoDate(new Date()), from: 'me', text: t.slice(0, 400) + (t.length > 400 ? '…' : '') }); D.plans = (D.plans || []).concat([{ text: t, date: L.isoDate(new Date()) }]); E.say(D, '📌 Saved as your plan! I\'ll keep it in mind. You can find it under Overview.'); }
    else { const res = E.handle(D, t); handleEffect(res && res.effect); }
    ui.scroll = true; afterChange();
  }
  function handleEffect(eff) {
    if (!eff) return;
    if (eff.type === 'enable-sms') enableSms();
    if (eff.type === 'open') { if (eff.view === 'chat' || eff.view === 'overview') ui.view = eff.view; else openPage(eff.view); }
    if (eff.type === 'upi') { const p = D.people.find((x) => same(x.name, eff.person)); if (!p || !p.upi) return toast('Add ' + eff.person + '\'s UPI ID: type "' + norm(eff.person) + ' upi name@bank"'); window.location.href = 'upi://pay?pa=' + encodeURIComponent(p.upi) + '&pn=' + encodeURIComponent(p.name) + '&am=' + Number(eff.amount).toFixed(2) + '&cu=INR&tn=' + encodeURIComponent('Settle up via Cookie & Milk'); }
    if (eff.type === 'whatsapp') { const msg = eff.text || ('Hey ' + eff.person + '! Quick reminder about the ' + fmt(eff.amount) + ' for our shared expenses 🙂'); const full = msg + (D.myUpi ? '\nYou can pay me at ' + D.myUpi : ''); window.open('https://wa.me/?text=' + encodeURIComponent(full), '_blank'); }
  }
  function openPage(v) { ui.page = v; ui.chart.sel = null; pushNav(); render(); const sub = document.querySelector('.sub'); if (sub) sub.scrollTop = 0; }

  // Back button
  function pushNav() { try { history.pushState({ n: 1 }, ''); } catch (e) {} }
  let ignorePop = false;
  function popSheet() { ui.sheet = null; ignorePop = true; try { history.back(); } catch (e) { ignorePop = false; } render(); }
  window.addEventListener('popstate', () => {
    if (ignorePop) { ignorePop = false; return; }
    if (ui.sheet) { ui.sheet = null; render(); return; }
    if (ui.page) { ui.page = null; render(); return; }
    if (ui.view !== 'chat') { ui.view = 'chat'; ui.scroll = true; render(); pushNav(); return; }
  });

  // Share / copy
  async function shareText(text) {
    try { if (Plug.Share) { await Plug.Share.share({ text, dialogTitle: 'Ask your AI app' }); return; } } catch (e) { if (String(e && e.message).match(/cancel/i)) return; }
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { return; }
    copyText(text);
  }
  async function copyText(text) {
    try { if (Plug.Clipboard) { await Plug.Clipboard.write({ string: text }); toast('Copied! Paste it into your AI app.'); return; } } catch (e) {}
    try { await navigator.clipboard.writeText(text); toast('Copied! Paste it into your AI app.'); } catch (e) { toast('Could not copy on this device'); }
  }

  // Voice
  async function voice() {
    const SR = Plug.SpeechRecognition;
    if (SR && native) {
      try {
        const av = await SR.available(); if (!av.available) return toast('Voice input is not available on this phone');
        const perm = await SR.requestPermissions(); if (perm.speechRecognition && perm.speechRecognition !== 'granted') return toast('Allow the microphone to talk to Cookie');
        const res = await SR.start({ language: 'en-IN', maxResults: 1, prompt: 'Tell Cookie what you spent', partialResults: false, popup: true });
        const text = res && res.matches && res.matches[0]; if (text) sendText(text);
      } catch (e) { if (!/cancel|no match/i.test(String(e && e.message))) toast('Didn\'t catch that, try again'); }
      return;
    }
    const W = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!W) return toast('Voice input works in the Android app');
    const rec = new W(); rec.lang = 'en-IN'; rec.onresult = (ev) => sendText(ev.results[0][0].transcript); rec.onerror = () => toast('Didn\'t catch that'); rec.start(); toast('Listening…');
  }

  // Payment SMS
  async function enableSms() {
    const Sms = Plug.SmsCapture;
    if (!Sms || !native) { E.say(D, 'Payment detection works in the Android app. On this device, you can paste a bank SMS using the <b>+</b> button.'); afterChange(); return; }
    try {
      const r = await Sms.enable();
      if (r.sms === 'granted') {
        D.sms.enabled = true;
        await notifPerms();
        E.say(D, '👀 I\'m watching for payments now! When your bank texts about a UPI or card payment, I\'ll ping you to add it.');
        afterChange();
        const res = await Sms.scanInbox({ since: Date.now() - 2 * 86400000 });
        const n = E.addCaptures(D, (res.items || []).slice(0, 8).reverse());
        if (n) E.say(D, 'I found ' + n + ' recent payment' + (n === 1 ? '' : 's') + ' from the last 2 days. Add the ones you haven\'t logged ☝️');
        ui.scroll = true; afterChange();
      } else {
        E.say(D, 'I need SMS permission to spot payments. If Android blocked it, open <b>Settings › Apps › Cookie &amp; Milk › ⋮ › Allow restricted settings</b>, then turn it on again from my settings (tap me at the top).');
        afterChange();
      }
    } catch (e) { E.say(D, 'Couldn\'t turn on payment detection: ' + esc(e.message || e)); afterChange(); }
  }
  async function pullCaptures() {
    const Sms = Plug.SmsCapture;
    if (!Sms || !native || !D.sms.enabled) return;
    try {
      const res = await Sms.getPending();
      const items = res.items || [];
      if (!items.length) return;
      const n = E.addCaptures(D, items);
      await Sms.clear({ ids: items.map((i) => i.id) });
      if (n) { ui.view = 'chat'; ui.scroll = true; afterChange(); }
    } catch (e) {}
  }

  // Notifications
  const LN = Plug.LocalNotifications;
  async function notifPerms() { if (!LN) return false; try { const p = await LN.checkPermissions(); if (p.display === 'granted') return true; const r = await LN.requestPermissions(); return r.display === 'granted'; } catch (e) { return false; } }
  let notifT;
  function scheduleNotifs() { clearTimeout(notifT); notifT = setTimeout(doSchedule, 1500); }
  async function doSchedule() {
    if (!LN || !native || D.setup !== 'done') return;
    try {
      const p = await LN.checkPermissions(); if (p.display !== 'granted') return;
      const pend = await LN.getPending(); if (pend.notifications && pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) });
      if (!D.reminders.on) return;
      const now = new Date(); const list = [];
      const at = (d, h) => { const x = new Date(d); x.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0); return x; };
      const s = L.safeToSpend(D, E.live(D), now);
      list.push({ id: 1, title: 'Good morning! 🍪', body: s ? 'About ' + fmt(s.perDay) + ' safe to spend today. Tell Cookie what you buy.' : 'Tell Cookie what you spend today.', schedule: { on: { hour: Math.floor(D.reminders.morning), minute: Math.round((D.reminders.morning % 1) * 60) }, allowWhileIdle: true } });
      list.push({ id: 2, title: 'Spent anything today?', body: 'Tell Cookie before you forget 🍪 (tea 40, uber 250...)', schedule: { on: { hour: Math.floor(D.reminders.night), minute: Math.round((D.reminders.night % 1) * 60) }, allowWhileIdle: true } });
      // Bills: a day before due, next 2 months
      let id = 100;
      for (let mo = 0; mo < 2; mo++) {
        const ref = new Date(now.getFullYear(), now.getMonth() + mo, 1);
        L.billsThisMonth(D.bills.filter((b) => !b.stopped), ref).forEach((b) => {
          if (b.paid) return; const d = L.parseISO(b.dueISO); d.setDate(d.getDate() - 1); const when = at(d, 9);
          if (when > now && id < 180) list.push({ id: id++, title: b.name + ' due tomorrow', body: fmt(b.amountNow) + '. Open Cookie to mark it paid.', schedule: { at: when, allowWhileIdle: true } });
        });
      }
      id = 200;
      E.live(D).filter((r) => r.kind === 'loan' && r.due && L.loanOutstanding(r) > 0).forEach((r) => {
        const when = at(L.parseISO(r.due), 10); if (when > now && id < 260) list.push({ id: id++, title: same(r.lender, D.me) ? r.borrower + '\'s ' + fmt(L.loanOutstanding(r)) + ' is due today' : 'Return ' + fmt(L.loanOutstanding(r)) + ' to ' + r.lender + ' today', body: 'Open Cookie & Milk to settle it.', schedule: { at: when, allowWhileIdle: true } });
      });
      const last = at(new Date(now.getFullYear(), now.getMonth(), L.daysInMonth(now)), 20);
      if (last > now) list.push({ id: 5, title: 'Month-end close 🌙', body: 'Two minutes with Cookie: move what\'s left over into savings.', schedule: { at: last, allowWhileIdle: true } });
      await LN.schedule({ notifications: list });
    } catch (e) {}
  }

  // Sync (Google Sheets)
  let syncT, syncing = false;
  function scheduleSync() { clearTimeout(syncT); syncT = setTimeout(() => sync(false), 1500); }
  const syncable = (r) => r.kind === 'settlement' || r.kind === 'loan' || (r.kind === 'expense' && L.isShared(r));
  async function sync(manual) {
    if (!D.sync.url || syncing) { if (manual && !D.sync.url) toast('Add the sheet link first'); return; }
    syncing = true;
    try {
      const push = D.records.filter((r) => syncable(r) && !r.synced).map((r) => { const c = Object.assign({}, r); delete c.synced; return c; });
      const res = await fetch(D.sync.url.trim(), { method: 'POST', body: JSON.stringify({ key: D.sync.key, records: push }) });
      const txt = await res.text(); let data;
      try { data = JSON.parse(txt); } catch (e) { throw new Error('The sheet link didn\'t answer correctly. Check the URL and that the script is deployed as a web app.'); }
      if (data.error) throw new Error(data.error === 'bad key' ? 'The secret key doesn\'t match the one in the script.' : data.error);
      const ids = new Set(push.map((r) => r.id));
      D.records.forEach((r) => { if (ids.has(r.id)) r.synced = true; });
      let changed = 0; const map = new Map(D.records.map((r) => [r.id, r]));
      (data.records || []).forEach((r) => {
        if (!r || !r.id || !L.involves(r, D.me)) return;
        const cur = map.get(r.id);
        if (!cur || (r.updatedAt || 0) > (cur.updatedAt || 0)) { if (r.kind === 'expense' && r.with !== undefined) delete r.with; map.set(r.id, Object.assign({}, r, { synced: true })); changed++; }
      });
      D.records = Array.from(map.values()); D.sync.last = Date.now(); ui.syncErr = '';
      if (manual) toast(changed ? changed + ' update' + (changed > 1 ? 's' : '') + ' from the sheet' : 'All synced');
      save(); if (changed && !ui.sheet) render();
    } catch (e) { ui.syncErr = e.message; if (manual) toast('Sync failed: ' + e.message); }
    finally { syncing = false; }
  }

  // ---------- Events ----------
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const a = t.dataset.act;
    if (a === 'backdrop') { if (e.target === t) { popSheet(); } return; }
    switch (a) {
      case 'noop': return;
      case 'view': ui.view = t.dataset.v; ui.scroll = ui.view === 'chat'; render(); if (ui.view === 'overview') window.scrollTo(0, 0); break;
      case 'settings': if (D.setup === 'done') openPage('settings'); break;
      case 'back': history.back(); break;
      case 'close': popSheet(); break;
      case 'earlier': ui.daysBack = (ui.daysBack || 0) + 1; render(); window.scrollTo(0, 0); break;
      case 'mic': voice(); break;
      case 'plus': ui.sheet = { type: 'plus' }; pushNav(); render(); break;
      case 'card': { const res = E.runAction(D, t.dataset.msg, Number(t.dataset.i)); handleEffect(res && res.effect); ui.scroll = true; afterChange(); break; }
      case 'show-cats': { const m = D.chat.find((x) => x.id === t.dataset.msg); if (m) { m.card.showCats = true; render(); } break; }
      case 'set-cat': { const m = D.chat.find((x) => x.id === t.dataset.msg); if (m) { m.card.options = [{ label: t.dataset.c, action: { do: 'set-cat', recId: m.card.recId, cat: t.dataset.c } }]; E.runAction(D, m.id, 0); m.card.options = null; m.card.done = null; } ui.scroll = true; afterChange(); break; }
      case 'cap-cat': { const m = D.chat.find((x) => x.id === t.dataset.msg); if (m) { const opts = m.card.options; m.card.options = [{ label: t.dataset.c, action: { do: 'capture-add', cat: t.dataset.c, note: m.card.guess && m.card.guess.reason !== 'unknown' && m.card.guess.reason !== 'person' ? m.card.guess.note : m.card.payment.name } }]; m.card.showCats = false; E.runAction(D, m.id, 0); m.card.allOptions = opts; } ui.scroll = true; afterChange(); break; }
      case 'edit': openRecord(t.dataset.id); pushNav(); break;
      case 'undo-rec': { const r = D.records.find((x) => x.id === t.dataset.id); if (r) { E.snapshot(D, 'delete'); r.deleted = true; E.touch(r); if (r.bill) { const b = D.bills.find((x) => x.id === r.bill); if (b) b.paidMonths = (b.paidMonths || []).filter((mk) => mk !== (r.date || '').slice(0, 7)); } toast('Removed'); } afterChange(); break; }
      case 'del': { const r = D.records.find((x) => x.id === t.dataset.id); if (r) { E.snapshot(D, 'delete'); r.deleted = true; E.touch(r); if (r.bill) { const b = D.bills.find((x) => x.id === r.bill); if (b) b.paidMonths = (b.paidMonths || []).filter((mk) => mk !== (r.date || '').slice(0, 7)); } } popSheet(); toast('Deleted'); afterChange(); break; }
      case 'loan-done': { const r = D.records.find((x) => x.id === t.dataset.id); if (r) { E.snapshot(D, 'loan returned'); r.repayments = (r.repayments || []).concat([{ amount: L.loanOutstanding(r), date: L.isoDate(new Date()) }]); E.touch(r); } popSheet(); afterChange(); break; }
      case 'open': openPage(t.dataset.v); if (ui.sheet) ui.sheet = null; break;
      case 'say': { const text = t.dataset.text; if (text === '__payday') { chatDo(() => { if (!E.paydaySplit(D)) E.say(D, 'Add a goal, or log a month of spending first, then I can suggest a payday split.'); }); break; }
        chatDo(() => { const res = E.handle(D, text); handleEffect(res && res.effect); }); break; }
      case 'do': if (t.dataset.t === 'bill-paid') chatDo(() => E.exec(D, { type: 'bill-paid', bill: t.dataset.id }, '')); break;
      case 'ai-share': { const m = D.chat.find((x) => x.id === t.dataset.msg); if (m) shareText(m.card.prompt); break; }
      case 'ai-copy': { const m = D.chat.find((x) => x.id === t.dataset.msg); if (m) copyText(m.card.prompt); break; }
      case 'hf': ui.hist.f = t.dataset.f; render(); break;
      case 'cmode': ui.chart.mode = t.dataset.m; ui.chart.off = 0; ui.chart.sel = null; ui.chart.cat = null; render(); break;
      case 'coff': ui.chart.off = Math.min(0, ui.chart.off + Number(t.dataset.n)); ui.chart.sel = null; render(); break;
      case 'csel': ui.chart.sel = ui.chart.sel === t.dataset.k ? null : t.dataset.k; render(); break;
      case 'ccat': ui.chart.cat = ui.chart.cat === t.dataset.c ? null : t.dataset.c; render(); break;
      case 'pper': ui.personPer = t.dataset.v; render(); break;
      case 'pset': { const p = D.people.find((x) => same(x.name, t.dataset.name)); if (p) { p.settle = t.dataset.v || null; afterChange(); } break; }
      case 'sheet': { const s = t.dataset.s; if (ui.sheet) ui.sheet = { type: s, k: t.dataset.k }; else { ui.sheet = { type: s, k: t.dataset.k }; pushNav(); } if (s === 'form') { ui.sheet = null; openRecord(null); } else render(); break; }
      case 'pick-pot': ui.sheet.k = t.dataset.k; render(); break;
      case 'toggle': { const k = t.dataset.k; if (k === 'reminders.on') D.reminders.on = !D.reminders.on; else D[k] = !D[k]; afterChange(); break; }
      // record form
      case 'f-cat': ui.sheet.f.category = t.dataset.c; render(); break;
      case 'f-part': { const f = ui.sheet.f; const p = t.dataset.p; if (same(p, D.me) && f.parts.length === 1) break; f.parts = f.parts.some((x) => same(x, p)) ? f.parts.filter((x) => !same(x, p)) : f.parts.concat([p]); if (!f.parts.some((x) => same(x, f.payer))) f.payer = f.parts[0]; render(); break; }
      case 'f-payer': ui.sheet.f.payer = t.dataset.p; render(); break;
      case 'f-split': ui.sheet.f.split = t.dataset.v; render(); break;
      case 'f-claim': ui.sheet.f.claim = !ui.sheet.f.claim; render(); break;
      case 'f-method': ui.sheet.f.method = ui.sheet.f.method === t.dataset.v ? null : t.dataset.v; render(); break;
      case 'f-rec-save': saveRecordForm(); break;
      case 'f-income': { const n = Number((document.getElementById('f-amt').value || '').replace(/[^0-9.]/g, '')); if (!n) return toast('Enter an amount'); const note = document.getElementById('f-note').value.trim() || 'Income'; popSheet(); chatDo(() => E.exec(D, { type: 'income', amount: n, label: /salary/i.test(note) ? 'Salary' : note }, '')); break; }
      case 'f-save': { const n = Number((document.getElementById('f-amt').value || '').replace(/[^0-9.]/g, '')); if (!n) return toast('Enter an amount'); const k = t.dataset.k; popSheet(); E.snapshot(D, 'saving'); const label = E.putInPot(D, k, n); toast(fmt(n) + ' saved to ' + label); afterChange(); break; }
      case 'f-paste': { const txt = document.getElementById('f-sms').value; popSheet(); const n = E.addCaptures(D, [{ id: 'paste-' + Date.now(), body: txt, ts: Date.now() }]); if (!n) toast('I couldn\'t find a payment in that message'); ui.view = 'chat'; ui.scroll = true; afterChange(); break; }
      // settings sheets
      case 'p-save': { const n = document.getElementById('p-name').value.trim(); if (n && !same(n, D.me)) { const old = D.me; D.records.forEach((r) => { ['paidBy', 'from', 'to', 'lender', 'borrower', 'owner', 'createdBy'].forEach((k) => { if (same(r[k], old)) r[k] = n; }); if (r.shares) { const s = {}; Object.keys(r.shares).forEach((k) => { s[same(k, old) ? n : k] = r.shares[k]; }); r.shares = s; } if (syncable(r)) E.touch(r); }); D.me = n; } D.myUpi = document.getElementById('p-upi').value.trim(); popSheet(); toast('Saved'); afterChange(); break; }
      case 'i-save': D.income.amount = Number(document.getElementById('i-amt').value.replace(/[^0-9.]/g, '')) || 0; D.income.payday = Math.min(31, Math.max(1, Number(document.getElementById('i-day').value) || 1)); popSheet(); toast('Saved'); afterChange(); break;
      case 'b-save': D.budget = Number(document.getElementById('b-total').value.replace(/[^0-9.]/g, '')) || 0; document.querySelectorAll('[data-bud]').forEach((el) => { const v = Number(el.value.replace(/[^0-9.]/g, '')); if (v) D.catBudgets[el.dataset.bud] = v; else delete D.catBudgets[el.dataset.bud]; }); popSheet(); toast('Budgets saved'); afterChange(); break;
      case 'bill-del': { const b = D.bills.find((x) => x.id === t.dataset.id); if (b) { E.snapshot(D, 'remove bill'); b.stopped = L.monthKey(new Date()); } afterChange(); break; }
      case 'cat-del': D.customCats = D.customCats.filter((c) => c !== t.dataset.c); afterChange(); break;
      case 'learn-del': delete D.learned[t.dataset.w]; afterChange(); break;
      case 'person-add': { const n = document.getElementById('np-name').value.trim(); const u = document.getElementById('np-upi').value.trim(); if (!n) return toast('Enter a name'); if (same(n, D.me) || D.people.some((p) => same(p.name, n))) return toast('That name is already used'); D.people.push({ name: L.titleCase(n), upi: u }); toast(n + ' added'); afterChange(); break; }
      case 'person-del': { const n = t.dataset.name; if (L.balanceWith(E.live(D), D.me, n) && !t.dataset.sure) { t.dataset.sure = '1'; return toast('You still have a balance with ' + n + '. Tap again to remove.'); } D.people = D.people.filter((p) => !same(p.name, n)); afterChange(); break; }
      case 'plan-del': D.plans = (D.plans || []).slice(0, -1); afterChange(); break;
      case 'sc-del': delete D.shortcuts[t.dataset.k]; afterChange(); break;
      case 'chat-keep': D.chatKeep = Number(t.dataset.n); E.pruneChat(D); toast('Chat history: ' + E.keepLabel(D.chatKeep)); afterChange(); break;
      case 'r-save': D.reminders.morning = Math.min(23, Math.max(0, Number(document.getElementById('r-m').value) || 9)); D.reminders.night = Math.min(23, Math.max(0, Number(document.getElementById('r-n').value) || 22)); popSheet(); await notifPerms(); toast('Reminders saved'); afterChange(); break;
      case 'sms-on': popSheet(); ui.page = null; ui.view = 'chat'; enableSms(); break;
      case 'sms-off': D.sms.enabled = false; toast('Payment detection off'); afterChange(); break;
      case 'sms-scan': { const Sms = Plug.SmsCapture; if (!Sms) break; try { const res = await Sms.scanInbox({ since: Date.now() - 3 * 86400000 }); const n = E.addCaptures(D, (res.items || []).slice(0, 10).reverse()); ui.sheet = null; ui.page = null; ui.view = 'chat'; ui.scroll = true; toast(n ? 'Found ' + n + ' new payment' + (n === 1 ? '' : 's') : 'No new payments'); afterChange(); } catch (err) { toast(err.message || 'Could not read messages'); } break; }
      case 'sy-save': D.sync.url = document.getElementById('sy-url').value.trim(); D.sync.key = document.getElementById('sy-key').value.trim(); save(); await sync(true); render(); break;
      case 'bk-copy': copyText(JSON.stringify({ app: 'cookie-and-milk', v: 2, data: Object.assign({}, D, { chat: D.chat.slice(-200) }) })); break;
      case 'bk-restore': { try { const d = JSON.parse(document.getElementById('bk-text').value); if (!d || d.app !== 'cookie-and-milk' || !d.data) throw new Error(); D = Object.assign(E.blank(), d.data); popSheet(); toast('Restored'); afterChange(); } catch (err) { toast('That doesn\'t look like a Cookie & Milk backup'); } break; }
    }
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'cin') { const had = !!(ui.draft && ui.draft.trim()); ui.draft = t.value; if (had !== !!t.value.trim()) { const b = document.querySelector('.composer .mic'); if (b) { const has = !!t.value.trim(); b.classList.toggle('send', has); b.type = has ? 'submit' : 'button'; b.dataset.act = has ? 'noop' : 'mic'; b.innerHTML = svg(has ? P.send : P.mic, 2.2); b.setAttribute('aria-label', has ? 'Send' : 'Speak'); } } return; }
    if (t.id === 'hq') { ui.hist.q = t.value; render(); return; }
    if (ui.sheet && ui.sheet.f) { if (t.dataset.f) ui.sheet.f[t.dataset.f] = t.value; if (t.dataset.share) ui.sheet.f.custom[t.dataset.share] = t.value; }
  });
  document.addEventListener('submit', (e) => { if (e.target.dataset.act === 'send') { e.preventDefault(); const el = document.getElementById('cin'); sendText(el.value); } });

  // Keyboard: keep the input above it
  (function keyboard() {
    const root = document.documentElement; let base = window.innerHeight; let kb = 0;
    function apply(h) { kb = h > 80 ? h : 0; const extra = Math.max(0, kb - Math.max(0, base - window.innerHeight)); root.style.setProperty('--kb', extra + 'px'); document.body.classList.toggle('kb-open', kb > 0); if (kb) setTimeout(() => { const el = document.activeElement; if (el && el.id === 'cin') window.scrollTo(0, document.body.scrollHeight); else if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' }); }, 60); }
    window.addEventListener('resize', () => { if (!kb) base = Math.max(base, window.innerHeight); });
    const K = Plug.Keyboard;
    if (K && K.addListener) { K.addListener('keyboardWillShow', (i) => apply(i.keyboardHeight || 0)); K.addListener('keyboardDidShow', (i) => apply(i.keyboardHeight || 0)); K.addListener('keyboardWillHide', () => apply(0)); }
    else if (window.visualViewport) window.visualViewport.addEventListener('resize', () => apply(window.innerHeight - window.visualViewport.height));
  })();

  // App comes to the front
  function wake() { if (D.setup === 'done') { const before = D.chat.length; E.proactive(D); if (D.chat.length !== before) ui.scroll = true; } pullCaptures(); sync(false); save(); render(); scheduleNotifs(); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
  if (Plug.App && Plug.App.addListener) Plug.App.addListener('resume', wake);
  if (LN && LN.addListener) LN.addListener('localNotificationActionPerformed', () => { ui.view = 'chat'; ui.scroll = true; render(); });

  try { history.replaceState({ n: 0 }, ''); pushNav(); } catch (e) {}
  if (D.setup === 'done') E.proactive(D);
  render();
  wake();
  window.__cookie = { D: () => D, E, L, ui, render, sendText };
})();
