import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Alert reutilizable
 * 
 * @param {string} type - Tipo: 'info' | 'success' | 'warning' | 'error'
 * @param {string} title - Título opcional
 * @param {string} message - Mensaje
 * @param {boolean} closable - Si se puede cerrar
 * @param {function} onClose - Callback al cerrar
 */
export function Alert({
  type = "info",
  title,
  message,
  closable = false,
  onClose,
  style,
}) {
  const { theme } = useTheme();

  const config = {
    info: {
      icon: "info",
      backgroundColor: theme.colors.status.infoLight,
      color: theme.colors.status.info,
    },
    success: {
      icon: "check-circle",
      backgroundColor: theme.colors.status.successLight,
      color: theme.colors.status.success,
    },
    warning: {
      icon: "alert-triangle",
      backgroundColor: theme.colors.status.warningLight,
      color: theme.colors.status.warning,
    },
    error: {
      icon: "x-circle",
      backgroundColor: theme.colors.status.errorLight,
      color: theme.colors.status.error,
    },
  };

  const alertConfig = config[type];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: alertConfig.backgroundColor },
        style,
      ]}
    >
      <Feather
        name={alertConfig.icon}
        size={20}
        color={alertConfig.color}
        style={styles.icon}
      />

      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: alertConfig.color }]}>
            {title}
          </Text>
        )}
        <Text style={[styles.message, { color: alertConfig.color }]}>
          {message}
        </Text>
      </View>

      {closable && onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={18} color={alertConfig.color} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    borderLeftWidth: 4,
  },
  icon: {
    marginRight: DESIGN_TOKENS.spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.xs,
  },
});

export default Alert;
