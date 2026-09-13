import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import BiometricUpdateCase from '../models/configuration/BiometricUpdateCase';

const ENDPOINT = 'biometric_update_case';

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

export const BiometricCaseService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(BiometricUpdateCase.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return BiometricUpdateCase.fromApi(data);
  },

  getByPerson: async (personId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { person_id: personId }, requiresAuth: false });
    return unwrap(data).map(BiometricUpdateCase.fromApi);
  },

  getPending: async () => {
    const data = await request({ method: GET, url: ENDPOINT, params: { update_status: 'Pending' }, requiresAuth: false });
    return unwrap(data).map(BiometricUpdateCase.fromApi);
  },

  getPendingByPerson: async (personId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { person_id: personId, update_status: 'Pending' }, requiresAuth: false });
    return unwrap(data).map(BiometricUpdateCase.fromApi);
  },

  create: async (caseData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: caseData.toApi(), requiresAuth: false });
    return BiometricUpdateCase.fromApi(data);
  },

  update: async (id, caseData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: caseData.toApi(), requiresAuth: false });
    return BiometricUpdateCase.fromApi(data);
  },

  approve: async (id, reviewerId, notes = null) => {
    const data = await request({
      method: PUT,
      url: `${ENDPOINT}/${id}`,
      data: { reviewed_by: reviewerId, update_status: 'Approved', resolution_notes: notes },
      requiresAuth: false,
    });
    return BiometricUpdateCase.fromApi(data);
  },

  reject: async (id, reviewerId, notes = null) => {
    const data = await request({
      method: PUT,
      url: `${ENDPOINT}/${id}`,
      data: { reviewed_by: reviewerId, update_status: 'Rejected', resolution_notes: notes },
      requiresAuth: false,
    });
    return BiometricUpdateCase.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
