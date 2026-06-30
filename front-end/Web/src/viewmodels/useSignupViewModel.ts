import { useState } from "react";
import { register } from "../services/AuthService";
import { saveToken } from "../storage/TokenStorage";
import { getHighestRole } from "../utils/getHighestRole";
import SignupRequest from "../model/SignupRequest";
import AuthResponse from "../model/AuthResponse";

interface UseSignupViewModelProps {
    onSignup?: (role: string, token: string) => void;
}

export function useSignupViewModel({ onSignup }: UseSignupViewModelProps) {
    const [username, setUsername] = useState("");
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
     * Valida los campos del formulario de registro
     */
    const validate = (): boolean => {
        if (!username.trim()) {
            setErrorWithTimestamp("El nombre de usuario es obligatorio");
            return false;
        }

        if (username.length < 3) {
            setErrorWithTimestamp("El nombre de usuario debe tener al menos 3 caracteres");
            return false;
        }

        if (!email.trim()) {
            setErrorWithTimestamp("El correo electrónico es obligatorio");
            return false;
        }

        // Validación de email más estricta
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorWithTimestamp("El correo electrónico no es válido");
            return false;
        }

        if (!password.trim()) {
            setErrorWithTimestamp("La contraseña es obligatoria");
            return false;
        }

        if (password.length < 6) {
            setErrorWithTimestamp("La contraseña debe tener al menos 6 caracteres");
            return false;
        }

        // Validación de fortaleza básica
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            setErrorWithTimestamp("La contraseña debe contener mayúsculas, minúsculas y números");
            return false;
        }

        setError("");
        return true;
    };

    /**
     * Maneja errores de registro
     */
    const handleError = (err: any) => {
        console.error("Signup error:", err);

        // Si es un error conocido, mostrarlo; si no, mensaje genérico
        const errorMessage =
            err instanceof Error && (
                err.message === "El correo electrónico ya está registrado" ||
                err.message === "Correo electrónico inválido" ||
                err.message === "La contraseña debe tener al menos 6 caracteres"
            )
                ? err.message
                : "Error al crear la cuenta. Intenta de nuevo.";

        setErrorWithTimestamp(errorMessage);
    };

    /**
     * Ejecuta el registro
     */
    const submit = async () => {
        // Limpiar error y timestamp
        setError("");
        setErrorTimestamp(0);

        if (!validate()) return;

        setIsLoading(true);

        try {
            // Crear request y llamar al servicio
            const signupRequest = new SignupRequest(username, email, password);
            const responseData = register(signupRequest.toApi());

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
            console.log("Usuario registrado - Rol:", role);

            // Guardar datos en localStorage/sessionStorage
            localStorage.setItem("userRole", role);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userName", username);

            // Ejecutar callback si existe
            if (onSignup) {
                onSignup(role, authResponse.token);
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
        setUsername("");
        setEmail("");
        setPassword("");
        clearError();
    };

    return {
        // Estado
        username,
        email,
        password,
        isLoading,
        error,
        errorTimestamp,

        // Setters
        setUsername,
        setEmail,
        setPassword,

        // Métodos
        submit,
        clearError,
        clearForm,
    };
}
