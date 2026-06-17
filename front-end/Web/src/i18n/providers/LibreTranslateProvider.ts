// ============================================================
//  FaceAttend EDU — LibreTranslateProvider (i18n · Provider)
//
//  Implementa ITranslationProvider usando la API de LibreTranslate.
//  Configura LIBRETRANSLATE_URL para apuntar a tu instancia propia
//  o a una instancia pública de LibreTranslate.
//
//  La UI nunca importa este archivo.
//  Solo TranslationService lo conoce.
// ============================================================

import type { ITranslationProvider }       from "./ITranslationProvider";
import type { LanguageCode, TranslationResult } from "../models/TranslationEntry";

// ── Configuración ─────────────────────────────────────────────────────────
//  Cambia esta URL a tu instancia propia de LibreTranslate:
//    - Local:   "http://localhost:5000"
//    - Docker:  "http://192.168.x.x:5000"
//    - Pública: "https://libretranslate.com" (requiere API key)
//
//  En Expo puedes usar una variable de entorno:
//    const BASE_URL = process.env.EXPO_PUBLIC_LIBRETRANSLATE_URL ?? "https://libretranslate.com";

const BASE_URL = "https://libretranslate.com";
const API_KEY  = "";   // Dejar vacío si tu instancia no requiere API key

const TIMEOUT_MS = 8_000;

// ── Implementación ────────────────────────────────────────────────────────

export class LibreTranslateProvider implements ITranslationProvider {
    readonly providerName = "LibreTranslate";

    // Permite sobreescribir la URL en tiempo de construcción
    // (útil para tests o configuración dinámica)
    constructor(
        private readonly baseUrl: string = BASE_URL,
        private readonly apiKey: string  = API_KEY,
    ) {}

    async translate(
        text: string,
        from: LanguageCode,
        to:   LanguageCode,
    ): Promise<TranslationResult> {
        if (!text.trim()) return { translatedText: text };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const body: Record<string, string> = {
                q:      text,
                source: from,
                target: to,
                format: "text",
            };
            if (this.apiKey) body.api_key = this.apiKey;

            const response = await fetch(`${this.baseUrl}/translate`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
                signal:  controller.signal,
            });

            if (!response.ok) {
                const err = await response.text().catch(() => response.statusText);
                throw new Error(`LibreTranslate HTTP ${response.status}: ${err}`);
            }

            const data = await response.json();

            if (!data?.translatedText) {
                throw new Error("LibreTranslate: respuesta inesperada sin translatedText");
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
