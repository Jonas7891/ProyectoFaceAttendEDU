import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApplicationError, badRequest } from '../../application/errors';
import { BiometricUpdateCaseUseCases } from '../../application/use-cases/BiometricUpdateCaseUseCases';
import type { IBiometricUpdateCaseRepository } from '../../domain/ports/out/IBiometricUpdateCaseRepository';
import { resolveCaseScope, ScopeError } from './caseScope';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const caseBody = z.object({
  personId: z.string().uuid(),
  biometricType: z.enum(['FACIAL', 'FINGERPRINT']),
  fingerNumber: z.number().int().min(1).max(10).nullable().optional(),
  currentEmbeddingRef: z.string().nullable().optional(),
  reason: z.string().min(1),
  requestedBy: z.string().uuid().nullable().optional(),
});

const reviewBody = z.object({
  updateStatus: z.enum(['In_Review', 'Approved', 'Rejected']),
  reviewedBy: z.string().uuid().optional(),
  resolutionNotes: z.string().optional(),
});

/** Case fields the server owns: set on creation or by the review route, never by a generic edit. */
const REVIEW_ONLY_FIELDS = ['updateStatus', 'requestedBy', 'requestedAt', 'reviewedBy', 'reviewedAt', 'resolutionNotes'];

function bodyOf<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw badRequest(undefined, parsed.error.flatten());
  return parsed.data;
}

/** Pagination is opt-in: without `limit`/`offset` the full list is returned. */
async function paged<T>(req: any, reply: any, listing: { list(p: object): Promise<T[]>; count(): Promise<number> }) {
  const q = req.query ?? {};
  if (q.limit === undefined && q.offset === undefined) return listing.list({});
  let limit = Number(q.limit ?? 20);
  let offset = Number(q.offset ?? 0);
  if (!Number.isInteger(limit) || limit <= 0) limit = 20;
  if (!Number.isInteger(offset) || offset < 0) offset = 0;
  reply.header('x-total-count', await listing.count());
  return listing.list({ limit: Math.min(limit, 100), offset });
}

/** A refused rule answers with its own status; an unresolvable scope answers 403/503. */
function handle(fn: (req: any, reply: any) => Promise<unknown>) {
  return async (req: any, reply: any) => {
    try {
      return await fn(req, reply);
    } catch (err) {
      if (err instanceof ApplicationError) return reply.code(err.statusCode).send(err.body());
      if (err instanceof ScopeError) {
        return reply.code(err.statusCode).send({
          error: err.statusCode === 403 ? 'Forbidden' : 'ServiceUnavailable',
          message: err.message,
          timestamp: new Date().toISOString(),
        });
      }
      throw err;
    }
  };
}

/** HTTP adapter of the biometric update cases: parses, resolves the scope and calls the use case. */
export function registerBiometricCaseRoutes(app: FastifyInstance, repository: IBiometricUpdateCaseRepository) {
  const cases = new BiometricUpdateCaseUseCases(repository);
  const base = '/api/v1/biometric-update-cases';

  app.post(base, handle(async (req, reply) => {
    const { requestedBy: _ignored, ...request } = bodyOf(caseBody, req.body);
    const created = await cases.request(await resolveCaseScope(req), request, req.userId);
    return reply.code(201).send(created);
  }));
  app.get(base, handle(async (req, reply) =>
    paged(req, reply, cases.list(await resolveCaseScope(req), req.query?.status))));
  app.get(`${base}/:id`, handle(async (req) => cases.get(await resolveCaseScope(req), String(req.params.id))));
  app.put(`${base}/:id`, handle(async (req) => {
    // Status, requester and reviewer fields only change through POST / PATCH .../review (RN-29).
    const raw = req.body;
    if (raw && typeof raw === 'object') {
      const fields = REVIEW_ONLY_FIELDS.filter((f) => f in raw);
      if (fields.length > 0) {
        throw badRequest('Status, requester and reviewer fields cannot be edited here; use the review endpoint', { fields });
      }
    }
    const edit = bodyOf(caseBody.omit({ requestedBy: true }).partial(), raw ?? {});
    return cases.edit(await resolveCaseScope(req), String(req.params.id), edit);
  }));
  app.patch(`${base}/:id/review`, handle(async (req) => {
    // The reviewer is the session user; a reviewedBy in the body is ignored.
    const { updateStatus, resolutionNotes } = bodyOf(reviewBody, req.body);
    return cases.review(await resolveCaseScope(req), String(req.params.id), req.userId, { updateStatus, resolutionNotes });
  }));
  app.delete(`${base}/:id`, handle(async (req, reply) => {
    await cases.delete(await resolveCaseScope(req), String(req.params.id));
    return reply.code(204).send();
  }));
  app.get('/api/v1/persons/:personId/biometric-cases', handle(async (req, reply) => {
    const personId = String(req.params.personId);
    if (!UUID_RE.test(personId)) return [];
    return paged(req, reply, await cases.listOfPerson(await resolveCaseScope(req), personId));
  }));
}
