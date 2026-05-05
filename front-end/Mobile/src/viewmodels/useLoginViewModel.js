import { useState } from "react";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { restoreLanguageForRole } from "../view/components/common/languageByRole";
import { useTheme } from "../view/components/common/ThemeContext";
import { login } from "../services/AuthService";
import { saveToken } from "../storage/TokenStorage";
import { getHighestRole } from "../utils/getHighestRole";
import LoginRequest from "../model/LoginRequest";
import AuthResponse from "../model/AuthResponse";

export function useLoginViewModel({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [terms, setTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Nuevo estado para forzar la reactividad
    const [errorTimestamp, setErrorTimestamp] = useState(0);

    const { t } = useTranslation();
    const { loadThemeForRole } = useTheme();

    const setErrorWithTimestamp = (message) => {
        setError(message);
        setErrorTimestamp(Date.now());
    };

    const validate = () => {
        if (!email.trim() || !password.trim()) {
            setErrorWithTimestamp(
                t("login.invalidCredentials", { defaultValue: "Credenciales incorrectas" })
            );
            return false;
        }
        if (!terms) {
            setErrorWithTimestamp(
                t("Acepta los términos y condiciones", { defaultValue: "Debes aceptar los términos y condiciones" })
            );
            return false;
        }
        setError(null);
        return true;
    };

    const handleError = (err) => {
        console.error("Login error:", err);
        setErrorWithTimestamp(
            t("login.invalidCredentials", { defaultValue: "Credenciales incorrectas" })
        );
    };

    const submit = async () => {
        // Limpiar error y timestamp
        setError(null);
        setErrorTimestamp(0);

        if (!validate()) return;

        setIsLoading(true);

        try {
            const loginRequest = new LoginRequest(email, password);
            const responseData = /*await*/ login(loginRequest.toApi());

            console.log("Información a enviar: ", loginRequest)
            console.log(responseData)

            const authResponse = AuthResponse.fromApi(responseData);

            if (!authResponse || !authResponse.token) {
                throw new Error("Token no recibido en la respuesta");
            }

            await saveToken(authResponse.token, authResponse.user?.expiresIn);

            const role = getHighestRole(authResponse.user?.roles ?? []);
            console.log("Información traida:", authResponse.user);
            console.log("Rol seleccionado:", role);

            await AsyncStorage.setItem("userRole", role);
            await AsyncStorage.setItem("userEmail", email);

            await loadThemeForRole(role);
            await restoreLanguageForRole(role);

            if (onLogin) {
                onLogin(role, authResponse.token);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
        setErrorTimestamp(0);
    };

    return {
        email,
        password,
        terms,
        isLoading,
        error,
        errorTimestamp,
        setEmail,
        setPassword,
        setTerms,
        submit,
        clearError,
    };
}