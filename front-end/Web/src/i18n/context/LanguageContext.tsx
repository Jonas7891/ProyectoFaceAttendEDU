// ============================================================
//  FaceAttend EDU — LanguageContext (i18n · Context)
//
//  Contexto global de idioma.
//  Patrón idéntico a ThemeContext para coherencia arquitectónica.
//
//  Responsabilidades:
//  - Cargar el idioma guardado al arrancar
//  - Exponer el idioma activo y la función setLanguage
//  - Hidratar TranslationService al cambiar de idioma
//  - Notificar a toda la app cuando el idioma cambia
//
//  Uso:
//    const { t, language, setLanguage } = useTranslation();
// ============================================================

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { translationService }        from "../services/TranslationService";
import { LanguageStorage }           from "../storage/LanguageStorage";
import { SOURCE_LANGUAGE, DEFAULT_LANGUAGE } from "../constants/SupportedLanguages";
import type { LanguageCode }          from "../models/TranslationEntry";

// ── Tipos del contexto ────────────────────────────────────────────────────

interface LanguageContextValue {
    /** Código BCP-47 del idioma activo ("es", "en", "fr", …) */
    language: LanguageCode;

    /** Cambia el idioma de la app y persiste la preferencia. */
    setLanguage: (code: LanguageCode) => Promise<void>;

    /**
     * Traduce un texto del español al idioma activo.
     *
     * - Si el idioma activo es "es", devuelve el texto sin tocar la red.
     * - Si existe en caché, devuelve instantáneamente.
     * - Si no existe, retorna el texto en español mientras se carga
     *   y activa un re-render una vez disponible la traducción.
     *
     * Ejemplo:
     *   const { t } = useTranslation();
     *   <Text>{t("Inicio de sesión")}</Text>
     */
    t: (text: string) => string;

    /** True mientras se carga el idioma inicial desde el storage. */
    isLoading: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextValue>({
    language:    DEFAULT_LANGUAGE,
    setLanguage: async () => {},
    t:           (text) => text,
    isLoading:   true,
});

// ── Provider ──────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language,  setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
    const [isLoading, setIsLoading]     = useState(true);

    // Mapa en memoria para traducciones ya resueltas en esta sesión.
    // Indexado por idioma para limpiar al cambiar idioma sin pérdida.
    // Usamos un ref de Map para no causar re-renders en cada actualización.
    const resolvedRef = useRef<Map<string, string>>(new Map());

    // Trigger de re-render cuando llegan nuevas traducciones asíncronas
    const [tick, setTick] = useState(0);
    const bump = useCallback(() => setTick(n => n + 1), []);

    // ── Inicialización ───────────────────────────────────────────────

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const saved = await LanguageStorage.load();
            if (cancelled) return;

            if (saved !== SOURCE_LANGUAGE) {
                await translationService.hydrate(saved);
            }

            if (!cancelled) {
                setLanguageState(saved);
                setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    // ── Cambio de idioma ─────────────────────────────────────────────

    const setLanguage = useCallback(async (code: LanguageCode) => {
        if (code === language) return;

        // Limpiar traducciones resueltas del idioma anterior
        resolvedRef.current.clear();

        // Hidratar el nuevo idioma (carga storage → caché en memoria)
        if (code !== SOURCE_LANGUAGE) {
            await translationService.hydrate(code);
        }

        setLanguageState(code);
        await LanguageStorage.save(code);

        // Forzar re-render para que todos los `t()` se re-evalúen
        bump();
    }, [language, bump]);

    // ── Función t() ──────────────────────────────────────────────────

    const t = useCallback((text: string): string => {
        if (!text || language === SOURCE_LANGUAGE) return text;

        // ¿Ya está resuelta en esta sesión para este idioma?
        const key = text; // La clave es el propio texto español
        if (resolvedRef.current.has(key)) {
            return resolvedRef.current.get(key)!;
        }

        // Lanzar traducción asíncrona sin bloquear el render
        translationService.translate(text, language).then(translated => {
            if (translated !== text || language !== SOURCE_LANGUAGE) {
                resolvedRef.current.set(key, translated);
                bump(); // Re-render para mostrar la traducción
            }
        });

        // Devolver el texto en español mientras llega la traducción
        // (el componente re-renderizará cuando esté lista)
        return text;
    }, [language, bump]);

    // ── Valor del contexto ───────────────────────────────────────────

    const value = useMemo<LanguageContextValue>(
        () => ({ language, setLanguage, t, isLoading }),
        // tick causa que `t` se reconstruya cuando llegan traducciones
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [language, setLanguage, isLoading, tick],
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

// ── Hook de acceso al contexto ────────────────────────────────────────────

export function useLanguageContext(): LanguageContextValue {
    return useContext(LanguageContext);
}

export { LanguageContext };
