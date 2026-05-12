// src/theme/generateTheme.ts

import tinycolor from "tinycolor2";
import { ThemeMode, ThemeTokens } from "./colourTokens";

export function generateTheme(
    accentColor: string,
    mode: ThemeMode
): ThemeTokens {

    const accent = tinycolor(accentColor);

    const isDark = mode === "dark";

    return {
        mode,

        colors: {

            brand: {
                primary: accent.toHexString(),

                primaryLight: isDark
                    ? accent.lighten(8).toHexString()
                    : accent.lighten(35).toHexString(),

                primaryDark: isDark
                    ? accent.darken(12).toHexString()
                    : accent.darken(8).toHexString(),
            },

            background: {
                app: isDark
                    ? "#0F172A"
                    : "#F8FAFC",

                surface: isDark
                    ? "#1E293B"
                    : "#FFFFFF",

                elevated: isDark
                    ? "#334155"
                    : "#FFFFFF",
            },

            text: {
                primary: isDark
                    ? "#F8FAFC"
                    : "#0F172A",

                secondary: isDark
                    ? "#94A3B8"
                    : "#64748B",

                inverse: isDark
                    ? "#0F172A"
                    : "#FFFFFF",
            },

            border: {
                primary: isDark
                    ? "#334155"
                    : "#E2E8F0",

                secondary: isDark
                    ? "#475569"
                    : "#CBD5E1",
            },

            states: {
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
                info: accent.toHexString(),
            },

            interactive: {
                hover: accent.setAlpha(0.10).toRgbString(),

                pressed: accent.setAlpha(0.18).toRgbString(),

                disabled: isDark
                    ? "#475569"
                    : "#CBD5E1",
            },
        },
    };
}