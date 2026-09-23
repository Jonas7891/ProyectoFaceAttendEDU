// ============================================================
//  FaceAttend EDU — TranslationService (i18n · Service)
//
//  Servicio centralizado de traducción con tracking automático.
//
//  FLUJO:
//    1. getCached(text, lang) → devuelve traducción del cache o texto original
//    2. Rastrea automáticamente qué textos se están usando
//    3. prepareCurrentTexts(lang) → traduce todos los textos rastreados
//    4. hydrate(lang) → carga traducciones del storage al cache
//
//  API:
//    translationService.getCached(text, lang) → string (sync)
//    translationService.prepareCurrentTexts(lang) → Promise<void>
//    translationService.hydrate(lang) → Promise<void>
// ============================================================

import { translationCache } from "../cache/TranslationCache";
import { TranslationStorage } from "../storage/TranslationStorage";
import { RestTranslationProvider } from "../providers/RestTranslationProvider";
import { SOURCE_LANGUAGE } from "../constants/SupportedLanguages";

const BATCH_SIZE = 20;

class TranslationService {
    provider = new RestTranslationProvider();
    hydratedLanguages = new Set();
    
    // Tracking automático de textos usados
    activeTexts = new Set();

    // ── Consulta síncrona (para t()) ──────────────────────────────────────

    /**
     * Obtiene traducción del cache (SÍNCRONA)
     * Si no existe, devuelve el texto original
     * Rastrea automáticamente el texto como "activo"
     * 
     * @param {string} text - Texto en español
     * @param {string} language - Idioma destino
     * @returns {string} - Traducción si existe, o texto original
     */
    getCached(text, language) {
        if (language === SOURCE_LANGUAGE) return text;
        if (!text || !text.trim()) return text;

        // Rastrear texto como activo
        this.activeTexts.add(text);

        const cached = translationCache.get(language, text);
        return cached !== null ? cached : text;
    }

    // ── Limpiar textos rastreados ─────────────────────────────────────────

    /**
     * Limpia el tracking de textos activos
     */
    clearTracking() {
        this.activeTexts.clear();
    }

    // ── Obtener textos activos ────────────────────────────────────────────

    /**
     * Obtiene todos los textos que se están usando actualmente
     */
    getActiveTexts() {
        return Array.from(this.activeTexts);
    }

    // ── Hidratación desde storage ─────────────────────────────────────────

    /**
     * Carga traducciones guardadas del storage al cache
     */
    async hydrate(language) {
        if (language === SOURCE_LANGUAGE) return;
        if (this.hydratedLanguages.has(language)) return;

        console.log(`[TranslationService] Hidratando: ${language}`);
        
        const entries = await TranslationStorage.load(language);
        if (Object.keys(entries).length > 0) {
            translationCache.hydrate(language, entries);
        }
        
        this.hydratedLanguages.add(language);
        
        console.log(`[TranslationService] Hidratado: ${Object.keys(entries).length} traducciones`);
    }

    // ── Preparación de textos actualmente en uso ──────────────────────────

    /**
     * Prepara traducciones para todos los textos rastreados (View actual)
     * y luego limpia el tracking para la próxima View
     */
    async prepareCurrentTexts(language) {
        const texts = this.getActiveTexts();
        
        if (texts.length === 0) {
            console.log(`[TranslationService] No hay textos activos para traducir`);
            return;
        }

        console.log(`[TranslationService] Preparando textos de View actual: ${texts.length} textos`);
        
        // Preparar traducciones
        await this.prepareTranslations(texts, language);
        
        // IMPORTANTE: Limpiar tracking después de preparar
        // Así la próxima View solo acumula SUS textos
        this.clearTracking();
        
        console.log(`[TranslationService] Tracking limpiado, listo para próxima View`);
    }

    // ── Preparación para cambio de idioma ─────────────────────────────────

    /**
     * Prepara traducciones para un conjunto de textos
     * Espera a que TODAS estén listas antes de resolver
     */
    async prepareTranslations(texts, language) {
        if (language === SOURCE_LANGUAGE) return;
        if (!texts || texts.length === 0) return;

        // Hidratar si es necesario
        if (!this.hydratedLanguages.has(language)) {
            await this.hydrate(language);
        }

        // Filtrar textos faltantes
        const missing = texts.filter(text => {
            if (!text || !text.trim()) return false;
            return translationCache.get(language, text) === null;
        });

        if (missing.length === 0) {
            console.log(`[TranslationService] Todas las traducciones ya están en cache`);
            return;
        }

        console.log(`[TranslationService] Faltan ${missing.length} traducciones, solicitando al microservicio...`);

        // Procesar en batches
        for (let i = 0; i < missing.length; i += BATCH_SIZE) {
            const chunk = missing.slice(i, i + BATCH_SIZE);
            await Promise.all(chunk.map(text => this.fetchAndCache(text, language)));
        }

        // Persistir todas las traducciones
        await this.persist(language);
        
        console.log(`[TranslationService] ✓ Preparación completada: ${missing.length} traducciones guardadas`);
    }

    // ── Traducción individual ─────────────────────────────────────────────

    async fetchAndCache(text, language) {
        try {
            const result = await this.provider.translate(text, SOURCE_LANGUAGE, language);
            const translation = result?.translatedText || text;
            translationCache.set(language, text, translation);
            return translation;
        } catch (error) {
            console.error(`[TranslationService] Error traduciendo "${text}":`, error);
            throw error;
        }
    }

    // ── Persistencia ──────────────────────────────────────────────────────

    async persist(language) {
        try {
            const entries = translationCache.export(language);
            await TranslationStorage.save(language, entries);
        } catch (error) {
            console.warn(`[TranslationService] Error al persistir (${language}):`, error);
        }
    }

    // ── Limpieza ──────────────────────────────────────────────────────────

    async invalidate(language) {
        translationCache.clear(language);
        this.hydratedLanguages.delete(language);
        await TranslationStorage.clear(language);
    }

    async invalidateAll() {
        translationCache.clearAll();
        this.hydratedLanguages.clear();
        await TranslationStorage.clearAll();
    }
}

export const translationService = new TranslationService();
