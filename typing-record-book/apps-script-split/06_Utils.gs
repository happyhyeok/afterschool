function makeRecordKey_(year, school, grade, studentId, entryId) {
  return [year, school, grade, studentId, entryId].map((value) => String(value).trim()).join("|");
}

function parsePayload_(payload) {
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  return JSON.parse(payload);
}

function require_(value, name) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(name + " is required");
  }
}

function normalizeDuration_(value) {
  if (value === undefined || value === null || value === "") return "";

  if (typeof value === "number" && isFinite(value) && value >= 0 && value < 1) {
    return sheetTimeSerialToDuration_(value);
  }

  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    const minutes = value.getHours();
    const seconds = value.getMinutes();
    return pad2_(minutes) + ":" + pad2_(seconds);
  }

  const text = String(value).trim();
  if (!text) return "";

  const dateTimeMatch = text.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (dateTimeMatch && /GMT|UTC|\d{4}|[A-Za-z]{3}/.test(text)) {
    const minutes = Number(dateTimeMatch[1]);
    const seconds = Number(dateTimeMatch[2]);
    if (minutes >= 0 && seconds >= 0 && seconds < 60) return pad2_(minutes) + ":" + pad2_(seconds);
  }

  const parts = text.split(":");
  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (Number.isInteger(minutes) && Number.isInteger(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
      return pad2_(minutes) + ":" + pad2_(seconds);
    }
  }

  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2]);
    if (
      Number.isInteger(hours) &&
      Number.isInteger(minutes) &&
      Number.isInteger(seconds) &&
      hours >= 0 &&
      minutes >= 0 &&
      minutes < 60 &&
      seconds >= 0 &&
      seconds < 60
    ) {
      return pad2_(hours * 60 + minutes) + ":" + pad2_(seconds);
    }
  }

  return "";
}

function pad2_(value) {
  return String(value).padStart(2, "0");
}

function sheetTimeSerialToDuration_(value) {
  const totalMinutes = Math.round(value * 24 * 60);
  const minutes = Math.floor(totalMinutes / 60);
  const seconds = totalMinutes % 60;
  return pad2_(minutes) + ":" + pad2_(seconds);
}

function output_(result, callback) {
  const json = JSON.stringify(result);
  if (callback) {
    const safeCallback = String(callback).replace(/[^\w.$]/g, "");
    return ContentService.createTextOutput(safeCallback + "(" + json + ");").setMimeType(
      ContentService.MimeType.JAVASCRIPT,
    );
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function ok_(data) {
  return {
    ok: true,
    data: data || {},
  };
}

function fail_(message) {
  return {
    ok: false,
    error: message || "error",
  };
}
