import {useCallback, useEffect, useState} from "react";
import {Platform} from "react-native";
import {useTranslation} from "react-i18next";
import {useLanguageRefresh} from "../utils/useLanguageRefresh";
import {useTheme} from "../view/components/common/ThemeContext";
import {getCurrentUserRole, getCurrentUser} from "../services/UserService";
import {ActorService} from "../services/ActorService";
import {PeriodService} from "../services/PeriodService";
import {backendGet, request, POST} from "../api/backend";

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

export function resolveLocale(language) {
    if (language === 'en') return 'en-US';
    if (language === 'pt') return 'pt-BR';
    if (language === 'fr') return 'fr-FR';
    return 'es-ES';
}

export function getDayLabel(dayOfWeek, locale = 'es-ES') {
    const day = Number(dayOfWeek);
    if (!day || day < 1 || day > 7) return '—';
    try {
        const ref = new Date(2024, 0, day);
        const label = ref.toLocaleDateString(locale, {weekday: 'long'});
        return label ? label.charAt(0).toUpperCase() + label.slice(1) : '—';
    } catch {
        return '—';
    }
}

export function formatDateDisplay(date, t, locale = 'es-ES') {
    if (!date) return t("attendance.filterByDate");
    return date.toLocaleDateString(locale, {day: "2-digit", month: "short", year: "numeric"});
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
            const locale = resolveLocale(i18n.language);
            const user = await getCurrentUser();
            const actors = user?.personId ? await ActorService.getByPerson(user.personId) : [];
            const myActor = actors?.length > 0 ? actors[0] : null;

            const isTeacherRole = role === 'Docente' || role === 'teacher' || role === 'INSTRUCTOR';
            const isAdminRole = role === 'Administrador' || role === 'admin';

            let records = [];

            if (isAdminRole) {
                const arData = await backendGet(ENV.ATTENDANCE_BASE_URL, 'api/v1/attendance-records', {_limit: 200});
                records = unwrap(arData);
            } else if (isTeacherRole && myActor) {
                const blockData = await backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/schedule-blocks', {instructor_actor_id: myActor.academicActorId});
                const blocks = unwrap(blockData);
                const blockIds = blocks.map(b => b.schedule_block_id);

                for (const blockId of blockIds) {
                    const sessionData = await backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/class-sessions', {schedule_block_id: blockId});
                    const sessions = unwrap(sessionData);
                    for (const session of sessions) {
                        const arData = await backendGet(ENV.ATTENDANCE_BASE_URL, 'api/v1/attendance-records', {class_session_id: session.class_session_id});
                        records.push(...unwrap(arData));
                    }
                }
            } else if (myActor) {
                const arData = await backendGet(ENV.ATTENDANCE_BASE_URL, 'api/v1/attendance-records', {academic_actor_id: myActor.academicActorId, _limit: 200});
                records = unwrap(arData);
            }

            let activePeriod = null;
            try {
                activePeriod = myActor?.schoolId
                    ? await PeriodService.getActiveBySchool(myActor.schoolId)
                    : (await PeriodService.getAll({is_active: true}))[0] || null;
            } catch (e) {}

            const enriched = [];
            for (const record of records.slice(-50)) {
                try {
                    const sessionData = await backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/class-sessions', {class_session_id: record.class_session_id});
                    const session = unwrap(sessionData)[0] || {};

                    const blockData = await backendGet(ENV.SCHEDULING_BASE_URL, 'api/v1/schedule-blocks', {schedule_block_id: session.schedule_block_id});
                    const block = unwrap(blockData)[0] || {};

                    const courseData = await backendGet(ENV.ACADEMIC_BASE_URL, 'api/v1/courses', {course_id: block.course_id});
                    const course = unwrap(courseData)[0] || {};

                    const envData = await backendGet(ENV.ACADEMIC_BASE_URL, 'api/v1/environments', {environment_id: block.environment_id});
                    const env = unwrap(envData)[0] || {};

                    const actorData = await backendGet(ENV.ACADEMIC_BASE_URL, 'api/v1/academic-actors', {academic_actor_id: record.academic_actor_id});
                    const actor = unwrap(actorData)[0] || {};

                    const personData = await backendGet(ENV.API_BASE_URL, 'api/v1/persons', {person_id: actor.person_id});
                    const person = unwrap(personData)[0] || {};

                    let docenteName = '—';
                    if (block.instructor_actor_id) {
                        try {
                            const instrActorData = await backendGet(ENV.ACADEMIC_BASE_URL, 'api/v1/academic-actors', {academic_actor_id: block.instructor_actor_id});
                            const instrActor = unwrap(instrActorData)[0];
                            if (instrActor?.person_id) {
                                const instrPersonData = await backendGet(ENV.API_BASE_URL, 'api/v1/persons', {person_id: instrActor.person_id});
                                const instrPerson = unwrap(instrPersonData)[0];
                                if (instrPerson) {
                                    docenteName = `${instrPerson.name || ''} ${instrPerson.last_name || ''}`.trim() || '—';
                                }
                            }
                        } catch (e) {}
                    }

                    const statusMap = { Present: 'presente', Late: 'tarde', Absent: 'ausente' };
                    const hora = record.captured_at ? new Date(record.captured_at).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'}) : '—';

                    enriched.push({
                        id: record.attendance_record_id,
                        nombre: `${person.name || ''} ${person.last_name || ''}`.trim() || t('attendance.unknownPerson', {id: record.academic_actor_id}),
                        fecha: record.captured_at ? record.captured_at.split('T')[0] : '',
                        hora,
                        estado: statusMap[record.attendance_status] || 'ausente',
                        materia: course.name || course.code || '—',
                        codigo_curso: course.code || '—',
                        dia: getDayLabel(block.day_of_week, locale),
                        hora_inicio: block.starts_at || '—',
                        hora_fin: block.ends_at || '—',
                        salon: env.name || '—',
                        periodo: activePeriod?.name || '—',
                        periodo_inicio: activePeriod?.startsOn || '—',
                        periodo_fin: activePeriod?.endsOn || '—',
                        docente: docenteName,
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
    }, [t, i18n.language]);

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
    }, [fetchAttendance, loadThemeForRole]);

    const isAdmin = userRole === "Administrador" || userRole === "admin";

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
        t, locale: resolveLocale(i18n.language), isAdmin, isDark, colors, refreshKey, updateKey,
        searchText, setSearchText, selectedDate, setSelectedDate,
        showPicker, showIOSModal, setShowIOSModal, tempDate, setTempDate,
        activeData, detailItem, showDetailModal, loading,
        openDetail, closeDetail, handleOpenPicker, handleAndroidChange,
    };
}
