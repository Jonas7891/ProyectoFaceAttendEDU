// Academic (ms-academic :8083). Escuelas, programas, cohortes, cursos, actores.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

/** @typedef {{ limit?: number, offset?: number }} Page */

export const academicApi = {
    listSchools: (p) => request(endpoints.academic.schools, { method: "GET", query: p }),
    createSchool: (b) => request(endpoints.academic.schools, { method: "POST", body: b }),
    getSchool: (id) => request(endpoints.academic.schoolById(id), { method: "GET" }),
    updateSchool: (id, b) => request(endpoints.academic.schoolById(id), { method: "PUT", body: b }),
    updateSchoolStatus: (id, status) =>
        request(endpoints.academic.schoolStatus(id), { method: "PATCH", body: { status } }),
    deleteSchool: (id) => request(endpoints.academic.schoolById(id), { method: "DELETE" }),
    listPrograms: (p) => request(endpoints.academic.programs, { method: "GET", query: p }),
    listSchoolPrograms: (schoolId) =>
        request(endpoints.academic.schoolPrograms(schoolId), { method: "GET" }),
    createProgram: (b) => request(endpoints.academic.programs, { method: "POST", body: b }),
    updateProgram: (id, b) => request(endpoints.academic.programById(id), { method: "PUT", body: b }),
    deleteProgram: (id) => request(endpoints.academic.programById(id), { method: "DELETE" }),
    listPeriods: (p) => request(endpoints.academic.periods, { method: "GET", query: p }),
    listSchoolPeriods: (schoolId) =>
        request(endpoints.academic.schoolPeriods(schoolId), { method: "GET" }),
    createPeriod: (b) => request(endpoints.academic.periods, { method: "POST", body: b }),
    updatePeriod: (id, b) => request(endpoints.academic.periodById(id), { method: "PUT", body: b }),
    deletePeriod: (id) => request(endpoints.academic.periodById(id), { method: "DELETE" }),
    createCohort: (b) => request(endpoints.academic.cohorts, { method: "POST", body: b }),
    updateCohort: (id, b) => request(endpoints.academic.cohortById(id), { method: "PUT", body: b }),
    deleteCohort: (id) => request(endpoints.academic.cohortById(id), { method: "DELETE" }),
    createCourse: (b) => request(endpoints.academic.courses, { method: "POST", body: b }),
    updateCourse: (id, b) => request(endpoints.academic.courseById(id), { method: "PUT", body: b }),
    deleteCourse: (id) => request(endpoints.academic.courseById(id), { method: "DELETE" }),
    setActorStatus: (id, status) =>
        request(endpoints.academic.actorStatus(id), { method: "PATCH", body: { status } }),
    deleteActor: (id) => request(endpoints.academic.actorById(id), { method: "DELETE" }),
    cohortEnrollments: (cohortId) =>
        request(endpoints.academic.cohortEnrollments(cohortId), { method: "GET" }),
    createEnrollment: (b) => request(endpoints.academic.enrollments, { method: "POST", body: b }),
    updateEnrollmentStatus: (id, status) =>
        request(endpoints.academic.enrollmentStatus(id), {
            method: "PATCH",
            body: { enrollmentStatus: status },
        }),
    deleteEnrollment: (id) => request(endpoints.academic.enrollmentById(id), { method: "DELETE" }),
};
