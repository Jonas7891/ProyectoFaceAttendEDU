// ============================================================
//  FaceAttend EDU — JsonTranslationProvider (i18n · Provider)
//
//  IMPLEMENTACIÓN PROVISIONAL — fase de entrega.
//
//  Implementa ITranslationProvider usando archivos JSON estáticos
//  en lugar de llamadas HTTP a LibreTranslate.
//
//  Por qué existe este archivo:
//  - LibreTranslateProvider sigue intacto para producción futura.
//  - LanguageContext puede alternar entre providers sin tocar la UI.
//  - La interfaz ITranslationProvider garantiza compatibilidad total.
//
//  Para reactivar LibreTranslate en el futuro:
//    En LanguageContext.tsx cambiar la importación de proveedor y
//    volver al patrón asíncrono con bump(). Sin cambios en la UI.
//
//  Agregar un idioma nuevo:
//    1. Crear src/i18n/translations/<codigo>.json
//    2. Registrarlo en JsonDictionary.ts.
//    3. Añadir entrada en SUPPORTED_LANGUAGES (SupportedLanguages.ts).
// ============================================================

import type { ITranslationProvider }            from "./ITranslationProvider";
import type { LanguageCode, TranslationResult } from "../models/TranslationEntry";
import { getDictionary }                        from "../translations/JsonDictionary";

// ── Implementación ────────────────────────────────────────────

export class JsonTranslationProvider implements ITranslationProvider {
    readonly providerName = "JsonTranslationProvider";

    /**
     * Traduce un texto buscándolo en el JSON del idioma destino.
     * Si no existe la key, devuelve el texto original (español).
     *
     * La promesa siempre resuelve — nunca rechaza, porque los JSON
     * están en bundle. Esto mantiene compatibilidad con la interfaz
     * async de ITranslationProvider sin penalización de red.
     */
    async translate(
        text: string,
        _from: LanguageCode,
        to: LanguageCode,
    ): Promise<TranslationResult> {
        const dict = getDictionary(to);

        if (!dict) {
            // Idioma no disponible en JSON → fallback al texto original
            return { translatedText: text };
        }

        return {
            translatedText: dict[text] ?? text,
        };
    }
}

export const jsonTranslationProvider = new JsonTranslationProvider();
