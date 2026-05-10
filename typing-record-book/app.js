"use strict";

const UI_KEY = "typingRecordBook.sheets.ui.v1";
const CONFIG = window.TYPING_RECORD_CONFIG || {};
const API_URL = String(CONFIG.APPS_SCRIPT_URL || "").trim();
const DEFAULT_YEAR = String(CONFIG.DEFAULT_YEAR || new Date().getFullYear());
const REQUEST_TIMEOUT_MS = Number(CONFIG.REQUEST_TIMEOUT_MS || 12000);
const URL_PARAMS = new URLSearchParams(window.location.search);
const FIXED_SCHOOL = String(URL_PARAMS.get("school") || CONFIG.FIXED_SCHOOL || "").trim();
const FIXED_YEAR = String(URL_PARAMS.get("year") || CONFIG.FIXED_YEAR || DEFAULT_YEAR).trim();

const POSITION_STAGES = [
  "기본자리",
  "왼손윗자리",
  "오른손윗자리",
  "왼손아랫자리",
  "오른손아래자리",
  "숫자자리",
  "전체자리",
];

const PRACTICE_GROUPS = [
  ...Array.from({ length: 3 }, (_, index) => ({
    title: `자리연습 ${index + 1}회차`,
    subtitle: "기본자리부터 전체자리까지",
    entries: POSITION_STAGES.map((stage) => makeEntry(stage, index + 1)),
  })),
  {
    title: "낱말연습",
    subtitle: "10회차",
    entries: Array.from({ length: 10 }, (_, index) => makeEntry("낱말연습", index + 1)),
  },
  {
    title: "장문연습",
    subtitle: "10회차",
    entries: Array.from({ length: 10 }, (_, index) => makeEntry("장문연습", index + 1)),
  },
];

const ALL_ENTRIES = PRACTICE_GROUPS.flatMap((group) => group.entries);
const TOTAL_ENTRIES = ALL_ENTRIES.length;

const elements = {
  syncBadge: document.querySelector("#syncBadge"),
  syncText: document.querySelector("#syncText"),
  setupPanel: document.querySelector("#setupPanel"),
  selectStep: document.querySelector("#selectStep"),
  recordStep: document.querySelector("#recordStep"),
  fixedSchoolNotice: document.querySelector("#fixedSchoolNotice"),
  fixedSchoolName: document.querySelector("#fixedSchoolName"),
  yearField: document.querySelector("#yearField"),
  schoolField: document.querySelector("#schoolField"),
  yearSelect: document.querySelector("#yearSelect"),
  schoolSelect: document.querySelector("#schoolSelect"),
  gradeSelect: document.querySelector("#gradeSelect"),
  studentSelect: document.querySelector("#studentSelect"),
  refreshBtn: document.querySelector("#refreshBtn"),
  startRecordsBtn: document.querySelector("#startRecordsBtn"),
  backToSelectBtn: document.querySelector("#backToSelectBtn"),
  studentStatus: document.querySelector("#studentStatus"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  recordStatus: document.querySelector("#recordStatus"),
  entryGrid: document.querySelector("#entryGrid"),
  toast: document.querySelector("#toast"),
};

let uiState = loadUiState();
let students = [];
let records = {};
let selectedStudent = null;
let currentStep = "select";
let saveTimers = new Map();
let toastTimer = 0;

initialise();

function initialise() {
  bindEvents();
  applyFixedSchoolUi();
  renderEmptyGrid();

  if (!API_URL) {
    setSyncState("error", "연동 주소가 비어 있습니다");
    elements.setupPanel.hidden = false;
    setSelectorsDisabled(true);
    return;
  }

  loadBootstrap();
}

function makeEntry(stage, attempt) {
  return {
    id: `${slug(stage)}-${attempt}`,
    stage,
    attempt,
  };
}

function slug(value) {
  const map = {
    기본자리: "base",
    왼손윗자리: "left-top",
    왼손아랫자리: "left-bottom",
    오른손윗자리: "right-top",
    오른손아래자리: "right-bottom",
    숫자자리: "number",
    전체자리: "all",
    낱말연습: "word",
    장문연습: "long",
  };
  return map[value] || value;
}

function bindEvents() {
  elements.refreshBtn.addEventListener("click", loadBootstrap);

  for (const select of [elements.yearSelect, elements.schoolSelect, elements.gradeSelect]) {
    select.addEventListener("change", () => {
      saveSelectionFromControls(false);
      renderSelectors();
      prepareSelection();
    });
  }

  elements.studentSelect.addEventListener("change", () => {
    saveSelectionFromControls(true);
    prepareSelection();
  });

  elements.startRecordsBtn.addEventListener("click", startRecordStep);
  elements.backToSelectBtn.addEventListener("click", showSelectStep);
  elements.entryGrid.addEventListener("focusin", handleDurationFocusIn);
  elements.entryGrid.addEventListener("click", handleDurationClick);
  elements.entryGrid.addEventListener("keydown", handleDurationKeydown);
  elements.entryGrid.addEventListener("paste", handleDurationPaste);
  elements.entryGrid.addEventListener("input", handleEntryInput);
  elements.entryGrid.addEventListener("change", handleEntryChange);
  elements.entryGrid.addEventListener("click", handleEntryClick);
}

async function loadBootstrap() {
  setSyncState("loading", "학생 명단을 불러오는 중입니다");
  setSelectorsDisabled(true);

  try {
    const response = await api("bootstrap");
    students = normalizeStudents(response.data?.students || []);
    elements.setupPanel.hidden = true;
    renderSelectors();
    setSelectorsDisabled(false);
    prepareSelection();
    setSyncState("ready", "Google Sheets에 연결되었습니다");
  } catch (error) {
    setSyncState("error", "Google Sheets 연결을 확인해주세요");
    showToast(error.message || "학생 명단을 불러오지 못했습니다.");
    setSelectorsDisabled(false);
  }
}

function normalizeStudents(rows) {
  return rows
    .map((row) => ({
      year: String(row.year || DEFAULT_YEAR).trim(),
      school: String(row.school || "").trim(),
      grade: String(row.grade || "").trim(),
      studentId: String(row.studentId || "").trim(),
      number: String(row.number || "").trim(),
      name: String(row.name || "").trim(),
    }))
    .filter((row) => row.year && row.school && row.grade && row.studentId && row.name)
    .sort(sortStudents);
}

function renderSelectors() {
  const years = unique(students.map((student) => student.year)).sort((a, b) => Number(b) - Number(a));
  const selectedYear = FIXED_SCHOOL ? pickValue(FIXED_YEAR, years, FIXED_YEAR) : pickValue(uiState.year, years, DEFAULT_YEAR);
  fillSelect(elements.yearSelect, years.length ? years : [DEFAULT_YEAR], selectedYear, "연도 없음");

  const year = elements.yearSelect.value;
  const schools = unique(students.filter((student) => student.year === year).map((student) => student.school));
  const selectedSchool = FIXED_SCHOOL ? pickValue(FIXED_SCHOOL, schools, FIXED_SCHOOL) : pickExactValue(uiState.school, schools);
  fillSelect(elements.schoolSelect, schools.length ? schools : [FIXED_SCHOOL].filter(Boolean), selectedSchool, "학교 선택", (value) => value, {
    placeholder: !FIXED_SCHOOL,
  });

  const school = elements.schoolSelect.value;
  const grades = unique(
    students
      .filter((student) => student.year === year && student.school === school)
      .map((student) => student.grade),
  ).sort((a, b) => Number(a) - Number(b));
  const selectedGrade = pickExactValue(uiState.grade, grades);
  fillSelect(elements.gradeSelect, grades, selectedGrade, "학년 선택", (value) => `${value}학년`, {
    placeholder: true,
  });

  const grade = elements.gradeSelect.value;
  const visibleStudents = students.filter(
    (student) => student.year === year && student.school === school && student.grade === grade,
  );
  const selectedStudentId = pickExactValue(
    uiState.studentId,
    visibleStudents.map((student) => student.studentId),
  );
  fillSelect(
    elements.studentSelect,
    visibleStudents.map((student) => student.studentId),
    selectedStudentId,
    "이름 선택",
    (studentId) => {
      const student = visibleStudents.find((item) => item.studentId === studentId);
      return student?.number ? `${student.number}번 ${student.name}` : student?.name || studentId;
    },
    { placeholder: true },
  );

  saveSelectionFromControls(true);
}

function prepareSelection() {
  selectedStudent = getSelectedStudent();
  records = {};
  updateStudentStatus();
  renderEmptyGrid();
  updateProgress();
  showSelectStep();
}

function applyFixedSchoolUi() {
  if (!FIXED_SCHOOL) {
    elements.fixedSchoolNotice.hidden = true;
    elements.yearField.hidden = false;
    elements.schoolField.hidden = false;
    return;
  }

  elements.fixedSchoolName.textContent = `${FIXED_SCHOOL} · ${FIXED_YEAR}년`;
  document.body.classList.add("fixed-school-link");
  elements.fixedSchoolNotice.hidden = false;
  elements.yearField.hidden = true;
  elements.schoolField.hidden = true;
}

function fillSelect(select, values, selectedValue, emptyLabel, labeler = (value) => value, options = {}) {
  select.innerHTML = "";

  if (options.placeholder || !values.length) {
    select.append(new Option(emptyLabel, ""));
  }

  for (const value of values) {
    select.append(new Option(labeler(value), value));
  }

  select.value = values.includes(selectedValue) ? selectedValue : "";
}

function pickValue(value, candidates, fallback) {
  if (value && candidates.includes(value)) {
    return value;
  }
  if (fallback && candidates.includes(fallback)) {
    return fallback;
  }
  return candidates[0] || fallback || "";
}

function pickExactValue(value, candidates) {
  return value && candidates.includes(value) ? value : "";
}

function saveSelectionFromControls(includeStudent) {
  uiState = {
    year: elements.yearSelect.value,
    school: FIXED_SCHOOL ? "" : elements.schoolSelect.value,
    grade: elements.gradeSelect.value,
    studentId: includeStudent ? elements.studentSelect.value : "",
  };
  localStorage.setItem(UI_KEY, JSON.stringify(uiState));
}

async function loadSelectedStudentRecords() {
  selectedStudent = getSelectedStudent();
  records = {};
  renderEntries();

  if (!selectedStudent) {
    setSyncState(API_URL ? "ready" : "error", API_URL ? "학생을 선택해주세요" : "연동 주소가 비어 있습니다");
    return;
  }

  setSyncState("loading", "기록을 불러오는 중입니다");
  try {
    const response = await api("records", {
      year: selectedStudent.year,
      school: selectedStudent.school,
      grade: selectedStudent.grade,
      studentId: selectedStudent.studentId,
    });
    records = response.data?.records || {};
    renderEntries();
    setSyncState("ready", "기록이 동기화되었습니다");
  } catch (error) {
    setSyncState("error", "기록을 불러오지 못했습니다");
    showToast(error.message || "기록을 불러오지 못했습니다.");
  }
}

async function startRecordStep() {
  selectedStudent = getSelectedStudent();
  if (!selectedStudent) {
    showToast("학교, 학년, 이름을 선택해주세요.");
    return;
  }

  currentStep = "record";
  elements.selectStep.hidden = true;
  elements.recordStep.hidden = false;
  await loadSelectedStudentRecords();
}

function showSelectStep() {
  currentStep = "select";
  elements.selectStep.hidden = false;
  elements.recordStep.hidden = true;
}

function getSelectedStudent() {
  const year = elements.yearSelect.value;
  const school = FIXED_SCHOOL || elements.schoolSelect.value;
  const grade = elements.gradeSelect.value;
  const studentId = elements.studentSelect.value;
  return (
    students.find(
      (student) =>
        student.year === year &&
        student.school === school &&
        student.grade === grade &&
        student.studentId === studentId,
    ) || null
  );
}

function renderEntries() {
  elements.entryGrid.innerHTML = "";
  updateStudentStatus();

  if (!selectedStudent) {
    renderEmptyGrid();
    updateProgress();
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const group of PRACTICE_GROUPS) {
    const section = document.createElement("section");
    section.className = "stage-section";

    const title = document.createElement("div");
    title.className = "stage-title";
    const heading = document.createElement("h3");
    heading.textContent = group.title;
    const subtitle = document.createElement("span");
    subtitle.textContent = group.subtitle;
    title.append(heading, subtitle);
    section.append(title);

    for (const entry of group.entries) {
      section.append(createEntryRow(entry, records[entry.id] || {}));
    }

    fragment.append(section);
  }

  elements.entryGrid.append(fragment);
  updateProgress();
}

function renderEmptyGrid() {
  elements.entryGrid.innerHTML = `<div class="empty-state">학교, 학년, 이름을 선택하면 기록표가 나타납니다.</div>`;
}

function createEntryRow(entry, record) {
  const row = document.createElement("div");
  row.className = "entry-row";
  row.dataset.entryId = entry.id;

  const nameCell = document.createElement("div");
  nameCell.className = "entry-name";
  const badge = document.createElement("span");
  badge.className = "attempt-badge";
  badge.textContent = `${entry.attempt}회차`;
  const stageName = document.createElement("span");
  stageName.className = "stage-name";
  stageName.textContent = entry.stage;
  nameCell.append(badge, stageName);

  const datetimeLabel = makeLabeledInput("날짜/시간", "datetime-local", "datetime", record.datetime || "");
  const accuracyLabel = makeLabeledInput("정확도 %", "number", "accuracy", record.accuracy || "");
  const durationLabel = makeLabeledInput("소요시간", "text", "duration", record.duration || "");
  const actions = document.createElement("div");
  actions.className = "row-actions";

  accuracyLabel.querySelector("input").setAttribute("min", "0");
  accuracyLabel.querySelector("input").setAttribute("max", "100");
  accuracyLabel.querySelector("input").setAttribute("step", "0.01");
  accuracyLabel.querySelector("input").placeholder = "99.01";
  durationLabel.querySelector("input").placeholder = "01:05";
  durationLabel.querySelector("input").inputMode = "numeric";
  durationLabel.querySelector("input").setAttribute("autocomplete", "off");
  durationLabel.querySelector("input").setAttribute("maxlength", "5");

  const nowButton = document.createElement("button");
  nowButton.type = "button";
  nowButton.dataset.action = "set-now";
  nowButton.textContent = "지금";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.dataset.action = "save-entry";
  saveButton.textContent = "저장";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.dataset.action = "clear-entry";
  clearButton.className = "clear-entry";
  clearButton.textContent = "비움";

  actions.append(nowButton, saveButton, clearButton);
  row.append(nameCell, datetimeLabel, accuracyLabel, durationLabel, actions);
  updateRowState(row, record);
  return row;
}

function makeLabeledInput(labelText, type, field, value) {
  const label = document.createElement("label");
  const span = document.createElement("span");
  const input = document.createElement("input");
  span.textContent = labelText;
  input.type = type;
  input.dataset.field = field;
  input.value = value;
  input.disabled = !selectedStudent;
  label.append(span, input);
  return label;
}

function handleEntryInput(event) {
  const input = event.target.closest("[data-field]");
  if (!input || !selectedStudent) {
    return;
  }

  const row = input.closest("[data-entry-id]");
  const record = updateRecordFromRow(row);
  validateInput(input);
  updateRowState(row, record);
  updateProgress();
}

function handleEntryChange(event) {
  const input = event.target.closest("[data-field]");
  if (!input || !selectedStudent) {
    return;
  }

  if (input.dataset.field === "duration" && input.value) {
    const normalized = normalizeDuration(input.value);
    if (normalized) {
      input.value = normalized;
    }
  }

  if (input.dataset.field === "accuracy" && input.value) {
    const normalized = normalizeAccuracy(input.value);
    if (normalized !== "") {
      input.value = normalized;
    }
  }

  const row = input.closest("[data-entry-id]");
  const record = updateRecordFromRow(row);
  updateRowState(row, record);
  updateProgress();
  scheduleSave(row.dataset.entryId);
}

function handleEntryClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || !selectedStudent) {
    return;
  }

  const row = button.closest("[data-entry-id]");
  const entryId = row.dataset.entryId;

  if (button.dataset.action === "set-now") {
    row.querySelector('[data-field="datetime"]').value = toDatetimeLocalValue(new Date());
    const record = updateRecordFromRow(row);
    updateRowState(row, record);
    updateProgress();
    scheduleSave(entryId, 0);
  }

  if (button.dataset.action === "save-entry") {
    const record = updateRecordFromRow(row);
    updateRowState(row, record);
    saveRecord(entryId);
  }

  if (button.dataset.action === "clear-entry") {
    clearRecord(entryId, row);
  }
}

function handleDurationFocusIn(event) {
  const input = getDurationInput(event.target);
  if (!input) {
    return;
  }

  input.dataset.durationPart = input.dataset.durationPart || "minute";
  input.dataset.secondBuffer = "";
  window.setTimeout(() => selectDurationPart(input, input.dataset.durationPart), 0);
}

function handleDurationClick(event) {
  const input = getDurationInput(event.target);
  if (!input) {
    return;
  }

  window.setTimeout(() => {
    const part = (input.selectionStart || 0) <= 2 ? "minute" : "second";
    selectDurationPart(input, part);
  }, 0);
}

function handleDurationKeydown(event) {
  const input = getDurationInput(event.target);
  if (!input) {
    return;
  }

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    applyDurationDigit(input, event.key);
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    clearDurationPart(input);
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    selectDurationPart(input, "minute");
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    selectDurationPart(input, "second");
    return;
  }

  if (event.key === "Tab" || event.key === "Enter" || event.key === "Escape") {
    return;
  }

  if (event.key.length === 1) {
    event.preventDefault();
  }
}

function handleDurationPaste(event) {
  const input = getDurationInput(event.target);
  if (!input) {
    return;
  }

  event.preventDefault();
  const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
  if (!digits) {
    return;
  }

  input.value = formatDurationDigits(digits);
  input.dataset.durationPart = "second";
  input.dataset.secondBuffer = "";
  commitDurationInput(input);
  selectDurationPart(input, "second");
}

function getDurationInput(target) {
  const input = target.closest?.('[data-field="duration"]');
  return input || null;
}

function applyDurationDigit(input, digit) {
  const parts = readDurationParts(input);
  const part = input.dataset.durationPart || "minute";

  if (part === "minute") {
    parts.minutes = `0${digit}`;
    input.dataset.secondBuffer = "";
    writeDurationParts(input, parts);
    commitDurationInput(input);
    selectDurationPart(input, "second");
    return;
  }

  const buffer = input.dataset.secondBuffer || "";
  if (!buffer) {
    parts.seconds = `0${digit}`;
    input.dataset.secondBuffer = digit;
  } else {
    const candidate = `${buffer}${digit}`;
    if (Number(candidate) < 60) {
      parts.seconds = candidate;
      input.dataset.secondBuffer = "";
    } else {
      parts.seconds = `0${digit}`;
      input.dataset.secondBuffer = digit;
    }
  }

  writeDurationParts(input, parts);
  commitDurationInput(input);
  selectDurationPart(input, "second");
}

function clearDurationPart(input) {
  const parts = readDurationParts(input);
  const part = input.dataset.durationPart || "minute";

  if (part === "second" && parts.seconds !== "00") {
    parts.seconds = "00";
    input.dataset.secondBuffer = "";
    writeDurationParts(input, parts);
    commitDurationInput(input);
    selectDurationPart(input, "second");
    return;
  }

  if (part === "second") {
    input.dataset.secondBuffer = "";
    selectDurationPart(input, "minute");
    return;
  }

  input.value = "";
  input.dataset.secondBuffer = "";
  commitDurationInput(input);
}

function readDurationParts(input) {
  const normalized = normalizeDuration(input.value);
  if (!normalized) {
    return { minutes: "00", seconds: "00" };
  }

  const [minutes, seconds] = normalized.split(":");
  return {
    minutes: minutes.padStart(2, "0").slice(-2),
    seconds: seconds.padStart(2, "0").slice(-2),
  };
}

function writeDurationParts(input, parts) {
  input.value = `${parts.minutes}:${parts.seconds}`;
}

function selectDurationPart(input, part) {
  input.dataset.durationPart = part;
  const start = part === "minute" ? 0 : 3;
  const end = part === "minute" ? 2 : 5;
  input.setSelectionRange(start, end);
}

function commitDurationInput(input) {
  input.dispatchEvent(new Event("input", { bubbles: true }));
  const row = input.closest("[data-entry-id]");
  if (row) {
    scheduleSave(row.dataset.entryId);
  }
}

function formatDurationDigits(digits) {
  const padded = digits.padStart(4, "0");
  const minutes = padded.slice(0, -2).slice(-2);
  const seconds = Math.min(Number(padded.slice(-2)), 59);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateRecordFromRow(row) {
  const entryId = row.dataset.entryId;
  const record = {
    datetime: row.querySelector('[data-field="datetime"]').value.trim(),
    accuracy: row.querySelector('[data-field="accuracy"]').value.trim(),
    duration: row.querySelector('[data-field="duration"]').value.trim(),
  };
  records[entryId] = record;
  return record;
}

function scheduleSave(entryId, delay = 650) {
  window.clearTimeout(saveTimers.get(entryId));
  saveTimers.set(
    entryId,
    window.setTimeout(() => {
      saveRecord(entryId);
    }, delay),
  );
}

async function saveRecord(entryId) {
  if (!selectedStudent || !entryId) {
    return;
  }

  const entry = ALL_ENTRIES.find((item) => item.id === entryId);
  const record = records[entryId] || {};
  const row = elements.entryGrid.querySelector(`[data-entry-id="${entryId}"]`);
  if (row && !validateRow(row)) {
    showToast("정확도와 소요시간 형식을 확인해주세요.");
    return;
  }

  if (!record.datetime && (record.accuracy || record.duration)) {
    record.datetime = toDatetimeLocalValue(new Date());
    const datetimeInput = row?.querySelector('[data-field="datetime"]');
    if (datetimeInput) {
      datetimeInput.value = record.datetime;
    }
    updateProgress();
  }

  row?.classList.add("saving");
  setSyncState("loading", "기록 저장 중입니다");

  try {
    await api("saveRecord", {
      payload: {
        ...selectedStudent,
        entryId,
        stage: entry.stage,
        attempt: entry.attempt,
        datetime: record.datetime || "",
        accuracy: normalizeAccuracy(record.accuracy),
        duration: normalizeDuration(record.duration) || record.duration || "",
      },
    });
    row?.classList.remove("save-error");
    row?.classList.add("saved");
    updateRowState(row, records[entryId]);
    updateProgress();
    setSyncState("ready", "저장되었습니다");
  } catch (error) {
    row?.classList.add("save-error");
    setSyncState("error", "저장에 실패했습니다");
    showToast(error.message || "기록을 저장하지 못했습니다.");
  } finally {
    row?.classList.remove("saving");
    window.setTimeout(() => row?.classList.remove("saved"), 900);
  }
}

async function clearRecord(entryId, row) {
  const confirmed = window.confirm("이 회차 기록을 비울까요?");
  if (!confirmed) {
    return;
  }

  delete records[entryId];
  for (const input of row.querySelectorAll("[data-field]")) {
    input.value = "";
    input.classList.remove("invalid");
  }
  updateRowState(row, {});
  updateProgress();

  setSyncState("loading", "기록을 비우는 중입니다");
  try {
    await api("clearRecord", {
      year: selectedStudent.year,
      school: selectedStudent.school,
      grade: selectedStudent.grade,
      studentId: selectedStudent.studentId,
      entryId,
    });
    setSyncState("ready", "기록을 비웠습니다");
  } catch (error) {
    row.classList.add("save-error");
    setSyncState("error", "기록을 비우지 못했습니다");
    showToast(error.message || "기록을 비우지 못했습니다.");
  }
}

function validateRow(row) {
  return [...row.querySelectorAll("[data-field]")].every(validateInput);
}

function validateInput(input) {
  const field = input.dataset.field;
  let valid = true;

  if (field === "accuracy" && input.value) {
    const number = Number(input.value);
    valid = Number.isFinite(number) && number >= 0 && number <= 100;
  }

  if (field === "duration" && input.value) {
    valid = Boolean(normalizeDuration(input.value));
  }

  input.classList.toggle("invalid", !valid);
  return valid;
}

function updateRowState(row, record) {
  if (!row) {
    return;
  }

  const complete = isRecordComplete(record);
  const invalid = [...row.querySelectorAll("[data-field]")].some((input) => !validateInput(input));
  row.classList.toggle("complete", complete);
  row.classList.toggle("invalid-row", invalid);
}

function isRecordComplete(record) {
  if (!record) {
    return false;
  }

  const accuracy = Number(record.accuracy);
  return Boolean(
    record.datetime &&
      record.duration &&
      normalizeDuration(record.duration) &&
      Number.isFinite(accuracy) &&
      accuracy >= 0 &&
      accuracy <= 100,
  );
}

function updateProgress() {
  const completed = ALL_ENTRIES.filter((entry) => isRecordComplete(records[entry.id])).length;
  const percent = TOTAL_ENTRIES ? Math.round((completed / TOTAL_ENTRIES) * 100) : 0;
  elements.progressText.textContent = `${completed} / ${TOTAL_ENTRIES}`;
  elements.progressBar.style.width = `${percent}%`;
}

function updateStudentStatus() {
  if (!selectedStudent) {
    elements.studentStatus.textContent = "학생을 선택해주세요";
    elements.recordStatus.textContent = "학교, 학년, 이름을 선택하면 기록표가 나타납니다.";
    return;
  }

  const name = selectedStudent.number ? `${selectedStudent.number}번 ${selectedStudent.name}` : selectedStudent.name;
  elements.studentStatus.textContent = `${selectedStudent.year}년 ${selectedStudent.school} ${selectedStudent.grade}학년 · ${name}`;
  elements.recordStatus.textContent = name;
}

function setSelectorsDisabled(disabled) {
  for (const element of [
    elements.yearSelect,
    elements.schoolSelect,
    elements.gradeSelect,
    elements.studentSelect,
    elements.refreshBtn,
  ]) {
    element.disabled = disabled;
  }
}

function setSyncState(state, text) {
  elements.syncBadge.className = `sync-badge ${state}`;
  elements.syncBadge.textContent =
    {
      loading: "동기화 중",
      ready: "연결됨",
      error: "확인 필요",
    }[state] || "상태";
  elements.syncText.textContent = text;
}

function api(action, params = {}) {
  return new Promise((resolve, reject) => {
    if (!API_URL) {
      reject(new Error("Apps Script 주소가 설정되지 않았습니다."));
      return;
    }

    const callbackName = `__typingRecordBook_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("요청 시간이 초과되었습니다."));
    }, REQUEST_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (response) => {
      cleanup();
      if (response?.ok) {
        resolve(response);
      } else {
        reject(new Error(response?.error || "요청을 처리하지 못했습니다."));
      }
    };

    const url = new URL(API_URL);
    url.searchParams.set("action", action);
    url.searchParams.set("callback", callbackName);

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      url.searchParams.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }

    script.onerror = () => {
      cleanup();
      reject(new Error("Apps Script 응답을 읽지 못했습니다."));
    };
    script.src = url.toString();
    document.head.append(script);
  });
}

function normalizeAccuracy(value) {
  if (!String(value).trim()) {
    return "";
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100) {
    return "";
  }
  return number.toFixed(2);
}

function normalizeDuration(value) {
  const seconds = durationToSeconds(value);
  return seconds === null ? "" : secondsToDuration(seconds);
}

function durationToSeconds(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const parts = text.split(":").map((part) => part.trim());
  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (Number.isInteger(minutes) && Number.isInteger(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
      return minutes * 60 + seconds;
    }
  }

  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2]);
    if (
      Number.isInteger(hours) &&
      Number.isInteger(minutes) &&
      Number.isInteger(seconds) &&
      hours >= 0 &&
      minutes >= 0 &&
      minutes < 60 &&
      seconds >= 0 &&
      seconds < 60
    ) {
      return hours * 3600 + minutes * 60 + seconds;
    }
  }

  return null;
}

function secondsToDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function toDatetimeLocalValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function sortStudents(a, b) {
  if (a.year !== b.year) {
    return Number(b.year) - Number(a.year);
  }
  if (a.school !== b.school) {
    return a.school.localeCompare(b.school, "ko-KR");
  }
  if (a.grade !== b.grade) {
    return Number(a.grade) - Number(b.grade);
  }
  const aNumber = Number(a.number);
  const bNumber = Number(b.number);
  if (Number.isFinite(aNumber) && Number.isFinite(bNumber) && aNumber !== bNumber) {
    return aNumber - bNumber;
  }
  return a.name.localeCompare(b.name, "ko-KR");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function loadUiState() {
  try {
    const raw = localStorage.getItem(UI_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return FIXED_SCHOOL ? { year: FIXED_YEAR } : { year: parsed.year || "" };
  } catch (error) {
    return {};
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}
