"use strict";

const CONFIG = window.TYPING_RECORD_CONFIG || {};
const API_URL = String(CONFIG.APPS_SCRIPT_URL || "").trim();
const DEFAULT_YEAR = String(CONFIG.DEFAULT_YEAR || new Date().getFullYear());
const REQUEST_TIMEOUT_MS = Number(CONFIG.REQUEST_TIMEOUT_MS || 12000);

const elements = {
  syncBadge: document.querySelector("#syncBadge"),
  syncText: document.querySelector("#syncText"),
  schoolLinks: document.querySelector("#schoolLinks"),
  toast: document.querySelector("#toast"),
};

let toastTimer = 0;

initialise();

async function initialise() {
  if (!API_URL) {
    setSyncState("error", "연동 주소가 비어 있습니다");
    elements.schoolLinks.innerHTML = `<div class="empty-state">config.js의 Apps Script 주소를 확인해주세요.</div>`;
    return;
  }

  setSyncState("loading", "학교 목록을 불러오는 중입니다");
  try {
    const response = await api("bootstrap");
    renderSchoolLinks(response.data?.students || []);
    setSyncState("ready", "학교별 링크가 준비되었습니다");
  } catch (error) {
    setSyncState("error", "학교 목록을 불러오지 못했습니다");
    elements.schoolLinks.innerHTML = `<div class="empty-state">Google Sheets 연결을 확인해주세요.</div>`;
  }
}

function renderSchoolLinks(students) {
  const schools = uniqueSchoolRows(students);
  if (!schools.length) {
    elements.schoolLinks.innerHTML = `<div class="empty-state">등록된 학생이 없습니다.</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const item of schools) {
    const url = new URL("./index.html", window.location.href);
    url.searchParams.set("year", item.year);
    url.searchParams.set("school", item.school);

    const row = document.createElement("div");
    row.className = "school-link-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.school)}</strong>
        <span>${escapeHtml(item.year)}년 · 학생 ${item.count}명</span>
      </div>
      <input type="text" readonly value="${escapeHtml(url.toString())}" />
      <button class="soft-button" type="button">복사</button>
    `;
    row.querySelector("button").addEventListener("click", async () => {
      await navigator.clipboard.writeText(url.toString());
      showToast("링크를 복사했습니다.");
    });
    fragment.append(row);
  }

  elements.schoolLinks.innerHTML = "";
  elements.schoolLinks.append(fragment);
}

function uniqueSchoolRows(students) {
  const map = new Map();
  for (const student of students) {
    const year = String(student.year || DEFAULT_YEAR).trim();
    const school = String(student.school || "").trim();
    if (!year || !school) continue;
    const key = `${year}::${school}`;
    const current = map.get(key) || { year, school, count: 0 };
    current.count += 1;
    map.set(key, current);
  }
  return [...map.values()].sort((a, b) => {
    if (a.year !== b.year) return Number(b.year) - Number(a.year);
    return a.school.localeCompare(b.school, "ko-KR");
  });
}

function api(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `__typingSchoolLinks_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("요청 시간이 초과되었습니다."));
    }, REQUEST_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (response) => {
      cleanup();
      response?.ok ? resolve(response) : reject(new Error(response?.error || "요청을 처리하지 못했습니다."));
    };

    const url = new URL(API_URL);
    url.searchParams.set("action", action);
    url.searchParams.set("callback", callbackName);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }

    script.onerror = () => {
      cleanup();
      reject(new Error("Apps Script 응답을 읽지 못했습니다."));
    };
    script.src = url.toString();
    document.head.append(script);
  });
}

function setSyncState(state, text) {
  elements.syncBadge.className = `sync-badge ${state}`;
  elements.syncBadge.textContent =
    {
      loading: "동기화 중",
      ready: "연결됨",
      error: "확인 필요",
    }[state] || "상태";
  elements.syncText.textContent = text;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
