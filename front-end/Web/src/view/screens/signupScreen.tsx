// ============================================================
//  FaceAttend EDU — Signup Screen (View Layer)
// ============================================================

import React from "react";
import { useNavigation } from "@react-navigation/native";
import SignupView from "../components/auth/SignupView";
import type { SignupForm } from "../../viewmodels/useAuthViewModel";

export default function SignupScreen() {
    const navigation = useNavigation<any>();

    function onRegisterSuccess(data: SignupForm) {
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
