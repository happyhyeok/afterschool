// 동호초 5학년 7차시 학생용 페이지
// Padlet 아웃브레이크 링크는 교사가 제공한 CSV 내용을 반별로 반영합니다.
const LESSON07_API_URL = "https://script.google.com/macros/s/AKfycbyICrDSlTbpBpzuv3U2n0RBTbvM4NUVgUJMQENJdep656lzO8YWR4AK4OlKsUddXNOZIw/exec";

(() => {
  const SCHOOL_CODE = "dongho";
  const root = document.body;
  const classId = root.dataset.classId === "class2" ? "class2" : "class1";
  const apiClassName = classId === "class2" ? "2반" : "1반";
  const students = {
    class1: ["01. 곽예준", "02. 김민주", "03. 김우람", "04. 김태양", "05. 김태현", "06. 김효민", "07. 박민준", "08. 박하율", "09. 서자건", "10. 이정우", "11. 조예빈", "12. 지현서", "13. 차소민", "14. 채종후"],
    class2: ["01. 권하린", "02. 김리아", "03. 김문준", "04. 김아랑", "05. 김예슬", "06. 김우현", "07. 김효건", "08. 문서진", "09. 변수현", "10. 신예건", "11. 심현지", "12. 양승윤", "13. 연율", "14. 이정우", "15. 최푸른"]
  };
  const missingLocalImages = {
    class1: new Set(["9"]),
    class2: new Set()
  };
  const PADLET_LINKS = {
    class1: {
      "1": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:jPpUpJDT9Alf4hOzct0Zl",
      "2": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:j9gYiFu7X9OmVSwVZMr9O",
      "3": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:1TD83vKUFbdKsskdWrVhk",
      "4": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:lB-urcukzvO0L_VANlEHm",
      "5": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:ZsPYKWjziT5rbydv13CW_",
      "6": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:MH1cHh0PAs1FxcNmj4zWA",
      "7": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:b47pB7pJXB0Jz4vuAE0ej",
      "8": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:fxnQr2eE3vAh2MJYXPGrx",
      "9": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:x-dJstN_ZnGUrGEK3pBpM",
      "10": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:rjw_2M62CDpiX1x-5CB_R",
      "11": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:lozA49wZWTiTBnYkxZgax",
      "12": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:8mC0jH14UrWk9FnbywbC9",
      "13": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:NLtsAUWOY47tOZ4uJnms7",
      "14": "https://padlet.com/sorbaram/card-breakout-room/owZLy1wp2xP0ngVG-page:7zXEJ4q29IcHA7K2DfzRb"
    },
    class2: {
      "1": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:mNSAcQotYUTMeKw3VwLox",
      "2": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:vbN6GBniI-euCYxbKyI-i",
      "3": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:BYM4Jkyz_s5mVmdIOkRj2",
      "4": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:IMHPvdMiTcKfMw_rPxnF3",
      "5": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:tjDrDBjoo-s5RQbn3VyfY",
      "6": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:SSc0a5c6kInjzXFI2M3Z-",
      "7": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:507Prenp3FvQzuidl1BDd",
      "8": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:Tn-lNxC4FqXa-xrGHHCVY",
      "9": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:sxYoMvF7E4fCfWWTPrsaO",
      "10": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:G6a2peq4wfNkFAPs5nLnc",
      "11": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:K-mD0cZDGLaAIuMGbHvZx",
      "12": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:VhWTLd-LX9e6fGAc8aiFA",
      "13": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:U7wG6E_1kHGUBFwhOpsOz",
      "14": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:f0YIi83ICqapsyz0HAQ_u",
      "15": "https://padlet.com/sorbaram/card-breakout-room/7BZ9vokL6Xwavkwz-page:mLus5Hovqz0RIxMk5vK4D"
    }
  };
  const SECTION_IDS = [
    "mission-section",
    "data-section",
    "story-section",
    "preview-section",
    "padlet-section",
    "check-section"
  ];

  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  let activeSectionIndex = 0;
  let state = blankState();
  let currentLinks = blankLinks();

  function blankState(studentId = "") {
    return {
      studentId,
      studentName: "",
      profile: null,
      checks: [],
      oneLineIntro: "",
      storyPlace: "",
      storyProblem: "",
      storySkillScene: "",
      storyText: "",
      finalChecks: [],
      padletOpened: false,
      completed: false
    };
  }

  function blankLinks() {
    return { slideUrl: "", padletUrl: "", musicUrl: "", imageUrl: "" };
  }

  function storageKey(studentId = state.studentId) {
    return studentId ? `dongho_${classId}_${studentId}_lesson07` : "";
  }

  function lastStudentKey() {
    return `dongho_${classId}_lesson07_last_student`;
  }

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

  function studentIdFromName(name) {
    const match = String(name || "").match(/^\s*(\d+)/);
    return match ? String(Number(match[1])) : "";
  }

  function safeText(value, fallback = "자료 확인 필요") {
    const text = String(value ?? "").trim();
    return text || fallback;
  }

  function setStatus(id, text, tone = "info") {
    const element = $(id);
    if (!element) return;
    element.textContent = text;
    element.dataset.tone = tone;
  }

  function normalizeUrl(value) {
    const text = String(value || "").trim();
    return /^https:\/\/(docs\.google\.com|padlet\.com)\//.test(text) ? text : "";
  }

  function setLink(id, url, readyMessage, emptyMessage, statusId) {
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

  function localCharacterImageUrl(studentId = state.studentId) {
    const numericId = Number(studentId);
    if (!Number.isInteger(numericId) || numericId < 1 || missingLocalImages[classId].has(String(numericId))) return "";
    const fileName = `${String(numericId).padStart(2, "0")}.png`;
    return new URL(`../assets/characters/${classId}/${fileName}`, window.location.href).href;
  }

  function csvPadletUrl(studentId = state.studentId) {
    const id = String(Number(studentId));
    return normalizeUrl(PADLET_LINKS[classId]?.[id] || "");
  }

  function imageSource() {
    return normalizeUrl(currentLinks.imageUrl) || localCharacterImageUrl();
  }

  function selectedReady() {
    return Boolean(state.studentId);
  }

  function storyReady() {
    return Boolean(state.oneLineIntro.trim() && state.storyText.trim());
  }

  function jsonp(params) {
    return new Promise((resolve, reject) => {
      if (!LESSON07_API_URL) {
        reject(new Error("missing-api"));
        return;
      }
      const callback = `lesson07Callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const query = new URLSearchParams({ ...params, callback });
      let finished = false;
      const timeout = setTimeout(() => finish(new Error("timeout")), 12000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[callback];
        script.remove();
      }

      function finish(error, data) {
        if (finished) return;
        finished = true;
        cleanup();
        error ? reject(error) : resolve(data);
      }

      window[callback] = (data) => finish(null, data);
      script.onerror = () => finish(new Error("network"));
      script.src = `${LESSON07_API_URL}?${query.toString()}`;
      document.body.appendChild(script);
    });
  }

  function normalizeProfile(raw = {}) {
    return {
      classId: raw.classId || raw.class_id || classId,
      studentId: String(raw.studentId || raw.student_id || state.studentId),
      studentName: raw.studentName || raw.student_name || raw.name || state.studentName,
      characterName: raw.characterName || raw.character_name || "",
      personality: raw.personality || raw.characterPersonality || "",
      mainSkill: raw.mainSkill || raw.main_skill || raw.ability || raw.skill_description || raw.characterPower || ""
    };
  }

  function normalizeStudentPayload(result = {}) {
    if (result.success && result.student) {
      const student = result.student;
      return {
        ok: true,
        profile: normalizeProfile({
          class_id: classId,
          student_id: student.student_id || state.studentId,
          student_name: student.display_name || student.name || state.studentName,
          character_name: student.character_name,
          personality: student.personality,
          ability: student.ability || student.skill_description
        }),
        links: {
          slideUrl: normalizeUrl(student.slides_url),
          padletUrl: normalizeUrl(student.padlet_url),
          musicUrl: normalizeUrl(student.music_url),
          imageUrl: normalizeUrl(student.image_url)
        }
      };
    }
    if (result.ok && result.profile) {
      return { ok: true, profile: normalizeProfile(result.profile), links: blankLinks() };
    }
    return { ok: false, message: result.message || "자료를 찾지 못했습니다." };
  }

  async function fetchStudentData(studentId) {
    try {
      const selected = await jsonp({
        action: "getStudent",
        school_code: SCHOOL_CODE,
        class_name: apiClassName,
        number: String(Number(studentId))
      });
      const selectedPayload = normalizeStudentPayload(selected);
      if (selectedPayload.ok) return selectedPayload;
    } catch (_) {
      // 기존 배포 API가 getStudent를 아직 지원하지 않으면 아래 loadProfile 경로를 사용합니다.
    }

    const legacy = await jsonp({
      action: "loadProfile",
      school_code: SCHOOL_CODE,
      classId,
      studentId
    });
    return normalizeStudentPayload(legacy);
  }

  async function loadStudent() {
    const selectedName = $("studentName").value;
    const studentId = studentIdFromName(selectedName);
    if (!selectedName || !studentId) {
      setStatus("loadStatus", "내 이름을 먼저 선택하세요.", "warning");
      return;
    }

    state = { ...loadState(studentId), studentId, studentName: selectedName };
    currentLinks = { ...blankLinks(), padletUrl: csvPadletUrl(studentId), musicUrl: csvPadletUrl(studentId) };
    $("loadStudent").disabled = true;
    setStatus("loadStatus", "기존 수업 자료에서 내 캐릭터 정보를 찾는 중입니다.", "info");

    try {
      const payload = await fetchStudentData(studentId);
      if (!payload.ok || !payload.profile) throw new Error(payload.message || "not-found");
      state.profile = payload.profile;
      state.studentName = state.profile.studentName || selectedName;
      const payloadLinks = payload.links || blankLinks();
      const padletUrl = normalizeUrl(payloadLinks.padletUrl) || csvPadletUrl(studentId);
      currentLinks = {
        ...payloadLinks,
        padletUrl,
        musicUrl: normalizeUrl(payloadLinks.musicUrl) || padletUrl
      };
      saveState();
      render();
      setStatus("loadStatus", "내 캐릭터 자료를 불러왔습니다. 내용이 맞는지 확인하세요.", "success");
    } catch (error) {
      render();
      setStatus("loadStatus", error.message === "missing-api" ? "Apps Script 주소가 아직 설정되지 않았습니다. 선생님께 알려 주세요." : "캐릭터 정보를 불러오지 못했습니다. 이름과 반을 확인한 뒤 선생님께 알려 주세요.", "error");
    } finally {
      $("loadStudent").disabled = !$("studentName").value;
    }
  }

  function renderImage(targetId, emptyText) {
    const target = $(targetId);
    if (!target) return;
    target.replaceChildren();
    target.classList.remove("missing");
    const src = imageSource();
    if (!src) {
      target.classList.add("missing");
      target.textContent = emptyText;
      return;
    }
    const image = new Image();
    image.alt = `${safeText(state.profile?.characterName, "내 캐릭터")} 이미지`;
    image.addEventListener("error", () => {
      target.replaceChildren();
      target.classList.add("missing");
      target.textContent = "이미지를 불러오지 못했습니다. 내 Google 슬라이드에서 확인해 주세요.";
    });
    image.src = src;
    target.appendChild(image);
  }

  function renderProfile() {
    const hasProfile = Boolean(state.profile);
    const hasSelected = selectedReady();
    $("profileChecks").disabled = !hasProfile;

    $("studentNameText").textContent = hasSelected ? safeText(state.studentName, "이름 선택됨") : "이름 선택 전";
    $("cardCharacterName").textContent = hasProfile ? safeText(state.profile.characterName) : "자료 확인 필요";
    $("cardPersonality").textContent = hasProfile ? safeText(state.profile.personality) : "자료 확인 필요";
    $("cardMainSkill").textContent = hasProfile ? safeText(state.profile.mainSkill) : "자료 확인 필요";
    $("materialHint").textContent = hasSelected ? "내 Padlet 자료를 열어 테마 음악을 확인하세요." : "이름을 선택하면 내 Padlet 자료를 확인할 수 있습니다.";

    if (hasProfile) renderImage("characterVisual", "이미지 자료를 확인하고 있습니다.");
    else {
      const visual = $("characterVisual");
      visual.replaceChildren();
      visual.classList.add("missing");
      visual.textContent = hasSelected ? "내 자료 불러오기를 누르면 캐릭터 이미지와 설정을 확인합니다." : "먼저 위에서 자신의 이름을 선택해 주세요.";
    }

    setLink(
      "slideLink",
      hasProfile ? currentLinks.slideUrl : "",
      "개인 Google 슬라이드 링크가 준비되어 있습니다.",
      hasProfile && imageSource() ? "대표 이미지는 화면에서 확인할 수 있습니다. Google 슬라이드 링크는 확인하고 있습니다." : "이미지 자료를 확인하고 있습니다.",
      "imageStatus"
    );
    const padletUrl = hasSelected ? (currentLinks.padletUrl || currentLinks.musicUrl || csvPadletUrl()) : "";
    setLink(
      "padletLink",
      padletUrl,
      "캐릭터 카드 편집 링크가 준비되어 있습니다.",
      hasSelected ? "음악 자료를 확인하고 있습니다." : "먼저 위에서 자신의 이름을 선택해 주세요.",
      "musicStatus"
    );
    setLink("padletLinkFinal", padletUrl, "", "", "");
    $$("#profileChecks input").forEach((input) => {
      input.checked = state.checks.includes(input.value);
    });
  }

  function storyPreviewText() {
    const profile = state.profile || {};
    const lines = [];
    const characterName = safeText(profile.characterName, "내 캐릭터");
    if (state.oneLineIntro) lines.push(state.oneLineIntro);
    if (state.storyPlace || state.storyProblem || state.storySkillScene) {
      const place = state.storyPlace || "자신의 세계";
      const problem = state.storyProblem || "어려운 문제";
      const skill = state.storySkillScene || `${safeText(profile.mainSkill, "대표 스킬")}을 사용했다`;
      lines.push(`${characterName}은 ${place}에서 ${problem}를 마주했습니다. ${skill}.`);
    }
    if (state.storyText) lines.push(state.storyText);
    return lines.join("\n\n") || "내 자료를 불러오고 이야기를 입력하면 미리보기가 나타납니다.";
  }

  function syncValue(id, value) {
    const element = $(id);
    if (element && element.value !== value) element.value = value;
  }

  function renderStory() {
    syncValue("oneLineIntro", state.oneLineIntro);
    syncValue("storyPlace", state.storyPlace);
    syncValue("storyProblem", state.storyProblem);
    syncValue("storySkillScene", state.storySkillScene);
    syncValue("storyText", state.storyText);
    $("storyPreview").textContent = storyPreviewText();
    const ready = storyReady();
    const hasSelected = selectedReady();
    $("storyLockMessage").textContent = hasSelected ? "이야기를 작성할 수 있습니다. 입력한 내용은 아래 최종 카드에 바로 반영됩니다." : "먼저 위에서 자신의 이름을 선택해 주세요.";
    $("storyLockMessage").classList.toggle("is-ready", hasSelected);
    setStatus("storyStatus", ready ? "이야기 초안이 준비되었습니다. 아래 최종 카드에서 다시 확인하세요." : "한 줄 소개와 캐릭터 이야기를 입력해 주세요.", ready ? "success" : "info");
  }

  function cardText() {
    const profile = state.profile || {};
    return [
      "나의 AI 캐릭터 카드",
      "",
      `캐릭터 이름: ${safeText(profile.characterName)}`,
      `성격: ${safeText(profile.personality)}`,
      `대표 스킬: ${safeText(profile.mainSkill)}`,
      "",
      `한 줄 소개: ${state.oneLineIntro || "작성 필요"}`,
      "",
      "캐릭터 이야기:",
      state.storyText || "작성 필요",
      "",
      "테마 음악: 내 Padlet에서 확인",
      "",
      "AI를 활용해 만든 캐릭터입니다."
    ].join("\n");
  }

  function renderFinalCard() {
    const profile = state.profile || {};
    $("finalCharacterName").textContent = safeText(profile.characterName);
    $("finalPersonality").textContent = safeText(profile.personality);
    $("finalSkill").textContent = safeText(profile.mainSkill);
    $("finalIntro").textContent = state.oneLineIntro || "한 줄 소개를 입력해 주세요.";
    $("finalStory").textContent = state.storyText || "캐릭터 이야기를 입력해 주세요.";
    $$("#check-section input[name='finalCheck']").forEach((input) => {
      input.checked = state.finalChecks.includes(input.value);
    });
  }

  function setControlsEnabled() {
    const hasSelected = selectedReady();
    const hasProfile = Boolean(state.profile);
    ["oneLineIntro", "storyPlace", "storyProblem", "storySkillScene", "storyText"].forEach((id) => {
      $(id).disabled = !hasSelected;
    });
    $("copyCardText").disabled = !(hasProfile && storyReady());
    $("finalChecksPanel").disabled = !hasSelected;
    $("completeLesson").disabled = !hasSelected;
    $("completeBox").hidden = !state.completed;
  }

  function renderSectionStatuses() {
    SECTION_IDS.forEach((id, index) => {
      const section = $(id);
      if (!section) return;
      section.classList.toggle("is-active", index === activeSectionIndex);
    });
  }

  function renderTopProgress() {
    const section = $(SECTION_IDS[activeSectionIndex]);
    const activityName = section?.dataset.activityName || "오늘의 미션";
    const percent = state.completed ? 100 : Math.round(((activeSectionIndex + 1) / SECTION_IDS.length) * 100);
    $("currentActivityText").textContent = `현재 활동: ${activityName}`;
    $("progressText").textContent = `진행률 ${percent}%`;
    $("progressBar").style.width = `${percent}%`;
  }

  function render() {
    setControlsEnabled();
    renderProfile();
    renderStory();
    renderFinalCard();
    renderSectionStatuses();
    renderTopProgress();
  }

  async function copyText(text, statusId, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(statusId, successMessage, "success");
    } catch (_) {
      setStatus(statusId, "복사하지 못했습니다. 글을 직접 선택해서 복사해 주세요.", "warning");
    }
  }

  function bindInputs() {
    $("studentName").addEventListener("change", () => {
      const selected = $("studentName").value;
      const id = studentIdFromName(selected);
      state = id ? { ...loadState(id), studentId: id, studentName: selected } : blankState();
      currentLinks = id ? { ...blankLinks(), padletUrl: csvPadletUrl(id), musicUrl: csvPadletUrl(id) } : blankLinks();
      $("loadStudent").disabled = !selected;
      setStatus("loadStatus", selected ? "이름을 선택했습니다. 내 자료 불러오기를 눌러 주세요." : "이름을 선택한 뒤 내 자료 불러오기를 눌러 주세요.", "info");
      saveState();
      render();
    });
    $("loadStudent").addEventListener("click", loadStudent);
    $$("#profileChecks input").forEach((input) => {
      input.addEventListener("change", () => {
        state.checks = $$("#profileChecks input:checked").map((item) => item.value);
        saveState();
        render();
      });
    });
    ["oneLineIntro", "storyPlace", "storyProblem", "storySkillScene", "storyText"].forEach((id) => {
      $(id).addEventListener("input", (event) => {
        state[id] = event.target.value;
        saveState();
        render();
      });
    });
    $$("#check-section input[name='finalCheck']").forEach((input) => {
      input.addEventListener("change", () => {
        state.finalChecks = $$("#check-section input[name='finalCheck']:checked").map((item) => item.value);
        saveState();
        render();
      });
    });
    $("copyCardText").addEventListener("click", () => copyText(cardText(), "copyStatus", "카드 내용을 복사했습니다. 내 Padlet에 붙여 넣으세요."));
    ["padletLink", "padletLinkFinal"].forEach((id) => {
      $(id).addEventListener("click", () => {
        if ($(id).getAttribute("aria-disabled") === "true") return;
        state.padletOpened = true;
        saveState();
        render();
      });
    });
    $("completeLesson").addEventListener("click", () => {
      if (state.finalChecks.length !== 3) {
        setStatus("completeStatus", "마지막 확인을 모두 체크해 주세요.", "warning");
        return;
      }
      state.completed = true;
      saveState();
      render();
      setStatus("completeStatus", "7차시 활동을 마쳤습니다.", "success");
    });
    $$("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = $(button.dataset.scrollTarget);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initStudents() {
    const select = $("studentName");
    students[classId].forEach((name) => select.appendChild(new Option(name, name)));
    const lastId = localStorage.getItem(lastStudentKey());
    const lastName = students[classId].find((name) => studentIdFromName(name) === String(lastId || ""));
    if (lastName) {
      const id = studentIdFromName(lastName);
      select.value = lastName;
      state = { ...loadState(id), studentId: id, studentName: lastName };
      currentLinks = { ...blankLinks(), padletUrl: csvPadletUrl(id), musicUrl: csvPadletUrl(id) };
      $("loadStudent").disabled = false;
      if (state.profile) setStatus("loadStatus", "저장된 글을 다시 표시했습니다. 링크 확인은 내 자료 불러오기를 눌러 다시 확인하세요.", "success");
    }
  }

  function updateActiveSection(index) {
    activeSectionIndex = Math.max(0, Math.min(SECTION_IDS.length - 1, index));
    renderSectionStatuses();
    renderTopProgress();
  }

  function initObserver() {
    const sections = SECTION_IDS.map((id) => $(id)).filter(Boolean);
    if (!("IntersectionObserver" in window)) {
      window.addEventListener("scroll", () => {
        const index = sections.reduce((best, section, currentIndex) => {
          const top = Math.abs(section.getBoundingClientRect().top - 130);
          const bestTop = Math.abs(sections[best].getBoundingClientRect().top - 130);
          return top < bestTop ? currentIndex : best;
        }, 0);
        updateActiveSection(index);
      }, { passive: true });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      updateActiveSection(sections.indexOf(visible.target));
    }, { rootMargin: "-22% 0px -52% 0px", threshold: [0.2, 0.45, 0.7] });
    sections.forEach((section) => observer.observe(section));
  }

  function init() {
    initStudents();
    bindInputs();
    initObserver();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
