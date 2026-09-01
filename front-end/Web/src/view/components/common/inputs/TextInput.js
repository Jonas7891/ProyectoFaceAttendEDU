import React from "react";
import { View, Text, TextInput as RNTextInput, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Input de texto reutilizable con label, error y hint
 * 
 * @param {string} label - Etiqueta del input
 * @param {string} value - Valor del input
 * @param {function} onChangeText - Callback al cambiar texto
 * @param {string} placeholder - Placeholder
 * @param {string} type - Tipo: 'text' | 'email' | 'password' | 'number' | 'phone'
 * @param {boolean} error - Si hay error
 * @param {string} errorMessage - Mensaje de error
 * @param {string} helperText - Texto de ayuda
 * @param {boolean} required - Si es requerido
 * @param {boolean} disabled - Si está deshabilitado
 * @param {boolean} multiline - Si es multilinea
 * @param {number} numberOfLines - Número de líneas (multiline)
 * @param {ReactNode} leftIcon - Icono izquierdo
 * @param {ReactNode} rightIcon - Icono derecho
 */
export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  type = "text",
  error = false,
  errorMessage,
  helperText,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 3,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  ...props
}) {
  const { theme } = useTheme();

  // Configuración por tipo
  const typeConfig = {
    text: { keyboardType: "default", secureTextEntry: false },
    email: { keyboardType: "email-address", secureTextEntry: false, autoCapitalize: "none" },
    password: { keyboardType: "default", secureTextEntry: true, autoCapitalize: "none" },
    number: { keyboardType: "numeric", secureTextEntry: false },
    phone: { keyboardType: "phone-pad", secureTextEntry: false },
  };

  const config = typeConfig[type] || typeConfig.text;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: error ? theme.colors.status.error : theme.colors.text.secondary },
          ]}
        >
          {label}
          {required && <Text style={{ color: theme.colors.status.error }}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error
              ? theme.colors.status.error
              : theme.colors.border.primary,
            backgroundColor: disabled
              ? theme.colors.background.hover
              : theme.colors.background.surface,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.disabled}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          style={[
            styles.input,
            {
              color: theme.colors.text.primary,
              minHeight: multiline ? 80 : 40,
              textAlignVertical: multiline ? "top" : "center",
            },
            inputStyle,
          ]}
          {...config}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && errorMessage && (
        <Text style={[styles.message, { color: theme.colors.status.error }]}>
          {errorMessage}
        </Text>
      )}

      {!error && helperText && (
        <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
  },
  leftIcon: {
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  rightIcon: {
    marginLeft: DESIGN_TOKENS.spacing.sm,
  },
  message: {
    fontSize: 12,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
});

export default TextInput;
