import React from "react";
import { useNavigation } from "@react-navigation/native";
import LoginPage from "../components/own_components/screens/login_page/login_page";

export default function Login_screen() {
    const navigation = useNavigation<any>();

    return (
        <LoginPage
            onLogin={(usuario, contrasena) => {
                console.log(usuario, contrasena);
                // navigation.replace("Home");
            }}
            onForgotPassword={() => {
                console.log("Forgot password");
            }}
            onRegister={() => {
                navigation.navigate("Register");
            }}
        />
    );
}
