const L=require('../www/logic.js'); global.Logic=L;
const E=require('../www/engine.js');
let now=new Date(2026,10,23,9,0); E.setClock(()=>new Date(now));
const D=E.blank(); E.startSetup(D);
const strip=s=>String(s||'').replace(/<[^>]+>/g,'');
let shown=0; const out=()=>{for(;shown<D.chat.length;shown++){const m=D.chat[shown]; if(m.from==='me'){console.log('\n> '+m.text);continue;} const c=m.card; let t=strip(m.text); if(c){ if(c.type==='confirm')t+=' ['+strip(c.text)+']'; if(c.title)t+=' {'+c.title+(c.big?' '+c.big:'')+(c.sub?' · '+c.sub:'')+'} '+(c.rows||[]).map(r=>r.label+'='+r.value).join('; ')+(c.note?' | '+strip(c.note):''); if(c.options)t+=' ('+c.options.map(o=>o.label).join(' | ')+')'; if(c.prompt)t+='\n   PROMPT: '+c.prompt.split('\n').slice(0,3).join(' / ');} console.log('  🍪 '+t);}};
const QUIET=true;const say=t=>{const r=E.handle(D,t);if(!QUIET)out();return r;};
const tap=(label)=>{const m=[...D.chat].reverse().find(m=>m.card&&m.card.options&&m.card.options.some(o=>o.label.startsWith(label))); if(!m){console.log('  !! no button '+label);return;} const i=m.card.options.findIndex(o=>o.label.startsWith(label)); const r=E.runAction(D,m.id,i);};

say('Sanjith'); say('85000'); say('rent 18000 every 5th'); say('arjun riya'); tap('Not now');
E.proactive(D);
['tea 40','arjun tea 40','arjun me pizza 900','riya paid groceries 1200','tshirt 500','payed to gym'].forEach(say); say('2500'); tap('Yes, monthly');
['dinner 2400 my treat','i gave 2000 to kowshik and he needs to return it by 27th'].forEach(say); tap('Add Kowshik');
['budget food 8000'].forEach(say);
['swiggy 4500','who owes me?','top spends this month?','how much on food this month?','how can i save on food?','salary 85000'].forEach(say); tap('Move it all');
['goal iphone 80000 by june','save 5000 emergency','rent paid','rent is 19500 from jan'].forEach(say);
['office cab 400 claim','amazon refund 300','start goa trip budget 15000','arjun me hotel 6000','end trip','kowshik gave 500','settle arjun'].forEach(say); tap('Mark');
['zudio is shopping','zudio 999','what if i stop ordering swiggy','undo','how much did we spend together with riya?','sent amma 5000','can i spend 2000 today?','foo bar'].forEach(say);
// SMS capture
E.addCaptures(D,[{id:'s1',body:'Sent Rs.150.00 from Kotak Bank AC X1234 to zomato@hdfcbank on 23-11-26.UPI Ref 1',ts:now.getTime()},{id:'s2',body:'Rs 20.00 debited from A/c XX4521 to VPA 98765432@ybl',ts:now.getTime()}]); tap('Add · Zomato');
now=new Date(2026,10,27,10,0); E.proactive(D);

const assert=require('assert');
assert.strictEqual(L.balanceWith(E.live(D),'Sanjith','Arjun'),0);
assert.deepStrictEqual(L.loansWith(E.live(D),'Sanjith'),{lentOut:1500,borrowed:0});
assert.ok(D.bills.some(b=>b.name==='Gym'));
assert.ok(D.chat.length>50);
console.log('engine tests passed');
