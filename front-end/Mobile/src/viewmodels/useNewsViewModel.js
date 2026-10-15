import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../view/components/common/ThemeContext';
import {getCurrentUser, getCurrentUserRole} from "../services/UserService";
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {backendGet} from '../api/backend';
import ENV from '../config/env';
import {ActorService} from '../services/ActorService';
import {AlertService} from '../services/AlertService';
import {getAcademicActorMap, getPersonCached} from '../services/JustificationService';
import {getInstructorScope} from '../services/teachingScope';

const ALERTS_LIMIT = 200;

// Novedades = alertas de 08-notification con alcance por rol: el Aprendiz ve
// las suyas, el Instructor las de los aprendices de sus fichas y el
// Administrador todas. Resolver es acción del staff (RBAC del backend).
export function useNewsViewModel() {
    const {t} = useTranslation();
    const {loadThemeForRole} = useTheme();
    const updateKey = useLanguageRefresh();

    const [userRole, setUserRole] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const role = await getCurrentUserRole();
            setUserRole(role);
            if (role) await loadThemeForRole(role);

            let raw;
            if (role === 'Aprendiz') {
                const user = await getCurrentUser();
                const actors = await ActorService.getByPerson(user?.personId);
                raw = (await Promise.all(actors.map((a) =>
                    backendGet(ENV.NOTIFY_BASE_URL, 'api/v1/alerts', {actorId: a.academicActorId, limit: ALERTS_LIMIT})))).flat();
            } else {
                raw = await backendGet(ENV.NOTIFY_BASE_URL, 'api/v1/alerts', {limit: ALERTS_LIMIT});
                if (role !== 'Administrador') {
                    const scope = await getInstructorScope();
                    raw = raw.filter((a) => scope.actorIds.has(String(a.academic_actor_id)));
                }
            }

            const [types, actorMap] = await Promise.all([
                backendGet(ENV.NOTIFY_BASE_URL, 'api/v1/alert-types').catch(() => []),
                getAcademicActorMap(),
            ]);
            const typeName = Object.fromEntries(types.map((at) => [at.alert_type_id, at.name]));
            const enriched = await Promise.all(raw.filter((a) => a?.alert_id != null).map(async (a) => {
                const person = await getPersonCached(actorMap[String(a.academic_actor_id)]?.person_id);
                return {
                    id: a.alert_id,
                    title: typeName[a.alert_type_id] || t('news.alert'),
                    person: `${person?.name || ''} ${person?.last_name || ''}`.trim(),
                    raisedAt: a.raised_at,
                    resolved: !!a.resolved_at,
                };
            }));
            enriched.sort((x, y) => Number(x.resolved) - Number(y.resolved) || String(y.raisedAt || '').localeCompare(String(x.raisedAt || '')));
            setAlerts(enriched);
        } catch (e) {
            console.error('Error cargando novedades:', e);
            setError(t('news.loadError'));
        } finally {
            setLoading(false);
        }
    }, [loadThemeForRole, t]);

    useEffect(() => {
        load();
    }, [load]);

    const resolve = useCallback(async (id) => {
        setResolvingId(id);
        try {
            await AlertService.markResolved(id);
            setAlerts((prev) => prev.map((a) => (a.id === id ? {...a, resolved: true} : a)));
        } catch (e) {
            setError(e?.message || t('news.resolveError'));
        } finally {
            setResolvingId(null);
        }
    }, [t]);

    return {
        userRole,
        updateKey,
        alerts,
        loading,
        error,
        resolvingId,
        canResolve: userRole === 'Administrador' || userRole === 'Instructor',
        resolve,
        reload: load,
    };
}
