import React, {useState, useEffect} from "react";
import {Text, View, SafeAreaView, TouchableOpacity} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLanguageRefresh} from '../../utils/useLanguageRefresh';
import {useTheme} from '../components/common/ThemeContext';
import BottomBar from "../components/common/NavigationBar";
import ScrollViewWrapper from "../components/common/ScrollView";
import CustomTabs from "../components/common/CustomTabs";
import styles from "./Style";
import {saveLanguageForRole} from '../components/common/languageByRole';
import LanguageSelector from '../components/common/LanguageSelector';

export default function Dashboard({onLogout, userRole: propUserRole}) {
    const navigation = useNavigation();
    const {t, i18n} = useTranslation();
    const {colors, loadThemeForRole, toggleTheme, theme} = useTheme();
    const refreshKey = useLanguageRefresh();
    const [userRole, setUserRole] = useState(propUserRole || null);
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [updateKey, setUpdateKey] = useState(0);
    const handleLanguageChange = (newLang) => setSelectedLanguage(newLang);

    const [adminStats, setAdminStats] = useState({
        totalEmpleados: 45,
        presentesHoy: 38,
        ausentesHoy: 5,
        tardanzasHoy: 2,
        porcentajeAsistencia: 84
    });
    const [studentStats, setStudentStats] = useState({
        miAsistencia: 94,
        totalClases: 32,
        clasesAsistidas: 30,
        faltas: 2,
        reconocimientosExitosos: 28,
        retardos: 3,
        fallasReconocimiento: 2,
        porcentajeRetardos: 9,
        porcentajeFallas: 7,
        tasaExitoReconocimiento: 93
    });

    useEffect(() => {
        const init = async () => {
            if (propUserRole) {
                setUserRole(propUserRole);
                await loadThemeForRole(propUserRole);
            } else {
                const role = await AsyncStorage.getItem('userRole');
                setUserRole(role);
                await loadThemeForRole(role);
            }
        };
        init();

        const handleLanguageChanged = (lng) => {
            setCurrentLanguage(lng);
            setUpdateKey(prev => prev + 1);
        };

        setCurrentLanguage(i18n.language);
        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    const menuAccionesAdmin = [
        {
            id: 1,
            title: t('dashboard.registerAttendance'),
            description: t('dashboard.registerAttendanceDesc'),
            color: "#4CAF50",
            screen: "RegistroAsistencia"
        },
        {
            id: 2,
            title: t('dashboard.employeeManagement'),
            description: t('dashboard.employeeManagementDesc'),
            color: "#2196F3",
            screen: "GestionEmpleados"
        },
        {
            id: 3,
            title: t('dashboard.reports'),
            description: t('dashboard.reportsDesc'),
            color: "#FF9800",
            screen: "Reportes"
        },
        {
            id: 4,
            title: t('dashboard.facialConfig'),
            description: t('dashboard.facialConfigDesc'),
            color: "#9C27B0",
            screen: "ConfiguracionFacial"
        },
    ];

    const menuAccionesEstudiante = [
        {id: 1, title: t('student.registerFace'), description: t('student.registerFaceDesc'), color: "#4CAF50"},
        {id: 2, title: t('student.myAttendance'), description: t('student.myAttendanceDesc'), color: "#2196F3"},
        {id: 3, title: t('student.UpdateFace'), description: t('student.UpdateFaceDesc'), color: "#2196F3"},
    ];

    const asistenciasRecientes = [
        {id: 1, nombre: "Ana Martínez", hora: "08:15 AM", estado: "presente"},
        {id: 2, nombre: "Luis Fernández", hora: "08:22 AM", estado: "presente"},
        {id: 3, nombre: "Carmen López", hora: "08:30 AM", estado: "presente"},
        {id: 4, nombre: "Roberto Díaz", hora: "08:45 AM", estado: "tarde"},
    ];

    const misRegistrosRecientes = [
        {id: 1, materia: "Matemáticas", hora: "08:15 AM", estado: "presente", fecha: "Hoy"},
        {id: 2, materia: "Física", hora: "10:00 AM", estado: "presente", fecha: "Hoy"},
        {id: 3, materia: "Historia", hora: "08:20 AM", estado: "presente", fecha: "Ayer"},
        {id: 4, materia: "Programación", hora: "08:10 AM", estado: "presente", fecha: "Ayer"},
    ];

    const novedadesAdmin = [
        {
            id: 1,
            titulo: t('dashboard.newEmployeeRegistered'),
            descripcion: `María González ${t('dashboard.newEmployeeMsg')}`,
            tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.minutesAgo')}`,
            tipo: "success"
        },
        {
            id: 2,
            titulo: t('dashboard.latenessDetected'),
            descripcion: `Carlos Ruiz ${t('dashboard.latenessMsg')} 15 ${t('dashboard.minutesLate')}`,
            tiempo: `${t('dashboard.ago')} 30 ${t('dashboard.minutesAgo')}`,
            tipo: "warning"
        },
        {
            id: 3,
            titulo: t('dashboard.facialRecognitionImproved'),
            descripcion: t('dashboard.facialRecognitionMsg'),
            tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`,
            tipo: "info"
        },
    ];

    const novedadesEstudiante = [
        {
            id: 1,
            titulo: t('student.faceRecognized'),
            descripcion: "Tu rostro fue reconocido exitosamente hoy a las 08:15 AM",
            tiempo: `${t('dashboard.ago')} 2 ${t('dashboard.hoursAgo')}`,
            tipo: "success"
        },
        {
            id: 2,
            titulo: t('student.attendanceReminder'),
            descripcion: "No olvides registrar tu asistencia por reconocimiento facial.",
            tiempo: `${t('dashboard.ago')} 5 ${t('dashboard.hoursAgo')}`,
            tipo: "info"
        },
    ];

    const isAdmin = userRole === 'Administrador';
    const currentLocale = i18n.language === 'en' ? 'en-US' : i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'fr' ? 'fr-FR' : 'es-ES';
    const formattedDate = new Date().toLocaleDateString(currentLocale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const menuAcciones = isAdmin ? menuAccionesAdmin : menuAccionesEstudiante;
    const novedades = isAdmin ? novedadesAdmin : novedadesEstudiante;
    const attendance = isAdmin ? adminStats.porcentajeAsistencia : studentStats.miAsistencia;
    const attendanceLabel = isAdmin ? t('dashboard.attendance') : t('student.myAttendance');

    const handleLogoutPress = async () => {
        if (onLogout) {
            await onLogout();
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}
                      key={`${refreshKey}-${updateKey}`}>
            <ScrollViewWrapper>
                <View style={styles.container} marginHorizontal={15}>
                    <CustomTabs userRole={userRole} onLogout={handleLogoutPress}/>

                    <View style={styles.header}>
                        <View style={styles.dataBar}>
                            <View style={styles.leftContent}>
                                <Text style={[styles.greeting, {color: colors.textSecondary}]}>
                                    {isAdmin ? t('dashboard.greeting') : t('student.greeting')}
                                </Text>
                                <Text style={[styles.adminName, {color: colors.text}]}>
                                    {isAdmin ? t('dashboard.admin') : t('student.studentName')}
                                </Text>
                                <Text style={[styles.date, {color: colors.textSecondary}]}>{formattedDate}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.attendanceIndicator, {backgroundColor: colors.card}]}>
                        <View style={styles.indicatorHeader}>
                            <Text style={[styles.sectionTitleAdmin, {color: colors.text}]}>
                                {attendanceLabel}
                            </Text>
                            <Text style={[styles.percentageText, {
                                color: theme === 'dark' ? colors.primary : colors.statusTextPresente
                            }]}>
                                {attendance}%
                            </Text>
                        </View>

                        <View style={[styles.progressBar, {backgroundColor: colors.progressBackground}]}>
                            <View style={[styles.progressFill, {
                                width: `${attendance}%`,
                                backgroundColor: theme === 'dark' ? colors.primary : colors.statusTextPresente
                            }]}/>
                        </View>

                        <View style={styles.indicatorDetails}>
                            <Text style={[styles.indicatorText, {color: colors.textSecondary}]}>
                                {isAdmin
                                    ? `${adminStats.presentesHoy} ${t('dashboard.employeesPresent')} ${adminStats.totalEmpleados} ${t('dashboard.employeesAttending')}`
                                    : `${studentStats.clasesAsistidas} / ${studentStats.totalClases} ${t('student.classesAttended')}`
                                }
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, {color: colors.text}]}>
                        {isAdmin ? t('dashboard.quickActions') : t('student.quickActions')}
                    </Text>
                    <View style={styles.quickActionsContainer}>
                        {menuAcciones.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.quickActionCard, {backgroundColor: colors.card}]}
                                onPress={() => {
                                    if (item.screen) {
                                        navigation.navigate(item.screen);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIcon, {backgroundColor: item.color}]}/>
                                <Text style={[styles.actionTitle, {color: colors.text}]}>{item.title}</Text>
                                <Text
                                    style={[styles.actionDescription, {color: colors.textSecondary}]}>{item.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.recentSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, {color: colors.text}]}>
                                {isAdmin ? t('dashboard.recentAttendance') : t('student.myRecentRecords')}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("DisplayingAttendance")}>
                                <Text style={[styles.seeAllText, {color: colors.primary}]}>
                                    {isAdmin ? "Ver todos" : t('student.seeAll')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {(isAdmin ? asistenciasRecientes : misRegistrosRecientes).map((item) => (
                            <View key={item.id} style={[styles.recentItem, {backgroundColor: colors.card}]}>
                                <View style={styles.recentInfo}>
                                    <Text
                                        style={[styles.recentName, {color: colors.text}]}>{isAdmin ? item.nombre : item.materia}</Text>
                                    <Text
                                        style={[styles.recentTime, {color: colors.textSecondary}]}>{isAdmin ? item.hora : `${item.fecha} - ${item.hora}`}</Text>
                                </View>
                                <View
                                    style={[styles.statusBadge, item.estado === 'presente' ? {backgroundColor: colors.statusPresente} : {backgroundColor: colors.statusTarde}]}>
                                    <Text
                                        style={[styles.statusText, item.estado === 'presente' ? {color: colors.statusTextPresente} : {color: colors.statusTextTarde}]}>
                                        {item.estado === 'presente' ? (isAdmin ? 'Presente' : t('student.present')) : (isAdmin ? 'Tarde' : t('student.late'))}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.novedadesSection}>
                        <Text style={[styles.sectionTitle, {color: colors.text}]}>
                            {isAdmin ? t('dashboard.recentNews') : t('student.notifications')}
                        </Text>
                        {novedades.map((item) => (
                            <View key={item.id} style={[styles.novedadCard, {backgroundColor: colors.card}]}>
                                <View style={[
                                    styles.novedadIcon,
                                    {backgroundColor: item.tipo === 'success' ? colors.novedadSuccess : item.tipo === 'warning' ? colors.novedadWarning : colors.novedadInfo}
                                ]}/>
                                <View style={styles.novedadContent}>
                                    <Text style={[styles.novedadTitle, {color: colors.text}]}>{item.titulo}</Text>
                                    <Text
                                        style={[styles.novedadDescripcion, {color: colors.textSecondary}]}>{item.descripcion}</Text>
                                    <Text style={[styles.novedadTiempo, {color: colors.textMuted}]}>{item.tiempo}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.bottomSpace}/>
                </View>
            </ScrollViewWrapper>
            <BottomBar/>
        </SafeAreaView>
    );
}