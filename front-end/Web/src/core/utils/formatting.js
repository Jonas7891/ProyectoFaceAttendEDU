/**
 * Funciones de formateo reutilizables para datos y texto
 */

import { getLocale } from "./locale";

/**
 * Formatea número con separadores de miles
 * @param {number|null|undefined} num - Número a formatear
 * @param {number} [decimals=0] - Cantidad de decimales
 * @returns {string} Número formateado con separadores
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234567.89, 2) // "1,234,567.89"
 * formatNumber(1234567, 0) // "1,234,567"
 */
export function formatNumber(num, decimals = 0) {
  if (num == null || Number.isNaN(Number(num))) return "0";
  
  return Number(num).toLocaleString(getLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea valor como porcentaje
 * @param {number|null|undefined} value - Valor decimal (0.8523 = 85.23%)
 * @param {number} [decimals=2] - Cantidad de decimales
 * @returns {string} Porcentaje formateado con símbolo %
 * @example
 * formatPercentage(0.8523) // "85.23%"
 * formatPercentage(0.5, 0) // "50%"
 */
export function formatPercentage(value, decimals = 2) {
  if (value == null || Number.isNaN(Number(value))) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formatea cantidad monetaria
 * @param {number|null|undefined} amount - Cantidad a formatear
 * @param {string} [currency="USD"] - Código de moneda ISO 4217
 * @returns {string} Cantidad formateada con símbolo de moneda
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, "EUR") // "€1,234.56"
 */
export function formatCurrency(amount, currency = "USD") {
  if (amount == null || Number.isNaN(Number(amount))) return "$0.00";
  
  return new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto con primera letra en mayúscula
 * @example
 * capitalize("hello world") // "Hello world"
 * capitalize("josé maría") // "José maría"
 */
export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitaliza cada palabra del texto (Title Case)
 * @param {string} text - Texto a transformar
 * @returns {string} Texto con cada palabra capitalizada
 * @example
 * titleCase("hello world") // "Hello World"
 * titleCase("josé maría lópez") // "José María López"
 */
export function titleCase(text) {
  if (!text) return "";
  return text
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");
}

/**
 * Quita los guiones del inicio y del final en una sola pasada:
 * /^-+|-+$/g retrocede de forma cuadrática con rachas largas de guiones.
 * @param {string} text
 * @returns {string}
 */
export function trimDashes(text) {
  let start = 0;
  let end = text.length;
  while (start < end && text[start] === "-") start += 1;
  while (end > start && text[end - 1] === "-") end -= 1;
  return text.slice(start, end);
}

