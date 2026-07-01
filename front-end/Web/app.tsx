import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { ThemeProvider } from "./src/view/components/theme/themeContext";
import { LanguageProvider } from "./src/i18n/context/LanguageContext";

import AppNavigator from "./src/navegation/appNavigator";

export default function App() {

    return (
        <ThemeProvider>
            <LanguageProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </LanguageProvider>
        </ThemeProvider>
    );
}