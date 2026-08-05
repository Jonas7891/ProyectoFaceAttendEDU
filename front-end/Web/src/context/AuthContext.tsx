// ============================================================
//  FaceAttend EDU — AuthContext
//
//  Fuente de verdad para el usuario autenticado.
//  Expone: user, login(), logout(), isAuthenticated.
//
//  Cuando haya una API real, solo cambia la función login():
//  reemplaza el mock con una llamada HTTP y guarda el token.
//
//  Uso:
//    const { user, login, logout } = useAuth();
// ============================================================

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Platform } from "react-native";
import type { AppUser } from "../models/types";
import { mockAppUsers } from "../models/data/mockData";

// ── Tipos ─────────────────────────────────────────────────

export interface LoginCredentials {
    email:    string;
    password: string;
}

export interface AuthContextType {
    /** El usuario autenticado, o null si no hay sesión. */
    user:            AppUser | null;
    /** true mientras se recupera la sesión guardada. */
    isLoadingAuth:   boolean;
    /** true si hay un usuario autenticado. */
    isAuthenticated: boolean;
    /**
     * Autentica al usuario por email/password.
     * Retorna null si OK, o un string de error si falla.
     * TODO: reemplazar el mock con una llamada real a API.
     */
    login:  (credentials: LoginCredentials) => Promise<string | null>;
    /** Cierra la sesión y limpia el estado persistido. */
    logout: () => Promise<void>;
}

// ── Storage helper (multi-plataforma) ─────────────────────

const SESSION_KEY = "@faceattend:session_user";

async function sessionGet(): Promise<string | null> {
    if (Platform.OS === "web") {
        try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    return AS.getItem(SESSION_KEY);
}

async function sessionSet(value: string): Promise<void> {
    if (Platform.OS === "web") {
        try { localStorage.setItem(SESSION_KEY, value); } catch { /* silent */ }
        return;
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    await AS.setItem(SESSION_KEY, value);
}

async function sessionRemove(): Promise<void> {
    if (Platform.OS === "web") {
        try { localStorage.removeItem(SESSION_KEY); } catch { /* silent */ }
        return;
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    await AS.removeItem(SESSION_KEY);
}

// ── Context ───────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user,          setUser]          = useState<AppUser | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Recuperar sesión guardada al montar
    useEffect(() => {
        sessionGet().then(raw => {
            if (raw) {
                try {
                    const parsed = JSON.parse(raw) as AppUser;
                    setUser(parsed);
                } catch { /* sesión corrupta, ignorar */ }
            }
            setIsLoadingAuth(false);
        });
    }, []);

    const login = useCallback(async (credentials: LoginCredentials): Promise<string | null> => {
        // ── TODO: reemplazar con llamada real a tu API de autenticación ──
        // Ejemplo:
        //   const response = await fetch("/api/auth/login", {
        //       method: "POST",
        //       body: JSON.stringify(credentials),
        //   });
        //   if (!response.ok) return "Credenciales incorrectas";
        //   const { user, token } = await response.json();
        //   await sessionSet(JSON.stringify(user));
        //   setUser(user);
        //   return null;

        // Mock: busca el usuario por email en los datos de desarrollo.
        // Cualquier contraseña no vacía es válida en modo mock.
        await new Promise(res => setTimeout(res, 800)); // simular latencia de red

        if (!credentials.email || !credentials.password) {
            return "Completa todos los campos";
        }

        const found = mockAppUsers.find(
            u => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!found) {
            return "No se encontró una cuenta con ese correo";
        }

        await sessionSet(JSON.stringify(found));
        setUser(found);
        return null;
    }, []);

    const logout = useCallback(async () => {
        await sessionRemove();
        setUser(null);
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        user,
        isLoadingAuth,
        isAuthenticated: user !== null,
        login,
        logout,
    }), [user, isLoadingAuth, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error(
            "[FaceAttend] useAuth() debe usarse dentro de <AuthProvider>. " +
            "Envuelve tu app con <AuthProvider> en app.tsx."
        );
    }
    return ctx;
}
