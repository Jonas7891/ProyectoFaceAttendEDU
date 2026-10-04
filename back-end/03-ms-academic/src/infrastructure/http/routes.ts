import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { PageOptions } from '../../domain/ports/out/ICrudRepository';
import type { AcademicRepositories } from '../persistence/postgres';

/**
 * HTTP adapters — 03-ms-academic.
 *
 * Persistence goes through the injected `AcademicRepositories` ports
 * (`domain/ports/out/*`), which are implemented by the PostgreSQL adapters in
 * `infrastructure/persistence/postgres`. There is no in-memory store: every
 * response is exactly what is in the `academic` schema.
 *
 * Error contract: repositories throw `RepositoryError`s carrying an HTTP status
 * (409 unique violation, 400 dangling FK / bad value, 503 database down). They
 * are not caught here — `main.ts`'s Fastify error handler renders them into the
 * same envelope used for validation failures, so no database error can leak as a
 * 500 or as a raw driver message.
 */

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

/**
 * Same contract the in-memory `page()` helper had:
 *   - no `limit`/`offset` in the query string -> bare array of every match, no header;
 *   - either present -> sliced array plus `x-total-count` = total matching rows.
 * LIMIT/OFFSET are pushed into SQL and bound as parameters.
 */
async function pageOf<T>(
  req: any,
  reply: any,
  list: (page: PageOptions) => Promise<T[]>,
  count: () => Promise<number>,
): Promise<T[]> {
  const q = (req as any)?.query as any;
  if (!q || (q.limit === undefined && q.offset === undefined)) return list({});
  const { limit, offset } = getPagination(req);
  const [items, total] = await Promise.all([list({ limit, offset }), count()]);
  reply.header('x-total-count', total);
  return items;
}

export async function registerAcademicRoutes(app: FastifyInstance, repos: AcademicRepositories) {
  // ---------- Schools ----------
  const schoolBody = z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(255),
    cityId: z.number().int().default(1),
    address: z.string().max(255).optional(),
    phone: z.string().max(50).optional(),
    email: z.string().email().max(255).optional(),
    status: z.boolean().default(true),
  });

  app.post('/api/v1/schools', async (req, reply) => {
    const parsed = schoolBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid school payload', parsed.error.flatten());
    const created = await repos.schools.create(parsed.data);
    return reply.code(201).send(created);
  });
  app.get('/api/v1/schools', async (req, reply) =>
    pageOf(req, reply, (page) => repos.schools.list(page), () => repos.schools.count()),
  );
  app.get('/api/v1/schools/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? await repos.schools.findById(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/schools/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = schoolBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid school payload', parsed.error.flatten());
    const updated = await repos.schools.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.patch('/api/v1/schools/:id/status', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const parsed = z.object({ status: z.boolean() }).safeParse((req as any).body);
    if (!id || !parsed.success) return send400(reply, 'Invalid status payload');
    const updated = await repos.schools.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/schools/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !(await repos.schools.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });

  // ---------- Programs ----------
  const programBody = z.object({
    schoolId: z.number().int().optional(),
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(255),
    status: z.boolean().default(true),
  });
  const createProgram = async (schoolId: number, body: unknown, reply: any) => {
    const parsed = programBody.safeParse(body);
    if (!parsed.success) return send400(reply, 'Invalid program payload', parsed.error.flatten());
    if (!(await repos.schools.existsById(schoolId))) return reply.code(404).send({ error: 'SchoolNotFound' });
    const created = await repos.programs.create({ ...parsed.data, schoolId });
    return reply.code(201).send(created);
  };
  app.post('/api/v1/schools/:schoolId/programs', async (req, reply) => {
    const schoolId = parseId((req.params as any).schoolId);
    if (!schoolId) return reply.code(404).send({ error: 'SchoolNotFound' });
    return createProgram(schoolId, (req as any).body, reply);
  });
  app.post('/api/v1/programs', async (req, reply) => {
    const body = ((req as any).body ?? {}) as Record<string, unknown>;
    const schoolId = Number(body.schoolId);
    if (!Number.isInteger(schoolId)) return send400(reply, 'schoolId is required');
    return createProgram(schoolId, body, reply);
  });
  app.get('/api/v1/schools/:schoolId/programs', async (req, reply) => {
    const schoolId = parseId((req.params as any).schoolId);
    if (!schoolId) return [];
    return pageOf(
      req,
      reply,
      (page) => repos.programs.findBySchool(schoolId, page),
      () => repos.programs.countBySchool(schoolId),
    );
  });
  app.get('/api/v1/programs', async (req, reply) =>
    pageOf(req, reply, (page) => repos.programs.list(page), () => repos.programs.count()),
  );
  app.get('/api/v1/programs/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? await repos.programs.findById(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/programs/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = programBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid program payload', parsed.error.flatten());
    const updated = await repos.programs.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/programs/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !(await repos.programs.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });

  // ---------- Periods (canonical /academic-periods + alias /periods) ----------
  const periodBody = z.object({
    schoolId: z.number().int().optional(),
    name: z.string().min(1).max(255),
    startsOn: z.string().min(1),
    endsOn: z.string().min(1),
    isActive: z.boolean().default(false),
  });
  const createPeriod = async (schoolId: number, body: unknown, reply: any) => {
    const parsed = periodBody.safeParse(body);
    if (!parsed.success) return send400(reply, 'Invalid period payload', parsed.error.flatten());
    // `academic_period.school_id` is a real FK: a missing school answers 400.
    const created = await repos.periods.create({ ...parsed.data, schoolId });
    return reply.code(201).send(created);
  };
  for (const base of ['/api/v1/academic-periods', '/api/v1/periods']) {
    app.post(base, async (req, reply) => {
      const body = ((req as any).body ?? {}) as Record<string, unknown>;
      const schoolId = Number(body.schoolId);
      if (!Number.isInteger(schoolId)) return send400(reply, 'schoolId is required');
      return createPeriod(schoolId, body, reply);
    });
    app.get(base, async (req, reply) =>
      pageOf(req, reply, (page) => repos.periods.list(page), () => repos.periods.count()),
    );
    app.get(`${base}/:id`, async (req, reply) => {
      const id = parseId((req.params as any).id);
      const found = id ? await repos.periods.findById(id) : null;
      if (!found) return reply.code(404).send({ error: 'NotFound' });
      return found;
    });
    app.put(`${base}/:id`, async (req, reply) => {
      const id = parseId((req.params as any).id);
      if (!id) return reply.code(404).send({ error: 'NotFound' });
      const parsed = periodBody.partial().safeParse((req as any).body);
      if (!parsed.success) return send400(reply, 'Invalid period payload', parsed.error.flatten());
      const updated = await repos.periods.update(id, parsed.data);
      if (!updated) return reply.code(404).send({ error: 'NotFound' });
      return updated;
    });
    app.delete(`${base}/:id`, async (req, reply) => {
      const id = parseId((req.params as any).id);
      if (!id || !(await repos.periods.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
      return reply.code(204).send();
    });
  }
  app.post('/api/v1/schools/:schoolId/periods', async (req, reply) => {
    const schoolId = parseId((req.params as any).schoolId);
    if (!schoolId) return reply.code(404).send({ error: 'SchoolNotFound' });
    return createPeriod(schoolId, (req as any).body, reply);
  });
  app.get('/api/v1/schools/:schoolId/periods', async (req, reply) => {
    const schoolId = parseId((req.params as any).schoolId);
    if (!schoolId) return [];
    return pageOf(
      req,
      reply,
      (page) => repos.periods.findBySchool(schoolId, page),
      () => repos.periods.countBySchool(schoolId),
    );
  });

  // ---------- Cohorts ----------
  // program_id and academic_period_id are NOT NULL FKs in PostgreSQL, so they are
  // required here; the in-memory store used to accept cohorts without them.
  const cohortBody = z.object({
    programId: z.number().int().positive(),
    academicPeriodId: z.number().int().positive(),
    code: z.string().min(1).max(50),
    status: z.boolean().default(true),
  });
  app.post('/api/v1/cohorts', async (req, reply) => {
    const parsed = cohortBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid cohort payload', parsed.error.flatten());
    const created = await repos.cohorts.create(parsed.data);
    return reply.code(201).send(created);
  });
  app.get('/api/v1/cohorts', async (req, reply) =>
    pageOf(req, reply, (page) => repos.cohorts.list(page), () => repos.cohorts.count()),
  );
  app.get('/api/v1/cohorts/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? await repos.cohorts.findById(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/cohorts/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = cohortBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid cohort payload', parsed.error.flatten());
    const updated = await repos.cohorts.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/cohorts/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !(await repos.cohorts.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/programs/:programId/cohorts', async (req, reply) => {
    const programId = parseId((req.params as any).programId);
    if (!programId) return [];
    return pageOf(
      req,
      reply,
      (page) => repos.cohorts.findByProgram(programId, page),
      () => repos.cohorts.countByProgram(programId),
    );
  });

  // ---------- Courses ----------
  const courseBody = z.object({
    programId: z.number().int().optional(),
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(255),
    creditHours: z.number().int().min(0).max(32767).default(3),
    status: z.boolean().default(true),
  });
  const createCourse = async (programId: number | null, body: unknown, reply: any) => {
    if (!programId) return send400(reply, 'programId is required');
    const parsed = courseBody.safeParse(body);
    if (!parsed.success) return send400(reply, 'Invalid course payload', parsed.error.flatten());
    // `course.program_id` is a NOT NULL FK: a missing program answers 400.
    const created = await repos.courses.create({ ...parsed.data, programId });
    return reply.code(201).send(created);
  };
  app.post('/api/v1/programs/:programId/courses', async (req, reply) =>
    createCourse(parseId((req.params as any).programId), (req as any).body, reply),
  );
  app.post('/api/v1/courses', async (req, reply) => {
    const body = ((req as any).body ?? {}) as Record<string, unknown>;
    const programId = Number(body.programId);
    if (!Number.isInteger(programId)) return send400(reply, 'programId is required');
    return createCourse(programId, body, reply);
  });
  app.get('/api/v1/courses', async (req, reply) =>
    pageOf(req, reply, (page) => repos.courses.list(page), () => repos.courses.count()),
  );
  app.get('/api/v1/courses/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? await repos.courses.findById(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/courses/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = courseBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid course payload', parsed.error.flatten());
    const updated = await repos.courses.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/courses/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !(await repos.courses.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/programs/:programId/courses', async (req, reply) => {
    const programId = parseId((req.params as any).programId);
    if (!programId) return [];
    return pageOf(
      req,
      reply,
      (page) => repos.courses.findByProgram(programId, page),
      () => repos.courses.countByProgram(programId),
    );
  });

  // ---------- Actor types ----------
  // Seeded by Liquibase (1=STUDENT, 2=INSTRUCTOR); nothing is seeded at boot.
  const actorTypeBody = z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(255),
  });
  app.post('/api/v1/actor-types', async (req, reply) => {
    const parsed = actorTypeBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid actor-type payload', parsed.error.flatten());
    const created = await repos.actorTypes.create(parsed.data);
    return reply.code(201).send(created);
  });
  app.get('/api/v1/actor-types', async (req, reply) =>
    pageOf(req, reply, (page) => repos.actorTypes.list(page), () => repos.actorTypes.count()),
  );
  app.get('/api/v1/actor-types/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? await repos.actorTypes.findById(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/actor-types/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = actorTypeBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid actor-type payload', parsed.error.flatten());
    const updated = await repos.actorTypes.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/actor-types/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !(await repos.actorTypes.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });

  // ---------- Academic actors ----------
  // `academic_actor.person_id` is a native UUID column (cross-context reference to
  // identity.person, no FK), so the payload must be valid UUID text.
  const actorBody = z.object({
    personId: z.string().uuid(),
    actorTypeId: z.number().int().default(1),
    schoolId: z.number().int(),
    actorCode: z.string().min(1).max(50),
    startedOn: z.string().min(1).default(new Date().toISOString().slice(0, 10)),
    endedOn: z.string().nullable().optional(),
    status: z.boolean().default(true),
  });
  app.post('/api/v1/academic-actors', async (req, reply) => {
    const parsed = actorBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid actor payload', parsed.error.flatten());
    const created = await repos.actors.create(parsed.data);
    return reply.code(201).send(created);
  });
  app.get('/api/v1/academic-actors', async (req, reply) =>
    pageOf(req, reply, (page) => repos.actors.list(page), () => repos.actors.count()),
  );
  app.get('/api/v1/academic-actors/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? await repos.actors.findById(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put('/api/v1/academic-actors/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = actorBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid actor payload', parsed.error.flatten());
    const updated = await repos.actors.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.patch('/api/v1/academic-actors/:id/status', async (req, reply) => {
    const parsed = z.object({ status: z.boolean() }).safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid status payload');
    const id = parseId((req.params as any).id);
    const updated = id ? await repos.actors.update(id, parsed.data) : null;
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/academic-actors/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !(await repos.actors.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/schools/:schoolId/actors', async (req, reply) => {
    const schoolId = parseId((req.params as any).schoolId);
    if (!schoolId) return [];
    return pageOf(
      req,
      reply,
      (page) => repos.actors.findBySchool(schoolId, page),
      () => repos.actors.countBySchool(schoolId),
    );
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
    const created = await repos.enrollments.create(parsed.data);
    return reply.code(201).send(created);
  });
  app.get('/api/v1/enrollments', async (req, reply) =>
    pageOf(req, reply, (page) => repos.enrollments.list(page), () => repos.enrollments.count()),
  );
  app.get('/api/v1/enrollments/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? await repos.enrollments.findById(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.patch('/api/v1/enrollments/:id/status', async (req, reply) => {
    const parsed = z
      .object({ enrollmentStatus: z.enum(['Active', 'Withdrawn', 'Completed']) })
      .safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid enrollment status');
    const id = parseId((req.params as any).id);
    const updated = id ? await repos.enrollments.update(id, parsed.data) : null;
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.put('/api/v1/enrollments/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound' });
    const parsed = enrollmentBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid enrollment payload', parsed.error.flatten());
    const updated = await repos.enrollments.update(id, parsed.data);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/enrollments/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !(await repos.enrollments.softDelete(id))) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/cohorts/:cohortId/enrollments', async (req, reply) => {
    const cohortId = parseId((req.params as any).cohortId);
    if (!cohortId) return [];
    return pageOf(
      req,
      reply,
      (page) => repos.enrollments.findByCohort(cohortId, page),
      () => repos.enrollments.countByCohort(cohortId),
    );
  });
  app.get('/api/v1/academic-actors/:actorId/enrollments', async (req, reply) => {
    const actorId = parseId((req.params as any).actorId);
    if (!actorId) return [];
    return pageOf(
      req,
      reply,
      (page) => repos.enrollments.findByAcademicActor(actorId, page),
      () => repos.enrollments.countByAcademicActor(actorId),
    );
  });
}
