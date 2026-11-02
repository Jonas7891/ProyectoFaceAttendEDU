// ============================================================
//  FaceAttend EDU — BiometricConsentPrompt
//  Se muestra en lugar de la cámara/lector mientras la persona no haya
//  autorizado el tratamiento de sus datos biométricos (Ley 1581, arts. 6-a y 9).
//  Solo un administrador puede registrarla en nombre del titular, y únicamente
//  porque este, presente, la firmó: identity la guarda como aceptación asistida
//  (y rechaza con 403 a cualquier otro rol). Un docente no puede marcar la casilla
//  por el alumno: se le indica que falta y que debe autorizar el titular (AUD-50).
// ============================================================

import React, { useState } from "react";
import { View, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { Button, Checkbox } from "../common";
import { useAuth } from "../../../context/AuthContext";
import PrivacyNotice from "./PrivacyNotice";

/** true si el usuario en sesión puede registrar la autorización del titular (solo administradores). */
export function useCanRecordBiometricConsent() {
    const { user } = useAuth();
    return user?.role === "admin";
}

export default function BiometricConsentPrompt({ personName, onAuthorize, busy = false, canRegister = false }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    const [confirmed, setConfirmed] = useState(false);

    return (
        <View
            accessibilityLabel={t("Autorización de datos biométricos")}
            style={{ gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.status.warning }}
        >
            <Text accessibilityRole="header" style={{ fontWeight: "700", fontSize: 15, color: c.text.primary }}>
                {t("Falta la autorización de datos biométricos")}
            </Text>
            <PrivacyNotice compact />
            {!canRegister ? (
                <Text style={{ fontSize: 13, color: c.text.secondary }}>
                    {`${personName || t("La persona")}: ${t("el titular debe autorizar el tratamiento de sus datos biométricos en el sistema. Mientras no exista una autorización vigente no se puede registrar su biometría. Pídele que la otorgue o que un administrador la registre con su firma en la sede.")}`}
                </Text>
            ) : (
                <>
            <Checkbox
                checked={confirmed}
                onToggle={setConfirmed}
                label={`${personName || t("La persona")} ${t("autoriza de forma previa, expresa e informada el tratamiento de sus datos biométricos")}`}
            />
            <Button variant="primary" onPress={onAuthorize} disabled={!confirmed || busy}>
                {t("Registrar autorización")}
            </Button>
                </>
            )}
        </View>
    );
}
