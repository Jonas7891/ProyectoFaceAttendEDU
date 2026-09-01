import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Card reutilizable base
 * 
 * @param {string} variant - Estilo: 'default' | 'elevated' | 'outlined'
 * @param {string} padding - Padding: 'none' | 'sm' | 'md' | 'lg'
 * @param {function} onPress - Si es clickeable
 * @param {ReactNode} header - Contenido del header
 * @param {ReactNode} footer - Contenido del footer
 * @param {ReactNode} children - Contenido principal
 */
export function Card({
  variant = "default",
  padding = "md",
  onPress,
  header,
  footer,
  children,
  style,
}) {
  const { theme } = useTheme();

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background.surface,
      ...DESIGN_TOKENS.shadows.sm,
    },
    elevated: {
      backgroundColor: theme.colors.background.elevated,
      ...DESIGN_TOKENS.shadows.md,
    },
    outlined: {
      backgroundColor: theme.colors.background.surface,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
  };

  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: DESIGN_TOKENS.spacing.sm },
    md: { padding: DESIGN_TOKENS.spacing.md },
    lg: { padding: DESIGN_TOKENS.spacing.lg },
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      style={[
        styles.card,
        variantStyles[variant],
        style,
      ]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {header && (
        <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
          {header}
        </View>
      )}
      
      <View style={paddingStyles[padding]}>
        {children}
      </View>
      
      {footer && (
        <View style={[styles.footer, { borderTopColor: theme.colors.border.primary }]}>
          {footer}
        </View>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    overflow: "hidden",
  },
  header: {
    borderBottomWidth: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
});

export default Card;
