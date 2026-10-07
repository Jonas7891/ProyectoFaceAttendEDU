// ============================================================
//  FaceAttend EDU — AuthContext
//
//  Fuente de verdad para el usuario autenticado.
//  Expone user, login(), logout(), isAuthenticated.
//
//  login() abre la sesión real contra ms-identity (POST /auth/login),
//  guarda el token en localStorage con la forma compartida con Mobile
//  { token, savedAt, expiresAt, email } y carga roles + perfil.
//
//  Uso:
//    const { user, login, logout } = useAuth();
// ============================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { clearToken, getToken, saveToken, setUnauthorizedHandler } from "../api/apiClient";
import { roleNamesFrom, toUiRole } from "../core/utils/backendRoles";
import { authApi } from "../services/api/authApi";

// ── Roles del backend → roles de la UI ────────────────────
// Mapa compartido con UserStorage en core/utils/backendRoles.js.

function loginErrorMessage(err) {
    if (err?.status === 400 || err?.status === 401) return "Credenciales incorrectas";
    if (err?.status === 0) return err.message; // red / timeout
    return err?.message || "No se pudo iniciar sesión";
}

// ── Storage helper (multi-plataforma) ─────────────────────

const SESSION_KEY = "@faceattend:session_user";

async function sessionGet() {
    if (Platform.OS === "web") {
        try {
            return localStorage.getItem(SESSION_KEY);
        } catch {
            return null;
        }
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    return AS.getItem(SESSION_KEY);
}

async function sessionSet(value) {
    if (Platform.OS === "web") {
        try {
            localStorage.setItem(SESSION_KEY, value);
        } catch {
            /* silent */
        }
        return;
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    await AS.setItem(SESSION_KEY, value);
}

async function sessionRemove() {
    if (Platform.OS === "web") {
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch {
            /* silent */
        }
        return;
    }
    const AS = (await import("@react-native-async-storage/async-storage")).default;
    await AS.removeItem(SESSION_KEY);
}

/**
 * ¿El sessionId sigue vivo en el backend?
 *
 * El token opaco caduca a las 8 h (security_configuration.session_timeout_minutes)
 * aunque localmente no tenga expiresAt, y esa expiración es perezosa: el primer
 * GET de sesión lo marca "Closed" (GetUserSessionUseCaseImpl). La llamada lleva el
 * propio sessionId como bearer, así que Kong (pre-function del edge) la responde con
 * 401 en cuanto la sesión deja de estar Active.
 *
 * Solo se descarta la sesión con una respuesta definitiva (401/404 o estado
 * distinto de Active); si el backend no responde se conserva, para no cerrar
 * la sesión de nadie por un reinicio del contenedor.
 */
async function isSessionAlive(token) {
    try {
        const session = await authApi.getSession(token);
        return session?.sessionStatus === "Active";
    } catch (err) {
        return err?.status !== 401 && err?.status !== 404;
    }
}

// ── Context ───────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Recuperar sesión guardada al montar: solo es una sesión válida si el
    // token también está presente (y no expiró, getToken ya lo filtra) y si
    // el backend la sigue reconociendo (isSessionAlive).
    useEffect(() => {
        Promise.all([sessionGet(), getToken()]).then(async ([raw, token]) => {
            let saved = null;
            if (raw && token) {
                try {
                    saved = JSON.parse(raw);
                } catch {
                    /* sesión corrupta, ignorar */
                }
            } else if (raw) {
                // Usuario sin token: no hay sesión autenticada que restaurar.
                await sessionRemove();
            }

            if (saved && !(await isSessionAlive(token))) {
                // Sesión ya cerrada/vencida en el backend: purgar y volver a login.
                await clearToken();
                await sessionRemove();
                saved = null;
            }

            if (saved) setUser(saved);
            setIsLoadingAuth(false);
        });
    }, []);

    // Primer 401 con un bearer que el backend ya no acepta: purgar la sesión
    // local. AuthenticatedNavigator deja de montarse y NotAuthorized navega a
    // Login, en vez de quedarse en /app disparando 401 en cada llamada.
    useEffect(() => {
        setUnauthorizedHandler(() => {
            void clearToken();
            void sessionRemove();
            setUser(null);
        });
        return () => setUnauthorizedHandler(null);
    }, []);

    const login = useCallback(async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
            return "Completa todos los campos";
        }

        let session;
        try {
            session = await authApi.login({
                email: credentials.email,
                password: credentials.password,
            });
        } catch (err) {
            return loginErrorMessage(err);
        }

        const sessionId = session?.sessionId ?? session?.session_id ?? session?.id;
        const userId = session?.userId ?? session?.user_id;
        if (!sessionId || !userId) {
            return "No se pudo crear la sesión";
        }

        // El token se guarda antes de las llamadas autenticadas, como en Mobile.
        const saved = await saveToken(String(sessionId), { email: credentials.email });
        if (!saved) return "No se pudo guardar la sesión";

        let roles;
        let userDto;
        try {
            [roles, userDto] = await Promise.all([
                authApi.userRoles(userId),
                authApi.getUser(userId),
            ]);
        } catch (err) {
            await clearToken();
            return err?.message || "No se pudo cargar el perfil";
        }

        const roleNames = roleNamesFrom(roles);
        const role = toUiRole(roleNames);
        if (!role) {
            await clearToken();
            // "cuenta" hace que useAuthViewModel lo muestre en el campo de email.
            // Distingue: sin roles asignados vs. roles que la app no sabe mapear.
            return roleNames.length
                ? `La cuenta tiene un rol no reconocido: ${roleNames.join(", ")}`
                : "La cuenta no tiene roles asignados en el backend";
        }

        const personId = userDto?.personId ?? userDto?.person_id ?? null;
        let person = null;
        if (personId) {
            try {
                person = await authApi.getPerson(personId);
            } catch {
                person = null;
            }
        }

        // Sede del usuario: vive en academic_actor (person es agnostica de sede,
        // MODELO §2.6). Sin esto el admin no tenia con que acotar lo que ve y la
        // aplicacion mostraba las dos instituciones mezcladas.
        const school = personId ? await authApi.schoolOf(personId) : null;

        const sessionUser = {
            id: userId,
            personId,
            schoolId: school?.schoolId ?? null,
            academicActorId: school?.academicActorId ?? null,
            username: userDto?.username ?? credentials.email,
            email: person?.email ?? credentials.email,
            name: person
                ? `${person.name ?? ""} ${person.lastName ?? person.last_name ?? ""}`.trim()
                : credentials.email,
            role,
            roles: roleNames,
            avatar: null,
        };

        await sessionSet(JSON.stringify(sessionUser));
        setUser(sessionUser);
        return null;
    }, []);

    const logout = useCallback(async () => {
        const token = await getToken();
        if (token) {
            await authApi.logout(token).catch(() => null);
        }
        await clearToken();
        await sessionRemove();
        setUser(null);
    }, []);

    const register = useCallback(async (userData) => {
        // ── Mock: el backend no expone auto-registro de usuarios ──
        await new Promise((res) => setTimeout(res, 900)); // simular latencia de red

        if (!userData.email || !userData.password || !userData.username) {
            return "Completa todos los campos";
        }

        // Crear objeto de usuario registrado (por ahora sin rol, se asignaría en backend)
        const newUser = {
            id: `user_${Date.now()}`, // ID temporal
            username: userData.username,
            email: userData.email,
            firstName: userData.username, // Temporalmente usar username como nombre
            lastName: "",
            role: "student", // Rol por defecto para usuarios registrados
            avatar: null,
        };

        await sessionSet(JSON.stringify(newUser));
        setUser(newUser);
        return null;
    }, []);

    const value = useMemo(
        () => ({
            user,
            isLoadingAuth,
            isAuthenticated: user !== null,
            login,
            logout,
            register,
        }),
        [user, isLoadingAuth, login, logout, register]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error(
            "[FaceAttend] useAuth() debe usarse dentro de <AuthProvider>. " +
            "Envuelve tu app con <AuthProvider> en app.tsx."
        );
    }
    return ctx;
}
