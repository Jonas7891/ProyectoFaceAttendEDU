import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

// Habilitar react-native-screens para mejor performance
enableScreens();

import { ThemeProvider }    from "./src/context/ThemeContext";
import { LanguageProvider } from "./src/i18n/context/LanguageContext";
import { AppDataProvider }  from "./src/context/AppDataContext";
import { AuthProvider }     from "./src/context/AuthContext";

import AppNavigator from "./src/navegation/appNavigator";

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <LanguageProvider>
                    {/* AuthProvider: sesión del usuario autenticado */}
                    <AuthProvider>
                        {/* AppDataProvider: única fuente de verdad para students, users y environments */}
                        <AppDataProvider>
                            <NavigationContainer>
                                <AppNavigator />
                            </NavigationContainer>
                        </AppDataProvider>
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
