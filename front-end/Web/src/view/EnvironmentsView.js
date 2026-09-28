// ============================================================
//  FaceAttend EDU — Environments VIEW (Presentation Layer)
//
//  RESPONSABILIDAD: Presentación de la interfaz de ambientes ("cómo se presenta")
//
//  Este componente:
//  ✓ Renderiza la lista de ambientes con sus horarios
//  ✓ Muestra filtros de búsqueda
//  ✓ Presenta modales de registro, edición y detalle
//  ✓ Adapta la UI según permisos del usuario
//
//  Toda la lógica de negocio está en useEnvironmentsViewModel.
//  Las acciones de gestión se muestran condicionalmente según useRolePermissions.
// ============================================================

import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Button, EmptyState } from "./components/common";
import { Navbar as PageHeader } from "./components/common/navigation/Navbar";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useEnvironmentsViewModel } from "../viewmodels/useEnvironmentsViewModel";
import { useRolePermissions } from "../viewmodels/useRolePermissions";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import {
    EnvironmentCard,
    EnvironmentDetailModal,
    EnvironmentFormModal,
    ScheduleModal,
} from "./components/environments";

// ── EnvironmentsView ─────────────────────────────────────────

export default function EnvironmentsView() {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vm = useEnvironmentsViewModel();
    const { t } = useTranslation();
    const permissions = useRolePermissions();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    const totalSchedules = vm.environments.reduce((acc, env) => acc + env.schedules.length, 0);
    const withoutSchedules = vm.environments.filter((env) => env.schedules.length === 0).length;

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Page Header */}
                <PageHeader
                    title={t("Ambientes")}
                    subtitle={`${vm.filtered.length} ${
                        vm.filtered.length !== 1 ? t("ambientes registrados") : t("ambiente registrado")
                    }`}
                    actions={
                        /* Solo admin puede crear ambientes */
                        permissions.canManageEnvironments ? (
                            <Button variant="primary" size="sm" onPress={vm.openRegisterModal}>
                                + {t("Nuevo ambiente")}
                            </Button>
                        ) : undefined
                    }
                />

                {/* Mini stats */}
                <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                    {[
                        {
                            label: t("Total ambientes"),
                            value: vm.environments.length,
                            color: c.brand.primary,
                        },
                        {
                            label: t("Total horarios"),
                            value: totalSchedules,
                            color: c.status.success,
                        },
                        {
                            label: t("Sin horarios"),
                            value: withoutSchedules,
                            color: c.status.warning,
                        },
                    ].map(({ label, value, color }) => (
                        <Card key={label} style={{ flex: 1, minWidth: 160, alignItems: "center" }} padding={16}>
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: c.text.secondary,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 8,
                                    textAlign: "center",
                                }}
                            >
                                {label}
                            </Text>
                            <Text style={{ fontSize: 28, fontWeight: "800", color }}>{value}</Text>
                        </Card>
                    ))}
                </View>

                {/* Search bar */}
                <View style={{ maxWidth: 480, position: "relative", justifyContent: "center" }}>
                    <View style={{ position: "absolute", left: 14, zIndex: 1 }}>
                        <Feather name="search" size={16} color={c.text.secondary} />
                    </View>
                    <TextInput
                        placeholder={t("Buscar por ambiente, ficha o instructor...")}
                        value={vm.search}
                        onChangeText={vm.setSearch}
                        style={{
                            height: 48,
                            borderWidth: 1,
                            borderColor: c.border.primary,
                            borderRadius: 14,
                            paddingLeft: 44,
                            paddingRight: 14,
                            fontSize: 14,
                            backgroundColor: c.background.surface,
                            color: c.text.primary,
                        }}
                        placeholderTextColor={c.text.disabled}
                    />
                </View>

                {/* Grid de ambientes */}
                {vm.filtered.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={<Feather name="home" size={40} color={c.text.secondary} />}
                            title={t("Sin ambientes")}
                            description={t("No se encontraron ambientes con ese criterio")}
                        />
                    </Card>
                ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                        {vm.filtered.map((env) => (
                            <View key={env.id} style={{ flexBasis: isSmall ? "100%" : "30%", flexGrow: 1 }}>
                                <EnvironmentCard environment={env} onPress={() => vm.selectEnvironment(env)} />
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Modal de detalle */}
            {vm.envModalMode === "detail" && (
                <EnvironmentDetailModal
                    environment={vm.selected}
                    onClose={vm.clearSelection}
                    onEdit={() => vm.openEditModal(vm.selected)}
                    onDelete={() => vm.removeEnvironment(vm.selected.id)}
                    onAddSchedule={() => vm.openAddSchedule(vm.selected.id)}
                    onEditSchedule={(schedule) => vm.openEditSchedule(vm.selected.id, schedule)}
                    onDeleteSchedule={(scheduleId) => vm.removeSchedule(vm.selected.id, scheduleId)}
                />
            )}

            {/* Modal registro/edición ambiente */}
            <EnvironmentFormModal
                visible={vm.envModalMode === "register" || vm.envModalMode === "edit"}
                mode={vm.envModalMode === "edit" ? "edit" : "register"}
                environment={vm.selected}
                onClose={vm.closeEnvModal}
                onSubmit={async (form) => {
                    if (vm.envModalMode === "edit" && vm.selected) {
                        return vm.editEnvironment(vm.selected.id, form);
                    }
                    return vm.registerEnvironment(form);
                }}
            />

            {/* Modal horario */}
            <ScheduleModal
                visible={vm.scheduleModalMode !== "none"}
                mode={vm.scheduleModalMode}
                editing={vm.editingSchedule}
                envId={vm.scheduleTargetEnvId}
                searchFn={vm.searchInstructors}
                onClose={vm.closeScheduleModal}
                onSave={vm.saveSchedule}
            />
        </View>
    );
}
