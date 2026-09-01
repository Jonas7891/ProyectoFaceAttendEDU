// ============================================================
//  FaceAttend EDU — Signup Screen (View Layer)
// ============================================================

import React from "react";
import { useNavigation } from "@react-navigation/native";
import SignupView from "../components/auth/SignupView";

export default function SignupScreen() {
    const navigation = useNavigation();

    function onRegisterSuccess(data) {
        console.log("Registro exitoso:", data.email);
        navigation.replace("FaceAttendEDU-Dashboard");
    }

    function onGoToLogin() {
        navigation.navigate("FaceAttendEDU-Login");
    }

    return (
        <SignupView
            onRegisterSuccess={onRegisterSuccess}
            onGoToLogin={onGoToLogin}
        />
    );
}
