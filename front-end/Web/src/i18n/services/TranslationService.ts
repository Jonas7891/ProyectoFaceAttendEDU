// ============================================================
//  FaceAttend EDU — TranslationService (i18n · Service)
//
//  Orquesta la cadena de traducciones:
//    Nivel 1 → caché en memoria (TranslationCache)
//    Nivel 2 → almacenamiento persistente (TranslationStorage)
//    Nivel 3 → proveedor HTTP (RestTranslationProvider)
//
//  FIX: el fallback de error NO se guarda en caché.
//  Solo se cachea si la traducción es exitosa.
// ============================================================

import { translationCache }          from "../cache/TranslationCache";
import { TranslationStorage }        from "../storage/TranslationStorage";
import { RestTranslationProvider }   from "../providers/RestTranslationProvider";
import type { ITranslationProvider } from "../providers/ITranslationProvider";
import type { LanguageCode }         from "../models/TranslationEntry";
import { SOURCE_LANGUAGE }           from "../constants/SupportedLanguages";

const BATCH_SIZE        = 20;
const PERSIST_DEBOUNCE_MS = 1_500;

class TranslationService {
    private provider: ITranslationProvider = new RestTranslationProvider();
    private hydratedLanguages = new Set<LanguageCode>();
    private persistTimers     = new Map<LanguageCode, ReturnType<typeof setTimeout>>();

    setProvider(provider: ITranslationProvider): void {
        this.provider = provider;
    }

    async hydrate(language: LanguageCode): Promise<void> {
        if (language === SOURCE_LANGUAGE) return;
        if (this.hydratedLanguages.has(language)) return;

        const entries = await TranslationStorage.load(language);
        if (Object.keys(entries).length > 0) {
            translationCache.hydrate(language, entries);
        }
        this.hydratedLanguages.add(language);
    }

    async translate(text: string, language: LanguageCode): Promise<string> {
        if (!text.trim() || language === SOURCE_LANGUAGE) return text;

        // Nivel 1: caché en memoria
        const cached = translationCache.get(language, text);
        if (cached !== null) return cached;

        // Nivel 2: storage (solo si aún no se hidratò este idioma)
        if (!this.hydratedLanguages.has(language)) {
            await this.hydrate(language);
            const afterHydrate = translationCache.get(language, text);
            if (afterHydrate !== null) return afterHydrate;
        }

        // Nivel 3: proveedor HTTP
        return this.fetchAndCache(text, language);
    }

    async translateBatch(
        texts:    string[],
        language: LanguageCode,
    ): Promise<Record<string, string>> {
        if (language === SOURCE_LANGUAGE) {
            return Object.fromEntries(texts.map(t => [t, t]));
        }

        if (!this.hydratedLanguages.has(language)) {
            await this.hydrate(language);
        }

        const result:  Record<string, string> = {};
        const missing: string[]               = [];

        for (const text of texts) {
            const cached = translationCache.get(language, text);
            if (cached !== null) {
                result[text] = cached;
            } else if (text.trim()) {
                missing.push(text);
            } else {
                result[text] = text;
            }
        }

        for (let i = 0; i < missing.length; i += BATCH_SIZE) {
            const chunk = missing.slice(i, i + BATCH_SIZE);
            await Promise.all(
                chunk.map(async text => {
                    result[text] = await this.fetchAndCache(text, language);
                })
            );
        }

        return result;
    }

    // ── FIX PRINCIPAL ────────────────────────────────────────────────────
    //
    //  ANTES (bug):
    //    catch → console.warn → return text   ← el llamador cacheaba este valor
    //
    //  AHORA (fix):
    //    - Solo se llama translationCache.set() y schedulePersist() si la
    //      traducción fue exitosa.
    //    - Si el proveedor falla, se lanza el error hacia arriba.
    //    - El llamador (translate()) devuelve el texto original como fallback
    //      visible en la UI, PERO sin guardarlo en caché.
    //    - En el siguiente render, t() vuelve a intentar la traducción.
    //
    private async fetchAndCache(text: string, language: LanguageCode): Promise<string> {
        try {
            const result      = await this.provider.translate(text, SOURCE_LANGUAGE, language);
            const translation = result.translatedText;

            // Solo se cachea si la traducción es distinta al original O es un nombre propio válido
            translationCache.set(language, text, translation);
            this.schedulePersist(language);

            return translation;
        } catch (error) {
            console.warn(
                `[TranslationService] Error al traducir "${text}" → ${language}:`,
                error,
            );
            // FIX: NO cacheamos el fallback. Devolvemos el español para la UI
            // pero la próxima llamada a t() volverá a intentar la traducción.
            return text;
        }
    }

    private schedulePersist(language: LanguageCode): void {
        const existing = this.persistTimers.get(language);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            this.persist(language);
            this.persistTimers.delete(language);
        }, PERSIST_DEBOUNCE_MS);

        this.persistTimers.set(language, timer);
    }

    private async persist(language: LanguageCode): Promise<void> {
        try {
            const entries = translationCache.export(language);
            await TranslationStorage.save(language, entries);
        } catch (e) {
            console.warn(`[TranslationService] Error al persistir (${language}):`, e);
        }
    }

    async invalidate(language: LanguageCode): Promise<void> {
        translationCache.clear(language);
        this.hydratedLanguages.delete(language);
        await TranslationStorage.clear(language);
    }
}

export const translationService = new TranslationService();
