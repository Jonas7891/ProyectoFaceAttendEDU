import { useState, useCallback, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

// ── Configuraciones por defecto ────────────────────────────

const DEFAULT_GENERAL = {
    institutionName: "Universidad Nacional",
    semester: "2024-2",
    minAttendance: 80,
};

const DEFAULT_FACIAL = {
    confidence: 85,
    autoRegister: true,
    savePhotos: false,
};

const DEFAULT_NOTIFICATIONS = {
    emailAlert: true,
    weeklyReport: true,
    atRiskAlert: true,
    dailySummary: false,
};

const DEFAULT_SECURITY = {
    twoFactor: false,
    sessionTime: "60",
};

// ── ViewModel ────────────────────────────────────────────────

export function useSettingsViewModel() {
    const { theme, mode, accentColor, setAccentColor } = useTheme();

    // ── Estado de configuración ──────────────────────────────

    const [general, setGeneral] = useState(DEFAULT_GENERAL);
    const [facial, setFacial] = useState(DEFAULT_FACIAL);
    const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
    const [security, setSecurity] = useState(DEFAULT_SECURITY);

    // ── Preview de tema ──────────────────────────────────────

    const [previewAccent, setPreviewAccent] = useState(accentColor);
    const [saved, setSaved] = useState(false);

    // ── Derivados ───────────────────────────────────────────

    const hasUnsaved = useMemo(
        () => previewAccent.toLowerCase() !== accentColor.toLowerCase(),
        [previewAccent, accentColor]
    );

    const activeNotifications = useMemo(
        () =>
            Object.values(notifications).filter(Boolean).length,
        [notifications]
    );

    const securityScore = useMemo(() => {
        let score = 50; // Base
        if (security.twoFactor) score += 30;
        const sessionMin = parseInt(security.sessionTime) || 60;
        if (sessionMin <= 30) score += 20;
        else if (sessionMin <= 60) score += 10;
        return Math.min(100, score);
    }, [security]);

    // ── Funciones de actualización ─────────────────────────

    const updateGeneral = useCallback((field, value) => {
        setGeneral(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateFacial = useCallback((field, value) => {
        setFacial(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateNotifications = useCallback((field, value) => {
        setNotifications(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateSecurity = useCallback((field, value) => {
        setSecurity(prev => ({ ...prev, [field]: value }));
    }, []);

    // ── Acciones ────────────────────────────────────────────

    const save = useCallback(async () => {
        // TODO: Persistir configuraciones en storage/API
        // Por ahora solo guarda el tema si cambió
        if (hasUnsaved) {
            await setAccentColor(previewAccent);
        }

        // Simular guardado de otras configuraciones
        console.log("[Settings] Guardando configuraciones:", {
            general,
            facial,
            notifications,
            security,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }, [
        hasUnsaved,
        previewAccent,
        setAccentColor,
        general,
        facial,
        notifications,
        security,
    ]);

    const discard = useCallback(() => {
        setPreviewAccent(accentColor);
    }, [accentColor]);

    const reset = useCallback(() => {
        setGeneral(DEFAULT_GENERAL);
        setFacial(DEFAULT_FACIAL);
        setNotifications(DEFAULT_NOTIFICATIONS);
        setSecurity(DEFAULT_SECURITY);
        setPreviewAccent(accentColor);
    }, [accentColor]);

    // ── API del ViewModel ───────────────────────────────────

    return {
        // Configuraciones
        general,
        facial,
        notifications,
        security,

        // Funciones de actualización
        updateGeneral,
        updateFacial,
        updateNotifications,
        updateSecurity,

        // Tema
        theme,
        mode,
        previewAccent,
        setPreviewAccent,
        hasUnsaved,

        // Derivados
        activeNotifications,
        securityScore,

        // Acciones
        save,
        discard,
        reset,
        saved,
    };
}
