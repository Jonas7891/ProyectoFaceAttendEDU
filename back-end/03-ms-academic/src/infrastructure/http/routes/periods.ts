import { z } from 'zod';
import { notFound, schoolNotFound } from '../../../application/errors';
import { patchSchema } from '../patchSchema';
import { auditOf, bodyOf, handle, pageOf, param, requiredInt, type RouteContext } from './support';

const periodBody = z.object({
  schoolId: z.number().int().optional(),
  name: z.string().min(1).max(255),
  startsOn: z.string().min(1),
  endsOn: z.string().min(1),
  isActive: z.boolean().default(false),
});

/** Canonical /academic-periods plus the /periods alias. */
export function registerPeriodRoutes({ app, useCases, callerOf }: RouteContext) {
  const periods = useCases.periods;

  const create = async (schoolId: number, req: any, reply: any) => {
    const body = bodyOf(periodBody, req, 'Invalid period payload');
    const created = await periods.create(await callerOf(req), { ...body, schoolId }, auditOf(req));
    return reply.code(201).send(created);
  };

  for (const base of ['/api/v1/academic-periods', '/api/v1/periods']) {
    app.post(base, handle(async (req, reply) => create(requiredInt(req, 'schoolId'), req, reply)));
    app.get(base, handle(async (req, reply) => pageOf(req, reply, periods.list(await callerOf(req)))));
    app.get(`${base}/:id`, handle(async (req) => periods.get(await callerOf(req), param(req, 'id'))));
    app.put(`${base}/:id`, handle(async (req) => {
      const id = param(req, 'id');
      if (!id) throw notFound();
      const patch = bodyOf(patchSchema(periodBody), req, 'Invalid period payload');
      return periods.update(await callerOf(req), id, patch, auditOf(req));
    }));
    app.delete(`${base}/:id`, handle(async (req, reply) => {
      await periods.delete(await callerOf(req), param(req, 'id'), auditOf(req));
      return reply.code(204).send();
    }));
  }

  app.post('/api/v1/schools/:schoolId/periods', handle(async (req, reply) => {
    const schoolId = param(req, 'schoolId');
    if (!schoolId) throw schoolNotFound();
    return create(schoolId, req, reply);
  }));
  app.get('/api/v1/schools/:schoolId/periods', handle(async (req, reply) => {
    const schoolId = param(req, 'schoolId');
    if (!schoolId) return [];
    return pageOf(req, reply, periods.listBySchool(await callerOf(req), schoolId));
  }));
}
