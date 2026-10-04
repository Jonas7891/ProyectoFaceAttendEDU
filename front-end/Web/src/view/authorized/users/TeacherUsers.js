// ============================================================
//  FaceAttend EDU — TeacherUsers
//
//  Vista de gestión de usuarios para profesores/instructores.
//  Muestra solo los estudiantes de los cursos que enseña.
//
//  Funcionalidades:
//  - Ver estudiantes de sus cursos
//  - Búsqueda y filtrado básico
//  - Ver detalles de estudiantes
// ============================================================

import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../components/hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { AdminUsers } from "./AdminUsers";

export function TeacherUsers() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    // Por ahora, reutilizamos AdminUsers con permisos limitados
    // En el futuro, esto podría filtrar solo los estudiantes de los cursos del profesor
    return <AdminUsers />;
}
