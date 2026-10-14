import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import { toSnakeDeep } from '../api/backend';
import School from '../models/academic/School';

const ENDPOINT = 'school';

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

function fromRow(row) {
  return School.fromApi(toSnakeDeep(row));
}

// El backend (03, zod) habla camelCase y desconoce las llaves snake: antes
// el PUT llegaba con school_id/code/name en snake, zod las descartaba y el
// guardado era un no-op silencioso. Los null se omiten (zod los rechaza).
function schoolBody(schoolData) {
  const body = {
    code: schoolData.code,
    name: schoolData.name,
    cityId: schoolData.cityId ?? schoolData.city_id,
    address: schoolData.address,
    phone: schoolData.phone,
    email: schoolData.email,
  };
  Object.keys(body).forEach((k) => (body[k] === null || body[k] === undefined) && delete body[k]);
  return body;
}

export const SchoolService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map((s) => School.fromApi(toSnakeDeep(s)));
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return School.fromApi(toSnakeDeep(unwrapFirst(data)));
  },

  create: async (schoolData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: schoolBody(schoolData), requiresAuth: false });
    return fromRow(data);
  },

  update: async (id, schoolData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: schoolBody(schoolData), requiresAuth: false });
    return fromRow(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
