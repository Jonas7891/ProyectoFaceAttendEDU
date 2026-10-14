// ============================================================
//  FaceAttend EDU — Staff provisioning (teacher/admin registration)
//
//  Cadena de alta verificada contra el backend:
//  1. POST /api/v1/persons          (PersonDto, camelCase)
//  2. POST /api/v1/users            (CreateUserRequest: personId, username, password)
//  3. POST /api/v1/users/{id}/roles ({roleId}, resuelto por nombre)
//  4. Solo docentes: POST /api/v1/academic-actors (actorTypeId 2 = INSTRUCTOR)
//     Solo admins:    POST /api/v1/academic-actors (actorTypeId 3 = ADMIN,
//                     vínculo admin→sede para acotar su sesión)
//
//  Los admins no llevan academic_actor: la identidad es agnóstica de
//  sede (AGENTS.md §2.6) y el actor solo existe para STUDENT/INSTRUCTOR.
// ============================================================

import { authApi } from "./authApi";
import { academicApi } from "./academicApi";
import { authorizationApi } from "./authorizationApi";
import { listBlocks, listCohorts, listCourses, listPrograms } from "./referenceData";

// Nombres de rol aceptados (ES actuales + legados EN): los IDs
// autoincrementales dependen del seed, nunca se hardcodean.
const ROLE_ALIASES = {
    admin: new Set(["administrador", "super administrador", "super_admin", "school_admin"]),
    teacher: new Set(["instructor"]),
    student: new Set(["aprendiz", "student"]),
};

function normalizeRoleName(name) {
    return String(name ?? "")
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");
}

function resolveRoleId(roles, kind) {
    const list = Array.isArray(roles) ? roles : roles?.content ?? [];
    const aliases = ROLE_ALIASES[kind] ?? new Set();
    const found = list.find((r) =>
        aliases.has(normalizeRoleName(r?.roleName ?? r?.role_name))
    );
    return found?.roleId ?? found?.role_id ?? null;
}

function splitName(fullName) {
    const parts = String(fullName ?? "").trim().split(/\s+/).filter(Boolean);
    return {
        name: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") || parts[0] || "",
    };
}

function usernameFromEmail(email) {
    const prefix = String(email ?? "").split("@")[0] ?? "";
    return prefix.toLowerCase().trim();
}

/**
 * Fichas vigentes que imparten un curso (por código), con su sede.
 * Vacío si el curso no existe en el backend.
 */
export async function cohortsForCourseCode(courseCode) {
    const courses = await listCourses();
    const course = (Array.isArray(courses) ? courses : []).find((c) => c?.code === courseCode);
    const courseId = course?.courseId ?? course?.course_id ?? null;
    if (courseId == null) return [];
    const [blocks, cohorts, programs] = await Promise.all([
        listBlocks().catch(() => []),
        listCohorts().catch(() => []),
        listPrograms().catch(() => []),
    ]);
    const cohortIds = new Set(
        (Array.isArray(blocks) ? blocks : [])
            .filter((b) => (b?.courseId ?? b?.course_id) === courseId)
            .map((b) => b?.cohortId ?? b?.cohort_id)
            .filter((id) => id != null)
    );
    const programById = new Map(
        (Array.isArray(programs) ? programs : []).map((p) => [
            p?.programId ?? p?.program_id,
            p,
        ])
    );
    return (Array.isArray(cohorts) ? cohorts : [])
        .filter((c) => {
            const id = c?.cohortId ?? c?.cohort_id ?? null;
            return id != null && cohortIds.has(id) && c?.status !== false;
        })
        .map((c) => {
            const cohortId = c?.cohortId ?? c?.cohort_id ?? null;
            const programId = c?.programId ?? c?.program_id ?? null;
            const program = programId != null ? programById.get(programId) : null;
            return {
                cohortId,
                code: c?.code ?? "",
                schoolId: program?.schoolId ?? program?.school_id ?? null,
            };
        })
        .filter((c) => c.cohortId != null);
}

async function resolveSchoolId(explicit) {
    const parsed = explicit != null && String(explicit).trim() !== "" ? Number(explicit) : null;
    if (parsed != null && Number.isInteger(parsed)) return parsed;
    if (explicit != null && String(explicit).trim() !== "") {
        throw new Error("Invalid school");
    }
    const schools = await academicApi.listSchools();
    const list = Array.isArray(schools) ? schools : schools?.content ?? [];
    if (list.length !== 1) throw new Error("No school available for the staff record");
    const id = list[0]?.schoolId ?? list[0]?.school_id ?? null;
    if (id == null) throw new Error("No school available for the staff record");
    return id;
}

/**
 * Crea persona + actor + usuario + rol (en ese orden para poder
 * compensar: el actor se crea antes que el usuario porque el usuario
 * no tiene endpoint de borrado).
 * Si algo falla tras crear la persona, se intenta borrar el actor y
 * la persona para no dejar huérfanos en identity/academic.
 */
export async function provisionStaff({
    name,
    code,
    email,
    documentNumber,
    password,
    role,
    schoolId = null,
}) {
    const { name: firstName, lastName } = splitName(name);
    const person = await authApi.createPerson({
        documentNumber: String(documentNumber).trim(),
        name: firstName,
        lastName,
        email: String(email).trim().toLowerCase(),
        status: true,
    });
    const personId = person?.personId ?? person?.person_id ?? null;
    if (!personId) throw new Error("Person creation returned no id");

    let actorId = null;
    try {
        if (role === "teacher" || role === "admin") {
            // INSTRUCTOR en docentes, ADMIN vinculado a sede en admins:
            // la sesión queda acotada a la sede elegida en vez de global.
            const targetSchoolId = await resolveSchoolId(schoolId);
            const actor = await academicApi.createActor({
                personId,
                actorTypeId: role === "teacher" ? 2 : 3,
                schoolId: targetSchoolId,
                actorCode: String(code).trim(),
                startedOn: new Date().toISOString().slice(0, 10),
                status: true,
            });
            actorId = actor?.academicActorId ?? actor?.academic_actor_id ?? null;
        }

        const user = await authApi.createUser({
            personId,
            username: usernameFromEmail(email),
            password,
            authenticationType: "Local",
        });
        const userId = user?.userId ?? user?.user_id ?? null;
        if (!userId) throw new Error("User creation returned no id");

        const roles = await authorizationApi.listRoles();
        const roleId = resolveRoleId(roles, role);
        if (roleId != null) {
            await authorizationApi.assignRole(userId, roleId);
        }

        return { personId, userId };
    } catch (err) {
        try {
            if (actorId != null) await academicApi.deleteActor(actorId);
        } catch {
            // La compensación es best-effort: se propaga el error original.
        }
        try {
            await authApi.deletePerson(personId);
        } catch {
            // La compensación es best-effort: se propaga el error original.
        }
        throw err;
    }
}

function enrollmentIdOf(response) {
    return response?.enrollmentId ?? response?.enrollment_id ?? response?.id ?? null;
}

/**
 * Crea estudiante completo: persona + actor STUDENT + matrícula +
 * usuario + rol. Orden compensable (matrícula, actor y persona tienen
 * DELETE; el usuario no).
 * @throws si el curso no tiene fichas vigentes o falta la ficha.
 */
export async function provisionStudent({
    name,
    code,
    email,
    documentNumber,
    password,
    courseCode,
    cohortId = null,
}) {
    const cohorts = await cohortsForCourseCode(courseCode);
    if (cohorts.length === 0) {
        throw new Error("The course has no active cohorts in the backend");
    }
    let target = cohorts.find((c) => String(c.cohortId) === String(cohortId ?? ""));
    if (cohortId != null && String(cohortId).trim() !== "" && !target) {
        throw new Error("The selected cohort is not valid for the course");
    }
    if (!target) {
        if (cohorts.length > 1) throw new Error("Select the student cohort");
        target = cohorts[0];
    }
    if (target.schoolId == null) throw new Error("The cohort program has no school");

    const { name: firstName, lastName } = splitName(name);
    const person = await authApi.createPerson({
        documentNumber: String(documentNumber).trim(),
        name: firstName,
        lastName,
        email: String(email).trim().toLowerCase(),
        status: true,
    });
    const personId = person?.personId ?? person?.person_id ?? null;
    if (!personId) throw new Error("Person creation returned no id");

    let actorId = null;
    let enrollmentId = null;
    try {
        const actor = await academicApi.createActor({
            personId,
            actorTypeId: 1,
            schoolId: target.schoolId,
            actorCode: String(code).trim(),
            startedOn: new Date().toISOString().slice(0, 10),
            status: true,
        });
        actorId = actor?.academicActorId ?? actor?.academic_actor_id ?? null;
        if (actorId == null) throw new Error("Actor creation returned no id");

        const enrollment = await academicApi.createEnrollment({
            academicActorId: actorId,
            cohortId: target.cohortId,
            enrolledOn: new Date().toISOString().slice(0, 10),
            enrollmentStatus: "Active",
        });
        enrollmentId = enrollmentIdOf(enrollment);

        const user = await authApi.createUser({
            personId,
            username: usernameFromEmail(email),
            password,
            authenticationType: "Local",
        });
        const userId = user?.userId ?? user?.user_id ?? null;
        if (!userId) throw new Error("User creation returned no id");

        const roles = await authorizationApi.listRoles();
        const roleId = resolveRoleId(roles, "student");
        if (roleId != null) {
            await authorizationApi.assignRole(userId, roleId);
        }

        return { personId, userId, actorId, cohortId: target.cohortId };
    } catch (err) {
        try {
            if (enrollmentId != null) await academicApi.deleteEnrollment(enrollmentId);
        } catch {}
        try {
            if (actorId != null) await academicApi.deleteActor(actorId);
        } catch {}
        try {
            await authApi.deletePerson(personId);
        } catch {}
        throw err;
    }
}
