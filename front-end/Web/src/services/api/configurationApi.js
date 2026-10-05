// Configuration (ms-configuration :8087). Configs + casos biométricos.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const configurationApi = {
    listAcademic: () => request(endpoints.configuration.academic, { method: "GET" }),
    createAcademic: (b) =>
        request(endpoints.configuration.academic, { method: "POST", body: b }),
    listSecurity: () => request(endpoints.configuration.security, { method: "GET" }),
    createSecurity: (b) =>
        request(endpoints.configuration.security, { method: "POST", body: b }),
    listBiometricCases: (status) =>
        request(endpoints.configuration.biometricCases, { method: "GET", query: status ? { status } : undefined }),
    createBiometricCase: (b) =>
        request(endpoints.configuration.biometricCases, { method: "POST", body: b }),
    reviewBiometricCase: (id, b) =>
        request(endpoints.configuration.biometricCaseReview(id), { method: "PATCH", body: b }),
    schoolConfigurations: (schoolId) =>
        request(endpoints.configuration.schoolConfigurations(schoolId), { method: "GET" }),
};
