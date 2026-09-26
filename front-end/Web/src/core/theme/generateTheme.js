import tinycolor from "tinycolor2";

/**
 * Ajusta solo la luminosidad (Value en HSV) de un color para alcanzar
 * contraste WCAG mínimo contra un fondo, preservando matiz y saturación.
 * 
 * @param {string} colorHex - Color base en HEX
 * @param {string} backgroundHex - Color de fondo en HEX
 * @param {number} minContrast - Ratio mínimo de contraste WCAG (default: 4.5 para AA)
 * @returns {string} Color ajustado en HEX
 */
function adjustColorForContrast(colorHex, backgroundHex, minContrast = 4.5) {
    const color = tinycolor(colorHex);
    const background = tinycolor(backgroundHex);
    
    // Verificar contraste actual
    const currentContrast = tinycolor.readability(color, background);
    if (currentContrast >= minContrast) {
        return colorHex;
    }
    
    // Obtener HSV del color
    const hsv = color.toHsv();
    
    // Determinar dirección del ajuste (más claro o más oscuro)
    const testBrighter = tinycolor({ h: hsv.h, s: hsv.s, v: Math.min(hsv.v + 0.1, 1) });
    const testDarker = tinycolor({ h: hsv.h, s: hsv.s, v: Math.max(hsv.v - 0.1, 0) });
    
    const contrastBrighter = tinycolor.readability(testBrighter, background);
    const contrastDarker = tinycolor.readability(testDarker, background);
    
    const shouldBrighten = contrastBrighter > contrastDarker;
    
    // Búsqueda binaria del valor óptimo de V (brightness)
    let low = shouldBrighten ? hsv.v : 0;
    let high = shouldBrighten ? 1 : hsv.v;
    let bestV = hsv.v;
    let bestContrast = currentContrast;
    
    // 20 iteraciones = precisión suficiente
    for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        const testColor = tinycolor({ h: hsv.h, s: hsv.s, v: mid });
        const testContrast = tinycolor.readability(testColor, background);
        
        if (testContrast > bestContrast) {
            bestV = mid;
            bestContrast = testContrast;
        }
        
        // Si estamos suficientemente cerca del objetivo, retornar
        if (Math.abs(testContrast - minContrast) < 0.01) {
            return tinycolor({ h: hsv.h, s: hsv.s, v: mid }).toHexString();
        }
        
        // Ajustar rango de búsqueda
        if (testContrast < minContrast) {
            if (shouldBrighten) {
                low = mid;
            } else {
                high = mid;
            }
        } else {
            if (shouldBrighten) {
                high = mid;
            } else {
                low = mid;
            }
        }
    }
    
    // Retornar mejor resultado encontrado
    return tinycolor({ h: hsv.h, s: hsv.s, v: bestV }).toHexString();
}

/**
 * Ajusta un color para que mantenga una apariencia visual equivalente
 * en diferentes temas (claro/oscuro), preservando la percepción de color
 * 
 * @param {string} colorHex - Color elegido por el usuario
 * @param {string} backgroundHex - Fondo actual
 * @param {boolean} isDark - Si es tema oscuro
 * @returns {string} Color ajustado
 */
function adaptColorForTheme(colorHex, backgroundHex, isDark) {
    const color = tinycolor(colorHex);
    const background = tinycolor(backgroundHex);
    
    // Primero verificar si ya tiene contraste suficiente
    const currentContrast = tinycolor.readability(color, background);
    if (currentContrast >= 4.5) {
        return colorHex;
    }
    
    // Obtener luminosidad del fondo
    const bgLuminance = background.getLuminance();
    
    // Determinar si el color original es claro u oscuro
    const colorLuminance = color.getLuminance();
    const isColorLight = colorLuminance > 0.5;
    
    // En temas oscuros, hacer colores más claros
    // En temas claros, hacer colores más oscuros
    // Pero solo si es necesario para contraste
    const hsl = color.toHsl();
    
    if (isDark) {
        // Tema oscuro: incrementar luminosidad manteniendo matiz
        // Si el color es muy oscuro, hacerlo más claro y vibrante
        if (hsl.l < 0.8) {
            hsl.l = Math.max(hsl.l, 0.85); // Mínimo 70% lightness en tema oscuro (más brillante)
        }
    } else {
        // Tema claro: decrementar luminosidad si es muy claro
        // Si el color es muy claro, hacerlo más oscuro
        if (hsl.l > 0.5) {
            hsl.l = Math.min(hsl.l, 0.45); // Máximo 45% lightness en tema claro
        }
    }
    
    const adjusted = tinycolor(hsl);
    
    // Verificar que el ajuste tenga contraste suficiente
    const newContrast = tinycolor.readability(adjusted, background);
    if (newContrast >= 4.5) {
        return adjusted.toHexString();
    }
    
    // Si aún no tiene contraste, usar la función de ajuste preciso
    return adjustColorForContrast(adjusted.toHexString(), backgroundHex, 4.5);
}

/**
 * Genera un tema completo a partir de colores semánticos
 * @param {string|Object} accentColorOrColors - Color hex o objeto con colores semánticos { primary, success, warning, error, text }
 * @param {string} mode - "light" o "dark"
 * @returns {Object} Tema completo con colores
 */
export function generateTheme(accentColorOrColors, mode) {
    // Si recibe un string, es el color de acento simple
    const isSimpleAccent = typeof accentColorOrColors === "string";
    
    const accentHex = isSimpleAccent ? accentColorOrColors : accentColorOrColors.primary;
    const accent = tinycolor(accentHex);
    const isDark = mode === "dark";

    // Colores semánticos personalizados (si se proporcionan)
    const customColors = isSimpleAccent ? {} : accentColorOrColors;
    
    // Usar colores personalizados o valores por defecto
    const successColor = customColors.success || "#10B981";
    const warningColor = customColors.warning || "#F59E0B";
    const errorColor = customColors.error || "#EF4444";
    
    // Fuentes: color base elegido por el usuario (única fuente de verdad para texto general)
    // Si el usuario personalizó el color (customColors.text), usarlo
    // Si no, usar el default correspondiente al tema actual
    const fontColorBase = customColors.text || (isDark ? "#F1F5F9" : "#0F172A");

    // Fondo global
    const appBackground = isDark ? "#0F172A" : "#F8FAFC";
    const surfaceBackground = isDark ? "#1E293B" : "#FFFFFF";
    
    // ── Color primario ajustado para contraste con fondo (igual que Fuentes) ──
    // IMPORTANTE: Evita primario blanco sobre fondo blanco o primario negro sobre fondo negro
    // preservando el matiz y la percepción visual del color
    const primaryColorEffective = adaptColorForTheme(accentHex, appBackground, isDark);
    const accentEffective = tinycolor(primaryColorEffective);
    
    // ── Color de texto principal (ajustado para contraste con fondo) ──
    // IMPORTANTE: Este ajuste garantiza que el color elegido se vea bien en AMBOS temas
    // preservando el matiz y la percepción visual del color
    const fontColorEffective = adaptColorForTheme(fontColorBase, appBackground, isDark);
    
    // Generar variante light del color primario (usando el ajustado)
    const primaryLight = isDark
        ? accentEffective.clone().lighten(8).setAlpha(0.18).toRgbString()
        : accentEffective.clone().lighten(30).toHexString();

    const primaryDark = isDark
        ? accentEffective.clone().lighten(10).toHexString()
        : accentEffective.clone().darken(10).toHexString();

    const focusColor = accentEffective.toHexString();

    // ── Fondos derivados para badges semánticos ──
    // Generan un fondo más claro/oscuro que contraste con el color semántico usado como texto
    function generateLightBackground(semanticColor) {
        const color = tinycolor(semanticColor);
        if (isDark) {
            // En modo oscuro: fondo translúcido
            return color.clone().setAlpha(0.18).toRgbString();
        } else {
            // En modo claro: fondo más claro
            return color.clone().lighten(35).toHexString();
        }
    }

    const successLight = generateLightBackground(successColor);
    const warningLight = generateLightBackground(warningColor);
    const errorLight = generateLightBackground(errorColor);

    // ── Textos sobre fondos sólidos con color (botones primarios) ──
    // INDEPENDIENTES del slot Fuentes y del slot semántico
    // Calculados dinámicamente según la luminosidad del fondo
    // Regla: Si el fondo es claro, usar texto oscuro. Si es oscuro, usar texto claro.
    function getTextOnColor(bgColor) {
        const color = tinycolor(bgColor);
        const luminance = color.getLuminance();
        return luminance > 0.5 ? "#0F172A" : "#FFFFFF";
    }
    
    const textOnPrimary = getTextOnColor(accentEffective.toHexString());
    const textOnSuccess = getTextOnColor(successColor);
    const textOnWarning = getTextOnColor(warningColor);
    const textOnError = getTextOnColor(errorColor);

    return {
        mode,
        colors: {
            // Color de fuente base (almacenado y efectivo)
            font: fontColorEffective,     // Para texto sobre fondo global
            fontBase: fontColorBase,      // Original elegido por usuario (NO cambiar)
            
            brand: {
                primary:      accentEffective.toHexString(),  // Color ajustado con contraste
                primaryBase:  accentHex,                       // Color original elegido (NO cambiar)
                primaryLight,
                primaryDark,
                textOnPrimary,
            },
            background: {
                app:      appBackground,
                surface:  surfaceBackground,
                elevated: isDark ? "#334155" : "#FFFFFF",
                overlay:  "rgba(0, 0, 0, 0.45)",
            },
            text: {
                primary:   fontColorEffective,
                secondary: isDark ? "#94A3B8" : "#64748B",
                disabled:  isDark ? "#475569" : "#94A3B8",
                inverse:   isDark ? "#0F172A" : "#FFFFFF",
                onBrand:   textOnPrimary,
            },
            border: {
                primary:   isDark ? "#334155" : "#E2E8F0",
                secondary: isDark ? "#475569" : "#CBD5E1",
                focus: focusColor,
                error: errorColor,
            },
            status: {
                success:      successColor,
                successLight: successLight,
                successDark:  tinycolor(successColor).darken(20).toHexString(),
                successText:  textOnSuccess,
                warning:      warningColor,
                warningLight: warningLight,
                warningDark:  tinycolor(warningColor).darken(20).toHexString(),
                warningText:  textOnWarning,
                error:        errorColor,
                errorLight:   errorLight,
                errorDark:    tinycolor(errorColor).darken(20).toHexString(),
                errorText:    textOnError,
                danger:       errorColor,
                dangerLight:  errorLight,
                dangerDark:   tinycolor(errorColor).darken(20).toHexString(),
                dangerText:   textOnError,
                info:         accentEffective.toHexString(),
                infoLight:    primaryLight,
                infoDark:     primaryDark,
                infoText:     textOnPrimary,
            },
            interactive: {
                hover:        accentEffective.clone().setAlpha(0.08).toRgbString(),
                pressed:      accentEffective.clone().setAlpha(0.16).toRgbString(),
                disabled:     isDark ? "#334155" : "#E2E8F0",
                disabledText: isDark ? "#475569" : "#94A3B8",
            },
        },
    };
}
