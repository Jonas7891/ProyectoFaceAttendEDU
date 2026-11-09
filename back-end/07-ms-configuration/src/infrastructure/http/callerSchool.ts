import type { FastifyRequest } from 'fastify';
import { createCallerSchoolResolver, ScopeError, type CallerSchool } from '@faceattend/auth';
import { getJson } from './authGuard';

// The roles lookup, the Super Administrador rule and the cache live in
// back-end/shared/auth-node; this service only says how it reads the actors.
export { ScopeError, clearCallerSchoolCache } from '@faceattend/auth';
export type { CallerSchool };

/** The caller's academic actors, read from academic with the caller's own token. */
async function actorsOf(personId: string, token: string): Promise<Array<{ schoolId?: number }>> {
  const academicUrl = process.env.ACADEMIC_URL || 'http://localhost:8083';
  try {
    const res = await getJson(`${academicUrl}/api/v1/academic-actors?personId=${encodeURIComponent(personId)}&limit=5`, token);
    return res.status === 200 && Array.isArray(res.body) ? res.body : [];
  } catch {
    throw new ScopeError(503, 'Cannot resolve the caller school');
  }
}

const resolve = createCallerSchoolResolver({ getJson, actorsOf });

/**
 * Resolves the school of an authenticated request (the auth guard has
 * already validated the session and set `userId` / `authToken`).
 */
export function resolveCallerSchool(req: FastifyRequest): Promise<CallerSchool> {
  return resolve(req as { userId?: string; authToken?: string });
}
