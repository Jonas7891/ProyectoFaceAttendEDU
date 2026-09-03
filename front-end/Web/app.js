import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { ThemeProvider }    from "./src/context/ThemeContext";
import { LanguageProvider } from "./src/i18n/context/LanguageContext";
import { AppDataProvider }  from "./src/context/AppDataContext";
import { AuthProvider }     from "./src/context/AuthContext";

import AppNavigator from "./src/navegation/appNavigator";

export default function App() {
    return (
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
    );
}
