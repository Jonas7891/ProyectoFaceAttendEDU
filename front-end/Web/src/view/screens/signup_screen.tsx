import React from "react";
import { useNavigation } from "@react-navigation/native";
import SignupPage from "../components/own_components/screens/signup_page/signup_page";

export default function SignUp() {
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
