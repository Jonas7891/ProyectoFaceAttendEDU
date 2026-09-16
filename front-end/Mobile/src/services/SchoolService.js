import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import School from '../models/academic/School';

const ENDPOINT = 'school';

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

export const SchoolService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(School.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return School.fromApi(data);
  },

  create: async (schoolData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: schoolData.toApi(), requiresAuth: false });
    return School.fromApi(data);
  },

  update: async (id, schoolData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: schoolData.toApi(), requiresAuth: false });
    return School.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
