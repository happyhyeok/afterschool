// 동호초 6차시 학생용 페이지용 Apps Script입니다.
//
// [배포 순서]
// 1) 이 파일 내용을 대상 스프레드시트의 Apps Script 프로젝트에 추가합니다.
// 2) 배포 > 배포 관리 > 새 버전으로 웹 앱을 배포합니다.
// 3) 생성된 /exec URL을 lesson06.js의 LESSON06_API_URL에 넣습니다.
// 4) AI 도구 URL이 확인되면 Settings 시트에 lesson06_ai_tool_url 값으로 넣거나,
//    lesson06.js의 LESSON06_AI_TOOL_URL에 넣습니다.

const LESSON06_SPREADSHEET_ID = "18ClMVlMPWOcp7x6WUFHvenZbGESwW14RZmMm2B0TcLE";
const LESSON06_STUDENTS_SHEET = "Students";
const LESSON06_CURRENT_SHEET = "CharacterCurrent";
const LESSON06_SETTINGS_SHEET = "Settings";
const LESSON06_PROGRESS_SHEET = "Lesson06Progress";

const LESSON06_PROGRESS_HEADERS = [
  "student_id",
  "school_code",
  "class_name",
  "number",
  "name",
  "current_step",
  "identity_confirmed",
  "satisfaction",
  "keep_part",
  "edit_part_1",
  "edit_detail_1",
  "edit_part_2",
  "edit_detail_2",
  "edit_count",
  "first_result_evaluation",
  "first_keep_evaluation",
  "second_edit_part",
  "second_edit_detail",
  "selected_image",
  "selection_reason",
  "slide_saved",
  "final_checks",
  "reflection",
  "help_type",
  "help_requested_at",
  "completed",
  "updated_at",
  "completed_at"
];

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  let result;
  try {
    if (p.action === "getStudent") result = lesson06GetStudent_(p);
    else if (p.action === "saveLesson06Progress") result = lesson06SaveProgress_(p);
    else result = { success: false, message: "Unknown action" };
  } catch (error) {
    result = { success: false, message: String(error && error.message ? error.message : error) };
  }
  return lesson06Jsonp_(p.callback, result);
}

function lesson06GetStudent_(p) {
  const schoolCode = String(p.school_code || "dongho").trim();
  const className = String(p.class_name || "").trim();
  const number = Number(p.number);
  if (!className || !number) {
    return { success: false, message: "학급과 번호가 필요합니다." };
  }

  const ss = SpreadsheetApp.openById(LESSON06_SPREADSHEET_ID);
  const studentsSheet = ss.getSheetByName(LESSON06_STUDENTS_SHEET);
  const currentSheet = ss.getSheetByName(LESSON06_CURRENT_SHEET);
  if (!studentsSheet || !currentSheet) {
    return { success: false, message: "필요한 시트를 찾지 못했습니다." };
  }

  const studentRows = lesson06Objects_(studentsSheet.getDataRange().getValues());
  const student = studentRows.find((row) => {
    return String(row.school_code || "") === schoolCode &&
      String(row.class_name || "") === className &&
      Number(row.number) === number &&
      String(row.active || "").toUpperCase() !== "FALSE";
  });
  if (!student) {
    return { success: false, message: "학생 자료를 찾지 못했습니다." };
  }

  const currentRows = lesson06Objects_(currentSheet.getDataRange().getValues());
  const current = currentRows.find((row) => String(row.student_id || "") === String(student.student_id || "")) || {};
  const responseStudent = {
    student_id: student.student_id || "",
    class_name: student.class_name || "",
    number: student.number || "",
    name: student.name || "",
    character_name: current.character_name || "",
    personality: current.personality || "",
    ability: current.ability || current.skill_description || "",
    skill_description: current.skill_description || "",
    slides_url: current.slides_url || "",
    image_url: current.image_url || "",
    padlet_url: current.padlet_url || "",
    music_url: current.music_url || "",
    image_status: current.image_status || "",
    music_status: current.music_status || "",
    support_note: current.support_note || ""
  };

  return {
    success: true,
    student: responseStudent,
    ai_tool_url: lesson06Setting_("lesson06_ai_tool_url") || lesson06Setting_("ai_tool_url") || ""
  };
}

function lesson06SaveProgress_(p) {
  if (!p.student_id) return { success: false, message: "student_id가 필요합니다." };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = lesson06EnsureProgressSheet_();
    const rows = sheet.getDataRange().getValues();
    const rowValues = LESSON06_PROGRESS_HEADERS.map((header) => lesson06ProgressValue_(header, p));
    let targetRow = 0;
    for (let i = 1; i < rows.length; i += 1) {
      if (String(rows[i][0]) === String(p.student_id)) {
        targetRow = i + 1;
        break;
      }
    }
    if (targetRow) {
      sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function lesson06ProgressValue_(header, p) {
  const now = new Date();
  if (header === "updated_at") return now;
  if (header === "completed_at") return String(p.completed).toLowerCase() === "true" ? now : "";
  if (header === "help_requested_at") return p.help_type ? now : "";
  if (header === "number" || header === "current_step" || header === "edit_count") {
    const n = Number(p[header]);
    return Number.isFinite(n) ? n : "";
  }
  return p[header] || "";
}

function lesson06EnsureProgressSheet_() {
  const ss = SpreadsheetApp.openById(LESSON06_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(LESSON06_PROGRESS_SHEET);
  if (!sheet) sheet = ss.insertSheet(LESSON06_PROGRESS_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, LESSON06_PROGRESS_HEADERS.length).setValues([LESSON06_PROGRESS_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  const existing = sheet.getRange(1, 1, 1, LESSON06_PROGRESS_HEADERS.length).getValues()[0];
  LESSON06_PROGRESS_HEADERS.forEach((header, index) => {
    if (!existing[index]) {
      sheet.getRange(1, index + 1).setValue(header);
    } else if (String(existing[index]) !== header) {
      throw new Error("Lesson06Progress header mismatch column " + (index + 1));
    }
  });
  return sheet;
}

function lesson06Objects_(values) {
  if (!values || values.length < 2) return [];
  const headers = values[0].map((header) => String(header || "").trim());
  return values.slice(1).map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      if (header) object[header] = row[index];
    });
    return object;
  });
}

function lesson06Setting_(key) {
  const ss = SpreadsheetApp.openById(LESSON06_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(LESSON06_SETTINGS_SHEET);
  if (!sheet) return "";
  const values = sheet.getDataRange().getValues();
  for (let r = 0; r < values.length; r += 1) {
    for (let c = 0; c < values[r].length; c += 1) {
      if (String(values[r][c] || "").trim() === key) {
        return String(values[r][c + 1] || "").trim();
      }
    }
  }
  return "";
}

function lesson06Jsonp_(callback, data) {
  const safeCallback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback || "") ? callback : "callback";
  return ContentService
    .createTextOutput(safeCallback + "(" + JSON.stringify(data) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
