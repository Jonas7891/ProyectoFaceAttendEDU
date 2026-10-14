// ============================================================
//  FaceAttend EDU — Justifications SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a JustificationsView
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React from "react";
import JustificationsView from "../JustificationsView";

export default function JustificationsScreen() {
    return <JustificationsView />;
}
