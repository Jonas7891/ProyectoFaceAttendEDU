// Scheduling (ms-scheduling :8084). Ambientes, bloques y sesiones de clase.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const schedulingApi = {
    listEnvironments: () => request(endpoints.scheduling.environments, { method: "GET" }),
    createEnvironment: (b) => request(endpoints.scheduling.environments, { method: "POST", body: b }),
    updateEnvironment: (id, b) =>
        request(endpoints.scheduling.environmentById(id), { method: "PUT", body: b }),
    deleteEnvironment: (id) =>
        request(endpoints.scheduling.environmentById(id), { method: "DELETE" }),
    listBlocks: () => request(endpoints.scheduling.blocks, { method: "GET" }),
    createBlock: (b) => request(endpoints.scheduling.blocks, { method: "POST", body: b }),
    listSessions: () => request(endpoints.scheduling.sessions, { method: "GET" }),
    createSession: (b) => request(endpoints.scheduling.sessions, { method: "POST", body: b }),
    openSession: (id) => request(endpoints.scheduling.sessionOpen(id), { method: "POST" }),
    closeSession: (id) => request(endpoints.scheduling.sessionClose(id), { method: "POST" }),
    cancelSession: (id) => request(endpoints.scheduling.sessionCancel(id), { method: "POST" }),
};
