// ============================================================
//  FaceAttend EDU — Students SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a StudentsView
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente (delegado a StudentsView)
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import StudentsView from "../StudentsView";

export default function StudentsScreen() {
    return <StudentsView />;
}
