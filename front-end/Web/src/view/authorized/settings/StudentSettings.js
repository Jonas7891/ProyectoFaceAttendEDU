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
    SecuritySettings,
    AppearanceSettings,
} from "./modals";
import {
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

    // ── Estado seguridad ──────────────────────────────────────
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTime, setSessionTime] = useState("60");

    // ── Carga inicial ─────────────────────────────────────────
    useEffect(() => {
        const config = getInstitutionConfig();
        setTwoFactor(config.twoFactor);
        setSessionTime(String(config.sessionTime));
    }, []);

    // ── Registrar guardado en el padre ────────────────────────
    useEffect(() => {
        if (!onSave) return;
        onSave(() =>
            updateInstitutionConfig({
                twoFactor,
                sessionTime: parseInt(sessionTime),
            })
        );
    }, [onSave, twoFactor, sessionTime]);

    // ── Mapa de secciones por clave ───────────────────────────
    const sectionMap = {
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
