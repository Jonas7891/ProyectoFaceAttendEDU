// ============================================================
//  FaceAttend EDU — Cliente HTTP central (fetch + interceptores)
//
//  Toda petición al backend pasa por aquí:
//  - Base URL del gateway Kong (EXPO_PUBLIC_API_URL)
//  - Token Bearer automático desde la sesión guardada
//    { token, savedAt, expiresAt, email } (localStorage en web, AsyncStorage en nativo)
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

async function readRaw(key) {
    try {
        if (Platform.OS === "web") return localStorage.getItem(key);
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        return await AS.getItem(key);
    } catch {
        return null;
    }
}

async function writeRaw(key, value) {
    try {
        if (Platform.OS === "web") {
            localStorage.setItem(key, value);
            return true;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        await AS.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

async function removeRaw(key) {
    try {
        if (Platform.OS === "web") {
            localStorage.removeItem(key);
            return true;
        }
        const AS = (await import("@react-native-async-storage/async-storage")).default;
        await AS.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

/**
 * Forma compartida con Mobile: { token, savedAt, expiresAt, email }.
 * @returns el token o null si no hay sesión o si ya expiró.
 */
export async function getToken() {
    const raw = await readRaw(TOKEN_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed?.token) return null;
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            await clearToken();
            return null;
        }
        return parsed.token;
    } catch {
        return raw; // token plano legacy
    }
}

export async function saveToken(token, { email = null, expiresAt = null } = {}) {
    if (!token || typeof token !== "string") return false;
    return writeRaw(
        TOKEN_KEY,
        JSON.stringify({ token, savedAt: Date.now(), expiresAt: expiresAt ?? null, email })
    );
}

export async function clearToken() {
    return removeRaw(TOKEN_KEY);
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
    const token = await getToken();
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
            return opts.unwrap === false ? data : unwrapPage(data);
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

/**
 * Recorre todas las páginas de un endpoint paginado y devuelve un solo arreglo.
 * - by "page":   query { page, limit }   (ms-identity)
 * - by "offset": query { limit, offset } (ms-academic)
 *
 * Las páginas NO se piden en serie: con 1.700 personas eran 17 viajes de ida y vuelta
 * encadenados. Si la respuesta trae envelope { data, meta } se usa meta.total para pedir
 * las páginas restantes de una vez; si llega un arreglo desnudo (ms-academic) se avanza
 * en ventanas de `concurrency` hasta dar con una página incompleta.
 *
 * Corta con una página incompleta, vacía o al llegar a maxPages.
 */
export async function fetchAllPages(path, query = {}, opts = {}) {
    const { by = "offset", pageSize = 100, maxPages = 50, concurrency = 6 } = opts;

    const pagingFor = (index) =>
        by === "page"
            ? { page: index + 1, limit: pageSize }
            : { limit: pageSize, offset: index * pageSize };

    // unwrap: false para poder leer meta.total; el envelope se desarma aquí.
    const fetchPage = async (index) => {
        const payload = await request(path, {
            method: "GET",
            query: { ...query, ...pagingFor(index) },
            unwrap: false,
        });
        const items = isPageEnvelope(payload) ? payload.data : payload;
        return {
            items: Array.isArray(items) ? items : [],
            total: isPageEnvelope(payload) ? Number(payload.meta.total) : null,
        };
    };

    const first = await fetchPage(0);
    if (first.items.length < pageSize) return first.items;

    // Más filas que el límite pedido = el endpoint no pagina (ms-scheduling ignora
    // limit/offset). Seguir pidiendo páginas devolvía la MISMA lista maxPages veces:
    // 50 peticiones y 50 copias de las mismas filas en el arreglo final.
    if (first.items.length > pageSize) return first.items;

    const all = [...first.items];

    // Camino rápido: el backend dijo cuántas filas hay, así que se sabe exactamente
    // cuántas páginas faltan y se piden todas juntas (en tandas de `concurrency`).
    if (Number.isFinite(first.total)) {
        const lastPage = Math.min(Math.ceil(first.total / pageSize), maxPages);
        for (let from = 1; from < lastPage; from += concurrency) {
            const indexes = [];
            for (let i = from; i < Math.min(from + concurrency, lastPage); i += 1) indexes.push(i);
            const pages = await Promise.all(indexes.map(fetchPage));
            for (const page of pages) all.push(...page.items);
        }
        return all;
    }

    // Sin total: ventanas en paralelo, cortando en la primera página incompleta.
    for (let from = 1; from < maxPages; from += concurrency) {
        const indexes = [];
        for (let i = from; i < Math.min(from + concurrency, maxPages); i += 1) indexes.push(i);
        const pages = await Promise.all(indexes.map(fetchPage));
        for (const page of pages) {
            all.push(...page.items);
            if (page.items.length < pageSize) return all;
        }
    }
    return all;
}

/** Atajo para saber si hay sesión guardada (usuario o token). */
export async function hasSession() {
    if (await getToken()) return true;
    return (await readRaw(SESSION_USER_KEY)) !== null;
}

export const apiClient = { request, buildUrl };
