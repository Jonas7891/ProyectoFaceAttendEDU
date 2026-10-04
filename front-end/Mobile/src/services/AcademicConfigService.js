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

  // Backend: GET /api/v1/academic-configurations solo filtra ?name=, así que
  // school_id se filtra en cliente.
  getBySchool: async (schoolId) => {
    const data = await request({ method: GET, url: ENDPOINT, requiresAuth: false });
    return unwrap(data)
      .map(AcademicConfiguration.fromApi)
      .filter((c) => String(c?.schoolId) === String(schoolId));
  },

  getByName: async (schoolId, configName) => {
    const data = await request({
      method: GET,
      url: ENDPOINT,
      params: { name: configName },
      requiresAuth: false,
    });
    return AcademicConfiguration.fromApi(
      unwrap(data)
        .map(AcademicConfiguration.fromApi)
        .find((c) => String(c?.schoolId) === String(schoolId) && c?.configurationName === configName) || null,
    );
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
