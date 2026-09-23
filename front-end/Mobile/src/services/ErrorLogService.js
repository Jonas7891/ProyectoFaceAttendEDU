import { request, GET, POST } from '../api/apiClient';

const ENDPOINT = 'error_log';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  return data ? [data] : [];
}

export const ErrorLogService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data);
  },

  getById: async (id) => {
    return request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },

  getBySchool: async (schoolId, params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { ...params, school_id: schoolId }, requiresAuth: false });
    return unwrap(data);
  },

  getByUser: async (userId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { user_id: userId }, requiresAuth: false });
    return unwrap(data);
  },

  log: async (errorData) => {
    return request({ method: POST, url: ENDPOINT, data: errorData, requiresAuth: false });
  },
};
