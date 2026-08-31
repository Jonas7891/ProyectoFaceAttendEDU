import { TextStyle } from "react-native";

/**
 * Sistema tipográfico de FaceAttend EDU.
 * Ahora es una FUNCIÓN que recibe `fs` (font-scaler) del hook useResponsive.
 * Así cada tamaño se adapta al viewport en lugar de ser un valor fijo.
 *
 * Uso:
 *   const { fs } = useResponsive();
 *   const T = getTypography(fs);
 *   <Text style={T.displayLG}>...</Text>
 */
export function getTypography(fs: (n) => number) {
  return {
    // ── Display / Headings ─────────────────────────────────────────────
    displayXL: {
      fontSize: fs(52),
      fontWeight: "800",
      lineHeight: fs(62),
      letterSpacing: -1.5,
    },

    displayLG: {
      fontSize: fs(36),
      fontWeight: "800",
      lineHeight: fs(44),
      letterSpacing: -1,
    },

    heading1: {
      fontSize: fs(28),
      fontWeight: "700",
      lineHeight: fs(36),
      letterSpacing: -0.5,
    },

    heading2: {
      fontSize: fs(22),
      fontWeight: "700",
      lineHeight: fs(30),
      letterSpacing: -0.3,
    },

    // ── Brand / Nav ────────────────────────────────────────────────────
    brandName: {
      fontSize: fs(18),
      fontWeight: "700",
      letterSpacing: -0.3,
    },

    // ── Eyebrow ────────────────────────────────────────────────────────
    eyebrow: {
      fontSize: fs(13),
      fontWeight: "600",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },

    // ── Body ───────────────────────────────────────────────────────────
    bodyLG: {
      fontSize: fs(16),
      fontWeight: "400",
      lineHeight: fs(26),
    },

    bodyMD: {
      fontSize: fs(14),
      fontWeight: "400",
      lineHeight: fs(22),
    },

    bodySM: {
      fontSize: fs(12),
      fontWeight: "400",
      lineHeight: fs(18),
    },

    // ── Botones ────────────────────────────────────────────────────────
    buttonMD: {
      fontSize: fs(15),
      fontWeight: "700",
    },

    buttonSM: {
      fontSize: fs(13),
      fontWeight: "600",
    },

    // ── Stats / Métricas ───────────────────────────────────────────────
    statValue: {
      fontSize: fs(22),
      fontWeight: "800",
    },

    statLabel: {
      fontSize: fs(12),
      fontWeight: "400",
      marginTop: fs(2),
    },

    // ── Badge / Etiquetas flotantes ────────────────────────────────────
    badgeLabel: {
      fontSize: fs(12),
      fontWeight: "600",
    },

    // ── Footer ─────────────────────────────────────────────────────────
    caption: {
      fontSize: fs(11),
      fontWeight: "400",
    },
  };
}

// ── Exportación de compatibilidad ──────────────────────────────────────────
// Si algún componente todavía importa el objeto estático, funciona igual
// (sin escala, tallas base). Ve migrando componente a componente.
const Typography = getTypography((n) => n);
export default Typography;
