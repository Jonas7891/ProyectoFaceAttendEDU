import { request, GET } from '../api/apiClient';
import AuthResponse from '../models/identity/AuthResponse';
import AuthRequest from '../models/identity/AuthRequest';
import { VerificationService } from './verificationService';
import { PasswordService } from './passwordService';

const USERS_ENDPOINT = 'app_user';
const PERSONS_ENDPOINT = 'person';
const ROLES_ENDPOINT = 'role';
const USER_ROLES_ENDPOINT = 'user_role';
const SESSIONS_ENDPOINT = 'user_session';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function unwrapFirst(data) {
  const arr = unwrap(data);
  return arr.length > 0 ? arr[0] : null;
}

export const AuthService = {
  login: async (email, password) => {
    // 1. Buscar person por email
    const personData = await request({
      method: GET,
      url: PERSONS_ENDPOINT,
      params: { email },
      requiresAuth: false,
    });
    const person = unwrapFirst(personData);
    if (!person) throw new Error('Credenciales inválidas');

    // 2. Buscar app_user por person_id
    const usersData = await request({
      method: GET,
      url: USERS_ENDPOINT,
      params: { person_id: person.person_id },
      requiresAuth: false,
    });
    const userRaw = unwrapFirst(usersData);
    if (!userRaw) throw new Error('Credenciales inválidas');

    // 3. Obtener role_ids del usuario desde user_role
    const userRolesData = await request({
      method: GET,
      url: USER_ROLES_ENDPOINT,
      params: { user_id: userRaw.user_id },
      requiresAuth: false,
    });
    const roleAssignments = unwrap(userRolesData);

    // 4. Obtener role_name por cada role_id
    const roleNames = [];
    for (const ur of roleAssignments) {
      const roleData = await request({
        method: GET,
        url: ROLES_ENDPOINT,
        params: { role_id: ur.role_id },
        requiresAuth: false,
      });
      const role = unwrapFirst(roleData);
      if (role?.role_name) roleNames.push(role.role_name);
    }

    // 5. Generar token temporal (JSON Server no soporta POST)
    const token = `mock-${userRaw.user_id}-${Date.now()}`;

    // 6. Construir AuthResponse
    return AuthResponse.fromApi({
      token,
      user: {
        user_id: userRaw.user_id,
        person_id: userRaw.person_id,
        username: userRaw.username,
        authentication_type: userRaw.authentication_type,
        status: userRaw.status,
        last_access: userRaw.last_access,
        roles: roleNames,
        person: person || null,
      },
    });
  },

  refreshToken: async (refreshToken) => {
    const token = `mock-refresh-${Date.now()}`;
    return AuthResponse.fromApi({ token });
  },

  logout: async (sessionId) => {
    // JSON Server no soporta POST/PUT, logout es local
  },

  forgotPassword: async (email) => {
    return VerificationService.sendRecoveryCode(email);
  },

  resetPassword: async (email, newPassword) => {
    return PasswordService.updatePassword(email, newPassword);
  },

  verifyCode: async (email, code) => {
    return VerificationService.verifyRecoveryCode(email, code);
  },
};
