import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

/**
 * SidebarHeader - Sección superior del Sidebar
 * 
 * Contenedor para header del sidebar (logo, user profile, title, close button, etc).
 * Soporta títulos, botones de cierre/toggle, y contenido custom.
 * 
 * @param {ReactNode} children - Contenido del header
 * @param {string} title - Título del sidebar (opcional)
 * @param {number} padding - Padding interno (default: 20)
 * @param {boolean} border - Mostrar borde inferior (default: true)
 * @param {boolean} showClose - Mostrar botón de cierre (default: false)
 * @param {function} onClose - Callback al cerrar
 * @param {boolean} showToggle - Mostrar botón de toggle collapsed (default: false)
 * @param {function} onToggle - Callback al hacer toggle
 * @param {boolean} collapsed - Estado collapsed (para toggle icon)
 * @param {string} align - Alineación: "flex-start" | "center" | "space-between" (default: "flex-start")
 * @param {object} style - Estilos adicionales
 * 
 * @example
 * // Header básico con children
 * <SidebarHeader>
 *   <Image source={logo} style={{ width: 40, height: 40 }} />
 *   <Text>Mi App</Text>
 * </SidebarHeader>
 * 
 * @example
 * // Header con título y botón de cierre
 * <SidebarHeader 
 *   title="Menú Principal" 
 *   showClose 
 *   onClose={handleClose}
 * />
 * 
 * @example
 * // Header con toggle collapsed
 * <SidebarHeader 
 *   title="Navegación"
 *   showToggle 
 *   onToggle={handleToggle}
 *   collapsed={isCollapsed}
 * />
 * 
 * @example
 * // Header con user profile y close
 * <SidebarHeader showClose onClose={handleClose} align="space-between">
 *   <UserProfile user={user} />
 * </SidebarHeader>
 */
export default function SidebarHeader({
    children,
    title,
    padding = 20,
    border = true,
    showClose = false,
    onClose,
    showToggle = false,
    onToggle,
    collapsed = false,
    align = "flex-start",
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
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: align,
                    gap: 12,
                },
                style,
            ]}
        >
            {/* Título o children */}
            {title ? (
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: c.text.primary,
                        flex: 1,
                    }}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            ) : (
                <View style={{ flex: 1 }}>{children}</View>
            )}

            {/* Botón de toggle */}
            {showToggle && onToggle && (
                <TouchableOpacity
                    onPress={onToggle}
                    accessibilityRole="button"
                    accessibilityLabel={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                    accessibilityHint="Cambiar tamaño del sidebar"
                    style={{
                        padding: 8,
                        borderRadius: 4,
                    }}
                >
                    <Feather
                        name={collapsed ? "chevrons-right" : "chevrons-left"}
                        size={20}
                        color={c.text.secondary}
                    />
                </TouchableOpacity>
            )}

            {/* Botón de cierre */}
            {showClose && onClose && (
                <TouchableOpacity
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar sidebar"
                    accessibilityHint="Cerrar el panel lateral"
                    style={{
                        padding: 8,
                        borderRadius: 4,
                    }}
                >
                    <Feather name="x" size={20} color={c.text.secondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}
