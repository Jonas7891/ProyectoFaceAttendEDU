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

import React, { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, EmptyState, SearchInput, PageHeader } from "./components/common";
import { ConfirmModal } from "./components/common/modals/ConfirmModal";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useAppData } from "../context/AppDataContext";
import { useEnvironmentsViewModel } from "../viewmodels/useEnvironmentsViewModel";
import { useRolePermissions } from "../viewmodels/useRolePermissions";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { usePushNotification } from "./components/common/feedback/PushNotification";
import { getInstitutionConfig } from "../core/config/institutionConfig";
import {
    EnvironmentCard,
    EnvironmentDetailModal,
    EnvironmentFormModal,
    ScheduleModal,
} from "./components/environments";

// ── EnvironmentsView ─────────────────────────────────────────

export default function EnvironmentsView() {
    const { isSmall, isMedium } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vm = useEnvironmentsViewModel();
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const appData = useAppData();

    // Código de ficha por cohortId para las filas de horario de la tarjeta.
    const cohortCodeById = React.useMemo(() => {
        const map = new Map();
        for (const ficha of appData.fichas ?? []) {
            if (ficha?.code) {
                map.set(String(ficha.id ?? ficha.cohortId), ficha.code);
                map.set(Number(ficha.id ?? ficha.cohortId), ficha.code);
            }
        }
        return map;
    }, [appData.fichas]);
    const cohortCodeOf = React.useCallback(
        (cohortId) => cohortCodeById.get(cohortId) ?? cohortCodeById.get(Number(cohortId)) ?? null,
        [cohortCodeById]
    );
    const pushNotification = usePushNotification();
    // Eliminar pide confirmación; el error del servidor se muestra dentro del diálogo.
    const [pendingDelete, setPendingDelete] = useState(null); // { kind: "environment"|"schedule", envId, scheduleId? }
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    const totalSchedules = vm.environments.reduce((acc, env) => acc + env.schedules.length, 0);
    const withoutSchedules = vm.environments.filter((env) => env.schedules.length === 0).length;

    const closeDeleteDialog = () => {
        if (deleteBusy) return;
        setPendingDelete(null);
        setDeleteError(null);
    };

    // El viewmodel devuelve null si eliminó o el mensaje de error; la lista local solo cambia en éxito.
    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const config = getInstitutionConfig();
        const isEnv = pendingDelete.kind === "environment";
        setDeleteBusy(true);
        setDeleteError(null);
        let err;
        try {
            err = isEnv
                ? await vm.removeEnvironment(pendingDelete.envId)
                : await vm.removeSchedule(pendingDelete.envId, pendingDelete.scheduleId);
        } catch (_e) {
            err = isEnv
                ? t("No se pudo eliminar el ambiente. Intenta nuevamente.")
                : t("No se pudo eliminar el horario. Intenta nuevamente.");
        }
        setDeleteBusy(false);
        if (err) {
            setDeleteError(t(err));
            if (config.pushNotifications) {
                pushNotification.error(t("Error al eliminar"), t(err), {
                    source: "environments-view",
                    priority: "high",
                    duration: 5000,
                });
            }
            return;
        }
        setPendingDelete(null);
        if (config.pushNotifications) {
            pushNotification.success(
                isEnv ? t("Ambiente eliminado") : t("Horario eliminado"),
                isEnv
                    ? t("El ambiente ha sido eliminado correctamente")
                    : t("El horario ha sido eliminado del ambiente"),
                { source: "environments-view", priority: "normal", duration: 3000 }
            );
        }
    };

    // Subtitle dinámico con estadísticas
    const pageSubtitle = vm.isLoading
        ? t("Cargando ambientes...")
        : `${vm.filtered.length} ${
              vm.filtered.length !== 1 ? t("ambientes registrados") : t("ambiente registrado")
          }`;

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            {/* Page Header */}
            <PageHeader
                title={t("Ambientes")}
                subtitle={pageSubtitle}
                actions={
                    permissions.canManageEnvironments && (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onPress={vm.openRegisterModal}
                            leftIcon={<Feather name="plus" size={16} color={c.brand.textOnPrimary} />}
                        >
                            {t("Nuevo ambiente")}
                        </Button>
                    )
                }
            />

            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Barra superior: SearchInput a la izquierda + Stats compactas a la derecha */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: 12, alignItems: "center" }}>
                    {/* Search bar */}
                    <View style={{ width: isSmall ? "100%" : 420 }}>
                        <SearchInput
                            placeholder={t("Buscar por ambiente, ficha o instructor...")}
                            value={vm.search}
                            onChangeText={vm.setSearch}
                        />
                    </View>

                    {/* Mini stats - Cards compactas que ocupan el espacio restante */}
                    <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
                        {[
                            {
                                label: t("Total ambientes"),
                                value: vm.environments.length,
                                color: c.brand.primary,
                                icon: "home",
                            },
                            {
                                label: t("Total horarios"),
                                value: totalSchedules,
                                color: c.status.success,
                                icon: "clock",
                            },
                            {
                                label: t("Sin horarios"),
                                value: withoutSchedules,
                                color: c.status.warning,
                                icon: "alert-circle",
                            },
                        ].map(({ label, value, color, icon }) => (
                            <View
                                key={label}
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    backgroundColor: c.background.surface,
                                    borderRadius: 12,
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    borderWidth: 1,
                                    borderColor: c.border.primary + "40",
                                }}
                            >
                                <View
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: color + "20",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Feather name={icon} size={14} color={color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            fontWeight: "600",
                                            color: c.text.secondary,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.2,
                                        }}
                                    >
                                        {label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 18,
                                            fontWeight: "800",
                                            color: c.text.primary,
                                            marginTop: -2,
                                        }}
                                    >
                                        {value}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Grid de ambientes */}
                {vm.filtered.length === 0 ? (
                    <EmptyState
                        icon="home"
                        title={t("Sin ambientes")}
                        description={t("No se encontraron ambientes con ese criterio")}
                    />
                ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                        {vm.filtered.map((env) => (
                            <View
                                key={env.id}
                                style={{
                                    flexBasis: isSmall ? "100%" : isMedium ? "48%" : "31%",
                                    flexGrow: 0,
                                    flexShrink: 1,
                                }}
                            >
                                <EnvironmentCard
                                    environment={env}
                                    onPress={() => vm.selectEnvironment(env)}
                                    cohortCodeOf={cohortCodeOf}
                                />
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
                    onDelete={() => {
                        setDeleteError(null);
                        setPendingDelete({ kind: "environment", envId: vm.selected.id });
                    }}
                    onAddSchedule={() => vm.openAddSchedule(vm.selected.id)}
                    onEditSchedule={(schedule) => vm.openEditSchedule(vm.selected.id, schedule)}
                    onDeleteSchedule={(scheduleId) => {
                        setDeleteError(null);
                        setPendingDelete({ kind: "schedule", envId: vm.selected.id, scheduleId });
                    }}
                    canManage={permissions.canManageEnvironments}
                />
            )}

            <ConfirmModal
                visible={pendingDelete != null}
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
                loading={deleteBusy}
                variant="danger"
                title={pendingDelete?.kind === "schedule" ? t("Eliminar horario") : t("Eliminar ambiente")}
                message={
                    deleteError ??
                    (pendingDelete?.kind === "schedule"
                        ? t("Se eliminará el horario del ambiente. ¿Continuar?")
                        : t("Se eliminará el ambiente. ¿Continuar?"))
                }
                confirmText={t("Eliminar")}
            />

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
                getCurrentEnvironment={vm.getCurrentEnvironment}
                getCourseByCode={vm.getCourseByCode}
                getCohortsForCourse={vm.cohortsForCourse}
            />
        </View>
    );
}
