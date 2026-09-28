// ============================================================
//  FaceAttend EDU — StudentSettings
//
//  El estudiante define QUÉ secciones ve, CON QUÉ DATOS y EN
//  QUÉ ORDEN. Configuración mínima: seguridad y apariencia.
//  Los textos son en primera persona ("tu cuenta", "deberás").
//
//  Secciones: security · appearance
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
    AtRiskAlertToggle,
    PushNotificationToggle,
    TwoFactorRow,
    SessionTimeInput,
    ModeBlock,
    AccentBlock,
} from "./sections";
import {
    getInstitutionConfig,
    updateInstitutionConfig,
} from "../../../core/config/institutionConfig";

export function StudentSettings({ section, onSave, previewAccent, onPreviewChange, previewTheme }) {
    const { t } = useTranslation();

    // ── Estado notificaciones ─────────────────────────────────
    const [atRiskAlert, setAtRiskAlert] = useState(true); // Para alerta personal
    const [pushNotifications, setPushNotifications] = useState(true);
    const [pushDuration, setPushDuration] = useState(0);
    const [minAttendance, setMinAttendance] = useState(80);

    // ── Estado seguridad ──────────────────────────────────────
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTime, setSessionTime] = useState("60");

    // ── Carga inicial ─────────────────────────────────────────
    useEffect(() => {
        const config = getInstitutionConfig();
        setAtRiskAlert(config.atRiskAlert ?? true);
        setPushNotifications(config.pushNotifications ?? true);
        setPushDuration(config.pushDuration ?? 0);
        setMinAttendance(config.minAttendance);
        setTwoFactor(config.twoFactor);
        setSessionTime(String(config.sessionTime));
    }, []);

    // ── Registrar guardado en el padre ────────────────────────
    useEffect(() => {
        if (!onSave) return;
        onSave(() =>
            updateInstitutionConfig({
                atRiskAlert,
                pushNotifications,
                pushDuration,
                twoFactor,
                sessionTime: parseInt(sessionTime),
            })
        );
    }, [onSave, atRiskAlert, pushNotifications, pushDuration, twoFactor, sessionTime]);

    // ── Mapa de secciones por clave ───────────────────────────
    const sectionMap = {
        notifications: (
            <NotificationsSettings
                sections={[
                    <AtRiskAlertToggle
                        value={atRiskAlert}
                        onToggle={() => setAtRiskAlert(v => !v)}
                        targetRole="self"
                        description={`${t("Recibe una notificación cuando tu asistencia cae por debajo del")} ${minAttendance}% ${t("mínimo requerido. Te ayuda a estar al tanto de tu progreso académico.")}`}
                    />,
                    <PushNotificationToggle
                        enabled={pushNotifications}
                        onToggle={() => setPushNotifications(v => !v)}
                        duration={pushDuration}
                        onDurationChange={setPushDuration}
                        description={t("Notificaciones emergentes sobre tu asistencia y actualizaciones del sistema.")}
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
                        description={t("Requiere un código adicional al iniciar sesión. Protege tu cuenta aunque alguien obtenga tu contraseña.")}
                        warningText={t("Sin 2FA, tu cuenta queda vulnerable si la contraseña se compromete. Se recomienda activarlo.")}
                    />,
                    <SessionTimeInput
                        value={sessionTime} onChange={setSessionTime}
                        contextHint={(min) =>
                            min > 120 ? t(" ⚠ Sesiones largas aumentan el riesgo si el dispositivo queda desbloqueado.")
                            : min <= 15 ? t(" Sesión muy corta — deberás iniciar sesión con frecuencia.")
                            : t(" Tiempo razonable para uso normal.")
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
