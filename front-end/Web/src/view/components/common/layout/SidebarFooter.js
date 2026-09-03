import React from "react";
import { View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

/**
 * SidebarFooter - Sección inferior del Sidebar
 * 
 * Contenedor para footer del sidebar (logout, settings, etc).
 * 
 * @param {ReactNode} children - Contenido del footer
 * @param {number} padding - Padding interno (default: 0)
 * @param {boolean} border - Mostrar borde superior (default: true)
 * @param {object} style - Estilos adicionales
 * 
 * @example
 * <SidebarFooter>
 *   <SidebarItem 
 *     icon="log-out" 
 *     label="Cerrar sesión" 
 *     variant="danger"
 *     onPress={handleLogout}
 *   />
 * </SidebarFooter>
 */
export default function SidebarFooter({
    children,
    padding = 0,
    border = true,
    style,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View
            style={[
                {
                    padding,
                    borderTopWidth: border ? 1 : 0,
                    borderTopColor: c.border.primary,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}
