// ============================================================
//  FaceAttend EDU — AttendanceBadge & AttendanceStatusIcon
//
//  Componentes reutilizables para mostrar el estado de
//  asistencia de un estudiante.
//
//  Centraliza los umbrales (75%, 80%, 85%) y los colores
//  semánticos, eliminando la lógica duplicada que existía
//  en CoursesView, StudentsView, DashboardView y ReportsView.
//
//  Uso:
//    <AttendanceBadge attendance={student.attendance} />
//    <AttendanceStatusIcon status="on_time" />
//    const color = attendanceColor(student.attendance, theme);
// ============================================================

import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Badge } from "./UI";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../i18n/hooks/useTranslation";
import { AttendanceStatus } from "../../../models/types";
import { ThemeTokens } from "../theme/colourTokens";

// ── Umbrales centralizados ──────────────────────────────────
// Cambia aquí y se actualiza en toda la app.

export const ATTENDANCE_THRESHOLDS = {
    /** Asistencia mínima aceptable */
    MIN_ACCEPTABLE,
    /** Umbral de "en riesgo" */
    AT_RISK,
    /** Umbral de "excelente" */
    EXCELLENT,
};

// ── Helper de color por asistencia ──────────────────────────

export function attendanceColor(
    attendance,
    colors["colors"]
) {
    if (attendance >= ATTENDANCE_THRESHOLDS.EXCELLENT) return colors.states.success;
    if (attendance >= ATTENDANCE_THRESHOLDS.AT_RISK)   return colors.states.warning;
    return colors.states.danger;
}

// ── AttendanceBadge ─────────────────────────────────────────


export function AttendanceBadge({ attendance, showIcon = false }) {
    const { theme } = useTheme();
    const c = theme.colors;

    const variant =
        attendance >= ATTENDANCE_THRESHOLDS.EXCELLENT ? "success"
        : attendance >= ATTENDANCE_THRESHOLDS.AT_RISK ? "warning"
        : "danger";

    return (
        <Badge variant={variant}>
            {showIcon ? `${attendance >= ATTENDANCE_THRESHOLDS.MIN_ACCEPTABLE ? "✓" : "⚠"} ` : ""}
            {attendance}%
        </Badge>
    );
}

// ── AttendanceStatusIcon ─────────────────────────────────────
// Para la actividad reciente (on_time | late | absent)


export function AttendanceStatusIcon({ status, size = 16 }) {
    const { theme } = useTheme();
    const c = theme.colors;

    if (status === "on_time") return <Feather name="check-circle" size={size} color={c.states.success} />;
    if (status === "late")    return <Feather name="clock"        size={size} color={c.states.warning} />;
    return                           <Feather name="x-circle"     size={size} color={c.states.danger}  />;
}

// ── AttendanceStatusBadge ────────────────────────────────────


export function AttendanceStatusBadge({ status }) {
    const { t } = useTranslation();

    if (status === "on_time") return <Badge variant="success">{t("A tiempo")}</Badge>;
    if (status === "late")    return <Badge variant="warning">{t("Tardanza")}</Badge>;
    return                           <Badge variant="danger">{t("Ausente")}</Badge>;
}

// ── AttendanceProgressColor (para ProgressBar) ───────────────
// Helper directo para componentes que necesitan el color sin el badge

export function useAttendanceColor(attendance) {
    const { theme } = useTheme();
    return attendanceColor(attendance, theme.colors);
}
