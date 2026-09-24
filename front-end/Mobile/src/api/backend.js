import { request, GET } from './apiClient';

// Typed access to the real microservices. Identity/authorization go through
// the Kong gateway (API_BASE_URL / AUTHZ_BASE_URL); academic, attendance,
// scheduling and notification are queried straight on their ports because
// their Kong routes require a JWT the app does not issue.
function toSnakeKey(key) {
  return String(key)
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

export function toSnakeDeep(value) {
  if (Array.isArray(value)) return value.map(toSnakeDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[toSnakeKey(k)] = toSnakeDeep(v);
    return out;
  }
  return value;
}

export function asList(data) {
  const norm = toSnakeDeep(data);
  if (Array.isArray(norm)) return norm;
  if (norm && typeof norm === 'object') {
    if (Array.isArray(norm.data)) return norm.data;
    if (Array.isArray(norm.items)) return norm.items;
    const singleArray = Object.values(norm).find((v) => Array.isArray(v));
    if (singleArray) return singleArray;
    return [norm];
  }
  return [];
}

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(base, path, params) {
  return `${base}${path}?${JSON.stringify(params || {})}`;
}

export async function backendGet(base, path, params = null, { useCache = false } = {}) {
  const key = cacheKey(base, path, params);
  if (useCache) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  }
  const data = await request({ method: GET, url: `${base}${path}`, params, requiresAuth: false });
  const list = asList(data);
  if (useCache) cache.set(key, { at: Date.now(), value: list });
  return list;
}

export function clearBackendCache() {
  cache.clear();
}
