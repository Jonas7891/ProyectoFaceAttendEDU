import {useState} from "react";
import {useTranslation} from "react-i18next";
import {restoreLanguageForRole} from "../view/components/common/languageByRole";
import {useTheme} from "../view/components/common/ThemeContext";
import {login} from "../services/AuthService";
import {removeToken, saveToken} from "../storage/TokenStorage";
import {getHighestRole} from "../utils/getHighestRole";
import LoginRequest from "../model/LoginRequest";
import AuthResponse from "../model/AuthResponse";

const MAX_FAILED_ATTEMPTS = 3;

export function useLoginViewModel({onLogin}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [terms, setTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorTimestamp, setErrorTimestamp] = useState(0);
    const [failedAttempts, setFailedAttempts] = useState(0);

    const {t} = useTranslation();
    const {loadThemeForRole} = useTheme();

    const setErrorWithTimestamp = (message) => {
        setError(message);
        setErrorTimestamp(Date.now());
    };

    const validate = () => {
        if (!email.trim() || !password.trim()) {
            setErrorWithTimestamp(
                t("login.invalidCredentials", {defaultValue: "Credenciales incorrectas"})
            );
            return false;
        }
        if (!terms) {
            setErrorWithTimestamp(
                t("Acepta los términos y condiciones", {defaultValue: "Debes aceptar los términos y condiciones"})
            );
            return false;
        }
        setError(null);
        return true;
    };

    const handleError = (err) => {
        console.error("Login error:", err);

        // Sólo contamos como intento fallido los errores de credenciales,
        // no los de validación local (terms, campos vacíos).
        const newCount = failedAttempts + 1;
        setFailedAttempts(newCount);
        console.log(`❌ Intento fallido ${newCount}/${MAX_FAILED_ATTEMPTS}`);

        setErrorWithTimestamp(
            t("login.invalidCredentials", {defaultValue: "Credenciales incorrectas"})
        );
    };

    const submit = async () => {
        setError(null);
        setErrorTimestamp(0);

        if (!validate()) return;

        setIsLoading(true);

        try {
            const loginRequest = new LoginRequest(email, password);
            const responseData = login(loginRequest.toApi());

            const authResponse = AuthResponse.fromApi(responseData);

            if (!authResponse || !authResponse.token) {
                throw new Error("Token no recibido en la respuesta");
            }

            const saved = await saveToken(authResponse.token);

            if (!saved) {
                throw new Error("No se pudo guardar el token");
            }

            const userData = authResponse.user;
            const role = getHighestRole(userData?.roles ?? []);

            console.log("✅ Login exitoso - Rol:", role);

            // Resetear intentos fallidos al lograr un login exitoso
            setFailedAttempts(0);

            await loadThemeForRole(role);
            await restoreLanguageForRole(role);

            if (onLogin) {
                onLogin(role, authResponse.token);
            }
        } catch (err) {
            console.error("Error en login:", err);
            handleError(err);
            await removeToken();
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
        setErrorTimestamp(0);
    };

    const resetFailedAttempts = () => {
        setFailedAttempts(0);
    };

    return {
        email,
        password,
        terms,
        isLoading,
        error,
        errorTimestamp,
        failedAttempts,
        maxFailedAttempts: MAX_FAILED_ATTEMPTS,
        setEmail,
        setPassword,
        setTerms,
        submit,
        clearError,
        resetFailedAttempts,
    };
}