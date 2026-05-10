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

  if (rowNumber) sheet.getRange(rowNumber, 1, 1, RECORD_HEADERS.length).setValues([row]);
  else sheet.appendRow(row);

  return { recordKey: recordKey, savedAt: savedAt, complete: complete };
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
  if (rowNumber) sheet.deleteRow(rowNumber);
}
