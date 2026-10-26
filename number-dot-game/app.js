const SVG_NS = "http://www.w3.org/2000/svg";
const STORAGE_KEY = "dotGameCompletedPictures.v2";
const levels = window.DOT_GAME_LEVELS;
const allPictures = levels.flatMap((level) =>
  level.pictures.map((picture) => ({
    ...picture,
    coordinateSpace: picture.coordinateSpace || level.coordinateSpace,
    levelId: level.id
  }))
);

const selectScreen = document.querySelector("#selectScreen");
const playScreen = document.querySelector("#playScreen");
const levelList = document.querySelector("#levelList");
const numberPanel = document.querySelector("#numberPanel");
const progressPanel = document.querySelector("#progressPanel");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const unlockMessage = document.querySelector("#unlockMessage");
const pointLayer = document.querySelector("#pointLayer");
const lineLayer = document.querySelector("#lineLayer");
const completeLayer = document.querySelector("#completeLayer");
const sketchLayer = document.querySelector("#sketchLayer");
const currentNumber = document.querySelector("#currentNumber");
const clickCountElement = document.querySelector("#clickCount");
const wrongCountElement = document.querySelector("#wrongCount");
const difficultyBadge = document.querySelector("#difficultyBadge");
const pictureName = document.querySelector("#pictureName");
const message = document.querySelector("#message");
const habitCoach = document.querySelector("#habitCoach");
const celebration = document.querySelector("#celebration");
const finishDialog = document.querySelector("#finishDialog");
const unlockNotice = document.querySelector("#unlockNotice");
const resultCorrect = document.querySelector("#resultCorrect");
const resultWrong = document.querySelector("#resultWrong");
const resultHints = document.querySelector("#resultHints");
const resultMessage = document.querySelector("#resultMessage");
const resultPractice = document.querySelector("#resultPractice");
const resultTitle = document.querySelector("#resultTitle");
const restartButton = document.querySelector("#restartButton");
const hintButton = document.querySelector("#hintButton");
const nextButton = document.querySelector("#nextButton");
const backButton = document.querySelector("#backButton");
const finishRestartButton = document.querySelector("#finishRestartButton");
const finishNextButton = document.querySelector("#finishNextButton");

let activePictureId = null;
let nextPointIndex = 0;
let clickCount = 0;
let correctCount = 0;
let wrongCount = 0;
let consecutiveWrong = 0;
let maxConsecutiveWrong = 0;
let hintUseCount = 0;
let rapidRepeatCount = 0;
let lastClickedIndex = null;
let lastClickTime = 0;
let isComplete = false;
let dialogTimer;
let hintTimer;
let coachTimer;
let completedIds = loadProgress();

const COACH_MESSAGES = {
  consecutive: [
    "잠깐! 다음 숫자를 눈으로 먼저 찾아볼까요?",
    "괜찮아요. 손을 잠깐 멈추고 다음 번호를 찾아보세요."
  ],
  total: [
    "마우스를 천천히 움직이고, 숫자 위에서 딱 한 번 클릭해 보세요.",
    "조금만 천천히 하면 더 멋지게 연결할 수 있어요."
  ],
  rapid: [
    "빠르게 누르는 것보다 정확하게 누르는 것이 더 중요해요.",
    "마우스는 부드럽게 움직이고, 클릭은 한 번만 해요."
  ]
};

const RESULT_LEVELS = {
  calm: {
    title: "차분한 클릭왕",
    message: "정말 차분하게 잘 클릭했어요!\n숫자를 보고 정확하게 클릭하는 힘이 자라고 있어요."
  },
  steady: {
    title: "끝까지 도전한 탐험가",
    message: "끝까지 포기하지 않고 그림을 완성했어요!\n다음에는 마우스를 조금 더 천천히 움직이면 더 정확하게 할 수 있어요."
  },
  ready: {
    title: "다시 도전할 준비 완료",
    message: "그림을 끝까지 완성한 것이 아주 멋져요!\n다음에는 손을 잠깐 멈추고, 다음 숫자를 먼저 찾은 뒤 클릭해 보세요.\n천천히 하면 더 잘할 수 있어요."
  }
};

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const validIds = new Set(allPictures.map((picture) => picture.id));
    return new Set(Array.isArray(saved) ? saved.filter((id) => validIds.has(id)) : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedIds]));
}

function makeSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function getDisplayPoints(picture) {
  return getDisplayStrokes(picture).flatMap((stroke) => stroke.points);
}

function getDisplayStrokes(picture) {
  const sourceStrokes = getSourceStrokes(picture);
  if (!picture.coordinateSpace) {
    return sourceStrokes;
  }
  const [sourceWidth, sourceHeight] = picture.coordinateSpace;
  return sourceStrokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map(([x, y]) => [
      Math.round((x / sourceWidth) * 1000),
      Math.round((y / sourceHeight) * 1000)
    ])
  }));
}

function getSourceStrokes(picture) {
  if (picture.strokes) {
    return picture.strokes;
  }
  if (picture.sketch && Array.isArray(picture.points)) {
    return [{ closed: picture.closePath !== false, points: picture.points }];
  }
  return [{ closed: picture.closePath !== false, points: picture.points }];
}


function getNumberedPoints(picture) {
  return getDisplayStrokes(picture).flatMap((stroke, strokeIndex) =>
    stroke.points.map((point, pointIndex) => ({
      point,
      strokeIndex,
      pointIndex,
      stroke
    }))
  );
}

function getLevel(levelId) {
  return levels.find((level) => level.id === levelId);
}

function getPicture(pictureId = activePictureId) {
  return allPictures.find((picture) => picture.id === pictureId);
}

function getPointGroup(index) {
  return pointLayer.querySelector(`[data-index="${index}"]`);
}

function bringPointToFront(index) {
  const group = getPointGroup(index);
  if (group) {
    pointLayer.append(group);
  }
  return group;
}

function isLevelUnlocked(levelIndex) {
  if (levelIndex === 0) {
    return true;
  }
  return levels[levelIndex - 1].pictures.every((picture) => completedIds.has(picture.id));
}

function isLevelComplete(level) {
  return level.pictures.every((picture) => completedIds.has(picture.id));
}

function updateProgress() {
  const count = completedIds.size;
  progressText.textContent = `${count}/${allPictures.length} 완료`;
  progressBar.style.width = `${(count / allPictures.length) * 100}%`;

  const nextLockedLevel = levels.find((level, index) => !isLevelUnlocked(index));
  if (count === allPictures.length) {
    unlockMessage.textContent = "모든 그림을 완성했어요! 최고예요!";
  } else if (nextLockedLevel) {
    const previous = levels[nextLockedLevel.order - 2];
    const done = previous.pictures.filter((picture) => completedIds.has(picture.id)).length;
    unlockMessage.textContent = `${previous.name} ${done}/${previous.pictures.length} 완료 · 모두 완성하면 ${nextLockedLevel.name} 단계가 열려요!`;
  } else {
    unlockMessage.textContent = "모든 단계가 열렸어요. 마음껏 골라요!";
  }
}

function renderSelection() {
  levelList.replaceChildren();

  levels.forEach((level, levelIndex) => {
    const unlocked = isLevelUnlocked(levelIndex);
    const completedCount = level.pictures.filter((picture) => completedIds.has(picture.id)).length;
    const section = document.createElement("section");
    section.className = `level-section${unlocked ? "" : " is-locked"}`;
    section.dataset.level = level.id;

    const header = document.createElement("div");
    header.className = "level-header";
    header.innerHTML = `
      <div class="level-title">
        <span class="level-number" style="background:${level.color}">${level.order}단계</span>
        <div>
          <h3>${level.name} <small>${level.range}</small></h3>
          <p>${unlocked ? level.description : "앞 단계를 먼저 완성해요."}</p>
        </div>
      </div>
      <strong class="level-count">${unlocked ? `${completedCount}/${level.pictures.length}` : "🔒 잠김"}</strong>
    `;

    const grid = document.createElement("div");
    grid.className = "picture-grid";

    level.pictures.forEach((picture) => {
      const done = completedIds.has(picture.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `picture-card${done ? " is-complete" : ""}`;
      button.disabled = !unlocked;
      button.dataset.pictureId = picture.id;
      button.setAttribute("aria-label", unlocked ? `${picture.name}${done ? ", 완료" : ""}` : `${picture.name}, 잠김`);
      const pointCount = getDisplayPoints(picture).length;
      button.innerHTML = `
        <span class="picture-icon" style="background:${picture.color}22">${unlocked ? picture.icon : "🔒"}</span>
        <strong>${picture.name}</strong>
        <span class="card-state">${done ? "✓ 완료" : unlocked ? `${pointCount}개 점` : "잠겨 있어요"}</span>
      `;
      if (unlocked) {
        button.addEventListener("click", () => startPicture(picture.id));
      }
      grid.append(button);
    });

    section.append(header, grid);
    levelList.append(section);
  });

  updateProgress();
}

function showSelection() {
  clearTimeout(dialogTimer);
  finishDialog.hidden = true;
  selectScreen.hidden = false;
  playScreen.hidden = true;
  numberPanel.hidden = true;
  progressPanel.hidden = false;
  renderSelection();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function startPicture(pictureId) {
  const picture = getPicture(pictureId);
  const levelIndex = levels.findIndex((level) => level.id === picture.levelId);
  if (!picture || !isLevelUnlocked(levelIndex)) {
    return;
  }

  activePictureId = pictureId;
  selectScreen.hidden = true;
  playScreen.hidden = false;
  numberPanel.hidden = false;
  progressPanel.hidden = false;
  renderGame();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderGame() {
  const picture = getPicture();
  const level = getLevel(picture.levelId);

  clearTimeout(dialogTimer);
  clearTimeout(hintTimer);
  clearTimeout(coachTimer);
  nextPointIndex = 0;
  clickCount = 0;
  correctCount = 0;
  wrongCount = 0;
  consecutiveWrong = 0;
  maxConsecutiveWrong = 0;
  hintUseCount = 0;
  rapidRepeatCount = 0;
  lastClickedIndex = null;
  lastClickTime = 0;
  isComplete = false;

  pointLayer.replaceChildren();
  lineLayer.replaceChildren();
  completeLayer.replaceChildren();
  sketchLayer.replaceChildren();
  celebration.replaceChildren();
  pointLayer.style.opacity = "1";
  lineLayer.style.opacity = "1";
  finishDialog.hidden = true;
  habitCoach.hidden = true;
  habitCoach.textContent = "";

  const numberedPoints = getNumberedPoints(picture);
  renderDetails(picture);
  const labels = placeLabels(numberedPoints);

  numberedPoints.forEach(({ point: [x, y] }, index) => {
    const nearest = Math.min(...numberedPoints.filter((_, j) => j !== index).map(({point}) => Math.hypot(point[0] - x, point[1] - y)));
    const group = makeSvgElement("g", {
      class: `point-group${index === 0 ? " is-current" : ""}`,
      "data-index": index
    });
    const hitArea = makeSvgElement("circle", {
      class: "dot-hit",
      cx: x,
      cy: y,
      r: Math.min(30, nearest * 0.45),
      tabindex: "0",
      role: "button",
      "aria-label": `${index + 1}번 점`
    });
    const circle = makeSvgElement("circle", {
      class: "dot-circle",
      cx: x,
      cy: y,
      r: 8
    });
    const label = makeSvgElement("text", {
      class: "dot-label",
      x: labels[index][0],
      y: labels[index][1]
    });
    label.textContent = index + 1;

    group.addEventListener("click", () => handlePointClick(index));
    hitArea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handlePointClick(index);
      }
    });

    group.append(hitArea, circle, label);
    pointLayer.append(group);
  });
  bringPointToFront(0);

  difficultyBadge.textContent = `${level.order}단계 ${level.name}`;
  difficultyBadge.style.backgroundColor = level.color;
  pictureName.textContent = `${picture.icon} ${picture.name}`;
  message.textContent = "1번 점부터 눌러 보세요!";
  message.className = "message";
  updateStatus();
}

function handlePointClick(clickedIndex) {
  if (isComplete) {
    return;
  }

  const now = Date.now();
  const isRapidRepeat = clickedIndex === lastClickedIndex && now - lastClickTime < 550;
  lastClickedIndex = clickedIndex;
  lastClickTime = now;
  clickCount += 1;

  if (isRapidRepeat) {
    rapidRepeatCount += 1;
    showCoach("rapid", rapidRepeatCount);
  }

  if (clickedIndex !== nextPointIndex) {
    wrongCount += 1;
    consecutiveWrong += 1;
    maxConsecutiveWrong = Math.max(maxConsecutiveWrong, consecutiveWrong);
    if (!isRapidRepeat) {
      if (wrongCount >= 4) {
        showCoach("total", wrongCount);
      } else if (consecutiveWrong >= 2) {
        showCoach("consecutive", consecutiveWrong);
      }
    }
    showWrongFeedback(clickedIndex);
    updateStatus();
    return;
  }

  correctCount += 1;
  consecutiveWrong = 0;
  const picture = getPicture();
  const numberedPoints = getNumberedPoints(picture);
  const currentGroup = getPointGroup(nextPointIndex);
  currentGroup.classList.remove("is-current");
  currentGroup.classList.add("is-done");
  currentGroup.querySelector(".dot-hit").setAttribute("tabindex", "-1");

  if (nextPointIndex > 0) {
    const previous = numberedPoints[nextPointIndex - 1];
    const current = numberedPoints[nextPointIndex];
    if (previous.strokeIndex === current.strokeIndex) {
      drawLine(previous.point, current.point);
    }
  }

  const finishedPoint = numberedPoints[nextPointIndex];
  if (finishedPoint.pointIndex === finishedPoint.stroke.points.length - 1 && finishedPoint.stroke.closed) {
    drawLine(finishedPoint.point, finishedPoint.stroke.points[0]);
  }

  nextPointIndex += 1;
  updateStatus();

  if (nextPointIndex === numberedPoints.length) {
    completePicture();
    return;
  }

  const nextGroup = bringPointToFront(nextPointIndex);
  nextGroup.classList.add("is-current");
  const next = numberedPoints[nextPointIndex];
  message.textContent = next.pointIndex === 0
    ? `다음은 ${next.stroke.name} 연결이에요. ${nextPointIndex + 1}번부터!`
    : `좋아요! 다음은 ${nextPointIndex + 1}번이에요.`;
  message.className = "message";
}

function drawLine([x1, y1], [x2, y2]) {
  lineLayer.append(makeSvgElement("line", {
    class: "connection-line",
    x1, y1, x2, y2
  }));
}

function showWrongFeedback(clickedIndex) {
  const group = getPointGroup(clickedIndex);
  group.classList.remove("is-wrong");
  void group.getBoundingClientRect();
  group.classList.add("is-wrong");
  message.textContent = `괜찮아요! 다음은 ${nextPointIndex + 1}번이에요!`;
  message.className = "message is-wrong";
}

function showCoach(type, count) {
  const choices = COACH_MESSAGES[type];
  habitCoach.textContent = choices[(count - 1) % choices.length];
  habitCoach.className = `habit-coach is-${type}`;
  habitCoach.hidden = false;

  clearTimeout(coachTimer);
  coachTimer = window.setTimeout(() => {
    habitCoach.hidden = true;
  }, 4500);
}

function updateStatus() {
  const picture = getPicture();
  const pointCount = getDisplayPoints(picture).length;
  currentNumber.textContent = isComplete ? "✓" : Math.min(nextPointIndex + 1, pointCount);
  clickCountElement.textContent = clickCount;
  wrongCountElement.textContent = wrongCount;
}

function renderDetails(picture) {
  (picture.details || []).forEach((d) => sketchLayer.append(makeSvgElement("path", {
    d, class: "picture-detail"
  })));
}

function placeLabels(points) {
  const placed = [];
  return points.map(({point: [x, y]}, index) => {
    const width = String(index + 1).length * 22 + 12;
    let best = null;
    for (const radius of [34, 50, 66, 82]) {
      for (let i = 0; i < 16; i++) {
        const angle = -Math.PI / 2 + i * Math.PI / 8;
        const cx = x + radius * Math.cos(angle), cy = y + radius * Math.sin(angle);
        const box = {x: cx - width / 2, y: cy - 24, w: width, h: 48};
        let penalty = radius * 0.04;
        if (box.x < 20 || box.x + box.w > 980 || box.y < 20 || box.y + box.h > 980) penalty += 10000;
        for (const other of placed) {
          if (box.x < other.x + other.w + 5 && box.x + box.w + 5 > other.x && box.y < other.y + other.h + 5 && box.y + box.h + 5 > other.y) penalty += 1000;
        }
        for (const {point: [px, py]} of points) {
          if (px > box.x - 12 && px < box.x + box.w + 12 && py > box.y - 12 && py < box.y + box.h + 12) penalty += 200;
        }
        if (!best || penalty < best.penalty) best = {box, cx, cy, penalty};
      }
    }
    placed.push(best.box);
    return [Math.round(best.cx), Math.round(best.cy)];
  });
}

function getResultEvaluation() {
  if (wrongCount <= 2 && hintUseCount <= 1 && rapidRepeatCount <= 1) {
    return RESULT_LEVELS.calm;
  }
  if (wrongCount >= 6 || rapidRepeatCount >= 3 || maxConsecutiveWrong >= 4) {
    return RESULT_LEVELS.ready;
  }
  return RESULT_LEVELS.steady;
}

function getPracticeSuggestion() {
  if (rapidRepeatCount >= 2) {
    return "숫자 위에서 클릭은 딱 한 번 하기";
  }
  if (wrongCount >= 4 || maxConsecutiveWrong >= 2) {
    return "손을 잠깐 멈추고 다음 숫자를 먼저 찾기";
  }
  if (hintUseCount >= 2) {
    return "힌트 전에 반짝이는 숫자를 천천히 살펴보기";
  }
  return "지금처럼 차분하게 숫자를 따라가기";
}

function renderResult(picture) {
  const evaluation = getResultEvaluation();
  document.querySelector("#finishTitle").textContent = `${picture.name} 완성!`;
  resultCorrect.textContent = `${correctCount}번`;
  resultWrong.textContent = `${wrongCount}번`;
  resultHints.textContent = `${hintUseCount}번`;
  resultMessage.textContent = evaluation.message;
  resultPractice.textContent = getPracticeSuggestion();
  resultTitle.textContent = `“${evaluation.title}”`;
}

function completePicture() {
  const picture = getPicture();
  const level = getLevel(picture.levelId);
  const levelWasComplete = isLevelComplete(level);
  const wasAlreadyComplete = completedIds.has(picture.id);
  isComplete = true;

  // Keep the exact paths the child drew; never replace them with another image.
  pointLayer.style.opacity = "0";
  lineLayer.style.opacity = "1";

  if (!wasAlreadyComplete) {
    completedIds.add(picture.id);
    saveProgress();
  }
  updateProgress();

  message.textContent = `짜잔! ${picture.name} 완성!`;
  message.className = "message";
  currentNumber.textContent = "✓";
  makeConfetti();

  const levelNowComplete = isLevelComplete(level);
  const levelIndex = levels.findIndex((item) => item.id === level.id);
  const newlyUnlocked = !levelWasComplete && levelNowComplete && levels[levelIndex + 1];

  renderResult(picture);
  if (newlyUnlocked) {
    unlockNotice.hidden = false;
    unlockNotice.textContent = `🔓 ${levels[levelIndex + 1].order}단계 ${levels[levelIndex + 1].name}이 열렸어요!`;
  } else {
    unlockNotice.hidden = true;
  }

  finishNextButton.textContent = findNextPicture() ? "다음 그림" : "그림 고르기";
  dialogTimer = window.setTimeout(() => {
    finishDialog.hidden = false;
    finishNextButton.focus();
  }, 1000);
}

function makeConfetti() {
  const colors = ["#ff6f73", "#ffd95b", "#6bc9f2", "#63d5b2", "#8d70e8"];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.65}s`;
    celebration.append(piece);
  }
}

function showHint() {
  if (isComplete) {
    message.textContent = "그림을 모두 완성했어요!";
    return;
  }

  hintUseCount += 1;
  document.querySelector(".hint-ring")?.remove();
  const currentGroup = getPointGroup(nextPointIndex);
  const hitArea = currentGroup.querySelector(".dot-hit");
  const [x, y] = getDisplayPoints(getPicture())[nextPointIndex];
  const hintRing = makeSvgElement("circle", {
    cx: x,
    cy: y,
    r: 41,
    fill: "none",
    stroke: "#ff9658",
    "stroke-width": 8,
    "stroke-dasharray": "12 8",
    class: "hint-ring"
  });
  currentGroup.insertBefore(hintRing, hitArea);
  message.textContent = `${nextPointIndex + 1}번은 주황색 동그라미 안에 있어요!`;
  message.className = "message is-hint";

  clearTimeout(hintTimer);
  hintTimer = window.setTimeout(() => hintRing.remove(), 1800);
}

function findNextPicture() {
  const currentIndex = allPictures.findIndex((picture) => picture.id === activePictureId);
  const ordered = [
    ...allPictures.slice(currentIndex + 1),
    ...allPictures.slice(0, currentIndex)
  ];
  return ordered.find((picture) => {
    const levelIndex = levels.findIndex((level) => level.id === picture.levelId);
    return isLevelUnlocked(levelIndex) && !completedIds.has(picture.id);
  }) || null;
}

function goToNextPicture() {
  const nextPicture = findNextPicture();
  finishDialog.hidden = true;
  if (nextPicture) {
    startPicture(nextPicture.id);
  } else {
    showSelection();
  }
}

restartButton.addEventListener("click", renderGame);
hintButton.addEventListener("click", showHint);
nextButton.addEventListener("click", goToNextPicture);
backButton.addEventListener("click", showSelection);
finishRestartButton.addEventListener("click", renderGame);
finishNextButton.addEventListener("click", goToNextPicture);

finishDialog.addEventListener("click", (event) => {
  if (event.target === finishDialog) {
    finishDialog.hidden = true;
  }
});

showSelection();


document.querySelector("#finishViewButton").addEventListener("click", () => { finishDialog.hidden = true; nextButton.focus(); });
