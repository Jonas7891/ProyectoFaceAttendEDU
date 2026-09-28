// Authorization (ms-authorization :8083 directo, sin JWT de Kong).
// Igual que Mobile: el gateway exige JWT que el login por sesión no emite.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";
import { getAuthzBaseUrl } from "../../config/env";

const direct = { baseUrl: getAuthzBaseUrl() };

export const authorizationApi = {
    listRoles: () => request<unknown[]>(endpoints.authorization.roles, { method: "GET" }),
    createRole: (b: Record<string, unknown>) => request<unknown>(endpoints.authorization.roles, { method: "POST", body: b }),
    getRole: (id: string | number) => request<unknown>(endpoints.authorization.roleById(id), { method: "GET" }),
    listPermissions: () => request<unknown[]>(endpoints.authorization.permissions, { method: "GET" }),
    createPermission: (b: Record<string, unknown>) => request<unknown>(endpoints.authorization.permissions, { method: "POST", body: b }),
    userRoles: (userId: string | number) => request<unknown>(endpoints.authorization.userRoles(userId), { method: "GET", ...direct }),
    assignRole: (userId: string | number, roleId: string | number) =>
        request<unknown>(endpoints.authorization.userRoles(userId), { method: "POST", body: { roleId } }),
    evaluate: (params: Record<string, string>) =>
        request<unknown>(endpoints.authorization.evaluate, { method: "GET", query: params, ...direct }),
};
