function listRecords_(year, school, grade, studentId) {
  return getStudentRecords_(year, school, grade, studentId).records;
}

function getStudentRecords_(year, school, grade, studentId) {
  validateStudentScope_(year, school, grade, studentId);
  const studentKey = makeStudentKey_(year, school, grade, studentId);
  const cacheKey = cacheKey_("records", studentKey);
  const cached = cacheGet_(cacheKey);
  if (cached) return cached;
  const stored = readStudentRecordRow_(studentKey);
  if (stored) {
    cachePut_(cacheKey, stored, CACHE_TTL.RECORDS);
    return stored;
  }
  const legacyRecords = listLegacyRecords_(year, school, grade, studentId);
  const result = { studentKey: studentKey, updatedAt: "", version: 0, records: legacyRecords };
  if (Object.keys(legacyRecords).length) {
    const migrated = writeStudentRecordRow_(studentKey, year, school, grade, studentId, legacyRecords, 1);
    cachePut_(cacheKey, migrated, CACHE_TTL.RECORDS);
    return migrated;
  }
  cachePut_(cacheKey, result, CACHE_TTL.RECORDS);
  return result;
}

function saveRecord_(payload) {
  validateStudentScope_(payload.year, payload.school, payload.grade, payload.studentId);
  require_(payload.entryId, "entryId");
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("다른 저장 작업이 진행 중입니다. 잠시 후 다시 시도해주세요.");
  try {
    const studentKey = makeStudentKey_(payload.year, payload.school, payload.grade, payload.studentId);
    const stored = readStudentRecordRow_(studentKey);
    const records = stored ? stored.records : listLegacyRecords_(payload.year, payload.school, payload.grade, payload.studentId);
    const duration = normalizeDuration_(payload.duration);
    const accuracy = payload.accuracy === undefined ? "" : String(payload.accuracy);
    records[payload.entryId] = {
      datetime: String(payload.datetime || ""),
      accuracy: accuracy,
      duration: accuracy ? duration : "",
    };
    const result = writeStudentRecordRow_(
      studentKey,
      payload.year,
      payload.school,
      payload.grade,
      payload.studentId,
      records,
      (stored ? stored.version : 0) + 1,
    );
    appendLegacyAudit_(payload, result.updatedAt, "github-pages-v2");
    cachePut_(cacheKey_("records", studentKey), result, CACHE_TTL.RECORDS);
    return {
      recordKey: makeRecordKey_(payload.year, payload.school, payload.grade, payload.studentId, payload.entryId),
      savedAt: result.updatedAt,
      complete: Boolean(payload.datetime && accuracy !== "" && duration),
      version: result.version,
      records: result.records,
    };
  } finally {
    lock.releaseLock();
  }
}

function clearRecord_(year, school, grade, studentId, entryId) {
  validateStudentScope_(year, school, grade, studentId);
  require_(entryId, "entryId");
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("다른 저장 작업이 진행 중입니다. 잠시 후 다시 시도해주세요.");
  try {
    const studentKey = makeStudentKey_(year, school, grade, studentId);
    const stored = readStudentRecordRow_(studentKey);
    const records = stored ? stored.records : listLegacyRecords_(year, school, grade, studentId);
    delete records[entryId];
    const result = writeStudentRecordRow_(
      studentKey,
      year,
      school,
      grade,
      studentId,
      records,
      (stored ? stored.version : 0) + 1,
    );
    appendLegacyAudit_({ year: year, school: school, grade: grade, studentId: studentId, entryId: entryId }, result.updatedAt, "clear-v2");
    cachePut_(cacheKey_("records", studentKey), result, CACHE_TTL.RECORDS);
    return result;
  } finally {
    lock.releaseLock();
  }
}

function validateStudentScope_(year, school, grade, studentId) {
  require_(year, "year");
  require_(school, "school");
  require_(grade, "grade");
  require_(studentId, "studentId");
}

function makeStudentKey_(year, school, grade, studentId) {
  return [year, school, grade, studentId].map((value) => encodeURIComponent(String(value).trim())).join("|");
}

function readStudentRecordRow_(studentKey) {
  const sheet = requireSheet_(SHEETS.STUDENT_RECORDS);
  const rowNumber = findStudentRecordRow_(sheet, studentKey);
  if (!rowNumber) return null;
  const row = sheet.getRange(rowNumber, 1, 1, STUDENT_RECORD_HEADERS.length).getValues()[0];
  let records;
  try {
    records = row[7] ? JSON.parse(String(row[7])) : {};
  } catch (error) {
    throw new Error("학생 기록 데이터가 손상되었습니다: " + studentKey);
  }
  return { studentKey: String(row[0]), updatedAt: String(row[5] || ""), version: Number(row[6] || 0), records: records };
}

function writeStudentRecordRow_(studentKey, year, school, grade, studentId, records, version) {
  const sheet = requireSheet_(SHEETS.STUDENT_RECORDS);
  const rowNumber = findStudentRecordRow_(sheet, studentKey) || sheet.getLastRow() + 1;
  const updatedAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
  sheet.getRange(rowNumber, 1, 1, STUDENT_RECORD_HEADERS.length).setValues([[
    studentKey, String(year), String(school), String(grade), String(studentId), updatedAt,
    Number(version || 0), JSON.stringify(records || {}),
  ]]);
  cachePut_(cacheKey_("record-row", studentKey), { rowNumber: rowNumber }, CACHE_TTL.RECORD_ROW);
  return { studentKey: studentKey, updatedAt: updatedAt, version: Number(version || 0), records: records || {} };
}

function findStudentRecordRow_(sheet, studentKey) {
  const cached = cacheGet_(cacheKey_("record-row", studentKey));
  if (cached && cached.rowNumber > 1 && cached.rowNumber <= sheet.getLastRow()) {
    if (String(sheet.getRange(cached.rowNumber, 1).getValue()) === studentKey) return cached.rowNumber;
  }
  if (sheet.getLastRow() < 2) return 0;
  const match = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
    .createTextFinder(studentKey).matchEntireCell(true).findNext();
  const rowNumber = match ? match.getRow() : 0;
  if (rowNumber) cachePut_(cacheKey_("record-row", studentKey), { rowNumber: rowNumber }, CACHE_TTL.RECORD_ROW);
  return rowNumber;
}

function listLegacyRecords_(year, school, grade, studentId) {
  const sheet = requireSheet_(SHEETS.RECORDS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};
  const rows = sheet.getRange(2, 1, lastRow - 1, RECORD_HEADERS.length).getValues();
  const records = {};
  rows.forEach((row) => {
    if (String(row[2]) === String(year) && String(row[3]) === String(school) &&
        String(row[4]) === String(grade) && String(row[5]) === String(studentId) && row[10]) {
      const accuracy = row[12] === "" ? "" : String(row[12]);
      records[String(row[10])] = {
        datetime: String(row[11] || ""), accuracy: accuracy,
        duration: accuracy ? normalizeDuration_(row[13]) : "",
      };
    }
  });
  return records;
}

function appendLegacyAudit_(payload, savedAt, source) {
  try {
    const sheet = requireSheet_(SHEETS.RECORDS);
    const duration = normalizeDuration_(payload.duration);
    const accuracy = payload.accuracy === undefined ? "" : payload.accuracy;
    sheet.appendRow([
      makeRecordKey_(payload.year, payload.school, payload.grade, payload.studentId, payload.entryId),
      savedAt, payload.year, payload.school, payload.grade, payload.studentId,
      payload.number || "", payload.name || "", payload.stage || "", payload.attempt || "", payload.entryId,
      payload.datetime || "", accuracy, duration, payload.datetime && accuracy !== "" && duration ? "Y" : "N", source,
    ]);
  } catch (error) {
    // StudentRecords is authoritative; a compatibility audit failure is non-fatal.
  }
}
