import Fastify from 'fastify';
import { registerNotificationRoutes } from '../routes';
import * as actorScope from '../actorScope';

function fakeAlertTypeRepo() {
  const store = new Map<number, any>();
  let nextId = 1;
  return {
    async create(draft: any) { const row = { alertTypeId: nextId++, ...draft }; store.set(row.alertTypeId, row); return row; },
    async list() { return [...store.values()]; },
    async count() { return store.size; },
    async findById(id: number) { return store.get(id) ?? null; },
    async existsById(id: number) { return store.has(id); },
    async update(id: number, patch: any) { const row = store.get(id); if (!row) return null; Object.assign(row, patch); return row; },
    async softDelete(id: number) { return store.delete(id); },
    async findByCode(code: string) { return [...store.values()].find((r) => r.code === code) ?? null; },
  };
}

describe('alert-type routes', () => {
  it('rejects an invalid channel on create', async () => {
    const app = Fastify();
    await registerNotificationRoutes(app, { alerts: {} as any, alertTypes: fakeAlertTypeRepo() as any });
    const res = await app.inject({ method: 'POST', url: '/api/v1/alert-types', payload: { code: 'X', name: 'Y', severity: 'WARNING', channel: 'SMS' } });
    expect(res.statusCode).toBe(400);
  });
  it('creates and lists on both the canonical path and the alias', async () => {
    const app = Fastify();
    jest.spyOn(actorScope, 'resolveActorScope').mockResolvedValue(null); // Super Administrador
    await registerNotificationRoutes(app, { alerts: {} as any, alertTypes: fakeAlertTypeRepo() as any });
    await app.inject({ method: 'POST', url: '/api/v1/alert-types', payload: { code: 'X', name: 'Y', severity: 'WARNING' } });
    const canonical = await app.inject({ method: 'GET', url: '/api/v1/alert-types' });
    const alias = await app.inject({ method: 'GET', url: '/alert-types' });
    expect(canonical.json().alert_types).toHaveLength(1);
    expect(alias.json().alert_types).toHaveLength(1);
  });
});

describe('alert-type routes — the catalogue is global (AUD-66)', () => {
  const asSchoolAdmin = () => jest.spyOn(actorScope, 'resolveActorScope').mockResolvedValue(new Set([1]));
  const asSuperAdmin = () => jest.spyOn(actorScope, 'resolveActorScope').mockResolvedValue(null);

  it('a school Administrador cannot create, edit or delete alert types, on either path', async () => {
    const app = Fastify();
    const alertTypes = fakeAlertTypeRepo();
    const seeded = await alertTypes.create({ code: 'X', name: 'Y', severity: 'INFO' });
    asSchoolAdmin();
    await registerNotificationRoutes(app, { alerts: {} as any, alertTypes: alertTypes as any });
    for (const base of ['/api/v1/alert-types', '/alert-types']) {
      const post = await app.inject({ method: 'POST', url: base, payload: { code: 'Z', name: 'Z', severity: 'INFO' } });
      const put = await app.inject({ method: 'PUT', url: `${base}/${seeded.alertTypeId}`, payload: { name: 'Hack' } });
      const del = await app.inject({ method: 'DELETE', url: `${base}/${seeded.alertTypeId}` });
      expect([post.statusCode, put.statusCode, del.statusCode]).toEqual([403, 403, 403]);
    }
    expect(await alertTypes.list()).toEqual([expect.objectContaining({ name: 'Y' })]);
    expect((await app.inject({ method: 'GET', url: '/api/v1/alert-types' })).statusCode).toBe(200);
  });

  it('Super Administrador still manages the catalogue', async () => {
    const app = Fastify();
    const alertTypes = fakeAlertTypeRepo();
    asSuperAdmin();
    await registerNotificationRoutes(app, { alerts: {} as any, alertTypes: alertTypes as any });
    const created = await app.inject({ method: 'POST', url: '/api/v1/alert-types', payload: { code: 'Z', name: 'Z', severity: 'INFO' } });
    expect(created.statusCode).toBe(201);
    const id = created.json().alertTypeId;
    expect((await app.inject({ method: 'PUT', url: `/api/v1/alert-types/${id}`, payload: { name: 'Zeta' } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'DELETE', url: `/api/v1/alert-types/${id}` })).statusCode).toBe(204);
  });
});
