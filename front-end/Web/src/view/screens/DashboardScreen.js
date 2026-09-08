// ============================================================
//  FaceAttend EDU — Dashboard SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación de tabs y navegación ("qué debe pasar")
//
//  Este componente:
//  ✓ Orquesta la navegación entre tabs (Dashboard, Students, Courses, etc.)
//  ✓ Maneja el layout principal (Sidebar/BottomTabs)
//  ✓ Coordina el flujo de logout
//  ✓ Renderiza las diferentes vistas según el tab activo
//
//  NO debe:
//  ✗ Contener lógica de negocio específica de cada tab
//  ✗ Renderizar contenido específico de funcionalidades
//
//  Actúa como contenedor que delega a Views específicos:
//  - DashboardView (contenido principal)
//  - StudentsView, CoursesView, ReportsView, etc.
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Sidebar, SidebarHeader, SidebarNav, SidebarItem, SidebarFooter } from "../components/common/layout";
import DashboardView    from "../DashboardView";
import StudentsView     from "../StudentsView";
import CoursesView      from "../CoursesView";
import ReportsView      from "../ReportsView";
import SettingsView     from "../SettingsView";
import EnvironmentsView from "../EnvironmentsView";

import { useTheme }      from "../components/hooks/useTheme";
import { useResponsive } from "../components/hooks/useResponsive";
import { useAuth }       from "../../context/AuthContext";
import { useDashboardScreenViewModel } from "../../viewmodels/useDashboardScreenViewModel";
import { useTranslation } from "../../i18n/hooks/useTranslation";

// ── TabContent ───────────────────────────────────────────────
// Renderiza la vista correspondiente según el tab seleccionado.
// Este componente actúa como un simple switch/router interno.

function TabContent({ tab }) {
    switch (tab) {
        case "dashboard":    return <DashboardView />;
        case "students":     return <StudentsView />;
        case "courses":      return <CoursesView />;
        case "environments": return <EnvironmentsView />;
        case "reports":      return <ReportsView />;
        case "settings":     return <SettingsView />;
        default:             return <DashboardView />;
    }
}

// ── DashboardScreen ──────────────────────────────────────────
// Contenedor principal que orquesta tabs y navegación

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { isSmall } = useResponsive();
    const insets      = useSafeAreaInsets();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useDashboardScreenViewModel();
    const { t }       = useTranslation();
    const { logout, user }  = useAuth();

    // ── Manejo de logout ──────────────────────────────────────
    async function handleLogout() {
        await logout();
        navigation.replace("FaceAttendEDU");
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView
                style={{ flex: 1, flexDirection: "row", backgroundColor: c.background.app }}
                edges={["top", "bottom"]}
            >
                {/* Sidebar — solo desktop/tablet */}
                {!isSmall && (
                    <Sidebar width={240} position="left">
                        {user && (
                            <SidebarHeader>
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
                            </SidebarHeader>
                        )}
                        
                        <SidebarNav>
                            {vm.bottomTabs.map((tab) => (
                                <SidebarItem
                                    key={tab.key}
                                    icon={tab.icon}
                                    label={tab.label}
                                    active={vm.currentTab === tab.key}
                                    onPress={() => vm.setTab(tab.key)}
                                />
                            ))}
                        </SidebarNav>
                        
                        <SidebarFooter>
                            <SidebarItem
                                icon="log-out"
                                label="Cerrar sesión"
                                variant="danger"
                                onPress={handleLogout}
                            />
                        </SidebarFooter>
                    </Sidebar>
                )}

                {/* Contenido principal — renderiza el View del tab activo */}
                <View style={{ flex: 1,
                    overflow: "hidden",
                    paddingBottom: isSmall ? 64 + insets.bottom : 0,
                }}>
                    <TabContent tab={vm.currentTab} />
                </View>

                {/* Bottom tabs — solo móvil */}
                {isSmall && (
                    <View style={{
                        position:        "absolute",
                        bottom: 0, left: 0, right: 0,
                        backgroundColor: c.background.surface,
                        borderTopWidth: 1,
                        borderTopColor:  c.border.primary,
                        flexDirection:   "row",
                        paddingTop: 8,
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
                                        paddingTop: 4,
                                        borderTopWidth: isActive ? 2 : 0,
                                        borderTopColor: c.brand.primary,
                                    }}
                                >
                                    <Feather
                                        name={item.icon}
                                        size={20}
                                        color={isActive ? c.brand.primary : c.text.secondary}
                                    />
                                    <Text style={{
                                        fontSize: 11,
                                        marginTop: 2,
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
