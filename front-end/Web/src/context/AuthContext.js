// ============================================================
//  FaceAttend EDU — AuthContext
//
//  Fuente de verdad para el usuario autenticado.
//  Expone user, login(), logout(), isAuthenticated.
//  Incluye gestión automática de timeout de sesión.
//
//  Cuando haya una API real, solo cambia la función login():
//  reemplaza el mock con una llamada HTTP y guarda el token.
//
//  Uso:
//    const { user, login, logout, sessionTimeout } = useAuth();
// ============================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { mockAppUsers } from "../models/data/mockData";
import { getInstitutionConfig } from "../core/config/institutionConfig";
import { useSessionTimeout } from "../core/hooks/useSessionTimeout";

// ── Storage helper (multi-plataforma) ─────────────────────

const SESSION_KEY = "@faceattend:session_user";
const SESSION_TIMEOUT_FLAG_KEY = "@faceattend:session_timeout_flag";
const INTENDED_ROUTE_KEY = "@faceattend:intended_route";

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

// Funciones para manejar el flag de timeout
async function getTimeoutFlag() {
    try {
        if (Platform.OS === "web") {
            return localStorage.getItem(SESSION_TIMEOUT_FLAG_KEY) === "true";
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        const flag = await AS.getItem(SESSION_TIMEOUT_FLAG_KEY);
        return flag === "true";
    } catch (error) {
        console.error('[AuthContext] Error reading timeout flag:', error);
        return false;
    }
}

async function setTimeoutFlag(value) {
    try {
        if (Platform.OS === "web") {
            localStorage.setItem(SESSION_TIMEOUT_FLAG_KEY, value ? "true" : "false");
            return;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        await AS.setItem(SESSION_TIMEOUT_FLAG_KEY, value ? "true" : "false");
    } catch (error) {
        console.error('[AuthContext] Error setting timeout flag:', error);
    }
}

async function removeTimeoutFlag() {
    try {
        if (Platform.OS === "web") {
            localStorage.removeItem(SESSION_TIMEOUT_FLAG_KEY);
            return;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        await AS.removeItem(SESSION_TIMEOUT_FLAG_KEY);
    } catch (error) {
        console.error('[AuthContext] Error removing timeout flag:', error);
    }
}

// Funciones para manejar la ruta deseada (intended route)
async function getIntendedRoute() {
    try {
        if (Platform.OS === "web") {
            const route = localStorage.getItem(INTENDED_ROUTE_KEY);
            return route ? JSON.parse(route) : null;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        const route = await AS.getItem(INTENDED_ROUTE_KEY);
        return route ? JSON.parse(route) : null;
    } catch (error) {
        console.error('[AuthContext] Error reading intended route:', error);
        return null;
    }
}

async function storeIntendedRoute(routeInfo) {
    try {
        if (Platform.OS === "web") {
            localStorage.setItem(INTENDED_ROUTE_KEY, JSON.stringify(routeInfo));
            return;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        await AS.setItem(INTENDED_ROUTE_KEY, JSON.stringify(routeInfo));
    } catch (error) {
        console.error('[AuthContext] Error storing intended route:', error);
    }
}

async function removeIntendedRoute() {
    try {
        if (Platform.OS === "web") {
            localStorage.removeItem(INTENDED_ROUTE_KEY);
            return;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        await AS.removeItem(INTENDED_ROUTE_KEY);
    } catch (error) {
        console.error('[AuthContext] Error removing intended route:', error);
    }
}

// ── Context ───────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [sessionExpiredByTimeout, setSessionExpiredByTimeout] = useState(false);
    const [isLoadingTimeoutFlag, setIsLoadingTimeoutFlag] = useState(true);
    const [intendedRoute, setIntendedRoute] = useState(null); // Ruta deseada
    
    // Estado reactivo de configuración - se actualiza cuando cambie
    const [config, setConfig] = useState(() => getInstitutionConfig());
    
    // Listener para cambios de configuración
    useEffect(() => {
        const handleConfigUpdate = (event) => {
            setConfig(event.detail); // Actualizar config cuando cambie
        };

        // Escuchar evento de actualización de configuración
        window.addEventListener('institutionConfigUpdated', handleConfigUpdate);
        
        return () => {
            window.removeEventListener('institutionConfigUpdated', handleConfigUpdate);
        };
    }, []);

    // Función para guardar la ruta donde ocurrió el error de autorización
    const saveIntendedRoute = useCallback(async (routeInfo) => {
        await storeIntendedRoute(routeInfo);
        setIntendedRoute(routeInfo); // Update React state
    }, []);

    // Función para limpiar la ruta deseada
    const clearIntendedRoute = useCallback(async () => {
        await removeIntendedRoute();
        setIntendedRoute(null);
    }, []);

    // Función para obtener y limpiar la ruta deseada (para usar después del login)
    const consumeIntendedRoute = useCallback(async () => {
        // Leer directamente del storage, no del estado React
        const route = await getIntendedRoute();
        if (route) {
            // Limpiar del storage Y del estado React
            await removeIntendedRoute();
            setIntendedRoute(null);
            return route;
        }
        return null;
    }, []);
    // ============================================================ 
    // SISTEMA DE REDIRECCIÓN SIMPLE - Sin dependencias externas
    // ============================================================
    
    const handleSessionTimeout = useCallback(async () => {
        // Marcar que fue por timeout y limpiar sesión
        await setTimeoutFlag(true); 
        setSessionExpiredByTimeout(true); 
        await sessionRemove(); 
        setUser(null); 
        
        // La ruta ya está guardada desde que el usuario navegó
    }, []);

    // Sistema de timeout de sesión - REACTIVO a cambios de configuración  
    const sessionTimeout = useSessionTimeout({
        timeoutMinutes: config.sessionTime || 60,
        onTimeout: handleSessionTimeout,
        warningMinutes: config.sessionWarningTime || 5, // Usar configuración o default
        enabled: user !== null // Solo activar si hay usuario logueado
    });

    // Efecto para reiniciar timer cuando cambie la configuración
    useEffect(() => {
        if (sessionTimeout && user) {
            sessionTimeout.resetTimer(); // Reiniciar con nueva configuración
        }
    }, [config.sessionTime, config.sessionWarningTime]); // SOLO las config values

    // Recuperar sesión guardada al montar
    useEffect(() => {
        Promise.all([sessionGet(), getTimeoutFlag(), getIntendedRoute()]).then(([sessionRaw, timeoutFlag, savedIntendedRoute]) => {
            
            // Si hay flag de timeout, la sesión está expirada - NO cargar el usuario
            if (timeoutFlag) {
                // Sesión expirada: limpiar usuario pero mantener flag y ruta
                setUser(null);
                setSessionExpiredByTimeout(true);
                setIntendedRoute(savedIntendedRoute);
            } else if (sessionRaw) {
                // Sesión válida: cargar usuario
                try {
                    const parsed = JSON.parse(sessionRaw);
                    setUser(parsed);
                    setSessionExpiredByTimeout(false);
                } catch {
                    /* sesión corrupta, ignorar */
                    setUser(null);
                    setSessionExpiredByTimeout(false);
                }
                setIntendedRoute(savedIntendedRoute);
            } else {
                // No hay sesión
                setUser(null);
                setSessionExpiredByTimeout(false);
                setIntendedRoute(savedIntendedRoute);
            }
            
            setIsLoadingAuth(false);
            setIsLoadingTimeoutFlag(false); // Marcar que ya terminamos de cargar
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
        await new Promise((res) => setTimeout(res, 800)); // simular latencia de red

        if (!credentials.email || !credentials.password) {
            return "Completa todos los campos";
        }

        const found = mockAppUsers.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

        if (!found) {
            return "No se encontró una cuenta con ese correo";
        }

        // Obtener ruta deseada ANTES de limpiar estados
        const redirectRoute = await consumeIntendedRoute();
        console.log('[AuthContext] Login: redirectRoute obtained:', redirectRoute);

        // LIMPIAR COMPLETAMENTE cualquier estado anterior antes de establecer nueva sesión
        await removeTimeoutFlag(); // Limpiar flag persistente 
        await removeIntendedRoute(); // Limpiar ruta deseada del storage
        await sessionRemove(); // Limpiar sesión anterior por seguridad
        
        // Limpiar estados de React
        setSessionExpiredByTimeout(false);
        setIntendedRoute(null);
        
        // Establecer nueva sesión limpia
        await sessionSet(JSON.stringify(found));
        setUser(found);
        
        // Resetear el timer de sesión al hacer login
        sessionTimeout.resetTimer();
        
        console.log('[AuthContext] Login successful, returning:', { success: true, redirectRoute });
        return { success: true, redirectRoute };
    }, [consumeIntendedRoute, sessionTimeout]);

    const logout = useCallback(async () => {
        await removeTimeoutFlag(); // Limpiar flag persistente
        await removeIntendedRoute(); // Limpiar ruta deseada
        setSessionExpiredByTimeout(false); // Limpiar flag de timeout para logout manual
        setIntendedRoute(null);
        await sessionRemove();
        setUser(null);
        // Resetear el timer de sesión al hacer logout manual
        sessionTimeout.resetTimer();
    }, [sessionTimeout]);

    const register = useCallback(async (userData) => {
        // ── TODO: reemplazar con llamada real a tu API de registro ──
        // Ejemplo:
        //   const response = await fetch("/api/auth/register", {
        //       method: "POST",
        //       body: JSON.stringify(userData),
        //   });
        //   if (!response.ok) return "Error al registrar";
        //   const { user, token } = await response.json();
        //   await sessionSet(JSON.stringify(user));
        //   setUser(user);
        //   return null;

        // Mock: crear un nuevo usuario y guardarlo en la sesión
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
        await removeIntendedRoute(); // Limpiar ruta deseada al registrarse
        await removeTimeoutFlag(); // Limpiar flag persistente al registrarse
        setSessionExpiredByTimeout(false); // Limpiar flag al registrarse
        // Resetear el timer de sesión al registrarse
        sessionTimeout.resetTimer();
        
        return { success: true, redirectRoute: null }; // No hay redirección en registro
    }, [sessionTimeout]);

    const value = useMemo(
        () => ({
            user,
            isLoadingAuth,
            isAuthenticated: user !== null,
            sessionExpiredByTimeout,
            isLoadingTimeoutFlag,
            intendedRoute,
            saveIntendedRoute,
            clearIntendedRoute,
            consumeIntendedRoute,
            login,
            logout,
            register,
            sessionTimeout,
        }),
        [user, isLoadingAuth, sessionExpiredByTimeout, isLoadingTimeoutFlag, intendedRoute, saveIntendedRoute, clearIntendedRoute, consumeIntendedRoute, login, logout, register, sessionTimeout]
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