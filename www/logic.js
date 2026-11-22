// Pure money logic. No DOM here, so it can be tested in Node.
(function (root) {
  const norm = (s) => String(s || '').trim().toLowerCase();
  const same = (a, b) => norm(a) === norm(b) && norm(a) !== '';
  const round2 = (n) => Math.round(n * 100) / 100;

  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function monthKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); }

  // Who is part of a record (payer + the person it is shared with).
  function participants(r) {
    if (r.kind === 'settlement') return [r.from, r.to];
    const p = [r.paidBy];
    if (r.with) p.push(r.with);
    return p;
  }
  function involves(r, name) { return participants(r).some((p) => same(p, name)); }

  // Read a share for a name, matching names case-insensitively.
  function shareOf(r, name) {
    if (!r.shares) return 0;
    for (const k of Object.keys(r.shares)) if (same(k, name)) return Number(r.shares[k]) || 0;
    return 0;
  }

  // Build shares for a new expense.
  // split: 'none' | 'half' | 'custom' | 'all' ('all' = the person who did not pay owes everything)
  function makeShares({ amount, paidBy, withName, split, myShare, me }) {
    amount = round2(Number(amount) || 0);
    if (!withName || split === 'none') return { [paidBy]: amount };
    const other = same(paidBy, me) ? withName : me;
    if (split === 'half') {
      const half = Math.floor((amount / 2) * 100) / 100;
      // the payer absorbs any odd paisa
      return { [paidBy]: round2(amount - half), [other]: half };
    }
    if (split === 'all') return { [paidBy]: 0, [other]: amount };
    // custom: myShare is the share of `me`
    const mine = Math.min(Math.max(round2(Number(myShare) || 0), 0), amount);
    const theirs = round2(amount - mine);
    const res = {};
    res[me] = mine;
    res[same(me, paidBy) ? withName : paidBy] = theirs;
    return res;
  }

  // Positive result = `person` owes `me`. Negative = `me` owes `person`.
  function balanceWith(records, me, person) {
    let bal = 0;
    for (const r of records) {
      if (r.deleted) continue;
      if (r.kind === 'settlement') {
        if (same(r.from, person) && same(r.to, me)) bal -= Number(r.amount) || 0;
        else if (same(r.from, me) && same(r.to, person)) bal += Number(r.amount) || 0;
        continue;
      }
      if (!r.with) continue;
      const pair = involves(r, me) && involves(r, person);
      if (!pair) continue;
      if (same(r.paidBy, me)) bal += shareOf(r, person);
      else if (same(r.paidBy, person)) bal -= shareOf(r, me);
    }
    return round2(bal);
  }

  // Totals paid out of pocket in a shared relationship (for the balance card).
  function paidTotals(records, me, person) {
    let mine = 0, theirs = 0;
    for (const r of records) {
      if (r.deleted || r.kind !== 'expense' || !r.with) continue;
      if (!(involves(r, me) && involves(r, person))) continue;
      if (same(r.paidBy, me)) mine += Number(r.amount) || 0;
      else if (same(r.paidBy, person)) theirs += Number(r.amount) || 0;
    }
    return { mine: round2(mine), theirs: round2(theirs) };
  }

  // My own spending: only my share of each expense counts.
  function mySpend(records, me, filterFn) {
    let total = 0;
    const byCat = {};
    for (const r of records) {
      if (r.deleted || r.kind !== 'expense') continue;
      if (!involves(r, me)) continue;
      if (filterFn && !filterFn(r)) continue;
      const s = shareOf(r, me);
      total += s;
      byCat[r.category || 'Other'] = (byCat[r.category || 'Other'] || 0) + s;
    }
    for (const k of Object.keys(byCat)) byCat[k] = round2(byCat[k]);
    return { total: round2(total), byCat };
  }

  // Spend per day for the 7 days of the week containing `today` (Mon..Sun).
  function weekSpend(records, me, today) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dow = (d.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(d); monday.setDate(d.getDate() - dow);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday); day.setDate(monday.getDate() + i);
      const key = isoDate(day);
      days.push({ key, label: 'MTWTFSS'[i], total: mySpend(records, me, (r) => r.date === key).total, isToday: key === isoDate(d) });
    }
    return days;
  }

  // Next upcoming bill from a list of {name, amount, day}
  function nextBill(bills, today) {
    if (!bills || !bills.length) return null;
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let best = null;
    for (const b of bills) {
      const day = Math.min(Math.max(parseInt(b.day, 10) || 1, 1), 28);
      let due = new Date(t.getFullYear(), t.getMonth(), day);
      if (due < t) due = new Date(t.getFullYear(), t.getMonth() + 1, day);
      const days = Math.round((due - t) / 86400000);
      if (!best || days < best.days) best = { ...b, days };
    }
    return best;
  }

  // Merge remote records into local ones. Newer updatedAt wins.
  function mergeRecords(local, remote, me) {
    const map = new Map(local.map((r) => [r.id, r]));
    let changed = 0;
    for (const r of remote) {
      if (!r || !r.id) continue;
      if (!involves(r, me)) continue;
      const cur = map.get(r.id);
      if (!cur || (Number(r.updatedAt) || 0) > (Number(cur.updatedAt) || 0)) {
        map.set(r.id, { ...r, synced: true });
        changed++;
      } else if (cur && (Number(r.updatedAt) || 0) === (Number(cur.updatedAt) || 0) && !cur.synced) {
        map.set(r.id, { ...cur, synced: true });
      }
    }
    return { records: Array.from(map.values()), changed };
  }

  // Records that should go to the shared sheet (shared ones only; personal stays on the phone).
  function syncable(r) { return r.kind === 'settlement' || !!r.with; }

  // Quick add parser for the chat composer: "450 groceries" or "groceries 450"
  function parseQuick(text) {
    const m = String(text || '').trim().match(/^(?:₹\s*)?(\d+(?:\.\d{1,2})?)\s*(.*)$|^(.*?)\s+(?:₹\s*)?(\d+(?:\.\d{1,2})?)$/);
    if (!m) return null;
    const amount = Number(m[1] || m[4]);
    const note = (m[2] !== undefined ? m[2] : m[3] || '').trim();
    if (!amount) return null;
    return { amount, note };
  }

  function formatINR(n, opts) {
    const v = Math.abs(Number(n) || 0);
    const hasPaise = Math.round(v * 100) % 100 !== 0;
    const s = v.toLocaleString('en-IN', { minimumFractionDigits: hasPaise ? 2 : 0, maximumFractionDigits: 2 });
    return (opts && opts.sign && n < 0 ? '−' : '') + '₹' + s;
  }
  function shortINR(n) {
    const v = Math.abs(Number(n) || 0);
    if (v >= 100000) return '₹' + (v / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    if (v >= 1000) return '₹' + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return '₹' + Math.round(v);
  }

  const api = { norm, same, round2, isoDate, monthKey, participants, involves, shareOf, makeShares, balanceWith, paidTotals, mySpend, weekSpend, nextBill, mergeRecords, syncable, parseQuick, formatINR, shortINR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof window !== 'undefined' ? window : globalThis);
