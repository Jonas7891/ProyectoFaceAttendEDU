import tinycolor from "tinycolor2";
import { ThemeMode, ThemeTokens } from "./colourTokens";

export function generateTheme(
    accentColor: string,
    mode: ThemeMode
): ThemeTokens {
    const accent = tinycolor(accentColor);
    const isDark = mode === "dark";

    // ── primaryLight: mismo tono y saturación, solo sube luminosidad ─
    // Mantiene la saturación del accent para que el tinte siga siendo
    // vibrante y concordante. Solo controla que L no supere 93 para
    // que borders y fondos sean siempre distinguibles del blanco puro.
    const { h, s, l } = accent.toHsl();
    const lightL = Math.min(93, l + (100 - l) * 0.78);

    const primaryLight = isDark
        ? accent.clone().lighten(8).setAlpha(0.18).toRgbString()
        : tinycolor({ h, s, l: lightL }).toHexString();

    const primaryDark = isDark
        ? accent.clone().lighten(10).toHexString()
        : accent.clone().darken(10).toHexString();

    const focusColor = accent.toHexString();
    const errorColor = "#EF4444";

    return {
        mode,
        colors: {
            brand: {
                primary:      accent.toHexString(),
                primaryLight,
                primaryDark,
            },
            background: {
                app:      isDark ? "#0F172A" : "#F8FAFC",
                surface:  isDark ? "#1E293B" : "#FFFFFF",
                elevated: isDark ? "#334155" : "#FFFFFF",
                overlay:  "rgba(0, 0, 0, 0.45)",
            },
            text: {
                primary:   isDark ? "#F1F5F9" : "#0F172A",
                secondary: isDark ? "#94A3B8" : "#64748B",
                disabled:  isDark ? "#475569" : "#94A3B8",
                inverse:   isDark ? "#0F172A" : "#FFFFFF",
                onBrand:   "#FFFFFF",
            },
            border: {
                primary:   isDark ? "#334155" : "#E2E8F0",
                secondary: isDark ? "#475569" : "#CBD5E1",
                focus:     focusColor,
                error:     errorColor,
            },
            states: {
                success:      "#10B981",
                successLight: isDark ? "rgba(16,185,129,0.18)" : "#D1FAE5",
                warning:      "#F59E0B",
                warningLight: isDark ? "rgba(245,158,11,0.18)"  : "#FEF3C7",
                danger:       "#EF4444",
                dangerLight:  isDark ? "rgba(239,68,68,0.18)"   : "#FEE2E2",
                info:         accent.toHexString(),
                infoLight:    primaryLight,
            },
            interactive: {
                hover:        accent.clone().setAlpha(0.08).toRgbString(),
                pressed:      accent.clone().setAlpha(0.16).toRgbString(),
                disabled:     isDark ? "#334155" : "#E2E8F0",
                disabledText: isDark ? "#475569" : "#94A3B8",
            },
        },
    };
}