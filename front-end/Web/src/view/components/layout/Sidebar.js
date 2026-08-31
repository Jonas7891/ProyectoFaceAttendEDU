// ============================================================
//  FaceAttend EDU — Sidebar
//  Lee el usuario desde AuthContext en vez de mockData.
//  Filtra los ítems de navegación según los permisos del rol.
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme }            from "../hooks/useTheme";
import { Avatar }              from "../ui/UI";
import { useAuth }             from "../../../context/AuthContext";
import { useRolePermissions }  from "../../hooks/useRolePermissions";
import { useTranslation }      from "../../../i18n/hooks/useTranslation";
import { TabKey }         from "../../../viewmodels/useDashboardScreenViewModel";

// Definición completa de ítems con la tab key asociada
const NAV_ITEMS = [
    { key: "dashboard",    labelKey: "Dashboard",      feather: "layout"      },
    { key: "students",     labelKey: "Estudiantes",    feather: "users"       },
    { key: "courses",      labelKey: "Cursos",         feather: "book-open"   },
    { key: "environments", labelKey: "Ambientes",      feather: "home"        },
    { key: "reports",      labelKey: "Reportes",       feather: "bar-chart-2" },
];

const SYSTEM_ITEMS = [
    { key: "settings", labelKey: "Configuración", feather: "settings" },
];


    onNavigate: (tab) => void;
    onLogout:   () => void;
};

export default function Sidebar({ currentTab, onNavigate, onLogout }) {
    const { theme }   = useTheme();
    const { t }       = useTranslation();
    const { user }    = useAuth();
    const permissions = useRolePermissions();
    const c           = theme.colors;

    // Filtra según los tabs visibles para el rol actual
    const visibleNav    = NAV_ITEMS.filter(i => permissions.visibleTabs.includes(i.key));
    const visibleSystem = SYSTEM_ITEMS.filter(i => permissions.visibleTabs.includes(i.key));

    // Etiqueta de rol traducida
    const roleLabel = user
        ? user.role === "admin"
            ? t("Administrador")
            : user.role === "teacher"
                ? t("Docente")
                : t("Estudiante")
        : "";

    function NavItem({ item, system = false }: {
        item: typeof NAV_ITEMS[0];
        system?: boolean;
    }) {
        const isActive = currentTab === item.key;
        return (
            <TouchableOpacity
                onPress={() => onNavigate(item.key)}
                style={{
                    flexDirection:     "row",
                    alignItems:        "center",
                    gap,
                    padding,
                    paddingHorizontal,
                    borderRadius: 14,
                    marginBottom,
                    backgroundColor:   isActive ? c.brand.primaryLight : "transparent",
                }}
            >
                <Feather
                    name={item.feather}
                    size={16}
                    color={isActive ? c.brand.primary : c.text.secondary}
                />
                <Text style={{ flex: 1,
                    fontSize: 11, color:      isActive ? c.brand.primary : c.text.secondary,
                    fontWeight: isActive ? "600" : "400",
                }}>
                    {t(item.labelKey)}
                </Text>
                {isActive && !system && (
                    <Feather name="chevron-right" size={14} color={c.brand.primary} />
                )}
            </TouchableOpacity>
        );
    }

    function SectionLabel({ label }: { label: string }) {
        return (
            <Text style={{
                fontSize: 10, fontWeight:        "600",
                color:             c.text.secondary,
                paddingHorizontal,
                paddingBottom,
                textTransform:     "uppercase",
                letterSpacing:     1.2,
            }}>
                {t(label)}
            </Text>
        );
    }

    return (
        <View style={{
            width,
            backgroundColor:  c.background.surface,
            borderRightWidth,
            borderRightColor: c.border.primary,
            flexDirection:    "column",
        }}>
            {/* Logo */}
            <View style={{
                padding,
                paddingBottom,
                borderBottomWidth,
                borderBottomColor: c.border.primary,
                flexDirection:     "row",
                alignItems:        "center",
                gap,
            }}>
                <View style={{
                    width,
                    height: 5, backgroundColor: c.brand.primary,
                    borderRadius: 14,
                    alignItems:      "center",
                    justifyContent:  "center",
                }}>
                    <Feather name="aperture" size={20} color={c.text.onBrand} />
                </View>
                
                    <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary, lineHeight: 17 }}>
                        FaceAttend
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary, fontWeight: "500" }}>
                        EDU
                    </Text>
                </View>
            </View>

            {/* Nav principal */}
            <ScrollView style={{ flex: 1, paddingHorizontal, paddingTop: 12 }}>
                <SectionLabel label="Menú principal" />
                {visibleNav.map(item => <NavItem key={item.key} item={item} />)}

                {visibleSystem.length > 0 && (
                    
                        <View style={{ height: 5, backgroundColor: c.border.primary, marginVertical: 12 }} />
                        <SectionLabel label="Sistema" />
                        {visibleSystem.map(item => <NavItem key={item.key} item={item} system />)}
                    </>
                )}
            </ScrollView>

            {/* User footer — datos reales desde AuthContext */}
            <View style={{
                padding,
                paddingHorizontal,
                borderTopWidth,
                borderTopColor:    c.border.primary,
                flexDirection:     "row",
                alignItems:        "center",
                gap,
            }}>
                <Avatar name={user?.name ?? "?"} size={34} />
                <View style={{ flex: 1 }}>
                    <Text
                        style={{ fontSize: 10, fontWeight: "600", color: c.text.primary }}
                        numberOfLines={1}
                    >
                        {user?.name ?? "—"}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                        {roleLabel}
                    </Text>
                </View>
                <TouchableOpacity onPress={onLogout} hitSlop={{ top, bottom, left, right: 8 }}>
                    <Feather name="log-out" size={15} color={c.text.secondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
