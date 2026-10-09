// ============================================================
//  FaceAttend EDU — Reports SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Extrae parámetros de ruta (sección o filtros legacy)
//  ✓ Delega presentación a ReportsView
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import { useRoute } from "@react-navigation/native";
import ReportsView from "../ReportsView";

export default function ReportsScreen() {
    const route = useRoute();
    
    // Parámetros para la nueva estructura de secciones
    const section = route.params?.section; // No default, para detectar vista padre
    
    // Parámetros legacy para filtrado específico
    const filterType = route.params?.filterType;
    const fichaId = route.params?.fichaId;
    const userId = route.params?.userId;
    const attendanceThreshold = route.params?.attendanceThreshold;
    
    return (
        <ReportsView
            section={section}
            filterType={filterType}
            fichaId={fichaId}
            userId={userId}
            attendanceThreshold={attendanceThreshold}
        />
    );
}
