import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { ThemeProvider }    from "./src/view/components/theme/themeContext";
import { LanguageProvider } from "./src/i18n/context/LanguageContext";
import { AppDataProvider }  from "./src/context/AppDataContext";
import { AuthProvider }     from "./src/context/AuthContext";

import AppNavigator from "./src/navegation/appNavigator";
import { linking } from "./src/navegation/linking";

export default function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                {/* AuthProvider: sesión del usuario autenticado */}
                <AuthProvider>
                    {/* AppDataProvider: única fuente de verdad para students, users y environments */}
                    <AppDataProvider>
                        {/* linking: enrutado web /, /login, /register, /dashboard */}
                        <NavigationContainer linking={linking as never}>
                            <AppNavigator />
                        </NavigationContainer>
                    </AppDataProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
