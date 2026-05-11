import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import Sidebar       from "../components/own_components/layout/Sidebar";
import DashboardView from "../components/own_components/dashboard/dashboardView";
import StudentsView  from "../components/own_components/students/studentsView";
import CoursesView   from "../components/own_components/courses/coursesView";
import ReportsView   from "../components/own_components/reports/reportsView";
import SettingsView  from "../components/own_components/settings/settingsView";

import Colors from "../components/constants/colors";
import { useResponsive } from "../components/hooks/useResponsive";

type Tab = "dashboard" | "students" | "courses" | "reports" | "settings";

const BOTTOM_TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "dashboard", label: "Inicio",   icon: "layout"      },
    { key: "students",  label: "Alumnos",  icon: "users"       },
    { key: "courses",   label: "Cursos",   icon: "book-open"   },
    { key: "reports",   label: "Reportes", icon: "bar-chart-2" },
    { key: "settings",  label: "Config",   icon: "settings"    },
];

function TabContent({ tab }: { tab: Tab }) {
    switch (tab) {
        case "dashboard": return <DashboardView />;
        case "students":  return <StudentsView />;
        case "courses":   return <CoursesView />;
        case "reports":   return <ReportsView />;
        case "settings":  return <SettingsView />;
    }
}

export default function DashboardScreen() {
    const navigation          = useNavigation<any>();
    const [currentTab, setTab] = useState<Tab>("dashboard");
    const { isSmall }         = useResponsive();
    const insets              = useSafeAreaInsets();

    return (
        <SafeAreaProvider>
            <SafeAreaView
                style={{ flex: 1, flexDirection: "row", backgroundColor: Colors.bg }}
                edges={["top", "bottom"]}
            >
                {/* Sidebar — solo desktop/tablet */}
                {!isSmall && (
                    <Sidebar
                        currentTab={currentTab}
                        onNavigate={(t) => setTab(t as Tab)}
                        onLogout={() => navigation.replace("FaceAttendEDU")}
                    />
                )}

                {/* Contenido principal */}
                <View style={{
                    flex: 1,
                    overflow: "hidden",
                    paddingBottom: isSmall ? 64 + insets.bottom : 0,
                }}>
                    <TabContent tab={currentTab} />
                </View>

                {/* Bottom tabs — solo móvil */}
                {isSmall && (
                    <View style={{
                        position: "absolute",
                        bottom: 0, left: 0, right: 0,
                        backgroundColor: Colors.surface,
                        borderTopWidth: 1,
                        borderTopColor: Colors.border,
                        flexDirection: "row",
                        paddingTop: 4,
                        paddingBottom: Math.max(8, insets.bottom),
                        minHeight: 52 + insets.bottom,
                    }}>
                        {BOTTOM_TABS.map((item) => {
                            const isActive = currentTab === item.key;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => setTab(item.key)}
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        paddingTop: 6,
                                        borderTopWidth: isActive ? 2 : 0,
                                        borderTopColor: Colors.primary,
                                    }}
                                >
                                    <Feather
                                        name={item.icon}
                                        size={20}
                                        color={isActive ? Colors.primary : Colors.muted}
                                    />
                                    <Text style={{
                                        fontSize: 10,
                                        marginTop: 3,
                                        color: isActive ? Colors.primary : Colors.muted,
                                        fontWeight: isActive ? "600" : "400",
                                    }}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}