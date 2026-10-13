import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import { toSnakeDeep } from '../api/backend';
import Environment from '../models/scheduling/Environment';

const ENDPOINT = 'environment';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function unwrapFirst(data) {
  const arr = unwrap(data);
  return arr.length > 0 ? arr[0] : null;
}

function fromRow(row) {
  return Environment.fromApi(toSnakeDeep(row));
}

// ms-scheduling (Java) habla camelCase: el toApi en snake respondía 400.
// Los null se omiten porque la validación los rechaza.
function environmentBody(envData) {
  const e = envData ?? {};
  const body = {
    schoolId: e.schoolId ?? e.school_id,
    code: e.code,
    name: e.name,
    capacity: e.capacity,
    status: e.status,
  };
  Object.keys(body).forEach((k) => (body[k] === null || body[k] === undefined) && delete body[k]);
  return body;
}

export const EnvironmentService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(fromRow);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return fromRow(unwrapFirst(data) ?? data);
  },

  getBySchool: async (schoolId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { schoolId }, requiresAuth: false });
    return unwrap(data).map(fromRow);
  },

  create: async (envData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: environmentBody(envData), requiresAuth: false });
    return fromRow(data);
  },

  update: async (id, envData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: environmentBody(envData), requiresAuth: false });
    return fromRow(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
