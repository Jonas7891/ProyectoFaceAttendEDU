// ============================================================
//  FaceAttend EDU — Settings SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la navegación
//  ✓ Delega toda la presentación a SettingsView
//  ✓ Sin guard de rol sobre la pantalla (AUD-15): "settings" está en visibleTabs
//    de todos los roles (apariencia y notificaciones son propias de cada cuenta).
//    El acceso fino es por sección, no por pantalla:
//  ✓ Corrige la URL cuando la sección pedida no está permitida al rol
//    (/app/settings/security para un docente → /app/settings/appearance)
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar UI directamente (delegado a SettingsView)
//
//  Patrón: Screen = orquestación, View = presentación
// ============================================================

import React, { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import SettingsView from "../SettingsView";
import { useRolePermissions, resolveSettingsSection } from "../../viewmodels/useRolePermissions";

export default function SettingsScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const permissions = useRolePermissions();
    const requested = route.params?.section;
    const allowed = resolveSettingsSection(permissions, requested);

    // Sección sin permiso: se reemplaza en la URL por una permitida. Sin sección
    // en la ruta no se toca nada (SettingsView usa la de apariencia).
    useEffect(() => {
        if (requested && requested !== allowed) {
            navigation.setParams({ section: allowed });
        }
    }, [requested, allowed, navigation]);

    return <SettingsView section={allowed} />;
}
