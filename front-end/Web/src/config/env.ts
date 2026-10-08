// ============================================================
//  FaceAttend EDU — Configuración central del frontend Web
//
//  Lee la URL del backend desde EXPO_PUBLIC_API_URL (build time
//  en Expo, horneada en el bundle estático). Si no se fijó una
//  URL explícita, se infiere del host con el que se cargó la
//  página (mismo patrón que Mobile en src/config/env.js): abrir
//  http://10.0.0.5:8090 asume Kong en http://10.0.0.5:8080. Así
//  un cambio de IP de LAN no exige reconstruir la imagen Docker.
//  Para forzar otro backend en runtime usa window.__FACEATTEND_API_URL__
//  (ver apiClient).
// ============================================================

const GATEWAY_PORT = 8080;

function inferApiBaseUrl(): string {
    if (typeof window !== "undefined" && window.location?.hostname) {
        return `${window.location.protocol}//${window.location.hostname}:${GATEWAY_PORT}`;
    }
    return `http://localhost:${GATEWAY_PORT}`;
}

/** Base del API Gateway Kong. Sin slash final. */
export function getApiBaseUrl(): string {
    const nodeEnv = (
        globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env;
    const explicit = nodeEnv?.EXPO_PUBLIC_API_URL?.trim();
    const base = explicit || inferApiBaseUrl();
    return base.endsWith("/") ? base.slice(0, -1) : base;
}

/** Timeout por defecto de peticiones HTTP (ms). */
export const API_TIMEOUT_MS = 15000;

/** ¿Hay backend real configurado o solo mocks? */
export function getApiMode(): "live" | "mock" {
    const nodeEnv = (
        globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env;
    return nodeEnv?.EXPO_PUBLIC_API_MOCK === "1" ? "mock" : "live";
}

export const API_MODE: "live" | "mock" = getApiMode();
