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
