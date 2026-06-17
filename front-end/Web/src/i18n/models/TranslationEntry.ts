// ============================================================
//  FaceAttend EDU — TranslationEntry (i18n · Model Layer)
//  Tipos del dominio de internacionalización.
//  No importa React ni RN — puro TypeScript.
// ============================================================

/** Código BCP-47 del idioma (es, en, fr, de, …) */
export type LanguageCode = string;

/**
 * Una entrada de la caché de traducción.
 * Clave: texto fuente en español.
 * Valor: traducción al idioma destino.
 */
export interface TranslationEntry {
    source:     string;       // Texto original (español)
    target:     string;       // Traducción obtenida
    language:   LanguageCode; // Idioma de la traducción
    cachedAt:   number;       // Timestamp Unix (ms) — para TTL futuro
}

/**
 * Mapa en memoria: idioma → (textoFuente → traducción)
 * Ejemplo: { "en": { "Iniciar sesión": "Sign in" } }
 */
export type TranslationMap = Record<LanguageCode, Record<string, string>>;

/** Resultado devuelto por ITranslationProvider */
export interface TranslationResult {
    translatedText: string;
    detectedLanguage?: string;
}
