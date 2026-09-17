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
    const action = params.action || "bootstrap";

    if (action === "setup") {
      ensureSheets_();
      ensureStudentIds_();
      return ok_({ message: "ready" });
    }
    if (action === "bootstrap") return ok_({ students: listStudents_() });
    if (action === "schools") return ok_(getSchoolSummaries_());
    if (action === "grades") return ok_(getGrades_(params.year, params.school));
    if (action === "students") return ok_(getStudentsByScope_(params.year, params.school, params.grade));
    if (action === "studentRecords") {
      return ok_(getStudentRecords_(params.year, params.school, params.grade, params.studentId));
    }
    if (action === "records") {
      return ok_({ records: getStudentRecords_(params.year, params.school, params.grade, params.studentId).records });
    }
    if (action === "saveRecord") {
      return ok_({ record: saveRecord_(parsePayload_(params.payload)) });
    }
    if (action === "clearRecord") {
      const cleared = clearRecord_(params.year, params.school, params.grade, params.studentId, params.entryId);
      return ok_({ cleared: true, records: cleared.records, version: cleared.version, updatedAt: cleared.updatedAt });
    }

    return fail_("unknown action");
  } catch (error) {
    return fail_(error.message || String(error));
  }
}
