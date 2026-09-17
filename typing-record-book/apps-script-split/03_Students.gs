function listStudents_() {
  const sheet = getSheet_(SHEETS.STUDENTS, STUDENT_HEADERS);
  const rows = readObjects_(sheet, STUDENT_HEADERS);
  const changedRows = [];

  const students = rows
    .map((row, index) => {
      if (!row.name || !row.school || !row.grade) return null;

      if (!row.studentId) {
        row.studentId = "S-" + Utilities.getUuid().slice(0, 8);
        changedRows.push({ rowNumber: index + 2, studentId: row.studentId });
      }

      if (String(row.active || "TRUE").toUpperCase() === "FALSE") return null;

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

function ensureStudentIds_() {
  listStudents_();
}

function getSchoolSummaries_() {
  const cacheKey = cacheKey_("schools");
  const cached = cacheGet_(cacheKey);
  if (cached) return cached;

  const rows = readStudentValues_();
  const map = {};
  rows.forEach((row) => {
    if (!isActiveStudentRow_(row)) return;
    const year = normalizeYear_(row[0]);
    const school = String(row[1] || "").trim();
    if (!school) return;
    const key = year + "\u0000" + school;
    if (!map[key]) map[key] = { year: year, school: school, count: 0 };
    map[key].count += 1;
  });

  const result = {
    schools: Object.keys(map)
      .map((key) => map[key])
      .sort((a, b) => Number(b.year) - Number(a.year) || a.school.localeCompare(b.school)),
    generatedAt: new Date().toISOString(),
  };
  cachePut_(cacheKey, result, CACHE_TTL.SCHOOLS);
  return result;
}

function getGrades_(year, school) {
  require_(year, "year");
  require_(school, "school");
  year = String(year).trim();
  school = String(school).trim();
  const cacheKey = cacheKey_("grades", year, school);
  const cached = cacheGet_(cacheKey);
  if (cached) return cached;

  const counts = {};
  readStudentValues_().forEach((row) => {
    if (!isActiveStudentRow_(row)) return;
    if (normalizeYear_(row[0]) !== year || String(row[1] || "").trim() !== school) return;
    const grade = String(row[2] || "").trim();
    if (!grade) return;
    counts[grade] = (counts[grade] || 0) + 1;
  });

  const result = {
    year: year,
    school: school,
    grades: Object.keys(counts)
      .map((grade) => ({ grade: grade, count: counts[grade] }))
      .sort((a, b) => Number(a.grade) - Number(b.grade) || a.grade.localeCompare(b.grade)),
  };
  cachePut_(cacheKey, result, CACHE_TTL.GRADES);
  return result;
}

function getStudentsByScope_(year, school, grade) {
  require_(year, "year");
  require_(school, "school");
  require_(grade, "grade");
  year = String(year).trim();
  school = String(school).trim();
  grade = String(grade).trim();
  const cacheKey = cacheKey_("students", year, school, grade);
  const cached = cacheGet_(cacheKey);
  if (cached) return cached;

  const students = readStudentValues_()
    .filter(
      (row) =>
        isActiveStudentRow_(row) &&
        normalizeYear_(row[0]) === year &&
        String(row[1] || "").trim() === school &&
        String(row[2] || "").trim() === grade &&
        String(row[3] || "").trim() &&
        String(row[5] || "").trim(),
    )
    .map((row) => ({
      studentId: String(row[3]).trim(),
      number: String(row[4] || "").trim(),
      name: String(row[5]).trim(),
    }))
    .sort((a, b) => {
      const an = Number(a.number);
      const bn = Number(b.number);
      if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;
      return a.name.localeCompare(b.name);
    });

  const result = { year: year, school: school, grade: grade, students: students };
  cachePut_(cacheKey, result, CACHE_TTL.STUDENTS);
  return result;
}

function readStudentValues_() {
  const cacheKey = cacheKey_("student-rows");
  const cached = cacheGet_(cacheKey);
  if (cached && Array.isArray(cached.rows)) return cached.rows;
  const sheet = requireSheet_(SHEETS.STUDENTS);
  const lastRow = sheet.getLastRow();
  const rows = lastRow < 2 ? [] : sheet.getRange(2, 1, lastRow - 1, STUDENT_HEADERS.length).getValues();
  cachePut_(cacheKey, { rows: rows }, CACHE_TTL.STUDENT_ROWS);
  return rows;
}

function isActiveStudentRow_(row) {
  return String(row[6] === "" ? "TRUE" : row[6]).toUpperCase() !== "FALSE";
}

function normalizeYear_(value) {
  return String(value || new Date().getFullYear()).trim();
}
