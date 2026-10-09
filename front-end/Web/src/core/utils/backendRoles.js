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

// ── Etiqueta visible del rol (sidebar, bajo el nombre) ───────
// En la UI se muestra el rol "crudo" (admin/teacher/student), lo que deja
// fuera su significado real: el catálogo unificado convirtió SUPER_ADMIN
// en "Administrador" (acceso total, sin sede propia) y ese es el rol que
// debe leerse como "Super Admin".
const ROLE_DISPLAY_LABEL = {
    SUPER_ADMIN: "Super Admin",
    ADMINISTRADOR: "Super Admin",
    ADMIN: "Super Admin",
    SCHOOL_ADMIN: "Admin de sede",
    RECTOR: "Rector",
    COORDINATOR: "Coordinador",
    INSTRUCTOR: "Docente",
    DOCENTE: "Docente",
    TEACHER: "Docente",
    APRENDIZ: "Estudiante",
    STUDENT: "Estudiante",
    ESTUDIANTE: "Estudiante",
};

/**
 * Etiqueta a mostrar bajo el nombre del usuario en la UI.
 * Prioriza los nombres de rol del backend (user.roles) y, si ninguno se
 * reconoce, cae al rol de la UI (user.role).
 * @param {{ roles?: string[], role?: string }} user
 * @returns {string}
 */
export function roleDisplayLabel(user) {
    const fromBackend = (user?.roles ?? [])
        .map((name) => ROLE_DISPLAY_LABEL[String(name ?? "").trim().toUpperCase()])
        .find(Boolean);
    if (fromBackend) return fromBackend;
    const ui = user?.role;
    if (ui === "admin") return "Super Admin";
    if (ui === "teacher") return "Docente";
    if (ui === "student") return "Estudiante";
    return ui ?? "";
}
