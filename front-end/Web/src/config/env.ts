// ============================================================
//  FaceAttend EDU — Configuración central del frontend Web
//
//  Lee la URL del backend desde EXPO_PUBLIC_API_URL (build time
//  en Expo) con fallback a la variable clásica o localhost.
//  En Docker el valor se inyecta vía ARG/ENV y nginx lo sirve
//  como estático; para cambiar el backend en runtime usa
//  window.__FACEATTEND_API_URL__ (ver apiClient).
// ============================================================

/** Base del API Gateway Kong. Sin slash final. */
export function getApiBaseUrl(): string {
    const nodeEnv = (
        globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env;
    const base = (nodeEnv?.EXPO_PUBLIC_API_URL ?? "http://localhost:8080").trim();
    return base.endsWith("/") ? base.slice(0, -1) : base;
}

/**
 * Base directa de ms-authorization (sin JWT de Kong).
 * Igual que Mobile (`AUTHZ_BASE_URL`): el gateway exige JWT que el login
 * por sesión opaca no emite, así que roles/evaluate van directo al MS.
 */
export function getAuthzBaseUrl(): string {
    const nodeEnv = (
        globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env;
    const explicit = nodeEnv?.EXPO_PUBLIC_AUTHZ_URL?.trim();
    if (explicit) return explicit.endsWith("/") ? explicit.slice(0, -1) : explicit;
    const gw = getApiBaseUrl();
    if (gw.endsWith(":8080")) return `${gw.slice(0, -5)}:8083`;
    return gw;
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
