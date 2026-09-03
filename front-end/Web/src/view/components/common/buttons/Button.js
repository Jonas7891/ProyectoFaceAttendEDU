import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Botón reutilizable con variantes y tamaños
 * 
 * @param {string} variant - Estilo: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Si debe ocupar todo el ancho
 * @param {boolean} loading - Muestra spinner
 * @param {boolean} disabled - Deshabilita el botón
 * @param {ReactNode} leftIcon - Icono a la izquierda
 * @param {ReactNode} rightIcon - Icono a la derecha
 * @param {function} onPress - Callback al presionar
 * @param {ReactNode} children - Contenido del botón
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
  style,
  textStyle,
  ...props
}) {
  const { theme } = useTheme();

  // Estilos por variante
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.brand.primary,
      borderColor: theme.colors.brand.primary,
      borderWidth: 2,
    },
    secondary: {
      backgroundColor: theme.colors.brand.secondary,
      borderColor: theme.colors.brand.secondary,
      borderWidth: 2,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.brand.primary,
      borderWidth: 2,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
    },
    danger: {
      backgroundColor: theme.colors.status.error,
      borderColor: theme.colors.status.error,
      borderWidth: 2,
    },
  };

  // Estilos de texto por variante
  const textVariantStyles = {
    primary: { color: theme.colors.text.inverse },
    secondary: { color: theme.colors.text.inverse },
    outline: { color: theme.colors.brand.primary },
    ghost: { color: theme.colors.brand.primary },
    danger: { color: theme.colors.text.inverse },
  };

  // Estilos por tamaño
  const sizeStyles = {
    sm: {
      paddingVertical: DESIGN_TOKENS.spacing.xs,
      paddingHorizontal: DESIGN_TOKENS.spacing.md,
      minHeight: 32,
    },
    md: {
      paddingVertical: DESIGN_TOKENS.spacing.sm,
      paddingHorizontal: DESIGN_TOKENS.spacing.lg,
      minHeight: 40,
    },
    lg: {
      paddingVertical: DESIGN_TOKENS.spacing.md,
      paddingHorizontal: DESIGN_TOKENS.spacing.xl,
      minHeight: 48,
    },
  };

  // Tamaño de texto por size
  const textSizeStyles = {
    sm: { fontSize: 13, fontWeight: "600" },
    md: { fontSize: 15, fontWeight: "700" },
    lg: { fontSize: 16, fontWeight: "700" },
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={textVariantStyles[variant].color}
            style={styles.loader}
          />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            
            {typeof children === "string" ? (
              <Text
                style={[
                  styles.text,
                  textSizeStyles[size],
                  textVariantStyles[variant],
                  textStyle,
                ]}
              >
                {children}
              </Text>
            ) : (
              children
            )}
            
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DESIGN_TOKENS.spacing.xs,
  },
  text: {
    textAlign: "center",
  },
  leftIcon: {
    marginRight: DESIGN_TOKENS.spacing.xs,
  },
  rightIcon: {
    marginLeft: DESIGN_TOKENS.spacing.xs,
  },
  loader: {
    marginHorizontal: DESIGN_TOKENS.spacing.sm,
  },
});

export default Button;
