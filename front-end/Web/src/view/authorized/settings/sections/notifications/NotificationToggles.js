// ============================================================
//  NotificationToggles — Toggles de notificaciones por correo
//  UI pura. Los textos descriptivos llegan explícitamente
//  por props — sin roleContext interno.
//
//  Props:
//   - emailAlert / onEmailAlert       : bool + setter
//   - weeklyReport / onWeeklyReport   : bool + setter
//   - atRiskAlert / onAtRiskAlert     : bool + setter
//   - dailySummary / onDailySummary   : bool + setter
//   - descriptions : {
//       emailAlert   : string,
//       weeklyReport : string,
//       atRiskAlert  : string,
//       dailySummary : string,
//     }
// ============================================================
import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ToggleRow, Divider } from "../../../../components/common";
import { useTranslation } from "../../../../../core/utils/i18n/hooks/useTranslation";
import { useSettingsSectionStyles } from "../../modals/useSettingsSectionStyles";

export function NotificationToggles({
    emailAlert,    onEmailAlert,
    weeklyReport,  onWeeklyReport,
    atRiskAlert,   onAtRiskAlert,
    dailySummary,  onDailySummary,
    descriptions,
}) {
    const { t } = useTranslation();
    const { c, sectionTitle } = useSettingsSectionStyles();

    const activeCount = [emailAlert, weeklyReport, atRiskAlert, dailySummary].filter(Boolean).length;

    return (
        <View style={{ gap: 4 }}>
            {/* Encabezado con contador */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={sectionTitle}>{t("Notificaciones")}</Text>
                <View style={{ backgroundColor: c.brand.primaryLight, borderRadius: 14, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>
                        {activeCount} {activeCount !== 1 ? t("activas") : t("activa")}
                    </Text>
                </View>
            </View>

            <Divider />

            <ToggleRow
                label={t("Alertas por correo")}
                description={descriptions?.emailAlert}
                value={emailAlert}
                onToggle={onEmailAlert}
            />
            <ToggleRow
                label={t("Reporte semanal")}
                description={descriptions?.weeklyReport}
                value={weeklyReport}
                onToggle={onWeeklyReport}
            />
            <ToggleRow
                label={t("Alerta de estudiantes en riesgo")}
                description={descriptions?.atRiskAlert}
                value={atRiskAlert}
                onToggle={onAtRiskAlert}
            />
            <ToggleRow
                label={t("Resumen diario")}
                description={descriptions?.dailySummary}
                value={dailySummary}
                onToggle={onDailySummary}
            />

            {activeCount === 0 && (
                <View style={{ marginTop: 10, backgroundColor: c.status.warningLight, borderRadius: 14, padding: 12, flexDirection: "row", gap: 8 }}>
                    <Feather name="bell-off" size={14} color={c.status.warning} style={{ marginTop: 1 }} />
                    <Text style={{ fontSize: 11, color: "#92400E", flex: 1, lineHeight: 18 }}>
                        {t("No tienes ninguna notificación activa. No recibirás avisos sobre asistencia ni estudiantes en riesgo.")}
                    </Text>
                </View>
            )}

            {dailySummary && weeklyReport && (
                <View style={{ marginTop: 10, backgroundColor: c.brand.primaryLight, borderRadius: 14, padding: 12, flexDirection: "row", gap: 8 }}>
                    <Feather name="info" size={13} color={c.brand.primary} style={{ marginTop: 1 }} />
                    <Text style={{ fontSize: 11, color: c.brand.primary, flex: 1, lineHeight: 18 }}>
                        {t("Tienes el resumen diario y el semanal activados. Considera desactivar uno para reducir el volumen de correos.")}
                    </Text>
                </View>
            )}
        </View>
    );
}
