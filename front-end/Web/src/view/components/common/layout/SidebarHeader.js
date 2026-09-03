import React from "react";
import { View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

/**
 * SidebarHeader - Sección superior del Sidebar
 * 
 * Contenedor para header del sidebar (logo, user profile, etc).
 * 
 * @param {ReactNode} children - Contenido del header
 * @param {number} padding - Padding interno (default: 20)
 * @param {boolean} border - Mostrar borde inferior (default: true)
 * @param {object} style - Estilos adicionales
 * 
 * @example
 * <SidebarHeader>
 *   <Image source={logo} style={{ width: 40, height: 40 }} />
 *   <Text>Mi App</Text>
 * </SidebarHeader>
 * 
 * @example
 * <SidebarHeader>
 *   <UserProfile user={user} />
 * </SidebarHeader>
 */
export default function SidebarHeader({
    children,
    padding = 20,
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
                    borderBottomWidth: border ? 1 : 0,
                    borderBottomColor: c.border.primary,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}
