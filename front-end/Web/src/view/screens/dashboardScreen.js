// ============================================================
//  FaceAttend EDU — Dashboard Screen (View Layer)
//  Orquesta tabs. Toda lógica de navegación en useDashboardScreenViewModel.
//  Los tabs visibles se filtran por rol via useRolePermissions.
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import Sidebar          from "../components/layout/Sidebar";
import DashboardView    from "../components/dashboard/DashboardView";
import StudentsView     from "../components/students/StudentsView";
import CoursesView      from "../components/courses/CoursesView";
import ReportsView      from "../components/reports/ReportsView";
import SettingsView     from "../components/settings/SettingsView";
import EnvironmentsView from "../components/environments/EnvironmentsView";

import { useTheme }      from "../components/hooks/useTheme";
import { useResponsive } from "../components/hooks/useResponsive";
import { useAuth }       from "../../context/AuthContext";
import { useDashboardScreenViewModel } from "../../viewmodels/useDashboardScreenViewModel";
import { TabKey }   from "../../viewmodels/useDashboardScreenViewModel";
import { useTranslation } from "../../i18n/hooks/useTranslation";

// ── TabContent ───────────────────────────────────────────────

function TabContent({ tab }: { tab: TabKey }) {
    switch (tab) {
        case "dashboard":    return <DashboardView />;
        case "students":     return <StudentsView />;
        case "courses":      return <CoursesView />;
        case "environments": return <EnvironmentsView />;
        case "reports":      return <ReportsView />;
        case "settings":     return <SettingsView />;
    }
}

// ── DashboardScreen ──────────────────────────────────────────

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { isSmall } = useResponsive();
    const insets      = useSafeAreaInsets();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useDashboardScreenViewModel();
    const { t }       = useTranslation();
    const { logout }  = useAuth();

    async function handleLogout() {
        await logout();
        navigation.replace("FaceAttendEDU");
    }

    return (
        
            <SafeAreaView
                style={{ flex: 1, flexDirection: "row", backgroundColor: c.background.app }}
                edges={["top", "bottom"]}
            >
                {/* Sidebar — solo desktop/tablet */}
                {!isSmall && (
                    <Sidebar
                        currentTab={vm.currentTab}
                        onNavigate={(tab) => vm.setTab(tab)}
                        onLogout={handleLogout}
                    />
                )}

                {/* Contenido principal */}
                <View style={{ flex: 1,
                    overflow: "hidden",
                    paddingBottom: isSmall ? 64 + insets.bottom,
                }}>
                    <TabContent tab={vm.currentTab} />
                </View>

                {/* Bottom tabs — solo móvil */}
                {isSmall && (
                    <View style={{
                        position:        "absolute",
                        bottom, left, right,
                        backgroundColor: c.background.surface,
                        borderTopWidth,
                        borderTopColor:  c.border.primary,
                        flexDirection:   "row",
                        paddingTop,
                        paddingBottom:   Math.max(8, insets.bottom),
                        minHeight:       52 + insets.bottom,
                    }}>
                        {vm.bottomTabs.map((item) => {
                            const isActive = vm.currentTab === item.key;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => vm.setTab(item.key)}
                                    style={{ flex: 1,
                                        alignItems:     "center",
                                        paddingTop,
                                        borderTopWidth: isActive ? 2,
                                        borderTopColor: c.brand.primary,
                                    }}
                                >
                                    <Feather
                                        name={item.icon}
                                        size={20}
                                        color={isActive ? c.brand.primary : c.text.secondary}
                                    />
                                    <Text style={{
                                        fontSize,
                                        marginTop,
                                        color:      isActive ? c.brand.primary : c.text.secondary,
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
