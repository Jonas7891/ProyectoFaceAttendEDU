import React from "react";
import { View, ScrollView, Animated } from "react-native";
import { useTheme } from "../../hooks/useTheme";

/**
 * Sidebar - Contenedor genérico para navegación lateral
 * 
 * Componente flexible que acepta cualquier contenido mediante composition.
 * Soporta collapsed state, position configurable, y width personalizable.
 * 
 * @param {ReactNode} children - Contenido del sidebar (usar SidebarHeader, SidebarNav, etc.)
 * @param {number} width - Ancho del sidebar (default: 240)
 * @param {number} collapsedWidth - Ancho cuando está collapsed (default: 60)
 * @param {boolean} collapsible - Si permite minimizar (default: false)
 * @param {boolean} collapsed - Estado collapsed (default: false)
 * @param {function} onToggle - Callback al hacer toggle
 * @param {string} position - Posición: "left" | "right" (default: "left")
 * @param {boolean} border - Mostrar borde (default: true)
 * @param {object} style - Estilos adicionales
 * 
 * @example
 * // Sidebar básico
 * <Sidebar>
 *   <SidebarNav>
 *     <SidebarItem icon="home" label="Inicio" />
 *   </SidebarNav>
 * </Sidebar>
 * 
 * @example
 * // Sidebar colapsable
 * <Sidebar collapsible collapsed={isCollapsed} onToggle={toggle}>
 *   <SidebarHeader>Logo</SidebarHeader>
 *   <SidebarNav>{items}</SidebarNav>
 * </Sidebar>
 * 
 * @example
 * // Sidebar derecho (settings panel)
 * <Sidebar position="right" width={300}>
 *   <SidebarHeader>Configuración</SidebarHeader>
 *   {/* contenido */}
 * </Sidebar>
 */
export default function Sidebar({
    children,
    width = 240,
    collapsedWidth = 60,
    collapsible = false,
    collapsed = false,
    onToggle,
    position = "left",
    border = true,
    style,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    const currentWidth = collapsed ? collapsedWidth : width;

    const borderStyle = border ? {
        borderRightWidth: position === "left" ? 1 : 0,
        borderLeftWidth: position === "right" ? 1 : 0,
        borderColor: c.border.primary,
    } : {};

    return (
        <View
            style={[
                {
                    width: currentWidth,
                    backgroundColor: c.background.surface,
                    height: "100%",
                    flexDirection: "column",
                },
                borderStyle,
                style,
            ]}
        >
            {children}
        </View>
    );
}
