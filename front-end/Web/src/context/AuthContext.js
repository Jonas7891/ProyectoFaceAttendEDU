// ============================================================
//  FaceAttend EDU — AuthContext
//
//  Fuente de verdad para el usuario autenticado.
//  Expone, login(), logout(), isAuthenticated.
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
import { AppUser } from "../models/types";
import { mockAppUsers } from "../models/data/mockData";

// ── Tipos ─────────────────────────────────────────────────


// ── Storage helper (multi-plataforma) ─────────────────────

const SESSION_KEY = "@faceattend:session_user";

async function sessionGet() {
    if (Platform.OS === "web") {
        try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    return AS.getItem(SESSION_KEY);
}

async function sessionSet(value) {
    if (Platform.OS === "web") {
        try { localStorage.setItem(SESSION_KEY, value); } catch { /* silent */ }
        return;
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    await AS.setItem(SESSION_KEY, value);
}

async function sessionRemove() {
    if (Platform.OS === "web") {
        try { localStorage.removeItem(SESSION_KEY); } catch { /* silent */ }
        return;
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    await AS.removeItem(SESSION_KEY);
}

// ── Context ───────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }) {
    const [user,          setUser]          = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Recuperar sesión guardada al montar
    useEffect(() => {
        sessionGet().then(raw => {
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    setUser(parsed);
                } catch { /* sesión corrupta, ignorar */ }
            }
            setIsLoadingAuth(false);
        });
    }, []);

    const login = useCallback(async (credentials) => {
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

    const value = useMemo(() => ({
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

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error(
            "[FaceAttend] useAuth() debe usarse dentro de . " +
            "Envuelve tu app con  en app.tsx."
        );
    }
    return ctx;
}
