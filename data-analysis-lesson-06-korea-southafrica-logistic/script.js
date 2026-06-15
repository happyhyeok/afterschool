const buttons = document.querySelectorAll("[data-action]");
const officialAssets = document.querySelectorAll("[data-official-asset]");
const quizItems = document.querySelectorAll(".quiz-item");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    console.log(`[lesson06] ${action} button clicked`);
  });
});

officialAssets.forEach((image) => {
  const frame = image.closest(".official-frame");

  const showImage = () => {
    frame.classList.add("has-image");
    frame.classList.remove("asset-missing");
  };

  const showFallback = () => {
    frame.classList.add("asset-missing");
    frame.classList.remove("has-image");
    image.setAttribute("aria-hidden", "true");
  };

  if (image.complete) {
    if (image.naturalWidth > 0) {
      showImage();
    } else {
      showFallback();
    }
  }

  image.addEventListener("load", showImage);
  image.addEventListener("error", showFallback);
});

quizItems.forEach((item) => {
  const answer = item.dataset.answer;
  const options = item.querySelectorAll(".quiz-option");
  const feedback = item.querySelector(".quiz-feedback");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const isCorrect = option.dataset.choice === answer;

      options.forEach((button) => {
        button.classList.remove("is-correct", "is-wrong");
        button.setAttribute("aria-pressed", "false");
      });

      option.classList.add(isCorrect ? "is-correct" : "is-wrong");
      option.setAttribute("aria-pressed", "true");

      feedback.textContent = isCorrect ? "정답입니다!" : "다시 생각해 보세요.";
      feedback.classList.toggle("is-correct", isCorrect);
      feedback.classList.toggle("is-wrong", !isCorrect);
    });
  });
});

console.log("[lesson06] AI World Cup textbook ready");
