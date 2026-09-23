// Quality (ms-quality :8091). Evaluaciones ISO25010/29110/ISTQB.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export const qualityApi = {
    characteristics: () => request<unknown>(endpoints.quality.characteristics, { method: "GET" }),
    listEvaluations: (params?: { service?: string; status?: string }) =>
        request<{ data: unknown[]; total: number }>(endpoints.quality.evaluations, { method: "GET", query: params }),
    serviceSummary: (service: string) =>
        request<unknown>(endpoints.quality.serviceSummary(service), { method: "GET" }),
    processProfile: () => request<unknown>(endpoints.quality.processProfile, { method: "GET" }),
    listProjects: () => request<{ data: unknown[]; total: number }>(endpoints.quality.projects, { method: "GET" }),
    istqbCategories: () => request<unknown>(endpoints.quality.istqbCategories, { method: "GET" }),
    health: () => request<unknown>("/health", { method: "GET" }),
};
