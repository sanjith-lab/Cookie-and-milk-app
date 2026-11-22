const L = require('../www/logic.js');
const a = require('assert');
const ctx = { me: 'Sanjith', people: [{ name: 'Arjun' }, { name: 'Ram' }, { name: 'Riya' }], shortcuts: { flat: ['Arjun', 'Ram'] }, bills: [{ id: 'b1', name: 'Rent', amount: 18000, day: 5 }, { id: 'b2', name: 'Phone EMI', amount: 3200, day: 10 }], learned: {}, autoSplit: {}, today: new Date(2026, 10, 23) };
const P = (s) => L.parse(s, ctx);
a.deepStrictEqual(P('tea 40').shares, { Sanjith: 40 });
a.deepStrictEqual(P('arjun tea 40').shares, { Arjun: 40, Sanjith: 0 });
a.deepStrictEqual(P('arjun me tea 40').shares, { Arjun: 20, Sanjith: 20 });
a.deepStrictEqual(P('ram arjun me pizza 900').shares, { Ram: 300, Arjun: 300, Sanjith: 300 });
a.deepStrictEqual(P('ram and me pizza 600').shares, { Ram: 300, Sanjith: 300 });
a.strictEqual(P('arjun paid dinner 900 me').payer, 'Arjun');
a.deepStrictEqual(P('ram 200 me 100 auto').shares, { Ram: 200, Sanjith: 100 });
a.deepStrictEqual(P('flat groceries 1200').shares, { Arjun: 400, Ram: 400, Sanjith: 400 });
a.strictEqual(P('tshirt 500').cat, 'Shopping');
a.strictEqual(P('t-shirt 500').cat, 'Shopping');
a.strictEqual(P('paid for doctor 2000').cat, 'Medical');
a.strictEqual(P('gym 2500').cat, 'Fitness');
a.strictEqual(P('emi paid').type, 'bill-paid');
a.strictEqual(P('rent is 19500 from jan').from, '2027-01');
a.strictEqual(P('rent up 5%').amount, 18900);
a.strictEqual(P('i gave 2000 to kowshik and he needs to return it by 27th').due, '2026-11-27');
a.strictEqual(P('kowshik gave 500').type, 'repay-in');
a.strictEqual(P('sent amma 5000').type, 'family');
a.strictEqual(P('office cab 400 claim').claim, true);
a.strictEqual(P('amazon refund 500').type, 'refund');
a.strictEqual(P('start goa trip budget 15000').budget, 15000);
a.strictEqual(P('dinner 2400 my treat').split, 'treat');
a.strictEqual(P('who owes me?').type, 'question');
a.strictEqual(P('how can i save on food?').type, 'advice');
a.strictEqual(P('2k groceries').amount, 2000);
a.strictEqual(P('chai 20 arjun ge').shares.Arjun, 20);
// Money maths
const recs = [
  { id: 1, kind: 'expense', date: '2026-11-22', amount: 2000, category: 'Food & Drink', paidBy: 'Sanjith', shares: { Sanjith: 1000, Arjun: 1000 } },
  { id: 2, kind: 'expense', date: '2026-11-21', amount: 1800, category: 'Groceries', paidBy: 'arjun', shares: { arjun: 900, sanjith: 900 } },
  { id: 3, kind: 'settlement', date: '2026-11-20', amount: 50, from: 'Arjun', to: 'Sanjith' },
  { id: 4, kind: 'loan', amount: 2000, lender: 'Sanjith', borrower: 'Kowshik', repayments: [{ amount: 500 }] },
  { id: 5, kind: 'expense', date: '2026-11-22', amount: 400, category: 'Transport', paidBy: 'Sanjith', shares: { Sanjith: 400 }, claim: true, claimStatus: 'pending' },
];
a.strictEqual(L.balanceWith(recs, 'Sanjith', 'Arjun'), 50);
a.strictEqual(L.mySpend(recs, 'Sanjith').total, 1900);
a.deepStrictEqual(L.loansWith(recs, 'Sanjith'), { lentOut: 1500, borrowed: 0 });
// Bank SMS
a.strictEqual(L.parseBankSms('Sent Rs.150.00 from Kotak Bank AC X1234 to zomato@hdfcbank on 23-11-26.UPI Ref 1').amount, 150);
a.strictEqual(L.parseBankSms('Your OTP for transaction of Rs 500 is 123456'), null);
a.strictEqual(L.parseBankSms('Rs.5000 credited to your A/c XX1234 by UPI from Arjun'), null);
console.log('logic tests passed');
