import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getCurrentUserRole} from '../services/UserService';

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

// ─────────────────────────────────────────────────────────────────────────────
// JSON simulado — como si viniese de una API REST
// ⚠️ Los valores `type` y `role` son IDENTIFICADORES INTERNOS, NO traducir.
// ⚠️ Las descripciones son datos mock de ejemplo; en producción vendrán de la API.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_JUSTIFICATIONS = [
    {
        id: '1',
        role: USER_ROLE.STUDENT,
        userName: 'Laura Martínez',
        userCode: 'EST-20241',
        userGroup: '10°A',
        type: JUSTIFICATION_TYPE.ABSENCE,
        date: '2025-05-20',
        time: null,
        description:
            'Estuve enferma con fiebre alta y el médico me recomendó reposo absoluto por dos días. Adjunto la incapacidad médica como soporte.',
        attachment: {
            name: 'incapacidad_medica.pdf',
            size: '245 KB',
            mime: 'application/pdf',
        },
        submittedAt: '2025-05-21T08:14:00Z',
        status: JUSTIFICATION_STATUS_INTERNAL.PENDING,
    },
    {
        id: '2',
        role: USER_ROLE.TEACHER,
        userName: 'Carlos Herrera',
        userCode: 'DOC-0055',
        userGroup: 'Matemáticas',
        type: JUSTIFICATION_TYPE.LATE,
        date: '2025-05-22',
        time: '07:45 AM',
        description:
            'El transporte público presentó una falla masiva en la línea 3 del metro. Adjunto captura del aviso oficial de TransMilenio.',
        attachment: {
            name: 'aviso_transmilenio.png',
            size: '180 KB',
            mime: 'image/png',
        },
        submittedAt: '2025-05-22T09:05:00Z',
        status: JUSTIFICATION_STATUS_INTERNAL.PENDING,
    },
    {
        id: '3',
        role: USER_ROLE.STUDENT,
        userName: 'Andrés Pérez',
        userCode: 'EST-20198',
        userGroup: '11°B',
        type: JUSTIFICATION_TYPE.ABSENCE,
        date: '2025-05-19',
        time: null,
        description:
            'Tuve que asistir a una diligencia familiar urgente relacionada con un trámite notarial. No pude avisar con anticipación.',
        attachment: {
            name: 'certificado_notarial.pdf',
            size: '312 KB',
            mime: 'application/pdf',
        },
        submittedAt: '2025-05-20T10:30:00Z',
        status: JUSTIFICATION_STATUS_INTERNAL.PENDING,
    },
    {
        id: '4',
        role: USER_ROLE.TEACHER,
        userName: 'María Orozco',
        userCode: 'DOC-0023',
        userGroup: 'Ciencias Naturales',
        type: JUSTIFICATION_TYPE.ABSENCE,
        date: '2025-05-18',
        time: null,
        description:
            'Cita médica especializada previa que no pude reagendar. Adjunto la orden médica y el comprobante de la cita.',
        attachment: {
            name: 'orden_medica.jpg',
            size: '97 KB',
            mime: 'image/jpeg',
        },
        submittedAt: '2025-05-18T15:00:00Z',
        status: JUSTIFICATION_STATUS_INTERNAL.PENDING,
    },
    {
        id: '5',
        role: USER_ROLE.STUDENT,
        userName: 'Sofía Gómez',
        userCode: 'EST-20312',
        userGroup: '9°C',
        type: JUSTIFICATION_TYPE.LATE,
        date: '2025-05-23',
        time: '08:10 AM',
        description:
            'Accidente de tránsito menor en la vía que bloqueó el paso durante más de una hora. Todos los estudiantes de mi ruta llegaron tarde.',
        attachment: null,
        submittedAt: '2025-05-23T09:20:00Z',
        status: JUSTIFICATION_STATUS_INTERNAL.PENDING,
    },
    {
        id: '6',
        role: USER_ROLE.STUDENT,
        userName: 'Juan Vargas',
        userCode: 'EST-20270',
        userGroup: '8°A',
        type: JUSTIFICATION_TYPE.ABSENCE,
        date: '2025-05-17',
        time: null,
        description:
            'Participé en una competencia departamental de robótica autorizada por el área de tecnología. Adjunto el certificado de participación.',
        attachment: {
            name: 'certificado_robotica.docx',
            size: '58 KB',
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        submittedAt: '2025-05-18T07:45:00Z',
        status: JUSTIFICATION_STATUS_INTERNAL.PENDING,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
/** Devuelve las iniciales de un nombre completo (máx. 2 caracteres). */
export const getInitials = (name = '') =>
    name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

/** Devuelve un color de avatar determinístico según el nombre. */
const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626'];
export const getAvatarColor = (name = '') => {
    const index =
        name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

/** Devuelve un emoji según el tipo de archivo (mime). */
export const getFileIcon = (mime = '') => {
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('word') || mime.includes('document')) return '📝';
    return '📎';
};

// ─────────────────────────────────────────────────────────────────────────────
// Rol de sesión
// ─────────────────────────────────────────────────────────────────────────────
/** Normaliza el rol devuelto por el servicio a las claves internas de la app. */
const normalizeRole = (role = '') => {
    const r = String(role).toLowerCase();
    if (r.includes('admin')) return USER_ROLE.ADMIN;
    if (r.includes('docen') || r.includes('profesor') || r.includes('teacher'))
        return USER_ROLE.TEACHER;
    if (r.includes('estud') || r.includes('student')) return USER_ROLE.STUDENT;
    return USER_ROLE.ADMIN;
};

/**
 * ⚠️ Código del estudiante con sesión activa.
 * Reemplázalo por tu servicio real (getCurrentUser(), AsyncStorage, etc.).
 */
const CURRENT_STUDENT_CODE = 'EST-20241';

// ─────────────────────────────────────────────────────────────────────────────
// Helper de locale para formateo de fechas
// ─────────────────────────────────────────────────────────────────────────────
const getLocaleForLanguage = (lang) => {
    const localeMap = {
        es: 'es-CO',
        en: 'en-US',
        fr: 'fr-FR',
        pt: 'pt-BR',
    };
    return localeMap[lang?.split('-')[0]] || 'es-CO';
};

// ─────────────────────────────────────────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────────────────────────────────────────
export const usePendingJustificationViewModel = () => {
    const {t, i18n} = useTranslation();
    const currentLocale = getLocaleForLanguage(i18n.language);

    const [justifications, setJustifications] = useState(MOCK_JUSTIFICATIONS);
    const [userRole, setUserRole] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    // ── Carga del rol al montar ─────────────────────────────────────────────
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
    }, []);

    // ── Dataset visible según el rol ────────────────────────────────────────
    const baseJustifications = useMemo(() => {
        if (!userRole) return [];
        if (userRole === USER_ROLE.TEACHER) {
            return justifications.filter((j) => j.role === USER_ROLE.STUDENT);
        }
        if (userRole === USER_ROLE.STUDENT) {
            return justifications.filter(
                (j) => j.role === USER_ROLE.STUDENT && j.userCode === CURRENT_STUDENT_CODE
            );
        }
        return justifications;
    }, [justifications, userRole]);

    // ── Filtrado por chips ──────────────────────────────────────────────────
    const filtered = useMemo(() => {
        if (userRole === USER_ROLE.ADMIN && activeFilter !== 'all') {
            return baseJustifications.filter((j) => j.role === activeFilter);
        }
        return baseJustifications;
    }, [baseJustifications, activeFilter, userRole]);

    // ── Abrir / cerrar modal ────────────────────────────────────────────────
    const openDetail = useCallback((item) => {
        setSelectedItem(item);
        setModalVisible(true);
    }, []);

    const closeDetail = useCallback(() => {
        setModalVisible(false);
        setTimeout(() => setSelectedItem(null), 300);
    }, []);

    // ── Aprobar justificación ───────────────────────────────────────────────
    const approveJustification = useCallback(
        (id) => {
            if (userRole === USER_ROLE.STUDENT) return;
            setJustifications((prev) =>
                prev.map((j) =>
                    j.id === id
                        ? {...j, status: JUSTIFICATION_STATUS_INTERNAL.APPROVED}
                        : j
                )
            );
            closeDetail();
        },
        [closeDetail, userRole]
    );

    // ── Rechazar justificación ──────────────────────────────────────────────
    const rejectJustification = useCallback(
        (id) => {
            if (userRole === USER_ROLE.STUDENT) return;
            setJustifications((prev) =>
                prev.map((j) =>
                    j.id === id
                        ? {...j, status: JUSTIFICATION_STATUS_INTERNAL.REJECTED}
                        : j
                )
            );
            closeDetail();
        },
        [closeDetail, userRole]
    );

    // ── Contadores según rol ────────────────────────────────────────────────
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

    // ── Formateador de fecha (ahora usa el locale activo) ──────────────────
    const formatDate = useCallback(
        (isoDate = '') => {
            if (!isoDate) return '—';
            try {
                const date = new Date(isoDate + 'T00:00:00');
                return date.toLocaleDateString(currentLocale, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });
            } catch {
                return '—';
            }
        },
        [currentLocale]
    );

    // ── Labels traducidos ───────────────────────────────────────────────────
    const getTypeLabel = useCallback(
        (type) =>
            type === JUSTIFICATION_TYPE.ABSENCE
                ? t('justificationType.absence')
                : t('justificationType.late'),
        [t]
    );

    const getTypeColors = useCallback(
        (type) =>
            type === JUSTIFICATION_TYPE.ABSENCE
                ? {bg: '#FEF3C7', text: '#92400E'}
                : {bg: '#DBEAFE', text: '#1E40AF'},
        []
    );

    const getRoleLabel = useCallback(
        (role) =>
            role === USER_ROLE.STUDENT
                ? t('userRole.student')
                : t('userRole.teacher'),
        [t]
    );

    const getRoleColors = useCallback(
        (role) =>
            role === USER_ROLE.STUDENT
                ? {bg: '#F3E8FF', text: '#6B21A8'}
                : {bg: '#DCFCE7', text: '#14532D'},
        []
    );

    return {
        // Data
        filtered,
        selectedItem,
        counts,
        activeFilter,
        userRole,
        loadingRole: !userRole,

        // Modal
        isModalVisible,
        openDetail,
        closeDetail,

        // Actions
        approveJustification,
        rejectJustification,
        setActiveFilter,

        // Formatters / helpers
        getInitials,
        getAvatarColor,
        formatDate,
        getFileIcon,
        getTypeLabel,
        getTypeColors,
        getRoleLabel,
        getRoleColors,
    };
};