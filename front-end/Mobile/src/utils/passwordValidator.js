import { COMMON_PASSWORDS, SEQUENTIAL_PATTERNS } from '../services/constants/auths';

/**
 * Verifica si la contraseña tiene patrones secuenciales
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si contiene patrones secuenciales
 */
export function hasSequentialPatterns(password) {
    const lower = password.toLowerCase();
    return SEQUENTIAL_PATTERNS.some((seq) => lower.includes(seq));
}

/**
 * Verifica si la contraseña tiene caracteres repetidos consecutivos
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si tiene caracteres repetidos (aaa, 111)
 */
export function hasRepeatedChars(password) {
    return /(.)\1{2,}/.test(password);
}

/**
 * Verifica si la contraseña es común
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si es una contraseña común
 */
export function isCommonPassword(password) {
    return COMMON_PASSWORDS.some(
        (cp) => cp.toLowerCase() === password.toLowerCase()
    );
}

/**
 * Valida todos los requisitos de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} Objeto con estado de cada requisito
 */
export function validatePasswordRequirements(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        notCommon: !isCommonPassword(password),
        noSequential: !hasSequentialPatterns(password),
        noRepeated: !hasRepeatedChars(password),
    };
}

/**
 * Verifica si todos los requisitos están cumplidos
 * @param {Object} requirements - Objeto de requisitos
 * @returns {boolean} True si todos están cumplidos
 */
export function areAllRequirementsMet(requirements) {
    return Object.values(requirements).every((met) => met === true);
}

/**
 * Calcula la fortaleza de la contraseña
 * @param {Object} requirements - Objeto de requisitos
 * @param {number} length - Longitud de la contraseña
 * @returns {Object} Score y etiqueta de fortaleza
 */
export function calculatePasswordStrength(requirements, length) {
    let score = 0;

    if (requirements.length) score++;
    if (requirements.uppercase && requirements.lowercase) score++;
    if (requirements.number) score++;
    if (requirements.special) score++;
    if (length >= 12) score++;

    const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
    const colors = ['transparent', '#E53E3E', '#ED8936', '#ECC94B', '#48BB78', '#38A169'];

    return {
        score,
        label: labels[score],
        color: colors[score],
    };
}