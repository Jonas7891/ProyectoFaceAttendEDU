// ============================================================
//  FaceAttend EDU — Theme Persistence
//  Persiste el modo y el accent color del usuario.
//  Funciona en React Native (AsyncStorage) y web (localStorage).
// ============================================================

import { Platform } from "react-native";
import { DEFAULT_ACCENT, DEFAULT_MODE } from "../theme/presets";

const KEYS = {
    MODE:   "@faceattend:theme_mode",
    ACCENT: "@faceattend:accent_color",
};

// ── Cache para AsyncStorage (evita re-importar) ───────────────
let AsyncStorageCache = null;

/**
 * Obtiene AsyncStorage de forma cacheada
 * @returns {Promise<AsyncStorage>} Instancia de AsyncStorage
 */
async function getAsyncStorage() {
    if (!AsyncStorageCache) {
        try {
            AsyncStorageCache = (await import("@react-native-async-storage/async-storage")).default;
        } catch (error) {
            console.error("[themeStorage] Failed to import AsyncStorage:", error);
            return null;
        }
    }
    return AsyncStorageCache;
}

// ── Abstracción de storage multiplataforma ────────────────────

/**
 * Lee un valor del storage
 * @param {string} key - Clave a leer
 * @returns {Promise<string|null>} Valor almacenado o null
 */
async function storageGet(key) {
    if (Platform.OS === "web") {
        try { 
            return localStorage.getItem(key); 
        } catch (error) { 
            console.warn(`[themeStorage] Failed to read from localStorage (key: ${key}):`, error);
            return null; 
        }
    }
    
    // React Native
    const AsyncStorage = await getAsyncStorage();
    if (!AsyncStorage) return null;
    
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.warn(`[themeStorage] Failed to read from AsyncStorage (key: ${key}):`, error);
        return null;
    }
}

/**
 * Guarda un valor en el storage
 * @param {string} key - Clave a guardar
 * @param {string} value - Valor a guardar
 * @returns {Promise<void>}
 */
async function storageSet(key, value) {
    if (Platform.OS === "web") {
        try { 
            localStorage.setItem(key, value); 
        } catch (error) { 
            console.warn(`[themeStorage] Failed to write to localStorage (key: ${key}):`, error);
        }
        return;
    }
    
    // React Native
    const AsyncStorage = await getAsyncStorage();
    if (!AsyncStorage) return;
    
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.warn(`[themeStorage] Failed to write to AsyncStorage (key: ${key}):`, error);
    }
}

// ── API pública ──────────────────────────────────────────────

/**
 * Guarda el modo de tema (light/dark)
 * @param {string} mode - "light" o "dark"
 * @returns {Promise<void>}
 */
export async function saveThemeMode(mode) {
    await storageSet(KEYS.MODE, mode);
}

/**
 * Carga el modo de tema guardado
 * @returns {Promise<string>} "light" o "dark"
 */
export async function loadThemeMode() {
    const value = await storageGet(KEYS.MODE);
    return value === "dark" ? "dark" : DEFAULT_MODE;
}

/**
 * Guarda el color de acento
 * @param {string} color - Color en formato hexadecimal (#RRGGBB)
 * @returns {Promise<void>}
 */
export async function saveAccentColor(color) {
    await storageSet(KEYS.ACCENT, color);
}

/**
 * Carga el color de acento guardado
 * @returns {Promise<string>} Color hexadecimal
 */
export async function loadAccentColor() {
    const value = await storageGet(KEYS.ACCENT);
    return value ?? DEFAULT_ACCENT;
}
