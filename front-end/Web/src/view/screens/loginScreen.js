// ============================================================
//  FaceAttend EDU — Login Screen (View Layer)
//  Orquesta: useLoginViewModel + LoginView component.
//  La navegación post-login sucede dentro del ViewModel.
// ============================================================

import React from "react";
import { useNavigation } from "@react-navigation/native";
import LoginView from "../components/auth/LoginView";

export default function LoginScreen() {
    const navigation = useNavigation();

    function onLoginSuccess() {
        navigation.replace("FaceAttendEDU-Dashboard");
    }

    function onForgotPassword() {
        // TODO: navegar a pantalla de recuperación de contraseña
        console.log("Recuperar contraseña");
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
