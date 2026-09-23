// Scheduling (ms-scheduling :8087). Ambientes, bloques y sesiones de clase.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const schedulingApi = {
    listEnvironments: () => request<unknown[]>(endpoints.scheduling.environments, { method: "GET" }),
    createEnvironment: (b: Record<string, unknown>) => request<unknown>(endpoints.scheduling.environments, { method: "POST", body: b }),
    updateEnvironment: (id: string | number, b: Record<string, unknown>) =>
        request<unknown>(endpoints.scheduling.environmentById(id), { method: "PUT", body: b }),
    deleteEnvironment: (id: string | number) =>
        request<void>(endpoints.scheduling.environmentById(id), { method: "DELETE" }),
    listBlocks: () => request<unknown[]>(endpoints.scheduling.blocks, { method: "GET" }),
    createBlock: (b: Record<string, unknown>) => request<unknown>(endpoints.scheduling.blocks, { method: "POST", body: b }),
    listSessions: () => request<unknown[]>(endpoints.scheduling.sessions, { method: "GET" }),
    createSession: (b: Record<string, unknown>) => request<unknown>(endpoints.scheduling.sessions, { method: "POST", body: b }),
    openSession: (id: string | number) => request<unknown>(endpoints.scheduling.sessionOpen(id), { method: "POST" }),
    closeSession: (id: string | number) => request<unknown>(endpoints.scheduling.sessionClose(id), { method: "POST" }),
    cancelSession: (id: string | number) => request<unknown>(endpoints.scheduling.sessionCancel(id), { method: "POST" }),
};
