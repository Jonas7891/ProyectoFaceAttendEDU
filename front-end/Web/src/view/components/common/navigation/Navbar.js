import React from "react";
import { View, StyleSheet } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Navbar/Header reutilizable
 * 
 * @param {ReactNode} left - Contenido izquierdo (logo, back button, etc)
 * @param {ReactNode} center - Contenido central (título, búsqueda, etc)
 * @param {ReactNode} right - Contenido derecho (acciones, perfil, etc)
 * @param {boolean} border - Mostrar borde inferior
 */
export function Navbar({ left, center, right, border = true, style }) {
  const { sp } = useResponsive();
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.navbar,
        {
          backgroundColor: theme.colors.background.surface,
          borderBottomWidth: border ? 1 : 0,
          borderBottomColor: theme.colors.border.primary,
          paddingHorizontal: sp(20),
          paddingVertical: sp(10),
        },
        style,
      ]}
    >
      <View style={styles.section}>{left}</View>
      {center && <View style={styles.centerSection}>{center}</View>}
      <View style={styles.section}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: DESIGN_TOKENS.zIndex.sticky,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: DESIGN_TOKENS.spacing.md,
  },
});

export default Navbar;
