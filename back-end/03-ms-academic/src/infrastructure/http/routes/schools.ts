import { z } from 'zod';
import { badRequest, notFound } from '../../../application/errors';
import { patchSchema } from '../patchSchema';
import { auditOf, bodyOf, handle, pageOf, param, type RouteContext } from './support';

const schoolBody = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  cityId: z.number().int().default(1),
  cityName: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  status: z.boolean().default(true),
});

export function registerSchoolRoutes({ app, useCases, callerOf }: RouteContext) {
  const schools = useCases.schools;

  app.post('/api/v1/schools', handle(async (req, reply) => {
    const body = bodyOf(schoolBody, req, 'Invalid school payload');
    const created = await schools.create(await callerOf(req), body, auditOf(req));
    return reply.code(201).send(created);
  }));
  app.get('/api/v1/schools', handle(async (req, reply) => pageOf(req, reply, await schools.list(await callerOf(req)))));
  app.get('/api/v1/schools/:id', handle(async (req) => schools.get(await callerOf(req), param(req, 'id'))));
  app.put('/api/v1/schools/:id', handle(async (req) => {
    const id = param(req, 'id');
    if (!id) throw notFound();
    const patch = bodyOf(patchSchema(schoolBody), req, 'Invalid school payload');
    return schools.update(await callerOf(req), id, patch, auditOf(req));
  }));
  app.patch('/api/v1/schools/:id/status', handle(async (req) => {
    const id = param(req, 'id');
    const parsed = z.object({ status: z.boolean() }).safeParse(req.body);
    if (!id || !parsed.success) throw badRequest('Invalid status payload');
    return schools.setStatus(await callerOf(req), id, parsed.data.status, auditOf(req));
  }));
  app.delete('/api/v1/schools/:id', handle(async (req, reply) => {
    await schools.delete(await callerOf(req), param(req, 'id'), auditOf(req));
    return reply.code(204).send();
  }));
}
