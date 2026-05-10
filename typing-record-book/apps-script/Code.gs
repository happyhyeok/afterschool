const SPREADSHEET_ID = "1Q8o3xDW17Db2eNDu-r7b--uevIMgGg9uVOBiMskfB1Q";

const SHEETS = {
  STUDENTS: "Students",
  RECORDS: "Records",
};

const STUDENT_HEADERS = ["year", "school", "grade", "studentId", "number", "name", "active", "createdAt"];
const RECORD_HEADERS = [
  "recordKey",
  "savedAt",
  "year",
  "school",
  "grade",
  "studentId",
  "number",
  "name",
  "stage",
  "attempt",
  "entryId",
  "practicedAt",
  "accuracy",
  "duration",
  "complete",
  "source",
];

function doGet(event) {
  const params = event.parameter || {};
  const result = handleRequest_(params);
  return output_(result, params.callback);
}

function doPost(event) {
  const params = event.parameter || {};
  const body = event.postData && event.postData.contents ? JSON.parse(event.postData.contents) : {};
  const result = handleRequest_(Object.assign({}, params, body));
  return output_(result);
}

function handleRequest_(params) {
  try {
    ensureSheets_();
    const action = params.action || "bootstrap";

    if (action === "setup") {
      return ok_({ message: "ready" });
    }

    if (action === "bootstrap") {
      return ok_({ students: listStudents_() });
    }

    if (action === "records") {
      return ok_({
        records: listRecords_(params.year, params.school, params.grade, params.studentId),
      });
    }

    if (action === "saveRecord") {
      return ok_({
        record: saveRecord_(parsePayload_(params.payload)),
      });
    }

    if (action === "clearRecord") {
      clearRecord_(params.year, params.school, params.grade, params.studentId, params.entryId);
      return ok_({ cleared: true });
    }

    return fail_("unknown action");
  } catch (error) {
    return fail_(error.message || String(error));
  }
}

function listStudents_() {
  const sheet = getSheet_(SHEETS.STUDENTS, STUDENT_HEADERS);
  const rows = readObjects_(sheet, STUDENT_HEADERS);
  const changedRows = [];

  const students = rows
    .map((row, index) => {
      if (!row.name || !row.school || !row.grade) {
        return null;
      }

      if (!row.studentId) {
        row.studentId = "S-" + Utilities.getUuid().slice(0, 8);
        changedRows.push({ rowNumber: index + 2, studentId: row.studentId });
      }

      if (String(row.active || "TRUE").toUpperCase() === "FALSE") {
        return null;
      }

      return {
        year: String(row.year || new Date().getFullYear()),
        school: String(row.school || ""),
        grade: String(row.grade || ""),
        studentId: String(row.studentId || ""),
        number: String(row.number || ""),
        name: String(row.name || ""),
      };
    })
    .filter(Boolean);

  for (const change of changedRows) {
    sheet.getRange(change.rowNumber, STUDENT_HEADERS.indexOf("studentId") + 1).setValue(change.studentId);
  }

  students.sort((a, b) => {
    if (a.year !== b.year) return Number(b.year) - Number(a.year);
    if (a.school !== b.school) return a.school.localeCompare(b.school);
    if (a.grade !== b.grade) return Number(a.grade) - Number(b.grade);
    const an = Number(a.number);
    const bn = Number(b.number);
    if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;
    return a.name.localeCompare(b.name);
  });

  return students;
}

function listRecords_(year, school, grade, studentId) {
  require_(year, "year");
  require_(school, "school");
  require_(grade, "grade");
  require_(studentId, "studentId");

  const sheet = getSheet_(SHEETS.RECORDS, RECORD_HEADERS);
  const rows = readObjects_(sheet, RECORD_HEADERS);
  const records = {};

  rows.forEach((row) => {
    if (
      String(row.year) === String(year) &&
      String(row.school) === String(school) &&
      String(row.grade) === String(grade) &&
      String(row.studentId) === String(studentId) &&
      row.entryId
    ) {
      records[row.entryId] = {
        datetime: String(row.practicedAt || ""),
        accuracy: row.accuracy === "" ? "" : String(row.accuracy),
        duration: String(row.duration || ""),
      };
    }
  });

  return records;
}

function saveRecord_(payload) {
  require_(payload.year, "year");
  require_(payload.school, "school");
  require_(payload.grade, "grade");
  require_(payload.studentId, "studentId");
  require_(payload.entryId, "entryId");

  const sheet = getSheet_(SHEETS.RECORDS, RECORD_HEADERS);
  const recordKey = makeRecordKey_(payload.year, payload.school, payload.grade, payload.studentId, payload.entryId);
  const rowNumber = findRecordRow_(sheet, recordKey);
  const savedAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
  const complete = Boolean(payload.datetime && payload.accuracy !== "" && payload.duration);
  const row = [
    recordKey,
    savedAt,
    payload.year,
    payload.school,
    payload.grade,
    payload.studentId,
    payload.number || "",
    payload.name || "",
    payload.stage || "",
    payload.attempt || "",
    payload.entryId,
    payload.datetime || "",
    payload.accuracy === undefined ? "" : payload.accuracy,
    payload.duration || "",
    complete ? "Y" : "N",
    "github-pages",
  ];

  if (rowNumber) {
    sheet.getRange(rowNumber, 1, 1, RECORD_HEADERS.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return {
    recordKey,
    savedAt,
    complete,
  };
}

function clearRecord_(year, school, grade, studentId, entryId) {
  require_(year, "year");
  require_(school, "school");
  require_(grade, "grade");
  require_(studentId, "studentId");
  require_(entryId, "entryId");

  const sheet = getSheet_(SHEETS.RECORDS, RECORD_HEADERS);
  const recordKey = makeRecordKey_(year, school, grade, studentId, entryId);
  const rowNumber = findRecordRow_(sheet, recordKey);
  if (rowNumber) {
    sheet.deleteRow(rowNumber);
  }
}

function ensureSheets_() {
  const students = getSheet_(SHEETS.STUDENTS, STUDENT_HEADERS);
  const records = getSheet_(SHEETS.RECORDS, RECORD_HEADERS);
  formatSheet_(students, STUDENT_HEADERS.length);
  formatSheet_(records, RECORD_HEADERS.length);
}

function getSheet_(name, headers) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const empty = firstRow.every((value) => value === "");
  if (empty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    headers.forEach((header, index) => {
      if (firstRow[index] !== header) {
        sheet.getRange(1, index + 1).setValue(header);
      }
    });
  }
  return sheet;
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function readObjects_(sheet, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = row[index];
    });
    return object;
  });
}

function findRecordRow_(sheet, recordKey) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return 0;
  }
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0]) === recordKey) {
      return index + 2;
    }
  }
  return 0;
}

function makeRecordKey_(year, school, grade, studentId, entryId) {
  return [year, school, grade, studentId, entryId].map((value) => String(value).trim()).join("|");
}

function parsePayload_(payload) {
  if (!payload) {
    return {};
  }
  if (typeof payload === "object") {
    return payload;
  }
  return JSON.parse(payload);
}

function formatSheet_(sheet, width) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, width).setFontWeight("bold").setBackground("#E9F7F7");
  sheet.autoResizeColumns(1, width);
}

function require_(value, name) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(name + " is required");
  }
}

function output_(result, callback) {
  const json = JSON.stringify(result);
  if (callback) {
    const safeCallback = String(callback).replace(/[^\w.$]/g, "");
    return ContentService.createTextOutput(safeCallback + "(" + json + ");").setMimeType(
      ContentService.MimeType.JAVASCRIPT,
    );
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function ok_(data) {
  return {
    ok: true,
    data: data || {},
  };
}

function fail_(message) {
  return {
    ok: false,
    error: message || "error",
  };
}
