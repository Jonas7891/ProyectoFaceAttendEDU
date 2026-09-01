// ============================================================
//  FaceAttend EDU — useRolePermissions
//
//  Hook centralizado de permisos por rol.
//  ÚNICA fuente de verdad sobre qué puede hacer cada rol.
//
//  Uso:
//    const { canManageStudents, visibleTabs } = useRolePermissions();
//    {canManageStudents && <UIButton>+ Nuevo</UIButton>}
//
//  Roles:
//    admin   → acceso total
//    teacher → acceso parcial (sus cursos, sin gestión de usuarios/ambientes)
//    student → acceso mínimo (solo su perfil y sus cursos)
// ============================================================

import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

// ── Permisos por rol ────────────────────────────────────────

// ── Cálculo de tabs visibles ────────────────────────────────

function getVisibleTabs(role) {
    switch (role) {
        case "admin":
            return ["dashboard", "students", "courses", "environments", "reports", "settings"];
        case "teacher":
            return ["dashboard", "students", "courses", "reports", "settings"];
        case "student":
            return ["dashboard", "courses", "settings"];
        default:
            return ["dashboard", "courses", "settings"];
    }
}

// ── Cálculo de permisos ──────────────────────────────────────

function buildPermissions(role) {
    const isAdmin = role === "admin";
    const isTeacher = role === "teacher";
    const isStudent = role === "student";

    return {
        // Estudiantes
        canViewStudents: isAdmin || isTeacher,
        canManageStudents: isAdmin,
        canImportStudents: isAdmin,
        canRegisterFace: isAdmin || isTeacher,

        // Cursos
        canViewCourses: true,
        canManageCourses: isAdmin || isTeacher,

        // Ambientes
        canViewEnvironments: isAdmin || isTeacher,
        canManageEnvironments: isAdmin,

        // Reportes
        canViewReports: isAdmin || isTeacher,
        canExportReports: isAdmin || isTeacher,
        canNotifyAll: isAdmin,
        canViewAllReports: isAdmin,

        // Configuración
        canEditAppearance: true,
        canManageUsers: isAdmin,
        canViewSettings: true,

        // Navegación
        visibleTabs: getVisibleTabs(role),

        // Metadatos
        role,
        isAdmin,
        isTeacher,
        isStudent,
    };
}

// ── Permisos de invitado (sin sesión) ────────────────────────

const GUEST_PERMISSIONS = buildPermissions("student");

// ── Hook ──────────────────────────────────────────────────────

export function useRolePermissions() {
    const { user } = useAuth();

    return useMemo(() => (user ? buildPermissions(user.role) : GUEST_PERMISSIONS), [user]);
}
