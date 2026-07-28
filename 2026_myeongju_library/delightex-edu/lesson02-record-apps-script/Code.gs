const SPREADSHEET_ID = '1jGvBtjdgxUmpdQ0nPP9jpkPrc9mILg3LgBFvKN628NQ';
const SHEET_NAME = '차시공통기록_V2';
const HEADERS = [
  'serverTimestamp',
  'submissionId',
  'schemaVersion',
  'studentId',
  'studentName',
  'loginId',
  'className',
  'grade',
  'school',
  'lessonNumber',
  'lessonTitle',
  'activityData',
  'checklistData',
  'reflectionData',
  'startedAt',
  'completedAt',
  'submittedAt',
];

function doPost(e) {
  try {
    const payload = parsePayload_(e);

    if (payload.action !== 'submitLessonRecord') {
      throw new Error('Unsupported action: ' + String(payload.action || ''));
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);

    try {
      const sheet = ensureSheet_();
      const submissionId = String(payload.submissionId || Utilities.getUuid());
      const activityData = JSON.stringify(stripSensitive_(payload.activityData || {}));
      const checklistData = JSON.stringify(stripSensitive_(payload.checklistData || {}));
      const reflectionData = JSON.stringify(stripSensitive_(payload.reflectionData || {}));

      sheet.appendRow([
        new Date(),
        submissionId,
        String(payload.schemaVersion || ''),
        String(payload.studentId || payload.loginId || ''),
        String(payload.studentName || ''),
        String(payload.loginId || payload.studentId || ''),
        String(payload.className || ''),
        String(payload.grade || ''),
        String(payload.school || ''),
        Number(payload.lessonNumber || 2),
        String(payload.lessonTitle || ''),
        activityData,
        checklistData,
        reflectionData,
        String(payload.startedAt || ''),
        String(payload.completedAt || ''),
        String(payload.submittedAt || ''),
      ]);

      return json_({ ok: true, submissionId });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return json_({ ok: false, error: error.message || String(error) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'lesson02-record-submit', sheetName: SHEET_NAME });
}

function parsePayload_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  return JSON.parse(raw);
}

function ensureSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const current = range.getValues()[0].map(value => String(value || '').trim());
  const headerExists = current.some(Boolean);
  const headerMatches = HEADERS.every((header, index) => current[index] === header);

  if (!headerExists || !headerMatches) {
    range.setValues([HEADERS]);
  }

  sheet.setFrozenRows(1);
  return sheet;
}

function stripSensitive_(value) {
  if (Array.isArray(value)) {
    return value.map(stripSensitive_);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((clean, key) => {
      if (/password|비밀번호|pass|pw/i.test(key)) {
        return clean;
      }

      clean[key] = stripSensitive_(value[key]);
      return clean;
    }, {});
  }

  return value;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
