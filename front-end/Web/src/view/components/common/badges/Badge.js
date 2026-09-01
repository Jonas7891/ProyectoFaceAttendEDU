import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Badge reutilizable base
 * 
 * @param {string} variant - Estilo: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} rounded - Si es completamente redondeado
 * @param {ReactNode} children - Contenido del badge
 */
export function Badge({
  variant = "default",
  size = "md",
  rounded = true,
  children,
  style,
  textStyle,
}) {
  const { theme } = useTheme();

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background.hover,
      color: theme.colors.text.primary,
    },
    primary: {
      backgroundColor: theme.colors.brand.primaryLight,
      color: theme.colors.brand.primary,
    },
    success: {
      backgroundColor: theme.colors.status.successLight,
      color: theme.colors.status.success,
    },
    warning: {
      backgroundColor: theme.colors.status.warningLight,
      color: theme.colors.status.warning,
    },
    danger: {
      backgroundColor: theme.colors.status.errorLight,
      color: theme.colors.status.error,
    },
    info: {
      backgroundColor: theme.colors.status.infoLight,
      color: theme.colors.status.info,
    },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: DESIGN_TOKENS.spacing.xs,
      paddingVertical: 2,
      fontSize: 10,
    },
    md: {
      paddingHorizontal: DESIGN_TOKENS.spacing.sm,
      paddingVertical: 4,
      fontSize: 12,
    },
    lg: {
      paddingHorizontal: DESIGN_TOKENS.spacing.md,
      paddingVertical: DESIGN_TOKENS.spacing.xs,
      fontSize: 14,
    },
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles[variant].backgroundColor,
          borderRadius: rounded ? DESIGN_TOKENS.borderRadius.round : DESIGN_TOKENS.borderRadius.md,
        },
        {
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyles[variant].color,
            fontSize: sizeStyles[size].fontSize,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
});

export default Badge;
