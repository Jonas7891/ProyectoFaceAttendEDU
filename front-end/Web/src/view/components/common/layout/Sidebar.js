import React, { useRef, useEffect } from "react";
import { View, ScrollView, Animated } from "react-native";
import { useTheme } from "../../hooks/useTheme";

/**
 * Sidebar - Contenedor genérico para navegación lateral
 * 
 * Componente flexible que acepta cualquier contenido mediante composition.
 * Soporta collapsed state con animación, position configurable, width personalizable,
 * scroll automático, y accessibility completa.
 * 
 * @param {ReactNode} children - Contenido del sidebar (usar SidebarHeader, SidebarNav, etc.)
 * @param {number} width - Ancho del sidebar (default: 240)
 * @param {number} collapsedWidth - Ancho cuando está collapsed (default: 60)
 * @param {boolean} collapsible - Si permite minimizar (default: false)
 * @param {boolean} collapsed - Estado collapsed (default: false)
 * @param {function} onToggle - Callback al hacer toggle
 * @param {string} position - Posición: "left" | "right" (default: "left")
 * @param {boolean} border - Mostrar borde (default: true)
 * @param {boolean} scrollable - Si permite scroll vertical (default: true)
 * @param {boolean} animated - Animar transición collapsed (default: true)
 * @param {object} style - Estilos adicionales
 * @param {object} contentContainerStyle - Estilos del contenedor de scroll
 * 
 * @example
 * // Sidebar básico
 * <Sidebar>
 *   <SidebarHeader>
 *     <Logo />
 *   </SidebarHeader>
 *   <SidebarNav>
 *     <SidebarItem icon="home" label="Inicio" active />
 *     <SidebarItem icon="users" label="Usuarios" />
 *   </SidebarNav>
 *   <SidebarFooter>
 *     <SidebarItem icon="log-out" label="Salir" variant="danger" />
 *   </SidebarFooter>
 * </Sidebar>
 * 
 * @example
 * // Sidebar colapsable con animación
 * <Sidebar 
 *   collapsible 
 *   collapsed={isCollapsed} 
 *   onToggle={setIsCollapsed}
 *   animated
 * >
 *   <SidebarHeader>Logo</SidebarHeader>
 *   <SidebarNav>
 *     <SidebarItem icon="home" label="Inicio" />
 *     <SidebarItem icon="users" label="Usuarios" badge={3} />
 *   </SidebarNav>
 * </Sidebar>
 * 
 * @example
 * // Sidebar derecho (settings panel)
 * <Sidebar position="right" width={300}>
 *   <SidebarHeader>
 *     <Text>Configuración</Text>
 *   </SidebarHeader>
 *   <SidebarNav>
 *     <SidebarItem icon="bell" label="Notificaciones" />
 *     <SidebarItem icon="lock" label="Privacidad" />
 *   </SidebarNav>
 * </Sidebar>
 * 
 * @example
 * // Sidebar con múltiples secciones
 * <Sidebar>
 *   <SidebarHeader><UserProfile /></SidebarHeader>
 *   <SidebarNav>
 *     <SidebarItem icon="home" label="Dashboard" />
 *     <SidebarItem icon="users" label="Usuarios" />
 *   </SidebarNav>
 *   <SidebarDivider />
 *   <SidebarNav>
 *     <SidebarItem icon="settings" label="Config" />
 *     <SidebarItem icon="help-circle" label="Ayuda" />
 *   </SidebarNav>
 *   <SidebarFooter>
 *     <SidebarItem icon="log-out" label="Salir" variant="danger" />
 *   </SidebarFooter>
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
    scrollable = true,
    animated = true,
    style,
    contentContainerStyle,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    // Animated value para width
    const animatedWidth = useRef(new Animated.Value(collapsed ? collapsedWidth : width)).current;

    // Animar cambios de collapsed
    useEffect(() => {
        if (animated && collapsible) {
            Animated.timing(animatedWidth, {
                toValue: collapsed ? collapsedWidth : width,
                duration: 250,
                useNativeDriver: false, // width no soporta native driver
            }).start();
        } else {
            animatedWidth.setValue(collapsed ? collapsedWidth : width);
        }
    }, [collapsed, collapsedWidth, width, animated, collapsible]);

    const currentWidth = animated && collapsible ? animatedWidth : (collapsed ? collapsedWidth : width);

    const borderStyle = border ? {
        borderRightWidth: position === "left" ? 1 : 0,
        borderLeftWidth: position === "right" ? 1 : 0,
        borderColor: c.border.primary,
    } : {};

    const Container = scrollable ? ScrollView : View;
    const containerProps = scrollable ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: [{ flexGrow: 1 }, contentContainerStyle],
    } : {};

    return (
        <Animated.View
            accessibilityRole="navigation"
            accessibilityLabel={collapsed ? "Sidebar colapsado" : "Sidebar"}
            accessibilityState={{ expanded: !collapsed }}
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
            <Container style={{ flex: 1 }} {...containerProps}>
                {children}
            </Container>
        </Animated.View>
    );
}
