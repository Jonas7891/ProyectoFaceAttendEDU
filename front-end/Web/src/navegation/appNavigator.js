import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LandingScreen from "../view/screens/LandingScreen";
import LoginScreen from "../view/screens/LoginScreen";
import SignupScreen from "../view/screens/SignupScreen";
import DashboardScreen from "../view/screens/DashboardScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{           
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="FaceAttendEDU"
                component={LandingScreen}
            />

            <Stack.Screen
                name="FaceAttendEDU-Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="FaceAttendEDU-Register"
                component={SignupScreen}
            />

            <Stack.Screen
                name="FaceAttendEDU-Dashboard"
                component={DashboardScreen}
            />
        </Stack.Navigator>
    );
}