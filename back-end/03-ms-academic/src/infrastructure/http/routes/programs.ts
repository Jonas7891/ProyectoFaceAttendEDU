import { z } from 'zod';
import { notFound, schoolNotFound } from '../../../application/errors';
import { patchSchema } from '../patchSchema';
import { auditOf, bodyOf, handle, pageOf, param, requiredInt, type RouteContext } from './support';

const programBody = z.object({
  schoolId: z.number().int().optional(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  status: z.boolean().default(true),
});

export function registerProgramRoutes({ app, useCases, callerOf }: RouteContext) {
  const programs = useCases.programs;

  const create = async (schoolId: number, req: any, reply: any) => {
    const body = bodyOf(programBody, req, 'Invalid program payload');
    const created = await programs.create(await callerOf(req), { ...body, schoolId }, auditOf(req));
    return reply.code(201).send(created);
  };
  app.post('/api/v1/schools/:schoolId/programs', handle(async (req, reply) => {
    const schoolId = param(req, 'schoolId');
    if (!schoolId) throw schoolNotFound();
    return create(schoolId, req, reply);
  }));
  app.post('/api/v1/programs', handle(async (req, reply) => create(requiredInt(req, 'schoolId'), req, reply)));

  app.get('/api/v1/schools/:schoolId/programs', handle(async (req, reply) => {
    const schoolId = param(req, 'schoolId');
    if (!schoolId) return [];
    return pageOf(req, reply, programs.listBySchool(await callerOf(req), schoolId));
  }));
  app.get('/api/v1/programs', handle(async (req, reply) => pageOf(req, reply, programs.list(await callerOf(req)))));
  app.get('/api/v1/programs/:id', handle(async (req) => programs.get(await callerOf(req), param(req, 'id'))));
  app.put('/api/v1/programs/:id', handle(async (req) => {
    const id = param(req, 'id');
    if (!id) throw notFound();
    const patch = bodyOf(patchSchema(programBody), req, 'Invalid program payload');
    return programs.update(await callerOf(req), id, patch, auditOf(req));
  }));
  app.delete('/api/v1/programs/:id', handle(async (req, reply) => {
    await programs.delete(await callerOf(req), param(req, 'id'), auditOf(req));
    return reply.code(204).send();
  }));
}
