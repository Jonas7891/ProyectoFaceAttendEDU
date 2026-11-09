import type { FastifyRequest } from 'fastify';
import { createCallerSchoolResolver as createSharedResolver } from '@faceattend/auth';
import { getJson } from './authGuard';
import type { AcademicPorts } from '../../domain/ports/out/AcademicPorts';
import type { CallerSchool } from '../../application/access/CallerSchool';

// The roles lookup, the Super Administrador rule and the cache live in
// back-end/shared/auth-node; this service only says where its actors are.
export { ScopeError, clearCallerSchoolCache } from '@faceattend/auth';
export type { CallerSchool };

/**
 * Builds a resolver bound to this service's own repositories: unlike other
 * services, 03-ms-academic owns `academic_actor` itself, so the caller's
 * school is read in-process instead of over HTTP.
 */
export function createCallerSchoolResolver(repos: Pick<AcademicPorts, 'actors'>) {
  const resolve = createSharedResolver({
    getJson,
    actorsOf: (personId) => repos.actors.findByPerson(personId),
  });
  return (req: FastifyRequest): Promise<CallerSchool> => resolve(req as { userId?: string; authToken?: string });
}
