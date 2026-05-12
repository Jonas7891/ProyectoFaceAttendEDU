import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { ThemeProvider } from "./src/view/components/theme/themeContext";

import AppNavigator from "./src/navegation/appNavigator";

export default function App() {

    return (
        <ThemeProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </ThemeProvider>
    );
}