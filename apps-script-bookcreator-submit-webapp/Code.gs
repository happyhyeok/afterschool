const SPREADSHEET_ID = '1itagZ7rcc_djAUgxiqKUoPN0g7GLC_JJak2BoQz9tMg';
const SHEET_NAME = '시트1';
const SERVICE_NAME = 'sangsang-ai-book-submit';
const SUBMITTED_STATUS = '제출 완료';
const ALLOWED_BOOK_HOSTS = [
  'read.bookcreator.com'
];

const HEADERS = [
  '책 링크',
  '제출 상태',
  '최초 제출 시간',
  '최근 수정 시간'
];

function doGet(e) {
  try {
    const action = normalize_(e && e.parameter && e.parameter.action);

    if (action === 'health') {
      return jsonResponse_({
        ok: true,
        service: SERVICE_NAME
      });
    }

    if (action === 'roster') {
      return jsonResponse_({
        ok: true,
        students: getRoster_()
      });
    }

    return jsonResponse_({
      ok: false,
      code: 'UNKNOWN_ACTION',
      message: '요청을 다시 확인해 주세요.'
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      code: 'SERVER_ERROR',
      message: '잠시 후 다시 시도해 주세요.'
    });
  }
}

function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = normalize_(params.action);

    if (action !== 'submitBook') {
      return jsonResponse_({
        ok: false,
        code: 'UNKNOWN_ACTION',
        message: '요청을 다시 확인해 주세요.'
      });
    }

    return jsonResponse_(submitBook_(params));
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      code: 'SERVER_ERROR',
      message: '잠시 후 다시 시도해 주세요.'
    });
  }
}

function getRoster_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet
    .getRange(2, 1, lastRow - 1, 2)
    .getValues()
    .map((row) => ({
      grade: normalize_(row[0]),
      name: normalize_(row[1])
    }))
    .filter((student) => student.grade && student.name);
}

function submitBook_(params) {
  const grade = normalize_(params.grade);
  const name = normalize_(params.name);
  const bookUrl = normalize_(params.bookUrl);

  if (!grade || !name || !bookUrl) {
    return {
      ok: false,
      code: 'MISSING_REQUIRED_FIELD',
      message: '학년, 이름, 책 링크를 모두 확인해 주세요.'
    };
  }

  if (!isValidBookUrl_(bookUrl)) {
    return {
      ok: false,
      code: 'INVALID_BOOK_URL',
      message: 'Book Creator 읽기 링크를 다시 확인해 주세요.'
    };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const sheet = getSheet_();
    ensureResultHeaders_(sheet);
    const matches = findStudentRow_(sheet, grade, name);

    if (matches.length === 0) {
      return {
        ok: false,
        code: 'STUDENT_NOT_FOUND',
        message: '학년과 이름을 다시 확인해 주세요.'
      };
    }

    if (matches.length > 1) {
      return {
        ok: false,
        code: 'DUPLICATE_STUDENT',
        message: '같은 학생 정보가 여러 개 있습니다. 선생님께 알려 주세요.'
      };
    }

    const row = matches[0];
    const resultRange = sheet.getRange(row, 3, 1, 4);
    const current = resultRange.getValues()[0];
    const firstSubmittedAt = current[2] || new Date();
    const updated = Boolean(normalize_(current[0]));
    const now = new Date();

    resultRange.setValues([[
      bookUrl,
      SUBMITTED_STATUS,
      firstSubmittedAt,
      now
    ]]);
    sheet.getRange(row, 5, 1, 2).setNumberFormat('yyyy-MM-dd HH:mm:ss');

    return {
      ok: true,
      code: updated ? 'UPDATED' : 'SUBMITTED',
      message: updated ? '새 책 링크로 수정했습니다.' : '책 링크를 저장했습니다.',
      updated
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      code: 'SERVER_ERROR',
      message: '잠시 후 다시 시도해 주세요.'
    };
  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      console.error(error);
    }
  }
}

function findStudentRow_(sheet, grade, name) {
  const targetGrade = normalize_(grade);
  const targetName = normalize_(name);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const rows = [];

  values.forEach((row, index) => {
    if (normalize_(row[0]) === targetGrade && normalize_(row[1]) === targetName) {
      rows.push(index + 2);
    }
  });

  return rows;
}

function normalize_(value) {
  return String(value == null ? '' : value).trim();
}

function isValidBookUrl_(value) {
  const rawUrl = normalize_(value);
  if (!rawUrl) return false;

  const match = rawUrl.match(/^https:\/\/([^\/?#:]+)(?::\d+)?(?:[\/?#]|$)/i);
  if (!match) return false;

  const hostname = match[1].toLowerCase().replace(/\.$/, '');
  return ALLOWED_BOOK_HOSTS.includes(hostname);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet not found');
  return sheet;
}

function ensureResultHeaders_(sheet) {
  const range = sheet.getRange(1, 3, 1, HEADERS.length);
  const current = range.getValues()[0].map((value) => normalize_(value));
  const needsUpdate = HEADERS.some((header, index) => current[index] !== header);

  if (needsUpdate) {
    range.setValues([HEADERS]);
  }

  sheet.getRange(1, 5, sheet.getMaxRows(), 2).setNumberFormat('yyyy-MM-dd HH:mm:ss');
}
