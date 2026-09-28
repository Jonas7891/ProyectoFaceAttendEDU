import { ROLES_HIERARCHY } from "../services/constants/rolesHierarchy";
import type { AppUserRole } from "../models/types";

// Mapper único backend -> Web. Canónicos: Administrador, Instructor, Aprendiz.
// Acepta nombres legados (SUPER_ADMIN, SCHOOL_ADMIN, INSTRUCTOR, STUDENT,
// Docente, Estudiante, ADMIN, teacher...) para bases aún sin migrar.
const BACKEND_ROLE_MAP: Record<string, string> = {
    ADMIN: "Administrador",
    ADMINISTRADOR: "Administrador",
    SUPER_ADMIN: "Administrador",
    SCHOOL_ADMIN: "Administrador",
    RECTOR: "Administrador",
    COORDINATOR: "Administrador",
    INSTRUCTOR: "Instructor",
    DOCENTE: "Instructor",
    TEACHER: "Instructor",
    STUDENT: "Aprendiz",
    ESTUDIANTE: "Aprendiz",
    APRENDIZ: "Aprendiz",
};

export const normalizeBackendRole = (role: unknown): string | null => {
    if (role === null || role === undefined) return null;
    const key = String(role).trim().toUpperCase();
    if (BACKEND_ROLE_MAP[key]) return BACKEND_ROLE_MAP[key];
    return ROLES_HIERARCHY.find((c) => c.toUpperCase() === key) ?? null;
};

// Backend canónico -> rol interno Web (permisos por tab).
const APP_ROLE_MAP: Record<string, AppUserRole> = {
    Administrador: "admin",
    Instructor: "teacher",
    Aprendiz: "student",
};

export const mapBackendRoleToAppRole = (role: unknown): AppUserRole | null => {
    const canonical = normalizeBackendRole(role);
    return canonical ? (APP_ROLE_MAP[canonical] ?? null) : null;
};

export const getHighestRole = (roles: unknown): string | null => {
    // Sin fallback silencioso: sin roles válidos se devuelve null y el
    // login debe fallar explícito.
    if (!roles || (Array.isArray(roles) && roles.length === 0)) {
        return null;
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const mapped = rolesArray
        .map((r) => normalizeBackendRole(r))
        .filter((r): r is string => r !== null && r !== "");

    for (let i = 0; i < ROLES_HIERARCHY.length; i++) {
        const currentRole = ROLES_HIERARCHY[i];
        if (mapped.includes(currentRole)) {
            return currentRole;
        }
    }

    return null;
};
