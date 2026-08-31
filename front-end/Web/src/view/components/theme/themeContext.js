// ============================================================
//  FaceAttend EDU — ThemeContext
//  Proveedor central del sistema de temas.
//
//  Expone:
//    · theme        → ThemeTokens completo (todos los colores)
//    · mode         → "light" | "dark"
//    · accentColor  → hex del color de acento actual
//    · setMode()    → cambia el modo y lo persiste
//    · toggleMode() → alterna entre light/dark
//    · setAccentColor() → cambia el accent y lo persiste
//
//  Uso:
//    const { theme } = useTheme();
//    const colors = theme.colors;
//    <View style={{ backgroundColor: colors.background.surface }} />
// ============================================================

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { generateTheme }  from "./generateTheme";
import { ThemeMode, ThemeTokens } from "./colourTokens";
import { DEFAULT_ACCENT, DEFAULT_MODE } from "./presets";
import {
    loadAccentColor,
    loadThemeMode,
    saveAccentColor,
    saveThemeMode,
} from "./storage";

// ── Tipos del contexto ───────────────────────────────────────

    /** ThemeTokens completo — tu única fuente de colores */
    theme;
    mode: ThemeMode;
    accentColor: string;
    /** true mientras se carga la preferencia guardada */
    isLoading: boolean;
    setMode: (mode) => Promise;
    toggleMode: () => Promise;
    setAccentColor: (color) => Promise;
};

// ── Context ──────────────────────────────────────────────────

const ThemeContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────

export function ThemeProvider({ children }) {
    const [mode,        setModeState]        = useState(DEFAULT_MODE);
    const [accentColor, setAccentColorState] = useState(DEFAULT_ACCENT);
    const [isLoading,   setIsLoading]        = useState(true);

    // Cargar preferencias guardadas una sola vez al montar
    useEffect(() => {
        (async () => {
            const [storedMode, storedAccent] = await Promise.all([
                loadThemeMode(),
                loadAccentColor(),
            ]);
            setModeState(storedMode);
            setAccentColorState(storedAccent);
            setIsLoading(false);
        })();
    }, []);

    // ── Acciones ──────────────────────────────────────────────

    const setMode = async (newMode) => {
        setModeState(newMode);
        await saveThemeMode(newMode);
    };

    const toggleMode = async () => {
        const next = mode === "light" ? "dark" : "light";
        setModeState(next);
        await saveThemeMode(next);
    };

    const setAccentColor = async (color) => {
        setAccentColorState(color);
        await saveAccentColor(color);
    };

    // ── Tema derivado (re-calculado solo si cambia accent o mode) ─

    const theme = useMemo(
        () => generateTheme(accentColor, mode),
        [accentColor, mode]
    );

    return (
        <ThemeContext.Provider
            value={{
                theme,
                mode,
                accentColor,
                isLoading,
                setMode,
                toggleMode,
                setAccentColor,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// ── Hook ─────────────────────────────────────────────────────

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error(
            "[FaceAttend] useTheme() debe usarse dentro de . " +
            "Asegúrate de envolver app.tsx con ."
        );
    }
    return ctx;
}
