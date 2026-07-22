// 동호초 5학년 7차시 학생용 페이지
// 학생별 개인 링크 목록은 이 파일에 넣지 않습니다. API가 선택 학생 1명 자료만 반환하면 그 링크만 사용합니다.
const LESSON07_API_URL = "https://script.google.com/macros/s/AKfycbyICrDSlTbpBpzuv3U2n0RBTbvM4NUVgUJMQENJdep656lzO8YWR4AK4OlKsUddXNOZIw/exec";

(() => {
  const SCHOOL_CODE = "dongho";
  const root = document.body;
  const classId = root.dataset.classId === "class2" ? "class2" : "class1";
  const className = root.dataset.className || (classId === "class2" ? "5학년 2반" : "5학년 1반");
  const apiClassName = classId === "class2" ? "2반" : "1반";
  const students = {
    class1: ["01. 곽예준", "02. 김민주", "03. 김우람", "04. 김태양", "05. 김태현", "06. 김효민", "07. 박민준", "08. 박하율", "09. 서자건", "10. 이정우", "11. 조예빈", "12. 지현서", "13. 차소민", "14. 채종후"],
    class2: ["01. 권하린", "02. 김리아", "03. 김문준", "04. 김아랑", "05. 김예슬", "06. 김우현", "07. 김효건", "08. 문서진", "09. 변수현", "10. 신예건", "11. 심현지", "12. 양승윤", "13. 연율", "14. 이정우", "15. 최푸른"]
  };
  const missingLocalImages = {
    class1: new Set(["9"]),
    class2: new Set()
  };
  const stepLabels = ["오늘의 미션", "내 자료 확인", "캐릭터 이야기 작성", "최종 카드 만들기", "Padlet 저장과 전시 감상"];
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  let currentStep = 0;
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

  function nameOnly(name) {
    return String(name || "").replace(/^\s*\d+\s*[.]?\s*/, "").trim();
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

  function imageSource() {
    return normalizeUrl(currentLinks.imageUrl) || localCharacterImageUrl();
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

  async function fetchStudentData(studentId, selectedName) {
    const number = Number(studentId);
    try {
      const selected = await jsonp({
        action: "getStudent",
        school_code: SCHOOL_CODE,
        class_name: apiClassName,
        number: String(number)
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
    currentLinks = blankLinks();
    $("loadStudent").disabled = true;
    setStatus("loadStatus", "기존 수업 자료에서 내 캐릭터 정보를 찾는 중입니다.", "info");

    try {
      const payload = await fetchStudentData(studentId, selectedName);
      if (!payload.ok || !payload.profile) throw new Error(payload.message || "not-found");
      state.profile = payload.profile;
      state.studentName = state.profile.studentName || selectedName;
      currentLinks = payload.links || blankLinks();
      saveState();
      render();
      setStatus("loadStatus", "내 캐릭터 자료를 불러왔습니다. 내용이 맞는지 확인하세요.", "success");
      $("characterCard").scrollIntoView({ behavior: "smooth", block: "center" });
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
    $("characterCard").hidden = !hasProfile;
    $("profileChecks").disabled = !hasProfile;
    if (!hasProfile) {
      setLink("slideLink", "", "", "이미지 자료를 확인하고 있습니다.", "imageStatus");
      setLink("padletLink", "", "", "음악 자료를 확인하고 있습니다.", "musicStatus");
      setLink("padletLinkFinal", "", "", "음악 자료를 확인하고 있습니다.", "");
      return;
    }

    $("studentNameText").textContent = safeText(state.studentName, safeText(state.profile.studentName));
    $("cardCharacterName").textContent = safeText(state.profile.characterName);
    $("cardPersonality").textContent = safeText(state.profile.personality);
    $("cardMainSkill").textContent = safeText(state.profile.mainSkill);
    renderImage("characterVisual", "이미지 자료를 확인하고 있습니다.");

    setLink(
      "slideLink",
      currentLinks.slideUrl,
      "개인 Google 슬라이드 링크가 준비되어 있습니다.",
      imageSource() ? "대표 이미지는 화면에서 확인할 수 있습니다. Google 슬라이드 링크는 확인하고 있습니다." : "이미지 자료를 확인하고 있습니다.",
      "imageStatus"
    );
    setLink(
      "padletLink",
      currentLinks.padletUrl || currentLinks.musicUrl,
      "개인 Padlet 아웃브레이크 링크가 준비되어 있습니다.",
      "음악 자료를 확인하고 있습니다.",
      "musicStatus"
    );
    setLink(
      "padletLinkFinal",
      currentLinks.padletUrl || currentLinks.musicUrl,
      "",
      "",
      ""
    );
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

  function renderStory() {
    $("oneLineIntro").value = state.oneLineIntro;
    $("storyPlace").value = state.storyPlace;
    $("storyProblem").value = state.storyProblem;
    $("storySkillScene").value = state.storySkillScene;
    $("storyText").value = state.storyText;
    $("storyPreview").textContent = storyPreviewText();
    const ready = Boolean(state.oneLineIntro.trim() && state.storyText.trim());
    setStatus("storyStatus", ready ? "이야기 초안이 준비되었습니다. 최종 카드에서 다시 확인하세요." : "한 줄 소개와 캐릭터 이야기를 입력해 주세요.", ready ? "success" : "info");
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
    renderImage("finalImage", "대표 이미지는 내 Google 슬라이드에서 확인합니다.");
    $$("#final-section input[name='finalCheck']").forEach((input) => {
      input.checked = state.finalChecks.includes(input.value);
    });
  }

  function renderSteps() {
    const percent = Math.round(((currentStep + 1) / stepLabels.length) * 100);
    $("currentStepText").textContent = stepLabels[currentStep];
    $("progressText").textContent = `${currentStep + 1} / ${stepLabels.length}`;
    $("progressBar").style.width = `${percent}%`;
    $("prevStep").disabled = currentStep === 0;
    $("nextStep").textContent = currentStep === stepLabels.length - 1 ? "마지막 단계" : "다음 단계";
    $("nextStep").disabled = currentStep === stepLabels.length - 1;
    $$(".step-panel").forEach((panel, index) => {
      panel.hidden = index !== currentStep;
    });
    $$("#stepTabs button").forEach((button, index) => {
      if (index === currentStep) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  }

  function render() {
    renderSteps();
    renderProfile();
    renderStory();
    renderFinalCard();
  }

  function validateStep(index) {
    if (index === 1) {
      if (!state.profile) {
        setStatus("loadStatus", "먼저 내 자료를 불러와 주세요.", "warning");
        return false;
      }
      if (state.checks.length !== 5) {
        setStatus("loadStatus", "자료 확인 체크리스트를 모두 확인해 주세요.", "warning");
        return false;
      }
    }
    if (index === 2 && (!state.oneLineIntro.trim() || !state.storyText.trim())) {
      setStatus("storyStatus", "한 줄 소개와 캐릭터 이야기를 입력해야 다음 단계로 갈 수 있습니다.", "warning");
      return false;
    }
    return true;
  }

  function goStep(nextStep) {
    if (nextStep > currentStep && !validateStep(currentStep)) return;
    currentStep = Math.max(0, Math.min(stepLabels.length - 1, nextStep));
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      currentLinks = blankLinks();
      $("loadStudent").disabled = !selected;
      setStatus("loadStatus", selected ? "이름을 선택했습니다. 내 자료 불러오기를 눌러 주세요." : "이름을 선택한 뒤 내 자료 불러오기를 눌러 주세요.", "info");
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
        state[id] = event.target.value.trim();
        saveState();
        renderStory();
        renderFinalCard();
      });
    });
    $$("#final-section input[name='finalCheck']").forEach((input) => {
      input.addEventListener("change", () => {
        state.finalChecks = $$("#final-section input[name='finalCheck']:checked").map((item) => item.value);
        saveState();
      });
    });
    $("copyCardText").addEventListener("click", () => copyText(cardText(), "copyStatus", "카드 내용을 복사했습니다. 내 Padlet에 붙여 넣으세요."));
    $("completeLesson").addEventListener("click", () => {
      if (state.finalChecks.length !== 3) {
        setStatus("completeStatus", "마지막 확인을 모두 체크해 주세요.", "warning");
        return;
      }
      state.completed = true;
      saveState();
      $("completeBox").hidden = false;
      setStatus("completeStatus", "7차시 활동을 완료했습니다.", "success");
    });
    $("prevStep").addEventListener("click", () => goStep(currentStep - 1));
    $("nextStep").addEventListener("click", () => goStep(currentStep + 1));
  }

  function initSteps() {
    const tabs = $("stepTabs");
    stepLabels.forEach((label, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${index + 1}. ${label}`;
      button.addEventListener("click", () => goStep(index));
      item.appendChild(button);
      tabs.appendChild(item);
    });
  }

  function initStudents() {
    const select = $("studentName");
    students[classId].forEach((name) => select.appendChild(new Option(name, name)));
    const lastId = localStorage.getItem(lastStudentKey());
    const lastName = students[classId].find((name) => studentIdFromName(name) === String(lastId || ""));
    if (lastName) {
      select.value = lastName;
      state = { ...loadState(studentIdFromName(lastName)), studentName: lastName };
      $("loadStudent").disabled = false;
      if (state.profile) setStatus("loadStatus", "저장된 글을 다시 표시했습니다. 링크 확인은 내 자료 불러오기를 눌러 다시 확인하세요.", "success");
    }
  }

  function init() {
    initSteps();
    initStudents();
    bindInputs();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
