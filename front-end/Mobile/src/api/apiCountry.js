export const apiCountry = {
    getAllCountries: async () => {
        try {
            const response = await fetch(
                'https://countriesnow.space/api/v0.1/countries/codes'
            );
            const data = await response.json();

            if (!data.error && data.data) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: 'No se pudieron cargar los países.' };
            }
        } catch (err) {
            return { success: false, error: 'Error de conexión al cargar los países.' };
        }
    },
    getCitiesByCountry: async (countryName) => {
        try {
            const response = await fetch(
                'https://countriesnow.space/api/v0.1/countries/cities',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: countryName }),
                }
            );
            const data = await response.json();

            if (!data.error && data.data) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: 'No se pudieron cargar las ciudades.' };
            }
        } catch (err) {
            return { success: false, error: 'Error de conexión al cargar las ciudades.' };
        }
    },
};