// ============================================================
//  FaceAttend EDU — Signup Screen
// ============================================================
import React from "react";
import { useNavigation } from "@react-navigation/native";
import SignupPage from "../components/own_components/auth/signupView";

export default function SignupScreen() {
    const navigation = useNavigation<any>();

    const handleSignupSuccess = (role: string, token: string) => {
        console.log(`Registro exitoso - Rol: ${role}`);
        navigation.replace("FaceAttendEDU-Dashboard");
    };

    return (
        <SignupPage
            onSignupSuccess={handleSignupSuccess}
            onLogin={() => {
                navigation.navigate("FaceAttendEDU-Login");
            }}
        />
    );
}
