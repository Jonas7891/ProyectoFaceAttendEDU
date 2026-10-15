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
    // Crear componentes wrapeados UNA VEZ para evitar re-creaciones
    const DashboardWrapped = React.useMemo(() => AuthMiddleware(DashboardScreen), []);
    const UsersWrapped = React.useMemo(() => AuthMiddleware(UsersScreen), []);
    const CoursesWrapped = React.useMemo(() => AuthMiddleware(CoursesScreen), []);
    const EnvironmentsWrapped = React.useMemo(() => AuthMiddleware(EnvironmentsScreen), []);
    const ReportsWrapped = React.useMemo(() => AuthMiddleware(ReportsScreen), []);
    const SchoolsWrapped = React.useMemo(() => AuthMiddleware(SchoolsScreen), []);
    const SchoolInfoWrapped = React.useMemo(() => AuthMiddleware(SchoolInfoScreen), []);
    const HistoryWrapped = React.useMemo(() => AuthMiddleware(HistoryScreen), []);
    const JustificationsWrapped = React.useMemo(() => AuthMiddleware(JustificationsScreen), []);
    const AcademicWrapped = React.useMemo(() => AuthMiddleware(AcademicScreen), []);
    const ContactsWrapped = React.useMemo(() => AuthMiddleware(ContactsScreen), []);
    const BiometricsWrapped = React.useMemo(() => AuthMiddleware(BiometricsScreen), []);
    const SettingsWrapped = React.useMemo(() => AuthMiddleware(SettingsScreen), []);

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
            <Stack.Screen name="Dashboard" component={DashboardWrapped} />
            <Stack.Screen name="Users" component={UsersWrapped} />
            <Stack.Screen name="Courses" component={CoursesWrapped} />
            <Stack.Screen name="Environments" component={EnvironmentsWrapped} />
            <Stack.Screen name="Reports" component={ReportsWrapped} />
            <Stack.Screen name="Schools" component={SchoolsWrapped} />
            <Stack.Screen name="SchoolInfo" component={SchoolInfoWrapped} />
            <Stack.Screen name="History" component={HistoryWrapped} />
            <Stack.Screen name="Justifications" component={JustificationsWrapped} />
            <Stack.Screen name="Academic" component={AcademicWrapped} />
            <Stack.Screen name="Contacts" component={ContactsWrapped} />
            <Stack.Screen name="Biometrics" component={BiometricsWrapped} />
            <Stack.Screen name="Settings" component={SettingsWrapped} />
        </Stack.Navigator>
    );
}