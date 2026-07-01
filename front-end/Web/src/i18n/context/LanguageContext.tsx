// ============================================================
//  FaceAttend EDU — LanguageContext (i18n · Context)
//
//  MODO PROVISIONAL — traducciones desde archivos JSON estáticos.
//
//  ┌─ Qué cambió respecto a la versión original ──────────────┐
//  │                                                           │
//  │  • t() ahora es SÍNCRONO: lee de JsonDictionary que      │
//  │    tiene los JSON ya en memoria (bundle estático).        │
//  │    Sin flash de contenido en español, sin re-renders      │
//  │    asíncronos, sin llamadas HTTP.                         │
//  │                                                           │
//  │  • Se eliminó temporalmente el patrón resolvedRef/bump()  │
//  │    (solo necesario para fuentes asíncronas).              │
//  │                                                           │
//  │  • translationService, TranslationCache y                 │
//  │    TranslationStorage siguen en el proyecto intactos.     │
//  │                                                           │
//  └───────────────────────────────────────────────────────────┘
//
//  ┌─ Cómo reactivar LibreTranslate en el futuro ─────────────┐
//  │                                                           │
//  │  1. Quitar el import de JsonDictionary / lookup().        │
//  │  2. Descomentar el import de translationService.          │
//  │  3. Restaurar resolvedRef, bump() y el patrón async       │
//  │     en t() (ver comentarios inline).                      │
//  │  4. Sin ningún cambio en la UI ni en useTranslation().    │
//  │                                                           │
//  └───────────────────────────────────────────────────────────┘
//
//  API pública (sin cambios):
//    const { t, language, setLanguage, isLoading } = useLanguageContext();
// ============================================================

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

// ── Arquitectura original — mantenida, desacoplada temporalmente ──────────
//
//  Descomentar en el futuro para reactivar LibreTranslate:
//
// import { translationService } from "../services/TranslationService";
//
//  (TranslationService, TranslationCache y TranslationStorage
//   permanecen en disco intactos, listos para ser reactivados.)

import { LanguageStorage }                   from "../storage/LanguageStorage";
import { SOURCE_LANGUAGE, DEFAULT_LANGUAGE } from "../constants/SupportedLanguages";
import type { LanguageCode }                 from "../models/TranslationEntry";

// ── MODO PROVISIONAL: lookup síncrono desde JSON en bundle ────────────────

import { lookup } from "../translations/JsonDictionary";

// ── Tipos del contexto ────────────────────────────────────────────────────

interface LanguageContextValue {
    /** Código BCP-47 del idioma activo ("es", "en", …) */
    language: LanguageCode;

    /** Cambia el idioma de la app y persiste la preferencia. */
    setLanguage: (code: LanguageCode) => Promise<void>;

    /**
     * Traduce un texto del español al idioma activo.
     *
     * MODO PROVISIONAL: síncrono, O(1), sin re-renders adicionales.
     * MODO PRODUCCIÓN (futuro): asíncrono con fallback al español
     * mientras llega la traducción de la red + bump() para re-render.
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

    // ── Inicialización ───────────────────────────────────────────────
    //
    //  Lee el idioma guardado en storage al arrancar.
    //
    //  MODO PRODUCCIÓN (futuro) — descomentar:
    //    if (saved !== SOURCE_LANGUAGE) {
    //        await translationService.hydrate(saved);
    //    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const saved = await LanguageStorage.load();
            if (cancelled) return;

            setLanguageState(saved);
            setIsLoading(false);
        })();

        return () => { cancelled = true; };
    }, []);

    // ── Cambio de idioma ─────────────────────────────────────────────
    //
    //  MODO PRODUCCIÓN (futuro) — descomentar:
    //    if (code !== SOURCE_LANGUAGE) {
    //        await translationService.hydrate(code);
    //    }

    const setLanguage = useCallback(async (code: LanguageCode) => {
        if (code === language) return;
        setLanguageState(code);
        await LanguageStorage.save(code);
    }, [language]);

    // ── Función t() — SÍNCRONA en modo provisional ───────────────────
    //
    //  Lee directamente del objeto JSON importado en bundle.
    //  O(1), sin efectos secundarios, sin re-renders adicionales.
    //
    //  MODO PRODUCCIÓN (futuro) — restaurar:
    //    const resolvedRef = useRef<Map<string, string>>(new Map());
    //    const [tick, setTick] = useState(0);
    //    const bump = useCallback(() => setTick(n => n + 1), []);
    //
    //    const t = useCallback((text: string): string => {
    //        if (!text || language === SOURCE_LANGUAGE) return text;
    //        const key = text;
    //        if (resolvedRef.current.has(key)) return resolvedRef.current.get(key)!;
    //        translationService.translate(text, language).then(translated => {
    //            resolvedRef.current.set(key, translated);
    //            bump();
    //        });
    //        return text; // fallback al español mientras carga
    //    }, [language, bump]);

    const t = useCallback((text: string): string => {
        if (!text || language === SOURCE_LANGUAGE) return text;
        return lookup(text, language);
    }, [language]);

    // ── Valor del contexto ───────────────────────────────────────────

    const value = useMemo<LanguageContextValue>(
        () => ({ language, setLanguage, t, isLoading }),
        [language, setLanguage, t, isLoading],
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
