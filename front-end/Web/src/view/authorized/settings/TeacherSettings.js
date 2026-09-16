// ============================================================
//  FaceAttend EDU — TeacherSettings
//
//  Configuración para profesores.
//  Incluye: notificaciones, seguridad y apariencia.
//  NO incluye: configuración general de la institución ni 
//  reconocimiento facial (solo admin).
// ============================================================

import React, { useState, useEffect } from "react";
import { View, Text, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, ToggleRow, Divider } from "../../components/common";
import { useTheme } from "../../components/hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import {
    ModeSelector,
    ThemePreview,
    AccentColorSelector,
    SecurityMeter,
} from "../../components/settings/tabs";
import { 
    getInstitutionConfig, 
    updateInstitutionConfig,
} from "../../../core/config/institutionConfig";

export function TeacherSettings({ 
    section,
    onSave,
    previewAccent,
    onPreviewChange,
    previewTheme,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    // Estados de configuración
    const [minAttendance, setMinAttendance] = useState(80);
    const [emailAlert, setEmailAlert] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [atRiskAlert, setAtRiskAlert] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTime, setSessionTime] = useState("60");

    // Cargar configuración desde localStorage al montar
    useEffect(() => {
        const config = getInstitutionConfig();
        
        setMinAttendance(config.minAttendance);
        setEmailAlert(config.emailAlert);
        setWeeklyReport(config.weeklyReport);
        setAtRiskAlert(config.atRiskAlert);
        setDailySummary(config.dailySummary);
        setTwoFactor(config.twoFactor);
        setSessionTime(String(config.sessionTime));
    }, []);

    const activeNotifications = [emailAlert, weeklyReport, atRiskAlert, dailySummary].filter(Boolean).length;

    // Exponer función de guardado al padre
    React.useEffect(() => {
        if (onSave) {
            onSave(() => {
                return updateInstitutionConfig({
                    emailAlert,
                    weeklyReport,
                    atRiskAlert,
                    dailySummary,
                    twoFactor,
                    sessionTime: parseInt(sessionTime),
                });
            });
        }
    }, [
        onSave, emailAlert, weeklyReport, atRiskAlert, dailySummary, twoFactor, sessionTime
    ]);

    const labelStyle = { fontSize: 10, fontWeight: "500", color: c.text.primary, marginBottom: 6 };
    const descStyle = { fontSize: 11, color: c.text.secondary, marginTop: 4, lineHeight: 18 };
    const inputStyle = {
        height: 44,
        borderWidth: 1.5,
        borderColor: c.border.primary,
        borderRadius: 14,
        paddingHorizontal: 14,
        fontSize: 11,
        color: c.text.primary,
        backgroundColor: c.background.surface,
    };
    const sectionTitle = { fontSize: 10, fontWeight: "700", color: c.text.primary };

    return (
        <Card style={{ flex: 1 }}>
            {/* -- NOTIFICACIONES ------------------------------------ */}
            {section === "notifications" && (
                <View style={{ gap: 4 }}>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12
                    }}>
                        <Text style={sectionTitle}>
                            {t("Notificaciones")}
                        </Text>
                        <View style={{
                            backgroundColor: c.brand.primaryLight,
                            borderRadius: 14,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                        }}>
                            <Text style={{
                                fontSize: 11,
                                color: c.brand.primary,
                                fontWeight: "600"
                            }}>
                                {activeNotifications} {activeNotifications !== 1 ? t("activas") : t("activa")}
                            </Text>
                        </View>
                    </View>
                    <Divider />
                    <ToggleRow
                        label={t("Alertas por correo")}
                        description={t("Envía un correo cuando un estudiante de tus cursos no asiste. Ideal para clases pequeñas o con seguimiento individual.")}
                        value={emailAlert}
                        onToggle={() => setEmailAlert(v => !v)}
                    />
                    <ToggleRow
                        label={t("Reporte semanal")}
                        description={t("Resumen automático de asistencia de tus cursos enviado cada lunes a las 8am.")}
                        value={weeklyReport}
                        onToggle={() => setWeeklyReport(v => !v)}
                    />
                    <ToggleRow
                        label={t("Alerta de estudiantes en riesgo")}
                        description={`${t("Notifica cuando un estudiante de tus cursos cae por debajo del")} ${minAttendance}% ${t("de asistencia mínima.")}`}
                        value={atRiskAlert}
                        onToggle={() => setAtRiskAlert(v => !v)}
                    />
                    <ToggleRow
                        label={t("Resumen diario")}
                        description={t("Resumen automático de asistencia de tus cursos al finalizar el día.")}
                        value={dailySummary}
                        onToggle={() => setDailySummary(v => !v)}
                    />

                    {activeNotifications === 0 && (
                        <View style={{
                            marginTop: 10,
                            backgroundColor: c.status.warningLight,
                            borderRadius: 14,
                            padding: 12,
                            flexDirection: "row",
                            gap: 8,
                        }}>
                            <Feather
                                name="bell-off"
                                size={14}
                                color={c.status.warning}
                                style={{ marginTop: 1 }}
                            />
                            <Text style={{
                                fontSize: 11,
                                color: "#92400E",
                                flex: 1,
                                lineHeight: 18
                            }}>
                                {t("No tienes ninguna notificación activa. No recibirás avisos sobre asistencia ni estudiantes en riesgo.")}
                            </Text>
                        </View>
                    )}

                    {dailySummary && weeklyReport && (
                        <View style={{
                            marginTop: 10,
                            backgroundColor: c.brand.primaryLight,
                            borderRadius: 14,
                            padding: 12,
                            flexDirection: "row",
                            gap: 8,
                        }}>
                            <Feather
                                name="info"
                                size={13}
                                color={c.brand.primary}
                                style={{ marginTop: 1 }}
                            />
                            <Text style={{
                                fontSize: 11,
                                color: c.brand.primary,
                                flex: 1,
                                lineHeight: 18
                            }}>
                                {t("Tienes el resumen diario y el semanal activados. Considera desactivar uno para reducir el volumen de correos.")}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* -- SEGURIDAD ----------------------------------------- */}
            {section === "security" && (
                <View style={{ gap: 18 }}>
                    <Text style={sectionTitle}>
                        {t("Seguridad")}
                    </Text>

                    <SecurityMeter
                        twoFactor={twoFactor}
                        sessionTime={sessionTime}
                    />

                    <Divider />

                    <ToggleRow
                        label={t("Autenticación de dos factores")}
                        description={t("Requiere un código adicional al iniciar sesión. Protege la cuenta aunque alguien obtenga tu contraseña.")}
                        value={twoFactor}
                        onToggle={() => setTwoFactor(v => !v)}
                    />

                    {!twoFactor && (
                        <View style={{
                            backgroundColor: c.status.warningLight,
                            borderRadius: 14,
                            padding: 12,
                            flexDirection: "row",
                            gap: 8,
                        }}>
                            <Feather
                                name="shield"
                                size={13}
                                color={c.status.warning}
                                style={{ marginTop: 1 }}
                            />
                            <Text style={{
                                fontSize: 11,
                                color: "#92400E",
                                flex: 1,
                                lineHeight: 18
                            }}>
                                {t("Sin 2FA, la cuenta queda vulnerable si la contraseña se compromete. Se recomienda activarlo.")}
                            </Text>
                        </View>
                    )}

                    <View>
                        <Text style={labelStyle}>
                            {t("Tiempo de sesión (minutos)")}
                        </Text>
                        <TextInput
                            keyboardType="numeric"
                            value={sessionTime}
                            onChangeText={setSessionTime}
                            style={[inputStyle, { width: 140 }]}
                        />
                        <Text style={descStyle}>
                            {t("La sesión se cerrará automáticamente tras este tiempo de inactividad.")}
                            {parseInt(sessionTime) > 120
                                ? t(" ⚠ Sesiones largas aumentan el riesgo si el dispositivo queda desbloqueado.")
                                : parseInt(sessionTime) <= 15
                                ? t(" Sesión muy corta — el usuario deberá iniciar sesión con frecuencia.")
                                : t(" Tiempo razonable para uso normal en aula.")}
                        </Text>
                    </View>
                </View>
            )}

            {/* -- APARIENCIA ---------------------------------------- */}
            {section === "appearance" && (
                <View style={{ gap: 20 }}>
                    <Text style={sectionTitle}>
                        {t("Apariencia")}
                    </Text>

                    <View style={{ gap: 8 }}>
                        <Text style={labelStyle}>
                            {t("Modo de visualización")}
                        </Text>
                        <Text style={descStyle}>
                            {t("Elige el tema base de la interfaz. Afecta fondos, textos y superficies de todo el programa.")}
                        </Text>
                        <ModeSelector />
                    </View>

                    <Divider />

                    <View style={{ gap: 10 }}>
                        <View>
                            <Text style={labelStyle}>
                                {t("Color de acento")}
                            </Text>
                            <Text style={descStyle}>
                                {t("Este color se aplica a botones principales, tabs activos, barras de progreso, bordes de foco y todos los elementos interactivos. Los cambios se previsualizan abajo — presiona \"Guardar cambios\" para aplicarlos en toda la aplicación.")}
                            </Text>
                        </View>
                        <AccentColorSelector
                            previewHex={previewAccent}
                            onPreviewChange={onPreviewChange}
                        />
                    </View>

                    <Divider />

                    <View style={{ gap: 8 }}>
                        <Text style={labelStyle}>
                            {t("Vista previa en vivo")}
                        </Text>
                        <ThemePreview previewTheme={previewTheme} />
                    </View>

                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        backgroundColor: c.brand.primaryLight,
                        borderRadius: 14,
                        padding: 12,
                    }}>
                        <Feather
                            name="info"
                            size={13}
                            color={c.brand.primary}
                        />
                        <Text style={{
                            fontSize: 11,
                            color: c.brand.primary,
                            flex: 1,
                            lineHeight: 18
                        }}>
                            {t("La preview muestra como se verá el color en botones, badges y elementos activos. Presiona \"Guardar cambios\" para aplicarlo en toda la aplicación.")}
                        </Text>
                    </View>
                </View>
            )}
        </Card>
    );
}
