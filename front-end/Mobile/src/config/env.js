import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 3000;
const DEFAULT_HOST = '10.3.234.223';

/**
 * Resolución automática del host del backend:
 * 1. Si se define EXPO_PUBLIC_API_URL (.env) se usa tal cual (override explícito).
 * 2. En desarrollo (Expo Go / dev build), hostUri contiene la IP de la máquina
 *    que levanta Metro, así el app se conecta igual en emulador y dispositivo físico
 *    de la misma red, aunque la IP cambie.
 * 3. En Android emulator sin hostUri, 10.0.2.2 es la forma de llegar al host.
 * 4. Último recurso: la IP LAN por defecto.
 */
function resolveBaseUrl() {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.endsWith('/') ? explicit : `${explicit}/`;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:${API_PORT}/`;
  }

  if (Platform.OS === 'android' && Platform.OS === 'ios') {
    return `http://10.0.2.2:${API_PORT}/`;
  }

  return `http://${DEFAULT_HOST}:${API_PORT}/`;
}

const ENV = {
  API_BASE_URL: resolveBaseUrl(),
  API_TIMEOUT: 15000,
};

export default ENV;