import { request, GET, POST } from '../api/apiClient';

const ENDPOINT = 'audit_log';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  return data ? [data] : [];
}

export const AuditService = {
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

  getByActor: async (actorId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { actor_id: actorId }, requiresAuth: false });
    return unwrap(data);
  },

  getByAggregate: async (aggregateType, aggregateId) => {
    const data = await request({
      method: GET,
      url: ENDPOINT,
      params: { aggregate_type: aggregateType, aggregate_id: aggregateId },
      requiresAuth: false,
    });
    return unwrap(data);
  },

  log: async (auditData) => {
    return request({ method: POST, url: ENDPOINT, data: auditData, requiresAuth: false });
  },
};
