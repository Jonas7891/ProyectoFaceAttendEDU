// Attendance (ms-attendance :8085). Asistencias, justificaciones, tipos.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const attendanceApi = {
    listRecords: (p?: { limit?: number; offset?: number }) =>
        request<unknown[]>(endpoints.attendance.records, { method: "GET", query: p }),
    createRecord: (b: Record<string, unknown>) =>
        request<unknown>(endpoints.attendance.records, { method: "POST", body: b }),
    bulkRecords: (items: Record<string, unknown>[]) =>
        request<unknown>(endpoints.attendance.recordsBulk, { method: "POST", body: items }),
    sessionAttendance: (sessionId: string | number) =>
        request<unknown[]>(endpoints.attendance.sessionAttendance(sessionId), { method: "GET" }),
    listJustifications: () => request<unknown[]>(endpoints.attendance.justifications, { method: "GET" }),
    createJustification: (b: Record<string, unknown>) =>
        request<unknown>(endpoints.attendance.justifications, { method: "POST", body: b }),
    reviewJustification: (id: string | number, b: Record<string, unknown>) =>
        request<unknown>(endpoints.attendance.justificationReview(id), { method: "PATCH", body: b }),
    listJustificationTypes: () => request<unknown[]>(endpoints.attendance.justificationTypes, { method: "GET" }),
};
