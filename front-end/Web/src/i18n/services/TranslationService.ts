// ============================================================
//  FaceAttend EDU — TranslationService (i18n · Service)
//
//  Orquestador central del sistema de traducción.
//  Implementa la política de caché de tres niveles:
//
//    1. Caché en memoria (Map)   → respuesta instantánea, sin I/O
//    2. Almacenamiento local     → carga al inicializar, persiste entre sesiones
//    3. LibreTranslate (HTTP)    → solo si los dos niveles anteriores fallan
//
//  La UI nunca importa este archivo.
//  Solo LanguageContext lo usa.
// ============================================================

import { translationCache }       from "../cache/TranslationCache";
import { TranslationStorage }     from "../storage/TranslationStorage";
import { LibreTranslateProvider } from "../providers/LibreTranslateProvider";
import type { ITranslationProvider } from "../providers/ITranslationProvider";
import type { LanguageCode }         from "../models/TranslationEntry";
import { SOURCE_LANGUAGE }           from "../constants/SupportedLanguages";

// ── Configuración interna ────────────────────────────────────────────────

// Máximo de textos a enviar en un batch a LibreTranslate
const BATCH_SIZE = 20;

// Delay de debounce antes de persistir al storage (ms)
// Agrupa múltiples escrituras para evitar I/O excesivo
const PERSIST_DEBOUNCE_MS = 1_500;

// ── Servicio ─────────────────────────────────────────────────────────────

class TranslationService {
    private provider: ITranslationProvider = new LibreTranslateProvider();

    // Set de idiomas ya hidratados desde storage en esta sesión
    private hydratedLanguages = new Set<LanguageCode>();

    // Map de timers de debounce por idioma
    private persistTimers = new Map<LanguageCode, ReturnType<typeof setTimeout>>();

    // Cola de textos pendientes de traducción para el idioma activo
    private pendingQueue = new Set<string>();
    private isProcessing = false;

    // ── Configuración ─────────────────────────────────────────────────

    /**
     * Reemplaza el proveedor de traducción (para tests o migración futura).
     */
    setProvider(provider: ITranslationProvider): void {
        this.provider = provider;
    }

    // ── Inicialización ────────────────────────────────────────────────

    /**
     * Carga las traducciones persistidas de un idioma en la caché en memoria.
     * Llamado por LanguageContext al arrancar o cambiar de idioma.
     * Idempotente: solo hidrata una vez por sesión por idioma.
     */
    async hydrate(language: LanguageCode): Promise<void> {
        if (language === SOURCE_LANGUAGE) return;
        if (this.hydratedLanguages.has(language)) return;

        const entries = await TranslationStorage.load(language);
        if (Object.keys(entries).length > 0) {
            translationCache.hydrate(language, entries);
        }
        this.hydratedLanguages.add(language);
    }

    // ── Traducción principal ───────────────────────────────────────────

    /**
     * Traduce un texto al idioma destino.
     *
     * Flujo:
     *   Idioma es "es"          → devuelve el texto original sin tocar la red
     *   En caché en memoria     → devuelve inmediatamente
     *   No en caché             → encola, procesa en batch y devuelve resultado
     */
    async translate(text: string, language: LanguageCode): Promise<string> {
        // Texto vacío o idioma fuente → devolver tal cual
        if (!text.trim() || language === SOURCE_LANGUAGE) return text;

        // Nivel 1: caché en memoria
        const cached = translationCache.get(language, text);
        if (cached !== null) return cached;

        // Nivel 2: storage (si aún no se ha hidratado este idioma)
        if (!this.hydratedLanguages.has(language)) {
            await this.hydrate(language);
            const afterHydrate = translationCache.get(language, text);
            if (afterHydrate !== null) return afterHydrate;
        }

        // Nivel 3: LibreTranslate
        return this.fetchAndCache(text, language);
    }

    /**
     * Traduce múltiples textos de una vez.
     * Solo lanza peticiones HTTP para los que no están en caché.
     */
    async translateBatch(
        texts:    string[],
        language: LanguageCode,
    ): Promise<Record<string, string>> {
        if (language === SOURCE_LANGUAGE) {
            return Object.fromEntries(texts.map(t => [t, t]));
        }

        // Hidratamos primero para maximizar hits de caché
        if (!this.hydratedLanguages.has(language)) {
            await this.hydrate(language);
        }

        const result: Record<string, string> = {};
        const missing: string[] = [];

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

        if (missing.length > 0) {
            // Procesar en batches para no saturar LibreTranslate
            for (let i = 0; i < missing.length; i += BATCH_SIZE) {
                const chunk = missing.slice(i, i + BATCH_SIZE);
                await Promise.all(
                    chunk.map(async text => {
                        const translation = await this.fetchAndCache(text, language);
                        result[text] = translation;
                    })
                );
            }
        }

        return result;
    }

    // ── HTTP + caché ──────────────────────────────────────────────────

    private async fetchAndCache(text: string, language: LanguageCode): Promise<string> {
        try {
            const result = await this.provider.translate(text, SOURCE_LANGUAGE, language);
            const translation = result.translatedText;

            // Guardar en caché en memoria
            translationCache.set(language, text, translation);

            // Persistir (con debounce para agrupar escrituras)
            this.schedulePersist(language);

            return translation;
        } catch (error) {
            console.warn(
                `[TranslationService] Error al traducir "${text}" → ${language}:`,
                error
            );
            // Fallback: devolver el texto original para no romper la UI
            return text;
        }
    }

    // ── Persistencia con debounce ─────────────────────────────────────

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

    // ── Utilidades ────────────────────────────────────────────────────

    /**
     * Fuerza la re-traducción de un idioma eliminando su caché.
     * Útil si cambia la instancia de LibreTranslate.
     */
    async invalidate(language: LanguageCode): Promise<void> {
        translationCache.clear(language);
        this.hydratedLanguages.delete(language);
        await TranslationStorage.clear(language);
    }
}

// Singleton — una sola instancia para toda la app
export const translationService = new TranslationService();
