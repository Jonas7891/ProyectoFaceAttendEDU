// viewmodels/useDashboardViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../view/components/common/ThemeContext';
import { getHighestRole } from '../utils/getHighestRole';
import { useFocusEffect } from '@react-navigation/native';

export function useDashboardViewModel({ onLogout, userRole: propUserRole } = {}) {
    const { t, i18n } = useTranslation();
    const { colors, loadThemeForRole, toggleTheme, theme } = useTheme();

    const [userRole, setUserRole] = useState(propUserRole || null);
    const [updateKey, setUpdateKey] = useState(0); // forzar re-render cuando cambia el idioma
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
                role = await AsyncStorage.getItem('userRole');
                // Aplicar jerarquía si fuera necesario (si guardaste un array JSON)
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
            setUpdateKey(prev => prev + 1);
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
        }
    }, [propUserRole, loadThemeForRole]);

    // Escuchar cambios de idioma para forzar re-render
    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            setUpdateKey(prev => prev + 1);
        };
        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    // Carga inicial
    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // Recargar al enfocar la pantalla
    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [loadUserData])
    );

    // Determinar si es administrador
    const isAdmin = userRole === 'Administrador';

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
        { id: 1, title: t('dashboard.registerAttendance'), description: t('dashboard.registerAttendanceDesc'), color: '#4CAF50', screen: 'RegistroAsistencia' },
        { id: 2, title: t('dashboard.employeeManagement'), description: t('dashboard.employeeManagementDesc'), color: '#2196F3', screen: 'GestionEmpleados' },
        { id: 3, title: t('dashboard.reports'), description: t('dashboard.reportsDesc'), color: '#FF9800', screen: 'Reportes' },
        { id: 4, title: t('dashboard.facialConfig'), description: t('dashboard.facialConfigDesc'), color: '#9C27B0', screen: 'ConfiguracionFacial' },
    ];

    const menuAccionesEstudiante = [
        { id: 1, title: t('student.registerFace'), description: t('student.registerFaceDesc'), color: '#4CAF50' },
        { id: 2, title: t('student.myAttendance'), description: t('student.myAttendanceDesc'), color: '#2196F3' },
        { id: 3, title: t('student.UpdateFace'), description: t('student.UpdateFaceDesc'), color: '#2196F3' },
    ];

    const novedadesAdmin = [
        { id: 1, titulo: t('dashboard.newEmployeeRegistered'), descripcion: `María González ${t('dashboard.newEmployeeMsg')}`, tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.minutesAgo')}`, tipo: 'success' },
        { id: 2, titulo: t('dashboard.latenessDetected'), descripcion: `Carlos Ruiz ${t('dashboard.latenessMsg')} 15 ${t('dashboard.minutesLate')}`, tiempo: `${t('dashboard.ago')} 30 ${t('dashboard.minutesAgo')}`, tipo: 'warning' },
        { id: 3, titulo: t('dashboard.facialRecognitionImproved'), descripcion: t('dashboard.facialRecognitionMsg'), tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`, tipo: 'info' },
    ];

    const novedadesEstudiante = [
        { id: 1, titulo: t('student.faceRecognized'), descripcion: 'Tu rostro fue reconocido exitosamente hoy a las 08:15 AM', tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`, tipo: 'success' },
        { id: 2, titulo: t('student.attendanceReminder'), descripcion: 'No olvides registrar tu asistencia por reconocimiento facial.', tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.hoursAgo')}`, tipo: 'info' },
    ];

    const asistenciasRecientes = [
        { id: 1, nombre: 'Ana Martínez', hora: '08:15 AM', estado: 'presente' },
        { id: 2, nombre: 'Luis Fernández', hora: '08:22 AM', estado: 'presente' },
        { id: 3, nombre: 'Carmen López', hora: '08:30 AM', estado: 'presente' },
        { id: 4, nombre: 'Roberto Díaz', hora: '08:45 AM', estado: 'tarde' },
    ];

    const misRegistrosRecientes = [
        { id: 1, materia: 'Matemáticas', hora: '08:15 AM', estado: 'presente', fecha: 'Hoy' },
        { id: 2, materia: 'Física', hora: '10:00 AM', estado: 'presente', fecha: 'Hoy' },
        { id: 3, materia: 'Historia', hora: '08:20 AM', estado: 'presente', fecha: 'Ayer' },
        { id: 4, materia: 'Programación', hora: '08:10 AM', estado: 'presente', fecha: 'Ayer' },
    ];

    const menuAcciones = isAdmin ? menuAccionesAdmin : menuAccionesEstudiante;
    const novedades = isAdmin ? novedadesAdmin : novedadesEstudiante;
    const attendance = isAdmin ? adminStats.porcentajeAsistencia : studentStats.miAsistencia;
    const attendanceLabel = isAdmin ? t('dashboard.attendance') : t('student.myAttendance');

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
        updateKey,
        isLoading,
        formattedDate,
        menuAcciones,
        novedades,
        attendance,
        attendanceLabel,
        adminStats,
        studentStats,
        asistenciasRecientes,
        misRegistrosRecientes,
        handleLogoutPress,
        loadUserData,
        toggleTheme,
        theme,
    };
}