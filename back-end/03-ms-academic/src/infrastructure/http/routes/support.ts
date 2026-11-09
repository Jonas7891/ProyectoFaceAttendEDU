import type { FastifyInstance } from 'fastify';
import type { ZodType } from 'zod';
import type { CallerSchool } from '../../../application/access/CallerSchool';
import type { AcademicUseCases } from '../../../application/AcademicUseCases';
import { ApplicationError, badRequest } from '../../../application/errors';
import type { Listing } from '../../../application/Listing';
import type { AuditActor } from '../../../domain/ports/out/ICrudRepository';
import { ScopeError } from '../callerSchool';

/** What every resource's routes need: the app, the use cases and who is calling. */
export interface RouteContext {
  readonly app: FastifyInstance;
  readonly useCases: AcademicUseCases;
  callerOf(req: unknown): Promise<CallerSchool>;
}

export function parseId(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function param(req: any, name: string): number | null {
  return parseId(req?.params?.[name]);
}

/** Session user set by the shared auth guard, stamped on created_by/updated_by/deleted_by. */
export function auditOf(req: any): AuditActor | undefined {
  const userId = req?.userId;
  return typeof userId === 'string' && userId.length > 0 ? { userId } : undefined;
}

/** Parses the body or answers 400 with the field errors. */
export function bodyOf<T>(schema: ZodType<T>, req: any, message: string): T {
  const parsed = schema.safeParse(req?.body);
  if (!parsed.success) throw badRequest(message, parsed.error.flatten());
  return parsed.data;
}

/** A required integer field of the body, read before the full schema (the routes always did). */
export function requiredInt(req: any, field: string): number {
  const value = Number((req?.body ?? {})[field]);
  if (!Number.isInteger(value)) throw badRequest(`${field} is required`);
  return value;
}

// ISO 25010 Eficiencia (capacidad) + Compatibilidad: paginación uniforme ?limit&offset.
function pagination(req: any): { limit: number; offset: number } {
  let limit = Number(req?.query?.limit ?? 20);
  let offset = Number(req?.query?.offset ?? 0);
  if (!Number.isInteger(limit) || limit <= 0) limit = 20;
  if (!Number.isInteger(offset) || offset < 0) offset = 0;
  return { limit: Math.min(limit, 100), offset };
}

/**
 * No `limit`/`offset` in the query string -> bare array of every match, no header.
 * Either present -> that page plus `x-total-count` = total matching rows.
 */
export async function pageOf<T>(req: any, reply: any, listing: Listing<T>): Promise<T[]> {
  const q = req?.query;
  if (!q || (q.limit === undefined && q.offset === undefined)) return listing.list({});
  const page = pagination(req);
  const [items, total] = await Promise.all([listing.list(page), listing.count()]);
  reply.header('x-total-count', total);
  return items;
}

/**
 * Wraps a route: a refused rule answers with its status and body; a caller whose school
 * cannot be resolved answers 403/503. Anything else reaches the shared error handler.
 */
export function handle(fn: (req: any, reply: any) => Promise<unknown>) {
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
