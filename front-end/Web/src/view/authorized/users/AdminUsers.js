// ============================================================
//  FaceAttend EDU — AdminUsers
//
//  Vista de gestión de usuarios para administradores.
//  
//  Usa componentes reutilizables:
//  - UsersFilterBar: barra de búsqueda y filtros
//  - UsersTable: tabla dinámica con columnas configurables
//
//  Las columnas se definen en /columns/usersColumns.js
//  Los componentes reutilizables están en /sections/
// ============================================================

import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { useAttendanceColor } from "../../components/common";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useUsersViewModel } from "../../../viewmodels/useUsersViewModel";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import RegisterStudentModal from "../../components/students/RegisterStudentModal";
import ImportStudentsModal from "../../components/students/ImportStudentsModal";
import StudentDetailModal from "../../components/students/StudentDetailModal";
import { UsersFilterBar, UsersTable } from "./sections";
import { COLUMNS, ROLE_VARIANT, createCompactRowConfig } from "./columns/usersColumns";

// ── AdminUsers Component ──────────────────────────────────

export function AdminUsers({ section, vm: vmProp }) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vmLocal = useUsersViewModel();
    const vm = vmProp || vmLocal; // Usar el vm pasado por props o crear uno local
    const { t } = useTranslation();
    const permissions = useRolePermissions();

    // Determinar el filtro de rol: prioritario desde section (sidebar), secundario desde dropdown
    // section: undefined/"all" (todos), "students", "teachers", "admins"
    const sectionToUserType = {
        students: "student",
        teachers: "teacher",
        admins: "admin",
    };
    
    const roleFilterFromSection = section && section !== "all" ? sectionToUserType[section] : null;
    const roleFilterFromDropdown = vm.userTypeFilter && vm.userTypeFilter !== "all" ? vm.userTypeFilter : null;
    const roleFilter = roleFilterFromSection || roleFilterFromDropdown;
    
    const canManage = permissions.canManageStudents;

    // Configuración de columnas para el filtro avanzado
    const filterColumns = useMemo(() => [
        { key: "name", label: t("Nombre"), icon: "type" },
        { key: "program", label: t("Programa"), icon: "book" },
        { key: "attendance", label: t("Asistencia"), icon: "percent" },
        { key: "status", label: t("Estado"), icon: "activity" },
    ], [t]);

    const users = vm.filteredUsers;
    
    // Contexto para renderizado de columnas
    const roleVariant = ROLE_VARIANT[users[0]?.userType] || "default";
    const renderContext = { t, c, roleVariant };
    
    // Contexto para visibilidad de columnas
    const visibilityContext = { roleFilter, canManage };
    
    // Configuración de vista compacta móvil
    const compactConfig = createCompactRowConfig({
        showRole: !roleFilter,
        canManage,
    });
    
    // Mensaje de carga dinámico según la sección
    const getSectionLabel = () => {
        if (section === "students") return t("estudiantes");
        if (section === "teachers") return t("profesores");
        if (section === "admins") return t("administradores");
        return t("usuarios");
    };
    
    const loadingMessage = `${t("Cargando")} ${getSectionLabel()}...`;
    const completeMessage = t("¡Ya llegaste hasta el final de la lista, no hay más usuarios que mostrar!");

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
                loadingMessage={loadingMessage}
                completeMessage={completeMessage}
                emptyState={{
                    icon: "users",
                    title: t("Sin resultados"),
                    description: t("Ajusta los filtros o agrega nuevos estudiantes"),
                }}
            />

            {/* Modales */}
            <StudentDetailModal
                student={vm.selected}
                onClose={vm.clearSelection}
                canManage={canManage}
                canRegisterFace={permissions.canRegisterFace}
            />

            {canManage && (
                <RegisterStudentModal
                    visible={vm.showRegisterModal}
                    onClose={vm.closeRegisterModal}
                    onSubmit={vm.registerUser}
                />
            )}

            {permissions.canImportStudents && (
                <ImportStudentsModal
                    visible={vm.showImportModal}
                    onClose={vm.closeImportModal}
                    onImport={vm.importUsers}
                />
            )}
        </ScrollView>
    );
}