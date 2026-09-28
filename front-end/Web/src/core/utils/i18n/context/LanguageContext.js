// ============================================================
//  FaceAttend EDU — LanguageContext (i18n · Context)
//
//  Context de traducción con LoadingView como flujo alternativo.
//
//  FLUJO AL CAMBIAR IDIOMA:
//    1. isPreparingTranslations = true → LoadingView aparece
//    2. Preparar TODAS las traducciones necesarias
//    3. Aplicar cambio de idioma
//    4. isPreparingTranslations = false → View normal
//
//  API pública:
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

import { translationService } from "../services/TranslationService";
import { LanguageStorage } from "../storage/LanguageStorage";
import { SOURCE_LANGUAGE, DEFAULT_LANGUAGE } from "../constants/SupportedLanguages";

// ── Context ───────────────────────────────────────────────────────────────

const LanguageContext = createContext({
    language: DEFAULT_LANGUAGE,
    setLanguage: async () => {},
    t: (text) => text,
    isLoading: true,
    isPreparingTranslations: false,
});

// ── Provider ──────────────────────────────────────────────────────────────

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
    const [isLoading, setIsLoading] = useState(true);
    const [isPreparingTranslations, setIsPreparingTranslations] = useState(false);

    // ── Inicialización ───────────────────────────────────────────────

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const saved = await LanguageStorage.load();
            if (cancelled) return;

            // Hidratar traducciones si el idioma no es español
            if (saved !== SOURCE_LANGUAGE) {
                await translationService.hydrate(saved);
            }

            setLanguageState(saved);
            setIsLoading(false);
        })();

        return () => { cancelled = true; };
    }, []);

    // ── Verificar y preparar traducciones de View actual ──────────────

    const checkAndPrepareTranslations = useCallback(async () => {
        // Solo verificar si ya cargó y no es español
        if (isLoading || language === SOURCE_LANGUAGE) return;
        
        // Usar requestAnimationFrame para esperar al próximo frame (después del render)
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const activeTexts = translationService.getActiveTexts();
        
        if (activeTexts.length === 0) return;
        
        // Verificar cuántos textos faltan traducir
        const missing = activeTexts.filter(text => {
            const cached = translationService.getCached(text, language);
            return cached === text; // Si devuelve lo mismo, falta traducción
        });
        
        if (missing.length > 0) {
            console.log(`[LanguageContext] View actual necesita ${missing.length} traducciones`);
            
            setIsPreparingTranslations(true);
            
            try {
                await translationService.prepareTranslations(missing, language);
            } catch (error) {
                console.error('[LanguageContext] Error preparando traducciones:', error);
            } finally {
                setIsPreparingTranslations(false);
            }
        }
        
        // Limpiar tracking para la próxima View
        translationService.clearTracking();
        
    }, [language, isLoading]);

    // ── Cambio de idioma ─────────────────────────────────────────────

    const setLanguage = useCallback(async (code) => {
        if (code === language) return;
        
        console.log(`[LanguageContext] Cambio de idioma: ${language} → ${code}`);
        
        // PASO 1: Mostrar LoadingView INMEDIATAMENTE
        setIsPreparingTranslations(true);
        
        try {
            // PASO 2: Hidratar del storage (traducciones guardadas)
            if (code !== SOURCE_LANGUAGE) {
                await translationService.hydrate(code);
            }
            
            // PASO 3: Preparar traducciones de textos actualmente en uso
            if (code !== SOURCE_LANGUAGE) {
                console.log(`[LanguageContext] Preparando traducciones para textos activos...`);
                await translationService.prepareCurrentTexts(code);
                console.log(`[LanguageContext] ✓ Traducciones listas`);
            }
            
            // PASO 4: SOLO AHORA cambiar el idioma (esto dispara re-render)
            console.log(`[LanguageContext] Aplicando idioma ${code}`);
            setLanguageState(code);
            await LanguageStorage.save(code);
            
        } catch (error) {
            console.error('[LanguageContext] Error cambiando idioma:', error);
            // Aplicar cambio aunque falle
            setLanguageState(code);
            await LanguageStorage.save(code);
        } finally {
            // PASO 5: Ocultar LoadingView
            console.log(`[LanguageContext] LoadingView oculta, mostrando View normal`);
            setIsPreparingTranslations(false);
        }
    }, [language]);

    // ── Función t() — SÍNCRONA ───────────────────────────────────────

    const t = useCallback((text) => {
        if (!text) return text;
        return translationService.getCached(text, language);
    }, [language]);

    // ── Valor del contexto ───────────────────────────────────────────

    const value = useMemo(
        () => ({ 
            language, 
            setLanguage,
            checkAndPrepareTranslations,
            t, 
            isLoading,
            isPreparingTranslations,
        }),
        [language, setLanguage, checkAndPrepareTranslations, t, isLoading, isPreparingTranslations],
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

// ── Hook de acceso al contexto ────────────────────────────────────────────

export function useLanguageContext() {
    return useContext(LanguageContext);
}

export { LanguageContext };
