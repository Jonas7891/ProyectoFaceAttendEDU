import { z } from 'zod';
import { badRequest, notFound } from '../../../application/errors';
import { todayIso } from '../../localDate';
import { patchSchema } from '../patchSchema';
import { auditOf, bodyOf, handle, pageOf, param, type RouteContext } from './support';

const enrollmentStatus = z.enum(['Active', 'Withdrawn', 'Completed']);

const enrollmentBody = z.object({
  academicActorId: z.number().int(),
  cohortId: z.number().int(),
  enrolledOn: z.string().min(1).default(() => todayIso()),
  enrollmentStatus: enrollmentStatus.default('Active'),
});

export function registerEnrollmentRoutes({ app, useCases, callerOf }: RouteContext) {
  const enrollments = useCases.enrollments;

  app.post('/api/v1/enrollments', handle(async (req, reply) => {
    const body = bodyOf(enrollmentBody, req, 'Invalid enrollment payload');
    return reply.code(201).send(await enrollments.enroll(await callerOf(req), body, auditOf(req)));
  }));
  app.get('/api/v1/enrollments', handle(async (req, reply) => pageOf(req, reply, enrollments.list(await callerOf(req)))));
  app.get('/api/v1/enrollments/:id', handle(async (req) => enrollments.get(await callerOf(req), param(req, 'id'))));
  app.patch('/api/v1/enrollments/:id/status', handle(async (req) => {
    const parsed = z.object({ enrollmentStatus }).safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid enrollment status');
    const id = param(req, 'id');
    if (!id) throw notFound();
    return enrollments.update(await callerOf(req), id, parsed.data, auditOf(req));
  }));
  app.put('/api/v1/enrollments/:id', handle(async (req) => {
    const id = param(req, 'id');
    if (!id) throw notFound();
    const patch = bodyOf(patchSchema(enrollmentBody), req, 'Invalid enrollment payload');
    return enrollments.update(await callerOf(req), id, patch, auditOf(req));
  }));
  app.delete('/api/v1/enrollments/:id', handle(async (req, reply) => {
    await enrollments.delete(await callerOf(req), param(req, 'id'), auditOf(req));
    return reply.code(204).send();
  }));
  app.get('/api/v1/cohorts/:cohortId/enrollments', handle(async (req, reply) => {
    const cohortId = param(req, 'cohortId');
    if (!cohortId) return [];
    return pageOf(req, reply, await enrollments.listByCohort(await callerOf(req), cohortId));
  }));
  app.get('/api/v1/academic-actors/:actorId/enrollments', handle(async (req, reply) => {
    const actorId = param(req, 'actorId');
    if (!actorId) return [];
    return pageOf(req, reply, await enrollments.listByActor(await callerOf(req), actorId));
  }));
}
