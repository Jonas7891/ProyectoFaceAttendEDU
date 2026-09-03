import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

/**
 * SidebarItem - Item individual de navegación
 * 
 * Componente reutilizable para items del sidebar.
 * Soporta icon, label, badge, estados (active, disabled), y variantes.
 * 
 * @param {string} icon - Nombre del icono Feather
 * @param {string} label - Texto del item
 * @param {boolean} active - Si está activo (default: false)
 * @param {string|number} badge - Badge opcional (ej: notificaciones)
 * @param {string} variant - Variante: "default" | "danger" | "success" | "warning"
 * @param {function} onPress - Callback al presionar
 * @param {boolean} disabled - Si está deshabilitado (default: false)
 * @param {ReactNode} leftElement - Elemento custom izquierdo (reemplaza icon)
 * @param {ReactNode} rightElement - Elemento custom derecho (reemplaza badge)
 * @param {object} style - Estilos adicionales
 * 
 * @example
 * // Item básico
 * <SidebarItem 
 *   icon="home" 
 *   label="Inicio" 
 *   active={true}
 *   onPress={...}
 * />
 * 
 * @example
 * // Item con badge
 * <SidebarItem 
 *   icon="bell" 
 *   label="Notificaciones" 
 *   badge={5}
 *   onPress={...}
 * />
 * 
 * @example
 * // Item peligroso
 * <SidebarItem 
 *   icon="log-out" 
 *   label="Cerrar sesión" 
 *   variant="danger"
 *   onPress={handleLogout}
 * />
 */
export default function SidebarItem({
    icon,
    label,
    active = false,
    badge,
    variant = "default",
    onPress,
    disabled = false,
    leftElement,
    rightElement,
    style,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    // Colores según variante
    const getColors = () => {
        if (disabled) {
            return {
                bg: "transparent",
                text: c.text.disabled,
                icon: c.text.disabled,
                border: "transparent",
            };
        }

        if (active) {
            return {
                bg: c.brand.primaryLight,
                text: c.brand.primary,
                icon: c.brand.primary,
                border: c.brand.primary,
            };
        }

        switch (variant) {
            case "danger":
                return {
                    bg: "transparent",
                    text: c.status.error,
                    icon: c.status.error,
                    border: "transparent",
                };
            case "success":
                return {
                    bg: "transparent",
                    text: c.status.success,
                    icon: c.status.success,
                    border: "transparent",
                };
            case "warning":
                return {
                    bg: "transparent",
                    text: c.status.warning,
                    icon: c.status.warning,
                    border: "transparent",
                };
            case "default":
            default:
                return {
                    bg: "transparent",
                    text: c.text.primary,
                    icon: c.text.secondary,
                    border: "transparent",
                };
        }
    };

    const colors = getColors();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                    backgroundColor: colors.bg,
                    borderLeftWidth: active ? 3 : 0,
                    borderLeftColor: colors.border,
                },
                style,
            ]}
            activeOpacity={0.7}
        >
            {/* Left: Icon o custom element */}
            {leftElement ? (
                leftElement
            ) : icon ? (
                <Feather name={icon} size={20} color={colors.icon} />
            ) : null}

            {/* Label */}
            {label && (
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: active ? "600" : "400",
                        color: colors.text,
                        flex: 1,
                    }}
                >
                    {label}
                </Text>
            )}

            {/* Right: Badge o custom element */}
            {rightElement ? (
                rightElement
            ) : badge ? (
                <View
                    style={{
                        backgroundColor: c.status.error,
                        borderRadius: 10,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        minWidth: 20,
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#FFF",
                        }}
                    >
                        {badge}
                    </Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );
}
