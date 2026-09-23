// Identity (ms-identity :8081 vía gateway). Login/logout/personas/usuarios.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export interface LoginPayload { username: string; password: string; }
export interface SessionDto {
    sessionId?: string; id?: string; userId?: string; username?: string;
    token?: string; [k: string]: unknown;
}

export const authApi = {
    login: (p: LoginPayload) =>
        request<SessionDto>(endpoints.identity.login, { method: "POST", body: p }),
    logout: (sessionId: string) =>
        request<void>(endpoints.identity.logout, { method: "POST", query: { sessionId } }),
    me: (username: string) =>
        request<Record<string, string>>(endpoints.identity.me, { method: "GET", query: { username } }),
    listPersons: (params?: { limit?: number; offset?: number }) =>
        request<unknown[]>(endpoints.identity.persons, { method: "GET", query: params }),
    listUsers: (params?: { limit?: number; offset?: number }) =>
        request<unknown[]>(endpoints.identity.users, { method: "GET", query: params }),
    listCities: (params?: { limit?: number; offset?: number }) =>
        request<unknown[]>(endpoints.identity.cities, { method: "GET", query: params }),
    createCity: (body: Record<string, unknown>) =>
        request<unknown>(endpoints.identity.cities, { method: "POST", body }),
};
