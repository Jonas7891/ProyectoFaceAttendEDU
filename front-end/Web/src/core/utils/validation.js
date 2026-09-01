/**
 * Funciones de validación reutilizables
 */

/**
 * Valida email
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que no esté vacío
 */
export function isRequired(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Valida longitud mínima
 */
export function minLength(value, min) {
  if (!value) return false;
  return value.toString().length >= min;
}

/**
 * Valida longitud máxima
 */
export function maxLength(value, max) {
  if (!value) return true;
  return value.toString().length <= max;
}

/**
 * Valida número
 */
export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Valida rango numérico
 */
export function isInRange(value, min, max) {
  const num = parseFloat(value);
  return isNumber(num) && num >= min && num <= max;
}

/**
 * Valida URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Valida teléfono (formato internacional)
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

/**
 * Valida fecha (YYYY-MM-DD o DD/MM/YYYY)
 */
export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Valida que sea mayor de edad (18+)
 */
export function isAdult(birthDate) {
  if (!isValidDate(birthDate)) return false;
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}

/**
 * Valida contraseña segura
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 */
export function isStrongPassword(password) {
  if (!password || password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Valida código de estudiante
 * Formato: letras y números, 6-12 caracteres
 */
export function isValidStudentCode(code) {
  if (!code) return false;
  const codeRegex = /^[A-Za-z0-9]{6,12}$/;
  return codeRegex.test(code);
}

/**
 * Valida archivo por tamaño
 */
export function isValidFileSize(file, maxSizeInMB) {
  if (!file) return false;
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Valida tipo de archivo
 */
export function isValidFileType(file, allowedTypes) {
  if (!file) return false;
  return allowedTypes.includes(file.type);
}

/**
 * Ejecuta múltiples validaciones
 * @param {*} value - Valor a validar
 * @param {Array} validators - Array de validadores [{ fn, message }]
 * @returns {Object} { isValid, errors }
 */
export function validate(value, validators) {
  const errors = [];
  
  for (const validator of validators) {
    const isValid = validator.fn(value);
    if (!isValid) {
      errors.push(validator.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validadores predefinidos comunes
 */
export const validators = {
  required: (message = "Este campo es requerido") => ({
    fn: isRequired,
    message,
  }),
  
  email: (message = "Email inválido") => ({
    fn: isValidEmail,
    message,
  }),
  
  minLength: (min, message = `Mínimo ${min} caracteres`) => ({
    fn: (value) => minLength(value, min),
    message,
  }),
  
  maxLength: (max, message = `Máximo ${max} caracteres`) => ({
    fn: (value) => maxLength(value, max),
    message,
  }),
  
  strongPassword: (message = "Contraseña débil: mínimo 8 caracteres, mayúsculas, minúsculas y números") => ({
    fn: isStrongPassword,
    message,
  }),
};
