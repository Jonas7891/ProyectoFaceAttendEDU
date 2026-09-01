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
//    {t("Inicio de sesión")}</Text>
//    {t("Guardar")}</Text>
//    <Button onPress={() => setLanguage("en")} />
// ============================================================

import { useLanguageContext } from "../context/LanguageContext";
import { SUPPORTED_LANGUAGES, findLanguage } from "../constants/SupportedLanguages";

// ── Tipo del valor devuelto ───────────────────────────────────────────────

// ── Hook ──────────────────────────────────────────────────────────────────

export function useTranslation() {
    const { t, language, setLanguage, isLoading } = useLanguageContext();

    return {
        t,
        language,
        setLanguage,
        currentLanguage: findLanguage(language),
        supportedLanguages: SUPPORTED_LANGUAGES,
        isLoading,
    };
}
