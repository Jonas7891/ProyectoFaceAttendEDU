// ── Conversión HEX ↔ RGB ──────────────────────────────────────

/**
 * Convierte HEX a RGB
 * @param {string} hex - Color en formato HEX (#RRGGBB)
 * @returns {{r: number, g: number, b: number}} Objeto RGB con valores 0-255
 */
export function hexToRgb(hex) {
    const cleanHex = hex.replace('#', '');
    return {
        r: Number.parseInt(cleanHex.slice(0, 2), 16),
        g: Number.parseInt(cleanHex.slice(2, 4), 16),
        b: Number.parseInt(cleanHex.slice(4, 6), 16),
    };
}

/**
 * Convierte RGB a HEX
 * @param {number} r - Rojo (0-255)
 * @param {number} g - Verde (0-255)
 * @param {number} b - Azul (0-255)
 * @returns {string} Color en formato HEX (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const clamped = Math.max(0, Math.min(255, Math.round(n)));
        return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Valida si un string es un color HEX válido
 * @param {string} hex - String a validar
 * @returns {boolean}
 */
export function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Obtiene un color RGB puro del círculo cromático para un ángulo dado.
 * Genera colores saturados puros en el perímetro del círculo de color.
 * 
 * @param {number} hue - Ángulo en grados (0-360)
 * @returns {{r: number, g: number, b: number}} RGB (0-255)
 */
export function hueToRgb(hue) {
    const h = ((hue % 360) + 360) % 360; // Normalizar 0-360
    const segment = Math.floor(h / 60);
    const remainder = (h % 60) / 60;
    
    let r = 0, g = 0, b = 0;
    
    switch (segment) {
        case 0: // Rojo a Amarillo
            r = 255;
            g = Math.round(255 * remainder);
            b = 0;
            break;
        case 1: // Amarillo a Verde
            r = Math.round(255 * (1 - remainder));
            g = 255;
            b = 0;
            break;
        case 2: // Verde a Cian
            r = 0;
            g = 255;
            b = Math.round(255 * remainder);
            break;
        case 3: // Cian a Azul
            r = 0;
            g = Math.round(255 * (1 - remainder));
            b = 255;
            break;
        case 4: // Azul a Magenta
            r = Math.round(255 * remainder);
            g = 0;
            b = 255;
            break;
        case 5: // Magenta a Rojo
            r = 255;
            g = 0;
            b = Math.round(255 * (1 - remainder));
            break;
    }
    
    return { r, g, b };
}

/**
 * Ajusta la luminosidad/brillo de un color RGB manteniendo el matiz.
 * Interpolación lineal entre negro (brightness=0) y color puro (brightness=1).
 * Usado internamente por calculateColorFromPanel.
 * 
 * @param {{r: number, g: number, b: number}} rgb - Color base
 * @param {number} brightness - Factor de brillo (0=negro, 1=color puro)
 * @returns {{r: number, g: number, b: number}} RGB ajustado
 */
export function adjustBrightness(rgb, brightness) {
    const b = Math.max(0, Math.min(1, brightness));
    return {
        r: Math.round(rgb.r * b),
        g: Math.round(rgb.g * b),
        b: Math.round(rgb.b * b),
    };
}

/**
 * Mezcla un color RGB con blanco para reducir saturación.
 * 
 * @param {{r: number, g: number, b: number}} rgb - Color base
 * @param {number} whiteness - Factor de blanco (0=color puro, 1=blanco)
 * @returns {{r: number, g: number, b: number}} RGB mezclado
 */
export function mixWithWhite(rgb, whiteness) {
    const w = Math.max(0, Math.min(1, whiteness));
    return {
        r: Math.round(rgb.r + (255 - rgb.r) * w),
        g: Math.round(rgb.g + (255 - rgb.g) * w),
        b: Math.round(rgb.b + (255 - rgb.b) * w),
    };
}

/**
 * Calcula el color resultante en el panel 2D del picker.
 * 
 * Panel 2D funciona así:
 * - Eje X (0-100): saturación (0=blanco, 100=color puro)
 * - Eje Y (0-100): luminosidad (0=negro, 100=color puro del matiz)
 * 
 * Matemática:
 * 1. Obtener color puro del matiz
 * 2. Interpolar con blanco según X (saturación)
 * 3. Interpolar con negro según Y (luminosidad)
 * 
 * @param {number} hue - Matiz en grados (0-360)
 * @param {number} saturation - Saturación (0-100)
 * @param {number} brightness - Luminosidad (0-100)
 * @returns {string} Color resultante en HEX
 */
export function calculateColorFromPanel(hue, saturation, brightness) {
    // 1. Color puro del matiz
    const pureColor = hueToRgb(hue);
    
    // 2. Mezclar con blanco según saturación (X)
    const whiteness = 1 - (saturation / 100);
    const desaturated = mixWithWhite(pureColor, whiteness);
    
    // 3. Ajustar brillo (Y)
    const brightnessValue = brightness / 100;
    const final = adjustBrightness(desaturated, brightnessValue);
    
    return rgbToHex(final.r, final.g, final.b);
}

/**
 * Extrae los valores del panel (hue, saturation, brightness) desde un HEX.
 * Inversa de calculateColorFromPanel.
 * 
 * @param {string} hex - Color en HEX
 * @returns {{hue: number, saturation: number, brightness: number}}
 */
export function extractPanelValues(hex) {
    const rgb = hexToRgb(hex);
    const { r, g, b } = rgb;
    
    // Normalizar a 0-1
    const rN = r / 255;
    const gN = g / 255;
    const bN = b / 255;
    
    const max = Math.max(rN, gN, bN);
    const min = Math.min(rN, gN, bN);
    const delta = max - min;
    
    // Calcular Hue (matiz)
    let hue = 0;
    if (delta !== 0) {
        if (max === rN) {
            hue = ((gN - bN) / delta + (gN < bN ? 6 : 0)) / 6;
        } else if (max === gN) {
            hue = ((bN - rN) / delta + 2) / 6;
        } else {
            hue = ((rN - gN) / delta + 4) / 6;
        }
    }
    hue = hue * 360;
    
    // Brightness es simplemente el valor máximo del RGB
    const brightness = max * 100;
    
    // Saturation: si brightness=0, saturation=0; sino, delta/max
    const saturation = max === 0 ? 0 : (delta / max) * 100;
    
    return {
        hue: Math.round(hue),
        saturation: Math.round(saturation),
        brightness: Math.round(brightness),
    };
}

// ── Evaluador de color ────────────────────────────────────────
// Recibe un color HEX y un helper de traducción,
// devuelve un veredicto completo para mostrar en la UI.

export function evaluateColor(hex, t) {
    const [r, g, b] = Object.values(hexToRgb(hex)).map((channel) => channel / 255);
    const lin = (v) =>
        v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const contrastVsWhite = 1.05 / (L + 0.05);
    const contrastVsBlack = (L + 0.05) / 0.05;
    const bestContrast = Math.max(contrastVsWhite, contrastVsBlack);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lv = (max + min) / 2;
    const sv = max === min
        ? 0
        : lv > 0.5
            ? (max - min) / (2 - max - min)
            : (max - min) / (max + min);
    let hv = 0;
    if (max !== min) {
        switch (max) {
            case r:
                hv = ((g - b) / (max - min) + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                hv = ((b - r) / (max - min) + 2) / 6;
                break;
            case b:
                hv = ((r - g) / (max - min) + 4) / 6;
                break;
            default:
                break;
        }
    }
    const hueDeg = Math.round(hv * 360);
    const satPct = Math.round(sv * 100);
    const lumPct = Math.round(lv * 100);

    // ── WCAG ─────────────────────────────────────────────────
    let wcagLevel;
    if (bestContrast >= 7)        wcagLevel = "AAA";
    else if (bestContrast >= 4.5) wcagLevel = "AA";
    else if (bestContrast >= 3)   wcagLevel = "A";
    else                          wcagLevel = "Falla";

    // ── Legibilidad ──────────────────────────────────────────
    let readability;
    if (contrastVsWhite >= 7)
        readability = t("Texto blanco encima se ve perfecto");
    else if (contrastVsWhite >= 4.5)
        readability = t("Texto blanco es legible sin problema");
    else if (contrastVsWhite >= 3)
        readability = t("Texto blanco se ve, pero cuesta leerlo — mejor usar texto oscuro");
    else
        readability = t("Texto blanco encima no se lee bien — este color es demasiado claro");

    // ── Vibe de color ────────────────────────────────────────
    let vibe;
    if (satPct < 15)
        vibe = t("Tono neutro — discreto, no llama la atención");
    else if (hueDeg < 30 || hueDeg >= 340)
        vibe = t("Rojo — enérgico y llamativo, úsalo con moderación");
    else if (hueDeg < 60)
        vibe = t("Naranja / dorado — cálido y amigable");
    else if (hueDeg < 150)
        vibe = t("Verde — fresco, transmite calma y confianza");
    else if (hueDeg < 200)
        vibe = t("Cian / turquesa — moderno y tecnológico");
    else if (hueDeg < 260)
        vibe = t("Azul — profesional, genera confianza");
    else if (hueDeg < 310)
        vibe = t("Violeta / púrpura — creativo y sofisticado");
    else
        vibe = t("Rosa / magenta — expresivo y llamativo");

    // ── Adecuación UI ────────────────────────────────────────
    let uiFit;
    if (lumPct > 80)
        uiFit = t("Muy claro — puede perderse sobre fondos blancos");
    else if (lumPct < 20)
        uiFit = t("Muy oscuro — puede confundirse con el texto");
    else if (satPct < 15)
        uiFit = t("Poco saturado — funciona como neutro, pero puede pasar desapercibido");
    else if (satPct > 95 && lumPct > 60)
        uiFit = t("Muy vibrante — llama la atención, puede cansar en uso prolongado");
    else
        uiFit = t("Proporciones equilibradas — ideal para botones, tabs y bordes");

    // ── Consejo ──────────────────────────────────────────────
    let tip;
    if (contrastVsWhite < 3 && lumPct > 70)
        tip = t("Baja la luminosidad 15–20 puntos para que el texto blanco sea legible");
    else if (contrastVsWhite < 4.5 && lumPct > 55)
        tip = t("Baja la luminosidad 8–10 puntos para mejorar la legibilidad");
    else if (satPct < 15 && lumPct > 50)
        tip = t("Sube la saturación para que el acento resalte sobre los fondos");
    else if (lumPct > 80)
        tip = t("Este tono es muy pálido — bájalo para que se vea como un acento real");
    else
        tip = t("Este color funciona bien — no necesita ajustes");

    // ── Score global ─────────────────────────────────────────
    // NOTA: Estos colores son independientes del tema del usuario
    // ya que representan evaluaciones universales (éxito, advertencia, error)
    let score = "score";
    let scoreColor;
    if (contrastVsWhite >= 4.5 && satPct >= 15 && lumPct >= 20 && lumPct <= 78) {
        score = "excelente";
        scoreColor = "success"; // Verde - excelente calidad
    } else if (contrastVsWhite >= 3 && satPct >= 10 && lumPct >= 18 && lumPct <= 82) {
        score = "bueno";
        scoreColor = "success"; // Verde - buena calidad
    } else if (contrastVsWhite >= 2.5 || contrastVsBlack >= 4.5) {
        score = "aceptable";
        scoreColor = "warning"; // Naranja - aceptable
    } else if (lumPct > 80 || lumPct < 15) {
        score = "precaución";
        scoreColor = "warning"; // Naranja - precaución
    } else {
        score = "problemático";
        scoreColor = "error"; // Rojo - problemático
    }

    return {
        score,
        scoreColor,
        readability,
        vibe,
        uiFit,
        tip,
        contrastRatio: Math.round(bestContrast * 10) / 10,
        wcagLevel,
    };
}
