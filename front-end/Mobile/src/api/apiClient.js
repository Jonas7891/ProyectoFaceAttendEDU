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

  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

function buildUrl(path) {
  if (path.startsWith('http')) return path;
  const base = BASE_URL.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export async function request({ method, url, data = null, params = null, requiresAuth = false }) {
  let fullUrl = buildUrl(url);

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
      throw new ApiError(response.status, result?.message || `Error ${response.status}`, result);
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError(408, 'La petición tardó demasiado (timeout)', null);
    }
    if (error instanceof ApiError) throw error;

    throw new ApiError(0, error.message || 'Error de conexión', null);
  }
}

export { ApiError };
export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const PATCH = 'PATCH';
export const DELETE = 'DELETE';
