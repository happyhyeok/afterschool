(() => {
  "use strict";

  const defaultQuestions = [
    {
      question: "AI에게 좋은 캐릭터 세계관 스토리를 부탁하려면 어떤 정보가 꼭 필요할까요?",
      options: [
        "캐릭터 이름만 있으면 된다",
        "캐릭터 이름, 능력, 약점, 성격, 역할, 활약하는 상황이 필요하다",
        "친구 이름과 학교 이름이 필요하다",
        "아무 설명 없이 부탁해도 된다"
      ],
      answer: 1,
      correct: "좋아요. AI가 좋은 글을 만들려면 캐릭터 정보와 조건이 필요합니다.",
      incorrect: "조금 더 생각해 볼까요? AI에게는 구체적인 캐릭터 정보가 필요합니다."
    },
    {
      question: "AI가 만든 세계관 스토리에 내 캐릭터의 약점이 빠졌습니다. 어떻게 해야 할까요?",
      options: [
        "그냥 저장한다",
        "약점이 없어도 더 강해 보이니 그대로 둔다",
        "약점도 들어가게 다시 요청하거나 직접 고친다",
        "캐릭터 이름을 바꾼다"
      ],
      answer: 2,
      correct: "맞습니다. 능력과 약점이 함께 있어야 캐릭터의 역할과 이야기가 더 설득력 있습니다.",
      incorrect: "강한 캐릭터도 약점이 있어야 더 재미있고 균형 잡힌 이야기가 됩니다."
    },
    {
      question: "캐릭터 세계관 스토리에 넣으면 안 되는 정보는 무엇일까요?",
      options: [
        "캐릭터 능력",
        "캐릭터 성격",
        "실제 친구의 이름, 전화번호, 주소",
        "캐릭터 약점"
      ],
      answer: 2,
      correct: "맞습니다. 개인정보는 이야기 속에도 넣지 않습니다.",
      incorrect: "캐릭터 정보는 괜찮지만, 실제 사람의 개인정보는 넣으면 안 됩니다."
    },
    {
      question: "AI가 만든 글이 너무 길고 어렵습니다. 좋은 수정 요청은 무엇일까요?",
      options: [
        "다시 해 줘",
        "이상해",
        "초등학생이 읽기 쉽게 5문장으로 짧게 다시 써 주세요",
        "더 멋지게 해 줘"
      ],
      answer: 2,
      correct: "좋아요. 수정 요청은 바꿀 점을 정확히 말해야 합니다.",
      incorrect: "AI에게 다시 요청할 때는 무엇을 어떻게 바꿀지 구체적으로 말해야 합니다."
    },
    {
      question: "AI가 만든 캐릭터 세계관 스토리를 저장하기 전 확인할 내용으로 알맞은 것은 무엇일까요?",
      options: [
        "내 캐릭터 이름이 들어갔는지 확인한다",
        "능력과 약점이 잘 드러났는지 확인한다",
        "캐릭터의 역할과 활약하는 상황이 설명되었는지 확인한다",
        "모두 맞다"
      ],
      answer: 3,
      correct: "맞습니다. 저장 전에는 이름, 능력, 약점, 역할, 활약하는 상황을 꼭 확인합니다.",
      incorrect: "저장 전에는 캐릭터 이름, 능력, 약점, 역할, 활약하는 상황을 모두 확인해야 합니다."
    }
  ];

  const quizConfig = window.AI_QUIZ_CONFIG || {};
  const questions = Array.isArray(quizConfig.questions) && quizConfig.questions.length
    ? quizConfig.questions
    : defaultQuestions;
  const title = quizConfig.title || "AI가 글을 만드는 동안 생각 퀴즈";
  const intro = quizConfig.intro || "AI를 잘 활용하는 방법을 퀴즈로 확인해 봅시다.";
  const finishTitle = quizConfig.finishTitle || "퀴즈 완료!";
  const finishMessage = quizConfig.finishMessage || "좋아요! 이제 AI가 만든 캐릭터 세계관 스토리를 확인하고, 내 캐릭터에 맞는지 점검해 봅시다.";
  const completeLabel = quizConfig.completeLabel || "완료";
  const completeAriaLabel = quizConfig.completeAriaLabel || "완료하고 AI 결과 점검하러 가기";
  const scrollTarget = quizConfig.scrollTarget || "#aiResultReview";

  const trigger = document.querySelector(".ai-quiz-trigger");
  if (!trigger) return;

  let current = 0;
  let answered = false;
  let previousOverflow = "";

  const overlay = document.createElement("div");
  overlay.className = "ai-quiz-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="ai-quiz-modal" role="dialog" aria-modal="true" aria-labelledby="aiQuizTitle" aria-describedby="aiQuizIntro">
      <button type="button" class="ai-quiz-close" aria-label="AI 퀴즈 팝업 닫기">×</button>
      <h2 id="aiQuizTitle">${escapeHtml(title)}</h2>
      <p class="ai-quiz-intro" id="aiQuizIntro">${escapeHtml(intro)}</p>
      <div class="ai-quiz-content"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modal = overlay.querySelector(".ai-quiz-modal");
  const closeButton = overlay.querySelector(".ai-quiz-close");
  const content = overlay.querySelector(".ai-quiz-content");

  function renderQuestion() {
    const item = questions[current];
    answered = false;
    content.innerHTML = `
      <div class="ai-quiz-progress">${current + 1} / ${questions.length}</div>
      <h3 class="ai-quiz-question">${escapeHtml(item.question)}</h3>
      <div class="ai-quiz-options">
        ${item.options.map((option, index) => `
          <button type="button" class="ai-quiz-option" data-index="${index}">
            ${index + 1}. ${escapeHtml(option)}
          </button>
        `).join("")}
      </div>
      <div class="ai-quiz-feedback" aria-live="polite">선택지를 눌러 보세요.</div>
      <div class="ai-quiz-actions">
        <button type="button" class="ai-quiz-next" disabled>${current === questions.length - 1 ? "결과 보기" : "다음 문제"}</button>
      </div>
    `;
    content.querySelector(".ai-quiz-option").focus();
  }

  function renderFinish() {
    content.innerHTML = `
      <div class="ai-quiz-finish">
        <h3>${escapeHtml(finishTitle)}</h3>
        <p>${escapeHtml(finishMessage)}</p>
        <button type="button" class="ai-quiz-complete" aria-label="${escapeHtml(completeAriaLabel)}">${escapeHtml(completeLabel)}</button>
      </div>
    `;
    content.querySelector(".ai-quiz-complete").focus();
  }

  function openQuiz() {
    current = 0;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.hidden = false;
    renderQuestion();
  }

  function closeQuiz(shouldScroll = false) {
    overlay.hidden = true;
    document.body.style.overflow = previousOverflow;
    trigger.focus();
    if (shouldScroll) {
      document.querySelector(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  trigger.addEventListener("click", openQuiz);
  closeButton.addEventListener("click", () => closeQuiz());
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeQuiz();
  });

  content.addEventListener("click", event => {
    const option = event.target.closest(".ai-quiz-option");
    if (option) {
      const item = questions[current];
      const selected = Number(option.dataset.index);
      const isCorrect = selected === item.answer;
      answered = true;

      content.querySelectorAll(".ai-quiz-option").forEach(button => {
        button.classList.remove("is-selected", "is-correct");
      });
      option.classList.add("is-selected");
      if (isCorrect) option.classList.add("is-correct");

      const feedback = content.querySelector(".ai-quiz-feedback");
      feedback.textContent = isCorrect ? item.correct : item.incorrect;
      feedback.className = `ai-quiz-feedback ${isCorrect ? "is-correct" : "is-incorrect"}`;
      content.querySelector(".ai-quiz-next").disabled = false;
      return;
    }

    if (event.target.closest(".ai-quiz-next") && answered) {
      current += 1;
      current < questions.length ? renderQuestion() : renderFinish();
      return;
    }

    if (event.target.closest(".ai-quiz-complete")) closeQuiz(true);
  });

  document.addEventListener("keydown", event => {
    if (overlay.hidden) return;
    if (event.key === "Escape") {
      closeQuiz();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...modal.querySelectorAll("button:not([disabled])")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }
})();
