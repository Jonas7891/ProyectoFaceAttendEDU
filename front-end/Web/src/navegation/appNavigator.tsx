import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LandingPage from "../view/screens/landingScreen";
import LoginScreen from "../view/screens/loginScreen";
import SignupScreen from "../view/screens/signupScreen";
import DashboardScreen from "../view/screens/dashboardScreen";
import { RouteNames } from "./linking";

const Stack = createNativeStackNavigator();

/** Rutas: / → landing, /login, /register, /dashboard (ver linking.ts). */
export default function AppNavigator() {

    return (
        // @ts-expect-error - tipos de @react-navigation/native-stack exigen "id" en este overload
        <Stack.Navigator
            screenOptions={{           
                headerShown: false,
            }}
        >
            <Stack.Screen
                name={RouteNames.landing}
                component={LandingPage}
            />

            <Stack.Screen
                name={RouteNames.login}
                component={LoginScreen}
            />

            <Stack.Screen
                name={RouteNames.register}
                component={SignupScreen}
            />

            <Stack.Screen
                name={RouteNames.dashboard}
                component={DashboardScreen}
            />
        </Stack.Navigator>
    );
}