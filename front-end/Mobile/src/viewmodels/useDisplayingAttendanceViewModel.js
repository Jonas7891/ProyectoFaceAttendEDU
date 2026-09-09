import {useEffect, useState} from "react";
import {Platform} from "react-native";
import {useTranslation} from "react-i18next";
import {useLanguageRefresh} from "../utils/useLanguageRefresh";
import {useTheme} from "../view/components/common/ThemeContext";
import {getCurrentUserRole} from "../services/UserService";

// CONSTANTES
export const STATUS_CONFIG = {
    presente: {color: "#22C55E", bg: "#DCFCE7", darkBg: "#14532D", label: "attendance.present"},
    tarde: {color: "#F59E0B", bg: "#FEF3C7", darkBg: "#451A03", label: "attendance.late"},
    ausente: {color: "#EF4444", bg: "#FEE2E2", darkBg: "#450A0A", label: "attendance.absent"},
    justificado: {color: "#8B5CF6", bg: "#EDE9FE", darkBg: "#2E1065", label: "attendance.justified"},
};

export const APPROVAL_CONFIG = {
    Pending: {color: "#F59E0B", label: "attendance.pending"},
    Approved: {color: "#22C55E", label: "attendance.approved"},
    Rejected: {color: "#EF4444", label: "attendance.rejected"},
};

const SUBJECT_KEYS = {
    math: "subjects.math",
    "Matemáticas": "subjects.math",
    physics: "subjects.physics",
    "Física": "subjects.physics",
    history: "subjects.history",
    Historia: "subjects.history",
    programming: "subjects.programming",
    Programación: "subjects.programming",
    science: "subjects.science",
    Ciencias: "subjects.science",
    spanish: "subjects.spanish",
    Español: "subjects.spanish",
    english: "subjects.english",
    Inglés: "subjects.english",
    physicalEducation: "subjects.physicalEducation",
    "Educación Física": "subjects.physicalEducation",
};

export function getSubjectLabel(subject, t) {
    const translationKey = SUBJECT_KEYS[subject];
    return translationKey ? t(translationKey, {defaultValue: subject}) : subject;
}

// DATOS MOCK (copiar igual que antes, omitidos por brevedad)
const MOCK_TEACHERS = [
    {
        id: 1,
        nombre: "Ana Martínez",
        fecha: "2024-03-20", hora: "07:55 AM", estado: "presente",
        materia: "math", codigo_curso: "MAT-101",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 201",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 2,
        nombre: "Luis Fernández",
        fecha: "2024-03-20", hora: "08:02 AM", estado: "presente",
        materia: "science", codigo_curso: "CIE-102",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Lab Ciencias",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 3,
        nombre: "Carmen López",
        fecha: "2024-03-20", hora: "08:30 AM", estado: "tarde",
        materia: "spanish", codigo_curso: "ESP-103",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 105",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 4,
        nombre: "Roberto Díaz",
        fecha: "2024-03-20", hora: "—", estado: "ausente",
        materia: "history", codigo_curso: "HIS-104",
        dia: "Lunes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Aula 302",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 5,
        nombre: "María González",
        fecha: "2024-03-19", hora: "08:10 AM", estado: "presente",
        materia: "english", codigo_curso: "ING-105",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 110",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 6,
        nombre: "Carlos Ruiz",
        fecha: "2024-03-19", hora: "09:00 AM", estado: "tarde",
        materia: "physicalEducation", codigo_curso: "EDF-106",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Cancha Principal",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
];

const MOCK_MY_ATTENDANCE = [
    {
        id: 1,
        fecha: "2024-03-20", hora: "07:58 AM", estado: "presente",
        materia: "math", codigo_curso: "MAT-101",
        docente: "Ana Martínez",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 201",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 2,
        fecha: "2024-03-20", hora: "10:05 AM", estado: "presente",
        materia: "science", codigo_curso: "CIE-102",
        docente: "Luis Fernández",
        dia: "Lunes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Lab Ciencias",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 3,
        fecha: "2024-03-19", hora: "08:40 AM", estado: "tarde",
        materia: "spanish", codigo_curso: "ESP-103",
        docente: "Carmen López",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 105",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 4,
        fecha: "2024-03-19", hora: "—", estado: "ausente",
        materia: "history", codigo_curso: "HIS-104",
        docente: "Roberto Díaz",
        dia: "Martes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Aula 302",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: {
            texto: "Cita médica urgente",
            estado: "Pending",
            revisado_por: null,
            revisado_en: null,
        },
    },
    {
        id: 5,
        fecha: "2024-03-18", hora: "08:02 AM", estado: "presente",
        materia: "english", codigo_curso: "ING-105",
        docente: "María González",
        dia: "Miércoles", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 110",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 6,
        fecha: "2024-03-18", hora: "—", estado: "ausente",
        materia: "physicalEducation", codigo_curso: "EDF-106",
        docente: "Carlos Ruiz",
        dia: "Miércoles", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Cancha Principal",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: {
            texto: "Incapacidad médica presentada.",
            estado: "Approved",
            revisado_por: "Admin01",
            revisado_en: "2024-03-19 09:00",
        },
    },
];

// HELPERS
export function formatDateKey(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function formatDateDisplay(date, t) {
    if (!date) return t("attendance.filterByDate");
    return date.toLocaleDateString("es-ES", {day: "2-digit", month: "short", year: "numeric"});
}

// VIEW MODEL
export function useAttendanceViewModel() {
    const {t, i18n} = useTranslation();
    const {colors, loadThemeForRole, theme} = useTheme();
    const refreshKey = useLanguageRefresh();
    const updateKey = refreshKey; // Sincronizar con cambios de idioma
    const isDark = theme === "dark";

    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [detailItem, setDetailItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Obtener el rol desde el token (fuente única de verdad)
                const role = await getCurrentUserRole();
                setUserRole(role);

                if (role) {
                    await loadThemeForRole(role);
                }
            } catch (error) {
                console.error("Error cargando datos del usuario:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const isAdmin = userRole === "admin";

    const filteredTeachers = MOCK_TEACHERS.filter(item =>
        (!searchText || item.nombre.toLowerCase().includes(searchText.toLowerCase())) &&
        (!selectedDate || item.fecha === formatDateKey(selectedDate))
    );

    const filteredMyAttendance = MOCK_MY_ATTENDANCE.filter(item =>
        (!selectedDate || item.fecha === formatDateKey(selectedDate))
    );

    const activeData = isAdmin ? filteredTeachers : filteredMyAttendance;

    const openDetail = (item) => {
        setDetailItem(item);
        setShowDetailModal(true);
    };
    const closeDetail = () => {
        setShowDetailModal(false);
        setDetailItem(null);
    };

    const handleOpenPicker = () => {
        setTempDate(selectedDate ?? new Date());
        Platform.OS === "ios" ? setShowIOSModal(true) : setShowPicker(true);
    };

    const handleAndroidChange = (event, date) => {
        setShowPicker(false);
        if (event.type === "set" && date) setSelectedDate(date);
    };

    // RETORNAMOS t también
    return {
        t,               // <--- AGREGADO
        isAdmin,
        isDark,
        colors,
        refreshKey,
        updateKey,
        searchText,
        setSearchText,
        selectedDate,
        setSelectedDate,
        showPicker,
        showIOSModal,
        setShowIOSModal,
        tempDate,
        setTempDate,
        activeData,
        detailItem,
        showDetailModal,
        openDetail,
        closeDetail,
        handleOpenPicker,
        handleAndroidChange,
    };
}
