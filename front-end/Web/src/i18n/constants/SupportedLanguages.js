// ============================================================
//  FaceAttend EDU — SupportedLanguages (i18n · Constants)
//
//  MODO PROVISIONAL — Español, Inglés, Francés y Alemán disponibles desde JSON.
//
//  Los demás idiomas están comentados y listos para activarse
//  cuando se implemente el proveedor de traducción automática
//  (LibreTranslate u otro).
//
//  Para AGREGAR un idioma con JSON estático:
//    1. Crear src/i18n/translations/.json
//    2. Registrarlo en JsonDictionary.ts (import + entrada en DICTIONARIES).
//    3. Descomentar (o añadir) su entrada en SUPPORTED_LANGUAGES.
//
//  Para REACTIVAR traducción automática (LibreTranslate):
//    1. Descomentar todos los idiomas en SUPPORTED_LANGUAGES.
//    2. Restaurar el proveedor en LanguageContext.tsx.
//    3. Sin cambios en la UI.
// ============================================================

// ── Idiomas activos (fase provisional) ───────────────────────
//
//  Solo los idiomas con archivo JSON en src/i18n/translations/
//  y entrada en JsonDictionary.ts deben estar descomentados.

export const SUPPORTED_LANGUAGES = [
    { code: "es", label: "Español",   labelES: "Español",   flag: "🇪🇸" },
    { code: "en", label: "English",   labelES: "Inglés",    flag: "🇺🇸" },
    { code: "fr", label: "Français",  labelES: "Francés",   flag: "🇫🇷" },
    { code: "de", label: "Deutsch",   labelES: "Alemán",    flag: "🇩🇪" },
    { code: "pt", label: "Português", labelES: "Portugués", flag: "🇧🇷" },

    // ── Idiomas para fase de producción (requieren JSON o LibreTranslate) ──
    //
    // { code: "it", label: "Italiano",  labelES: "Italiano",  flag: "🇮🇹" },
    // { code: "ja", label: "日本語",    labelES: "Japonés",   flag: "🇯🇵" },
    // { code: "ko", label: "한국어",    labelES: "Coreano",   flag: "🇰🇷" },
    // { code: "zh", label: "中文",      labelES: "Chino",     flag: "🇨🇳" },
];

/** Idioma fuente de la aplicación. Siempre español. */
export const SOURCE_LANGUAGE = "es";

/** Idioma por defecto al iniciar si no hay preferencia guardada. */
export const DEFAULT_LANGUAGE = "es";

/** Lookup rápido por código */
export function findLanguage(code) {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
}
