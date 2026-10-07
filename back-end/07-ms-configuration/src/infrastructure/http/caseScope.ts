import type { FastifyRequest } from 'fastify';
import { getJson } from './authGuard';

/**
 * Whose biometric update cases a caller may see.
 *  - `all`: reviewers (permission `biometric.case:review`: admin, instructor) see every case.
 *  - otherwise only the cases of the caller's own person.
 */
export interface CaseScope {
  readonly all: boolean;
  readonly personId?: string;
}

/** Thrown when the scope cannot be resolved; the route answers with this status. */
export class ScopeError extends Error {
  constructor(readonly statusCode: 403 | 503, message: string) {
    super(message);
  }
}

const REVIEW_PERMISSION = 'biometric.case:review';
const CACHE_TTL_MS = 30_000;

const personCache = new Map<string, { personId: string; expiresAt: number }>();
const reviewerCache = new Map<string, number>();

/** Test hook: forget what has been resolved so far. */
export function clearCaseScopeCache(): void {
  personCache.clear();
  reviewerCache.clear();
}

/**
 * Resolves the scope of an authenticated request (the auth guard has already
 * validated the session and set `userId` / `authToken`). Only positive answers
 * are cached, for a few seconds, like the auth filters of the other services.
 */
export async function resolveCaseScope(req: FastifyRequest): Promise<CaseScope> {
  const userId = (req as any).userId as string | undefined;
  const token = (req as any).authToken as string | undefined;
  if (!userId || !token) throw new ScopeError(403, 'No authenticated user');

  const now = Date.now();
  const identityUrl = process.env.IDENTITY_URL || 'http://localhost:8081';
  const authorizationUrl = process.env.AUTHORIZATION_URL || 'http://localhost:8082';

  if ((reviewerCache.get(userId) ?? 0) > now) return { all: true };
  try {
    const url = `${authorizationUrl}/api/v1/auth/evaluate?userId=${encodeURIComponent(userId)}&permission=${encodeURIComponent(REVIEW_PERMISSION)}`;
    const evaluated = await getJson(url, token);
    if (evaluated.status === 200 && evaluated.body?.allowed === true) {
      reviewerCache.set(userId, now + CACHE_TTL_MS);
      return { all: true };
    }
  } catch {
    throw new ScopeError(503, 'Cannot verify permissions');
  }

  const cached = personCache.get(userId);
  if (cached && cached.expiresAt > now) return { all: false, personId: cached.personId };
  try {
    const user = await getJson(`${identityUrl}/api/v1/users/${encodeURIComponent(userId)}`, token);
    const personId = user.status === 200 ? user.body?.personId : undefined;
    if (typeof personId !== 'string' || !personId) throw new ScopeError(403, 'The user is not linked to a person');
    personCache.set(userId, { personId, expiresAt: now + CACHE_TTL_MS });
    return { all: false, personId };
  } catch (err) {
    if (err instanceof ScopeError) throw err;
    throw new ScopeError(503, 'Cannot resolve the user person');
  }
}
