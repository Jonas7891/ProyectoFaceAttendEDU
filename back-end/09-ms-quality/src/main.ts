import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { registerQualityRoutes } from './infrastructure/http/routes';
import { registerProcessRoutes } from './infrastructure/http/process.routes';
import { registerIstqbRoutes } from './infrastructure/http/istqb.routes';
import { registerEventHook } from './infrastructure/messaging/event.publisher';

const app = Fastify({ logger: true });
const startedAt = Date.now();

// ISO 25010 — Mantenibilidad/Seguridad: correlación de peticiones.
app.addHook('onRequest', async (req, reply) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  (req as any).requestId = requestId;
  reply.header('x-request-id', requestId);
});
app.addHook('onSend', async (_req, reply, payload) => {
  reply.header('x-content-type-options', 'nosniff');
  return payload;
});

// ISO 25010 — Fiabilidad: formato de error uniforme + sin fuga de stack.
app.setErrorHandler((error, req, reply) => {
  const status = (error as any).statusCode && (error as any).statusCode >= 400 ? (error as any).statusCode : 500;
  req.log.error({ err: error, path: req.url }, 'unhandled error');
  reply.code(status).send({
    error: status === 404 ? 'NotFound' : status === 400 ? 'BadRequest' : 'InternalError',
    message: status === 500 ? 'Unexpected internal error' : (error as Error).message,
    path: req.url,
    timestamp: new Date().toISOString(),
  });
});
app.setNotFoundHandler((req, reply) => {
  reply.code(404).send({ error: 'NotFound', message: `Route ${req.method} ${req.url} not found`, timestamp: new Date().toISOString() });
});

const version = process.env.npm_package_version || '0.1.0';
function healthPayload(service: string) {
  return { status: 'ok', service, version, uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000), timestamp: new Date().toISOString() };
}
app.get('/health', async () => healthPayload('quality-service'));
app.get('/api/v1/health', async () => healthPayload('quality-service'));

async function start() {
  // PostgreSQL best-effort: verify DATABASE_URL, fallback to MemoryStore.
  const databaseUrl = process.env.DATABASE_URL;
  const pgSchema = process.env.PG_SCHEMA || 'quality';
  if (databaseUrl) {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: databaseUrl });
      await pool.query(`CREATE SCHEMA IF NOT EXISTS "${pgSchema}"`);
      await pool.query('SELECT 1');
      app.log.info({ schema: pgSchema }, 'postgres connected (quality)');
      await pool.end();
    } catch (err) {
      app.log.warn({ err }, 'postgres unavailable, using MemoryStore');
    }
  } else {
    app.log.warn('DATABASE_URL not set, using MemoryStore');
  }

  await registerQualityRoutes(app);
  await registerProcessRoutes(app);
  await registerIstqbRoutes(app);
  registerEventHook(app);
  const port = Number(process.env.PORT) || 8091;
  await app.listen({ port, host: '0.0.0.0' });
}

if (require.main === module) {
  start().catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}

export { app, start };
