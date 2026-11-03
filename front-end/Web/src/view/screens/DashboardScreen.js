// ============================================================
//  FaceAttend EDU — Dashboard SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Punto de entrada para la pantalla Dashboard
//
//  Sin guard de rol por diseño (AUD-15): el inicio es el destino de todo rol
//  autenticado ("dashboard" está en visibleTabs de admin, docente y alumno) y
//  AuthMiddleware ya exige sesión. DashboardView adapta su contenido al rol.
//
//  Este componente:
//  ✓ Actúa como punto de entrada para Dashboard
//  ✓ Delega toda la presentación a DashboardView
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Contener Sidebar/BottomTabs (eso es AuthenticatedLayout)
//  ✗ Renderizar otras pantallas
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import { useNavigation } from "@react-navigation/native";
import DashboardView from "../DashboardView";

export default function DashboardScreen() {
    const navigation = useNavigation();
    return <DashboardView navigation={navigation} />;
}
