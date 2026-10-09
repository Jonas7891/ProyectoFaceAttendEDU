// Academic (ms-academic :8083). Escuelas, programas, cohortes, cursos, actores.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

/** @typedef {{ limit?: number, offset?: number }} Page */

export const academicApi = {
    listSchools: (p) => request(endpoints.academic.schools, { method: "GET", query: p }),
    createSchool: (b) => request(endpoints.academic.schools, { method: "POST", body: b }),
    getSchool: (id) => request(endpoints.academic.schoolById(id), { method: "GET" }),
    updateSchool: (id, b) => request(endpoints.academic.schoolById(id), { method: "PUT", body: b }),
    deleteSchool: (id) => request(endpoints.academic.schoolById(id), { method: "DELETE" }),
    listPrograms: (p) => request(endpoints.academic.programs, { method: "GET", query: p }),
    createProgram: (b) => request(endpoints.academic.programs, { method: "POST", body: b }),
    listPeriods: (p) => request(endpoints.academic.periods, { method: "GET", query: p }),
    listSchoolPeriods: (schoolId) =>
        request(endpoints.academic.schoolPeriods(schoolId), { method: "GET" }),
    listCohorts: (p) => request(endpoints.academic.cohorts, { method: "GET", query: p }),
    listCourses: (p) => request(endpoints.academic.courses, { method: "GET", query: p }),
    createCourse: (b) => request(endpoints.academic.courses, { method: "POST", body: b }),
    listActorTypes: () => request(endpoints.academic.actorTypes, { method: "GET" }),
    listActors: (p) => request(endpoints.academic.actors, { method: "GET", query: p }),
    createActor: (b) => request(endpoints.academic.actors, { method: "POST", body: b }),
    listEnrollments: (p) => request(endpoints.academic.enrollments, { method: "GET", query: p }),
    createEnrollment: (b) => request(endpoints.academic.enrollments, { method: "POST", body: b }),
};
