import React from "react";
import { useNavigation } from "@react-navigation/native";
import LoginPage from "../components/own_components/auth/loginView";

export default function LoginScreen() {
    const navigation = useNavigation<any>();

    const handleLoginSuccess = (role: string, token: string) => {
        console.log(`Login exitoso - Rol: ${role}`);
        navigation.replace("FaceAttendEDU-Dashboard");
    };

    return (
        <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onForgotPassword={() => {
                console.log("Forgot password");
            }}
            onRegister={() => {
                navigation.navigate("FaceAttendEDU-Register");
            }}
        />
    );
}
