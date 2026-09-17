const SPREADSHEET_ID = "1Q8o3xDW17Db2eNDu-r7b--uevIMgGg9uVOBiMskfB1Q";

const SHEETS = {
  STUDENTS: "Students",
  RECORDS: "Records",
  STUDENT_RECORDS: "StudentRecords",
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
const RECORD_DURATION_COLUMN = RECORD_HEADERS.indexOf("duration") + 1;

const STUDENT_RECORD_HEADERS = [
  "studentKey",
  "year",
  "school",
  "grade",
  "studentId",
  "updatedAt",
  "version",
  "recordsJson",
];

const CACHE_VERSION = "v2";
const CACHE_TTL = {
  STUDENT_ROWS: 300,
  SCHOOLS: 600,
  GRADES: 600,
  STUDENTS: 300,
  RECORDS: 300,
  RECORD_ROW: 1800,
};
