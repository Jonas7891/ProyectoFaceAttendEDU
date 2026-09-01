/**
 * Funciones de formateo reutilizables
 */

/**
 * Formatea número con separadores de miles
 * @example formatNumber(1234567.89) => "1,234,567.89"
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea porcentaje
 * @example formatPercentage(0.8523) => "85.23%"
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formatea moneda
 * @example formatCurrency(1234.56, "USD") => "$1,234.56"
 */
export function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Trunca texto con ellipsis
 * @example truncate("Hello World", 5) => "Hello..."
 */
export function truncate(text, maxLength, suffix = "...") {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * Capitaliza primera letra
 * @example capitalize("hello world") => "Hello world"
 */
export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitaliza cada palabra
 * @example titleCase("hello world") => "Hello World"
 */
export function titleCase(text) {
  if (!text) return "";
  return text
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");
}

/**
 * Convierte a slug
 * @example slugify("Hello World!") => "hello-world"
 */
export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Formatea nombre completo
 * @example formatFullName("john", "doe") => "John Doe"
 */
export function formatFullName(firstName, lastName) {
  const first = capitalize(firstName || "");
  const last = capitalize(lastName || "");
  return `${first} ${last}`.trim();
}

/**
 * Formatea iniciales
 * @example formatInitials("John", "Doe") => "JD"
 */
export function formatInitials(firstName, lastName) {
  const first = (firstName || "").charAt(0).toUpperCase();
  const last = (lastName || "").charAt(0).toUpperCase();
  return `${first}${last}`;
}

/**
 * Formatea teléfono
 * @example formatPhone("1234567890") => "(123) 456-7890"
 */
export function formatPhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Formatea tamaño de archivo
 * @example formatFileSize(1536) => "1.5 KB"
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Oculta parte de un email
 * @example maskEmail("john.doe@example.com") => "j***e@example.com"
 */
export function maskEmail(email) {
  if (!email || !email.includes("@")) return email;
  
  const [username, domain] = email.split("@");
  if (username.length <= 2) return email;
  
  const masked = username[0] + "***" + username[username.length - 1];
  return `${masked}@${domain}`;
}

/**
 * Oculta parte de un número de teléfono
 * @example maskPhone("1234567890") => "******7890"
 */
export function maskPhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 4) return phone;
  
  return "*".repeat(cleaned.length - 4) + cleaned.slice(-4);
}

/**
 * Convierte camelCase a Title Case
 * @example camelToTitle("firstName") => "First Name"
 */
export function camelToTitle(camelCase) {
  if (!camelCase) return "";
  
  const result = camelCase.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Pluraliza palabra según cantidad
 * @example pluralize(1, "item") => "1 item"
 * @example pluralize(2, "item") => "2 items"
 */
export function pluralize(count, singular, plural = null) {
  const word = count === 1 ? singular : (plural || singular + "s");
  return `${count} ${word}`;
}

/**
 * Genera color a partir de texto (para avatares, etc)
 * @example getColorFromText("John Doe") => "#3B82F6"
 */
export function getColorFromText(text) {
  if (!text) return "#64748B";
  
  const colors = [
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6", 
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  ];
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
