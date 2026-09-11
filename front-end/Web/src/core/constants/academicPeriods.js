// ============================================================
//  Configuración de Períodos Académicos
// ============================================================
//  Define los tipos de períodos académicos disponibles en el
//  sistema y sus características (semanas hábiles, etc.)
//
//  Estos valores pueden ser configurados desde Settings
// ============================================================

/**
 * Tipos de períodos académicos soportados
 */
export const ACADEMIC_PERIOD_TYPES = {
    ANNUAL: 'annual',           // Anual
    SEMESTRAL: 'semestral',     // Semestral
    QUARTERLY: 'quarterly',      // Cuatrimestral
    TRIMESTRAL: 'trimestral',   // Trimestral
};

/**
 * Configuración de semanas hábiles por tipo de período
 */
export const ACADEMIC_PERIOD_CONFIG = {
    [ACADEMIC_PERIOD_TYPES.ANNUAL]: {
        label: 'Anual',
        minWeeks: 30,
        maxWeeks: 34,
        defaultWeeks: 32,
        description: 'Período académico completo de un año',
    },
    [ACADEMIC_PERIOD_TYPES.SEMESTRAL]: {
        label: 'Semestral',
        minWeeks: 16,
        maxWeeks: 18,
        defaultWeeks: 17,
        description: 'Período académico de medio año',
    },
    [ACADEMIC_PERIOD_TYPES.QUARTERLY]: {
        label: 'Cuatrimestral',
        minWeeks: 14,
        maxWeeks: 15,
        defaultWeeks: 14,
        description: 'Período académico de cuatro meses',
    },
    [ACADEMIC_PERIOD_TYPES.TRIMESTRAL]: {
        label: 'Trimestral',
        minWeeks: 10,
        maxWeeks: 12,
        defaultWeeks: 11,
        description: 'Período académico de tres meses',
    },
};

/**
 * Período académico por defecto del sistema
 * TODO: Esto debe venir de la configuración de la institución en Settings
 */
export const DEFAULT_ACADEMIC_PERIOD = ACADEMIC_PERIOD_TYPES.SEMESTRAL;

/**
 * Obtener configuración de período académico
 * 
 * @param {string} periodType - Tipo de período (annual, semestral, quarterly, trimestral)
 * @returns {Object} Configuración del período
 */
export function getAcademicPeriodConfig(periodType = DEFAULT_ACADEMIC_PERIOD) {
    return ACADEMIC_PERIOD_CONFIG[periodType] || ACADEMIC_PERIOD_CONFIG[DEFAULT_ACADEMIC_PERIOD];
}

/**
 * Obtener número de semanas para un período académico
 * 
 * @param {string} periodType - Tipo de período
 * @returns {number} Número de semanas hábiles
 */
export function getAcademicPeriodWeeks(periodType = DEFAULT_ACADEMIC_PERIOD) {
    const config = getAcademicPeriodConfig(periodType);
    return config.defaultWeeks;
}

/**
 * Validar si un número de semanas es válido para un período
 * 
 * @param {number} weeks - Número de semanas
 * @param {string} periodType - Tipo de período
 * @returns {boolean} True si es válido
 */
export function isValidWeekCount(weeks, periodType = DEFAULT_ACADEMIC_PERIOD) {
    const config = getAcademicPeriodConfig(periodType);
    return weeks >= config.minWeeks && weeks <= config.maxWeeks;
}

/**
 * Calcular semana actual del período académico
 * 
 * @param {Date} startDate - Fecha de inicio del período
 * @param {Date} currentDate - Fecha actual (default: hoy)
 * @returns {number} Número de semana actual (1-indexed)
 */
export function getCurrentAcademicWeek(startDate, currentDate = new Date()) {
    const diffTime = Math.abs(currentDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil(diffDays / 7);
    return weekNumber;
}

/**
 * Generar labels de semanas para un período académico
 * 
 * @param {number} totalWeeks - Total de semanas del período
 * @param {number} startWeek - Semana de inicio (default: 1)
 * @returns {Array<string>} Array de labels ["Sem 1", "Sem 2", ...]
 */
export function generateWeekLabels(totalWeeks, startWeek = 1) {
    return Array.from(
        { length: totalWeeks },
        (_, i) => `Sem ${startWeek + i}`
    );
}

/**
 * Calcular los períodos académicos del año vigente
 * 
 * @param {string} periodType - Tipo de período académico
 * @param {number} year - Año a calcular (default: año actual)
 * @returns {Array<Object>} Array de períodos: [{ id, label, startWeek, endWeek, isCurrent, isFuture }]
 */
export function getYearAcademicPeriods(periodType = DEFAULT_ACADEMIC_PERIOD, year = new Date().getFullYear()) {
    const config = getAcademicPeriodConfig(periodType);
    const weeksPerPeriod = config.defaultWeeks;
    
    // Determinar cuántos períodos hay en un año según el tipo
    let periodsPerYear;
    let periodNames;
    
    switch (periodType) {
        case ACADEMIC_PERIOD_TYPES.ANNUAL:
            periodsPerYear = 1;
            periodNames = [`Año ${year}`];
            break;
        case ACADEMIC_PERIOD_TYPES.SEMESTRAL:
            periodsPerYear = 2;
            periodNames = ['Primer Semestre', 'Segundo Semestre'];
            break;
        case ACADEMIC_PERIOD_TYPES.QUARTERLY:
            periodsPerYear = 3;
            periodNames = ['Primer Cuatrimestre', 'Segundo Cuatrimestre', 'Tercer Cuatrimestre'];
            break;
        case ACADEMIC_PERIOD_TYPES.TRIMESTRAL:
            periodsPerYear = 4;
            periodNames = ['Primer Trimestre', 'Segundo Trimestre', 'Tercer Trimestre', 'Cuarto Trimestre'];
            break;
        default:
            periodsPerYear = 2;
            periodNames = ['Primer Semestre', 'Segundo Semestre'];
    }
    
    // Calcular semana actual del año (1-52)
    const now = new Date();
    const startOfYear = new Date(year, 0, 1);
    const currentWeekOfYear = getCurrentAcademicWeek(startOfYear, now);
    
    // Generar períodos
    const periods = [];
    let currentStartWeek = 1;
    
    for (let i = 0; i < periodsPerYear; i++) {
        const endWeek = currentStartWeek + weeksPerPeriod - 1;
        const isCurrent = currentWeekOfYear >= currentStartWeek && currentWeekOfYear <= endWeek;
        const isFuture = currentWeekOfYear < currentStartWeek;
        
        periods.push({
            id: `${periodType}-${year}-${i + 1}`,
            label: periodNames[i],
            periodNumber: i + 1,
            startWeek: currentStartWeek,
            endWeek: endWeek,
            totalWeeks: weeksPerPeriod,
            isCurrent,
            isFuture,
            isPast: !isCurrent && !isFuture,
            year,
        });
        
        currentStartWeek = endWeek + 1;
    }
    
    return periods;
}

/**
 * Obtener el período académico actual
 * 
 * @param {string} periodType - Tipo de período académico
 * @param {number} year - Año (default: año actual)
 * @returns {Object|null} Período actual o null si no hay uno activo
 */
export function getCurrentPeriod(periodType = DEFAULT_ACADEMIC_PERIOD, year = new Date().getFullYear()) {
    const periods = getYearAcademicPeriods(periodType, year);
    return periods.find(p => p.isCurrent) || periods[0]; // Fallback al primero si no hay actual
}

/**
 * Formatear label de período para UI
 * 
 * @param {Object} period - Objeto de período
 * @param {string} periodType - Tipo de período
 * @returns {string} Label formateado para mostrar
 */
export function formatPeriodLabel(period, periodType) {
    const config = getAcademicPeriodConfig(periodType);
    return `${period.label} (${period.totalWeeks} sem)`;
}

export default {
    ACADEMIC_PERIOD_TYPES,
    ACADEMIC_PERIOD_CONFIG,
    DEFAULT_ACADEMIC_PERIOD,
    getAcademicPeriodConfig,
    getAcademicPeriodWeeks,
    isValidWeekCount,
    getCurrentAcademicWeek,
    generateWeekLabels,
};
