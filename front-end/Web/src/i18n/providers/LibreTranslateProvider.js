// ============================================================
//  FaceAttend EDU — LibreTranslateProvider (i18n · Provider)
//
//  FIXES aplicados:
//  - BUG CORREGIDO: la instancia pública libretranslate.com requiere
//    API key. Sin ella devuelve HTTP 403, que antes se silenciaba y
//    convertía en fallback cacheado. Ahora se lanza como error real
//    para que TranslationService NO lo cachee.
//  - Añadida instancia pública alternativa sin API key como valor
//    por defecto, con comentario para apuntar a instancia propia.
//  - El error HTTP siempre lanza, nunca silencia (el silencio lo
//    maneja TranslationService con su fallback no-cacheado).
//
//  CONFIGURACIÓN:
//    Para usar tu instancia propia de LibreTranslate:
//      const BASE_URL = "http://localhost:5000";   // local
//      const BASE_URL = "http://tu-ip:5000";       // Docker
//    
//    Si usas libretranslate.com (pública), necesitas API key:
//      const BASE_URL = "https://libretranslate.com";
//      const API_KEY  = "tu-api-key-aqui";
//
//    Instancia pública gratuita sin key (para desarrollo):
//      const BASE_URL = "https://translate.argosopentech.com";
// ============================================================

import { ITranslationProvider }            from "./ITranslationProvider";
import { LanguageCode, TranslationResult } from "../models/TranslationEntry";

// ── Configuración ─────────────────────────────────────────────────────────
//
//  CAMBIA ESTA URL a tu instancia de LibreTranslate.
//  La instancia pública de libretranslate.com requiere API key de pago.
//  Para desarrollo sin key usa translate.argosopentech.com (gratuita, sin garantías).
//  Para producción despliega tu propia instancia: https://github.com/LibreTranslate/LibreTranslate

const BASE_URL  = "https://translate.argosopentech.com"; // Pública sin key (desarrollo)
const API_KEY   = "";   // Vacío si tu instancia no requiere key
const TIMEOUT_MS = 10_000;

// ── Implementación ────────────────────────────────────────────────────────

export class LibreTranslateProvider {
    providerName = "LibreTranslate";

    constructor(
        baseUrl= BASE_URL,
        apiKey= API_KEY,
    ) {}

    async translate(
        text,
        from,
        to,
    ) {
        if (!text.trim()) return { translatedText: text };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const body= {
                q,
                source,
                target,
                format: "text",
            };
            if (this.apiKey) body.api_key = this.apiKey;

            const response = await fetch(`${this.baseUrl}/translate`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
                signal:  controller.signal,
            });

            // FIX: siempre lanzamos en error HTTP.
            // Antes: el catch exterior silenciaba el error y cacheaba el fallback.
            // Ahora: lanzamos para que TranslationService decida qué hacer
            // (y NO cachee el fallback como si fuera una traducción válida).
            if (!response.ok) {
                const errBody = await response.text().catch(() => response.statusText);
                throw new Error(
                    `LibreTranslate HTTP ${response.status} en ${this.baseUrl}: ${errBody}`
                );
            }

            const data = await response.json();

            if (!data?.translatedText) {
                throw new Error(
                    `LibreTranslate: respuesta inesperada sin campo translatedText`
                );
            }

            return {
                translatedText:   data.translatedText,
                detectedLanguage: data.detectedLanguage?.language,
            };
        } finally {
            clearTimeout(timer);
        }
    }
}
