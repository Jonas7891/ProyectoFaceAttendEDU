// ============================================================
//  FaceAttend EDU — App Navigator (Routing)
// ============================================================
//  RESPONSABILIDAD: Configuración de rutas principales
//
//  Este archivo define la estructura de navegación de la app.
//  
//  IMPORTANTE: Solo importa y registra SCREENS, nunca Views.
//  Los Screens manejan la navegación, los Views solo presentan UI.
//
//  Arquitectura:
//  Navigator → Screen → View
//     ↓          ↓        ↓
//   Rutas   Navegación   UI
// ============================================================

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ── Importación de Screens (nunca Views) ────────────────────
import LandingScreen from "../view/screens/LandingScreen";
import LoginScreen from "../view/screens/LoginScreen";
import SignupScreen from "../view/screens/SignupScreen";
import DashboardScreen from "../view/screens/DashboardScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{           
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="FaceAttendEDU"
                component={LandingScreen}
            />

            <Stack.Screen
                name="FaceAttendEDU-Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="FaceAttendEDU-Register"
                component={SignupScreen}
            />

            <Stack.Screen
                name="FaceAttendEDU-Dashboard"
                component={DashboardScreen}
            />
        </Stack.Navigator>
    );
}