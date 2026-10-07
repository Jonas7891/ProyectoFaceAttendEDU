// ============================================================
//  FaceAttend EDU — referenceData
//
//  Datos de referencia compartidos por los módulos Storage
//  (environments, courses, fichas, students, users).
//
//  Cada colección se pide a la API UNA sola vez por sesión:
//  los loadX() que corre AppDataContext en paralelo comparten
//  la misma promesa, así que no se duplican peticiones.
//
//  Convenciones:
//  - Solo lectura; las escrituras siguen en cada *Storage.
//  - Todo se carga con fetchAllPages (sin truncar listas).
//  - Las cargas "secundarias" (roles, bloques...) deben usarse
//    con optional(): si fallan, el caller aplica sus defaults.
// ============================================================

import { fetchAllPages, request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

const cache = new Map();

function memo(key, load) {
    if (!cache.has(key)) {
        cache.set(
            key,
            load().catch((error) => {
                cache.delete(key); // un fallo no debe quedar cacheado
                throw error;
            })
        );
    }
    return cache.get(key);
}

/** Ejecuta una carga secundaria; si falla devuelve el valor por defecto. */
export async function optional(promise, fallback) {
    try {
        return await promise;
    } catch {
        return fallback;
    }
}

/** Olvida las cargas en memoria (llamar tras una escritura cuando se cable el CRUD). */
export function resetReferenceData() {
    cache.clear();
}

// ── Colecciones ───────────────────────────────────────────

export const listPersons = () =>
    memo("persons", () => fetchAllPages(endpoints.identity.persons, {}, { by: "page" }));

export const listUsers = () =>
    memo("users", () => fetchAllPages(endpoints.identity.users, {}, { by: "page" }));

export const listActors = () => memo("actors", () => fetchAllPages(endpoints.academic.actors));

export const listActorTypes = () =>
    memo("actorTypes", () => fetchAllPages(endpoints.academic.actorTypes));

export const listCourses = () => memo("courses", () => fetchAllPages(endpoints.academic.courses));

export const listCohorts = () => memo("cohorts", () => fetchAllPages(endpoints.academic.cohorts));

export const listPrograms = () =>
    memo("programs", () => fetchAllPages(endpoints.academic.programs));

export const listEnrollments = () =>
    memo("enrollments", () => fetchAllPages(endpoints.academic.enrollments));

export const listBlocks = () =>
    memo("blocks", () => fetchAllPages(endpoints.scheduling.blocks));

export const listEnvironments = () =>
    memo("environments", () => request(endpoints.scheduling.environments, { method: "GET" }));

/** GET /users/{id}/roles (público, respuesta: arreglo de RoleResponse). */
export const rolesForUser = (userId) =>
    memo(`roles:${userId}`, () =>
        request(endpoints.authorization.userRoles(userId), { method: "GET" })
    );

/**
 * GET /user-roles?userIds=... — roles de varios usuarios en UNA petición.
 * Sustituye el bucle de una llamada por usuario: con 88 cuentas eran 88 viajes.
 * El endpoint acepta 300 ids por petición, así que la lista se parte en lotes de 200.
 * Devuelve Map<userId, RoleResponse[]>; un usuario sin roles no aparece en el mapa.
 */
export const rolesForUsers = (userIds) =>
    memo(`rolesBatch:${[...userIds].sort().join(",")}`, async () => {
        const BATCH = 200;
        const batches = [];
        for (let i = 0; i < userIds.length; i += BATCH) batches.push(userIds.slice(i, i + BATCH));

        const responses = await Promise.all(
            batches.map((batch) =>
                request(endpoints.authorization.userRolesBatch, {
                    method: "GET",
                    query: { userIds: batch.join(",") },
                })
            )
        );

        const byUser = new Map();
        for (const response of responses) {
            for (const [userId, roles] of Object.entries(response ?? {})) byUser.set(userId, roles);
        }
        return byUser;
    });

// ── Mapas de consulta (una sola construcción por sesión) ──

export const personMap = () =>
    memo("personMap", async () => new Map((await listPersons()).map((p) => [p.personId, p])));

export const actorMap = () =>
    memo("actorMap", async () => {
        const actors = await listActors();
        return new Map(actors.map((a) => [a.academicActorId, a]));
    });

export const userByPersonMap = () =>
    memo("userByPersonMap", async () => {
        const users = await listUsers();
        return new Map(users.map((u) => [u.personId, u]));
    });

export const courseMap = () =>
    memo("courseMap", async () => {
        const courses = await listCourses();
        return new Map(courses.map((c) => [c.courseId, c]));
    });

export const programMap = () =>
    memo("programMap", async () => {
        const programs = await listPrograms();
        return new Map(programs.map((p) => [p.programId, p]));
    });

export const cohortMap = () =>
    memo("cohortMap", async () => {
        const cohorts = await listCohorts();
        return new Map(cohorts.map((c) => [c.cohortId, c]));
    });

export const actorTypeMap = () =>
    memo("actorTypeMap", async () => {
        const types = await listActorTypes();
        return new Map(types.map((t) => [t.actorTypeId, t]));
    });

/**
 * personId -> nombres de curso que imparte, derivado de los bloques
 * horarios (block.instructorActorId -> actor -> persona).
 * Útil para mostrar el curso de un docente sin campo equivalente en el backend.
 */
export const instructorCourseNamesByPerson = () =>
    memo("instructorCourseNamesByPerson", async () => {
        const [blocks, actors, courses] = await Promise.all([
            listBlocks(),
            actorMap(),
            courseMap(),
        ]);
        const names = new Map();
        for (const block of blocks) {
            const actor = actors.get(block.instructorActorId);
            const course = courses.get(block.courseId);
            if (!actor?.personId || !course?.name) continue;
            const list = names.get(actor.personId) ?? [];
            if (!list.includes(course.name)) list.push(course.name);
            names.set(actor.personId, list);
        }
        return names;
    });

// ── Utilidades de formato ─────────────────────────────────

/** Nombre completo de una persona del backend ("Nombre Apellido"). */
export function fullName(person) {
    if (!person) return "";
    return `${person.name ?? ""} ${person.lastName ?? ""}`.trim();
}

/** status booleano del backend → "active" | "inactive" (la UI espera strings). */
export function normalizeStatus(status) {
    if (typeof status === "boolean") return status ? "active" : "inactive";
    if (typeof status === "string" && status) return status.toLowerCase();
    return "active";
}

/** "08:00:00" (LocalTime) → "08:00". */
export function hhmm(time) {
    return typeof time === "string" ? time.slice(0, 5) : "";
}

// Días ISO 1..7 → etiquetas cortas usadas por la UI.
export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function dayLabel(dayOfWeek) {
    return DAY_LABELS[(Number(dayOfWeek) || 1) - 1] ?? "";
}
