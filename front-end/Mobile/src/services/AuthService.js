import { request, GET, POST } from '../api/apiClient';
import { toSnakeDeep } from '../api/backend';
import ENV from '../config/env';
import AuthResponse from '../models/identity/AuthResponse';
import AuthRequest from '../models/identity/AuthRequest';
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

async function resolveUsernameByEmail(email) {
  const normalized = (email || '').toLowerCase().trim();
  const personsData = await request({
    method: GET,
    url: PERSONS_ENDPOINT,
    params: { page: 1, limit: PAGE_LIMIT },
    requiresAuth: false,
  });
  const personRaw = unwrapPage(personsData).find(
    (p) => ((p.email || p.mail || '')).toLowerCase().trim() === normalized
  );
  const person = personRaw ? toSnakeDeep(personRaw) : null;
  if (!person) return null;

  const usersData = await request({
    method: GET,
    url: USERS_ENDPOINT,
    params: { page: 1, limit: PAGE_LIMIT },
    requiresAuth: false,
  });
  const userRaw = unwrapPage(usersData).find((u) => (u.person_id || u.personId) === person.person_id);
  return userRaw ? { username: userRaw.username, person } : null;
}

async function resolveProfile(userId) {
  // Session responses carry no person data: match user + person from identity lists.
  try {
    const users = await request({
      method: GET,
      url: USERS_ENDPOINT,
      params: { page: 1, limit: PAGE_LIMIT },
      requiresAuth: false,
    });
    const user = unwrapPage(users).find((u) => u.userId === userId || u.user_id === userId);
    if (!user) return { person: null, username: null };
    const personId = user.personId || user.person_id;
    let person = null;
    try {
      person = toSnakeDeep(await request({ method: GET, url: `${PERSONS_ENDPOINT}/${personId}`, requiresAuth: false }));
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
    // Authorization routes require Kong JWT, so roles are fetched straight
    // from ms-authorization (no JWT plugin on direct access).
    const data = await request({
      method: GET,
      url: `${ENV.AUTHZ_BASE_URL}api/v1/users/${userId}/roles`,
      requiresAuth: false,
    });
    return unwrap(data)
      .map((r) => r.roleName || r.role_name)
      .filter(Boolean);
  } catch (e) {
    console.warn('Could not fetch user roles:', e?.message || e);
    return [];
  }
}

export const AuthService = {
  login: async (email, password) => {
    const identity = (email || '').trim();
    let session = null;
    let person = null;
    let username = identity;

    try {
      // 1. Try the input directly as username.
      session = await doLogin(identity, password);
    } catch (err) {
      // 2. Fall back to email -> username resolution.
      if (!err || (err.status !== 400 && err.status !== 401)) throw err;
      const resolved = await resolveUsernameByEmail(identity).catch(() => null);
      if (!resolved) throw new Error('Credenciales inválidas');
      person = resolved.person;
      username = resolved.username;
      try {
        session = await doLogin(resolved.username, password);
      } catch {
        throw new Error('Credenciales inválidas');
      }
    }

    const sessionId = session?.sessionId || session?.session_id || session?.id;
    const userId = session?.userId || session?.user_id;
    if (!sessionId || !userId) throw new Error('No se pudo crear la sesión');

    // 3. Load roles for navigation/theming.
    const roleNames = await fetchRoleNames(userId);

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
