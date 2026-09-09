import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../view/components/common/ThemeContext';
import {getHighestRole} from '../utils/getHighestRole';
import {useFocusEffect} from '@react-navigation/native';
import {getCurrentUserRole} from "../services/UserService";
import {useLanguageRefresh} from '../utils/useLanguageRefresh';

export function useDashboardViewModel({ onLogout, userRole: propUserRole } = {}) {
    const {t, i18n} = useTranslation();
    const {colors, loadThemeForRole, toggleTheme, theme} = useTheme();

    const [userRole, setUserRole] = useState(propUserRole || null);
    const updateKey = useLanguageRefresh();
    const [isLoading, setIsLoading] = useState(false);

    // Datos mock (podrían venir de servicios)
    const [adminStats] = useState({
        totalEmpleados: 45,
        presentesHoy: 38,
        ausentesHoy: 5,
        tardanzasHoy: 2,
        porcentajeAsistencia: 84,
    });
    const [studentStats] = useState({
        miAsistencia: 94,
        totalClases: 32,
        clasesAsistidas: 30,
        faltas: 2,
        reconocimientosExitosos: 28,
        retardos: 3,
        fallasReconocimiento: 2,
        porcentajeRetardos: 9,
        porcentajeFallas: 7,
        tasaExitoReconocimiento: 93,
    });

    // Carga el rol desde prop o AsyncStorage
    const loadUserData = useCallback(async () => {
        try {
            let role = propUserRole;
            if (!role) {
                role = await getCurrentUserRole();
                // Aplicar jerarquía si fuera necesario (si guardaste un array JSON)
                if (role) {
                    try {
                        const parsed = JSON.parse(role);
                        if (Array.isArray(parsed)) {
                            role = getHighestRole(parsed);
                        }
                    } catch {
                    }
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

    // Recargar al enfocar la pantalla (primera vez y cada vez que se navega a ella)
    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [loadUserData])
    );

    const isAdmin = userRole === 'Administrador' || userRole === 'admin';
    const isTeacher = userRole === 'teacher' || userRole === 'Docente';

    // Estadísticas del docente (para evitar errores undefined en el Dashboard)
    const [teacherStats] = useState({
        presentesHoy: 28,
        totalEstudiantes: 32,
        clasesImpartidasHoy: 3,
        justificacionesPendientes: 4,
    });

    // Fecha formateada
    const currentLocale =
        i18n.language === 'en'
            ? 'en-US'
            : i18n.language === 'pt'
                ? 'pt-BR'
                : i18n.language === 'fr'
                    ? 'fr-FR'
                    : 'es-ES';
    const formattedDate = new Date().toLocaleDateString(currentLocale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Acciones rápidas y novedades según rol
    const menuAccionesAdmin = [
        {
            id: 1,
            title: t('dashboard.manageUsers'),
            description: t('dashboard.manageUsersDesc', 'Agregar, editar y eliminar estudiantes y profesores'),
            color: '#E91E63',
            screen: 'ManageUsersScreen'
        },
        {
            id: 2,
            title: t('dashboard.environmentManagement'),
            description: t('dashboard.manageEnvironmentDesc', 'Agregar, editar y eliminar ambientes/salones'),
            color: '#1e58e9',
            screen: 'ManageEnviromentScreen'
        },
        {
            id: 3,
            title: t('dashboard.reports'),
            description: t('dashboard.reportsDesc'),
            color: '#FF9800',
            screen: 'AttendanceReportScreen'
        },
    ];

    const menuAccionesEstudiante = [
        {
            id: 1,
            title: t('student.registerFace'),
            description: t('student.registerFaceDesc'),
            color: '#4CAF50',
            screen: 'RegisterFace'
        },
        {
            id: 2,
            title: t('student.myAttendance'),
            description: t('student.myAttendanceDesc'),
            color: '#2196F3',
            screen: 'DisplayingAttendance'
        },
        {
            id: 3,
            title: t('student.UpdateFace'),
            description: t('student.UpdateFaceDesc'),
            color: '#f32152',
            screen: 'UpdatePhoto'
        },
    ];

    const menuAccionesDocente = [
        {
            id: 1,
            title: t('teacher.updateFace', 'Actualización de Rostro'),
            description: t('teacher.updateFaceDesc', 'Actualiza tus parámetros de reconocimiento facial'),
            color: '#2196F3',
            screen: 'UpdatePhoto'
        },
        {
            id: 2,
            title: t('teacher.myAttendance', 'Asistencias a Mis Clases'),
            description: t('teacher.myAttendanceDesc', 'Revisa el registro de asistencia de tus grupos'),
            color: '#4CAF50',
            screen: 'DisplayingAttendance'
        },
        {
            id: 3,
            title: t('teacher.pendingJustifications', 'Justificaciones Pendientes'),
            description: t('teacher.pendingJustificationsDesc', 'Revisa y gestiona las justificaciones de tus estudiantes'),
            color: '#FF9800',
            screen: 'PendingJustificationScreen'
        },
        {
            id: 4,
            title: t('student.registerFace'),
            description: t('student.registerFaceDesc'),
            color: '#4CAF50',
            screen: 'RegisterFace'
        },
    ];

    const novedadesAdmin = [
        {
            id: 1,
            titulo: t('dashboard.newEmployeeRegistered'),
            descripcion: `María González ${t('dashboard.newEmployeeMsg')}`,
            tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.minutesAgo')}`,
            tipo: 'success'
        },
        {
            id: 2,
            titulo: t('dashboard.latenessDetected'),
            descripcion: `Carlos Ruiz ${t('dashboard.latenessMsg')} 15 ${t('dashboard.minutesLate')}`,
            tiempo: `${t('dashboard.ago')} 30 ${t('dashboard.minutesAgo')}`,
            tipo: 'warning'
        },
        {
            id: 3,
            titulo: t('dashboard.facialRecognitionImproved'),
            descripcion: t('dashboard.facialRecognitionMsg'),
            tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`,
            tipo: 'info'
        },
    ];

    const novedadesEstudiante = [
        {
            id: 1,
            titulo: t('student.faceRecognized'),
            descripcion: t('student.faceRecognizedMsg'),
            tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`,
            tipo: 'success'
        },
        {
            id: 2,
            titulo: t('student.attendanceReminder'),
            descripcion: t('student.attendanceReminderDesc'),
            tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.hoursAgo')}`,
            tipo: 'info'
        },
    ];

    const novedadesDocente = [
        {
            id: 1,
            titulo: t('teacher.newJustification', 'Nueva Justificación'),
            descripcion: t('teacher.justificationMathMsg'),
            tiempo: `${t('dashboard.ago')} 1 ${t('dashboard.hoursAgo')}`,
            tipo: 'warning'
        },
        {
            id: 2,
            titulo: t('teacher.attendanceRecorded', 'Asistencia Registrada'),
            descripcion: t('teacher.attendanceGroupMsg'),
            tiempo: `${t('dashboard.ago')} 3 ${t('dashboard.hoursAgo')}`,
            tipo: 'success'
        },
    ];

    const asistenciasRecientes = [
        {id: 1, nombre: 'Ana Martínez', hora: '08:15 AM', estado: 'presente'},
        {id: 2, nombre: 'Luis Fernández', hora: '08:22 AM', estado: 'presente'},
        {id: 3, nombre: 'Carmen López', hora: '08:30 AM', estado: 'presente'},
        {id: 4, nombre: 'Roberto Díaz', hora: '08:45 AM', estado: 'tarde'},
    ];

    const misRegistrosRecientes = [
        {id: 1, materia: t('subjects.math'), hora: '08:15 AM', estado: 'presente', fecha: t('time.today')},
        {id: 2, materia: t('subjects.physics'), hora: '10:00 AM', estado: 'presente', fecha: t('time.today')},
        {id: 3, materia: t('subjects.history'), hora: '08:20 AM', estado: 'presente', fecha: t('time.yesterday')},
        {id: 4, materia: t('subjects.programming'), hora: '08:10 AM', estado: 'presente', fecha: t('time.yesterday')},
    ];

    const menuAcciones = isAdmin ? menuAccionesAdmin : isTeacher ? menuAccionesDocente : menuAccionesEstudiante;
    const novedades = isAdmin ? novedadesAdmin : isTeacher ? novedadesDocente : novedadesEstudiante;
    const attendance = isAdmin ? adminStats.porcentajeAsistencia : isTeacher ? 88 : studentStats.miAsistencia;
    const attendanceLabel = isAdmin ? t('dashboard.attendance') : isTeacher ? t('teacher.attendanceLabel', 'Asistencia de mis grupos') : t('student.myAttendance');

    const handleLogoutPress = async () => {
        if (onLogout) {
            setIsLoading(true);
            try {
                await onLogout();
            } catch (error) {
                console.error('Error en logout:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return {
        userRole,
        isAdmin,
        isTeacher,
        updateKey,
        isLoading,
        formattedDate,
        menuAcciones,
        novedades,
        attendance,
        attendanceLabel,
        adminStats,
        studentStats,
        teacherStats,
        asistenciasRecientes,
        misRegistrosRecientes,
        handleLogoutPress,
        loadUserData,
        toggleTheme,
        theme,
    };
}