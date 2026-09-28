import { request, GET, POST } from '../api/apiClient';
import { toSnakeDeep } from '../api/backend';
import ENV from '../config/env';
import AuthResponse from '../models/identity/AuthResponse';
import AuthRequest from '../models/identity/AuthRequest';
import { saveToken } from '../storage/TokenStorage';
import { VerificationService } from './verificationService';
import { PasswordService } from './passwordService';

const LOGIN_ENDPOINT = 'api/v1/auth/login';
const LOGOUT_ENDPOINT = 'api/v1/auth/logout';
const PERSONS_ENDPOINT = 'api/v1/persons';
const USERS_ENDPOINT = 'api/v1/users';
const PAGE_LIMIT = 2000;

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function unwrapPage(data) {
  if (data && Array.isArray(data.data)) return data.data;
  return unwrap(data);
}

async function doLogin(username, password) {
  const body = new AuthRequest({ username, password }).toApi?.() ?? { username, password };
  const session = await request({
    method: POST,
    url: LOGIN_ENDPOINT,
    data: body,
    requiresAuth: false,
  });
  return session;
}

async function resolveProfile(userId) {
  // Session responses carry no person data: match user + person from identity lists.
  // Requiere sesión (los listados ya no son públicos); el token se guarda
  // en login antes de llamar aquí.
  try {
    const users = await request({
      method: GET,
      url: USERS_ENDPOINT,
      params: { page: 1, limit: PAGE_LIMIT },
      requiresAuth: true,
    });
    const user = unwrapPage(users).find((u) => u.userId === userId || u.user_id === userId);
    if (!user) return { person: null, username: null };
    const personId = user.personId || user.person_id;
    let person = null;
    try {
      person = toSnakeDeep(await request({ method: GET, url: `${PERSONS_ENDPOINT}/${personId}`, requiresAuth: true }));
    } catch {
      person = null;
    }
    return { person, username: user.username };
  } catch {
    return { person: null, username: null };
  }
}

async function fetchRoleNames(userId) {
  try {
    // Roles directos a ms-authorization con el Bearer de la sesión.
    const data = await request({
      method: GET,
      url: `${ENV.AUTHZ_BASE_URL}api/v1/users/${userId}/roles`,
      requiresAuth: true,
    });
    return unwrap(data)
      .map((r) => r.roleName || r.role_name)
      .filter(Boolean);
  } catch (e) {
    throw new Error('No se pudieron verificar los roles del usuario en el backend');
  }
}

// Verifica que el rol tenga efecto real vía /auth/evaluate.
// Falla cerrado: sin verificación no hay login.
async function evaluatePermission(userId, permission) {
  const data = await request({
    method: GET,
    url: `${ENV.AUTHZ_BASE_URL}api/v1/auth/evaluate?userId=${encodeURIComponent(userId)}&permission=${encodeURIComponent(permission)}`,
    requiresAuth: true,
  });
  const allowed = data?.allowed ?? data?.[0]?.allowed ?? false;
  if (!allowed) throw new Error('Rol sin permisos verificados en el backend');
  return true;
}

export const AuthService = {
  login: async (email, password) => {
    // Login directo por username: los listados de persons/users ya no son
    // públicos, así que no hay resolución email->username sin sesión.
    const identity = (email || '').trim();
    let session = null;
    let person = null;
    let username = identity;

    try {
      session = await doLogin(identity, password);
    } catch (err) {
      if (err && (err.status === 400 || err.status === 401)) throw new Error('Credenciales inválidas');
      throw err;
    }

    const sessionId = session?.sessionId || session?.session_id || session?.id;
    const userId = session?.userId || session?.user_id;
    if (!sessionId || !userId) throw new Error('No se pudo crear la sesión');

    // Guardar el token ANTES de las llamadas autenticadas (roles, perfil, evaluate).
    const saved = await saveToken(String(sessionId));
    if (!saved) throw new Error('No se pudo guardar la sesión');

    // 3. Load roles for navigation/theming. Sin fallback: sin roles no hay login.
    const roleNames = await fetchRoleNames(userId);
    if (!roleNames || roleNames.length === 0) {
      throw new Error('El usuario no tiene roles asignados en el backend');
    }

    // 3b. Verificar que el rol tenga permisos efectivos.
    await evaluatePermission(userId, 'attendance.record:read');

    // 3b. Complete the profile (person data) when login used the username directly.
    if (!person?.person_id) {
      const profile = await resolveProfile(userId);
      person = profile.person ? toSnakeDeep(profile.person) : person;
      if (profile.username) username = profile.username;
    }
    const personName = person ? [person.name, person.last_name].filter(Boolean).join(' ') : null;

    // 4. Build AuthResponse keeping the app-level shape.
    return AuthResponse.fromApi({
      token: String(sessionId),
      user: {
        user_id: userId,
        person_id: person?.person_id || null,
        username,
        email: person?.email || (identity.includes('@') ? identity : null),
        name: personName,
        roles: roleNames,
        person: person || null,
      },
    });
  },

  refreshToken: async () => {
    // The backend issues opaque session ids without refresh rotation.
    throw new Error('Sesión no renovable: vuelve a iniciar sesión');
  },

  logout: async (sessionId) => {
    if (!sessionId) return;
    await request({
      method: POST,
      url: LOGOUT_ENDPOINT,
      params: { sessionId },
      requiresAuth: false,
    }).catch(() => null);
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
