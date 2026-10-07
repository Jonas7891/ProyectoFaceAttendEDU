import { getToken } from '../storage/TokenStorage';
import ENV from '../config/env';

const BASE_URL = ENV.API_BASE_URL;
const TIMEOUT = ENV.API_TIMEOUT;

class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function buildHeaders(requiresAuth) {
  const headers = { 'Content-Type': 'application/json' };

  // El token se adjunta siempre que exista: los MS exigen Bearer en /api/**
  // y requiresAuth:true además falla si no hay sesión guardada.
  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requiresAuth) {
    throw new ApiError(401, 'Sin sesión: inicia sesión de nuevo', null);
  }

  return headers;
}

function buildUrl(path) {
  if (path.startsWith('http')) return path;
  const canonical = canonicalizePath(path);
  const base = BASE_URL.replace(/\/+$/, '');
  return `${base}/${canonical.replace(/^\//, '')}`;
}

// ── Sesión rechazada por el backend ─────────────────────────
// El sessionId opaco caduca a las 8 h (session_timeout_minutes) aunque
// localmente no tenga expiresAt, así que la app arranca "logueada" con un
// token muerto. AppNavigator se suscribe aquí para purgar la sesión y
// volver al login en el primer 401, en vez de disparar 401 en cada llamada.
let sessionExpiredHandler = null;
let sessionExpiredNotified = false;

/** Registra el callback de sesión caducada; devuelve la función para desuscribirse. */
export function onSessionExpired(handler) {
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
  };
}

/**
 * En los flujos de credenciales el 401 es una respuesta de negocio
 * (contraseña o código incorrectos), no una sesión muerta.
 */
function isCredentialFlow(url) {
  return url.includes('/api/v1/auth/');
}

function notifySessionExpired() {
  // Una sola vez por sesión caída: varias llamadas fallan en paralelo.
  if (sessionExpiredNotified || !sessionExpiredHandler) return;
  sessionExpiredNotified = true;
  try {
    sessionExpiredHandler();
  } catch (e) {
    console.warn('onSessionExpired:', e?.message);
  }
}

/**
 * Mapa legacy Mobile (singular snake, sin /api/v1, contra :3000)
 * -> canónico Gateway Kong :8080 (/api/v1/plural-kebab).
 * Fuente: back-end/99-api-gateway/kong/kong.yml + controllers 01-09.
 * Los servicios Mobile siguen usando 'person', 'app_user', etc.; se
 * reescriben aquí para no tocar los 30+ services en este fix.
 */
const LEGACY_ENDPOINT_MAP = {
  person: 'api/v1/persons',
  app_user: 'api/v1/users',
  user_session: 'api/v1/sessions',
  city: 'api/v1/cities',
  role: 'api/v1/roles',
  permission: 'api/v1/permissions',
  school: 'api/v1/schools',
  program: 'api/v1/programs',
  academic_period: 'api/v1/academic-periods',
  cohort: 'api/v1/cohorts',
  course: 'api/v1/courses',
  academic_actor: 'api/v1/academic-actors',
  enrollment: 'api/v1/enrollments',
  environment: 'api/v1/environments',
  schedule_block: 'api/v1/schedule-blocks',
  class_session: 'api/v1/class-sessions',
  attendance_record: 'api/v1/attendance-records',
  justification: 'api/v1/justifications',
  justification_type: 'api/v1/justification-types',
  supporting_document: 'api/v1/supporting-documents',
  alert: 'api/v1/alerts',
  alert_type: 'api/v1/alert-types',
  biometric_update_case: 'api/v1/biometric-update-cases',
  academic_configuration: 'api/v1/academic-configurations',
  security_configuration: 'api/v1/security-configurations',
  // Auth / biométrico con path propio del gateway:
  'auth/forgot-password': 'api/v1/auth/forgot-password',
  'auth/verify-code': 'api/v1/auth/verify-code',
  'auth/reset-password': 'api/v1/auth/reset-password',
  'face/register': 'api/v1/biometric/facial/enroll',
};

function canonicalizePath(path) {
  const clean = path.replace(/^\/+/, '');
  // Ya canónico: /api/v1/... o api/v1/... -> respetar tal cual.
  if (clean.startsWith('api/v1/')) return clean;
  // Path completo legacy con slash (face/register, auth/*).
  if (LEGACY_ENDPOINT_MAP[clean]) return LEGACY_ENDPOINT_MAP[clean];
  const [head, ...rest] = clean.split('/');
  const mapped = LEGACY_ENDPOINT_MAP[head];
  if (mapped) return [mapped, ...rest].join('/');
  // Sin mapeo (blood_type, document_type, language, audit_log,
  // error_log, attendance_report, user_role sin user_id):
  // prefijar /api/v1 para que el 404 venga del gateway
  // y evidencie el faltante de backend.
  return `api/v1/${clean}`;
}

/**
 * Reescrituras que requieren query params (no solo path):
 * - GET user_role?user_id=X -> GET api/v1/users/X/roles (contrato 02-ms-authorization)
 * - GET role?role_id=X -> GET api/v1/roles/X
 * Devuelve { url, params } ya reescritos.
 */
function rewriteUserRoleQuery(url, params) {
  if (!params || typeof params !== 'object') return { url, params };
  const clean = url.replace(/^\/+/, '');
  const head = clean.split('/')[0];
  if ((head === 'user_role' || clean.startsWith('user_role/')) && params.user_id) {
    const { user_id, ...rest } = params;
    return { url: `api/v1/users/${user_id}/roles`, params: rest };
  }
  if (head === 'role' && params.role_id && !clean.includes('/')) {
    const { role_id, ...rest } = params;
    return { url: `api/v1/roles/${role_id}`, params: rest };
  }
  return { url, params };
}

/**
 * The backend returns paginated collections as { data: [...], meta: { page, limit, total, totalPages } }
 * (fae-docs/07-api/contracts/openapi/_shared.yaml). Callers expect a plain array, so unwrap it here
 * instead of in every service.
 */
function unwrapPage(payload) {
  if (
    payload &&
    !Array.isArray(payload) &&
    Array.isArray(payload.data) &&
    payload.meta &&
    typeof payload.meta === 'object' &&
    'total' in payload.meta
  ) {
    return payload.data;
  }
  return payload;
}

export async function request({ method, url, data = null, params = null, requiresAuth = true }) {
  const rewritten = rewriteUserRoleQuery(url, params);
  let fullUrl = buildUrl(rewritten.url);
  params = rewritten.params;

  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (query) fullUrl += `?${query}`;
  }

  const options = {
    method,
    headers: await buildHeaders(requiresAuth),
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  options.signal = controller.signal;

  try {
    const response = await fetch(fullUrl, options);
    clearTimeout(timeoutId);

    let result;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      if (response.status === 401 && !isCredentialFlow(fullUrl)) {
        notifySessionExpired();
      }
      throw new ApiError(response.status, result?.message || `Error ${response.status}`, result);
    }

    // Respuesta válida: rearma el aviso de sesión caducada para el próximo login.
    sessionExpiredNotified = false;
    return unwrapPage(result);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError(
        408,
        `La petición tardó demasiado (timeout). Verifica que el backend responda en ${BASE_URL}`,
        null,
      );
    }
    if (error instanceof ApiError) throw error;

    // fetch failed / Network request failed / timed out en iOS (Promise.swift:56):
    // el gateway Kong (:8080) está caído o el host es inalcanzable desde el
    // dispositivo. Mensaje accionable en vez del genérico 'fetch failed'.
    const raw = error.message || 'Error de conexión';
    const isConnectivity = /fetch failed|network request failed|timed out|timeout|abort|connection refused|failed to connect/i.test(
      raw,
    );
    if (isConnectivity) {
      throw new ApiError(
        0,
        `No se pudo conectar al servidor en ${BASE_URL}. Revisa que el backend (Kong :8080) esté corriendo y que el dispositivo esté en la misma red.`,
        null,
      );
    }

    throw new ApiError(0, raw, null);
  }
}

export { ApiError };
export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const PATCH = 'PATCH';
export const DELETE = 'DELETE';
