// ============================================================
//  colorUtils — Utilidades puras de manipulación de colores
//  Portado desde la web (FaceAttend EDU).
//  Sin dependencias de React ni de UI.
// ============================================================

// ── HSL ↔ HEX ───────────────────────────────────────────────

export function hslToHex(h, s, l) {
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

export function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
            default: break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// ── Evaluador de color ───────────────────────────────────────
// Recibe un HEX y devuelve un veredicto para mostrar en UI.

export function evaluateColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = (v) =>
        v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const contrastVsWhite = 1.05 / (L + 0.05);
    const contrastVsBlack = (L + 0.05) / 0.05;
    const bestContrast    = Math.max(contrastVsWhite, contrastVsBlack);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lv  = (max + min) / 2;
    const sv  =
        max === min
            ? 0
            : lv > 0.5
            ? (max - min) / (2 - max - min)
            : (max - min) / (max + min);
    let hv = 0;
    if (max !== min) {
        switch (max) {
            case r: hv = ((g - b) / (max - min) + (g < b ? 6 : 0)) / 6; break;
            case g: hv = ((b - r) / (max - min) + 2) / 6; break;
            case b: hv = ((r - g) / (max - min) + 4) / 6; break;
            default: break;
        }
    }
    const hueDeg = Math.round(hv * 360);
    const satPct = Math.round(sv * 100);
    const lumPct = Math.round(lv * 100);

    // WCAG
    let wcagLevel;
    if (bestContrast >= 7)        wcagLevel = 'AAA';
    else if (bestContrast >= 4.5) wcagLevel = 'AA';
    else if (bestContrast >= 3)   wcagLevel = 'A';
    else                          wcagLevel = 'Falla';

    // Legibilidad
    let readability;
    if (contrastVsWhite >= 7)
        readability = 'Texto blanco encima se ve perfecto';
    else if (contrastVsWhite >= 4.5)
        readability = 'Texto blanco es legible sin problema';
    else if (contrastVsWhite >= 3)
        readability = 'Texto blanco se ve, pero cuesta leerlo';
    else
        readability = 'Texto blanco no se lee bien — color demasiado claro';

    // Vibe
    let vibe;
    if (satPct < 15)
        vibe = 'Tono neutro — discreto';
    else if (hueDeg < 30 || hueDeg >= 340)
        vibe = 'Rojo — enérgico y llamativo';
    else if (hueDeg < 60)
        vibe = 'Naranja / dorado — cálido y amigable';
    else if (hueDeg < 150)
        vibe = 'Verde — fresco y confiable';
    else if (hueDeg < 200)
        vibe = 'Cian / turquesa — moderno';
    else if (hueDeg < 260)
        vibe = 'Azul — profesional';
    else if (hueDeg < 310)
        vibe = 'Violeta — creativo y sofisticado';
    else
        vibe = 'Rosa / magenta — expresivo';

    // Adecuación UI
    let uiFit;
    if (lumPct > 80)
        uiFit = 'Muy claro — puede perderse sobre fondos blancos';
    else if (lumPct < 20)
        uiFit = 'Muy oscuro — puede confundirse con el texto';
    else if (satPct < 15)
        uiFit = 'Poco saturado — funciona como neutro';
    else if (satPct > 95 && lumPct > 60)
        uiFit = 'Muy vibrante — puede cansar en uso prolongado';
    else
        uiFit = 'Proporciones equilibradas — ideal para botones y tabs';

    // Consejo
    let tip;
    if (contrastVsWhite < 3 && lumPct > 70)
        tip = 'Baja la luminosidad 15–20 pts para que el texto blanco sea legible';
    else if (contrastVsWhite < 4.5 && lumPct > 55)
        tip = 'Baja la luminosidad 8–10 pts para mejorar la legibilidad';
    else if (satPct < 15 && lumPct > 50)
        tip = 'Sube la saturación para que el acento resalte';
    else if (lumPct > 80)
        tip = 'Este tono es muy pálido — bájalo para que se vea como acento real';
    else
        tip = 'Este color funciona bien — no necesita ajustes';

    // Score
    let score;
    let scoreColor;
    if (contrastVsWhite >= 4.5 && satPct >= 15 && lumPct >= 20 && lumPct <= 78) {
        score = 'excelente';   scoreColor = '#10B981';
    } else if (contrastVsWhite >= 3 && satPct >= 10 && lumPct >= 18 && lumPct <= 82) {
        score = 'bueno';       scoreColor = '#10B981';
    } else if (contrastVsWhite >= 2.5 || contrastVsBlack >= 4.5) {
        score = 'aceptable';   scoreColor = '#F59E0B';
    } else if (lumPct > 80 || lumPct < 15) {
        score = 'precaución';  scoreColor = '#F59E0B';
    } else {
        score = 'problemático'; scoreColor = '#EF4444';
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
