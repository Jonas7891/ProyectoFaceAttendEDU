import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { Card, Button, ToggleRow, Divider } from "./components/common";
import { Navbar as PageHeader } from "./components/common/navigation/Navbar";
import { useTheme } from "./components/hooks/useTheme";
import { generateTheme } from "../core/theme/generateTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../i18n/hooks/useTranslation";
import { useRolePermissions } from "./hooks/useRolePermissions";
import {
    ModeSelector,
    LanguageSelector,
    ThemePreview,
    AccentColorSelector,
    StatsRow,
    SecurityMeter,
    ConfidenceGuide,
} from "./components/settings/tabs";

export default function SettingsView() {
    const { isSmall } = useResponsive();
    const { theme, mode, accentColor, setAccentColor } = useTheme();
    const { currentLanguage, t } = useTranslation();
    const permissions = useRolePermissions();
    const c = theme.colors;

    const [section, setSection] = useState("appearance");

    const [previewAccent, setPreviewAccent] = useState(accentColor);
    const [hasUnsaved, setHasUnsaved] = useState(false);

    const previewTheme = generateTheme(previewAccent, mode);

    function handlePreviewChange(hex) {
        setPreviewAccent(hex);
        setHasUnsaved(hex.toLowerCase() !== accentColor.toLowerCase());
    }

    // Estados de settings
    const [institutionName, setInstitutionName] = useState("Universidad Nacional");
    const [minAttendance, setMinAttendance] = useState(80);
    const [daysUntilSanction, setDaysUntilSanction] = useState(15);
    const [semester, setSemester] = useState("2024-2");
    const [confidence, setConfidence] = useState(85);
    const [autoRegister, setAutoRegister] = useState(true);
    const [savePhotos, setSavePhotos] = useState(false);
    const [emailAlert, setEmailAlert] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [atRiskAlert, setAtRiskAlert] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTime, setSessionTime] = useState("60");
    const [saved, setSaved] = useState(false);

    const activeNotifications = [emailAlert, weeklyReport, atRiskAlert, dailySummary].filter(Boolean).length;

    // Secciones visibles seg�n el rol
    const ALL_SECTIONS = [
        { id: "general", label: t("General"), icon: "globe", desc: t("Instituci�n y semestre"), adminOnly: true },
        { id: "facial", label: t("Reconocimiento"), icon: "aperture", desc: t("Umbral y c�mara"), adminOnly: true },
        { id: "notifications", label: t("Notificaciones"), icon: "bell", desc: t("Alertas y reportes"), adminOnly: false },
        { id: "security", label: t("Seguridad"), icon: "shield", desc: t("Acceso y sesiones"), adminOnly: true },
        { id: "appearance", label: t("Apariencia"), icon: "sliders", desc: t("Tema y colores"), adminOnly: false },
    ];

    const SECTIONS = ALL_SECTIONS.filter(s => !s.adminOnly || permissions.canManageUsers);

    function handleSave() {
        if (hasUnsaved) {
            setAccentColor(previewAccent);
            setHasUnsaved(false);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    function handleDiscard() {
        setPreviewAccent(accentColor);
        setHasUnsaved(false);
    }

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

    // Badge de notificaciones activas por secci�n
    function SectionBadge({ id }) {
        if (id === "notifications" && activeNotifications > 0) {
            return (
                <View style={{
                    width: 18,
                    height: 18,
                    borderRadius: 14,
                    backgroundColor: c.brand.primary,
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>
                        {activeNotifications}
                    </Text>
                </View>
            );
        }
        if (id === "security" && !twoFactor) {
            return <Feather name="alert-triangle" size={12} color="#F59E0B" />;
        }
        return null;
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <PageHeader
                title={t("Configuraci�n")}
                subtitle={t("Personaliza FaceAttend EDU a tu instituci�n")}
                actions={
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                        {hasUnsaved && (
                            <React.Fragment>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    backgroundColor: c.status.warningLight,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 14,
                                }}>
                                    <View style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 14,
                                        backgroundColor: c.status.warning
                                    }} />
                                    <Text style={{
                                        fontSize: 11,
                                        color: c.status.warning,
                                        fontWeight: "600"
                                    }}>
                                        {t("Sin guardar")}
                                    </Text>
                                </View>
                                <Button variant="ghost" size="sm" onPress={handleDiscard}>
                                    {t("Descartar")}
                                </Button>
                            </React.Fragment>
                        )}
                        <Button variant="primary" onPress={handleSave} size="sm">
                            {saved ? t("�Guardado ?") : t("Guardar cambios")}
                        </Button>
                    </View>
                }
            />

            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 20 }}>
                {/* -- Nav lateral -- */}
                <Card padding={6} style={isSmall ? undefined : { width: 220, alignSelf: "flex-start" }}>
                    {isSmall ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: "row", gap: 2 }}>
                                {SECTIONS.map(s => {
                                    const active = section === s.id;
                                    return (
                                        <TouchableOpacity
                                            key={s.id}
                                            onPress={() => setSection(s.id)}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 8,
                                                paddingVertical: 10,
                                                paddingHorizontal: 12,
                                                borderRadius: 14,
                                                backgroundColor: active ? c.brand.primaryLight : "transparent",
                                            }}
                                        >
                                            <Feather
                                                name={s.icon}
                                                size={14}
                                                color={active ? c.brand.primary : c.text.secondary}
                                            />
                                            <Text style={{
                                                fontSize: 10,
                                                fontWeight: active ? "600" : "400",
                                                color: active ? c.brand.primary : c.text.secondary
                                            }}>
                                                {s.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={{ gap: 1 }}>
                            {SECTIONS.map(s => {
                                const active = section === s.id;
                                return (
                                    <TouchableOpacity
                                        key={s.id}
                                        onPress={() => setSection(s.id)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            paddingVertical: 12,
                                            paddingHorizontal: 10,
                                            borderRadius: 14,
                                            backgroundColor: active ? c.brand.primaryLight : "transparent",
                                        }}
                                    >
                                        <Feather
                                            name={s.icon}
                                            size={15}
                                            color={active ? c.brand.primary : c.text.secondary}
                                        />
                                        <View style={{ flex: 1, marginLeft: 9 }}>
                                            <Text style={{
                                                fontSize: 10,
                                                fontWeight: active ? "600" : "400",
                                                color: active ? c.brand.primary : c.text.secondary
                                            }}>
                                                {s.label}
                                            </Text>
                                            {!active && (
                                                <Text style={{
                                                    fontSize: 11,
                                                    color: c.text.disabled,
                                                    marginTop: 1
                                                }}>
                                                    {s.desc}
                                                </Text>
                                            )}
                                        </View>
                                        <SectionBadge id={s.id} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </Card>

                {/* -- Contenido -- */}
                <Card style={{ flex: 1 }}>
                    {/* -- GENERAL ------------------------------------------ */}
                    {section === "general" && (
                        <View style={{ gap: 18 }}>
                            <Text style={sectionTitle}>{t("General")}</Text>

                            <View>
                                <Text style={labelStyle}>{t("Nombre de la instituci�n")}</Text>
                                <TextInput
                                    value={institutionName}
                                    onChangeText={setInstitutionName}
                                    style={inputStyle}
                                />
                                <Text style={descStyle}>
                                    {t("Aparece en reportes, correos y en la cabecera de la app.")}
                                </Text>
                            </View>

                            <View>
                                <Text style={labelStyle}>{t("Semestre activo")}</Text>
                                <TextInput
                                    value={semester}
                                    onChangeText={setSemester}
                                    placeholder={t("Ej: 2024-2")}
                                    placeholderTextColor={c.text.disabled}
                                    style={inputStyle}
                                />
                                <Text style={descStyle}>
                                    {t("Formato recomendado: A�O-PER�ODO (ej. 2025-1). Se usa para agrupar los registros de asistencia.")}
                                </Text>
                            </View>

                            <View>
                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                    marginBottom: 8
                                }}>
                                    <View>
                                        <Text style={labelStyle}>
                                            {t("Asistencia m�nima requerida")}
                                        </Text>
                                        <Text style={[descStyle, { marginTop: 0 }]}>
                                            {t("Umbral para marcar estudiantes \"en riesgo\"")}
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: "800",
                                        color: c.brand.primary
                                    }}>
                                        {minAttendance}%
                                    </Text>
                                </View>
                                <Slider
                                    minimumValue={50}
                                    maximumValue={100}
                                    step={5}
                                    value={minAttendance}
                                    onValueChange={setMinAttendance}
                                    minimumTrackTintColor={c.brand.primary}
                                    maximumTrackTintColor={c.border.primary}
                                />
                                {/* Marcas de referencia */}
                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 4
                                }}>
                                    {[50, 60, 70, 80, 90, 100].map(v => (
                                        <Text
                                            key={v}
                                            style={{
                                                fontSize: 11,
                                                color: v === minAttendance ? c.brand.primary : c.text.disabled,
                                                fontWeight: v === minAttendance ? "700" : "400",
                                            }}
                                        >
                                            {v}%
                                        </Text>
                                    ))}
                                </View>
                                {/* Gu�a contextual */}
                                <View style={{
                                    marginTop: 10,
                                    backgroundColor: minAttendance >= 90 ? c.status.warningLight : c.brand.primaryLight,
                                    borderRadius: 14,
                                    padding: 12,
                                    flexDirection: "row",
                                    gap: 8,
                                }}>
                                    <Feather
                                        name={minAttendance >= 90 ? "alert-triangle" : "info"}
                                        size={13}
                                        color={minAttendance >= 90 ? c.status.warning : c.brand.primary}
                                        style={{ marginTop: 1 }}
                                    />
                                    <Text style={{
                                        fontSize: 11,
                                        color: minAttendance >= 90 ? "#92400E" : c.brand.primary,
                                        flex: 1,
                                        lineHeight: 18
                                    }}>
                                        {minAttendance >= 90
                                            ? t("Umbral muy alto � muchos estudiantes podr�an quedar en riesgo aunque asistan con regularidad.")
                                            : minAttendance <= 60
                                            ? t("Umbral bajo � los estudiantes tendr�n mucha flexibilidad de faltar. Aseg�rate de que sea intencional.")
                                            : `${t("Con este umbral, un estudiante puede faltar hasta")} ${Math.floor((100 - minAttendance))} ${t("clases de cada 100 sin quedar en riesgo.")}`
                                        }
                                    </Text>
                                </View>
                            </View>

                            <Divider />

                            {/* Idioma de la aplicaci�n */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                gap: 12,
                                zIndex: 100
                            }}>
                                {/* Texto a la izquierda */}
                                <View style={{ flex: 1 }}>
                                    <Text style={labelStyle}>
                                        {t("Idioma de la aplicaci�n")}
                                    </Text>
                                    <Text style={[descStyle, { marginTop: 0 }]}>
                                        {t("Traduce toda la interfaz autom�ticamente. El espa�ol es el idioma original de FaceAttend EDU.")}
                                    </Text>
                                </View>
                                {/* Selector a la derecha */}
                                <LanguageSelector />
                            </View>

                            <View>
                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                    marginBottom: 8
                                }}>
                                    <View>
                                        <Text style={labelStyle}>
                                            {t("Días de inasistencia para sanción")}
                                        </Text>
                                        <Text style={[descStyle, { marginTop: 0 }]}>
                                            {t("Número de días de ausencia que activa alerta de sanción")}
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: "800",
                                        color: c.brand.primary
                                    }}>
                                        {daysUntilSanction} {t("días")}
                                    </Text>
                                </View>
                                <Slider
                                    minimumValue={5}
                                    maximumValue={30}
                                    step={1}
                                    value={daysUntilSanction}
                                    onValueChange={setDaysUntilSanction}
                                    minimumTrackTintColor={c.brand.primary}
                                    maximumTrackTintColor={c.border.primary}
                                />
                                {/* Marcas de referencia */}
                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 4
                                }}>
                                    {[5, 10, 15, 20, 25, 30].map(v => (
                                        <Text
                                            key={v}
                                            style={{
                                                fontSize: 11,
                                                color: v === daysUntilSanction ? c.brand.primary : c.text.disabled,
                                                fontWeight: v === daysUntilSanction ? "700" : "400",
                                            }}
                                        >
                                            {v}
                                        </Text>
                                    ))}
                                </View>
                                {/* Guía contextual */}
                                <View style={{
                                    marginTop: 10,
                                    backgroundColor: daysUntilSanction <= 7 ? c.status.dangerLight : daysUntilSanction <= 15 ? c.status.warningLight : c.brand.primaryLight,
                                    borderRadius: 14,
                                    padding: 12,
                                    flexDirection: "row",
                                    gap: 8,
                                }}>
                                    <Feather
                                        name={daysUntilSanction <= 7 ? "alert-circle" : daysUntilSanction <= 15 ? "alert-triangle" : "info"}
                                        size={13}
                                        color={daysUntilSanction <= 7 ? c.status.danger : daysUntilSanction <= 15 ? c.status.warning : c.brand.primary}
                                        style={{ marginTop: 1 }}
                                    />
                                    <Text style={{
                                        fontSize: 11,
                                        color: daysUntilSanction <= 7 ? "#991B1B" : daysUntilSanction <= 15 ? "#92400E" : c.brand.primary,
                                        flex: 1,
                                        lineHeight: 18
                                    }}>
                                        {daysUntilSanction <= 7
                                            ? t("Umbral muy estricto — Los estudiantes podrían quedar en riesgo de sanción rápidamente. Recomendado para programas con asistencia obligatoria diaria.")
                                            : daysUntilSanction <= 15
                                            ? t("Umbral moderado — Balance entre seguimiento temprano y flexibilidad. Valor recomendado para la mayoría de instituciones.")
                                            : t("Umbral flexible — Los estudiantes tienen más margen antes de recibir alerta. Útil para programas con clases semanales o menor frecuencia.")
                                        }
                                    </Text>
                                </View>
                            </View>

                            <Divider />

                            {/* Resumen r�pido */}
                            <Text style={{
                                fontSize: 10,
                                fontWeight: "600",
                                color: c.text.secondary,
                                letterSpacing: 0.5,
                                textTransform: "uppercase"
                            }}>
                                {t("Resumen actual")}
                            </Text>
                            <View style={{ gap: 0 }}>
                                <StatsRow
                                    label={t("Instituci�n")}
                                    value={institutionName || t("Sin definir")}
                                    icon="home"
                                    color={c.brand.primary}
                                />
                                <Divider />
                                <StatsRow
                                    label={t("Semestre activo")}
                                    value={semester || t("Sin definir")}
                                    icon="calendar"
                                    color="#8B5CF6"
                                />
                                <Divider />
                                <StatsRow
                                    label={t("M�nimo de asistencia")}
                                    value={`${minAttendance}%`}
                                    icon="bar-chart-2"
                                    color="#10B981"
                                />
                                <Divider />
                                <StatsRow
                                    label={t("Días para sanción")}
                                    value={`${daysUntilSanction} días`}
                                    icon="alert-triangle"
                                    color="#EF4444"
                                />
                                <Divider />
                                <StatsRow
                                    label={t("Idioma")}
                                    value={currentLanguage?.labelES ?? t("Espa�ol")}
                                    icon="globe"
                                    color="#3B82F6"
                                />
                            </View>
                        </View>
                    )}

                    {/* -- RECONOCIMIENTO ----------------------------------- */}
                    {section === "facial" && (
                        <View style={{ gap: 18 }}>
                            <Text style={sectionTitle}>
                                {t("Reconocimiento facial")}
                            </Text>

                            <View>
                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                    marginBottom: 8
                                }}>
                                    <View>
                                        <Text style={labelStyle}>
                                            {t("Umbral de confianza")}
                                        </Text>
                                        <Text style={[descStyle, { marginTop: 0 }]}>
                                            {t("Qu� tan seguro debe estar el modelo para registrar")}
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: "800",
                                        color: c.brand.primary
                                    }}>
                                        {confidence}%
                                    </Text>
                                </View>
                                <Slider
                                    minimumValue={60}
                                    maximumValue={99}
                                    step={1}
                                    value={confidence}
                                    onValueChange={setConfidence}
                                    minimumTrackTintColor={c.brand.primary}
                                    maximumTrackTintColor={c.border.primary}
                                />
                                {/* Zonas de referencia */}
                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 4
                                }}>
                                    {[`60 � ${t("Permisivo")}`, "75", "85 ?", `95 � ${t("Estricto")}`, "99"].map((v, i) => (
                                        <Text
                                            key={i}
                                            style={{ fontSize: 11, color: c.text.disabled }}
                                        >
                                            {v}
                                        </Text>
                                    ))}
                                </View>
                                <View style={{ marginTop: 12 }}>
                                    <ConfidenceGuide value={confidence} />
                                </View>
                            </View>

                            <Divider />

                            <ToggleRow
                                label={t("Registro autom�tico")}
                                description={t("Registra automáticamente al detectar el rostro sin confirmación manual")}
                                value={autoRegister}
                                onToggle={() => setAutoRegister(v => !v)}
                            />

                            {/* Advertencia contextual */}
                            {autoRegister && confidence < 75 && (
                                <View style={{
                                    backgroundColor: c.status.warningLight,
                                    borderRadius: 14,
                                    padding: 12,
                                    flexDirection: "row",
                                    gap: 8,
                                }}>
                                    <Feather
                                        name="alert-triangle"
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
                                        {t("Con umbral bajo y registro automático habilitado, hay mayor riesgo de registrar asistencia incorrectamente. Considera subir el umbral a al menos 75%.")}
                                    </Text>
                                </View>
                            )}

                            <ToggleRow
                                label={t("Guardar fotos de registro")}
                                description={t("Almacena la foto tomada al registrar. útil para auditorías pero consume m�s espacio.")}
                                value={savePhotos}
                                onToggle={() => setSavePhotos(v => !v)}
                            />

                            {savePhotos && (
                                <View style={{
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
                                        {t("Las fotos se almacenan localmente. Asegurate de tener suficiente espacio y de informar a los estudiantes seg�n tu pol�tica de privacidad.")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* -- NOTIFICACIONES ----------------------------------- */}
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
                                description={t("Envía un correo al docente cuando un estudiante no asiste. Ideal para clases peque�as o con seguimiento individual.")}
                                value={emailAlert}
                                onToggle={() => setEmailAlert(v => !v)}
                            />
                            <ToggleRow
                                label={t("Reporte semanal")}
                                description={t("Resumen automático de asistencia enviado cada lunes a las 8am. Incluye porcentajes por curso.")}
                                value={weeklyReport}
                                onToggle={() => setWeeklyReport(v => !v)}
                            />
                            <ToggleRow
                                label={t("Alerta de estudiantes en riesgo")}
                                description={`${t("Notifica cuando un estudiante cae por debajo del")} ${minAttendance}% ${t("de asistencia m�nima configurado en General.")}`}
                                value={atRiskAlert}
                                onToggle={() => setAtRiskAlert(v => !v)}
                            />
                            <ToggleRow
                                label={t("Resumen diario")}
                                description={t("Resumen automático de asistencia al finalizar el día. Puede generar muchas notificaciones en d�as de muchas clases.")}
                                value={dailySummary}
                                onToggle={() => setDailySummary(v => !v)}
                            />

                            {/* Aviso si ninguna activa */}
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

                            {/* Aviso si diario + semanal */}
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
                                label={t("Autenticaci�n de dos factores")}
                                description={t("Requiere un código adicional al iniciar sesión. Protege la cuenta aunque alguien obtenga tu contrase�a.")}
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
                                        ? t(" ? Sesiones largas aumentan el riesgo si el dispositivo queda desbloqueado.")
                                        : parseInt(sessionTime) <= 15
                                        ? t(" Sesión muy corta el usuario deberá iniciar sesión con frecuencia.")
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

                            {/* Modo de visualizaci�n */}
                            <View style={{ gap: 8 }}>
                                <Text style={labelStyle}>
                                    {t("Modo de visualización")}
                                </Text>
                                <Text style={descStyle}>
                                    {t("Elige el tema base de la interfaz. Afecta fondos, textos y superficies de toda la app.")}
                                </Text>
                                <ModeSelector />
                            </View>

                            <Divider />

                            {/* Color de acento */}
                            <View style={{ gap: 10 }}>
                                <View>
                                    <Text style={labelStyle}>
                                        {t("Color de acento")}
                                    </Text>
                                    <Text style={descStyle}>
                                        {t("Este color se aplica a botones principales, tabs activos, barras de progreso, bordes de foco y todos los elementos interactivos. Los cambios se previsualizan abajo � presiona \"Guardar cambios\" para aplicarlos en toda la app.")}
                                    </Text>
                                </View>
                                <AccentColorSelector
                                    previewHex={previewAccent}
                                    onPreviewChange={handlePreviewChange}
                                />
                            </View>

                            <Divider />

                            {/* Preview */}
                            <View style={{ gap: 8 }}>
                                <Text style={labelStyle}>
                                    {t("Vista previa en vivo")}
                                </Text>
                                <ThemePreview previewTheme={previewTheme} />
                            </View>

                            {/* Banner informativo */}
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
                                    {t("La preview muestra como se ver el color en botones, badges y elementos activos. Presiona \"Guardar cambios\" para aplicarlo en toda la app.")}
                                </Text>
                            </View>
                        </View>
                    )}
                </Card>
            </View>
        </ScrollView>
    );
}
