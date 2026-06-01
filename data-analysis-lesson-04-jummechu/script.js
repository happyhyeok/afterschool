const menuData = {
  "1-1-1": "삼각김밥",
  "1-1-2": "김밥",
  "1-1-3": "라면",
  "1-2-1": "샌드위치",
  "1-2-2": "떡볶이",
  "1-2-3": "치킨마요",
  "1-3-1": "햄버거",
  "1-3-2": "돈가스",
  "1-3-3": "치킨덮밥",
  "2-1-1": "컵라면",
  "2-1-2": "라면",
  "2-1-3": "우동",
  "2-2-1": "어묵",
  "2-2-2": "떡볶이",
  "2-2-3": "국밥",
  "2-3-1": "쌀국수",
  "2-3-2": "돈가스",
  "2-3-3": "부대찌개",
  "3-1-1": "호빵",
  "3-1-2": "우동",
  "3-1-3": "라면",
  "3-2-1": "어묵",
  "3-2-2": "칼국수",
  "3-2-3": "국밥",
  "3-3-1": "쌀국수",
  "3-3-2": "부대찌개",
  "3-3-3": "갈비탕"
};

const weatherLabel = {
  1: "1 맑음",
  2: "2 비",
  3: "3 추움"
};

const moneyLabel = {
  1: "1 적음",
  2: "2 보통",
  3: "3 많음"
};

const hungerLabel = {
  1: "1 조금",
  2: "2 보통",
  3: "3 매우"
};

function renderMenuMatrix() {
  const matrix = document.querySelector("#menu-matrix");

  if (!matrix) {
    return;
  }

  matrix.innerHTML = Object.keys(weatherLabel)
    .map((weather) => {
      const rows = Object.keys(moneyLabel)
        .map((money) => {
          const cells = Object.keys(hungerLabel)
            .map((hunger) => `<td><strong>${menuData[`${weather}-${money}-${hunger}`]}</strong></td>`)
            .join("");

          return `
            <tr>
              <th scope="row">${moneyLabel[money]}</th>
              ${cells}
            </tr>
          `;
        })
        .join("");

      return `
        <article class="menu-matrix-card">
          <h3>${weatherLabel[weather]}</h3>
          <div class="table-wrapper compact-menu-table">
            <table>
              <thead>
                <tr>
                  <th>용돈 \\ 배고픔</th>
                  <th>${hungerLabel[1]}</th>
                  <th>${hungerLabel[2]}</th>
                  <th>${hungerLabel[3]}</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </article>
      `;
    })
    .join("");
}

function setupQuizzes() {
  const quizCards = document.querySelectorAll("[data-quiz]");

  quizCards.forEach((quizCard) => {
    const buttons = quizCard.querySelectorAll("button");
    const feedback = quizCard.querySelector(".feedback");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const isCorrect = button.dataset.correct === "true";

        buttons.forEach((option) => {
          option.classList.remove("correct", "wrong");

          if (option.dataset.correct === "true") {
            option.classList.add("correct");
          }
        });

        if (isCorrect) {
          feedback.textContent = "정답입니다. 조건을 잘 읽었어요!";
          feedback.className = "feedback correct";
        } else {
          button.classList.add("wrong");
          feedback.textContent = "아쉬워요. 초록색으로 표시된 정답을 다시 확인해 봅시다.";
          feedback.className = "feedback wrong";
        }
      });
    });
  });
}

renderMenuMatrix();
setupQuizzes();
