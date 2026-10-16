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

import React, { useMemo, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAttendanceColor, Button, Alert } from "../../components/common";
import { ConfirmModal } from "../../components/common/modals/ConfirmModal";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useUsersViewModel } from "../../../viewmodels/useUsersViewModel";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../context/AppDataContext";
import RegisterStudentModal from "../../components/users/RegisterStudentModal";
import EditUserModal from "../../components/users/EditUserModal";
import ImportStudentsModal from "../../components/users/ImportStudentsModal";
import StudentDetailModal from "../../components/users/StudentDetailModal";
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

    // Resetear filtro de dropdown cuando cambias de sección
    React.useEffect(() => {
        if (section === "all" || !section || section === undefined) {
            vm.setUserTypeFilter("all");
        }
    }, [section]);

    // Determinar el filtro de rol: prioritario desde section (sidebar), secundario desde dropdown
    // section: undefined/"all" (todos), "students", "teachers", "admins"
    const sectionToUserType = useMemo(() => ({
        students: "student",
        teachers: "teacher",
        admins: "admin",
    }), []);
    
    const roleFilterFromSection = useMemo(() => {
        return section && section !== "all" && section !== undefined ? sectionToUserType[section] : null;
    }, [section, sectionToUserType]);
    
    const roleFilterFromDropdown = useMemo(() => {
        return vm.userTypeFilter && vm.userTypeFilter !== "all" ? vm.userTypeFilter : null;
    }, [vm.userTypeFilter]);
    
    const roleFilter = roleFilterFromSection || roleFilterFromDropdown;
    
    const canManage = permissions.canManageStudents;
    const canToggleStatus = permissions.canToggleUserStatus ?? canManage;
    const canDelete = permissions.canDeleteUser ?? false;
    const canChangeRole = permissions.canChangeUserRole ?? false;

    async function handleEditSubmit(form) {
        const err = await vm.updateUserDetails(vm.selected, form);
        if (err) return err;
        if (canChangeRole && form?.role && form.role !== vm.selected?.userType) {
            return await vm.changeUserRole(vm.selected, form.role);
        }
        return null;
    }

    // Confirmación de acciones destructivas (HU-IAM-007/008): el modal
    // de detalle pide la acción, aquí se confirma y ejecuta.
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState(null);

    async function confirmPending() {
        if (!pending?.user) return;
        setBusy(true);
        setActionError(null);
        const err =
            pending.type === "delete"
                ? await vm.removeUser?.(pending.user)
                : await vm.toggleUserStatus?.(pending.user, pending.nextActive);
        setBusy(false);
        if (err) {
            setActionError(err);
            return;
        }
        setPending(null);
    }

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
    // CORREGIDO: roleVariant debe basarse en el roleFilter, no en el primer usuario
    const roleVariant = useMemo(() => {
        if (roleFilter === "student") return ROLE_VARIANT.student;
        if (roleFilter === "teacher") return ROLE_VARIANT.teacher;
        if (roleFilter === "admin") return ROLE_VARIANT.admin;
        return "default";
    }, [roleFilter]);
    
    const renderContext = useMemo(() => ({
        t,
        c,
        roleVariant,
        courses: appData.courses,
    }), [t, c, roleVariant, appData.courses]);
    
    // Contexto para visibilidad de columnas
    const visibilityContext = useMemo(() => ({
        roleFilter,
        canManage,
    }), [roleFilter, canManage]);
    
    // Configuración de vista compacta móvil
    const compactConfig = useMemo(() => createCompactRowConfig({
        showRole: !roleFilter,
        canManage,
        roleFilter,
    }), [roleFilter, canManage]);
    
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
                key={`users-table-${section}-${users.length}`}
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
                onEdit={vm.openEditModal}
                onUserUpdated={vm.handleUserUpdated}
                canManage={canManage}
                canRegisterFace={permissions.canRegisterFace}
                canToggleStatus={canToggleStatus}
                canDeleteUser={canDelete}
                onToggleStatus={(u) =>
                    setPending({
                        type: "toggle",
                        user: u,
                        nextActive: (u?.status ?? "active") !== "active",
                    })
                }
                onRemove={(u) => setPending({ type: "delete", user: u })}
            />

            <ConfirmModal
                visible={pending != null}
                onClose={() => (busy ? null : setPending(null))}
                onConfirm={confirmPending}
                loading={busy}
                variant="danger"
                title={
                    pending?.type === "delete" ? t("Eliminar usuario") : t("Cambiar estado")
                }
                message={
                    pending?.type === "delete"
                        ? t("Se desactivará al usuario (borrado lógico, sin DELETE físico). ¿Continuar?")
                        : pending?.nextActive
                          ? t("Se activará al usuario. ¿Continuar?")
                          : t("Se desactivará al usuario. ¿Continuar?")
                }
                confirmText={pending?.type === "delete" ? t("Eliminar") : t("Confirmar")}
            />
            {actionError && (
                <View style={{ marginHorizontal: 24, marginBottom: 12 }}>
                    <Alert type="error" message={actionError} />
                </View>
            )}

            {canManage && (
                <EditUserModal
                    visible={vm.showEditModal}
                    onClose={vm.closeEditModal}
                    onSubmit={handleEditSubmit}
                    user={vm.selected}
                    canChangeRole={canChangeRole}
                />
            )}

            {canManage && (
                <RegisterStudentModal
                    visible={vm.showRegisterModal}
                    onClose={vm.closeRegisterModal}
                    onSubmit={vm.registerUser}
                    initialRole={roleFilter || null}
                    getCohortsForCourse={vm.cohortsForCourse}
                />
            )}

            {permissions.canImportStudents && (
                <ImportStudentsModal
                    visible={vm.showImportModal}
                    onClose={vm.closeImportModal}
                    onImport={vm.importUsers}
                    courses={vm.importCourseOptions}
                    getCohortsForCourse={vm.cohortsForCourse}
                    findExistingStudents={vm.findExistingStudents}
                />
            )}
        </ScrollView>
    );
}