/**
 * Paisa sync script for Google Sheets.
 * 1. Change SECRET below to any password you like (same one goes in the app).
 * 2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 * 3. Paste the web app URL and the secret into Paisa > Settings on every phone.
 */
const SECRET = 'change-this-secret';
const SHEET_NAME = 'Records';
const HEADERS = ['id', 'updatedAt', 'date', 'kind', 'amount', 'category', 'note', 'paidBy', 'with', 'from', 'to', 'shares', 'deleted', 'createdBy', 'json'];

function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== SECRET) return out_({ error: 'bad key' });
  return out_({ records: readAll_() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ error: 'bad request' }); }
  if (body.key !== SECRET) return out_({ error: 'bad key' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    upsert_(Array.isArray(body.records) ? body.records : []);
    return out_({ records: readAll_() });
  } finally {
    lock.releaseLock();
  }
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function readAll_() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const jsonCol = HEADERS.indexOf('json') + 1;
  const values = sh.getRange(2, jsonCol, last - 1, 1).getValues();
  const out = [];
  values.forEach(function (row) {
    try { if (row[0]) out.push(JSON.parse(row[0])); } catch (err) {}
  });
  return out;
}

function upsert_(records) {
  if (!records.length) return;
  const sh = sheet_();
  const last = sh.getLastRow();
  const index = {};
  if (last >= 2) {
    const meta = sh.getRange(2, 1, last - 1, 2).getValues();
    meta.forEach(function (row, i) { index[row[0]] = { row: i + 2, updatedAt: Number(row[1]) || 0 }; });
  }
  const appends = [];
  records.forEach(function (r) {
    if (!r || !r.id) return;
    const line = [
      r.id, Number(r.updatedAt) || 0, r.date || '', r.kind || '', Number(r.amount) || 0, r.category || '', r.note || '',
      r.paidBy || '', r.with || '', r.from || '', r.to || '', r.shares ? JSON.stringify(r.shares) : '', r.deleted ? 'yes' : '', r.createdBy || '',
      JSON.stringify(r)
    ];
    const existing = index[r.id];
    if (existing) {
      if ((Number(r.updatedAt) || 0) > existing.updatedAt) {
        sh.getRange(existing.row, 1, 1, HEADERS.length).setValues([line]);
      }
    } else {
      appends.push(line);
      index[r.id] = { row: -1, updatedAt: Number(r.updatedAt) || 0 };
    }
  });
  if (appends.length) sh.getRange(sh.getLastRow() + 1, 1, appends.length, HEADERS.length).setValues(appends);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
