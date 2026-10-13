// ============================================================
//  FaceAttend EDU — Staff provisioning (teacher/admin registration)
//
//  Cadena de alta verificada contra el backend:
//  1. POST /api/v1/persons          (PersonDto, camelCase)
//  2. POST /api/v1/users            (CreateUserRequest: personId, username, password)
//  3. POST /api/v1/users/{id}/roles ({roleId}, resuelto por nombre)
//  4. Solo docentes: POST /api/v1/academic-actors (actorTypeId 2 = INSTRUCTOR)
//
//  Los admins no llevan academic_actor: la identidad es agnóstica de
//  sede (AGENTS.md §2.6) y el actor solo existe para STUDENT/INSTRUCTOR.
// ============================================================

import { authApi } from "./authApi";
import { academicApi } from "./academicApi";
import { authorizationApi } from "./authorizationApi";

// Nombres de rol aceptados (ES actuales + legados EN): los IDs
// autoincrementales dependen del seed, nunca se hardcodean.
const ROLE_ALIASES = {
    admin: new Set(["administrador", "super administrador", "super_admin", "school_admin"]),
    teacher: new Set(["instructor"]),
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

async function resolveSchoolId(explicit) {
    if (explicit != null) return explicit;
    const schools = await academicApi.listSchools();
    const list = Array.isArray(schools) ? schools : schools?.content ?? [];
    const first = list[0];
    const id = first?.schoolId ?? first?.school_id ?? null;
    if (id == null) throw new Error("No school available for the teacher record");
    return id;
}

/**
 * Crea persona + usuario + rol (+ actor si es docente).
 * Si el usuario/rol/actor falla tras crear la persona, la elimina
 * (compensa) para no dejar huérfanos en identity.
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

    try {
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

        if (role === "teacher") {
            const targetSchoolId = await resolveSchoolId(schoolId);
            await academicApi.createActor({
                personId,
                actorTypeId: 2,
                schoolId: targetSchoolId,
                actorCode: String(code).trim(),
                startedOn: new Date().toISOString().slice(0, 10),
                status: true,
            });
        }

        return { personId, userId };
    } catch (err) {
        try {
            await authApi.deletePerson(personId);
        } catch {
            // La compensación es best-effort: se propaga el error original.
        }
        throw err;
    }
}
