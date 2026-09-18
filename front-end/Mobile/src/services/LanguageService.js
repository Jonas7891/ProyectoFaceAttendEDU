import { request, GET } from '../api/apiClient';

const ENDPOINT = 'language';

export const DEFAULT_LANGUAGES = [
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'en', name: '🇬🇧 English' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'pt', name: '🇵🇹 Português' },
];

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

const FLAGS = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷', pt: '🇵🇹' };

function fromApi(item) {
  const code = item.code ?? item.id;
  const flag = item.flag ?? FLAGS[code] ?? '';
  return {
    code,
    name: `${flag ? `${flag} ` : ''}${item.name ?? code}`,
  };
}

export const LanguageService = {
  getAll: async () => {
    try {
      const data = await request({ method: GET, url: ENDPOINT, requiresAuth: false });
      const mapped = unwrap(data).map(fromApi).filter((l) => l.code);
      return mapped.length > 0 ? mapped : DEFAULT_LANGUAGES;
    } catch (error) {
      return DEFAULT_LANGUAGES;
    }
  },
};
