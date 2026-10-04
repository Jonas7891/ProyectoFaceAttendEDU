import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import { backendGet, toSnakeDeep } from '../api/backend';
import ENV from '../config/env';
import AcademicActor from '../models/academic/AcademicActor';

const ENDPOINT = 'api/v1/academic-actors';
const BASE = () => ENV.ACADEMIC_BASE_URL;

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
    return unwrap(data).map((a) => AcademicActor.fromApi(toSnakeDeep(a)));
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return AcademicActor.fromApi(toSnakeDeep(unwrapFirst(data)));
  },

  // Backend: GET /api/v1/academic-actors no filtra; existe la ruta anidada
  // GET /api/v1/schools/:schoolId/actors. actorType: 'STUDENT' (1) | 'INSTRUCTOR' (2).
  getBySchool: async (schoolId, actorType = null) => {
    const data = await request({ method: GET, url: `api/v1/schools/${schoolId}/actors`, requiresAuth: false });
    const typeId = actorType === 'STUDENT' ? 1 : actorType === 'INSTRUCTOR' ? 2 : null;
    return unwrap(data)
      .map((a) => AcademicActor.fromApi(toSnakeDeep(a)))
      .filter((a) => !typeId || a?.actorTypeId === typeId);
  },

  getByPerson: async (personId) => {
    if (!personId) return [];
    const actors = await backendGet(BASE(), ENDPOINT, { limit: 2000 });
    return actors
      .filter((a) => String(a.person_id ?? a.personId) === String(personId))
      .map(AcademicActor.fromApi);
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
