// ============================================================
//  FaceAttend EDU — Login Screen (View Layer)
//  Orquesta: useLoginViewModel + LoginView component.
//  NO contiene lógica de negocio.
// ============================================================

import React from "react";
import { useNavigation } from "@react-navigation/native";
import LoginView from "../components/auth/LoginView";

export default function LoginScreen() {
    const navigation = useNavigation<any>();

    function onLoginSuccess(email: string, password: string) {
        console.log("Login exitoso:", email);
        navigation.replace("FaceAttendEDU-Dashboard");
    }

    function onForgotPassword() {
        console.log("Recuperar contraseña");
        // TODO: navegar a pantalla de recuperación
    }

    function onGoToRegister() {
        navigation.navigate("FaceAttendEDU-Register");
    }

    return (
        <LoginView
            onLoginSuccess={onLoginSuccess}
            onForgotPassword={onForgotPassword}
            onGoToRegister={onGoToRegister}
        />
    );
}
