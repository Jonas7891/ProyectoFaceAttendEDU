// Notification (ms-notification :8090). Alertas y tipos de alerta.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const notificationApi = {
    listAlerts: (params?: { status?: string; limit?: number; offset?: number }) =>
        request<{ alerts: unknown[] }>(endpoints.notification.alerts, { method: "GET", query: params }),
    createAlert: (b: Record<string, unknown>) =>
        request<{ alert_id: number }>(endpoints.notification.alerts, { method: "POST", body: b }),
    resolveAlert: (id: string | number) =>
        request<unknown>(endpoints.notification.alertResolve(id), { method: "PATCH" }),
    deleteAlert: (id: string | number) =>
        request<void>(endpoints.notification.alertById(id), { method: "DELETE" }),
    listAlertTypes: () =>
        request<{ alert_types: unknown[] }>(endpoints.notification.alertTypes, { method: "GET" }),
    createAlertType: (b: Record<string, unknown>) =>
        request<unknown>(endpoints.notification.alertTypes, { method: "POST", body: b }),
};
