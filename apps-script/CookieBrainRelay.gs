/**
 * Cookie & Milk: smart mode relay.
 * Use this if your phone's network can't reach Google's AI server (error: "Unable to resolve host").
 * Your phone talks to this script on script.google.com, and Google's own servers call Gemini for you.
 *
 * Setup (about 5 minutes, easiest on a laptop):
 * 1. Open https://script.google.com and click "New project".
 * 2. Delete everything in the editor and paste this whole file. Click Save.
 * 3. Click Deploy › New deployment › gear icon › Web app.
 *    Execute as: Me.  Who has access: Anyone.  Click Deploy, then Authorize access and allow it.
 * 4. Copy the "Web app URL" (ends with /exec) and paste it in Cookie: Settings › Smart mode › Relay URL.
 *
 * It only forwards requests to Google's Gemini API, and only with the Gemini key your app sends.
 * Nothing is stored here.
 */
function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out_({ status: 400, body: '{"error":{"message":"bad request"}}' }); }
  if (!b || !b.apiKey || !b.path || !/^models(\/|\?|$)/.test(b.path)) return out_({ status: 400, body: '{"error":{"message":"bad request"}}' });
  var opt = { method: b.body ? 'post' : 'get', muteHttpExceptions: true, headers: { 'x-goog-api-key': b.apiKey } };
  if (b.body) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(b.body); }
  var r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/' + b.path, opt);
  return out_({ status: r.getResponseCode(), body: r.getContentText() });
}
function doGet() { return out_({ ok: true, app: 'cookie-brain-relay' }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
