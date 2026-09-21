import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MemoryStore } from '../persistence/memory.store';
import {
  ALL_SUBCHARACTERISTIC_IDS,
  ISO25010_CHARACTERISTICS,
  ISO25010_QUESTION_COUNT,
  scoreEvaluation,
} from '../../domain/iso25010';
import type { QualityEvaluation } from '../../domain/entities/QualityEvaluation';

export const stores = {
  evaluations: new MemoryStore<any>('evaluationId'),
};

function parseId(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parsePagination(query: any): { limit: number; offset: number } {
  let limit = Number(query?.limit ?? 20);
  let offset = Number(query?.offset ?? 0);
  if (!Number.isInteger(limit) || limit <= 0) limit = 20;
  if (!Number.isInteger(offset) || offset < 0) offset = 0;
  limit = Math.min(limit, 100);
  return { limit, offset };
}

function send400(reply: any, message: string, details?: unknown) {
  return reply.code(400).send({ error: 'BadRequest', message, details, timestamp: new Date().toISOString() });
}

const scoresSchema = z.record(z.string(), z.number().int().min(1).max(5));

const evaluationBody = z.object({
  service: z.string().min(1),
  evaluator: z.string().min(1),
  scope: z.string().min(1),
  scores: scoresSchema,
  comments: z.string().optional(),
  status: z.enum(['Draft', 'Completed']).default('Draft'),
});

function withScore(data: any): QualityEvaluation {
  const scored = scoreEvaluation(data.scores ?? {});
  return { ...data, ...scored } as QualityEvaluation;
}

export async function registerQualityRoutes(app: FastifyInstance) {
  // ---------- Instrumento (solo lectura): características, preguntas y pesos ----------
  app.get('/api/v1/quality/characteristics', async () => ({
    standard: 'ISO/IEC 25010:2011',
    totalQuestions: ISO25010_QUESTION_COUNT,
    scale: 'Likert 1-5 (1=totalmente en desacuerdo, 5=totalmente de acuerdo)',
    characteristics: ISO25010_CHARACTERISTICS,
  }));

  // ---------- Crear evaluación ----------
  app.post('/api/v1/quality/evaluations', async (req, reply) => {
    const parsed = evaluationBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid evaluation payload', parsed.error.flatten());
    const unknownIds = Object.keys(parsed.data.scores).filter((k) => !ALL_SUBCHARACTERISTIC_IDS.includes(k));
    if (unknownIds.length) return send400(reply, 'Unknown subcharacteristic ids', unknownIds);
    if (Object.keys(parsed.data.scores).length !== ISO25010_QUESTION_COUNT) {
      return send400(reply, `All ${ISO25010_QUESTION_COUNT} items are required`, { expected: ISO25010_QUESTION_COUNT, received: Object.keys(parsed.data.scores).length });
    }
    const created = stores.evaluations.create(withScore(parsed.data) as any);
    return reply.code(201).send(created);
  });

  // ---------- Listar (paginado + filtro por servicio) ----------
  app.get('/api/v1/quality/evaluations', async (req) => {
    const q = ((req as any).query ?? {}) as any;
    const { limit, offset } = parsePagination(q);
    const { data, total } = stores.evaluations.list(
      (e: any) => (!q.service || e.service === q.service) && (!q.status || e.status === q.status),
      limit,
      offset,
    );
    return { data, total, limit, offset };
  });

  // ---------- Detalle ----------
  app.get('/api/v1/quality/evaluations/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? stores.evaluations.get(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound', message: 'Evaluation not found' });
    return found;
  });

  // ---------- Actualizar (re-calcula puntaje) ----------
  app.put('/api/v1/quality/evaluations/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound', message: 'Evaluation not found' });
    const parsed = evaluationBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid evaluation payload', parsed.error.flatten());
    if (parsed.data.scores) {
      const unknownIds = Object.keys(parsed.data.scores).filter((k) => !ALL_SUBCHARACTERISTIC_IDS.includes(k));
      if (unknownIds.length) return send400(reply, 'Unknown subcharacteristic ids', unknownIds);
    }
    const current = stores.evaluations.get(id);
    if (!current) return reply.code(404).send({ error: 'NotFound', message: 'Evaluation not found' });
    const merged = { ...(current as any), ...parsed.data };
    const updated = stores.evaluations.update(id, withScore(merged) as any);
    return updated;
  });

  // ---------- Eliminar (soft-delete) ----------
  app.delete('/api/v1/quality/evaluations/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !stores.evaluations.remove(id)) return reply.code(404).send({ error: 'NotFound', message: 'Evaluation not found' });
    return reply.code(204).send();
  });

  // ---------- Resumen agregado por servicio ----------
  app.get('/api/v1/quality/services/:service/summary', async (req) => {
    const service = decodeURIComponent((req.params as any).service);
    const { data, total } = stores.evaluations.list((e: any) => e.service === service, 1000, 0);
    if (!total) return { service, evaluations: 0, averageScore: null, averagePercentage: null, level: null, byCharacteristic: {} };
    const avg = (xs: number[]) => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;
    const byChar: Record<string, number[]> = {};
    for (const e of data as any[]) {
      for (const [k, v] of Object.entries((e.byCharacteristic ?? {}) as Record<string, number>)) {
        (byChar[k] ??= []).push(v);
      }
    }
    const byCharacteristic: Record<string, number> = {};
    for (const [k, v] of Object.entries(byChar)) byCharacteristic[k] = avg(v);
    const averageScore = avg((data as any[]).map((e) => e.globalScore ?? 0));
    return {
      service,
      evaluations: total,
      averageScore,
      averagePercentage: Math.round((averageScore / 5) * 1000) / 10,
      level: averageScore < 2 ? 'Deficiente' : averageScore < 3 ? 'En proceso' : averageScore < 3.75 ? 'Aceptable' : averageScore < 4.5 ? 'Bueno' : 'Excelente',
      byCharacteristic,
    };
  });
}
