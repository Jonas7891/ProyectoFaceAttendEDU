// ============================================================
//  FaceAttend EDU — BiometricsView
//
//  Pantalla «Biometría»: punto único de acceso a
//   1. Registro facial            (section = "face-register")
//   2. Reconocimiento facial      (section = "face-login")
//   3. Registro de huella         (section = "fingerprint")
//  Backend: 10-ms-face-auth vía Kong (/face-auth/*), ver faceAuthApi.
//
//  La sección activa llega de la URL (/app/biometrics/:section) y la
//  barra lateral comparte el mismo estado, así que la navegación es
//  consistente entre sidebar, pestañas y enlaces directos.
// ============================================================

import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PageHeader, Card, Alert, Button, TextInput, Badge } from "./components/common";
import { FaceModule, FingerprintModule, BiometricDirectory } from "./components/biometrics";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { DESIGN_TOKENS } from "../core/config/theme.config";
import {
    useBiometricsViewModel,
    normalizeBiometricSection,
} from "../viewmodels/useBiometricsViewModel";

const STATUS_ALERT_TYPE = { info: "info", ok: "success", error: "error" };

function SectionTabs({ section, onChange, tabs }) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;
    return (
        <View
            accessibilityRole="tablist"
            style={{
                flexDirection: isSmall ? "column" : "row",
                gap: 8,
                padding: 4,
                borderRadius: DESIGN_TOKENS.borderRadius.xl,
                backgroundColor: c.background.surface,
                borderWidth: 1,
                borderColor: c.border.primary,
            }}
        >
            {tabs.map((tab) => {
                const active = tab.key === section;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        onPress={() => onChange(tab.key)}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: DESIGN_TOKENS.borderRadius.lg,
                            backgroundColor: active ? c.brand.primary : "transparent",
                        }}
                    >
                        <Feather name={tab.icon} size={18} color={active ? c.brand.textOnPrimary : c.text.secondary} />
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: active ? c.brand.textOnPrimary : c.text.secondary,
                            }}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function BiometricsView({ section: sectionParam, onSectionChange }) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const { t } = useTranslation();
    const c = theme.colors;
    const vm = useBiometricsViewModel();
    const section = normalizeBiometricSection(sectionParam);

    const tabs = [
        { key: "face-register", label: t("Registro facial"), icon: "user-plus" },
        { key: "face-login", label: t("Reconocimiento facial"), icon: "user-check" },
        { key: "fingerprint", label: t("Registro de huella"), icon: "target" },
    ];
    const current = tabs.find((tab) => tab.key === section);

    const needsUsername = section !== "face-login";
    const apiBadge =
        vm.health === "ok"
            ? { variant: "success", text: t("API conectada") }
            : vm.health === "down"
              ? { variant: "danger", text: t("API sin conexión") }
              : { variant: "default", text: t("Comprobando API...") };

    const headerActions = (
        <>
            <Badge variant={apiBadge.variant} size="sm" dot>
                {apiBadge.text}
            </Badge>
            {vm.health === "down" && (
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Feather name="refresh-cw" size={14} color={c.text.secondary} />}
                    onPress={async () => {
                        if (await vm.checkHealth()) vm.loadUsers();
                    }}
                >
                    {t("Reintentar")}
                </Button>
            )}
        </>
    );

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={t("Biometría")}
                subtitle={t("Registro y reconocimiento facial, y registro de huella dactilar")}
                actions={headerActions}
            />

            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16, alignItems: "center" }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ width: "100%", maxWidth: 1180, gap: 16 }}>
                    <SectionTabs section={section} onChange={onSectionChange} tabs={tabs} />

                    {vm.health === "down" && (
                        <Alert
                            type="error"
                            title={t("Servicio de biometría no disponible")}
                            message={t(
                                "No se pudo contactar con 10-ms-face-auth a través del gateway. Verifica que los contenedores face-auth-api y kong-gateway estén en ejecución."
                            )}
                        />
                    )}

                    <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16, alignItems: "flex-start" }}>
                        <View style={{ flex: isSmall ? undefined : 2, width: isSmall ? "100%" : undefined, minWidth: 0 }}>
                            <Card padding="lg" contentStyle={{ gap: DESIGN_TOKENS.spacing.lg }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: c.brand.primaryLight,
                                        }}
                                    >
                                        <Feather name={current.icon} size={18} color={c.brand.primary} />
                                    </View>
                                    <Text style={{ color: c.text.primary, fontSize: 20, fontWeight: "700" }}>
                                        {current.label}
                                    </Text>
                                </View>

                                {needsUsername && (
                                    <View style={{ gap: 6 }}>
                                        <TextInput
                                            label={t("Usuario")}
                                            value={vm.username}
                                            onChangeText={vm.setUsername}
                                            placeholder={t("Usuario")}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            helperText={
                                                section === "fingerprint"
                                                    ? t("Persona a la que se asocia la huella al guardar la muestra.")
                                                    : t("Persona a la que se asocia el rostro.")
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            style={{ alignSelf: "flex-start" }}
                                            disabled={vm.busy}
                                            leftIcon={<Feather name="search" size={14} color={c.text.secondary} />}
                                            onPress={vm.checkUser}
                                        >
                                            {t("Verificar disponibilidad")}
                                        </Button>
                                    </View>
                                )}

                                {section === "fingerprint" ? (
                                    <FingerprintModule vm={vm} />
                                ) : (
                                    <FaceModule vm={vm} mode={section === "face-register" ? "register" : "login"} />
                                )}

                                <Alert
                                    type={STATUS_ALERT_TYPE[vm.status.tone] || "info"}
                                    message={vm.status.text}
                                />
                            </Card>
                        </View>

                        <View style={{ flex: isSmall ? undefined : 1, width: isSmall ? "100%" : undefined, minWidth: isSmall ? 0 : 280 }}>
                            <BiometricDirectory vm={vm} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
