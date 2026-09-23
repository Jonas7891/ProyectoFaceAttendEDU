// ============================================================
//  FaceAttend EDU — Catálogo canónico de endpoints del backend
//
//  Fuente de verdad para el frontend. Rutas verificadas contra:
//  - back-end/01..09 controllers/routers (Java/Fastify/FastAPI/Go)
//  - back-end/99-api-gateway/kong/kong.yml (prefijo /api/v1)
//  Todas las rutas se consumen a través del gateway Kong :8080.
// ============================================================

export const API_V1 = "/api/v1";

export const endpoints = {
    health: "/health",
    identity: {
        login: `${API_V1}/auth/login`,
        logout: `${API_V1}/auth/logout`,
        me: `${API_V1}/auth/me`,
        persons: `${API_V1}/persons`,
        personById: (id: string | number) => `${API_V1}/persons/${id}`,
        personStatus: (id: string | number) => `${API_V1}/persons/${id}/status`,
        users: `${API_V1}/users`,
        userById: (id: string | number) => `${API_V1}/users/${id}`,
        userActivate: (id: string | number) => `${API_V1}/users/${id}/activate`,
        userStatus: (id: string | number) => `${API_V1}/users/${id}/status`,
        sessions: `${API_V1}/sessions`,
        sessionById: (id: string | number) => `${API_V1}/sessions/${id}`,
        sessionsByUser: (userId: string | number) => `${API_V1}/sessions/user/${userId}`,
        cities: `${API_V1}/cities`,
        cityById: (id: string | number) => `${API_V1}/cities/${id}`,
        passwordPolicies: `${API_V1}/password-policies`,
        passwordPolicyById: (id: string | number) => `${API_V1}/password-policies/${id}`,
    },
    authorization: {
        roles: `${API_V1}/roles`,
        roleById: (id: string | number) => `${API_V1}/roles/${id}`,
        rolePermissions: (roleId: string | number) => `${API_V1}/roles/${roleId}/permissions`,
        rolePermission: (roleId: string | number, permId: string | number) =>
            `${API_V1}/roles/${roleId}/permissions/${permId}`,
        permissions: `${API_V1}/permissions`,
        permissionById: (id: string | number) => `${API_V1}/permissions/${id}`,
        userRoles: (userId: string | number) => `${API_V1}/users/${userId}/roles`,
        userRole: (userId: string | number, roleId: string | number) =>
            `${API_V1}/users/${userId}/roles/${roleId}`,
        evaluate: `${API_V1}/auth/evaluate`,
    },
    academic: {
        schools: `${API_V1}/schools`,
        schoolById: (id: string | number) => `${API_V1}/schools/${id}`,
        schoolStatus: (id: string | number) => `${API_V1}/schools/${id}/status`,
        schoolPrograms: (schoolId: string | number) => `${API_V1}/schools/${schoolId}/programs`,
        schoolPeriods: (schoolId: string | number) => `${API_V1}/schools/${schoolId}/periods`,
        schoolActors: (schoolId: string | number) => `${API_V1}/schools/${schoolId}/actors`,
        programs: `${API_V1}/programs`,
        programById: (id: string | number) => `${API_V1}/programs/${id}`,
        programCohorts: (programId: string | number) => `${API_V1}/programs/${programId}/cohorts`,
        programCourses: (programId: string | number) => `${API_V1}/programs/${programId}/courses`,
        periods: `${API_V1}/academic-periods`,
        periodById: (id: string | number) => `${API_V1}/academic-periods/${id}`,
        cohorts: `${API_V1}/cohorts`,
        cohortById: (id: string | number) => `${API_V1}/cohorts/${id}`,
        cohortEnrollments: (cohortId: string | number) =>
            `${API_V1}/cohorts/${cohortId}/enrollments`,
        courses: `${API_V1}/courses`,
        courseById: (id: string | number) => `${API_V1}/courses/${id}`,
        actorTypes: `${API_V1}/actor-types`,
        actorTypeById: (id: string | number) => `${API_V1}/actor-types/${id}`,
        actors: `${API_V1}/academic-actors`,
        actorById: (id: string | number) => `${API_V1}/academic-actors/${id}`,
        actorStatus: (id: string | number) => `${API_V1}/academic-actors/${id}/status`,
        actorEnrollments: (actorId: string | number) =>
            `${API_V1}/academic-actors/${actorId}/enrollments`,
        enrollments: `${API_V1}/enrollments`,
        enrollmentById: (id: string | number) => `${API_V1}/enrollments/${id}`,
        enrollmentStatus: (id: string | number) => `${API_V1}/enrollments/${id}/status`,
    },
    scheduling: {
        environments: `${API_V1}/environments`,
        environmentById: (id: string | number) => `${API_V1}/environments/${id}`,
        blocks: `${API_V1}/schedule-blocks`,
        blockById: (id: string | number) => `${API_V1}/schedule-blocks/${id}`,
        sessions: `${API_V1}/class-sessions`,
        sessionById: (id: string | number) => `${API_V1}/class-sessions/${id}`,
        sessionOpen: (id: string | number) => `${API_V1}/class-sessions/${id}/open`,
        sessionClose: (id: string | number) => `${API_V1}/class-sessions/${id}/close`,
        sessionCancel: (id: string | number) => `${API_V1}/class-sessions/${id}/cancel`,
        cohortBlocks: (id: string | number) => `${API_V1}/cohorts/${id}/blocks`,
        environmentBlocks: (id: string | number) => `${API_V1}/environments/${id}/blocks`,
        actorBlocks: (id: string | number) => `${API_V1}/actors/${id}/blocks`,
        blockSessions: (id: string | number) => `${API_V1}/blocks/${id}/sessions`,
    },
    attendance: {
        records: `${API_V1}/attendance-records`,
        recordById: (id: string | number) => `${API_V1}/attendance-records/${id}`,
        recordsBulk: `${API_V1}/attendance-records/bulk`,
        justifications: `${API_V1}/justifications`,
        justificationById: (id: string | number) => `${API_V1}/justifications/${id}`,
        justificationReview: (id: string | number) => `${API_V1}/justifications/${id}/review`,
        justificationTypes: `${API_V1}/justification-types`,
        justificationTypeById: (id: string | number) =>
            `${API_V1}/justification-types/${id}`,
        supportingDocuments: `${API_V1}/supporting-documents`,
        supportingDocumentById: (id: string | number) =>
            `${API_V1}/supporting-documents/${id}`,
        sessionAttendance: (id: string | number) =>
            `${API_V1}/class-sessions/${id}/attendance`,
        actorAttendance: (actorId: string | number) =>
            `${API_V1}/academic-actors/${actorId}/attendance`,
        attendanceJustification: (id: string | number) =>
            `${API_V1}/attendance/${id}/justification`,
        justificationDocuments: (id: string | number) =>
            `${API_V1}/justifications/${id}/documents`,
    },
    biometric: {
        facialEnroll: `${API_V1}/biometric/facial/enroll`,
        facialVerify: `${API_V1}/biometric/facial/verify`,
        facialIdentify: `${API_V1}/biometric/facial/identify`,
        facialByPerson: (personId: string) => `${API_V1}/biometric/facial/${personId}`,
        facialHistory: (personId: string) =>
            `${API_V1}/biometric/facial/${personId}/history`,
        fingerprintEnroll: `${API_V1}/biometric/fingerprint/enroll`,
        fingerprintVerify: `${API_V1}/biometric/fingerprint/verify`,
        fingerprintIdentify: `${API_V1}/biometric/fingerprint/identify`,
        fingerprintsByPerson: (personId: string) =>
            `${API_V1}/biometric/fingerprint/${personId}`,
        updateRequest: `${API_V1}/biometric/update-request`,
        updateRequestsByPerson: (personId: string) =>
            `${API_V1}/biometric/update-requests/${personId}`,
        reviewUpdateRequest: (requestId: string) =>
            `${API_V1}/biometric/update-request/${requestId}/review`,
    },
    configuration: {
        academic: `${API_V1}/configurations/academic`,
        academicById: (id: string | number) => `${API_V1}/configurations/academic/${id}`,
        security: `${API_V1}/configurations/security`,
        securityById: (id: string | number) => `${API_V1}/configurations/security/${id}`,
        schoolConfigurations: (schoolId: string | number) =>
            `${API_V1}/schools/${schoolId}/configurations`,
        biometricCases: `${API_V1}/biometric-update-cases`,
        biometricCaseById: (id: string | number) =>
            `${API_V1}/biometric-update-cases/${id}`,
        biometricCaseReview: (id: string | number) =>
            `${API_V1}/biometric-update-cases/${id}/review`,
        personBiometricCases: (personId: string) =>
            `${API_V1}/persons/${personId}/biometric-cases`,
    },
    notification: {
        alerts: `${API_V1}/alerts`,
        alertById: (id: string | number) => `${API_V1}/alerts/${id}`,
        alertResolve: (id: string | number) => `${API_V1}/alerts/${id}/resolve`,
        alertTypes: `${API_V1}/alert-types`,
        alertTypeById: (id: string | number) => `${API_V1}/alert-types/${id}`,
    },
    quality: {
        characteristics: `${API_V1}/quality/characteristics`,
        evaluations: `${API_V1}/quality/evaluations`,
        evaluationById: (id: string | number) => `${API_V1}/quality/evaluations/${id}`,
        serviceSummary: (service: string) =>
            `${API_V1}/quality/services/${encodeURIComponent(service)}/summary`,
        processProfile: `${API_V1}/quality/process/profile`,
        projects: `${API_V1}/quality/projects`,
        projectById: (id: string | number) => `${API_V1}/quality/projects/${id}`,
        projectSummary: (id: string | number) =>
            `${API_V1}/quality/projects/${id}/summary`,
        assessments: `${API_V1}/quality/assessments`,
        assessmentById: (id: string | number) =>
            `${API_V1}/quality/assessments/${id}`,
        istqbCategories: `${API_V1}/quality/istqb/categories`,
        istqbAssessments: `${API_V1}/quality/istqb/assessments`,
        istqbAssessmentById: (id: string | number) =>
            `${API_V1}/quality/istqb/assessments/${id}`,
        istqbServiceSummary: (service: string) =>
            `${API_V1}/quality/istqb/services/${encodeURIComponent(service)}/summary`,
    },
} as const;
