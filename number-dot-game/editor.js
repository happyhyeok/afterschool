const EDITOR_SVG_NS = "http://www.w3.org/2000/svg";
const sketchSelect = document.querySelector("#sketchSelect");
const customSketch = document.querySelector("#customSketch");
const loadSketchButton = document.querySelector("#loadSketchButton");
const editorBoard = document.querySelector("#editorBoard");
const editorSketch = document.querySelector("#editorSketch");
const editorPointLayer = document.querySelector("#editorPointLayer");
const editorLineLayer = document.querySelector("#editorLineLayer");
const undoButton = document.querySelector("#undoButton");
const clearButton = document.querySelector("#clearButton");
const copyButton = document.querySelector("#copyButton");
const output = document.querySelector("#output");
const pointCount = document.querySelector("#pointCount");
const editorMessage = document.querySelector("#editorMessage");

let editorPoints = [];

function makeEditorSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(EDITOR_SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
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

function loadSketch(src) {
  const trimmed = src.trim();
  if (!trimmed) {
    return;
  }
  editorSketch.setAttribute("href", trimmed);
  customSketch.value = trimmed;
  editorMessage.textContent = "밑그림을 불러왔습니다. 순서대로 점을 찍어 보세요.";
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

function renderEditor() {
  editorPointLayer.replaceChildren();
  editorLineLayer.replaceChildren();

  editorPoints.forEach(([x, y], index) => {
    if (index > 0) {
      const [previousX, previousY] = editorPoints[index - 1];
      editorLineLayer.append(makeEditorSvgElement("line", {
        class: "connection-line editor-line",
        x1: previousX,
        y1: previousY,
        x2: x,
        y2: y
      }));
    }

    const group = makeEditorSvgElement("g", { class: "point-group editor-point" });
    group.append(
      makeEditorSvgElement("circle", { class: "dot-circle", cx: x, cy: y, r: 24 }),
      makeEditorSvgElement("text", { class: "dot-label", x, y: y + 1 })
    );
    group.querySelector("text").textContent = index + 1;
    editorPointLayer.append(group);
  });

  pointCount.textContent = `${editorPoints.length}개`;
  output.value = JSON.stringify(editorPoints);
}

function addPoint(event) {
  if (event.target.closest("button, input, select, textarea")) {
    return;
  }
  editorPoints.push(getBoardPoint(event));
  renderEditor();
  editorMessage.textContent = `${editorPoints.length}번 점을 찍었습니다.`;
}

async function copyCoordinates() {
  output.select();
  try {
    await navigator.clipboard.writeText(output.value);
    editorMessage.textContent = "좌표를 복사했습니다. data.js의 points 값에 붙여 넣으세요.";
  } catch {
    document.execCommand("copy");
    editorMessage.textContent = "좌표를 복사했습니다.";
  }
}

sketchSelect.addEventListener("change", () => loadSketch(sketchSelect.value));
loadSketchButton.addEventListener("click", () => loadSketch(customSketch.value));
editorBoard.addEventListener("click", addPoint);
undoButton.addEventListener("click", () => {
  editorPoints.pop();
  renderEditor();
  editorMessage.textContent = "마지막 점을 삭제했습니다.";
});
clearButton.addEventListener("click", () => {
  editorPoints = [];
  renderEditor();
  editorMessage.textContent = "모든 점을 지웠습니다.";
});
copyButton.addEventListener("click", copyCoordinates);

setupSketchOptions();
renderEditor();
