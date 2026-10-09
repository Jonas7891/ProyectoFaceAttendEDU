// ============================================================
//  FaceAttend EDU — TeacherUsers
//
//  Vista de usuarios para profesores/instructores.
//  Muestra solo los estudiantes matriculados en las fichas donde
//  el profesor es el instructor asignado (acotado en
//  useUsersViewModel vía instructorActorIds). Sin acciones de
//  gestión (crear/importar/editar son solo de admin).
// ============================================================

import React, { useMemo } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useUsersViewModel } from "../../../viewmodels/useUsersViewModel";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../context/AppDataContext";
import StudentDetailModal from "../../components/students/StudentDetailModal";
import { UsersFilterBar, UsersTable } from "./sections";
import { COLUMNS, createCompactRowConfig } from "./columns/usersColumns";

export function TeacherUsers({ vm: vmProp }) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vmLocal = useUsersViewModel();
    const vm = vmProp || vmLocal;
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const appData = useAppData();

    const filterColumns = useMemo(
        () => [
            { key: "name", label: t("Nombre"), icon: "type" },
            { key: "attendance", label: t("Asistencia"), icon: "percent" },
            { key: "status", label: t("Estado"), icon: "activity" },
        ],
        [t]
    );

    const users = vm.filteredUsers;
    const renderContext = { t, c, roleVariant: "default", courses: appData.courses };
    // La lista ya está acotada a mis estudiantes: forzamos roleFilter para
    // ocultar la columna "Rol" (redundante, todos son estudiantes).
    const visibilityContext = { roleFilter: "student", canManage: false };
    const compactConfig = createCompactRowConfig({ showRole: false, canManage: false });

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Barra de filtros reutilizable */}
            <UsersFilterBar
                vm={vm}
                options={{
                    filterColumns,
                    searchPlaceholder: t("Buscar por nombre o código..."),
                }}
            />

            {/* Tabla reutilizable */}
            <UsersTable
                columns={COLUMNS}
                data={users}
                onRowPress={(user) => vm.selectUser(user)}
                renderContext={renderContext}
                visibilityContext={visibilityContext}
                compactConfig={compactConfig}
                isLoading={vm.isLoading}
                loadingMessage={`${t("Cargando")} ${t("estudiantes")}...`}
                completeMessage={t("Ya viste a todos tus estudiantes, no hay más por mostrar.")}
                emptyState={{
                    icon: "users",
                    title: t("Sin estudiantes"),
                    description: t("Aún no tienes estudiantes en tus fichas asignadas"),
                }}
            />

            {/* Detalle de estudiante (solo lectura; registrar rostro sigue permitido) */}
            <StudentDetailModal
                student={vm.selected}
                onClose={vm.clearSelection}
                canManage={false}
                canRegisterFace={permissions.canRegisterFace}
            />
        </ScrollView>
    );
}

export default TeacherUsers;
