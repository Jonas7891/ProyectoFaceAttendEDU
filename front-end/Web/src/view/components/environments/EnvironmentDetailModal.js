// ============================================================
//  FaceAttend EDU — EnvironmentDetailModal
//  Modal de detalle con horarios de un ambiente
// ============================================================

import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, BaseModal, Card, EmptyState } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import ScheduleRow from "./ScheduleRow";

export default function EnvironmentDetailModal({
    environment,
    onClose,
    onEdit,
    onDelete,
    onAddSchedule,
    onEditSchedule,
    onDeleteSchedule,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    if (!environment) return null;

    const footer = (
        <>
            <Button
                variant="outline"
                size="sm"
                onPress={onDelete}
                leftIcon={<Feather name="trash-2" size={14} color={c.status.danger} />}
            >
                <Text style={{ color: c.status.danger }}>{t("Eliminar")}</Text>
            </Button>
            <Button variant="ghost" size="sm" onPress={onClose}>
                {t("Cerrar")}
            </Button>
            <Button
                variant="primary"
                size="sm"
                onPress={onEdit}
                leftIcon={<Feather name="edit-2" size={14} color="#fff" />}
            >
                {t("Editar ambiente")}
            </Button>
        </>
    );

    return (
        <BaseModal
            visible={!!environment}
            onClose={onClose}
            title={`${t("Ambiente")} ${environment.number}`}
            icon="home"
            iconColor={c.brand.primary}
            size="md"
            footer={footer}
        >
            {/* Capacity info */}
            {environment.capacity && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
                    <Feather name="users" size={14} color={c.text.secondary} />
                    <Text style={{ fontSize: 13, color: c.text.secondary }}>
                        {environment.capacity} {t("personas")}
                    </Text>
                </View>
            )}

            {/* Description */}
            <View
                style={{
                    backgroundColor: c.background.app,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 18,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Feather name="map-pin" size={14} color={c.text.secondary} />
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: c.text.secondary,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                        }}
                    >
                        {t("Ubicación / Descripción")}
                    </Text>
                </View>
                <Text style={{ fontSize: 14, color: c.text.primary, lineHeight: 22 }}>
                    {environment.description}
                </Text>
            </View>

            {/* Schedules section */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                }}
            >
                <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                    {t("Horarios asignados")}
                </Text>
                <Button variant="primary" size="sm" onPress={onAddSchedule}>
                    <Feather name="plus" size={14} color="#fff" /> {t("Añadir horario")}
                </Button>
            </View>

            <Card padding={0}>
                {environment.schedules.length === 0 ? (
                    <EmptyState
                        icon={<Feather name="calendar" size={36} color={c.text.secondary} />}
                        title={t("Sin horarios")}
                        description={t("Este ambiente no tiene horarios asignados aún")}
                    />
                ) : (
                    environment.schedules.map((schedule, i) => (
                        <ScheduleRow
                            key={schedule.id}
                            schedule={schedule}
                            onEdit={() => onEditSchedule(schedule)}
                            onDelete={() => onDeleteSchedule(schedule.id)}
                            isLast={i === environment.schedules.length - 1}
                        />
                    ))
                )}
            </Card>
        </BaseModal>
    );
}
