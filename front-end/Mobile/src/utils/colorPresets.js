// ============================================================
//  colorPresets — Paletas de colores de acento por tipo de visión
//  Portado desde la web (FaceAttend EDU).
//  Sin dependencias de React ni de UI.
// ============================================================

function hsl(h, s, l) {
    const sv = s / 100;
    const lv = l / 100;
    const k  = (n) => (n + h / 30) % 12;
    const a  = sv * Math.min(lv, 1 - lv);
    const f  = (n) =>
        lv - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return (
        '#' +
        [f(0), f(8), f(4)]
            .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
            .join('')
    );
}

export const VISION_PRESETS = {
    normal: [
        { key: 'azul',    label: 'Azul',    color: hsl(217, 76, 52) },
        { key: 'verde',   label: 'Verde',   color: hsl(160, 65, 42) },
        { key: 'violeta', label: 'Violeta', color: hsl(258, 68, 57) },
        { key: 'naranja', label: 'Naranja', color: hsl(24,  88, 54) },
        { key: 'neutro',  label: 'Neutro',  color: hsl(220, 14, 46) },
    ],
    deuteranopia: [
        { key: 'azul',    label: 'Azul',    color: hsl(218, 80, 50) },
        { key: 'dorado',  label: 'Dorado',  color: hsl(42,  90, 46) },
        { key: 'violeta', label: 'Violeta', color: hsl(268, 60, 55) },
        { key: 'celeste', label: 'Celeste', color: hsl(196, 80, 45) },
        { key: 'neutro',  label: 'Neutro',  color: hsl(220, 10, 50) },
    ],
    protanopia: [
        { key: 'azul',     label: 'Azul',     color: hsl(214, 82, 48) },
        { key: 'amarillo', label: 'Amarillo', color: hsl(48,  92, 44) },
        { key: 'celeste',  label: 'Celeste',  color: hsl(192, 78, 44) },
        { key: 'violeta',  label: 'Violeta',  color: hsl(260, 55, 55) },
        { key: 'neutro',   label: 'Neutro',   color: hsl(220, 10, 50) },
    ],
    tritanopia: [
        { key: 'rojo',    label: 'Rojo',    color: hsl(358, 72, 52) },
        { key: 'verde',   label: 'Verde',   color: hsl(140, 62, 42) },
        { key: 'rosa',    label: 'Rosa',    color: hsl(330, 65, 55) },
        { key: 'naranja', label: 'Naranja', color: hsl(22,  86, 52) },
        { key: 'neutro',  label: 'Neutro',  color: hsl(220, 10, 50) },
    ],
    achromatopsia: [
        { key: 'gris-osc', label: 'Gris osc.', color: hsl(220, 0, 30) },
        { key: 'gris-med', label: 'Gris med.', color: hsl(220, 0, 45) },
        { key: 'gris-cla', label: 'Gris cla.', color: hsl(220, 0, 60) },
        { key: 'carbon',   label: 'Carbón',    color: hsl(0,   0, 18) },
        { key: 'neutro',   label: 'Neutro',    color: hsl(220, 0, 50) },
    ],
};

export const VISION_MODES = [
    'normal',
    'deuteranopia',
    'protanopia',
    'tritanopia',
    'achromatopsia',
];

export const VISION_LABELS = {
    normal:        'Normal',
    deuteranopia:  'Deuteranopia',
    protanopia:    'Protanopia',
    tritanopia:    'Tritanopia',
    achromatopsia: 'Acromatopsia',
};

export const VISION_DESCRIPTIONS = {
    normal:        'Paleta base, optimizada para visión estándar.',
    deuteranopia:  'Tipo más común (~6% hombres). Afecta percepción del verde. Usa azul + dorado + violeta.',
    protanopia:    'Afecta percepción del rojo (~1% hombres). Azul + amarillo son los más distinguibles.',
    tritanopia:    'Afecta percepción del azul/amarillo (~0.01%). Rojo + verde son los más distinguibles.',
    achromatopsia: 'Sin percepción de color (muy raro). Solo el contraste de luminosidad es efectivo.',
};

// Color de acento por defecto (azul FaceAttend)
export const DEFAULT_ACCENT = hsl(217, 76, 52);
export const DEFAULT_VISION_MODE = 'normal';
