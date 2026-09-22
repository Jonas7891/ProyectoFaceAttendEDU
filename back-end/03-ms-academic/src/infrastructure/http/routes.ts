import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MemoryStore } from '../persistence/memory.store';

export const stores = {
  schools: new MemoryStore<any>('schoolId'),
  programs: new MemoryStore<any>('programId'),
  periods: new MemoryStore<any>('academicPeriodId'),
  cohorts: new MemoryStore<any>('cohortId'),
  courses: new MemoryStore<any>('courseId'),
  actorTypes: new MemoryStore<any>('actorTypeId'),
  actors: new MemoryStore<any>('academicActorId'),
  enrollments: new MemoryStore<any>('enrollmentId'),
};

// Seed default actor types STUDENT / INSTRUCTOR (06-data 03-academic §6)
stores.actorTypes.create({ code: 'STUDENT', name: 'Student' } as any);
stores.actorTypes.create({ code: 'INSTRUCTOR', name: 'Instructor' } as any);

function parseId(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function send400(reply: any, message: string, details?: unknown) {
  return reply.code(400).send({ error: 'BadRequest', message, details, timestamp: new Date().toISOString() });
}

// ISO 25010 Eficiencia (capacidad) + Compatibilidad: paginación uniforme ?limit&offset.
function getPagination(req: any): { limit: number; offset: number } {
  let limit = Number(req?.query?.limit ?? 20);
  let offset = Number(req?.query?.offset ?? 0);
  if (!Number.isInteger(limit) || limit <= 0) limit = 20;
  if (!Number.isInteger(offset) || offset < 0) offset = 0;
  return { limit: Math.min(limit, 100), offset };
}

function page<T>(items: T[], req: any, reply: any): T[] {
  const q = (req as any)?.query as any;
  if (!q || (q.limit === undefined && q.offset === undefined)) return items;
  const { limit, offset } = getPagination(req);
  reply.header('x-total-count', items.length);
  return items.slice(offset, offset + limit);
}

export async function registerAcademicRoutes(app: FastifyInstance) {
  // ---------- Schools ----------
  const schoolBody = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    cityId: z.number().int().default(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    status: z.boolean().default(true),
  });

  app.post('/api/v1/schools', async (req, reply) => {
    const parsed = schoolBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid school payload', parsed.error.flatten());
    const created = stores.schools.create(parsed.data as any);
    return reply.code(201).send(created);
  });
  app.get('/api/v1/schools', async (req, reply) => page(stores.schools.list(), req, reply));
  app.get('/api/v1/schools/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? stores.schools.get(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/schools/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = schoolBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid school payload', parsed.error.flatten());
    const updated = stores.schools.update(id, parsed.data as any);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.patch('/api/v1/schools/:id/status', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const parsed = z.object({ status: z.boolean() }).safeParse((req as any).body);
    if (!id || !parsed.success) return send400(reply, 'Invalid status payload');
    const updated = stores.schools.update(id, parsed.data as any);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/schools/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !stores.schools.remove(id)) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });

  // ---------- Programs ----------
  const programBody = z.object({
    schoolId: z.number().int().optional(),
    code: z.string().min(1),
    name: z.string().min(1),
    status: z.boolean().default(true),
  });
  const createProgram = (schoolId: number, body: unknown, reply: any) => {
    const parsed = programBody.safeParse(body);
    if (!parsed.success) return send400(reply, 'Invalid program payload', parsed.error.flatten());
    if (!stores.schools.get(schoolId)) return reply.code(404).send({ error: 'SchoolNotFound' });
    return reply.code(201).send(stores.programs.create({ ...parsed.data, schoolId } as any));
  };
  app.post('/api/v1/schools/:schoolId/programs', async (req, reply) => {
    const schoolId = parseId((req.params as any).schoolId);
    if (!schoolId) return reply.code(404).send({ error: 'SchoolNotFound' });
    return createProgram(schoolId, (req as any).body, reply);
  });
  app.post('/api/v1/programs', async (req, reply) => {
    const body = (req as any).body ?? {};
    const schoolId = Number(body.schoolId);
    if (!Number.isInteger(schoolId)) return send400(reply, 'schoolId is required');
    return createProgram(schoolId, body, reply);
  });
  app.get('/api/v1/schools/:schoolId/programs', async (req, reply) => {
    const schoolId = Number((req.params as any).schoolId);
    return page(stores.programs.list((p: any) => p.schoolId === schoolId), req, reply);
  });
  app.get('/api/v1/programs', async (req, reply) => page(stores.programs.list(), req, reply));
  app.get('/api/v1/programs/:id', async (req, reply) => {
    const found = stores.programs.get(Number((req.params as any).id));
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/programs/:id', async (req, reply) => {
    const updated = stores.programs.update(Number((req.params as any).id), (req as any).body ?? {});
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/programs/:id', async (req, reply) => {
    if (!stores.programs.remove(Number((req.params as any).id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });

  // ---------- Periods (canonical /academic-periods + alias /periods) ----------
  const periodBody = z.object({
    schoolId: z.number().int().optional(),
    name: z.string().min(1),
    startsOn: z.string().min(1),
    endsOn: z.string().min(1),
    isActive: z.boolean().default(false),
  });
  const createPeriod = (schoolId: number, body: unknown, reply: any) => {
    const parsed = periodBody.safeParse(body);
    if (!parsed.success) return send400(reply, 'Invalid period payload', parsed.error.flatten());
    return reply.code(201).send(stores.periods.create({ ...parsed.data, schoolId } as any));
  };
  for (const base of ['/api/v1/academic-periods', '/api/v1/periods']) {
    app.post(base, async (req, reply) => {
      const body = (req as any).body ?? {};
      const schoolId = Number(body.schoolId);
      if (!Number.isInteger(schoolId)) return send400(reply, 'schoolId is required');
      return createPeriod(schoolId, body, reply);
    });
    app.get(base, async (req, reply) => page(stores.periods.list(), req, reply));
    app.get(`${base}/:id`, async (req, reply) => {
      const found = stores.periods.get(Number((req.params as any).id));
      if (!found) return reply.code(404).send({ error: 'NotFound' });
      return found;
    });
    app.put(`${base}/:id`, async (req, reply) => {
      const updated = stores.periods.update(Number((req.params as any).id), (req as any).body ?? {});
      if (!updated) return reply.code(404).send({ error: 'NotFound' });
      return updated;
    });
    app.delete(`${base}/:id`, async (req, reply) => {
      if (!stores.periods.remove(Number((req.params as any).id))) return reply.code(404).send({ error: 'NotFound' });
      return reply.code(204).send();
    });
  }
  app.post('/api/v1/schools/:schoolId/periods', async (req, reply) => {
    const schoolId = parseId((req.params as any).schoolId);
    if (!schoolId) return reply.code(404).send({ error: 'SchoolNotFound' });
    return createPeriod(schoolId, (req as any).body, reply);
  });
  app.get('/api/v1/schools/:schoolId/periods', async (req, reply) => {
    const schoolId = Number((req.params as any).schoolId);
    return page(stores.periods.list((p: any) => p.schoolId === schoolId), req, reply);
  });

  // ---------- Cohorts ----------
  const cohortBody = z.object({
    programId: z.number().int().optional(),
    academicPeriodId: z.number().int().optional(),
    code: z.string().min(1),
    status: z.boolean().default(true),
  });
  app.post('/api/v1/cohorts', async (req, reply) => {
    const parsed = cohortBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid cohort payload', parsed.error.flatten());
    return reply.code(201).send(stores.cohorts.create(parsed.data as any));
  });
  app.get('/api/v1/cohorts', async (req, reply) => page(stores.cohorts.list(), req, reply));
  app.get('/api/v1/cohorts/:id', async (req, reply) => {
    const found = stores.cohorts.get(Number((req.params as any).id));
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/cohorts/:id', async (req, reply) => {
    const updated = stores.cohorts.update(Number((req.params as any).id), (req as any).body ?? {});
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/cohorts/:id', async (req, reply) => {
    if (!stores.cohorts.remove(Number((req.params as any).id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/programs/:programId/cohorts', async (req, reply) => {
    const programId = Number((req.params as any).programId);
    return page(stores.cohorts.list((c: any) => c.programId === programId), req, reply);
  });

  // ---------- Courses ----------
  const courseBody = z.object({
    programId: z.number().int().optional(),
    code: z.string().min(1),
    name: z.string().min(1),
    creditHours: z.number().int().min(0).default(3),
    status: z.boolean().default(true),
  });
  const createCourse = (programId: number, body: unknown, reply: any) => {
    const parsed = courseBody.safeParse(body);
    if (!parsed.success) return send400(reply, 'Invalid course payload', parsed.error.flatten());
    return reply.code(201).send(stores.courses.create({ ...parsed.data, programId } as any));
  };
  app.post('/api/v1/programs/:programId/courses', async (req, reply) =>
    createCourse(Number((req.params as any).programId), (req as any).body, reply),
  );
  app.post('/api/v1/courses', async (req, reply) => {
    const body = (req as any).body ?? {};
    const programId = Number(body.programId);
    if (!Number.isInteger(programId)) return send400(reply, 'programId is required');
    return createCourse(programId, body, reply);
  });
  app.get('/api/v1/courses', async (req, reply) => page(stores.courses.list(), req, reply));
  app.get('/api/v1/courses/:id', async (req, reply) => {
    const found = stores.courses.get(Number((req.params as any).id));
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/courses/:id', async (req, reply) => {
    const updated = stores.courses.update(Number((req.params as any).id), (req as any).body ?? {});
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/courses/:id', async (req, reply) => {
    if (!stores.courses.remove(Number((req.params as any).id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/programs/:programId/courses', async (req, reply) => {
    const programId = Number((req.params as any).programId);
    return page(stores.courses.list((c: any) => c.programId === programId), req, reply);
  });

  // ---------- Actor types ----------
  const actorTypeBody = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
  });
  app.post('/api/v1/actor-types', async (req, reply) => {
    const parsed = actorTypeBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid actor-type payload', parsed.error.flatten());
    return reply.code(201).send(stores.actorTypes.create(parsed.data as any));
  });
  app.get('/api/v1/actor-types', async (req, reply) => page(stores.actorTypes.list(), req, reply));
  app.get('/api/v1/actor-types/:id', async (req, reply) => {
    const found = stores.actorTypes.get(Number((req.params as any).id));
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/actor-types/:id', async (req, reply) => {
    const parsed = actorTypeBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid actor-type payload', parsed.error.flatten());
    const updated = stores.actorTypes.update(Number((req.params as any).id), parsed.data as any);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/actor-types/:id', async (req, reply) => {
    if (!stores.actorTypes.remove(Number((req.params as any).id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });

  // ---------- Academic actors ----------
  const actorBody = z.object({
    personId: z.string().min(1),
    actorTypeId: z.number().int().default(1),
    schoolId: z.number().int(),
    actorCode: z.string().min(1),
    startedOn: z.string().min(1).default(new Date().toISOString().slice(0, 10)),
    endedOn: z.string().nullable().optional(),
    status: z.boolean().default(true),
  });
  app.post('/api/v1/academic-actors', async (req, reply) => {
    const parsed = actorBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid actor payload', parsed.error.flatten());
    return reply.code(201).send(stores.actors.create(parsed.data as any));
  });
  app.get('/api/v1/academic-actors', async (req, reply) => page(stores.actors.list(), req, reply));
  app.get('/api/v1/academic-actors/:id', async (req, reply) => {
    const found = stores.actors.get(Number((req.params as any).id));
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/academic-actors/:id', async (req, reply) => {
    const updated = stores.actors.update(Number((req.params as any).id), (req as any).body ?? {});
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.patch('/api/v1/academic-actors/:id/status', async (req, reply) => {
    const parsed = z.object({ status: z.boolean() }).safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid status payload');
    const updated = stores.actors.update(Number((req.params as any).id), parsed.data as any);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/academic-actors/:id', async (req, reply) => {
    if (!stores.actors.remove(Number((req.params as any).id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/schools/:schoolId/actors', async (req, reply) => {
    const schoolId = Number((req.params as any).schoolId);
    return page(stores.actors.list((a: any) => a.schoolId === schoolId), req, reply);
  });

  // ---------- Enrollments ----------
  const enrollmentBody = z.object({
    academicActorId: z.number().int(),
    cohortId: z.number().int(),
    enrolledOn: z.string().min(1).default(new Date().toISOString().slice(0, 10)),
    enrollmentStatus: z.enum(['Active', 'Withdrawn', 'Completed']).default('Active'),
  });
  app.post('/api/v1/enrollments', async (req, reply) => {
    const parsed = enrollmentBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid enrollment payload', parsed.error.flatten());
    return reply.code(201).send(stores.enrollments.create(parsed.data as any));
  });
  app.get('/api/v1/enrollments', async (req, reply) => page(stores.enrollments.list(), req, reply));
  app.get('/api/v1/enrollments/:id', async (req, reply) => {
    const found = stores.enrollments.get(Number((req.params as any).id));
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.patch('/api/v1/enrollments/:id/status', async (req, reply) => {
    const parsed = z.object({ enrollmentStatus: z.enum(['Active', 'Withdrawn', 'Completed']) }).safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid enrollment status');
    const updated = stores.enrollments.update(Number((req.params as any).id), parsed.data as any);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.put('/api/v1/enrollments/:id', async (req, reply) => {
    const updated = stores.enrollments.update(Number((req.params as any).id), (req as any).body ?? {});
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/enrollments/:id', async (req, reply) => {
    if (!stores.enrollments.remove(Number((req.params as any).id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/cohorts/:cohortId/enrollments', async (req, reply) => {
    const cohortId = Number((req.params as any).cohortId);
    return page(stores.enrollments.list((e: any) => e.cohortId === cohortId), req, reply);
  });
  app.get('/api/v1/academic-actors/:actorId/enrollments', async (req, reply) => {
    const actorId = Number((req.params as any).actorId);
    return page(stores.enrollments.list((e: any) => e.academicActorId === actorId), req, reply);
  });
}
