// Configuration (ms-configuration :8089). Configs + casos biométricos.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const configurationApi = {
    listAcademic: () => request<unknown[]>(endpoints.configuration.academic, { method: "GET" }),
    createAcademic: (b: Record<string, unknown>) =>
        request<unknown>(endpoints.configuration.academic, { method: "POST", body: b }),
    listSecurity: () => request<unknown[]>(endpoints.configuration.security, { method: "GET" }),
    createSecurity: (b: Record<string, unknown>) =>
        request<unknown>(endpoints.configuration.security, { method: "POST", body: b }),
    listBiometricCases: (status?: string) =>
        request<unknown[]>(endpoints.configuration.biometricCases, { method: "GET", query: status ? { status } : undefined }),
    createBiometricCase: (b: Record<string, unknown>) =>
        request<unknown>(endpoints.configuration.biometricCases, { method: "POST", body: b }),
    reviewBiometricCase: (id: string | number, b: Record<string, unknown>) =>
        request<unknown>(endpoints.configuration.biometricCaseReview(id), { method: "PATCH", body: b }),
    schoolConfigurations: (schoolId: string | number) =>
        request<unknown[]>(endpoints.configuration.schoolConfigurations(schoolId), { method: "GET" }),
};
