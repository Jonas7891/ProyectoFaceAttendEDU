import React from "react";
import { DatePicker } from "./DatePicker";

/**
 * TimePicker component para selección de hora
 * 
 * NOTA: Este es un wrapper de DatePicker en mode='time'.
 * Para funcionalidad completa, instalar:
 * 
 * npm install @react-native-community/datetimepicker
 * 
 * @param {Date} value - Hora seleccionada
 * @param {function} onChange - Callback al cambiar hora
 * @param {string} label - Etiqueta
 * @param {string} placeholder - Placeholder
 * @param {boolean} error - Si hay error
 * @param {string} errorMessage - Mensaje de error
 * @param {boolean} disabled - Si está deshabilitado
 * @param {boolean} required - Si es requerido
 * 
 * @example
 * // TimePicker básico
 * const [startTime, setStartTime] = useState(new Date());
 * <TimePicker
 *   label="Hora de inicio"
 *   value={startTime}
 *   onChange={setStartTime}
 * />
 * 
 * @example
 * // Horario de clase
 * <View>
 *   <TimePicker
 *     label="Hora de inicio"
 *     value={startTime}
 *     onChange={setStartTime}
 *   />
 *   <TimePicker
 *     label="Hora de fin"
 *     value={endTime}
 *     onChange={setEndTime}
 *   />
 * </View>
 */
export function TimePicker({
  value,
  onChange,
  label,
  placeholder = "Seleccionar hora",
  error,
  errorMessage,
  disabled,
  required,
  style,
}) {
  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Override placeholder para mostrar formato de hora
  const timePlaceholder = value ? formatTime(value) : placeholder;

  return (
    <DatePicker
      mode="time"
      value={value}
      onChange={onChange}
      label={label}
      placeholder={timePlaceholder}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
      style={style}
    />
  );
}

export default TimePicker;
