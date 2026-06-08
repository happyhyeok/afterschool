function setupAnswerToggles() {
  const answerButtons = document.querySelectorAll("[data-answer-button]");

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;

      if (!answer) {
        return;
      }

      const isHidden = answer.hasAttribute("hidden");
      answer.toggleAttribute("hidden", !isHidden);
      button.textContent = isHidden ? "정답 숨기기" : "정답 보기";
    });
  });
}

function setupCardDemo() {
  const pool = document.querySelector("#pokemon-card-pool");
  const sortButton = document.querySelector("#sort-demo");
  const resetButton = document.querySelector("#reset-demo");

  if (!pool || !sortButton || !resetButton) {
    return;
  }

  const cards = Array.from(pool.querySelectorAll(".pokemon-card"));

  sortButton.addEventListener("click", () => {
    cards.forEach((card) => {
      const target = document.querySelector(`#group-${card.dataset.group}`);

      if (!target) {
        return;
      }

      card.classList.add("is-sorted");
      target.appendChild(card);
    });
  });

  resetButton.addEventListener("click", () => {
    cards.forEach((card) => {
      card.classList.remove("is-sorted");
      pool.appendChild(card);
    });
  });
}

setupAnswerToggles();
setupCardDemo();
