/* Cookie & Milk: the smart brain (Google Gemini, free tier).
   Privacy: people's names are swapped for PersonA, PersonB..., UPI IDs and account numbers are removed,
   and only totals plus the last few entries are sent. Gemini never changes data itself: it answers with
   Cookie commands, which run through the normal rules with Undo. All maths stays on the phone. */
(function (root) {
  'use strict';
  const API = 'https://generativelanguage.googleapis.com/v1beta';
  const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite'];

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
- "reply": a short, warm, cute message (max 70 words, plain text, no markdown, never use the em dash character). When commands are given, say briefly what you're doing. For questions, answer using ONLY numbers in DATA; never invent or calculate new totals beyond simple comparisons of given numbers. If DATA lacks it, say so and suggest a command.
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
  // Retry short network blips (DNS hiccups, switching between Wi-Fi and mobile data)
  async function http(url, body, key) {
    for (let i = 0; ; i++) {
      try { return await http1(url, body, key); }
      catch (e) { const m = String(e && e.message || e); if (i >= 2 || !/resolve host|hostname|Failed to fetch|network|timed? ?out|abort|connection|ECONN|EAI_|Unable to/i.test(m)) throw e; await new Promise((r) => setTimeout(r, 1200 * (i + 1))); }
    }
  }
  async function http1(url, body, key) {
    const headers = { 'x-goog-api-key': key };
    if (body) headers['Content-Type'] = 'application/json';
    const opts = body ? { method: 'POST', headers, body: JSON.stringify(body) } : { method: 'GET', headers };
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = setTimeout(() => ctrl && ctrl.abort(), 30000);
    try {
      const res = await fetch(url, Object.assign(opts, ctrl ? { signal: ctrl.signal } : {}));
      const txt = await res.text(); let json = null; try { json = JSON.parse(txt); } catch (e) {}
      return { ok: res.ok, status: res.status, json, txt };
    } finally { clearTimeout(t); }
  }
  // Pick the best free "flash" model available to this key
  async function pickModel(key) {
    try {
      const r = await http(API + '/models?pageSize=200', null, key);
      if (r.status === 400 || r.status === 401 || r.status === 403) return { error: 'key', detail: googleMsg(r) };
      const list = (r.json && r.json.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, ''))
        .filter((n) => /flash/.test(n) && !/(image|tts|live|audio|vision|thinking|exp|embedding|transcribe|omni|lite)/.test(n));
      const score = (n) => { const v = n.match(/(\d+(?:\.\d+)?)/); return (v ? Number(v[1]) : 0) * 10 - (/preview/.test(n) ? 5 : 0) + (/latest/.test(n) ? 3 : 0); };
      list.sort((a, b) => score(b) - score(a));
      if (list.length) return { model: list[0], all: list };
    } catch (e) { /* offline or blocked: fall back */ }
    return { model: FALLBACK_MODELS[0] };
  }
  async function generate(D, parts, json) {
    const key = D.ai && D.ai.key; if (!key) throw new Error('nokey');
    if (!D.ai.model) { const p = await pickModel(key); if (p.error === 'key') throw new Error('badkey'); D.ai.model = p.model; }
    const tried = [];
    let model = D.ai.model;
    for (let attempt = 0; attempt < 3; attempt++) {
      tried.push(model);
      const body = { systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: 'user', parts }], generationConfig: Object.assign({ temperature: 0.2, maxOutputTokens: 4096 }, json ? { responseMimeType: 'application/json' } : {}) };
      const r = await http(API + '/models/' + model + ':generateContent', body, key);
      if (r.ok) {
        const c = r.json && r.json.candidates && r.json.candidates[0];
        const text = c && c.content && c.content.parts ? c.content.parts.map((p) => p.text || '').join('') : '';
        D.ai.model = model; D.ai.used = (D.ai.used || 0) + 1;
        return text;
      }
      if (r.status === 429) throw new Error('limit');
      if (r.status === 401 || r.status === 403 || (r.status === 400 && /API key|API_KEY|credential/i.test(r.txt))) { const e = new Error('badkey'); e.detail = googleMsg(r); throw e; }
      if (r.status === 404 || r.status === 400) { model = FALLBACK_MODELS.find((m) => !tried.includes(m)); if (!model) break; continue; }
      { const e = new Error('http' + r.status); e.detail = googleMsg(r); throw e; }
    }
    throw new Error('model');
  }
  function googleMsg(r) { const e = r && r.json && r.json.error; return e ? (e.status ? e.status + ': ' : '') + String(e.message || '').slice(0, 160) : 'HTTP ' + (r && r.status); }
  function history(D, I, n) {
    return D.chat.slice(-n - 1, -1).map((m) => (m.from === 'me' ? 'User: ' : 'Cookie: ') + I.mask(String(m.text || (m.card && (m.card.title || (m.card.data && m.card.data.title))) || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), D).slice(0, 220)).filter((x) => x.length > 8).join('\n');
  }
  // Main entry: turn a message into commands + a reply
  async function interpret(D, text, I) {
    const data = I.summary(D, new Date());
    const prompt = 'DATA (JSON): ' + JSON.stringify(data) + '\n\nRECENT CHAT:\n' + history(D, I, 8) + '\n\nUSER MESSAGE: ' + I.mask(text, D);
    const out = await generate(D, [{ text: prompt }], true);
    const j = extractJSON(out) || { commands: [], reply: String(out || '').slice(0, 400) };
    j.commands = (Array.isArray(j.commands) ? j.commands : []).map((c) => I.unmask(String(c), D).replace(/[—]/g, ', ').trim()).filter((c) => c && c.length < 200).slice(0, 8);
    j.reply = I.unmask(String(j.reply || ''), D).replace(/\s*—\s*/g, ', ').trim();
    j.confirm = !!j.confirm || j.commands.length > 2 || j.commands.some((c) => /^(delete|remove|reset|clear)/i.test(c));
    return j;
  }
  // Test the key and pick a model
  async function check(D) {
    const p = await pickModel(D.ai.key);
    if (p.error) return { ok: false, error: 'badkey', detail: p.detail };
    D.ai.model = p.model;
    try { await generate(D, [{ text: 'Reply with {"commands":[],"reply":"ok","confirm":false}' }], true); return { ok: true, model: D.ai.model }; }
    catch (e) { return { ok: false, error: e.message, detail: e.detail }; }
  }
  function errorText(e) {
    const m = (e && e.message) || '';
    if (m === 'nokey') return 'Smart mode needs a free Gemini key.';
    if (m === 'badkey') return 'Google didn\'t accept the key' + (e.detail ? ' (' + e.detail + ')' : '') + '. Copy it again from AI Studio, with no spaces.';
    if (m === 'limit') return 'The free Gemini limit is used up for now. I\'ll be smart again later 🍪';
    if (/abort|Failed to fetch|Network|network|resolve host|hostname|Unable to|timed? ?out|connection/i.test(m)) return 'I couldn\'t reach Google right now (internet hiccup). Your key is fine, try again in a moment.';
    return 'My smart brain had a hiccup (' + m + (e.detail ? ', ' + e.detail : '') + '). Try again in a bit.';
  }
  const api = { interpret, check, errorText, extractJSON, SYSTEM };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Brain = api;
})(typeof window !== 'undefined' ? window : globalThis);
