import Fastify from 'fastify';
import { registerConfigurationRoutes } from './infrastructure/http/routes';
import { registerEventHook } from './infrastructure/messaging/event.publisher';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok', service: 'configuration-service' }));
app.get('/api/v1/health', async () => ({ status: 'ok', service: 'configuration-service' }));

async function start() {
  await registerConfigurationRoutes(app);
  registerEventHook(app);
  const port = Number(process.env.PORT) || 8089;
  await app.listen({ port, host: '0.0.0.0' });
}

if (require.main === module) {
  start().catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}

export { app, start };
