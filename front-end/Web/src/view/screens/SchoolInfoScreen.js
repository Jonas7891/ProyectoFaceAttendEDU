// ============================================================
//  FaceAttend EDU — SchoolInfo SCREEN (Container)
// ============================================================
//  RESPONSABILIDAD: Punto de entrada de la pantalla de información
//  de la sede. Delega toda la presentación a SchoolInfoView.
// ============================================================

import React from "react";
import SchoolInfoView from "../SchoolInfoView";
import { NotAuthorized, AUTH_EXCEPTION_TYPES } from "../NotAuthorized";
import { useRolePermissions } from "../../viewmodels/useRolePermissions";

export default function SchoolInfoScreen() {
    const permissions = useRolePermissions();
    // Sin sede propia (Super Admin global) no hay nada que mostrar: igual que la sección «Sede» del sidebar.
    if (!permissions.canViewSchoolInfo) {
        return <NotAuthorized type={AUTH_EXCEPTION_TYPES.INSUFFICIENT_PERMISSIONS} />;
    }
    return <SchoolInfoView />;
}
