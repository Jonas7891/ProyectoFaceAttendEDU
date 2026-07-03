// ============================================================
//  FaceAttend EDU — Dashboard Screen (View Layer)
//  Orquesta tabs. Toda lógica de navegación en useDashboardScreenViewModel.
//  Cada sección delega a su propio ViewModel.
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import Sidebar       from "../components/layout/Sidebar";
import DashboardView from "../components/dashboard/DashboardView";
import StudentsView  from "../components/students/StudentsView";
import CoursesView   from "../components/courses/CoursesView";
import ReportsView   from "../components/reports/ReportsView";
import SettingsView  from "../components/settings/SettingsView";

import { useTheme }      from "../components/hooks/useTheme";
import { useResponsive } from "../components/hooks/useResponsive";
import { useDashboardScreenViewModel } from "../../viewmodels/useDashboardScreenViewModel";
import type { TabKey } from "../../viewmodels/useDashboardScreenViewModel";
import { useTranslation } from "../../i18n/hooks/useTranslation";

// ── TabContent ───────────────────────────────────────────────

function TabContent({ tab }: { tab: TabKey }) {
    switch (tab) {
        case "dashboard": return <DashboardView />;
        case "students":  return <StudentsView />;
        case "courses":   return <CoursesView />;
        case "reports":   return <ReportsView />;
        case "settings":  return <SettingsView />;
    }
}

// ── DashboardScreen ──────────────────────────────────────────

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const { isSmall } = useResponsive();
    const insets      = useSafeAreaInsets();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useDashboardScreenViewModel();
    const { t }       = useTranslation();

    return (
        <SafeAreaProvider>
            <SafeAreaView
                style={{ flex: 1, flexDirection: "row", backgroundColor: c.background.app }}
                edges={["top", "bottom"]}
            >
                {/* Sidebar — solo desktop/tablet */}
                {!isSmall && (
                    <Sidebar
                        currentTab={vm.currentTab}
                        onNavigate={(t) => vm.setTab(t as TabKey)}
                        onLogout={() => navigation.replace("FaceAttendEDU")}
                    />
                )}

                {/* Contenido principal */}
                <View style={{
                    flex: 1,
                    overflow: "hidden",
                    paddingBottom: isSmall ? 64 + insets.bottom : 0,
                }}>
                    <TabContent tab={vm.currentTab} />
                </View>

                {/* Bottom tabs — solo móvil */}
                {isSmall && (
                    <View style={{
                        position: "absolute",
                        bottom: 0, left: 0, right: 0,
                        backgroundColor: c.background.surface,
                        borderTopWidth: 1,
                        borderTopColor: c.border.primary,
                        flexDirection: "row",
                        paddingTop: 4,
                        paddingBottom: Math.max(8, insets.bottom),
                        minHeight: 52 + insets.bottom,
                    }}>
                        {vm.bottomTabs.map((item) => {
                            const isActive = vm.currentTab === item.key;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => vm.setTab(item.key as TabKey)}
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        paddingTop: 6,
                                        borderTopWidth: isActive ? 2 : 0,
                                        borderTopColor: c.brand.primary,
                                    }}
                                >
                                    <Feather
                                        name={item.icon as any}
                                        size={20}
                                        color={isActive ? c.brand.primary : c.text.secondary}
                                    />
                                    <Text style={{
                                        fontSize: 10,
                                        marginTop: 3,
                                        color: isActive ? c.brand.primary : c.text.secondary,
                                        fontWeight: isActive ? "600" : "400",
                                    }}>
                                        {t(item.label)}
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
