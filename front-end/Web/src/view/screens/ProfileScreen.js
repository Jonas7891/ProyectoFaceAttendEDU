// ============================================================
//  FaceAttend EDU — Profile SCREEN
//
//  Orquesta el perfil propio: ProfileView (UI). No navega a otro lado.
//
//  Sin guard de rol por diseño (AUD-15): es el perfil de la propia cuenta, abierto
//  a todo rol autenticado (AuthMiddleware exige sesión); solo muestra datos propios.
// ============================================================

import React from "react";
import ProfileView from "../ProfileView";

export default function ProfileScreen() {
    return <ProfileView />;
}
