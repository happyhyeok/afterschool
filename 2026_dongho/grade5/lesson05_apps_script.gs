// 기존 4회차(loadProfile/saveProfile)를 유지하면서 5회차(saveLesson5)를 추가하는 통합 예시입니다.
//
// [기존 Apps Script에 붙이는 위치]
// 1) 기존 doGet(e)의 action 분기에서 Unknown action 처리보다 위에 다음 한 줄을 추가합니다.
//    else if (p.action === "saveLesson5") result = saveLesson5_(p);
// 2) LESSON5_SHEET, LESSON5_HEADERS, saveLesson5_ 함수를 전역 영역에 추가합니다.
// 3) 저장 후 반드시 "배포 > 배포 관리 > 수정 > 새 버전"으로 웹 앱을 다시 배포합니다.
//    코드를 저장만 하고 새 버전을 배포하지 않으면 계속 Unknown action이 발생합니다.
const SPREADSHEET_ID = "1FYjBdcO7dM38YLeq9eYt_wkWKgRLEwY35w4DdYR3g-4";
const PROFILE_SHEET = "character_profiles";
const LESSON5_SHEET = "lesson5_results";

const PROFILE_HEADERS = [
  "classId", "studentId", "studentName", "characterName",
  "personality", "mainSkill", "sourceLesson", "updatedAt"
];

const LESSON5_HEADERS = [
  "className", "studentId", "studentName", "characterName", "characterPower",
  "characterWeakness", "characterPersonality", "characterColor", "imageUrl",
  "lesson5_characterValue", "lesson5_suspiciousCard", "lesson5_suspiciousReason",
  "lesson5_settingMismatch", "lesson5_linkGuide", "lesson5_rewardGuide",
  "lesson5_aiMediaGuide", "lesson5_chatGuide", "lesson5_characterMessage",
  "lesson5_savedAt", "lesson5_mission1Answer", "lesson5_mission2Answer",
  "lesson5_mission3Answer", "lesson5_mission4Answer", "lesson5_recoveryCode"
];

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  let result;
  try {
    if (p.action === "loadProfile") result = loadProfile_(p);
    else if (p.action === "saveProfile") result = saveProfile_(p);
    else if (p.action === "saveLesson5") result = saveLesson5_(p);
    else result = { ok: false, message: "Unknown action" };
  } catch (error) {
    result = { ok: false, message: String(error && error.message ? error.message : error) };
  }
  return jsonp_(p.callback, result);
}

function loadProfile_(p) {
  const sheet = ensureSheet_(PROFILE_SHEET, PROFILE_HEADERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i -= 1) {
    if (String(rows[i][0]) === String(p.classId) && String(rows[i][1]) === String(p.studentId)) {
      const profile = {};
      PROFILE_HEADERS.forEach((header, index) => profile[header] = rows[i][index] || "");
      return { ok: true, profile: profile };
    }
  }
  return { ok: true, profile: null };
}

function saveProfile_(p) {
  const sheet = ensureSheet_(PROFILE_SHEET, PROFILE_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const values = [
    p.classId || "", numberOrText_(p.studentId), p.studentName || "", p.characterName || "",
    p.personality || p.characterPersonality || "", p.mainSkill || p.characterPower || "",
    p.sourceLesson || "lesson04", new Date()
  ];
  let row = 0;
  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][0]) === String(p.classId) && String(rows[i][1]) === String(p.studentId)) {
      row = i + 1;
      break;
    }
  }
  if (row) sheet.getRange(row, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
  return { ok: true };
}

function saveLesson5_(p) {
  if (!p.classId || !p.studentId || !p.studentName || !p.characterName) {
    return { ok: false, message: "Required fields are missing." };
  }
  if (p.lesson5_recoveryCode !== "SAFE") {
    return { ok: false, message: "Recovery missions are not complete." };
  }
  const sheet = ensureSheet_(LESSON5_SHEET, LESSON5_HEADERS);
  const values = LESSON5_HEADERS.map((header) => {
    if (header === "studentId") return numberOrText_(p.studentId);
    if (header === "lesson5_savedAt") return p.lesson5_savedAt ? new Date(p.lesson5_savedAt) : new Date();
    return p[header] || "";
  });
  sheet.appendRow(values);
  return { ok: true };
}

function ensureSheet_(name, headers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    headers.forEach((header, index) => {
      if (!existingHeaders[index]) sheet.getRange(1, index + 1).setValue(header);
      else if (String(existingHeaders[index]) !== header) {
        throw new Error("Header mismatch in " + name + " column " + (index + 1));
      }
    });
  }
  return sheet;
}

function numberOrText_(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : String(value || "");
}

function jsonp_(callback, data) {
  const safeCallback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback || "") ? callback : "callback";
  return ContentService
    .createTextOutput(safeCallback + "(" + JSON.stringify(data) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
