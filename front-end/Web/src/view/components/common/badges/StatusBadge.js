import React from "react";
import { Badge } from "./Badge";
import { useTheme } from "../../hooks/useTheme";

/**
 * Badge para mostrar estados con umbrales
 * Útil para asistencia, progreso, calificaciones, etc.
 * 
 * @param {number} value - Valor numérico (0-100)
 * @param {Object} thresholds - Umbrales: { excellent, good, warning }
 * @param {boolean} showIcon - Mostrar icono
 * @param {string} suffix - Sufijo (ej: "%")
 */
export function StatusBadge({
  value,
  thresholds = { excellent: 85, good: 75, warning: 60 },
  showIcon = false,
  suffix = "%",
  size = "md",
  style,
}) {
  const { theme } = useTheme();

  // Determinar variante según umbrales
  let variant = "danger";
  let icon = "⚠";

  if (value >= thresholds.excellent) {
    variant = "success";
    icon = "✓";
  } else if (value >= thresholds.good) {
    variant = "info";
    icon = "→";
  } else if (value >= thresholds.warning) {
    variant = "warning";
    icon = "!";
  }

  return (
    <Badge variant={variant} size={size} style={style}>
      {showIcon && `${icon} `}
      {value}{suffix}
    </Badge>
  );
}

/**
 * Badge específico para asistencia
 */
export function AttendanceBadge({ attendance, showIcon = false, size = "md" }) {
  return (
    <StatusBadge
      value={attendance}
      thresholds={{ excellent: 85, good: 75, warning: 60 }}
      showIcon={showIcon}
      size={size}
    />
  );
}

/**
 * Badge para estados de asistencia (on_time, late, absent)
 */
export function AttendanceStatusBadge({ status, label }) {
  const variantMap = {
    on_time: "success",
    late: "warning",
    absent: "danger",
    present: "success",
  };

  const labelMap = {
    on_time: "A tiempo",
    late: "Tardanza",
    absent: "Ausente",
    present: "Presente",
  };

  return (
    <Badge variant={variantMap[status] || "default"}>
      {label || labelMap[status] || status}
    </Badge>
  );
}

export default StatusBadge;
