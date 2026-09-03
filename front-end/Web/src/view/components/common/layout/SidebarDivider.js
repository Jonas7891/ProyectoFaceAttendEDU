import React from "react";
import { View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

/**
 * SidebarDivider - Separador visual para Sidebar
 * 
 * Línea divisora entre secciones del sidebar.
 * 
 * @param {number} marginVertical - Margen vertical (default: 8)
 * @param {number} marginHorizontal - Margen horizontal (default: 16)
 * @param {object} style - Estilos adicionales
 * 
 * @example
 * <SidebarNav>
 *   <SidebarItem icon="home" label="Inicio" />
 *   <SidebarItem icon="users" label="Usuarios" />
 * </SidebarNav>
 * <SidebarDivider />
 * <SidebarNav>
 *   <SidebarItem icon="settings" label="Configuración" />
 * </SidebarNav>
 */
export default function SidebarDivider({
    marginVertical = 8,
    marginHorizontal = 16,
    style,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View
            style={[
                {
                    height: 1,
                    backgroundColor: c.border.primary,
                    marginVertical,
                    marginHorizontal,
                },
                style,
            ]}
        />
    );
}
