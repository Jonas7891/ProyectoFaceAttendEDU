import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import AcademicPeriod from '../models/academic/AcademicPeriod';

const ENDPOINT = 'academic_period';

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

export const PeriodService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(AcademicPeriod.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return AcademicPeriod.fromApi(data);
  },

  getBySchool: async (schoolId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { school_id: schoolId }, requiresAuth: false });
    return unwrap(data).map(AcademicPeriod.fromApi);
  },

  getActiveBySchool: async (schoolId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { school_id: schoolId, is_active: true }, requiresAuth: false });
    return AcademicPeriod.fromApi(unwrapFirst(data));
  },

  create: async (periodData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: periodData.toApi(), requiresAuth: false });
    return AcademicPeriod.fromApi(data);
  },

  update: async (id, periodData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: periodData.toApi(), requiresAuth: false });
    return AcademicPeriod.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
