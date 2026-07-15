// 동호초 5학년 6차시 학생용 페이지
// 학생 자료는 5차시에서 사용한 character_profiles 조회 API를 재사용합니다.
const LESSON06_API_URL = "https://script.google.com/macros/s/AKfycbyICrDSlTbpBpzuv3U2n0RBTbvM4NUVgUJMQENJdep656lzO8YWR4AK4OlKsUddXNOZIw/exec";
const GEMINI_URL = "https://gemini.google.com/";

(() => {
  const SCHOOL_CODE = "dongho";
  const ACCOUNT_SHEET_URLS = {
    class1: "https://docs.google.com/spreadsheets/d/10gbPCPKfh60EDXtjqMtOiCzqidgTEheq/edit?rtpof=true",
    class2: "https://docs.google.com/spreadsheets/d/1XFjk5cMxPUYB8ptc6yuYBhy7AbrzYYdq/edit?rtpof=true"
  };
  const CLASS_ID = document.body.dataset.classId === "class2" ? "class2" : "class1";
  const STUDENTS = {
    class1: ["01. 곽예준", "02. 김민주", "03. 김우람", "04. 김태양", "05. 김태현", "06. 김효민", "07. 박민준", "08. 박하율", "09. 서자건", "10. 이정우", "11. 조예빈", "12. 지현서", "13. 차소민", "14. 채종후"],
    class2: ["01. 권하린", "02. 김리아", "03. 김문준", "04. 김아랑", "05. 김예슬", "06. 김우현", "07. 김효건", "08. 문서진", "09. 변수현", "10. 신예건", "11. 심현지", "12. 양승윤", "13. 연율", "14. 이정우", "15. 최푸른"]
  };
  const MISSING_LOCAL_CHARACTER_IMAGES = {
    class1: new Set(["9"]),
    class2: new Set()
  };

  // Google Drive 폴더에서 확인한 실제 학생별 Google Slides URL입니다.
  const SLIDE_LINKS = {
    class1: {
      "1": { name: "곽예준", url: "https://docs.google.com/presentation/d/1Qb6iiRj6OnIR1pK8GaTV63eBMH9Lk01csPWHtmhTcds/edit?usp=drivesdk" },
      "2": { name: "김민주", url: "https://docs.google.com/presentation/d/1W27mLvNC5KZCLous1YAyh6oK03tdmmb8--BLH6MWKuI/edit?usp=drivesdk" },
      "3": { name: "김우람", url: "https://docs.google.com/presentation/d/138xrtjcIrfEjDEY_4WqBUsoypre5j-ThiCuOvAgZMWA/edit?usp=drivesdk" },
      "4": { name: "김태양", url: "https://docs.google.com/presentation/d/1Ob39Ukwku3MOZQkGKQkB8VYji8_ey31vivHP3sIFMiA/edit?usp=drivesdk" },
      "5": { name: "김태현", url: "https://docs.google.com/presentation/d/1kDT3tPh5FbPP2y3ZnhGFtx8RNkQVDn_kIq5NeanRwJI/edit?usp=drivesdk" },
      "6": { name: "김효민", url: "https://docs.google.com/presentation/d/1UFB1dd3-JSkvMkbiHCL3r3XJ34eomcS34eo3hkNS_6w/edit?usp=drivesdk" },
      "7": { name: "박민준", url: "https://docs.google.com/presentation/d/1Oo8hV7-7wBHlwGXR1MnJ1GbSS7jmfTPcQ-RQmp-yjOs/edit?usp=drivesdk" },
      "8": { name: "박하율", url: "https://docs.google.com/presentation/d/1Fkdn_3VL1LBWtLGrNlq1WnNNUHelyj_8Tel63sl_Lzo/edit?usp=drivesdk" },
      "9": { name: "서자건", url: "https://docs.google.com/presentation/d/1aVIDgrrWaibRmLx2S3Mv3JidAzItM8eFfw-ZmoS_beQ/edit?usp=drivesdk" },
      "10": { name: "이정우", url: "https://docs.google.com/presentation/d/16oaJwvE9k410AidM2Iy8lw2jqyudoymucTfEZQOafg4/edit?usp=drivesdk" },
      "11": { name: "조예빈", url: "https://docs.google.com/presentation/d/1TqM_2HIGgQP88nUjXg8ljZMQr_3-FHCBqhgd5EWoIaY/edit?usp=drivesdk" },
      "12": { name: "지현서", url: "https://docs.google.com/presentation/d/1xLLacOZxlJh7m1gp2lheAb8xr4OZiQG-znLmr2RGlkc/edit?usp=drivesdk" },
      "13": { name: "차소민", url: "https://docs.google.com/presentation/d/10-jjlA0jtvQW4EKnKNrBi275xi_msezghd3VLBD3zOo/edit?usp=drivesdk" },
      "14": { name: "채종후", url: "https://docs.google.com/presentation/d/1797LteZ11_v_41H_AQFxQ0FhzNSr6Ra_GhMdzP7KHJo/edit?usp=drivesdk" }
    },
    class2: {
      "1": { name: "권하린", url: "https://docs.google.com/presentation/d/1a5HZ8TubUrmbwVQRWsGMDWW3MuSBlFQlKs8TUb2nExA/edit?usp=drivesdk" },
      "2": { name: "김리아", url: "https://docs.google.com/presentation/d/1gYLkjXMFHoo7KUZXwiUUsdI8QyEqZGrNmuxwmFrMT-I/edit?usp=drivesdk" },
      "3": { name: "김문준", url: "https://docs.google.com/presentation/d/1gUSWfKZTYWzKLO-euRUel51cYf1z7EfwibLQU7cuIY8/edit?usp=drivesdk" },
      "4": { name: "김아랑", url: "https://docs.google.com/presentation/d/148viVn-FiwTrGOa17q1dEwxwg1k33YHt9UbglRoQDF4/edit?usp=drivesdk" },
      "5": { name: "김예슬", url: "https://docs.google.com/presentation/d/1CeSerkaBtb7FQWXsKzA0DLCn596NcsexVRZsLWUy_K0/edit?usp=drivesdk" },
      "6": { name: "김우현", url: "https://docs.google.com/presentation/d/1br3TYNZc-ginfPLK8G18t3kEbxKWIa6y2cdehD-ag6k/edit?usp=drivesdk" },
      "7": { name: "김효건", url: "https://docs.google.com/presentation/d/1Q6Wp4F_9_jQGIQnvc6gFEmZMx5kM78e3vQCqv_XoHFk/edit?usp=drivesdk" },
      "8": { name: "문서진", url: "https://docs.google.com/presentation/d/1AJop5hMosKi9awVFzDKsRyM0Oe0-GmJeLzi8BFdkZoo/edit?usp=drivesdk" },
      "9": { name: "변수현", url: "https://docs.google.com/presentation/d/1Gj37_2Uu7b8WCjMzG7wvOrw8lj8ddelVmt-hjJxQlzg/edit?usp=drivesdk" },
      "10": { name: "신예건", url: "https://docs.google.com/presentation/d/1nK50vbPDCgjTdrffQffrHb5c2DasV59LlUQGG5gBu88/edit?usp=drivesdk" },
      "11": { name: "심현지", url: "https://docs.google.com/presentation/d/13CMd2qgOGJBFwRtLn3h8fQTvdj-7_W627PdXxA1z_FU/edit?usp=drivesdk" },
      "12": { name: "양승윤", url: "https://docs.google.com/presentation/d/1hGYwQzhLuwcNm_U6su-yu4hzhFZGY0kkZmzISJ0B5O8/edit?usp=drivesdk" },
      "13": { name: "연율", url: "https://docs.google.com/presentation/d/189SpaNrBlbkg7qG9VZOSWRbW6MpByYSAqEhA3FWUJgE/edit?usp=drivesdk" },
      "14": { name: "이정우", url: "https://docs.google.com/presentation/d/1XnGSlNBqRaXpqWJboFpLUKNV0tu1rjaiukwrjrAQP88/edit?usp=drivesdk" },
      "15": { name: "최푸른", url: "https://docs.google.com/presentation/d/1KiKC19fI1BvG7Cks69Fx2Ljv1txdWFDrcNYjm-r5dlc/edit?usp=drivesdk" }
    }
  };

  // 첨부된 반별 Padlet 아웃브레이크 CSV의 학생별 음악 자료 링크입니다.
  const MUSIC_LINKS = {
    class1: {
      "1": { name: "곽예준", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:jPpUpJDT9Alf4hOzct0Zl" },
      "2": { name: "김민주", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:j9gYiFu7X9OmVSwVZMr9O" },
      "3": { name: "김우람", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:1TD83vKUFbdKsskdWrVhk" },
      "4": { name: "김태양", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:lB-urcukzvO0L_VANlEHm" },
      "5": { name: "김태현", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:ZsPYKWjziT5rbydv13CW_" },
      "6": { name: "김효민", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:MH1cHh0PAs1FxcNmj4zWA" },
      "7": { name: "박민준", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:b47pB7pJXB0Jz4vuAE0ej" },
      "8": { name: "박하율", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:fxnQr2eE3vAh2MJYXPGrx" },
      "9": { name: "서자건", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:x-dJstN_ZnGUrGEK3pBpM" },
      "10": { name: "이정우", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:rjw_2M62CDpiX1x-5CB_R" },
      "11": { name: "조예빈", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:lozA49wZWTiTBnYkxZgax" },
      "12": { name: "지현서", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:8mC0jH14UrWk9FnbywbC9" },
      "13": { name: "차소민", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:NLtsAUWOY47tOZ4uJnms7" },
      "14": { name: "채종후", url: "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:7zXEJ4q29IcHA7K2DfzRb" }
    },
    class2: {
      "1": { name: "권하린", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:mNSAcQotYUTMeKw3VwLox" },
      "2": { name: "김리아", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:vbN6GBniI-euCYxbKyI-i" },
      "3": { name: "김문준", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:BYM4Jkyz_s5mVmdIOkRj2" },
      "4": { name: "김아랑", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:IMHPvdMiTcKfMw_rPxnF3" },
      "5": { name: "김예슬", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:tjDrDBjoo-s5RQbn3VyfY" },
      "6": { name: "김우현", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:SSc0a5c6kInjzXFI2M3Z-" },
      "7": { name: "김효건", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:507Prenp3FvQzuidl1BDd" },
      "8": { name: "문서진", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:Tn-lNxC4FqXa-xrGHHCVY" },
      "9": { name: "변수현", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:sxYoMvF7E4fCfWWTPrsaO" },
      "10": { name: "신예건", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:G6a2peq4wfNkFAPs5nLnc" },
      "11": { name: "심현지", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:K-mD0cZDGLaAIuMGbHvZx" },
      "12": { name: "양승윤", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:VhWTLd-LX9e6fGAc8aiFA" },
      "13": { name: "연율", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:U7wG6E_1kHGUBFwhOpsOz" },
      "14": { name: "이정우", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:f0YIi83ICqapsyz0HAQ_u" },
      "15": { name: "최푸른", url: "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:mLus5Hovqz0RIxMk5vK4D" }
    }
  };

  const QUESTION_BY_PART = {
    "표정": "어떤 표정으로 바꾸고 싶나요?",
    "색상": "무엇의 색을 어떤 색으로 바꾸고 싶나요?",
    "옷": "어떤 옷으로 바꾸고 싶나요?",
    "자세": "어떤 행동이나 자세로 바꾸고 싶나요?",
    "소품": "무엇을 빼거나 추가하고 싶나요?",
    "배경": "어떤 장소나 색의 배경을 원하나요?",
    "그림 스타일": "어떤 그림 느낌을 원하나요?",
    "특별한 효과": "대표 스킬을 어떤 효과로 보여 주고 싶나요?"
  };
  const PLACEHOLDER_BY_PART = {
    "표정": "예: 눈을 조금 크게 하고 밝게 웃는 표정으로 바꿔 줘.",
    "색상": "예: 망토 색을 진한 파란색으로 바꿔 줘.",
    "옷": "예: 갑옷을 단순한 게임 캐릭터 옷으로 바꿔 줘.",
    "자세": "예: 한 손을 앞으로 내밀고 스킬을 쓰는 자세로 바꿔 줘.",
    "소품": "예: 손에 작은 방패를 추가해 줘.",
    "배경": "예: 캐릭터가 잘 보이는 단순한 밤하늘 배경으로 바꿔 줘.",
    "그림 스타일": "예: 밝고 귀여운 2D 게임 일러스트 느낌으로 바꿔 줘.",
    "특별한 효과": "예: 대표 스킬이 파란 원형 보호막처럼 보이게 해 줘."
  };
  const EDIT_PARTS = Object.keys(QUESTION_BY_PART);
  const VAGUE_WORDS = ["멋지게", "예쁘게", "귀엽게", "좋게", "강하게"];
  const IMAGE_LABELS = { original: "기존 이미지", first: "첫 번째 수정 이미지", second: "두 번째 수정 이미지" };
  const STYLE_CHOICES = [
    { icon: "🎮", title: "2D 게임 일러스트", detail: "밝고 귀여운 2D 게임 일러스트 느낌으로 바꿔 줘.", note: "색이 선명하고 캐릭터가 또렷해요." },
    { icon: "🧩", title: "픽셀 아트", detail: "작은 네모 칸으로 만든 픽셀 아트 느낌으로 바꿔 줘.", note: "옛날 게임 화면 같은 느낌이에요." },
    { icon: "💬", title: "만화·웹툰", detail: "굵은 선과 선명한 표정이 보이는 만화·웹툰 느낌으로 바꿔 줘.", note: "만화책 주인공 같은 느낌이에요." },
    { icon: "🎨", title: "수채화", detail: "물감이 부드럽게 번지는 따뜻한 수채화 느낌으로 바꿔 줘.", note: "부드럽고 포근한 느낌이에요." },
    { icon: "✨", title: "애니메이션", detail: "선명한 색과 애니메이션 캐릭터 같은 그림 느낌으로 바꿔 줘.", note: "애니메이션 속 주인공 같은 느낌이에요." },
    { icon: "🔍", title: "사실적인 디지털 그림", detail: "빛과 그림자가 자세히 보이는 사실적인 디지털 그림 느낌으로 바꿔 줘.", note: "실제로 그린 듯 자세한 느낌이에요." }
  ];
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  let state = blankState();

  function blankState(studentId = "") {
    return {
      studentId,
      studentName: "",
      profile: null,
      profileChecks: [],
      satisfaction: "",
      keepPart: "",
      keepCustom: "",
      editParts: [],
      editDetails: {},
      firstPrompt: "",
      firstResultEvaluation: "",
      firstKeepEvaluation: "",
      nextAction: "",
      secondEditPart: "",
      secondEditDetail: "",
      secondPrompt: "",
      firstOpened: false,
      secondOpened: false,
      editCount: 0,
      selectedImage: "",
      selectionReason: "",
      slideSaved: false,
      finalChecks: [],
      completed: false
    };
  }

  function storageKey(studentId = state.studentId) {
    return studentId ? `dongho_${CLASS_ID}_${studentId}_lesson06` : "";
  }
  function lastStudentKey() { return `dongho_${CLASS_ID}_lesson06_last_student`; }
  function saveState() {
    const key = storageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.setItem(lastStudentKey(), String(state.studentId));
  }
  function loadState(studentId) {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey(studentId)) || "null");
      return value && String(value.studentId) === String(studentId) ? { ...blankState(studentId), ...value } : blankState(studentId);
    } catch (_) {
      return blankState(studentId);
    }
  }
  function setStatus(id, text, tone = "info") {
    const element = $(id);
    if (!element) return;
    element.textContent = text;
    element.dataset.tone = tone;
  }
  function nameOnly(name) { return String(name || "").replace(/^\s*\d+\s*[.]?\s*/, "").trim(); }
  function studentIdFromName(name) {
    const match = String(name || "").match(/^\s*(\d+)/);
    return match ? String(Number(match[1])) : "";
  }
  function safeText(value, fallback = "자료 확인 필요") {
    const text = String(value ?? "").trim();
    return text || fallback;
  }
  function normalizeProfile(raw = {}) {
    return {
      classId: raw.classId || raw.class_id || CLASS_ID,
      studentId: String(raw.studentId || raw.student_id || state.studentId),
      studentName: raw.studentName || raw.student_name || state.studentName,
      characterName: raw.characterName || raw.character_name || "",
      personality: raw.personality || "",
      mainSkill: raw.mainSkill || raw.main_skill || ""
    };
  }
  function localCharacterImageUrl() {
    const numericId = Number(state.studentId);
    if (!Number.isInteger(numericId) || numericId < 1 || MISSING_LOCAL_CHARACTER_IMAGES[CLASS_ID].has(String(numericId))) return "";
    const fileName = `${String(numericId).padStart(2, "0")}.png`;
    return new URL(`../assets/characters/${CLASS_ID}/${fileName}`, window.location.href).href;
  }
  function jsonp(params) {
    return new Promise((resolve, reject) => {
      if (!LESSON06_API_URL) { reject(new Error("missing-api")); return; }
      const callback = `lesson06Callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const query = new URLSearchParams({ ...params, callback });
      let finished = false;
      const timeout = setTimeout(() => finish(new Error("timeout")), 12000);
      function cleanup() { clearTimeout(timeout); delete window[callback]; script.remove(); }
      function finish(error, data) { if (finished) return; finished = true; cleanup(); error ? reject(error) : resolve(data); }
      window[callback] = (data) => finish(null, data);
      script.onerror = () => finish(new Error("network"));
      script.src = `${LESSON06_API_URL}?${query.toString()}`;
      document.body.appendChild(script);
    });
  }
  function getSlideRecord() {
    const record = SLIDE_LINKS[CLASS_ID]?.[String(state.studentId)];
    return record && nameOnly(record.name) === nameOnly(state.studentName) ? record : null;
  }
  function getMusicRecord() {
    const record = MUSIC_LINKS[CLASS_ID]?.[String(state.studentId)];
    return record && nameOnly(record.name) === nameOnly(state.studentName) ? record : null;
  }
  function setLink(id, url, emptyMessage, readyMessage, statusId) {
    const link = $(id);
    if (!link) return;
    if (url) {
      link.href = url;
      link.setAttribute("aria-disabled", "false");
      link.classList.remove("disabled");
      link.removeAttribute("tabindex");
      if (statusId) setStatus(statusId, readyMessage, "success");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      link.classList.add("disabled");
      if (statusId) setStatus(statusId, emptyMessage, "warning");
    }
  }
  function setGeminiLink(id, ready) {
    const link = $(id);
    if (!link) return;
    link.href = GEMINI_URL;
    link.setAttribute("aria-disabled", ready ? "false" : "true");
    link.classList.toggle("disabled", !ready);
    if (ready) link.removeAttribute("tabindex");
    else link.setAttribute("tabindex", "-1");
  }
  function renderProfile() {
    const card = $("characterCard");
    const hasProfile = Boolean(state.profile);
    card.hidden = !hasProfile;
    $("profileChecks").disabled = !hasProfile;
    if (!hasProfile) {
      setLink("slidesLink", "", "내 캐릭터 슬라이드를 확인하고 있습니다. 선생님께 알려 주세요.", "", "slidesLinkStatus");
      setLink("musicLink", "", "내 음악 자료를 확인하고 있습니다. 선생님께 알려 주세요.", "", "");
      setLink("slidesLinkSave", "", "내 캐릭터 슬라이드를 확인하고 있습니다. 선생님께 알려 주세요.", "", "slideSavedStatus");
      $("markSlideSaved").disabled = true;
      return;
    }
    const profile = state.profile;
    $("studentNameText").textContent = safeText(state.studentName, safeText(profile.studentName));
    $("cardCharacterName").textContent = safeText(profile.characterName);
    $("cardPersonality").textContent = safeText(profile.personality);
    $("cardMainSkill").textContent = safeText(profile.mainSkill);
    const visual = $("characterVisual");
    visual.replaceChildren();
    visual.classList.remove("missing");
    const imageUrl = localCharacterImageUrl();
    if (imageUrl) {
      const image = new Image();
      image.alt = `${safeText(profile.characterName, "내 캐릭터")} 이미지`;
      image.addEventListener("error", () => {
        visual.replaceChildren();
        visual.classList.add("missing");
        visual.textContent = "이미지를 불러오지 못했습니다. 내 Google 슬라이드에서 확인해 주세요.";
      });
      image.src = imageUrl;
      visual.appendChild(image);
    } else {
      visual.classList.add("missing");
      visual.textContent = "이미지 파일을 찾지 못했습니다. 내 Google 슬라이드에서 확인해 주세요.";
    }
    $$("#profileChecks input").forEach((input) => { input.checked = state.profileChecks.includes(input.value); });
    const record = getSlideRecord();
    const slideUrl = record?.url || "";
    const musicRecord = getMusicRecord();
    const musicUrl = musicRecord?.url || "";
    const missing = "내 캐릭터 슬라이드를 확인하고 있습니다. 선생님께 알려 주세요.";
    setLink("slidesLink", slideUrl, missing, "개인 Google 슬라이드 링크가 준비되어 있습니다.", "slidesLinkStatus");
    setLink("musicLink", musicUrl, "내 음악 자료 링크를 확인하고 있습니다. 선생님께 알려 주세요.", "개인 음악 아웃브레이크 링크가 준비되어 있습니다.", "");
    setLink("slidesLinkSave", slideUrl, missing, state.slideSaved ? "슬라이드 저장 확인 완료" : "개인 Google 슬라이드 링크가 준비되어 있습니다.", "slideSavedStatus");
    $("markSlideSaved").disabled = !slideUrl;
    if (state.slideSaved) setStatus("slideSavedStatus", "슬라이드에 대표 이미지를 저장했다고 표시했습니다.", "success");
  }
  function renderEditPlan() {
    const container = $("editPlanFields");
    container.replaceChildren();
    const parts = state.editParts.filter((part) => part !== "수정하지 않음");
    if (!parts.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = state.satisfaction === "same" ? "기존 이미지를 그대로 사용할 예정입니다. AI 수정은 건너뛰어도 됩니다." : "먼저 바꾸고 싶은 부분을 선택하면 질문이 나타납니다.";
      container.appendChild(empty);
      return;
    }
    parts.forEach((part) => {
      const field = document.createElement("div");
      field.className = "plan-field";
      const label = document.createElement("label");
      label.htmlFor = `editDetail-${part}`;
      label.textContent = QUESTION_BY_PART[part];
      if (part === "그림 스타일") {
        const guide = document.createElement("p");
        guide.className = "style-choice-guide";
        guide.textContent = "잘 모르겠다면 아래 카드 중 마음에 드는 느낌을 골라 보세요.";
        const styleGrid = document.createElement("div");
        styleGrid.className = "style-choice-grid";
        STYLE_CHOICES.forEach((choice) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "style-choice";
          button.dataset.styleChoice = choice.detail;
          button.classList.toggle("is-selected", state.editDetails[part] === choice.detail);
          const icon = document.createElement("span");
          icon.className = "style-choice-icon";
          icon.setAttribute("aria-hidden", "true");
          icon.textContent = choice.icon;
          const title = document.createElement("strong");
          title.textContent = choice.title;
          const note = document.createElement("small");
          note.textContent = choice.note;
          button.append(icon, title, note);
          styleGrid.appendChild(button);
        });
        field.append(label, guide, styleGrid);
        const typingLabel = document.createElement("label");
        typingLabel.htmlFor = `editDetail-${part}`;
        typingLabel.className = "style-typing-label";
        typingLabel.textContent = "카드 내용을 바꾸거나 직접 더 자세히 써도 좋아요.";
        field.appendChild(typingLabel);
      } else {
        field.appendChild(label);
      }
      const textarea = document.createElement("textarea");
      textarea.id = `editDetail-${part}`;
      textarea.rows = 3;
      textarea.dataset.editDetail = part;
      textarea.placeholder = PLACEHOLDER_BY_PART[part];
      textarea.value = state.editDetails[part] || "";
      field.appendChild(textarea);
      container.appendChild(field);
    });
  }
  function renderSecondEdit() {
    const area = $("secondEditArea");
    const visible = state.nextAction === "second";
    area.hidden = !visible;
    const select = $("secondEditPart");
    const current = state.secondEditPart;
    select.replaceChildren(new Option("수정할 부분 선택", ""));
    EDIT_PARTS.forEach((part) => select.appendChild(new Option(part, part)));
    select.value = current;
    $("secondEditDetail").value = state.secondEditDetail;
    $("secondPrompt").value = state.secondPrompt;
    if (!visible) return;
    const canEditAgain = state.editCount < 2;
    $("makeSecondPrompt").disabled = !canEditAgain;
    setStatus("secondPromptStatus", canEditAgain ? "두 번째 수정은 한 번만 할 수 있습니다." : "수정 횟수 두 번을 모두 사용했습니다.", canEditAgain ? "info" : "warning");
  }
  function renderPromptButtons() {
    $("firstPrompt").value = state.firstPrompt;
    $("secondPrompt").value = state.secondPrompt;
    const firstReady = Boolean(state.firstPrompt) && !state.firstOpened && state.editCount < 2;
    $("copyFirstPrompt").disabled = !firstReady;
    setGeminiLink("openGeminiFirst", firstReady);
    if (state.satisfaction === "same") $("makeFirstPrompt").disabled = true;
    else $("makeFirstPrompt").disabled = false;
    const secondReady = Boolean(state.secondPrompt) && !state.secondOpened && state.editCount < 2;
    $("copySecondPrompt").disabled = !Boolean(state.secondPrompt);
    setGeminiLink("openGeminiSecond", secondReady);
    $("editCountText").textContent = String(state.editCount);
  }
  function renderReflection() {
    const profile = state.profile;
    if (!profile) {
      $("reflectionText").textContent = "내 자료를 불러오고 선택 내용을 입력하면 문장이 완성됩니다.";
      return;
    }
    const keep = state.keepPart === "직접 입력" ? state.keepCustom : state.keepPart;
    const changed = state.editParts.filter((part) => part !== "수정하지 않음").join(", ") || "수정하지 않은 점";
    const reason = state.selectionReason.trim() || "내 캐릭터에 더 잘 어울리는 이미지라고 생각했기 때문";
    $("reflectionText").textContent = `AI가 처음 만든 이미지에서 ${safeText(keep, "캐릭터의 기본 특징")}은 유지하고, ${changed}을(를) 수정했습니다. 수정한 이유는 ${reason}입니다.`;
  }
  function render() {
    const select = $("studentName");
    select.value = state.studentName || "";
    $("loadCharacter").disabled = !select.value;
    renderProfile();
    $("keepPart").value = state.keepPart;
    $("keepCustom").hidden = state.keepPart !== "직접 입력";
    $("keepCustom").value = state.keepCustom;
    $$('input[name="satisfaction"]').forEach((input) => { input.checked = input.value === state.satisfaction; });
    $$('input[name="editPart"]').forEach((input) => { input.checked = state.editParts.includes(input.value); });
    renderEditPlan();
    $$('input[name="firstResult"]').forEach((input) => { input.checked = input.value === state.firstResultEvaluation; });
    $$('input[name="firstKeep"]').forEach((input) => { input.checked = input.value === state.firstKeepEvaluation; });
    $$('input[name="nextAction"]').forEach((input) => { input.checked = input.value === state.nextAction; });
    renderSecondEdit();
    $$('input[name="selectedImage"]').forEach((input) => {
      input.disabled = input.value === "second" && state.nextAction !== "second";
      input.checked = input.value === state.selectedImage;
    });
    $("selectedImageText").textContent = IMAGE_LABELS[state.selectedImage] || "선택한 이미지";
    $("selectionReason").value = state.selectionReason;
    $$('input[name="finalCheck"]').forEach((input) => { input.checked = state.finalChecks.includes(input.value); });
    renderPromptButtons();
    renderReflection();
    if (state.completed) {
      $("completeBox").hidden = false;
      setStatus("completeStatus", "6차시 활동이 완료되었습니다. 이 페이지에서 내용을 계속 확인할 수 있습니다.", "success");
    }
  }
  function selectedValue(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value || ""; }
  function showModal(id) {
    const modal = $(id);
    if (modal?.showModal && !modal.open) modal.showModal();
  }
  function closeModal(id) { $(id)?.close?.(); }
  function copyText(text) {
    if (!text.trim()) return Promise.reject(new Error("empty"));
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied ? Promise.resolve() : Promise.reject(new Error("copy"));
  }
  function detailIsVague(detail) {
    const text = detail.trim();
    return text.length < 4 || VAGUE_WORDS.some((word) => text === word || (text.includes(word) && text.length < 11));
  }
  function keepLabel() { return state.keepPart === "직접 입력" ? state.keepCustom.trim() : state.keepPart; }
  function editInstruction(part, detail) {
    const text = detail.trim();
    return `‘${part}’ 부분을 ${text}${/[.!?]$/.test(text) ? "" : "으로 바꿔 줘."}`;
  }
  function buildFirstPrompt() {
    if (!state.profile) return { error: "먼저 내 캐릭터 자료를 확인하세요." };
    if (state.satisfaction === "same") return { error: "기존 이미지를 그대로 사용하기로 했습니다. AI 수정은 건너뛰어도 됩니다." };
    if (!keepLabel()) return { error: "꼭 그대로 남기고 싶은 부분을 하나 선택하세요." };
    if (!state.editParts.length) return { error: "가장 먼저 바꾸고 싶은 부분을 하나 이상 선택하세요." };
    if (state.editParts.includes("수정하지 않음")) return { error: "수정하지 않음을 선택했으므로 AI 수정은 건너뛰어도 됩니다." };
    const missing = state.editParts.find((part) => !state.editDetails[part]?.trim());
    if (missing) return { error: `${missing}을(를) 어떻게 바꿀지 자세히 써 보세요.` };
    const vague = state.editParts.find((part) => detailIsVague(state.editDetails[part]));
    if (vague) return { error: "색, 표정, 크기, 모양처럼 바꾸고 싶은 모습을 조금 더 자세히 써 보세요." };
    const lines = state.editParts.map((part) => editInstruction(part, state.editDetails[part])).join("\n");
    const profile = state.profile;
    return { prompt: `이 캐릭터의 ${keepLabel()}은 그대로 유지해 줘.\n${lines}\n이 캐릭터의 성격은 ${safeText(profile.personality)}이고, 대표 스킬은 ${safeText(profile.mainSkill)}이야.\n다른 부분은 가능한 한 바꾸지 말아 줘.` };
  }
  function buildSecondPrompt() {
    if (state.editCount >= 2) return { error: "수정 횟수 두 번을 모두 사용했습니다." };
    if (!state.secondEditPart) return { error: "다시 수정할 부분을 하나 선택하세요." };
    if (!state.secondEditDetail.trim() || detailIsVague(state.secondEditDetail)) return { error: "색, 표정, 크기, 모양처럼 바꾸고 싶은 모습을 조금 더 자세히 써 보세요." };
    return { prompt: `지금 이미지에서 ${safeText(keepLabel(), "마음에 드는 부분")}은 그대로 유지해 줘.\n${editInstruction(state.secondEditPart, state.secondEditDetail)}\n다른 부분은 바꾸지 말아 줘.` };
  }
  async function loadCharacter() {
    const selected = $("studentName").value;
    const id = studentIdFromName(selected);
    if (!selected || !id) { setStatus("loadStatus", "내 이름을 먼저 선택하세요.", "warning"); return; }
    state = loadState(id);
    state.studentId = id;
    state.studentName = selected;
    $("loadCharacter").disabled = true;
    setStatus("loadStatus", "character_profiles에서 내 캐릭터 자료를 찾는 중입니다.", "info");
    try {
      const result = await jsonp({ action: "loadProfile", school_code: SCHOOL_CODE, classId: CLASS_ID, studentId: id });
      if (!result?.ok || !result.profile) throw new Error("not-found");
      state.profile = normalizeProfile(result.profile);
      state.studentName = state.profile.studentName || selected;
      saveState();
      render();
      setStatus("loadStatus", "캐릭터 자료를 불러왔습니다. 내 자료가 맞는지 확인하세요.", "success");
      $("characterCard").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      setStatus("loadStatus", error.message === "missing-api" ? "Apps Script 주소가 아직 설정되지 않았습니다. 선생님께 알려 주세요." : "캐릭터 정보를 불러오지 못했습니다. 이름과 반을 확인한 뒤 선생님께 알려 주세요.", "error");
    } finally {
      $("loadCharacter").disabled = false;
    }
  }
  async function syncStudentNames() {
    const candidateIds = STUDENTS[CLASS_ID].map(studentIdFromName);
    try {
      const results = await Promise.all(candidateIds.map((studentId) => jsonp({
        action: "loadProfile",
        school_code: SCHOOL_CODE,
        classId: CLASS_ID,
        studentId
      })));
      const names = results
        .filter((result) => result?.ok && result.profile && String(result.profile.classId) === CLASS_ID)
        .map((result) => result.profile.studentName)
        .filter(Boolean);
      if (!names.length) return;
      const selectedName = state.studentName;
      const select = $("studentName");
      select.replaceChildren(new Option("학생 이름 선택", ""));
      names.forEach((name) => select.appendChild(new Option(name, name)));
      if (names.includes(selectedName)) {
        select.value = selectedName;
      } else if (selectedName) {
        state = blankState();
        render();
      }
    } catch (_) {
      // 5차시 로스터를 대체 목록으로 유지합니다.
    }
  }
  function handleEditPartChange(input) {
    const value = input.value;
    let parts = [...state.editParts];
    if (input.checked) {
      if (value === "수정하지 않음") parts = [value];
      else {
        parts = parts.filter((part) => part !== "수정하지 않음");
        if (parts.length >= 2) { input.checked = false; setStatus("editPartStatus", "수정할 부분은 최대 두 개까지만 선택할 수 있어요.", "warning"); return; }
        parts.push(value);
      }
    } else parts = parts.filter((part) => part !== value);
    state.editParts = parts;
    state.firstPrompt = "";
    state.secondPrompt = "";
    saveState();
    render();
    setStatus("editPartStatus", parts.length ? `선택한 수정 부분: ${parts.join(", ")}` : "바꾸고 싶은 부분을 선택해 주세요.", parts.length ? "success" : "info");
  }
  function completeLesson() {
    if (state.completed) return;
    const profileOk = state.profile && state.profileChecks.length === 4;
    if (!profileOk) { setStatus("completeStatus", "내 캐릭터 자료 확인 체크를 모두 해 주세요.", "warning"); $("profileChecks").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!state.selectedImage) { setStatus("completeStatus", "대표 이미지 한 장을 선택하세요.", "warning"); $("select-section").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!state.selectionReason.trim()) { setStatus("completeStatus", "대표 이미지를 선택한 이유를 적어 보세요.", "warning"); $("selectionReason").focus(); return; }
    if (!state.slideSaved) { setStatus("completeStatus", "대표 이미지를 Google 슬라이드에 넣었다고 확인해 주세요.", "warning"); $("markSlideSaved").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (state.finalChecks.length !== 3) { setStatus("completeStatus", "최종 확인 체크를 모두 해 주세요.", "warning"); $("final-section").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    state.completed = true;
    saveState();
    render();
    $("completeBox").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function trackGeminiOpen(which) {
    if (which === "first" && !state.firstOpened) { state.firstOpened = true; state.editCount = Math.max(state.editCount, 1); }
    if (which === "second" && !state.secondOpened) { state.secondOpened = true; state.editCount = Math.max(state.editCount, 2); }
    saveState();
    renderPromptButtons();
  }
  function init() {
    $("studentName").replaceChildren(new Option("학생 이름 선택", ""));
    STUDENTS[CLASS_ID].forEach((name) => $("studentName").appendChild(new Option(name, name)));
    const lastId = localStorage.getItem(lastStudentKey());
    const lastName = STUDENTS[CLASS_ID].find((name) => studentIdFromName(name) === String(lastId || ""));
    state = lastName ? loadState(studentIdFromName(lastName)) : blankState();
    state.studentName = state.studentName || lastName || "";
    $("studentName").addEventListener("change", () => {
      const selected = $("studentName").value;
      const id = studentIdFromName(selected);
      state = id ? loadState(id) : blankState();
      state.studentId = id;
      state.studentName = selected;
      saveState();
      render();
      setStatus("loadStatus", selected ? "이름을 선택했습니다. 내 캐릭터 자료를 확인하세요." : "이름을 선택한 뒤 내 캐릭터 자료 확인하기를 눌러 주세요.", "info");
    });
    $("loadCharacter").addEventListener("click", loadCharacter);
    $("keepPart").addEventListener("change", (event) => { state.keepPart = event.target.value; state.firstPrompt = ""; saveState(); render(); });
    $("keepCustom").addEventListener("input", (event) => { state.keepCustom = event.target.value; state.firstPrompt = ""; saveState(); renderReflection(); });
    $$('input[name="satisfaction"]').forEach((input) => input.addEventListener("change", () => { state.satisfaction = selectedValue("satisfaction"); if (state.satisfaction === "same") state.editParts = []; saveState(); render(); }));
    $$('input[name="editPart"]').forEach((input) => input.addEventListener("change", () => handleEditPartChange(input)));
    $("editPlanFields").addEventListener("input", (event) => {
      const part = event.target.dataset.editDetail;
      if (!part) return;
      state.editDetails[part] = event.target.value;
      state.firstPrompt = "";
      saveState();
      renderReflection();
      if (part === "그림 스타일") {
        $$("#editPlanFields [data-style-choice]").forEach((button) => {
          button.classList.toggle("is-selected", button.dataset.styleChoice === event.target.value);
        });
      }
    });
    $("editPlanFields").addEventListener("click", (event) => {
      const button = event.target.closest("[data-style-choice]");
      if (!button) return;
      state.editDetails["그림 스타일"] = button.dataset.styleChoice;
      state.firstPrompt = "";
      saveState();
      render();
      setStatus("planStatus", "그림 스타일 카드를 선택했습니다. 필요하면 아래 문장에서 더 자세히 고쳐 써도 좋아요.", "success");
    });
    $("makeFirstPrompt").addEventListener("click", () => { const result = buildFirstPrompt(); if (result.error) { setStatus("planStatus", result.error, "warning"); $("planStatus").scrollIntoView({ behavior: "smooth", block: "center" }); return; } state.firstPrompt = result.prompt; saveState(); render(); setStatus("firstPromptStatus", "프롬프트가 완성되었습니다. 복사해서 제미나이에 붙여 넣으세요.", "success"); $("prompt-section").scrollIntoView({ behavior: "smooth", block: "start" }); });
    $("copyFirstPrompt").addEventListener("click", () => copyText(state.firstPrompt).then(() => setStatus("firstPromptStatus", "프롬프트를 복사했습니다. 제미나이에 붙여 넣어 보세요.", "success")).catch(() => setStatus("firstPromptStatus", "복사하지 못했습니다. 프롬프트를 직접 선택해 복사해 주세요.", "warning")));
    $("openGeminiFirst").addEventListener("click", (event) => { if ($("openGeminiFirst").getAttribute("aria-disabled") === "true") { event.preventDefault(); return; } trackGeminiOpen("first"); });
    $$('input[name="firstResult"]').forEach((input) => input.addEventListener("change", () => { state.firstResultEvaluation = selectedValue("firstResult"); saveState(); renderReflection(); }));
    $$('input[name="firstKeep"]').forEach((input) => input.addEventListener("change", () => { state.firstKeepEvaluation = selectedValue("firstKeep"); saveState(); }));
    $$('input[name="nextAction"]').forEach((input) => input.addEventListener("change", () => { state.nextAction = selectedValue("nextAction"); if (state.nextAction !== "second" && state.selectedImage === "second") state.selectedImage = ""; saveState(); render(); setStatus("resultStatus", state.nextAction === "second" ? "두 번째 수정 계획을 세워 보세요." : "대표 이미지 선택 단계에서 사용할 결과를 정했습니다.", "success"); }));
    $("secondEditPart").addEventListener("change", (event) => { state.secondEditPart = event.target.value; state.secondPrompt = ""; saveState(); renderPromptButtons(); });
    $("secondEditDetail").addEventListener("input", (event) => { state.secondEditDetail = event.target.value; state.secondPrompt = ""; saveState(); renderPromptButtons(); });
    $("makeSecondPrompt").addEventListener("click", () => { const result = buildSecondPrompt(); if (result.error) { setStatus("secondPromptStatus", result.error, "warning"); return; } state.secondPrompt = result.prompt; saveState(); render(); setStatus("secondPromptStatus", "두 번째 프롬프트가 완성되었습니다. 이번이 마지막 수정입니다.", "success"); });
    $("copySecondPrompt").addEventListener("click", () => copyText(state.secondPrompt).then(() => setStatus("secondPromptStatus", "프롬프트를 복사했습니다.", "success")).catch(() => setStatus("secondPromptStatus", "복사하지 못했습니다. 프롬프트를 직접 선택해 복사해 주세요.", "warning")));
    $("openGeminiSecond").addEventListener("click", (event) => { if ($("openGeminiSecond").getAttribute("aria-disabled") === "true") { event.preventDefault(); return; } trackGeminiOpen("second"); });
    $$('input[name="selectedImage"]').forEach((input) => input.addEventListener("change", () => { if (input.disabled) return; state.selectedImage = selectedValue("selectedImage"); saveState(); render(); }));
    $("selectionReason").addEventListener("input", (event) => { state.selectionReason = event.target.value; saveState(); renderReflection(); });
    $$("#profileChecks input").forEach((input) => input.addEventListener("change", () => { state.profileChecks = $$("#profileChecks input:checked").map((item) => item.value); saveState(); }));
    $("markSlideSaved").addEventListener("click", () => { if (!getSlideRecord()) return; state.slideSaved = true; saveState(); render(); });
    $$('input[name="finalCheck"]').forEach((input) => input.addEventListener("change", () => { state.finalChecks = $$('input[name="finalCheck"]:checked').map((item) => item.value); saveState(); }));
    $("completeLesson").addEventListener("click", completeLesson);
    $("openPromptExamples").addEventListener("click", () => showModal("promptExamplesModal"));
    $("openImageHelp").addEventListener("click", () => showModal("imageHelpModal"));
    $$('[data-close-modal]').forEach((button) => button.addEventListener("click", () => closeModal(button.dataset.closeModal)));
    ["promptExamplesModal", "imageHelpModal"].forEach((id) => $(id).addEventListener("click", (event) => { if (event.target === $(id)) closeModal(id); }));
    ["slidesLink", "slidesLinkSave"].forEach((id) => $(id).addEventListener("click", (event) => { if ($(id).getAttribute("aria-disabled") === "true") event.preventDefault(); }));
    render();
    if (state.profile) setStatus("loadStatus", "저장된 내 캐릭터 자료를 다시 표시했습니다. 필요하면 자료 확인하기를 눌러 최신 자료를 불러오세요.", "success");
    if (ACCOUNT_SHEET_URLS[CLASS_ID]) document.querySelector(".btn-account")?.setAttribute("href", ACCOUNT_SHEET_URLS[CLASS_ID]);
    syncStudentNames();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
