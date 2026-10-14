// ============================================================
//  FaceAttend EDU — BiometricDirectory
//
//  Panel lateral: resumen biométrico de la persona seleccionada.
//
//  Antes mostraba un directorio de TODAS las personas registradas y las
//  "sesiones activas" de 10-ms-face-auth (`/api/users`, `/api/users/active`).
//  Ninguno de los dos tiene equivalente en ms-biometric: el primero no existe
//  como endpoint (el servicio no expone "listar todo el mundo con biometría"),
//  y el segundo era el tracking de sesiones JWT propio de face-auth, que se
//  eliminó junto con esa capa de identidad duplicada (la sesión real siempre
//  fue la de ms-identity). Este panel se reduce a lo que SÍ existe: el
//  resumen rostro/huella de la persona elegida en PersonAutocomplete.
// ============================================================

import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, Badge, Card, EmptyState } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { DESIGN_TOKENS } from "../../../core/config/theme.config";
import { fullName } from "../../../services/api/referenceData";

export default function BiometricDirectory({ vm }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    return (
        <Card padding="md" contentStyle={{ gap: DESIGN_TOKENS.spacing.md }}>
            <Text style={{ color: c.text.primary, fontSize: 16, fontWeight: "700" }}>
                {t("Resumen biométrico")}
            </Text>

            {!vm.person ? (
                <EmptyState
                    icon="user"
                    title={t("Ninguna persona seleccionada")}
                    message={t("Elige una persona para ver su estado de rostro y huella.")}
                    style={{ padding: DESIGN_TOKENS.spacing.lg }}
                />
            ) : (
                <View style={{ gap: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Feather name="user" size={16} color={c.text.secondary} />
                        <Text numberOfLines={1} style={{ color: c.text.primary, fontSize: 14, flexShrink: 1 }}>
                            {fullName(vm.person) || vm.person.personId}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                        <Badge variant={vm.summary?.has_face ? "success" : "default"} size="sm" icon="smile">
                            {t("Rostro")}: {vm.summary?.has_face ? t("sí") : t("no")}
                        </Badge>
                        <Badge variant={vm.summary?.has_fingerprint ? "success" : "default"} size="sm" icon="target">
                            {t("Huella")}: {vm.summary?.has_fingerprint ? t("sí") : t("no")}
                        </Badge>
                    </View>
                </View>
            )}

            <Button
                variant="ghost"
                size="sm"
                disabled={!vm.person}
                leftIcon={<Feather name="refresh-cw" size={14} color={c.text.secondary} />}
                onPress={vm.refreshSummary}
            >
                {t("Actualizar")}
            </Button>
        </Card>
    );
}
