import { request, GET } from '../api/apiClient';

const ENDPOINT = 'blood_type';

export const DEFAULT_BLOOD_TYPES = [
  { id: 'a+', label: 'A+' },
  { id: 'a-', label: 'A-' },
  { id: 'b+', label: 'B+' },
  { id: 'b-', label: 'B-' },
  { id: 'ab+', label: 'AB+' },
  { id: 'ab-', label: 'AB-' },
  { id: 'o+', label: 'O+' },
  { id: 'o-', label: 'O-' },
];

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function fromApi(item) {
  return {
    id: item.id ?? item.code,
    label: item.name ?? item.code,
  };
}

export const BloodTypeService = {
  getAll: async () => {
    try {
      const data = await request({ method: GET, url: ENDPOINT, requiresAuth: false });
      const mapped = unwrap(data).map(fromApi).filter((b) => b.id);
      return mapped.length > 0 ? mapped : DEFAULT_BLOOD_TYPES;
    } catch (error) {
      return DEFAULT_BLOOD_TYPES;
    }
  },
};
