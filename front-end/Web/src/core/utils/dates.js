/**
 * Utilidades para manejo de fechas
 * Todas las funciones aceptan Date objects o strings parseables
 */

import { getLocale } from "./locale";

/**
 * Obtiene tiempo relativo en el idioma activo (hace X minutos/horas/días)
 * @param {Date|string} date - Fecha a comparar con ahora
 * @returns {string} Tiempo relativo formateado
 * @example
 * getRelativeTime(new Date(Date.now() - 60000)) // "hace 1 minuto"
 * getRelativeTime(new Date(Date.now() - 86400000)) // "hace 1 día"
 */
export function getRelativeTime(date) {
  if (!date) return "";
  
  const d = new Date(date);
  if (Number.isNaN(Number(d.getTime()))) return "";
  
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });
  if (diffSecs < 60) return rtf.format(0, "second");
  if (diffMins < 60) return rtf.format(-diffMins, "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  if (diffDays < 30) return rtf.format(-diffDays, "day");
  if (diffMonths < 12) return rtf.format(-diffMonths, "month");
  return rtf.format(-diffYears, "year");
}

