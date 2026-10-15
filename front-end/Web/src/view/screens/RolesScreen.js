// ============================================================
//  FaceAttend EDU — Roles SCREEN (Container)
// ============================================================

import React from "react";
import RolesView from "../RolesView";
import { NotAuthorized, AUTH_EXCEPTION_TYPES } from "../authorized/NotAuthorized";
import { useRolePermissions } from "../../viewmodels/useRolePermissions";

export default function RolesScreen() {
    const permissions = useRolePermissions();
    if (!permissions.canManageRoles) {
        return <NotAuthorized type={AUTH_EXCEPTION_TYPES.INSUFFICIENT_PERMISSIONS} />;
    }
    return <RolesView />;
}
