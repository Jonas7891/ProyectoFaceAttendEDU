import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * DatePicker component para selección de fechas
 * 
 * NOTA: Este es un placeholder que muestra un input de texto con formato de fecha.
 * Para funcionalidad completa de DatePicker, instalar:
 * 
 * npm install @react-native-community/datetimepicker
 * 
 * Y reemplazar la implementación con el picker nativo.
 * 
 * @param {Date} value - Fecha seleccionada
 * @param {function} onChange - Callback al cambiar fecha (recibe Date object)
 * @param {string} label - Etiqueta del picker
 * @param {string} placeholder - Placeholder
 * @param {Date} minDate - Fecha mínima permitida
 * @param {Date} maxDate - Fecha máxima permitida
 * @param {('date'|'datetime'|'time')} mode - Modo del picker
 * @param {boolean} error - Si hay error
 * @param {string} errorMessage - Mensaje de error
 * @param {boolean} disabled - Si está deshabilitado
 * @param {boolean} required - Si es requerido
 * 
 * @example
 * // DatePicker básico
 * const [birthDate, setBirthDate] = useState(new Date());
 * <DatePicker
 *   label="Fecha de nacimiento"
 *   value={birthDate}
 *   onChange={setBirthDate}
 * />
 * 
 * @example
 * // Con rango de fechas
 * <DatePicker
 *   label="Fecha del evento"
 *   value={eventDate}
 *   onChange={setEventDate}
 *   minDate={new Date()}
 *   maxDate={new Date(2025, 11, 31)}
 * />
 * 
 * @example
 * // Con validación
 * <DatePicker
 *   label="Fecha de inicio"
 *   value={startDate}
 *   onChange={setStartDate}
 *   required
 *   error={!startDate}
 *   errorMessage="La fecha de inicio es requerida"
 * />
 */
export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Seleccionar fecha",
  minDate,
  maxDate,
  mode = "date",
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  style,
}) {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    
    if (mode === "datetime") {
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    return `${day}/${month}/${year}`;
  };

  const displayText = value ? formatDate(value) : placeholder;

  const handlePress = () => {
    if (disabled) return;
    
    // TODO: Abrir picker nativo cuando esté instalado
    // Por ahora, solo log de warning
    console.warn(
      "DatePicker: Instalar @react-native-community/datetimepicker para funcionalidad completa.\n" +
      "npm install @react-native-community/datetimepicker"
    );
    
    // Simular selección con fecha actual (placeholder behavior)
    if (!value) {
      onChange(new Date());
    }
  };

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

      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.pickerButton,
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
        <Feather
          name="calendar"
          size={18}
          color={theme.colors.text.secondary}
          style={styles.icon}
        />
        <Text
          style={[
            styles.text,
            {
              color: value
                ? theme.colors.text.primary
                : theme.colors.text.disabled,
            },
          ]}
        >
          {displayText}
        </Text>
        <Feather
          name="chevron-down"
          size={18}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>

      {error && errorMessage && (
        <Text style={[styles.message, { color: theme.colors.status.error }]}>
          {errorMessage}
        </Text>
      )}

      {/* Warning badge */}
      <View style={[styles.warning, { backgroundColor: theme.colors.status.warningLight }]}>
        <Feather name="alert-triangle" size={12} color={theme.colors.status.warning} />
        <Text style={[styles.warningText, { color: theme.colors.status.warning }]}>
          Placeholder: Instalar @react-native-community/datetimepicker
        </Text>
      </View>
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
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    minHeight: 40,
  },
  icon: {
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 14,
  },
  message: {
    fontSize: 12,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: DESIGN_TOKENS.spacing.xs,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.borderRadius.sm,
    gap: DESIGN_TOKENS.spacing.xs,
  },
  warningText: {
    fontSize: 10,
    flex: 1,
  },
});

export default DatePicker;
