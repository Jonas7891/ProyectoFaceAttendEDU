import { request, GET } from '../api/apiClient';

const ENDPOINT = 'document_type';

export const DEFAULT_DOCUMENT_TYPES = [
  { id: 'cc', label: 'Cédula de Ciudadanía (CC)', abreviatura: 'CC' },
  { id: 'ti', label: 'Tarjeta de Identidad (TI)', abreviatura: 'TI' },
  { id: 'ce', label: 'Cédula de Extranjería (CE)', abreviatura: 'CE' },
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
    abreviatura: item.code ?? item.abreviatura,
  };
}

export const DocumentTypeService = {
  getAll: async () => {
    try {
      const data = await request({ method: GET, url: ENDPOINT, requiresAuth: false });
      const mapped = unwrap(data).map(fromApi).filter((d) => d.id);
      return mapped.length > 0 ? mapped : DEFAULT_DOCUMENT_TYPES;
    } catch (error) {
      return DEFAULT_DOCUMENT_TYPES;
    }
  },
};
