// ============================================================
//  FaceAttend EDU — Sidebar (React Native)
//  Usa @expo/vector-icons / Feather — sin emojis
// ============================================================
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
    Feather, MaterialCommunityIcons,
} from "@expo/vector-icons";
import Colors from "../../constants/colors";
import { Avatar } from "../ui/UI";
import { mockUser } from "../../constants/mockData";

type NavItem = { key: string; label: string; icon: React.ReactNode; activeIcon: React.ReactNode };

function icon(name: any, color: string, size = 16) {
    return <Feather name={name} size={size} color={color} />;
}

const NAV_ITEMS: { key: string; label: string; feather: any }[] = [
    { key: "dashboard", label: "Dashboard",    feather: "layout"    },
    { key: "students",  label: "Estudiantes",  feather: "users"     },
    { key: "courses",   label: "Cursos",       feather: "book-open" },
    { key: "reports",   label: "Reportes",     feather: "bar-chart-2"},
];
const SYSTEM_ITEMS: { key: string; label: string; feather: any }[] = [
    { key: "settings",  label: "Configuración",feather: "settings"  },
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
            <View style={{
                padding: 20, paddingBottom: 16,
                borderBottomWidth: 1, borderBottomColor: Colors.border,
                flexDirection: "row", alignItems: "center", gap: 10,
            }}>
                <View style={{
                    width: 36, height: 36, backgroundColor: Colors.primary,
                    borderRadius: 10, alignItems: "center", justifyContent: "center",
                }}>
                    <Feather name="aperture" size={20} color="#fff" />
                </View>
                <View>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text, lineHeight: 17 }}>FaceAttend</Text>
                    <Text style={{ fontSize: 10, color: Colors.muted, fontWeight: "500" }}>EDU</Text>
                </View>
            </View>

            {/* Nav principal */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 12 }}>
                <Text style={{
                    fontSize: 10, fontWeight: "600", color: Colors.muted,
                    paddingHorizontal: 10, paddingBottom: 8,
                    textTransform: "uppercase", letterSpacing: 1.2,
                }}>
                    Menú principal
                </Text>

                {NAV_ITEMS.map(item => {
                    const isActive = currentTab === item.key;
                    const iconColor = isActive ? Colors.primary : Colors.muted;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => onNavigate(item.key)}
                            style={{
                                flexDirection: "row", alignItems: "center", gap: 10,
                                padding: 9, paddingHorizontal: 10,
                                borderRadius: 6, marginBottom: 2,
                                backgroundColor: isActive ? Colors.primaryLight : "transparent",
                            }}
                        >
                            <Feather name={item.feather} size={16} color={iconColor} />
                            <Text style={{
                                flex: 1, fontSize: 13,
                                color: isActive ? Colors.primary : Colors.muted,
                                fontWeight: isActive ? "600" : "400",
                            }}>
                                {item.label}
                            </Text>
                            {isActive && <Feather name="chevron-right" size={14} color={Colors.primary} />}
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 12 }} />

                <Text style={{
                    fontSize: 10, fontWeight: "600", color: Colors.muted,
                    paddingHorizontal: 10, paddingBottom: 8,
                    textTransform: "uppercase", letterSpacing: 1.2,
                }}>
                    Sistema
                </Text>

                {SYSTEM_ITEMS.map(item => {
                    const isActive = currentTab === item.key;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => onNavigate(item.key)}
                            style={{
                                flexDirection: "row", alignItems: "center", gap: 10,
                                padding: 9, paddingHorizontal: 10,
                                borderRadius: 6, marginBottom: 2,
                                backgroundColor: isActive ? Colors.primaryLight : "transparent",
                            }}
                        >
                            <Feather name={item.feather} size={16} color={isActive ? Colors.primary : Colors.muted} />
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
            <View style={{
                padding: 12, paddingHorizontal: 16,
                borderTopWidth: 1, borderTopColor: Colors.border,
                flexDirection: "row", alignItems: "center", gap: 10,
            }}>
                <Avatar name={mockUser.name} size={34} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.text }} numberOfLines={1}>
                        {mockUser.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.muted }}>{mockUser.role}</Text>
                </View>
                <TouchableOpacity onPress={onLogout} title="Cerrar sesión">
                    <Feather name="log-out" size={15} color={Colors.muted} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
