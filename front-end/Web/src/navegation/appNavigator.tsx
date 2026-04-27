import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LandingPage from "../view/screens/landingScreen";
import LoginScreen from "../view/screens/loginScreen";
import SignupScreen from "../view/screens/signupScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="FaceAttendEDU" component={LandingPage} />
                <Stack.Screen name="FaceAttendEDU-Login" component={LoginScreen} />
                <Stack.Screen name="FaceAttendEDU-Register" component={SignupScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
