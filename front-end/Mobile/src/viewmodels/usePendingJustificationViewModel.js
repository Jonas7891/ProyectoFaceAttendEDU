import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getCurrentUserRole} from '../services/UserService';
import {request, GET} from '../api/apiClient';

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

    const fetchJustifications = useCallback(async () => {
        try {
            setLoading(true);
            const jData = await request({ method: GET, url: 'justification', params: { _limit: 100 }, requiresAuth: false });
            const records = unwrap(jData);

            const enriched = [];
            for (const j of records) {
                try {
                    const typeData = await request({ method: GET, url: 'justification_type', params: { justification_type_id: j.justification_type_id }, requiresAuth: false });
                    const jType = unwrap(typeData)[0] || {};

                    const arData = await request({ method: GET, url: 'attendance_record', params: { attendance_record_id: j.attendance_record_id }, requiresAuth: false });
                    const ar = unwrap(arData)[0] || {};

                    const actorData = await request({ method: GET, url: 'academic_actor', params: { academic_actor_id: ar.academic_actor_id }, requiresAuth: false });
                    const actor = unwrap(actorData)[0] || {};

                    const personData = await request({ method: GET, url: 'person', params: { person_id: actor.person_id }, requiresAuth: false });
                    const person = unwrap(personData)[0] || {};

                    const statusMap = { Pending: 'pending', Approved: 'approved', Rejected: 'rejected' };
                    const typeMap = { 1: 'inasistencia', 2: 'inasistencia', 3: 'retardo' };

                    enriched.push({
                        id: String(j.justification_id),
                        role: actor.actor_type_id === 1 ? USER_ROLE.STUDENT : USER_ROLE.TEACHER,
                        userName: `${person.name || ''} ${person.last_name || ''}`.trim(),
                        userCode: actor.actor_code || '—',
                        userGroup: '—',
                        type: typeMap[j.justification_type_id] || 'inasistencia',
                        date: j.submitted_at ? j.submitted_at.split('T')[0] : '',
                        time: null,
                        description: j.reason || '',
                        attachment: null,
                        submittedAt: j.submitted_at || '',
                        status: statusMap[j.review_status] || 'pending',
                    });
                } catch (e) {
                    continue;
                }
            }

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
            } catch (error) {
                console.error('Error cargando rol:', error);
                setUserRole(USER_ROLE.ADMIN);
            }
        };
        init();
        fetchJustifications();
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
        return baseJustifications;
    }, [baseJustifications, activeFilter, userRole]);

    const openDetail = useCallback((item) => { setSelectedItem(item); setModalVisible(true); }, []);
    const closeDetail = useCallback(() => { setModalVisible(false); setTimeout(() => setSelectedItem(null), 300); }, []);

    const approveJustification = useCallback((id) => {
        if (userRole === USER_ROLE.STUDENT) return;
        setJustifications((prev) => prev.map((j) => j.id === id ? {...j, status: JUSTIFICATION_STATUS_INTERNAL.APPROVED} : j));
        closeDetail();
    }, [closeDetail, userRole]);

    const rejectJustification = useCallback((id) => {
        if (userRole === USER_ROLE.STUDENT) return;
        setJustifications((prev) => prev.map((j) => j.id === id ? {...j, status: JUSTIFICATION_STATUS_INTERNAL.REJECTED} : j));
        closeDetail();
    }, [closeDetail, userRole]);

    const counts = useMemo(() => {
        if (userRole === USER_ROLE.TEACHER) {
            return {all: baseJustifications.length, student: baseJustifications.length};
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
