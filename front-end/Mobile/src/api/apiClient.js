// services/apiClient.js
import { getToken } from "../storage/TokenStorage";

export async function request({
  method,
  url,
  data = null,
  requiresAuth = false // ← clave para el futuro
}) {

  const headers = {
    "Content-Type": "application/json"
  };

  // 🔐 JWT (solo si se necesita)
  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(result?.message || "Error en la petición");
  }

  return result;
}