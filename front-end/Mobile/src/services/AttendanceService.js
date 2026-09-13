import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import AttendanceRecord from '../models/attendance/AttendanceRecord';

const ENDPOINT = 'attendance_record';

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

export const AttendanceService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(AttendanceRecord.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return AttendanceRecord.fromApi(data);
  },

  getBySession: async (classSessionId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { class_session_id: classSessionId }, requiresAuth: false });
    return unwrap(data).map(AttendanceRecord.fromApi);
  },

  getByActor: async (academicActorId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { academic_actor_id: academicActorId }, requiresAuth: false });
    return unwrap(data).map(AttendanceRecord.fromApi);
  },

  getBySessionAndActor: async (classSessionId, academicActorId) => {
    const data = await request({
      method: GET,
      url: ENDPOINT,
      params: { class_session_id: classSessionId, academic_actor_id: academicActorId },
      requiresAuth: false,
    });
    return AttendanceRecord.fromApi(unwrapFirst(data));
  },

  create: async (recordData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: recordData.toApi(), requiresAuth: false });
    return AttendanceRecord.fromApi(data);
  },

  bulkCreate: async (records) => {
    const results = [];
    for (const r of records) {
      const data = await request({ method: POST, url: ENDPOINT, data: r.toApi(), requiresAuth: false });
      results.push(AttendanceRecord.fromApi(data));
    }
    return results;
  },

  update: async (id, recordData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: recordData.toApi(), requiresAuth: false });
    return AttendanceRecord.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
