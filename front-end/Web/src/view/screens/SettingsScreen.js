// ============================================================
//  FaceAttend EDU — Settings SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a SettingsView
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente (delegado a SettingsView)
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import SettingsView from "../SettingsView";

export default function SettingsScreen() {
    return <SettingsView />;
}
