import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
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

// Hook para obtener color basado en porcentaje de asistencia
export function useAttendanceColor(attendance) {
  if (attendance >= 85) return "#10B981"; // success
  if (attendance >= 75) return "#F59E0B"; // warning
  return "#EF4444"; // danger
}

/**
 * Icono circular para estado de asistencia
 * 
 * @param {string} status - Estado: 'on_time', 'late', 'absent', 'present'
 * @param {number} size - Tamaño del contenedor (default: 32)
 */
export function AttendanceStatusIcon({ status, size = 32 }) {
  const { theme } = useTheme();
  
  const configMap = {
    on_time: {
      icon: "check",
      backgroundColor: theme.colors.status.success,
      color: "#FFFFFF",
    },
    present: {
      icon: "check",
      backgroundColor: theme.colors.status.success,
      color: "#FFFFFF",
    },
    late: {
      icon: "clock",
      backgroundColor: theme.colors.status.warning,
      color: "#FFFFFF",
    },
    absent: {
      icon: "x",
      backgroundColor: theme.colors.status.danger,
      color: "#FFFFFF",
    },
  };

  const config = configMap[status] || {
    icon: "help-circle",
    backgroundColor: theme.colors.border.primary,
    color: theme.colors.text.secondary,
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: config.backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name={config.icon} size={size * 0.5} color={config.color} />
    </View>
  );
}

// Umbrales de asistencia
export const ATTENDANCE_THRESHOLDS = {
  excellent: 85,
  good: 75,
  warning: 60,
};
