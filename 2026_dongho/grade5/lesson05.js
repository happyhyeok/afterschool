// TODO(배포): lesson05_apps_script.gs의 saveLesson5 분기와 함수를 기존 Apps Script에
// 추가한 뒤 웹 앱을 새 버전으로 배포해야 저장 기능이 동작합니다.
const LESSON5_API_URL = "https://script.google.com/macros/s/AKfycbyICrDSlTbpBpzuv3U2n0RBTbvM4NUVgUJMQENJdep656lzO8YWR4AK4OlKsUddXNOZIw/exec";

(() => {
  const STUDENTS = {
    class1: ["01. 곽예준","02. 김민주","03. 김우람","04. 김태양","05. 김태현","06. 김효민","07. 박민준","08. 박하율","09. 서자건","10. 이정우","11. 조예빈","12. 지현서","13. 차소민","14. 채종후"],
    class2: ["01. 권하린","02. 김리아","03. 김문준","04. 김아랑","05. 김예슬","06. 김우현","07. 김효건","08. 문서진","09. 변수현","10. 신예건","11. 심현지","12. 양승윤","13. 연율","14. 이정우","15. 최푸른"]
  };

  // Google Drive characters/class1, class2 폴더의 공개 PNG 파일 ID입니다.
  // class1 09.png는 현재 Drive에 없어 추가 후 이 표에 파일 ID를 넣어야 합니다.
  const DRIVE_CHARACTER_IMAGE_IDS = {
    class1: {
      "1": "1NQQ9CrxgJi2hVGYcde4BY0dTy2iHZ_Ag",
      "2": "1E40D391El9Q0Y5OOA5FTiIIGHH-d97AF",
      "3": "11xwOBcxCMYyG6jstaYGlRBnbSGDbUnux",
      "4": "18PROsENVGLSF190FAUaDsOTkS61_q7WN",
      "5": "1dyCmvfLzfc2SGOCzKMQThQTsrcl_pSX_",
      "6": "1yq5iKRnKgk94U9Z_KRz_JlItPV9SRdPB",
      "7": "1q4DiLRzYPnQ8s-zMryFd8NKJSV-Ya3Xq",
      "8": "1b5hVAS9WFsZIik27cRieTr6shz-6K17S",
      "10": "126uIgmCUvJ9qYjz5vU6Fz8Lo5Hwge5uR",
      "11": "1174eVh7EwSduoKFQc1uw3P_q43b6mZZi",
      "12": "1Ik1YaIUA7Ubtd_3iMw8MpYwJqyif2Qyc",
      "13": "11onouQtAHJPZpUx0I7UNJqYxvkxPJKb2",
      "14": "1FLx21--662pOb_JYiw9tF1SE9iZ8HDp6"
    },
    class2: {
      "1": "14_mte7NXGUK1c4MyvsVSfvdeYvXbjfLf",
      "2": "1MHnyBTa67JwHT8egSCATQ3uSkfVH_sVy",
      "3": "1o2zm0d03JuIIL3u3UJY8NZl1Bge7bh6U",
      "4": "1_kMcA9ex8ttAHXQqvodKjZPQWxZu1OWf",
      "5": "1ijm0ygaYitTGqu6eGKUMvXiJt9bIVOMT",
      "6": "1EQItSkq2pA-U3ads1NgDYYI4fOJF2Uac",
      "7": "1IIhenJUwBpZrn3oWJVYweFg7rTCUnbgk",
      "8": "1S8sFFITu5vy7yXblQMiqHMs3Do_SUJD5",
      "9": "14Bxc-9VZxfjmMK-x8R5wYBUfgfDKbKEJ",
      "10": "1lFEM8Z7S3eidDPb7cny94Itd7KGQL2u2",
      "11": "1AxT4zrBbBWFGJ-_UCy7MKdPYwE5g_cvU",
      "12": "1B28kZQEFX22pyNfhBT575KNU47uJzsAM",
      "13": "1KMzqHg2pKjHsatK0qZmvb_lWOtL2pg0C",
      "14": "1Opu8AXp6HCAynOeHMUZ9mAOV3UULhggC",
      "15": "1TpnWgu261Ec96a2Zg-AkD8x6mXtTGoqm"
    }
  };

  const MISSION_CONFIG = {
    mission1: {
      answer: "B",
      code: "S",
      sentence: "너무 큰 보상을 약속하며 링크를 누르게 하면 먼저 의심해요.",
      hint: "가장 수상한 내용을 고르세요.",
      correct: "정답! 지나치게 큰 보상으로 링크를 누르게 하는 정보는 의심해야 합니다.",
      incorrect: "다시 생각해 보세요. 너무 큰 보상을 약속하며 링크를 누르게 하나요?"
    },
    mission2: {
      answer: "C",
      code: "A",
      sentence: "낯선 링크는 바로 누르지 않고 공식 주소인지 확인해요.",
      hint: "주소의 앞부분을 자세히 비교하세요.",
      correct: "정답! dongho-free-gem.example은 공식 도메인 play.dongho-game.example과 다르고, free-gem과 click-now처럼 보상을 재촉하는 말도 들어 있어 수상합니다.",
      incorrect: "다시 확인해 보세요. 주소창의 핵심 도메인이 play.dongho-game.example과 완전히 같은가요?"
    },
    mission3: {
      answer: "B",
      code: "F",
      sentence: "AI 이미지와 영상은 허락과 출처를 확인하고, AI로 만든 결과임을 밝혀요.",
      hint: "사람의 권리와 사실 확인을 함께 생각하세요.",
      correct: "정답! 필요한 허락을 받고 AI로 만든 결과임을 알리는 것이 바른 사용입니다.",
      incorrect: "다시 생각해 보세요. 다른 사람의 얼굴과 작품을 존중하고 있나요?"
    },
    mission4: {
      answer: "D",
      code: "E",
      sentence: "게임 채팅에서는 서로 존중하고, 개인정보를 지키며, 위험한 말은 어른에게 알려요.",
      hint: "온라인에서도 존중과 개인정보 보호가 중요합니다.",
      correct: "정답! 존중하는 말로 대화하고, 위험한 채팅은 믿을 만한 어른에게 알려야 합니다.",
      incorrect: "다시 생각해 보세요. 서로 존중하고 개인정보를 지키는 행동인가요?"
    }
  };

  const missionIds = Object.keys(MISSION_CONFIG);
  const CRITERIA_IDS = ["source", "reward", "urgency", "link", "setting"];
  const root = document.body;
  const classId = root.dataset.classId === "class2" ? "class2" : "class1";
  const className = classId === "class2" ? "5학년 2반" : "5학년 1반";
  const mode = root.dataset.mode === "40" ? "40" : "80";
  const $ = (id) => document.getElementById(id);
  const studentSelect = $("studentName");

  let profile = null;
  let missionState = Object.fromEntries(missionIds.map((id) => [id, false]));
  let criteriaState = Object.fromEntries(CRITERIA_IDS.map((id) => [id, false]));
  let criteriaComplete = false;
  let toastTimer = 0;

  function studentId(name) {
    const match = String(name).match(/^(\d+)/);
    return match ? String(Number(match[1])) : "";
  }

  function driveCharacterImageUrl() {
    const fileId = DRIVE_CHARACTER_IMAGE_IDS[classId]?.[studentId(studentSelect.value)];
    return fileId ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}` : "";
  }

  function showToast(text) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setStatus(id, text, tone = "info") {
    const element = $(id);
    if (!element) return;
    element.textContent = text;
    element.dataset.tone = tone;
  }

  function value(id) {
    return ($(id)?.value || "").trim();
  }

  function selectedMissionAnswer(missionId) {
    return document.querySelector(`input[name="${missionId}"]:checked`)?.value || "";
  }

  function allMissionsComplete() {
    return missionIds.every((id) => missionState[id]);
  }

  function criteriaAvailable() {
    return Boolean(profile?.characterName && missionState.mission1 && missionState.mission2);
  }

  function jsonp(params) {
    return new Promise((resolve, reject) => {
      const callback = `lesson5Callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
      }, 10000);

      script.src = `${LESSON5_API_URL}?${query.toString()}`;
      document.body.appendChild(script);
    });
  }

  function normalizedProfile(raw = {}) {
    return {
      characterName: raw.characterName || "",
      characterPower: raw.characterPower || raw.mainSkill || raw.power || "",
      characterWeakness: raw.characterWeakness || raw.weakness || "",
      characterPersonality: raw.characterPersonality || raw.personality || "",
      characterColor: raw.characterColor || raw.color || "",
      imageUrl: raw.imageUrl || raw.characterImage || driveCharacterImageUrl()
    };
  }

  function showProfile(raw) {
    profile = normalizedProfile(raw);
    $("characterCard").hidden = false;

    const mapping = {
      cardCharacterName: profile.characterName,
      cardPower: profile.characterPower,
      cardWeakness: profile.characterWeakness,
      cardPersonality: profile.characterPersonality,
      cardColor: profile.characterColor
    };
    Object.entries(mapping).forEach(([id, text]) => {
      $(id).textContent = text || "이전 차시에 저장된 내용 없음";
    });
    document.querySelectorAll("[data-character-name]").forEach((element) => {
      element.textContent = profile.characterName || "이름 미등록";
    });

    const visual = $("characterVisual");
    visual.replaceChildren();
    if (profile.imageUrl) {
      const image = new Image();
      image.alt = `${profile.characterName || "내 캐릭터"} 이미지`;
      image.onload = () => visual.replaceChildren(image);
      image.onerror = () => {
        visual.textContent = "이미지를 불러오지 못했습니다. 이전 차시 저장 내용을 확인해 주세요.";
      };
      image.src = profile.imageUrl;
    } else {
      visual.textContent = "이미지를 불러오지 못했습니다. 이전 차시 저장 내용을 확인해 주세요.";
    }
  }

  function guideIds() {
    return mode === "80"
      ? ["linkGuide", "rewardGuide", "aiMediaGuide", "chatGuide", "characterMessage"]
      : ["linkGuide", "rewardGuide", "aiMediaGuide", "chatGuide"];
  }

  function updateMissionUi() {
    const completedCount = missionIds.filter((id) => missionState[id]).length;
    const missionsAvailable = Boolean(profile?.characterName);
    const readingAvailable = criteriaAvailable();
    const openedCriteriaCount = CRITERIA_IDS.filter((id) => criteriaState[id]).length;
    const allCriteriaOpened = openedCriteriaCount === CRITERIA_IDS.length;
    const safeComplete = missionsAvailable && criteriaComplete && allMissionsComplete();

    $("missionProgressText").textContent = `${completedCount} / 4 미션 완료`;
    $("missionProgressBar").style.width = `${completedCount * 25}%`;
    $("missionZone").classList.toggle("locked", !missionsAvailable);
    $("missionLockMessage").hidden = missionsAvailable;

    $("criteriaGate").classList.toggle("locked", !readingAvailable);
    $("criteriaGate").classList.toggle("completed", criteriaComplete);
    $("criteriaLockMessage").hidden = readingAvailable;
    $("criteriaProgress").textContent = criteriaComplete
      ? "읽기 완료"
      : `${openedCriteriaCount} / ${CRITERIA_IDS.length} 확인`;
    CRITERIA_IDS.forEach((id) => {
      const opened = criteriaState[id];
      const card = document.querySelector(`[data-criteria="${id}"]`);
      card.disabled = !readingAvailable || criteriaComplete;
      card.classList.toggle("checked", opened);
      card.setAttribute("aria-expanded", String(opened));
      card.querySelector(".criteria-action").hidden = opened;
      card.querySelector(".criteria-question").hidden = !opened;
    });
    $("criteriaConfirm").hidden = !readingAvailable || !allCriteriaOpened;
    $("criteriaContentWord").disabled = !allCriteriaOpened || criteriaComplete;
    $("criteriaSourceWord").disabled = !allCriteriaOpened || criteriaComplete;
    if (criteriaComplete) {
      setStatus("criteriaStatus", "핵심 문장 완성! 미션 3과 4가 열렸습니다.", "success");
    } else if (!readingAvailable) {
      setStatus("criteriaStatus", "미션 1과 미션 2를 완료하면 기준 읽기가 열립니다.", "info");
    } else if (!allCriteriaOpened) {
      setStatus(
        "criteriaStatus",
        `카드를 ${CRITERIA_IDS.length - openedCriteriaCount}장 더 눌러 질문을 확인하세요.`,
        "info"
      );
    } else {
      setStatus("criteriaStatus", "이제 핵심 문장을 직접 입력하세요.", "warning");
    }

    missionIds.forEach((id) => {
      const config = MISSION_CONFIG[id];
      const completed = missionState[id];
      const missionAvailable = id === "mission1" || id === "mission2"
        ? missionsAvailable
        : missionsAvailable && criteriaComplete;
      const card = document.querySelector(`[data-mission-card="${id}"]`);
      card.classList.toggle("completed", completed);
      card.classList.toggle("locked", !missionAvailable && !completed);
      document.querySelectorAll(`input[name="${id}"]`).forEach((radio) => {
        radio.disabled = !missionAvailable || completed;
      });
      const checkButton = document.querySelector(`[data-check-mission="${id}"]`);
      checkButton.disabled = !missionAvailable || completed;
      document.querySelector(`[data-code-slot="${id}"]`).textContent = completed ? config.code : "?";
      document.querySelector(`[data-code-slot="${id}"]`).classList.toggle("revealed", completed);
      document.querySelector(`[data-inline-code="${id}"]`).textContent = completed ? config.code : "?";
      const sentenceReward = document.querySelector(`[data-sentence-reward="${id}"]`);
      sentenceReward.hidden = !completed;
      document.querySelector(`[data-sentence-reward-title="${id}"]`).textContent =
        `코드 ${config.code} + 보안 문장 ${missionIds.indexOf(id) + 1} 획득!`;
      document.querySelectorAll(`[data-security-sentence="${id}"]`).forEach((element) => {
        element.textContent = config.sentence;
      });
    });

    $("recoverySuccess").hidden = !safeComplete;
    $("collectedSentences").hidden = !safeComplete;
    $("guideSentenceBank").hidden = !safeComplete;
    $("securityGuide").classList.toggle("locked", !safeComplete);
    $("guideFieldset").disabled = !safeComplete;
    $("guideLockMessage").hidden = safeComplete;
    $("saveLesson").disabled = !safeComplete;

    if (safeComplete) {
      setStatus("saveStatus", "SAFE 완성! 보안 가이드를 모두 작성한 뒤 저장하세요.", "success");
    } else {
      setStatus("saveStatus", "먼저 복구 코드 SAFE를 완성하세요.", "info");
    }
  }

  function resetStudentWork() {
    profile = null;
    missionState = Object.fromEntries(missionIds.map((id) => [id, false]));
    criteriaState = Object.fromEntries(CRITERIA_IDS.map((id) => [id, false]));
    criteriaComplete = false;
    $("characterCard").hidden = true;
    ["criteriaContentWord", "criteriaSourceWord"].forEach((id) => {
      $(id).value = "";
      delete $(id).dataset.state;
    });

    guideIds().forEach((id) => {
      if ($(id)) $(id).value = "";
    });
    document.querySelectorAll('input[name^="mission"]').forEach((radio) => {
      radio.checked = false;
    });
    document.querySelectorAll("[data-character-name]").forEach((element) => {
      element.textContent = "먼저 불러오세요";
    });
    missionIds.forEach((id) => {
      setStatus(`${id}Feedback`, MISSION_CONFIG[id].hint, "info");
    });
    updateMissionUi();
  }

  async function loadCharacter() {
    const studentName = studentSelect.value;
    if (!studentName) {
      setStatus("loadStatus", "내 이름을 먼저 선택하세요.", "warning");
      studentSelect.focus();
      return;
    }

    const button = $("loadCharacter");
    button.disabled = true;
    setStatus("loadStatus", "스프레드시트에서 내 캐릭터를 찾는 중입니다.", "info");
    try {
      const result = await jsonp({
        action: "loadProfile",
        classId,
        studentId: studentId(studentName)
      });
      if (!result?.ok || !result.profile) throw new Error("empty");
      showProfile(result.profile);
      updateMissionUi();
      setStatus("loadStatus", "캐릭터를 불러왔습니다. 서버 복구 미션을 시작하세요.", "success");
      showToast("캐릭터 접속 완료!");
      $("missionZone").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (_) {
      resetStudentWork();
      setStatus("loadStatus", "캐릭터 정보를 불러오지 못했습니다. 이전 차시 저장 내용을 확인해 주세요.", "error");
    } finally {
      button.disabled = false;
    }
  }

  function checkMission(missionId) {
    if (!profile?.characterName) {
      setStatus(`${missionId}Feedback`, "먼저 내 캐릭터를 불러오세요.", "warning");
      $("studentName").focus();
      return;
    }
    if ((missionId === "mission3" || missionId === "mission4") && !criteriaComplete) {
      setStatus(`${missionId}Feedback`, "가짜 정보 판별 기준을 먼저 읽고 확인하세요.", "warning");
      $("criteriaGate").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const selected = selectedMissionAnswer(missionId);
    const config = MISSION_CONFIG[missionId];
    if (!selected) {
      setStatus(`${missionId}Feedback`, "답을 하나 고른 뒤 확인하세요.", "warning");
      return;
    }
    if (selected !== config.answer) {
      setStatus(`${missionId}Feedback`, config.incorrect, "error");
      return;
    }

    missionState[missionId] = true;
    setStatus(
      `${missionId}Feedback`,
      `${config.correct} 코드 글자 ${config.code}와 보안 문장을 획득했습니다!`,
      "success"
    );
    updateMissionUi();
    showToast(`코드 ${config.code} + 보안 문장 획득!`);

    if (allMissionsComplete()) {
      $("recoverySuccess").scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("복구 코드 SAFE 완성!");
    }
  }

  function openCriteriaCard(criteriaId) {
    if (!criteriaAvailable() || criteriaComplete) return;
    criteriaState[criteriaId] = true;
    updateMissionUi();
    showToast(`판별 기준 ${CRITERIA_IDS.indexOf(criteriaId) + 1} 확인!`);
  }

  function checkCriteriaWords() {
    const allCriteriaOpened = CRITERIA_IDS.every((id) => criteriaState[id]);
    if (!allCriteriaOpened || criteriaComplete) return;

    const contentInput = $("criteriaContentWord");
    const sourceInput = $("criteriaSourceWord");
    const contentWord = contentInput.value.trim();
    const sourceWord = sourceInput.value.trim();
    contentInput.dataset.state = contentWord === "내용" ? "correct" : "";
    sourceInput.dataset.state = sourceWord === "출처" ? "correct" : "";

    if (contentWord !== "내용" || sourceWord !== "출처") {
      const bothFilled = contentWord.length >= 2 && sourceWord.length >= 2;
      setStatus(
        "criteriaStatus",
        bothFilled ? "초성과 문장을 다시 살펴보고 빈칸을 고쳐 보세요." : "이제 핵심 문장을 직접 입력하세요.",
        bothFilled ? "error" : "warning"
      );
      return;
    }

    criteriaComplete = true;
    updateMissionUi();
    setStatus("criteriaStatus", "핵심 문장 완성! 미션 3과 4가 열렸습니다.", "success");
    showToast("핵심 문장 완성!");
    document.querySelector('[data-mission-card="mission3"]').scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function lessonPayload() {
    const current = profile || normalizedProfile();
    return {
      action: "saveLesson5",
      className,
      classId,
      studentId: studentId(studentSelect.value),
      studentName: studentSelect.value,
      characterName: current.characterName,
      characterPower: current.characterPower,
      characterWeakness: current.characterWeakness,
      characterPersonality: current.characterPersonality,
      characterColor: current.characterColor,
      imageUrl: current.imageUrl,
      lesson5_characterValue: "",
      lesson5_suspiciousCard: selectedMissionAnswer("mission1"),
      lesson5_suspiciousReason: "",
      lesson5_settingMismatch: "",
      lesson5_mission1Answer: selectedMissionAnswer("mission1"),
      lesson5_mission2Answer: selectedMissionAnswer("mission2"),
      lesson5_mission3Answer: selectedMissionAnswer("mission3"),
      lesson5_mission4Answer: selectedMissionAnswer("mission4"),
      lesson5_recoveryCode: criteriaComplete && allMissionsComplete() ? "SAFE" : "",
      lesson5_linkGuide: value("linkGuide"),
      lesson5_rewardGuide: value("rewardGuide"),
      lesson5_aiMediaGuide: value("aiMediaGuide"),
      lesson5_chatGuide: value("chatGuide"),
      lesson5_characterMessage: value("characterMessage"),
      lesson5_savedAt: new Date().toISOString()
    };
  }

  function validate() {
    if (!studentSelect.value) return studentSelect;
    if (!profile?.characterName) return $("loadCharacter");
    if (!criteriaComplete) return $("criteriaGate");
    if (!allMissionsComplete()) return $("missionZone");
    return guideIds().map($).find((element) => !element?.value.trim()) || null;
  }

  async function saveLesson() {
    const missing = validate();
    if (missing) {
      const message = allMissionsComplete()
        ? "저장에 실패했습니다. 입력하지 않은 보안 가이드가 있는지 확인해 주세요."
        : "미션 4개를 완료하고 복구 코드 SAFE를 먼저 완성하세요.";
      setStatus("saveStatus", message, "error");
      missing.focus?.();
      missing.scrollIntoView?.({ behavior: "smooth", block: "center" });
      return;
    }

    const button = $("saveLesson");
    button.disabled = true;
    button.textContent = "저장하는 중…";
    setStatus("saveStatus", "스프레드시트에 오늘 결과를 저장하는 중입니다.", "info");
    try {
      const result = await jsonp(lessonPayload());
      if (!result?.ok) throw new Error(result?.message || "save");
      setStatus("saveStatus", "저장되었습니다. 다음 시간에는 이 내용을 바탕으로 런칭 홍보 자료를 만들 수 있습니다.", "success");
      showToast("안전하게 저장되었습니다!");
    } catch (_) {
      setStatus("saveStatus", "저장에 실패했습니다. 선생님께 Apps Script 배포 상태를 확인해 달라고 말씀해 주세요.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "오늘 결과 저장하기";
    }
  }

  function init() {
    STUDENTS[classId].forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      studentSelect.appendChild(option);
    });

    $("loadCharacter").addEventListener("click", loadCharacter);
    $("saveLesson").addEventListener("click", saveLesson);
    document.querySelectorAll("[data-check-mission]").forEach((button) => {
      button.addEventListener("click", () => checkMission(button.dataset.checkMission));
    });
    document.querySelectorAll("[data-criteria]").forEach((button) => {
      button.addEventListener("click", () => openCriteriaCard(button.dataset.criteria));
    });
    ["criteriaContentWord", "criteriaSourceWord"].forEach((id) => {
      $(id).addEventListener("input", checkCriteriaWords);
    });
    studentSelect.addEventListener("change", () => {
      resetStudentWork();
      if (studentSelect.value) {
        setStatus("loadStatus", "이름을 선택했습니다. 이제 캐릭터를 불러오세요.", "info");
      } else {
        setStatus("loadStatus", "내 이름을 선택한 뒤 불러오기 버튼을 누르세요.", "info");
      }
    });

    resetStudentWork();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
