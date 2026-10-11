// ============================================================
//  FaceAttend EDU — Schools SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Punto de entrada de la sección Escuelas
//
//  Este componente:
//  ✓ Es el punto de entrada para navegación
//  ✓ Delega presentación a SchoolsView
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import SchoolsView from "../SchoolsView";

export default function SchoolsScreen() {
    return <SchoolsView />;
}
