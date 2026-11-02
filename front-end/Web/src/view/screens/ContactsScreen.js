// ============================================================
//  FaceAttend EDU — Contacts SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Punto de entrada de la pantalla de contactos.
//  Delega toda la presentación a ContactsView.
// ============================================================

import React from "react";
import ContactsView from "../ContactsView";
import { NotAuthorized, AUTH_EXCEPTION_TYPES } from "../NotAuthorized";
import { useRolePermissions } from "../../viewmodels/useRolePermissions";

export default function ContactsScreen() {
    const permissions = useRolePermissions();
    // Sin sede propia (Super Admin global) no hay nada que mostrar: igual que la sección «Sede» del sidebar.
    if (!permissions.canViewContacts) {
        return <NotAuthorized type={AUTH_EXCEPTION_TYPES.INSUFFICIENT_PERMISSIONS} />;
    }
    return <ContactsView />;
}
