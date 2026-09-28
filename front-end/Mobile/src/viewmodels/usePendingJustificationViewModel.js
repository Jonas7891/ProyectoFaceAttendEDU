import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getCurrentUserRole, getCurrentUser} from '../services/UserService';
import {ActorService} from '../services/ActorService';
import {JustificationService, getJustificationTypeMap, getAcademicActorMap, getAttendanceRecordCached, getPersonCached, mapConcurrent} from '../services/JustificationService';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export const JUSTIFICATION_TYPE = {
    ABSENCE: 'inasistencia',
    LATE: 'retardo',
};

export const USER_ROLE = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
};

export const JUSTIFICATION_STATUS_INTERNAL = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

export const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626'];
export const getAvatarColor = (name = '') => {
    const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

export const getFileIcon = (mime = '') => {
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('word') || mime.includes('document')) return '📝';
    return '📎';
};

const normalizeRole = (role = '') => {
    const r = String(role).toLowerCase();
    if (r.includes('admin')) return USER_ROLE.ADMIN;
    if (r.includes('docen') || r.includes('profesor') || r.includes('teacher') || r.includes('instructor'))
        return USER_ROLE.TEACHER;
    if (r.includes('estud') || r.includes('student')) return USER_ROLE.STUDENT;
    return USER_ROLE.ADMIN;
};

const getLocaleForLanguage = (lang) => {
    const localeMap = { es: 'es-CO', en: 'en-US', fr: 'fr-FR', pt: 'pt-BR' };
    return localeMap[lang?.split('-')[0]] || 'es-CO';
};

export const usePendingJustificationViewModel = () => {
    const {t, i18n} = useTranslation();
    const currentLocale = getLocaleForLanguage(i18n.language);

    const [justifications, setJustifications] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchJustifications = useCallback(async (role) => {
        try {
            setLoading(true);

            const normalizedRole = normalizeRole(role);
            let records;
            if (normalizedRole === USER_ROLE.STUDENT) {
                const user = await getCurrentUser();
                const actors = await ActorService.getByPerson(user?.personId);
                if (actors?.length > 0) {
                    const mine = [];
                    for (const actor of actors) {
                        mine.push(...await JustificationService.getByActor(actor.academicActorId));
                    }
                    records = mine;
                } else {
                    records = [];
                }
            } else if (normalizedRole === USER_ROLE.TEACHER) {
                // Para teachers: traer solo Pending + Approved, sin mezclarlas
                const all = await JustificationService.getAll();
                records = all.filter(j => {
                    const jd = j?.justificationId !== undefined ? {
                        reviewStatus: j.reviewStatus ?? j.review_status,
                    } : j;
                    return ['Pending', 'Approved'].includes(jd.reviewStatus);
                });
            } else {
                // ADMIN: traer todas
                records = await JustificationService.getAll();
            }

            const [typeMap, actorMap] = await Promise.all([getJustificationTypeMap(), getAcademicActorMap()]);

            const enriched = await mapConcurrent(records, async (j) => {
                // Accept both Justification models (camelCase) and raw rows (snake_case).
                const jd = {
                    justification_id: j.justificationId ?? j.justification_id,
                    justification_type_id: j.justificationTypeId ?? j.justification_type_id,
                    attendance_record_id: j.attendanceRecordId ?? j.attendance_record_id,
                    reason: j.reason,
                    submitted_at: j.submittedAt ?? j.submitted_at,
                    review_status: j.reviewStatus ?? j.review_status,
                };

                const ar = await getAttendanceRecordCached(jd.attendance_record_id);
                const actor = actorMap[String(ar?.academic_actor_id)] || {};
                const person = await getPersonCached(actor.person_id);

                const statusMap = { Pending: 'pending', Approved: 'approved', Rejected: 'rejected' };
                const jType = typeMap[jd.justification_type_id] || {};

                return {
                    id: String(jd.justification_id),
                    role: actor.actor_type_id === 1 ? USER_ROLE.STUDENT : USER_ROLE.TEACHER,
                    userName: `${person?.name || ''} ${person?.last_name || ''}`.trim(),
                    userCode: actor.actor_code || '—',
                    userGroup: '—',
                    type: /ret|late|tard/i.test(jType.name || '') ? 'retardo' : 'inasistencia',
                    date: jd.submitted_at ? jd.submitted_at.split('T')[0] : '',
                    time: null,
                    description: jd.reason || '',
                    attachment: null,
                    submittedAt: jd.submitted_at || '',
                    status: statusMap[jd.review_status] || 'pending',
                };
            });

            setJustifications(enriched);
        } catch (error) {
            console.error('Error fetching justifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const role = await getCurrentUserRole();
                setUserRole(normalizeRole(role));
                await fetchJustifications(role);
            } catch (error) {
                console.error('Error cargando rol:', error);
                setUserRole(USER_ROLE.ADMIN);
                await fetchJustifications(null);
            }
        };
        init();
    }, []);

    const baseJustifications = useMemo(() => {
        if (!userRole) return [];
        if (userRole === USER_ROLE.TEACHER) {
            return justifications.filter((j) => j.role === USER_ROLE.STUDENT);
        }
        return justifications;
    }, [justifications, userRole]);

    const filtered = useMemo(() => {
        if (userRole === USER_ROLE.ADMIN && activeFilter !== 'all') {
            return baseJustifications.filter((j) => j.role === activeFilter);
        }
        // Para TEACHER, filtrar también por estado cuando activeFilter no es 'all'
        if (userRole === USER_ROLE.TEACHER && activeFilter !== 'all') {
            return baseJustifications.filter((j) => j.status === activeFilter);
        }
        return baseJustifications;
    }, [baseJustifications, activeFilter, userRole]);

    const openDetail = useCallback((item) => { setSelectedItem(item); setModalVisible(true); }, []);
    const closeDetail = useCallback(() => { setModalVisible(false); setTimeout(() => setSelectedItem(null), 300); }, []);

    const approveJustification = useCallback(async (id) => {
        if (userRole === USER_ROLE.STUDENT) return;
        const reviewer = await getCurrentUser();
        const updated = await JustificationService.approve(id, reviewer?.userId);
        if (updated) {
            setJustifications((prev) => prev.map((j) => j.id === id ? {...j, status: JUSTIFICATION_STATUS_INTERNAL.APPROVED} : j));
            closeDetail();
        }
    }, [closeDetail, userRole]);

    const rejectJustification = useCallback(async (id) => {
        if (userRole === USER_ROLE.STUDENT) return;
        const reviewer = await getCurrentUser();
        const updated = await JustificationService.reject(id, reviewer?.userId);
        if (updated) {
            setJustifications((prev) => prev.map((j) => j.id === id ? {...j, status: JUSTIFICATION_STATUS_INTERNAL.REJECTED} : j));
            closeDetail();
        }
    }, [closeDetail, userRole]);

    const counts = useMemo(() => {
        if (userRole === USER_ROLE.TEACHER) {
            const pending = justifications.filter(j => j.status === 'pending').length;
            const approved = justifications.filter(j => j.status === 'approved').length;
            return {all: justifications.length, pending, approved};
        }
        if (userRole === USER_ROLE.STUDENT) {
            return {all: baseJustifications.length};
        }
        return {
            all: justifications.length,
            student: justifications.filter((j) => j.role === USER_ROLE.STUDENT).length,
            teacher: justifications.filter((j) => j.role === USER_ROLE.TEACHER).length,
        };
    }, [justifications, baseJustifications, userRole]);

    const formatDate = useCallback((isoDate = '') => {
        if (!isoDate) return '—';
        try {
            const date = new Date(isoDate + 'T00:00:00');
            return date.toLocaleDateString(currentLocale, { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return '—'; }
    }, [currentLocale]);

    const getTypeLabel = useCallback((type) =>
        type === JUSTIFICATION_TYPE.ABSENCE ? t('justificationType.absence') : t('justificationType.late'), [t]);

    const getTypeColors = useCallback((type) =>
        type === JUSTIFICATION_TYPE.ABSENCE ? {bg: '#FEF3C7', text: '#92400E'} : {bg: '#DBEAFE', text: '#1E40AF'}, []);

    const getRoleLabel = useCallback((role) =>
        role === USER_ROLE.STUDENT ? t('userRole.student') : t('userRole.teacher'), [t]);

    const getRoleColors = useCallback((role) =>
        role === USER_ROLE.STUDENT ? {bg: '#F3E8FF', text: '#6B21A8'} : {bg: '#DCFCE7', text: '#14532D'}, []);

    return {
        filtered, selectedItem, counts, activeFilter, userRole, loading,
        loadingRole: !userRole,
        isModalVisible, openDetail, closeDetail,
        approveJustification, rejectJustification, setActiveFilter,
        getInitials, getAvatarColor, formatDate, getFileIcon,
        getTypeLabel, getTypeColors, getRoleLabel, getRoleColors,
    };
};
