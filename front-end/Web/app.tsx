import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { ThemeProvider }    from "./src/view/components/theme/themeContext";
import { LanguageProvider } from "./src/i18n/context/LanguageContext";
import { AppDataProvider }  from "./src/context/AppDataContext";

import AppNavigator from "./src/navegation/appNavigator";

export default function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                {/* AppDataProvider: única fuente de verdad para students, users y environments */}
                <AppDataProvider>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </AppDataProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}