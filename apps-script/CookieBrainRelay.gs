/**
 * Cookie & Milk: smart mode relay.
 * Only needed if your phone's network can't reach the OpenAI API.
 * Setup: script.google.com › New project › paste this file › Save ›
 * Deploy › New deployment › Web app (Execute as: Me, Who has access: Anyone) › Deploy › Authorize.
 * Paste the Web app URL (ends with /exec) in Cookie: Settings › Smart mode › Relay URL.
 * It only forwards requests to the OpenAI API, with the key the app sends. Nothing is stored here.
 */
function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out_({ status: 400, body: '{"error":{"message":"bad request"}}' }); }
  if (!b || b.provider !== 'openai' || !b.apiKey || !/^(chat\/completions|models)$/.test(b.path || '')) return out_({ status: 400, body: '{"error":{"message":"bad request"}}' });
  var opt = { method: b.body ? 'post' : 'get', muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + b.apiKey } };
  if (b.body) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(b.body); }
  var r = UrlFetchApp.fetch('https://api.openai.com/v1/' + b.path, opt);
  return out_({ status: r.getResponseCode(), body: r.getContentText() });
}
function doGet() { return out_({ ok: true, app: 'cookie-brain-relay' }); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
