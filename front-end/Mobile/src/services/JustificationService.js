import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import Justification from '../models/attendance/Justification';

const ENDPOINT = 'justification';

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

export const JustificationService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(Justification.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return Justification.fromApi(data);
  },

  getByAttendanceRecord: async (attendanceRecordId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { attendance_record_id: attendanceRecordId }, requiresAuth: false });
    return Justification.fromApi(unwrapFirst(data));
  },

  getPending: async (schoolId = null) => {
    const params = { review_status: 'Pending' };
    if (schoolId) params.school_id = schoolId;
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(Justification.fromApi);
  },

  getByActor: async (academicActorId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { academic_actor_id: academicActorId }, requiresAuth: false });
    return unwrap(data).map(Justification.fromApi);
  },

  create: async (justificationData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: justificationData.toApi(), requiresAuth: false });
    return Justification.fromApi(data);
  },

  update: async (id, justificationData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: justificationData.toApi(), requiresAuth: false });
    return Justification.fromApi(data);
  },

  approve: async (id, reviewerId, notes = null) => {
    const data = await request({
      method: PUT,
      url: `${ENDPOINT}/${id}`,
      data: { reviewed_by: reviewerId, review_status: 'Approved', resolution_notes: notes },
      requiresAuth: false,
    });
    return Justification.fromApi(data);
  },

  reject: async (id, reviewerId, notes = null) => {
    const data = await request({
      method: PUT,
      url: `${ENDPOINT}/${id}`,
      data: { reviewed_by: reviewerId, review_status: 'Rejected', resolution_notes: notes },
      requiresAuth: false,
    });
    return Justification.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
