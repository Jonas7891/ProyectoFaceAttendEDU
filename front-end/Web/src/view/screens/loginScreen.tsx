import React from "react";
import { useNavigation } from "@react-navigation/native";
import LoginPage from "../components/own_components/auth/loginView";

export default function LoginScreen() {
    const navigation = useNavigation<any>();

    return (
        <LoginPage
            onLogin={(usuario: string, contrasena: string) => {
                console.log("Login:", usuario, contrasena);
                // Navegar al dashboard tras el login exitoso
                navigation.replace("FaceAttendEDU-Dashboard");
            }}
            onForgotPassword={() => {
                console.log("Forgot password");
            }}
            onRegister={() => {
                navigation.navigate("FaceAttendEDU-Register");
            }}
        />
    );
}
