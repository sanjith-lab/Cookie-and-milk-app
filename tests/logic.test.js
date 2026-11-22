const L=require('../www/logic.js');const a=require('assert');
const me='Sanjith';
const recs=[
 {id:1,kind:'expense',date:'2026-11-22',amount:2000,category:'Food',paidBy:'Sanjith',with:'Arjun',shares:L.makeShares({amount:2000,paidBy:'Sanjith',withName:'Arjun',split:'half',me})},
 {id:2,kind:'expense',date:'2026-11-21',amount:1800,category:'Food',paidBy:'arjun',with:'sanjith',shares:{arjun:900,sanjith:900}},
 {id:3,kind:'expense',date:'2026-11-20',amount:340,category:'Travel',paidBy:'Sanjith',with:null,shares:{Sanjith:340}},
 {id:4,kind:'settlement',date:'2026-11-20',amount:50,from:'Arjun',to:'Sanjith'},
 {id:5,kind:'expense',date:'2026-11-19',amount:999,category:'Fun',paidBy:'Sanjith',with:'Arjun',shares:L.makeShares({amount:999,paidBy:'Sanjith',withName:'Arjun',split:'custom',myShare:300,me})},
 {id:6,kind:'expense',date:'2026-11-19',amount:500,category:'Fun',paidBy:'Arjun',with:'Sanjith',shares:L.makeShares({amount:500,paidBy:'Arjun',withName:'Sanjith',split:'all',me:'Arjun'})},
];
// bal: +1000 -900 -50 +699 -500 = 249
a.strictEqual(L.balanceWith(recs,me,'Arjun'),249);
a.strictEqual(L.balanceWith(recs,'Arjun','Sanjith'),-249);
const s=L.mySpend(recs,me);console.log(s); // 1000+900+340+300+500=3040
a.strictEqual(s.total,3040);
a.deepStrictEqual(L.parseQuick('450 groceries'),{amount:450,note:'groceries'});
a.deepStrictEqual(L.parseQuick('groceries 450'),{amount:450,note:'groceries'});
a.strictEqual(L.parseQuick('hello'),null);
a.strictEqual(L.nextBill([{name:'Rent',amount:1,day:1},{name:'Wifi',amount:1,day:25}],new Date(2026,10,22)).name,'Wifi');
console.log('logic tests passed');
