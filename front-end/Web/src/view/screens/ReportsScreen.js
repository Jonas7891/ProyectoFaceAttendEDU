// ============================================================
//  FaceAttend EDU — Reports SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a ReportsView
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente (delegado a ReportsView)
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import ReportsView from "../ReportsView";

export default function ReportsScreen() {
    return <ReportsView />;
}
