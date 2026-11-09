import { z } from 'zod';
import { badRequest, notFound } from '../../../application/errors';
import { todayIso } from '../../localDate';
import { patchSchema } from '../patchSchema';
import { auditOf, bodyOf, handle, pageOf, param, type RouteContext } from './support';

// Seeded by Liquibase (1=STUDENT, 2=INSTRUCTOR); nothing is seeded at boot.
const actorTypeBody = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
});

// `academic_actor.person_id` is a native UUID column (cross-context reference to
// identity.person, no FK), so the payload must be valid UUID text.
const actorBody = z.object({
  personId: z.string().uuid(),
  actorTypeId: z.number().int().default(1),
  schoolId: z.number().int(),
  actorCode: z.string().min(1).max(50),
  startedOn: z.string().min(1).default(() => todayIso()),
  endedOn: z.string().nullable().optional(),
  status: z.boolean().default(true),
});

export function registerActorTypeRoutes({ app, useCases, callerOf }: RouteContext) {
  const types = useCases.actorTypes;

  app.post('/api/v1/actor-types', handle(async (req, reply) => {
    const body = bodyOf(actorTypeBody, req, 'Invalid actor-type payload');
    return reply.code(201).send(await types.create(await callerOf(req), body, auditOf(req)));
  }));
  app.get('/api/v1/actor-types', handle(async (req, reply) => pageOf(req, reply, types.list())));
  app.get('/api/v1/actor-types/:id', handle(async (req) => types.get(param(req, 'id'))));
  app.put('/api/v1/actor-types/:id', handle(async (req) => {
    const id = param(req, 'id');
    if (!id) throw notFound();
    const patch = bodyOf(patchSchema(actorTypeBody), req, 'Invalid actor-type payload');
    return types.update(await callerOf(req), id, patch, auditOf(req));
  }));
  app.delete('/api/v1/actor-types/:id', handle(async (req, reply) => {
    await types.delete(await callerOf(req), param(req, 'id'), auditOf(req));
    return reply.code(204).send();
  }));
}

export function registerActorRoutes({ app, useCases, callerOf }: RouteContext) {
  const actors = useCases.actors;

  app.post('/api/v1/academic-actors', handle(async (req, reply) => {
    const body = bodyOf(actorBody, req, 'Invalid actor payload');
    return reply.code(201).send(await actors.create(await callerOf(req), body, auditOf(req)));
  }));
  // ?personId= resuelve en una peticion a que sede pertenece quien inicia sesion (o a
  // la de un tercero); sin el, la coleccion completa — ambos acotados a la sede del
  // llamante salvo Super Administrador.
  app.get('/api/v1/academic-actors', handle(async (req, reply) => {
    const personId = req.query?.personId;
    const caller = await callerOf(req);
    const listing = typeof personId === 'string' && personId.length > 0
      ? await actors.listByPerson(caller, personId)
      : actors.list(caller);
    return pageOf(req, reply, listing);
  }));
  app.get('/api/v1/academic-actors/:id', handle(async (req) => actors.get(await callerOf(req), param(req, 'id'))));
  app.put('/api/v1/academic-actors/:id', handle(async (req) => {
    const id = param(req, 'id');
    if (!id) throw notFound();
    const patch = bodyOf(patchSchema(actorBody), req, 'Invalid actor payload');
    return actors.update(await callerOf(req), id, patch, auditOf(req));
  }));
  app.patch('/api/v1/academic-actors/:id/status', handle(async (req) => {
    const parsed = z.object({ status: z.boolean() }).safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid status payload');
    const id = param(req, 'id');
    if (!id) throw notFound();
    return actors.update(await callerOf(req), id, parsed.data, auditOf(req));
  }));
  app.delete('/api/v1/academic-actors/:id', handle(async (req, reply) => {
    await actors.delete(await callerOf(req), param(req, 'id'), auditOf(req));
    return reply.code(204).send();
  }));
  app.get('/api/v1/schools/:schoolId/actors', handle(async (req, reply) => {
    const schoolId = param(req, 'schoolId');
    if (!schoolId) return [];
    return pageOf(req, reply, actors.listBySchool(await callerOf(req), schoolId));
  }));
}
