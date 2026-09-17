function migrateRecordsToStudentRecords() {
  ensureSheets_();
  const source = requireSheet_(SHEETS.RECORDS);
  const lastRow = source.getLastRow();
  if (lastRow < 2) return { students: 0, sourceRows: 0, migratedRecords: 0, duplicatesResolved: 0, invalidRows: 0 };
  const values = source.getRange(2, 1, lastRow - 1, RECORD_HEADERS.length).getValues();
  const groups = {};
  let invalidRows = 0;
  let duplicatesResolved = 0;
  values.forEach((row) => {
    const year = String(row[2] || "").trim();
    const school = String(row[3] || "").trim();
    const grade = String(row[4] || "").trim();
    const studentId = String(row[5] || "").trim();
    const entryId = String(row[10] || "").trim();
    if (!year || !school || !grade || !studentId || !entryId) { invalidRows += 1; return; }
    const studentKey = makeStudentKey_(year, school, grade, studentId);
    if (!groups[studentKey]) groups[studentKey] = { year: year, school: school, grade: grade, studentId: studentId, entries: {} };
    const existing = groups[studentKey].entries[entryId];
    const savedAt = String(row[1] || "");
    if (existing) { duplicatesResolved += 1; if (existing.savedAt > savedAt) return; }
    const accuracy = row[12] === "" ? "" : String(row[12]);
    groups[studentKey].entries[entryId] = {
      savedAt: savedAt,
      record: { datetime: String(row[11] || ""), accuracy: accuracy, duration: accuracy ? normalizeDuration_(row[13]) : "" },
    };
  });
  let migratedRecords = 0;
  Object.keys(groups).forEach((studentKey) => {
    const group = groups[studentKey];
    const legacyRecords = {};
    Object.keys(group.entries).forEach((entryId) => { legacyRecords[entryId] = group.entries[entryId].record; migratedRecords += 1; });
    const existing = readStudentRecordRow_(studentKey);
    const records = Object.assign({}, legacyRecords, existing ? existing.records : {});
    writeStudentRecordRow_(studentKey, group.year, group.school, group.grade, group.studentId, records,
      Math.max(existing ? existing.version : 0, 1));
    cacheRemove_(cacheKey_("records", studentKey));
  });
  return {
    students: Object.keys(groups).length, sourceRows: values.length, migratedRecords: migratedRecords,
    duplicatesResolved: duplicatesResolved, invalidRows: invalidRows,
  };
}
