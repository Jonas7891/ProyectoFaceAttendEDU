// Authorization (ms-authorization :8082). Roles, permisos, asignación.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const authorizationApi = {
    listRoles: () => request(endpoints.authorization.roles, { method: "GET" }),
    createRole: (b) => request(endpoints.authorization.roles, { method: "POST", body: b }),
    getRole: (id) => request(endpoints.authorization.roleById(id), { method: "GET" }),
    listPermissions: () => request(endpoints.authorization.permissions, { method: "GET" }),
    createPermission: (b) => request(endpoints.authorization.permissions, { method: "POST", body: b }),
    userRoles: (userId) => request(endpoints.authorization.userRoles(userId), { method: "GET" }),
    assignRole: (userId, roleId) =>
        request(endpoints.authorization.userRoles(userId), { method: "POST", body: { roleId } }),
    evaluate: (params) =>
        request(endpoints.authorization.evaluate, { method: "GET", query: params }),
};
