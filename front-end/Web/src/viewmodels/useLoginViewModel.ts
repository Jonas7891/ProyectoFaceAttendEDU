import { useState } from "react";
import { login } from "../services/AuthService";
import { saveToken } from "../storage/TokenStorage";
import { getHighestRole } from "../utils/getHighestRole";
import LoginRequest from "../model/LoginRequest";
import AuthResponse from "../model/AuthResponse";

interface UseLoginViewModelProps {
    onLogin?: (role: string, token: string) => void;
}

export function useLoginViewModel({ onLogin }: UseLoginViewModelProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    // ✅ Nuevo estado para forzar la reactividad (detectar cambios de error)
    const [errorTimestamp, setErrorTimestamp] = useState(0);

    /**
     * Establece el error y actualiza el timestamp para forzar re-render
     */
    const setErrorWithTimestamp = (message: string) => {
        setError(message);
        setErrorTimestamp(Date.now());
    };

    /**
     * Valida los campos del formulario
     */
    const validate = (): boolean => {
        if (!email.trim() || !password.trim()) {
            setErrorWithTimestamp("Completa todos los campos");
            return false;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorWithTimestamp("El correo electrónico no es válido");
            return false;
        }

        setError("");
        return true;
    };

    /**
     * Maneja errores de autenticación
     */
    const handleError = (err: any) => {
        console.error("Login error:", err);

        // Si es un error conocido, mostrarlo; si no, mensaje genérico
        const errorMessage =
            err instanceof Error && err.message === "Credenciales invalidas"
                ? "Credenciales incorrectas"
                : "Error al iniciar sesión. Intenta de nuevo.";

        setErrorWithTimestamp(errorMessage);
    };

    /**
     * Ejecuta el login
     */
    const submit = async () => {
        // Limpiar error y timestamp
        setError("");
        setErrorTimestamp(0);

        if (!validate()) return;

        setIsLoading(true);

        try {
            // Crear request y llamar al servicio
            const loginRequest = new LoginRequest(email, password);
            const responseData = login(loginRequest.toApi());

            // Decodificar respuesta
            const authResponse = AuthResponse.fromApi(responseData);

            if (!authResponse || !authResponse.token) {
                throw new Error("Token no recibido en la respuesta");
            }

            // Guardar token
            await saveToken(authResponse.token);

            // Extraer rol más alto
            const userRoles = authResponse.user?.[0]?.roles ?? [];
            const role = getHighestRole(userRoles);
            console.log("Rol seleccionado:", role);

            // Guardar datos en localStorage/sessionStorage
            localStorage.setItem("userRole", role);
            localStorage.setItem("userEmail", email);

            // Ejecutar callback si existe
            if (onLogin) {
                onLogin(role, authResponse.token);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Limpia los errores
     */
    const clearError = () => {
        setError("");
        setErrorTimestamp(0);
    };

    /**
     * Limpia el formulario completamente
     */
    const clearForm = () => {
        setEmail("");
        setPassword("");
        clearError();
    };

    return {
        // Estado
        email,
        password,
        isLoading,
        error,
        errorTimestamp,

        // Setters
        setEmail,
        setPassword,

        // Métodos
        submit,
        clearError,
        clearForm,
    };
}

