// Attendance (ms-attendance :8085). Registros de asistencia y justificaciones.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const attendanceApi = {
    listRecords: (p) => request(endpoints.attendance.records, { method: "GET", query: p }),
    getRecord: (id) => request(endpoints.attendance.recordById(id), { method: "GET" }),
    recordsByActor: (actorId) => request(endpoints.attendance.actorAttendance(actorId), { method: "GET" }),
    recordsBySession: (sessionId) => request(endpoints.attendance.sessionAttendance(sessionId), { method: "GET" }),
    // Spring acepta la lista como query string separada por comas.
    recordsSummary: (actorIds) =>
        request(endpoints.attendance.recordsSummary, {
            method: "GET",
            query: { academicActorIds: actorIds.join(",") },
        }),
    listJustifications: (p) => request(endpoints.attendance.justifications, { method: "GET", query: p }),
    getJustification: (id) => request(endpoints.attendance.justificationById(id), { method: "GET" }),
    createJustification: (b) => request(endpoints.attendance.justifications, { method: "POST", body: b }),
    reviewJustification: (id, b) =>
        request(endpoints.attendance.justificationReview(id), { method: "PATCH", body: b }),
    listJustificationTypes: () => request(endpoints.attendance.justificationTypes, { method: "GET" }),
    justificationDocuments: (id) => request(endpoints.attendance.justificationDocuments(id), { method: "GET" }),
    createSupportingDocument: (b) => request(endpoints.attendance.supportingDocuments, { method: "POST", body: b }),
};
