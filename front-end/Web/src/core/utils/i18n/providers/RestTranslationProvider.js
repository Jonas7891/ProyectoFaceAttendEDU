// ============================================================
//  FaceAttend EDU — RestTranslationProvider (i18n · Provider)
//
//  Proveedor HTTP para el microservicio fae-translation-service.
//  Consume el endpoint de traducción con Argos Translate.
//
//  Contrato REAL del microservicio:
//
//    POST http://localhost:8000/translate
//    Content-Type: application/json
//    Body:  { "text": "...", "source": "es", "target": "en" }
//    Resp:  { "translatedText": "..." }
//
//  Configuración:
//    BASE_URL = URL base del microservicio (sin /translate al final)
//    El endpoint /translate se añade automáticamente en fetch()
//
//  Ejemplos:
//    - Desarrollo local: http://localhost:8000
//    - Docker: http://fae-translation-service:8000
//    - Producción: https://api.tudominio.com
// ============================================================

// Este archivo implementa el proveedor REST para fae-translation-service.

const BASE_URL = "http://localhost:8000"; // URL base del microservicio
const API_KEY = ""; // Clave de API si tu microservicio la requiere

// ── Implementación ────────────────────────────────────────────────────────

export class RestTranslationProvider {
    providerName = "RestTranslationProvider";

    constructor(baseUrl = BASE_URL, apiKey = API_KEY) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async translate(text, from, to) {
        if (!text.trim()) return { translatedText: text };

        // Contrato REAL del microservicio fae-translation-service
        const body = {
            text,
            source: from,
            target: to,
        };

        const headers = {
            "Content-Type": "application/json",
        };
        if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;

        const response = await fetch(`${this.baseUrl}/translate`, {
            method:  "POST",
            headers,
            body:    JSON.stringify(body),
            // SIN timeout artificial - LoadingView maneja la espera
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
    }
}
