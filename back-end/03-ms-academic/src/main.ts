import Fastify from 'fastify';
import { registerAcademicRoutes } from './infrastructure/http/routes';
import { registerEventHook } from './infrastructure/messaging/event.publisher';
import { registerQualityMiddleware, registerQualityHealthEndpoint } from './infrastructure/http/qualityMiddleware';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok', service: 'academic-service' }));
app.get('/api/v1/health', async () => ({ status: 'ok', service: 'academic-service' }));

async function start() {
  // ISO/IEC 9001 — Quality audit middleware (Cláusula 8.5.2 / 9.1)
  registerQualityMiddleware(app);
  registerQualityHealthEndpoint(app);

  await registerAcademicRoutes(app);
  registerEventHook(app);
  const port = Number(process.env.PORT) || 8084;
  await app.listen({ port, host: '0.0.0.0' });
}

if (require.main === module) {
  start().catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}

export { app, start };
