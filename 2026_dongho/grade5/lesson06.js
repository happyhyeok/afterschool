// TODO(배포): lesson06_apps_script.gs를 대상 스프레드시트 Apps Script에 추가하고
// 웹 앱으로 배포한 뒤 아래 URL을 /exec 주소로 교체하세요.
const LESSON06_API_URL = "";

// TODO(확인): Settings 시트 또는 Apps Script 응답에서 AI 도구 URL을 제공하면 자동으로 사용합니다.
const LESSON06_AI_TOOL_URL = "";

(() => {
  const SCHOOL_CODE = "dongho";
  const CLASS_COUNTS = { "1반": 14, "2반": 15 };
  const STEP_LABELS = [
    "① 내 자료 확인",
    "② 이미지 점검",
    "③ 수정 요청",
    "④ AI 수정",
    "⑤ 대표 이미지 저장",
    "⑥ 최종 확인"
  ];
  const KEEP_PARTS = ["얼굴·표정", "색상", "옷", "자세", "소품", "배경", "그림 스타일", "직접 입력"];
  const EDIT_PARTS = ["표정", "색상", "옷", "자세", "소품", "배경", "그림 스타일", "특별한 효과", "수정하지 않음"];
  const SECOND_EDIT_PARTS = EDIT_PARTS.filter((part) => part !== "수정하지 않음");
  const HELP_TYPES = [
    "내 자료가 아닙니다.",
    "이미지가 보이지 않습니다.",
    "음악이 열리지 않습니다.",
    "Google 슬라이드가 열리지 않습니다.",
    "AI 수정 방법을 모르겠습니다.",
    "최종 이미지를 저장하지 못했습니다.",
    "기타"
  ];
  const QUESTION_BY_PART = {
    "표정": "어떤 표정으로 바꾸고 싶나요?",
    "색상": "무엇의 색을 어떤 색으로 바꾸고 싶나요?",
    "옷": "어떤 모양이나 종류의 옷으로 바꾸고 싶나요?",
    "자세": "캐릭터가 어떤 행동을 하고 있으면 좋을까요?",
    "소품": "무엇을 빼거나 추가하고 싶나요?",
    "배경": "어떤 장소 또는 색의 배경을 원하나요?",
    "그림 스타일": "어떤 그림 느낌으로 바꾸고 싶나요?",
    "특별한 효과": "대표 스킬을 어떤 효과로 보여 주고 싶나요?"
  };
  const PLACEHOLDER_BY_PART = {
    "표정": "예: 눈을 조금 크게 하고 밝게 웃는 표정으로 바꿔 줘.",
    "색상": "예: 망토 색을 진한 파란색으로 바꿔 줘.",
    "옷": "예: 갑옷을 더 단순한 게임 캐릭터 옷으로 바꿔 줘.",
    "자세": "예: 한 손을 앞으로 내밀고 스킬을 쓰는 자세로 바꿔 줘.",
    "소품": "예: 손에 작은 방패를 추가해 줘.",
    "배경": "예: 캐릭터가 잘 보이는 단순한 밤하늘 배경으로 바꿔 줘.",
    "그림 스타일": "예: 밝고 귀여운 2D 게임 일러스트 느낌으로 바꿔 줘.",
    "특별한 효과": "예: 대표 스킬이 빛나는 파란 원형 보호막처럼 보이게 해 줘."
  };
  const VAGUE_WORDS = ["멋지게", "예쁘게", "귀엽게", "좋게", "강하게", "바꿔 줘"];
  const EXAMPLES = {
    face: "표정 예시: 눈을 조금 크게 하고 밝게 웃는 표정으로 바꿔 줘. 무서운 느낌은 줄여 줘.",
    color: "색상 예시: 캐릭터 옷의 빨간색 부분만 진한 파란색으로 바꿔 줘. 얼굴색은 바꾸지 마.",
    skill: "대표 스킬 효과 예시: 손 주변에 작은 불꽃 방패가 생긴 것처럼 보여 줘. 캐릭터 몸은 가리지 마.",
    background: "배경 예시: 캐릭터가 잘 보이도록 단순한 밤하늘 배경으로 바꿔 줘. 배경에 글자는 넣지 마."
  };
  const IMAGE_LABELS = {
    original: "기존 이미지",
    first: "첫 번째 수정 이미지",
    second: "두 번째 수정 이미지"
  };

  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const defaultClass = document.body.dataset.defaultClass || "1반";

  let student = null;
  let aiToolUrl = LESSON06_AI_TOOL_URL;
  let toastTimer = 0;
  let selectedHelpType = "";
  let state = createBlankState();

  function createBlankState() {
    return {
      studentId: "",
      className: "",
      number: "",
      currentStep: 1,
      identityConfirmed: false,
      satisfaction: "",
      keepPart: "",
      keepCustom: "",
      editPart1: "",
      editDetail1: "",
      editPart2: "",
      editDetail2: "",
      generatedPrompt: "",
      editedPrompt: "",
      editCount: 0,
      firstResultEvaluation: "",
      firstKeepEvaluation: "",
      secondEditPart: "",
      secondEditDetail: "",
      secondPrompt: "",
      selectedImage: "",
      selectionChecks: [],
      selectionReason: "",
      slideSaved: false,
      finalChecks: [],
      reflection: "",
      helpType: "",
      completed: false
    };
  }

  function setStatus(id, text, tone = "info") {
    const element = $(id);
    if (!element) return;
    element.textContent = text;
    element.dataset.tone = tone;
  }

  function showToast(text) {
    const toast = $("toast");
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function safeText(value, fallback = "자료 확인 필요") {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function numberOptions(className) {
    const count = CLASS_COUNTS[className] || 0;
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  function storageKey(studentId = state.studentId) {
    return studentId ? `dongho_lesson06_${studentId}` : "";
  }

  function saveLocalState() {
    const key = storageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(state));
  }

  function loadLocalState(studentId) {
    const key = storageKey(studentId);
    if (!key) return null;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (!saved || saved.studentId !== studentId) return null;
      return { ...createBlankState(), ...saved };
    } catch (_) {
      return null;
    }
  }

  function jsonp(params) {
    return new Promise((resolve, reject) => {
      if (!LESSON06_API_URL) {
        reject(new Error("missing-api-url"));
        return;
      }
      const callback = `lesson06Callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const query = new URLSearchParams({ ...params, callback });
      let finished = false;

      function cleanup() {
        delete window[callback];
        script.remove();
      }

      window[callback] = (data) => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error("network"));
      };

      setTimeout(() => {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error("timeout"));
      }, 12000);

      script.src = `${LESSON06_API_URL}?${query.toString()}`;
      document.body.appendChild(script);
    });
  }

  async function postJson(params) {
    if (!LESSON06_API_URL) throw new Error("missing-api-url");
    const response = await fetch(LESSON06_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(params),
      redirect: "follow"
    });
    if (!response.ok) throw new Error("network");
    return response.json();
  }

  function externalOpen(url, countAsEdit = false) {
    if (!url) return false;
    window.open(url, "_blank", "noopener,noreferrer");
    if (countAsEdit && state.editCount < 2) {
      state.editCount += 1;
      persistImportant("ai_edit_opened");
    }
    render();
    return true;
  }

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
    const ok = document.execCommand("copy");
    area.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error("copy"));
  }

  function populateNumbers() {
    const className = $("classSelect").value;
    const numberSelect = $("numberSelect");
    numberSelect.replaceChildren(new Option("번호 선택", ""));
    numberOptions(className).forEach((number) => {
      numberSelect.appendChild(new Option(`${number}번`, String(number)));
    });
    numberSelect.disabled = !className;
    $("loadStudent").disabled = !className || !numberSelect.value;
  }

  function updateLoadButton() {
    $("loadStudent").disabled = !$("classSelect").value || !$("numberSelect").value;
  }

  async function loadStudent() {
    const className = $("classSelect").value;
    const number = $("numberSelect").value;
    if (!className || !number) return;

    $("loadStudent").disabled = true;
    setStatus("loadStatus", "스프레드시트에서 내 자료를 찾는 중입니다.", "info");
    try {
      const result = await jsonp({
        action: "getStudent",
        school_code: SCHOOL_CODE,
        class_name: className,
        number
      });
      if (!result?.success || !result.student) throw new Error(result?.message || "not-found");
      student = normalizeStudent(result.student);
      aiToolUrl = result.ai_tool_url || student.ai_tool_url || LESSON06_AI_TOOL_URL;
      state = loadLocalState(student.student_id) || {
        ...createBlankState(),
        studentId: student.student_id,
        className: student.class_name,
        number: String(student.number),
        currentStep: 1
      };
      saveLocalState();
      setStatus("loadStatus", "자료를 불러왔습니다. 본인 자료가 맞는지 확인하세요.", "success");
      showToast("내 자료를 불러왔습니다.");
      render();
      $("studentStrip").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      const message = error.message === "missing-api-url"
        ? "Apps Script /exec URL이 아직 설정되지 않았습니다. 선생님께 알려 주세요."
        : "학생 자료를 찾지 못했습니다. 학급과 번호를 확인한 뒤 선생님께 알려 주세요.";
      setStatus("loadStatus", message, "error");
    } finally {
      $("loadStudent").disabled = !$("classSelect").value || !$("numberSelect").value;
    }
  }

  function normalizeStudent(raw) {
    return {
      student_id: raw.student_id || raw.studentId || "",
      class_name: raw.class_name || raw.className || "",
      number: raw.number || "",
      name: raw.name || "",
      character_name: raw.character_name || raw.characterName || "",
      personality: raw.personality || "",
      ability: raw.ability || raw.characterPower || raw.mainSkill || "",
      skill_description: raw.skill_description || raw.skillDescription || "",
      slides_url: raw.slides_url || raw.slidesUrl || "",
      image_url: raw.image_url || raw.imageUrl || "",
      padlet_url: raw.padlet_url || raw.padletUrl || "",
      music_url: raw.music_url || raw.musicUrl || "",
      image_status: raw.image_status || raw.imageStatus || "",
      music_status: raw.music_status || raw.musicStatus || "",
      support_note: raw.support_note || raw.supportNote || "",
      ai_tool_url: raw.ai_tool_url || raw.aiToolUrl || ""
    };
  }

  function profileRows() {
    return [
      ["캐릭터 이름", safeText(student?.character_name)],
      ["성격", safeText(student?.personality)],
      ["대표 스킬", safeText(student?.ability)],
      ["스킬 설명", safeText(student?.skill_description)],
      ["이미지 상태", safeText(student?.image_status)],
      ["음악 상태", safeText(student?.music_status)],
      ["도움 메모", safeText(student?.support_note, "없음")]
    ];
  }

  function setupLink(id, statusId, url, emptyText, okText) {
    const link = $(id);
    if (url) {
      link.href = url;
      link.setAttribute("aria-disabled", "false");
      setStatus(statusId, okText, "success");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      setStatus(statusId, emptyText, "warning");
    }
  }

  function renderStudentData() {
    if (!student) return;
    $("studentStrip").hidden = false;
    $("studentLabel").textContent = `5학년 ${student.class_name} ${student.number}번 ${student.name} 학생의 자료입니다.`;
    $("identityText").textContent = `5학년 ${student.class_name} ${student.number}번 ${student.name} 학생의 자료입니다. 이 자료가 내 캐릭터가 맞나요?`;
    $("identityNotice").hidden = state.identityConfirmed || state.helpType !== "내 자료가 아닙니다.";

    const profileList = $("profileList");
    profileList.replaceChildren();
    profileRows().forEach(([label, text]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = text;
      profileList.append(dt, dd);
    });

    const visual = $("characterVisual");
    visual.replaceChildren();
    if (student.image_url) {
      const image = new Image();
      image.alt = `${student.character_name || "내 캐릭터"} 기존 이미지`;
      image.onload = () => visual.replaceChildren(image);
      image.onerror = () => {
        visual.textContent = "기존 이미지를 찾지 못했습니다. 내 Google 슬라이드에서 확인하거나 선생님께 알려 주세요.";
      };
      image.src = student.image_url;
    } else {
      visual.textContent = "기존 이미지를 찾지 못했습니다. 내 Google 슬라이드에서 확인하거나 선생님께 알려 주세요.";
    }

    setupLink("imageLink", "imageLinkStatus", student.image_url, "기존 이미지를 찾지 못했습니다. 내 Google 슬라이드에서 확인하거나 선생님께 알려 주세요.", "기존 이미지 링크가 준비되어 있습니다.");
    setupLink("musicLink", "musicLinkStatus", student.music_url, "음악 자료를 확인하고 있습니다. 선생님께 알려 주세요.", "음악 링크가 준비되어 있습니다.");
    setupLink("slidesLink", "slidesLinkStatus", student.slides_url, "개인 Google 슬라이드 링크를 확인하고 있습니다. 선생님께 알려 주세요.", "개인 Google 슬라이드 링크가 준비되어 있습니다.");
    setupLink("slidesLinkStep5", "slideSavedStatus", student.slides_url, "개인 Google 슬라이드 링크를 확인하고 있습니다. 선생님께 알려 주세요.", state.slideSaved ? "슬라이드 저장 확인 완료" : "슬라이드 링크가 준비되어 있습니다.");
  }

  function selectedKeepPart() {
    return state.keepPart === "직접 입력" ? state.keepCustom.trim() : state.keepPart;
  }

  function requestedParts() {
    return [state.editPart1, state.editPart2].filter((part) => part && part !== "수정하지 않음");
  }

  function buildPrompt() {
    const lines = [];
    const keepPart = selectedKeepPart();
    if (keepPart) lines.push(`이 캐릭터의 ${keepPart}은 그대로 유지해 줘.`);
    requestedParts().forEach((part, index) => {
      const detail = index === 0 ? state.editDetail1 : state.editDetail2;
      if (detail.trim()) lines.push(`${part} 부분을 ${detail.trim()}으로 바꿔 줘.`);
    });
    if (student?.personality && student?.ability) {
      lines.push(`캐릭터는 ${student.personality} 성격이고 대표 스킬은 ${student.ability}입니다.`);
    } else if (student?.personality) {
      lines.push(`캐릭터는 ${student.personality} 성격입니다.`);
    } else if (student?.ability) {
      lines.push(`캐릭터의 대표 스킬은 ${student.ability}입니다.`);
    }
    lines.push("다른 부분은 가능한 한 바꾸지 말아 줘.");
    return lines.join("\n");
  }

  function buildSecondPrompt() {
    const keepPart = selectedKeepPart() || "마음에 드는 부분";
    const editPart = state.secondEditPart || "수정할 부분";
    const detail = state.secondEditDetail.trim() || "원하는 모습";
    return [
      `지금 이미지에서 ${keepPart}은 그대로 유지해 줘.`,
      `${editPart}만 ${detail}으로 바꿔 줘.`,
      "다른 부분은 바꾸지 말아 줘."
    ].join("\n");
  }

  function syncPrompt() {
    state.keepCustom = $("keepCustom").value.trim();
    state.generatedPrompt = buildPrompt();
    if (!state.editedPrompt || state.editedPrompt === $("editedPrompt").dataset.generated) {
      state.editedPrompt = state.generatedPrompt;
    }
    $("editedPrompt").dataset.generated = state.generatedPrompt;
    $("editedPrompt").value = state.editedPrompt;
    state.secondPrompt = buildSecondPrompt();
    $("secondPrompt").value = state.secondPrompt;
    saveLocalState();
  }

  function hasVagueInput() {
    const inputs = [state.editDetail1, state.editDetail2, state.secondEditDetail].map((text) => text.trim());
    return inputs.some((text) => {
      if (!text) return false;
      return text.length <= 5 || VAGUE_WORDS.includes(text);
    });
  }

  function renderChoiceButtons(containerId, values, selected, onSelect, disabledValue = () => false) {
    const container = $(containerId);
    container.replaceChildren();
    values.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-card";
      button.textContent = value;
      button.dataset.value = value;
      button.disabled = disabledValue(value);
      button.classList.toggle("selected", value === selected);
      button.addEventListener("click", () => onSelect(value));
      container.appendChild(button);
    });
  }

  function renderRadioGroups() {
    $$("[data-radio-group]").forEach((group) => {
      const key = group.dataset.radioGroup;
      group.querySelectorAll(".choice-card").forEach((button) => {
        button.classList.toggle("selected", button.dataset.value === state[key]);
      });
    });
  }

  function renderStepTwo() {
    renderChoiceButtons("keepPartChoices", KEEP_PARTS, state.keepPart, (value) => {
      state.keepPart = value;
      if (value !== "직접 입력") state.keepCustom = "";
      state.editedPrompt = "";
      syncPrompt();
      render();
    });
    $("keepCustomWrap").hidden = state.keepPart !== "직접 입력";
    $("keepCustom").value = state.keepCustom;
    const keepText = selectedKeepPart();
    $("keepSentence").textContent = keepText
      ? `내가 유지하고 싶은 것은 ${keepText}입니다.`
      : "내가 유지하고 싶은 것은 아직 선택하지 않았습니다.";

    renderChoiceButtons("editPartChoices", EDIT_PARTS, state.editPart1, (value) => {
      state.editPart1 = value;
      state.editDetail1 = value === "수정하지 않음" ? "" : state.editDetail1;
      state.editPart2 = "";
      state.editDetail2 = "";
      state.editedPrompt = "";
      syncPrompt();
      render();
    });
    $("addSecondEdit").hidden = !state.editPart1 || state.editPart1 === "수정하지 않음" || state.editPart2;
    $("secondEditArea").hidden = !state.editPart2;
    if (state.editPart2 || (!state.editPart2 && !$("addSecondEdit").hidden)) {
      renderChoiceButtons("editPart2Choices", SECOND_EDIT_PARTS, state.editPart2, (value) => {
        state.editPart2 = value;
        state.editedPrompt = "";
        syncPrompt();
        render();
      }, (value) => value === state.editPart1);
    }
  }

  function renderDetailQuestions() {
    const wrap = $("detailQuestions");
    wrap.replaceChildren();
    const parts = requestedParts();
    if (!parts.length) {
      const card = document.createElement("div");
      card.className = "question-card";
      card.innerHTML = "<h3>수정하지 않음</h3><p>기존 이미지를 사용할 경우에도 유지할 부분을 적고, 다음 단계에서 기존 이미지를 선택할 수 있습니다.</p>";
      wrap.appendChild(card);
    }
    parts.forEach((part, index) => {
      const key = index === 0 ? "editDetail1" : "editDetail2";
      const card = document.createElement("label");
      card.className = "question-card field";
      const title = document.createElement("h3");
      title.textContent = `${part}: ${QUESTION_BY_PART[part] || "어떻게 바꾸고 싶나요?"}`;
      const input = document.createElement("input");
      input.type = "text";
      input.value = state[key];
      input.placeholder = PLACEHOLDER_BY_PART[part] || "구체적으로 적어 보세요.";
      input.addEventListener("input", () => {
        state[key] = input.value.trim();
        state.editedPrompt = "";
        syncPrompt();
        render();
      });
      card.append(title, input);
      wrap.appendChild(card);
    });
    $("vagueWarning").hidden = !hasVagueInput();
  }

  function renderStepFour() {
    $("editCountText").textContent = `AI 수정 횟수: ${state.editCount} / 2`;
    $("editCountBar").style.width = `${Math.min(state.editCount, 2) * 50}%`;
    const canOpenAi = Boolean(aiToolUrl) && state.editCount < 2 && state.editPart1 !== "수정하지 않음";
    $("openAiTool").disabled = !canOpenAi;
    $("openAiToolSecond").disabled = !Boolean(aiToolUrl) || state.editCount >= 2 || !state.secondEditPart || !state.secondEditDetail.trim();
    if (!aiToolUrl) {
      setStatus("aiToolStatus", "AI 도구 주소를 확인하고 있습니다. 선생님께 알려 주세요.", "warning");
    } else if (state.editCount >= 2) {
      setStatus("aiToolStatus", "AI 수정 횟수 2회를 모두 사용했습니다. 이제 대표 이미지를 선택하세요.", "success");
    } else if (state.editPart1 === "수정하지 않음") {
      setStatus("aiToolStatus", "수정하지 않음을 선택했습니다. 기존 이미지를 대표 이미지로 사용할 수 있습니다.", "success");
    } else {
      setStatus("aiToolStatus", "프롬프트를 복사한 뒤 AI 도구를 새 창에서 여세요.", "info");
    }
    $("secondEditPanel").hidden = !state.secondEditPart && !state.secondEditDetail;
    renderChoiceButtons("secondEditPartChoices", SECOND_EDIT_PARTS, state.secondEditPart, (value) => {
      state.secondEditPart = value;
      state.secondPrompt = buildSecondPrompt();
      saveLocalState();
      render();
    });
    $("secondEditDetail").value = state.secondEditDetail;
    $("secondPrompt").value = state.secondPrompt || buildSecondPrompt();
  }

  function renderStepFive() {
    $$("[data-image-choice]").forEach((button) => {
      const choice = button.dataset.imageChoice;
      const enabled = choice === "original" || (choice === "first" && state.editCount >= 1) || (choice === "second" && state.editCount >= 2);
      button.disabled = !enabled;
      button.classList.toggle("selected", state.selectedImage === choice);
    });
    $$("input[type='checkbox']").forEach((input) => {
      if (input.closest("#finalCheckPanel")) return;
      if (["personality", "skill", "keep", "clear"].includes(input.value)) {
        input.checked = state.selectionChecks.includes(input.value);
      }
    });
    $("selectionReason").value = state.selectionReason;
    const label = IMAGE_LABELS[state.selectedImage] || "선택한 이미지";
    $("selectionSentence").textContent = state.selectedImage && state.selectionReason
      ? `나는 ${label}를 선택했습니다. 그 이유는 ${state.selectionReason}이기 때문입니다.`
      : "나는 아직 대표 이미지를 선택하지 않았습니다.";
    $("slideSavedStatus").textContent = state.slideSaved ? "슬라이드에 저장했다고 표시했습니다." : "아직 슬라이드 저장 확인을 하지 않았습니다.";
    $("slideSavedStatus").dataset.tone = state.slideSaved ? "success" : "info";
  }

  function renderStepSix() {
    const musicExists = Boolean(student?.music_url);
    const musicCheckLabel = $("finalCheckPanel").querySelector("[data-music-check]").closest("label");
    const musicMissingLabel = $("finalCheckPanel").querySelector("[data-music-missing]").closest("label");
    musicCheckLabel.hidden = !musicExists;
    musicMissingLabel.hidden = musicExists;
    $$("[data-music-missing]").forEach((input) => {
      input.hidden = false;
    });

    $$("#finalCheckPanel input[type='checkbox']").forEach((input) => {
      input.checked = state.finalChecks.includes(input.value);
    });
    if (!state.reflection) {
      const keep = selectedKeepPart() || "유지할 점";
      const edit = requestedParts().join(", ") || "수정하지 않은 점";
      const reason = state.selectionReason || "내 캐릭터와 잘 어울리기 때문";
      state.reflection = `AI가 처음 만든 이미지에서 ${keep}은 유지하고,\n${edit}을 수정했습니다.\n수정한 이유는 ${reason}입니다.`;
    }
    $("reflection").value = state.reflection;
    const done = canComplete();
    $("completeLesson").disabled = !done || state.completed;
    $("completeLesson").textContent = state.completed ? "6차시 활동을 완료했습니다." : "6차시 활동 완료";
    if (state.completed) {
      setStatus("completeStatus", "잘했습니다!\n\n7차시에는 오늘 정리한 이미지와 설정, 음악을 이용해 나의 캐릭터 카드를 만듭니다.", "success");
    } else {
      setStatus("completeStatus", done ? "완료할 준비가 되었습니다." : "필수 체크와 입력이 끝나면 완료할 수 있습니다.", done ? "success" : "info");
    }
  }

  function renderTop() {
    $("currentStepText").textContent = student
      ? STEP_LABELS[state.currentStep - 1]
      : "학급과 번호를 선택하세요.";
    $("topProgressBar").style.width = student ? `${Math.round((state.currentStep / 6) * 100)}%` : "0";
    const track = $("stepTrack");
    if (!track.childElementCount) {
      STEP_LABELS.forEach((label, index) => {
        const chip = document.createElement("span");
        chip.className = "step-chip";
        chip.dataset.step = String(index + 1);
        chip.textContent = label;
        track.appendChild(chip);
      });
    }
    $$(".step-chip").forEach((chip) => {
      const step = Number(chip.dataset.step);
      chip.classList.toggle("active", student && step === state.currentStep);
      chip.classList.toggle("done", student && (step < state.currentStep || (step === 1 && state.identityConfirmed)));
    });
  }

  function renderNavigation() {
    $("bottomNav").hidden = !student;
    $("prevStep").disabled = !student || state.currentStep <= 1;
    $("nextStep").disabled = !canGoNext();
    $("nextStep").textContent = state.currentStep >= 6 ? "마무리" : "다음 →";
  }

  function render() {
    renderTop();
    $("startPanel").hidden = Boolean(student);
    $$("[data-step-panel]").forEach((panel) => {
      panel.hidden = !student || Number(panel.dataset.stepPanel) !== state.currentStep;
    });
    if (student) {
      renderStudentData();
      renderStepTwo();
      renderDetailQuestions();
      renderStepFour();
      renderStepFive();
      renderStepSix();
      renderRadioGroups();
      $("confirmIdentity").disabled = state.identityConfirmed;
      $("rejectIdentity").disabled = state.identityConfirmed;
      $("saveState").dataset.tone = state.completed ? "success" : $("saveState").dataset.tone || "info";
    }
    renderNavigation();
    saveLocalState();
  }

  function canGoNext() {
    if (!student) return false;
    if (state.currentStep === 1) return state.identityConfirmed;
    if (state.currentStep === 2) return Boolean(state.satisfaction && selectedKeepPart() && state.editPart1);
    if (state.currentStep === 3) {
      return requestedParts().every((_, index) => (index === 0 ? state.editDetail1 : state.editDetail2).trim()) ||
        state.editPart1 === "수정하지 않음";
    }
    if (state.currentStep === 4) return Boolean(state.selectedImage || state.editPart1 === "수정하지 않음" || state.editCount > 0);
    if (state.currentStep === 5) return Boolean(state.selectedImage && state.selectionChecks.length >= 3 && state.selectionReason.trim() && state.slideSaved);
    return false;
  }

  function canComplete() {
    const musicValue = student?.music_url ? "music_checked" : "music_missing";
    const required = ["image_saved", "name_checked", "personality_checked", "skill_checked", musicValue, "reason_written"];
    return required.every((value) => state.finalChecks.includes(value)) && state.reflection.trim();
  }

  function progressStep(nextStep) {
    if (!student) return;
    state.currentStep = Math.max(1, Math.min(6, nextStep));
    saveLocalState();
    render();
    document.querySelector(`[data-step-panel="${state.currentStep}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function persistImportant(reason) {
    saveLocalState();
    saveProgress(reason).catch(() => {});
  }

  async function saveProgress(reason) {
    if (!student || !LESSON06_API_URL) {
      if (!LESSON06_API_URL) {
        $("saveState").textContent = "웹앱 URL 확인 필요";
        $("saveState").dataset.tone = "error";
      }
      return;
    }
    $("saveState").textContent = "저장 중";
    $("saveState").dataset.tone = "info";
    try {
      const payload = buildProgressPayload(reason);
      let result;
      try {
        result = await postJson(payload);
      } catch (_) {
        result = await jsonp(payload);
      }
      if (!result?.success) throw new Error(result?.message || "save");
      $("saveState").textContent = "저장됨";
      $("saveState").dataset.tone = "success";
    } catch (_) {
      $("saveState").textContent = "저장 실패";
      $("saveState").dataset.tone = "error";
      setStatus("completeStatus", "인터넷 연결 때문에 저장하지 못했습니다. 작업 내용은 이 컴퓨터에 남아 있습니다. 잠시 후 다시 저장해 주세요.", "error");
    }
  }

  function buildProgressPayload(reason) {
    const payload = {
      action: "saveLesson06Progress",
      reason,
      student_id: state.studentId,
      school_code: SCHOOL_CODE,
      class_name: state.className,
      number: state.number,
      current_step: state.currentStep
    };
    const put = (key, value, includeEmpty = false) => {
      if (includeEmpty || value !== undefined && value !== null && String(value).trim() !== "") {
        payload[key] = value;
      }
    };

    if (state.identityConfirmed || reason === "identity_confirmed" || state.completed) {
      payload.identity_confirmed = String(state.identityConfirmed);
    }
    put("satisfaction", state.satisfaction);
    put("keep_part", state.keepPart);
    put("keep_custom", state.keepCustom);
    put("edit_part_1", state.editPart1);
    put("edit_detail_1", state.editDetail1);
    put("edit_part_2", state.editPart2);
    put("edit_detail_2", state.editDetail2);
    put("generated_prompt", state.generatedPrompt);
    put("edited_prompt", state.editedPrompt);
    payload.edit_count = state.editCount;
    put("first_result_evaluation", state.firstResultEvaluation);
    put("first_keep_evaluation", state.firstKeepEvaluation);
    put("second_edit_part", state.secondEditPart);
    put("second_edit_detail", state.secondEditDetail);
    put("second_prompt", state.secondPrompt);
    put("selected_image", IMAGE_LABELS[state.selectedImage] || state.selectedImage);
    put("selection_reason", state.selectionReason);
    if (state.slideSaved || state.completed) payload.slide_saved = String(state.slideSaved);
    if (state.finalChecks.length) payload.final_checks = state.finalChecks.join(", ");
    put("reflection", state.reflection);
    put("help_type", state.helpType);
    if (state.completed || reason === "completed") payload.completed = String(state.completed);
    return payload;
  }

  function selectRadioState(key, value) {
    state[key] = value;
    if (key === "satisfaction" && value === "그대로 사용하고 싶어요" && !state.editPart1) {
      state.editPart1 = "수정하지 않음";
    }
    saveLocalState();
    render();
  }

  function renderHelpChoices() {
    renderChoiceButtons("helpChoices", HELP_TYPES, selectedHelpType, (value) => {
      selectedHelpType = value;
      renderHelpChoices();
    });
  }

  function initStaticChoices() {
    $$("[data-radio-group]").forEach((group) => {
      group.querySelectorAll(".choice-card").forEach((button) => {
        button.addEventListener("click", () => selectRadioState(group.dataset.radioGroup, button.dataset.value));
      });
    });
    renderHelpChoices();
  }

  function initEvents() {
    $("classSelect").value = defaultClass;
    populateNumbers();
    $("classSelect").addEventListener("change", () => {
      populateNumbers();
      setStatus("loadStatus", "자신의 학급과 번호를 정확하게 선택하세요. 친구의 자료를 열거나 수정하지 않습니다.", "info");
    });
    $("numberSelect").addEventListener("change", updateLoadButton);
    $("loadStudent").addEventListener("click", loadStudent);
    $("confirmIdentity").addEventListener("click", () => {
      state.identityConfirmed = true;
      state.helpType = "";
      persistImportant("identity_confirmed");
      showToast("본인 확인 완료!");
      render();
    });
    $("rejectIdentity").addEventListener("click", () => {
      state.helpType = "내 자료가 아닙니다.";
      persistImportant("help_requested");
      render();
    });
    $("keepCustom").addEventListener("input", () => {
      state.keepCustom = $("keepCustom").value.trim();
      state.editedPrompt = "";
      syncPrompt();
      render();
    });
    $("addSecondEdit").addEventListener("click", () => {
      $("secondEditArea").hidden = false;
      renderChoiceButtons("editPart2Choices", SECOND_EDIT_PARTS, state.editPart2, (value) => {
        state.editPart2 = value;
        state.editedPrompt = "";
        syncPrompt();
        render();
      }, (value) => value === state.editPart1);
    });
    $("editedPrompt").addEventListener("input", () => {
      state.editedPrompt = $("editedPrompt").value;
      saveLocalState();
    });
    $("copyPrompt").addEventListener("click", async () => {
      try {
        await copyText($("editedPrompt").value);
        setStatus("copyStatus", "프롬프트를 복사했습니다. AI 화면에 붙여넣으세요.", "success");
        showToast("프롬프트 복사 완료!");
      } catch (_) {
        setStatus("copyStatus", "클립보드 복사에 실패했습니다. 프롬프트를 직접 선택해서 복사해 주세요.", "error");
      }
    });
    $$("[data-example-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const box = $("exampleBox");
        box.textContent = EXAMPLES[button.dataset.exampleToggle] || "";
        box.hidden = false;
      });
    });
    $("openAiTool").addEventListener("click", () => externalOpen(aiToolUrl, true));
    $("openAiToolSecond").addEventListener("click", () => externalOpen(aiToolUrl, true));
    $("useFirstCandidate").addEventListener("click", () => {
      if (state.editCount < 1) state.editCount = 1;
      state.selectedImage = "first";
      persistImportant("first_ai_result");
      render();
    });
    $("requestSecondEdit").addEventListener("click", () => {
      $("secondEditPanel").hidden = false;
      if (!state.secondEditPart) state.secondEditPart = SECOND_EDIT_PARTS[0];
      render();
    });
    $("useOriginalImage").addEventListener("click", () => {
      state.selectedImage = "original";
      persistImportant("original_image_selected");
      render();
    });
    $("secondEditDetail").addEventListener("input", () => {
      state.secondEditDetail = $("secondEditDetail").value.trim();
      state.secondPrompt = buildSecondPrompt();
      saveLocalState();
      render();
    });
    $("secondPrompt").addEventListener("input", () => {
      state.secondPrompt = $("secondPrompt").value;
      saveLocalState();
    });
    $("copySecondPrompt").addEventListener("click", async () => {
      try {
        await copyText($("secondPrompt").value);
        showToast("두 번째 프롬프트 복사 완료!");
      } catch (_) {
        showToast("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
      }
    });
    $$("[data-image-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        state.selectedImage = button.dataset.imageChoice;
        persistImportant("representative_image_selected");
        render();
      });
    });
    $$("input[type='checkbox']").forEach((input) => {
      input.addEventListener("change", () => {
        if (input.closest("#finalCheckPanel")) {
          state.finalChecks = $$("#finalCheckPanel input[type='checkbox']:checked").map((checked) => checked.value);
        } else if (["personality", "skill", "keep", "clear"].includes(input.value)) {
          state.selectionChecks = $$(".check-panel input[type='checkbox']:checked")
            .filter((checked) => ["personality", "skill", "keep", "clear"].includes(checked.value))
            .map((checked) => checked.value);
        }
        saveLocalState();
        render();
      });
    });
    $("selectionReason").addEventListener("input", () => {
      state.selectionReason = $("selectionReason").value.trim();
      saveLocalState();
      render();
    });
    $("toggleSlideHelp").addEventListener("click", () => {
      $("slideHelpBox").hidden = !$("slideHelpBox").hidden;
    });
    $("markSlideSaved").addEventListener("click", () => {
      state.slideSaved = true;
      persistImportant("slide_saved");
      render();
    });
    $("reflection").addEventListener("input", () => {
      state.reflection = $("reflection").value.trim();
      saveLocalState();
      render();
    });
    $("completeLesson").addEventListener("click", async () => {
      if (!canComplete() || state.completed) return;
      state.completed = true;
      await saveProgress("completed");
      saveLocalState();
      render();
    });
    $("prevStep").addEventListener("click", () => progressStep(state.currentStep - 1));
    $("nextStep").addEventListener("click", () => {
      if (!canGoNext()) return;
      if (state.currentStep === 2) persistImportant("edit_plan_complete");
      if (state.currentStep === 5) persistImportant("representative_image_saved");
      progressStep(state.currentStep + 1);
    });
    $("goHome").addEventListener("click", () => {
      student = null;
      state = createBlankState();
      selectedHelpType = "";
      $("studentStrip").hidden = true;
      render();
    });
    $("openHelp").addEventListener("click", () => {
      $("helpModal").hidden = false;
      $("helpMessage").hidden = true;
      $("helpChoices").querySelector(".choice-card")?.focus();
    });
    $("closeHelp").addEventListener("click", () => {
      $("helpModal").hidden = true;
    });
    $("submitHelp").addEventListener("click", () => {
      if (!selectedHelpType) {
        showToast("도움 종류를 먼저 선택하세요.");
        return;
      }
      state.helpType = selectedHelpType;
      $("helpMessage").hidden = false;
      persistImportant("help_requested");
      render();
    });
  }

  function init() {
    initStaticChoices();
    initEvents();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
