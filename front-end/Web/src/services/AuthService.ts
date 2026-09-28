//
// Lógica de autenticación: intenta backend real y cae a mock local.
//

import { Platform } from "react-native";
import { auths } from "./constants/auths";
import { mockAppUsers } from "../models/data/mockData";
import { authApi } from "./api/authApi";
import { authorizationApi } from "./api/authorizationApi";
import { getHighestRole, mapBackendRoleToAppRole, normalizeBackendRole } from "../utils/getHighestRole";
import type { AppUserRole } from "../models/types";
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

export interface LoginResult {
    token: string;
    session?: unknown;
    userId?: string;
    backendRoles?: string[];
    appRole?: AppUserRole;
}

/** Roles del usuario vía GET /api/v1/users/{id}/roles (ms-authorization directo). */
async function fetchBackendRoles(userId: string): Promise<string[]> {
    const raw = await authorizationApi.userRoles(userId);
    const list = Array.isArray(raw) ? raw : [raw];
    return list
        .map((r) => {
            const o = r as { roleName?: string; role_name?: string };
            return normalizeBackendRole(o?.roleName ?? o?.role_name);
        })
        .filter((r): r is string => r !== null);
}

/** Permiso efectivo vía GET /api/v1/auth/evaluate. Falla cerrado. */
async function evaluateBackendRole(userId: string, permission: string): Promise<void> {
    const res = (await authorizationApi.evaluate({ userId, permission })) as { allowed?: boolean };
    if (res && res.allowed === false) {
        throw new Error("Rol sin permisos verificados en el backend");
    }
}

/** Login real contra POST /api/v1/auth/login + verificación de roles. Sin fallback silencioso. */
export const login = async (data: { email: string; password: string }): Promise<LoginResult> => {
    try {
        const session = await authApi.login({ username: data.email, password: data.password });
        const token =
            (session?.token as string | undefined) ??
            (session?.sessionId as string | undefined) ??
            (session?.id as string | undefined);
        if (!token) throw new Error("Credenciales invalidas");
        const userId = (session?.userId as string | undefined) ?? undefined;
        if (!userId) throw new Error("La sesión no trae usuario para verificar roles");

        const backendRoles = await fetchBackendRoles(userId);
        if (backendRoles.length === 0) {
            throw new Error("El usuario no tiene roles asignados en el backend");
        }
        await evaluateBackendRole(userId, "attendance.record:read");
        const appRole = mapBackendRoleToAppRole(backendRoles[0]);
        if (!appRole) throw new Error("El usuario no tiene un rol válido asignado");

        // Jerarquía: el rol más alto de los verificados.
        const top = getHighestRole(backendRoles);
        const finalAppRole = (top ? mapBackendRoleToAppRole(top) : appRole) ?? appRole;

        await persistToken(String(token));
        return { token: String(token), session, userId, backendRoles, appRole: finalAppRole };
    } catch (e) {
        // Backend con respuesta (4xx o fallo de verificación de roles): se propaga.
        // Solo sin backend (red/timeout, status 0) se usa mock local con rol explícito.
        if (e instanceof ApiError && e.status !== 0) {
            throw new Error(e.message || "Credenciales invalidas");
        }
        if (e instanceof Error && !(e instanceof ApiError)) throw e;
        // status 0 = sin backend → continuar a mock local
    }

    const auth = (auths as Record<string, { password: string; token: string }>)[data.email];
    if (auth && auth.password === data.password) {
        const mock = mockAppUsers.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
        if (!mock) throw new Error("Usuario sin rol asignado (sin backend y fuera del mock)");
        return { token: auth.token, appRole: mock.role, backendRoles: [mock.role] };
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
