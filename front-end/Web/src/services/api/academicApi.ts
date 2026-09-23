// Academic (ms-academic :8084). Escuelas, programas, cohortes, cursos, actores.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

export interface Page { limit?: number; offset?: number; }

export const academicApi = {
    listSchools: (p?: Page) => request<unknown[]>(endpoints.academic.schools, { method: "GET", query: p }),
    createSchool: (b: Record<string, unknown>) => request<unknown>(endpoints.academic.schools, { method: "POST", body: b }),
    getSchool: (id: string | number) => request<unknown>(endpoints.academic.schoolById(id), { method: "GET" }),
    updateSchool: (id: string | number, b: Record<string, unknown>) => request<unknown>(endpoints.academic.schoolById(id), { method: "PUT", body: b }),
    deleteSchool: (id: string | number) => request<void>(endpoints.academic.schoolById(id), { method: "DELETE" }),
    listPrograms: (p?: Page) => request<unknown[]>(endpoints.academic.programs, { method: "GET", query: p }),
    createProgram: (b: Record<string, unknown>) => request<unknown>(endpoints.academic.programs, { method: "POST", body: b }),
    listPeriods: (p?: Page) => request<unknown[]>(endpoints.academic.periods, { method: "GET", query: p }),
    listCohorts: (p?: Page) => request<unknown[]>(endpoints.academic.cohorts, { method: "GET", query: p }),
    listCourses: (p?: Page) => request<unknown[]>(endpoints.academic.courses, { method: "GET", query: p }),
    createCourse: (b: Record<string, unknown>) => request<unknown>(endpoints.academic.courses, { method: "POST", body: b }),
    listActorTypes: () => request<unknown[]>(endpoints.academic.actorTypes, { method: "GET" }),
    listActors: (p?: Page) => request<unknown[]>(endpoints.academic.actors, { method: "GET", query: p }),
    createActor: (b: Record<string, unknown>) => request<unknown>(endpoints.academic.actors, { method: "POST", body: b }),
    listEnrollments: (p?: Page) => request<unknown[]>(endpoints.academic.enrollments, { method: "GET", query: p }),
    createEnrollment: (b: Record<string, unknown>) => request<unknown>(endpoints.academic.enrollments, { method: "POST", body: b }),
};
