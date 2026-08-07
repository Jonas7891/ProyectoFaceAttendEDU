import { useState, useCallback, useMemo } from 'react';

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

/**
 * Returns initials from a full name (up to 2 characters).
 */
export const getInitials = (name = '') =>
    name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

/**
 * Returns a deterministic avatar color based on the name string.
 */
const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626'];
export const getAvatarColor = (name = '') => {
    const index =
        name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

/**
 * Formats an ISO date string to a human-readable Spanish date.
 * e.g.  "2025-05-20" → "20 may. 2025"
 */
export const formatDate = (isoDate = '') => {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-');
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${Number(day)} ${months[Number(month) - 1]}. ${year}`;
};

/**
 * Returns a file-type emoji based on mime type.
 */
export const getFileIcon = (mime = '') => {
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('word') || mime.includes('document')) return '📝';
    return '📎';
};

// ─────────────────────────────────────────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────────────────────────────────────────

export const usePendingJustificationViewModel = () => {
    const [justifications, setJustifications] = useState(MOCK_JUSTIFICATIONS);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'student' | 'teacher'
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    // ── Filtrado ──────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        if (activeFilter === 'all') return justifications;
        return justifications.filter((j) => j.role === activeFilter);
    }, [justifications, activeFilter]);

    // ── Abrir / cerrar modal de detalle ───────────────────────────────────────
    const openDetail = useCallback((item) => {
        setSelectedItem(item);
        setModalVisible(true);
    }, []);

    const closeDetail = useCallback(() => {
        setModalVisible(false);
        // Pequeño delay para que la animación de cierre termine antes de limpiar
        setTimeout(() => setSelectedItem(null), 300);
    }, []);

    // ── Aprobar justificación ─────────────────────────────────────────────────
    const approveJustification = useCallback(
        (id) => {
            setJustifications((prev) =>
                prev.map((j) => (j.id === id ? { ...j, status: 'approved' } : j))
            );
            closeDetail();
        },
        [closeDetail]
    );

    // ── Rechazar justificación ────────────────────────────────────────────────
    const rejectJustification = useCallback(
        (id) => {
            setJustifications((prev) =>
                prev.map((j) => (j.id === id ? { ...j, status: 'rejected' } : j))
            );
            closeDetail();
        },
        [closeDetail]
    );

    // ── Contadores por filtro ─────────────────────────────────────────────────
    const counts = useMemo(
        () => ({
            all: justifications.length,
            student: justifications.filter((j) => j.role === 'student').length,
            teacher: justifications.filter((j) => j.role === 'teacher').length,
        }),
        [justifications]
    );

    // ── Labels de tipo ────────────────────────────────────────────────────────
    const getTypeLabel = (type) =>
        type === 'inasistencia' ? 'Inasistencia' : 'Retardo';

    const getTypeColors = (type) =>
        type === 'inasistencia'
            ? { bg: '#FEF3C7', text: '#92400E' }
            : { bg: '#DBEAFE', text: '#1E40AF' };

    const getRoleLabel = (role) =>
        role === 'student' ? 'Estudiante' : 'Docente';

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
