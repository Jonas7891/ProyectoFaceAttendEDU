const COUNTRIES_API = 'https://countriesnow.space/api/v0.1';

export const apiCountry = {
  getAllCountries: async () => {
    try {
      const response = await fetch(`${COUNTRIES_API}/countries/codes`);
      const data = await response.json();

      if (!data.error && data.data) {
        return { success: true, data: data.data };
      }
      return { success: false, error: 'No se pudieron cargar los países.' };
    } catch {
      return { success: false, error: 'Error de conexión al cargar los países.' };
    }
  },

  getCitiesByCountry: async (countryName) => {
    try {
      const response = await fetch(`${COUNTRIES_API}/countries/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName }),
      });
      const data = await response.json();

      if (!data.error && data.data) {
        return { success: true, data: data.data };
      }
      return { success: false, error: 'No se pudieron cargar las ciudades.' };
    } catch {
      return { success: false, error: 'Error de conexión al cargar las ciudades.' };
    }
  },
};
