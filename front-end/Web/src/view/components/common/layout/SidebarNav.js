import React from "react";
import { ScrollView, View } from "react-native";

/**
 * SidebarNav - Sección de navegación del Sidebar
 * 
 * Contenedor scrollable para items de navegación.
 * Usa ScrollView internamente para listas largas.
 * 
 * @param {ReactNode} children - Items de navegación (SidebarItem)
 * @param {boolean} scrollable - Si permite scroll (default: true)
 * @param {object} style - Estilos adicionales
 * @param {object} contentContainerStyle - Estilos del contenedor interno
 * 
 * @example
 * // Navegación básica
 * <SidebarNav>
 *   <SidebarItem icon="home" label="Inicio" active />
 *   <SidebarItem icon="users" label="Usuarios" />
 *   <SidebarItem icon="settings" label="Configuración" />
 * </SidebarNav>
 * 
 * @example
 * // Sin scroll (pocos items)
 * <SidebarNav scrollable={false}>
 *   <SidebarItem icon="home" label="Inicio" />
 *   <SidebarItem icon="users" label="Usuarios" />
 * </SidebarNav>
 */
export default function SidebarNav({
    children,
    scrollable = true,
    style,
    contentContainerStyle,
}) {
    if (!scrollable) {
        return <View style={style}>{children}</View>;
    }

    return (
        <ScrollView
            style={[{ flex: 1 }, style]}
            contentContainerStyle={contentContainerStyle}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    );
}
