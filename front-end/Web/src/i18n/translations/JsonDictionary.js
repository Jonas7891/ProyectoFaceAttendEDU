// ============================================================
//  FaceAttend EDU — JsonDictionary (i18n · Translations)
//
//  Punto único de acceso síncrono a los diccionarios JSON.
//
//  Por qué existe este módulo:
//  - ITranslationProvider es asíncrono por contrato (pensado para HTTP).
//  - En modo provisional necesitamos t() SÍNCRONO para evitar flash.
//  - Este módulo expone lookup() síncrono O(1) directamente sobre
//    los objetos JSON importados estáticamente.
//
//  JsonTranslationProvider y LanguageContext comparten este módulo.
//  Al reactivar LibreTranslate, LanguageContext deja de usarlo y
//  este archivo queda como utilidad sin impacto en la app.
//
//  Agregar un idioma:
//    1. Crear src/i18n/translations/.json
//    2. Importarlo aquí y añadirlo al mapa DICTIONARIES.
//    3. Añadir la entrada en SupportedLanguages.ts.
// ============================================================

import esTranslations from "./es.json";
import enTranslations from "./en.json";
import frTranslations from "./fr.json";
import deTranslations from "./de.json";
import ptTranslations from "./pt.json";

// ── Mapa de diccionarios ──────────────────────────────────────
//
//  Clave = código BCP-47 del idioma.
//  Valor = Record.

const DICTIONARIES= {
    es,
    en,
    fr,
    de,
    pt,
};

// ── API pública ───────────────────────────────────────────────

/**
 * Devuelve la traducción de un texto para un idioma dado.
 * Si el idioma no tiene JSON o la key no existe, devuelve el texto original.
 *
 * Se intenta primero una coincidencia exacta y luego una normalizada (NFC)
 * para cubrir posibles diferencias de codificación Unicode entre el texto
 * del componente y la clave del JSON.
 *
 * @param text     Texto en español (clave del diccionario).
 * @param language Código BCP-47 del idioma destino.
 * @returns        Traducción o el texto original como fallback.
 */
export function lookup(text, language) {
    if (!text) return text;
    const dict = DICTIONARIES[language];
    if (!dict) return text;

    // Intento 1: coincidencia exacta (caso normal, O(1))
    if (text in dict) return dict[text];

    // Intento 2: normalización NFC (cubre diferencias de codificación Unicode)
    const normalized = text.normalize("NFC");
    if (normalized in dict) return dict[normalized];

    // Fallback: texto original (español)
    return text;
}

/**
 * True si el idioma tiene diccionario JSON disponible.
 */
export function hasLanguage(language) {
    return language in DICTIONARIES;
}

/**
 * Devuelve el diccionario completo de un idioma.
 * Usado por JsonTranslationProvider.
 */
export function getDictionary(language) {
    return DICTIONARIES[language] ?? null;
}
