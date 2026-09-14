import {useCallback, useEffect, useState} from "react";
import {Platform} from "react-native";
import {useTranslation} from "react-i18next";
import {useLanguageRefresh} from "../utils/useLanguageRefresh";
import {useTheme} from "../view/components/common/ThemeContext";
import {getCurrentUserRole} from "../services/UserService";
import {request, GET} from "../api/apiClient";

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

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

export function useAttendanceViewModel() {
    const {t, i18n} = useTranslation();
    const {colors, loadThemeForRole, theme} = useTheme();
    const refreshKey = useLanguageRefresh();
    const updateKey = refreshKey;
    const isDark = theme === "dark";

    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [detailItem, setDetailItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [teacherData, setTeacherData] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);

    const fetchAttendance = useCallback(async (role) => {
        try {
            setLoading(true);
            const arData = await request({ method: GET, url: 'attendance_record', params: { _limit: 200 }, requiresAuth: false });
            const records = unwrap(arData);

            const enriched = [];
            for (const record of records.slice(-50)) {
                try {
                    const sessionData = await request({ method: GET, url: 'class_session', params: { class_session_id: record.class_session_id }, requiresAuth: false });
                    const session = unwrap(sessionData)[0] || {};

                    const blockData = await request({ method: GET, url: 'schedule_block', params: { schedule_block_id: session.schedule_block_id }, requiresAuth: false });
                    const block = unwrap(blockData)[0] || {};

                    const courseData = await request({ method: GET, url: 'course', params: { course_id: block.course_id }, requiresAuth: false });
                    const course = unwrap(courseData)[0] || {};

                    const envData = await request({ method: GET, url: 'environment', params: { environment_id: block.environment_id }, requiresAuth: false });
                    const env = unwrap(envData)[0] || {};

                    const actorData = await request({ method: GET, url: 'academic_actor', params: { academic_actor_id: record.academic_actor_id }, requiresAuth: false });
                    const actor = unwrap(actorData)[0] || {};

                    const personData = await request({ method: GET, url: 'person', params: { person_id: actor.person_id }, requiresAuth: false });
                    const person = unwrap(personData)[0] || {};

                    const statusMap = { Present: 'presente', Late: 'tarde', Absent: 'ausente' };
                    const hora = record.captured_at ? new Date(record.captured_at).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : '—';

                    enriched.push({
                        id: record.attendance_record_id,
                        nombre: `${person.name || ''} ${person.last_name || ''}`.trim() || `Actor #${record.academic_actor_id}`,
                        fecha: record.captured_at ? record.captured_at.split('T')[0] : '',
                        hora,
                        estado: statusMap[record.attendance_status] || 'ausente',
                        materia: course.name || course.code || '—',
                        codigo_curso: course.code || '—',
                        dia: block.day_of_week === 1 ? 'Lunes' : block.day_of_week === 2 ? 'Martes' : block.day_of_week === 3 ? 'Miércoles' : block.day_of_week === 4 ? 'Jueves' : block.day_of_week === 5 ? 'Viernes' : '—',
                        hora_inicio: block.starts_at || '—',
                        hora_fin: block.ends_at || '—',
                        salon: env.name || '—',
                        periodo: '2026-I',
                        periodo_inicio: '2026-01-15',
                        periodo_fin: '2026-06-30',
                        docente: `${person.name || ''} ${person.last_name || ''}`.trim(),
                    });
                } catch (e) {
                    continue;
                }
            }

            setTeacherData(enriched);
            setMyAttendance(enriched.slice(-10));
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const role = await getCurrentUserRole();
                setUserRole(role);
                if (role) await loadThemeForRole(role);
                await fetchAttendance(role);
            } catch (error) {
                console.error("Error cargando datos del usuario:", error);
                setLoading(false);
            }
        };
        init();
    }, []);

    const isAdmin = userRole === "admin";

    const filteredTeachers = teacherData.filter(item =>
        (!searchText || item.nombre.toLowerCase().includes(searchText.toLowerCase())) &&
        (!selectedDate || item.fecha === formatDateKey(selectedDate))
    );

    const filteredMyAttendance = myAttendance.filter(item =>
        (!selectedDate || item.fecha === formatDateKey(selectedDate))
    );

    const activeData = isAdmin ? filteredTeachers : filteredMyAttendance;

    const openDetail = (item) => { setDetailItem(item); setShowDetailModal(true); };
    const closeDetail = () => { setShowDetailModal(false); setDetailItem(null); };

    const handleOpenPicker = () => {
        setTempDate(selectedDate ?? new Date());
        Platform.OS === "ios" ? setShowIOSModal(true) : setShowPicker(true);
    };

    const handleAndroidChange = (event, date) => {
        setShowPicker(false);
        if (event.type === "set" && date) setSelectedDate(date);
    };

    return {
        t, isAdmin, isDark, colors, refreshKey, updateKey,
        searchText, setSearchText, selectedDate, setSelectedDate,
        showPicker, showIOSModal, setShowIOSModal, tempDate, setTempDate,
        activeData, detailItem, showDetailModal, loading,
        openDetail, closeDetail, handleOpenPicker, handleAndroidChange,
    };
}
