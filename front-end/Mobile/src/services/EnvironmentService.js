import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
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

export const EnvironmentService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(Environment.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return Environment.fromApi(data);
  },

  getBySchool: async (schoolId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { school_id: schoolId }, requiresAuth: false });
    return unwrap(data).map(Environment.fromApi);
  },

  create: async (envData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: envData.toApi(), requiresAuth: false });
    return Environment.fromApi(data);
  },

  update: async (id, envData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: envData.toApi(), requiresAuth: false });
    return Environment.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
