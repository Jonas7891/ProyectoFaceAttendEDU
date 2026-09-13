import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import Person from '../models/identity/Person';

const ENDPOINT = 'person';

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

export const PersonService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(Person.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return Person.fromApi(data);
  },

  getByDocument: async (documentNumber) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { document_number: documentNumber }, requiresAuth: false });
    return Person.fromApi(unwrapFirst(data));
  },

  create: async (personData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: personData.toApi(), requiresAuth: false });
    return Person.fromApi(data);
  },

  update: async (id, personData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: personData.toApi(), requiresAuth: false });
    return Person.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};
