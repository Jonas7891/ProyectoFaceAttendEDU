import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";
import { Button } from "../buttons/Button";

/**
 * Estado vacío reutilizable
 * 
 * @param {string} icon - Nombre del icono (Feather)
 * @param {string} title - Título
 * @param {string} message - Mensaje descriptivo
 * @param {string} actionLabel - Texto del botón de acción
 * @param {function} onAction - Callback del botón
 */
export function EmptyState({
  icon = "inbox",
  title = "No hay datos",
  message,
  actionLabel,
  onAction,
  style,
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.background.hover },
        ]}
      >
        <Feather name={icon} size={48} color={theme.colors.text.disabled} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {title}
      </Text>

      {message && (
        <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
          {message}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: DESIGN_TOKENS.spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: DESIGN_TOKENS.borderRadius.round,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: DESIGN_TOKENS.spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: DESIGN_TOKENS.spacing.lg,
    maxWidth: 320,
  },
  button: {
    marginTop: DESIGN_TOKENS.spacing.md,
  },
});

export default EmptyState;
