const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPbD6lnhX-tn8WYW9xIvs3EvCUPQeJHhEV_wWqdEP6ihAdvt0OlbCey0lQWQJWpeaU/exec";
const STUDENT_LIST_API_URL = "https://script.google.com/macros/s/AKfycbxPbD6lnhX-tn8WYW9xIvs3EvCUPQeJHhEV_wWqdEP6ihAdvt0OlbCey0lQWQJWpeaU/exec";
const SURVEY_URL = "https://docs.google.com/forms/d/e/1FAIpQLSchyjekrO8af9SwP_JdsisMBuswEAghAUPVpaNxBDheRQL3Cg/viewform";

const STORAGE_KEY_PREFIX = "delightexEduArtemisStudent.eventV2.student.";

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
  ["buddySpecialty", "AI Buddy가 잘 아는 것을 정했어요."],
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
const SUBMIT_FAILURE_STATUS = "탐사 기록을 아직 보내지 못했어요. 선생님에게 알려 주세요.";
const LOCAL_SAVE_STATUS = "현재 컴퓨터에 임시 저장했어요.";

let storageEnabled = true;
let state = createInitialState();
let saveTimer = null;
let studentNameList = [];
let selectedSlotNumber = "";
let selectedAccountName = "";
let currentStage = 1;

document.addEventListener("DOMContentLoaded", init);

function init() {
  storageEnabled = checkStorage();
  document.getElementById("storageWarning").hidden = storageEnabled;
  state = createInitialState();
  ensureLesson(state.currentLesson);
  bindEvents();
  configureSurveyLink();
  fillFormFromState();
  updateBuddyPrompt();
  updateSubmitStatus();
  showStage(1);
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
      school: "",
      accountStudentName: "",
      participantName: "",
      slotNumber: ""
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
      ],
      buddyMatchResult: ""
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

function getStudentStorageKey(studentId) {
  const normalizedId = String(studentId || "").trim();
  return normalizedId ? `${STORAGE_KEY_PREFIX}${encodeURIComponent(normalizedId)}` : "";
}

function loadStateForStudent(studentInfo) {
  const storageKey = getStudentStorageKey(studentInfo && studentInfo.studentId);
  if (!storageEnabled || !storageKey) {
    return createInitialState();
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      const freshState = createInitialState();
      freshState.studentInfo = { ...studentInfo };
      return freshState;
    }
    const parsed = JSON.parse(saved);
    const savedParticipantName = String(parsed.studentInfo && parsed.studentInfo.participantName || "").trim();
    if (savedParticipantName && savedParticipantName !== String(studentInfo.participantName || "").trim()) {
      const freshState = createInitialState();
      freshState.studentInfo = { ...studentInfo };
      return freshState;
    }
    return normalizeState(parsed, studentInfo);
  } catch (error) {
    const freshState = createInitialState();
    freshState.studentInfo = { ...studentInfo };
    return freshState;
  }
}

function normalizeState(saved, authoritativeStudentInfo = {}) {
  const base = createInitialState();
  const merged = {
    ...base,
    ...saved,
    studentInfo: { ...authoritativeStudentInfo },
    lessons: {
      ...(saved.lessons || {})
    }
  };
  merged.currentLesson = "1";
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
  bindClick("startExplorationButton", startExploration);
  document.getElementById("participantNameInput").addEventListener("input", handleParticipantNameInput);
  bindClick("copyPromptButton", copyBuddyPrompt);
  bindClick("submitButton", submitRecord);
  document.querySelectorAll("[data-next-stage]").forEach((button) => button.addEventListener("click", () => showStage(Number(button.dataset.nextStage))));
  document.querySelectorAll("[data-prev-stage]").forEach((button) => button.addEventListener("click", () => showStage(Number(button.dataset.prevStage))));
  document.querySelectorAll("[data-buddy-next]").forEach((button) => button.addEventListener("click", () => showBuddyStep(Number(button.dataset.buddyNext))));
  document.querySelectorAll("[data-buddy-prev]").forEach((button) => button.addEventListener("click", () => showBuddyStep(Number(button.dataset.buddyPrev))));
  document.querySelectorAll("[data-save]").forEach((element) => element.addEventListener("input", handleActivityInput));

  document.querySelectorAll("[data-buddy-field]").forEach((section) => {
    section.querySelectorAll(".choice-button").forEach((button) => {
      button.addEventListener("click", () => selectBuddyCard(section.dataset.buddyField, button.dataset.value));
    });
  });

  document.querySelectorAll("[data-buddy-input]").forEach((input) => {
    input.addEventListener("input", () => updateBuddyDirect(input.dataset.buddyInput, input.value));
  });

  document.querySelectorAll("[data-match-result]").forEach((button) => button.addEventListener("click", () => selectMatchResult(button.dataset.matchResult)));
}

function configureSurveyLink() {
  const link = document.getElementById("surveyLink");
  if (link) link.href = SURVEY_URL;
}

function fillFormFromState() {
  updateSelectedStudentDisplay();
  const participantInput = document.getElementById("participantNameInput");
  if (participantInput) participantInput.value = state.studentInfo.participantName || "";

  BUDDY_FIELDS.forEach((field) => {
    const input = document.querySelector(`[data-buddy-input="${field}"]`);
    if (input) {
      input.value = currentLesson().buddy[field] || "";
    }
    updateBuddyChoiceDisplay(field);
  });

  updateMatchResultDisplay();
  updateStartButton();
}

async function loadStudentList() {
  setStudentStatus("탐사대 목록을 불러오고 있어요.");
  const url = buildStudentApiUrl("listStudents");
  if (!url) {
    studentNameList = [];
    renderSlotList();
    setStudentStatus("탐사대 목록을 불러오지 못했어요. 선생님께 알려 주세요.", true);
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
      .map((row) => ({ accountStudentName: (row.studentName || "").trim() }))
      .filter((row) => row.accountStudentName);
    renderSlotList();
    setStudentStatus(studentNameList.length ? "탐사대 번호를 선택해 주세요." : "탐사대 목록을 불러오지 못했어요.", !studentNameList.length);
  } catch (error) {
    studentNameList = [];
    renderSlotList();
    setStudentStatus("탐사대 목록을 불러오지 못했어요. 선생님께 알려 주세요.", true);
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

function renderSlotList() {
  const container = document.getElementById("studentNameList");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  studentNameList.forEach((account, index) => {
    const slotNumber = String(index + 1).padStart(2, "0");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "student-name-button slot-button";
    button.textContent = slotNumber;
    button.setAttribute("role", "option");
    button.setAttribute("aria-label", `탐사대 ${slotNumber}`);
    button.setAttribute("aria-selected", selectedSlotNumber === slotNumber ? "true" : "false");
    button.classList.toggle("selected", selectedSlotNumber === slotNumber);
    button.addEventListener("click", () => selectSlot(slotNumber));
    container.appendChild(button);
  });
}

function selectSlot(slotNumber) {
  const account = studentNameList[Number(slotNumber) - 1];
  if (!account) {
    return;
  }
  selectedSlotNumber = slotNumber;
  selectedAccountName = account.accountStudentName;
  document.getElementById("selectedSlotStatus").textContent = `탐사대 ${slotNumber} 선택됨`;
  renderSlotList();
  updateStartButton();
}

function handleParticipantNameInput(event) {
  const input = event.target;
  input.value = input.value.slice(0, 40);
  updateStartButton();
}

function updateStartButton() {
  const button = document.getElementById("startExplorationButton");
  const input = document.getElementById("participantNameInput");
  if (button && input) button.disabled = !selectedSlotNumber || !input.value.trim();
}

async function startExploration() {
  const participantName = document.getElementById("participantNameInput").value.trim();
  if (!selectedSlotNumber) {
    setStudentStatus("탐사대 번호를 선택해 주세요.", true);
    return;
  }
  if (!participantName) {
    setStudentStatus("이름을 입력해 주세요.", true);
    return;
  }
  await selectStudentBySlot(participantName);
}

async function selectStudentBySlot(participantName) {
  setStudentStatus("탐사 정보를 확인하고 있어요.");
  const url = buildStudentApiUrl("getStudent", { studentName: selectedAccountName });
  if (!url) {
    setStudentStatus("탐사 정보를 확인하지 못했어요. 선생님께 알려 주세요.", true);
    return false;
  }

  if (state.studentInfo.studentId) {
    flushStudentStateBeforeSwitch();
  }

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "학생 정보를 찾을 수 없어요.");
    }
    const loginId = String(data.loginId || data.studentId || "").trim();
    const accountStudentName = String(data.studentName || selectedAccountName).trim();
    if (!loginId || !accountStudentName) {
      throw new Error("학생 정보를 찾을 수 없어요.");
    }
    const serverStudentInfo = {
      studentName: participantName,
      participantName,
      accountStudentName,
      slotNumber: selectedSlotNumber,
      studentId: String(data.studentId || loginId),
      loginId,
      className: data.className || "",
      grade: data.grade || "",
      school: data.school || ""
    };
    state = loadStateForStudent(serverStudentInfo);
    ensureLesson(state.currentLesson);
    state.studentInfo = serverStudentInfo;
    document.getElementById("participantNameInput").value = participantName;
    fillFormFromState();
    updateBuddyPrompt();
    updateOverallProgress();
    updateSubmitStatus();
    updateSelectedStudentDisplay();
    setStudentStatus(`탐사대 ${selectedSlotNumber} 출발 준비가 되었어요.`);
    scheduleSave();
    showStage(2);
    return true;
  } catch (error) {
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
  selectedName.textContent = state.studentInfo.participantName || "내 이름을 입력해 주세요.";
}

function setStudentStatus(message, isError = false) {
  const status = document.getElementById("studentStatus") || document.getElementById("studentListStatus");
  if (!status) {
    return;
  }
  status.textContent = message;
  status.classList.toggle("error", Boolean(isError));
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
  if (field === "name" && value === "__direct__") {
    lesson.buddy.source[field] = "direct";
    updateBuddyChoiceDisplay(field);
    updateBuddyPrompt();
    scheduleSave();
    return;
  }
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
  if (field !== "name") return;
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
    const selected = (source === "direct" && button.dataset.value === "__direct__") || (button.dataset.value === value && source !== "direct");
    button.classList.toggle("selected", selected);
    if (selected) {
      matchedCard = true;
    }
  });
  section.classList.toggle("direct-mode", Boolean(value && source === "direct" && !matchedCard));
  const input = section.querySelector("[data-buddy-input]");
  if (input) { input.hidden = source !== "direct"; input.value = source === "direct" ? value : ""; }
}

function updateBuddyPrompt() {
  const lesson = currentLesson();
  const buddy = lesson.buddy;
  const missing = BUDDY_FIELDS.some((field) => !buddy[field]);
  document.getElementById("buddyMissingNotice").hidden = !missing;
  const name = buddy.name || "아직 정하지 않은 이름";
  const role = buddy.role || "아직 정하지 않은 역할";
  const specialty = buddy.specialty || "아직 정하지 않은 잘 아는 것";
  const personality = buddy.personality || "아직 정하지 않은 성격";
  const tone = buddy.tone || "아직 정하지 않은 말투";
  const prompt = [
    `너는 달 뒷면을 탐사하는 AI Buddy '${name}'야.`,
    `너의 역할은 ${role}이야.`,
    `잘 아는 것은 ${specialty}이야.`,
    `성격은 ${personality}이야.`,
    `${tone}로 설명해 줘.`,
    "사실과 추측을 구분해 쉽고 안전하게 알려 줘."
  ].join("\n");
  lesson.buddyPrompt = prompt;
  const promptBox = document.getElementById("buddyPrompt");
  if (promptBox) promptBox.value = prompt;
  updateOverallProgress();
}

function showStage(stage) {
  currentStage = Math.min(4, Math.max(1, Number(stage) || 1));
  document.querySelectorAll(".stage-section").forEach((section) => { section.hidden = Number(section.dataset.stage) !== currentStage; });
  document.querySelectorAll("[data-stage-indicator]").forEach((indicator) => indicator.classList.toggle("active", Number(indicator.dataset.stageIndicator) === currentStage));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showBuddyStep(step) {
  document.querySelectorAll("[data-buddy-step]").forEach((panel) => { panel.hidden = Number(panel.dataset.buddyStep) !== Number(step); });
}

function selectMatchResult(result) {
  currentLesson().activityData.buddyMatchResult = result;
  updateMatchResultDisplay();
  updateOverallProgress();
  scheduleSave();
}

function updateMatchResultDisplay() {
  const selected = currentLesson().activityData.buddyMatchResult || "";
  document.querySelectorAll("[data-match-result]").forEach((button) => button.classList.toggle("selected", button.dataset.matchResult === selected));
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
      questionRecords: lesson.activityData.questionRecords,
      buddyMatchResult: lesson.activityData.buddyMatchResult || ""
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
  if (!state.studentInfo.participantName || !(state.studentInfo.loginId || state.studentInfo.studentId)) {
    messages.push("내 이름을 선택해 주세요.");
  }
  if (!lesson.lessonNumber) {
    messages.push("현재 차시를 선택해 주세요.");
  }
  const buddyReady = BUDDY_FIELDS.every((field) => lesson.buddy[field]);
  if (!buddyReady) {
    messages.push("Buddy 설정 다섯 가지를 모두 골라 주세요.");
  }
  if (!lesson.activityData.buddyMatchResult) {
    messages.push("Buddy 시험 결과를 하나 골라 주세요.");
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
    lesson.submissionStatus = LOCAL_SAVE_STATUS;
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
    lesson.submissionStatus = SUBMIT_FAILURE_STATUS;
  }
  updateSubmitStatus();
  renderLessonSummary();
  scheduleSave();
}

function updateSubmitStatus() {
  const status = document.getElementById("submitStatus");
  const lesson = currentLesson();
  const submissionStatus = lesson.submissionStatus || "아직 제출하지 않았어요.";
  if (status) status.textContent = submissionStatus;
  const submitButton = document.getElementById("submitButton");
  if (submitButton) submitButton.textContent = submissionStatus === SUBMIT_FAILURE_STATUS ? "기록 다시 보내기" : "탐사 기록 보내기";
  const surveyAction = document.getElementById("surveyAction");
  if (surveyAction) surveyAction.hidden = !(lesson.submittedAt || submissionStatus === SUBMIT_FAILURE_STATUS || submissionStatus === LOCAL_SAVE_STATUS);
  const surveyMessage = document.getElementById("surveyMessage");
  if (surveyMessage) surveyMessage.textContent = submissionStatus === SUBMIT_FAILURE_STATUS ? "설문은 먼저 할 수 있어요." : "탐사 기록을 보냈어요. 이제 마지막 설문을 해 주세요.";
}

function copyLessonPayload() {
  const payload = buildPayload();
  copyText(JSON.stringify(payload, null, 2), "lessonDataCopyStatus");
}

function updateOverallProgress() {
  const lesson = currentLesson();
  const complete = Boolean(state.studentInfo.participantName) && BUDDY_FIELDS.every((field) => lesson.buddy[field]) && Boolean(lesson.activityData.buddyMatchResult);
  if (complete && !lesson.completedAt) {
    lesson.completedAt = new Date().toISOString();
  }
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
  const studentId = getActiveStudentId();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(studentId), 180);
}

function getActiveStudentId() {
  return String(state.studentInfo.studentId || state.studentInfo.loginId || "").trim();
}

function flushStudentStateBeforeSwitch() {
  const studentId = getActiveStudentId();
  clearTimeout(saveTimer);
  saveTimer = null;
  if (studentId) {
    saveState(studentId);
  }
  state = createInitialState();
  selectedSlotNumber = "";
  selectedAccountName = "";
  fillFormFromState();
  updateBuddyPrompt();
  updateOverallProgress();
  updateSubmitStatus();
  updateSelectedStudentDisplay();
}

function saveState(studentId = getActiveStudentId()) {
  const storageKey = getStudentStorageKey(studentId);
  if (!storageEnabled || !storageKey || getActiveStudentId() !== String(studentId).trim()) {
    return;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(createStorageSafeState()));
    document.getElementById("saveStatus").textContent = `저장됨 ${new Date().toLocaleTimeString("ko-KR", { hour12: false })}`;
  } catch (error) {
    storageEnabled = false;
    document.getElementById("storageWarning").hidden = false;
    document.getElementById("saveStatus").textContent = "자동 저장 불가";
  }
}

function createStorageSafeState() {
  const { password, ...safeStudentInfo } = state.studentInfo || {};
  return {
    ...state,
    studentInfo: {
      ...safeStudentInfo,
      studentName: safeStudentInfo.studentName || "",
      studentId: safeStudentInfo.studentId || safeStudentInfo.loginId || "",
      loginId: safeStudentInfo.loginId || safeStudentInfo.studentId || ""
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
