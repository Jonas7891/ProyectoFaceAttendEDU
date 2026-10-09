// ============================================================
//  FaceAttend EDU — History SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a HistoryView
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import HistoryView from "../HistoryView";

export default function HistoryScreen() {
    return <HistoryView />;
}
