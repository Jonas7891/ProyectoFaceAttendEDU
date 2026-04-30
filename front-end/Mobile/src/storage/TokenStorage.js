import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = "auth_token";

/**
 * Guarda el token con metadata (fecha de guardado y expiración opcional)
 * @param {string} token
 * @param {number|null} expiresIn segundos hasta que expire (opcional)
 */
export const saveToken = async (token, expiresIn = null) => {
  if (!token || typeof token !== "string") {
    console.warn("Token inválido");
    return;
  }

  const data = {
    token,
    savedAt: Date.now(),
    expiresIn, // en segundos
  };

  try {
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error guardando token:", error);
  }
};

/**
 * Obtiene el token si no ha expirado
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  try {
    const value = await AsyncStorage.getItem(TOKEN_KEY);
    if (!value) return null;

    const parsed = JSON.parse(value);

    // Validación básica
    if (!parsed?.token) return null;

    // Validar expiración si existe
    if (parsed.expiresIn) {
      const now = Date.now();
      const expiresAt = parsed.savedAt + parsed.expiresIn * 1000;

      if (now > expiresAt) {
        await removeToken();
        return null;
      }
    }

    return parsed.token;
  } catch (error) {
    console.error("Error obteniendo token:", error);
    return null;
  }
};

/**
 * Elimina el token
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error eliminando token:", error);
  }
};

/**
 * Verifica si hay un token válido
 * @returns {Promise<boolean>}
 */
export const hasValidToken = async () => {
  const token = await getToken();
  return !!token;
};