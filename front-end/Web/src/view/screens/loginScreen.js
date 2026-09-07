// ============================================================
//  FaceAttend EDU — Login SCREEN
// ============================================================
//  RESPONSABILIDAD: Orquestación y Navegación ("qué debe pasar")
//
//  Este componente:
//  ✓ Maneja la navegación entre pantallas
//  ✓ Define callbacks de acciones (onLoginSuccess, onForgotPassword, etc.)
//  ✓ Coordina flujos de navegación
//
//  NO debe:
//  ✗ Renderizar UI directamente
//  ✗ Contener lógica de presentación
//  ✗ Manejar estilos o layouts
//
//  La UI se delega completamente a LoginView.
// ============================================================

import React from "react";
import { useNavigation } from "@react-navigation/native";
import LoginView from "../LoginView";

export default function LoginScreen() {
    const navigation = useNavigation();

    // ── Navegación post-login exitoso ────────────────────────
    function onLoginSuccess() {
        navigation.replace("FaceAttendEDU-Dashboard");
    }

    // ── Navegación a recuperación de contraseña ──────────────
    function onForgotPassword() {
        // TODO: navegar a pantalla de recuperación de contraseña
        console.log("Recuperar contraseña");
    }

    // ── Navegación a registro ─────────────────────────────────
    function onGoToRegister() {
        navigation.navigate("FaceAttendEDU-Register");
    }

    // ── Navegación de regreso al landing ──────────────────────
    function onGoToLanding() {
        navigation.navigate("FaceAttendEDU");
    }

    // ── Delegación completa a View ────────────────────────────
    return (
        <LoginView
            onLoginSuccess={onLoginSuccess}
            onForgotPassword={onForgotPassword}
            onGoToRegister={onGoToRegister}
            onGoToLanding={onGoToLanding}
        />
    );
}
