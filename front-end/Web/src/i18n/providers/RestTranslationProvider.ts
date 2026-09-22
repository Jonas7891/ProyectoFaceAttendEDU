// ============================================================
//  FaceAttend EDU — RestTranslationProvider (i18n · Provider)
//
//  Proveedor HTTP abstracto de traducción.
//  Consume cualquier endpoint REST compatible con el contrato:
//
//    POST <BASE_URL>/translate
//    Content-Type: application/json
//    Body:  { "q": "texto", "source": "es", "target": "en" }
//    Resp:  { "translatedText": "text" }
//
//  Configuración:
//    Cambia BASE_URL a la URL de tu API de traducción propia.
//    Si tu API requiere autenticación, añade las cabeceras en el
//    objeto HEADERS o pasa apiKey al constructor.
//
//  Ejemplos de backends compatibles:
//    - Instancia propia de LibreTranslate (self-hosted)
//    - Wrapper propio sobre DeepL / OpenAI / Google Translate
//    - Cualquier microservicio que siga el mismo contrato JSON
//
//  El frontend no conoce el backend concreto.
//  Solo consume este contrato HTTP.
// ============================================================

import type { ITranslationProvider }            from "./ITranslationProvider";
import type { LanguageCode, TranslationResult } from "../models/TranslationEntry";

// ── Configuración ─────────────────────────────────────────────────────────
//
//  Cambia BASE_URL a la URL de tu API REST de traducción.
//  Deja vacío o apunta a localhost durante desarrollo si aún no tienes backend.

const BASE_URL   = "http://localhost:5000"; // URL de tu API de traducción
const API_KEY    = "";                       // Clave de API si tu backend la requiere
const TIMEOUT_MS = 10_000;

// ── Implementación ────────────────────────────────────────────────────────

export class RestTranslationProvider implements ITranslationProvider {
    readonly providerName = "RestTranslationProvider";

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

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;

            const response = await fetch(`${this.baseUrl}/translate`, {
                method:  "POST",
                headers,
                body:    JSON.stringify(body),
                signal:  controller.signal,
            });

            if (!response.ok) {
                const errBody = await response.text().catch(() => response.statusText);
                throw new Error(
                    `[RestTranslationProvider] HTTP ${response.status} desde ${this.baseUrl}: ${errBody}`
                );
            }

            const data = await response.json();

            if (!data?.translatedText) {
                throw new Error(
                    `[RestTranslationProvider] Respuesta inesperada: falta el campo translatedText`
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
