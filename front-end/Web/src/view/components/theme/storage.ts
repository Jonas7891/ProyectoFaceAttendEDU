// ============================================================
//  FaceAttend EDU — Theme Persistence
//  Persiste el modo y el accent color del usuario.
//  Funciona en React Native (AsyncStorage) y web (localStorage).
// ============================================================

import { Platform } from "react-native";
import { DEFAULT_ACCENT, DEFAULT_MODE } from "./presets";
import type { ThemeMode } from "./colourTokens";

const KEYS = {
    MODE:   "@faceattend:theme_mode",
    ACCENT: "@faceattend:accent_color",
} as const;

// ── Abstracción de storage multiplataforma ────────────────────

async function storageGet(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
        try { return localStorage.getItem(key); } catch { return null; }
    }
    // React Native — import dinámico para evitar crash en web si no está instalado
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    return AsyncStorage.getItem(key);
}

async function storageSet(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
        try { localStorage.setItem(key, value); } catch { /* silent */ }
        return;
    }
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(key, value);
}

// ── API pública ──────────────────────────────────────────────

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
    await storageSet(KEYS.MODE, mode);
}

export async function loadThemeMode(): Promise<ThemeMode> {
    const value = await storageGet(KEYS.MODE);
    return value === "dark" ? "dark" : DEFAULT_MODE;
}

export async function saveAccentColor(color: string): Promise<void> {
    await storageSet(KEYS.ACCENT, color);
}

export async function loadAccentColor(): Promise<string> {
    const value = await storageGet(KEYS.ACCENT);
    return value ?? DEFAULT_ACCENT;
}
