// ============================================================
//  FaceAttend EDU — TeacherSettings
//
//  El profesor define QUÉ secciones ve, CON QUÉ DATOS y EN QUÉ
//  ORDEN. Sin configuración de institución ni facial.
//
//  Secciones: notifications · security · appearance
// ============================================================

import React, { useState, useEffect } from "react";
import { Card } from "../../components/common";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { SecurityMeter } from "../../components/settings/tabs";
import {
    NotificationsSettings,
    SecuritySettings,
    AppearanceSettings,
} from "./modals";
import {
    NotificationToggles,
    TwoFactorRow,
    SessionTimeInput,
    ModeBlock,
    AccentBlock,
} from "./sections";
import {
    getInstitutionConfig,
    updateInstitutionConfig,
} from "../../../core/config/institutionConfig";

export function TeacherSettings({ section, onSave, previewAccent, onPreviewChange, previewTheme }) {
    const { t } = useTranslation();

    // ── Estado notificaciones ─────────────────────────────────
    const [emailAlert, setEmailAlert] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [atRiskAlert, setAtRiskAlert] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [minAttendance, setMinAttendance] = useState(80);

    // ── Estado seguridad ──────────────────────────────────────
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTime, setSessionTime] = useState("60");

    // ── Carga inicial ─────────────────────────────────────────
    useEffect(() => {
        const config = getInstitutionConfig();
        setEmailAlert(config.emailAlert);
        setWeeklyReport(config.weeklyReport);
        setAtRiskAlert(config.atRiskAlert);
        setDailySummary(config.dailySummary);
        setMinAttendance(config.minAttendance);
        setTwoFactor(config.twoFactor);
        setSessionTime(String(config.sessionTime));
    }, []);

    // ── Registrar guardado en el padre ────────────────────────
    useEffect(() => {
        if (!onSave) return;
        onSave(() =>
            updateInstitutionConfig({
                emailAlert, weeklyReport, atRiskAlert, dailySummary,
                twoFactor, sessionTime: parseInt(sessionTime),
            })
        );
    }, [onSave, emailAlert, weeklyReport, atRiskAlert, dailySummary, twoFactor, sessionTime]);

    // ── Mapa de secciones por clave ───────────────────────────
    const sectionMap = {
        notifications: (
            <NotificationsSettings
                sections={[
                    <NotificationToggles
                        emailAlert={emailAlert}    onEmailAlert={() => setEmailAlert(v => !v)}
                        weeklyReport={weeklyReport} onWeeklyReport={() => setWeeklyReport(v => !v)}
                        atRiskAlert={atRiskAlert}  onAtRiskAlert={() => setAtRiskAlert(v => !v)}
                        dailySummary={dailySummary} onDailySummary={() => setDailySummary(v => !v)}
                        descriptions={{
                            emailAlert:   t("Envía un correo cuando un estudiante de tus cursos no asiste. Ideal para clases pequeñas o con seguimiento individual."),
                            weeklyReport: t("Resumen automático de asistencia de tus cursos enviado cada lunes a las 8am."),
                            atRiskAlert:  `${t("Notifica cuando un estudiante de tus cursos cae por debajo del")} ${minAttendance}% ${t("de asistencia mínima.")}`,
                            dailySummary: t("Resumen automático de asistencia de tus cursos al finalizar el día."),
                        }}
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
