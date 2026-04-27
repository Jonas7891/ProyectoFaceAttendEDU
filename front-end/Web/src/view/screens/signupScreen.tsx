import React from "react";
import { useNavigation } from "@react-navigation/native";
import SignupPage from "../components/own_components/auth/signupView";

export default function SignupScreen() {
    const navigation = useNavigation<any>();

    return (
        <SignupPage
            onRegister={(data: any) => {
                console.log(data);
                navigation.replace("Home");
            }}
            onLogin={() => {
                navigation.navigate("Login");
            }}
        />
    );
}
