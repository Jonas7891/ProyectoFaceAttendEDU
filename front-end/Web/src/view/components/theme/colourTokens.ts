// src/theme/tokens.ts

export type ThemeMode = "light" | "dark";

export type ThemeTokens = {
    mode: ThemeMode;

    colors: {
        brand: {
            primary: string;
            primaryLight: string;
            primaryDark: string;
        };

        background: {
            app: string;
            surface: string;
            elevated: string;
        };

        text: {
            primary: string;
            secondary: string;
            inverse: string;
        };

        border: {
            primary: string;
            secondary: string;
        };

        states: {
            success: string;
            warning: string;
            danger: string;
            info: string;
        };

        interactive: {
            hover: string;
            pressed: string;
            disabled: string;
        };
    };
};