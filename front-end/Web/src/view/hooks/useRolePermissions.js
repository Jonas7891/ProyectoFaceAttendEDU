// ============================================================
//  FaceAttend EDU — useRolePermissions
//
//  Hook centralizado de permisos por rol.
//  ÚNICA fuente de verdad sobre qué puede hacer cada rol.
//
//  Uso:
//    const { canManageStudents, visibleTabs } = useRolePermissions();
//    {canManageStudents && + Nuevo</UIButton>}
//
//  Roles:
//    admin   → acceso total
//    teacher → acceso parcial (sus cursos, sin gestión de usuarios/ambientes)
//    student → acceso mínimo (solo su perfil y sus cursos)
// ============================================================

import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { AppUserRole } from "../../models/types";
import { TabKey } from "../../viewmodels/useDashboardScreenViewModel";

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
    }
}

// ── Cálculo de permisos ──────────────────────────────────────

function buildPermissions(role) {
    const isAdmin   = role === "admin";
    const isTeacher = role === "teacher";
    const isStudent = role === "student";

    return {
        // Estudiantes
        canViewStudents,
        canManageStudents,
        canImportStudents,
        canRegisterFace,

        // Cursos
        canViewCourses,
        canManageCourses,

        // Ambientes
        canViewEnvironments,
        canManageEnvironments,

        // Reportes
        canViewReports,
        canExportReports,
        canNotifyAll,
        canViewAllReports,

        // Configuración
        canEditAppearance,
        canManageUsers,
        canViewSettings,

        // Navegación
        visibleTabs:          getVisibleTabs(role),

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

    return useMemo(
        () => user ? buildPermissions(user.role) : GUEST_PERMISSIONS,
        [user]
    );
}
