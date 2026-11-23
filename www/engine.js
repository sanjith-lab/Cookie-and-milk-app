/* Cookie & Milk: chat engine. Turns what you type into records and Cookie's replies. No DOM. */
(function (root) {
  'use strict';
  const L = root.Logic || (typeof require !== 'undefined' ? require('./logic.js') : null);
  const fmt = (n, o) => L.formatINR(n, o);
  const { same, norm, round2, isoDate, monthKey, titleCase } = L;

  let clock = () => new Date();
  let idn = 0;
  const uid = () => clock().getTime().toString(36) + (idn++).toString(36) + Math.random().toString(36).slice(2, 6);
  const todayISO = () => isoDate(clock());

  // ---------------- Data ----------------
  function blank() {
    return {
      v: 2, me: '', myUpi: '', people: [], shortcuts: {}, budget: 0, catBudgets: {},
      income: { amount: 0, payday: 1, history: [] }, bills: [], goals: [], sinking: [], emergency: { saved: 0 }, investments: [],
      learned: {}, payees: {}, customCats: [], autoSplit: {}, trip: null, trips: [], safeCap: 0, safeMode: 'with-savings',
      reminders: { morning: 9, night: 22, on: true }, recurAsked: {}, nudged: {}, alerted: {}, hideNames: true, hideAmounts: false,
      plans: [], sync: { url: '', key: '', last: 0 }, sms: { enabled: false, lastScan: 0 }, captured: {}, chat: [], chatKeep: 7, records: [], setup: 'name', pending: null,
    };
  }
  function migrateV1(s, recs) {
    const D = blank();
    const map = { Food: 'Food & Drink', Travel: 'Transport', Fun: 'Entertainment', Health: 'Medical', Bills: 'Bills & Utilities' };
    D.me = s.me; D.myUpi = s.myUpi || ''; D.budget = Number(s.budget) || 0;
    D.people = (s.people || []).map((p) => ({ name: p.name, upi: p.upi || '' }));
    D.bills = (s.bills || []).map((b) => ({ id: uid(), name: b.name, amount: Number(b.amount) || 0, day: Number(b.day) || 1, category: L.guessCategory(norm(b.name).split(' ')).cat, freq: 'monthly', history: [], paidMonths: [] }));
    D.sync = { url: s.syncUrl || '', key: s.syncKey || '', last: s.lastSync || 0 };
    D.records = (recs || []).map((r) => {
      const c = Object.assign({}, r);
      if (c.kind === 'expense') { c.category = map[c.category] || c.category || 'Other'; delete c.with; }
      return c;
    });
    D.setup = 'done';
    return D;
  }
  function people(D) { return D.people || []; }
  function ctx(D) {
    const ratios = { me: D.me };
    people(D).forEach((p) => { if (p.ratio) ratios[norm(p.name)] = p.ratio; });
    const renamed = {}; Object.entries(D.catMeta || {}).forEach(([to, m]) => { renamed[m.from] = to; });
    return { renamed, me: D.me, people: people(D), shortcuts: D.shortcuts, bills: (D.bills || []).filter((b) => !b.stopped), learned: D.learned, autoSplit: D.autoSplit, customCats: D.customCats, ratios, today: clock() };
  }
  const live = (D) => D.records.filter((r) => !r.deleted);
  const allCats = (D) => L.CATS.map((c) => c.name).filter((c) => !(D.hiddenCats || []).includes(c)).concat((D.customCats || []).filter((c) => !L.CATS.some((x) => x.name === c)));

  // ---------------- Messages ----------------
  function say(D, text, card) { const m = { id: uid(), ts: clock().getTime(), day: todayISO(), from: 'cookie', text: text || '', card: card || null }; D.chat.push(m); return m; }
  function mine(D, text) { const m = { id: uid(), ts: clock().getTime(), day: todayISO(), from: 'me', text }; D.chat.push(m); return m; }
  function confirmCard(D, recId, text, extra) { const m = say(D, '', Object.assign({ type: 'confirm', recId, text }, extra || {})); return m; }
  function ask(D, text, options, extra) { return say(D, text, Object.assign({ type: 'ask', options }, extra || {})); }
  const opt = (label, action, style) => ({ label, action, style: style || '' });

  // ---------------- Undo ----------------
  const undoStack = [];
  function snapshot(D, label) {
    const copy = JSON.parse(JSON.stringify(Object.assign({}, D, { chat: [] })));
    undoStack.push({ label, data: copy, chatLen: D.chat.length });
    if (undoStack.length > 8) undoStack.shift();
  }
  function undo(D) {
    const s = undoStack.pop();
    if (!s) return say(D, 'Nothing to undo right now 🍪');
    const chat = D.chat;
    Object.keys(D).forEach((k) => { if (k !== 'chat') delete D[k]; });
    Object.assign(D, s.data, { chat });
    // Mark confirm cards created after the snapshot as undone
    for (let i = s.chatLen; i < chat.length; i++) if (chat[i].card && chat[i].card.type === 'confirm') chat[i].card.undone = true;
    return say(D, 'Undone: ' + s.label + ' ↩︎');
  }

  // ---------------- Records ----------------
  function addRecord(D, r) {
    const now = clock().getTime();
    const rec = Object.assign({ id: uid(), date: todayISO(), createdAt: now, updatedAt: now, createdBy: D.me, synced: false }, r);
    if (D.trip && rec.kind === 'expense' && !rec.trip && !rec.bill) rec.trip = D.trip.id;
    D.records.push(rec);
    return rec;
  }
  function touch(r) { r.updatedAt = clock().getTime(); r.synced = false; }

  function splitText(D, r) {
    const me = D.me;
    if (r.kind !== 'expense') return '';
    if (r.claim) return 'claim pending, not counted as your spend';
    if (r.split === 'treat') return L.same(r.paidBy, me) ? 'your treat' : r.paidBy + "'s treat";
    const others = Object.keys(r.shares || {}).filter((p) => !same(p, me));
    if (!others.length) return 'just you';
    if (same(r.paidBy, me)) {
      const owes = others.filter((p) => L.shareOf(r, p) > 0);
      if (owes.length === 1) return owes[0] + ' owes ' + fmt(L.shareOf(r, owes[0]));
      if (owes.length > 1) {
        const vals = owes.map((p) => L.shareOf(r, p));
        return vals.every((v) => v === vals[0]) ? 'split ' + (others.length + 1) + ' ways, ' + fmt(vals[0]) + ' each' : owes.map((p) => p + ' ' + fmt(L.shareOf(r, p))).join(', ');
      }
      return 'you covered it';
    }
    const myShare = L.shareOf(r, me);
    return myShare ? 'you owe ' + r.paidBy + ' ' + fmt(myShare) : r.paidBy + ' covered it';
  }
  function recLine(D, r) {
    if (r.kind === 'expense') return (r.note || r.category) + ' ' + fmt(r.amount) + ' · ' + r.category + ' · ' + splitText(D, r) + (r.method === 'card' ? ' · card' : r.method === 'cash' ? ' · cash' : '');
    if (r.kind === 'loan') return (same(r.lender, D.me) ? 'Lent ' + fmt(r.amount) + ' to ' + r.borrower : 'Borrowed ' + fmt(r.amount) + ' from ' + r.lender) + (r.due ? ' · return by ' + niceDate(r.due) : '');
    if (r.kind === 'settlement') return same(r.to, D.me) ? r.from + ' paid you ' + fmt(r.amount) : 'You paid ' + r.to + ' ' + fmt(r.amount);
    if (r.kind === 'income') return (r.note || 'Income') + ' ' + fmt(r.amount);
    if (r.kind === 'saving') return 'Saved ' + fmt(r.amount) + ' to ' + r.pot;
    return '';
  }
  function niceDate(iso) {
    const d = L.parseISO(iso);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  // ---------------- Handlers ----------------
  function handle(D, raw) {
    const text = String(raw || '').trim();
    if (!text) return;
    mine(D, text);
    if (D.setup !== 'done') return setupStep(D, text);
    // Pending question (e.g. "How much?")
    if (D.pending) {
      const p = D.pending;
      const num = text.replace(/[₹,\s]/g, '').match(/^(\d+(?:\.\d+)?)k?$/i);
      if (p.type === 'amount' && num) {
        D.pending = null;
        const amount = /k$/i.test(text.trim()) ? Number(num[1]) * 1000 : Number(num[1]);
        const intent = p.intent;
        if (intent.type === 'bill-paid') return billPaid(D, Object.assign({}, intent, { amount }));
        const re = L.parse(text.replace(/[₹,]/g, '') + ' ' + p.raw, ctx(D));
        return exec(D, re.type === 'expense' ? re : Object.assign({}, intent, { amount }), p.raw);
      }
      if (p.type === 'note' && !/\d/.test(text) && text.split(/\s+/).length <= 4) {
        D.pending = null;
        const re = L.parse(text + ' ' + p.intent.amount, ctx(D));
        if (re.type === 'expense') return exec(D, re, text);
      }
      D.pending = null;
    }
    const intent = L.parse(text, ctx(D));
    return exec(D, intent, text);
  }

  function exec(D, it, raw) {
    switch (it.type) {
      case 'empty': return;
      case 'help': return help(D);
      case 'greet': return say(D, greetLine(D));
      case 'undo': return undo(D);
      case 'expense': return expense(D, it, raw);
      case 'bill-paid': return billPaid(D, it);
      case 'bill-add': return billAdd(D, it);
      case 'bill-change': return billChange(D, it);
      case 'bill-stop': return propose(D, 'Stop ' + bill(D, it.bill).name + ' (' + fmt(bill(D, it.bill).amount) + ') from next month?', { kind: 'bill-stop', bill: it.bill });
      case 'income': return income(D, it);
      case 'income-change': return propose(D, 'Salary ' + fmt(D.income.amount || 0) + ' → ' + fmt(it.amount) + ' from ' + monthName(it.from) + '?', { kind: 'income-change', amount: it.amount, from: it.from });
      case 'save': return save(D, it);
      case 'goal': snapshot(D, 'new goal'); D.goals.push({ id: uid(), name: it.name, target: it.target, saved: 0, by: it.by });
        return say(D, '🎯 Goal added: <b>' + esc(it.name) + '</b> ' + fmt(it.target) + (it.by ? '. Save about <b>' + fmt(L.goalMonthly({ target: it.target, saved: 0, by: it.by }, clock())) + ' a month</b> to make it by ' + monthName(it.by) + '.' : '. Add a deadline like "by june" and I\'ll tell you the monthly amount.'));
      case 'sinking': snapshot(D, 'sinking fund'); D.sinking.push({ id: uid(), name: it.name, target: it.target, saved: 0, due: it.due });
        return say(D, '🫙 Sinking fund for <b>' + esc(it.name) + '</b> (' + fmt(it.target) + ') created.' + (it.due ? ' About ' + fmt(L.goalMonthly({ target: it.target, saved: 0, by: it.due }, clock())) + ' a month.' : ''));
      case 'investment': snapshot(D, 'investment'); D.investments.push({ id: uid(), name: it.name, amount: it.amount, day: it.day || clock().getDate(), total: 0 });
        return say(D, '📈 ' + it.name + ' of ' + fmt(it.amount) + ' a month added. I\'ll count it as savings each month.');
      case 'budget': return it.cat || !it.catText ? propose(D, (it.cat ? it.cat + ' budget' : 'Monthly budget') + ' → ' + fmt(it.amount) + '?', { kind: 'budget', cat: it.cat, amount: it.amount }) : say(D, 'I don\'t know the category "' + esc(it.catText) + '". Try something like <b>budget food 8000</b>.');
      case 'math': return mathReply(D, it);
      case 'safe-set': return safeSet(D, it);
      case 'safe-reset': snapshot(D, 'safe spend reset'); D.safeRule = null; D.safeCap = 0;
        return say(D, '✓ Safe to spend is back to automatic: worked out from your ' + (D.income.amount ? 'salary, bills and savings plans' : 'budget') + '.', { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
      case 'chat-keep': return chatKeep(D, it.days);
      case 'chat-clear': D.chatClearedAt = clock().getTime(); return say(D, '🧹 Fresh chat! Everything you logged is still saved.');
      case 'delete': return deleteEntries(D, it);
      case 'delete-person-ask': return ask(D, 'What should I delete?', [opt('Remove ' + it.person + ' from people', { do: 'remove-person', person: it.person }, 'black'), opt('Delete my last entry with ' + it.person, { do: 'intent', intent: { type: 'delete', scope: 'keyword', kw: norm(it.person), all: false } })]);
      case 'edit-last': return editLast(D, it.change);
      case 'list': return listEntries(D, it.text);
      case 'open': say(D, '👉 Opening ' + (it.view === 'charts' ? 'your charts' : it.view) + '.'); return { effect: { type: 'open', view: it.view } };
      case 'enable-sms': return { effect: { type: 'enable-sms' } };
      case 'reminders-toggle': snapshot(D, 'reminders'); D.reminders.on = it.on; return say(D, it.on ? '🔔 Reminders are on.' : '🔕 Reminders are off. Type <b>turn on reminders</b> any time.', { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
      case 'hide-amounts': D.hideAmounts = it.on; return say(D, it.on ? '🙈 Amounts are hidden. Type <b>show amounts</b> to bring them back.' : '👀 Amounts are visible again.');
      case 'cat-rename': return renameCat(D, it);
      case 'unclear': return unclear(D, it);
      case 'safe-cap': return propose(D, 'Keep safe to spend at most ' + fmt(it.amount) + ' a day?', { kind: 'safe-cap', amount: it.amount });
      case 'safe-mode': snapshot(D, 'safe spend mode'); D.safeMode = it.mode; return say(D, it.mode === 'no-savings' ? 'OK, savings plans no longer reduce your safe-to-spend number.' : 'OK, I\'ll set your savings plans aside before working out safe to spend.');
      case 'reminder-time': snapshot(D, 'reminder time'); D.reminders[it.which === 'morning' ? 'morning' : 'night'] = it.hour + it.minute / 60;
        return say(D, '⏰ ' + (it.which === 'morning' ? 'Morning hello' : 'Nightly nudge') + ' moved to ' + hourText(it.hour, it.minute) + '.');
      case 'new-category': if (allCats(D).some((c) => same(c, it.name))) return say(D, it.name + ' already exists.');
        snapshot(D, 'new category'); D.customCats.push(it.name); return say(D, '🗂️ New category <b>' + esc(it.name) + '</b> added. Teach me words for it, like <b>bruno is ' + esc(it.name.toLowerCase()) + '</b>.');
      case 'teach': return teach(D, it);
      case 'shortcut': snapshot(D, 'shortcut'); D.shortcuts[norm(it.name)] = it.people; return say(D, '👥 <b>' + esc(it.name) + '</b> now means you, ' + it.people.join(', ') + '. Try <b>' + esc(it.name) + ' groceries 1200</b>.');
      case 'add-person': return addPerson(D, it.name, it.upi, true);
      case 'person-upi': snapshot(D, 'UPI ID'); person(D, it.person).upi = it.upi; return say(D, '✓ Saved ' + it.person + '\'s UPI ID.');
      case 'my-upi': snapshot(D, 'UPI ID'); D.myUpi = it.upi; return say(D, '✓ Saved your UPI ID, ' + esc(it.upi) + '.');
      case 'settle': return settle(D, it);
      case 'settle-freq': snapshot(D, 'settle schedule'); person(D, it.person).settle = it.freq;
        return say(D, '🗓️ I\'ll remind you to settle with ' + it.person + ' ' + (it.freq === 'daily' ? 'every night' : it.freq === 'weekly' ? 'every Sunday' : 'on the 1st of every month') + '.');
      case 'split-ratio': snapshot(D, 'split ratio'); person(D, it.person).ratio = { mine: it.mine, theirs: it.theirs };
        return say(D, '⚖️ Shared costs with ' + it.person + ' now split ' + it.mine + '/' + it.theirs + ' (you/' + it.person + ').');
      case 'auto-split': snapshot(D, 'auto split'); it.cats.forEach((c) => { D.autoSplit[c] = [it.person]; });
        return say(D, '🏠 ' + it.cats.join(', ') + ' will always be split with ' + it.person + '. Add <b>just me</b> to skip it once.');
      case 'lend': case 'borrow': return loan(D, it);
      case 'gave-ambiguous': return ask(D, 'You gave ' + (it.amount ? fmt(it.amount) : 'money') + ' to ' + esc(it.who) + '. What was it?', [
        opt('Lent, they\'ll return it', { do: 'intent', intent: Object.assign({}, it, { type: 'lend' }) }, 'black'),
        opt('Gift', { do: 'intent', intent: { type: 'expense-direct', amount: it.amount, note: 'Gift for ' + it.who, cat: 'Gifts' } }),
        opt('Paying them back', { do: 'intent', intent: Object.assign({}, it, { type: 'repay-out' }) }),
      ]);
      case 'repay-in': case 'repay-out': return repay(D, it);
      case 'family': if (!it.amount) return askAmount(D, it, raw, 'How much did you send ' + it.who + '?');
        snapshot(D, 'family support');
        { const r = addRecord(D, { kind: 'expense', amount: it.amount, category: 'Family support', note: 'To ' + it.who + (it.note ? ' for ' + it.note : ''), paidBy: D.me, shares: { [D.me]: it.amount }, split: 'equal' });
          return confirmCard(D, r.id, '💛 ' + recLine(D, r)); }
      case 'claim-received': return claimReceived(D, it);
      case 'refund': return refund(D, it);
      case 'trip-start': return tripStart(D, it);
      case 'trip-end': return tripEnd(D);
      case 'whatif': return whatIf(D, it);
      case 'question': return answer(D, it.text);
      case 'advice': return advice(D, it.text);
      case 'settle-advance': {
        snapshot(D, 'advance');
        const r = addRecord(D, { kind: 'settlement', amount: it.amount, from: it.isIn ? it.who : D.me, to: it.isIn ? D.me : it.who });
        return confirmCard(D, r.id, '💚 ' + recLine(D, r), { paid: true });
      }
      case 'expense-direct': {
        snapshot(D, 'expense');
        const r = addRecord(D, { kind: 'expense', amount: it.amount, category: it.cat, note: it.note, paidBy: D.me, shares: { [D.me]: it.amount }, split: 'equal' });
        return confirmCard(D, r.id, recLine(D, r));
      }
      default: return say(D, 'Hmm, I didn\'t get that 🍪 Try <b>tea 40</b>, <b>arjun me pizza 900</b> or type <b>help</b>.');
    }
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function monthName(mk) { if (!mk) return ''; const [y, m] = mk.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); }
  function hourText(h, m) { const d = new Date(2000, 0, 1, h, m || 0); return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }); }
  const bill = (D, id) => D.bills.find((b) => b.id === id) || {};
  const person = (D, name) => people(D).find((p) => same(p.name, name)) || {};

  function askAmount(D, intent, raw, q) {
    D.pending = { type: 'amount', intent, raw };
    const last = lastAmountFor(D, intent.note || (intent.keyWords || []).join(' '));
    const options = last ? [opt(fmt(last) + ' like last time', { do: 'amount', amount: last }, 'lime')] : [];
    return ask(D, q || 'How much for ' + esc(intent.note || 'that') + '?', options);
  }
  function lastAmountFor(D, note) {
    if (!note) return 0;
    const n = norm(note);
    const r = live(D).filter((x) => x.kind === 'expense' && norm(x.note) === n).sort((a, b) => b.createdAt - a.createdAt)[0];
    return r ? r.amount : 0;
  }

  function expense(D, it, raw) {
    if (it.amount == null || !(it.amount > 0)) return askAmount(D, it, raw);
    if (!(it.keyWords || []).length && it.participants.length <= 1 && it.cat === 'Other') {
      D.pending = { type: 'note', intent: it };
      return ask(D, 'What was ' + fmt(it.amount) + ' for? Type it (like <b>lunch</b>) or tap one:', ['Food & Drink', 'Groceries', 'Transport', 'Shopping', 'Bills & Utilities', 'Other'].map((c, i) => opt(c, { do: 'intent', intent: Object.assign({}, it, { cat: c, note: c, keyWords: [c] }) }, i === 0 ? 'black' : '')));
    }
    const dup = live(D).find((r) => r.kind === 'expense' && r.amount === it.amount && norm(r.note) === norm(it.note) && clock().getTime() - r.createdAt < 120000 && Object.keys(r.shares || {}).sort().join() === Object.keys(it.shares || {}).sort().join());
    snapshot(D, (it.note || 'expense') + ' ' + fmt(it.amount));
    const r = addRecord(D, {
      kind: 'expense', amount: it.amount, category: it.cat, note: it.note, paidBy: it.payer, shares: it.shares, split: it.split,
      method: it.method || null, claim: it.claim || undefined, claimStatus: it.claim ? 'pending' : undefined, date: it.date || todayISO(),
    });
    const card = confirmCard(D, r.id, recLine(D, r) + (dup ? ' · added again' : ''), { pickCat: it.cat === 'Other' });
    afterExpense(D, r, it);
    return card;
  }

  function afterExpense(D, r, it) {
    // Budget alerts
    const mk = monthKey(clock());
    const b = D.catBudgets && D.catBudgets[r.category];
    if (b) {
      const used = L.mySpend(live(D), D.me, (x) => (x.date || '').startsWith(mk) && x.category === r.category).total;
      const pct = used / b;
      const key = mk + ':' + r.category;
      if (pct >= 1 && D.alerted[key] !== 100) { D.alerted[key] = 100; say(D, '😟 You\'ve gone over your ' + r.category + ' budget: ' + fmt(used) + ' of ' + fmt(b) + '.', { type: 'mood', mood: 'worried' }); }
      else if (pct >= 0.8 && !D.alerted[key]) { D.alerted[key] = 80; const left = b - used; const daysLeft = L.daysInMonth(clock()) - clock().getDate() + 1; say(D, '🔔 ' + r.category + ' is at ' + Math.round(pct * 100) + '%. ' + fmt(left) + ' left for ' + daysLeft + ' days, about ' + fmt(Math.floor(left / daysLeft)) + ' a day.', { type: 'mood', mood: 'worried' }); }
    }
    // Trip budget
    if (D.trip && r.trip === D.trip.id && D.trip.budget) {
      const spent = L.mySpend(live(D), D.me, (x) => x.trip === D.trip.id).total;
      if (spent > D.trip.budget && !D.trip.overWarned) { D.trip.overWarned = true; say(D, '🏝️ Heads up: ' + D.trip.name + ' trip is over budget, ' + fmt(spent) + ' of ' + fmt(D.trip.budget) + '.'); }
    }
    // Recurring?
    const words = (it.keyWords || []).map(norm);
    const rw = words.find((w) => L.RECURRING_WORDS.includes(w));
    if (rw && !D.recurAsked[rw] && !D.bills.some((x) => norm(x.name).includes(rw))) {
      D.recurAsked[rw] = true;
      ask(D, 'Is ' + esc(r.note) + ' a regular payment? I can remind you and plan for it.', [
        opt('Yes, monthly', { do: 'make-bill', note: r.note, amount: r.amount, cat: r.category, freq: 'monthly', recId: r.id }, 'black'),
        opt('Every 3 months', { do: 'make-bill', note: r.note, amount: r.amount, cat: r.category, freq: 'quarterly', recId: r.id }),
        opt('Every year', { do: 'make-bill', note: r.note, amount: r.amount, cat: r.category, freq: 'yearly', recId: r.id }),
        opt('One-time', { do: 'noop', text: 'Got it, one-time.' }),
      ]);
    }
  }

  function billPaid(D, it) {
    const b = bill(D, it.bill);
    const mk = monthKey(clock());
    b.paidMonths = b.paidMonths || [];
    if (b.paidMonths.includes(mk)) return say(D, '✓ ' + esc(b.name) + ' is already marked paid for this month.');
    snapshot(D, b.name + ' paid');
    const amount = it.amount || L.billAmountFor(b, mk);
    const shares = { [D.me]: amount };
    const rule = D.autoSplit && D.autoSplit[b.category];
    let split = 'equal';
    if (rule && rule.length) Object.assign(shares, L.equalShares(amount, [D.me].concat(rule), D.me, ctx(D).ratios));
    const r = addRecord(D, { kind: 'expense', amount, category: b.category || 'Bills & Utilities', note: b.name, paidBy: D.me, shares, split, bill: b.id, method: it.method || null });
    b.paidMonths.push(mk);
    return confirmCard(D, r.id, b.name + ' ' + fmt(amount) + ' marked paid' + (rule && rule.length ? ' · ' + splitText(D, r) : ''), { paid: true });
  }

  function billAdd(D, it) {
    const exists = D.bills.find((b) => same(b.name, it.name) && !b.stopped);
    if (exists) return billChange(D, { bill: exists.id, amount: it.amount, from: null });
    snapshot(D, 'new bill');
    const cat = L.guessCategory(norm(it.name).split(' '), D.learned).cat;
    const b = { id: uid(), name: it.name, amount: it.amount, day: it.day, category: cat === 'Other' ? 'Bills & Utilities' : cat, freq: it.freq, start: firstMonth(it.day), history: [], paidMonths: [] };
    D.bills.push(b);
    const every = it.freq === 'monthly' ? 'every month on the ' + ordinal(it.day) : it.freq === 'quarterly' ? 'every 3 months' : 'every year';
    return say(D, '🧾 Added <b>' + esc(b.name) + '</b> ' + fmt(b.amount) + ', ' + every + '. I\'ll remind you a day before' + (it.freq !== 'monthly' ? ', and set a little aside each month' : '') + '.');
  }
  // A bill added after its due day this month starts counting next month
  function firstMonth(day) { const n = clock(); return day < n.getDate() ? monthKey(new Date(n.getFullYear(), n.getMonth() + 1, 1)) : monthKey(n); }
  function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

  function billChange(D, it) {
    const b = bill(D, it.bill);
    if (it.askFrom) {
      const next = monthKey(new Date(clock().getFullYear(), clock().getMonth() + 1, 1));
      return ask(D, esc(b.name) + ' ' + fmt(b.amount) + ' → <b>' + fmt(it.amount) + '</b>. From when?', [
        opt('From ' + monthName(next), { do: 'apply', change: { kind: 'bill-change', bill: b.id, amount: it.amount, from: next } }, 'black'),
        opt('From this month', { do: 'apply', change: { kind: 'bill-change', bill: b.id, amount: it.amount, from: monthKey(clock()) } }),
        opt('Cancel', { do: 'noop', text: 'No change.' }),
      ]);
    }
    const from = it.from || monthKey(clock());
    return propose(D, esc(b.name) + ' ' + fmt(L.billAmountFor(b, from)) + ' → <b>' + fmt(it.amount) + '</b> from ' + monthName(from) + '?', { kind: 'bill-change', bill: b.id, amount: it.amount, from });
  }

  function propose(D, text, change) {
    // Clear instructions are applied right away, with an Undo button
    return say(D, applyChange(D, change), { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
  }
  function applyChange(D, c) {
    snapshot(D, 'setting change');
    if (c.kind === 'bill-change') {
      const b = bill(D, c.bill);
      b.history = (b.history || []).filter((h) => h.from !== c.from);
      if (c.from <= monthKey(clock()) && !(b.history || []).length) b.amount = c.amount; else b.history.push({ from: c.from, amount: c.amount });
      return '✓ ' + b.name + ' is ' + fmt(c.amount) + ' from ' + monthName(c.from) + '. Earlier months stay as they were.';
    }
    if (c.kind === 'bill-stop') { const b = bill(D, c.bill); b.stopped = monthKey(new Date(clock().getFullYear(), clock().getMonth() + 1, 1)); return '✓ ' + b.name + ' stopped from next month.'; }
    if (c.kind === 'income-change') { D.income.history = (D.income.history || []).concat([{ from: c.from, amount: c.amount }]); if (c.from <= monthKey(clock())) D.income.amount = c.amount; return '✓ Salary is ' + fmt(c.amount) + ' from ' + monthName(c.from) + '. Safe to spend will update.'; }
    if (c.kind === 'budget') { if (c.cat) D.catBudgets[c.cat] = c.amount; else D.budget = c.amount; return '✓ ' + (c.cat ? c.cat + ' budget' : 'Monthly budget') + ' set to ' + fmt(c.amount) + '.'; }
    if (c.kind === 'safe-cap') { D.safeCap = c.amount; return '✓ Safe to spend will never show more than ' + fmt(c.amount) + ' a day.'; }
    return 'Done.';
  }

  function income(D, it) {
    snapshot(D, 'income');
    const r = addRecord(D, { kind: 'income', amount: it.amount, note: it.label, owner: D.me });
    if (!D.income.amount && it.label === 'Salary') D.income.amount = it.amount;
    if (it.payday) D.income.payday = it.payday;
    else if (it.label === 'Salary') D.income.payday = clock().getDate();
    const m = confirmCard(D, r.id, '🎉 ' + it.label + ' ' + fmt(it.amount) + ' added');
    if (it.label === 'Salary') paydaySplit(D);
    return m;
  }

  function paydaySplit(D) {
    const plan = splitPlan(D);
    if (!plan.length) return;
    const lines = plan.map((p) => '• ' + esc(p.label) + ': <b>' + fmt(p.amount) + '</b>').join('<br>');
    return ask(D, '💰 Pay yourself first! Here\'s my suggested payday split:<br>' + lines, [
      opt('Move it all', { do: 'split-apply', plan }, 'black'), opt('Not now', { do: 'noop', text: 'OK, maybe later. Type <b>save 5000 emergency</b> any time.' }),
    ]);
  }
  function splitPlan(D) {
    const today = clock();
    const plan = [];
    const ess = L.essentialsMonthly(live(D), D.me, today, D.bills);
    const efTarget = ess * 6;
    if (ess && D.emergency.saved < efTarget) plan.push({ pot: 'emergency', label: 'Emergency fund', amount: Math.min(efTarget - D.emergency.saved, Math.round((D.income.amount || 0) * 0.1 / 100) * 100 || 2000) });
    (D.goals || []).forEach((g) => { const m = L.goalMonthly(g, today); if (m) plan.push({ pot: 'goal:' + g.id, label: g.name, amount: m }); });
    (D.sinking || []).forEach((g) => { const m = L.goalMonthly({ target: g.target, saved: g.saved, by: g.due }, today); if (m) plan.push({ pot: 'sink:' + g.id, label: g.name + ' fund', amount: m }); });
    (D.investments || []).forEach((i) => plan.push({ pot: 'inv:' + i.id, label: i.name, amount: i.amount }));
    return plan;
  }
  function putInPot(D, potKey, amount) {
    let label = 'Savings';
    if (potKey === 'emergency') { D.emergency.saved = round2(D.emergency.saved + amount); label = 'Emergency fund'; }
    else if (potKey.startsWith('goal:')) { const g = D.goals.find((x) => 'goal:' + x.id === potKey); if (g) { g.saved = round2((g.saved || 0) + amount); label = g.name; } }
    else if (potKey.startsWith('sink:')) { const g = D.sinking.find((x) => 'sink:' + x.id === potKey); if (g) { g.saved = round2((g.saved || 0) + amount); label = g.name + ' fund'; } }
    else if (potKey.startsWith('inv:')) { const g = D.investments.find((x) => 'inv:' + x.id === potKey); if (g) { g.total = round2((g.total || 0) + amount); label = g.name; } }
    addRecord(D, { kind: 'saving', amount, pot: label, potKey, owner: D.me });
    return label;
  }
  function resolvePot(D, text) {
    const t = norm(text);
    if (/emergency|rainy|buffer/.test(t)) return 'emergency';
    const g = D.goals.find((x) => t.includes(norm(x.name)) || norm(x.name).includes(t));
    if (g) return 'goal:' + g.id;
    const s = D.sinking.find((x) => t.includes(norm(x.name)) || norm(x.name).includes(t));
    if (s) return 'sink:' + s.id;
    const i = D.investments.find((x) => t.includes(norm(x.name)) || /sip|invest|mutual|ppf|nps/.test(t));
    if (i) return 'inv:' + i.id;
    return null;
  }
  function save(D, it) {
    const key = resolvePot(D, it.pot);
    if (!key) {
      const options = [opt('Emergency fund', { do: 'save', pot: 'emergency', amount: it.amount }, 'black')]
        .concat(D.goals.map((g) => opt(g.name, { do: 'save', pot: 'goal:' + g.id, amount: it.amount })))
        .concat([opt('New goal "' + titleCase(it.pot) + '"', { do: 'new-goal-save', name: titleCase(it.pot), amount: it.amount })]);
      return ask(D, 'Where should ' + fmt(it.amount) + ' go?', options);
    }
    snapshot(D, 'saving');
    const label = putInPot(D, key, it.amount);
    return say(D, '🫙 ' + fmt(it.amount) + ' saved to <b>' + esc(label) + '</b>.' + potStatus(D, key));
  }
  function potStatus(D, key) {
    if (key === 'emergency') { const ess = L.essentialsMonthly(live(D), D.me, clock(), D.bills); return ess ? ' That covers ' + (D.emergency.saved / ess).toFixed(1) + ' months of essentials.' : ''; }
    if (key.startsWith('goal:')) { const g = D.goals.find((x) => 'goal:' + x.id === key); return g ? ' ' + Math.round(g.saved / g.target * 100) + '% of ' + fmt(g.target) + '.' : ''; }
    return '';
  }

  function addPerson(D, name, upi, announce) {
    if (same(name, D.me)) return say(D, 'That\'s you 🍪');
    if (people(D).some((p) => same(p.name, name))) return announce ? say(D, name + ' is already in your people.') : null;
    snapshot(D, 'add ' + name);
    D.people.push({ name: titleCase(name), upi: upi || '' });
    return announce ? say(D, '👋 Added <b>' + esc(titleCase(name)) + '</b>. Now try <b>' + esc(norm(name)) + ' me lunch 400</b>.') : null;
  }

  function loan(D, it) {
    if (!it.known) {
      return ask(D, esc(it.who) + ' is new here. Add them?', [
        opt('Add ' + it.who, { do: 'add-then', name: it.who, intent: Object.assign({}, it, { known: true }) }, 'black'), opt('Cancel', { do: 'noop', text: 'OK, nothing saved.' }),
      ]);
    }
    if (!it.amount) return askAmount(D, it, '', 'How much ' + (it.type === 'lend' ? 'did you give ' + esc(it.who) : 'did you borrow from ' + esc(it.who)) + '?');
    snapshot(D, it.type === 'lend' ? 'lent ' + it.who : 'borrowed from ' + it.who);
    const r = addRecord(D, { kind: 'loan', amount: it.amount, lender: it.type === 'lend' ? D.me : it.who, borrower: it.type === 'lend' ? it.who : D.me, due: it.due || null, repayments: [] });
    const m = confirmCard(D, r.id, (it.type === 'lend' ? '🤝 ' : '🙏 ') + recLine(D, r));
    if (!it.due) say(D, 'Want a reminder? Type <b>' + (it.type === 'lend' ? esc(norm(it.who)) + ' returns by 30th' : 'return ' + esc(norm(it.who)) + ' by 30th') + '</b>, or just leave it open.', { type: 'note' });
    return m;
  }

  function repay(D, it) {
    const who = it.who;
    const isIn = it.type === 'repay-in';
    const loans = live(D).filter((r) => r.kind === 'loan' && (isIn ? same(r.lender, D.me) && same(r.borrower, who) : same(r.borrower, D.me) && same(r.lender, who)) && L.loanOutstanding(r) > 0).sort((a, b) => a.createdAt - b.createdAt);
    const loanOut = loans.reduce((a, r) => a + L.loanOutstanding(r), 0);
    const bal = it.known ? L.balanceWith(live(D), D.me, who) : 0;
    if (loanOut > 0) {
      let left = it.amount || loanOut;
      snapshot(D, 'repayment');
      for (const r of loans) {
        if (left <= 0) break;
        const pay = Math.min(left, L.loanOutstanding(r));
        r.repayments = (r.repayments || []).concat([{ amount: pay, date: todayISO() }]); touch(r); left = round2(left - pay);
      }
      const remaining = round2(loanOut - (it.amount || loanOut));
      return say(D, (isIn ? '💚 ' + esc(who) + ' returned ' : '💚 You returned ' + esc(who) + ' ') + fmt(Math.min(it.amount || loanOut, loanOut)) + '. ' + (remaining > 0 ? fmt(remaining) + ' still pending.' : 'All settled! 🎉'));
    }
    if ((isIn && bal > 0) || (!isIn && bal < 0)) {
      const amount = it.amount || Math.abs(bal);
      snapshot(D, 'settle ' + who);
      const r = addRecord(D, { kind: 'settlement', amount, from: isIn ? who : D.me, to: isIn ? D.me : who });
      const nb = L.balanceWith(live(D), D.me, who);
      return confirmCard(D, r.id, '💚 ' + recLine(D, r) + ' · ' + (nb === 0 ? 'all settled' : nb > 0 ? who + ' still owes ' + fmt(nb) : 'you owe ' + who + ' ' + fmt(-nb)), { paid: true });
    }
    if (!it.amount) return say(D, 'There\'s nothing pending with ' + esc(who) + ' right now 🍪');
    return ask(D, esc(who) + ' doesn\'t owe you anything I know of. What is the ' + fmt(it.amount) + '?', [
      opt('Income', { do: 'intent', intent: { type: 'income', amount: it.amount, label: 'From ' + who } }, 'black'),
      opt('An advance (they\'ll owe less later)', { do: 'intent', intent: { type: 'settle-advance', who, amount: it.amount, isIn } }),
      opt('Cancel', { do: 'noop', text: 'OK, nothing saved.' }),
    ]);
  }

  function settle(D, it) {
    if (!it.known) return say(D, 'I don\'t know ' + esc(it.person) + ' yet. Type <b>add ' + esc(norm(it.person)) + '</b> first.');
    const p = person(D, it.person);
    const bal = L.balanceWith(live(D), D.me, p.name);
    const lw = L.loansWith(live(D), D.me, p.name);
    const net = bal + lw.lentOut - lw.borrowed;
    if (!net) return say(D, 'You and ' + esc(p.name) + ' are all settled up 🎉');
    if (net > 0) return ask(D, esc(p.name) + ' owes you <b>' + fmt(net) + '</b>.', [
      opt('Mark ' + fmt(net) + ' received', { do: 'settle-in', person: p.name, amount: net }, 'black'),
      opt('Remind on WhatsApp', { do: 'whatsapp', person: p.name, amount: net }, 'lime'),
    ]);
    return ask(D, 'You owe ' + esc(p.name) + ' <b>' + fmt(-net) + '</b>.', [
      p.upi ? opt('Pay with UPI', { do: 'upi', person: p.name, amount: -net }, 'lime') : null,
      opt('Mark as paid', { do: 'settle-out', person: p.name, amount: -net }, 'black'),
    ].filter(Boolean));
  }

  function settleAll(D, who, amount, isIn) {
    snapshot(D, 'settle ' + who);
    let left = amount;
    const loans = live(D).filter((r) => r.kind === 'loan' && (isIn ? same(r.lender, D.me) && same(r.borrower, who) : same(r.borrower, D.me) && same(r.lender, who)) && L.loanOutstanding(r) > 0);
    for (const r of loans) { const pay = Math.min(left, L.loanOutstanding(r)); if (pay > 0) { r.repayments = (r.repayments || []).concat([{ amount: pay, date: todayISO() }]); touch(r); left = round2(left - pay); } }
    if (left > 0) addRecord(D, { kind: 'settlement', amount: left, from: isIn ? who : D.me, to: isIn ? D.me : who });
  }

  function teach(D, it) {
    snapshot(D, 'teach category');
    const w = norm(it.word);
    D.learned[w] = it.cat;
    let moved = 0;
    if (it.move) live(D).forEach((r) => { if (r.kind === 'expense' && norm(r.note).includes(w) && r.category !== it.cat) { r.category = it.cat; touch(r); moved++; } });
    return say(D, '🧠 Got it: <b>' + esc(it.word) + '</b> is ' + it.cat + ' from now on.' + (it.move ? ' Moved ' + moved + ' past entr' + (moved === 1 ? 'y' : 'ies') + '.' : ''));
  }

  function claimReceived(D, it) {
    const pend = live(D).filter((r) => r.claim && r.claimStatus === 'pending').sort((a, b) => a.createdAt - b.createdAt);
    if (!pend.length) return say(D, 'No pending claims right now 🍪');
    snapshot(D, 'claim received');
    let left = it.amount || pend.reduce((a, r) => a + r.amount, 0); let n = 0;
    for (const r of pend) { if (left <= 0) break; if (r.amount <= left + 0.5) { r.claimStatus = 'received'; touch(r); left -= r.amount; n++; } }
    const still = live(D).filter((r) => r.claim && r.claimStatus === 'pending').reduce((a, r) => a + r.amount, 0);
    return say(D, '💼 Marked ' + n + ' claim' + (n === 1 ? '' : 's') + ' as received.' + (still ? ' ' + fmt(still) + ' still pending.' : ' Nothing pending now.'));
  }

  function refund(D, it) {
    if (!it.amount) return say(D, 'How much was refunded? Try <b>amazon refund 500</b>.');
    const key = norm(it.note).split(' ')[0];
    const orig = live(D).filter((r) => r.kind === 'expense' && r.amount > 0 && key && norm(r.note).includes(key) && r.amount >= it.amount).sort((a, b) => b.createdAt - a.createdAt)[0];
    snapshot(D, 'refund');
    const cat = orig ? orig.category : it.cat;
    const r = addRecord(D, { kind: 'expense', amount: -it.amount, category: cat, note: 'Refund' + (it.note ? ': ' + it.note : ''), paidBy: D.me, shares: { [D.me]: -it.amount }, split: 'equal', refundOf: orig ? orig.id : null });
    return confirmCard(D, r.id, '↩︎ Refund ' + fmt(it.amount) + ' · ' + cat + (orig ? ' · cancels part of "' + orig.note + '"' : '') + ' · lowers your spend', { paid: true });
  }

  function tripStart(D, it) {
    if (D.trip) return say(D, 'You\'re already on the ' + esc(D.trip.name) + ' trip. Type <b>end trip</b> first.');
    snapshot(D, 'start trip');
    D.trip = { id: uid(), name: it.name, budget: it.budget, start: todayISO() };
    return say(D, '🏝️ <b>' + esc(it.name) + ' trip</b> started' + (it.budget ? ' with a budget of ' + fmt(it.budget) : '') + '. Everything you log is tagged to it until you type <b>end trip</b>. Have fun!');
  }
  function tripEnd(D) {
    if (!D.trip) return say(D, 'No trip is running right now.');
    snapshot(D, 'end trip');
    const t = D.trip; t.end = todayISO();
    const recs = live(D).filter((r) => r.trip === t.id);
    const total = recs.reduce((a, r) => a + (r.amount || 0), 0);
    const mineAmt = L.mySpend(recs, D.me).total;
    const byCat = L.mySpend(recs, D.me).byCat;
    const ppl = {};
    recs.forEach((r) => L.participants(r).forEach((p) => { if (!same(p, D.me)) ppl[p] = true; }));
    const owes = Object.keys(ppl).map((p) => ({ p, b: L.balanceWith(recs, D.me, p) })).filter((x) => x.b);
    D.trips.push(t); D.trip = null;
    const rows = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ label: k, value: fmt(v), color: L.catOf(k).fg, pct: v / Math.max(1, mineAmt) }));
    return say(D, '', { type: 'answer', title: '🏝️ ' + t.name + ' trip summary', big: fmt(mineAmt), sub: 'your share of ' + fmt(total) + (t.budget ? ' · budget ' + fmt(t.budget) : ''), rows,
      note: owes.length ? owes.map((x) => x.b > 0 ? x.p + ' owes you ' + fmt(x.b) : 'You owe ' + x.p + ' ' + fmt(-x.b)).join(' · ') : 'No one owes anyone. Clean trip! ✨' });
  }

  function whatIf(D, it) {
    const target = norm(it.target).replace(/^(ordering|buying|eating)\s+/, '');
    const cat = L.resolveCat(target) || null;
    const today = clock();
    let total = 0, months = 0;
    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1); const mk = monthKey(d);
      const s = L.mySpend(live(D), D.me, (r) => (r.date || '').startsWith(mk) && (cat ? r.category === cat : norm(r.note).includes(target.split(' ')[0]))).total;
      if (s > 0 || i === 0) { total += i === 0 ? s / Math.max(1, today.getDate()) * L.daysInMonth(today) : s; months++; }
    }
    const monthly = Math.round(total / Math.max(1, months));
    if (!monthly) return say(D, 'I don\'t see any spending on ' + esc(it.target) + ' yet 🍪');
    return say(D, '', { type: 'answer', title: '🔮 What if you stop ' + esc(it.target) + '?', big: fmt(monthly * 12) + ' a year', sub: 'You spend about ' + fmt(monthly) + ' a month on it', rows: [
      { label: 'In 3 months', value: fmt(monthly * 3) }, { label: 'In 6 months', value: fmt(monthly * 6) }, { label: 'In a year', value: fmt(monthly * 12) },
    ], note: 'Even cutting it in half saves ' + fmt(monthly * 6) + ' a year.' });
  }


  // ---------------- Smarter replies ----------------
  function renameCat(D, it) {
    if (allCats(D).some((c) => same(c, it.to))) return say(D, 'There\'s already a category called ' + esc(it.to) + '.');
    snapshot(D, 'rename category');
    const from = it.from, to = it.to;
    D.records.forEach((r) => { if (r.category === from) { r.category = to; touch(r); } });
    D.bills.forEach((b) => { if (b.category === from) b.category = to; });
    if (D.catBudgets[from] != null) { D.catBudgets[to] = D.catBudgets[from]; delete D.catBudgets[from]; }
    if (D.autoSplit[from]) { D.autoSplit[to] = D.autoSplit[from]; delete D.autoSplit[from]; }
    Object.keys(D.learned).forEach((w) => { if (D.learned[w] === from) D.learned[w] = to; });
    D.catMeta = D.catMeta || {};
    const base = (D.catMeta[from] && D.catMeta[from].from) || from;
    D.catMeta[to] = { from: base };
    delete D.catMeta[from];
    D.customCats = (D.customCats || []).filter((c) => c !== from).concat([to]);
    D.hiddenCats = (D.hiddenCats || []).concat(L.CATS.some((c) => c.name === from) ? [from] : []);
    return say(D, '🏷️ Renamed <b>' + esc(from) + '</b> to <b>' + esc(to) + '</b>. All past entries moved too.', { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
  }

  function mathReply(D, it) {
    const v = it.value;
    const pretty = Math.abs(v) >= 1000 || Number.isInteger(v) ? v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : String(v);
    const opts = [];
    if (it.per && [28, 29, 30, 31].includes(it.per)) opts.push(opt('Use ' + fmt(Math.floor(v)) + ' a day as safe spend', { do: 'intent', intent: { type: 'safe-set', amount: it.total, period: 'month' } }, 'black'));
    if (it.per === 7) opts.push(opt('Use as weekly safe spend', { do: 'intent', intent: { type: 'safe-set', amount: it.total, period: 'week' } }, 'black'));
    return say(D, '🧮 ' + esc(it.label) + ' = <b>' + pretty + '</b>', opts.length ? { type: 'ask', options: opts } : null);
  }

  function safeSet(D, it) {
    snapshot(D, 'safe spend');
    D.safeRule = { amount: it.amount, period: it.period };
    D.safeCap = 0;
    const s = L.safeToSpend(D, live(D), clock());
    const now = clock();
    let msg;
    if (it.period === 'day') msg = '✓ Safe to spend is now <b>' + fmt(it.amount) + ' a day</b>.' + (s.spentToday ? ' You\'ve spent ' + fmt(s.spentToday) + ' today, so ' + (s.safe > 0 ? '<b>' + fmt(s.safe) + '</b> is left.' : 'today\'s amount is used up.') : '') + ' That\'s about ' + fmt(it.amount * L.daysInMonth(now)) + ' a month.';
    else {
      const days = it.period === 'week' ? 7 : L.daysInMonth(now);
      msg = '✓ Done! ' + fmt(it.amount) + ' a ' + it.period + ' works out to <b>' + fmt(Math.floor(it.amount / days)) + ' a day</b>.';
      if (s.spentBefore || s.spentToday) msg += ' You\'ve already spent ' + fmt(s.spentBefore + s.spentToday) + ' this ' + it.period + ', so for the ' + s.daysLeft + ' day' + (s.daysLeft === 1 ? '' : 's') + ' left you can spend about <b>' + fmt(Math.max(0, s.perDay)) + ' a day</b>' + (s.spentToday ? (s.safe > 0 ? ' (' + fmt(s.safe) + ' more today)' : ' (today\'s share is used up)') : '') + '.';
      if (s.pool < 0) msg += ' 😬 You\'re already ' + fmt(-s.pool) + ' over this ' + it.period + '.';
    }
    msg += '<br><span class="s12 muted">Rent and bills aren\'t counted here, only everyday spending.</span>';
    return say(D, msg, { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
  }

  function targetsFor(D, it) {
    const mineRecs = live(D).filter((r) => r.kind === 'expense' || r.kind === 'loan' || r.kind === 'settlement' || r.kind === 'income' || r.kind === 'saving');
    const idx = new Map(D.records.map((r, i) => [r.id, i]));
    const byNew = (a, b) => (b.createdAt - a.createdAt) || (idx.get(b.id) - idx.get(a.id));
    if (it.scope === 'last') return mineRecs.sort(byNew).slice(0, 1);
    let list = mineRecs;
    if (it.scope === 'day') { const d = new Date(clock()); d.setDate(d.getDate() + (it.day || 0)); const k = isoDate(d); list = list.filter((r) => r.date === k); }
    if (it.scope === 'week') { const ws = isoDate(L.weekStart(clock())); list = list.filter((r) => r.date >= ws); }
    if (it.kw) { const k = norm(it.kw); list = list.filter((r) => norm([r.note, r.category, r.paidBy, r.borrower, r.lender, r.pot].join(' ')).includes(k) || (r.amount && String(r.amount) === k)); }
    list = list.sort(byNew);
    return it.all ? list : list.slice(0, 1);
  }
  function removeRecords(D, recs) {
    recs.forEach((r) => {
      r.deleted = true; touch(r);
      if (r.bill) { const b = D.bills.find((x) => x.id === r.bill); if (b) b.paidMonths = (b.paidMonths || []).filter((mk) => mk !== (r.date || '').slice(0, 7)); }
      if (r.kind === 'saving' && r.potKey) { const neg = -r.amount; if (r.potKey === 'emergency') D.emergency.saved = round2(D.emergency.saved + neg); else { const all = [].concat(D.goals.map((g) => ['goal:' + g.id, g, 'saved']), D.sinking.map((g) => ['sink:' + g.id, g, 'saved']), D.investments.map((g) => ['inv:' + g.id, g, 'total'])); const f = all.find((x) => x[0] === r.potKey); if (f) f[1][f[2]] = round2((f[1][f[2]] || 0) + neg); } }
    });
    D.chat.forEach((m) => { if (m.card && m.card.type === 'confirm' && recs.some((r) => r.id === m.card.recId)) m.card.undone = true; });
  }
  function keepLabel(n) { return n < 0 ? 'kept forever' : n === 0 ? 'fresh every day (old chats deleted)' : 'kept for ' + n + ' days'; }
  function chatKeep(D, n) {
    D.chatKeep = n; pruneChat(D);
    return say(D, '✓ Chat history is now <b>' + keepLabel(n) + '</b>. Your entries are always saved, this only changes the chat messages.');
  }
  function pruneChat(D) {
    if (D.chatKeep == null) D.chatKeep = 7;
    if (D.chatKeep < 0) return;
    const d = new Date(clock()); d.setDate(d.getDate() - D.chatKeep); const cut = isoDate(d);
    D.chat = D.chat.filter((m) => m.day > cut || m.day === todayISO());
  }
  function deleteEntries(D, it) {
    const recs = targetsFor(D, it);
    if (!recs.length) return say(D, 'I couldn\'t find ' + (it.kw ? 'any entry for "' + esc(it.kw) + '"' : it.scope === 'day' ? 'any entries for ' + (it.day === -1 ? 'yesterday' : 'today') : 'anything to delete') + ' 🍪');
    const total = recs.reduce((a, r) => a + (r.kind === 'expense' ? L.shareOf(r, D.me) : 0), 0);
    if (recs.length === 1) {
      snapshot(D, 'delete');
      removeRecords(D, recs);
      return say(D, '🗑️ Deleted: ' + esc(recLine(D, recs[0])), { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
    }
    snapshot(D, 'delete');
    removeRecords(D, recs);
    return say(D, '🗑️ Deleted <b>' + recs.length + ' entries</b>' + (total ? ' (' + fmt(total) + ' of your spending)' : '') + '.<br><span class="s12 muted">' + recs.slice(0, 6).map((r) => esc((r.note || r.kind) + ' ' + fmt(Math.abs(r.amount)))).join(' · ') + (recs.length > 6 ? ' …' : '') + '</span>', { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
  }
  function editLast(D, ch) {
    const exp = live(D).filter((x) => x.kind === 'expense');
    const r = exp.reduce((best, x) => (!best || x.createdAt >= best.createdAt ? x : best), null);
    if (!r) return say(D, 'There\'s nothing to change yet 🍪');
    snapshot(D, 'edit last');
    const before = recLine(D, r);
    if (ch.amount) {
      const old = r.amount; const k = ch.amount / (old || 1);
      Object.keys(r.shares || {}).forEach((p) => { r.shares[p] = round2(r.shares[p] * k); });
      const sum = Object.values(r.shares).reduce((a, b) => a + b, 0);
      if (Object.keys(r.shares).length && Math.abs(sum - ch.amount) > 0.01) r.shares[r.paidBy] = round2((r.shares[r.paidBy] || 0) + ch.amount - sum);
      r.amount = ch.amount;
    }
    if (ch.cat) { r.category = ch.cat; const w = norm(r.note).split(' ')[0]; if (w) D.learned[w] = ch.cat; }
    if (ch.date) r.date = ch.date;
    if (ch.note) r.note = ch.note;
    if (ch.splitWith) { r.shares = L.equalShares(r.amount, [D.me, ch.splitWith], r.paidBy, ctx(D).ratios); r.split = 'equal'; }
    if (ch.justMe) { r.shares = { [D.me]: r.amount }; r.paidBy = D.me; r.split = 'equal'; }
    touch(r);
    D.chat.forEach((m) => { if (m.card && m.card.type === 'confirm' && m.card.recId === r.id) { m.card.text = recLine(D, r); m.card.pickCat = false; } });
    return say(D, '✏️ Changed. Now: <b>' + esc(recLine(D, r)) + '</b>', { type: 'ask', options: [opt('Undo', { do: 'undo' })] });
  }
  function listEntries(D, t) {
    const per = periodOf(t);
    const f = inRange(per);
    const words = t.replace(/^(show|list|view|display|see|find|search)\s+(me\s+)?/, '').replace(/[?.,!]/g, ' ').split(/\s+/).filter((w) => w && !STOPQ.has(w) && !/^(entries|entry|expenses|expense|spends|all|my|of|for|from|transactions|records|logs|today's|todays|items)$/.test(w));
    const cat = words.map((w) => L.resolveCat(w, ctx(D))).find(Boolean);
    const pr = people(D).find((p) => words.includes(norm(p.name)));
    const kw = !cat && !pr ? words[0] : null;
    const list = live(D).filter((r) => f(r) && (r.kind === 'expense' || r.kind === 'income' || r.kind === 'loan' || r.kind === 'settlement')
      && (!cat || r.category === cat) && (!pr || L.involves(r, pr.name)) && (!kw || norm([r.note, r.category].join(' ')).includes(kw))).sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);
    if (!list.length) return say(D, 'No entries ' + (cat ? 'in ' + cat + ' ' : kw ? 'for "' + esc(kw) + '" ' : pr ? 'with ' + pr.name + ' ' : '') + per.label + '.');
    const total = L.mySpend(list, D.me).total;
    return say(D, '', { type: 'answer', title: (cat || (kw ? titleCase(kw) : pr ? 'With ' + pr.name : 'Entries')) + ' · ' + per.label, big: total ? fmt(total) : '', sub: list.length + ' entr' + (list.length === 1 ? 'y' : 'ies'),
      rows: list.slice(0, 12).map((r) => ({ label: (r.note || r.category || r.kind) + ' · ' + niceDate(r.date).replace(/^\w+, /, ''), value: r.kind === 'expense' ? fmt(L.shareOf(r, D.me)) : fmt(r.amount) })), link: 'history' });
  }
  function unclear(D, it) {
    const t = it.text; const a = it.amount;
    const o = [];
    if (/safe|limit|allowance|daily/.test(t) && a) { o.push(opt('Safe spend ' + fmt(a) + ' a day', { do: 'intent', intent: { type: 'safe-set', amount: a, period: 'day' } }, 'black')); o.push(opt(fmt(a) + ' a month', { do: 'intent', intent: { type: 'safe-set', amount: a, period: 'month' } })); }
    if (/budget/.test(t) && a) { const c = t.split(' ').map((w) => L.resolveCat(w, ctx(D))).find(Boolean); o.push(opt((c ? c + ' budget ' : 'Monthly budget ') + fmt(a), { do: 'apply', change: { kind: 'budget', cat: c || null, amount: a } }, o.length ? '' : 'black')); }
    if (/salary|income|earn/.test(t) && a) o.push(opt('Salary ' + fmt(a), { do: 'intent', intent: { type: 'income', amount: a, label: 'Salary' } }));
    if (/save|saving/.test(t) && a) o.push(opt('Save ' + fmt(a) + ' to emergency', { do: 'intent', intent: { type: 'save', amount: a, pot: 'emergency' } }));
    if (/delete|remove|clear/.test(t)) o.push(opt('Delete my last entry', { do: 'intent', intent: { type: 'delete', scope: 'last' } }));
    if (/remind/.test(t)) o.push(opt('Reminder settings', { do: 'open', view: 'settings' }));
    if (it.expense && it.expense.amount) o.push(opt('Log ' + fmt(it.expense.amount) + ' as a spend', { do: 'intent', intent: Object.assign({}, it.expense, { keyWords: it.expense.keyWords.filter((w) => !['safe', 'spend', 'spending', 'limit', 'per', 'daily'].includes(w)) }) }));
    else if (a && !o.length) o.push(opt('Log ' + fmt(a) + ' as a spend', { do: 'intent', intent: L.parseExpense(t.replace(/^(set|change|update|make|put|please)\s+/, ''), ctx(D), clock()) }));
    o.push(opt('Show what I can do', { do: 'intent', intent: { type: 'help' } }));
    return ask(D, '🤔 I\'m not sure what you mean by "' + esc(t) + '". Did you mean:', o);
  }

  // ---------------- Questions ----------------
  function periodOf(t) {
    const now = clock();
    const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (/\btoday\b/.test(t)) { const s = sod(now); return { label: 'today', from: s, to: s, prev: [new Date(s.getTime() - 86400000), new Date(s.getTime() - 86400000)] }; }
    if (/\byesterday\b/.test(t)) { const s = sod(now); s.setDate(s.getDate() - 1); return { label: 'yesterday', from: s, to: s }; }
    if (/\blast week\b/.test(t)) { const ws = L.weekStart(now); ws.setDate(ws.getDate() - 7); const we = new Date(ws); we.setDate(ws.getDate() + 6); return { label: 'last week', from: ws, to: we }; }
    if (/\b(this week|week)\b/.test(t)) { const ws = L.weekStart(now); const p0 = new Date(ws); p0.setDate(ws.getDate() - 7); const p1 = new Date(ws); p1.setDate(ws.getDate() - 1); return { label: 'this week', from: ws, to: sod(now), prev: [p0, p1] }; }
    if (/\blast month\b/.test(t)) { const s = new Date(now.getFullYear(), now.getMonth() - 1, 1); const e = new Date(now.getFullYear(), now.getMonth(), 0); return { label: s.toLocaleDateString('en-IN', { month: 'long' }), from: s, to: e }; }
    const m = t.match(/\blast (\d+|three|six) months\b/);
    if (m) { const n = { three: 3, six: 6 }[m[1]] || Number(m[1]); const s = new Date(now.getFullYear(), now.getMonth() - n + 1, 1); return { label: 'the last ' + n + ' months', from: s, to: sod(now) }; }
    if (/\b(this year|year)\b/.test(t)) { const s = new Date(now.getFullYear(), 0, 1); return { label: 'this year', from: s, to: sod(now) }; }
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const p0 = new Date(now.getFullYear(), now.getMonth() - 1, 1); const p1 = new Date(now.getFullYear(), now.getMonth() - 1, Math.min(now.getDate(), L.daysInMonth(p0)));
    return { label: 'this month', from: s, to: sod(now), prev: [p0, p1] };
  }
  const inRange = (p) => { const a = isoDate(p.from), b = isoDate(p.to); return (r) => r.date >= a && r.date <= b; };

  function answer(D, t) {
    const recs = live(D);
    const me = D.me;
    const per = periodOf(t);
    const f = inRange(per);
    // Balances
    if (/who owes|owe me|do i owe|i owe|balances?|pending|dues?\b|money back/.test(t)) return balancesCard(D);
    if (/\bbills?\b|due|upcoming|coming up|rent paid|pay this week/.test(t) && !/spend|spent/.test(t)) return billsCard(D);
    if (/safe|can i spend|left to spend|how much (can|left)|afford today/.test(t)) {
      const s = L.safeToSpend(D, recs, clock());
      const ask2 = (t.match(/\b(\d+)\b/) || [])[1];
      if (!s) return say(D, 'Tell me your salary (<b>salary 85000</b>) or a budget (<b>budget 35000</b>) and I can work out safe to spend.');
      if (ask2) { const n = Number(ask2); return say(D, n <= s.safe ? '✅ Yes! ' + fmt(n) + ' fits. You\'d still have ' + fmt(s.safe - n) + ' safe today.' : '😬 That\'s ' + fmt(n - s.safe) + ' over today\'s safe amount (' + fmt(s.safe) + '). It would cut about ' + fmt(Math.round((n - s.safe) / Math.max(1, s.daysLeft - 1))) + ' from each remaining day.', { type: 'mood', mood: n <= s.safe ? 'happy' : 'worried' }); }
      return say(D, '', { type: 'answer', title: 'Safe to spend today', big: fmt(s.safe), sub: s.daysLeft + ' days left this month', rows: [
        { label: 'Spent this month', value: fmt(s.spentBefore + s.spentToday) }, { label: 'Bills this month', value: fmt(s.billsTotal) }, { label: 'Daily allowance', value: fmt(s.perDay) },
      ] });
    }
    if (/sav(ed|ing|ings)|emergency|goals?\b|piggy/.test(t)) return savingsCard(D);
    // Person related
    const named = people(D).find((p) => t.split(/[^a-z]+/).includes(norm(p.name)));
    if (named && /(together|we|us|our)\b/.test(t)) return togetherCard(D, named.name, per);
    if (named && /\b(on|for)\s+[a-z]+/.test(t)) {
      const s = L.togetherStats(recs, me, named.name, f);
      const forThem = s.theirShare && 0;
      const spentFor = round2(L.togetherStats(recs, me, named.name, f).myTreats + recs.filter((r) => f(r) && r.kind === 'expense' && same(r.paidBy, me) && r.split !== 'treat' && L.involves(r, named.name)).reduce((a, r) => a + L.shareOf(r, named.name), 0));
      return say(D, '', { type: 'answer', title: 'Spent on ' + named.name + ' (' + per.label + ')', big: fmt(spentFor), sub: 'Their share of things you paid, plus your treats', rows: [
        { label: 'Your treats', value: fmt(s.myTreats) }, { label: 'Their share you covered', value: fmt(spentFor - s.myTreats) }, { label: 'Spent together', value: fmt(s.together) },
      ], note: forThem ? '' : undefined });
    }
    if (named && /\bpaid\b/.test(t)) {
      const paid = recs.filter((r) => f(r) && r.kind === 'expense' && same(r.paidBy, named.name)).reduce((a, r) => a + r.amount, 0);
      return say(D, named.name + ' paid <b>' + fmt(paid) + '</b> for shared things ' + per.label + '.');
    }
    if (/income|earned|salary/.test(t)) { const inc = recs.filter((r) => f(r) && r.kind === 'income').reduce((a, r) => a + r.amount, 0); return say(D, 'Income ' + per.label + ': <b>' + fmt(inc) + '</b>.'); }
    // Top / breakdown
    if (/\bbiggest|largest|most expensive\b/.test(t)) {
      const list = recs.filter((r) => f(r) && L.mySpendOf(r, me) > 0).sort((a, b) => L.mySpendOf(b, me) - L.mySpendOf(a, me)).slice(0, 5);
      if (!list.length) return say(D, 'Nothing logged ' + per.label + ' yet.');
      return say(D, '', { type: 'answer', title: 'Biggest spends ' + per.label, rows: list.map((r) => ({ label: r.note + ' · ' + niceDate(r.date), value: fmt(L.mySpendOf(r, me)), color: L.catOf(r.category).fg, pct: L.mySpendOf(r, me) / L.mySpendOf(list[0], me) })) });
    }
    const words = t.replace(/[?.,!]/g, ' ').split(/\s+/).filter((w) => w && !STOPQ.has(w));
    const cat = words.map((w) => L.resolveCat(w, ctx(D))).find(Boolean) || (words.length ? (() => { const g = L.guessCategory(words, D.learned); return g.cat !== 'Other' ? g.cat : null; })() : null);
    const kw = words.find((w) => recs.some((r) => r.kind === 'expense' && norm(r.note).includes(w)) && !L.resolveCat(w));
    if (/how many times|how often|count|number of/.test(t) && (kw || cat)) {
      const list = recs.filter((r) => f(r) && L.mySpendOf(r, me) > 0 && (kw ? norm(r.note).includes(kw) : r.category === cat));
      return say(D, (kw ? titleCase(kw) : cat) + ': <b>' + list.length + ' time' + (list.length === 1 ? '' : 's') + '</b> ' + per.label + ', ' + fmt(list.reduce((a, r) => a + L.mySpendOf(r, me), 0)) + ' in total.');
    }
    if (/\btop|most|where|breakdown|categor|what did i spend/.test(t) && !kw) {
      const s = L.mySpend(recs, me, f);
      const list = Object.entries(s.byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (!list.length) return say(D, 'Nothing logged ' + per.label + ' yet.');
      const prev = per.prev ? L.mySpend(recs, me, inRange({ from: per.prev[0], to: per.prev[1] })) : null;
      const top = list[0];
      let note = '';
      if (prev && prev.byCat[top[0]] !== undefined) { const d = top[1] - prev.byCat[top[0]]; if (Math.abs(d) > 50) note = top[0] + ' is ' + (d > 0 ? 'up ' : 'down ') + fmt(Math.abs(d)) + ' vs the same point last ' + (per.label === 'this week' ? 'week' : 'month') + '.'; }
      const rep = L.repeatSpends(recs, me, f)[0];
      if (rep) note += (note ? ' ' : '') + 'Most repeated: ' + rep.name + ' (' + rep.count + 'x, ' + fmt(rep.total) + ').';
      return say(D, '', { type: 'answer', title: 'Your top ' + list.length + ' ' + per.label, rows: list.map(([k, v]) => ({ label: k, value: fmt(v), color: L.catOf(k).fg, pct: v / list[0][1] })), note, link: 'charts' });
    }
    // Total for category / keyword / overall
    const filt = (r) => f(r) && (kw ? norm(r.note).includes(kw) : cat ? r.category === cat : true);
    const total = L.mySpend(recs, me, filt).total;
    const prevTotal = per.prev ? L.mySpend(recs, me, (r) => inRange({ from: per.prev[0], to: per.prev[1] })(r) && (kw ? norm(r.note).includes(kw) : cat ? r.category === cat : true)).total : null;
    const label = kw ? titleCase(kw) : cat || 'Total';
    const rows = [];
    if (prevTotal) rows.push({ label: 'Same point last ' + (per.label === 'this week' ? 'week' : per.label === 'today' ? 'day' : 'month'), value: fmt(prevTotal) });
    if (cat && D.catBudgets[cat] && per.label === 'this month') rows.push({ label: 'Budget left', value: fmt(D.catBudgets[cat] - total) });
    const count = recs.filter((r) => filt(r) && L.mySpendOf(r, me) > 0).length;
    rows.push({ label: 'Entries', value: String(count) });
    return say(D, '', { type: 'answer', title: label + ' ' + per.label, big: fmt(total), sub: prevTotal !== null && prevTotal ? (total >= prevTotal ? '▲ ' : '▼ ') + fmt(Math.abs(total - prevTotal)) + ' vs before' : '', rows, link: 'charts' });
  }
  const STOPQ = new Set('how much did i do we spend spent on in this last month week today yesterday year the a my for what is are was total so far have has been till now me money ? whats what\'s times many'.split(' '));

  function balancesCard(D) {
    const recs = live(D);
    const rows = [];
    people(D).forEach((p) => {
      const b = L.balanceWith(recs, D.me, p.name); const lw = L.loansWith(recs, D.me, p.name);
      const net = round2(b + lw.lentOut - lw.borrowed);
      if (net) rows.push({ label: net > 0 ? p.name + ' owes you' : 'You owe ' + p.name, value: fmt(Math.abs(net)), person: p.name, net });
    });
    const loanOnly = live(D).filter((r) => r.kind === 'loan' && L.loanOutstanding(r) > 0 && !people(D).some((p) => same(p.name, same(r.lender, D.me) ? r.borrower : r.lender)));
    loanOnly.forEach((r) => rows.push({ label: same(r.lender, D.me) ? r.borrower + ' owes you' : 'You owe ' + r.lender, value: fmt(L.loanOutstanding(r)) }));
    const claims = recs.filter((r) => r.claim && r.claimStatus === 'pending').reduce((a, r) => a + r.amount, 0);
    if (claims) rows.push({ label: 'Pending claims', value: fmt(claims) });
    if (!rows.length) return say(D, 'Nobody owes anybody right now. All settled! 🎉');
    const options = rows.filter((r) => r.person).slice(0, 3).map((r) => opt(r.net > 0 ? 'Settle ' + r.person : 'Pay ' + r.person, { do: 'intent', intent: { type: 'settle', person: r.person, known: true } }, r.net > 0 ? 'lime' : 'black'));
    return say(D, '', { type: 'answer', title: 'Pending money', rows, options });
  }
  function billsCard(D) {
    const bs = L.billsThisMonth(D.bills.filter((b) => !b.stopped), clock());
    if (!bs.length) return say(D, 'No bills set up yet. Add one like <b>rent 18000 every 5th</b>.');
    const unpaid = bs.filter((b) => !b.paid);
    const rows = bs.map((b) => ({ label: b.name + (b.paid ? ' ✓ paid' : b.days < 0 ? ' · overdue' : b.days === 0 ? ' · today' : ' · in ' + b.days + ' day' + (b.days === 1 ? '' : 's')), value: fmt(b.amountNow) }));
    const options = unpaid.slice(0, 3).map((b) => opt('Mark ' + b.name + ' paid', { do: 'intent', intent: { type: 'bill-paid', bill: b.id } }, 'lime'));
    return say(D, '', { type: 'answer', title: 'Bills this month', big: fmt(unpaid.reduce((a, b) => a + b.amountNow, 0)), sub: unpaid.length + ' still to pay', rows, options });
  }
  function savingsCard(D) {
    const ess = L.essentialsMonthly(live(D), D.me, clock(), D.bills);
    const rows = [{ label: 'Emergency fund' + (ess ? ' (' + (D.emergency.saved / ess).toFixed(1) + ' months)' : ''), value: fmt(D.emergency.saved) }]
      .concat(D.goals.map((g) => ({ label: g.name + ' goal', value: fmt(g.saved) + ' / ' + fmt(g.target), pct: g.saved / g.target, color: '#A99EEA' })))
      .concat(D.sinking.map((g) => ({ label: g.name + ' fund', value: fmt(g.saved) + ' / ' + fmt(g.target) })))
      .concat(D.investments.map((i) => ({ label: i.name, value: fmt(i.total || 0) })));
    const total = D.emergency.saved + D.goals.reduce((a, g) => a + g.saved, 0) + D.sinking.reduce((a, g) => a + g.saved, 0) + D.investments.reduce((a, g) => a + (g.total || 0), 0);
    return say(D, '', { type: 'answer', title: 'Your savings', big: fmt(total), rows, link: 'savings' });
  }
  function togetherCard(D, name, per) {
    const s = L.togetherStats(live(D), D.me, name, inRange(per));
    const bal = L.balanceWith(live(D), D.me, name);
    return say(D, '', { type: 'answer', title: 'You & ' + name + ' · ' + per.label, big: fmt(s.together), sub: 'spent together', rows: [
      { label: 'You paid', value: fmt(s.iPaid) }, { label: name + ' paid', value: fmt(s.theyPaid) }, { label: 'Your share', value: fmt(s.myShare) }, { label: name + '\'s share', value: fmt(s.theirShare) },
      { label: 'Your treats', value: fmt(s.myTreats) }, { label: name + '\'s treats', value: fmt(s.theirTreats) },
      { label: 'Balance', value: bal === 0 ? 'settled' : bal > 0 ? name + ' owes ' + fmt(bal) : 'you owe ' + fmt(-bal) },
    ], link: 'person:' + name });
  }

  // ---------------- Ask AI ----------------
  function advice(D, t) {
    const recs = live(D);
    const now = clock(); const mk = monthKey(now);
    const s = L.mySpend(recs, D.me, (r) => (r.date || '').startsWith(mk));
    const top = Object.entries(s.byCat).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (top.length) say(D, '', { type: 'answer', title: 'This month so far', big: fmt(s.total), rows: top.map(([k, v]) => ({ label: k, value: fmt(v), color: L.catOf(k).fg, pct: v / top[0][1] })) });
    const prompt = buildPrompt(D, t);
    return say(D, 'That one needs some thinking! I packed your numbers into a question for your AI app 🍪', { type: 'advice', prompt });
  }
  function buildPrompt(D, question) {
    const recs = live(D); const now = clock(); const mk = monthKey(now);
    const alias = {}; let n = 1;
    const nm = (x) => { if (!D.hideNames || same(x, D.me)) return x; alias[norm(x)] = alias[norm(x)] || 'Friend ' + n++; return alias[norm(x)]; };
    const s = L.mySpend(recs, D.me, (r) => (r.date || '').startsWith(mk));
    const lastMk = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const last = L.mySpend(recs, D.me, (r) => (r.date || '').startsWith(lastMk));
    const lines = [];
    lines.push('I track my money in an app. Here is my data (Indian rupees). Today is day ' + now.getDate() + ' of ' + L.daysInMonth(now) + ' this month.');
    if (D.income.amount) lines.push('Monthly take-home income: ' + D.income.amount);
    lines.push('Spent so far this month (my share): ' + s.total + (last.total ? ' · last month in total: ' + last.total : ''));
    const cats = Object.entries(s.byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v + (last.byCat[k] ? ' (last month ' + last.byCat[k] + ')' : ''));
    if (cats.length) lines.push('By category: ' + cats.join(' · '));
    const rep = L.repeatSpends(recs, D.me, (r) => (r.date || '').startsWith(mk)).slice(0, 5).map((x) => x.name + ' ' + x.count + ' times, ' + x.total);
    if (rep.length) lines.push('Repeated spends: ' + rep.join(' · '));
    const bud = Object.entries(D.catBudgets || {}).map(([k, v]) => k + ' ' + v);
    if (D.budget) bud.unshift('Overall ' + D.budget);
    if (bud.length) lines.push('Budgets: ' + bud.join(' · '));
    const bills = D.bills.filter((b) => !b.stopped).map((b) => b.name + ' ' + L.billAmountFor(b, mk) + (b.freq !== 'monthly' ? ' (' + b.freq + ')' : ''));
    if (bills.length) lines.push('Fixed bills: ' + bills.join(' · '));
    const sav = ['Emergency fund ' + D.emergency.saved].concat(D.goals.map((g) => g.name + ' goal ' + g.saved + ' of ' + g.target + (g.by ? ' by ' + g.by : ''))).concat(D.investments.map((i) => i.name + ' ' + i.amount + '/month'));
    lines.push('Savings: ' + sav.join(' · '));
    const lw = L.loansWith(recs, D.me);
    if (lw.lentOut || lw.borrowed) lines.push('Loans: lent out ' + lw.lentOut + ', borrowed ' + lw.borrowed);
    const shared = people(D).map((p) => { const st = L.togetherStats(recs, D.me, p.name, (r) => (r.date || '').startsWith(mk)); return st.together ? 'with ' + nm(p.name) + ' ' + st.together + ' (my share ' + st.myShare + ')' : ''; }).filter(Boolean);
    if (shared.length) lines.push('Shared spending this month: ' + shared.join(' · '));
    lines.push('');
    lines.push('My question: ' + question.replace(/\?*$/, '?'));
    lines.push('Please give me 3 to 5 specific, practical ideas based on these numbers, with roughly how much each would save per month. Keep it short.');
    return lines.join('\n');
  }

  // ---------------- Help ----------------
  function help(D) {
    return say(D, '', { type: 'answer', title: 'Things you can tell me 🍪', rows: [
      { label: 'tea 40', value: 'just you' }, { label: 'arjun me pizza 900', value: 'split 2 ways' }, { label: 'arjun tea 40', value: 'Arjun owes all' },
      { label: 'arjun paid dinner 900', value: 'you owe half' }, { label: 'dinner 2400 my treat', value: 'no split' }, { label: 'rent paid / emi paid', value: 'mark a bill paid' },
      { label: 'rent 18000 every 5th', value: 'add a bill' }, { label: 'salary 85000', value: 'income + payday split' }, { label: 'save 5000 emergency', value: 'savings' },
      { label: 'goal iphone 80000 by june', value: 'new goal' }, { label: 'budget food 8000', value: 'set a budget' }, { label: 'lent kowshik 2000 by 27th', value: 'lending' },
      { label: 'office cab 400 claim', value: 'reimbursement' }, { label: 'amazon refund 500', value: 'refund' }, { label: 'start goa trip budget 15000', value: 'trip mode' },
      { label: 'zudio is shopping', value: 'teach me' }, { label: 'who owes me? / top spends?', value: 'ask anything' }, { label: 'undo', value: 'take it back' },
    ] });
  }
  function greetLine(D) {
    const h = clock().getHours();
    const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const s = L.safeToSpend(D, live(D), clock());
    return g + ', ' + esc(D.me) + '! 🍪' + (s ? ' You can safely spend <b>' + fmt(s.safe) + '</b> today.' : ' Tell me what you spend and I\'ll keep track.');
  }

  // ---------------- Card buttons ----------------
  function runAction(D, msgId, idx) {
    const m = D.chat.find((x) => x.id === msgId);
    if (!m || !m.card || m.card.done) return null;
    const o = (m.card.options || [])[idx];
    if (!o) return null;
    const a = o.action;
    m.card.done = o.label;
    const result = { effect: null };
    switch (a.do) {
      case 'noop': if (a.text) say(D, a.text); break;
      case 'undo': undo(D); break;
      case 'delete-ids': { snapshot(D, 'delete'); const recs = D.records.filter((r) => a.ids.includes(r.id) && !r.deleted); removeRecords(D, recs); say(D, '🗑️ Deleted ' + recs.length + ' entries.', { type: 'ask', options: [opt('Undo', { do: 'undo' })] }); break; }
      case 'remove-person': { snapshot(D, 'remove person'); D.people = D.people.filter((p) => !same(p.name, a.person)); say(D, 'Removed ' + esc(a.person) + ' from your people. Their old entries stay in your history.', { type: 'ask', options: [opt('Undo', { do: 'undo' })] }); break; }
      case 'amount': handle(D, String(a.amount)); break;
      case 'apply': say(D, applyChange(D, a.change)); break;
      case 'intent': exec(D, a.intent, ''); break;
      case 'add-then': addPerson(D, a.name, '', false); exec(D, Object.assign({}, a.intent, { who: titleCase(a.name), known: true }), ''); break;
      case 'make-bill': { snapshot(D, 'new bill'); const b = { id: uid(), name: a.note, amount: a.amount, day: clock().getDate(), category: a.cat, freq: a.freq, start: monthKey(clock()), history: [], paidMonths: a.freq === 'monthly' || a.freq ? [monthKey(clock())] : [] };
        D.bills.push(b); const r = D.records.find((x) => x.id === a.recId); if (r) { r.bill = b.id; touch(r); }
        say(D, '🧾 ' + esc(a.note) + ' added as a ' + (a.freq === 'monthly' ? 'monthly bill on the ' + ordinal(b.day) : a.freq === 'quarterly' ? 'bill every 3 months' : 'yearly bill') + '. Next time just type <b>' + esc(norm(a.note)) + ' paid</b>.'); break; }
      case 'split-apply': snapshot(D, 'payday split'); a.plan.forEach((p) => putInPot(D, p.pot, p.amount)); say(D, '🫙 Done! Moved ' + fmt(a.plan.reduce((x, p) => x + p.amount, 0)) + ' into savings. Future you says thanks 🍪'); break;
      case 'save': snapshot(D, 'saving'); { const label = putInPot(D, a.pot, a.amount); say(D, '🫙 ' + fmt(a.amount) + ' saved to <b>' + esc(label) + '</b>.' + potStatus(D, a.pot)); } break;
      case 'new-goal-save': snapshot(D, 'new goal'); { const g = { id: uid(), name: a.name, target: a.amount * 10, saved: 0, by: null }; D.goals.push(g); putInPot(D, 'goal:' + g.id, a.amount); say(D, '🎯 New goal <b>' + esc(a.name) + '</b> with ' + fmt(a.amount) + ' saved. Set the target with <b>goal ' + esc(norm(a.name)) + ' 50000 by june</b>.'); } break;
      case 'settle-in': settleAll(D, a.person, a.amount, true); say(D, '💚 ' + esc(a.person) + ' paid you ' + fmt(a.amount) + '. All settled! 🎉'); break;
      case 'settle-out': settleAll(D, a.person, a.amount, false); say(D, '💚 You paid ' + esc(a.person) + ' ' + fmt(a.amount) + '. All settled! 🎉'); break;
      case 'upi': result.effect = { type: 'upi', person: a.person, amount: a.amount }; m.card.done = null; break;
      case 'whatsapp': result.effect = { type: 'whatsapp', person: a.person, amount: a.amount, text: a.text }; m.card.done = null; break;
      case 'loan-received': { const r = D.records.find((x) => x.id === a.loanId); if (r) { snapshot(D, 'loan returned'); const out = L.loanOutstanding(r); r.repayments = (r.repayments || []).concat([{ amount: out, date: todayISO() }]); touch(r); say(D, '💚 ' + esc(r.borrower) + ' returned ' + fmt(out) + '. All settled! 🎉'); } break; }
      case 'loan-paid': { const r = D.records.find((x) => x.id === a.loanId); if (r) { snapshot(D, 'loan repaid'); const out = L.loanOutstanding(r); r.repayments = (r.repayments || []).concat([{ amount: out, date: todayISO() }]); touch(r); say(D, '💚 You returned ' + fmt(out) + ' to ' + esc(r.lender) + '. All settled! 🎉'); } break; }
      case 'loan-extend': { const r = D.records.find((x) => x.id === a.loanId); if (r) { snapshot(D, 'more time'); const d = L.parseISO(r.due || todayISO()); d.setDate(d.getDate() + (a.days || 7)); r.due = isoDate(d); touch(r); say(D, '📅 New due date: ' + niceDate(r.due) + '.'); } break; }
      case 'loan-part': say(D, 'Type how much, like <b>' + esc(norm(a.who)) + ' gave 500</b>.'); break;
      case 'set-cat': { const r = D.records.find((x) => x.id === a.recId); if (r) { snapshot(D, 'change category'); r.category = a.cat; touch(r); const w = norm(r.note).split(' ')[0]; if (w) D.learned[w] = a.cat; m.card.text = recLine(D, r); m.card.pickCat = false; say(D, '🧠 Moved to ' + a.cat + '. I\'ll remember <b>' + esc(w) + '</b> next time.'); } break; }
      case 'capture-add': captureAdd(D, m, a); break;
      case 'capture-cats': m.card.done = null; m.card.showCats = true; break;
      case 'capture-split': captureAdd(D, m, Object.assign({}, a, { split: true })); break;
      case 'capture-lent': { snapshot(D, 'lent'); const p = m.card.payment; const r = addRecord(D, { kind: 'loan', amount: p.amount, lender: D.me, borrower: a.person, due: null, repayments: [], date: m.card.date || todayISO() }); say(D, '🤝 ' + recLine(D, r)); break; }
      case 'capture-ignore': m.card.ignored = true; break;
      case 'month-close': snapshot(D, 'month close'); { const label = putInPot(D, a.pot, a.amount); say(D, '🫙 Moved ' + fmt(a.amount) + ' to ' + esc(label) + '. Great month, ' + esc(D.me) + '! 🍪'); } break;
      case 'open': result.effect = { type: 'open', view: a.view }; m.card.done = null; break;
      case 'enable-sms': result.effect = { type: 'enable-sms' }; break;
      case 'setup': return setupStep(D, a.value, true);
      default: break;
    }
    return result;
  }

  function captureAdd(D, m, a) {
    const p = m.card.payment;
    snapshot(D, 'captured payment');
    const date = m.card.date || todayISO();
    if (a.bill) {
      const b = bill(D, a.bill); const mk = monthKey(clock());
      b.paidMonths = (b.paidMonths || []).concat([mk]);
      const r = addRecord(D, { kind: 'expense', amount: p.amount, category: b.category || 'Rent', note: b.name, paidBy: D.me, shares: { [D.me]: p.amount }, split: 'equal', bill: b.id, method: p.method, date, sms: m.card.smsId });
      D.payees[norm(p.name)] = { note: b.name, cat: b.category, bill: b.id };
      return confirmCard(D, r.id, b.name + ' ' + fmt(p.amount) + ' marked paid', { paid: true });
    }
    const cat = a.cat || (m.card.guess && m.card.guess.cat) || 'Other';
    const note = a.note || (m.card.guess && m.card.guess.note) || p.name;
    let shares = { [D.me]: p.amount }; let split = 'equal';
    if (a.split && a.person) { shares = L.equalShares(p.amount, [D.me, a.person], D.me, ctx(D).ratios); }
    else { const rule = D.autoSplit && D.autoSplit[cat]; if (rule && rule.length) shares = L.equalShares(p.amount, [D.me].concat(rule), D.me, ctx(D).ratios); }
    const r = addRecord(D, { kind: 'expense', amount: p.amount, category: cat, note, paidBy: D.me, shares, split, method: p.method, date, sms: m.card.smsId });
    if (p.name && p.name !== 'a payment' && !/^UPI /.test(p.name)) D.payees[norm(p.name)] = { note, cat };
    return confirmCard(D, r.id, recLine(D, r));
  }

  // Captured SMS → chat cards
  function addCaptures(D, items) {
    let added = 0;
    for (const it of items || []) {
      if (!it || !it.id || D.captured[it.id]) continue;
      D.captured[it.id] = clock().getTime();
      const p = L.parseBankSms(it.body);
      if (!p) continue;
      const date = it.ts ? isoDate(new Date(Number(it.ts))) : todayISO();
      // Skip if already logged by hand (same amount within a day)
      const dup = live(D).find((r) => r.kind === 'expense' && Math.abs(r.amount - p.amount) < 0.5 && Math.abs(L.parseISO(r.date) - L.parseISO(date)) <= 86400000 && !r.sms);
      const guess = L.guessPayment(p, { bills: D.bills.filter((b) => !b.stopped), learned: D.learned, payees: D.payees, today: clock() });
      const where = p.name && p.name !== 'a payment' ? ' to <b>' + esc(p.name) + '</b>' : '';
      let text = '👀 I spotted <b>' + fmt(p.amount) + '</b> paid' + where + (p.method === 'card' ? ' by card' : ' via UPI') + (date !== todayISO() ? ' on ' + niceDate(date) : '') + '.';
      if (dup) text += ' Looks like you already logged ' + esc(dup.note) + ' ' + fmt(dup.amount) + '.';
      let options;
      if (guess.bill) options = [opt('Yes, ' + guess.note + ' paid', { do: 'capture-add', bill: guess.bill }, 'black'), opt('No, something else', { do: 'capture-cats' })];
      else if (guess.reason === 'person') options = [opt('Just me', { do: 'capture-cats' }, 'black')].concat(people(D).slice(0, 3).map((pp) => opt('Split with ' + pp.name, { do: 'capture-split', person: pp.name, cat: 'Other', note: 'Paid ' + p.name }))).concat([opt('Lent to ' + p.name.split(' ')[0], { do: 'capture-lent', person: titleCase(p.name.split(' ')[0]) }), opt('Ignore', { do: 'capture-ignore' })]);
      else options = [opt('Add · ' + guess.note + ' · ' + guess.cat, { do: 'capture-add', cat: guess.cat, note: guess.note }, 'black'), opt('Change', { do: 'capture-cats' })]
        .concat(people(D).slice(0, 2).map((pp) => opt('Split with ' + pp.name, { do: 'capture-split', person: pp.name, cat: guess.cat, note: guess.note })))
        .concat([opt('Ignore', { do: 'capture-ignore' }, '')]);
      if (dup) options = [opt('Already logged, ignore', { do: 'capture-ignore' }, 'black')].concat(options.filter((o) => o.action.do !== 'capture-ignore'));
      say(D, text + (guess.question ? ' ' + esc(guess.question) : ''), { type: 'capture', payment: p, guess, options, smsId: it.id, date });
      added++;
    }
    return added;
  }

  // ---------------- Setup chat ----------------
  function startSetup(D) {
    if (D.chat.length) return;
    say(D, 'Hi! I\'m <b>Cookie</b> 🍪 your money buddy. I\'ll help you track spending, split costs and save more. What\'s your name?');
    D.setup = 'name';
  }
  function setupStep(D, text, fromButton) {
    const t = String(text || '').trim();
    const skip = /^(skip|no|nope|later|not now|none|nobody|-)$/i.test(t);
    switch (D.setup) {
      case 'name': {
        const name = titleCase(t.replace(/^(i am|i'm|im|my name is|this is)\s+/i, '').split(/\s+/).slice(0, 2).join(' '));
        if (!name || /\d/.test(name)) return say(D, 'Just your first name is fine 🙂');
        D.me = name; D.setup = 'income';
        return say(D, 'Nice to meet you, <b>' + esc(name) + '</b>! What\'s your monthly take-home salary? Type a number, or <b>skip</b>.');
      }
      case 'income': {
        const n = Number(t.replace(/[₹,\s]/g, '').replace(/k$/i, '000'));
        if (!skip && n > 0) { D.income.amount = n; }
        D.setup = 'rent';
        return say(D, (n > 0 ? '👍 Got it. ' : '') + 'Do you pay rent? Type it like <b>rent 18000 every 5th</b>, or <b>skip</b>.');
      }
      case 'rent': {
        if (!skip) { const it = L.parse(t, ctx(D)); if (it.type === 'bill-add') { D.bills.push({ id: uid(), name: it.name, amount: it.amount, day: it.day, category: 'Rent', freq: 'monthly', start: firstMonth(it.day), history: [], paidMonths: [] }); } else { const n = Number((t.match(/\d+/) || [])[0]); if (n) D.bills.push({ id: uid(), name: 'Rent', amount: n, day: 5, category: 'Rent', freq: 'monthly', start: firstMonth(5), history: [], paidMonths: [] }); } }
        D.setup = 'people';
        return say(D, 'Who do you split costs with? Type their names like <b>arjun riya</b>, or <b>skip</b>.');
      }
      case 'people': {
        if (!skip) t.split(/[\s,]+|\band\b/i).filter((w) => /^[a-z]{2,}$/i.test(w)).slice(0, 8).forEach((n) => { if (!same(n, D.me) && !people(D).some((p) => same(p.name, n))) D.people.push({ name: titleCase(n), upi: '' }); });
        D.setup = 'sms';
        return ask(D, 'Last one! Want me to watch your bank SMS for UPI and card payments? I\'ll ping you to add each one, so nothing slips through. Your messages never leave your phone.', [
          opt('Yes, turn it on', { do: 'setup', value: 'yes' }, 'black'), opt('Not now', { do: 'setup', value: 'no' }),
        ]);
      }
      case 'sms': {
        D.setup = 'done';
        const yes = /^(yes|y|ok|sure|yes, turn it on)$/i.test(t);
        say(D, 'You\'re all set, ' + esc(D.me) + '! 🎉 Try typing <b>tea 40</b>' + (people(D).length ? ' or <b>' + esc(norm(people(D)[0].name)) + ' me lunch 400</b>' : '') + '. Type <b>help</b> any time to see what I can do.');
        return yes ? { effect: { type: 'enable-sms' } } : null;
      }
      default: D.setup = 'done';
    }
  }

  // ---------------- Proactive messages ----------------
  function proactive(D) {
    if (D.setup !== 'done') return;
    pruneChat(D);
    const now = clock(); const day = todayISO(); const mk = monthKey(now);
    const once = (key) => { if (D.nudged[key]) return false; D.nudged[key] = 1; return true; };
    // prune old nudges
    Object.keys(D.nudged).forEach((k) => { if (!k.includes(mk) && !k.includes(day) && k.split('|')[1] < monthKey(new Date(now.getFullYear(), now.getMonth() - 2, 1))) delete D.nudged[k]; });
    if (once('hello|' + day)) say(D, greetLine(D));
    // 1st of month: last month's report
    if (now.getDate() <= 3 && once('report|' + mk)) {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); const lmk = monthKey(lm);
      const s = L.mySpend(live(D), D.me, (r) => (r.date || '').startsWith(lmk));
      if (s.total) {
        const pm = monthKey(new Date(now.getFullYear(), now.getMonth() - 2, 1));
        const p = L.mySpend(live(D), D.me, (r) => (r.date || '').startsWith(pm)).total;
        const top = Object.entries(s.byCat).sort((a, b) => b[1] - a[1]).slice(0, 4);
        say(D, '', { type: 'answer', title: '📊 Your ' + lm.toLocaleDateString('en-IN', { month: 'long' }) + ' report', big: fmt(s.total), sub: p ? (s.total > p ? '▲ ' : '▼ ') + fmt(Math.abs(s.total - p)) + ' vs the month before' : 'spent in total', rows: top.map(([k, v]) => ({ label: k, value: fmt(v), color: L.catOf(k).fg, pct: v / top[0][1] })), note: tipFor(D, lmk), link: 'charts', options: [opt('Ask AI for advice', { do: 'intent', intent: { type: 'advice', text: 'how can i spend less next month' } }, 'lav')] });
      }
    }
    // Bills due soon
    L.billsThisMonth(D.bills.filter((b) => !b.stopped), now).filter((b) => !b.paid && b.days <= 2).forEach((b) => {
      if (once('bill|' + b.id + '|' + day)) ask(D, (b.days < 0 ? '⚠️ <b>' + esc(b.name) + '</b> (' + fmt(b.amountNow) + ') was due ' + (-b.days) + ' day' + (b.days === -1 ? '' : 's') + ' ago.' : b.days === 0 ? '🧾 <b>' + esc(b.name) + '</b> of ' + fmt(b.amountNow) + ' is due today.' : '🧾 <b>' + esc(b.name) + '</b> of ' + fmt(b.amountNow) + ' is due ' + (b.days === 1 ? 'tomorrow' : 'in ' + b.days + ' days') + '.'),
        [opt('Mark paid', { do: 'intent', intent: { type: 'bill-paid', bill: b.id } }, 'black'), opt('Later', { do: 'noop' })]);
    });
    // Loans due
    live(D).filter((r) => r.kind === 'loan' && r.due && L.loanOutstanding(r) > 0).forEach((r) => {
      const days = Math.round((L.parseISO(r.due) - L.parseISO(day)) / 86400000);
      if (days > 1) return;
      const lend = same(r.lender, D.me);
      const out = L.loanOutstanding(r);
      if (!once('loan|' + r.id + '|' + day)) return;
      if (lend) ask(D, days === 1 ? '📅 ' + esc(r.borrower) + '\'s ' + fmt(out) + ' is due tomorrow.' : days === 0 ? '📅 Did ' + esc(r.borrower) + ' return ' + fmt(out) + '? It\'s due today.' : '⏰ ' + esc(r.borrower) + '\'s ' + fmt(out) + ' is ' + (-days) + ' day' + (days === -1 ? '' : 's') + ' late.',
        days === 1 ? [opt('OK', { do: 'noop' })] : [opt('Yes, received', { do: 'loan-received', loanId: r.id }, 'black'), opt('Part of it', { do: 'loan-part', who: r.borrower }), opt('Remind on WhatsApp', { do: 'whatsapp', person: r.borrower, amount: out, text: 'Hey ' + r.borrower + ', just a reminder about the ' + fmt(out) + (days === 0 ? ', due today' : '') + ' 🙂' }, 'lime'), opt('Give 7 more days', { do: 'loan-extend', loanId: r.id, days: 7 })]);
      else ask(D, (days <= 0 ? '📅 You need to return ' : '📅 Tomorrow you need to return ') + fmt(out) + ' to ' + esc(r.lender) + '.', [person(D, r.lender).upi ? opt('Pay with UPI', { do: 'upi', person: r.lender, amount: out }, 'lime') : null, opt('Mark returned', { do: 'loan-paid', loanId: r.id }, 'black')].filter(Boolean));
    });
    // Settle schedules
    people(D).filter((p) => p.settle).forEach((p) => {
      const due = p.settle === 'daily' ? now.getHours() >= 18 : p.settle === 'weekly' ? now.getDay() === 0 : now.getDate() === 1;
      if (!due) return;
      const bal = L.balanceWith(live(D), D.me, p.name);
      if (!bal || !once('settle|' + p.name + '|' + day)) return;
      ask(D, '🤝 Settle-up time with ' + esc(p.name) + ': ' + (bal > 0 ? esc(p.name) + ' owes you <b>' + fmt(bal) + '</b>.' : 'you owe <b>' + fmt(-bal) + '</b>.'), bal > 0
        ? [opt('Mark received', { do: 'settle-in', person: p.name, amount: bal }, 'black'), opt('Remind on WhatsApp', { do: 'whatsapp', person: p.name, amount: bal }, 'lime'), opt('Carry forward', { do: 'noop', text: 'OK, carried forward.' })]
        : [p.upi ? opt('Pay with UPI', { do: 'upi', person: p.name, amount: -bal }, 'lime') : null, opt('Mark paid', { do: 'settle-out', person: p.name, amount: -bal }, 'black'), opt('Carry forward', { do: 'noop', text: 'OK, carried forward.' })].filter(Boolean));
    });
    // Claims pending more than a week (weekly)
    const oldClaims = live(D).filter((r) => r.claim && r.claimStatus === 'pending' && (now.getTime() - r.createdAt) > 7 * 86400000);
    if (oldClaims.length && now.getDay() === 1 && once('claims|' + day)) ask(D, '💼 ' + fmt(oldClaims.reduce((a, r) => a + r.amount, 0)) + ' in claims is still pending. Got reimbursed?', [opt('Yes, received', { do: 'intent', intent: { type: 'claim-received', amount: null } }, 'black'), opt('Not yet', { do: 'noop' })]);
    // Month-end close
    if (now.getDate() === L.daysInMonth(now) && now.getHours() >= 12 && once('close|' + mk)) {
      const s = L.safeToSpend(D, live(D), now);
      const left = s ? Math.max(0, Math.floor(s.pool - s.spentToday)) : 0;
      if (left > 100) ask(D, '🌙 Month-end close! You have about <b>' + fmt(left) + '</b> left over this month. Move it to savings so it doesn\'t quietly disappear?', [opt('Move to Emergency', { do: 'month-close', pot: 'emergency', amount: left }, 'black')].concat(D.goals.slice(0, 2).map((g) => opt('Move to ' + g.name, { do: 'month-close', pot: 'goal:' + g.id, amount: left }))).concat([opt('Keep it', { do: 'noop', text: 'OK, it rolls into next month.' })]));
    }
    // Sunday check-in
    if (now.getDay() === 0 && now.getHours() >= 10 && once('weekly|' + day)) {
      const ws = L.weekStart(now); const we = new Date(ws); we.setDate(ws.getDate() + 6);
      const s = L.mySpend(live(D), D.me, inRange({ from: ws, to: we }));
      if (s.total) { const top = Object.entries(s.byCat).sort((a, b) => b[1] - a[1])[0]; say(D, '🗓️ Weekly check-in: you spent <b>' + fmt(s.total) + '</b> this week, most on ' + top[0] + ' (' + fmt(top[1]) + '). ' + tipFor(D, monthKey(now))); }
    }
  }
  function tipFor(D, mk) {
    const rep = L.repeatSpends(live(D), D.me, (r) => (r.date || '').startsWith(mk))[0];
    if (rep && rep.count >= 5) return 'Tip: ' + rep.name + ' showed up ' + rep.count + ' times (' + fmt(rep.total) + '). Halving it saves about ' + fmt(Math.round(rep.total / 2)) + ' a month.';
    const subs = D.bills.filter((b) => b.category === 'Subscriptions' && !b.stopped);
    if (subs.length >= 3) return 'Tip: you have ' + subs.length + ' subscriptions. Cancelling one you rarely use is the easiest saving.';
    return 'Tip: logging small spends like chai and auto is where most of the "where did it go?" money hides.';
  }

  // Overview helpers used by the UI
  function dueSoon(D) {
    const out = []; const now = clock();
    L.billsThisMonth(D.bills.filter((b) => !b.stopped), now).filter((b) => !b.paid && b.days <= 7).forEach((b) => out.push({ kind: 'bill', id: b.id, title: b.name, sub: b.days < 0 ? 'overdue' : b.days === 0 ? 'due today' : 'in ' + b.days + ' day' + (b.days === 1 ? '' : 's'), amount: b.amountNow, day: L.parseISO(b.dueISO).getDate(), urgent: b.days <= 1 }));
    people(D).forEach((p) => { const b = L.balanceWith(live(D), D.me, p.name); if (b) out.push({ kind: 'friend', id: p.name, title: b > 0 ? p.name + ' owes you' : 'You owe ' + p.name, sub: 'shared expenses', amount: Math.abs(b), incoming: b > 0 }); });
    live(D).filter((r) => r.kind === 'loan' && L.loanOutstanding(r) > 0).forEach((r) => { const lend = same(r.lender, D.me); const days = r.due ? Math.round((L.parseISO(r.due) - L.parseISO(todayISO())) / 86400000) : null;
      out.push({ kind: 'loan', id: r.id, title: lend ? r.borrower + ' owes you' : 'You owe ' + r.lender, sub: 'loan' + (r.due ? (days < 0 ? ' · ' + (-days) + 'd late' : ' · due ' + niceDate(r.due)) : ''), amount: L.loanOutstanding(r), incoming: lend, urgent: days !== null && days <= 0 }); });
    const claims = live(D).filter((r) => r.claim && r.claimStatus === 'pending');
    if (claims.length) out.push({ kind: 'claim', id: 'claims', title: 'Office claims', sub: claims.length + ' pending', amount: claims.reduce((a, r) => a + r.amount, 0), incoming: true });
    return out;
  }

  const api = { paydaySplit, keepLabel, pruneChat, blank, migrateV1, ctx, handle, exec, runAction, proactive, addCaptures, startSetup, setupStep, recLine, splitText, dueSoon, buildPrompt, splitPlan, putInPot, snapshot, undo, live, allCats, niceDate, addRecord, touch, setClock: (f) => { clock = f; }, say, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
