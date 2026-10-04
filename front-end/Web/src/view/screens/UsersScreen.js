// ============================================================
//  FaceAttend EDU — Users SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a UsersView
//  ✓ Extrae parámetros de ruta para sub-secciones
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente (delegado a UsersView)
//  ✗ Validar autorización (lo hace AuthenticatedNavigator GLOBALMENTE)
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import { useRoute } from "@react-navigation/native";
import UsersView from "../UsersView";

export default function UsersScreen() {
    const route = useRoute();
    const section = route.params?.section;
    const attendanceFilter = route.params?.attendanceFilter; // "gt" | "lt" | null
    const searchQuery = route.params?.searchQuery; // Término de búsqueda inicial
    const sortBy = route.params?.sortBy; // Columna por la que ordenar
    const sortOrder = route.params?.sortOrder; // "asc" | "desc"
    const filterColumn = route.params?.filterColumn; // Columna para filtro avanzado
    
    // La validación de autorización se hace GLOBALMENTE en AuthenticatedNavigator
    // Este componente solo se renderiza si el usuario YA está autorizado
    
    return (
        <UsersView 
            section={section} 
            attendanceFilter={attendanceFilter} 
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            filterColumn={filterColumn}
        />
    );
}
