// ============================================================
//  FaceAttend EDU — ITranslationProvider (i18n · Provider)
//
//  Contrato que debe cumplir cualquier motor de traducción.
//  LibreTranslate, DeepL, OpenAI u otro implementan esta interfaz.
//  El resto de la app NUNCA importa el motor directamente.
// ============================================================

import type { LanguageCode, TranslationResult } from "../models/TranslationEntry";

export interface ITranslationProvider {
    /**
     * Traduce un texto desde el idioma fuente al idioma destino.
     * @param text     Texto a traducir (siempre en español en FaceAttend EDU)
     * @param from     Código del idioma fuente (normalmente "es")
     * @param to       Código del idioma destino
     * @returns        Promesa con el texto traducido
     * @throws         Error si la traducción falla (red, cuota, etc.)
     */
    translate(
        text: string,
        from: LanguageCode,
        to:   LanguageCode,
    ): Promise<TranslationResult>;

    /**
     * Nombre identificador del proveedor (para logging/diagnóstico).
     */
    readonly providerName: string;
}
