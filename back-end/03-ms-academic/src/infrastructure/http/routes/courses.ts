import { z } from 'zod';
import { badRequest, notFound } from '../../../application/errors';
import { patchSchema } from '../patchSchema';
import { auditOf, bodyOf, handle, pageOf, param, requiredInt, type RouteContext } from './support';

const courseBody = z.object({
  programId: z.number().int().optional(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  creditHours: z.number().int().min(0).max(32767).default(3),
  status: z.boolean().default(true),
});

export function registerCourseRoutes({ app, useCases, callerOf }: RouteContext) {
  const courses = useCases.courses;

  const create = async (programId: number | null, req: any, reply: any) => {
    if (!programId) throw badRequest('programId is required');
    const body = bodyOf(courseBody, req, 'Invalid course payload');
    const created = await courses.create(await callerOf(req), { ...body, programId }, auditOf(req));
    return reply.code(201).send(created);
  };
  app.post('/api/v1/programs/:programId/courses', handle(async (req, reply) => create(param(req, 'programId'), req, reply)));
  app.post('/api/v1/courses', handle(async (req, reply) => create(requiredInt(req, 'programId'), req, reply)));

  app.get('/api/v1/courses', handle(async (req, reply) => pageOf(req, reply, courses.list(await callerOf(req)))));
  app.get('/api/v1/courses/:id', handle(async (req) => courses.get(await callerOf(req), param(req, 'id'))));
  app.put('/api/v1/courses/:id', handle(async (req) => {
    const id = param(req, 'id');
    if (!id) throw notFound();
    const patch = bodyOf(patchSchema(courseBody), req, 'Invalid course payload');
    return courses.update(await callerOf(req), id, patch, auditOf(req));
  }));
  app.delete('/api/v1/courses/:id', handle(async (req, reply) => {
    await courses.delete(await callerOf(req), param(req, 'id'), auditOf(req));
    return reply.code(204).send();
  }));
  app.get('/api/v1/programs/:programId/courses', handle(async (req, reply) => {
    const programId = param(req, 'programId');
    if (!programId) return [];
    return pageOf(req, reply, await courses.listByProgram(await callerOf(req), programId));
  }));
}
