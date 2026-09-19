import Fastify from 'fastify';
const app = Fastify({ logger: true });
app.get('/health', async () => ({ status: 'ok', service: 'configuration-service' }));
app.listen({ port: Number(process.env.PORT) || 8089, host: '0.0.0.0' });
