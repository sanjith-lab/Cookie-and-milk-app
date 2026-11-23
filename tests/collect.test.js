const L=require('../www/logic.js'); global.Logic=L;
const E=require('../www/engine.js');
const assert=require('assert');
let now=new Date(2026,10,23,21,0); E.setClock(()=>new Date(now));
const strip=s=>String(s||'').replace(/<[^>]+>/g,'');
function fresh(){ const D=E.blank(); E.startSetup(D); ['Sanjith','85000','skip','subanu jithin aravind'].forEach(t=>E.handle(D,t)); const m=[...D.chat].reverse().find(m=>m.card&&m.card.options&&m.card.options.some(o=>o.label==='Not now')); if(m)E.runAction(D,m.id,m.card.options.findIndex(o=>o.label==='Not now')); return D; }
const last=(D)=>D.chat[D.chat.length-1];
const show=(c)=>console.log('  '+strip(c.title)+' | '+c.big+' '+(c.sub||'')+'\n  '+(c.rows||[]).map(r=>r.label+' = '+r.value).join('\n  ')+'\n  '+strip((c.note||'').replace(/<br>/g,'\n  '))+'\n  ['+(c.options||[]).map(o=>o.label).join(' | ')+']');
// Real case: dinner 2000 split 4, people paid what they had
let D=fresh();
E.handle(D,'dinner 2000 with subanu jithin aravind');
E.handle(D,'subanu gave 300, jithin 500, aravind 700');
let c=last(D).card; console.log('\nCase 1'); show(c);
assert.equal(E.netWith(D,'Subanu'),200); assert.equal(E.netWith(D,'Jithin'),0); assert.equal(E.netWith(D,'Aravind'),-200);
assert(/Subanu pays Aravind/.test(strip(c.note)));
E.runAction(D,last(D).id,0); // Done: Subanu paid Aravind
['Subanu','Jithin','Aravind'].forEach(n=>assert.equal(E.netWith(D,n),0));
// Case 2: total short
D=fresh(); E.handle(D,'dinner 2000 with subanu jithin aravind'); E.handle(D,'got 300 from subanu, 400 from jithin and 700 from aravind');
c=last(D).card; console.log('\nCase 2'); show(c);
assert(/Jithin pays you/.test(strip(c.note)));
// Case 3: everyone paid
D=fresh(); E.handle(D,'dinner 2000 with subanu jithin aravind'); E.handle(D,'everyone paid');
['Subanu','Jithin','Aravind'].forEach(n=>assert.equal(E.netWith(D,n),0)); console.log('\nCase 3'); show(last(D).card);
// Case 4: one overpaid, nobody short
D=fresh(); E.handle(D,'dinner 2000 with subanu jithin aravind'); E.handle(D,'subanu 500 jithin 500 aravind 600 paid me');
c=last(D).card; console.log('\nCase 4'); show(c); assert(/Returned Aravind/.test(c.options[0].label));
console.log('\ncollect tests passed');
