// ============================================================
//  FaceAttend EDU — backendRoles
//
//  ÚNICO mapa rol del backend → rol de la UI.
//  Compartido por AuthContext (sesión) y UserStorage (listado),
//  en espejo de Mobile/src/utils/getHighestRole.js.
// ============================================================

// Catálogo vigente (database/02-ms-authorization-db/02-dml/
// 004-unify-mobile-roles): Administrador | Instructor | Aprendiz.
// Se aceptan también los nombres legados (001-seed-role-table)
// por si la base todavía no fue migrada.
export const ROLE_BY_BACKEND_ROLE = {
    // Vigentes
    ADMINISTRADOR: "admin",
    INSTRUCTOR: "teacher",
    APRENDIZ: "student",
    // Legados / sin migrar
    SUPER_ADMIN: "admin",
    SCHOOL_ADMIN: "admin",
    ADMIN: "admin",
    RECTOR: "admin",
    COORDINATOR: "admin",
    DOCENTE: "teacher",
    TEACHER: "teacher",
    STUDENT: "student",
    ESTUDIANTE: "student",
};

// Prioridad de resolución: admin > teacher > student.
export const ROLE_PRIORITY = ["admin", "teacher", "student"];

/**
 * @param {string[]} roleNames nombres de rol tal como vienen del backend
 * @returns {"admin"|"teacher"|"student"|null}
 */
export function toUiRole(roleNames) {
    const mapped = (roleNames ?? [])
        .map((name) => ROLE_BY_BACKEND_ROLE[String(name ?? "").trim().toUpperCase()])
        .filter(Boolean);
    return ROLE_PRIORITY.find((role) => mapped.includes(role)) ?? null;
}

/**
 * Extrae los nombres de rol de una respuesta de GET /users/{id}/roles
 * (arreglo plano o { data: [...] }).
 * @returns {string[]}
 */
export function roleNamesFrom(payload) {
    const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
    return list.map((role) => role?.roleName ?? role?.role_name).filter(Boolean);
}
