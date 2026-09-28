// ============================================================
//  AttendanceThresholds — Sliders de asistencia mínima y
//  días para sanción (módulo de Reconocimiento Facial)
//  
//  Ahora ubicado en la sección "Reconocimiento" para administradores,
//  ya que estas configuraciones están estrechamente relacionadas
//  con el sistema de detección y seguimiento facial.
//
//  UI pura. Sin estado propio.
//
//  Props:
//   - minAttendance / onMinAttendanceChange       : number + setter
//   - daysUntilSanction / onDaysSanctionChange    : number + setter
// ============================================================
import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { Divider } from "../../../../components/common";
import { useTranslation } from "../../../../../core/utils/i18n/hooks/useTranslation";
import { useSettingsSectionStyles } from "../../modals/useSettingsSectionStyles";

export function AttendanceThresholds({
    minAttendance, onMinAttendanceChange,
    daysUntilSanction, onDaysSanctionChange,
}) {
    const { t } = useTranslation();
    const { c, labelStyle, descStyle } = useSettingsSectionStyles();

    return (
        <View style={{ gap: 18 }}>
            {/* Asistencia mínima */}
            <View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                    <View>
                        <Text style={labelStyle}>{t("Asistencia mínima requerida")}</Text>
                        <Text style={[descStyle, { marginTop: 0 }]}>{t("Umbral para marcar estudiantes \"en riesgo\"")}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: c.brand.primary }}>{minAttendance}%</Text>
                </View>
                <Slider
                    minimumValue={50} maximumValue={100} step={5}
                    value={minAttendance} onValueChange={onMinAttendanceChange}
                    minimumTrackTintColor={c.brand.primary}
                    maximumTrackTintColor={c.border.primary}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                    {[50, 60, 70, 80, 90, 100].map((v) => (
                        <Text key={v} style={{ fontSize: 11, color: v === minAttendance ? c.brand.primary : c.text.disabled, fontWeight: v === minAttendance ? "700" : "400" }}>
                            {v}%
                        </Text>
                    ))}
                </View>
                <View style={{
                    marginTop: 10,
                    backgroundColor: minAttendance >= 90 ? c.status.warningLight : c.brand.primaryLight,
                    borderRadius: 14, padding: 12, flexDirection: "row", gap: 8,
                }}>
                    <Feather name={minAttendance >= 90 ? "alert-triangle" : "info"} size={13} color={minAttendance >= 90 ? c.status.warning : c.brand.primary} style={{ marginTop: 1 }} />
                    <Text style={{ fontSize: 11, color: minAttendance >= 90 ? "#92400E" : c.brand.primary, flex: 1, lineHeight: 18 }}>
                        {minAttendance <= 60
                            ? t("Umbral bajo — los estudiantes tendrán mucha flexibilidad de faltar. Asegúrate de que sea intencional.")
                            : `${t("Con este umbral, un estudiante puede faltar hasta")} ${Math.floor(100 - minAttendance)} ${t("clases de cada 100 sin quedar en riesgo.")}`}
                    </Text>
                </View>
            </View>

            <Divider />

            {/* Días para sanción */}
            <View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                    <View>
                        <Text style={labelStyle}>{t("Días de inasistencia para sanción")}</Text>
                        <Text style={[descStyle, { marginTop: 0 }]}>{t("Número de días de ausencia que activa alerta de sanción")}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: c.brand.primary }}>{daysUntilSanction} {t("días")}</Text>
                </View>
                <Slider
                    minimumValue={5} maximumValue={30} step={1}
                    value={daysUntilSanction} onValueChange={onDaysSanctionChange}
                    minimumTrackTintColor={c.brand.primary}
                    maximumTrackTintColor={c.border.primary}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                    {[5, 10, 15, 20, 25, 30].map((v) => (
                        <Text key={v} style={{ fontSize: 11, color: v === daysUntilSanction ? c.brand.primary : c.text.disabled, fontWeight: v === daysUntilSanction ? "700" : "400" }}>
                            {v}
                        </Text>
                    ))}
                </View>
                <View style={{
                    marginTop: 10,
                    backgroundColor: daysUntilSanction <= 7 ? c.status.dangerLight : daysUntilSanction <= 15 ? c.status.warningLight : c.brand.primaryLight,
                    borderRadius: 14, padding: 12, flexDirection: "row", gap: 8,
                }}>
                    <Feather
                        name={daysUntilSanction <= 7 ? "alert-circle" : daysUntilSanction <= 15 ? "alert-triangle" : "info"}
                        size={13}
                        color={daysUntilSanction <= 7 ? c.status.danger : daysUntilSanction <= 15 ? c.status.warning : c.brand.primary}
                        style={{ marginTop: 1 }}
                    />
                    <Text style={{ fontSize: 11, color: daysUntilSanction <= 7 ? "#991B1B" : daysUntilSanction <= 15 ? "#92400E" : c.brand.primary, flex: 1, lineHeight: 18 }}>
                        {daysUntilSanction <= 7
                            ? t("Umbral muy estricto — Los estudiantes podrían quedar en riesgo de sanción rápidamente. Recomendado para programas con asistencia obligatoria diaria.")
                            : daysUntilSanction <= 15
                            ? t("Umbral moderado — Balance entre seguimiento temprano y flexibilidad. Valor recomendado para la mayoría de instituciones.")
                            : t("Umbral flexible — Los estudiantes tienen más margen antes de recibir alerta. Útil para programas con clases semanales o menor frecuencia.")}
                    </Text>
                </View>
            </View>
        </View>
    );
}
