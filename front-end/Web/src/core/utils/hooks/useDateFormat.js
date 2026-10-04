// ============================================================
//  useDateFormat - Hook para formatear fechas según config
// ============================================================

import { useMemo, useCallback } from "react";
import { getInstitutionConfig } from "../../config/institutionConfig";
import {
    formatDate as formatDateUtil,
    formatTime as formatTimeUtil,
    formatDateTime as formatDateTimeUtil,
} from "../../constants/dateFormats";

/**
 * Hook para obtener y usar el formato de fecha configurado
 */
export function useDateFormat() {
    // Obtener el formato configurado
    const config = useMemo(() => {
        const cfg = getInstitutionConfig();
        return {
            dateFormat: cfg.dateFormat || "DD/MM/YYYY",
            timeFormat24h: cfg.timeFormat24h ?? false,
        };
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
