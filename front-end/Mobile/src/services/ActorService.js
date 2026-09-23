import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import AcademicActor from '../models/academic/AcademicActor';

const ENDPOINT = 'academic_actor';

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

export const ActorService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(AcademicActor.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return AcademicActor.fromApi(unwrapFirst(data));
  },

  getBySchool: async (schoolId, actorType = null) => {
    const params = { school_id: schoolId };
    if (actorType) params.actor_type = actorType;
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(AcademicActor.fromApi);
  },

  getByPerson: async (personId) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { person_id: personId }, requiresAuth: false });
    return unwrap(data).map(AcademicActor.fromApi);
  },

  getStudents: async (schoolId) => {
    return ActorService.getBySchool(schoolId, 'STUDENT');
  },

  getInstructors: async (schoolId) => {
    return ActorService.getBySchool(schoolId, 'INSTRUCTOR');
  },

  create: async (actorData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: actorData.toApi(), requiresAuth: false });
    return AcademicActor.fromApi(data);
  },

  update: async (id, actorData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: actorData.toApi(), requiresAuth: false });
    return AcademicActor.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
