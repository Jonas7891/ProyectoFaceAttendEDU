// ============================================================
//  FaceAttend EDU — Cliente HTTP central (fetch + interceptores)
//
//  Toda petición al backend pasa por aquí:
//  - Base URL del gateway Kong (EXPO_PUBLIC_API_URL)
//  - Token Bearer automático (AsyncStorage / localStorage web)
//  - Timeout + 1 reintento en GET idempotentes ante fallo de red
//  - Errores tipados ApiError {status, code, message}
// ============================================================

import { Platform } from "react-native";
import { API_TIMEOUT_MS, getApiBaseUrl } from "../config/env";

export class ApiError extends Error {
    constructor(opts) {
        super(opts.message);
        this.name = "ApiError";
        this.status = opts.status;
        this.code = opts.code;
        this.details = opts.details;
    }
}

const TOKEN_KEY = "auth_token";
const SESSION_USER_KEY = "@faceattend:session_user";

async function readToken() {
    try {
        if (Platform.OS === "web") {
            const raw = localStorage.getItem(TOKEN_KEY);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed?.token) return parsed.token;
                } catch {
                    return raw; // token plano legacy
                }
            }
            return null;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        const raw = await AS.getItem(TOKEN_KEY);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            return parsed?.token ?? raw;
        } catch {
            return raw;
        }
    } catch {
        return null;
    }
}

function resolveBaseUrl(override) {
    if (override) return override.replace(/\/$/, "");
    if (
        typeof window !== "undefined" &&
        window.__FACEATTEND_API_URL__
    ) {
        return window.__FACEATTEND_API_URL__.replace(/\/$/, "");
    }
    return getApiBaseUrl();
}

async function fetchWithTimeout(input, init, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

function buildUrl(path, query, baseUrl) {
    const base = resolveBaseUrl(baseUrl);
    const url = new URL(path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`);
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v === undefined || v === null) continue;
            url.searchParams.set(k, String(v));
        }
    }
    return url.toString();
}

async function parseBody(res) {
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function toApiError(status, payload) {
    if (payload && typeof payload === "object") {
        const p = payload;
        return new ApiError({
            status,
            code: typeof p.error === "string" ? p.error : `HTTP_${status}`,
            message: typeof p.message === "string" && p.message ? p.message : `Error ${status}`,
            details: p.details,
        });
    }
    return new ApiError({ status, code: `HTTP_${status}`, message: `Error ${status}` });
}

function isPageEnvelope(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
    return Array.isArray(payload.data) && !!payload.meta && typeof payload.meta === "object" && "total" in payload.meta;
}

/**
 * Los endpoints de colección devuelven { data, meta }. Quien llama espera el arreglo,
 * así que se desenvuelve aquí en vez de en cada servicio.
 */
function unwrapPage(payload) {
    return isPageEnvelope(payload) ? payload.data : payload;
}

/** Petición genérica. Lanza ApiError si !ok. */
export async function request(path, opts = {}) {
    const method = opts.method ?? "GET";
    const timeoutMs = opts.timeoutMs ?? API_TIMEOUT_MS;
    const token = await readToken();
    const headers = {
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = buildUrl(path, opts.query, opts.baseUrl);
    const init = {
        method,
        headers,
        body: opts.body !== undefined && method !== "GET" ? JSON.stringify(opts.body) : undefined,
    };

    let lastErr = null;
    const attempts = opts.retryOnceOnNetworkError === false || method !== "GET" ? 1 : 2;
    for (let i = 0; i < attempts; i += 1) {
        try {
            const res = await fetchWithTimeout(url, init, timeoutMs);
            const data = await parseBody(res);
            if (!res.ok) throw toApiError(res.status, data);
            return unwrapPage(data);
        } catch (e) {
            lastErr = e;
            if (e instanceof ApiError) throw e; // no reintentar errores HTTP
            if (i === attempts - 1) break;
            await new Promise((r) => setTimeout(r, 400)); // espera antes de reintentar
        }
    }
    if (lastErr instanceof Error && lastErr.name === "AbortError") {
        throw new ApiError({ status: 0, code: "Timeout", message: "Tiempo de espera agotado" });
    }
    throw new ApiError({
        status: 0,
        code: "NetworkError",
        message: "No se pudo conectar con el backend. Verifica que el gateway :8080 esté en ejecución.",
    });
}

/** Atajo para saber si hay sesión guardada (usuario o token). */
export async function hasSession() {
    if (await readToken()) return true;
    try {
        if (Platform.OS === "web") return localStorage.getItem(SESSION_USER_KEY) !== null;
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        return (await AS.getItem(SESSION_USER_KEY)) !== null;
    } catch {
        return false;
    }
}

export const apiClient = { request, buildUrl };
