import { z } from 'zod';
import { notFound } from '../../../application/errors';
import { patchSchema } from '../patchSchema';
import { auditOf, bodyOf, handle, pageOf, param, type RouteContext } from './support';

// program_id and academic_period_id are NOT NULL FKs in PostgreSQL, so they are required.
const cohortBody = z.object({
  programId: z.number().int().positive(),
  academicPeriodId: z.number().int().positive(),
  code: z.string().min(1).max(50),
  status: z.boolean().default(true),
});

export function registerCohortRoutes({ app, useCases, callerOf }: RouteContext) {
  const cohorts = useCases.cohorts;

  app.post('/api/v1/cohorts', handle(async (req, reply) => {
    const body = bodyOf(cohortBody, req, 'Invalid cohort payload');
    return reply.code(201).send(await cohorts.create(await callerOf(req), body, auditOf(req)));
  }));
  app.get('/api/v1/cohorts', handle(async (req, reply) => pageOf(req, reply, cohorts.list(await callerOf(req)))));
  app.get('/api/v1/cohorts/:id', handle(async (req) => cohorts.get(await callerOf(req), param(req, 'id'))));
  app.put('/api/v1/cohorts/:id', handle(async (req) => {
    const id = param(req, 'id');
    if (!id) throw notFound();
    const patch = bodyOf(patchSchema(cohortBody), req, 'Invalid cohort payload');
    return cohorts.update(await callerOf(req), id, patch, auditOf(req));
  }));
  app.delete('/api/v1/cohorts/:id', handle(async (req, reply) => {
    await cohorts.delete(await callerOf(req), param(req, 'id'), auditOf(req));
    return reply.code(204).send();
  }));
  app.get('/api/v1/programs/:programId/cohorts', handle(async (req, reply) => {
    const programId = param(req, 'programId');
    if (!programId) return [];
    return pageOf(req, reply, await cohorts.listByProgram(await callerOf(req), programId));
  }));
}
