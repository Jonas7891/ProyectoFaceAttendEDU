// ============================================================
//  useDateFormat - Hook para formatear fechas según config
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { getInstitutionConfig, onInstitutionConfigChange } from "../../config/institutionConfig";
import {
    formatDate as formatDateUtil,
    formatTime as formatTimeUtil,
    formatDateTime as formatDateTimeUtil,
} from "../../constants/dateFormats";

/**
 * Hook para obtener y usar el formato de fecha configurado
 * Se suscribe automáticamente a cambios de configuración
 */
export function useDateFormat() {
    // Estado reactivo para la configuración
    const [config, setConfig] = useState(() => {
        const cfg = getInstitutionConfig();
        return {
            dateFormat: cfg.dateFormat || "DD/MM/YYYY",
            timeFormat24h: cfg.timeFormat24h ?? false,
        };
    });

    // Suscribirse a cambios de configuración
    useEffect(() => {
        const unsubscribe = onInstitutionConfigChange((newConfig) => {
            setConfig({
                dateFormat: newConfig.dateFormat || "DD/MM/YYYY",
                timeFormat24h: newConfig.timeFormat24h ?? false,
            });
        });
        
        return unsubscribe;
    }, []);

    // Función para formatear fechas
    const formatDate = useCallback(
        (date) => {
            return formatDateUtil(date, config.dateFormat);
        },
        [config.dateFormat]
    );

    // Función para formatear horas
    const formatTime = useCallback(
        (date) => {
            return formatTimeUtil(date, config.timeFormat24h);
        },
        [config.timeFormat24h]
    );

    // Función para formatear fecha y hora
    const formatDateTime = useCallback(
        (date) => {
            return formatDateTimeUtil(date, config.dateFormat, config.timeFormat24h);
        },
        [config.dateFormat, config.timeFormat24h]
    );

    return {
        dateFormat: config.dateFormat,
        timeFormat24h: config.timeFormat24h,
        formatDate,
        formatTime,
        formatDateTime,
    };
}
