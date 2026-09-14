// ============================================================
//  FaceAttend EDU — Authenticated Navigator
// ============================================================
//  RESPONSABILIDAD: Navegación entre pantallas autenticadas
//
//  Este navigator maneja las rutas internas de la aplicación autenticada.
//  Ahora el Sidebar está FUERA del ciclo de navegación para mantener estado.
//
//  Arquitectura:
//  AppNavigator → AuthenticatedNavigator → [Sidebar persistente + Stack de Screens]
// ============================================================

import React from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// ── Importación de Screens ────────────────────────────────────
import DashboardScreen from "../view/screens/DashboardScreen";
import StudentsScreen from "../view/screens/StudentsScreen";
import CoursesScreen from "../view/screens/CoursesScreen";
import EnvironmentsScreen from "../view/screens/EnvironmentsScreen";
import ReportsScreen from "../view/screens/ReportsScreen";
import SettingsScreen from "../view/screens/SettingsScreen";

// ── Importación de Layout Components ──────────────────────────
import { SidebarHeader, SidebarNav, SidebarItem, SidebarItemCollapsible, SidebarFooter } from "../view/components/common/layout";
import { CollapsibleSidebar } from "../view/components/common/layout";

// ── Importación de Hooks ──────────────────────────────────────
import { useTheme } from "../view/components/hooks/useTheme";
import { useResponsive } from "../view/components/hooks/useResponsive";
import { useAuth } from "../context/AuthContext";
import { useDashboardScreenViewModel } from "../viewmodels/useDashboardScreenViewModel";
import { useTranslation } from "../i18n/hooks/useTranslation";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

const Stack = createNativeStackNavigator();

// ── Contexto para compartir estado del sidebar ────────────────
const SidebarStateContext = React.createContext({
    sidebarSelectedTab: "dashboard",
    sidebarSelectedSubTab: null,
    setSidebarSelectedTab: () => {},
    setSidebarSelectedSubTab: () => {},
});

// ── Constantes de mapeo de rutas ────────────────────────────
const ROUTE_MAP = {
    "dashboard": "Dashboard",
    "students": "Students",
    "courses": "Courses",
    "environments": "Environments",
    "reports": "Reports",
    "settings": "Settings",
};

const ROUTE_TO_KEY_MAP = {
    "Dashboard": "dashboard",
    "Students": "students",
    "Courses": "courses",
    "Environments": "environments",
    "Reports": "reports",
    "Settings": "settings",
};

// ── Sidebar Persistente Component ────────────────────────────
// Este componente DEBE estar dentro del Stack.Navigator para tener acceso a useNavigation
function PersistentSidebar() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;
    const vm = useDashboardScreenViewModel();
    const { t } = useTranslation();
    const { logout, user } = useAuth();
    
    // Usar contexto compartido para el estado del sidebar
    const { sidebarSelectedTab, sidebarSelectedSubTab, setSidebarSelectedTab, setSidebarSelectedSubTab } = React.useContext(SidebarStateContext);
    
    // Flag para indicar si la navegación viene del sidebar (evita sync loops)
    const isNavigatingFromSidebar = React.useRef(false);
    
    // Sincronizar estado del sidebar con la navegación actual SOLO al montar o cuando viene de URL
    React.useEffect(() => {
        const syncSidebarWithNavigation = () => {
            // Si la navegación viene del sidebar, NO sincronizar (evita sobrescribir el click)
            if (isNavigatingFromSidebar.current) {
                isNavigatingFromSidebar.current = false;
                return;
            }
            
            const state = navigation.getState();
            if (state?.routes && state.routes.length > 0) {
                const currentRoute = state.routes[state.index];
                const routeName = currentRoute?.name;
                const routeParams = currentRoute?.params;
                
                const tabKey = ROUTE_TO_KEY_MAP[routeName] || "dashboard";
                const subTabKey = routeParams?.section || null;
                
                setSidebarSelectedTab(tabKey);
                setSidebarSelectedSubTab(subTabKey);
            }
        };
        
        // Sincronizar al montar (navegación por URL directa)
        syncSidebarWithNavigation();
        
        // Sincronizar cuando cambie la navegación (back/forward del navegador)
        const unsubscribe = navigation.addListener('state', syncSidebarWithNavigation);
        
        return unsubscribe;
    }, [navigation, setSidebarSelectedTab, setSidebarSelectedSubTab]);
    
    // Función de navegación
    const handleNavigate = React.useCallback((tabKey, subTabKey) => {
        const routeName = ROUTE_MAP[tabKey];
        
        if (!routeName) return;
        
        // Marcar que la navegación viene del sidebar
        isNavigatingFromSidebar.current = true;
        
        setSidebarSelectedTab(tabKey);
        setSidebarSelectedSubTab(subTabKey || null);
        
        const params = subTabKey ? { section: subTabKey } : undefined;
        navigation.navigate(routeName, params);
    }, [navigation, setSidebarSelectedTab, setSidebarSelectedSubTab]);
    
    // Verificar si un tab está activo
    const isTabActive = React.useCallback((tabKey, subTabKey = null) => {
        if (!subTabKey) {
            return sidebarSelectedTab === tabKey;
        }
        return sidebarSelectedTab === tabKey && sidebarSelectedSubTab === subTabKey;
    }, [sidebarSelectedTab, sidebarSelectedSubTab]);
    
    // Manejo de logout
    async function handleLogout() {
        await logout();
        const parent = navigation.getParent();
        if (parent) {
            parent.replace("FaceAttendEDU");
        }
    }
    
    // No renderizar en móvil
    if (isSmall) return null;
    
    return (
        <CollapsibleSidebar width={240}>
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
            
            <SidebarNav key="main-sidebar-nav">
                {vm.bottomTabs.map((tab) => {
                    if (tab.children && tab.children.length > 0) {
                        const isParentActive = isTabActive(tab.key);
                        const hasActiveChild = tab.children.some(child => 
                            isTabActive(tab.key, child.key)
                        );
                        const shouldShowActive = isParentActive || hasActiveChild;
                        
                        const mainItemOnPress = tab.optionalNavigation 
                            ? () => {
                                // Marcar el tab visualmente sin navegar
                                isNavigatingFromSidebar.current = true;
                                setSidebarSelectedTab(tab.key);
                                // Mantener el subtab actual si existe
                            }
                            : () => handleNavigate(tab.key);
                        
                        // Memoizar children para evitar recrear en cada render
                        const childrenItems = React.useMemo(() => 
                            tab.children.map(child => ({
                                key: child.key,
                                icon: child.icon,
                                label: child.label,
                                active: isTabActive(tab.key, child.key),
                                onPress: () => handleNavigate(tab.key, child.key),
                                badge: child.badge,
                                indicator: child.indicator,
                            })), 
                            // eslint-disable-next-line react-hooks/exhaustive-deps
                            [tab.key, tab.children, sidebarSelectedTab, sidebarSelectedSubTab]
                        );
                        
                        return (
                            <SidebarItemCollapsible
                                key={tab.key}
                                icon={tab.icon}
                                label={tab.label}
                                active={shouldShowActive}
                                defaultExpanded={shouldShowActive}
                                onPress={mainItemOnPress}
                                children={childrenItems}
                            />
                        );
                    }
                    
                    return (
                        <SidebarItem
                            key={tab.key}
                            icon={tab.icon}
                            label={tab.label}
                            active={isTabActive(tab.key)}
                            onPress={() => handleNavigate(tab.key)}
                        />
                    );
                })}
            </SidebarNav>
            
            <SidebarFooter>
                <SidebarItem
                    icon="log-out"
                    label="Cerrar sesión"
                    variant="danger"
                    onPress={handleLogout}
                />
            </SidebarFooter>
        </CollapsibleSidebar>
    );
}

// ── Wrapper que renderiza Sidebar + Screen ───────────────────
function ScreenWithSidebar({ children }) {
    const { isSmall } = useResponsive();
    
    return (
        <View style={{ flex: 1, flexDirection: "row" }}>
            {/* Sidebar persistente - solo desktop */}
            {!isSmall && <PersistentSidebar />}
            
            {/* Contenido de la screen */}
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </View>
    );
}

// ── Bottom Tabs Component (solo móvil) ───────────────────────
function BottomTabs() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const insets = useSafeAreaInsets();
    const c = theme.colors;
    const vm = useDashboardScreenViewModel();
    const { t } = useTranslation();
    
    // Usar contexto compartido
    const { setSidebarSelectedTab, setSidebarSelectedSubTab } = React.useContext(SidebarStateContext);
    
    // No renderizar en desktop
    if (!isSmall) return null;
    
    // Estado para tracking de ruta actual
    const [currentRouteName, setCurrentRouteName] = React.useState("Dashboard");
    
    // Listener para cambios de navegación
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => {
            const state = navigation.getState();
            if (state?.routes && state.routes.length > 0) {
                setCurrentRouteName(state.routes[state.index]?.name || "Dashboard");
            }
        });
        
        // Obtener estado inicial
        const state = navigation.getState();
        if (state?.routes && state.routes.length > 0) {
            setCurrentRouteName(state.routes[state.index]?.name || "Dashboard");
        }
        
        return unsubscribe;
    }, [navigation]);
    
    const currentTabKey = ROUTE_TO_KEY_MAP[currentRouteName] || "dashboard";
    
    const handleNavigate = (tabKey, subTabKey) => {
        const routeName = ROUTE_MAP[tabKey];
        if (!routeName) return;
        
        setSidebarSelectedTab(tabKey);
        setSidebarSelectedSubTab(subTabKey || null);
        
        const params = subTabKey ? { section: subTabKey } : undefined;
        navigation.navigate(routeName, params);
    };
    
    return (
        <View style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: c.background.surface,
            borderTopWidth: 1,
            borderTopColor: c.border.primary,
            flexDirection: "row",
            paddingTop: 8,
            paddingBottom: Math.max(8, insets.bottom),
            minHeight: 52 + insets.bottom,
        }}>
            {vm.bottomTabs.map((item) => {
                const active = currentTabKey === item.key;
                
                const handleBottomTabPress = () => {
                    if (item.optionalNavigation && item.children && item.children.length > 0) {
                        const firstChild = item.children[0];
                        handleNavigate(item.key, firstChild.key);
                    } else {
                        handleNavigate(item.key);
                    }
                };
                
                return (
                    <TouchableOpacity
                        key={item.key}
                        onPress={handleBottomTabPress}
                        style={{
                            flex: 1,
                            alignItems: "center",
                            paddingTop: 4,
                            borderTopWidth: active ? 2 : 0,
                            borderTopColor: c.brand.primary,
                        }}
                    >
                        <Feather
                            name={item.icon}
                            size={20}
                            color={active ? c.brand.primary : c.text.secondary}
                        />
                        <Text style={{
                            fontSize: 11,
                            marginTop: 2,
                            color: active ? c.brand.primary : c.text.secondary,
                            fontWeight: active ? "600" : "400",
                        }}>
                            {t(item.label)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function AuthenticatedNavigator() {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;
    
    // Estado compartido del sidebar
    const [sidebarSelectedTab, setSidebarSelectedTab] = React.useState("dashboard");
    const [sidebarSelectedSubTab, setSidebarSelectedSubTab] = React.useState(null);
    
    const sidebarState = React.useMemo(() => ({
        sidebarSelectedTab,
        sidebarSelectedSubTab,
        setSidebarSelectedTab,
        setSidebarSelectedSubTab,
    }), [sidebarSelectedTab, sidebarSelectedSubTab]);
    
    return (
        <SidebarStateContext.Provider value={sidebarState}>
            <SafeAreaProvider>
                <SafeAreaView
                    style={{ flex: 1, flexDirection: "row", backgroundColor: c.background.app }}
                    edges={["top", "bottom"]}
                >
                    {/* Contenedor del Stack Navigator con Sidebar integrado */}
                    <View style={{ 
                        flex: 1,
                        overflow: "hidden",
                        paddingBottom: isSmall ? 64 : 0,
                    }}>
                        <Stack.Navigator
                            initialRouteName="Dashboard"
                            screenOptions={{
                                headerShown: false,
                                animation: "fade",
                                animationDuration: 150,
                            }}
                        >
                            <Stack.Screen name="Dashboard">
                                {(props) => <ScreenWithSidebar><DashboardScreen {...props} /></ScreenWithSidebar>}
                            </Stack.Screen>
                            <Stack.Screen name="Students">
                                {(props) => <ScreenWithSidebar><StudentsScreen {...props} /></ScreenWithSidebar>}
                            </Stack.Screen>
                            <Stack.Screen name="Courses">
                                {(props) => <ScreenWithSidebar><CoursesScreen {...props} /></ScreenWithSidebar>}
                            </Stack.Screen>
                            <Stack.Screen name="Environments">
                                {(props) => <ScreenWithSidebar><EnvironmentsScreen {...props} /></ScreenWithSidebar>}
                            </Stack.Screen>
                            <Stack.Screen name="Reports">
                                {(props) => <ScreenWithSidebar><ReportsScreen {...props} /></ScreenWithSidebar>}
                            </Stack.Screen>
                            <Stack.Screen name="Settings">
                                {(props) => <ScreenWithSidebar><SettingsScreen {...props} /></ScreenWithSidebar>}
                            </Stack.Screen>
                        </Stack.Navigator>
                    </View>
                    
                    {/* Bottom tabs (solo móvil) */}
                    <BottomTabs />
                </SafeAreaView>
            </SafeAreaProvider>
        </SidebarStateContext.Provider>
    );
}
