// ============================================================
//  Notification Sections — Componentes individuales de notificación
//  Cada tipo de notificación es una sección independiente.
// ============================================================
import React from "react";
import { ToggleRow, Divider } from "../../../../components/common";
import { useTranslation } from "../../../../../core/utils/i18n/hooks/useTranslation";

// ── Email Alert ───────────────────────────────────────────
export function EmailAlertToggle({ value, onToggle, description }) {
    const { t } = useTranslation();
    return (
        <>
            <ToggleRow
                label={t("Alertas por correo")}
                description={description}
                value={value}
                onToggle={onToggle}
            />
            <Divider />
        </>
    );
}

// ── Weekly Report ─────────────────────────────────────────
export function WeeklyReportToggle({ value, onToggle, description }) {
    const { t } = useTranslation();
    return (
        <>
            <ToggleRow
                label={t("Reporte semanal")}
                description={description}
                value={value}
                onToggle={onToggle}
            />
            <Divider />
        </>
    );
}

// ── At Risk Alert ─────────────────────────────────────────
export function AtRiskAlertToggle({ value, onToggle, description }) {
    const { t } = useTranslation();
    return (
        <>
            <ToggleRow
                label={t("Alerta de estudiantes en riesgo")}
                description={description}
                value={value}
                onToggle={onToggle}
            />
            <Divider />
        </>
    );
}

// ── Daily Summary ─────────────────────────────────────────
export function DailySummaryToggle({ value, onToggle, description }) {
    const { t } = useTranslation();
    return (
        <>
            <ToggleRow
                label={t("Resumen diario")}
                description={description}
                value={value}
                onToggle={onToggle}
            />
            <Divider />
        </>
    );
}
