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
import { View, ScrollView, Text } from "react-native";
import { useAttendanceColor, Button } from "../../components/common";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useUsersViewModel } from "../../../viewmodels/useUsersViewModel";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../context/AppDataContext";
import { Feather } from "@expo/vector-icons";
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
    const appData = useAppData();

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

    // Se pinta solo la página actual (la consulta completa se limita a
    // USERS_PAGE_SIZE filas por render) y el resto se pagina en el cliente.
    const users = vm.pageUsers ?? vm.filteredUsers;
    const isPaginated = (vm.totalPages ?? 1) > 1;
    
    // Contexto para renderizado de columnas
    const roleVariant = ROLE_VARIANT[users[0]?.userType] || "default";
    const renderContext = { t, c, roleVariant, courses: appData.courses };
    
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
    // Con paginación el "final de la lista" sería engañoso: se informa
    // cuántos hay en la página actual sobre el total filtrado.
    const completeMessage = isPaginated
        ? `${t("Mostrando")} ${users.length} ${t("de")} ${vm.totalUsers} ${t("usuarios")}`
        : t("¡Ya llegaste hasta el final de la lista, no hay más usuarios que mostrar!");

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

            {/* Paginación: la consulta se limita a una página de la vez */}
            {isPaginated && (
                <View
                    style={{
                        flexDirection: isSmall ? "column" : "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={vm.page <= 0}
                        onPress={() => vm.setPage(Math.max(0, vm.page - 1))}
                        leftIcon={<Feather name="chevron-left" size={16} color={c.text.primary} />}
                    >
                        {t("Anterior")}
                    </Button>

                    <Text
                        style={{
                            fontSize: 13,
                            color: c.text.secondary,
                            textAlign: "center",
                        }}
                    >
                        {`${t("Página")} ${vm.page + 1} ${t("de")} ${vm.totalPages} · ${vm.totalUsers} ${t(
                            "usuarios"
                        )}`}
                    </Text>

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={vm.page >= vm.totalPages - 1}
                        onPress={() => vm.setPage(vm.page + 1)}
                        leftIcon={<Feather name="chevron-right" size={16} color={c.text.primary} />}
                    >
                        {t("Siguiente")}
                    </Button>
                </View>
            )}

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
                    initialRole={roleFilter || null}
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