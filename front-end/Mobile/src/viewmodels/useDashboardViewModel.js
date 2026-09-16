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
    });

    const [asistenciasRecientes, setAsistenciasRecientes] = useState([]);
    const [misRegistrosRecientes, setMisRegistrosRecientes] = useState([]);

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
                        nombre: `Registro #${r.attendance_record_id}`,
                        hora: r.captured_at ? new Date(r.captured_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : '—',
                        estado: r.attendance_status === 'Present' ? 'presente' : r.attendance_status === 'Late' ? 'tarde' : 'ausente',
                    }));
                    setAsistenciasRecientes(recentRecords);
                } else if (isTeacher) {
                    const user = await getCurrentUser();
                    const actors = await ActorService.getByPerson(user?.personId);
                    const myActor = actors?.length > 0 ? actors[0] : null;

                    let teacherRecords = [];
                    if (myActor) {
                        const blockData = await request({ method: GET, url: 'schedule_block', params: { instructor_actor_id: myActor.academicActorId }, requiresAuth: false });
                        const blocks = unwrap(blockData);
                        for (const block of blocks) {
                            const sessionData = await request({ method: GET, url: 'class_session', params: { schedule_block_id: block.schedule_block_id }, requiresAuth: false });
                            const sessions = unwrap(sessionData);
                            for (const session of sessions) {
                                const arData = await request({ method: GET, url: 'attendance_record', params: { class_session_id: session.class_session_id }, requiresAuth: false });
                                teacherRecords.push(...unwrap(arData));
                            }
                        }
                    }

                    const present = teacherRecords.filter(r => r.attendance_status === 'Present').length;
                    const total = teacherRecords.length || 1;
                    setTeacherStats({
                        presentesHoy: present,
                        totalEstudiantes: total,
                        clasesImpartidasHoy: 3,
                        justificacionesPendientes: 4,
                    });

                    const recentRecords = teacherRecords.slice(-4).reverse().map((r, i) => ({
                        id: i + 1,
                        nombre: `Registro #${r.attendance_record_id}`,
                        hora: r.captured_at ? new Date(r.captured_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : '—',
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

                    const myRecords = records.slice(-4).reverse().map((r, i) => ({
                        id: i + 1,
                        materia: t('subjects.general'),
                        hora: r.captured_at ? new Date(r.captured_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : '—',
                        estado: r.attendance_status === 'Present' ? 'presente' : 'ausente',
                        fecha: t('time.today'),
                    }));
                    setMisRegistrosRecientes(myRecords);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        if (userRole) {
            fetchDashboardData();
        }
    }, [userRole, isAdmin, isTeacher, t]);

    const currentLocale =
        i18n.language === 'en' ? 'en-US'
        : i18n.language === 'pt' ? 'pt-BR'
        : i18n.language === 'fr' ? 'fr-FR'
        : 'es-ES';
    const formattedDate = new Date().toLocaleDateString(currentLocale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const menuAccionesAdmin = [
        { id: 1, title: t('dashboard.manageUsers'), description: t('dashboard.manageUsersDesc', 'Agregar, editar y eliminar estudiantes y profesores'), color: '#E91E63', screen: 'ManageUsersScreen' },
        { id: 2, title: t('dashboard.environmentManagement'), description: t('dashboard.manageEnvironmentDesc', 'Agregar, editar y eliminar ambientes/salones'), color: '#1e58e9', screen: 'ManageEnviromentScreen' },
        { id: 3, title: t('dashboard.reports'), description: t('dashboard.reportsDesc'), color: '#FF9800', screen: 'AttendanceReportScreen' },
    ];
    const menuAccionesEstudiante = [
        { id: 1, title: t('student.registerFace'), description: t('student.registerFaceDesc'), color: '#4CAF50', screen: 'RegisterFace' },
        { id: 2, title: t('student.myAttendance'), description: t('student.myAttendanceDesc'), color: '#2196F3', screen: 'DisplayingAttendance' },
        { id: 3, title: t('student.UpdateFace'), description: t('student.UpdateFaceDesc'), color: '#f32152', screen: 'UpdatePhoto' },
    ];
    const menuAccionesDocente = [
        { id: 1, title: t('teacher.updateFace', 'Actualización de Rostro'), description: t('teacher.updateFaceDesc', 'Actualiza tus parámetros de reconocimiento facial'), color: '#2196F3', screen: 'UpdatePhoto' },
        { id: 2, title: t('teacher.myAttendance', 'Asistencias a Mis Clases'), description: t('teacher.myAttendanceDesc', 'Revisa el registro de asistencia de tus grupos'), color: '#4CAF50', screen: 'DisplayingAttendance' },
        { id: 3, title: t('teacher.pendingJustifications', 'Justificaciones Pendientes'), description: t('teacher.pendingJustificationsDesc', 'Revisa y gestiona las justificaciones de tus estudiantes'), color: '#FF9800', screen: 'PendingJustificationScreen' },
        { id: 4, title: t('student.registerFace'), description: t('student.registerFaceDesc'), color: '#4CAF50', screen: 'RegisterFace' },
    ];

    const novedadesAdmin = [
        { id: 1, titulo: t('dashboard.newEmployeeRegistered'), descripcion: `${t('dashboard.newEmployeeMsg')}`, tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.minutesAgo')}`, tipo: 'success' },
        { id: 2, titulo: t('dashboard.latenessDetected'), descripcion: `${t('dashboard.latenessMsg')}`, tiempo: `${t('dashboard.ago')} 30 ${t('dashboard.minutesAgo')}`, tipo: 'warning' },
        { id: 3, titulo: t('dashboard.facialRecognitionImproved'), descripcion: t('dashboard.facialRecognitionMsg'), tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`, tipo: 'info' },
    ];
    const novedadesEstudiante = [
        { id: 1, titulo: t('student.faceRecognized'), descripcion: t('student.faceRecognizedMsg'), tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`, tipo: 'success' },
        { id: 2, titulo: t('student.attendanceReminder'), descripcion: t('student.attendanceReminderDesc'), tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.hoursAgo')}`, tipo: 'info' },
    ];
    const novedadesDocente = [
        { id: 1, titulo: t('teacher.newJustification', 'Nueva Justificación'), descripcion: t('teacher.justificationMathMsg'), tiempo: `${t('dashboard.ago')} 1 ${t('dashboard.hoursAgo')}`, tipo: 'warning' },
        { id: 2, titulo: t('teacher.attendanceRecorded', 'Asistencia Registrada'), descripcion: t('teacher.attendanceGroupMsg'), tiempo: `${t('dashboard.ago')} 3 ${t('dashboard.hoursAgo')}`, tipo: 'success' },
    ];

    const menuAcciones = isAdmin ? menuAccionesAdmin : isTeacher ? menuAccionesDocente : menuAccionesEstudiante;
    const novedades = isAdmin ? novedadesAdmin : isTeacher ? novedadesDocente : novedadesEstudiante;
    const attendance = isAdmin ? adminStats.porcentajeAsistencia : isTeacher ? 88 : studentStats.miAsistencia;
    const attendanceLabel = isAdmin ? t('dashboard.attendance') : isTeacher ? t('teacher.attendanceLabel', 'Asistencia de mis grupos') : t('student.myAttendance');

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
