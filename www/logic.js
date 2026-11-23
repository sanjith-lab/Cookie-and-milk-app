/* Cookie & Milk: money brain. Pure functions, no DOM, so it runs in Node tests too. */
(function (root) {
  'use strict';

  // ---------------- Categories ----------------
  const CATS = [
    { name: 'Food & Drink', bg: '#F9D4DA', fg: '#F2A0AE', d: 'M4 11h16a8 8 0 0 1-16 0zM8 7c0-2 2-2 2-4M12 7c0-2 2-2 2-4', type: 'want' },
    { name: 'Groceries', bg: '#E8F7B8', fg: '#B6D84E', d: 'M5 8h14l-1.5 11h-11zM9 8l3-5 3 5', type: 'need' },
    { name: 'Rent', bg: '#1B1B1F', fg: '#1B1B1F', d: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', type: 'need', fixed: true, dark: true },
    { name: 'Shopping', bg: '#E4E0F7', fg: '#A99EEA', d: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2', type: 'want' },
    { name: 'Transport', bg: '#DCEAF4', fg: '#9CC3E0', d: 'M5 17h14l-1.5-6h-11zM7 17v2M17 17v2M8 11l1.5-4h5L16 11', type: 'need' },
    { name: 'Entertainment', bg: '#CDC6F2', fg: '#8F82E0', d: 'M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z', type: 'want' },
    { name: 'Internet & Mobile', bg: '#DCEAF4', fg: '#7FAFD3', d: 'M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M12 19h.01', type: 'need', fixed: true },
    { name: 'Bills & Utilities', bg: '#FCE3C4', fg: '#F0B46A', d: 'M13 3L5 14h6l-1 7 8-11h-6z', type: 'need', fixed: true },
    { name: 'Subscriptions', bg: '#E4E0F7', fg: '#B9AEEE', d: 'M4 6h16v12H4zM10 9l5 3-5 3z', type: 'want', fixed: true },
    { name: 'Medical', bg: '#F9D4DA', fg: '#E5484D', d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', type: 'need' },
    { name: 'Fitness', bg: '#E8F7B8', fg: '#8DB82E', d: 'M6 9v6M18 9v6M3 11v2M21 11v2M6 12h12', type: 'want' },
    { name: 'Personal Care', bg: '#FCE3C4', fg: '#E8A04C', d: 'M9 3h6v4H9zM8 7h8l1 14H7z', type: 'want' },
    { name: 'Trips', bg: '#D7F0E6', fg: '#5DBB94', d: 'M2 16l20-8-4 10-6-2-3 4v-5', type: 'want' },
    { name: 'Gifts', bg: '#F9D4DA', fg: '#F2A0AE', d: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0', type: 'want' },
    { name: 'Education', bg: '#DCEAF4', fg: '#6E9BC6', d: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5', type: 'need' },
    { name: 'EMI & Loans', bg: '#E9E8EF', fg: '#6B6A75', d: 'M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', type: 'need', fixed: true },
    { name: 'Home', bg: '#D7F0E6', fg: '#7CC7A6', d: 'M4 20V9l8-5 8 5v11M9 20v-6h6v6', type: 'need' },
    { name: 'Family support', bg: '#FCE3C4', fg: '#E8A04C', d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10zM9 11h6', type: 'need' },
    { name: 'Other', bg: '#EEEDF3', fg: '#C9C8D1', d: 'M5 12h.01M12 12h.01M19 12h.01', type: 'want' },
  ];
  const CAT_ALIASES = {
    food: 'Food & Drink', 'food and drink': 'Food & Drink', 'food & drink': 'Food & Drink', drinks: 'Food & Drink', eating: 'Food & Drink',
    grocery: 'Groceries', groceries: 'Groceries', rent: 'Rent', shopping: 'Shopping', shop: 'Shopping', transport: 'Transport', travel: 'Transport',
    entertainment: 'Entertainment', fun: 'Entertainment', internet: 'Internet & Mobile', mobile: 'Internet & Mobile', phone: 'Internet & Mobile',
    bills: 'Bills & Utilities', utilities: 'Bills & Utilities', bill: 'Bills & Utilities', subscriptions: 'Subscriptions', subscription: 'Subscriptions',
    medical: 'Medical', health: 'Medical', fitness: 'Fitness', gym: 'Fitness', 'personal care': 'Personal Care', grooming: 'Personal Care',
    trips: 'Trips', trip: 'Trips', gifts: 'Gifts', gift: 'Gifts', education: 'Education', emi: 'EMI & Loans', loans: 'EMI & Loans', 'emi & loans': 'EMI & Loans',
    home: 'Home', family: 'Family support', 'family support': 'Family support', other: 'Other', others: 'Other',
  };
  const KEYWORDS = {
    'Food & Drink': 'tea chai coffee swiggy zomato dinner lunch breakfast snack snacks food restaurant cafe biryani pizza burger dosa idli meals juice beer drinks pub bar bakery cake starbucks dominos mcd kfc thali eatout eat zepto cafe tiffin pani puri chaat shawarma momos icecream',
    'Groceries': 'grocery groceries vegetables veggies fruits milk bigbasket blinkit instamart dmart supermarket kirana rice atta dal eggs bread curd provisions jiomart',
    'Rent': 'rent pg hostel',
    'Shopping': 'tshirt shirt tshirts jeans pants trousers kurta saree dress clothes shoes sneakers slippers watch bag wallet zudio myntra ajio amazon flipkart meesho nykaa shopping jacket hoodie cap belt perfume headphones earphones charger cable phonecase gadget mall decathlon h&m uniqlo westside',
    'Transport': 'uber ola rapido auto metro bus train cab taxi petrol diesel fuel toll parking bike scooter namma yatri irctc ticket commute service',
    'Entertainment': 'movie movies cinema pvr inox bookmyshow concert party game games gaming bowling event show standup club',
    'Internet & Mobile': 'wifi internet broadband recharge airtel jio vi postpaid prepaid data',
    'Bills & Utilities': 'electricity current bescom water gas cylinder maintenance dth cable',
    'Subscriptions': 'netflix spotify prime hotstar youtube icloud subscription apple music jiocinema sonyliv zee5 chatgpt claude',
    'Medical': 'doctor medicine medicines pharmacy tablets hospital clinic test tests lab dentist dental eye checkup scan apollo medplus 1mg',
    'Fitness': 'gym yoga swimming cult sports badminton football cricket protein supplements run marathon fitness turf',
    'Personal Care': 'salon haircut hair spa grooming skincare facial shave barber cosmetics',
    'Trips': 'hotel flight resort homestay airbnb trip vacation holiday booking oyo goa ooty coorg',
    'Gifts': 'gift gifts present birthday anniversary wedding donation charity flowers',
    'Education': 'course book books udemy class tuition fees exam certification coursera',
    'EMI & Loans': 'emi loan installment',
    'Home': 'furniture repair plumber electrician carpenter maid cook laundry ironing cleaning decor utensils mattress bedsheet curtain pest',
    'Family support': 'amma appa mom dad mother father parents home-support',
  };
  const FAMILY_WORDS = ['amma', 'appa', 'mom', 'dad', 'mummy', 'papa', 'mother', 'father', 'parents', 'akka', 'anna', 'thambi', 'thangachi', 'sister', 'brother', 'paati', 'thatha', 'ajji', 'ajja', 'grandma', 'grandpa', 'aunty', 'uncle', 'chitti', 'chithappa', 'mama', 'atthe'];
  const FIXED = new Set(CATS.filter((c) => c.fixed).map((c) => c.name));
  const RECURRING_WORDS = ['gym', 'netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'icloud', 'rent', 'wifi', 'broadband', 'maid', 'cook', 'emi', 'insurance', 'sip', 'subscription', 'recharge', 'postpaid', 'maintenance', 'tuition', 'cult', 'yoga', 'chatgpt', 'claude'];
  // Filler words (English + Tanglish / Kanglish / Hinglish) that never carry meaning
  const FILLER = new Set(('i me my mine paid pay paying spent spend spending bought buy buying got for on the a an to of and with at in from today rs inr rupees ' +
    'ku kku ge ki ka ko ke haaku haakide kotte kottu kottidini aaythu aaytu aachu panni pannen pannitten vangine vanginen kodutten kudutten maadide kharid kiya diya liya ' +
    'was is it this that some just only also too please add log').split(' '));

  const norm = (s) => String(s || '').trim().toLowerCase();
  const same = (a, b) => norm(a) === norm(b) && norm(a) !== '';
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const pad = (n) => String(n).padStart(2, '0');
  const isoDate = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const monthKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1);
  const parseISO = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const catOf = (name) => CATS.find((c) => c.name === name) || CATS[CATS.length - 1];
  const titleCase = (s) => String(s || '').replace(/\b\w/g, (c) => c.toUpperCase());
  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  function cleanText(t) {
    return String(t || '')
      .replace(/₹\s*/g, ' ')
      .replace(/(\d),(\d)/g, '$1$2').replace(/(\d),(\d)/g, '$1$2')
      .replace(/\b(\d+(?:\.\d+)?)\s*k\b/gi, (m, n) => String(Math.round(Number(n) * 1000)))
      .replace(/\bpayed\b/gi, 'paid').replace(/\brecieved\b/gi, 'received').replace(/\brecived\b/gi, 'received')
      .replace(/\bt[\s-]?shirts?\b/gi, 'tshirt')
      .replace(/\s+/g, ' ').trim();
  }

  // ---------------- Category guessing ----------------
  function stem(w) { return w.replace(/'s$/, '').replace(/(es|s)$/, (m, g, off, str) => (str.length > 4 ? '' : m)); }
  function guessCategory(words, learned) {
    learned = learned || {};
    for (const w of words) { const k = norm(w); if (learned[k]) return { cat: learned[k], learned: true }; }
    const phrase = words.map(norm).join(' ');
    for (const k of Object.keys(learned)) if (k.includes(' ') && phrase.includes(k)) return { cat: learned[k], learned: true };
    for (const [cat, list] of Object.entries(KEYWORDS)) {
      const set = list.split(' ');
      for (const w0 of words) {
        const w = norm(w0); if (!w || /^\d/.test(w)) continue;
        const s = stem(w);
        if (set.includes(w) || set.includes(s)) return { cat };
        if (s.length >= 5 && set.some((k) => k.length >= 5 && (k.startsWith(s) || s.startsWith(k)))) return { cat };
      }
    }
    return { cat: 'Other' };
  }

  // ---------------- Names ----------------
  function matchPerson(word, people) {
    const w = norm(word); if (!w) return null;
    const p = (people || []).find((x) => norm(x.name) === w || norm(x.name).split(' ')[0] === w);
    return p ? p.name : null;
  }
  const isMeWord = (w) => ['me', 'myself', 'i', 'mine'].includes(norm(w));

  // ---------------- Dates ----------------
  function parseDue(text, today) {
    const t = norm(text);
    let m = t.match(/\b(?:by|before|on|till|until)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)?\b/);
    if (m) {
      const day = Number(m[1]);
      let mon = m[2] ? MONTHS.indexOf(m[2]) : today.getMonth();
      let yr = today.getFullYear();
      let d = new Date(yr, mon, day);
      if (!m[2] && d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) d = new Date(yr, mon + 1, day);
      if (m[2] && d < today) d = new Date(yr + 1, mon, day);
      return isoDate(d);
    }
    if (/\b(by|before)\s+tomorrow\b/.test(t)) { const d = new Date(today); d.setDate(d.getDate() + 1); return isoDate(d); }
    m = t.match(/\b(?:in|within)\s+(\d+)\s+(day|days|week|weeks)\b/);
    if (m) { const d = new Date(today); d.setDate(d.getDate() + Number(m[1]) * (m[2].startsWith('week') ? 7 : 1)); return isoDate(d); }
    if (/\bnext week\b/.test(t)) { const d = new Date(today); d.setDate(d.getDate() + 7); return isoDate(d); }
    if (/\bnext month\b/.test(t)) { const d = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()); return isoDate(d); }
    return null;
  }
  function parseFromMonth(text, today) {
    const m = norm(text).match(/\bfrom\s+(next month|this month|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\b/);
    if (!m) return null;
    if (m[1] === 'this month') return monthKey(today);
    if (m[1] === 'next month') return monthKey(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    const mi = MONTHS.indexOf(m[2]);
    let y = today.getFullYear();
    if (mi < today.getMonth()) y++;
    return y + '-' + pad(mi + 1);
  }
  function parseDayOfMonth(text) {
    const m = norm(text).match(/\b(?:every|on|each)\s+(?:month\s+on\s+)?(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)\b/) || norm(text).match(/\bevery\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
    return m ? Math.min(Math.max(Number(m[1]), 1), 31) : null;
  }


  const COMMAND_START = /^(open|go to|goto|take me|turn|enable|disable|hide|unhide|rename|set|change|update|make|edit|delete|remove|clear|reset|divide|multiply|subtract|calculate|calc|compute|show|list|find|rename|increase|decrease|reduce|raise|lower|turn|enable|disable|switch|cancel|stop|start|keep|limit|cap|put|move|mark|undo|please|can you|could you|i want|i need|let me|tell me)\b/;
  const SETTING_WORDS = new Set(['safe', 'spend', 'spending', 'limit', 'budget', 'salary', 'income', 'setting', 'settings', 'daily', 'monthly', 'weekly', 'per', 'divide', 'divided', 'multiply', 'times', 'calculate', 'delete', 'remove', 'entries', 'entry', 'reminder', 'remind', 'goal', 'target', 'cap']);

  // Safe maths for "divide 4000 by 30" style messages
  function parseMath(t) {
    let e = t.replace(/^(?:what(?:'s| is)|calculate|calc|compute|solve|how much is|whats)\s+/, '').replace(/\?$/, '').trim();
    let m = e.match(/^(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)$/);
    if (m) return mathOut(t, m[1] + '% of ' + m[2], Number(m[1]) / 100 * Number(m[2]));
    m = e.match(/^(divide|multiply|add|subtract)\s+(\d+(?:\.\d+)?)\s+(?:by|with|to|from|and)\s+(\d+(?:\.\d+)?)$/);
    if (m) {
      const x = Number(m[2]), y = Number(m[3]);
      const op = m[1];
      if (op === 'divide') return y ? mathOut(t, x + ' ÷ ' + y, x / y, { per: y, total: x }) : null;
      if (op === 'multiply') return mathOut(t, x + ' × ' + y, x * y);
      if (op === 'add') return mathOut(t, x + ' + ' + y, x + y);
      return mathOut(t, x + ' − ' + y, x - y);
    }
    m = e.match(/^(\d+(?:\.\d+)?)\s*(?:divided by|by)\s*(\d+(?:\.\d+)?)$/);
    if (m && /divided/.test(e)) return Number(m[2]) ? mathOut(t, m[1] + ' ÷ ' + m[2], Number(m[1]) / Number(m[2]), { per: Number(m[2]), total: Number(m[1]) }) : null;
    m = e.match(/^(\d+(?:\.\d+)?)\s*(?:times|multiplied by)\s*(\d+(?:\.\d+)?)$/);
    if (m) return mathOut(t, m[1] + ' × ' + m[2], Number(m[1]) * Number(m[2]));
    const expr = e.replace(/×|x(?=\s*\d)/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
    if (/^[\d.+\-*/()]+$/.test(expr) && /\d[+\-*/]\(?\d/.test(expr)) {
      try {
        const v = evalExpr(expr);
        if (isFinite(v)) { const dm = expr.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/); return mathOut(t, e.replace(/\*/g, ' × ').replace(/\//g, ' ÷ '), v, dm ? { per: Number(dm[2]), total: Number(dm[1]) } : null); }
      } catch (err) { return null; }
    }
    return null;
  }
  function mathOut(t, label, value, extra) { return Object.assign({ type: 'math', label, value: Math.round(value * 100) / 100 }, extra || {}); }
  // Tiny recursive-descent evaluator (+ - * / and brackets), no eval()
  function evalExpr(s) {
    let i = 0;
    const num = () => { let j = i; while (i < s.length && /[\d.]/.test(s[i])) i++; if (j === i) throw new Error('num'); return Number(s.slice(j, i)); };
    const factor = () => { if (s[i] === '(') { i++; const v = expr(); i++; return v; } if (s[i] === '-') { i++; return -factor(); } return num(); };
    const term = () => { let v = factor(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const r = factor(); v = op === '*' ? v * r : v / r; } return v; };
    const expr = () => { let v = term(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const r = term(); v = op === '+' ? v + r : v - r; } return v; };
    const v = expr(); if (i !== s.length) throw new Error('rest'); return v;
  }

  // Safe-to-spend settings in plain words
  function parseSafe(t) {
    const safeWords = /\bsafe\s*(?:to\s*)?spend(?:ing)?\b|\b(?:daily|spend(?:ing)?|day)\s+(?:limit|budget|cap|allowance)\b|\ballowance\b/;
    const keepWords = /^(?:i\s+(?:want|need|wanna)\s+to\s+|let me\s+|help me\s+)?(?:only\s+)?(?:spend|keep (?:my )?spending|limit (?:my )?spending)\s+(?:only\s+|under\s+|below\s+|at most\s+|max\s+)?(\d+)/;
    const isSafe = safeWords.test(t);
    const km = t.match(keepWords);
    if (!isSafe && !km && !/\bbudget\s+\d+\s*(?:per|a|an|\/|every|each)\s*(?:day|week)\b|\bbudget\s+(?:per|a)\s+day\b/.test(t)) return null;
    if (isSafe && /\b(without|excluding|exclude|ignore)\s+savings\b/.test(t)) return { type: 'safe-mode', mode: 'no-savings' };
    if (isSafe && /\b(with|including|include)\s+savings\b/.test(t)) return { type: 'safe-mode', mode: 'with-savings' };
    if (isSafe && /\b(reset|remove|clear|turn off|delete|cancel|no limit|disable|default|auto|automatic)\b/.test(t)) return { type: 'safe-reset' };
    const a = (t.match(/\b(\d+(?:\.\d+)?)\b/) || [])[1];
    if (!a) return isSafe ? { type: 'question', text: 'safe to spend' } : null;
    const period = /\b(month|monthly|months|mo)\b/.test(t) ? 'month' : /\b(week|weekly|weeks|wk)\b/.test(t) ? 'week' : 'day';
    return { type: 'safe-set', amount: Number(a), period };
  }

  // ---------------- The message parser ----------------
  // ctx = { me, people:[{name}], shortcuts:{flat:[names]}, bills:[{id,name,amount}], goals:[{name}], sinking:[{name}], learned:{}, autoSplit:{cat:[names]}, today: Date }
  function parse(raw, ctx) {
    const today = ctx.today || new Date();
    const text = cleanText(raw);
    const t = norm(text);
    const people = ctx.people || [];
    const bills = ctx.bills || [];
    if (!t) return { type: 'empty' };
    let m;
    const amountIn = (s) => { const x = s.replace(/\b(\d{1,2})(st|nd|rd|th)\b/g, '').match(/\b(\d+(?:\.\d+)?)\b/); return x ? Number(x[1]) : null; };

    if (/^(help|what can you do|commands|how to use)\??$/.test(t)) return { type: 'help' };
    if (/^undo$/.test(t)) return { type: 'undo' };
    if (/^(hi|hello|hey|hii+|yo|good (morning|evening|night|afternoon))\b/.test(t) && !/\d/.test(t)) return { type: 'greet' };



    // ---------- Navigation & toggles ----------
    m = t.match(/^(?:please\s+)?(?:open|go to|goto|show|show me|take me to|view|see)?\s*(?:the\s+|my\s+)?(settings?|account|profile|overview|charts?|graphs?|insights|reports?|history|payment history|transactions|savings|savings page)(?:\s+page|\s+screen|\s+tab)?$/);
    if (m) { const v = m[1]; return { type: 'open', view: /setting|account|profile/.test(v) ? 'settings' : /overview/.test(v) ? 'overview' : /chart|graph|insight|report/.test(v) ? 'charts' : /saving/.test(v) ? 'savings' : 'history' }; }
    if (/^(?:turn on|enable|start|switch on|activate)\s+(?:payment detection|payment tracking|upi tracking|sms(?: reading| tracking)?|auto(?:matic)? tracking|detection)$/.test(t)) return { type: 'enable-sms' };
    m = t.match(/^(turn on|enable|switch on|turn off|disable|switch off|stop|mute|unmute)\s+(?:all\s+)?(reminders?|notifications?|nudges?)$/);
    if (m) return { type: 'reminders-toggle', on: /^(turn on|enable|switch on|unmute)/.test(m[1]) };
    if (/^(hide|blur)\s+(?:my\s+)?(amounts?|numbers|money)$/.test(t)) return { type: 'hide-amounts', on: true };
    if (/^(show|unhide|unblur)\s+(?:my\s+)?(amounts?|numbers|money)$/.test(t)) return { type: 'hide-amounts', on: false };

    // ---------- Rename a category: "change name of health to health and lifestyle" ----------
    m = t.match(/^(?:change|rename|update)\s+(?:the\s+)?(?:name\s+of\s+)?(?:the\s+)?(?:category\s+)?(.+?)(?:\s+category)?(?:'s\s+name)?\s+(?:to|as|into)\s+(.+)$/);
    if (m && resolveCat(m[1], ctx) && !resolveCat(m[2], ctx)) return { type: 'cat-rename', from: resolveCat(m[1], ctx), to: titleCase(m[2].replace(/\s+category$/, '')) };

    // ---------- Maths: "divide 4000 by 30", "4000/30", "18% of 2500", "what is 1200+340" ----------
    const mathRes = parseMath(t);
    if (mathRes) return mathRes;

    // ---------- Safe to spend: "set safe spend to 150", "safe spend 4000 per month", "daily limit 200" ----------
    const safeRes = parseSafe(t);
    if (safeRes) return safeRes;

    // ---------- Clear chat ----------
    if (/^(clear|clean|reset|empty)\s+(the\s+)?(chat|messages|screen)$/.test(t)) return { type: 'chat-clear' };
    if (/\b(chat|chats|messages|chat history)\b/.test(t) && /\b(keep|save|store|delete|clear|remove|history|forever|never|refresh|fresh)\b/.test(t) && !/^(clear|clean|reset|empty)\s+(the\s+)?(chat|messages|screen)$/.test(t)) {
      if (/(forever|never (delete|clear|remove)|do ?n.?t (delete|clear|remove)|dont (delete|clear|remove)|keep (all|everything)|always keep)/.test(t)) return { type: 'chat-keep', days: -1 };
      const dm = t.match(/(\d+)\s*(day|days|week|weeks|month|months)\b/);
      if (dm) { const n = +dm[1] * (/week/.test(dm[2]) ? 7 : /month/.test(dm[2]) ? 30 : 1); return { type: 'chat-keep', days: n }; }
      if (/\b(a|one) (week)\b/.test(t)) return { type: 'chat-keep', days: 7 };
      if (/\b(a|one) (month)\b/.test(t)) return { type: 'chat-keep', days: 30 };
      if (/(every ?day|daily|each day|fresh|one day|1 day|only today)/.test(t)) return { type: 'chat-keep', days: 0 };
    }

    // ---------- Delete entries ----------
    m = t.match(/^(?:please\s+)?(?:delete|remove|erase|clear|cancel|undo)\s+(.*)$/);
    if (m && !/\b(category|bill|subscription|goal|budget|reminder|shortcut)\b/.test(m[1])) {
      const rest = m[1].replace(/'s\b/g, ' ').replace(/'/g, '').replace(/\b(entries|entry|expenses|expense|records|record|logs|log|transactions|transaction|spends|spend|items|item|of|the|my|all|from|for|please|s)\b/g, ' ').replace(/'s\b/g, ' ').replace(/\s+/g, ' ').trim();
      const all = /\ball\b|\bevery/.test(m[1]);
      const pr = people.find((x) => rest.split(' ').includes(norm(x.name)));
      if (/^(last|previous|that|it|this|recent|latest|the last one|last one)$/.test(rest) || rest === '') return { type: 'delete', scope: 'last' };
      if (pr && rest === norm(pr.name)) return { type: 'delete-person-ask', person: pr.name };
      const day = /\btoday\b|\btodays\b/.test(rest) ? 0 : /\byesterday\b/.test(rest) ? -1 : null;
      const kw = rest.replace(/\btoday\b|\btodays\b|\byesterday\b|\bthis week\b/g, ' ').trim();
      const week = /\bthis week\b/.test(rest);
      return { type: 'delete', scope: day !== null || week ? (week ? 'week' : 'day') : 'keyword', day, kw: kw || null, all: all || (day !== null && !kw) || week };
    }

    // ---------- Edit the last entry: "change last to 50", "make it 450", "that was shopping", "actually yesterday" ----------
    m = t.match(/^(?:change|make|update|edit|correct|fix|set)\s+(?:it|that|this|the\s+last(?:\s+one)?|last(?:\s+one|\s+entry|\s+expense)?)\s*(?:to|as|into|=)?\s*(.+)$/) ||
        t.match(/^(?:actually|no|nope|sorry|oops|wait)[,!.]?\s+(?:it\s+was|it'?s|that\s+was|make\s+it|change\s+it\s+to|it\s+is)?\s*(.+)$/) ||
        t.match(/^(?:it|that)\s+(?:was|is|should be)\s+(.+)$/);
    if (m) {
      const v = m[1].trim();
      const ch = {};
      const num = v.match(/^(?:rs\s*)?(\d+(?:\.\d+)?)$/) || v.match(/^(?:rs\s*)?(\d+(?:\.\d+)?)\s+(?:rupees|rs)?$/);
      if (num) ch.amount = Number(num[1]);
      const c = resolveCat(v.replace(/^(?:a|an|in|under|category)\s+/, ''), ctx);
      if (c) ch.cat = c;
      if (/^yesterday$/.test(v)) { const d = new Date(today); d.setDate(d.getDate() - 1); ch.date = isoDate(d); }
      if (/^today$/.test(v)) ch.date = isoDate(today);
      const pr = people.find((x) => norm(x.name) === v.replace(/^(?:split\s+)?(?:with\s+)?/, ''));
      if (pr) ch.splitWith = pr.name;
      if (/^(?:just me|only me|mine|personal)$/.test(v)) ch.justMe = true;
      const ren = m[0].match(/^(?:rename|change)\s+(?:it|that|last(?:\s+one)?)\s+to\s+([a-z].+)$/);
      if (!Object.keys(ch).length && /^[a-z][a-z '&]{1,30}$/.test(v)) ch.note = titleCase(v);
      if (Object.keys(ch).length) return { type: 'edit-last', change: ch };
    }
    m = t.match(/^rename\s+(?:it|that|last(?:\s+one)?|the\s+last(?:\s+one)?)\s+(?:to|as)\s+(.+)$/);
    if (m) return { type: 'edit-last', change: { note: titleCase(m[1]) } };

    // ---------- List entries: "show today's entries", "list swiggy this month" ----------
    if (/^(show|list|view|display|see|find|search)\b/.test(t) && !/\b(chart|charts|graph|overview|savings|settings|help)\b/.test(t)) return { type: 'list', text: t };

    // Trips
    m = t.match(/^start\s+(?:a\s+)?(.+?)\s+trip(?:\s+(?:with\s+)?budget\s+(\d+))?$/) || t.match(/^start trip\s+(.+?)(?:\s+budget\s+(\d+))?$/);
    if (m) return { type: 'trip-start', name: titleCase(m[1]), budget: m[2] ? Number(m[2]) : 0 };
    if (/^(end|stop|finish|close)\s+(the\s+)?trip$/.test(t)) return { type: 'trip-end' };

    // What-if
    m = t.match(/^what if i\s+(?:stop|cut|quit|skip|reduce|don'?t)\s+(?:ordering\s+)?(.+?)\??$/);
    if (m) return { type: 'whatif', target: m[1].replace(/^(on|the|my)\s+/, '') };

    // Questions / advice
    const isQ = /\?$/.test(t) || /^(how|what|who|whom|where|when|which|did|do|does|can|could|should|show|list|tell|give|top|biggest|is|am|are|total|why)\b/.test(t);
    if (isQ) {
      const advice = /(how (can|do|should) i|tips|advice|suggest|ideas?\b|should i|afford|plan my|save (on|more)|cut down|reduce|improve|budget plan|help me)/.test(t);
      return { type: advice ? 'advice' : 'question', text: t };
    }

    // Settle
    m = t.match(/^settle(?: up)?(?: with)?\s+([a-z]+)\s+(daily|weekly|monthly|every day|every week|every month)$/);
    if (m && matchPerson(m[1], people)) return { type: 'settle-freq', person: matchPerson(m[1], people), freq: m[2].replace('every day', 'daily').replace('every week', 'weekly').replace('every month', 'monthly') };
    m = t.match(/^settle(?: up)?(?: with)?\s+([a-z]+)$/);
    if (m) return { type: 'settle', person: matchPerson(m[1], people) || titleCase(m[1]), known: !!matchPerson(m[1], people) };

    // Split rules
    m = t.match(/^split with\s+([a-z]+)\s+(\d{1,2})\s*[:/ -]?\s*(\d{1,2})$/);
    if (m && matchPerson(m[1], people)) return { type: 'split-ratio', person: matchPerson(m[1], people), mine: Number(m[2]), theirs: Number(m[3]) };
    m = t.match(/^(?:always )?split\s+(.+?)\s+with\s+([a-z]+)$/);
    if (m && matchPerson(m[2], people)) {
      const cats = m[1].split(/,|\band\b/).map((s) => resolveCat(s.trim())).filter(Boolean);
      if (cats.length) return { type: 'auto-split', person: matchPerson(m[2], people), cats };
    }

    // Budget
    m = t.match(/^(?:set\s+)?budget\s+(?:for\s+)?(.*?)\s*(?:to\s+|is\s+|=\s*)?(\d+)$/);
    if (m) return { type: 'budget', cat: m[1] ? resolveCat(m[1]) : null, catText: m[1], amount: Number(m[2]) };

    // Reminders
    m = t.match(/^remind me (?:at|by)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?:\s+(morning|night|evening))?$/);
    if (m) {
      let h = Number(m[1]); if (m[3] === 'pm' && h < 12) h += 12; if (m[3] === 'am' && h === 12) h = 0;
      return { type: 'reminder-time', hour: h, minute: Number(m[2] || 0), which: m[4] || (h < 14 ? 'morning' : 'night') };
    }

    // Categories: new / teach / move
    m = t.match(/^(?:new|add|create)\s+category\s+(.+)$/);
    if (m) return { type: 'new-category', name: titleCase(m[1]) };
    m = t.match(/^move\s+(.+?)\s+to\s+(.+)$/);
    if (m && resolveCat(m[2], ctx)) return { type: 'teach', word: m[1], cat: resolveCat(m[2], ctx), move: true };
    m = t.match(/^([a-z][a-z0-9 &']{1,30}?)\s+(?:is|goes to|=|means)\s+(?:a\s+|an\s+)?(.+)$/);
    if (m && resolveCat(m[2], ctx) && !/\d/.test(m[1]) && !bills.some((b) => same(b.name, m[1]))) return { type: 'teach', word: m[1], cat: resolveCat(m[2], ctx) };

    // Shortcuts: "flat is arjun ram" / "flat = me arjun ram"
    m = t.match(/^([a-z]+)\s+(?:is|=|means)\s+(.+)$/);
    if (m && !matchPerson(m[1], people)) {
      const names = m[2].split(/[\s,]+|\band\b/).filter((w) => w && !isMeWord(w));
      const resolved = names.map((n) => matchPerson(n, people));
      if (names.length && resolved.every(Boolean)) return { type: 'shortcut', name: m[1], people: resolved };
    }

    // People
    m = t.match(/^add\s+(?:person\s+|friend\s+)?([a-z]+)(?:\s+(\S+@\S+))?$/);
    if (m && !resolveCat(m[1])) return { type: 'add-person', name: titleCase(m[1]), upi: m[2] || '' };
    m = t.match(/^([a-z]+)\s+upi\s+(?:is\s+)?(\S+@\S+)$/);
    if (m && matchPerson(m[1], people)) return { type: 'person-upi', person: matchPerson(m[1], people), upi: m[2] };
    m = t.match(/^(?:my upi(?: id)?(?: is)?)\s+(\S+@\S+)$/);
    if (m) return { type: 'my-upi', upi: m[1] };

    // Income
    m = t.match(/^(?:my\s+)?(salary|income|stipend|freelance|bonus|got salary|got paid|received salary|salary credited)\s*(?:of|is|=)?\s*(\d+)(.*)$/) || t.match(/^(?:got|received)\s+(\d+)\s+(salary|bonus|from freelance|freelance)(.*)$/);
    if (m) {
      const amount = Number(/^\d/.test(m[1]) ? m[1] : m[2]);
      const label = /^\d/.test(m[1]) ? m[2] : m[1];
      const rest = m[3] || '';
      const from = parseFromMonth(rest, today);
      const payday = (rest.match(/\bon\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\b/) || [])[1];
      if (from) return { type: 'income-change', amount, from, payday: payday ? Number(payday) : null };
      return { type: 'income', amount, label: /bonus/.test(label) ? 'Bonus' : /freelance/.test(label) ? 'Freelance' : 'Salary', payday: payday ? Number(payday) : null };
    }

    // Savings
    m = t.match(/^(?:save|saved|add|added|put|move|moved|transfer)\s+(\d+)\s+(?:to|in|into|for)?\s*(?:my\s+)?(.+)$/);
    if (m) {
      const target = m[2].replace(/\s+(fund|pot|savings)$/, '').trim();
      return { type: 'save', amount: Number(m[1]), pot: target };
    }
    m = t.match(/^(?:new\s+)?goal\s+(.+?)\s+(\d+)(?:\s+(?:by|before|in)\s+([a-z]+(?:\s+\d{4})?))?$/);
    if (m) {
      let by = null;
      if (m[3]) { const mi = MONTHS.indexOf(m[3].slice(0, 3)); if (mi >= 0) { let y = today.getFullYear(); if (mi <= today.getMonth()) y++; by = y + '-' + pad(mi + 1); } }
      return { type: 'goal', name: titleCase(m[1]), target: Number(m[2]), by };
    }
    m = t.match(/^(?:sinking fund|set aside|yearly|annual)\s+(.+?)\s+(\d+)(?:\s+(?:due\s+)?(?:in|by|on)\s+([a-z]+))?$/);
    if (m) {
      let due = null;
      if (m[3]) { const mi = MONTHS.indexOf(m[3].slice(0, 3)); if (mi >= 0) { let y = today.getFullYear(); if (mi <= today.getMonth()) y++; due = y + '-' + pad(mi + 1); } }
      return { type: 'sinking', name: titleCase(m[1]), target: Number(m[2]), due };
    }
    m = t.match(/^(?:sip|invest|investment|ppf|nps|elss|mutual fund)\s*(?:of)?\s*(\d+)(?:\s+(?:every|on)\s+(\d{1,2})(?:st|nd|rd|th)?)?(.*)$/);
    if (m) return { type: 'investment', amount: Number(m[1]), day: m[2] ? Number(m[2]) : null, name: /ppf/.test(t) ? 'PPF' : /nps/.test(t) ? 'NPS' : /elss/.test(t) ? 'ELSS' : 'SIP' };

    // Bills: add recurring "rent 18000 every 5th", "doctor 2000 every month"
    if (/\bevery\s+(month|\d{1,2}(st|nd|rd|th)?|3 months|quarter|year)\b|\bmonthly\b/.test(t) && /\d/.test(t) && !/^(i\s+)?(lent|borrowed|gave)/.test(t)) {
      const amt = (t.match(/\b(\d+(?:\.\d+)?)\b(?!\s*(?:st|nd|rd|th))/) || [])[1];
      const nameWords = t.replace(/\bevery\b.*$/, '').replace(/\bmonthly\b/, '').replace(/\d+(?:\.\d+)?/g, '').replace(/\b(on|is|of|for|the)\b/g, ' ').trim();
      if (amt && nameWords) {
        const freq = /3 months|quarter/.test(t) ? 'quarterly' : /year/.test(t) ? 'yearly' : 'monthly';
        return { type: 'bill-add', name: titleCase(nameWords), amount: Number(amt), day: parseDayOfMonth(t) || today.getDate(), freq };
      }
    }

    // Bill changes: "rent is 19500 from jan", "rent now 19500", "rent up 5%", "rent increased to 19500"
    const billMatch = (s) => bills.find((b) => same(b.name, s) || norm(b.name).split(' ').includes(norm(s)) || norm(s).split(' ').includes(norm(b.name)));
    m = t.match(/^(?:my\s+)?(.+?)\s+(?:is now|is|now|changed to|increased to|went up to|goes up to|hiked to|became)\s+(\d+)(.*)$/);
    if (m && billMatch(m[1])) return { type: 'bill-change', bill: billMatch(m[1]).id, amount: Number(m[2]), from: parseFromMonth(m[3], today) };
    m = t.match(/^(?:my\s+)?(.+?)\s+(?:up|increased|hiked|increase|hike)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*(%|percent)?(.*)$/);
    if (m && billMatch(m[1])) {
      const b = billMatch(m[1]);
      const amount = m[3] ? Math.round(b.amount * (1 + Number(m[2]) / 100)) : b.amount + Number(m[2]);
      return { type: 'bill-change', bill: b.id, amount, from: parseFromMonth(m[4], today), askFrom: !parseFromMonth(m[4], today) };
    }
    m = t.match(/^(?:stop|cancel|remove|delete|end)\s+(?:my\s+)?(.+?)(?:\s+(?:bill|subscription))?$/);
    if (m && billMatch(m[1])) return { type: 'bill-stop', bill: billMatch(m[1]).id };

    // Bill paid: "emi paid", "paid rent", "rent paid 18000"
    m = t.match(/^(?:paid\s+(?:the\s+|my\s+)?(.+?)|(.+?)\s+(?:paid|done|cleared|settled))(?:\s+(\d+))?$/);
    if (m) {
      const nm = (m[1] || m[2] || '').trim();
      const b = billMatch(nm);
      if (b) return { type: 'bill-paid', bill: b.id, amount: m[3] ? Number(m[3]) : null };
    }

    // Claims received / reimbursements
    if (/^(?:claim|reimbursement)s?\s+(?:received|credited|settled|done)|^(?:got|received)\s+(?:my\s+)?(?:reimbursement|claim)|^office\s+(?:paid|reimbursed)/.test(t)) {
      const a = (t.match(/(\d+(?:\.\d+)?)/) || [])[1];
      return { type: 'claim-received', amount: a ? Number(a) : null };
    }

    // Lending: "lent kowshik 2000", "gave 2000 to kowshik return by 27th", "i gave 2000 to kowshik and he needs to return it by 27th"
    const nameAfter = (re) => { const x = t.match(re); return x ? x[1] : null; };
    const STOP_NAMES = new Set(['him', 'her', 'them', 'it', 'back', 'return', 'the', 'a', 'my', 'and', 'he', 'she', 'by', 'for']);
    const returnWords = /\b(return|returns|returned|back|by|before|till|until|owe|owes|repay|pay me back|due)\b/;
    m = t.match(/^(?:i\s+)?(lent|loaned|gave|given|give|sent|transferred)\b/);
    if (m) {
      const amount = amountIn(t);
      let who = nameAfter(/\b(?:to|lent|loaned|gave|given|give|sent|transferred)\s+([a-z]+)\b/);
      if (who && (STOP_NAMES.has(who) || /^\d/.test(who))) who = nameAfter(/\bto\s+([a-z]+)\b/);
      if (!who || STOP_NAMES.has(who)) who = nameAfter(/\b(?:\d+)\s+(?:to\s+)?([a-z]+)\b/);
      if (who && !STOP_NAMES.has(who)) {
        const isFamily = FAMILY_WORDS.includes(who);
        const loanish = m[1] === 'lent' || m[1] === 'loaned' || returnWords.test(t);
        if (isFamily && !loanish) return { type: 'family', amount, who: titleCase(who), note: (t.match(/\bfor\s+(.+)$/) || [])[1] || '' };
        if (loanish || !isFamily) {
          if (!loanish && (m[1] === 'sent' || m[1] === 'transferred' || m[1] === 'gave' || m[1] === 'give' || m[1] === 'given')) {
            return { type: 'gave-ambiguous', amount, who: matchPerson(who, people) || titleCase(who), known: !!matchPerson(who, people) };
          }
          return { type: 'lend', amount, who: matchPerson(who, people) || titleCase(who), known: !!matchPerson(who, people), due: parseDue(t, today) };
        }
      }
    }
    m = t.match(/^(?:i\s+)?(?:borrowed|took|got|taken)\s+(?:(\d+)\s+)?(?:rs\s+)?from\s+([a-z]+)/) || t.match(/^(?:i\s+)?borrowed\s+(?:from\s+)?([a-z]+)\s+(\d+)/);
    if (m) {
      const a = /^\d/.test(m[1] || '') ? Number(m[1]) : amountIn(t);
      const who = /^\d/.test(m[1] || '') || m[1] === undefined ? m[2] : m[1];
      return { type: 'borrow', amount: a, who: matchPerson(who, people) || titleCase(who), known: !!matchPerson(who, people), due: parseDue(t, today) };
    }
    // Repayments: "kowshik returned 2000", "kowshik paid me 500", "arjun paid", "i returned ram 2000", "paid ram 500"
    m = t.match(/^([a-z]+)\s+(?:returned|paid back|gave back|repaid|paid me|sent me|transferred me|paid|gave me|gave|sent|settled)(?:\s+(?:me|back|it))*(?:\s+(\d+(?:\.\d+)?))?(?:\s+back)?$/);
    if (m && !isMeWord(m[1]) && !billMatch(m[1])) return { type: 'repay-in', who: matchPerson(m[1], people) || titleCase(m[1]), known: !!matchPerson(m[1], people), amount: m[2] ? Number(m[2]) : null };
    m = t.match(/^(?:i\s+)?(?:returned|paid back|repaid|gave back|paid|sent|settled)\s+([a-z]+)(?:\s+(\d+(?:\.\d+)?))?(?:\s+back)?$/);
    if (m && !billMatch(m[1]) && (matchPerson(m[1], people))) return { type: 'repay-out', who: matchPerson(m[1], people), known: true, amount: m[2] ? Number(m[2]) : null };

    // Refund
    if (/\brefund(ed)?\b/.test(t)) {
      const a = amountIn(t);
      const words = t.replace(/\brefund(ed)?\b|\d+(?:\.\d+)?/g, ' ').split(' ').filter((w) => w && !FILLER.has(w));
      return { type: 'refund', amount: a, note: titleCase(words.join(' ')), cat: guessCategory(words, ctx.learned).cat };
    }

    // Never log a command as a spend
    if (COMMAND_START.test(t)) return { type: 'unclear', text: t, amount: amountIn(t) };

    // ---------------- Expense ----------------
    const ex = parseExpense(text, ctx, today);
    // Words that sound like a setting, not a purchase
    if (ex.keyWords.some((w) => SETTING_WORDS.has(w))) return { type: 'unclear', text: t, amount: ex.amount, expense: ex };
    if (ex.participants.length === 1 && !ex.claim && ex.keyWords.length && ex.keyWords.length <= 3) {
      const b = billMatch(ex.keyWords.join(' ')) || billMatch(ex.keyWords[0]);
      if (b) return { type: 'bill-paid', bill: b.id, amount: ex.amount, method: ex.method };
    }
    return ex;
  }

  function resolveCat(s, ctx) {
    const k = norm(s).replace(/\s+category$/, '');
    if (!k) return null;
    const custom = (ctx && ctx.customCats) || [];
    const ren = (ctx && ctx.renamed) || {};
    const c = custom.find((x) => norm(x) === k) || CATS.find((x) => norm(x.name) === k);
    if (c) { const n = typeof c === 'string' ? c : c.name; return ren[n] || n; }
    const al = CAT_ALIASES[k];
    return al ? ren[al] || al : null;
  }

  function parseExpense(text, ctx, today) {
    const people = ctx.people || [];
    let t = norm(text);
    const flags = {};
    if (/\bmy treat\b|\btreated\b|\bon me\b/.test(t)) { flags.treat = 'me'; t = t.replace(/\bmy treat\b|\btreated\b|\bon me\b/g, ' '); }
    if (/\b(?:just|only) me\b|\bjust mine\b/.test(t)) { flags.justMe = true; t = t.replace(/\b(?:just|only) me\b|\bjust mine\b/g, ' '); }
    if (/\b(claim|reimburse|reimbursable|office)\b/.test(t) && /\b(claim|reimburse|reimbursable)\b/.test(t)) { flags.claim = true; t = t.replace(/\b(claim|reimburse|reimbursable)\b/g, ' '); }
    if (/\byesterday\b/.test(t)) { const d = new Date(today); d.setDate(d.getDate() - 1); flags.date = isoDate(d); t = t.replace(/\byesterday\b/g, ' '); }
    const method = (t.match(/\b(cash|card|credit card|debit card|upi|gpay|phonepe|paytm)\b/) || [])[1];
    if (method) t = t.replace(/\b(credit card|debit card|cash|card|upi|gpay|phonepe|paytm)\b/g, ' ');
    if (/\bfor me\b/.test(t)) { flags.forMe = true; t = t.replace(/\bfor me\b/g, ' '); }

    // "<name> treat"
    const words = t.replace(/[,;:!?]/g, ' ').split(/\s+/).filter(Boolean);
    let payer = null;
    const named = []; // people mentioned (not me)
    let meMentioned = false;
    const customShares = {};
    const noteWords = [];
    let amounts = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const next = words[i + 1];
      if (/^\d+(\.\d+)?$/.test(w)) { amounts.push(Number(w)); continue; }
      if (isMeWord(w)) {
        if (next && /^\d+(\.\d+)?$/.test(next)) { customShares.__me = Number(next); i++; }
        meMentioned = true; continue;
      }
      const p = matchPerson(w, people);
      const sc = ctx.shortcuts && ctx.shortcuts[norm(w)];
      if (p) {
        if (next === 'paid' || (next === 'treat')) { payer = p; if (next === 'treat') flags.treat = p; i++; if (!named.includes(p)) named.push(p); continue; }
        if (next && /^\d+(\.\d+)?$/.test(next)) { customShares[p] = Number(next); i++; }
        if (!named.includes(p)) named.push(p);
        continue;
      }
      if (sc) { sc.forEach((n) => { if (!named.includes(n)) named.push(n); }); meMentioned = true; continue; }
      if (w === 'paid' && words[i + 1] === 'by' && matchPerson(words[i + 2], people)) { payer = matchPerson(words[i + 2], people); if (!named.includes(payer)) named.push(payer); i += 2; continue; }
      if (w === 'and' || w === '&' || w === 'with' || w === 'between') continue;
      noteWords.push(w);
    }
    const customKeys = Object.keys(customShares);
    let amount = customKeys.length ? round2(Object.values(customShares).reduce((a, b) => a + b, 0) + amounts.reduce((a, b) => a + b, 0)) : (amounts.length ? amounts[0] : null);
    const cleanNote = noteWords.filter((w) => !FILLER.has(w) && !/^(he|she|they|him|her|we|us)$/.test(w));
    const g = guessCategory(cleanNote, ctx.learned);
    let cat = flags.claim && g.cat === 'Other' ? 'Transport' : g.cat;
    if (ctx.renamed && ctx.renamed[cat]) cat = ctx.renamed[cat];
    const note = titleCase(cleanNote.join(' ')) || cat;
    const me = ctx.me;
    payer = payer || me;

    // Who shares this?
    let participants;
    if (flags.justMe) participants = [me];
    else if (named.length) {
      participants = named.slice();
      if (meMentioned || !same(payer, me) || flags.treat) { if (!participants.some((p) => same(p, me))) participants.push(me); }
    } else {
      const rule = ctx.autoSplit && ctx.autoSplit[cat];
      participants = rule && rule.length ? [me].concat(rule) : [me];
    }
    if (!participants.some((p) => same(p, payer))) participants.push(payer);

    let shares = {};
    let split = 'equal';
    if (amount != null) {
      if (flags.treat) {
        const giver = flags.treat === 'me' ? me : flags.treat;
        payer = giver;
        participants.forEach((p) => { shares[p] = same(p, giver) ? amount : 0; });
        split = 'treat';
      } else if (customKeys.length) {
        participants.forEach((p) => { shares[p] = 0; });
        for (const k of customKeys) shares[k === '__me' ? me : k] = customShares[k];
        const used = Object.values(shares).reduce((a, b) => a + b, 0);
        if (amounts.length && amount > used) { /* leftover goes to payer */ shares[payer] = round2((shares[payer] || 0) + (amount - used)); }
        split = 'custom';
      } else if (flags.forMe && !same(payer, me)) {
        participants.forEach((p) => { shares[p] = same(p, me) ? amount : 0; });
        split = 'for';
      } else if (participants.length > 1 && !meMentioned && same(payer, me) && named.length && !ctx.autoSplit?.[cat]) {
        // "arjun tea 40": I paid, Arjun owes all of it
        participants.forEach((p) => { shares[p] = same(p, me) ? 0 : round2(amount / named.length); });
        split = 'for';
      } else {
        shares = equalShares(amount, participants, payer, ctx.ratios);
        split = 'equal';
      }
    }
    return {
      type: 'expense', amount, note, cat, catGuessed: g.cat === 'Other' && !g.learned, learnedCat: !!g.learned,
      payer, participants, shares, split, method: method ? (/card/.test(method) ? 'card' : method === 'cash' ? 'cash' : 'upi') : null,
      claim: !!flags.claim, date: flags.date || null, keyWords: cleanNote,
    };
  }

  function equalShares(amount, participants, payer, ratios) {
    const shares = {};
    if (participants.length === 2 && ratios) {
      const other = participants.find((p) => !same(p, ratios.me));
      const r = other && ratios[norm(other)];
      if (r) {
        const mine = round2(amount * r.mine / (r.mine + r.theirs));
        shares[ratios.me] = mine; shares[other] = round2(amount - mine);
        return shares;
      }
    }
    const n = participants.length;
    const each = Math.floor((amount / n) * 100) / 100;
    participants.forEach((p) => { shares[p] = each; });
    const rem = round2(amount - each * n);
    shares[payer] = round2(shares[payer] + rem);
    return shares;
  }

  // ---------------- Records & money maths ----------------
  function shareOf(r, name) {
    if (!r || !r.shares) return 0;
    for (const k of Object.keys(r.shares)) if (same(k, name)) return Number(r.shares[k]) || 0;
    return 0;
  }
  function participants(r) {
    if (r.kind === 'settlement') return [r.from, r.to];
    if (r.kind === 'loan') return [r.lender, r.borrower];
    if (r.kind === 'expense') { const p = Object.keys(r.shares || {}); if (r.paidBy && !p.some((x) => same(x, r.paidBy))) p.push(r.paidBy); return p; }
    return [r.owner || r.paidBy].filter(Boolean);
  }
  const involves = (r, name) => participants(r).some((p) => same(p, name));
  const isShared = (r) => participants(r).length > 1;

  // Expense counted as my spending (my share). Pending claims don't count; refunds are negative.
  function mySpendOf(r, me) {
    if (r.deleted || r.kind !== 'expense') return 0;
    if (r.claim && r.claimStatus !== 'written-off') return 0;
    return shareOf(r, me);
  }
  function mySpend(records, me, filter) {
    let total = 0; const byCat = {};
    for (const r of records) {
      if (filter && !filter(r)) continue;
      const s = mySpendOf(r, me); if (!s) continue;
      total += s; byCat[r.category || 'Other'] = (byCat[r.category || 'Other'] || 0) + s;
    }
    Object.keys(byCat).forEach((k) => { byCat[k] = round2(byCat[k]); });
    return { total: round2(total), byCat };
  }

  // Positive = person owes me
  function balanceWith(records, me, person) {
    let bal = 0;
    for (const r of records) {
      if (r.deleted) continue;
      if (r.kind === 'settlement') {
        if (same(r.from, person) && same(r.to, me)) bal -= r.amount; else if (same(r.from, me) && same(r.to, person)) bal += r.amount;
      } else if (r.kind === 'expense' && isShared(r) && involves(r, me) && involves(r, person)) {
        if (same(r.paidBy, me)) bal += shareOf(r, person); else if (same(r.paidBy, person)) bal -= shareOf(r, me);
      }
    }
    return round2(bal);
  }
  // Loans are tracked separately from split balances
  function loanOutstanding(r) {
    const paid = (r.repayments || []).reduce((a, x) => a + (Number(x.amount) || 0), 0);
    return round2(Math.max(0, r.amount - paid));
  }
  function loansWith(records, me, person) {
    let lentOut = 0, borrowed = 0;
    for (const r of records) {
      if (r.deleted || r.kind !== 'loan') continue;
      if (same(r.lender, me) && (!person || same(r.borrower, person))) lentOut += loanOutstanding(r);
      if (same(r.borrower, me) && (!person || same(r.lender, person))) borrowed += loanOutstanding(r);
    }
    return { lentOut: round2(lentOut), borrowed: round2(borrowed) };
  }

  function togetherStats(records, me, person, filter) {
    const s = { together: 0, iPaid: 0, theyPaid: 0, myShare: 0, theirShare: 0, myTreats: 0, theirTreats: 0, byCat: {} };
    for (const r of records) {
      if (r.deleted || r.kind !== 'expense' || !isShared(r) || !involves(r, me) || !involves(r, person)) continue;
      if (filter && !filter(r)) continue;
      if (r.split === 'treat') { if (same(r.paidBy, me)) s.myTreats += r.amount; else s.theirTreats += r.amount; continue; }
      s.together += r.amount;
      if (same(r.paidBy, me)) s.iPaid += r.amount; else if (same(r.paidBy, person)) s.theyPaid += r.amount;
      s.myShare += shareOf(r, me); s.theirShare += shareOf(r, person);
      s.byCat[r.category] = (s.byCat[r.category] || 0) + r.amount;
    }
    Object.keys(s).forEach((k) => { if (typeof s[k] === 'number') s[k] = round2(s[k]); });
    return s;
  }

  // Bills
  function billAmountFor(bill, mk) {
    let amt = bill.amount;
    (bill.history || []).slice().sort((a, b) => a.from.localeCompare(b.from)).forEach((h) => { if (h.from <= mk) amt = h.amount; });
    return amt;
  }
  function billDueDate(bill, today) {
    const day = Math.min(bill.day || 1, daysInMonth(today));
    return new Date(today.getFullYear(), today.getMonth(), day);
  }
  function billIsActiveIn(bill, mk) {
    if (bill.stopped && bill.stopped <= mk) return false;
    const start = bill.start || mk;
    if (start > mk) return false;
    if (!bill.freq || bill.freq === 'monthly') return true;
    const [sy, sm] = start.split('-').map(Number); const [y, m] = mk.split('-').map(Number);
    const diff = (y - sy) * 12 + (m - sm);
    if (diff < 0) return false;
    return bill.freq === 'quarterly' ? diff % 3 === 0 : diff % 12 === 0;
  }
  // Bills of this month with status
  function billsThisMonth(bills, today) {
    const mk = monthKey(today);
    return (bills || []).filter((b) => billIsActiveIn(b, mk)).map((b) => {
      const due = billDueDate(b, today);
      const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const days = Math.round((due - t0) / 86400000);
      const paid = (b.paidMonths || []).includes(mk);
      return { ...b, amountNow: billAmountFor(b, mk), dueISO: isoDate(due), days, paid };
    }).sort((a, b) => a.days - b.days);
  }

  // Safe to spend today
  function safeToSpend(data, records, today) {
    const me = data.me;
    const mk = monthKey(today);
    const todayISO = isoDate(today);
    const dim = daysInMonth(today);
    const daysLeft = dim - today.getDate() + 1;
    const bills = billsThisMonth(data.bills, today);
    const billsTotal = bills.reduce((a, b) => a + b.amountNow, 0);
    const everyday = (r) => !r.bill && !FIXED.has(r.category);
    const rule = data.safeRule;
    // The user's own rule: "safe spend 150 a day" / "4000 a month" / "1000 a week"
    if (rule && rule.amount > 0) {
      const spentToday = mySpend(records, me, (r) => r.date === todayISO && everyday(r)).total;
      let from, left;
      if (rule.period === 'day') {
        const safe = rule.amount - spentToday;
        return { safe: Math.max(0, Math.floor(safe)), over: safe < 0, perDay: rule.amount, pool: rule.amount, base: rule.amount, billsTotal, spentBefore: 0, spentToday, daysLeft: 1, rule, monthUsedPct: Math.min(1, spentToday / rule.amount) };
      }
      if (rule.period === 'week') { from = weekStart(today); left = 7 - ((today.getDay() + 6) % 7); }
      else { from = new Date(today.getFullYear(), today.getMonth(), 1); left = daysLeft; }
      const fromISO = isoDate(from);
      const spentBefore = mySpend(records, me, (r) => r.date >= fromISO && r.date < todayISO && everyday(r)).total;
      const pool = rule.amount - spentBefore;
      const perDay = pool / left;
      const safe = perDay - spentToday;
      return { safe: Math.max(0, Math.floor(safe)), over: safe < 0, perDay: Math.floor(perDay), pool: Math.floor(pool), base: rule.amount, billsTotal, spentBefore, spentToday, daysLeft: left, rule, monthUsedPct: Math.min(1, (spentBefore + spentToday) / rule.amount) };
    }
    const income = Number(data.income && data.income.amount) || 0;
    const savePlan = data.safeMode === 'no-savings' ? 0 : savingsPlanMonthly(data, today);
    let base = income ? income - billsTotal - savePlan : Number(data.budget) || 0;
    if (!base) return null;
    const inMonth = (r) => (r.date || '').startsWith(mk) && !r.bill;
    const spentBefore = mySpend(records, me, (r) => inMonth(r) && r.date < todayISO).total;
    const spentToday = mySpend(records, me, (r) => inMonth(r) && r.date === todayISO).total;
    const lent = loansWith(records, me).lentOut;
    const pool = base - spentBefore - lent;
    let perDay = pool / daysLeft;
    let safe = perDay - spentToday;
    if (data.safeCap) safe = Math.min(safe, data.safeCap - spentToday);
    return { safe: Math.max(0, Math.floor(safe)), over: safe < 0, perDay: Math.floor(perDay), pool: Math.floor(pool), base, billsTotal, spentBefore, spentToday, daysLeft, monthUsedPct: Math.min(1, (spentBefore + spentToday) / Math.max(1, base)) };
  }

  // Savings
  function essentialsMonthly(records, me, today, bills) {
    // average of last 3 months of need categories + bills
    let total = 0, months = 0;
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1); const mk = monthKey(d);
      const s = mySpend(records, me, (r) => (r.date || '').startsWith(mk) && catOf(r.category).type === 'need').total;
      if (s > 0) { total += s; months++; }
    }
    const billSum = (bills || []).reduce((a, b) => a + (b.amount || 0), 0);
    const avg = months ? total / months : 0;
    return Math.round(Math.max(avg, billSum));
  }
  function savingsPlanMonthly(data, today) {
    let total = 0;
    (data.goals || []).forEach((g) => { total += goalMonthly(g, today); });
    (data.sinking || []).forEach((g) => { total += goalMonthly({ target: g.target, saved: g.saved, by: g.due }, today); });
    (data.investments || []).forEach((i) => { total += Number(i.amount) || 0; });
    return Math.round(total);
  }
  function goalMonthly(g, today) {
    const left = Math.max(0, (g.target || 0) - (g.saved || 0));
    if (!left) return 0;
    if (!g.by) return 0;
    const [y, m] = g.by.split('-').map(Number);
    const months = Math.max(1, (y - today.getFullYear()) * 12 + (m - 1 - today.getMonth()));
    return Math.ceil(left / months);
  }

  // Week / month series
  function daySeries(records, me, start, n, fixedToo) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i); const k = isoDate(d);
      out.push({ key: k, date: d, total: mySpend(records, me, (r) => r.date === k && (fixedToo || !FIXED.has(r.category))).total });
    }
    return out;
  }
  function weekStart(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

  // Repeat spends: notes that appear 3+ times in a period
  function repeatSpends(records, me, filter) {
    const map = {};
    for (const r of records) {
      if (filter && !filter(r)) continue;
      const s = mySpendOf(r, me); if (!s) continue;
      const k = norm(r.note || r.category).split(' ')[0]; if (!k) continue;
      map[k] = map[k] || { name: titleCase(k), count: 0, total: 0, cat: r.category };
      map[k].count++; map[k].total += s;
    }
    return Object.values(map).filter((x) => x.count >= 3).sort((a, b) => b.total - a.total).map((x) => ({ ...x, total: round2(x.total) }));
  }

  // ---------------- Bank SMS ----------------
  function parseBankSms(body) {
    const b = String(body || '');
    const low = b.toLowerCase();
    if (/\botp\b|one time password|verification code/.test(low)) return null;
    if (/(will be|to be) debited|is due|amount due|requested|request of|mandate|autopay set|failed|declined|reversed/.test(low)) return null;
    if (!/(debited|debit|spent|sent|paid|withdrawn|txn|transferred|purchase)/.test(low)) return null;
    if (/credited/.test(low) && !/debited|spent|sent|paid|purchase/.test(low)) return null;
    const am = b.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) || b.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rs|inr)\b/i);
    if (!am) return null;
    const amount = Number(am[1].replace(/,/g, ''));
    if (!amount) return null;
    let payee = '';
    let mm = b.match(/(?:to|at)\s+VPA\s+([\w.\-]+@[\w.\-]+)/i) || b.match(/\b([\w.\-]+@(?:ok\w+|ybl|ibl|axl|paytm|upi|apl|icici|hdfcbank|sbi|axisbank|kotak|yesbank|fbl|ptyes|ptsbi|ptaxis|pthdfc|jupiteraxis|slc|waaxis|abfspay|freecharge|airtel|naviaxis|superyes|timecosmos))\b/i);
    if (mm) payee = mm[1].replace(/\.+$/, '');
    if (!payee) { mm = b.match(/(?:\bto|\bat|towards|trf to|paid to|sent to|info:?\s*(?:upi\/[^/]*\/[^/]*\/)?)\s+([A-Za-z][A-Za-z0-9 .&'\-]{1,28}?)(?=\s+(?:on|ref|upi|via|from|avl|a\/c|bal|thru|using|for)\b|[.\n,]|$)/i); if (mm) payee = mm[1].trim(); }
    if (!payee) { mm = b.match(/UPI\/(?:P2[AM]\/)?\d*\/?([A-Za-z][A-Za-z0-9 .&\-]{1,28})/i); if (mm) payee = mm[1].trim(); }
    const method = /card|pos\b|purchase/i.test(b) && !/upi/i.test(b) ? 'card' : /upi|vpa/i.test(b) ? 'upi' : 'bank';
    let name = payee;
    if (/@/.test(name)) name = name.split('@')[0].replace(/[._\-]?\d{4,}$/, '').replace(/[._\-]+/g, ' ');
    name = titleCase(name.toLowerCase()).trim();
    if (!name && /^\d{6,}@/.test(payee)) name = 'UPI ' + payee.split('@')[0].slice(-4).padStart(8, '•');
    const isPerson = /@/.test(payee) && /^\d{10}/.test(payee) || (/^[A-Z][a-z]+(?: [A-Z][a-z]+){1,2}$/.test(name) && !guessCategory(name.toLowerCase().split(' ')).cat.match(/Food|Groceries|Shopping|Transport|Entertainment|Subscriptions|Medical|Bills|Internet/));
    return { amount, payee: payee || '', name: name || 'a payment', method, isPerson };
  }

  // Smart guess for a captured payment
  function guessPayment(p, ctx) {
    const today = ctx.today || new Date();
    const learnedKey = norm(p.name);
    if (ctx.payees && ctx.payees[learnedKey]) return { ...ctx.payees[learnedKey], reason: 'learned' };
    const bills = billsThisMonth(ctx.bills || [], today).filter((b) => !b.paid);
    const bill = bills.find((b) => Math.abs(b.amountNow - p.amount) <= Math.max(50, b.amountNow * 0.05));
    if (bill) return { bill: bill.id, note: bill.name, cat: bill.category || 'Rent', reason: 'bill', question: 'Is this your ' + bill.name + '?' };
    const words = norm(p.name).split(/\s+/);
    const g = guessCategory(words, ctx.learned);
    if (g.cat !== 'Other') return { note: p.name, cat: g.cat, reason: 'keyword' };
    if (p.amount <= 30) return { note: 'Tea', cat: 'Food & Drink', reason: 'small', question: 'Tea or a snack?' };
    if (p.amount <= 80) return { note: 'Snack', cat: 'Food & Drink', reason: 'small' };
    if (p.isPerson) return { note: 'Paid ' + p.name, cat: 'Other', reason: 'person', person: p.name, question: 'You paid ' + p.name + '. What was it?' };
    return { note: p.name, cat: 'Other', reason: 'unknown' };
  }

  function formatINR(n, opts) {
    const v = Math.abs(Number(n) || 0);
    const hasPaise = Math.round(v * 100) % 100 !== 0;
    const s = v.toLocaleString('en-IN', { minimumFractionDigits: hasPaise ? 2 : 0, maximumFractionDigits: 2 });
    return (opts && opts.sign && n < 0 ? '−' : opts && opts.plus && n > 0 ? '+' : '') + '₹' + s;
  }
  function shortINR(n) {
    const v = Math.abs(Number(n) || 0);
    if (v >= 100000) return '₹' + (v / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    if (v >= 1000) return '₹' + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return '₹' + Math.round(v);
  }

  const api = {
    CATS, FIXED, FAMILY_WORDS, RECURRING_WORDS, KEYWORDS, MONTHS,
    norm, same, round2, isoDate, monthKey, parseISO, daysInMonth, catOf, titleCase, cleanText,
    parse, parseExpense, resolveCat, guessCategory, matchPerson, parseDue, equalShares,
    shareOf, participants, involves, isShared, mySpendOf, mySpend, balanceWith, loanOutstanding, loansWith, togetherStats,
    billAmountFor, billsThisMonth, safeToSpend, essentialsMonthly, savingsPlanMonthly, goalMonthly, daySeries, weekStart, repeatSpends,
    parseBankSms, guessPayment, formatINR, shortINR,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Logic = api;
})(typeof window !== 'undefined' ? window : globalThis);
