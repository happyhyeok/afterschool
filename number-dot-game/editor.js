const EDITOR_SVG_NS = "http://www.w3.org/2000/svg";
const sketchSelect = document.querySelector("#sketchSelect");
const customSketch = document.querySelector("#customSketch");
const loadSketchButton = document.querySelector("#loadSketchButton");
const targetPictureSelect = document.querySelector("#targetPictureSelect");
const editorBoard = document.querySelector("#editorBoard");
const editorSketch = document.querySelector("#editorSketch");
const editorPointLayer = document.querySelector("#editorPointLayer");
const editorLineLayer = document.querySelector("#editorLineLayer");
const newStrokeButton = document.querySelector("#newStrokeButton");
const closeStrokeButton = document.querySelector("#closeStrokeButton");
const undoButton = document.querySelector("#undoButton");
const removeStrokeButton = document.querySelector("#removeStrokeButton");
const clearButton = document.querySelector("#clearButton");
const copyButton = document.querySelector("#copyButton");
const copyPictureButton = document.querySelector("#copyPictureButton");
const output = document.querySelector("#output");
const pointCount = document.querySelector("#pointCount");
const editorMessage = document.querySelector("#editorMessage");

let editorStrokes = [{ name: "선 1", closed: false, points: [] }];
let targetPictures = [];

function makeEditorSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(EDITOR_SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function getCurrentStroke() {
  return editorStrokes[editorStrokes.length - 1];
}

function getTotalPointCount() {
  return editorStrokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
}

function getNumberedPoints() {
  let number = 1;
  return editorStrokes.flatMap((stroke, strokeIndex) =>
    stroke.points.map((point, pointIndex) => ({
      number: number++,
      point,
      pointIndex,
      stroke,
      strokeIndex
    }))
  );
}

function setupSketchOptions() {
  const sketches = window.DOT_GAME_SKETCHES || [];
  sketchSelect.replaceChildren();
  sketches.forEach((sketch) => {
    const option = document.createElement("option");
    option.value = sketch.src;
    option.textContent = sketch.name;
    sketchSelect.append(option);
  });
  if (sketches[0]) {
    loadSketch(sketches[0].src);
  }
}

function setupTargetPictureOptions() {
  targetPictures = (window.DOT_GAME_LEVELS || [])
    .flatMap((level) => level.pictures.map((picture) => ({ ...picture, levelName: level.name, levelOrder: level.order })))
    .filter((picture) => picture.sketch);

  targetPictureSelect.replaceChildren();
  targetPictures.forEach((picture) => {
    const option = document.createElement("option");
    option.value = picture.id;
    option.textContent = `${picture.levelOrder}단계 ${picture.name}`;
    targetPictureSelect.append(option);
  });
}

function loadSketch(src) {
  const trimmed = src.trim();
  if (!trimmed) {
    return;
  }
  editorSketch.setAttribute("href", trimmed);
  customSketch.value = trimmed;
  editorMessage.textContent = "밑그림을 불러왔습니다. 외곽선을 찍은 뒤 새 선 시작을 누르세요.";
}

function getBoardPoint(event) {
  const rect = editorBoard.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 1000;
  const y = ((event.clientY - rect.top) / rect.height) * 1000;
  return [
    Math.max(0, Math.min(1000, Math.round(x))),
    Math.max(0, Math.min(1000, Math.round(y)))
  ];
}

function renderStrokeLines(stroke) {
  stroke.points.forEach(([x, y], index) => {
    if (index > 0) {
      const [previousX, previousY] = stroke.points[index - 1];
      editorLineLayer.append(makeEditorSvgElement("line", {
        class: "connection-line editor-line",
        x1: previousX,
        y1: previousY,
        x2: x,
        y2: y
      }));
    }
  });

  if (stroke.closed && stroke.points.length > 2) {
    const first = stroke.points[0];
    const last = stroke.points[stroke.points.length - 1];
    editorLineLayer.append(makeEditorSvgElement("line", {
      class: "connection-line editor-line editor-line-closed",
      x1: last[0],
      y1: last[1],
      x2: first[0],
      y2: first[1]
    }));
  }
}

function renderEditor() {
  editorPointLayer.replaceChildren();
  editorLineLayer.replaceChildren();

  editorStrokes.forEach(renderStrokeLines);

  getNumberedPoints().forEach(({ number, point: [x, y], strokeIndex }) => {
    const group = makeEditorSvgElement("g", {
      class: `point-group editor-point${strokeIndex === editorStrokes.length - 1 ? " is-active-stroke" : ""}`
    });
    group.append(
      makeEditorSvgElement("circle", { class: "dot-circle", cx: x, cy: y, r: 24 }),
      makeEditorSvgElement("text", { class: "dot-label", x, y: y + 1 })
    );
    group.querySelector("text").textContent = number;
    editorPointLayer.append(group);
  });

  const totalPoints = getTotalPointCount();
  pointCount.textContent = `${editorStrokes.length}선 · ${totalPoints}점`;
  output.value = JSON.stringify({
    strokes: editorStrokes
      .filter((stroke) => stroke.points.length > 0)
      .map((stroke, index) => ({
        name: stroke.name || `선 ${index + 1}`,
        closed: Boolean(stroke.closed),
        points: stroke.points
      }))
  }, null, 2);
}

function getCleanStrokes() {
  return editorStrokes
    .filter((stroke) => stroke.points.length > 0)
    .map((stroke, index) => ({
      name: stroke.name || `선 ${index + 1}`,
      closed: Boolean(stroke.closed),
      points: stroke.points
    }));
}

function getSelectedPicture() {
  return targetPictures.find((picture) => picture.id === targetPictureSelect.value) || targetPictures[0] || null;
}

function makeFallbackPicture() {
  const filename = customSketch.value.split("/").pop()?.replace(/\.[^.]+$/, "") || "new-picture";
  const id = filename.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "") || "new-picture";
  return {
    id,
    name: filename,
    icon: "✏️",
    color: "#4d79e6",
    sketch: customSketch.value
  };
}

function makePictureCode() {
  const picture = getSelectedPicture() || makeFallbackPicture();
  const pictureData = {
    id: picture.id,
    name: picture.name,
    icon: picture.icon || "✏️",
    color: picture.color || "#4d79e6",
    sketch: customSketch.value.trim() || picture.sketch,
    strokes: getCleanStrokes()
  };
  return JSON.stringify(pictureData, null, 2);
}

function addPoint(event) {
  if (event.target.closest("button, input, select, textarea")) {
    return;
  }
  const currentStroke = getCurrentStroke();
  if (currentStroke.closed) {
    startNewStroke();
  }
  getCurrentStroke().points.push(getBoardPoint(event));
  renderEditor();
  editorMessage.textContent = `${getTotalPointCount()}번 점을 찍었습니다.`;
}

function startNewStroke() {
  const currentStroke = getCurrentStroke();
  if (currentStroke.points.length === 0) {
    editorMessage.textContent = "현재 선에 점을 먼저 찍어 주세요.";
    return;
  }
  editorStrokes.push({ name: `선 ${editorStrokes.length + 1}`, closed: false, points: [] });
  renderEditor();
  editorMessage.textContent = "새 선을 시작했습니다. 내부 눈, 입, 무늬는 여기부터 찍으세요.";
}

function closeCurrentStroke() {
  const currentStroke = getCurrentStroke();
  if (currentStroke.points.length < 3) {
    editorMessage.textContent = "선을 닫으려면 점이 3개 이상 필요합니다.";
    return;
  }
  currentStroke.closed = !currentStroke.closed;
  renderEditor();
  editorMessage.textContent = currentStroke.closed ? "현재 선을 닫았습니다." : "현재 선 닫기를 해제했습니다.";
}

function removeCurrentStroke() {
  if (editorStrokes.length === 1) {
    editorStrokes[0] = { name: "선 1", closed: false, points: [] };
  } else {
    editorStrokes.pop();
  }
  renderEditor();
  editorMessage.textContent = "현재 선을 삭제했습니다.";
}

async function copyCoordinates() {
  output.select();
  try {
    await navigator.clipboard.writeText(output.value);
    editorMessage.textContent = "선 묶음을 복사했습니다.";
  } catch {
    document.execCommand("copy");
    editorMessage.textContent = "선 묶음을 복사했습니다.";
  }
}

async function copyPictureCode() {
  const pictureCode = makePictureCode();
  output.value = pictureCode;
  output.select();
  try {
    await navigator.clipboard.writeText(pictureCode);
    editorMessage.textContent = "그림 항목 코드를 복사했습니다.";
  } catch {
    document.execCommand("copy");
    editorMessage.textContent = "그림 항목 코드를 복사했습니다.";
  }
}

sketchSelect.addEventListener("change", () => loadSketch(sketchSelect.value));
loadSketchButton.addEventListener("click", () => loadSketch(customSketch.value));
targetPictureSelect.addEventListener("change", () => {
  const picture = getSelectedPicture();
  if (picture?.sketch) {
    loadSketch(picture.sketch);
  }
});
editorBoard.addEventListener("click", addPoint);
newStrokeButton.addEventListener("click", startNewStroke);
closeStrokeButton.addEventListener("click", closeCurrentStroke);
undoButton.addEventListener("click", () => {
  const currentStroke = getCurrentStroke();
  currentStroke.points.pop();
  if (currentStroke.points.length < 3) {
    currentStroke.closed = false;
  }
  renderEditor();
  editorMessage.textContent = "마지막 점을 삭제했습니다.";
});
removeStrokeButton.addEventListener("click", removeCurrentStroke);
clearButton.addEventListener("click", () => {
  editorStrokes = [{ name: "선 1", closed: false, points: [] }];
  renderEditor();
  editorMessage.textContent = "모든 선과 점을 지웠습니다.";
});
copyButton.addEventListener("click", copyCoordinates);
copyPictureButton.addEventListener("click", copyPictureCode);

setupSketchOptions();
setupTargetPictureOptions();
renderEditor();
