// Catálogo fijo: no existe en el backend (persona guarda el código como texto)
// y la petición respondía siempre 404.
export const DEFAULT_DOCUMENT_TYPES = [
  { id: 'cc', label: 'Cédula de Ciudadanía (CC)', abreviatura: 'CC' },
  { id: 'ti', label: 'Tarjeta de Identidad (TI)', abreviatura: 'TI' },
  { id: 'ce', label: 'Cédula de Extranjería (CE)', abreviatura: 'CE' },
];

export const DocumentTypeService = {
  getAll: async () => DEFAULT_DOCUMENT_TYPES,
};
