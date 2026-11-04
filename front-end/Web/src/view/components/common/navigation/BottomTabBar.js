import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

// Cuántas casillas caben a 320-375 px sin desbordar (la barra reparte el ancho a partes iguales).
// Si hay más ítems, los últimos pasan al menú «Más», conservando el orden.
export const MAX_VISIBLE_TABS = 5;

const MORE_LABEL = "Más";

/**
 * Barra inferior móvil. Muestra todos los ítems cuando caben; si no, los primeros
 * (MAX_VISIBLE_TABS - 1) y un ítem «Más» que abre el resto.
 *
 * @param {Array<{key:string, icon:string, label:string}>} tabs - ítems ya filtrados por rol
 * @param {string} activeKey - clave del ítem activo
 * @param {(item) => void} onSelect - navegación al elegir un ítem
 * @param {(s:string) => string} t - traductor
 */
export function BottomTabBar({ tabs, activeKey, onSelect, t }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const c = theme.colors;
    const [moreOpen, setMoreOpen] = React.useState(false);

    const overflowNeeded = tabs.length > MAX_VISIBLE_TABS;
    const visible = overflowNeeded ? tabs.slice(0, MAX_VISIBLE_TABS - 1) : tabs;
    const overflow = overflowNeeded ? tabs.slice(MAX_VISIBLE_TABS - 1) : [];
    const activeInOverflow = overflow.some((item) => item.key === activeKey);
    const moreLabel = t(MORE_LABEL);

    const select = (item) => {
        setMoreOpen(false);
        onSelect(item);
    };

    const renderSlot = ({ key, icon, label, active, onPress, role, expanded }) => (
        <TouchableOpacity
            key={key}
            onPress={onPress}
            accessibilityRole={role}
            accessibilityLabel={label}
            accessibilityState={{ selected: active, ...(expanded !== undefined && { expanded }) }}
            style={{
                flex: 1,
                minWidth: 0,
                paddingHorizontal: 2,
                alignItems: "center",
                paddingTop: 4,
                borderTopWidth: active ? 2 : 0,
                borderTopColor: c.brand.primary,
            }}
        >
            <Feather name={icon} size={20} color={active ? c.brand.primary : c.text.secondary} />
            <Text
                numberOfLines={1}
                style={{
                    fontSize: 11,
                    marginTop: 2,
                    color: active ? c.brand.primary : c.text.secondary,
                    fontWeight: active ? "600" : "400",
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: c.background.surface,
                borderTopWidth: 1,
                borderTopColor: c.border.primary,
            }}
        >
            {moreOpen && overflow.length > 0 && (
                <View style={{ paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: c.border.primary }}>
                    {overflow.map((item) => {
                        const active = item.key === activeKey;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                onPress={() => select(item)}
                                accessibilityRole="menuitem"
                                accessibilityLabel={t(item.label)}
                                accessibilityState={{ selected: active }}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                    paddingHorizontal: 20,
                                    paddingVertical: 12,
                                }}
                            >
                                <Feather name={item.icon} size={20} color={active ? c.brand.primary : c.text.secondary} />
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: active ? c.brand.primary : c.text.primary,
                                        fontWeight: active ? "600" : "400",
                                    }}
                                >
                                    {t(item.label)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
            <View
                style={{
                    flexDirection: "row",
                    paddingTop: 8,
                    paddingBottom: Math.max(8, insets.bottom),
                    minHeight: 52 + insets.bottom,
                }}
            >
                {visible.map((item) =>
                    renderSlot({
                        key: item.key,
                        icon: item.icon,
                        label: t(item.label),
                        active: item.key === activeKey,
                        role: "tab",
                        onPress: () => select(item),
                    }),
                )}
                {overflowNeeded &&
                    renderSlot({
                        key: "__more",
                        icon: "more-horizontal",
                        label: moreLabel,
                        active: activeInOverflow || moreOpen,
                        role: "tab",
                        expanded: moreOpen,
                        onPress: () => setMoreOpen((open) => !open),
                    })}
            </View>
        </View>
    );
}

export default BottomTabBar;
