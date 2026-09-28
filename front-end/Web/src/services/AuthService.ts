//
// Lógica de autenticación: intenta backend real y cae a mock local.
//

import { Platform } from "react-native";
import { auths } from "./constants/auths";
import { authApi } from "./api/authApi";
import { ApiError } from "../api/apiClient";

const TOKEN_KEY = "auth_token";

async function persistToken(token: string): Promise<void> {
    try {
        if (Platform.OS === "web") {
            localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, savedAt: Date.now() }));
            return;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        await AS.setItem(TOKEN_KEY, JSON.stringify({ token, savedAt: Date.now() }));
    } catch {
        // almacenamiento best-effort: la sesión en memoria sigue válida
    }
}

/** Login real contra POST /api/v1/auth/login con fallback a mock. */
export const login = async (data: { email: string; password: string }) => {
    try {
        const session = await authApi.login({ username: data.email, password: data.password });
        const token =
            (session?.token as string | undefined) ??
            (session?.sessionId as string | undefined) ??
            (session?.id as string | undefined);
        if (token) await persistToken(String(token));
        if (token) return { token: String(token), session };
    } catch (e) {
        // Si el backend está caído (red/timeout) se usa mock; si el backend
        // respondió 4xx (credenciales inválidas) se propaga el error.
        if (e instanceof ApiError && e.status !== 0) {
            throw new Error(e.message || "Credenciales invalidas");
        }
        // status 0 = sin backend → continuar a mock local
    }

    const auth = (auths as Record<string, { password: string; token: string }>)[data.email];
    if (auth && auth.password === data.password) {
        return { token: auth.token };
    }
    throw new Error("Credenciales invalidas");
};

export const register = (data) => {
    // Simular registro - en producción esto iría al backend
    const { username, email, password } = data;

    // Validar que el email no exista ya
    if (auths[email]) {
        throw new Error("El correo electrónico ya está registrado");
    }

    // Validar formato básico
    if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Correo electrónico inválido");
    }

    if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Simular creación de usuario - en producción el backend retornaría el token
    // Para demo, retornamos un token genérico de "Estudiante" para nuevos usuarios
    const newUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwic3ViIjoi" + btoa(email) + "Iiwicm9sZXMiOlsiRXN0dWRpYW50ZSJdLCJpYXQiOjE3MzMxMjQ4MDAsImV4cCI6MTczMzIxMTIwMH0.newUserToken";

    return { token: newUserToken };
};
