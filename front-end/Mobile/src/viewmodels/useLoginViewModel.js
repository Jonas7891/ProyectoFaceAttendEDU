// viewmodels/useLoginViewModel.js
import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { restoreLanguageForRole } from "../view/components/common/languageByRole";
import { useTheme } from "../view/components/common/ThemeContext";
import { login } from "../services/AuthService";        // tu servicio de login
import { saveToken } from "../storage/TokenStorage";   // tu storage de token
import { getHighestRole } from "../utils/getHighestRole";
import LoginRequest from "../model/LoginRequest";     // tu modelo de request
import AuthResponse from "../model/AuthResponse";     // tu modelo de response

export function useLoginViewModel({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { t } = useTranslation();
    const { loadThemeForRole } = useTheme();

    // Validación simple
    const validate = () => {
        if (!email.trim()) {
            setError(t("login.errorEmail"));
            return false;
        }
        if (!password.trim()) {
            setError(t("login.errorPassword"));
            return false;
        }
        setError(null);
        return true;
    };

    // Manejo de errores de red/API
    const handleError = (err) => {
        console.error("Login error:", err);
        Alert.alert(t("common.error"), t("login.loginError"));
        setError(t("login.loginError"));
    };

    // Acción principal de login
    const submit = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Crear el request
            const loginRequest = new LoginRequest(email, password);

            // Llamada al servicio
            const responseData = /*await*/ login(loginRequest.toApi());
            const authResponse = AuthResponse.fromApi(responseData);  // { token, user }

            // Guardar token con expiración si viene
            await saveToken(authResponse.token, authResponse.user?.expiresIn);

            // Guardar rol (ajusta según la estructura de tu user)
            const role = getHighestRole(authResponse.user.roles);
            console.log("Roles: ", authResponse.user.roles);
            console.log('Rol seleccionado:', role);
            await AsyncStorage.setItem("userRole", role);
            console.log("Rol almacenado: ", role);
            await AsyncStorage.setItem("userEmail", email);

            // Aplicar tema e idioma según el rol
            await loadThemeForRole(role);
            await restoreLanguageForRole(role);

            // Notificar al flujo padre que el login fue exitoso
            if (onLogin) {
                onLogin(role, authResponse.token);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Limpiar error
    const clearError = () => setError(null);

    return {
        // Estado
        email,
        password,
        isLoading,
        error,
        // Setters
        setEmail,
        setPassword,
        // Acciones
        submit,
        clearError
    };
}