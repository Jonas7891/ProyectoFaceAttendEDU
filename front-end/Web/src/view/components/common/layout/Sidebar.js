import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

export default function Sidebar({ 
    tabs, 
    activeTab, 
    onTabChange, 
    user,
    onLogout 
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    
    return (
        <View style={{
            width: 240,
            backgroundColor: c.background.surface,
            borderRightWidth: 1,
            borderRightColor: c.border.primary,
            height: "100%",
        }}>
            {user && (
                <View style={{
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border.primary,
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: c.text.primary,
                        marginBottom: 4,
                    }}>
                        {user.name}
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                    }}>
                        {user.role}
                    </Text>
                </View>
            )}
            
            <ScrollView style={{ flex: 1 }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => onTabChange(tab.key)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                                padding: 16,
                                backgroundColor: isActive ? c.brand.primaryLight : "transparent",
                                borderLeftWidth: isActive ? 3 : 0,
                                borderLeftColor: c.brand.primary,
                            }}
                        >
                            <Feather
                                name={tab.icon}
                                size={20}
                                color={isActive ? c.brand.primary : c.text.secondary}
                            />
                            <Text style={{
                                fontSize: 14,
                                fontWeight: isActive ? "600" : "400",
                                color: isActive ? c.brand.primary : c.text.primary,
                            }}>
                                {tab.label}
                            </Text>
                            {tab.badge && (
                                <View style={{
                                    backgroundColor: c.states.danger,
                                    borderRadius: 10,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    marginLeft: "auto",
                                }}>
                                    <Text style={{
                                        fontSize: 11,
                                        fontWeight: "600",
                                        color: "#FFF",
                                    }}>
                                        {tab.badge}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            
            {onLogout && (
                <TouchableOpacity
                    onPress={onLogout}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        padding: 16,
                        borderTopWidth: 1,
                        borderTopColor: c.border.primary,
                    }}
                >
                    <Feather name="log-out" size={20} color={c.states.danger} />
                    <Text style={{
                        fontSize: 14,
                        color: c.states.danger,
                    }}>
                        Cerrar sesión
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
