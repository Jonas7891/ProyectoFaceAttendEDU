// Authorization (ms-authorization :8083). Roles, permisos, asignación.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const authorizationApi = {
    listRoles: () => request<unknown[]>(endpoints.authorization.roles, { method: "GET" }),
    createRole: (b: Record<string, unknown>) => request<unknown>(endpoints.authorization.roles, { method: "POST", body: b }),
    getRole: (id: string | number) => request<unknown>(endpoints.authorization.roleById(id), { method: "GET" }),
    listPermissions: () => request<unknown[]>(endpoints.authorization.permissions, { method: "GET" }),
    createPermission: (b: Record<string, unknown>) => request<unknown>(endpoints.authorization.permissions, { method: "POST", body: b }),
    userRoles: (userId: string | number) => request<unknown>(endpoints.authorization.userRoles(userId), { method: "GET" }),
    assignRole: (userId: string | number, roleId: string | number) =>
        request<unknown>(endpoints.authorization.userRoles(userId), { method: "POST", body: { roleId } }),
    evaluate: (params: Record<string, string>) =>
        request<unknown>(endpoints.authorization.evaluate, { method: "GET", query: params }),
};
