// ============================================================
//  Formatos de Fecha y Hora - SIMPLIFICADO
// ============================================================

/**
 * Formatos de fecha disponibles
 */
export const DATE_FORMATS = {
    "DD/MM/YYYY": { 
        label: "DD/MM/YYYY", 
        example: `31/12/${new Date().getFullYear()}`
    },
    "MM/DD/YYYY": { 
        label: "MM/DD/YYYY", 
        example: `12/31/${new Date().getFullYear()}`
    },
    "YYYY-MM-DD": { 
        label: "YYYY-MM-DD", 
        example: `${new Date().getFullYear()}-12-31`
    },
};

export const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";

/**
 * Formatear fecha según formato configurado
 */
export function formatDate(date, format = DEFAULT_DATE_FORMAT) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        return "";
    }
    
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    
    switch (format) {
        case "DD/MM/YYYY":
            return `${day}/${month}/${year}`;
        case "MM/DD/YYYY":
            return `${month}/${day}/${year}`;
        case "YYYY-MM-DD":
            return `${year}-${month}-${day}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

/**
 * Formatear hora según formato 12h/24h
 */
export function formatTime(date, is24Hour = false) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        return "";
    }
    
    const hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    
    if (is24Hour) {
        return `${String(hours).padStart(2, "0")}:${minutes}`;
    } else {
        const hours12 = hours % 12 || 12;
        const ampm = hours >= 12 ? "PM" : "AM";
        return `${hours12}:${minutes} ${ampm}`;
    }
}

/**
 * Formatear fecha y hora
 */
export function formatDateTime(date, dateFormat = DEFAULT_DATE_FORMAT, is24Hour = false) {
    return `${formatDate(date, dateFormat)} ${formatTime(date, is24Hour)}`;
}
