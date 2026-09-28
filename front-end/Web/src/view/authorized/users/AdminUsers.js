// ============================================================
//  FaceAttend EDU — AdminUsers
//
//  Vista de gestión de usuarios para administradores.
//  Diseño simple y limpio, enfocado en la tabla de usuarios.
// ============================================================

import React from "react";
import {
    View, Text, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
    Card, Badge, Avatar, ProgressBar, EmptyState,
    AnimatedDropdown, useAttendanceColor,
} from "../../components/common";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useUsersViewModel } from "../../../viewmodels/useUsersViewModel";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import RegisterStudentModal from "../../components/students/RegisterStudentModal";
import ImportStudentsModal from "../../components/students/ImportStudentsModal";
import StudentDetailModal from "../../components/students/StudentDetailModal";

// ── UserRow ───────────────────────────────────────────────

function UserRow({
    user,
    onPress,
    isLast,
    canManage,
}) {
    const { t } = useTranslation();
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const attColor = useAttendanceColor(user.attendance || 0);

    // Determinar el badge variant según el tipo de usuario
    const roleVariant = {
        student: "default",
        teacher: "info",
        admin: "primary",
    }[user.userType] || "default";

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
                gap: isSmall ? 12 : 0,
            }}
        >
            {/* Columna: ROL */}
            {!isSmall && (
                <View style={{ flex: 0.8, paddingLeft: 14, paddingRight: 14 }}>
                    <Badge variant={roleVariant}>
                        {t(user.typeLabelKey || "Usuario")}
                    </Badge>
                </View>
            )}

            {/* Columna: NOMBRE (con avatar) */}
            <View style={{ flex: isSmall ? 1 : 1.5, flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 14 }}>
                <Avatar name={user.name} size={36} />
                <View>
                    <Text style={{ fontWeight: "600", fontSize: 14, color: c.text.primary }}>
                        {user.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary }}>{user.code}</Text>
                </View>
            </View>

            {!isSmall && (
                <React.Fragment>
                    {/* Columna: CORREO */}
                    <Text style={{ flex: 1.2, fontSize: 13, color: c.text.secondary, paddingLeft: 14, paddingRight: 14 }} numberOfLines={1}>
                        {user.email || "—"}
                    </Text>
                    
                    {/* Columna: PROGRAMA */}
                    <Text style={{ flex: 1, fontSize: 13, color: c.text.primary, paddingLeft: 14, paddingRight: 14 }} numberOfLines={1}>
                        {user.course || "—"}
                    </Text>
                    
                    {/* Columna: ASISTENCIA */}
                    <View style={{ flex: 0.8, paddingLeft: 14, paddingRight: 14 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: attColor, marginBottom: 4 }}>
                            {user.attendance || 0}%
                        </Text>
                        <ProgressBar value={user.attendance || 0} color={attColor} height={5} />
                    </View>
                    
                    {/* Columna: FACIAL */}
                    {canManage && (
                        <View style={{ flex: 0.8, paddingLeft: 14, paddingRight: 14 }}>
                            <Badge variant={user.registered ? "success" : "warning"}>
                                {user.registered ? t("Registrado") : t("Pendiente")}
                            </Badge>
                        </View>
                    )}
                    
                    {/* Columna: ESTADO */}
                    <View style={{ flex: 0.7, paddingLeft: 14, paddingRight: 14 }}>
                        <Badge variant={user.status === "active" ? "success" : "default"}>
                            {user.status === "active" ? t("Activo") : t("Inactivo")}
                        </Badge>
                    </View>
                </React.Fragment>
            )}

            {isSmall && (
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Badge variant={roleVariant}>
                        {t(user.typeLabelKey || "Usuario")}
                    </Badge>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: attColor }}>
                        {user.attendance || 0}%
                    </Text>
                    {canManage && (
                        <Badge variant={user.registered ? "success" : "warning"}>
                            {user.registered ? t("Facial OK") : t("Pendiente")}
                        </Badge>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

// ── AdminUsers ─────────────────────────────────────────────

export function AdminUsers() {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vm = useUsersViewModel();
    const { t } = useTranslation();
    const permissions = useRolePermissions();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    // Definición única de columnas: la misma fuente que usa UserRow,
    // para que header y filas SIEMPRE queden alineados.
    const columnDefs = [
        { label: t("Rol"),        flex: 0.8, paddingLeft: 38 },
        { label: t("Nombre"),     flex: 1.5, paddingLeft: 40 },
        { label: t("Correo"),     flex: 1.2, paddingLeft: 20},
        { label: t("Programa"),   flex: 1,   paddingLeft: 40 },
        { label: t("Asistencia"), flex: 0.8, paddingLeft:  40},
        ...(permissions.canManageStudents
            ? [{ label: t("Facial"), flex: 0.8, paddingLeft: 60 }]
            : []),
        { label: t("Estado"),     flex: 0.7, paddingLeft: 12 },
    ];

    // Ítems del dropdown de cursos
    const courseItems = [
        { value: "", label: t("Todos"), icon: "layers" },
        ...vm.courses,
    ];

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Filtros */}
            <Card padding={14}>
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: 12, flexWrap: "wrap" }}>
                    {/* Búsqueda */}
                    <View style={{ flex: 1, minWidth: 200, position: "relative", justifyContent: "center" }}>
                        <View style={{ position: "absolute", left: 14, zIndex: 1 }}>
                            <Feather name="search" size={16} color={c.text.secondary} />
                        </View>
                        <TextInput
                            placeholder={t("Buscar por nombre o código...")}
                            value={vm.search}
                            onChangeText={vm.setSearch}
                            style={{
                                height: 48, borderWidth: 1.5, borderColor: c.border.primary,
                                borderRadius: 14, paddingLeft: 40, paddingRight: 14,
                                fontSize: 14, backgroundColor: c.background.surface,
                                color: c.text.primary,
                            }}
                            placeholderTextColor={c.text.disabled}
                        />
                    </View>

                    {/* Filtro por curso usando AnimatedDropdown reutilizable */}
                    <AnimatedDropdown
                        items={courseItems}
                        value={vm.courseFilter}
                        onSelect={vm.setCourseFilter}
                        triggerIcon="book-open"
                        style={{ minWidth: 200 }}
                    />
                </View>
            </Card>

            {/* Tabla */}
            <Card padding={0}>
                {!isSmall && (
                    <View style={{
                        flexDirection: "row",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: c.border.primary,
                    }}>
                        {columnDefs.map((col) => (
                            <Text
                                key={col.label}
                                style={{
                                    flex: col.flex,
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: c.text.secondary,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    paddingLeft: col.paddingLeft,
                                    paddingRight: 14,
                                    textAlign: "left",
                                }}
                            >
                                {col.label}
                            </Text>
                        ))}
                    </View>
                )}

                {vm.filteredUsers.length === 0 ? (
                    <EmptyState
                        icon={<Feather name="users" size={40} color={c.text.secondary} />}
                        title={t("Sin resultados")}
                        description={t("Ajusta los filtros o agrega nuevos estudiantes")}
                    />
                ) : vm.filteredUsers.map((user, i) => (
                    <UserRow
                        key={user.id}
                        user={user}
                        onPress={() => vm.selectUser(user)}
                        isLast={i === vm.filteredUsers.length - 1}
                        canManage={permissions.canManageStudents}
                    />
                ))}
            </Card>

            {/* Modales */}
            <StudentDetailModal
                student={vm.selected}
                onClose={vm.clearSelection}
                canManage={permissions.canManageStudents}
                canRegisterFace={permissions.canRegisterFace}
            />

            {permissions.canManageStudents && (
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
