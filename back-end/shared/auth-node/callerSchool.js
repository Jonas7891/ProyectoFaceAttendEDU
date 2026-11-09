'use strict';

/**
 * The school a caller may manage, shared by the Node services that confine an
 * Administrador to their own school (academic, configuration). Same rule as the
 * Java CallerSchoolLookup: Super Administrador (no school of its own) is
 * unrestricted; everyone else gets the school of their own academic_actor, or
 * none, which must fail secure (own nothing), never "manage everything".
 *
 * Each service says how it finds the actors of a person (academic reads its own
 * table, configuration asks academic over HTTP) and passes the getJson it uses,
 * so its tests can stub the calls.
 */

/** Role names as authorization stores them (seed SUPER_ADMIN, SCHOOL_ADMIN, INSTRUCTOR, STUDENT). */
const ROLES = Object.freeze({
  SUPER_ADMIN: 'Super Administrador',
  SCHOOL_ADMIN: 'Administrador',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Aprendiz',
});

/** Thrown when the scope cannot be resolved; the route answers with this status (403 or 503). */
class ScopeError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const CALLER_SCHOOL_TTL_MS = 30_000;
const cache = new Map();

/** Test hook: forget what has been resolved so far. */
function clearCallerSchoolCache() {
  cache.clear();
}

function store(userId, now, value) {
  cache.set(userId, { value, expiresAt: now + CALLER_SCHOOL_TTL_MS });
  return value;
}

function createCallerSchoolResolver({ getJson, actorsOf }) {
  return async function resolveCallerSchool(req) {
    const userId = req.userId;
    const token = req.authToken;
    if (!userId || !token) throw new ScopeError(403, 'No authenticated user');

    const now = Date.now();
    const cached = cache.get(userId);
    if (cached && cached.expiresAt > now) return cached.value;

    const identityUrl = process.env.IDENTITY_URL || 'http://localhost:8081';
    const authorizationUrl = process.env.AUTHORIZATION_URL || 'http://localhost:8082';

    let roles;
    try {
      const res = await getJson(`${authorizationUrl}/api/v1/users/${encodeURIComponent(userId)}/roles`, token);
      roles = res.status === 200 && Array.isArray(res.body)
        ? res.body.map((r) => r && r.roleName).filter((n) => typeof n === 'string')
        : [];
    } catch {
      throw new ScopeError(503, 'Cannot verify roles');
    }
    if (roles.includes(ROLES.SUPER_ADMIN)) return store(userId, now, { isSuperAdmin: true, schoolId: null });

    let personId;
    try {
      const user = await getJson(`${identityUrl}/api/v1/users/${encodeURIComponent(userId)}`, token);
      personId = user.status === 200 && user.body ? user.body.personId : undefined;
    } catch {
      throw new ScopeError(503, 'Cannot resolve the user person');
    }
    if (typeof personId !== 'string' || !personId) return store(userId, now, { isSuperAdmin: false, schoolId: null });

    const actors = await actorsOf(personId, token);
    const withSchool = actors.find((a) => a && a.schoolId != null);
    return store(userId, now, { isSuperAdmin: false, schoolId: withSchool ? withSchool.schoolId : null });
  };
}

module.exports = { ROLES, ScopeError, createCallerSchoolResolver, clearCallerSchoolCache, CALLER_SCHOOL_TTL_MS };
