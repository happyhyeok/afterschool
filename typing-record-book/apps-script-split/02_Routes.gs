function doGet(event) {
  const params = event.parameter || {};
  const result = handleRequest_(params);
  return output_(result, params.callback);
}

function doPost(event) {
  const params = event.parameter || {};
  const body = event.postData && event.postData.contents ? JSON.parse(event.postData.contents) : {};
  const result = handleRequest_(Object.assign({}, params, body));
  return output_(result);
}

function handleRequest_(params) {
  try {
    ensureSheets_();
    const action = params.action || "bootstrap";

    if (action === "setup") return ok_({ message: "ready" });
    if (action === "bootstrap") return ok_({ students: listStudents_() });
    if (action === "records") {
      return ok_({ records: listRecords_(params.year, params.school, params.grade, params.studentId) });
    }
    if (action === "saveRecord") {
      return ok_({ record: saveRecord_(parsePayload_(params.payload)) });
    }
    if (action === "clearRecord") {
      clearRecord_(params.year, params.school, params.grade, params.studentId, params.entryId);
      return ok_({ cleared: true });
    }

    return fail_("unknown action");
  } catch (error) {
    return fail_(error.message || String(error));
  }
}
