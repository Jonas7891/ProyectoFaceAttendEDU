// ============================================================
//  FaceAttend EDU — Sistema de paletas semánticas de accesibilidad
//  
//  Arquitectura:
//  1. SEMANTIC_SLOTS: Define las 5 categorías semánticas genéricas
//  2. VISION_COLOR_MAP: Colores optimizados por tipo de visión
//  3. Funciones de construcción dinámica de paletas
//  4. Estados iniciales y constantes de reset
// ============================================================

// ── Función auxiliar HSL → HEX ──────────────────────────────
export function hsl(h, s, l) {
    const sv = s / 100;
    const lv = l / 100;
    const k  = (n) => (n + h / 30) % 12;
    const a  = sv * Math.min(lv, 1 - lv);
    const f  = (n) =>
        lv - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return (
        "#" +
        [f(0), f(8), f(4)]
            .map(v => Math.round(v * 255).toString(16).padStart(2, "0"))
            .join("")
    );
}

// ── 1. DEFINICIÓN DE SLOTS SEMÁNTICOS (genéricos, invariables) ───
export const SEMANTIC_SLOTS = [
    { key: "primary",  label: "Primario",     description: "Color general del aplicativo, botones principales, elementos interactivos" },
    { key: "success",  label: "Correcto",     description: "Éxitos, códigos 200, confirmaciones positivas" },
    { key: "warning",  label: "Advertencias", description: "Avisos, precauciones, estados intermedios" },
    { key: "error",    label: "Errores",      description: "Fallos, zonas de peligro, estados críticos" },
    { key: "text",     label: "Fuentes",      description: "Control de colores de texto y tipografía" },
];

// ── 2. MAPA DE COLORES POR TIPO DE VISIÓN ────────────────────────
// Cada visión tiene colores optimizados para cada slot semántico
const VISION_COLOR_MAP = {
    normal: {
        primary: hsl(217, 76, 52),  // Azul
        success: hsl(160, 65, 42),  // Verde
        warning: hsl(258, 68, 57),  // Violeta
        error:   hsl(24,  88, 54),  // Naranja
        text:    hsl(220, 14, 46),  // Gris neutro
    },
    deuteranopia: {
        primary: hsl(218, 80, 50),  // Azul
        success: hsl(196, 80, 45),  // Celeste
        warning: hsl(268, 60, 55),  // Violeta
        error:   hsl(42,  90, 46),  // Dorado
        text:    hsl(220, 10, 50),  // Gris neutro
    },
    protanopia: {
        primary: hsl(214, 82, 48),  // Azul
        success: hsl(192, 78, 44),  // Celeste
        warning: hsl(260, 55, 55),  // Violeta
        error:   hsl(48,  92, 44),  // Amarillo
        text:    hsl(220, 10, 50),  // Gris neutro
    },
    tritanopia: {
        primary: hsl(330, 65, 55),  // Rosa
        success: hsl(140, 62, 42),  // Verde
        warning: hsl(22,  86, 52),  // Naranja
        error:   hsl(358, 72, 52),  // Rojo
        text:    hsl(220, 10, 50),  // Gris neutro
    },
    achromatopsia: {
        primary: hsl(220, 0, 45),   // Gris medio
        success: hsl(220, 0, 60),   // Gris claro
        warning: hsl(220, 0, 30),   // Gris oscuro
        error:   hsl(0,   0, 18),   // Carbón
        text:    hsl(220, 0, 50),   // Gris neutro
    },
};

// ── 3. CONSTRUCCIÓN DINÁMICA DE PALETAS ───────────────────────────
/**
 * Genera la paleta completa para un tipo de visión específico
 * @param {string} visionMode - "normal" | "deuteranopia" | "protanopia" | "tritanopia" | "achromatopsia"
 * @returns {Array} Array de objetos con { key, label, description, color, semantic }
 */
export function buildPaletteForVision(visionMode) {
    const colors = VISION_COLOR_MAP[visionMode];
    return SEMANTIC_SLOTS.map(slot => ({
        key: slot.key,
        label: slot.label,
        description: slot.description,
        color: colors[slot.key],
        semantic: slot.key,
        vision: visionMode,
    }));
}

// ── 4. PALETAS PRECONSTRUIDAS (para acceso rápido) ────────────────
export const VISION_PRESETS = {
    normal:        buildPaletteForVision("normal"),
    deuteranopia:  buildPaletteForVision("deuteranopia"),
    protanopia:    buildPaletteForVision("protanopia"),
    tritanopia:    buildPaletteForVision("tritanopia"),
    achromatopsia: buildPaletteForVision("achromatopsia"),
};

// ── 5. ESTADOS INICIALES Y CONSTANTES DE RESET ────────────────────
/**
 * Estado inicial de colores customizados (empiezan con los defaults)
 * Estructura: { visionMode: { semantic: hex } }
 */
export function getInitialCustomColors() {
    const result = {};
    Object.keys(VISION_COLOR_MAP).forEach(visionMode => {
        result[visionMode] = { ...VISION_COLOR_MAP[visionMode] };
    });
    return result;
}

/**
 * Obtiene los colores por defecto de un modo de visión específico
 * @param {string} visionMode
 * @returns {Object} { semantic: hex }
 */
export function getDefaultColorsForVision(visionMode) {
    return { ...VISION_COLOR_MAP[visionMode] };
}

/**
 * Resetea un slot semántico específico a su valor por defecto
 * @param {Object} customColors - Estado actual de colores customizados
 * @param {string} visionMode - Modo de visión actual
 * @param {string} semantic - Slot semántico a resetear
 * @returns {Object} Nuevo objeto de colores con el slot reseteado
 */
export function resetSemanticSlot(customColors, visionMode, semantic) {
    return {
        ...customColors,
        [visionMode]: {
            ...customColors[visionMode],
            [semantic]: VISION_COLOR_MAP[visionMode][semantic],
        },
    };
}

/**
 * Resetea toda la paleta de un modo de visión a sus valores por defecto
 * @param {Object} customColors - Estado actual de colores customizados
 * @param {string} visionMode - Modo de visión a resetear
 * @returns {Object} Nuevo objeto de colores con la paleta reseteada
 */
export function resetVisionPalette(customColors, visionMode) {
    return {
        ...customColors,
        [visionMode]: getDefaultColorsForVision(visionMode),
    };
}

export const VISION_LABELS = {
    normal:        "Normal",
    deuteranopia:  "Deuteranopia (rojo/verde)",
    protanopia:    "Protanopia (rojo)",
    tritanopia:    "Tritanopia (azul/amarillo)",
    achromatopsia: "Acromatopsia (sin color)",
};

export const VISION_DESCRIPTIONS = {
    normal:        "Paleta base, optimizada para visión estándar.",
    deuteranopia:  "Tipo más común (~6% hombres). Afecta percepción del verde. Usa azul + dorado + violeta.",
    protanopia:    "Afecta percepción del rojo (~1% hombres). Azul + amarillo son los más distinguibles.",
    tritanopia:    "Afecta percepción del azul/amarillo (~0.01%). Rojo + verde son los más distinguibles.",
    achromatopsia: "Sin percepción de color (muy raro). Solo contraste de luminosidad es efectivo.",
};

export const VISION_MODES = [
    "normal",
    "deuteranopia",
    "protanopia",
    "tritanopia",
    "achromatopsia",
];

export const DEFAULT_ACCENT = hsl(217, 76, 52);
export const DEFAULT_MODE = "light";
export const DEFAULT_VISION_MODE = "normal";
