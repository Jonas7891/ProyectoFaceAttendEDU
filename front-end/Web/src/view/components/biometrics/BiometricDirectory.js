// ============================================================
//  FaceAttend EDU — BiometricDirectory
//
//  Panel lateral: personas con biometría registrada y sesiones
//  biométricas activas (login por rostro/huella en las últimas horas).
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, Badge, Card, EmptyState } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { DESIGN_TOKENS } from "../../../core/config/theme.config";

function Toggle({ active, label, onPress }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <TouchableOpacity
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderRadius: DESIGN_TOKENS.borderRadius.md,
                backgroundColor: active ? c.brand.primary : "transparent",
            }}
        >
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: active ? c.brand.textOnPrimary : c.text.secondary,
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export default function BiometricDirectory({ vm }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    const showActive = vm.sideView === "active";
    const list = showActive ? vm.activeUsers : vm.users;

    return (
        <Card padding="md" contentStyle={{ gap: DESIGN_TOKENS.spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: c.text.primary, fontSize: 16, fontWeight: "700" }}>
                    {showActive ? t("Sesiones biométricas") : t("Personas registradas")}
                </Text>
                <Badge variant="primary" size="sm">
                    {String(list.length)}
                </Badge>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    padding: 4,
                    gap: 4,
                    borderRadius: DESIGN_TOKENS.borderRadius.lg,
                    backgroundColor: c.background.app,
                    borderWidth: 1,
                    borderColor: c.border.primary,
                }}
            >
                <Toggle active={!showActive} label={t("Directorio")} onPress={() => vm.setSideView("directory")} />
                <Toggle active={showActive} label={t("Activas")} onPress={() => vm.setSideView("active")} />
            </View>

            {list.length === 0 ? (
                <EmptyState
                    icon="users"
                    title={showActive ? t("Sin sesiones activas") : t("Aún no hay personas registradas")}
                    message={showActive ? t("Nadie ha iniciado sesión con biometría.") : t("Registra un rostro o una huella para empezar.")}
                    style={{ padding: DESIGN_TOKENS.spacing.lg }}
                />
            ) : (
                <View>
                    {list.map((person, index) => (
                        <View
                            key={person.username}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                                paddingVertical: 10,
                                borderTopWidth: index === 0 ? 0 : 1,
                                borderTopColor: c.border.primary,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
                                <Feather
                                    name={showActive ? "radio" : "user"}
                                    size={16}
                                    color={showActive ? c.status.success : c.text.secondary}
                                />
                                <Text numberOfLines={1} style={{ color: c.text.primary, fontSize: 14, flexShrink: 1 }}>
                                    {person.username}
                                </Text>
                            </View>
                            <View style={{ flexDirection: "row", gap: 6 }}>
                                {person.has_face && (
                                    <Badge variant="success" size="sm" icon="smile">
                                        {t("Rostro")}
                                    </Badge>
                                )}
                                {person.has_fingerprint && (
                                    <Badge variant="info" size="sm" icon="target">
                                        {t("Huella")}
                                    </Badge>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <Button
                variant="ghost"
                size="sm"
                leftIcon={<Feather name="refresh-cw" size={14} color={c.text.secondary} />}
                onPress={vm.loadUsers}
            >
                {t("Actualizar listas")}
            </Button>
        </Card>
    );
}
