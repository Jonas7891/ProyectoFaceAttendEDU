// ============================================================
//  FaceAttend EDU — App Navigator (Routing)
// ============================================================
//  RESPONSABILIDAD: Configuración de rutas principales DESCENTRALIZADAS
//
//  Este archivo define TODAS las rutas de la app de forma plana.
//  No hay jerarquías innecesarias - cada pantalla es una ruta directa.
//  
//  IMPORTANTE: Solo importa y registra SCREENS, nunca Views.
//  Los Screens manejan la navegación, los Views solo presentan UI.
//
//  Arquitectura:
//  Navigator → Screen → View
//     ↓          ↓        ↓
//   Rutas   Navegación   UI
//
//  Autenticación: Se maneja de forma transversal con AuthMiddleware
// ============================================================

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ── Importación de Screens Públicos ─────────────────────────
import LandingScreen from "../view/screens/LandingScreen";
import LoginScreen from "../view/screens/LoginScreen";
import SignupScreen from "../view/screens/SignupScreen";

// ── Importación de Screens Autenticados ─────────────────────
import DashboardScreen from "../view/screens/DashboardScreen";
import UsersScreen from "../view/screens/UsersScreen";
import CoursesScreen from "../view/screens/CoursesScreen";
import EnvironmentsScreen from "../view/screens/EnvironmentsScreen";
import ReportsScreen from "../view/screens/ReportsScreen";
import SettingsScreen from "../view/screens/SettingsScreen";
import SchoolsScreen from "../view/screens/SchoolsScreen";
import SchoolInfoScreen from "../view/screens/SchoolInfoScreen";
import HistoryScreen from "../view/screens/HistoryScreen";
import JustificationsScreen from "../view/screens/JustificationsScreen";
import AcademicScreen from "../view/screens/AcademicScreen";
import ContactsScreen from "../view/screens/ContactsScreen";
import BiometricsScreen from "../view/screens/BiometricsScreen";

// ── Importación de Componentes de Layout ────────────────────
import AuthMiddleware from "../view/authorized/AuthMiddleware";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{           
                headerShown: false,
            }}
        >
            {/* ── Rutas Públicas ──────────────────────────────── */}
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

            {/* ── Rutas Autenticadas (con AuthMiddleware) ─────── */}
            <Stack.Screen
                name="Dashboard"
                component={AuthMiddleware(DashboardScreen)}
            />

            <Stack.Screen
                name="Users"
                component={AuthMiddleware(UsersScreen)}
            />

            <Stack.Screen
                name="Courses"
                component={AuthMiddleware(CoursesScreen)}
            />

            <Stack.Screen
                name="Environments"
                component={AuthMiddleware(EnvironmentsScreen)}
            />

            <Stack.Screen
                name="Reports"
                component={AuthMiddleware(ReportsScreen)}
            />

            <Stack.Screen
                name="Schools"
                component={AuthMiddleware(SchoolsScreen)}
            />

            <Stack.Screen
                name="SchoolInfo"
                component={AuthMiddleware(SchoolInfoScreen)}
            />

            <Stack.Screen
                name="History"
                component={AuthMiddleware(HistoryScreen)}
            />

            <Stack.Screen
                name="Justifications"
                component={AuthMiddleware(JustificationsScreen)}
            />

            <Stack.Screen
                name="Academic"
                component={AuthMiddleware(AcademicScreen)}
            />

            <Stack.Screen
                name="Contacts"
                component={AuthMiddleware(ContactsScreen)}
            />

            <Stack.Screen
                name="Biometrics"
                component={AuthMiddleware(BiometricsScreen)}
            />

            <Stack.Screen
                name="Settings"
                component={AuthMiddleware(SettingsScreen)}
            />
        </Stack.Navigator>
    );
}