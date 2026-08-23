import {useCallback, useEffect, useMemo, useState} from 'react';
import {getCurrentUserRole} from '../services/UserService';

// ─────────────────────────────────────────────────────────────────────────────
// JSON simulado — como si viniese de una API REST
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_JUSTIFICATIONS = [
    {
        id: '1',
        role: 'student',
        userName: 'Laura Martínez',
        userCode: 'EST-20241',
        userGroup: '10°A',
        type: 'inasistencia',
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
        status: 'pending',
    },
    {
        id: '2',
        role: 'teacher',
        userName: 'Carlos Herrera',
        userCode: 'DOC-0055',
        userGroup: 'Matemáticas',
        type: 'retardo',
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
        status: 'pending',
    },
    {
        id: '3',
        role: 'student',
        userName: 'Andrés Pérez',
        userCode: 'EST-20198',
        userGroup: '11°B',
        type: 'inasistencia',
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
        status: 'pending',
    },
    {
        id: '4',
        role: 'teacher',
        userName: 'María Orozco',
        userCode: 'DOC-0023',
        userGroup: 'Ciencias Naturales',
        type: 'inasistencia',
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
        status: 'pending',
    },
    {
        id: '5',
        role: 'student',
        userName: 'Sofía Gómez',
        userCode: 'EST-20312',
        userGroup: '9°C',
        type: 'retardo',
        date: '2025-05-23',
        time: '08:10 AM',
        description:
            'Accidente de tránsito menor en la vía que bloqueó el paso durante más de una hora. Todos los estudiantes de mi ruta llegaron tarde.',
        attachment: null,
        submittedAt: '2025-05-23T09:20:00Z',
        status: 'pending',
    },
    {
        id: '6',
        role: 'student',
        userName: 'Juan Vargas',
        userCode: 'EST-20270',
        userGroup: '8°A',
        type: 'inasistencia',
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
        status: 'pending',
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

/** Formatea una fecha ISO a texto legible en español. "2025-05-20" → "20 may. 2025" */
export const formatDate = (isoDate = '') => {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-');
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${Number(day)} ${months[Number(month) - 1]}. ${year}`;
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
    if (r.includes('admin')) return 'admin';
    if (r.includes('docen') || r.includes('profesor') || r.includes('teacher')) return 'teacher';
    if (r.includes('estud') || r.includes('student')) return 'student';
    return 'admin';
};

/**
 * ⚠️ Código del estudiante con sesión activa.
 * Reemplázalo por tu servicio real (getCurrentUser(), AsyncStorage, etc.).
 */
const CURRENT_STUDENT_CODE = 'EST-20241';

// ─────────────────────────────────────────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────────────────────────────────────────
export const usePendingJustificationViewModel = () => {
    const [justifications, setJustifications] = useState(MOCK_JUSTIFICATIONS);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'teacher' | 'student'
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'student' | 'teacher'
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
                setUserRole('admin'); // define tu política de fallback
            }
        };
        init();
    }, []);

    // ── Dataset visible según el rol (antes de aplicar chips) ───────────────
    //  admin   → todo
    //  teacher → solo estudiantes (sin registros docentes)
    //  student → solo las justificaciones propias
    const baseJustifications = useMemo(() => {
        if (!userRole) return []; // no mostrar nada hasta conocer el rol
        if (userRole === 'teacher') {
            return justifications.filter((j) => j.role === 'student');
        }
        if (userRole === 'student') {
            return justifications.filter(
                (j) => j.role === 'student' && j.userCode === CURRENT_STUDENT_CODE
            );
        }
        return justifications;
    }, [justifications, userRole]);

    // ── Filtrado por chips (solo aplica para admin) ─────────────────────────
    const filtered = useMemo(() => {
        if (userRole === 'admin' && activeFilter !== 'all') {
            return baseJustifications.filter((j) => j.role === activeFilter);
        }
        return baseJustifications;
    }, [baseJustifications, activeFilter, userRole]);

    // ── Abrir / cerrar modal de detalle ─────────────────────────────────────
    const openDetail = useCallback((item) => {
        setSelectedItem(item);
        setModalVisible(true);
    }, []);

    const closeDetail = useCallback(() => {
        setModalVisible(false);
        // Pequeño delay para que la animación de cierre termine antes de limpiar
        setTimeout(() => setSelectedItem(null), 300);
    }, []);

    // ── Aprobar justificación (bloqueado para estudiantes) ──────────────────
    const approveJustification = useCallback(
        (id) => {
            if (userRole === 'student') return;
            setJustifications((prev) =>
                prev.map((j) => (j.id === id ? { ...j, status: 'approved' } : j))
            );
            closeDetail();
        },
        [closeDetail, userRole]
    );

    // ── Rechazar justificación (bloqueado para estudiantes) ─────────────────
    const rejectJustification = useCallback(
        (id) => {
            if (userRole === 'student') return;
            setJustifications((prev) =>
                prev.map((j) => (j.id === id ? { ...j, status: 'rejected' } : j))
            );
            closeDetail();
        },
        [closeDetail, userRole]
    );

    // ── Contadores según el rol ─────────────────────────────────────────────
    //  teacher → "Todos" suma SOLO estudiantes; no existe clave teacher
    //  student → "Todos" suma solo las propias
    //  admin   → contadores globales
    const counts = useMemo(() => {
        if (userRole === 'teacher') {
            return {all: baseJustifications.length, student: baseJustifications.length};
        }
        if (userRole === 'student') {
            return {all: baseJustifications.length};
        }
        return {
            all: justifications.length,
            student: justifications.filter((j) => j.role === 'student').length,
            teacher: justifications.filter((j) => j.role === 'teacher').length,
        };
    }, [justifications, baseJustifications, userRole]);

    // ── Labels de tipo y rol ────────────────────────────────────────────────
    const getTypeLabel = (type) => (type === 'inasistencia' ? 'Inasistencia' : 'Retardo');
    const getTypeColors = (type) =>
        type === 'inasistencia'
            ? { bg: '#FEF3C7', text: '#92400E' }
            : { bg: '#DBEAFE', text: '#1E40AF' };
    const getRoleLabel = (role) => (role === 'student' ? 'Estudiante' : 'Docente');
    const getRoleColors = (role) =>
        role === 'student'
            ? { bg: '#F3E8FF', text: '#6B21A8' }
            : { bg: '#DCFCE7', text: '#14532D' };

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