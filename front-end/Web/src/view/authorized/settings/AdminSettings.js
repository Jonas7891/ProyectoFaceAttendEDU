import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { Card, Button, ToggleRow, Divider, InfoModal } from "../../components/common";
import { PeriodExpirationAlert } from "../../components/settings/PeriodExpirationAlert";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import {
    ModeSelector,
    LanguageSelector,
    ThemePreview,
    AccentColorSelector,
    StatsRow,
    SecurityMeter,
    ConfidenceGuide,
    AcademicPeriodSelector,
    DateRangePicker,
} from "../../components/settings/tabs";
import { 
    ACADEMIC_PERIOD_TYPES, 
    ACADEMIC_PERIOD_CONFIG,
    getCurrentPeriod,
    getFullPeriodLabel,
} from "../../../core/constants/academicPeriods";
import { 
    getInstitutionConfig, 
    updateInstitutionConfig,
    checkPeriodExpiration,
} from "../../../core/config/institutionConfig";

export function AdminSettings({ 
    section,
    onSave,
    previewAccent,
    onPreviewChange,
    previewTheme,
}) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const { currentLanguage, t } = useTranslation();
    const c = theme.colors;

    // Estados de configuración
    const [configLoaded, setConfigLoaded] = useState(false);
    const [institutionName, setInstitutionName] = useState("Universidad Nacional");
    const [institutionSlug, setInstitutionSlug] = useState("universidad-nacional");
    const [minAttendance, setMinAttendance] = useState(80);
    const [daysUntilSanction, setDaysUntilSanction] = useState(15);
    const [semester, setSemester] = useState("2024-2");
    const [academicPeriodType, setAcademicPeriodType] = useState("trimestral");
    
    // Nuevos estados para períodos con fechas
    const [periodStartDate, setPeriodStartDate] = useState("");
    const [periodEndDate, setPeriodEndDate] = useState("");
    const [isAutomaticPeriod, setIsAutomaticPeriod] = useState(true);
    const [showExpirationAlert, setShowExpirationAlert] = useState(true);
    
    // Estado para controlar el modal informativo
    const [showInfoModal, setShowInfoModal] = useState(false);
    
    const [confidence, setConfidence] = useState(85);
    const [autoRegister, setAutoRegister] = useState(true);
    const [savePhotos, setSavePhotos] = useState(false);
    const [emailAlert, setEmailAlert] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [atRiskAlert, setAtRiskAlert] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTime, setSessionTime] = useState("60");

    // Cargar configuración desde localStorage al montar
    useEffect(() => {
        const config = getInstitutionConfig();
        
        setInstitutionName(config.institutionName);
        setInstitutionSlug(config.institutionSlug);
        setSemester(config.semester);
        setAcademicPeriodType(config.academicPeriodType);
        
        // Cargar configuración de períodos
        setPeriodStartDate(config.periodStartDate || "");
        setPeriodEndDate(config.periodEndDate || "");
        setIsAutomaticPeriod(config.isAutomaticPeriod ?? true);
        
        setMinAttendance(config.minAttendance);
        setDaysUntilSanction(config.daysUntilSanction);
        setConfidence(config.confidenceThreshold);
        setAutoRegister(config.autoRegister);
        setSavePhotos(config.savePhotos);
        setEmailAlert(config.emailAlert);
        setWeeklyReport(config.weeklyReport);
        setAtRiskAlert(config.atRiskAlert);
        setDailySummary(config.dailySummary);
        setTwoFactor(config.twoFactor);
        setSessionTime(String(config.sessionTime));
        
        setConfigLoaded(true);
    }, []);

    const activeNotifications = [emailAlert, weeklyReport, atRiskAlert, dailySummary].filter(Boolean).length;

    // Calcular período actual automático
    const automaticPeriod = React.useMemo(() => {
        if (!configLoaded) return null;
        return getCurrentPeriod(academicPeriodType);
    }, [academicPeriodType, configLoaded]);

    // Verificar expiración del período
    const periodExpiration = React.useMemo(() => {
        if (!configLoaded) return null;
        return checkPeriodExpiration();
    }, [periodStartDate, periodEndDate, configLoaded]);

    // Ref para almacenar la función suggestDates del DateRangePicker
    const suggestDatesRef = React.useRef(null);

    // Handler que llama a la función del DateRangePicker
    const handleSuggestDates = () => {
        if (suggestDatesRef.current) {
            suggestDatesRef.current();
        }
    };

    // Mostrar alerta automáticamente cuando el período expira o está por expirar
    React.useEffect(() => {
        if (periodExpiration && (periodExpiration.hasExpired || periodExpiration.isExpiringSoon)) {
            setShowExpirationAlert(true);
        }
    }, [periodExpiration]);

    // Exponer función de guardado al padre
    React.useEffect(() => {
        if (onSave) {
            onSave(() => {
                return updateInstitutionConfig({
                    institutionName,
                    institutionSlug,
                    semester,
                    academicPeriodType,
                    periodStartDate,
                    periodEndDate,
                    isAutomaticPeriod,
                    minAttendance,
                    daysUntilSanction,
                    confidenceThreshold: confidence,
                    autoRegister,
                    savePhotos,
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
        onSave, institutionName, institutionSlug, semester, academicPeriodType,
        periodStartDate, periodEndDate, isAutomaticPeriod, minAttendance, daysUntilSanction,
        confidence, autoRegister, savePhotos, emailAlert, weeklyReport,
        atRiskAlert, dailySummary, twoFactor, sessionTime
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
            {/* -- GENERAL ------------------------------------------ */}
            {section === "general" && (
                <View style={{ gap: 18 }}>
                    <Text style={sectionTitle}>{t("General")}</Text>

                    {/* Alerta de expiración de período */}
                    {periodExpiration && (periodExpiration.hasExpired || periodExpiration.isExpiringSoon) && showExpirationAlert && (
                        <PeriodExpirationAlert
                            expirationInfo={periodExpiration}
                            isAutomaticMode={isAutomaticPeriod}
                            onConfigure={() => {
                                // Scroll o focus al selector de fechas
                                // En este caso, simplemente cerramos la alerta para que vean el selector
                                setShowExpirationAlert(false);
                            }}
                            onDismiss={() => setShowExpirationAlert(false)}
                        />
                    )}

                    {/* Información de la institución */}
                    <View style={{ 
                        flexDirection: isSmall ? "column" : "row", 
                        gap: 12 
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={labelStyle}>{t("Nombre de la institución")}</Text>
                            <TextInput
                                value={institutionName}
                                onChangeText={setInstitutionName}
                                style={inputStyle}
                                placeholder={t("Ej: Universidad Nacional")}
                                placeholderTextColor={c.text.disabled}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={labelStyle}>{t("Identificador único (slug)")}</Text>
                            <TextInput
                                value={institutionSlug}
                                onChangeText={(text) => setInstitutionSlug(text.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                style={inputStyle}
                                placeholder={t("Ej: universidad-nacional")}
                                placeholderTextColor={c.text.disabled}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={labelStyle}>{t("Tipo de período académico")}</Text>
                            <AcademicPeriodSelector
                                value={academicPeriodType}
                                onChange={setAcademicPeriodType}
                            />
                        </View>
                    </View>

                    <Text style={descStyle}>
                        {t("El nombre aparece en reportes y correos. El identificador se usa en la URL. El tipo de período define cómo se divide el año lectivo.")}
                    </Text>

                    <Divider />

                    {/* Idioma de la aplicación */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={labelStyle}>
                                {t("Idioma de la aplicación")}
                            </Text>
                            <Text style={[descStyle, { marginTop: 0 }]}>
                                {t("Traduce toda la interfaz automáticamente. El español es el idioma original de FaceAttend EDU.")}
                            </Text>
                        </View>
                        <LanguageSelector />
                    </View>

                    <Divider />

                    {/* Período actual activo */}
                    <View>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 8
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={labelStyle}>
                                    {t("Configuración del período académico actual")}
                                </Text>
                                <Text style={[descStyle, { marginTop: 0 }]}>
                                    {t("Define las fechas del período actual. En modo automático, se calculará el próximo período basándose en la duración del actual.")}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowInfoModal(true)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: c.brand.primary,
                                    textDecorationLine: "underline",
                                }}>
                                    {t("¿Cómo funciona?")}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Selector de modo */}
                        <View style={{ 
                            flexDirection: "row", 
                            gap: 8, 
                            marginBottom: 16,
                            flexWrap: "wrap"
                        }}>
                            <Button
                                variant={isAutomaticPeriod ? "primary" : "outline"}
                                size="sm"
                                onPress={() => setIsAutomaticPeriod(true)}
                                style={{ minWidth: 120 }}
                            >
                                <Feather 
                                    name="zap" 
                                    size={14} 
                                    color={isAutomaticPeriod ? "#fff" : c.text.secondary}
                                />
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "600",
                                    color: isAutomaticPeriod ? "#fff" : c.text.primary,
                                }}>
                                    {t("Automático")}
                                </Text>
                            </Button>

                            <Button
                                variant={!isAutomaticPeriod ? "primary" : "outline"}
                                size="sm"
                                onPress={() => setIsAutomaticPeriod(false)}
                                style={{ minWidth: 120 }}
                            >
                                <Feather 
                                    name="edit-3" 
                                    size={14} 
                                    color={!isAutomaticPeriod ? "#fff" : c.text.secondary}
                                />
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "600",
                                    color: !isAutomaticPeriod ? "#fff" : c.text.primary,
                                }}>
                                    {t("Manual")}
                                </Text>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={handleSuggestDates}
                                style={{ 
                                    backgroundColor: c.brand.primaryLight,
                                }}
                            >
                                <Feather 
                                    name="calendar" 
                                    size={14} 
                                    color={c.brand.primary}
                                />
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "600",
                                    color: c.brand.primary,
                                }}>
                                    {t("Sugerir fechas")}
                                </Text>
                            </Button>
                        </View>

                        {/* Selector de fechas */}
                        <DateRangePicker
                            startDate={periodStartDate}
                            endDate={periodEndDate}
                            onStartDateChange={setPeriodStartDate}
                            onEndDateChange={setPeriodEndDate}
                            periodType={academicPeriodType}
                            onSuggestDatesRef={(fn) => { suggestDatesRef.current = fn; }}
                        />

                        {/* Información sobre el modo seleccionado */}
                        <View style={{
                            marginTop: 12,
                            backgroundColor: isAutomaticPeriod ? c.status.successLight : c.status.warningLight,
                            borderRadius: 14,
                            padding: 12,
                            flexDirection: "row",
                            gap: 8,
                        }}>
                            <Feather
                                name={isAutomaticPeriod ? "info" : "alert-triangle"}
                                size={13}
                                color={isAutomaticPeriod ? c.status.success : c.status.warning}
                                style={{ marginTop: 1 }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: isAutomaticPeriod ? "#065F46" : "#92400E",
                                    marginBottom: 4,
                                }}>
                                    {isAutomaticPeriod
                                        ? t("Modo Automático Activado")
                                        : t("Modo Manual Activado")
                                    }
                                </Text>
                                <Text style={{
                                    fontSize: 11,
                                    color: isAutomaticPeriod ? "#065F46" : "#92400E",
                                    lineHeight: 18
                                }}>
                                    {isAutomaticPeriod
                                        ? t("Al finalizar el período actual, el sistema calculará automáticamente las fechas del próximo período basándose en la duración del actual y actualizará la configuración.")
                                        : t("Al finalizar el período actual, recibirás una alerta para que configures manualmente las fechas del nuevo período. El sistema NO actualizará las fechas automáticamente.")
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Modal informativo */}
                    <InfoModal
                        visible={showInfoModal}
                        onClose={() => setShowInfoModal(false)}
                        title={t("Período detectado por división del año")}
                        icon="calendar"
                    >
                        <View style={{ gap: 12 }}>
                            {automaticPeriod && (
                                <View>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: "600",
                                        color: c.brand.primary,
                                        marginBottom: 8,
                                    }}>
                                        {getFullPeriodLabel(automaticPeriod)}
                                    </Text>
                                    <Text style={{
                                        fontSize: 13,
                                        color: c.text.primary,
                                        lineHeight: 20,
                                    }}>
                                        {t("Este cálculo se basa en dividir el año calendario según el tipo de período seleccionado.")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </InfoModal>

                    {/* Asistencia mínima */}
                    <View>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            marginBottom: 8
                        }}>
                            <View>
                                <Text style={labelStyle}>
                                    {t("Asistencia mínima requerida")}
                                </Text>
                                <Text style={[descStyle, { marginTop: 0 }]}>
                                    {t("Umbral para marcar estudiantes \"en riesgo\"")}
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 16,
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
                                    ? t("Con este umbral, un estudiante puede faltar hasta") + " " + Math.floor((100 - minAttendance)) + " " + t("clases de cada 100 sin quedar en riesgo.")
                                    : minAttendance <= 60
                                    ? t("Umbral bajo — los estudiantes tendrán mucha flexibilidad de faltar. Asegúrate de que sea intencional.")
                                    : `${t("Con este umbral, un estudiante puede faltar hasta")} ${Math.floor((100 - minAttendance))} ${t("clases de cada 100 sin quedar en riesgo.")}`
                                }
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    {/* Días para sanción */}
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
                                fontSize: 16,
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

                    {/* Resumen rápido */}
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
                            label={t("Institución")}
                            value={institutionName || t("Sin definir")}
                            icon="home"
                            color={c.brand.primary}
                        />
                        <Divider />
                        <StatsRow
                            label={t("Período académico")}
                            value={t(ACADEMIC_PERIOD_CONFIG[academicPeriodType]?.labelKey) || t("Sin definir")}
                            icon="book-open"
                            color="#F59E0B"
                        />
                        <Divider />
                        <StatsRow
                            label={t("Período actual")}
                            value={
                                periodStartDate && periodEndDate
                                    ? `${getFullPeriodLabel(automaticPeriod)} ${isAutomaticPeriod ? t("(Auto)") : t("(Manual)")}`
                                    : t("No configurado - usar división del año")
                            }
                            icon="calendar-check"
                            color="#8B5CF6"
                        />

                        <Divider />
                        <StatsRow
                            label={t("Mínimo de asistencia")}
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
                            value={currentLanguage?.labelES ?? t("Español")}
                            icon="globe"
                            color="#3B82F6"
                        />
                    </View>
                </View>
            )}

            {/* -- RECONOCIMIENTO FACIAL ----------------------------- */}
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
                                    {t("Qué tan seguro debe estar el modelo para registrar")}
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 16,
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
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 4
                        }}>
                            {[`60 — ${t("Permisivo")}`, "75", "85 ✓", `95 — ${t("Estricto")}`, "99"].map((v, i) => (
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
                        label={t("Registro automático")}
                        description={t("Registra automáticamente al detectar el rostro sin confirmación manual")}
                        value={autoRegister}
                        onToggle={() => setAutoRegister(v => !v)}
                    />

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
                        description={t("Almacena la foto tomada al registrar. Útil para auditorías pero consume más espacio.")}
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
                                {t("Las fotos se almacenan localmente. Asegúrate de tener suficiente espacio y de informar a los estudiantes según tu política de privacidad.")}
                            </Text>
                        </View>
                    )}
                </View>
            )}

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
                        description={t("Envía un correo al docente cuando un estudiante no asiste. Ideal para clases pequeñas o con seguimiento individual.")}
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
                        description={`${t("Notifica cuando un estudiante cae por debajo del")} ${minAttendance}% ${t("de asistencia mínima configurado en General.")}`}
                        value={atRiskAlert}
                        onToggle={() => setAtRiskAlert(v => !v)}
                    />
                    <ToggleRow
                        label={t("Resumen diario")}
                        description={t("Resumen automático de asistencia al finalizar el día. Puede generar muchas notificaciones en días de muchas clases.")}
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
