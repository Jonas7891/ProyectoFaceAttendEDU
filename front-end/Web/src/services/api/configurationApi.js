// Configuration (ms-configuration :8087). Configuraciones académicas y de seguridad.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const configurationApi = {
    createAcademic: (b) =>
        request(endpoints.configuration.academic, { method: "POST", body: b }),
    updateAcademic: (id, b) =>
        request(endpoints.configuration.academicById(id), { method: "PUT", body: b }),
    listSecurity: (params) => request(endpoints.configuration.security, { method: "GET", query: params }),
    listSecurityPublic: () => request(endpoints.configuration.securityPublic, { method: "GET" }),
    createSecurity: (b) =>
        request(endpoints.configuration.security, { method: "POST", body: b }),
    updateSecurity: (id, b) =>
        request(endpoints.configuration.securityById(id), { method: "PUT", body: b }),
    schoolConfigurations: (schoolId) =>
        request(endpoints.configuration.schoolConfigurations(schoolId), { method: "GET" }),
};
