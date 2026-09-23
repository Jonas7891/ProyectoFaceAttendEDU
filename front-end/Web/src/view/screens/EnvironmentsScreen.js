// ============================================================
//  FaceAttend EDU — Environments SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a EnvironmentsView
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente (delegado a EnvironmentsView)
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import EnvironmentsView from "../EnvironmentsView";

export default function EnvironmentsScreen() {
    return <EnvironmentsView />;
}
