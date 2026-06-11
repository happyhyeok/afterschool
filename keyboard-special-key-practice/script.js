const app = document.getElementById("app");

const STORAGE_KEY = "keyboard-first-step-mission-v1";

const KEY_MAP = {
  Space: {
    keys: [" ", "Spacebar"],
    codes: ["Space"],
  },
  Enter: {
    keys: ["Enter"],
  },
  Backspace: {
    keys: ["Backspace"],
  },
  Delete: {
    keys: ["Delete"],
  },
  Tab: {
    keys: ["Tab"],
  },
  CapsLock: {
    keys: ["CapsLock"],
  },
  Shift: {
    keys: ["Shift"],
  },
  Control: {
    keys: ["Control"],
  },
  Alt: {
    keys: ["Alt", "AltGraph", "HangulMode"],
    codes: ["AltLeft", "AltRight"],
  },
  ArrowUp: {
    keys: ["ArrowUp"],
  },
  ArrowDown: {
    keys: ["ArrowDown"],
  },
  ArrowLeft: {
    keys: ["ArrowLeft"],
  },
  ArrowRight: {
    keys: ["ArrowRight"],
  },
  Windows: {
    keys: ["Meta"],
    codes: ["MetaLeft", "MetaRight"],
  },
};

const PREVENT_GAME_KEYS = new Set([
  "Tab",
  "Space",
  "Enter",
  "Backspace",
  "Delete",
  "Alt",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

const ACHIEVEMENT_KEYS = [
  "Space",
  "Enter",
  "Backspace",
  "Delete",
  "Tab",
  "CapsLock",
  "Shift",
  "Control",
  "Alt",
  "Windows",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
];

const KEY_INFO = {
  Space: {
    label: "Space",
    reading: "스페이스",
    displayName: "Space (스페이스)",
    location: "키보드 아래쪽 가운데에 있는 가장 긴 키입니다.",
    role: "글자와 글자 사이를 한 칸 띄울 때 사용합니다.",
    badge: "띄어쓰기 달인",
  },
  Enter: {
    label: "Enter",
    reading: "엔터",
    displayName: "Enter (엔터)",
    location: "키보드 오른쪽 가운데에 있는 큰 키입니다.",
    role: "줄을 바꾸거나 선택한 내용을 실행할 때 사용합니다.",
    badge: "줄바꿈 성공",
  },
  Backspace: {
    label: "Backspace",
    reading: "백스페이스",
    displayName: "Backspace (백스페이스)",
    location: "키보드 오른쪽 위쪽에 있습니다.",
    role: "커서 왼쪽에 있는 글자를 지울 때 사용합니다.",
    badge: "지우기 해결사",
  },
  Delete: {
    label: "Delete",
    reading: "딜리트",
    displayName: "Delete (딜리트)",
    location: "키보드 오른쪽 위쪽, Backspace 근처나 방향키 위쪽에 있습니다. 키보드 종류에 따라 위치가 조금 다를 수 있습니다.",
    role: "커서 오른쪽에 있는 글자를 지울 때 사용합니다.",
    badge: "오른쪽 지우기 해결사",
  },
  Tab: {
    label: "Tab",
    reading: "탭",
    displayName: "Tab (탭)",
    location: "키보드 왼쪽 위쪽에 있습니다. Caps Lock보다 위에 있습니다.",
    role: "다음 입력칸으로 이동할 때 자주 사용합니다.",
    badge: "다음 칸 이동왕",
  },
  CapsLock: {
    label: "Caps Lock",
    reading: "캡스록",
    displayName: "Caps Lock (캡스록) 키",
    location: "키보드 왼쪽 가운데에 있습니다. Shift 위에 있습니다.",
    role: "영어 대문자를 계속 입력할 때 사용합니다.",
    badge: "대문자 스위치",
  },
  Shift: {
    label: "Shift",
    reading: "쉬프트",
    displayName: "Shift (쉬프트)",
    location: "키보드 왼쪽 아래와 오른쪽 아래에 하나씩 있습니다.",
    role: "다른 키와 함께 눌러 큰 글자나 기호를 입력할 때 사용합니다.",
    badge: "큰 글자 도우미",
  },
  Control: {
    label: "Ctrl",
    reading: "컨트롤",
    displayName: "Ctrl (컨트롤)",
    location: "키보드 아래쪽 왼쪽과 오른쪽에 있습니다.",
    role: "다른 키와 함께 눌러 복사, 붙여넣기 같은 명령을 할 때 사용합니다.",
    badge: "명령 준비 완료",
  },
  Alt: {
    label: "Alt",
    reading: "알트",
    displayName: "Alt (알트)",
    location: "Space 키의 왼쪽과 오른쪽 근처에 있습니다.",
    role: "다른 키와 함께 눌러 메뉴나 창 조작을 도와주는 키입니다.",
    badge: "보조키 탐험가",
  },
  Windows: {
    label: "Windows 키",
    reading: "윈도우 키",
    displayName: "Windows 키 (윈도우 키)",
    location: "키보드 아래쪽 왼쪽에 있는 창문 모양 키입니다.",
    role: "Windows 시작 메뉴를 열 때 사용합니다.",
    badge: "시작 메뉴 찾기",
  },
  ArrowUp: {
    label: "위쪽 방향키",
    reading: "위쪽 화살표",
    displayName: "위쪽 방향키 (위쪽 화살표)",
    location: "키보드 오른쪽 아래에 모여 있는 화살표 모양 키입니다.",
    role: "커서를 위로 움직일 때 사용합니다.",
    badge: "위로 이동",
  },
  ArrowDown: {
    label: "아래쪽 방향키",
    reading: "아래쪽 화살표",
    displayName: "아래쪽 방향키 (아래쪽 화살표)",
    location: "키보드 오른쪽 아래에 모여 있는 화살표 모양 키입니다.",
    role: "커서를 아래로 움직일 때 사용합니다.",
    badge: "아래로 이동",
  },
  ArrowLeft: {
    label: "왼쪽 방향키",
    reading: "왼쪽 화살표",
    displayName: "왼쪽 방향키 (왼쪽 화살표)",
    location: "키보드 오른쪽 아래에 모여 있는 화살표 모양 키입니다.",
    role: "커서를 왼쪽으로 움직일 때 사용합니다.",
    badge: "왼쪽 이동",
  },
  ArrowRight: {
    label: "오른쪽 방향키",
    reading: "오른쪽 화살표",
    displayName: "오른쪽 방향키 (오른쪽 화살표)",
    location: "키보드 오른쪽 아래에 모여 있는 화살표 모양 키입니다.",
    role: "커서를 오른쪽으로 움직일 때 사용합니다.",
    badge: "오른쪽 이동",
  },
};

const STAGE_TITLES = {
  1: "1단계. 키보드 친구 만나기",
  2: "2단계. 상황에 맞는 키 고르기",
  3: "3단계. 문서 편집 미션",
  4: "4단계. 간단 신청서 작성하기",
};

const PRAISE_MESSAGES = [
  "좋아요.",
  "잘 찾았어요.",
  "조금씩 익숙해지고 있어요.",
  "혼자서도 할 수 있어요.",
  "방금 누른 키의 역할을 잘 이해했어요.",
];

const STAGE1_MISSIONS = [
  {
    key: "Space",
    keyName: "Space (스페이스)",
    mission: "Space (스페이스) 키를 누르기",
    success: "좋아요. 글자 사이를 띄울 때 쓰는 키를 찾았어요.",
  },
  {
    key: "Enter",
    keyName: "Enter (엔터)",
    mission: "Enter (엔터) 키를 누르기",
    success: "좋아요. 줄을 바꾸거나 실행할 때 쓰는 키를 찾았어요.",
  },
  {
    key: "Backspace",
    keyName: "Backspace (백스페이스)",
    mission: "Backspace (백스페이스) 키를 누르기",
    success: "좋아요. 잘못 쓴 글자를 지울 때 쓰는 키를 찾았어요.",
  },
  {
    key: "Delete",
    keyName: "Delete (딜리트)",
    mission: "Delete (딜리트) 키를 누르기",
    success: "좋아요. 커서 오른쪽 글자를 지우는 키를 찾았어요.",
    extra: "Backspace는 커서 왼쪽을 지우고, Delete는 커서 오른쪽을 지웁니다.",
  },
  {
    key: "Tab",
    keyName: "Tab (탭)",
    mission: "Tab (탭) 키를 누르기",
    success: "좋아요. 다음 칸으로 이동할 때 쓰는 키를 찾았어요.",
  },
  {
    key: "CapsLock",
    keyName: "Caps Lock (캡스록) 키",
    mission: "Caps Lock (캡스록) 키를 누르기",
    success: "좋아요. 대문자를 계속 입력할 때 쓰는 키를 찾았어요.",
  },
  {
    key: "Shift",
    keyName: "Shift (쉬프트)",
    mission: "Shift (쉬프트) 키를 누르기. 왼쪽 Shift나 오른쪽 Shift 중 아무거나 눌러도 됩니다.",
    success: "좋아요. 큰 글자와 기호 입력을 도와주는 키를 찾았어요.",
  },
  {
    key: "Control",
    keyName: "Ctrl (컨트롤)",
    mission: "Ctrl (컨트롤) 키를 누르기. 왼쪽 Ctrl이나 오른쪽 Ctrl 중 아무거나 눌러도 됩니다.",
    success: "좋아요. 명령을 도와주는 키를 찾았어요.",
    extra: "이번 게임에서는 Ctrl 조합키는 연습하지 않고, 위치만 익힙니다.",
  },
  {
    key: "Alt",
    keyName: "Alt (알트)",
    mission: "Alt (알트) 키를 누르기. 왼쪽 Alt나 오른쪽 Alt 중 아무거나 눌러도 됩니다.",
    success: "좋아요. 보조 명령 키를 찾았어요.",
    extra: "Alt + Tab, Alt + F4는 이 게임에서 연습하지 않습니다.",
  },
  {
    key: "Windows",
    keyName: "Windows 키 (윈도우 키)",
    mission: "이번 키는 실제로 누르지 않아도 됩니다. 화면의 위치만 확인하고 '위치 확인 완료' 버튼을 누르거나 Enter 또는 Space 키를 눌러주세요.",
    success: "좋아요. Windows 키의 위치와 역할을 확인했어요.",
    nonKeyboard: true,
    extra: "이 키는 실제로 누르지 않아도 됩니다. 키보드 아래쪽 왼쪽에 있는 창문 모양 키이며, 시작 메뉴를 열 때 사용하는 키입니다.",
  },
  {
    key: "ArrowUp",
    keyName: "방향키",
    mission: "위쪽 화살표 키를 누르기",
    success: "좋아요. 커서를 움직이는 방향키를 찾았어요.",
    groupRole: "커서를 위, 아래, 왼쪽, 오른쪽으로 움직일 때 사용합니다.",
  },
  {
    key: "ArrowDown",
    keyName: "방향키",
    mission: "아래쪽 화살표 키를 누르기",
    success: "좋아요. 커서를 움직이는 방향키를 찾았어요.",
    groupRole: "커서를 위, 아래, 왼쪽, 오른쪽으로 움직일 때 사용합니다.",
  },
  {
    key: "ArrowLeft",
    keyName: "방향키",
    mission: "왼쪽 화살표 키를 누르기",
    success: "좋아요. 커서를 움직이는 방향키를 찾았어요.",
    groupRole: "커서를 위, 아래, 왼쪽, 오른쪽으로 움직일 때 사용합니다.",
  },
  {
    key: "ArrowRight",
    keyName: "방향키",
    mission: "오른쪽 화살표 키를 누르기",
    success: "좋아요. 커서를 움직이는 방향키를 찾았어요.",
    groupRole: "커서를 위, 아래, 왼쪽, 오른쪽으로 움직일 때 사용합니다.",
  },
];

const STAGE2_BANK = [
  {
    situation: "글자와 글자 사이를 한 칸 띄우고 싶어요.",
    answer: "Space",
  },
  {
    situation: "문장을 다음 줄에 쓰고 싶어요.",
    answer: "Enter",
  },
  {
    situation: "방금 쓴 글자를 지우고 싶어요.",
    answer: "Backspace",
  },
  {
    situation: "커서 오른쪽 글자를 지우고 싶어요.",
    answer: "Delete",
  },
  {
    situation: "다음 입력칸으로 이동하고 싶어요.",
    answer: "Tab",
  },
  {
    situation: "영어 대문자를 계속 입력하고 싶어요.",
    answer: "CapsLock",
  },
  {
    situation: "큰 글자나 기호를 잠깐 입력하고 싶어요.",
    answer: "Shift",
  },
  {
    situation: "커서를 왼쪽으로 움직이고 싶어요.",
    answer: "ArrowLeft",
  },
  {
    situation: "커서를 오른쪽으로 움직이고 싶어요.",
    answer: "ArrowRight",
  },
  {
    situation: "커서를 위로 움직이고 싶어요.",
    answer: "ArrowUp",
  },
  {
    situation: "커서를 아래로 움직이고 싶어요.",
    answer: "ArrowDown",
  },
  {
    situation: "복사나 붙여넣기 같은 명령을 도와주는 키를 찾고 싶어요.",
    answer: "Control",
  },
  {
    situation: "메뉴나 창 조작을 도와주는 보조키를 찾고 싶어요.",
    answer: "Alt",
  },
];

const STAGE3_MISSIONS = [
  {
    title: "띄어쓰기 연습",
    instruction: "Space를 눌러 단어 사이를 띄워보세요.",
    setup: "오늘은|컴퓨터를 배웁니다",
    sequence: ["Space"],
    success: "공백이 들어가며 두 단어가 나누어졌어요.",
  },
  {
    title: "커서 왼쪽 지우기",
    instruction: "Backspace를 눌러 커서 왼쪽 글자를 지워보세요.",
    setup: "오늘은 컴퓨터를 배웁니다다|",
    sequence: ["Backspace"],
    success: "커서 왼쪽에 있던 글자가 지워졌어요.",
  },
  {
    title: "커서 오른쪽 지우기",
    instruction: "Delete를 눌러 커서 오른쪽 글자를 지워보세요.",
    setup: "오늘은 컴퓨터를 배웁니다|다",
    sequence: ["Delete"],
    success: "커서 오른쪽에 있던 글자가 지워졌어요.",
  },
  {
    title: "오른쪽으로 이동",
    instruction: "오른쪽 방향키를 눌러 커서를 오른쪽으로 움직여보세요.",
    setup: "오늘은 컴퓨터|를 배웁니다",
    sequence: ["ArrowRight"],
    success: "커서가 오른쪽으로 한 칸 움직였어요.",
  },
  {
    title: "왼쪽으로 이동",
    instruction: "왼쪽 방향키를 눌러 커서를 왼쪽으로 움직여보세요.",
    setup: "오늘은 컴퓨터를| 배웁니다",
    sequence: ["ArrowLeft"],
    success: "커서가 왼쪽으로 한 칸 움직였어요.",
  },
  {
    title: "줄 바꾸기",
    instruction: "Enter를 눌러 줄을 바꿔보세요.",
    setup: "오늘은| 컴퓨터를 배웁니다",
    sequence: ["Enter"],
    success: "커서 위치에서 줄이 바뀌었어요.",
  },
  {
    title: "줄 사이 이동",
    instruction: "위쪽 방향키와 아래쪽 방향키를 차례대로 눌러 줄 사이를 이동해보세요.",
    setup: "첫째 줄입니다\n둘째| 줄입니다",
    sequence: ["ArrowUp", "ArrowDown"],
    success: "두 줄 사이에서 커서를 움직였어요.",
  },
];

const DAILY_DEFS = {
  space5: {
    title: "Space 키 5번 성공하기",
    progressText(progress) {
      return `${Math.min(progress.count || 0, 5)}/5`;
    },
    update(progress, key) {
      if (key === "Space") {
        progress.count = (progress.count || 0) + 1;
      }
      return (progress.count || 0) >= 5;
    },
  },
  erasePair: {
    title: "Backspace와 Delete 차이 알아보기",
    progressText(progress) {
      const left = progress.Backspace ? "Backspace 완료" : "Backspace";
      const right = progress.Delete ? "Delete 완료" : "Delete";
      return `${left} / ${right}`;
    },
    update(progress, key) {
      if (key === "Backspace" || key === "Delete") {
        progress[key] = true;
      }
      return progress.Backspace && progress.Delete;
    },
  },
  arrowsAll: {
    title: "방향키 4개 모두 성공하기",
    progressText(progress) {
      const done = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].filter((key) => progress[key]).length;
      return `${done}/4`;
    },
    update(progress, key) {
      if (key.startsWith("Arrow")) {
        progress[key] = true;
      }
      return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].every((arrow) => progress[arrow]);
    },
  },
  enter3: {
    title: "Enter 키 3번 성공하기",
    progressText(progress) {
      return `${Math.min(progress.count || 0, 3)}/3`;
    },
    update(progress, key) {
      if (key === "Enter") {
        progress.count = (progress.count || 0) + 1;
      }
      return (progress.count || 0) >= 3;
    },
  },
  tab3: {
    title: "Tab 키 3번 성공하기",
    progressText(progress) {
      return `${Math.min(progress.count || 0, 3)}/3`;
    },
    update(progress, key) {
      if (key === "Tab") {
        progress.count = (progress.count || 0) + 1;
      }
      return (progress.count || 0) >= 3;
    },
  },
  noHint3: {
    title: "힌트 없이 3번 성공하기",
    progressText(progress) {
      return `${Math.min(progress.count || 0, 3)}/3`;
    },
    update(progress, key, noHint) {
      if (noHint) {
        progress.count = (progress.count || 0) + 1;
      }
      return (progress.count || 0) >= 3;
    },
  },
};

let profile = loadProfile();

const state = {
  screen: "start",
  stage: profile.lastStage || 1,
  stage1Index: 0,
  stage1Success: false,
  stage2Questions: [],
  stage2Index: 0,
  stage2Answered: false,
  stage3Index: 0,
  stage3SubIndex: 0,
  stage3Complete: false,
  editor: null,
  stage4Step: 0,
  stage4Complete: false,
  stage4Setup: {},
  form: {
    applicantName: profile.name || "",
    country: "",
    learn: "",
    message: "",
  },
  feedback: "",
  feedbackType: "notice",
  hintLevel: 0,
};

app.addEventListener("click", handleClick);
app.addEventListener("input", handleInput);
document.addEventListener("keydown", handleKeyDown, { passive: false });
document.addEventListener("keyup", handleKeyUp, { passive: false });

render();

function createEmptyProfile() {
  const keys = {};
  ACHIEVEMENT_KEYS.forEach((key) => {
    keys[key] = {
      success: 0,
      noHint: 0,
      badge: false,
    };
  });
  return {
    name: "",
    keys,
    lastStage: 1,
    today: null,
    dailyHistory: {},
  };
}

function loadProfile() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (error) {
    raw = null;
  }

  const base = createEmptyProfile();
  if (raw && typeof raw === "object") {
    base.name = typeof raw.name === "string" ? raw.name : "";
    base.lastStage = clampStage(raw.lastStage || 1);
    base.dailyHistory = raw.dailyHistory && typeof raw.dailyHistory === "object" ? raw.dailyHistory : {};
    ACHIEVEMENT_KEYS.forEach((key) => {
      const saved = raw.keys && raw.keys[key] ? raw.keys[key] : {};
      base.keys[key] = {
        success: Number(saved.success) || 0,
        noHint: Number(saved.noHint) || 0,
        badge: Boolean(saved.badge),
      };
    });
    base.today = raw.today && typeof raw.today === "object" ? raw.today : null;
  }

  ensureToday(base);
  return base;
}

function saveProfile() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn("학습 기록을 저장하지 못했습니다.", error);
  }
}

function ensureToday(targetProfile) {
  const today = todayString();
  if (targetProfile.today && targetProfile.today.date === today) {
    normalizeDaily(targetProfile.today);
    return;
  }

  if (targetProfile.today && targetProfile.today.date) {
    targetProfile.dailyHistory[targetProfile.today.date] = targetProfile.today;
  }
  targetProfile.today = buildDaily(today);
}

function normalizeDaily(today) {
  today.missions = Array.isArray(today.missions) ? today.missions.filter((id) => DAILY_DEFS[id]) : [];
  if (today.missions.length !== 3) {
    const rebuilt = buildDaily(today.date || todayString());
    today.missions = rebuilt.missions;
  }
  today.progress = today.progress && typeof today.progress === "object" ? today.progress : {};
  today.completed = today.completed && typeof today.completed === "object" ? today.completed : {};
  today.missions.forEach((id) => {
    today.progress[id] = today.progress[id] && typeof today.progress[id] === "object" ? today.progress[id] : {};
    today.completed[id] = Boolean(today.completed[id]);
  });
}

function buildDaily(dateText) {
  const ids = Object.keys(DAILY_DEFS);
  const seed = dateText.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const missions = [];
  for (let index = 0; missions.length < 3; index += 1) {
    const id = ids[(seed + index * 2) % ids.length];
    if (!missions.includes(id)) {
      missions.push(id);
    }
  }
  return {
    date: dateText,
    missions,
    progress: missions.reduce((acc, id) => {
      acc[id] = {};
      return acc;
    }, {}),
    completed: missions.reduce((acc, id) => {
      acc[id] = false;
      return acc;
    }, {}),
  };
}

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampStage(stage) {
  const number = Number(stage) || 1;
  return Math.min(4, Math.max(1, number));
}

function handleClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  if (action === "start-new") {
    const nameInput = document.getElementById("learnerName");
    const name = nameInput ? nameInput.value.trim() : profile.name.trim();
    if (!name) {
      window.alert("이름을 입력한 뒤 시작해주세요.");
      return;
    }
    profile.name = name;
    profile.lastStage = 1;
    saveProfile();
    beginStage(1, true);
    return;
  }

  if (action === "resume") {
    const nameInput = document.getElementById("learnerName");
    const name = nameInput ? nameInput.value.trim() : profile.name.trim();
    if (name) {
      profile.name = name;
      saveProfile();
    }
    beginStage(profile.lastStage || 1, true);
    return;
  }

  if (action === "achievements") {
    state.screen = "achievements";
    render();
    return;
  }

  if (action === "home") {
    state.screen = "start";
    render();
    return;
  }

  if (action === "stage1-next") {
    moveStage1Next();
    return;
  }

  if (action === "windows-confirm") {
    confirmWindowsKey();
    return;
  }

  if (action === "stage2-next") {
    moveStage2Next();
    return;
  }

  if (action === "stage3-next") {
    moveStage3Next();
    return;
  }

  if (action === "stage4-type-done") {
    moveStage4AfterTyping();
    return;
  }

  if (action === "next-stage") {
    beginStage(clampStage(Number(button.dataset.stage)), true);
    return;
  }

  if (action === "reset-record") {
    if (window.confirm("저장된 이름, 성공 횟수, 배지, 오늘의 미션 기록을 모두 초기화할까요?")) {
      localStorage.removeItem(STORAGE_KEY);
      profile = loadProfile();
      state.screen = "start";
      state.stage = 1;
      resetRuntime();
      render();
    }
  }
}

function handleInput(event) {
  const target = event.target;
  if (!target.matches("[data-field]")) {
    return;
  }

  if (target.dataset.field === "learnerName") {
    profile.name = target.value;
    saveProfile();
    return;
  }

  if (state.screen === "game" && state.stage === 4) {
    readStage4Form();
  }
}

function handleKeyDown(event) {
  if (state.screen !== "game") {
    return;
  }

  if (isForbiddenCombo(event)) {
    event.preventDefault();
    state.feedback = "이번 게임에서는 조합키는 연습하지 않습니다. 키 하나만 천천히 눌러보세요.";
    state.feedbackType = "hint";
    render();
    return;
  }

  const keyId = normalizeKey(event);

  if (shouldPreventDefault(event, keyId)) {
    event.preventDefault();
  }

  if (!keyId || event.repeat) {
    return;
  }

  if (handleKeyboardAdvance(keyId)) {
    return;
  }

  if (keyId === "Windows") {
    state.feedback = "Windows 키는 실제로 누르지 않아도 됩니다. 화면에서 위치만 확인해주세요.";
    state.feedbackType = "hint";
    render();
    return;
  }

  if (state.stage === 1) {
    handleStage1Key(keyId);
  } else if (state.stage === 2) {
    handleStage2Key(keyId);
  } else if (state.stage === 3) {
    handleStage3Key(keyId);
  } else if (state.stage === 4) {
    handleStage4Key(event, keyId);
  }
}

function handleKeyUp(event) {
  if (state.screen !== "game") {
    return;
  }

  const keyId = normalizeKey(event);
  if (keyId === "Alt") {
    event.preventDefault();
  }
}

function handleKeyboardAdvance(keyId) {
  if (state.stage === 1) {
    const mission = STAGE1_MISSIONS[state.stage1Index];
    if (mission && mission.nonKeyboard && !state.stage1Success) {
      if (keyId === "Enter" || keyId === "Space") {
        confirmWindowsKey();
        return true;
      }
      return false;
    }
    if (mission && mission.nonKeyboard && state.stage1Success && (keyId === "Enter" || keyId === "Space")) {
      moveStage1Next();
      return true;
    }
    if (mission && state.stage1Success && keyId === mission.key) {
      moveStage1Next();
      return true;
    }
  }

  if (state.stage === 2 && state.stage2Answered) {
    const question = state.stage2Questions[state.stage2Index];
    if (!question || keyId !== question.answer) {
      return false;
    }
    moveStage2Next();
    return true;
  }

  if (state.stage === 3 && state.stage3Complete) {
    const mission = STAGE3_MISSIONS[state.stage3Index];
    const expected = mission ? mission.sequence[state.stage3SubIndex] : null;
    if (!expected || keyId !== expected) {
      return false;
    }
    moveStage3Next();
    return true;
  }

  return false;
}

function isForbiddenCombo(event) {
  const key = String(event.key || "").toLowerCase();
  if (event.altKey && (key === "tab" || key === "f4")) {
    return true;
  }
  if (event.ctrlKey && ["w", "r", "l"].includes(key)) {
    return true;
  }
  if (event.metaKey && key !== "meta") {
    return true;
  }
  return false;
}

function shouldPreventDefault(event, keyId) {
  if (!keyId || !PREVENT_GAME_KEYS.has(keyId)) {
    return false;
  }

  if (state.stage === 4) {
    const isFormTarget = isEditableTarget(event.target);
    if (keyId === "Tab") {
      return true;
    }
    if (keyId === "Enter" && state.stage4Step === 7) {
      return true;
    }
    return !isFormTarget;
  }

  return true;
}

function isEditableTarget(target) {
  if (!target || !target.tagName) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

function normalizeKey(event) {
  return Object.entries(KEY_MAP).find(([, rule]) => {
    const keys = rule.keys || [];
    const codes = rule.codes || [];
    return keys.includes(event.key) || codes.includes(event.code);
  })?.[0] || null;
}

function beginStage(stageNumber, resetStage) {
  state.screen = "game";
  state.stage = clampStage(stageNumber);
  profile.lastStage = state.stage;
  saveProfile();

  state.feedback = "";
  state.feedbackType = "notice";
  state.hintLevel = 0;

  if (state.stage === 1 && resetStage) {
    state.stage1Index = 0;
    state.stage1Success = false;
  }

  if (state.stage === 2 && resetStage) {
    state.stage2Questions = shuffle(STAGE2_BANK).slice(0, 10);
    state.stage2Index = 0;
    state.stage2Answered = false;
  }

  if (state.stage === 3 && resetStage) {
    state.stage3Index = 0;
    setupStage3Mission();
  }

  if (state.stage === 4 && resetStage) {
    state.stage4Step = 0;
    state.stage4Complete = false;
    state.stage4Setup = {};
    state.form = {
      applicantName: profile.name || "",
      country: "",
      learn: "",
      message: "",
    };
  }

  render();
}

function resetRuntime() {
  state.stage1Index = 0;
  state.stage1Success = false;
  state.stage2Questions = [];
  state.stage2Index = 0;
  state.stage2Answered = false;
  state.stage3Index = 0;
  state.stage3SubIndex = 0;
  state.stage3Complete = false;
  state.editor = null;
  state.stage4Step = 0;
  state.stage4Complete = false;
  state.stage4Setup = {};
  state.form = {
    applicantName: "",
    country: "",
    learn: "",
    message: "",
  };
  state.feedback = "";
  state.feedbackType = "notice";
  state.hintLevel = 0;
}

function handleStage1Key(keyId) {
  const mission = STAGE1_MISSIONS[state.stage1Index];
  if (!mission || mission.nonKeyboard || state.stage1Success) {
    return;
  }

  if (keyId === mission.key) {
    const result = recordSuccess(mission.key, state.hintLevel === 0);
    state.stage1Success = true;
    state.feedback = appendBadgeText("성공! 한 번 더 누르기!", result);
    state.feedbackType = "success";
    render();
    return;
  }

  showHint(mission.key);
}

function moveStage1Next() {
  if (!state.stage1Success) {
    return;
  }

  if (state.stage1Index >= STAGE1_MISSIONS.length - 1) {
    profile.lastStage = 2;
    saveProfile();
    beginStage(2, true);
    return;
  }

  state.stage1Index += 1;
  state.stage1Success = false;
  state.hintLevel = 0;
  state.feedback = "";
  state.feedbackType = "notice";
  render();
}

function confirmWindowsKey() {
  const mission = STAGE1_MISSIONS[state.stage1Index];
  if (!mission || mission.key !== "Windows" || state.stage1Success) {
    return;
  }

  const result = recordSuccess("Windows", true);
  state.stage1Success = true;
    state.feedback = appendBadgeText("성공! Enter 또는 Space 한 번 더 누르기!", result);
  state.feedbackType = "success";
  render();
}

function handleStage2Key(keyId) {
  const question = state.stage2Questions[state.stage2Index];
  if (!question || state.stage2Answered) {
    return;
  }

  if (keyId === question.answer) {
    const result = recordSuccess(question.answer, state.hintLevel === 0);
    state.stage2Answered = true;
    state.feedback = appendBadgeText("성공! 한 번 더 누르기!", result);
    state.feedbackType = "success";
    render();
    return;
  }

  showHint(question.answer);
}

function moveStage2Next() {
  if (!state.stage2Answered) {
    return;
  }

  if (state.stage2Index >= state.stage2Questions.length - 1) {
    profile.lastStage = 3;
    saveProfile();
    beginStage(3, true);
    return;
  }

  state.stage2Index += 1;
  state.stage2Answered = false;
  state.hintLevel = 0;
  state.feedback = "";
  state.feedbackType = "notice";
  render();
}

function setupStage3Mission() {
  const mission = STAGE3_MISSIONS[state.stage3Index];
  if (!mission) {
    return;
  }
  const parsed = parseEditorSetup(mission.setup);
  state.editor = {
    text: parsed.text,
    cursor: parsed.cursor,
  };
  state.stage3SubIndex = 0;
  state.stage3Complete = false;
  state.hintLevel = 0;
  state.feedback = "";
  state.feedbackType = "notice";
}

function handleStage3Key(keyId) {
  const mission = STAGE3_MISSIONS[state.stage3Index];
  if (!mission || state.stage3Complete) {
    return;
  }

  const expected = mission.sequence[state.stage3SubIndex];
  if (keyId === expected) {
    applyVirtualEdit(keyId);
    const result = recordSuccess(keyId, state.hintLevel === 0);
    if (state.stage3SubIndex >= mission.sequence.length - 1) {
      state.stage3Complete = true;
      state.feedback = appendBadgeText("성공! 한 번 더 누르기!", result);
      state.feedbackType = "success";
    } else {
      state.stage3SubIndex += 1;
      const nextKey = mission.sequence[state.stage3SubIndex];
      state.feedback = `좋아요. 이제 ${keyDisplayName(nextKey)} 키를 눌러보세요.`;
      state.feedbackType = "notice";
    }
    render();
    return;
  }

  state.hintLevel = Math.min(3, state.hintLevel + 1);
  state.feedback = `괜찮아요. 천천히 찾아보세요. 이번 미션은 ${keyDisplayName(expected)} 키입니다.`;
  state.feedbackType = "hint";
  render();
}

function moveStage3Next() {
  if (!state.stage3Complete) {
    return;
  }

  if (state.stage3Index >= STAGE3_MISSIONS.length - 1) {
    profile.lastStage = 4;
    saveProfile();
    beginStage(4, true);
    return;
  }

  state.stage3Index += 1;
  setupStage3Mission();
  render();
}

function handleStage4Key(event, keyId) {
  if (state.stage4Complete) {
    return;
  }

  const expected = getStage4ExpectedKey();
  if (!expected) {
    return;
  }

  if (keyId !== expected) {
    if (PREVENT_GAME_KEYS.has(keyId)) {
      event.preventDefault();
    }
    state.hintLevel = Math.min(3, state.hintLevel + 1);
    state.feedback = `괜찮아요. 지금은 ${KEY_INFO[expected].label} 키를 연습하는 차례입니다.`;
    state.feedbackType = "hint";
    render();
    return;
  }

  if (keyId === "Tab") {
    event.preventDefault();
    readStage4Form();
    const result = recordSuccess("Tab", state.hintLevel === 0);
    state.hintLevel = 0;
    if (state.stage4Step === 1) {
      state.stage4Step = 2;
      state.feedback = appendBadgeText("좋아요. Tab으로 다음 칸으로 이동했어요.", result);
    } else if (state.stage4Step === 5) {
      state.stage4Step = 6;
      state.feedback = appendBadgeText("좋아요. 오늘의 한마디 칸으로 이동했어요.", result);
    }
    state.feedbackType = "success";
    render();
    return;
  }

  if (keyId === "Enter" && state.stage4Step === 7) {
    event.preventDefault();
    readStage4Form();
    const result = recordSuccess("Enter", state.hintLevel === 0);
    state.stage4Complete = true;
    state.hintLevel = 0;
    state.feedback = appendBadgeText("축하합니다. 이제 키보드의 중요한 키들을 사용할 수 있어요!", result);
    state.feedbackType = "success";
    saveProfile();
    render();
    return;
  }

  if (["Backspace", "Delete", "Enter"].includes(keyId)) {
    const noHint = state.hintLevel === 0;
    window.setTimeout(() => {
      readStage4Form();
      const result = recordSuccess(keyId, noHint);
      state.hintLevel = 0;
      if (keyId === "Backspace") {
        state.stage4Step = 4;
        state.feedback = appendBadgeText("좋아요. Backspace로 커서 왼쪽 글자를 지웠어요.", result);
      } else if (keyId === "Delete") {
        state.stage4Step = 5;
        state.feedback = appendBadgeText("좋아요. Delete로 커서 오른쪽 글자를 지웠어요.", result);
      } else {
        state.stage4Step = 7;
        state.feedback = appendBadgeText("좋아요. Enter로 줄을 바꾸었어요.", result);
      }
      state.feedbackType = "success";
      render();
    }, 0);
  }
}

function moveStage4AfterTyping() {
  readStage4Form();

  if (state.stage4Step === 0) {
    if (!state.form.applicantName.trim()) {
      window.alert("이름 칸에 이름을 입력해주세요.");
      return;
    }
    profile.name = state.form.applicantName.trim();
    saveProfile();
    state.stage4Step = 1;
    state.feedback = "이제 Tab 키로 다음 칸으로 이동해볼게요.";
    state.feedbackType = "notice";
    render();
    return;
  }

  if (state.stage4Step === 2) {
    if (!state.form.country.trim()) {
      window.alert("나라 칸에 나라 이름을 입력해주세요.");
      return;
    }
    state.stage4Step = 3;
    state.stage4Setup.backspace = false;
    state.feedback = "나라 칸 끝에 붙은 낯선 글자를 Backspace로 지워보세요.";
    state.feedbackType = "notice";
    render();
  }
}

function getStage4ExpectedKey() {
  if (state.stage4Step === 1 || state.stage4Step === 5) {
    return "Tab";
  }
  if (state.stage4Step === 3) {
    return "Backspace";
  }
  if (state.stage4Step === 4) {
    return "Delete";
  }
  if (state.stage4Step === 6 || state.stage4Step === 7) {
    return "Enter";
  }
  return null;
}

function showHint(answerKey) {
  state.hintLevel = Math.min(3, state.hintLevel + 1);
  if (state.hintLevel === 1) {
    state.feedback = "괜찮아요. 천천히 찾아보세요.";
  } else if (state.hintLevel === 2) {
    state.feedback = `괜찮아요. ${KEY_INFO[answerKey].location}`;
  } else {
    state.feedback = "괜찮아요. 키보드 그림에서 더 강하게 반짝이는 곳을 확인해보세요.";
  }
  state.feedbackType = "hint";
  render();
}

function recordSuccess(key, noHint) {
  if (!profile.keys[key]) {
    return { badgeAwarded: false };
  }

  profile.keys[key].success += 1;
  if (noHint) {
    profile.keys[key].noHint += 1;
  }

  let badgeAwarded = false;
  if (!profile.keys[key].badge && profile.keys[key].noHint >= 5) {
    profile.keys[key].badge = true;
    badgeAwarded = true;
  }

  updateDailyMissions(key, noHint);
  saveProfile();
  return {
    badgeAwarded,
    badgeName: KEY_INFO[key].badge,
  };
}

function updateDailyMissions(key, noHint) {
  ensureToday(profile);
  const today = profile.today;
  today.missions.forEach((id) => {
    if (today.completed[id]) {
      return;
    }
    const progress = today.progress[id] || {};
    today.progress[id] = progress;
    if (DAILY_DEFS[id].update(progress, key, noHint)) {
      today.completed[id] = true;
    }
  });
}

function appendBadgeText(message, result) {
  if (result && result.badgeAwarded) {
    return `${message} 새 배지 '${result.badgeName}'을 받았어요.`;
  }
  return message;
}

function randomPraise() {
  return PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
}

function render() {
  ensureToday(profile);
  if (state.screen === "achievements") {
    renderAchievements();
  } else if (state.screen === "game") {
    renderGame();
  } else {
    renderStart();
  }
}

function renderStart() {
  app.innerHTML = `
    <main class="screen-panel">
      <section class="intro-copy" aria-labelledby="mainTitle">
        <h1 id="mainTitle">키보드 첫걸음 미션</h1>
        <p>컴퓨터를 처음 배우는 분을 위한 키보드 특수키 연습 게임입니다.</p>
        <ul class="intro-list">
          <li><span class="check-dot">1</span><span>키의 위치를 큰 키보드 그림으로 확인합니다.</span></li>
          <li><span class="check-dot">2</span><span>실제 키를 눌러 역할을 몸으로 익힙니다.</span></li>
          <li><span class="check-dot">3</span><span>성공 횟수와 배지가 같은 브라우저에 저장됩니다.</span></li>
        </ul>
      </section>
      <section class="start-card" aria-label="시작하기">
        <label class="field-label" for="learnerName">이름</label>
        <input
          id="learnerName"
          class="text-input"
          data-field="learnerName"
          type="text"
          autocomplete="name"
          value="${escapeAttr(profile.name)}"
          placeholder="이름을 입력하세요"
        />
        <div class="button-row">
          <button class="btn" type="button" data-action="start-new">처음부터 시작하기</button>
          <button class="btn secondary" type="button" data-action="resume">이어서 하기</button>
          <button class="btn secondary" type="button" data-action="achievements">성취표 보기</button>
        </div>
        ${renderDailyBox()}
      </section>
    </main>
  `;
}

function renderGame() {
  if (state.stage === 2 && state.stage2Questions.length === 0) {
    state.stage2Questions = shuffle(STAGE2_BANK).slice(0, 10);
  }
  if (state.stage === 3 && !state.editor) {
    setupStage3Mission();
  }

  const view = getStageView();
  app.innerHTML = `
    <main class="game-shell">
      <header class="game-topbar">
        <div class="top-actions">
          <button class="btn secondary small" type="button" data-action="home">처음 화면</button>
          <button class="btn secondary small" type="button" data-action="achievements">성취표</button>
        </div>
        <div class="stage-title">
          <strong>${escapeHtml(STAGE_TITLES[state.stage])}</strong>
          <span>${escapeHtml(profile.name || "학습자")}님, 천천히 눌러도 괜찮아요.</span>
        </div>
        <div class="stat-strip" aria-label="학습 현황">
          <div class="stat"><b>${state.stage}/4</b><span>현재 단계</span></div>
          <div class="stat"><b>${totalSuccessCount()}</b><span>성공 횟수</span></div>
          <div class="stat"><b>${badgeCount()}</b><span>배지 수</span></div>
        </div>
      </header>
      <div class="game-main">
        <section class="keyboard-panel" aria-label="키보드 그림">
          <div class="keyboard-heading">
            <strong>키보드 위치</strong>
            <span>반짝이는 키를 찾아보세요.</span>
          </div>
          ${renderKeyboard(view.highlight, view.strong)}
        </section>
        ${view.mission}
      </div>
    </main>
  `;

  afterRenderGame();
}

function getStageView() {
  if (state.stage === 1) {
    return renderStage1View();
  }
  if (state.stage === 2) {
    return renderStage2View();
  }
  if (state.stage === 3) {
    return renderStage3View();
  }
  return renderStage4View();
}

function keyDisplayName(key) {
  return KEY_INFO[key].displayName || KEY_INFO[key].label;
}

function renderReadingSection(key) {
  const info = KEY_INFO[key];
  if (!info || !info.reading) {
    return "";
  }
  return `
    <div class="lesson-section reading-section">
      <strong>읽는 법</strong>
      <p>${escapeHtml(info.displayName || `${info.label} (${info.reading})`)}</p>
    </div>
  `;
}

function renderMissionLine(baseText) {
  const suffix = state.feedback ? ` - ${state.feedback}` : "";
  return escapeHtml(`${baseText}${suffix}`);
}

function renderStage1View() {
  const mission = STAGE1_MISSIONS[state.stage1Index];
  const info = KEY_INFO[mission.key];
  const highlight = [mission.key];
  const strong = state.hintLevel >= 3 ? [mission.key] : [];
  const role = mission.groupRole || info.role;
  const progress = ((state.stage1Index + (state.stage1Success ? 1 : 0)) / STAGE1_MISSIONS.length) * 100;

  return {
    highlight,
    strong,
    card: `
      <aside class="lesson-card">
        <h2>${escapeHtml(mission.keyName)}</h2>
        ${renderReadingSection(mission.key)}
        <div class="lesson-section">
          <strong>위치</strong>
          <p>${escapeHtml(info.location)}</p>
        </div>
        <div class="lesson-section">
          <strong>역할</strong>
          <p>${escapeHtml(role)}</p>
        </div>
        ${mission.extra ? `<div class="note-box">${escapeHtml(mission.extra)}</div>` : ""}
      </aside>
    `,
    mission: `
      <section class="mission-panel">
        <div class="progress-bar" aria-label="1단계 진행률"><span style="width: ${progress}%"></span></div>
        <div class="mission-head">
          <p class="mission-text ${state.feedbackType}">${renderMissionLine(mission.mission)}</p>
          <div class="stage-actions">
            ${
              mission.nonKeyboard && !state.stage1Success
                ? `<button class="btn warning" type="button" data-action="windows-confirm">위치 확인 완료</button>`
                : ""
            }
          </div>
        </div>
        <aside class="lesson-card">
          <h2>${escapeHtml(mission.keyName)}</h2>
          ${renderReadingSection(mission.key)}
          <div class="lesson-section">
            <strong>위치</strong>
            <p>${escapeHtml(info.location)}</p>
          </div>
          <div class="lesson-section">
            <strong>역할</strong>
            <p>${escapeHtml(role)}</p>
          </div>
          ${mission.extra ? `<div class="note-box">${escapeHtml(mission.extra)}</div>` : ""}
        </aside>
      </section>
    `,
  };
}

function renderStage2View() {
  const question = state.stage2Questions[state.stage2Index];
  const answer = question.answer;
  const showAnswer = state.stage2Answered || state.hintLevel >= 2;
  const highlight = state.stage2Answered || state.hintLevel >= 3 ? [answer] : [];
  const strong = state.hintLevel >= 3 && !state.stage2Answered ? [answer] : [];
  const progress = ((state.stage2Index + (state.stage2Answered ? 1 : 0)) / state.stage2Questions.length) * 100;
  const missionText = state.feedback || "상황을 읽고 알맞은 키 하나를 눌러보세요.";

  return {
    highlight,
    strong,
    card: `
      <aside class="lesson-card">
        <h2>상황 문제 ${state.stage2Index + 1}</h2>
        <div class="lesson-section">
          <strong>방법</strong>
          <p>문장을 읽고 맞는 키 하나를 눌러주세요. Ctrl과 Alt는 단독으로만 연습합니다.</p>
        </div>
        ${
          showAnswer
            ? `
              <div class="lesson-section">
                <strong>정답 키</strong>
                <p>${escapeHtml(keyDisplayName(answer))}</p>
              </div>
              ${renderReadingSection(answer)}
              <div class="lesson-section">
                <strong>위치</strong>
                <p>${escapeHtml(KEY_INFO[answer].location)}</p>
              </div>
            `
            : `<div class="note-box">힌트가 필요하면 다른 키를 눌렀을 때 위치 설명을 보여드릴게요.</div>`
        }
      </aside>
    `,
    mission: `
      <section class="mission-panel">
        <div class="progress-bar" aria-label="2단계 진행률"><span style="width: ${progress}%"></span></div>
        <div class="mission-head">
          <div class="scenario-card">
            <h3>상황</h3>
            <p>${escapeHtml(question.situation)}</p>
          </div>
        </div>
        <p class="mission-text ${state.feedbackType}">${escapeHtml(missionText)}</p>
        <aside class="lesson-card">
          <h2>상황 문제 ${state.stage2Index + 1}</h2>
          <div class="lesson-section">
            <strong>방법</strong>
            <p>문장을 읽고 맞는 키 하나를 눌러주세요. Ctrl과 Alt는 단독으로만 연습합니다.</p>
          </div>
          ${
            showAnswer
              ? `
                <div class="lesson-section">
                  <strong>정답 키</strong>
                  <p>${escapeHtml(keyDisplayName(answer))}</p>
                </div>
                ${renderReadingSection(answer)}
                <div class="lesson-section">
                  <strong>위치</strong>
                  <p>${escapeHtml(KEY_INFO[answer].location)}</p>
                </div>
              `
              : `<div class="note-box">힌트가 필요하면 다른 키를 눌렀을 때 위치 설명을 보여드릴게요.</div>`
          }
        </aside>
      </section>
    `,
  };
}

function renderStage3View() {
  const mission = STAGE3_MISSIONS[state.stage3Index];
  const expected = mission.sequence[state.stage3SubIndex];
  const highlight = [expected];
  const strong = state.hintLevel >= 3 ? [expected] : [];
  const progress = ((state.stage3Index + (state.stage3Complete ? 1 : 0)) / STAGE3_MISSIONS.length) * 100;

  return {
    highlight,
    strong,
    card: `
      <aside class="lesson-card">
        <h2>${escapeHtml(mission.title)}</h2>
        <div class="lesson-section">
          <strong>이번에 볼 역할</strong>
          <p>${escapeHtml(KEY_INFO[expected].role)}</p>
        </div>
        <div class="lesson-section">
          <strong>커서 표시</strong>
          <p>세로 막대가 지금 글자가 들어가거나 지워질 자리입니다.</p>
        </div>
      </aside>
    `,
    mission: `
      <section class="mission-panel">
        <div class="progress-bar" aria-label="3단계 진행률"><span style="width: ${progress}%"></span></div>
        <div class="mission-head">
          <p class="mission-text ${state.feedbackType}">${renderMissionLine(mission.instruction)}</p>
        </div>
        <aside class="lesson-card">
          <h2>${escapeHtml(mission.title)}</h2>
          <div class="lesson-section">
            <strong>이번에 볼 역할</strong>
            <p>${escapeHtml(KEY_INFO[expected].role)}</p>
          </div>
          ${renderReadingSection(expected)}
          <div class="lesson-section">
            <strong>커서 표시</strong>
            <p>세로 막대가 지금 글자가 들어가거나 지워질 자리입니다.</p>
          </div>
        </aside>
        <div class="editor-panel">
          <h3 class="editor-title">가상 문서 편집 영역</h3>
          <div class="virtual-editor" aria-live="polite">${renderVirtualEditor()}</div>
        </div>
      </section>
    `,
  };
}

function renderStage4View() {
  prepareStage4Step();
  const expected = getStage4ExpectedKey();
  const highlight = expected ? [expected] : [];
  const strong = state.hintLevel >= 3 && expected ? [expected] : [];
  const progress = getStage4Progress();
  const feedback = state.feedback || "가상의 신청서를 작성하며 Tab, Backspace, Delete, Enter를 함께 연습합니다.";
  const instruction = getStage4Instruction();

  return {
    highlight,
    strong,
    card: `
      <aside class="lesson-card">
        <h2>간단 신청서</h2>
        <div class="lesson-section">
          <strong>목표</strong>
          <p>입력칸 사이 이동, 글자 지우기, 줄 바꾸기, 제출을 차례대로 연습합니다.</p>
        </div>
        <div class="lesson-section">
          <strong>현재 할 일</strong>
          <p>${escapeHtml(instruction)}</p>
        </div>
      </aside>
    `,
    mission: `
      <section class="mission-panel">
        <div class="progress-bar" aria-label="4단계 진행률"><span style="width: ${progress}%"></span></div>
        ${
          state.stage4Complete
            ? renderStage4Complete()
            : `
              <div class="mission-head">
                <p class="mission-text">${escapeHtml(instruction)}</p>
                <div class="stage-actions">
                  ${
                    state.stage4Step === 0 || state.stage4Step === 2
                      ? `<button class="btn success" type="button" data-action="stage4-type-done">입력 완료</button>`
                      : ""
                  }
                </div>
              </div>
              <aside class="lesson-card">
                <h2>간단 신청서</h2>
                <div class="lesson-section">
                  <strong>목표</strong>
                  <p>입력칸 사이 이동, 글자 지우기, 줄 바꾸기, 제출을 차례대로 연습합니다.</p>
                </div>
                <div class="lesson-section">
                  <strong>현재 할 일</strong>
                  <p>${escapeHtml(instruction)}</p>
                </div>
                ${expected ? renderReadingSection(expected) : ""}
              </aside>
              ${renderApplicationForm()}
              <div class="feedback ${state.feedbackType}">${escapeHtml(feedback)}</div>
            `
        }
      </section>
    `,
  };
}

function renderStage4Complete() {
  return `
    <div class="completion-panel">
      <h2>축하합니다</h2>
      <p>이제 키보드의 중요한 키들을 사용할 수 있어요!</p>
      <div class="stage-actions">
        <button class="btn" type="button" data-action="achievements">성취표 보기</button>
        <button class="btn secondary" type="button" data-action="next-stage" data-stage="1">다시 연습하기</button>
      </div>
    </div>
  `;
}

function getStage4Instruction() {
  const steps = {
    0: "이름 칸에 이름을 입력하세요.",
    1: "Tab 키를 눌러 다음 칸으로 이동하세요.",
    2: "나라 칸에 나라 이름을 입력하세요.",
    3: "나라 칸 끝에 붙은 낯선 글자를 Backspace로 지워보세요.",
    4: "커서 오른쪽 글자를 지울 때는 Delete를 사용해보세요.",
    5: "Tab 키를 눌러 오늘의 한마디 칸으로 이동하세요.",
    6: "오늘의 한마디 칸에서 Enter를 눌러 줄을 바꿔보세요.",
    7: "마지막에 Enter를 한 번 더 눌러 제출해보세요.",
  };
  return steps[state.stage4Step] || "신청서 작성을 마쳤습니다.";
}

function getStage4Progress() {
  if (state.stage4Complete) {
    return 100;
  }
  return (state.stage4Step / 8) * 100;
}

function prepareStage4Step() {
  if (state.stage4Step === 3 && !state.stage4Setup.backspace) {
    const trimmed = state.form.country.trim() || "한국";
    state.form.country = trimmed.endsWith("ㄱ") ? trimmed : `${trimmed}ㄱ`;
    state.stage4Setup.backspace = true;
  }

  if (state.stage4Step === 4 && !state.stage4Setup.delete) {
    state.form.learn = "컴퓨터르 배우기";
    state.stage4Setup.delete = true;
  }

  if (state.stage4Step === 6 && !state.stage4Setup.message) {
    state.form.message = state.form.message || "오늘도 천천히 배웁니다";
    state.stage4Setup.message = true;
  }
}

function renderApplicationForm() {
  return `
    <div class="form-panel">
      <h3 class="form-title">가상 신청서</h3>
      <form class="practice-form" action="#" autocomplete="off">
        <div class="form-grid">
          ${renderFormField("applicantName", "이름", "text", state.form.applicantName)}
          ${renderFormField("country", "나라", "text", state.form.country)}
          ${renderFormField("learn", "배우고 싶은 것", "text", state.form.learn)}
          <div class="form-field full ${isStage4ActiveField("message") ? "active" : ""}">
            <label class="field-label" for="messageField">오늘의 한마디</label>
            <textarea
              id="messageField"
              class="form-textarea"
              data-field="message"
              rows="4"
            >${escapeHtml(state.form.message)}</textarea>
          </div>
        </div>
      </form>
    </div>
  `;
}

function renderFormField(field, label, type, value) {
  return `
    <div class="form-field ${isStage4ActiveField(field) ? "active" : ""}">
      <label class="field-label" for="${field}Field">${escapeHtml(label)}</label>
      <input
        id="${field}Field"
        class="form-input"
        data-field="${field}"
        type="${type}"
        value="${escapeAttr(value)}"
      />
    </div>
  `;
}

function isStage4ActiveField(field) {
  const activeByStep = {
    0: "applicantName",
    1: "applicantName",
    2: "country",
    3: "country",
    4: "learn",
    5: "learn",
    6: "message",
    7: "message",
  };
  return activeByStep[state.stage4Step] === field;
}

function afterRenderGame() {
  if (state.stage !== 4 || state.stage4Complete) {
    return;
  }

  const focusByStep = {
    0: { field: "applicantName", position: "end" },
    1: { field: "applicantName", position: "end" },
    2: { field: "country", position: "end" },
    3: { field: "country", position: "end" },
    4: { field: "learn", position: 3 },
    5: { field: "learn", position: "end" },
    6: { field: "message", position: "end" },
    7: { field: "message", position: "end" },
  };
  const request = focusByStep[state.stage4Step];
  if (!request) {
    return;
  }
  window.setTimeout(() => {
    const element = app.querySelector(`[data-field="${request.field}"]`);
    if (!element) {
      return;
    }
    element.focus();
    if (typeof element.setSelectionRange === "function") {
      const end = element.value.length;
      const position = request.position === "end" ? end : Math.min(Number(request.position), end);
      element.setSelectionRange(position, position);
    }
  }, 0);
}

function readStage4Form() {
  ["applicantName", "country", "learn", "message"].forEach((field) => {
    const element = app.querySelector(`[data-field="${field}"]`);
    if (element) {
      state.form[field] = element.value;
    }
  });
}

function renderKeyboard(highlightKeys = [], strongKeys = []) {
  const highlightSet = new Set(highlightKeys);
  const strongSet = new Set(strongKeys);
  const key = (id, label, className = "", subLabel = "") => `
    <div class="${keyClass(id, className, highlightSet, strongSet)}" data-key="${id}" aria-label="${escapeAttr(keyDisplayName(id))}">
      <span>${escapeHtml(label)}${subLabel ? `<small>${escapeHtml(subLabel)}</small>` : ""}</span>
    </div>
  `;
  const windowsKey = () => `
    <div class="${keyClass("Windows", "key-icon", highlightSet, strongSet)}" data-key="Windows" aria-label="${escapeAttr(keyDisplayName("Windows"))}">
      <span class="windows-key-mark" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </span>
      <small>아이콘(윈도우)</small>
    </div>
  `;
  const plainKey = (label, className = "") => `
    <div class="key key-filler ${className}" aria-hidden="true">
      <span>${escapeHtml(label)}</span>
    </div>
  `;

  return `
    <div class="keyboard" aria-hidden="true">
      <div class="key-row function-row">
        ${plainKey("Esc")}
        ${plainKey("F1")}
        ${plainKey("F2")}
        ${plainKey("F3")}
        ${plainKey("F4")}
        ${plainKey("F5")}
        ${plainKey("F6")}
        ${plainKey("F7")}
        ${plainKey("F8")}
        ${plainKey("F9")}
        ${plainKey("F10")}
        ${plainKey("F11")}
        ${plainKey("F12")}
      </div>
      <div class="key-row">
        ${plainKey("`")}
        ${plainKey("1")}
        ${plainKey("2")}
        ${plainKey("3")}
        ${plainKey("4")}
        ${plainKey("5")}
        ${plainKey("6")}
        ${plainKey("7")}
        ${plainKey("8")}
        ${plainKey("9")}
        ${plainKey("0")}
        ${plainKey("-")}
        ${plainKey("=")}
        ${key("Backspace", "Backspace", "key-wide", "백스페이스")}
        ${key("Delete", "Delete", "", "딜리트")}
      </div>
      <div class="key-row">
        ${key("Tab", "Tab", "key-wide", "탭")}
        ${plainKey("Q")}
        ${plainKey("W")}
        ${plainKey("E")}
        ${plainKey("R")}
        ${plainKey("T")}
        ${plainKey("Y")}
        ${plainKey("U")}
        ${plainKey("I")}
        ${plainKey("O")}
        ${plainKey("P")}
        ${plainKey("[")}
        ${plainKey("]")}
        ${plainKey("\\")}
      </div>
      <div class="key-row">
        ${key("CapsLock", "Caps Lock", "key-wider", "캡스록")}
        ${plainKey("A")}
        ${plainKey("S")}
        ${plainKey("D")}
        ${plainKey("F")}
        ${plainKey("G")}
        ${plainKey("H")}
        ${plainKey("J")}
        ${plainKey("K")}
        ${plainKey("L")}
        ${plainKey(";")}
        ${plainKey("'")}
        ${key("Enter", "Enter", "key-wider", "엔터")}
      </div>
      <div class="key-row">
        ${key("Shift", "Shift", "key-shift", "왼쪽 쉬프트")}
        ${plainKey("Z")}
        ${plainKey("X")}
        ${plainKey("C")}
        ${plainKey("V")}
        ${plainKey("B")}
        ${plainKey("N")}
        ${plainKey("M")}
        ${plainKey(",")}
        ${plainKey(".")}
        ${plainKey("/")}
        ${key("Shift", "Shift", "key-shift", "오른쪽 쉬프트")}
      </div>
      <div class="key-row bottom-row">
        ${key("Control", "Ctrl", "", "왼쪽 컨트롤")}
        ${windowsKey()}
        ${key("Alt", "Alt", "", "왼쪽 알트")}
        ${key("Space", "Space", "key-space", "스페이스")}
        ${key("Alt", "Alt", "", "오른쪽 알트")}
        ${key("Control", "Ctrl", "", "오른쪽 컨트롤")}
        <div class="arrow-cluster" aria-label="방향키">
          ${key("ArrowUp", "↑", "key-arrow arrow-up", "위쪽")}
          ${key("ArrowLeft", "←", "key-arrow arrow-left", "왼쪽")}
          ${key("ArrowDown", "↓", "key-arrow arrow-down", "아래쪽")}
          ${key("ArrowRight", "→", "key-arrow arrow-right", "오른쪽")}
        </div>
      </div>
    </div>
  `;
}

function keyClass(id, className, highlightSet, strongSet) {
  const classes = ["key"];
  if (className) {
    classes.push(className);
  }
  if (highlightSet.has(id)) {
    classes.push("highlight");
  }
  if (strongSet.has(id)) {
    classes.push("strong-highlight");
  }
  return classes.join(" ");
}

function renderVirtualEditor() {
  if (!state.editor) {
    return "";
  }
  const text = state.editor.text;
  const cursor = Math.max(0, Math.min(state.editor.cursor, text.length));
  const before = escapeHtml(text.slice(0, cursor));
  const after = escapeHtml(text.slice(cursor));
  return `${before}<span class="cursor" aria-label="커서"></span>${after}`;
}

function parseEditorSetup(setup) {
  const cursor = setup.indexOf("|");
  return {
    text: setup.replace("|", ""),
    cursor: cursor >= 0 ? cursor : setup.length,
  };
}

function applyVirtualEdit(keyId) {
  const editor = state.editor;
  if (!editor) {
    return;
  }

  const before = editor.text.slice(0, editor.cursor);
  const after = editor.text.slice(editor.cursor);

  if (keyId === "Space") {
    editor.text = `${before} ${after}`;
    editor.cursor += 1;
  } else if (keyId === "Enter") {
    editor.text = `${before}\n${after}`;
    editor.cursor += 1;
  } else if (keyId === "Backspace") {
    if (editor.cursor > 0) {
      editor.text = `${editor.text.slice(0, editor.cursor - 1)}${after}`;
      editor.cursor -= 1;
    }
  } else if (keyId === "Delete") {
    if (editor.cursor < editor.text.length) {
      editor.text = `${before}${editor.text.slice(editor.cursor + 1)}`;
    }
  } else if (keyId === "ArrowLeft") {
    editor.cursor = Math.max(0, editor.cursor - 1);
  } else if (keyId === "ArrowRight") {
    editor.cursor = Math.min(editor.text.length, editor.cursor + 1);
  } else if (keyId === "ArrowUp" || keyId === "ArrowDown") {
    moveCursorVertical(keyId === "ArrowUp" ? -1 : 1);
  }
}

function moveCursorVertical(direction) {
  const editor = state.editor;
  const lines = editor.text.split("\n");
  const offsets = [];
  let running = 0;
  lines.forEach((line, index) => {
    offsets.push(running);
    running += line.length + (index < lines.length - 1 ? 1 : 0);
  });

  let currentLine = 0;
  for (let index = 0; index < offsets.length; index += 1) {
    const start = offsets[index];
    const end = start + lines[index].length;
    if (editor.cursor >= start && editor.cursor <= end) {
      currentLine = index;
      break;
    }
  }

  const column = editor.cursor - offsets[currentLine];
  const nextLine = Math.max(0, Math.min(lines.length - 1, currentLine + direction));
  editor.cursor = offsets[nextLine] + Math.min(column, lines[nextLine].length);
}

function renderAchievements() {
  app.innerHTML = `
    <main class="achievement-shell">
      <header class="achievement-header">
        <div>
          <h1>성취표</h1>
          <p>${escapeHtml(profile.name || "학습자")}님의 키별 연습 기록입니다. 같은 브라우저에서 계속 유지됩니다.</p>
        </div>
        <div class="top-actions">
          <button class="btn secondary" type="button" data-action="home">처음 화면</button>
          <button class="btn danger" type="button" data-action="reset-record">기록 초기화</button>
        </div>
      </header>
      ${renderDailyBox()}
      <div class="achievement-table-wrap">
        <table class="achievement-table">
          <thead>
            <tr>
              <th>키 이름</th>
              <th>성공 횟수</th>
              <th>힌트 없이 성공</th>
              <th>현재 단계</th>
              <th>받은 배지</th>
            </tr>
          </thead>
          <tbody>
            ${ACHIEVEMENT_KEYS.map(renderAchievementRow).join("")}
          </tbody>
        </table>
      </div>
    </main>
  `;
}

function renderAchievementRow(key) {
  const record = profile.keys[key];
  const badge = record.badge
    ? `<span class="badge">${escapeHtml(KEY_INFO[key].badge)}</span>`
    : `<span class="badge empty">아직 준비 중</span>`;
  return `
    <tr>
      <td class="key-name-cell">${escapeHtml(keyDisplayName(key))}</td>
      <td>${record.success}회</td>
      <td>${record.noHint}회</td>
      <td>${escapeHtml(achievementLevel(record))}</td>
      <td>${badge}</td>
    </tr>
  `;
}

function achievementLevel(record) {
  if (record.noHint >= 5) {
    return "혼자 할 수 있어요";
  }
  if (record.success >= 5) {
    return "익숙해지는 중";
  }
  if (record.success >= 3) {
    return "연습 중";
  }
  if (record.success >= 1) {
    return "새싹";
  }
  return "처음 준비";
}

function renderDailyBox() {
  const today = profile.today;
  return `
    <section class="daily-box" aria-label="오늘의 미션">
      <h2>오늘의 미션</h2>
      <ul class="daily-list">
        ${today.missions.map((id) => renderDailyItem(id, today)).join("")}
      </ul>
    </section>
  `;
}

function renderDailyItem(id, today) {
  const def = DAILY_DEFS[id];
  const done = Boolean(today.completed[id]);
  const progress = today.progress[id] || {};
  return `
    <li class="daily-item">
      <span>${escapeHtml(def.title)}</span>
      <span class="status-pill ${done ? "done" : ""}">${done ? "완료" : escapeHtml(def.progressText(progress))}</span>
    </li>
  `;
}

function totalSuccessCount() {
  return ACHIEVEMENT_KEYS.reduce((sum, key) => sum + profile.keys[key].success, 0);
}

function badgeCount() {
  return ACHIEVEMENT_KEYS.filter((key) => profile.keys[key].badge).length;
}

function shuffle(items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
