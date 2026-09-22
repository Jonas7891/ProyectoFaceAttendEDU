// ============================================================
//  FaceAttend EDU — useTranslation (i18n · Hook)
//
//  Hook público de internacionalización.
//  Es el ÚNICO punto de contacto entre la UI y el sistema i18n.
//
//  La UI no conoce LibreTranslate, caché, storage ni servicios.
//  Solo usa este hook.
//
//  Uso:
//    const { t, language, setLanguage } = useTranslation();
//
//    <Text>{t("Inicio de sesión")}</Text>
//    <Text>{t("Guardar")}</Text>
//    <Button onPress={() => setLanguage("en")} />
// ============================================================

import { useLanguageContext } from "../context/LanguageContext";
import type { LanguageCode }  from "../models/TranslationEntry";
import type { SupportedLanguage } from "../constants/SupportedLanguages";
import { SUPPORTED_LANGUAGES, findLanguage } from "../constants/SupportedLanguages";

// ── Tipo del valor devuelto ───────────────────────────────────────────────

export interface UseTranslationReturn {
    /**
     * Traduce un texto del español al idioma activo.
     * Devuelve el texto en español si la traducción aún no está disponible
     * (se actualizará automáticamente en el siguiente render).
     */
    t: (text: string) => string;

    /** Código BCP-47 del idioma activo. */
    language: LanguageCode;

    /** Cambia el idioma de la aplicación y persiste la preferencia. */
    setLanguage: (code: LanguageCode) => Promise<void>;

    /** Metadatos del idioma activo (label, flag, rtl…). */
    currentLanguage: SupportedLanguage | undefined;

    /** Lista completa de idiomas disponibles. */
    supportedLanguages: SupportedLanguage[];

    /** True mientras se recupera el idioma guardado al arrancar. */
    isLoading: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useTranslation(): UseTranslationReturn {
    const { t, language, setLanguage, isLoading } = useLanguageContext();

    return {
        t,
        language,
        setLanguage,
        currentLanguage:    findLanguage(language),
        supportedLanguages: SUPPORTED_LANGUAGES,
        isLoading,
    };
}
