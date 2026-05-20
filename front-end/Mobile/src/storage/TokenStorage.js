import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "auth_token";

export const saveToken = async (token) => {
  if (!token || typeof token !== 'string') {
    console.warn("saveToken: token inválido");
    return false;
  }

  let expiresAt = null;
  try {
    const decoded = jwtDecode(token);
    expiresAt = decoded.exp ? decoded.exp * 1000 : null;
    if (expiresAt && expiresAt <= Date.now()) {
      console.warn("saveToken: token expirado");
      return false;
    }
  } catch (e) {
    // En desarrollo, si el token no es JWT válido, lo guardamos igual
    console.warn("saveToken: token no es JWT válido, guardando de todos modos:", e.message);
  }

  const data = { token, savedAt: Date.now(), expiresAt };
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(data));
  console.log("saveToken: token guardado exitosamente");
  return true;
};

export const getToken = async () => {
  try {
    const raw = await AsyncStorage.getItem(TOKEN_KEY);
    if (!raw) return null;

    const { token, expiresAt } = JSON.parse(raw);
    if (!token) return null;

    if (expiresAt && Date.now() > expiresAt) {
      await removeToken();
      return null;
    }

    return token;
  } catch {
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch {
    return false;
  }
};

export const hasValidToken = async () => {
  return (await getToken()) !== null;
};