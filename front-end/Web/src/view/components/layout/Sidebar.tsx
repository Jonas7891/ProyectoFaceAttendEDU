// ============================================================
//  FaceAttend EDU — Sidebar
//  Colores desde useTheme() — sin imports de Colors.
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { Avatar }   from "../ui/UI";
import { mockUser } from "../../../models/data/mockData";

const NAV_ITEMS: { key: string; label: string; feather: any }[] = [
    { key: "dashboard", label: "Dashboard",    feather: "layout"     },
    { key: "students",  label: "Estudiantes",  feather: "users"      },
    { key: "courses",   label: "Cursos",       feather: "book-open"  },
    { key: "reports",   label: "Reportes",     feather: "bar-chart-2"},
];

const SYSTEM_ITEMS: { key: string; label: string; feather: any }[] = [
    { key: "settings", label: "Configuración", feather: "settings" },
];

type Props = {
    currentTab: string;
    onNavigate: (tab: string) => void;
    onLogout:   () => void;
};

export default function Sidebar({ currentTab, onNavigate, onLogout }: Props) {
    const { theme } = useTheme();
    const c         = theme.colors;

    function NavItem({ item, system = false }: { item: typeof NAV_ITEMS[0]; system?: boolean }) {
        const isActive = currentTab === item.key;
        return (
            <TouchableOpacity
                key={item.key}
                onPress={() => onNavigate(item.key)}
                style={{
                    flexDirection:   "row",
                    alignItems:      "center",
                    gap:             10,
                    padding:         9,
                    paddingHorizontal: 10,
                    borderRadius:    6,
                    marginBottom:    2,
                    backgroundColor: isActive ? c.brand.primaryLight : "transparent",
                }}
            >
                <Feather
                    name={item.feather}
                    size={16}
                    color={isActive ? c.brand.primary : c.text.secondary}
                />
                <Text style={{
                    flex:       1,
                    fontSize:   13,
                    color:      isActive ? c.brand.primary : c.text.secondary,
                    fontWeight: isActive ? "600" : "400",
                }}>
                    {item.label}
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
                fontSize:        10,
                fontWeight:      "600",
                color:           c.text.secondary,
                paddingHorizontal: 10,
                paddingBottom:   8,
                textTransform:   "uppercase",
                letterSpacing:   1.2,
            }}>
                {label}
            </Text>
        );
    }

    return (
        <View style={{
            width:            240,
            backgroundColor:  c.background.surface,
            borderRightWidth: 1,
            borderRightColor: c.border.primary,
            flexDirection:    "column",
        }}>
            {/* Logo */}
            <View style={{
                padding:           20,
                paddingBottom:     16,
                borderBottomWidth: 1,
                borderBottomColor: c.border.primary,
                flexDirection:     "row",
                alignItems:        "center",
                gap:               10,
            }}>
                <View style={{
                    width:           36,
                    height:          36,
                    backgroundColor: c.brand.primary,
                    borderRadius:    10,
                    alignItems:      "center",
                    justifyContent:  "center",
                }}>
                    <Feather name="aperture" size={20} color={c.text.onBrand} />
                </View>
                <View>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: c.text.primary, lineHeight: 17 }}>
                        FaceAttend
                    </Text>
                    <Text style={{ fontSize: 10, color: c.text.secondary, fontWeight: "500" }}>
                        EDU
                    </Text>
                </View>
            </View>

            {/* Nav principal */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 12 }}>
                <SectionLabel label="Menú principal" />
                {NAV_ITEMS.map(item => <NavItem key={item.key} item={item} />)}

                <View style={{ height: 1, backgroundColor: c.border.primary, marginVertical: 12 }} />

                <SectionLabel label="Sistema" />
                {SYSTEM_ITEMS.map(item => <NavItem key={item.key} item={item} system />)}
            </ScrollView>

            {/* User footer */}
            <View style={{
                padding:          12,
                paddingHorizontal: 16,
                borderTopWidth:   1,
                borderTopColor:   c.border.primary,
                flexDirection:    "row",
                alignItems:       "center",
                gap:              10,
            }}>
                <Avatar name={mockUser.name} size={34} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }} numberOfLines={1}>
                        {mockUser.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                        {mockUser.role}
                    </Text>
                </View>
                <TouchableOpacity onPress={onLogout}>
                    <Feather name="log-out" size={15} color={c.text.secondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
