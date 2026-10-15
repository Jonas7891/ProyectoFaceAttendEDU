import { backendGet } from '../api/backend';
import ENV from '../config/env';
import { ActorService } from './ActorService';
import { getAcademicActorMap, getPersonCached } from './JustificationService';
import { getInstructorScope } from './teachingScope';
import { getCurrentUser } from './UserService';

const ALERTS_LIMIT = 200;

/**
 * Alertas de 08-notification con alcance por rol: el Aprendiz ve las suyas,
 * el Instructor las de los aprendices de sus fichas y el Administrador todas.
 * Devuelve [{ id, title, person, raisedAt, resolved }], abiertas y recientes primero.
 */
export async function loadScopedAlerts(role) {
  let raw;
  if (role === 'Aprendiz') {
    const user = await getCurrentUser();
    const actors = await ActorService.getByPerson(user?.personId);
    raw = (await Promise.all(actors.map((a) =>
      backendGet(ENV.NOTIFY_BASE_URL, 'api/v1/alerts', { actorId: a.academicActorId, limit: ALERTS_LIMIT })))).flat();
  } else if (role === 'Administrador' || role === 'Instructor') {
    raw = await backendGet(ENV.NOTIFY_BASE_URL, 'api/v1/alerts', { limit: ALERTS_LIMIT });
    if (role === 'Instructor') {
      const scope = await getInstructorScope();
      raw = raw.filter((a) => scope.actorIds.has(String(a.academic_actor_id)));
    }
  } else {
    return [];
  }

  const [types, actorMap] = await Promise.all([
    backendGet(ENV.NOTIFY_BASE_URL, 'api/v1/alert-types').catch(() => []),
    getAcademicActorMap(),
  ]);
  const typeName = Object.fromEntries(types.map((at) => [at.alert_type_id, at.name]));
  const alerts = await Promise.all(raw.filter((a) => a?.alert_id != null).map(async (a) => {
    const person = await getPersonCached(actorMap[String(a.academic_actor_id)]?.person_id);
    return {
      id: a.alert_id,
      title: typeName[a.alert_type_id] || '',
      person: `${person?.name || ''} ${person?.last_name || ''}`.trim(),
      raisedAt: a.raised_at,
      resolved: !!a.resolved_at,
    };
  }));
  return alerts.sort((x, y) => Number(x.resolved) - Number(y.resolved)
    || String(y.raisedAt || '').localeCompare(String(x.raisedAt || '')));
}
