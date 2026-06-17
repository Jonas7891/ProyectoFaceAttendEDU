// ============================================================
//  FaceAttend EDU — SupportedLanguages (i18n · Constants)
//
//  Para AGREGAR un idioma nuevo:
//    1. Añade una entrada al array SUPPORTED_LANGUAGES.
//    2. Eso es todo. Sin archivos nuevos, sin JSON, sin mapas.
//
//  El número de archivos del sistema i18n NO crece con los idiomas.
// ============================================================

import type { LanguageCode } from "../models/TranslationEntry";

export interface SupportedLanguage {
    code:        LanguageCode; // BCP-47 / LibreTranslate code
    label:       string;       // Nombre en su propio idioma
    labelES:     string;       // Nombre en español (para mostrar en UI española)
    flag:        string;       // Emoji de bandera (decorativo)
    rtl?:        boolean;      // true si el idioma es de derecha a izquierda
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    { code: "es", label: "Español",    labelES: "Español",   flag: "🇪🇸" },
    { code: "en", label: "English",    labelES: "Inglés",    flag: "🇺🇸" },
    { code: "fr", label: "Français",   labelES: "Francés",   flag: "🇫🇷" },
    { code: "de", label: "Deutsch",    labelES: "Alemán",    flag: "🇩🇪" },
    { code: "it", label: "Italiano",   labelES: "Italiano",  flag: "🇮🇹" },
    { code: "pt", label: "Português",  labelES: "Portugués", flag: "🇧🇷" },
    { code: "ja", label: "日本語",      labelES: "Japonés",   flag: "🇯🇵" },
    { code: "ko", label: "한국어",      labelES: "Coreano",   flag: "🇰🇷" },
    { code: "zh", label: "中文",        labelES: "Chino",     flag: "🇨🇳" },
];

/** Idioma fuente de la aplicación. Siempre español. */
export const SOURCE_LANGUAGE: LanguageCode = "es";

/** Idioma por defecto al iniciar si no hay preferencia guardada. */
export const DEFAULT_LANGUAGE: LanguageCode = "es";

/** Lookup rápido por código */
export function findLanguage(code: LanguageCode): SupportedLanguage | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
}
