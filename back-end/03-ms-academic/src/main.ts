import Fastify from 'fastify';
const app = Fastify({ logger: true });
app.get('/health', async () => ({ status: 'ok', service: 'academic-service' }));
app.listen({ port: Number(process.env.PORT) || 8084, host: '0.0.0.0' });
