const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPbD6lnhX-tn8WYW9xIvs3EvCUPQeJHhEV_wWqdEP6ihAdvt0OlbCey0lQWQJWpeaU/exec";
const STUDENT_LIST_API_URL = "https://script.google.com/macros/s/AKfycbxPbD6lnhX-tn8WYW9xIvs3EvCUPQeJHhEV_wWqdEP6ihAdvt0OlbCey0lQWQJWpeaU/exec";

const STORAGE_KEY = "delightexEduArtemisStudent.v1";

const LESSON_TITLES = {
  "1": "AI로 창조하는 달의 뒷면과 탐사 대원",
  "2": "AI 버디에게 듣는 우주의 신비 - 자전과 공전",
  "3": "AI 생성 기술로 완성하는 루나 게이트웨이",
  "4": "AI 우주 가이드와 함께하는 정거장 투어"
};

const BUDDY_FIELDS = ["name", "role", "specialty", "personality", "tone"];

const CHECKLIST_ITEMS = [
  ["moon360", "달 뒷면 360° 배경을 적용했어요."],
  ["lookAround", "3D 공간을 돌려 주변을 확인했어요."],
  ["character", "탐사 캐릭터를 추가했어요."],
  ["equipment", "탐사 장비를 추가했어요."],
  ["scale", "캐릭터 위치와 크기를 조절했어요."],
  ["aiOn", "AI Buddy 기능을 켰어요."],
  ["buddyName", "AI Buddy 이름을 정했어요."],
  ["buddyRole", "AI Buddy 역할을 정했어요."],
  ["buddySpecialty", "AI Buddy 전문 분야를 정했어요."],
  ["buddyStyle", "AI Buddy 성격과 말투를 정했어요."],
  ["twoQuestions", "AI Buddy에게 질문을 2개 이상 했어요."],
  ["factGuess", "답변을 사실과 추측으로 나누어 보았어요."],
  ["savedProject", "프로젝트를 저장했어요."]
];

const REFLECTION_FIELDS = [
  "scienceFact",
  "buddyStrength",
  "usefulQuestion",
  "nextQuestion",
  "difficulty"
];

const PLACEHOLDER_URL = "여기에_웹앱_URL_입력";
const STUDENT_API_PLACEHOLDER_URL = "여기에_학생목록_API_URL_입력";

let storageEnabled = true;
let state = createInitialState();
let saveTimer = null;
let studentNameList = [];
let selectedStudentAccount = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
  storageEnabled = checkStorage();
  document.getElementById("storageWarning").hidden = storageEnabled;
  state = loadState();
  ensureLesson(state.currentLesson);
  renderQuestionRecords();
  renderChecklist();
  renderLessonSummary();
  bindEvents();
  fillFormFromState();
  updateBuddyPrompt();
  updateChecklistProgress();
  updateOverallProgress();
  updateSubmitStatus();
  observeSections();
  saveState();
  loadStudentList();
}

function createInitialState() {
  return {
    version: 1,
    studentInfo: {
      studentId: "",
      studentName: "",
      loginId: "",
      className: "",
      grade: "",
      school: ""
    },
    currentLesson: "1",
    lessons: {
      "1": createEmptyLesson("1")
    }
  };
}

function createEmptyLesson(lessonNumber) {
  return {
    lessonNumber,
    lessonTitle: LESSON_TITLES[lessonNumber] || "",
    startedAt: new Date().toISOString(),
    completedAt: "",
    submittedAt: "",
    submissionStatus: "아직 제출하지 않았어요.",
    buddy: {
      name: "",
      role: "",
      specialty: "",
      personality: "",
      tone: "",
      source: {}
    },
    buddyPrompt: "",
    activityData: {
      moonChecks: {
        front: false,
        back: false,
        sides: false,
        seam: false
      },
      characterChecks: {
        visible: false,
        surface: false,
        overlap: false
      },
      selectedQuestion: "",
      directQuestion: "",
      questionRecords: [
        createEmptyQuestionRecord(),
        createEmptyQuestionRecord()
      ]
    },
    checklistData: CHECKLIST_ITEMS.map(([id, label]) => ({
      id,
      label,
      checked: false,
      evidence: ""
    })),
    reflectionData: {
      scienceFact: "",
      buddyStrength: "",
      usefulQuestion: "",
      nextQuestion: "",
      difficulty: ""
    }
  };
}

function createEmptyQuestionRecord() {
  return {
    question: "",
    answer: "",
    imagination: ""
  };
}

function checkStorage() {
  try {
    const key = "__delightex_storage_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

function loadState() {
  if (!storageEnabled) {
    return createInitialState();
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createInitialState();
    }
    const parsed = JSON.parse(saved);
    return normalizeState(parsed);
  } catch (error) {
    return createInitialState();
  }
}

function normalizeState(saved) {
  const base = createInitialState();
  const savedStudentInfo = saved.studentInfo || {};
  const loginId = savedStudentInfo.loginId || savedStudentInfo.studentId || "";
  const merged = {
    ...base,
    ...saved,
    studentInfo: {
      studentId: loginId,
      loginId,
      studentName: savedStudentInfo.studentName || "",
      className: "",
      grade: "",
      school: ""
    },
    lessons: {
      ...(saved.lessons || {})
    }
  };
  delete merged.studentInfo.password;
  if (!merged.currentLesson) {
    merged.currentLesson = "1";
  }
  ensureLessonOnObject(merged, merged.currentLesson);
  return merged;
}

function ensureLesson(lessonNumber) {
  ensureLessonOnObject(state, lessonNumber);
}

function ensureLessonOnObject(targetState, lessonNumber) {
  if (!targetState.lessons) {
    targetState.lessons = {};
  }
  if (!targetState.lessons[lessonNumber]) {
    targetState.lessons[lessonNumber] = createEmptyLesson(lessonNumber);
  }
  const lesson = targetState.lessons[lessonNumber];
  lesson.lessonNumber = lessonNumber;
  lesson.lessonTitle = LESSON_TITLES[lessonNumber] || lesson.lessonTitle || "";
  lesson.buddy = {
    ...createEmptyLesson(lessonNumber).buddy,
    ...(lesson.buddy || {}),
    source: {
      ...((lesson.buddy && lesson.buddy.source) || {})
    }
  };
  const savedCharacterChecks = (lesson.activityData && lesson.activityData.characterChecks) || {};
  lesson.activityData = {
    ...createEmptyLesson(lessonNumber).activityData,
    ...(lesson.activityData || {}),
    moonChecks: {
      ...createEmptyLesson(lessonNumber).activityData.moonChecks,
      ...((lesson.activityData && lesson.activityData.moonChecks) || {})
    },
    characterChecks: {
      visible: Boolean(savedCharacterChecks.visible),
      surface: Boolean(savedCharacterChecks.surface),
      overlap: Boolean(savedCharacterChecks.overlap)
    },
    questionRecords: normalizeQuestionRecords(lesson.activityData && lesson.activityData.questionRecords)
  };
  lesson.checklistData = normalizeChecklist(lesson.checklistData);
  lesson.reflectionData = {
    ...createEmptyLesson(lessonNumber).reflectionData,
    ...(lesson.reflectionData || {})
  };
}

function normalizeQuestionRecords(records) {
  const next = Array.isArray(records) ? records.slice(0, 2) : [];
  while (next.length < 2) {
    next.push(createEmptyQuestionRecord());
  }
  return next.map((record) => ({
    question: (record && record.question) || "",
    answer: (record && record.answer) || "",
    imagination: (record && record.imagination) || ""
  }));
}

function normalizeChecklist(items) {
  const saved = Array.isArray(items) ? items : [];
  return CHECKLIST_ITEMS.map(([id, label]) => {
    const match = saved.find((item) => item.id === id) || {};
    return {
      id,
      label,
      checked: Boolean(match.checked),
      evidence: match.evidence || ""
    };
  });
}

function currentLesson() {
  ensureLesson(state.currentLesson);
  return state.lessons[state.currentLesson];
}

function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener("click", handler);
  }
}

function bindEvents() {
  document.getElementById("studentSearch").addEventListener("input", renderFilteredStudentList);
  bindClick("copyLoginIdButton", copyLoginId);
  bindClick("copyPasswordButton", copyPassword);
  document.getElementById("lessonNumber").addEventListener("change", handleLessonChange);
  bindClick("resetLessonButton", resetCurrentLesson);
  bindClick("copyPromptButton", copyBuddyPrompt);
  bindClick("resetBuddyButton", resetBuddy);
  bindClick("copySelectedQuestionButton", copySelectedQuestion);
  bindClick("copyDirectQuestionButton", copyDirectQuestion);
  bindClick("resetChecklistButton", resetChecklist);
  bindClick("copyChecklistButton", copyChecklist);
  bindClick("resetReflectionButton", resetReflection);
  bindClick("submitButton", submitRecord);

  document.querySelectorAll("[data-save]").forEach((element) => {
    element.addEventListener("input", handleActivityInput);
    element.addEventListener("change", handleActivityInput);
  });

  document.querySelectorAll("[data-buddy-field]").forEach((section) => {
    section.querySelectorAll(".choice-button").forEach((button) => {
      button.addEventListener("click", () => selectBuddyCard(section.dataset.buddyField, button.dataset.value));
    });
  });

  document.querySelectorAll("[data-buddy-input]").forEach((input) => {
    input.addEventListener("input", () => updateBuddyDirect(input.dataset.buddyInput, input.value));
  });

  document.getElementById("questionCards").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      selectQuestion(button.dataset.question);
      copyText(button.dataset.question, "questionCopyStatus");
    });
  });

  document.getElementById("directQuestion").addEventListener("input", (event) => {
    currentLesson().activityData.directQuestion = event.target.value;
    scheduleSave();
  });

  document.querySelectorAll("[data-reflection]").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      currentLesson().reflectionData[textarea.dataset.reflection] = textarea.value;
      scheduleSave();
    });
  });
}

function fillFormFromState() {
  updateSelectedStudentDisplay();
  document.getElementById("lessonNumber").value = state.currentLesson;

  document.querySelectorAll("[data-save]").forEach((element) => {
    const value = getPath(currentLesson().activityData, element.dataset.save);
    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value || "";
    }
  });

  BUDDY_FIELDS.forEach((field) => {
    const input = document.querySelector(`[data-buddy-input="${field}"]`);
    if (input) {
      input.value = currentLesson().buddy[field] || "";
    }
    updateBuddyChoiceDisplay(field);
  });

  document.getElementById("directQuestion").value = currentLesson().activityData.directQuestion || "";
  updateQuestionCardDisplay();

  document.querySelectorAll("[data-reflection]").forEach((textarea) => {
    textarea.value = currentLesson().reflectionData[textarea.dataset.reflection] || "";
  });

  updateQuestionRecordFields();
  updateChecklistFields();
  renderLessonSummary();
}

async function loadStudentList() {
  setStudentStatus("학생 목록을 불러오고 있어요.");
  const url = buildStudentApiUrl("listStudents");
  if (!url) {
    studentNameList = [];
    renderFilteredStudentList();
    setStudentStatus("학생 목록을 불러오지 못했어요. 선생님께 알려 주세요.", true);
    return;
  }

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "학생 목록을 불러오지 못했어요.");
    }
    const rows = Array.isArray(data) ? data : data.students || [];
    studentNameList = rows
      .map((row) => (row.studentName || "").trim())
      .filter(Boolean);
    renderFilteredStudentList();
    setStudentStatus(studentNameList.length ? "내 이름을 선택해 주세요." : "학생 목록을 불러오지 못했어요. 선생님께 알려 주세요.", !studentNameList.length);
    if (state.studentInfo.studentName) {
      await selectStudentName(state.studentInfo.studentName, true);
    }
  } catch (error) {
    studentNameList = [];
    renderFilteredStudentList();
    setStudentStatus("학생 목록을 불러오지 못했어요. 선생님께 알려 주세요.", true);
  }
}

function buildStudentApiUrl(action, params = {}) {
  if (!STUDENT_LIST_API_URL || STUDENT_LIST_API_URL === STUDENT_API_PLACEHOLDER_URL) {
    return "";
  }
  try {
    const url = new URL(STUDENT_LIST_API_URL);
    url.searchParams.set("action", action);
    Object.keys(params).forEach((key) => {
      url.searchParams.set(key, params[key]);
    });
    return url.toString();
  } catch (error) {
    return "";
  }
}

function renderFilteredStudentList() {
  const container = document.getElementById("studentNameList");
  const searchInput = document.getElementById("studentSearch");
  if (!container || !searchInput) {
    return;
  }
  const query = searchInput.value.trim().toLowerCase();
  const names = studentNameList
    .filter((name) => !query || name.toLowerCase().includes(query))
    .slice(0, 80);

  container.innerHTML = "";
  names.forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "student-name-button";
    button.textContent = name;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", state.studentInfo.studentName === name ? "true" : "false");
    button.classList.toggle("selected", state.studentInfo.studentName === name);
    button.addEventListener("click", () => selectStudentName(name));
    container.appendChild(button);
  });
}

async function selectStudentName(studentName, silent = false) {
  const name = (studentName || "").trim();
  if (!name) {
    setStudentStatus("내 이름을 선택해 주세요.", true);
    return false;
  }

  if (!silent) {
    setStudentStatus("학생 정보를 확인하고 있어요.");
  }
  const url = buildStudentApiUrl("getStudent", { studentName: name });
  if (!url) {
    setStudentStatus("학생 목록을 불러오지 못했어요. 선생님께 알려 주세요.", true);
    return false;
  }

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "학생 정보를 찾을 수 없어요.");
    }
    const loginId = String(data.loginId || data.studentId || "").trim();
    const selectedName = String(data.studentName || name).trim();
    if (!loginId || !selectedName) {
      throw new Error("학생 정보를 찾을 수 없어요.");
    }
    selectedStudentAccount = {
      studentName: selectedName,
      studentId: String(data.studentId || loginId),
      loginId,
      password: String(data.password || "")
    };
    state.studentInfo = {
      studentName: selectedName,
      studentId: selectedStudentAccount.studentId,
      loginId,
      className: data.className || "",
      grade: data.grade || "",
      school: data.school || ""
    };
    document.getElementById("studentSearch").value = selectedName;
    updateSelectedStudentDisplay();
    renderFilteredStudentList();
    setStudentStatus("이름을 선택했어요.");
    scheduleSave();
    return true;
  } catch (error) {
    selectedStudentAccount = null;
    setStudentStatus(error.message || "학생 정보를 찾을 수 없어요.", true);
    updateSelectedStudentDisplay();
    return false;
  }
}

function updateSelectedStudentDisplay() {
  const selectedName = document.getElementById("selectedStudentName");
  if (!selectedName) {
    return;
  }
  selectedName.textContent = state.studentInfo.studentName || "내 이름을 선택해 주세요.";
}

function setStudentStatus(message, isError = false) {
  const status = document.getElementById("studentListStatus");
  if (!status) {
    return;
  }
  status.textContent = message;
  status.classList.toggle("error", Boolean(isError));
}

async function ensureSelectedStudentAccount() {
  if (selectedStudentAccount && selectedStudentAccount.studentName === state.studentInfo.studentName) {
    return true;
  }
  if (!state.studentInfo.studentName) {
    return false;
  }
  return selectStudentName(state.studentInfo.studentName, true);
}

async function copyLoginId() {
  const ready = await ensureSelectedStudentAccount();
  if (!ready || !selectedStudentAccount || !selectedStudentAccount.loginId) {
    showStatus("accountCopyStatus", "먼저 내 이름을 선택해 주세요.");
    return;
  }
  copyText(selectedStudentAccount.loginId, "accountCopyStatus", "아이디가 복사되었어요.");
}

async function copyPassword() {
  const ready = await ensureSelectedStudentAccount();
  if (!ready || !selectedStudentAccount || !selectedStudentAccount.password) {
    showStatus("accountCopyStatus", "먼저 내 이름을 선택해 주세요.");
    return;
  }
  copyText(selectedStudentAccount.password, "accountCopyStatus", "비밀번호가 복사되었어요.");
}

function handleLessonChange(event) {
  state.currentLesson = event.target.value;
  ensureLesson(state.currentLesson);
  fillFormFromState();
  updateBuddyPrompt();
  updateChecklistProgress();
  updateSubmitStatus();
  updateOverallProgress();
  scheduleSave();
}

function handleActivityInput(event) {
  const element = event.target;
  const value = element.type === "checkbox" ? element.checked : element.value;
  setPath(currentLesson().activityData, element.dataset.save, value);
  scheduleSave();
}

function selectBuddyCard(field, value) {
  const lesson = currentLesson();
  lesson.buddy[field] = value;
  lesson.buddy.source[field] = "card";
  const input = document.querySelector(`[data-buddy-input="${field}"]`);
  if (input) {
    input.value = value;
  }
  updateBuddyChoiceDisplay(field);
  updateBuddyPrompt();
  scheduleSave();
}

function updateBuddyDirect(field, value) {
  const lesson = currentLesson();
  lesson.buddy[field] = value.trim();
  lesson.buddy.source[field] = value.trim() ? "direct" : "";
  updateBuddyChoiceDisplay(field);
  updateBuddyPrompt();
  scheduleSave();
}

function updateBuddyChoiceDisplay(field) {
  const section = document.querySelector(`[data-buddy-field="${field}"]`);
  if (!section) {
    return;
  }
  const value = currentLesson().buddy[field] || "";
  const source = currentLesson().buddy.source[field] || "";
  let matchedCard = false;
  section.querySelectorAll(".choice-button").forEach((button) => {
    const selected = button.dataset.value === value && source !== "direct";
    button.classList.toggle("selected", selected);
    if (selected) {
      matchedCard = true;
    }
  });
  section.classList.toggle("direct-mode", Boolean(value && source === "direct" && !matchedCard));
}

function updateBuddyPrompt() {
  const lesson = currentLesson();
  const buddy = lesson.buddy;
  const missing = BUDDY_FIELDS.some((field) => !buddy[field]);
  document.getElementById("buddyMissingNotice").hidden = !missing;
  const name = buddy.name || "아직 정하지 않은 이름";
  const role = buddy.role || "아직 정하지 않은 역할";
  const specialty = buddy.specialty || "아직 정하지 않은 전문 분야";
  const personality = buddy.personality || "아직 정하지 않은 성격";
  const tone = buddy.tone || "아직 정하지 않은 말투";
  const prompt = [
    `너는 달 뒷면을 탐사하는 AI Buddy '${name}'야.`,
    `너의 역할은 ${role}이야.`,
    `전문 분야는 ${specialty}이야.`,
    `성격은 ${personality}이야.`,
    `${tone}로 설명해 줘.`,
    "과학적 사실과 상상한 내용을 구분해 줘.",
    "확실하지 않은 내용은 추측이라고 알려 줘."
  ].join("\n");
  lesson.buddyPrompt = prompt;
  document.getElementById("buddyPrompt").value = prompt;
  updateOverallProgress();
}

function resetBuddy() {
  const lesson = currentLesson();
  lesson.buddy = createEmptyLesson(state.currentLesson).buddy;
  lesson.buddyPrompt = "";
  BUDDY_FIELDS.forEach((field) => {
    const input = document.querySelector(`[data-buddy-input="${field}"]`);
    if (input) {
      input.value = "";
    }
    updateBuddyChoiceDisplay(field);
  });
  updateBuddyPrompt();
  scheduleSave();
}

function copyBuddyPrompt() {
  const lesson = currentLesson();
  if (BUDDY_FIELDS.some((field) => !lesson.buddy[field])) {
    showStatus("promptCopyStatus", "아직 정하지 않은 항목이 있어요.");
    return;
  }
  copyText(lesson.buddyPrompt, "promptCopyStatus");
}

function selectQuestion(question) {
  currentLesson().activityData.selectedQuestion = question;
  updateQuestionCardDisplay();
  scheduleSave();
}

function updateQuestionCardDisplay() {
  const selected = currentLesson().activityData.selectedQuestion;
  document.getElementById("questionCards").querySelectorAll("button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.question === selected);
  });
}

function copySelectedQuestion() {
  const question = currentLesson().activityData.selectedQuestion;
  if (!question) {
    showStatus("questionCopyStatus", "질문을 고르거나 입력해요.");
    return;
  }
  copyText(question, "questionCopyStatus");
}

function copyDirectQuestion() {
  const question = document.getElementById("directQuestion").value.trim();
  currentLesson().activityData.directQuestion = question;
  if (!question) {
    showStatus("directQuestionStatus", "질문을 입력해요.");
    return;
  }
  scheduleSave();
  copyText(question, "directQuestionStatus");
}

function renderQuestionRecords() {
  const container = document.getElementById("questionRecords");
  container.innerHTML = "";
  currentLesson().activityData.questionRecords.forEach((record, index) => {
    const panel = document.createElement("article");
    panel.className = "record-panel";
    panel.innerHTML = `
      <h3>질문 기록 ${index + 1}</h3>
      <div class="record-fields">
        <label class="field wide">
          <span>내가 한 질문</span>
          <textarea data-question-record="${index}" data-question-field="question" placeholder="질문을 적거나 붙여넣어요."></textarea>
        </label>
        <label class="field wide">
          <span>답변의 핵심 단어</span>
          <textarea data-question-record="${index}" data-question-field="answer" placeholder="AI Buddy 답변에서 가장 중요한 단어를 적어요."></textarea>
        </label>
        <label class="field wide">
          <span>답변 중 이상한 부분</span>
          <textarea data-question-record="${index}" data-question-field="imagination" placeholder="이상하거나 맞는지 헷갈리는 부분을 적어요."></textarea>
        </label>
      </div>
    `;
    container.appendChild(panel);
  });
  container.querySelectorAll("[data-question-record]").forEach((textarea) => {
    textarea.addEventListener("input", handleQuestionRecordInput);
  });
}

function updateQuestionRecordFields() {
  document.querySelectorAll("[data-question-record]").forEach((textarea) => {
    const index = Number(textarea.dataset.questionRecord);
    const field = textarea.dataset.questionField;
    textarea.value = currentLesson().activityData.questionRecords[index][field] || "";
  });
}

function handleQuestionRecordInput(event) {
  const index = Number(event.target.dataset.questionRecord);
  const field = event.target.dataset.questionField;
  currentLesson().activityData.questionRecords[index][field] = event.target.value;
  scheduleSave();
}

function renderChecklist() {
  const container = document.getElementById("checklistContainer");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  currentLesson().checklistData.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "check-item";
    row.innerHTML = `
      <label>
        <input type="checkbox" data-check-index="${index}">
        <span>${item.label}</span>
      </label>
      <textarea data-evidence-index="${index}" placeholder="어디에서 확인했나요?"></textarea>
    `;
    container.appendChild(row);
  });
  container.querySelectorAll("[data-check-index]").forEach((checkbox) => {
    checkbox.addEventListener("change", handleChecklistChange);
  });
  container.querySelectorAll("[data-evidence-index]").forEach((textarea) => {
    textarea.addEventListener("input", handleEvidenceInput);
  });
}

function updateChecklistFields() {
  currentLesson().checklistData.forEach((item, index) => {
    const checkbox = document.querySelector(`[data-check-index="${index}"]`);
    const textarea = document.querySelector(`[data-evidence-index="${index}"]`);
    if (checkbox) {
      checkbox.checked = item.checked;
    }
    if (textarea) {
      textarea.value = item.evidence || "";
      textarea.disabled = !item.checked;
    }
  });
}

function handleChecklistChange(event) {
  const index = Number(event.target.dataset.checkIndex);
  currentLesson().checklistData[index].checked = event.target.checked;
  if (!event.target.checked) {
    currentLesson().checklistData[index].evidence = "";
  }
  updateChecklistFields();
  updateChecklistProgress();
  scheduleSave();
}

function handleEvidenceInput(event) {
  const index = Number(event.target.dataset.evidenceIndex);
  currentLesson().checklistData[index].evidence = event.target.value;
  scheduleSave();
}

function updateChecklistProgress() {
  const completed = currentLesson().checklistData.filter((item) => item.checked).length;
  const total = CHECKLIST_ITEMS.length;
  const progressText = document.getElementById("checkProgressText");
  const progressBar = document.getElementById("checkProgressBar");
  const completeMessage = document.getElementById("checkCompleteMessage");
  if (progressText && progressBar && completeMessage) {
    progressText.textContent = `${completed}/${total} 완료`;
    progressBar.value = completed;
    completeMessage.textContent = completed === total ? "탐사 준비 완료!" : "";
  }
  updateOverallProgress();
}

function resetChecklist() {
  currentLesson().checklistData = normalizeChecklist([]);
  updateChecklistFields();
  updateChecklistProgress();
  scheduleSave();
}

function copyChecklist() {
  const lines = currentLesson().checklistData.map((item) => {
    const mark = item.checked ? "완료" : "미완료";
    const evidence = item.evidence ? ` 근거: ${item.evidence}` : "";
    return `[${mark}] ${item.label}${evidence}`;
  });
  copyText(lines.join("\n"), "checklistCopyStatus");
}

function copyReflection() {
  const reflection = currentLesson().reflectionData;
  const text = [
    `오늘 알게 된 과학적 사실: ${reflection.scienceFact || ""}`,
    `내가 만든 AI Buddy가 잘하는 일: ${reflection.buddyStrength || ""}`,
    `AI Buddy에게 가장 유용했던 질문: ${reflection.usefulQuestion || ""}`,
    `다음 시간에 물어보고 싶은 질문: ${reflection.nextQuestion || ""}`,
    `오늘 활동에서 어려웠던 점: ${reflection.difficulty || ""}`
  ].join("\n");
  copyText(text, "reflectionCopyStatus");
}

function resetReflection() {
  currentLesson().reflectionData = createEmptyLesson(state.currentLesson).reflectionData;
  document.querySelectorAll("[data-reflection]").forEach((textarea) => {
    textarea.value = "";
  });
  scheduleSave();
}

function buildPayload() {
  const lesson = currentLesson();
  const loginId = state.studentInfo.loginId || state.studentInfo.studentId || "";
  return {
    studentId: loginId,
    studentName: state.studentInfo.studentName,
    loginId,
    className: state.studentInfo.className || "",
    grade: state.studentInfo.grade || "",
    school: state.studentInfo.school || "",
    lessonNumber: Number(lesson.lessonNumber),
    lessonTitle: lesson.lessonTitle,
    activityData: {
      selections: lesson.buddy,
      directInputs: collectDirectInputs(lesson),
      moonChecks: lesson.activityData.moonChecks,
      characterChecks: lesson.activityData.characterChecks,
      selectedQuestion: lesson.activityData.selectedQuestion,
      directQuestion: lesson.activityData.directQuestion,
      questionRecords: lesson.activityData.questionRecords
    },
    checklistData: lesson.checklistData,
    reflectionData: lesson.reflectionData,
    startedAt: lesson.startedAt,
    completedAt: lesson.completedAt || new Date().toISOString(),
    submittedAt: new Date().toISOString()
  };
}

function collectDirectInputs(lesson) {
  const direct = {};
  BUDDY_FIELDS.forEach((field) => {
    if (lesson.buddy.source[field] === "direct") {
      direct[field] = lesson.buddy[field];
    }
  });
  return direct;
}

function validateBeforeSubmit() {
  const messages = [];
  const lesson = currentLesson();
  if (!state.studentInfo.studentName || !(state.studentInfo.loginId || state.studentInfo.studentId)) {
    messages.push("내 이름을 선택해 주세요.");
  }
  if (!lesson.lessonNumber) {
    messages.push("현재 차시를 선택해 주세요.");
  }
  const buddyReady = BUDDY_FIELDS.every((field) => lesson.buddy[field]);
  const questionReady = lesson.activityData.questionRecords.filter((record) => {
    return record.question.trim() && record.answer.trim() && record.imagination.trim();
  }).length >= 2;
  const reflectionReady = REFLECTION_FIELDS.every((field) => (lesson.reflectionData[field] || "").trim());
  if (!buddyReady || !questionReady || !reflectionReady) {
    messages.push("아직 작성하지 않은 기록이 있어요.");
  }
  return [...new Set(messages)];
}

function showValidation(messages) {
  const box = document.getElementById("validationMessages");
  if (!messages.length) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  box.hidden = false;
  box.innerHTML = messages.map((message) => `<p>${message}</p>`).join("");
}

async function submitRecord() {
  const messages = validateBeforeSubmit();
  showValidation(messages);
  if (messages.length) {
    return;
  }

  const lesson = currentLesson();
  const payload = buildPayload();
  lesson.completedAt = payload.completedAt;
  lesson.submissionStatus = "기록을 보내고 있어요.";
  updateSubmitStatus();
  scheduleSave();

  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === PLACEHOLDER_URL) {
    lesson.submissionStatus = "현재 컴퓨터에 임시 저장했어요.";
    updateSubmitStatus();
    scheduleSave();
    return;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "submit failed");
    }
    lesson.submittedAt = payload.submittedAt;
    lesson.submissionStatus = "기록이 저장되었어요.";
  } catch (error) {
    lesson.submissionStatus = "인터넷 연결을 확인하고 다시 제출해 보세요.";
  }
  updateSubmitStatus();
  renderLessonSummary();
  scheduleSave();
}

function updateSubmitStatus() {
  document.getElementById("submitStatus").textContent = currentLesson().submissionStatus || "아직 제출하지 않았어요.";
}

function copyLessonPayload() {
  const payload = buildPayload();
  copyText(JSON.stringify(payload, null, 2), "lessonDataCopyStatus");
}

function updateOverallProgress() {
  const lesson = currentLesson();
  const progressUnits = [];
  progressUnits.push(Boolean(state.studentInfo.studentName));
  progressUnits.push(Boolean(state.studentInfo.loginId || state.studentInfo.studentId));
  BUDDY_FIELDS.forEach((field) => progressUnits.push(Boolean(lesson.buddy[field])));
  lesson.activityData.questionRecords.forEach((record) => {
    progressUnits.push(Boolean(record.question.trim()));
    progressUnits.push(Boolean(record.answer.trim()));
    progressUnits.push(Boolean(record.imagination.trim()));
  });
  REFLECTION_FIELDS.forEach((field) => progressUnits.push(Boolean((lesson.reflectionData[field] || "").trim())));
  const completed = progressUnits.filter(Boolean).length;
  const total = progressUnits.length;
  const percent = Math.round((completed / total) * 100);
  document.getElementById("overallProgress").value = percent;
  document.getElementById("overallProgressText").textContent = `${percent}%`;
  if (percent === 100 && !lesson.completedAt) {
    lesson.completedAt = new Date().toISOString();
  }
  renderLessonSummary();
}

function renderLessonSummary() {
  const container = document.getElementById("lessonSummaryGrid");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  ["1", "2", "3", "4"].forEach((lessonNumber) => {
    const lesson = state.lessons && state.lessons[lessonNumber];
    const submitted = lesson && lesson.submittedAt ? "제출 완료" : "제출 전";
    const started = lesson && lesson.startedAt ? formatDate(lesson.startedAt) : "아직 기록이 없어요.";
    const checklistCount = lesson ? lesson.checklistData.filter((item) => item.checked).length : 0;
    const card = document.createElement("article");
    card.className = "lesson-summary-card";
    card.innerHTML = `
      <h3>${lessonNumber}차시</h3>
      <p><strong>${submitted}</strong></p>
      <p>${LESSON_TITLES[lessonNumber]}</p>
      <p>시작: ${started}</p>
      <p>점검: ${checklistCount}/${CHECKLIST_ITEMS.length}</p>
      <p>lessonNumber: ${lessonNumber}</p>
    `;
    container.appendChild(card);
  });
}

function resetCurrentLesson() {
  const keepGoing = window.confirm("현재 차시 기록을 처음부터 다시 할까요? 학생 정보는 남겨요.");
  if (!keepGoing) {
    return;
  }
  state.lessons[state.currentLesson] = createEmptyLesson(state.currentLesson);
  renderQuestionRecords();
  renderChecklist();
  fillFormFromState();
  updateBuddyPrompt();
  updateChecklistProgress();
  updateSubmitStatus();
  scheduleSave();
}

function scheduleSave() {
  updateOverallProgress();
  updateSubmitStatus();
  if (!storageEnabled) {
    document.getElementById("saveStatus").textContent = "자동 저장 불가";
    return;
  }
  document.getElementById("saveStatus").textContent = "저장 중";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 180);
}

function saveState() {
  if (!storageEnabled) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createStorageSafeState()));
    document.getElementById("saveStatus").textContent = `저장됨 ${new Date().toLocaleTimeString("ko-KR", { hour12: false })}`;
  } catch (error) {
    storageEnabled = false;
    document.getElementById("storageWarning").hidden = false;
    document.getElementById("saveStatus").textContent = "자동 저장 불가";
  }
}

function createStorageSafeState() {
  return {
    ...state,
    studentInfo: {
      studentName: state.studentInfo.studentName || "",
      studentId: state.studentInfo.studentId || state.studentInfo.loginId || "",
      loginId: state.studentInfo.loginId || state.studentInfo.studentId || ""
    }
  };
}

async function copyText(text, statusId, successMessage = "복사되었어요.") {
  if (!text) {
    showStatus(statusId, "복사할 내용이 없어요.");
    return;
  }
  try {
    if (!navigator.clipboard) {
      throw new Error("clipboard unavailable");
    }
    await navigator.clipboard.writeText(text);
    showStatus(statusId, successMessage);
  } catch (error) {
    const copied = fallbackCopy(text);
    showStatus(statusId, copied ? successMessage : "글상자를 선택했어요. Ctrl+C를 눌러요.");
  }
}

function fallbackCopy(text) {
  const box = document.getElementById("manualCopyBox");
  const textarea = document.getElementById("manualCopyText");
  box.hidden = false;
  textarea.value = text;
  textarea.focus();
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch (error) {
    return false;
  }
}

function showStatus(statusId, message) {
  const element = document.getElementById(statusId);
  if (!element) {
    return;
  }
  element.textContent = message;
  window.setTimeout(() => {
    if (element.textContent === message) {
      element.textContent = "";
    }
  }, 3000);
}

function getPath(target, path) {
  return path.split(".").reduce((value, key) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    return value[key];
  }, target);
}

function setPath(target, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const parent = keys.reduce((node, key) => {
    if (!node[key]) {
      node[key] = {};
    }
    return node[key];
  }, target);
  parent[last] = value;
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  try {
    return new Date(value).toLocaleString("ko-KR", { hour12: false });
  } catch (error) {
    return value;
  }
}

function observeSections() {
  const links = Array.from(document.querySelectorAll(".side-nav a"));
  const sectionMap = new Map();
  document.querySelectorAll(".step-card").forEach((section) => {
    sectionMap.set(section.id, section);
  });
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) {
      return;
    }
    const step = visible.target.dataset.step;
    const title = visible.target.dataset.title;
    document.getElementById("currentStepLabel").textContent = `${step}. ${title}`;
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  }, {
    root: null,
    rootMargin: "-120px 0px -60% 0px",
    threshold: 0.1
  });
  sectionMap.forEach((section) => observer.observe(section));
}
