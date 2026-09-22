import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

const TOKEN_KEY = "auth_token";

/**
 * Guarda el token con metadata (fecha de guardado y expiración opcional)
 * @param {string} token
 * @param {number|null} expiresIn segundos hasta que expire (opcional)
 */
export const saveToken = async (token) => {
    // Guardar token junto con la fecha de expiración extraída del JWT
    let expiresAt = null;
    try {
        const decoded = jwtDecode(token);
        if (decoded.exp) {
            expiresAt = decoded.exp * 1000; // a milisegundos
        }
    } catch (e) {}

    const data = {
        token,
        savedAt: Date.now(),
        expiresAt, // opcional si usas la expiración del propio token
    };

    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(data));
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