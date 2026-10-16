import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {saveLanguageForRole} from '../view/components/common/languageByRole';
import {useTheme} from '../view/components/common/ThemeContext';
import {getCurrentUserRole, getCurrentUser} from "../services/UserService";
import {ActorService} from '../services/ActorService';
import {SchoolService} from '../services/SchoolService';
import {PeriodService} from '../services/PeriodService';
import {EnrollmentService} from '../services/EnrollmentService';
import {CohortService} from '../services/CohortService';
import {ProgramService} from '../services/ProgramService';
import {CourseService} from '../services/CourseService';
import {AttendanceService} from '../services/AttendanceService';
import {JustificationService} from '../services/JustificationService';
import {ScheduleBlockService} from '../services/ScheduleBlockService';
import {EnvironmentService} from '../services/EnvironmentService';
import {backendGet} from '../api/backend';
import ENV from '../config/env';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {removeToken} from '../view/storage/TokenStorage';

export function useProfileViewModel({ onLogout } = {}) {
    const navigation = useNavigation();
    const {t, i18n} = useTranslation();
    const {theme, toggleTheme, loadThemeForRole} = useTheme();

    const [userRole, setUserRole] = useState(null);
    const updateKey = useLanguageRefresh();
    const [isLoading, setIsLoading] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState(null);
    // Secciones por rol (antes vacías): se cargan del backend en loadUserData.
    const [courses, setCourses] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [justifications, setJustifications] = useState([]);
    const [teacherSchedules, setTeacherSchedules] = useState([]);
    const [teacherCourseStats, setTeacherCourseStats] = useState([]);
    const [userInfo, setUserInfo] = useState({
        personId: null,
        name: '',
        email: '',
        phone: '',
        role: '',
        joinDate: '',
        school: '',
        employeeId: '',
        actorCode: '',
    });

    // Secciones del perfil por rol, con datos del backend.
    // Estudiante: cursos (matrículas), estadísticas y justificaciones.
    // Docente: horario (bloques) y asistencia por curso.
    const loadSections = useCallback(async (role, actor) => {
        const kind = String(role || '').toLowerCase();
        const isStudent = kind.includes('estudiante') || kind.includes('student') || kind.includes('aprendiz');
        const isTeacher = kind.includes('docente') || kind.includes('teacher') || kind.includes('instructor');
        const actorId = actor?.academicActorId ?? null;
        if (actorId == null) return;

        if (isStudent) {
            try {
                const enrollments = await EnrollmentService.listByActor(actorId).catch(() => []);
                const active = enrollments.filter((e) => (e.enrollmentStatus || 'Active') === 'Active');
                const courseCards = [];
                for (const enrollment of active) {
                    try {
                        const cohort = await CohortService.getById(enrollment.cohortId);
                        if (!cohort) continue;
                        let programName = cohort.code || '';
                        try {
                            const program = cohort.programId ? await ProgramService.getById(cohort.programId) : null;
                            if (program?.name) programName = program.name;
                        } catch {}
                        courseCards.push({
                            id_enrollment: enrollment.enrollmentId,
                            course_code: cohort.code || '',
                            course_name: programName,
                        });
                    } catch {}
                }
                setCourses(courseCards);
            } catch {
                setCourses([]);
            }
            try {
                const summary = await AttendanceService.getSummary([actorId]);
                const counts = summary.get?.(Number(actorId)) || summary.get?.(String(actorId)) || {};
                const present = Number(counts.present ?? 0) + Number(counts.late ?? 0);
                setAttendanceStats({
                    present,
                    absent: Number(counts.absent ?? 0),
                    justified: Number(counts.justified ?? 0),
                });
            } catch {
                setAttendanceStats(null);
            }
            try {
                const list = await JustificationService.getByActor(actorId).catch(() => []);
                setJustifications(
                    (list ?? []).map((j) => ({
                        id: j.justificationId,
                        date: String(j.submittedAt || '').slice(0, 10) || '—',
                        reason: j.reason || '',
                        approval: j.reviewStatus || 'Pending',
                    }))
                );
            } catch {
                setJustifications([]);
            }
        }

        if (isTeacher) {
            let blocks = [];
            try {
                blocks = await ScheduleBlockService.getByInstructor(actorId).catch(() => []);
            } catch {
                blocks = [];
            }
            const dayName = (d) => {
                const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                return days[Number(d)] || '';
            };
            const schedules = [];
            const courseIds = [];
            for (const block of blocks ?? []) {
                try {
                    const course = block?.courseId ? await CourseService.getById(block.courseId).catch(() => null) : null;
                    const env = block?.environmentId ? await EnvironmentService.getById(block.environmentId).catch(() => null) : null;
                    schedules.push({
                        id_schedule: block.scheduleBlockId,
                        day: block.dayName || dayName(block.dayOfWeek),
                        start_time: String(block.startsAt || '').slice(0, 5),
                        end_time: String(block.endsAt || '').slice(0, 5),
                        course_name: course?.name || course?.code || '',
                        classroom: env?.code || env?.name || '',
                    });
                    if (block?.courseId && !courseIds.includes(block.courseId)) courseIds.push(block.courseId);
                } catch {}
            }
            setTeacherSchedules(schedules);
            // Asistencia por curso: actores matriculados en los cohortes de
            // sus bloques, con conteos agregados en SQL.
            const stats = [];
            try {
                const cohortIds = [...new Set((blocks ?? []).map((b) => b?.cohortId).filter((c) => c != null))];
                const actorIds = new Set();
                for (const cohortId of cohortIds) {
                    try {
                        const enrollments = await EnrollmentService.listByCohort(cohortId).catch(() => []);
                        for (const e of enrollments ?? []) {
                            if ((e.enrollmentStatus || 'Active') === 'Active' && e.academicActorId != null) {
                                actorIds.add(e.academicActorId);
                            }
                        }
                    } catch {}
                }
                const summary = actorIds.size
                    ? await AttendanceService.getSummary([...actorIds]).catch(() => new Map())
                    : new Map();
                for (const courseId of courseIds) {
                    try {
                        const course = await CourseService.getById(courseId).catch(() => null);
                        let present = 0, absent = 0, total = 0;
                        for (const counts of summary.values?.() ?? []) {
                            present += Number(counts.present ?? 0) + Number(counts.late ?? 0);
                            absent += Number(counts.absent ?? 0);
                            total += Number(counts.total ?? 0);
                        }
                        stats.push({
                            id_course: courseId,
                            course_code: course?.code || '',
                            course_name: course?.name || course?.code || '',
                            present,
                            absent,
                            total,
                        });
                    } catch {}
                }
            } catch {}
            setTeacherCourseStats(stats);
        }
    }, []);
    const formatJoinDate = (raw) => {
        if (!raw) return '';
        const date = raw instanceof Date ? raw : new Date(raw);
        if (Number.isNaN(date.getTime())) return '';
        try {
            return date.toLocaleDateString(i18n.language || 'es', {day: '2-digit', month: 'short', year: 'numeric'});
        } catch {
            return date.toLocaleDateString('es', {day: '2-digit', month: 'short', year: 'numeric'});
        }
    };

    // Cargar datos del usuario al recibir foco:
    // persona (nombre/teléfono) -> actor académico -> colegio.
    const loadUserData = useCallback(async () => {
        try {
            const current = await getCurrentUser();
            const role = await getCurrentUserRole();
            if (role) {
                setUserRole(role);
                await loadThemeForRole(role);
            }

            let person = null;
            if (current?.personId) {
                try {
                    const arr = await backendGet(ENV.API_BASE_URL, `api/v1/persons/${current.personId}`);
                    person = arr[0] || null;
                } catch {}
            }

            // Fecha de ingreso: inicio del vínculo académico; si no hay
            // actor (p. ej. admin), creación del usuario en identity.
            let userCreatedAt = null;
            if (current?.userId) {
                try {
                    const arr = await backendGet(ENV.API_BASE_URL, `api/v1/users/${current.userId}`);
                    userCreatedAt = arr[0]?.created_at || null;
                } catch {}
            }

            let schoolName = '';
            let actorCode = '';
            let joinDate = '';
            let loadedSchoolInfo = null;
            let sectionActor = null;
            if (person?.person_id) {
                try {
                    const actors = await ActorService.getByPerson(person.person_id);
                    // Actor acorde al rol (un usuario puede tener varios).
                    const kind = String(role || '').toLowerCase();
                    const wantType = kind.includes('docente') || kind.includes('teacher') || kind.includes('instructor') ? 2
                        : kind.includes('estudiante') || kind.includes('student') || kind.includes('aprendiz') ? 1
                        : null;
                    const actor = (wantType != null
                        ? actors?.find((a) => a?.actorTypeId === wantType)
                        : null) || actors?.[0] || null;
                    sectionActor = actor;
                    actorCode = actor?.actorCode || '';
                    joinDate = formatJoinDate(actor?.startedOn || userCreatedAt);
                    const schoolId = actor?.schoolId || null;
                    if (schoolId) {
                        const school = await SchoolService.getById(schoolId);
                        schoolName = school?.name || '';
                        const activePeriod = await PeriodService.getActiveBySchool(schoolId);
                        loadedSchoolInfo = {
                            name: school?.name || '',
                            address: school?.address || '',
                            activePeriod: activePeriod?.name || '',
                        };
                    } else {
                        // Sin actor académico (p. ej. admin): escuela con
                        // más actores (la sede principal) para no dejar
                        // el perfil vacío.
                        const schools = await SchoolService.getAll();
                        let school = schools?.[0] || null;
                        try {
                            const counts = {};
                            for (const a of (await ActorService.getAll()) || []) {
                                if (a?.schoolId != null) counts[a.schoolId] = (counts[a.schoolId] || 0) + 1;
                            }
                            const top = Object.entries(counts).sort((x, y) => y[1] - x[1] || Number(x[0]) - Number(y[0]))[0];
                            const found = top ? schools?.find((s) => String(s?.schoolId) === String(top[0])) : null;
                            if (found) school = found;
                        } catch {}
                        if (school?.schoolId) {
                            schoolName = school?.name || '';
                            const activePeriod = await PeriodService.getActiveBySchool(school.schoolId);
                            loadedSchoolInfo = {
                                name: school?.name || '',
                                address: school?.address || '',
                                activePeriod: activePeriod?.name || '',
                            };
                        }
                    }
                } catch {}
            }
            setSchoolInfo(loadedSchoolInfo);

            setUserInfo({
                personId: person?.person_id || current?.personId || null,
                name: `${person?.name || ''} ${person?.last_name || ''}`.trim() || current?.username || current?.name || '',
                email: person?.email || current?.email || '',
                phone: person?.phone || '',
                role: role || '',
                joinDate,
                school: schoolName,
                employeeId: person?.document_number || '',
                actorCode,
            });

            // Secciones por rol (cursos, estadísticas, justificaciones, horario).
            if (sectionActor) {
                await loadSections(role, sectionActor).catch(() => {});
            }
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
        }
    }, [loadThemeForRole, i18n.language, loadSections]);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [loadUserData])
    );

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    // Acción real de cerrar sesión (sin confirmación).
    // Delega en onLogout (AppNavigator) para voltear isAuthenticated;
    // sin él, solo limpia la sesión sin navegar a rutas de otro stack.
    const performLogout = useCallback(async () => {
        setIsLoading(true);
        try {
            if (userRole) {
                await saveLanguageForRole(userRole, i18n.language);
            }
            await removeToken();
            await AsyncStorage.multiRemove(['userRole', 'userEmail', 'userProfile']);
            if (onLogout) {
                await onLogout();
            }
        } catch (error) {
            console.error('Error en logout:', error);
            throw error; // La pantalla mostrará el error con CustomAlert
        } finally {
            setIsLoading(false);
        }
    }, [userRole, i18n.language, onLogout]);

    return {
        userRole,
        userInfo,
        updateKey,
        isLoading,
        handleBack,
        performLogout,
        toggleTheme,
        reload: loadUserData,
        courses,
        attendanceStats,
        justifications,
        iotDevices: [],
        teacherSchedules,
        teacherCourseStats,
        schoolInfo,
    };
}