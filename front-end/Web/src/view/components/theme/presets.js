// ============================================================
//  FaceAttend EDU — Presets de accesibilidad por tipo de visión
//  Cada preset está curado para ser distinguible con ese tipo
//  de daltonismo. El usuario elige su modo de visión y luego
//  el accent color dentro de esa paleta (o lo ajusta con HSL).
//
//  VisionMode: "normal" | "deuteranopia" | "protanopia" | "tritanopia" | "achromatopsia"
//
//  AccessibilityPreset: { key, label, color (hex), vision }
// ============================================================

// ── Función auxiliar HSL → HEX ──────────────────────────────
function hsl(h, s, l) {
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

// ── Paletas por tipo de visión ───────────────────────────────

export const VISION_PRESETS = {
    normal: [
        { key: "azul",    label: "Azul",    color: hsl(217, 76, 52), vision: "normal" },
        { key: "verde",   label: "Verde",   color: hsl(160, 65, 42), vision: "normal" },
        { key: "violeta", label: "Violeta", color: hsl(258, 68, 57), vision: "normal" },
        { key: "naranja", label: "Naranja", color: hsl(24,  88, 54), vision: "normal" },
        { key: "neutro",  label: "Neutro",  color: hsl(220, 14, 46), vision: "normal" },
    ],
    deuteranopia: [
        { key: "azul",    label: "Azul",    color: hsl(218, 80, 50), vision: "deuteranopia" },
        { key: "dorado",  label: "Dorado",  color: hsl(42,  90, 46), vision: "deuteranopia" },
        { key: "violeta", label: "Violeta", color: hsl(268, 60, 55), vision: "deuteranopia" },
        { key: "celeste", label: "Celeste", color: hsl(196, 80, 45), vision: "deuteranopia" },
        { key: "neutro",  label: "Neutro",  color: hsl(220, 10, 50), vision: "deuteranopia" },
    ],
    protanopia: [
        { key: "azul",     label: "Azul",     color: hsl(214, 82, 48), vision: "protanopia" },
        { key: "amarillo", label: "Amarillo", color: hsl(48,  92, 44), vision: "protanopia" },
        { key: "celeste",  label: "Celeste",  color: hsl(192, 78, 44), vision: "protanopia" },
        { key: "violeta",  label: "Violeta",  color: hsl(260, 55, 55), vision: "protanopia" },
        { key: "neutro",   label: "Neutro",   color: hsl(220, 10, 50), vision: "protanopia" },
    ],
    tritanopia: [
        { key: "rojo",    label: "Rojo",    color: hsl(358, 72, 52), vision: "tritanopia" },
        { key: "verde",   label: "Verde",   color: hsl(140, 62, 42), vision: "tritanopia" },
        { key: "rosa",    label: "Rosa",    color: hsl(330, 65, 55), vision: "tritanopia" },
        { key: "naranja", label: "Naranja", color: hsl(22,  86, 52), vision: "tritanopia" },
        { key: "neutro",  label: "Neutro",  color: hsl(220, 10, 50), vision: "tritanopia" },
    ],
    achromatopsia: [
        { key: "gris-osc", label: "Gris osc.", color: hsl(220, 0, 30), vision: "achromatopsia" },
        { key: "gris-med", label: "Gris med.", color: hsl(220, 0, 45), vision: "achromatopsia" },
        { key: "gris-cla", label: "Gris cla.", color: hsl(220, 0, 60), vision: "achromatopsia" },
        { key: "carbon",   label: "Carbón",    color: hsl(0,   0, 18), vision: "achromatopsia" },
        { key: "neutro",   label: "Neutro",    color: hsl(220, 0, 50), vision: "achromatopsia" },
    ],
};

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