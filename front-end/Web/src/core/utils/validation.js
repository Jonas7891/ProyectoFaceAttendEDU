/**
 * Funciones de validación reutilizables
 */

import { validatePassword, getPasswordStrength, getPasswordStrengthLevel } from "./passwordValidation";

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid") // false
 */
export function isValidEmail(email) {
  if (!email) return false;
  // Las etiquetas del dominio excluyen el punto: sin retroceso cuadrático (ReDoS).
  const emailRegex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de teléfono (internacional)
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} true si el teléfono es válido
 * @example
 * isValidPhone("+1 (555) 123-4567") // true
 * isValidPhone("123") // false
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  const digits = phone.replace(/\D/g, "").length;
  return phoneRegex.test(phone) && digits >= 10 && digits <= 15;
}

/** Teléfono: solo dígitos (máx. 15, el límite E.164). */
export function normalizePhone(text) {
  return String(text ?? "").replace(/\D/g, "").slice(0, 15);
}

/**
 * Fecha de nacimiento (YYYY-MM-DD, opcional): fecha real del calendario, no
 * futura y no anterior a 1900. Mismo rango que valida identity (Person).
 * @returns {string|null} mensaje de error o null si es válida o está vacía
 */
export function birthDateError(value, today = new Date()) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return "La fecha de nacimiento está incompleta o no es válida";
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "La fecha de nacimiento está incompleta o no es válida";
  }
  if (year < 1900) return "La fecha de nacimiento no puede ser anterior a 1900";
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date > endOfToday) return "La fecha de nacimiento no puede ser futura";
  return null;
}

// Re-exported for the password policy checks and PasswordStrengthIndicator.
export { validatePassword as checkPassword, getPasswordStrength, getPasswordStrengthLevel };

