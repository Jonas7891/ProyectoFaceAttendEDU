// ============================================================
//  FaceAttend EDU — Design System Tokens
//  Fuente de verdad para TODOS los colores del sistema.
//  Nunca importar Colors directamente — siempre usar ThemeTokens.
// ============================================================

    mode: ThemeMode;

    colors: {
        // ── Marca / Accent ───────────────────────────────
        brand: {
            primary: string;        // accent principal (botones, tabs activos, links)
            primaryLight: string;   // fondo de elementos activos / hover sutil
            primaryDark: string;    // hover/pressed sobre el accent
        };

        // ── Fondos ───────────────────────────────────────
        background: {
            app: string;            // fondo de la pantalla raíz
            surface: string;        // cards, modales, sidebar, navbar
            elevated: string;       // dropdowns, tooltips (mayor elevación)
            overlay: string;        // backdrop de modales
        };

        // ── Texto ────────────────────────────────────────
        text: {
            primary: string;        // texto principal
            secondary: string;      // texto secundario / muted
            disabled: string;       // placeholders, texto deshabilitado
            inverse: string;        // texto sobre fondos de color (botones primarios)
            onBrand: string;        // texto sobre el accent primario
        };

        // ── Bordes ───────────────────────────────────────
        border: {
            primary: string;        // borde estándar de cards y separadores
            secondary: string;      // borde más visible (tablas, secciones)
            focus: string;          // borde de inputs con foco (= brand.primary)
            error: string;          // borde de inputs con error
        };

        // ── Estados semánticos ───────────────────────────
        states: {
            success: string;
            successLight: string;   // fondo de badges / alertas de éxito
            warning: string;
            warningLight: string;
            danger: string;
            dangerLight: string;
            info: string;
            infoLight: string;
        };

        // ── Interacción ──────────────────────────────────
        interactive: {
            hover: string;          // hover sutil sobre elementos
            pressed: string;        // pressed / active
            disabled: string;       // fondo de elementos deshabilitados
            disabledText: string;   // texto de elementos deshabilitados
        };
    };
};
