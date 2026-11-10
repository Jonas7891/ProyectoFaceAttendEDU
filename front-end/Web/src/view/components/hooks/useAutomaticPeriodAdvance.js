// ============================================================
//  useAutomaticPeriodAdvance — Hook para avanzar períodos automáticamente
// ============================================================
//  Hook que verifica si el período académico ha expirado y
//  si está en modo automático, avanza al próximo período
//  calculando las fechas basándose en la duración del anterior.
//
//  Se ejecuta al montar y periódicamente (cada 1 hora por defecto)
// ============================================================

import { useEffect } from "react";
import { 
    getInstitutionConfig,
    checkPeriodExpiration,
    advanceToNextPeriod,
} from "../../../core/config/institutionConfig";

/**
 * Hook para avanzar automáticamente al próximo período cuando expira
 * 
 * @param {boolean} enabled - Si el auto-advance está habilitado (default: true)
 * @param {number} checkIntervalMinutes - Intervalo de verificación en minutos (default: 60)
 * @param {Function} onAdvanced - async ({periodStartDate, periodEndDate}) tras avanzar (p. ej. guardarlas en la sede)
 * @returns {Object} { lastCheck, hasAdvanced, error }
 */
export function useAutomaticPeriodAdvance(enabled = true, checkIntervalMinutes = 60, onAdvanced = null) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const checkAndAdvance = async () => {
            try {
                const config = getInstitutionConfig();
                
                // Solo avanzar si está en modo automático
                if (!config.isAutomaticPeriod) {
                    return;
                }

                // Verificar si el período ha expirado
                const expiration = checkPeriodExpiration();
                
                if (expiration.hasExpired) {
                    
                    const dates = await advanceToNextPeriod();

                    if (dates) {
                        await onAdvanced?.(dates);
                        
                        // Emitir evento custom para notificar a componentes
                        window.dispatchEvent(new CustomEvent("periodAdvanced", {
                            detail: {
                                timestamp: new Date().toISOString(),
                                daysOverdue: expiration.daysOverdue,
                            }
                        }));
                    } else {
                        console.warn("[PeriodAdvance] ⚠️ No se pudo avanzar el período automáticamente");
                    }
                }
            } catch (error) {
                console.error("[PeriodAdvance] Error al verificar/avanzar período:", error);
            }
        };

        // Ejecutar al montar
        void checkAndAdvance();

        // Configurar intervalo de verificación
        const intervalMs = checkIntervalMinutes * 60 * 1000;
        const interval = setInterval(checkAndAdvance, intervalMs);


        // Cleanup
        return () => {
            clearInterval(interval);
        };
    }, [enabled, checkIntervalMinutes]);
}

export default useAutomaticPeriodAdvance;
