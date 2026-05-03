import { jwtDecode } from "jwt-decode";

export default class AuthResponse {
  constructor(token, user) {
    this.token = token;
    this.user = user;
  }

  static fromApi(data) {
    const token = data.token;
    let user = { roles: [] };

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // El token contiene "roles" como array
        user = {
          // Puedes mapear más campos si quieres (sub, userId, etc.)
          roles: decoded.roles || [],
          email: decoded.sub || "",
          userId: decoded.userId,
        };
      } catch (e) {
        console.warn("Error decodificando token", e);
      }
    }

    return new AuthResponse(token, user);
  }
}