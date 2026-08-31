// ============================================================
//  FaceAttend EDU � TranslationStorage (i18n � Storage)
//
//  Persiste el diccionario de traducciones obtenidas de LibreTranslate.
//  As� las traducciones sobreviven entre reinicios de la app.
//  Usa localStorage en web y AsyncStorage en mobile.
//
//  Estructura en storage:
//    faceattend_translations_en  ?  JSON { "Guardar": "Save", � }
//    faceattend_translations_fr  ?  JSON { "Guardar": "Enregistrer", � }
//
//  Una key por idioma, aislado, f�cil de limpiar.
// ============================================================

import { Platform } from "react-native";
const PREFIX = "faceattend_translations_";

// -- Abstracci�n de almacenamiento -----------------------------------------

async function storageGet(key) {
    if (Platform.OS === "web") {
        return localStorage.getItem(key);
    }
    const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
    );
    return AsyncStorage.getItem(key);
}

async function storageSet(key, value) {
    if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
    }
    const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
    );
    await AsyncStorage.setItem(key, value);
}

async function storageRemove(key) {
    if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
    }
    const { default: AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
    );
    await AsyncStorage.removeItem(key);
}

// -- API p�blica -----------------------------------------------------------

export const TranslationStorage = {
    /**
     * Carga el diccionario persistido para un idioma.
     * Devuelve un Record vac�o si no hay nada guardado.
     */
    async load(language) {
        try {
            const raw = await storageGet(PREFIX + language);
            if (!raw) return {};
            return JSON.parse(raw);
        } catch {
            return {};
        }
    },

    /**
     * Persiste el diccionario completo de un idioma.
     * Reemplaza el valor existente (merge lo hace TranslationCache).
     */
    async save(
        language,
        entries,
    ) {
        try {
            await storageSet(PREFIX + language, JSON.stringify(entries));
        } catch (e) {
            console.warn(`[TranslationStorage] No se pudo guardar traducciones (${language}):`, e);
        }
    },

    /**
     * Elimina las traducciones de un idioma (por ejemplo, al forzar re-traducci�n).
     */
    async clear(language) {
        try {
            await storageRemove(PREFIX + language);
        } catch { /* silent */ }
    },
};
