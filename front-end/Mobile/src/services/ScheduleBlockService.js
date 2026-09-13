import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import ScheduleBlock from '../models/scheduling/ScheduleBlock';

const ENDPOINT = 'schedule_block';

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

export const ScheduleBlockService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(ScheduleBlock.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return ScheduleBlock.fromApi(data);
  },

  getByCohort: async (cohortId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { cohort_id: cohortId }, requiresAuth: false });
    return unwrap(data).map(ScheduleBlock.fromApi);
  },

  getByInstructor: async (instructorActorId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { instructor_actor_id: instructorActorId }, requiresAuth: false });
    return unwrap(data).map(ScheduleBlock.fromApi);
  },

  getByEnvironment: async (environmentId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { environment_id: environmentId }, requiresAuth: false });
    return unwrap(data).map(ScheduleBlock.fromApi);
  },

  getByDay: async (dayOfWeek) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { day_of_week: dayOfWeek }, requiresAuth: false });
    return unwrap(data).map(ScheduleBlock.fromApi);
  },

  create: async (blockData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: blockData.toApi(), requiresAuth: false });
    return ScheduleBlock.fromApi(data);
  },

  update: async (id, blockData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: blockData.toApi(), requiresAuth: false });
    return ScheduleBlock.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
