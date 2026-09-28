// ============================================================
//  FaceAttend EDU — AdminSettings
//
//  El admin define QUÉ secciones ve, CON QUÉ DATOS y EN QUÉ
//  ORDEN. Todo el estado vive aquí. Los modals solo renderizan
//  lo que reciben.
//
//  Secciones: general · facial (con umbrales de asistencia) · notifications · security · appearance
// ============================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "../../components/common";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { SecurityMeter } from "../../components/settings/tabs";
import {
    GeneralSettings,
    FaceSettings,
    NotificationsSettings,
    SecuritySettings,
    AppearanceSettings,
} from "./modals";
import {
    InstitutionInfo,
    PeriodConfig,
    AttendanceThresholds,
    GeneralSummary,
    LanguageBlock,
    ConfidenceSlider,
    FaceToggles,
    EmailAlertToggle,
    WeeklyReportToggle,
    AtRiskAlertToggle,
    DailySummaryToggle,
    PushNotificationToggle,
    TwoFactorRow,
    SessionTimeInput,
    ModeBlock,
    AccentBlock,
} from "./sections";
import {
    getCurrentPeriod,
} from "../../../core/constants/academicPeriods";
import {
    getInstitutionConfig,
    updateInstitutionConfig,
    checkPeriodExpiration,
} from "../../../core/config/institutionConfig";

export function AdminSettings({ section, onSave, previewAccent, onPreviewChange, previewTheme }) {
    const { isSmall } = useResponsive();
    const { currentLanguage, t } = useTranslation();

    // ── Estado general ────────────────────────────────────────
    const [institutionName, setInstitutionName] = useState("Universidad Nacional");
    const [institutionSlug, setInstitutionSlug] = useState("universidad-nacional");
    const [academicPeriodType, setAcademicPeriodType] = useState("trimestral");
    const [periodStartDate, setPeriodStartDate] = useState("");
    const [periodEndDate, setPeriodEndDate] = useState("");
    const [isAutomaticPeriod, setIsAutomaticPeriod] = useState(true);
    const [showExpirationAlert, setShowExpirationAlert] = useState(true);
    const [minAttendance, setMinAttendance] = useState(80);
    const [daysUntilSanction, setDaysUntilSanction] = useState(15);
    const [configLoaded, setConfigLoaded] = useState(false);

    // ── Estado facial ─────────────────────────────────────────
    const [confidence, setConfidence] = useState(85);
    const [autoRegister, setAutoRegister] = useState(true);
    const [savePhotos, setSavePhotos] = useState(false);

    // ── Estado notificaciones ─────────────────────────────────
    const [emailAlert, setEmailAlert] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [atRiskAlert, setAtRiskAlert] = useState(true); // Para instructores/profesores
    const [dailySummary, setDailySummary] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [pushDuration, setPushDuration] = useState(0); // Sin valor por defecto

    // ── Estado seguridad ──────────────────────────────────────
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTime, setSessionTime] = useState("60");

    // ── Carga inicial ─────────────────────────────────────────
    useEffect(() => {
        const config = getInstitutionConfig();
        setInstitutionName(config.institutionName);
        setInstitutionSlug(config.institutionSlug);
        setAcademicPeriodType(config.academicPeriodType);
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
        setPushNotifications(config.pushNotifications ?? true);
        setPushDuration(config.pushDuration ?? 0); // Sin valor por defecto
        setTwoFactor(config.twoFactor);
        setSessionTime(String(config.sessionTime));
        setConfigLoaded(true);
    }, []);

    // ── Derivados ─────────────────────────────────────────────
    const automaticPeriod = useMemo(() => {
        if (!configLoaded) return null;
        return getCurrentPeriod(academicPeriodType);
    }, [academicPeriodType, configLoaded]);

    const periodExpiration = useMemo(() => {
        if (!configLoaded) return null;
        return checkPeriodExpiration();
    }, [periodStartDate, periodEndDate, configLoaded]);

    useEffect(() => {
        if (periodExpiration?.hasExpired || periodExpiration?.isExpiringSoon) {
            setShowExpirationAlert(true);
        }
    }, [periodExpiration]);

    // ── Registrar guardado en el padre ────────────────────────
    useEffect(() => {
        if (!onSave) return;
        onSave(() =>
            updateInstitutionConfig({
                institutionName, institutionSlug, academicPeriodType,
                periodStartDate, periodEndDate, isAutomaticPeriod,
                minAttendance, daysUntilSanction,
                confidenceThreshold: confidence,
                autoRegister, savePhotos,
                emailAlert, weeklyReport, atRiskAlert, dailySummary,
                pushNotifications, pushDuration,
                twoFactor, sessionTime: parseInt(sessionTime),
            })
        );
    }, [
        onSave, institutionName, institutionSlug, academicPeriodType,
        periodStartDate, periodEndDate, isAutomaticPeriod,
        minAttendance, daysUntilSanction, confidence,
        autoRegister, savePhotos,
        emailAlert, weeklyReport, atRiskAlert, dailySummary,
        pushNotifications, pushDuration,
        twoFactor, sessionTime,
    ]);

    // ── Mapa de secciones por clave ───────────────────────────
    const sectionMap = {
        general: (
            <GeneralSettings
                title={t("General")}
                sections={[
                    <InstitutionInfo
                        institutionName={institutionName} onNameChange={setInstitutionName}
                        institutionSlug={institutionSlug} onSlugChange={setInstitutionSlug}
                        academicPeriodType={academicPeriodType} onPeriodTypeChange={setAcademicPeriodType}
                        isSmall={isSmall}
                    />,
                    <LanguageBlock />,
                    <PeriodConfig
                        periodStartDate={periodStartDate} onStartDateChange={setPeriodStartDate}
                        periodEndDate={periodEndDate}     onEndDateChange={setPeriodEndDate}
                        isAutomaticPeriod={isAutomaticPeriod} onModeChange={setIsAutomaticPeriod}
                        academicPeriodType={academicPeriodType}
                        automaticPeriod={automaticPeriod}
                        periodExpiration={periodExpiration}
                        showExpirationAlert={showExpirationAlert}
                        onDismissExpiration={() => setShowExpirationAlert(false)}
                    />,
                    <GeneralSummary
                        institutionName={institutionName}
                        academicPeriodType={academicPeriodType}
                        periodStartDate={periodStartDate}
                        periodEndDate={periodEndDate}
                        isAutomaticPeriod={isAutomaticPeriod}
                        automaticPeriod={automaticPeriod}
                        currentLanguageLabel={currentLanguage?.labelES}
                    />,
                ]}
            />
        ),
        facial: (
            <FaceSettings
                title={t("Reconocimiento facial")}
                sections={[
                    <AttendanceThresholds
                        minAttendance={minAttendance} onMinAttendanceChange={setMinAttendance}
                        daysUntilSanction={daysUntilSanction} onDaysSanctionChange={setDaysUntilSanction}
                    />,
                    <ConfidenceSlider value={confidence} onChange={setConfidence} />,
                    <FaceToggles
                        confidence={confidence}
                        autoRegister={autoRegister} onAutoRegister={() => setAutoRegister(v => !v)}
                        savePhotos={savePhotos}     onSavePhotos={() => setSavePhotos(v => !v)}
                    />,
                ]}
            />
        ),
        notifications: (
            <NotificationsSettings
                sections={[
                    <EmailAlertToggle
                        value={emailAlert}
                        onToggle={() => setEmailAlert(v => !v)}
                        description={t("Envía un correo al docente cuando un estudiante no asiste. Ideal para clases pequeñas o con seguimiento individual.")}
                    />,
                    <WeeklyReportToggle
                        value={weeklyReport}
                        onToggle={() => setWeeklyReport(v => !v)}
                        description={t("Resumen automático de asistencia enviado cada lunes a las 8am. Incluye porcentajes por curso.")}
                    />,
                    <AtRiskAlertToggle
                        value={atRiskAlert}
                        onToggle={() => setAtRiskAlert(v => !v)}
                        targetRole="instructor"
                        description={`${t("Notifica cuando un instructor cae por debajo del")} ${minAttendance}% ${t("de asistencia mínima configurado en Reconocimiento.")}`}
                    />,
                    <DailySummaryToggle
                        value={dailySummary}
                        onToggle={() => setDailySummary(v => !v)}
                        description={t("Resumen automático de asistencia al finalizar el día. Puede generar muchas notificaciones en días de muchas clases.")}
                    />,
                    <PushNotificationToggle
                        enabled={pushNotifications}
                        onToggle={() => setPushNotifications(v => !v)}
                        duration={pushDuration}
                        onDurationChange={setPushDuration}
                        description={t("Notificaciones emergentes en tiempo real del sistema.")}
                    />,
                ]}
            />
        ),
        security: (
            <SecuritySettings
                title={t("Seguridad")}
                header={<SecurityMeter twoFactor={twoFactor} sessionTime={sessionTime} />}
                sections={[
                    <TwoFactorRow
                        value={twoFactor} onToggle={() => setTwoFactor(v => !v)}
                        description={t("Requiere un código adicional al iniciar sesión. Protege la cuenta aunque alguien obtenga tu contraseña.")}
                        warningText={t("Sin 2FA, la cuenta queda vulnerable si la contraseña se compromete. Se recomienda activarlo.")}
                    />,
                    <SessionTimeInput
                        value={sessionTime} onChange={setSessionTime}
                        contextHint={(min) =>
                            min > 120 ? t(" ⚠ Sesiones largas aumentan el riesgo si el dispositivo queda desbloqueado.")
                            : min <= 15 ? t(" Sesión muy corta — el usuario deberá iniciar sesión con frecuencia.")
                            : t(" Tiempo razonable para uso normal en aula.")
                        }
                    />,
                ]}
            />
        ),
        appearance: (
            <AppearanceSettings
                title={t("Apariencia")}
                sections={[
                    <ModeBlock />,
                    <AccentBlock
                        previewAccent={previewAccent}
                        onPreviewChange={onPreviewChange}
                        previewTheme={previewTheme}
                    />,
                ]}
            />
        ),
    };

    return (
        <Card style={{ flex: 1 }}>
            {sectionMap[section] ?? null}
        </Card>
    );
}
