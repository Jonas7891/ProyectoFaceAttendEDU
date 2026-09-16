import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

// Habilitar react-native-screens para mejor performance
enableScreens();

import { ThemeProvider }    from "./src/context/ThemeContext";
import { ResponsiveProvider } from "./src/context/ResponsiveContext";
import { LanguageProvider } from "./src/core/utils/i18n/context/LanguageContext";
import { AppDataProvider }  from "./src/context/AppDataContext";
import { AuthProvider }     from "./src/context/AuthContext";

import AppNavigator from "./src/navegation/appNavigator";
import { linkingConfig } from "./src/navegation/linking.config";

export default function App() {
    // Callback cuando el linking está listo
    const onReady = () => {
        console.log("🔗 Navigation ready with deep linking enabled");
    };

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <ResponsiveProvider>
                    <LanguageProvider>
                        {/* AuthProvider: sesión del usuario autenticado */}
                        <AuthProvider>
                            {/* AppDataProvider: única fuente de verdad para students, users y environments */}
                            <AppDataProvider>
                                <NavigationContainer
                                    linking={linkingConfig}
                                    onReady={onReady}
                                    fallback={<></>}  // Loading state mientras se resuelve la URL
                                    documentTitle={{
                                        formatter: (options, route) => {
                                            // Generar títulos dinámicos basados en la ruta
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
                    </LanguageProvider>
                </ResponsiveProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
