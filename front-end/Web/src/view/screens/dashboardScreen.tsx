// ============================================================
//  FaceAttend EDU — Dashboard Screen (React Native)
//  Pantalla principal post-login con sidebar y navegación entre tabs
// ============================================================
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Sidebar from "../components/own_components/layout/Sidebar";
import DashboardView from "../components/own_components/dashboard/dashboardView";
import StudentsView from "../components/own_components/students/studentsView";
import CoursesView from "../components/own_components/courses/coursesView";
import ReportsView from "../components/own_components/reports/reportsView";
import SettingsView from "../components/own_components/settings/settingsView";
import Colors from "../components/constants/colors";
import { useResponsive } from "../components/hooks/useResponsive";

type Tab = "dashboard" | "students" | "courses" | "reports" | "settings";

const BOTTOM_TABS = [
    { key: "dashboard" as Tab, icon: "📊", label: "Inicio"    },
    { key: "students"  as Tab, icon: "👥", label: "Alumnos"   },
    { key: "courses"   as Tab, icon: "📚", label: "Cursos"    },
    { key: "reports"   as Tab, icon: "📈", label: "Reportes"  },
    { key: "settings"  as Tab, icon: "⚙️", label: "Config"    },
];

function TabContent({ tab }: { tab: Tab }) {
    switch (tab) {
        case "dashboard": return <DashboardView />;
        case "students":  return <StudentsView />;
        case "courses":   return <CoursesView />;
        case "reports":   return <ReportsView />;
        case "settings":  return <SettingsView />;
        default:          return <DashboardView />;
    }
}

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const [currentTab, setCurrentTab] = useState<Tab>("dashboard");
    const { isSmall } = useResponsive();

    function handleLogout() {
        navigation.replace("FaceAttendEDU");
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, flexDirection: "row", backgroundColor: Colors.bg }} edges={["top", "bottom"]}>

                {/* Sidebar: solo desktop/tablet */}
                {!isSmall && (
                    <Sidebar
                        currentTab={currentTab}
                        onNavigate={(tab) => setCurrentTab(tab as Tab)}
                        onLogout={handleLogout}
                    />
                )}

                {/* Contenido principal */}
                <View style={{ flex: 1, overflow: "hidden", paddingBottom: isSmall ? 72 : 0 }}>
                    <TabContent tab={currentTab} />
                </View>

                {/* Bottom nav: solo móvil */}
                {isSmall && (
                    <View style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        backgroundColor: Colors.surface,
                        borderTopWidth: 1, borderTopColor: Colors.border,
                        flexDirection: "row",
                        paddingBottom: 8, paddingTop: 4,
                    }}>
                        {BOTTOM_TABS.map(item => {
                            const isActive = currentTab === item.key;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => setCurrentTab(item.key)}
                                    style={{
                                        flex: 1, alignItems: "center",
                                        paddingTop: 6,
                                        borderTopWidth: isActive ? 2 : 0,
                                        borderTopColor: Colors.primary,
                                    }}
                                >
                                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                                    <Text style={{
                                        fontSize: 10, marginTop: 2,
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
