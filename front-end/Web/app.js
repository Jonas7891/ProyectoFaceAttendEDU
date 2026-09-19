import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

// Habilitar react-native-screens para mejor performance
enableScreens();

import { ThemeProvider }    from "./src/context/ThemeContext";
import { ResponsiveProvider } from "./src/context/ResponsiveContext";
import { LanguageProvider, useLanguageContext } from "./src/core/utils/i18n/context/LanguageContext";
import { AppDataProvider }  from "./src/context/AppDataContext";
import { AuthProvider }     from "./src/context/AuthContext";

import AppNavigator from "./src/navegation/appNavigator";
import { linkingConfig } from "./src/navegation/linking.config";
import LoadingView from "./src/view/LoadingView";

// Wrapper interno para acceder al contexto de idioma
function AppContent() {
    const { isPreparingTranslations, checkAndPrepareTranslations } = useLanguageContext();

    // Callback cuando el linking está listo
    const onReady = () => {
        console.log("🔗 Navigation ready with deep linking enabled");
    };

    // Callback cuando cambia la pantalla/ruta
    const onNavigationStateChange = async () => {
        // Marcar que hubo navegación para que LanguageContext verifique
        await checkAndPrepareTranslations();
    };

    // FLUJO ALTERNATIVO: LoadingView O AppContent, no ambos
    if (isPreparingTranslations) {
        return <LoadingView message="Cargando..." />;
    }

    return (
        <AuthProvider>
            <AppDataProvider>
                <NavigationContainer
                    linking={linkingConfig}
                    onReady={onReady}
                    onStateChange={onNavigationStateChange}
                    fallback={<></>}
                    documentTitle={{
                        formatter: (options, route) => {
                            const routeTitles = {
                                'FaceAttendEDU': 'FaceAttend EDU',
                                'FaceAttendEDU-Login': 'Iniciar Sesión | FaceAttend EDU',
                                'FaceAttendEDU-Register': 'Registrarse | FaceAttend EDU',
                                'Dashboard': 'Dashboard | FaceAttend EDU',
                                'Students': 'Usuarios | FaceAttend EDU',
                                'Courses': 'Cursos | FaceAttend EDU',
                                'Environments': 'Ambientes | FaceAttend EDU',
                                'Reports': 'Reportes | FaceAttend EDU',
                                'Settings': 'Configuración | FaceAttend EDU',
                            };
                            return routeTitles[route?.name] || 'FaceAttend EDU';
                        }
                    }}
                >
                    <AppNavigator />
                </NavigationContainer>
            </AppDataProvider>
        </AuthProvider>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <ResponsiveProvider>
                    <LanguageProvider>
                        <AppContent />
                    </LanguageProvider>
                </ResponsiveProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
