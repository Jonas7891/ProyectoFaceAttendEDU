// ============================================================
//  FaceAttend EDU — StudentUsers
//
//  Vista de usuarios para estudiantes.
//  Los estudiantes ven información limitada de sus compañeros.
//
//  Funcionalidades:
//  - Ver compañeros de sus cursos
//  - Búsqueda básica
//  - Sin acciones de gestión
// ============================================================

import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../components/hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { AdminUsers } from "./AdminUsers";

export function StudentUsers() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    // Por ahora, reutilizamos AdminUsers con permisos limitados
    // Los permisos se manejan en useRolePermissions
    return <AdminUsers />;
}
