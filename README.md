# Paisa

An Android app for tracking your own spending and splitting costs with the people you live or hang out with.

- **Home:** a grid of tiles showing your budget ring, who owes whom, your next bill, your top categories, this week's spending and recent expenses.
- **Shared:** a chat-style feed for each person you split with. Your payments appear on the right and theirs on the left. Type `450 groceries` to add a half split instantly, and tap **Settle** to clear the balance (it can open your UPI app).
- **Add:** pick a category, enter the amount, then choose who paid and how to split it (half, custom, or all on one person).
- **Sync:** shared expenses sync through a Google Sheet that everyone uses. Personal expenses stay on your phone.

## Install the app

1. Open the **Releases** page of this repo on your Android phone (or the **Actions** tab, then the latest run, then **Paisa-APK**).
2. Download the `.apk` file and open it.
3. If Android asks, allow your browser or file manager to **install unknown apps**.
4. When a newer version comes out, install it over the old one. Your data stays.

Every push to `main` builds a new APK automatically.

## Set up Google Sheets sync (do this once)

1. Create a new Google Sheet, for example "Paisa shared".
2. In the sheet, go to **Extensions > Apps Script**.
3. Delete what's there and paste in everything from [`apps-script/Code.gs`](apps-script/Code.gs).
4. On line 7, change `change-this-secret` to a password of your own.
5. Click **Deploy > New deployment**. Under the gear icon choose **Web app**, then set:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** and approve the permissions. Google warns that the app isn't verified; click **Advanced > Go to project**. This is your own script.
7. Copy the **Web app URL**, which ends in `/exec`.
8. In Paisa on each phone, go to **Settings > Sync with Google Sheets** and paste the URL and your password.

Everyone who shares expenses uses the **same** URL and password. Each person sets their own name in the app, and names must be spelled the same on every phone. (Upper or lower case doesn't matter.)

If you edit the script later, use **Deploy > Manage deployments > Edit > New version** so that the URL stays the same.

## Notes

- `signing/debug.keystore` keeps the app's signature the same on every build, so updates install over the old version. Keep this repo private.
- To back up personal expenses, use **Settings > Backup > Copy backup**.
