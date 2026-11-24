/* Cookie & Milk: the smart brain (Claude Haiku via the Claude API).
   Privacy: people's names are swapped for PersonA, PersonB..., UPI IDs and account numbers are removed,
   and only totals plus the last few entries are sent. Claude never changes data itself: it answers with
   Cookie commands, which run through the normal rules with Undo. All maths stays on the phone. */
(function (root) {
  'use strict';

  const COMMANDS = `
LOG A SPEND: "tea 40" | "petrol 500 yesterday" | "tea 20, samosa 30, auto 60" (several at once)
SPLITS: "dinner 900 with PersonA and PersonB" (equal, includes me) | "lunch PersonA 50 PersonB 50 me 30" (custom shares) | "PersonA tea 40" (PersonA owes all) | "PersonA paid dinner 900" (they paid, split equally) | "dinner 2400 my treat"
GROUP COLLECTION: "PersonA gave 300, PersonB 500" | "everyone paid"
SETTLE / LOANS: "PersonA paid me 500" | "settle PersonA" | "lent PersonA 2000 by 27th" | "borrowed 500 from PersonA"
FIX ENTRIES: "make it 50" (last entry amount) | "change last to shopping" | "that was yesterday" | "delete last" | "delete today's entries" | "delete tea" | "undo"
MONEY SETUP: "salary 85000" | "payday 5th" | "budget food 8000" | "remove food budget" | "set safe spend to 300" | "safe spend 4000 per month" | "rent 18000 every 5th" (bill) | "rent paid" | "save 5000 emergency" | "goal iphone 80000 by june" | "start goa trip budget 15000" | "end trip" | "amazon refund 500" | "office cab 400 claim"
TEACH: "zudio is shopping" | "gang = PersonA PersonB" | "add category pets" | "change name of health to wellness" (category)
GRAPHS: "this month vs last month" | "food this month vs last month" | "spending last 6 months" | "where did my money go" | "categories vs last month" | "which day do I spend most" | "who owes what graph" | "income vs spending chart" | "goals progress chart" | "daily spending this week"
ANSWERS FROM APP: "who owes me" | "top spends this month" | "how much on food this month" | "why is my safe to spend 0"
APP & LAYOUT: "open settings" | "open bills" | "show my settings" | "dark mode" | "light mode" | "turn off reminders" | "hide amounts" | "move recent to the top" | "rename savings to investments" | "hide budgets" | "show budgets" | "swap budgets and savings" | "pin this" | "add a card showing food this month" | "reset overview" | "keep chat for 30 days" | "my name is X" | "rename PersonA to Y" | "delete gifts category" | "backup now"`;

  const SYSTEM = `You are Cookie, the friendly brain inside "Cookie & Milk", a personal finance chat app for an Indian user (amounts in rupees). The user writes casually, sometimes in Tanglish, Kanglish or Hinglish.
You cannot change any data yourself. You reply ONLY with JSON: {"commands": [strings], "reply": string, "confirm": boolean}.
- "commands": phrases in the app's own command language (list below) that do what the user wants. The app runs them in order, each with Undo. Use [] if nothing should change.
- "reply": a short, warm, cute message (max 70 words, plain text, no markdown, never use the em dash character). Output ONLY the JSON object, nothing before or after it. When commands are given, say briefly what you're doing. For questions, answer using ONLY numbers in DATA; never invent or calculate new totals beyond simple comparisons of given numbers. If DATA lacks it, say so and suggest a command.
- "confirm": true if commands delete things, change more than 2 things, or you're unsure. The app will ask the user first.
People appear as PersonA, PersonB... and the user as "me". Keep those tokens exactly. Never output real names you don't see.
If the request is unclear, ask ONE short question in reply and return no commands.
For "why"/"how am I doing" questions, look at DATA (thisMonth vs lastMonth, byCategory, avgSpendByWeekday, lastSixMonths) and explain plainly. You may add a GRAPHS command to show it.
For advice, give 2-3 practical tips based on DATA. You are not a financial advisor; keep it general and friendly.
COMMAND LANGUAGE (use these exact styles):${COMMANDS}`;

  function extractJSON(text) {
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { /* try to find a JSON block */ }
    const m = String(text).match(/\{[\s\S]*\}/); if (!m) return null;
    try { return JSON.parse(m[0]); } catch (e) { return null; }
  }

  // ---------------- Claude API ----------------
  const API = 'https://api.anthropic.com/v1';
  const MODELS = ['claude-haiku-5-5'];
  let RELAY = '';
  async function direct(path, body, key) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = setTimeout(() => ctrl && ctrl.abort(), 40000);
    try {
      const res = await fetch(API + '/' + path, Object.assign({ method: body ? 'POST' : 'GET', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' } }, body ? { body: JSON.stringify(body) } : {}, ctrl ? { signal: ctrl.signal } : {}));
      const txt = await res.text(); let json = null; try { json = JSON.parse(txt); } catch (e) {}
      return { ok: res.ok, status: res.status, json, txt };
    } finally { clearTimeout(t); }
  }
  // Through the user's own Apps Script on script.google.com (for networks that block the API)
  async function viaRelay(path, body, key) {
    const res = await fetch(RELAY, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ provider: 'anthropic', path, body: body || null, apiKey: key }) });
    const txt = await res.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {}
    if (!j || typeof j.status !== 'number') throw Object.assign(new Error('relay'), { detail: res.ok ? 'The relay URL didn\'t answer like Cookie\'s relay script.' : 'Relay HTTP ' + res.status });
    let json = null; try { json = JSON.parse(j.body); } catch (e) {}
    return { ok: j.status >= 200 && j.status < 300, status: j.status, json, txt: j.body };
  }
  const netErr = (e) => /resolve host|hostname|Failed to fetch|network|timed? ?out|abort|connection|ECONN|EAI_|Unable to/i.test(String(e && e.message || e));
  let DIRECT_OK = null;
  async function http(path, body, key) {
    // Direct first; if this network can't reach the API and a relay is set, go through the relay
    if (!RELAY || DIRECT_OK !== false) {
      for (let i = 0; i < 2; i++) {
        try { const r = await direct(path, body, key); DIRECT_OK = true; return r; }
        catch (e) { if (!netErr(e)) throw e; if (i === 1) { if (!RELAY) throw e; DIRECT_OK = false; } else await new Promise((r) => setTimeout(r, 1000)); }
      }
    }
    return viaRelay(path, body, key);
  }
  const apiMsg = (r) => { const e = r && r.json && r.json.error; return e ? (e.type ? e.type + ': ' : '') + String(e.message || '').slice(0, 160) : 'HTTP ' + (r && r.status); };
  async function generate(D, text) {
    const key = D.ai && D.ai.key; if (!key) throw new Error('nokey');
    RELAY = (D.ai.relay || '').trim();
    const models = [D.ai.model].concat(MODELS).filter((m, i, a) => m && a.indexOf(m) === i);
    let last = null;
    for (const model of models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const body = { model, max_tokens: 1024, temperature: 0.2, system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: text }] };
        const r = await http('messages', body, key);
        if (r.ok) { D.ai.model = model; D.ai.used = (D.ai.used || 0) + 1; return (r.json && r.json.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(''); }
        const msg = apiMsg(r);
        if (r.status === 401 || r.status === 403) throw Object.assign(new Error('badkey'), { detail: msg });
        if (/credit balance|billing|purchase credits/i.test(r.txt || '')) throw Object.assign(new Error('credit'), { detail: msg });
        if (r.status === 404 || (r.status === 400 && /model/i.test(r.txt || ''))) { last = Object.assign(new Error('model'), { detail: msg }); break; }
        if (r.status === 429 || r.status === 529 || r.status >= 500) { last = Object.assign(new Error(r.status === 429 ? 'limit' : 'busy'), { detail: msg }); await new Promise((res) => setTimeout(res, 1500 * (attempt + 1))); continue; }
        throw Object.assign(new Error('http' + r.status), { detail: msg });
      }
    }
    throw last || new Error('model');
  }
  function history(D, I, n) {
    return D.chat.slice(-n - 1, -1).map((m) => (m.from === 'me' ? 'User: ' : 'Cookie: ') + I.mask(String(m.text || (m.card && (m.card.title || (m.card.data && m.card.data.title))) || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), D).slice(0, 220)).filter((x) => x.length > 8).join('\n');
  }
  // Main entry: turn a message into commands + a reply
  async function interpret(D, text, I) {
    const data = I.summary(D, new Date());
    const prompt = 'DATA (JSON): ' + JSON.stringify(data) + '\n\nRECENT CHAT:\n' + history(D, I, 8) + '\n\nUSER MESSAGE: ' + I.mask(text, D);
    const out = await generate(D, prompt);
    const j = extractJSON(out) || { commands: [], reply: String(out || '').slice(0, 400) };
    j.commands = (Array.isArray(j.commands) ? j.commands : []).map((c) => I.unmask(String(c), D).replace(/[—]/g, ', ').trim()).filter((c) => c && c.length < 200).slice(0, 8);
    j.reply = I.unmask(String(j.reply || ''), D).replace(/\s*—\s*/g, ', ').trim();
    j.confirm = !!j.confirm || j.commands.length > 2 || j.commands.some((c) => /^(delete|remove|reset|clear)/i.test(c));
    return j;
  }
  // Test the key
  async function check(D) {
    try { await generate(D, 'Reply with {"commands":[],"reply":"ok","confirm":false}'); return { ok: true, lines: ['✓ Working! Using ' + D.ai.model + '.'] }; }
    catch (e) { return { ok: false, lines: [errorText(e)] }; }
  }
  function errorText(e) {
    const m = (e && e.message) || '';
    if (m === 'nokey') return 'Smart mode needs a Claude API key.';
    if (m === 'badkey') return 'Claude didn\'t accept the key' + (e.detail ? ' (' + e.detail + ')' : '') + '. Copy it again from console.anthropic.com, it starts with sk-ant-.';
    if (m === 'credit') return 'Your Claude account has no credit left. Add credit at console.anthropic.com › Billing.';
    if (m === 'busy') return 'Claude is busy for a moment. Try again in a minute 🍪';
    if (m === 'limit') return 'Too many requests at once. Try again in a minute 🍪';
    if (m === 'relay') return 'The relay didn\'t work' + (e.detail ? ': ' + e.detail : '.');
    if (netErr(e)) return RELAY ? 'I couldn\'t reach your relay script. Check your internet.' : 'I couldn\'t reach Claude. Check your internet, or add the relay URL in Settings › Smart mode.';
    return 'My smart brain had a hiccup (' + m + (e.detail ? ', ' + e.detail : '') + '). Try again in a bit.';
  }
  const api = { interpret, check, errorText, extractJSON, SYSTEM };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Brain = api;
})(typeof window !== 'undefined' ? window : globalThis);
