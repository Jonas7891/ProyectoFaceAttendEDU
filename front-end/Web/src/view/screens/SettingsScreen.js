// ============================================================
//  FaceAttend EDU ÔÇö Settings SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestaci├│n y punto de entrada ("qu├® debe pasar")
//
//  Este componente:
//  Ô£ô Act├║a como punto de entrada para la navegaci├│n
//  Ô£ô Delega toda la presentaci├│n a SettingsView
//
//  NO debe:
//  Ô£ù Contener l├│gica de negocio
//  Ô£ù Renderizar UI directamente (delegado a SettingsView)
//
//  Patr├│n: Screen = orquestaci├│n, View = presentaci├│n
// ============================================================

import React from "react";
import { useRoute } from "@react-navigation/native";
import SettingsView from "../SettingsView";

export default function SettingsScreen() {
    const route = useRoute();
    const section = route.params?.section;
    
    return <SettingsView section={section} />;
}
