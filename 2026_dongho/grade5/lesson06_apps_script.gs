// 동호초 6차시 학생용 페이지용 Apps Script API입니다.
//
// [배포 순서]
// 1) 이 파일 내용을 대상 스프레드시트의 Apps Script 프로젝트에 추가합니다.
// 2) 기존 doGet/doPost가 있다면 이 파일의 action 분기와 helper 함수를 병합합니다.
// 3) 배포 > 배포 관리 > 새 버전으로 웹 앱을 배포합니다.
// 4) 생성된 /exec URL을 lesson06.js의 LESSON06_API_URL에 넣습니다.
// 5) AI 도구 URL이 확인되면 Settings 시트에 lesson06_ai_tool_url 값으로 넣거나,
//    lesson06.js의 LESSON06_AI_TOOL_URL에 넣습니다.

const LESSON06_SPREADSHEET_ID = "18ClMVlMPWOcp7x6WUFHvenZbGESwW14RZmMm2B0TcLE";
const LESSON06_STUDENTS_SHEET = "Students";
const LESSON06_CURRENT_SHEET = "CharacterCurrent";
const LESSON06_SETTINGS_SHEET = "Settings";
const LESSON06_PROGRESS_SHEET = "Lesson06Progress";
const LESSON06_TIME_ZONE = "Asia/Seoul";
const LESSON06_ALLOWED_SCHOOL_CODE = "dongho";

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
  "keep_custom",
  "edit_part_1",
  "edit_detail_1",
  "edit_part_2",
  "edit_detail_2",
  "generated_prompt",
  "edited_prompt",
  "edit_count",
  "first_result_evaluation",
  "first_keep_evaluation",
  "second_edit_part",
  "second_edit_detail",
  "second_prompt",
  "selected_image",
  "selection_reason",
  "slide_saved",
  "final_checks",
  "reflection",
  "help_type",
  "help_requested_at",
  "completed",
  "created_at",
  "updated_at",
  "completed_at"
];

const LESSON06_RETURN_FIELDS = [
  "student_id",
  "school_code",
  "class_name",
  "number",
  "name",
  "display_name",
  "character_name",
  "personality",
  "ability",
  "skill_description",
  "slides_url",
  "image_url",
  "padlet_url",
  "music_url",
  "image_status",
  "music_status",
  "support_note"
];

const LESSON06_LENGTH_LIMITS = {
  satisfaction: 50,
  keep_part: 50,
  keep_custom: 50,
  edit_part_1: 50,
  edit_part_2: 50,
  second_edit_part: 50,
  edit_detail_1: 300,
  edit_detail_2: 300,
  second_edit_detail: 300,
  generated_prompt: 2000,
  edited_prompt: 2000,
  second_prompt: 2000,
  selected_image: 50,
  selection_reason: 500,
  final_checks: 500,
  reflection: 1000,
  help_type: 300
};

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  const action = String(p.action || "").trim();
  let result;
  try {
    if (action === "getStudent") {
      result = handleGetStudent(p);
    } else if (action === "saveLesson06Progress") {
      // GitHub Pages + Apps Script 환경에서 기존 수업 페이지가 사용해 온 JSONP 방식을 보존합니다.
      result = handleSaveLesson06Progress(p);
    } else {
      result = createErrorPayload_("UNSUPPORTED_ACTION", "지원하지 않는 요청입니다.");
    }
  } catch (error) {
    console.error(error);
    result = createErrorPayload_("INTERNAL_ERROR", "처리 중 문제가 생겼습니다. 선생님께 알려 주세요.");
  }
  return createResponse_(result, p.callback);
}

function doPost(e) {
  const request = parseRequestBody(e);
  const action = String(request.action || "").trim();
  let result;
  try {
    if (action === "saveLesson06Progress") {
      result = handleSaveLesson06Progress(request);
    } else {
      result = createErrorPayload_("UNSUPPORTED_ACTION", "지원하지 않는 요청입니다.");
    }
  } catch (error) {
    console.error(error);
    result = createErrorPayload_("INTERNAL_ERROR", "처리 중 문제가 생겼습니다. 선생님께 알려 주세요.");
  }
  return createJsonResponse(result);
}

function handleGetStudent(raw) {
  const request = validateStudentRequest(raw);
  if (!request.success) return request;

  const ss = SpreadsheetApp.openById(LESSON06_SPREADSHEET_ID);
  const studentsSheet = getRequiredSheet_(ss, LESSON06_STUDENTS_SHEET);
  const currentSheet = getRequiredSheet_(ss, LESSON06_CURRENT_SHEET);
  if (!studentsSheet || !currentSheet) {
    return createErrorPayload_("SHEET_NOT_READY", "학생 자료를 불러올 준비가 되지 않았습니다. 선생님께 알려 주세요.");
  }

  const studentsData = getSheetObjects_(studentsSheet);
  const matches = studentsData.objects.filter((row) => isMatchingActiveStudent_(row, request));
  if (matches.length === 0) {
    return createErrorPayload_("STUDENT_NOT_FOUND", "학생 자료를 찾지 못했습니다. 학급과 이름을 확인해 주세요.");
  }
  if (matches.length > 1) {
    return createErrorPayload_("DUPLICATE_STUDENT", "학생 자료가 중복되어 있습니다. 선생님께 알려 주세요.");
  }

  const student = matches[0];
  const currentData = getSheetObjects_(currentSheet);
  const character = findCharacter_(currentData.objects, student.student_id);
  const responseStudent = selectStudentResponse_(student, character);

  return {
    success: true,
    message: "학생 자료를 불러왔습니다.",
    student: responseStudent,
    data: {
      ai_tool_url: getSetting_("lesson06_ai_tool_url") || getSetting_("ai_tool_url") || ""
    },
    ai_tool_url: getSetting_("lesson06_ai_tool_url") || getSetting_("ai_tool_url") || ""
  };
}

function handleSaveLesson06Progress(raw) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (error) {
    return createErrorPayload_("SAVE_BUSY", "저장 요청이 많습니다. 잠시 후 다시 눌러 주세요.");
  }

  try {
    const ss = SpreadsheetApp.openById(LESSON06_SPREADSHEET_ID);
    const studentsSheet = getRequiredSheet_(ss, LESSON06_STUDENTS_SHEET);
    if (!studentsSheet) {
      return createErrorPayload_("SHEET_NOT_READY", "학생 자료를 불러올 준비가 되지 않았습니다. 선생님께 알려 주세요.");
    }

    const studentsData = getSheetObjects_(studentsSheet);
    const student = findStudentById_(studentsData.objects, raw.student_id);
    const validation = validateProgressRequest(raw, student);
    if (!validation.success) return validation;

    const progressSheet = createProgressSheetIfNeeded(ss);
    const progressData = getSheetObjects_(progressSheet);
    const progressRows = findProgressRows_(progressData.objects, raw.student_id);
    if (progressRows.length > 1) {
      console.warn("Duplicate Lesson06Progress rows for " + raw.student_id);
      return createErrorPayload_("DUPLICATE_PROGRESS", "저장된 진행 자료가 중복되어 있습니다. 선생님께 알려 주세요.");
    }

    const now = new Date();
    const targetRowNumber = progressRows.length ? progressRows[0].rowNumber : 0;
    const existing = progressRows.length ? progressRows[0] : {};
    const rowObject = buildProgressRowObject_(raw, student, existing, now, !targetRowNumber);
    const values = progressData.headers.map((header) => {
      if (LESSON06_PROGRESS_HEADERS.indexOf(header) === -1) {
        return existing[header] || "";
      }
      return Object.prototype.hasOwnProperty.call(rowObject, header) ? rowObject[header] : existing[header] || "";
    });

    if (targetRowNumber) {
      progressSheet.getRange(targetRowNumber, 1, 1, values.length).setValues([values]);
    } else {
      progressSheet.appendRow(values);
    }

    return {
      success: true,
      message: "저장했습니다.",
      data: {
        student_id: student.student_id,
        completed: rowObject.completed === true || rowObject.completed === "TRUE"
      }
    };
  } finally {
    lock.releaseLock();
  }
}

function validateStudentRequest(raw) {
  const schoolCode = sanitizeKey_(raw.school_code || "");
  const className = normalizeClassName_(raw.class_name || "");
  const name = normalizeLookupName_(raw.name || raw.student_name || "");
  const number = normalizePositiveInteger_(raw.number);

  if (schoolCode !== LESSON06_ALLOWED_SCHOOL_CODE || !className || (!name && !number)) {
    return createErrorPayload_("INVALID_INPUT", "학급과 이름을 정확하게 입력해 주세요.");
  }
  return { success: true, school_code: schoolCode, class_name: className, name: name, number: number };
}

function validateProgressRequest(raw, student) {
  if (!student) {
    return createErrorPayload_("STUDENT_NOT_FOUND", "학생 자료를 찾지 못했습니다. 처음부터 다시 불러와 주세요.");
  }
  if (sanitizeKey_(raw.school_code || "") !== LESSON06_ALLOWED_SCHOOL_CODE) {
    return createErrorPayload_("INVALID_INPUT", "학생 자료가 맞지 않습니다. 처음부터 다시 불러와 주세요.");
  }
  if (normalizeClassName_(raw.class_name || "") !== String(student.class_name || "")) {
    return createErrorPayload_("INVALID_INPUT", "학생 자료가 맞지 않습니다. 처음부터 다시 불러와 주세요.");
  }
  if (normalizePositiveInteger_(raw.number) !== Number(student.number)) {
    return createErrorPayload_("INVALID_INPUT", "학생 자료가 맞지 않습니다. 처음부터 다시 불러와 주세요.");
  }
  const currentStep = normalizeIntegerInRange_(raw.current_step, 1, 6, 1);
  const editCount = normalizeIntegerInRange_(raw.edit_count, 0, 2, 0);
  if (currentStep === null || editCount === null) {
    return createErrorPayload_("INVALID_INPUT", "저장할 수 없는 진행 상태입니다.");
  }

  const lengthError = validateLengthLimits_(raw);
  if (lengthError) return lengthError;

  const wantsComplete = normalizeBoolean_(raw.completed) === true;
  if (wantsComplete) {
    const identityConfirmed = normalizeBoolean_(raw.identity_confirmed) === true;
    const selectedImage = sanitizeText_(raw.selected_image || "", "selected_image");
    const slideSaved = normalizeBoolean_(raw.slide_saved) === true;
    const reflection = sanitizeText_(raw.reflection || "", "reflection");
    if (!identityConfirmed || !selectedImage || !slideSaved || !reflection) {
      return createErrorPayload_("INCOMPLETE_ACTIVITY", "완료하지 않은 항목이 있습니다.");
    }
  }

  return { success: true };
}

function buildProgressRowObject_(raw, student, existing, now, isNewRow) {
  const object = {};
  const include = (header) => Object.prototype.hasOwnProperty.call(raw, header);
  const write = (header, value) => {
    object[header] = value;
  };

  write("student_id", student.student_id || "");
  write("school_code", student.school_code || LESSON06_ALLOWED_SCHOOL_CODE);
  write("class_name", student.class_name || "");
  write("number", normalizePositiveInteger_(student.number) || "");
  write("name", student.name || "");

  if (include("current_step")) write("current_step", normalizeIntegerInRange_(raw.current_step, 1, 6, 1));
  if (include("identity_confirmed")) write("identity_confirmed", booleanCell_(raw.identity_confirmed));
  if (include("satisfaction")) write("satisfaction", sanitizeText_(raw.satisfaction, "satisfaction"));
  if (include("keep_part")) write("keep_part", sanitizeText_(raw.keep_part, "keep_part"));
  if (include("keep_custom")) write("keep_custom", sanitizeText_(raw.keep_custom, "keep_custom"));
  if (include("edit_part_1")) write("edit_part_1", sanitizeText_(raw.edit_part_1, "edit_part_1"));
  if (include("edit_detail_1")) write("edit_detail_1", sanitizeText_(raw.edit_detail_1, "edit_detail_1"));
  if (include("edit_part_2")) write("edit_part_2", sanitizeText_(raw.edit_part_2, "edit_part_2"));
  if (include("edit_detail_2")) write("edit_detail_2", sanitizeText_(raw.edit_detail_2, "edit_detail_2"));
  if (include("generated_prompt")) write("generated_prompt", sanitizeText_(raw.generated_prompt, "generated_prompt"));
  if (include("edited_prompt")) write("edited_prompt", sanitizeText_(raw.edited_prompt, "edited_prompt"));
  if (include("edit_count")) write("edit_count", normalizeIntegerInRange_(raw.edit_count, 0, 2, 0));
  if (include("first_result_evaluation")) write("first_result_evaluation", sanitizeText_(raw.first_result_evaluation, "first_result_evaluation"));
  if (include("first_keep_evaluation")) write("first_keep_evaluation", sanitizeText_(raw.first_keep_evaluation, "first_keep_evaluation"));
  if (include("second_edit_part")) write("second_edit_part", sanitizeText_(raw.second_edit_part, "second_edit_part"));
  if (include("second_edit_detail")) write("second_edit_detail", sanitizeText_(raw.second_edit_detail, "second_edit_detail"));
  if (include("second_prompt")) write("second_prompt", sanitizeText_(raw.second_prompt, "second_prompt"));
  if (include("selected_image")) write("selected_image", sanitizeText_(raw.selected_image, "selected_image"));
  if (include("selection_reason")) write("selection_reason", sanitizeText_(raw.selection_reason, "selection_reason"));
  if (include("slide_saved")) write("slide_saved", booleanCell_(raw.slide_saved));
  if (include("final_checks")) write("final_checks", sanitizeArrayLike_(raw.final_checks, "final_checks"));
  if (include("reflection")) write("reflection", sanitizeText_(raw.reflection, "reflection"));
  if (include("help_type")) {
    const helpType = sanitizeText_(raw.help_type, "help_type");
    write("help_type", helpType);
    if (helpType) write("help_requested_at", now);
  }

  if (include("completed")) {
    const completed = normalizeBoolean_(raw.completed) === true;
    write("completed", completed ? "TRUE" : "FALSE");
    if (completed) {
      write("current_step", 6);
      write("completed_at", existing.completed_at || now);
    }
  }

  if (isNewRow) write("created_at", now);
  else if (existing.created_at) write("created_at", existing.created_at);
  write("updated_at", now);

  return object;
}

function findStudentById_(rows, studentId) {
  const id = String(studentId || "").trim();
  if (!id) return null;
  const matches = rows.filter((row) => String(row.student_id || "") === id);
  if (matches.length !== 1) return null;
  if (String(matches[0].active || "").toUpperCase() !== "TRUE") return null;
  return matches[0];
}

function findCharacter_(rows, studentId) {
  const id = String(studentId || "").trim();
  if (!id) return {};
  const matches = rows.filter((row) => String(row.student_id || "") === id);
  return matches.length === 1 ? matches[0] : {};
}

function findProgressRows_(rows, studentId) {
  const id = String(studentId || "").trim();
  return rows.filter((row) => String(row.student_id || "") === id);
}

function isMatchingActiveStudent_(row, request) {
  const baseMatch = String(row.school_code || "") === request.school_code &&
    String(row.class_name || "") === request.class_name &&
    String(row.active || "").toUpperCase() === "TRUE";
  if (!baseMatch) return false;
  if (request.name) return normalizeLookupName_(row.name || "") === request.name;
  return Number(row.number) === request.number;
}

function selectStudentResponse_(student, character) {
  const response = {
    student_id: student.student_id || "",
    school_code: student.school_code || "",
    class_name: student.class_name || "",
    number: normalizePositiveInteger_(student.number) || "",
    name: student.name || "",
    display_name: student.display_name || "",
    character_name: character.character_name || "",
    personality: character.personality || "",
    ability: character.ability || "",
    skill_description: character.skill_description || "",
    slides_url: character.slides_url || "",
    image_url: character.image_url || "",
    padlet_url: character.padlet_url || "",
    music_url: character.music_url || "",
    image_status: character.image_status || "",
    music_status: character.music_status || "",
    support_note: character.support_note || ""
  };
  const safeResponse = {};
  LESSON06_RETURN_FIELDS.forEach((field) => {
    safeResponse[field] = response[field] || "";
  });
  return safeResponse;
}

function createProgressSheetIfNeeded(ss) {
  let sheet = ss.getSheetByName(LESSON06_PROGRESS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LESSON06_PROGRESS_SHEET);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, LESSON06_PROGRESS_HEADERS.length).setValues([LESSON06_PROGRESS_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map((value) => String(value || "").trim());
  const missing = LESSON06_PROGRESS_HEADERS.filter((header) => headers.indexOf(header) === -1);
  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
  }
  if (sheet.getFrozenRows() < 1) sheet.setFrozenRows(1);
  return sheet;
}

function getSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values || !values.length) return { headers: [], objects: [] };
  const headers = values[0].map((header) => String(header || "").trim());
  const objects = values.slice(1).map((row, index) => {
    const object = { rowNumber: index + 2 };
    headers.forEach((header, columnIndex) => {
      if (header) object[header] = row[columnIndex];
    });
    return object;
  });
  return { headers: headers, objects: objects };
}

function getRequiredSheet_(ss, name) {
  return ss.getSheetByName(name);
}

function getHeaderMap_(headers) {
  const map = {};
  headers.forEach((header, index) => {
    if (header) map[header] = index;
  });
  return map;
}

function parseRequestBody(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    const text = e.postData.contents;
    try {
      return JSON.parse(text);
    } catch (error) {
      return parseQueryString_(text);
    }
  }
  return e.parameter || {};
}

function parseQueryString_(text) {
  return String(text || "").split("&").reduce((acc, pair) => {
    const parts = pair.split("=");
    if (!parts[0]) return acc;
    acc[decodeURIComponent(parts[0])] = decodeURIComponent(parts.slice(1).join("=") || "");
    return acc;
  }, {});
}

function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function createResponse_(payload, callback) {
  const safeCallback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback || "") ? callback : "";
  if (safeCallback) {
    return ContentService
      .createTextOutput(safeCallback + "(" + JSON.stringify(payload) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return createJsonResponse(payload);
}

function createErrorPayload_(code, message) {
  return { success: false, code: code, message: message };
}

function normalizeClassName_(value) {
  const text = String(value || "").trim();
  const match = text.match(/([12])\s*반/);
  return match ? match[1] + "반" : "";
}

function normalizeLookupName_(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLowerCase();
}

function normalizePositiveInteger_(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

function normalizeIntegerInRange_(value, min, max, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return null;
  return number;
}

function normalizeBoolean_(value) {
  if (value === true) return true;
  if (value === false) return false;
  const text = String(value || "").trim().toLowerCase();
  if (["true", "1", "yes", "y", "완료"].indexOf(text) !== -1) return true;
  if (["false", "0", "no", "n", ""].indexOf(text) !== -1) return false;
  return false;
}

function booleanCell_(value) {
  return normalizeBoolean_(value) ? "TRUE" : "FALSE";
}

function sanitizeKey_(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

function sanitizeText_(value, field) {
  const text = String(value === undefined || value === null ? "" : value).trim();
  const limit = LESSON06_LENGTH_LIMITS[field] || 300;
  if (text.length > limit) {
    throw new Error("Length limit exceeded: " + field);
  }
  return sanitizeCellValue(text);
}

function sanitizeArrayLike_(value, field) {
  let list = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        list = Array.isArray(parsed) ? parsed : [trimmed];
      } catch (error) {
        list = trimmed ? trimmed.split(",") : [];
      }
    } else {
      list = trimmed ? trimmed.split(",") : [];
    }
  }
  return sanitizeText_(list.map((item) => String(item || "").trim()).filter(Boolean).join(", "), field);
}

function sanitizeCellValue(value) {
  const text = String(value === undefined || value === null ? "" : value);
  if (/^[=+\-@]/.test(text)) return "'" + text;
  return text;
}

function validateLengthLimits_(raw) {
  const fields = Object.keys(LESSON06_LENGTH_LIMITS);
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    if (!Object.prototype.hasOwnProperty.call(raw, field)) continue;
    const value = field === "final_checks" ? normalizeArrayLikeText_(raw[field]) : String(raw[field] || "");
    if (value.length > LESSON06_LENGTH_LIMITS[field]) {
      return createErrorPayload_("VALUE_TOO_LONG", "입력한 내용이 너무 깁니다. 조금 줄여서 다시 저장해 주세요.");
    }
  }
  return null;
}

function normalizeArrayLikeText_(value) {
  let list = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        list = Array.isArray(parsed) ? parsed : [trimmed];
      } catch (error) {
        list = trimmed ? trimmed.split(",") : [];
      }
    } else {
      list = trimmed ? trimmed.split(",") : [];
    }
  }
  return list.map((item) => String(item || "").trim()).filter(Boolean).join(", ");
}

function getSetting_(key) {
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

function formatSeoulTime_(date) {
  return Utilities.formatDate(date, LESSON06_TIME_ZONE, "yyyy-MM-dd HH:mm:ss");
}
