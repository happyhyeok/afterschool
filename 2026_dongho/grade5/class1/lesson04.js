const PADLET_URLS = {
  class1: "https://padlet.com/sorbaram/padlet-v5l28cbqquv9fctb?frame_id=page%3AlB-urcukzvO0L_VANlEHm",
  class2: "https://padlet.com/sorbaram/5-2-3ze33zi1rrld1mwq?frame_id=page%3AVhWTLd-LX9e6fGAc8aiFA"
};
const GEMINI_URL = "https://gemini.google.com/";
const SUNO_URL = "https://suno.com/";
const STUDENT_PROFILE_API_URL = "https://script.google.com/macros/s/AKfycbyICrDSlTbpBpzuv3U2n0RBTbvM4NUVgUJMQENJdep656lzO8YWR4AK4OlKsUddXNOZIw/exec";

(() => {
  const STORAGE_PREFIX = "lesson04ThemeSound.";
  const PROFILE_FIELD_IDS = ["characterName", "characterPersonality", "mainSkill"];
  const STORE_IDS = [
    "characterName",
    "characterPersonality",
    "mainSkill",
    "weakness",
    "keyword1",
    "keyword2",
    "keyword3",
    "genre",
    "lyricLine1",
    "lyricLine2",
    "lyricLine3",
    "lyricLine4",
    "finalSunoPrompt",
    "sunoLink",
    "aiPromise",
    "ethics1",
    "ethics2",
    "ethics3",
    "ethics4"
  ];

  const STUDENT_SLIDE_LINKS = {
    class1: [
      { name: "01. 곽예준", url: "https://docs.google.com/presentation/d/1Qb6iiRj6OnIR1pK8GaTV63eBMH9Lk01csPWHtmhTcds/edit?usp=sharing" },
      { name: "02. 김민주", url: "https://docs.google.com/presentation/d/1W27mLvNC5KZCLous1YAyh6oK03tdmmb8--BLH6MWKuI/edit?usp=sharing" },
      { name: "03. 김우람", url: "https://docs.google.com/presentation/d/138xrtjcIrfEjDEY_4WqBUsoypre5j-ThiCuOvAgZMWA/edit?usp=sharing" },
      { name: "04. 김태양", url: "https://docs.google.com/presentation/d/1Ob39Ukwku3MOZQkGKQkB8VYji8_ey31vivHP3sIFMiA/edit?usp=sharing" },
      { name: "05. 김태현", url: "https://docs.google.com/presentation/d/1kDT3tPh5FbPP2y3ZnhGFtx8RNkQVDn_kIq5NeanRwJI/edit?usp=sharing" },
      { name: "06. 김효민", url: "https://docs.google.com/presentation/d/1UFB1dd3-JSkvMkbiHCL3r3XJ34eomcS34eo3hkNS_6w/edit?usp=sharing" },
      { name: "07. 박민준", url: "https://docs.google.com/presentation/d/1Oo8hV7-7wBHlwGXR1MnJ1GbSS7jmfTPcQ-RQmp-yjOs/edit?usp=sharing" },
      { name: "08. 박하율", url: "https://docs.google.com/presentation/d/1Fkdn_3VL1LBWtLGrNlq1WnNNUHelyj_8Tel63sl_Lzo/edit?usp=sharing" },
      { name: "09. 서자건", url: "https://docs.google.com/presentation/d/1aVIDgrrWaibRmLx2S3Mv3JidAzItM8eFfw-ZmoS_beQ/edit?usp=sharing" },
      { name: "10. 이정우", url: "https://docs.google.com/presentation/d/16oaJwvE9k410AidM2Iy8lw2jqyudoymucTfEZQOafg4/edit?usp=sharing" },
      { name: "11. 조예빈", url: "https://docs.google.com/presentation/d/1TqM_2HIGgQP88nUjXg8ljZMQr_3-FHCBqhgd5EWoIaY/edit?usp=sharing" },
      { name: "12. 지현서", url: "https://docs.google.com/presentation/d/1xLLacOZxlJh7m1gp2lheAb8xr4OZiQG-znLmr2RGlkc/edit?usp=sharing" },
      { name: "13. 차소민", url: "https://docs.google.com/presentation/d/10-jjlA0jtvQW4EKnKNrBi275xi_msezghd3VLBD3zOo/edit?usp=sharing" },
      { name: "14. 채종후", url: "https://docs.google.com/presentation/d/1797LteZ11_v_41H_AQFxQ0FhzNSr6Ra_GhMdzP7KHJo/edit?usp=sharing" }
    ],
    class2: [
      { name: "01. 권하린", url: "https://docs.google.com/presentation/d/1a5HZ8TubUrmbwVQRWsGMDWW3MuSBlFQlKs8TUb2nExA/edit?usp=sharing" },
      { name: "02. 김리아", url: "https://docs.google.com/presentation/d/1gYLkjXMFHoo7KUZXwiUUsdI8QyEqZGrNmuxwmFrMT-I/edit?usp=sharing" },
      { name: "03. 김문준", url: "https://docs.google.com/presentation/d/1gUSWfKZTYWzKLO-euRUel51cYf1z7EfwibLQU7cuIY8/edit?usp=sharing" },
      { name: "04. 김아랑", url: "https://docs.google.com/presentation/d/148viVn-FiwTrGOa17q1dEwxwg1k33YHt9UbglRoQDF4/edit?usp=sharing" },
      { name: "05. 김예슬", url: "https://docs.google.com/presentation/d/1CeSerkaBtb7FQWXsKzA0DLCn596NcsexVRZsLWUy_K0/edit?usp=sharing" },
      { name: "06. 김우현", url: "https://docs.google.com/presentation/d/1br3TYNZc-ginfPLK8G18t3kEbxKWIa6y2cdehD-ag6k/edit?usp=sharing" },
      { name: "07. 김효건", url: "https://docs.google.com/presentation/d/1Q6Wp4F_9_jQGIQnvc6gFEmZMx5kM78e3vQCqv_XoHFk/edit?usp=sharing" },
      { name: "08. 문서진", url: "https://docs.google.com/presentation/d/1AJop5hMosKi9awVFzDKsRyM0Oe0-GmJeLzi8BFdkZoo/edit?usp=sharing" },
      { name: "09. 변수현", url: "https://docs.google.com/presentation/d/1Gj37_2Uu7b8WCjMzG7wvOrw8lj8ddelVmt-hjJxQlzg/edit?usp=sharing" },
      { name: "10. 신예건", url: "https://docs.google.com/presentation/d/1nK50vbPDCgjTdrffQffrHb5c2DasV59LlUQGG5gBu88/edit?usp=sharing" },
      { name: "11. 심현지", url: "https://docs.google.com/presentation/d/13CMd2qgOGJBFwRtLn3h8fQTvdj-7_W627PdXxA1z_FU/edit?usp=sharing" },
      { name: "12. 양승윤", url: "https://docs.google.com/presentation/d/1hGYwQzhLuwcNm_U6su-yu4hzhFZGY0kkZmzISJ0B5O8/edit?usp=sharing" },
      { name: "13. 연율", url: "https://docs.google.com/presentation/d/189SpaNrBlbkg7qG9VZOSWRbW6MpByYSAqEhA3FWUJgE/edit?usp=sharing" },
      { name: "14. 이정우", url: "https://docs.google.com/presentation/d/1XnGSlNBqRaXpqWJboFpLUKNV0tu1rjaiukwrjrAQP88/edit?usp=sharing" },
      { name: "15. 최푸른", url: "https://docs.google.com/presentation/d/1KiKC19fI1BvG7Cks69Fx2Ljv1txdWFDrcNYjm-r5dlc/edit?usp=sharing" }
    ]
  };

  const QUICK_OPTIONS = {
    attr: ["번개", "얼음", "불꽃", "그림자", "바람", "별빛"],
    target: ["고양이", "여우", "로봇", "용", "토끼", "펭귄"],
    ending: ["루미", "코코", "타로", "미루", "제트", "라온"],
    ability: [
      "번개처럼 빠르게 이동한다",
      "얼음 방패를 만든다",
      "불꽃 에너지를 발사한다",
      "그림자 속으로 숨는다",
      "친구를 회복시킨다",
      "바람을 타고 높이 점프한다"
    ],
    weakness: [
      "물에 닿으면 힘이 약해진다",
      "오래 싸우면 쉽게 지친다",
      "큰 소리가 나면 집중하지 못한다",
      "밝은 빛에 약하다",
      "혼자 있으면 힘이 약해진다",
      "움직임이 너무 빨라 가끔 방향을 잃는다"
    ],
    personality: [
      "장난꾸러기",
      "용감함",
      "조용하지만 똑똑함",
      "신비로움",
      "따뜻함",
      "자신감이 넘침"
    ]
  };

  const QUICK_TARGET_MAP = {
    "고양이": "냥",
    "여우": "여우",
    "로봇": "로봇",
    "용": "드래곤",
    "토끼": "토끼",
    "펭귄": "펭귄"
  };

  const $ = (id) => document.getElementById(id);
  const storageKey = (id) => `${STORAGE_PREFIX}${id}`;
  const toast = $("toast");
  let toastTimer = 0;
  let selectedStudent = null;
  let profileSaveTimer = 0;
  let quickState = {
    attr: "",
    target: "",
    ending: "",
    ability: "",
    weakness: "",
    personality: ""
  };

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  function readStorage(id) {
    try {
      return window.localStorage.getItem(storageKey(id));
    } catch (error) {
      return null;
    }
  }

  function writeStorage(id, value) {
    try {
      window.localStorage.setItem(storageKey(id), value);
    } catch (error) {
      showToast("이 브라우저에서는 자동 저장을 사용할 수 없어요.");
    }
  }

  function removeLessonStorage() {
    try {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      showToast("저장된 내용을 지우기 어려워요. 입력칸은 먼저 비웠습니다.");
    }
  }

  function value(id, fallback = "아직 입력하지 않음") {
    const element = $(id);
    const text = element ? element.value.trim() : "";
    return text || fallback;
  }

  function rawValue(id) {
    const element = $(id);
    return element ? element.value.trim() : "";
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function quickCharacterName() {
    if (!quickState.attr || !quickState.target || !quickState.ending) return "";
    const middle = QUICK_TARGET_MAP[quickState.target] || quickState.target;
    return `${quickState.attr}${middle} ${quickState.ending}`;
  }

  function createQuickBuilderDialog() {
    if ($("quickBuilderModal")) return;

    const dialog = document.createElement("dialog");
    dialog.id = "quickBuilderModal";
    dialog.className = "quick-dialog";
    dialog.innerHTML = `
      <div class="quick-modal">
        <div class="quick-modal-head">
          <div>
            <h2>캐릭터 카드로 빠르게 만들기</h2>
            <p>카드를 골라 캐릭터 이름, 성격, 대표 스킬, 약점 또는 고민을 빠르게 정리합니다.</p>
          </div>
          <button class="icon-btn" type="button" id="closeQuickBuilder" aria-label="팝업 닫기">×</button>
        </div>
        <div class="quick-modal-body">
          <section class="quick-step">
            <h3>1. 캐릭터 이름 조합</h3>
            <p class="quick-result" id="quickNameResult">아직 이름이 완성되지 않았어</p>
            <div class="quick-choice-grid">
              <div class="quick-choice-group">
                <h4>앞말 카드</h4>
                <input class="quick-custom" type="text" data-quick-custom="attr" placeholder="직접 입력: 예: 번개" aria-label="앞말 직접 입력">
                <div class="quick-choice-list" data-quick-group="attr"></div>
              </div>
              <div class="quick-choice-group">
                <h4>대상 카드</h4>
                <input class="quick-custom" type="text" data-quick-custom="target" placeholder="직접 입력: 예: 토끼" aria-label="대상 직접 입력">
                <div class="quick-choice-list" data-quick-group="target"></div>
              </div>
              <div class="quick-choice-group">
                <h4>끝말 카드</h4>
                <input class="quick-custom" type="text" data-quick-custom="ending" placeholder="직접 입력: 예: 루루" aria-label="끝말 직접 입력">
                <div class="quick-choice-list" data-quick-group="ending"></div>
              </div>
            </div>
          </section>
          <section class="quick-step">
            <h3>2. 캐릭터 특징 카드</h3>
            <div class="quick-choice-grid">
              <div class="quick-choice-group">
                <h4>성격 카드</h4>
                <input class="quick-custom" type="text" data-quick-custom="personality" placeholder="직접 입력: 예: 차분하고 다정함" aria-label="성격 직접 입력">
                <div class="quick-choice-list" data-quick-group="personality"></div>
              </div>
              <div class="quick-choice-group">
                <h4>대표 스킬 카드</h4>
                <input class="quick-custom" type="text" data-quick-custom="ability" placeholder="직접 입력: 예: 별빛 보호막" aria-label="대표 스킬 직접 입력">
                <div class="quick-choice-list" data-quick-group="ability"></div>
              </div>
              <div class="quick-choice-group">
                <h4>약점 카드</h4>
                <input class="quick-custom" type="text" data-quick-custom="weakness" placeholder="직접 입력: 예: 어두운 곳을 무서워함" aria-label="약점 직접 입력">
                <div class="quick-choice-list" data-quick-group="weakness"></div>
              </div>
            </div>
          </section>
        </div>
        <div class="quick-modal-foot">
          <button class="btn btn-secondary" type="button" id="clearQuickBuilder">팝업 선택 초기화</button>
          <button class="btn btn-primary" type="button" id="applyQuickBuilder">활동 1에 넣기</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  }

  function renderQuickBuilder() {
    createQuickBuilderDialog();
    Object.entries(QUICK_OPTIONS).forEach(([group, values]) => {
      const container = document.querySelector(`[data-quick-group="${group}"]`);
      if (!container) return;
      container.innerHTML = values
        .map((option) => {
          const safeOption = escapeHtml(option);
          return `<button class="quick-choice" type="button" data-quick-select="${group}" data-quick-value="${safeOption}">${safeOption}</button>`;
        })
        .join("");
    });
    syncQuickBuilder();
  }

  function syncQuickBuilder() {
    document.querySelectorAll("[data-quick-select]").forEach((button) => {
      const group = button.dataset.quickSelect;
      button.classList.toggle("selected", quickState[group] === button.dataset.quickValue);
    });
    document.querySelectorAll("[data-quick-custom]").forEach((input) => {
      const group = input.dataset.quickCustom;
      if (input !== document.activeElement) {
        input.value = quickState[group] || "";
      }
    });
    const result = $("quickNameResult");
    if (result) {
      result.textContent = quickCharacterName() || "아직 이름이 완성되지 않았어";
    }
  }

  function resetQuickBuilder() {
    quickState = {
      attr: "",
      target: "",
      ending: "",
      ability: "",
      weakness: "",
      personality: ""
    };
    syncQuickBuilder();
  }

  function openQuickBuilder() {
    createQuickBuilderDialog();
    syncQuickBuilder();
    const modal = $("quickBuilderModal");
    if (modal?.showModal) {
      modal.showModal();
    } else {
      modal?.setAttribute("open", "");
    }
  }

  function closeQuickBuilder() {
    const modal = $("quickBuilderModal");
    if (modal?.close) {
      modal.close();
    } else {
      modal?.removeAttribute("open");
    }
  }

  function setStoredValue(id, nextValue) {
    const element = $(id);
    if (!element || !nextValue) return;
    element.value = nextValue;
    saveField(element);
  }

  function applyQuickBuilder() {
    const nextName = quickCharacterName();
    const hasAnyValue = Boolean(nextName || quickState.personality || quickState.ability || quickState.weakness);
    if (!hasAnyValue) {
      showToast("먼저 카드나 직접 입력으로 정해 봐.");
      return;
    }

    setStoredValue("characterName", nextName);
    setStoredValue("characterPersonality", quickState.personality);
    setStoredValue("mainSkill", quickState.ability);
    setStoredValue("weakness", quickState.weakness);
    refreshGeneratedPrompts();

    if (selectedStudent) {
      saveProfileNow(true);
    } else {
      updateProfileStatus("이름을 선택하면 카드로 만든 캐릭터 정보가 학생별로 저장됩니다.", "warning");
    }

    closeQuickBuilder();
    showToast("활동 1에 넣었어요.");
  }

  function setupQuickBuilder() {
    if (!$("openQuickBuilder")) return;
    renderQuickBuilder();
    $("openQuickBuilder")?.addEventListener("click", openQuickBuilder);
    $("closeQuickBuilder")?.addEventListener("click", closeQuickBuilder);
    $("clearQuickBuilder")?.addEventListener("click", resetQuickBuilder);
    $("applyQuickBuilder")?.addEventListener("click", applyQuickBuilder);
    $("quickBuilderModal")?.addEventListener("click", (event) => {
      if (event.target.id === "quickBuilderModal") closeQuickBuilder();
    });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-quick-select]");
      if (!button) return;
      quickState[button.dataset.quickSelect] = button.dataset.quickValue;
      syncQuickBuilder();
    });
    document.addEventListener("input", (event) => {
      const input = event.target.closest("[data-quick-custom]");
      if (!input) return;
      quickState[input.dataset.quickCustom] = input.value.trim();
      syncQuickBuilder();
    });
  }

  function profileApiReady() {
    return STUDENT_PROFILE_API_URL.trim().startsWith("https://");
  }

  function studentIdFromName(name) {
    const match = String(name).match(/^(\d+)/);
    return match ? String(Number(match[1])) : String(name).replace(/\s+/g, "-");
  }

  function profileStorageId(student = selectedStudent) {
    if (!student) return "";
    return `profile.${student.classId}.${student.studentId}`;
  }

  function updateProfileStatus(message, tone = "info") {
    const status = $("sheetSyncStatus");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function updateSelectedStudentStatus() {
    const status = $("selectedStudentStatus");
    if (!status) return;
    if (!selectedStudent) {
      status.textContent = "내 이름을 먼저 선택하세요.";
      status.dataset.tone = "info";
      return;
    }
    status.textContent = `${selectedStudent.label}을/를 선택했습니다. 활동 1에 입력하면 자동 저장됩니다.`;
    status.dataset.tone = "success";
  }

  function currentProfileValues() {
    return {
      characterName: rawValue("characterName"),
      characterPersonality: rawValue("characterPersonality"),
      mainSkill: rawValue("mainSkill")
    };
  }

  function saveProfileLocally() {
    if (!selectedStudent) return;
    writeStorage(profileStorageId(), JSON.stringify(currentProfileValues()));
  }

  function readLocalProfile(student = selectedStudent) {
    if (!student) return null;
    const saved = readStorage(profileStorageId(student));
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (error) {
      return null;
    }
  }

  function applyProfileValues(profile) {
    const values = {
      characterName: profile?.characterName || "",
      characterPersonality: profile?.characterPersonality || profile?.personality || "",
      mainSkill: profile?.mainSkill || ""
    };

    PROFILE_FIELD_IDS.forEach((id) => {
      const element = $(id);
      if (!element) return;
      element.value = values[id] || "";
      saveField(element);
    });
    refreshGeneratedPrompts();
  }

  function jsonpRequest(params) {
    return new Promise((resolve, reject) => {
      if (!profileApiReady()) {
        reject(new Error("Profile API URL is not configured."));
        return;
      }

      const callbackName = `lesson04ProfileCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const query = new URLSearchParams({ ...params, callback: callbackName });
      const script = document.createElement("script");
      let settled = false;

      function cleanup() {
        delete window[callbackName];
        script.remove();
      }

      window[callbackName] = (data) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Profile API request failed."));
      };

      window.setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Profile API request timed out."));
      }, 9000);

      script.src = `${STUDENT_PROFILE_API_URL}?${query.toString()}`;
      document.body.appendChild(script);
    });
  }

  async function loadSelectedProfile() {
    if (!selectedStudent) return;

    const localProfile = readLocalProfile();
    if (localProfile) {
      applyProfileValues(localProfile);
      updateProfileStatus("이 기기에 저장된 캐릭터 정보를 먼저 불러왔어요.", "info");
    } else {
      applyProfileValues({});
    }

    if (!profileApiReady()) {
      updateProfileStatus("스프레드시트 웹앱 주소가 아직 연결되지 않아 이 기기에만 임시 저장됩니다.", "warning");
      return;
    }

    updateProfileStatus("스프레드시트에서 지난 캐릭터 정보를 불러오는 중입니다.", "info");
    try {
      const result = await jsonpRequest({
        action: "loadProfile",
        classId: selectedStudent.classId,
        studentId: selectedStudent.studentId
      });
      if (result?.ok && result.profile) {
        applyProfileValues(result.profile);
        saveProfileLocally();
        updateProfileStatus("스프레드시트에서 지난 캐릭터 정보를 불러왔어요.", "success");
      } else {
        updateProfileStatus("아직 저장된 캐릭터 정보가 없어요. 입력하면 자동 저장됩니다.", "info");
      }
    } catch (error) {
      updateProfileStatus("스프레드시트 연결을 확인해 주세요. 지금은 이 기기에 임시 저장합니다.", "warning");
    }
  }

  async function saveProfileNow(silent = false) {
    if (!selectedStudent) {
      updateProfileStatus("먼저 내 이름을 선택하세요.", "warning");
      if (!silent) showToast("먼저 내 이름을 선택하세요.");
      return;
    }

    saveProfileLocally();
    if (!profileApiReady()) {
      updateProfileStatus("스프레드시트 웹앱 주소가 아직 연결되지 않아 이 기기에만 임시 저장했습니다.", "warning");
      if (!silent) showToast("이 기기에 임시 저장했어요.");
      return;
    }

    updateProfileStatus("스프레드시트에 저장하는 중입니다.", "info");
    const profile = currentProfileValues();
    try {
      const result = await jsonpRequest({
        action: "saveProfile",
        classId: selectedStudent.classId,
        studentId: selectedStudent.studentId,
        studentName: selectedStudent.label,
        characterName: profile.characterName,
        personality: profile.characterPersonality,
        mainSkill: profile.mainSkill,
        sourceLesson: "lesson04"
      });
      if (result?.ok) {
        updateProfileStatus("스프레드시트에 저장했어요.", "success");
        if (!silent) showToast("스프레드시트에 저장했어요.");
      } else {
        throw new Error(result?.message || "Save failed.");
      }
    } catch (error) {
      updateProfileStatus("스프레드시트 저장에 실패했어요. 이 기기에는 임시 저장했습니다.", "warning");
      if (!silent) showToast("이 기기에 임시 저장했어요.");
    }
  }

  function scheduleProfileSave() {
    saveProfileLocally();
    window.clearTimeout(profileSaveTimer);
    profileSaveTimer = window.setTimeout(() => {
      saveProfileNow(true);
    }, 900);
  }

  function saveField(element) {
    if (!element || !element.id) return;
    writeStorage(element.id, element.value);
  }

  function loadSavedFields() {
    STORE_IDS.forEach((id) => {
      const element = $(id);
      const savedValue = readStorage(id);
      if (element && savedValue !== null) {
        element.value = savedValue;
      }
    });
  }

  function setMode(mode) {
    const normalizedMode = mode === "40" ? "40" : "80";
    document.body.dataset.lessonMode = normalizedMode;

    updateModeControl($("mode80"), normalizedMode === "80");
    updateModeControl($("mode40"), normalizedMode === "40");

    document.querySelectorAll(".eighty-only").forEach((element) => {
      element.hidden = normalizedMode !== "80";
    });
    document.querySelectorAll(".forty-only").forEach((element) => {
      element.hidden = normalizedMode !== "40";
    });

    const status = $("modeStatus");
    if (status) {
      status.textContent =
        normalizedMode === "80"
          ? "현재 80분 수업 모드가 선택되었습니다. 전체 활동이 보입니다."
          : "현재 40분 수업 모드가 선택되었습니다. 핵심 활동만 보입니다.";
    }

    writeStorage("lessonMode", normalizedMode);
  }

  function updateModeControl(element, isActive) {
    if (!element) return;
    element.classList.toggle("active", isActive);

    if (element.tagName.toLowerCase() === "button") {
      element.setAttribute("aria-pressed", isActive ? "true" : "false");
      return;
    }

    if (isActive) {
      element.setAttribute("aria-current", "page");
    } else {
      element.removeAttribute("aria-current");
    }
  }

  function openUrl(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function currentClassId() {
    const section = $("student-slides");
    return section?.dataset.slideClassPage === "class2" ? "class2" : "class1";
  }

  function currentPadletUrl() {
    return PADLET_URLS[currentClassId()] || PADLET_URLS.class1;
  }

  function setupExternalLinks() {
    const urls = {
      gemini: GEMINI_URL,
      suno: SUNO_URL,
      padlet: currentPadletUrl()
    };

    document.querySelectorAll("[data-open]").forEach((link) => {
      const url = urls[link.dataset.open];
      if (!url) return;
      link.setAttribute("href", url);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openUrl(url);
      });
    });
  }

  function renderStudentSlides(selectedClass) {
    const grid = $("studentSlideGrid");
    const empty = $("studentSlideEmpty");
    if (!grid) return;

    const normalizedClass = selectedClass === "class2" ? "class2" : "class1";
    const students = STUDENT_SLIDE_LINKS[normalizedClass] || [];
    grid.innerHTML = students
      .map((student) => {
        const studentId = studentIdFromName(student.name);
        const isSelected =
          selectedStudent?.classId === normalizedClass && selectedStudent?.studentId === studentId;
        const name = escapeHtml(student.name);
        return `
          <article class="student-slide-card${isSelected ? " selected" : ""}" data-student-card="${normalizedClass}-${studentId}">
            <strong>${name}</strong>
            <button class="student-slide-link" type="button" data-select-student data-class-id="${normalizedClass}" data-student-id="${studentId}" data-student-name="${name}" aria-pressed="${isSelected ? "true" : "false"}">
              내 이름 선택
            </button>
          </article>
        `;
      })
      .join("");

    if (empty) {
      empty.hidden = students.length > 0;
    }

    document.querySelectorAll("[data-slide-class]").forEach((button) => {
      const isActive = button.dataset.slideClass === normalizedClass;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setupStudentSlides() {
    const grid = $("studentSlideGrid");
    if (!grid) return;

    const section = $("student-slides");
    const pageClass = section?.dataset.slideClassPage || "class1";
    const savedStudentId = readStorage(`selectedStudent.${pageClass}`);
    if (savedStudentId) {
      const student = (STUDENT_SLIDE_LINKS[pageClass] || []).find(
        (item) => studentIdFromName(item.name) === savedStudentId
      );
      if (student) {
        selectedStudent = {
          classId: pageClass,
          studentId: savedStudentId,
          label: student.name
        };
        updateSelectedStudentStatus();
      }
    }
    renderStudentSlides(pageClass);
    if (selectedStudent) {
      loadSelectedProfile();
    } else {
      updateProfileStatus("이름을 선택하면 캐릭터 이름, 성격, 대표 스킬이 자동 저장됩니다.", "info");
    }

    document.querySelectorAll("[data-slide-class]").forEach((button) => {
      button.addEventListener("click", () => {
        renderStudentSlides(button.dataset.slideClass);
      });
    });

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-student]");
      if (!button) return;
      selectedStudent = {
        classId: button.dataset.classId,
        studentId: button.dataset.studentId,
        label: button.dataset.studentName
      };
      writeStorage(`selectedStudent.${selectedStudent.classId}`, selectedStudent.studentId);
      updateSelectedStudentStatus();
      renderStudentSlides(selectedStudent.classId);
      loadSelectedProfile();
      showToast(`${selectedStudent.label} 선택 완료`);
    });
  }

  function setTextarea(id, text, shouldFocus = true) {
    const element = $(id);
    if (!element) return;
    element.value = text;
    if (shouldFocus) {
      element.focus({ preventScroll: true });
    }
  }

  function buildLyricsPrompt() {
    return [
      "나는 초등학생이고, 게임 캐릭터 테마곡 가사를 만들고 있어.",
      "",
      "내 캐릭터 정보는 다음과 같아.",
      "",
      `캐릭터 이름: ${value("characterName")}`,
      `캐릭터 성격: ${value("characterPersonality")}`,
      `대표 스킬: ${value("mainSkill")}`,
      `약점 또는 고민: ${value("weakness")}`,
      `음악 키워드 3개: ${value("keyword1")}, ${value("keyword2")}, ${value("keyword3")}`,
      `원하는 음악 장르: ${value("genre")}`,
      "",
      "이 내용을 바탕으로 짧은 테마곡 가사를 만들어 줘.",
      "",
      "조건:",
      "1. 초등학생이 이해하기 쉬운 말로 써 줘.",
      "2. 4줄 가사로 만들어 줘.",
      "3. 한 줄은 너무 길지 않게 써 줘.",
      "4. 캐릭터의 성격과 스킬이 느껴지게 해 줘.",
      "5. 기존 노래 가사나 유명 가수를 따라 하지 말아 줘.",
      "6. 버전 2개를 만들어 줘."
    ].join("\n");
  }

  function updateLyricsPrompt() {
    setTextarea("lyricsPrompt", buildLyricsPrompt(), false);
  }

  function buildSunoRequest() {
    return [
      "아래 정보를 바탕으로 수노에 입력할 음악 생성 프롬프트를 만들어 줘.",
      "",
      `음악 키워드 3개: ${value("keyword1")}, ${value("keyword2")}, ${value("keyword3")}`,
      `원하는 음악 장르: ${value("genre")}`,
      `캐릭터 설명: ${value("characterName")}은/는 ${value("characterPersonality")} 성격을 가진 캐릭터이고, 대표 스킬은 ${value("mainSkill")}이야.`,
      `약점 또는 고민: ${value("weakness")}`,
      "",
      "최종 가사:",
      `1줄: ${value("lyricLine1")}`,
      `2줄: ${value("lyricLine2")}`,
      `3줄: ${value("lyricLine3")}`,
      `4줄: ${value("lyricLine4")}`,
      "",
      "조건:",
      "1. 수노에 바로 붙여넣을 수 있는 문장으로 만들어 줘.",
      "2. 음악 분위기, 장르, 속도, 캐릭터의 느낌이 잘 드러나게 해 줘.",
      "3. 초등학생 게임 캐릭터 테마곡에 어울리게 해 줘.",
      "4. 기존 노래 제목, 유명 가수 이름, 특정 가수의 스타일은 넣지 말아 줘.",
      "5. 가사는 그대로 포함해 줘.",
      "6. 너무 길지 않게 정리해 줘."
    ].join("\n");
  }

  function updateSunoRequest() {
    setTextarea("sunoPromptRequest", buildSunoRequest(), false);
  }

  function refreshGeneratedPrompts() {
    updateLyricsPrompt();
    updateSunoRequest();
  }

  function makePadletPost() {
    const post = [
      `캐릭터 이름: ${value("characterName", "")}`,
      "",
      "음악 키워드:",
      `${value("keyword1", "")}, ${value("keyword2", "")}, ${value("keyword3", "")}`,
      "",
      "음악 장르:",
      value("genre", ""),
      "",
      "가사:",
      value("lyricLine1", ""),
      value("lyricLine2", ""),
      value("lyricLine3", ""),
      value("lyricLine4", ""),
      "",
      "수노 프롬프트:",
      value("finalSunoPrompt", ""),
      "",
      "음악 링크:",
      value("sunoLink", "학생이 직접 붙여넣기"),
      "",
      "AI 음악 사용 약속:",
      value("aiPromise", "")
    ].join("\n");

    setTextarea("padletPost", post);
    showToast("패들렛 보관용 글을 만들었어요.");
  }

  function makeEthicsPost() {
    const post = [
      "AI 음악 사용 판단",
      "",
      "1. 수업 발표에서 틀어도 될까요?",
      value("ethics1", ""),
      "",
      "2. 친구 음악을 내 영상에 써도 될까요?",
      value("ethics2", ""),
      "",
      "3. 무료 계정 음악을 수익 영상에 사용해도 될까요?",
      value("ethics3", ""),
      "",
      "4. 내가 직접 만든 부분은 무엇일까요?",
      value("ethics4", "")
    ].join("\n");

    setTextarea("ethicsPost", post);
    showToast("AI 음악 사용 판단 글을 만들었어요.");
  }

  async function copyFromTextarea(id, prepare) {
    const element = $(id);
    if (!element) return;
    if (!element.value.trim() && typeof prepare === "function") {
      prepare();
    }

    const text = element.value.trim();
    if (!text) {
      showToast("복사할 내용이 아직 없어요.");
      return;
    }

    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error("Clipboard API is not available.");
      }
      await navigator.clipboard.writeText(text);
      showToast("복사했어요. 새 창에 붙여넣어 주세요.");
    } catch (error) {
      element.focus();
      element.select();
      element.setSelectionRange(0, element.value.length);
      showToast("선택된 내용을 Ctrl+C로 직접 복사해 주세요.");
    }
  }

  function syncGenreChips() {
    const selectedGenre = rawValue("genre");
    document.querySelectorAll(".genre-chip").forEach((chip) => {
      const isSelected = chip.dataset.genre === selectedGenre;
      chip.classList.toggle("is-selected", isSelected);
      chip.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  }

  function setupKeywordButtons() {
    const keywordInputs = ["keyword1", "keyword2", "keyword3"].map((id) => $(id));
    document.querySelectorAll(".keyword-chip").forEach((button) => {
      button.addEventListener("click", () => {
        const target =
          keywordInputs.find((input) => input && !input.value.trim()) || keywordInputs[0];
        if (!target) return;
        target.value = button.dataset.keyword || "";
        saveField(target);
        refreshGeneratedPrompts();
        target.focus();
        showToast("키워드를 넣었어요.");
      });
    });
  }

  function setupGenreButtons() {
    document.querySelectorAll(".genre-chip").forEach((button) => {
      button.addEventListener("click", () => {
        const genreInput = $("genre");
        if (!genreInput) return;
        genreInput.value = button.dataset.genre || "";
        saveField(genreInput);
        syncGenreChips();
        refreshGeneratedPrompts();
        showToast("음악 장르를 골랐어요.");
      });
    });

    $("genre")?.addEventListener("input", () => {
      syncGenreChips();
      refreshGeneratedPrompts();
    });
  }

  function setupStoredInputs() {
    document.querySelectorAll("[data-store]").forEach((element) => {
      element.addEventListener("input", () => {
        saveField(element);
        refreshGeneratedPrompts();
        if (PROFILE_FIELD_IDS.includes(element.id)) {
          if (!selectedStudent) {
            updateProfileStatus("먼저 내 이름을 선택해야 학생별로 저장할 수 있어요.", "warning");
            return;
          }
          scheduleProfileSave();
        }
      });
    });
  }

  function setupModeButtons() {
    const mode80 = $("mode80");
    const mode40 = $("mode40");
    if (mode80?.tagName.toLowerCase() !== "button" || mode40?.tagName.toLowerCase() !== "button") {
      return;
    }

    mode80.addEventListener("click", () => {
      setMode("80");
      showToast("80분 수업 모드로 바꾸었어요.");
    });
    mode40.addEventListener("click", () => {
      setMode("40");
      showToast("40분 수업 모드로 바꾸었어요.");
    });
  }

  function setupActionButtons() {
    $("makePadletPost")?.addEventListener("click", makePadletPost);
    $("makeEthicsPost")?.addEventListener("click", makeEthicsPost);

    $("copyLyricsPrompt")?.addEventListener("click", () => copyFromTextarea("lyricsPrompt", updateLyricsPrompt));
    $("copySunoRequest")?.addEventListener("click", () => copyFromTextarea("sunoPromptRequest", updateSunoRequest));
    $("copyFinalPrompt")?.addEventListener("click", () => copyFromTextarea("finalSunoPrompt"));
    $("copyFinalPromptAgain")?.addEventListener("click", () => copyFromTextarea("finalSunoPrompt"));
    $("copyPadletPost")?.addEventListener("click", () => copyFromTextarea("padletPost", makePadletPost));
    $("copyEthicsPost")?.addEventListener("click", () => copyFromTextarea("ethicsPost", makeEthicsPost));
    $("saveProfileNow")?.addEventListener("click", () => saveProfileNow(false));
  }

  function init() {
    loadSavedFields();
    setupStoredInputs();
    setupModeButtons();
    setupExternalLinks();
    setupStudentSlides();
    setupQuickBuilder();
    setupKeywordButtons();
    setupGenreButtons();
    setupActionButtons();
    syncGenreChips();
    refreshGeneratedPrompts();

    const savedMode = document.body.dataset.pageMode || readStorage("lessonMode") || "80";
    setMode(savedMode);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
