import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import Enrollment from '../models/academic/Enrollment';

const ENDPOINT = 'enrollment';

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

export const EnrollmentService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(Enrollment.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return Enrollment.fromApi(data);
  },

  getByActor: async (academicActorId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { academic_actor_id: academicActorId }, requiresAuth: false });
    return unwrap(data).map(Enrollment.fromApi);
  },

  getByCohort: async (cohortId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { cohort_id: cohortId }, requiresAuth: false });
    return unwrap(data).map(Enrollment.fromApi);
  },

  getActiveByActor: async (academicActorId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { academic_actor_id: academicActorId, enrollment_status: 'Active' }, requiresAuth: false });
    return unwrap(data).map(Enrollment.fromApi);
  },

  create: async (enrollmentData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: enrollmentData.toApi(), requiresAuth: false });
    return Enrollment.fromApi(data);
  },

  update: async (id, enrollmentData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: enrollmentData.toApi(), requiresAuth: false });
    return Enrollment.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
