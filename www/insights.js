/* Cookie & Milk: insights. Chart specs, the "why" behind numbers, and the privacy-safe summary
   that the AI brain sees. Pure functions (no DOM), so they run in Node tests too. */
(function (root) {
  'use strict';
  const L = (typeof module !== 'undefined' && module.exports) ? require('./logic.js') : root.Logic;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const PALETTE = ['#1B1B1F', '#A99EEA', '#B6D84E', '#F2A0AE', '#9CC3E0', '#F5B971', '#7FC8A9', '#C9C8D1'];
  const live = (D) => D.records.filter((r) => !r.deleted);
  const fmt = (n) => L.formatINR(n);
  const monthStart = (d, back) => new Date(d.getFullYear(), d.getMonth() - (back || 0), 1);
  const inMonth = (r, d) => (r.date || '').startsWith(L.monthKey(d));
  const catMatch = (cat) => (r) => !cat || r.category === cat;

  // Category colour
  const catColor = (c) => (L.catOf(c) && L.catOf(c).name === c ? L.catOf(c).fg : '#C9C8D1');

  // ---- Chart builders. Each returns a spec the UI draws. ----
  function compareMonths(D, now, cat) {
    const recs = live(D); const me = D.me;
    const a = monthStart(now, 0), b = monthStart(now, 1);
    const na = L.daysInMonth(a), nb = L.daysInMonth(b);
    const cum = (start, n, upto) => { const out = []; let run = 0; for (let i = 1; i <= n; i++) { const k = L.isoDate(new Date(start.getFullYear(), start.getMonth(), i)); run += recs.filter((r) => r.date === k && catMatch(cat)(r)).reduce((s, r) => s + L.mySpendOf(r, me), 0); out.push(i <= upto ? Math.round(run) : null); } return out; };
    const today = now.getDate();
    const thisM = cum(a, na, today), lastM = cum(b, nb, nb);
    const len = Math.max(na, nb);
    const nowVal = thisM[today - 1] || 0; const thenVal = lastM[Math.min(today, nb) - 1] || 0;
    const diff = nowVal - thenVal;
    return {
      kind: 'lines', title: (cat ? cat + ': ' : '') + MON[a.getMonth()] + ' vs ' + MON[b.getMonth()],
      sub: !lastM[nb - 1] ? 'No data for ' + MON[b.getMonth()] + ' yet, so nothing to compare' : thenVal || nowVal ? (diff <= 0 ? fmt(-diff) + ' less than this point last month 🎉' : fmt(diff) + ' more than this point last month') : 'Nothing logged yet',
      big: fmt(nowVal), x: Array.from({ length: len }, (_, i) => String(i + 1)),
      series: [{ name: MON[b.getMonth()], color: '#C9C8D1', values: lastM }, { name: MON[a.getMonth()], color: '#1B1B1F', values: thisM }],
    };
  }
  function months(D, now, n, cat) {
    const recs = live(D); const out = [];
    for (let i = n - 1; i >= 0; i--) { const m = monthStart(now, i); const v = recs.filter((r) => inMonth(r, m) && catMatch(cat)(r)).reduce((s, r) => s + L.mySpendOf(r, D.me), 0); out.push({ label: MON[m.getMonth()], value: Math.round(v), hi: i === 0 }); }
    const avg = out.slice(0, -1).reduce((s, x) => s + x.value, 0) / Math.max(1, out.length - 1);
    return { kind: 'bars', title: (cat ? cat + ', ' : 'Spending, ') + 'last ' + n + ' months', sub: 'Average ' + fmt(Math.round(avg)) + ' a month', bars: out };
  }
  function weeks(D, now, n) {
    const recs = live(D); const out = []; const ws = L.weekStart(now);
    for (let i = n - 1; i >= 0; i--) { const s = new Date(ws); s.setDate(s.getDate() - 7 * i); const e = new Date(s); e.setDate(e.getDate() + 6); const sk = L.isoDate(s), ek = L.isoDate(e); const v = recs.filter((r) => r.date >= sk && r.date <= ek).reduce((a, r) => a + L.mySpendOf(r, D.me), 0); out.push({ label: s.getDate() + ' ' + MON[s.getMonth()], value: Math.round(v), hi: i === 0 }); }
    return { kind: 'bars', title: 'Spending, last ' + n + ' weeks', bars: out };
  }
  function periodFilter(per, now) {
    const mk = L.monthKey(now);
    if (per === 'last-month') { const p = L.monthKey(monthStart(now, 1)); return { label: 'last month', f: (r) => (r.date || '').startsWith(p) }; }
    if (per === 'week') { const s = L.isoDate(L.weekStart(now)); return { label: 'this week', f: (r) => r.date >= s }; }
    if (per === 'year') { const y = String(now.getFullYear()); return { label: 'this year', f: (r) => (r.date || '').startsWith(y) }; }
    if (per === 'today') { const k = L.isoDate(now); return { label: 'today', f: (r) => r.date === k }; }
    return { label: 'this month', f: (r) => (r.date || '').startsWith(mk) };
  }
  function categories(D, now, per) {
    const p = periodFilter(per, now); const { total, byCat } = L.mySpend(live(D), D.me, p.f);
    const slices = Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: Math.round(v), color: catColor(k) }));
    return { kind: 'donut', title: 'Where your money went, ' + p.label, big: fmt(total), slices };
  }
  function catCompare(D, now) {
    const recs = live(D); const a = L.mySpend(recs, D.me, (r) => inMonth(r, monthStart(now, 0))).byCat; const b = L.mySpend(recs, D.me, (r) => inMonth(r, monthStart(now, 1))).byCat;
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort((x, y) => ((a[y] || 0) + (b[y] || 0)) - ((a[x] || 0) + (b[x] || 0))).slice(0, 7);
    const up = keys.map((k) => [k, (a[k] || 0) - (b[k] || 0)]).sort((x, y) => y[1] - x[1])[0];
    return { kind: 'grouped', title: 'Categories: ' + MON[now.getMonth()] + ' vs ' + MON[monthStart(now, 1).getMonth()], legend: [MON[monthStart(now, 1).getMonth()], MON[now.getMonth()]],
      sub: up && up[1] > 0 ? 'Biggest jump: ' + up[0] + ' (+' + fmt(Math.round(up[1])) + ')' : '', groups: keys.map((k) => ({ label: k, a: Math.round(b[k] || 0), b: Math.round(a[k] || 0) })) };
  }
  function weekday(D, now) {
    const recs = live(D); const tot = [0, 0, 0, 0, 0, 0, 0]; const cnt = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 1; i <= 56; i++) { const d = new Date(now); d.setDate(d.getDate() - i); const k = L.isoDate(d); const wd = (d.getDay() + 6) % 7; cnt[wd]++; tot[wd] += recs.filter((r) => r.date === k && !L.FIXED.has(r.category)).reduce((a, r) => a + L.mySpendOf(r, D.me), 0); }
    const bars = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l, i) => ({ label: l, value: Math.round(tot[i] / Math.max(1, cnt[i])) }));
    const top = bars.slice().sort((x, y) => y.value - x.value)[0]; if (top && top.value) top.hi = true;
    return { kind: 'bars', title: 'Average everyday spend by weekday', sub: top && top.value ? top.label + ' is your biggest day' : 'Not enough data yet', bars };
  }
  function days(D, now, per) {
    const recs = live(D); let start, n;
    if (per === 'week') { start = L.weekStart(now); n = 7; } else { start = monthStart(now, 0); n = now.getDate(); }
    const s = L.daySeries(recs, D.me, start, n, true);
    return { kind: 'bars', title: 'Daily spending, ' + (per === 'week' ? 'this week' : 'this month'), bars: s.map((d, i) => ({ label: per === 'week' ? 'MTWTFSS'[i] : String(i + 1), value: Math.round(d.total), hi: d.key === L.isoDate(now) })) };
  }
  function people(D) {
    const recs = live(D);
    const rows = D.people.map((p) => { const lw = L.loansWith(recs, D.me, p.name); return { label: p.name, value: Math.round(L.balanceWith(recs, D.me, p.name) + lw.lentOut - lw.borrowed) }; }).filter((x) => x.value).sort((a, b) => b.value - a.value);
    rows.forEach((r) => { r.color = r.value > 0 ? '#7FC8A9' : '#F2A0AE'; r.note = r.value > 0 ? 'owes you' : 'you owe'; });
    return { kind: 'hbars', title: 'Who owes what', sub: rows.length ? '' : 'Everyone is settled 🎉', rows };
  }
  function incomeVsSpend(D, now, n) {
    const recs = live(D); const groups = [];
    for (let i = n - 1; i >= 0; i--) { const m = monthStart(now, i); const inc = recs.filter((r) => r.kind === 'income' && inMonth(r, m)).reduce((a, r) => a + r.amount, 0) || (D.income && D.income.amount && i > 0 ? 0 : 0); const sp = recs.filter((r) => inMonth(r, m)).reduce((a, r) => a + L.mySpendOf(r, D.me), 0); groups.push({ label: MON[m.getMonth()], a: Math.round(inc), b: Math.round(sp) }); }
    return { kind: 'grouped', title: 'Money in vs money out', legend: ['In', 'Out'], colors: ['#7FC8A9', '#1B1B1F'], groups };
  }
  function goals(D) {
    const rows = [];
    if (D.emergency) rows.push({ label: 'Emergency', value: Math.round(D.emergency.saved || 0), max: Math.max(1, (D.emergency.target || 0)), color: '#F2A0AE' });
    (D.goals || []).forEach((g) => rows.push({ label: g.name, value: Math.round(g.saved || 0), max: g.target || 1, color: '#A99EEA' }));
    (D.sinking || []).forEach((g) => rows.push({ label: g.name, value: Math.round(g.saved || 0), max: g.target || 1, color: '#B6D84E' }));
    rows.forEach((r) => { r.note = fmt(r.value) + (r.max > 1 ? ' of ' + fmt(r.max) : ''); });
    return { kind: 'hbars', title: 'Savings progress', progress: true, sub: rows.length ? '' : 'No goals yet. Try: goal bike 60000 by june', rows };
  }

  function chart(D, spec, now) {
    now = now || new Date();
    switch (spec.chart) {
      case 'compare': return compareMonths(D, now, spec.cat);
      case 'months': return months(D, now, spec.n || 6, spec.cat);
      case 'weeks': return weeks(D, now, spec.n || 8);
      case 'categories': return categories(D, now, spec.per);
      case 'cat-compare': return catCompare(D, now);
      case 'weekday': return weekday(D, now);
      case 'days': return days(D, now, spec.per);
      case 'people': return people(D);
      case 'income': return incomeVsSpend(D, now, spec.n || 6);
      case 'goals': return goals(D);
      default: return compareMonths(D, now, spec.cat);
    }
  }

  // ---- "Why is safe to spend X?" ----
  function explainSafe(D, now) {
    const s = L.safeToSpend(D, live(D), now || new Date());
    if (!s) return { lines: ['Tell me your salary or a monthly budget first, like <b>salary 85000</b>.'] };
    const L2 = [];
    if (s.rule && s.rule.period === 'day') {
      L2.push('You set a daily limit of <b>' + fmt(s.rule.amount) + '</b>.');
      L2.push('Spent today (everyday things, not bills): <b>' + fmt(s.spentToday) + '</b>.');
    } else if (s.rule) {
      L2.push('Your ' + s.rule.period + 'ly limit: <b>' + fmt(s.rule.amount) + '</b>.');
      L2.push('Already spent before today: <b>' + fmt(s.spentBefore) + '</b>.');
      L2.push('Left, shared over ' + s.daysLeft + ' days: <b>' + fmt(s.perDay) + '</b> a day.');
      L2.push('Spent today: <b>' + fmt(s.spentToday) + '</b>.');
    } else {
      L2.push('Monthly base (' + (D.income && D.income.amount ? 'salary' : 'budget') + '): <b>' + fmt(s.base) + '</b>.');
      if (s.billsTotal) L2.push('Minus bills and fixed costs: <b>' + fmt(s.billsTotal) + '</b>.');
      if (s.savings) L2.push('Minus savings plans: <b>' + fmt(s.savings) + '</b>.');
      if (s.spentBefore != null) L2.push('Minus everyday spending before today: <b>' + fmt(s.spentBefore) + '</b>.');
      L2.push('What\'s left, shared over ' + s.daysLeft + ' days: <b>' + fmt(s.perDay) + '</b> a day.');
      if (s.spentToday) L2.push('Minus today\'s spending: <b>' + fmt(s.spentToday) + '</b>.');
      if (D.safeCap) L2.push('Capped by your limit of ' + fmt(D.safeCap) + ' a day.');
    }
    L2.push(s.over ? '➡️ You\'re over today, so it shows <b>₹0</b>. Tomorrow resets.' : '➡️ Safe to spend today: <b>' + fmt(s.safe) + '</b>.');
    return { lines: L2, s };
  }

  // ---- Privacy-safe snapshot for the AI brain: totals only, people masked ----
  function maskMap(D) {
    const map = {}; const rev = {};
    (D.people || []).forEach((p, i) => { const tok = 'Person' + String.fromCharCode(65 + (i % 26)) + (i >= 26 ? i : ''); map[p.name] = tok; rev[tok] = p.name; });
    return { map, rev };
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function mask(text, D) {
    const { map } = maskMap(D); let t = String(text || '');
    Object.keys(map).sort((a, b) => b.length - a.length).forEach((n) => { t = t.replace(new RegExp('\\b' + escapeRe(n) + '\\b', 'gi'), map[n]); const first = n.split(' ')[0]; if (first.length > 2) t = t.replace(new RegExp('\\b' + escapeRe(first) + '\\b', 'gi'), map[n]); });
    if (D.me) t = t.replace(new RegExp('\\b' + escapeRe(D.me) + '\\b', 'gi'), 'Me');
    t = t.replace(/(?:AIza|AQ\.|sk-ant-|gsk_)[0-9A-Za-z_.\-]{20,}/g, '[key]').replace(/[\w.\-]+@[a-z]{2,}/gi, '[upi]').replace(/\b\d{9,18}\b/g, '[number]').replace(/\b[A-Z]{4}0[A-Z0-9]{6}\b/g, '[ifsc]');
    return t;
  }
  function unmask(text, D) {
    const { rev } = maskMap(D); let t = String(text || '');
    Object.keys(rev).sort((a, b) => b.length - a.length).forEach((tok) => { t = t.replace(new RegExp('\\b' + tok + '\\b', 'g'), rev[tok]); });
    return t.replace(/\bMe\b/g, 'me');
  }
  function summary(D, now) {
    now = now || new Date(); const recs = live(D); const me = D.me;
    const m0 = L.mySpend(recs, me, (r) => inMonth(r, monthStart(now, 0))); const m1 = L.mySpend(recs, me, (r) => inMonth(r, monthStart(now, 1)));
    const s = L.safeToSpend(D, recs, now);
    const recent = recs.filter((r) => r.kind === 'expense' || r.kind === 'income' || r.kind === 'settlement').sort((a, b) => b.createdAt - a.createdAt).slice(0, 15)
      .map((r) => ({ date: r.date, kind: r.kind, note: mask(r.note || '', D), amount: r.amount, my: Math.round(L.mySpendOf(r, me)), category: r.category, with: Object.keys(r.shares || {}).filter((n) => !L.same(n, me)).map((n) => mask(n, D)) }));
    const bal = {}; (D.people || []).forEach((p) => { const lw = L.loansWith(recs, me, p.name); const v = Math.round(L.balanceWith(recs, me, p.name) + lw.lentOut - lw.borrowed); if (v) bal[mask(p.name, D)] = v; });
    const wk = weekday(D, now).bars.map((b) => b.label + ':' + b.value).join(', ');
    const sixMonths = months(D, now, 6).bars.map((b) => b.label + ':' + b.value).join(', ');
    return {
      today: L.isoDate(now), currency: 'INR',
      thisMonth: { total: Math.round(m0.total), byCategory: round(m0.byCat) }, lastMonth: { total: Math.round(m1.total), byCategory: round(m1.byCat) },
      lastSixMonths: sixMonths, avgSpendByWeekday: wk,
      income: D.income && D.income.amount ? D.income.amount : null, monthlyBudget: D.budget || null,
      safeToSpendToday: s ? s.safe : null, daysLeftInMonth: s ? s.daysLeft : null,
      categoryBudgets: D.catBudgets || {}, balances: bal,
      goals: (D.goals || []).map((g) => ({ name: g.name, target: g.target, saved: g.saved, by: g.by })), emergencySaved: D.emergency ? D.emergency.saved : 0,
      bills: (D.bills || []).map((b) => ({ name: mask(b.name, D), amount: b.amount, day: b.day })),
      people: (D.people || []).map((p) => mask(p.name, D)), categories: (D.customCats || []).concat(L.CATS.map((c) => c.name)),
      recentEntries: recent,
    };
  }
  function round(o) { const r = {}; Object.keys(o || {}).forEach((k) => { r[k] = Math.round(o[k]); }); return r; }

  const api = { chart, explainSafe, summary, mask, unmask, MON, PALETTE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Insights = api;
})(typeof window !== 'undefined' ? window : globalThis);
