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
