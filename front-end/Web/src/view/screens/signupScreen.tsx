// ============================================================
//  FaceAttend EDU — Signup Screen
// ============================================================
import React from "react";
import { useNavigation } from "@react-navigation/native";
import SignupPage from "../components/own_components/auth/signupView";

export default function SignupScreen() {
    const navigation = useNavigation<any>();

    return (
        <SignupPage
            onRegister={(data) => {
                console.log("Register:", data);
                navigation.replace("FaceAttendEDU-Dashboard");
            }}
            onLogin={() => {
                navigation.navigate("FaceAttendEDU-Login");
            }}
        />
    );
}
