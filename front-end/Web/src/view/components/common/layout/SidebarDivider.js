import React from "react";
import { View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

/**
 * SidebarDivider - Separador visual para Sidebar
 * 
 * Línea divisora entre secciones del sidebar.
 * Útil para agrupar visualmente items relacionados.
 * 
 * @param {number} marginVertical - Margen vertical (default: 8)
 * @param {number} marginHorizontal - Margen horizontal (default: 16)
 * @param {number} height - Altura de la línea (default: 1)
 * @param {string} color - Color custom del divider (default: theme border)
 * @param {object} style - Estilos adicionales
 * 
 * @example
 * // Divider básico
 * <SidebarNav>
 *   <SidebarItem icon="home" label="Inicio" />
 *   <SidebarItem icon="users" label="Usuarios" />
 * </SidebarNav>
 * <SidebarDivider />
 * <SidebarNav>
 *   <SidebarItem icon="settings" label="Configuración" />
 * </SidebarNav>
 * 
 * @example
 * // Divider con más spacing
 * <SidebarDivider marginVertical={16} />
 * 
 * @example
 * // Divider custom color
 * <SidebarDivider color="#E0E0E0" />
 */
export default function SidebarDivider({
    marginVertical = 8,
    marginHorizontal = 16,
    height = 1,
    color,
    style,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View
            accessibilityRole="none"
            style={[
                {
                    height,
                    backgroundColor: color || c.border.primary,
                    marginVertical,
                    marginHorizontal,
                },
                style,
            ]}
        />
    );
}
