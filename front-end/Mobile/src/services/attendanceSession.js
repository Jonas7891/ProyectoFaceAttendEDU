import { request, POST } from '../api/apiClient';
import { backendGet, toSnakeDeep } from '../api/backend';
import ENV from '../config/env';
import { ActorService } from './ActorService';
import { getAcademicActorMap, getPersonCached } from './JustificationService';
import { getCurrentUser } from './UserService';

// Regla de la institución: hasta 10 min después del inicio cuenta como
// presente; después (o sin llegar) la clase queda como ausencia.
export const ABSENT_AFTER_MINUTES = 10;

const pad = (n) => String(n).padStart(2, '0');
export const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// day_of_week en 04-scheduling es ISO: lunes = 1 … domingo = 7.
export const isoWeekday = (d) => ((d.getDay() + 6) % 7) + 1;

/** Inicio de la clase como Date local: fecha de la sesión + starts_at ("08:00:00"). */
export function classStart(block, sessionDate) {
  const [h, m] = String(block.starts_at || '00:00').split(':').map(Number);
  const [y, mo, d] = sessionDate.split('-').map(Number);
  return new Date(y, mo - 1, d, h || 0, m || 0);
}

export const absenceDeadline = (block, sessionDate) =>
  new Date(classStart(block, sessionDate).getTime() + ABSENT_AFTER_MINUTES * 60000);

/** Estado de quien se identifica en `at`: presente dentro del margen, ausente después. */
export const statusAt = (block, sessionDate, at) => (at > absenceDeadline(block, sessionDate) ? 'Absent' : 'Present');

/** Clases de hoy del instructor autenticado, con la sesión de hoy si ya existe. */
export async function getMyClassesToday(now = new Date()) {
  const user = await getCurrentUser();
  const actor = (await ActorService.getByPerson(user?.personId))?.[0];
  if (!actor) return [];
  const today = localDate(now);
  const blocks = (await backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/schedule-blocks', { instructorActorId: actor.academicActorId }))
    .filter((b) => Number(b.day_of_week) === isoWeekday(now))
    .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
  return Promise.all(blocks.map(async (block) => {
    const [sessions, course] = await Promise.all([
      backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/class-sessions', { scheduleBlockId: block.schedule_block_id }),
      backendGet(ENV.ACADEMIC_BASE_URL, `api/v1/courses/${block.course_id}`, null, { useCache: true }).catch(() => []),
    ]);
    return {
      block,
      courseName: course[0]?.name || '',
      session: sessions.find((s) => s.session_date === today) || null,
      instructorActorId: actor.academicActorId,
      sessionDate: today,
    };
  }));
}

/** Abre la sesión de hoy (04 la crea en estado Open). */
export async function openSession(block, sessionDate) {
  return toSnakeDeep(await request({
    method: POST,
    url: 'api/v1/class-sessions',
    data: { scheduleBlockId: block.schedule_block_id, sessionDate },
  }));
}

export async function closeSession(session, instructorActorId) {
  return toSnakeDeep(await request({
    method: POST,
    url: `api/v1/class-sessions/${session.class_session_id}/close`,
    data: { closedBy: instructorActorId },
  }));
}

/** Aprendices matriculados (activos) en la ficha del bloque: [{ actorId, personId, name }]. */
export async function getRoster(block) {
  const [enrollments, actorMap] = await Promise.all([
    backendGet(ENV.ACADEMIC_BASE_URL, `api/v1/cohorts/${block.cohort_id}/enrollments`),
    getAcademicActorMap(),
  ]);
  const active = enrollments.filter((e) => !e.enrollment_status || e.enrollment_status === 'Active');
  return Promise.all(active.map(async (e) => {
    const personId = actorMap[String(e.academic_actor_id)]?.person_id;
    const person = await getPersonCached(personId);
    return {
      actorId: String(e.academic_actor_id),
      personId,
      name: `${person?.name || ''} ${person?.last_name || ''}`.trim(),
    };
  }));
}

export async function getRecords(session) {
  return backendGet(ENV.ATTENDANCE_BASE_URL, 'api/v1/attendance-records', { classSessionId: session.class_session_id });
}

const recordOf = (records, actorId) => records.find((r) => String(r.academic_actor_id) === String(actorId));

/**
 * Registra a la persona identificada. Devuelve { member, record, duplicate };
 * lanza Error('not-enrolled') si no pertenece a la ficha.
 */
export async function recordFace({ session, block, sessionDate, roster, records, personId, score, at = new Date() }) {
  const member = roster.find((m) => m.personId === personId);
  if (!member) throw new Error('not-enrolled');
  const existing = recordOf(records, member.actorId);
  if (existing) return { member, record: existing, duplicate: true };
  const record = toSnakeDeep(await request({
    method: POST,
    url: 'api/v1/attendance-records',
    data: {
      classSessionId: session.class_session_id,
      academicActorId: Number(member.actorId),
      attendanceStatus: statusAt(block, sessionDate, at),
      captureMethod: 'FACIAL',
      ...(score != null ? { matchScore: Number(score.toFixed(4)) } : {}),
    },
  }));
  return { member, record, duplicate: false };
}

/**
 * Pasado el margen, quien no tiene registro queda ausente automáticamente
 * (sin acción del instructor). Idempotente: solo crea los que faltan.
 */
export async function markMissingAbsent({ session, block, sessionDate, roster, records, at = new Date() }) {
  if (session.session_status === 'Cancelled' || at <= absenceDeadline(block, sessionDate)) return [];
  const missing = roster.filter((m) => !recordOf(records, m.actorId));
  if (!missing.length) return [];
  const created = await request({
    method: POST,
    url: 'api/v1/attendance-records/bulk',
    data: missing.map((m) => ({
      classSessionId: session.class_session_id,
      academicActorId: Number(m.actorId),
      attendanceStatus: 'Absent',
      captureMethod: 'MANUAL',
    })),
  });
  return (Array.isArray(created) ? created : []).map(toSnakeDeep);
}
