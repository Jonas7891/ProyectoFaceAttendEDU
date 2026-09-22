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
import type { AppUserRole } from "../../models/types";
import type { TabKey } from "../../viewmodels/useDashboardScreenViewModel";

// ── Permisos por rol ────────────────────────────────────────

export interface RolePermissions {
    // ── Estudiantes ──────────────────────────────────────────
    /** Puede ver la lista completa de estudiantes */
    canViewStudents:     boolean;
    /** Puede crear/editar/eliminar estudiantes */
    canManageStudents:   boolean;
    /** Puede importar estudiantes desde CSV */
    canImportStudents:   boolean;
    /** Puede registrar el rostro de un estudiante */
    canRegisterFace:     boolean;

    // ── Cursos / Programas ────────────────────────────────────
    /** Puede ver cursos */
    canViewCourses:      boolean;
    /** Puede crear/editar/eliminar cursos */
    canManageCourses:    boolean;

    // ── Ambientes ─────────────────────────────────────────────
    /** Puede ver los ambientes */
    canViewEnvironments: boolean;
    /** Puede crear/editar/eliminar ambientes y horarios */
    canManageEnvironments: boolean;

    // ── Reportes ─────────────────────────────────────────────
    /** Puede ver reportes (al menos los suyos) */
    canViewReports:      boolean;
    /** Puede exportar reportes (PDF/Excel) */
    canExportReports:    boolean;
    /** Puede notificar a todos los estudiantes en riesgo */
    canNotifyAll:        boolean;
    /** Puede ver reportes de todos los cursos (no solo los suyos) */
    canViewAllReports:   boolean;

    // ── Configuración ─────────────────────────────────────────
    /** Puede cambiar tema e idioma (todos los roles) */
    canEditAppearance:   boolean;
    /** Puede gestionar usuarios del sistema */
    canManageUsers:      boolean;
    /** Puede ver la sección completa de configuración */
    canViewSettings:     boolean;

    // ── Navegación ────────────────────────────────────────────
    /** Tabs visibles según el rol */
    visibleTabs:         TabKey[];

    // ── Metadatos ─────────────────────────────────────────────
    role: AppUserRole;
    isAdmin:   boolean;
    isTeacher: boolean;
    isStudent: boolean;
}

// ── Cálculo de tabs visibles ────────────────────────────────

function getVisibleTabs(role: AppUserRole): TabKey[] {
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

function buildPermissions(role: AppUserRole): RolePermissions {
    const isAdmin   = role === "admin";
    const isTeacher = role === "teacher";
    const isStudent = role === "student";

    return {
        // Estudiantes
        canViewStudents:      isAdmin || isTeacher,
        canManageStudents:    isAdmin,
        canImportStudents:    isAdmin,
        canRegisterFace:      isAdmin || isTeacher,

        // Cursos
        canViewCourses:       true,
        canManageCourses:     isAdmin,

        // Ambientes
        canViewEnvironments:  isAdmin || isTeacher,
        canManageEnvironments: isAdmin,

        // Reportes
        canViewReports:       true,
        canExportReports:     isAdmin || isTeacher,
        canNotifyAll:         isAdmin,
        canViewAllReports:    isAdmin || isTeacher,

        // Configuración
        canEditAppearance:    true,
        canManageUsers:       isAdmin,
        canViewSettings:      true,

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

const GUEST_PERMISSIONS: RolePermissions = buildPermissions("student");

// ── Hook ──────────────────────────────────────────────────────

export function useRolePermissions(): RolePermissions {
    const { user } = useAuth();

    return useMemo(
        () => user ? buildPermissions(user.role) : GUEST_PERMISSIONS,
        [user]
    );
}
