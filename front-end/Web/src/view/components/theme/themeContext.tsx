import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { generateTheme } from "./generateTheme";
import { ThemeMode, ThemeTokens } from "./colourTokens";

import {
    loadAccentColor,
    loadThemeMode,
    saveAccentColor,
    saveThemeMode,
} from "./storage";

type ThemeContextType = {
    mode: ThemeMode;

    accentColor: string;

    theme: ThemeTokens;

    setMode: (mode: ThemeMode) => void;

    toggleMode: () => void;

    setAccentColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
                                  children,
                              }: {
    children: React.ReactNode;
}) {

    const [mode, setModeState] =
        useState<ThemeMode>("light");

    const [accentColor, setAccentColorState] =
        useState("#2563EB");

    useEffect(() => {

        async function loadTheme() {

            const storedMode =
                await loadThemeMode();

            const storedAccent =
                await loadAccentColor();

            setModeState(storedMode);
            setAccentColorState(storedAccent);
        }

        loadTheme();

    }, []);

    const setMode = async (newMode: ThemeMode) => {

        setModeState(newMode);

        await saveThemeMode(newMode);
    };

    const toggleMode = async () => {

        const nextMode =
            mode === "light"
                ? "dark"
                : "light";

        setModeState(nextMode);

        await saveThemeMode(nextMode);
    };

    const setAccentColor = async (color: string) => {

        setAccentColorState(color);

        await saveAccentColor(color);
    };

    const theme = useMemo(() => {

        return generateTheme(
            accentColor,
            mode
        );

    }, [accentColor, mode]);

    return (
        <ThemeContext.Provider
            value={{
                mode,

                accentColor,

                theme,

                setMode,

                toggleMode,

                setAccentColor,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {

    const context =
        useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme debe usarse dentro de ThemeProvider"
        );
    }

    return context;
}