import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../view/components/common/ThemeContext';
import {getHighestRole} from '../utils/getHighestRole';
import {useFocusEffect} from '@react-navigation/native';
import {getCurrentUserRole, getCurrentUser} from "../services/UserService";
import {ActorService} from '../services/ActorService';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {request, GET} from '../api/apiClient';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function resolveTimeLocale(language) {
  if (language === 'en') return 'en-US';
  if (language === 'pt') return 'pt-BR';
  if (language === 'fr') return 'fr-FR';
  return 'es-ES';
}

function formatRelativeTime(isoDate, t) {
  if (!isoDate) return '';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(Math.floor(diffMs / 60000), 0);
  if (mins < 60) return `${t('dashboard.ago')} ${mins} ${t('dashboard.minutesAgo')}`;
  const hours = Math.floor(mins / 60);
  return `${t('dashboard.ago')} ${hours} ${t('dashboard.hoursAgo')}`;
}

async function getCourseNameForRecord(record) {
  try {
    const session = unwrap(await request({ method: GET, url: 'class_session', params: { class_session_id: record.class_session_id }, requiresAuth: false }))[0];
    if (!session?.schedule_block_id) return '';
    const block = unwrap(await request({ method: GET, url: 'schedule_block', params: { schedule_block_id: session.schedule_block_id }, requiresAuth: false }))[0];
    if (!block?.course_id) return '';
    const course = unwrap(await request({ method: GET, url: 'course', params: { course_id: block.course_id }, requiresAuth: false }))[0];
    return course?.name || course?.code || '';
  } catch {
    return '';
  }
}

async function fetchRecentNovedades(t) {
  try {
    const typeMap = {};
    unwrap(await request({ method: GET, url: 'alert_type', requiresAuth: false })).forEach((at) => {
      typeMap[at.alert_type_id] = at.name;
    });

    const alerts = unwrap(await request({
      method: GET,
      url: 'alert',
      params: { _sort: 'raised_at', _order: 'desc', _limit: 5 },
      requiresAuth: false,
    }));

    const items = [];
    for (let i = 0; i < alerts.length; i++) {
      const a = alerts[i];
      let personName = '';
      try {
        const actor = unwrap(await request({ method: GET, url: 'academic_actor', params: { academic_actor_id: a.academic_actor_id }, requiresAuth: false }))[0];
        if (actor?.person_id) {
          const person = unwrap(await request({ method: GET, url: 'person', params: { person_id: actor.person_id }, requiresAuth: false }))[0];
          if (person) personName = `${person.name || ''} ${person.last_name || ''}`.trim();
        }
      } catch {}

      items.push({
        id: a.alert_id ?? i + 1,
        titulo: typeMap[a.alert_type_id] || '',
        descripcion: personName,
        tiempo: formatRelativeTime(a.raised_at, t),
        tipo: a.resolved_at ? 'success' : 'warning',
      });
    }
    return items;
  } catch {
    return [];
  }
}

export function useDashboardViewModel({ onLogout, userRole: propUserRole } = {}) {
    const {t, i18n} = useTranslation();
    const {colors, loadThemeForRole, toggleTheme, theme} = useTheme();

    const [userRole, setUserRole] = useState(propUserRole || null);
    const updateKey = useLanguageRefresh();
    const [isLoading, setIsLoading] = useState(false);

    const [adminStats, setAdminStats] = useState({
        totalEmpleados: 0,
        presentesHoy: 0,
        ausentesHoy: 0,
        tardanzasHoy: 0,
        porcentajeAsistencia: 0,
    });
    const [studentStats, setStudentStats] = useState({
        miAsistencia: 0,
        totalClases: 0,
        clasesAsistidas: 0,
        faltas: 0,
        retardos: 0,
    });
    const [teacherStats, setTeacherStats] = useState({
        presentesHoy: 0,
        totalEstudiantes: 0,
        clasesImpartidasHoy: 0,
        justificacionesPendientes: 0,
        porcentajeAsistencia: 0,
    });

    const [asistenciasRecientes, setAsistenciasRecientes] = useState([]);
    const [misRegistrosRecientes, setMisRegistrosRecientes] = useState([]);
    const [novedades, setNovedades] = useState([]);

    const loadUserData = useCallback(async () => {
        try {
            let role = propUserRole;
            if (!role) {
                role = await getCurrentUserRole();
                if (role) {
                    try {
                        const parsed = JSON.parse(role);
                        if (Array.isArray(parsed)) {
                            role = getHighestRole(parsed);
                        }
                    } catch {}
                }
            }
            setUserRole(role);
            if (role) {
                await loadThemeForRole(role);
            }
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
        }
    }, [propUserRole, loadThemeForRole]);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [loadUserData])
    );

    const isAdmin = userRole === 'Administrador' || userRole === 'admin';
    const isTeacher = userRole === 'teacher' || userRole === 'Docente';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const timeLocale = resolveTimeLocale(i18n.language);
                const currentUser = await getCurrentUser();
                const userEmail = currentUser?.email;

                let studentActorId = null;
                if (!isAdmin && userEmail) {
                    const user = await getCurrentUser();
                    const actors = await ActorService.getByPerson(user?.personId);
                    if (actors?.length > 0) {
                        studentActorId = actors[0].academicActorId;
                    }
                }

                if (isAdmin) {
                    const arData = await request({ method: GET, url: 'attendance_record', params: { _limit: 100 }, requiresAuth: false });
                    const records = unwrap(arData);
                    const present = records.filter(r => r.attendance_status === 'Present').length;
                    const absent = records.filter(r => r.attendance_status === 'Absent').length;
                    const late = records.filter(r => r.attendance_status === 'Late').length;
                    const total = records.length || 1;
                    setAdminStats({
                        totalEmpleados: total,
                        presentesHoy: present,
                        ausentesHoy: absent,
                        tardanzasHoy: late,
                        porcentajeAsistencia: Math.round((present / total) * 100),
                    });

                    const recentRecords = records.slice(-4).reverse().map((r, i) => ({
                        id: i + 1,
                        nombre: t('attendance.unknownRecord', {id: r.attendance_record_id}),
                        hora: r.captured_at ? new Date(r.captured_at).toLocaleTimeString(timeLocale, {hour: '2-digit', minute: '2-digit'}) : '—',
                        estado: r.attendance_status === 'Present' ? 'presente' : r.attendance_status === 'Late' ? 'tarde' : 'ausente',
                    }));
                    setAsistenciasRecientes(recentRecords);
                } else if (isTeacher) {
                    const user = await getCurrentUser();
                    const actors = await ActorService.getByPerson(user?.personId);
                    const myActor = actors?.length > 0 ? actors[0] : null;

                    let teacherRecords = [];
                    let sessionsTodayCount = 0;
                    const todayKey = formatDateKey(new Date());
                    if (myActor) {
                        const blockData = await request({ method: GET, url: 'schedule_block', params: { instructor_actor_id: myActor.academicActorId }, requiresAuth: false });
                        const blocks = unwrap(blockData);
                        for (const block of blocks) {
                            const sessionData = await request({ method: GET, url: 'class_session', params: { schedule_block_id: block.schedule_block_id }, requiresAuth: false });
                            const sessions = unwrap(sessionData);
                            sessionsTodayCount += sessions.filter((s) => s.session_date === todayKey).length;
                            for (const session of sessions) {
                                const arData = await request({ method: GET, url: 'attendance_record', params: { class_session_id: session.class_session_id }, requiresAuth: false });
                                teacherRecords.push(...unwrap(arData));
                            }
                        }
                    }

                    const present = teacherRecords.filter(r => r.attendance_status === 'Present').length;
                    const total = teacherRecords.length || 1;

                    let pendingJustifications = 0;
                    try {
                        const jData = await request({ method: GET, url: 'justification', params: { review_status: 'Pending' }, requiresAuth: false });
                        pendingJustifications = unwrap(jData).length;
                    } catch {}

                    setTeacherStats({
                        presentesHoy: present,
                        totalEstudiantes: total,
                        clasesImpartidasHoy: sessionsTodayCount,
                        justificacionesPendientes: pendingJustifications,
                        porcentajeAsistencia: Math.round((present / total) * 100),
                    });

                    const recentRecords = teacherRecords.slice(-4).reverse().map((r, i) => ({
                        id: i + 1,
                        nombre: t('attendance.unknownRecord', {id: r.attendance_record_id}),
                        hora: r.captured_at ? new Date(r.captured_at).toLocaleTimeString(timeLocale, {hour: '2-digit', minute: '2-digit'}) : '—',
                        estado: r.attendance_status === 'Present' ? 'presente' : r.attendance_status === 'Late' ? 'tarde' : 'ausente',
                    }));
                    setAsistenciasRecientes(recentRecords);
                } else {
                    const arParams = studentActorId
                        ? { academic_actor_id: studentActorId, _limit: 100 }
                        : { _limit: 100 };
                    const arData = await request({ method: GET, url: 'attendance_record', params: arParams, requiresAuth: false });
                    const records = unwrap(arData);
                    const present = records.filter(r => r.attendance_status === 'Present').length;
                    const total = records.length || 1;
                    setStudentStats({
                        miAsistencia: Math.round((present / total) * 100),
                        totalClases: total,
                        clasesAsistidas: present,
                        faltas: records.filter(r => r.attendance_status === 'Absent').length,
                        retardos: records.filter(r => r.attendance_status === 'Late').length,
                    });

                    const recentSlice = records.slice(-4).reverse();
                    const myRecords = [];
                    for (let i = 0; i < recentSlice.length; i++) {
                        const r = recentSlice[i];
                        const courseName = await getCourseNameForRecord(r);
                        myRecords.push({
                            id: r.attendance_record_id ?? i + 1,
                            materia: courseName || '—',
                            hora: r.captured_at ? new Date(r.captured_at).toLocaleTimeString(timeLocale, {hour: '2-digit', minute: '2-digit'}) : '—',
                            estado: r.attendance_status === 'Present' ? 'presente' : 'ausente',
                            fecha: r.captured_at ? r.captured_at.split('T')[0] : '—',
                        });
                    }
                    setMisRegistrosRecientes(myRecords);
                }

                setNovedades(await fetchRecentNovedades(t));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        if (userRole) {
            fetchDashboardData();
        }
    }, [userRole, isAdmin, isTeacher, t, i18n.language]);

    const currentLocale = resolveTimeLocale(i18n.language);
    const formattedDate = new Date().toLocaleDateString(currentLocale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const menuAccionesAdmin = [
        { id: 1, title: t('dashboard.manageUsers'), description: t('dashboard.manageUsersDesc'), color: '#E91E63', screen: 'ManageUsersScreen' },
        { id: 2, title: t('dashboard.environmentManagement'), description: t('dashboard.manageEnvironmentDesc'), color: '#1e58e9', screen: 'ManageEnviromentScreen' },
        { id: 3, title: t('dashboard.reports'), description: t('dashboard.reportsDesc'), color: '#FF9800', screen: 'AttendanceReportScreen' },
    ];
    const menuAccionesEstudiante = [
        { id: 1, title: t('student.registerFace'), description: t('student.registerFaceDesc'), color: '#4CAF50', screen: 'RegisterFace' },
        { id: 2, title: t('student.myAttendance'), description: t('student.myAttendanceDesc'), color: '#2196F3', screen: 'DisplayingAttendance' },
        { id: 3, title: t('student.UpdateFace'), description: t('student.UpdateFaceDesc'), color: '#f32152', screen: 'UpdatePhoto' },
    ];
    const menuAccionesDocente = [
        { id: 1, title: t('teacher.updateFace'), description: t('teacher.updateFaceDesc'), color: '#2196F3', screen: 'UpdatePhoto' },
        { id: 2, title: t('teacher.myAttendance'), description: t('teacher.myAttendanceDesc'), color: '#4CAF50', screen: 'DisplayingAttendance' },
        { id: 3, title: t('teacher.pendingJustifications'), description: t('teacher.pendingJustificationsDesc'), color: '#FF9800', screen: 'PendingJustificationScreen' },
        { id: 4, title: t('student.registerFace'), description: t('student.registerFaceDesc'), color: '#4CAF50', screen: 'RegisterFace' },
    ];

    const menuAcciones = isAdmin ? menuAccionesAdmin : isTeacher ? menuAccionesDocente : menuAccionesEstudiante;
    const attendance = isAdmin ? adminStats.porcentajeAsistencia : isTeacher ? teacherStats.porcentajeAsistencia : studentStats.miAsistencia;
    const attendanceLabel = isAdmin ? t('dashboard.attendance') : isTeacher ? t('teacher.attendanceLabel') : t('student.myAttendance');

    const handleLogoutPress = async () => {
        if (onLogout) {
            setIsLoading(true);
            try { await onLogout(); } catch (error) { console.error('Error en logout:', error); } finally { setIsLoading(false); }
        }
    };

    return {
        userRole, isAdmin, isTeacher, updateKey, isLoading, formattedDate,
        menuAcciones, novedades, attendance, attendanceLabel,
        adminStats, studentStats, teacherStats,
        asistenciasRecientes, misRegistrosRecientes,
        handleLogoutPress, loadUserData, toggleTheme, theme,
    };
}
