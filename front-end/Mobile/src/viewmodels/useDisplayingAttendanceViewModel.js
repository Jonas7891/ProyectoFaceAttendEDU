// viewmodels/useDisplayingAttendanceViewModel.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../view/components/common/ThemeContext';

// Datos mock (podrían importarse de otro archivo)
const MOCK_TEACHERS = [
    {
        id: 1,
        nombre: "Ana Martínez",
        fecha: "2024-03-20", hora: "07:55 AM", estado: "presente",
        materia: "Matemáticas", codigo_curso: "MAT-101",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 201",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 2,
        nombre: "Luis Fernández",
        fecha: "2024-03-20", hora: "08:02 AM", estado: "presente",
        materia: "Ciencias", codigo_curso: "CIE-102",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Lab Ciencias",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 3,
        nombre: "Carmen López",
        fecha: "2024-03-20", hora: "08:30 AM", estado: "tarde",
        materia: "Español", codigo_curso: "ESP-103",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 105",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 4,
        nombre: "Roberto Díaz",
        fecha: "2024-03-20", hora: "—", estado: "ausente",
        materia: "Historia", codigo_curso: "HIS-104",
        dia: "Lunes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Aula 302",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 5,
        nombre: "María González",
        fecha: "2024-03-19", hora: "08:10 AM", estado: "presente",
        materia: "Inglés", codigo_curso: "ING-105",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 110",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 6,
        nombre: "Carlos Ruiz",
        fecha: "2024-03-19", hora: "09:00 AM", estado: "tarde",
        materia: "Educación Física", codigo_curso: "EDF-106",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Cancha Principal",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
];

const MOCK_MY_ATTENDANCE = [
    {
        id: 1,
        fecha: "2024-03-20", hora: "07:58 AM", estado: "presente",
        materia: "Matemáticas", codigo_curso: "MAT-101",
        docente: "Ana Martínez",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 201",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 2,
        fecha: "2024-03-20", hora: "10:05 AM", estado: "presente",
        materia: "Ciencias", codigo_curso: "CIE-102",
        docente: "Luis Fernández",
        dia: "Lunes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Lab Ciencias",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 3,
        fecha: "2024-03-19", hora: "08:40 AM", estado: "tarde",
        materia: "Español", codigo_curso: "ESP-103",
        docente: "Carmen López",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 105",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 4,
        fecha: "2024-03-19", hora: "—", estado: "ausente",
        materia: "Historia", codigo_curso: "HIS-104",
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
        materia: "Inglés", codigo_curso: "ING-105",
        docente: "María González",
        dia: "Miércoles", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 110",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 6,
        fecha: "2024-03-18", hora: "—", estado: "ausente",
        materia: "Educación Física", codigo_curso: "EDF-106",
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

// Helpers (formateo de fecha)
function formatDateKey(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function useDisplayingAttendanceViewModel() {
    const { t, i18n } = useTranslation();
    const { loadThemeForRole, theme } = useTheme();
    const isDark = theme === 'dark';

    const [userRole, setUserRole] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [detailItem, setDetailItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);

    // Inicialización: rol, tema, y listener de idioma
    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            if (role) await loadThemeForRole(role);
        };
        init();

        const onLangChange = () => setUpdateKey(p => p + 1);
        i18n.on('languageChanged', onLangChange);
        return () => i18n.off('languageChanged', onLangChange);
    }, [loadThemeForRole, i18n]);

    const isAdmin = userRole === 'admin';

    // Filtros
    const filteredTeachers = useMemo(() => {
        return MOCK_TEACHERS.filter(item =>
            (!searchText || item.nombre.toLowerCase().includes(searchText.toLowerCase())) &&
            (!selectedDate || item.fecha === formatDateKey(selectedDate))
        );
    }, [searchText, selectedDate]);

    const filteredMyAttendance = useMemo(() => {
        return MOCK_MY_ATTENDANCE.filter(item =>
            (!selectedDate || item.fecha === formatDateKey(selectedDate))
        );
    }, [selectedDate]);

    const activeData = isAdmin ? filteredTeachers : filteredMyAttendance;

    // Acciones de detalle
    const openDetail = useCallback((item) => {
        setDetailItem(item);
        setShowDetailModal(true);
    }, []);

    const closeDetail = useCallback(() => {
        setShowDetailModal(false);
        setDetailItem(null);
    }, []);

    // Picker de fecha
    const handleOpenPicker = useCallback(() => {
        setTempDate(selectedDate || new Date());
        if (Platform.OS === 'ios') {
            setShowIOSModal(true);
        } else {
            setShowPicker(true);
        }
    }, [selectedDate]);

    const handleAndroidChange = useCallback((event, date) => {
        setShowPicker(false);
        if (event.type === 'set' && date) {
            setSelectedDate(date);
        }
    }, []);

    const handleClearDate = useCallback(() => setSelectedDate(null), []);

    // Confirmación de fecha en iOS
    const confirmIOSDate = useCallback(() => {
        setSelectedDate(tempDate);
        setShowIOSModal(false);
    }, [tempDate]);

    const cancelIOSDate = useCallback(() => setShowIOSModal(false), []);

    return {
        // estado
        userRole,
        isAdmin,
        searchText,
        setSearchText,
        selectedDate,
        tempDate,
        showPicker,
        setShowPicker,
        showIOSModal,
        showDetailModal,
        detailItem,
        updateKey,
        isDark,

        // datos
        activeData,
        filteredTeachers,
        filteredMyAttendance,

        // acciones
        openDetail,
        closeDetail,
        handleOpenPicker,
        handleAndroidChange,
        handleClearDate,
        confirmIOSDate,
        cancelIOSDate,
        setTempDate,
    };
}