import { backendGet } from '../api/backend';
import ENV from '../config/env';
import { ActorService } from './ActorService';
import { getCurrentUser } from './UserService';

const safe = (promise) => promise.catch(() => []);

/**
 * Alcance del instructor autenticado: las sesiones que dicta y los actores
 * matriculados en sus fichas. Acota justificaciones y reportes (HU-JUS-002)
 * porque el backend todavía devuelve los registros de toda la institución.
 * shortcut: filtro en el cliente; mover a un filtro por instructor en 05-attendance cuando exista.
 */
export async function getInstructorScope() {
  const user = await getCurrentUser();
  const actor = (await ActorService.getByPerson(user?.personId))?.[0];
  if (!actor) return { sessionIds: new Set(), actorIds: new Set() };

  const blocks = await safe(
    backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/schedule-blocks', { instructorActorId: actor.academicActorId }),
  );
  const cohortIds = [...new Set(blocks.map((b) => b.cohort_id).filter((id) => id != null))];
  const [sessions, enrollments] = await Promise.all([
    Promise.all(
      blocks.map((b) => safe(backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/class-sessions', { scheduleBlockId: b.schedule_block_id }))),
    ),
    Promise.all(cohortIds.map((id) => safe(backendGet(ENV.ACADEMIC_BASE_URL, `api/v1/cohorts/${id}/enrollments`)))),
  ]);
  return {
    sessionIds: new Set(sessions.flat().map((s) => String(s.class_session_id))),
    actorIds: new Set(enrollments.flat().map((e) => String(e.academic_actor_id))),
  };
}
