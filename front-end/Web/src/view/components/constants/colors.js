// ============================================================
//  FaceAttend EDU — colors.ts  [DEPRECATED / COMPAT LAYER]
//
//  ⚠️  ESTE ARCHIVO ESTÁ DEPRECADO.
//  No agregar nuevas referencias a este archivo.
//  Usar siempre:
//
//    import { useTheme } from "../theme/ThemeContext";
//    const { theme } = useTheme();
//    const colors = theme.colors;
//
//  Este archivo se mantiene SOLO como capa de compatibilidad
//  para importaciones legacy que aún no hayan sido migradas.
//  Será eliminado en una versión futura.
// ============================================================

/**
 * @deprecated Usa `useTheme()` y `theme.colors` en su lugar.
 */
const Colors = {
  /** @deprecated → theme.colors.background.app */
  bg:           "#F8FAFC",
  /** @deprecated → theme.colors.background.surface */
  surface:      "#FFFFFF",
  /** @deprecated → theme.colors.brand.primary */
  primary:      "#2563EB",
  /** @deprecated → theme.colors.brand.primaryDark */
  primaryHover: "#1D4ED8",
  /** @deprecated → theme.colors.brand.primaryLight */
  primaryLight: "#DBEAFE",
  /** @deprecated → theme.colors.text.primary */
  text:         "#0F172A",
  /** @deprecated → theme.colors.text.secondary */
  muted:        "#64748B",
  /** @deprecated → theme.colors.border.primary */
  border:       "#E2E8F0",
};

export default Colors;
