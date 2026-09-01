/**
 * Configuración del sistema de diseño (Design Tokens)
 * Base para el tema claro y oscuro
 */

export const DESIGN_TOKENS = {
  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },

  // Font Sizes (base - se escalan con useResponsive)
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
  },

  // Font Weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Shadows
  shadows: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Transitions
  transitions: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
  },

  // Breakpoints (para useResponsive)
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
};

/**
 * Tema claro (por defecto)
 */
export const LIGHT_THEME = {
  colors: {
    // Brand
    brand: {
      primary: "#2563EB",
      primaryDark: "#1D4ED8",
      primaryLight: "#DBEAFE",
      secondary: "#8B5CF6",
      accent: "#10B981",
    },

    // Background
    background: {
      app: "#F8FAFC",
      surface: "#FFFFFF",
      elevated: "#FFFFFF",
      hover: "#F1F5F9",
    },

    // Text
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
      tertiary: "#94A3B8",
      inverse: "#FFFFFF",
      disabled: "#CBD5E1",
    },

    // Border
    border: {
      primary: "#E2E8F0",
      secondary: "#CBD5E1",
      focus: "#2563EB",
    },

    // Status
    status: {
      success: "#10B981",
      successLight: "#D1FAE5",
      warning: "#F59E0B",
      warningLight: "#FEF3C7",
      error: "#EF4444",
      errorLight: "#FEE2E2",
      info: "#3B82F6",
      infoLight: "#DBEAFE",
    },

    // Overlay
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  mode: "light",
};

/**
 * Tema oscuro
 */
export const DARK_THEME = {
  colors: {
    // Brand
    brand: {
      primary: "#3B82F6",
      primaryDark: "#2563EB",
      primaryLight: "#1E40AF",
      secondary: "#A78BFA",
      accent: "#34D399",
    },

    // Background
    background: {
      app: "#0F172A",
      surface: "#1E293B",
      elevated: "#334155",
      hover: "#475569",
    },

    // Text
    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
      tertiary: "#94A3B8",
      inverse: "#0F172A",
      disabled: "#64748B",
    },

    // Border
    border: {
      primary: "#334155",
      secondary: "#475569",
      focus: "#3B82F6",
    },

    // Status
    status: {
      success: "#34D399",
      successLight: "#064E3B",
      warning: "#FBBF24",
      warningLight: "#78350F",
      error: "#F87171",
      errorLight: "#7F1D1D",
      info: "#60A5FA",
      infoLight: "#1E3A8A",
    },

    // Overlay
    overlay: "rgba(0, 0, 0, 0.7)",
  },

  mode: "dark",
};

export default DESIGN_TOKENS;
