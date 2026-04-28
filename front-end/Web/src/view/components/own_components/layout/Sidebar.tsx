// ============================================================
//  FaceAttend EDU — Sidebar (React Native Web)
//  Barra lateral de navegación para el área de administración
// ============================================================
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import Colors from "../../constants/colors";
import { Avatar } from "../../own_components/ui/UI";
import { mockUser } from "../../constants/mockData";

type NavItem = {
    key: string;
    label: string;
    icon: string;
};

const NAV_ITEMS: NavItem[] = [
    { key: "dashboard",  label: "Dashboard",     icon: "📊" },
    { key: "students",   label: "Estudiantes",   icon: "👥" },
    { key: "courses",    label: "Cursos",        icon: "📚" },
    { key: "reports",    label: "Reportes",      icon: "📈" },
];

const SYSTEM_ITEMS: NavItem[] = [
    { key: "settings",   label: "Configuración", icon: "⚙️" },
];

type Props = {
    currentTab: string;
    onNavigate: (tab: string) => void;
    onLogout: () => void;
};

export default function Sidebar({ currentTab, onNavigate, onLogout }: Props) {
    return (
        <View style={{
            width: 240,
            backgroundColor: Colors.surface,
            borderRightWidth: 1,
            borderRightColor: Colors.border,
            flexDirection: "column",
        }}>
            {/* Logo */}
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{
                    width: 36, height: 36, backgroundColor: Colors.primary,
                    borderRadius: 10, alignItems: "center", justifyContent: "center",
                }}>
                    <Text style={{ fontSize: 20 }}>🎭</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text, lineHeight: 17 }}>FaceAttend</Text>
                    <Text style={{ fontSize: 10, color: Colors.muted, fontWeight: "500" }}>EDU</Text>
                </View>
            </View>

            {/* Nav principal */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: "600", color: Colors.muted, paddingHorizontal: 10, paddingBottom: 8, textTransform: "uppercase", letterSpacing: 1.2 }}>
                    Menú principal
                </Text>

                {NAV_ITEMS.map(item => {
                    const isActive = currentTab === item.key;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => onNavigate(item.key)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                                padding: 9,
                                paddingHorizontal: 10,
                                borderRadius: 6,
                                marginBottom: 2,
                                backgroundColor: isActive ? Colors.primaryLight : "transparent",
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                            <Text style={{
                                flex: 1, fontSize: 13,
                                color: isActive ? Colors.primary : Colors.muted,
                                fontWeight: isActive ? "600" : "400",
                            }}>
                                {item.label}
                            </Text>
                            {isActive && <Text style={{ color: Colors.primary, fontSize: 12 }}>›</Text>}
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 12 }} />

                <Text style={{ fontSize: 10, fontWeight: "600", color: Colors.muted, paddingHorizontal: 10, paddingBottom: 8, textTransform: "uppercase", letterSpacing: 1.2 }}>
                    Sistema
                </Text>

                {SYSTEM_ITEMS.map(item => {
                    const isActive = currentTab === item.key;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => onNavigate(item.key)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                                padding: 9,
                                paddingHorizontal: 10,
                                borderRadius: 6,
                                marginBottom: 2,
                                backgroundColor: isActive ? Colors.primaryLight : "transparent",
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                            <Text style={{
                                flex: 1, fontSize: 13,
                                color: isActive ? Colors.primary : Colors.muted,
                                fontWeight: isActive ? "600" : "400",
                            }}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* User footer */}
            <View style={{ padding: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar name={mockUser.name} size={34} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.text }} numberOfLines={1}>
                        {mockUser.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.muted }}>{mockUser.role}</Text>
                </View>
                <TouchableOpacity onPress={onLogout}>
                    <Text style={{ fontSize: 16 }}>🚪</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
