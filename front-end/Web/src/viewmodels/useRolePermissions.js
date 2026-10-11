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
//    admin   → acceso total; el rol explícito "Super Administrador"
//              (o sin sede propia) es "Super Admin", el resto es
//              "Admin de sede"
//    teacher → acceso parcial (sus cursos, sin gestión de usuarios/ambientes)
//    student → acceso mínimo (solo su perfil y sus cursos)
// ============================================================

import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { hasSuperAdminRole } from "../core/utils/backendRoles";

// ── Permisos por rol ────────────────────────────────────────

// ── Labels de tabs por rol ───────────────────────────────────
// Cada rol puede tener una interpretación diferente del mismo tab

const TAB_LABELS_BY_ROLE = {
    admin: {
        users: "Usuarios",
    },
    teacher: {
        users: "Alumnos",
        courses: "Mis cursos",
    },
    student: {
        courses: "Mis cursos",
    },
};

function getTabLabel(tabKey, role) {
    return TAB_LABELS_BY_ROLE[role]?.[tabKey] || null;
}

// ── Cálculo de tabs visibles ────────────────────────────────

function getVisibleTabs(role, isSuperAdmin) {
    switch (role) {
        case "admin":
            if (isSuperAdmin) {
                // Super Admin (rol explícito "Super Administrador"): sin
                // interés en expedientes de personas concretas (sin
                // Justificaciones ni Historial): su consulta son los
                // reportes por sede y la gestión de escuelas.
                return [
                    "dashboard",
                    "reports",
                    "users",
                    "courses",
                    "environments",
                    "settings",
                ];
            }
            // Admin de sede: gestión de su sede, sin "Historial" de personas
            // y sin "Sede"/"Contactos" como tabs: viven dentro de Configuración.
            // "Académico" se cayó por redundante: cursos, fichas y reportes
            // ya exponen esa información con mucho más detalle.
            return [
                "dashboard",
                "reports",
                "users",
                "courses",
                "environments",
                "justifications",
                "settings",
            ];
        case "teacher":
            // Sin "Académico" (redundante con "Mis cursos" y Reportes).
            return [
                "dashboard",
                "users",
                "courses",
                "reports",
                "history",
                "justifications",
                "settings",
            ];
        case "student":
            // Sin "users" (Compañeros): el estudiante no necesita consultar
            // a sus compañeros. "Sede" (con instructores) vive en Configuración.
            return [
                "dashboard",
                "history",
                "justifications",
                "academic",
                "courses",
                "settings",
            ];
        default:
            return []; //Vacio aproposito, no queremos fugas aunque alguien logre pasar las validaciones
    }
}

// ── Cálculo de permisos ──────────────────────────────────────

function buildPermissions(role, schoolId = null, roleNames = []) {
    const isAdmin = role === "admin";
    const isTeacher = role === "teacher";
    const isStudent = role === "student";
    // La distinción es explícita en la DB: el rol "Super Administrador"
    // (007-split-super-admin-role) marca al administrador global. El
    // fallback por sede cubre cuentas con roles no reconocidos en la
    // respuesta del backend.
    const isSuperAdmin = isAdmin && (hasSuperAdminRole(roleNames) || schoolId == null);

    return {
        // Estudiantes
        canViewStudents: isAdmin || isTeacher,
        canManageStudents: isAdmin,
        canImportStudents: isAdmin,
        canRegisterFace: isAdmin || isTeacher,

        // Cursos
        canViewCourses: true,
        canManageCourses: isAdmin,

        // Ambientes
        canViewEnvironments: isAdmin || isTeacher,
        canManageEnvironments: isAdmin,

        // Reportes
        canViewReports: isAdmin || isTeacher,
        canExportReports: isAdmin || isTeacher,
        canNotifyAll: isAdmin,
        canViewAllReports: isAdmin,

        // Historial de asistencia (HU-HIST-001: consulta los 3 roles, AC10/AC11/AC12)
        canViewHistory: true,

        // Justificaciones (HU-JUS-001 alumno · HU-JUS-002 instructor/admin)
        // Nota: la matriz de acceso marca Instructor ✅ también para enviar, pero las
        // reglas de navegación y el mapa de pantallas dicen "solo alumnos".
        canSubmitJustifications: isStudent,
        canReviewJustifications: isAdmin || isTeacher,

        // Información de la sede (lectura los 3 roles, edición solo admin)
        canViewSchoolInfo: true,
        canEditSchoolInfo: isAdmin,

        // Sección académica y contactos (solo lectura, los 3 roles)
        canViewAcademic: true,
        canViewContacts: true,

        // Configuración
        canEditAppearance: true,
        canManageUsers: isAdmin,
        canViewSettings: true,

        // Navegación
        visibleTabs: getVisibleTabs(role, isSuperAdmin),
        getTabLabel: (tabKey) => getTabLabel(tabKey, role),

        // Metadatos
        role,
        isAdmin,
        isSuperAdmin,
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
        () =>
            user
                ? buildPermissions(user.role, user.schoolId ?? null, user.roles ?? [])
                : GUEST_PERMISSIONS,
        [user]
    );
}
