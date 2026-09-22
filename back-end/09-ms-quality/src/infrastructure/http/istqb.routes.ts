import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MemoryStore } from '../persistence/memory.store';
import {
  ALL_ISTQB_ITEM_IDS,
  ISTQB_CATEGORIES,
  ISTQB_QUESTION_COUNT,
  scoreIstqbEvaluation,
} from '../../domain/istqb';
import type { IstqbAssessment } from '../../domain/entities/IstqbAssessment';

export const istqbStores = {
  assessments: new MemoryStore<any>('assessmentId'),
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

const istqbBody = z.object({
  service: z.string().min(1),
  evaluator: z.string().min(1),
  scope: z.string().min(1),
  scores: scoresSchema,
  comments: z.string().optional(),
  status: z.enum(['Draft', 'Completed']).default('Draft'),
  projectId: z.number().int().positive().optional(),
});

function withScore(data: any): IstqbAssessment {
  const scored = scoreIstqbEvaluation(data.scores ?? {});
  return { ...data, ...scored } as IstqbAssessment;
}

export async function registerIstqbRoutes(app: FastifyInstance) {
  // ---------- Instrumento (solo lectura): categorías, ítems y pesos ----------
  app.get('/api/v1/quality/istqb/categories', async () => ({
    standard: 'ISTQB CTFL v4.0',
    totalQuestions: ISTQB_QUESTION_COUNT,
    scale: 'Likert 1-5 (1=totalmente en desacuerdo, 5=totalmente de acuerdo)',
    categories: ISTQB_CATEGORIES,
  }));

  // Alias para compatibilidad: /istqb/characteristics
  app.get('/api/v1/quality/istqb/characteristics', async () => ({
    standard: 'ISTQB CTFL v4.0',
    totalQuestions: ISTQB_QUESTION_COUNT,
    scale: 'Likert 1-5 (1=totalmente en desacuerdo, 5=totalmente de acuerdo)',
    categories: ISTQB_CATEGORIES,
  }));

  // ---------- Crear evaluación ISTQB ----------
  app.post('/api/v1/quality/istqb/assessments', async (req, reply) => {
    const parsed = istqbBody.safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid ISTQB assessment payload', parsed.error.flatten());
    const unknownIds = Object.keys(parsed.data.scores).filter((k) => !ALL_ISTQB_ITEM_IDS.includes(k));
    if (unknownIds.length) return send400(reply, 'Unknown ISTQB item ids', unknownIds);
    if (Object.keys(parsed.data.scores).length !== ISTQB_QUESTION_COUNT) {
      return send400(reply, `All ${ISTQB_QUESTION_COUNT} items are required`, { expected: ISTQB_QUESTION_COUNT, received: Object.keys(parsed.data.scores).length });
    }
    const created = istqbStores.assessments.create(withScore(parsed.data) as any);
    return reply.code(201).send(created);
  });

  // ---------- Listar (paginado + filtro por servicio) ----------
  app.get('/api/v1/quality/istqb/assessments', async (req) => {
    const q = ((req as any).query ?? {}) as any;
    const { limit, offset } = parsePagination(q);
    const { data, total } = istqbStores.assessments.list(
      (e: any) => (!q.service || e.service === q.service) && (!q.status || e.status === q.status) && (!q.projectId || e.projectId === Number(q.projectId)),
      limit,
      offset,
    );
    return { data, total, limit, offset };
  });

  // ---------- Detalle ----------
  app.get('/api/v1/quality/istqb/assessments/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    const found = id ? istqbStores.assessments.get(id) : null;
    if (!found) return reply.code(404).send({ error: 'NotFound', message: 'ISTQB assessment not found' });
    return found;
  });

  // ---------- Actualizar (re-calcula puntaje) ----------
  app.put('/api/v1/quality/istqb/assessments/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id) return reply.code(404).send({ error: 'NotFound', message: 'ISTQB assessment not found' });
    const parsed = istqbBody.partial().safeParse((req as any).body);
    if (!parsed.success) return send400(reply, 'Invalid ISTQB assessment payload', parsed.error.flatten());
    if (parsed.data.scores) {
      const unknownIds = Object.keys(parsed.data.scores).filter((k) => !ALL_ISTQB_ITEM_IDS.includes(k));
      if (unknownIds.length) return send400(reply, 'Unknown ISTQB item ids', unknownIds);
    }
    const current = istqbStores.assessments.get(id);
    if (!current) return reply.code(404).send({ error: 'NotFound', message: 'ISTQB assessment not found' });
    const merged = { ...(current as any), ...parsed.data };
    const updated = istqbStores.assessments.update(id, withScore(merged) as any);
    return updated;
  });

  // ---------- Eliminar (soft-delete) ----------
  app.delete('/api/v1/quality/istqb/assessments/:id', async (req, reply) => {
    const id = parseId((req.params as any).id);
    if (!id || !istqbStores.assessments.remove(id)) return reply.code(404).send({ error: 'NotFound', message: 'ISTQB assessment not found' });
    return reply.code(204).send();
  });

  // ---------- Resumen agregado por servicio ----------
  app.get('/api/v1/quality/istqb/services/:service/summary', async (req) => {
    const service = decodeURIComponent((req.params as any).service);
    const { data, total } = istqbStores.assessments.list((e: any) => e.service === service, 1000, 0);
    if (!total) return { service, evaluations: 0, averageScore: null, averagePercentage: null, level: null, byCategory: {} };
    const avg = (xs: number[]) => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;
    const byCat: Record<string, number[]> = {};
    for (const e of data as any[]) {
      for (const [k, v] of Object.entries((e.byCategory ?? {}) as Record<string, number>)) {
        (byCat[k] ??= []).push(v);
      }
    }
    const byCategory: Record<string, number> = {};
    for (const [k, v] of Object.entries(byCat)) byCategory[k] = avg(v);
    const averageScore = avg((data as any[]).map((e) => e.globalScore ?? 0));
    return {
      service,
      evaluations: total,
      averageScore,
      averagePercentage: Math.round((averageScore / 5) * 1000) / 10,
      level: averageScore < 2 ? 'Deficiente' : averageScore < 3 ? 'En proceso' : averageScore < 3.75 ? 'Aceptable' : averageScore < 4.5 ? 'Bueno' : 'Excelente',
      byCategory,
    };
  });
}
