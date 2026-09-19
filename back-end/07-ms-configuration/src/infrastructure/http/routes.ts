import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MemoryStore } from '../persistence/memory.store';

export const stores = {
  academic: new MemoryStore<any>('configurationId'),
  security: new MemoryStore<any>('configurationId'),
  cases: new MemoryStore<any>('caseId'),
};

const academicBody = z.object({
  schoolId: z.number().int(),
  configurationName: z.string().min(1),
  configurationValue: z.string(),
  description: z.string().optional(),
});

const securityBody = z.object({
  configurationName: z.string().min(1),
  configurationValue: z.string(),
  description: z.string().optional(),
});

const caseBody = z.object({
  personId: z.string().min(1),
  biometricType: z.enum(['FACIAL', 'FINGERPRINT']),
  fingerNumber: z.number().int().min(1).max(10).nullable().optional(),
  currentEmbeddingRef: z.string().nullable().optional(),
  reason: z.string().min(1),
  requestedBy: z.string().nullable().optional(),
});

function registerAcademicConfigRoutes(app: FastifyInstance, base: string) {
  app.post(base, async (req, reply) => {
    const parsed = academicBody.safeParse((req as any).body);
    if (!parsed.success) return reply.code(400).send({ error: 'BadRequest', details: parsed.error.flatten() });
    return reply.code(201).send(stores.academic.create(parsed.data as any));
  });
  app.get(base, async (req) => {
    const q = (req.query as any) ?? {};
    if (q.name) return stores.academic.list((c: any) => c.configurationName === q.name);
    return stores.academic.list();
  });
  app.get(`${base}/:id`, async (req, reply) => {
    const found = stores.academic.get((req.params as any).id);
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put(`${base}/:id`, async (req, reply) => {
    const updated = stores.academic.update((req.params as any).id, (req as any).body ?? {});
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete(`${base}/:id`, async (req, reply) => {
    if (!stores.academic.remove((req.params as any).id)) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
}

function registerSecurityConfigRoutes(app: FastifyInstance, base: string) {
  app.post(base, async (req, reply) => {
    const parsed = securityBody.safeParse((req as any).body);
    if (!parsed.success) return reply.code(400).send({ error: 'BadRequest', details: parsed.error.flatten() });
    return reply.code(201).send(stores.security.create(parsed.data as any));
  });
  app.get(base, async (req) => {
    const q = (req.query as any) ?? {};
    if (q.name) return stores.security.list((c: any) => c.configurationName === q.name);
    return stores.security.list();
  });
  app.get(`${base}/:id`, async (req, reply) => {
    const found = stores.security.get((req.params as any).id);
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.put(`${base}/:id`, async (req, reply) => {
    const updated = stores.security.update((req.params as any).id, (req as any).body ?? {});
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete(`${base}/:id`, async (req, reply) => {
    if (!stores.security.remove((req.params as any).id)) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
}

export async function registerConfigurationRoutes(app: FastifyInstance) {
  // SERVICE.md canonical bases
  registerAcademicConfigRoutes(app, '/api/v1/configurations/academic');
  registerSecurityConfigRoutes(app, '/api/v1/configurations/security');
  // Kong aliases (kong.yml) for gateway prefix matching
  registerAcademicConfigRoutes(app, '/api/v1/academic-configurations');
  registerSecurityConfigRoutes(app, '/api/v1/security-configurations');

  // Schools -> academic configs
  for (const base of ['/api/v1/configurations/academic', '/api/v1/academic-configurations']) {
    void base;
  }
  app.get('/api/v1/schools/:schoolId/configurations', async (req) => {
    const schoolId = Number((req.params as any).schoolId);
    return stores.academic.list((c: any) => c.schoolId === schoolId);
  });

  // ---------- Biometric update cases ----------
  app.post('/api/v1/biometric-update-cases', async (req, reply) => {
    const parsed = caseBody.safeParse((req as any).body);
    if (!parsed.success) return reply.code(400).send({ error: 'BadRequest', details: parsed.error.flatten() });
    if (parsed.data.biometricType === 'FINGERPRINT' && !parsed.data.fingerNumber) {
      return reply.code(400).send({ error: 'BadRequest', message: 'fingerNumber required for FINGERPRINT' });
    }
    const created = stores.cases.create(
      { ...parsed.data, updateStatus: 'Pending', requestedAt: new Date().toISOString() } as any,
      true,
    );
    return reply.code(201).send(created);
  });
  app.get('/api/v1/biometric-update-cases', async (req) => {
    const q = (req.query as any) ?? {};
    if (q.status) return stores.cases.list((c: any) => c.updateStatus === q.status);
    return stores.cases.list();
  });
  app.get('/api/v1/biometric-update-cases/:id', async (req, reply) => {
    const found = stores.cases.get((req.params as any).id);
    if (!found) return reply.code(404).send({ error: 'NotFound' });
    return found;
  });
  app.patch('/api/v1/biometric-update-cases/:id/review', async (req, reply) => {
    const parsed = z
      .object({ updateStatus: z.enum(['In_Review', 'Approved', 'Rejected']), reviewedBy: z.string().optional(), resolutionNotes: z.string().optional() })
      .safeParse((req as any).body);
    if (!parsed.success) return reply.code(400).send({ error: 'BadRequest', details: parsed.error.flatten() });
    const updated = stores.cases.update((req.params as any).id, {
      ...parsed.data,
      reviewedAt: new Date().toISOString(),
    } as any);
    if (!updated) return reply.code(404).send({ error: 'NotFound' });
    return updated;
  });
  app.delete('/api/v1/biometric-update-cases/:id', async (req, reply) => {
    if (!stores.cases.remove((req.params as any).id)) return reply.code(404).send({ error: 'NotFound' });
    return reply.code(204).send();
  });
  app.get('/api/v1/persons/:personId/biometric-cases', async (req) => {
    const personId = (req.params as any).personId;
    return stores.cases.list((c: any) => c.personId === personId);
  });
}
