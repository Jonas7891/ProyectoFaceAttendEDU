import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { registerConfigurationRoutes } from './infrastructure/http/routes';
import { registerEventHook } from './infrastructure/messaging/event.publisher';
import { registerQualityMiddleware, registerQualityHealthEndpoint } from './infrastructure/http/qualityMiddleware';
import { registerAuthGuard } from './infrastructure/http/authGuard';
import { configurationPermission } from './infrastructure/http/permissions';

const app = Fastify({ logger: true });
const startedAt = Date.now();

app.addHook('onRequest', async (req, reply) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  (req as any).requestId = requestId;
  reply.header('x-request-id', requestId);
});
app.addHook('onSend', async (_req, reply, payload) => {
  reply.header('x-content-type-options', 'nosniff');
  return payload;
});
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
app.get('/health', async () => healthPayload('configuration-service'));
app.get('/api/v1/health', async () => healthPayload('configuration-service'));

async function start() {
  // PostgreSQL is a hard dependency: an unreachable database is a fatal boot
  // error (compose restarts us). Only the test environment may skip it.
  const databaseUrl = process.env.DATABASE_URL;
  const pgSchema = process.env.PG_SCHEMA || 'configuration';
  if (!databaseUrl && process.env.NODE_ENV !== 'test') {
    throw new Error('DATABASE_URL is not set — refusing to start');
  }
  if (databaseUrl) {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: databaseUrl });
    try {
      await pool.query(`CREATE SCHEMA IF NOT EXISTS "${pgSchema}"`);
      await pool.query('SELECT 1');
      app.log.info({ schema: pgSchema }, 'postgres connected (configuration)');
    } catch (err) {
      app.log.error({ err }, 'postgres unavailable — refusing to start');
      throw err;
    } finally {
      await pool.end().catch(() => undefined);
    }
  }

  registerAuthGuard(app, configurationPermission);

  // ISO/IEC 9001 — Quality audit middleware (Cláusula 8.5.2 / 9.1)
  registerQualityMiddleware(app);
  registerQualityHealthEndpoint(app);

  await registerConfigurationRoutes(app);
  registerEventHook(app);
  const port = Number(process.env.PORT) || 8087;
  await app.listen({ port, host: '0.0.0.0' });
}

if (require.main === module) {
  start().catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}

export { app, start };
