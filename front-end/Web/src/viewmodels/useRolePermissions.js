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
import { useAuth } from "../context/AuthContext";

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
        users: "Compañeros",
        courses: "Mis cursos",
    },
};

function getTabLabel(tabKey, role) {
    return TAB_LABELS_BY_ROLE[role]?.[tabKey] || null;
}

// ── Cálculo de tabs visibles ────────────────────────────────

function getVisibleTabs(role) {
    switch (role) {
        case "admin":
            return [
                "dashboard",
                "users",
                "courses",
                "environments",
                "reports",
                "history",
                "justifications",
                "schoolInfo",
                "academic",
                "contacts",
                "settings",
            ];
        case "teacher":
            return [
                "dashboard",
                "users",
                "courses",
                "reports",
                "history",
                "justifications",
                "schoolInfo",
                "academic",
                "contacts",
                "settings",
            ];
        case "student":
            // "users" (etiquetado "Compañeros" vía TAB_LABELS_BY_ROLE) ya existía el
            // componente y el label, pero nunca estuvo en la lista de tabs visibles:
            // el estudiante no tenía forma de llegar a ver a sus compañeros de ficha.
            return [
                "dashboard",
                "history",
                "justifications",
                "schoolInfo",
                "academic",
                "contacts",
                "courses",
                "users",
                "settings",
            ];
        default:
            return []; //Vacio aproposito, no queremos fugas aunque alguien logre pasar las validaciones
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
        visibleTabs: getVisibleTabs(role),
        getTabLabel: (tabKey) => getTabLabel(tabKey, role),

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
