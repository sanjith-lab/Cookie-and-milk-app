# Cookie & Milk 🍪

Cookie & Milk is an Android money app where you just chat. You tell Cookie what you spent, and it tracks your spending, splits costs with friends, plans your bills and grows your savings.

## What's inside (v2)
- **Chat with Cookie:** type messages like these:
  - `tea 40`
  - `arjun me pizza 900`
  - `riya paid groceries 1200`
  - `ram 200 me 100 auto`
  - `dinner 2400 my treat`
- **Commands in the chat:**
  - Bills: `rent paid`, `rent 18000 every 5th`, `rent is 19500 from jan`
  - Income, savings and budgets: `salary 85000`, `save 5000 emergency`, `goal iphone 80000 by june`, `budget food 8000`
  - Lending and claims: `lent kowshik 2000 by 27th`, `kowshik gave 500`, `office cab 400 claim`, `amazon refund 500`
  - Trips: `start goa trip budget 15000`, then `end trip`
  - Teaching and fixing: `zudio is shopping`, `undo`
- **Ask questions:** `who owes me?`, `top spends this month?`, `how much on swiggy?`, `can i spend 2000 today?` and `what if i stop swiggy`. For advice questions, Cookie packs your numbers into a prompt you can share to any AI app.
- **Payment detection:** when your bank texts about a UPI or card payment, Cookie sends you a notification. It makes smart guesses, for example: a ₹15,000 payment is probably your rent, ₹20 is probably tea, and Zomato goes to Food & Drink. It also learns from your answers.
- **Overview:** safe to spend today, due soon (bills, friends, loans, claims), trip card, "You & partner" stats, budgets, savings pots, weekly chart and recent history.
- **Insights:** day, week and month charts, category ring (rent and bills shown separately), spending calendar, needs vs wants, repeat spends, and income vs spending.
- **Savings:** emergency fund (target worked out from your essentials), goals with monthly amounts, sinking funds, investments, savings rate and payday split.
- **Reminders:** morning hello, nightly nudge, bill due tomorrow, loan due today, and month-end close.

## Install
1. On your Android phone, open the **Releases** page of this repo and download the latest `.apk`.
2. Open it and allow **Install unknown apps** if Android asks.
3. Updates install over the old version and keep your data.

**Payment detection** needs SMS permission. If Android says the setting is *restricted*:
1. Open **Settings › Apps › Cookie & Milk**.
2. Tap **⋮** (top right) and choose **Allow restricted settings**.
3. Turn payment detection on again from Cookie's settings (tap the cookie at the top of the app).

## Shared sync with Google Sheets (optional)
1. Create a Google Sheet, then open **Extensions › Apps Script**.
2. Paste in everything from [`apps-script/Code.gs`](apps-script/Code.gs) and change `SECRET` to a password of your own.
3. Choose **Deploy › New deployment › Web app**, with Execute as **Me** and Who has access set to **Anyone**.
4. In the app, tap the cookie, go to **Shared sync**, and paste the URL and password. Everyone sharing expenses uses the same ones.

Only shared expenses, settlements and loans sync. Personal expenses stay on your phone.

## Notes
- `signing/debug.keystore` keeps the app signature the same across builds, so updates install cleanly.
- `native/sms-capture` is the small Android plugin that reads bank SMS (debit messages only) on the phone.
- `npm test` runs the logic and chat-engine tests. The cloud build runs them too.
