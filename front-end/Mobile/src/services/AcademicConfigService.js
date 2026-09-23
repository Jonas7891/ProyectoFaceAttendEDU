import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import AcademicConfiguration from '../models/configuration/AcademicConfiguration';

const ENDPOINT = 'academic_configuration';

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

export const AcademicConfigService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(AcademicConfiguration.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return AcademicConfiguration.fromApi(data);
  },

  getBySchool: async (schoolId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { school_id: schoolId }, requiresAuth: false });
    return unwrap(data).map(AcademicConfiguration.fromApi);
  },

  getByName: async (schoolId, configName) => {
    const data = await request({
      method: GET,
      url: ENDPOINT,
      params: { school_id: schoolId, configuration_name: configName },
      requiresAuth: false,
    });
    return AcademicConfiguration.fromApi(unwrapFirst(data));
  },

  create: async (configData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: configData.toApi(), requiresAuth: false });
    return AcademicConfiguration.fromApi(data);
  },

  update: async (id, configData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: configData.toApi(), requiresAuth: false });
    return AcademicConfiguration.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
