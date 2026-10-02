// ============================================================
//  FaceAttend EDU — Reports SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada
//
//  Este componente:
//  ✓ Actúa como punto de entrada para navegación
//  ✓ Extrae parámetros de ruta (filtros, fichas, usuarios)
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
    
    // Parámetros para filtrado y navegación desde otras vistas
    const filterType = route.params?.filterType; // "at-risk" | "ficha" | "user" | null
    const fichaId = route.params?.fichaId; // ID de ficha específica
    const userId = route.params?.userId; // ID de usuario específico
    const attendanceThreshold = route.params?.attendanceThreshold; // % mínimo de asistencia
    
    return (
        <ReportsView 
            filterType={filterType}
            fichaId={fichaId}
            userId={userId}
            attendanceThreshold={attendanceThreshold}
        />
    );
}
