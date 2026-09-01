/**
 * Colores base del sistema
 * 
 * @deprecated Este archivo es solo para compatibilidad legacy.
 * Usa `useTheme()` del ThemeContext en su lugar:
 * 
 * ```javascript
 * import { useTheme } from '@/view/components/theme/ThemeContext';
 * const { theme } = useTheme();
 * const colors = theme.colors;
 * ```
 */
const Colors = {
  bg:           "#F8FAFC",
  surface:      "#FFFFFF",
  primary:      "#2563EB",
  primaryHover: "#1D4ED8",
  primaryLight: "#DBEAFE",
  text:         "#0F172A",
  muted:        "#64748B",
  border:       "#E2E8F0",
};

export default Colors;
